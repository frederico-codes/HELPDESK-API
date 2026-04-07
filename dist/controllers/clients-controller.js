"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsController = void 0;
const prisma_1 = require("../database/prisma");
const bcryptjs_1 = require("bcryptjs");
class ClientsController {
    async create(req, res) {
        const { name, email, password } = req.body;
        const userAlreadyExists = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (userAlreadyExists) {
            return res.status(400).json({ message: "Usuário já existe" });
        }
        const passwordHash = await (0, bcryptjs_1.hash)(password, 8);
        const client = await prisma_1.prisma.user.create({
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
    async index(req, res) {
        const clients = await prisma_1.prisma.user.findMany({
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
    async show(req, res) {
        const { id } = req.params;
        const client = await prisma_1.prisma.user.findFirst({
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
    async update(req, res) {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const clientExists = await prisma_1.prisma.user.findFirst({
            where: {
                id,
                role: "customer",
            },
        });
        if (!clientExists) {
            return res.status(404).json({ message: "Cliente não encontrado" });
        }
        const data = {};
        if (name)
            data.name = name;
        if (email)
            data.email = email;
        if (password)
            data.password = await (0, bcryptjs_1.hash)(password, 8);
        const client = await prisma_1.prisma.user.update({
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
    async delete(req, res) {
        const { id } = req.params;
        const client = await prisma_1.prisma.user.findFirst({
            where: {
                id,
                role: "customer",
            },
        });
        if (!client) {
            return res.status(404).json({ message: "Cliente não encontrado" });
        }
        await prisma_1.prisma.call.deleteMany({
            where: {
                customerId: id,
            },
        });
        await prisma_1.prisma.user.delete({
            where: { id },
        });
        return res.status(204).send();
    }
}
exports.ClientsController = ClientsController;
