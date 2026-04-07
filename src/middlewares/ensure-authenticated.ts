import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { verify } from "jsonwebtoken";
import { authConfig } from "../configs/auth";

interface TokenPayLload {
  role: string;
  sub: string;
}

function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT token não informado", 401);
  }

  const [, token] = authHeader.split(" ");

  const { sub: user_id, role } = verify(
    token,
    authConfig.jwt.secret
  ) as TokenPayLload;

  request.user = {
    id: String(user_id),
    role,
  };

  return next();
}

export { ensureAuthenticated };
