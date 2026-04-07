"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsController = void 0;
const app_error_1 = require("../utils/app-error");
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("../configs/auth");
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const prisma_1 = require("../database/prisma");
class SessionsController {
    async create(request, response) {
        const bodySchema = zod_1.z.object({
            email: zod_1.z.string().email({ message: "E-mail inválido" }),
            password: zod_1.z.string(),
        });
        const { email, password } = bodySchema.parse(request.body);
        const user = await prisma_1.prisma.user.findFirst({ where: { email } });
        if (!user) {
            throw new app_error_1.AppError("E-mail ou senha inválido", 401);
        }
        const passwordMatched = await (0, bcrypt_1.compare)(password, user.password);
        if (!passwordMatched) {
            throw new app_error_1.AppError("E-mail ou senha inválido", 401);
        }
        const { secret, expiresIn } = auth_1.authConfig.jwt;
        const token = (0, jsonwebtoken_1.sign)({ role: user.role }, secret, {
            subject: user.id,
            expiresIn,
        });
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
exports.SessionsController = SessionsController;
