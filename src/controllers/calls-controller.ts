import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { CallStatus } from "@prisma/client";

export async function createCall(req: Request, res: Response) {
  const { title, description, serviceId } = req.body;
  const customerId = req.user.id;

  if (!title || !description || !serviceId) {
    return res
      .status(400)
      .json({ message: "Dados obrigatórios não informados" });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.active) {
    return res
      .status(400)
      .json({ message: "Serviço inválido ou desativado" });
  }

  const technician = await prisma.user.findFirst({
    where: {
      role: "technical",
    },
  });

  if (!technician) {
    return res.status(400).json({ message: "Nenhum técnico disponível" });
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
        },
      },
      service: true,
    },
  });

  return res.status(201).json(call);
}

export async function updateCallStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus: CallStatus[] = ["open", "in_progress", "closed"];

  if (
    typeof status !== "string" ||
    !allowedStatus.includes(status as CallStatus)
  ) {
    return res.status(400).json({ message: "Status inválido" });
  }

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

  return res.json(call);
}

export async function listCalls(req: Request, res: Response) {
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

  return res.json(calls);
}

export async function listCallById(req: Request, res: Response) {
  const { id } = req.params;
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

  return res.json(call);
}

export async function addAdditionalService(req: Request, res: Response) {
  const { id } = req.params;
  const { serviceId } = req.body;

  if (!serviceId) {
    return res.status(400).json({ message: "Serviço não informado." });
  }

  const call = await prisma.call.findUnique({
    where: { id },
  });

  if (!call) {
    return res.status(404).json({ message: "Chamado não encontrado." });
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

export async function removeAdditionalService(req: Request, res: Response) {
  const { additionalServiceId } = req.params;

  const additionalService = await prisma.callAdditionalService.findUnique({
    where: { id: additionalServiceId },
  });

  if (!additionalService) {
    return res
      .status(404)
      .json({ message: "Serviço adicional não encontrado." });
  }

  await prisma.callAdditionalService.delete({
    where: { id: additionalServiceId },
  });

  return res.status(204).send();
}