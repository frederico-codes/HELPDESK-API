import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { AppError } from "@/utils/app-error";

type UserRole = "customer" | "technical" | "manager";

const userRoleSchema = z.enum(["customer", "technical", "manager"]);

const userIdParamsSchema = z.object({
  id: z.string().uuid("Id do usuário inválido"),
});

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().trim().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: userRoleSchema.optional(),
  availability: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").optional(),
  email: z.string().trim().email("E-mail inválido").optional(),
  password: z.string().trim().min(6, "A senha deve ter no mínimo 6 caracteres").optional(),
  role: userRoleSchema.optional(),
  availability: z.array(z.string()).optional(),
});

const updatePasswordSchema = z.object({
  password: z.string().trim().min(1, "Informe a senha atual"),
  newPassword: z
    .string()
    .trim()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres"),
});

export class UsersController {
  async create(req: Request, res: Response) {
    const { name, email, password, role, availability } =
      createUserSchema.parse(req.body);

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      return res.status(409).json({ message: "Email already exists" });
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
            ? availability && availability.length > 0
              ? availability
              : [
                  "08:00",
                  "09:00",
                  "10:00",
                  "11:00",
                  "14:00",
                  "15:00",
                  "16:00",
                  "17:00",
                  "18:00",
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
      where: role ? { role: String(role) as UserRole } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        availability: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(users);
  }

  async update(req: Request, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params);
    const { name, email, password, role, availability } =
    updateUserSchema.parse(req.body);

    if (req.user.id !== id && req.user.role !== "manager") {
      throw new AppError("User not authorized", 403);
    }

    if (role && req.user.role !== "manager") {
      throw new AppError("Only managers can change user role", 403);
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      availability?: string[];
    } = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.password = await hash(password, 8);
    if (availability) data.availability = availability;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        availability: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(user);
  }

  async delete(req: Request, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params);

    if (req.user.id !== id && req.user.role !== "manager") {
      throw new AppError("User not authorized", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.role !== "customer") {
      return res
        .status(400)
        .json({ message: "Apenas clientes podem ser excluídos" });
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
        availability: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(users);
  }

  async show(req: Request, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params);

    if (req.user.id !== id && req.user.role !== "manager") {
      throw new AppError("User not authorized", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        availability: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json(user);
  }

  async updateAvatar(req: Request, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params);
    const avatarFilename = req.file?.filename;

    if (req.user.id !== id && req.user.role !== "manager") {
      throw new AppError("User not authorized", 403);
    }

    if (!avatarFilename) {
      return res.status(400).json({ message: "Imagem não enviada" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        avatar: avatarFilename,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return res.json(user);
  }

  async updatePassword(req: Request, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params);
    const { password, newPassword } = updatePasswordSchema.parse(req.body);

    if (req.user.id !== id && req.user.role !== "manager") {
      throw new AppError("User not authorized", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({ message: "Senha atual inválida." });
    }

    const passwordHash = await hash(newPassword, 8);

    await prisma.user.update({
      where: { id },
      data: {
        password: passwordHash,
      },
    });

    return res.json({ message: "Senha alterada com sucesso." });
  }
}