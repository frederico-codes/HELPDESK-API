import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { CallStatus } from "@prisma/client";
import { z } from "zod";

const createCallSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  serviceId: z.string().uuid("Serviço inválido"),
  technicianId: z.string().uuid("Técnico inválido"),
});

const updateCallStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "closed"], {
    message: "Status inválido",
  }),
});

const callIdParamsSchema = z.object({
  id: z.string().uuid("Id do chamado inválido"),
});

const addAdditionalServiceSchema = z.object({
  serviceId: z.string().uuid("Serviço inválido"),
});

const removeAdditionalServiceParamsSchema = z.object({
  additionalServiceId: z.string().uuid("Id do serviço adicional inválido"),
});



export class CallsController {
  async  createCall(req: Request, res: Response) {
    const { title, description, serviceId, technicianId } =
      createCallSchema.parse(req.body);

    const customerId = req.user.id;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.active) {
      return res.status(400).json({ message: "Serviço inválido ou desativado" });
    }

    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
    });

    if (!technician || technician.role !== "technical") {
      return res.status(400).json({ message: "Técnico inválido." });
    }

    const call = await prisma.call.create({
      data: {
        title,
        description,
        serviceId,
        technicianId: technician.id,
        customerId,
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: true,
      },
    });
    
    return res.status(201).json(call);
  }
  
  async  listCalls(req: Request, res: Response) {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let where = {};
    
    if (userRole === "customer") {
      where = { customerId: userId };
    }
    
    if (userRole === "technical") {
      where = { technicianId: userId };
    }
    
    const calls = await prisma.call.findMany({
      where,
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return res.status(200).json(calls);
  }
  
  async  listCallById(req: Request, res: Response) {
    const { id } = callIdParamsSchema.parse(req.params);
    const userId = req.user.id;
    const userRole = req.user.role;

    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: true,
        additionalServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!call) {
      return res.status(404).json({ message: "Chamado não encontrado" });
    }

    if (userRole === "customer" && call.customerId !== userId) {
      return res.status(403).json({ message: "Acesso não permitido" });
    }

    if (userRole === "technical" && call.technicianId !== userId) {
      return res.status(403).json({ message: "Acesso não permitido" });
    }

    return res.status(200).json(call);
  }

  async  updateCallStatus(req: Request, res: Response) {
    const { id } = callIdParamsSchema.parse(req.params);
    const { status } = updateCallStatusSchema.parse(req.body);

    const callExists = await prisma.call.findUnique({
      where: { id },
    });

    if (!callExists) {
      return res.status(404).json({ message: "Chamado não encontrado" });
    }
    
    const call = await prisma.call.update({
      where: { id },
      data: { status: status as CallStatus },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
        additionalServices: {
          include: {
            service: true,
          },
        },
      },
    });

    return res.status(200).json(call);
  }
  

  async  addAdditionalService(req: Request, res: Response) {
    const { id } = callIdParamsSchema.parse(req.params);
    const { serviceId } = addAdditionalServiceSchema.parse(req.body);

    const call = await prisma.call.findUnique({
      where: { id },
    });

    if (!call) {
      return res.status(404).json({ message: "Chamado não encontrado." });
    }

    if (call.status === "closed") {
      return res.status(400).json({
        message: "Não é possível adicionar serviços a um chamado encerrado.",
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.active) {
      return res
        .status(400)
        .json({ message: "Serviço inválido ou desativado." });
    }

    const additionalService = await prisma.callAdditionalService.create({
      data: {
        callId: id,
        serviceId,
      },
      include: {
        service: true,
      },
    });

    return res.status(201).json(additionalService);
  }

  async  removeAdditionalService(req: Request, res: Response) {
    const { additionalServiceId } = removeAdditionalServiceParamsSchema.parse(
      req.params
    );

    const additionalService = await prisma.callAdditionalService.findUnique({
      where: { id: additionalServiceId },
    });

    if (!additionalService) {
      return res
        .status(404)
        .json({ message: "Serviço adicional não encontrado." });
    }

    const call = await prisma.call.findUnique({
      where: { id: additionalService.callId },
    });

    if (call?.status === "closed") {
      return res.status(400).json({
        message: "Não é possível remover serviços de um chamado encerrado.",
      });
    }

    await prisma.callAdditionalService.delete({
      where: { id: additionalServiceId },
    });

    return res.status(204).send();
  }
}