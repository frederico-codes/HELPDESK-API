import { UserRole } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";
import { hash } from "bcrypt";


class UsersController {
  async create(request: Request, response: Response) {
    const bodyschema = z.object({
      name: z.string().trim().min(2, { message: "Nome é obrigatório" }),
      email: z
        .string()
        .trim()
        .email({ message: "E-mail inválido" })
        .toLowerCase(),
      password: z
        .string()
        .min(6, { message: " A senha deve ter pelo menos 6 digitos" }),
        role:z
        .enum([UserRole.customer, UserRole.manager, UserRole.technical])
        .default(UserRole.customer)
    });

    const { name, email, password, role } = bodyschema.parse(request.body);

    const userWithSameEmail = await prisma.user.findFirst({ where: { email }})

    if(userWithSameEmail){
      throw new AppError("Já existe um usuário cadastrado com esse e-mai")
    }

    const hashedPassword = await hash(password, 8)

    await prisma.user.create({
      data:{
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    response.status(201).json()
  }
}

export { UsersController }
