"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesController = void 0;
const prisma_1 = require("../database/prisma");
class ServicesController {
    // ✅ Criar serviço
    async create(req, res) {
        const { title, value } = req.body;
        if (!title || !value) {
            return res.status(400).json({
                message: "Título e valor são obrigatórios",
            });
        }
        const service = await prisma_1.prisma.service.create({
            data: {
                name: title,
                basePrice: Number(value),
                active: true,
            },
        });
        return res.status(201).json(service);
    }
    // ✅ Listar serviços ativos
    async index(req, res) {
        const { includeInactive } = req.query;
        const services = await prisma_1.prisma.service.findMany({
            where: includeInactive === "true" ? {} : { active: true },
            orderBy: {
                createdAt: "desc",
            },
        });
        return res.json(services);
    }
    // ✅ Buscar um serviço (para editar)
    async show(req, res) {
        const { id } = req.params;
        const service = await prisma_1.prisma.service.findUnique({
            where: { id },
        });
        if (!service) {
            return res.status(404).json({
                message: "Serviço não encontrado",
            });
        }
        return res.json(service);
    }
    // ✅ Atualizar serviço
    async update(req, res) {
        const { id } = req.params;
        const { title, value } = req.body;
        const service = await prisma_1.prisma.service.update({
            where: { id },
            data: {
                name: title,
                basePrice: Number(value),
            },
        });
        return res.json(service);
    }
    // ✅ Desativar serviço
    async deactivate(req, res) {
        const { id } = req.params;
        const service = await prisma_1.prisma.service.update({
            where: { id },
            data: {
                active: false,
            },
        });
        return res.json(service);
    }
    // ✅ Reativar serviço
    async activate(req, res) {
        const { id } = req.params;
        const service = await prisma_1.prisma.service.update({
            where: { id },
            data: {
                active: true,
            },
        });
        return res.json(service);
    }
}
exports.ServicesController = ServicesController;
