import { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { sign } from "jsonwebtoken";
import { authConfig } from "../configs/auth";
import { compare } from "bcrypt";
import { z } from "zod";
import { prisma } from "../database/prisma";

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email({ message: "E-mail inválido" }),
      password: z.string(),
    });

    const { email, password } = bodySchema.parse(request.body);

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("E-mail ou senha inválido", 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("E-mail ou senha inválido", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign(
      { role: user.role },
      secret,
      {
        subject: user.id,
        expiresIn,
      }
    );

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      availability: user.availability,
      avatar: user.avatar,
    };

    response.json({ token, userWithoutPassword });
  }
}

export { SessionsController };