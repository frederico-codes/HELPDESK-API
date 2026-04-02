import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { hash } from "bcryptjs";

export class ClientsController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const passwordHash = await hash(password, 8);

    const client = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: "customer",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(client);
  }

  async index(req: Request, res: Response) {
    const clients = await prisma.user.findMany({
      where: {
        role: "customer",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(clients);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const client = await prisma.user.findFirst({
      where: {
        id,
        role: "customer",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    return res.json(client);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const clientExists = await prisma.user.findFirst({
      where: {
        id,
        role: "customer",
      },
    });

    if (!clientExists) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await hash(password, 8);

    const client = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(client);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const client = await prisma.user.findFirst({
      where: {
        id,
        role: "customer",
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    await prisma.call.deleteMany({
      where: {
        customerId: id,
      },
    });

    await prisma.user.delete({
      where: { id },
    });

    return res.status(204).send();
  }
}