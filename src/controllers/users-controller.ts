import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { hash } from "bcryptjs";

export class UsersController {
  async create(req: Request, res: Response) {
    const { name, email, password, role } = req.body;

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const passwordHash = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        availability:
          role === "technical"
            ? [
                "08:00",
                "09:00",
                "10:00",
                "11:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
              ]
            : undefined,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  }

  async index(req: Request, res: Response) {
    const { role } = req.query;

    const users = await prisma.user.findMany({
      where: role ? { role: String(role) as any } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(users);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const data: any = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.password = await hash(password, 8);

    const user = await prisma.user.update({
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

    return res.json(user);
  }

async delete(req: Request, res: Response) {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  if (user.role !== "customer") {
    return res.status(400).json({ message: "Apenas clientes podem ser excluídos" });
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

  async listTechnicals(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    where: {
      role: "technical",
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

  return res.json(users);
}
}