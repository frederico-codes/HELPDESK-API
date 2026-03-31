import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { Prisma, CallStatus } from "@prisma/client";

export async function createCall(req: Request, res: Response) {
  const { title, description, serviceId, technicianId } = req.body;
  const customerId = req.user.id;

  if (!title || !description || !serviceId || !technicianId) {
    return res.status(400).json({ message: "Dados obrigatórios não informados" });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.active) {
    return res.status(400).json({ message: "Serviço inválido ou desativado" });
  }

  const technician = await prisma.user.findUnique({
    where: { id: technicianId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!technician || technician.role !== "technical") {
    return res.status(400).json({ message: "Técnico inválido" });
  }

  const call = await prisma.call.create({
    data: {
      title,
      description,
      serviceId,
      technicianId,
      customerId,
    },
  });

  return res.status(201).json(call);
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
    include: {
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      service: true,
    }
  });

  return res.json(calls);
}

export async function updateCallStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus: CallStatus[] = ["open", "in_progress", "closed"];

  if (typeof status !== "string" || !allowedStatus.includes(status as CallStatus)) {
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
  });

  return res.json(call);
}

