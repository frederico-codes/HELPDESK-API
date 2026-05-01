import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { z } from "zod";

const serviceIdParamsSchema = z.object({
  id: z.string().uuid("Id do serviço inválido"),
});

const createServiceSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  value: z
    .number({ invalid_type_error: "Valor inválido" })
    .positive("O valor deve ser maior que zero"),
});

const updateServiceSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  value: z
    .number({ invalid_type_error: "Valor inválido" })
    .positive("O valor deve ser maior que zero"),
});

const querySchema = z.object({
  includeInactive: z.string().optional(),
});

export class ServicesController {
 
  async create(req: Request, res: Response) {
    const parsed = createServiceSchema.safeParse({
      title: req.body.title,
      value: Number(req.body.value),
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Dados inválidos",
      });
    }

    const { title, value } = parsed.data;

    const service = await prisma.service.create({
      data: {
        name: title,
        basePrice: value,
        active: true,
      },
    });

    return res.status(201).json(service);
  }

  
  async index(req: Request, res: Response) {
    const { includeInactive } = querySchema.parse(req.query);

    const services = await prisma.service.findMany({
      where: includeInactive === "true" ? {} : { active: true },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(services);
  }

 
  async show(req: Request, res: Response) {
    const { id } = serviceIdParamsSchema.parse(req.params);

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({
        message: "Serviço não encontrado",
      });
    }

    return res.status(200).json(service);
  }

  
  async update(req: Request, res: Response) {
    const { id } = serviceIdParamsSchema.parse(req.params);

    const parsed = updateServiceSchema.safeParse({
      title: req.body.title,
      value: Number(req.body.value),
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Dados inválidos",
      });
    }

    const { title, value } = parsed.data;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: title,
        basePrice: value,
      },
    });

    return res.status(200).json(service);
  }

 
  async deactivate(req: Request, res: Response) {
    const { id } = serviceIdParamsSchema.parse(req.params);

    const service = await prisma.service.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.status(200).json(service);
  }


  async activate(req: Request, res: Response) {
    const { id } = serviceIdParamsSchema.parse(req.params);

    const service = await prisma.service.update({
      where: { id },
      data: {
        active: true,
      },
    });

    return res.status(200).json(service);
  }
}