"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCall = createCall;
exports.updateCallStatus = updateCallStatus;
exports.listCalls = listCalls;
exports.listCallById = listCallById;
exports.addAdditionalService = addAdditionalService;
exports.removeAdditionalService = removeAdditionalService;
const prisma_1 = require("../database/prisma");
async function createCall(req, res) {
    const { title, description, serviceId, technicianId } = req.body;
    const customerId = req.user.id;
    if (!title || !description || !serviceId || !technicianId) {
        return res
            .status(400)
            .json({ message: "Dados obrigatórios não informados" });
    }
    const service = await prisma_1.prisma.service.findUnique({
        where: { id: serviceId },
    });
    if (!service || !service.active) {
        return res.status(400).json({ message: "Serviço inválido ou desativado" });
    }
    const technician = await prisma_1.prisma.user.findUnique({
        where: { id: technicianId },
    });
    if (!technician || technician.role !== "technical") {
        return res.status(400).json({ message: "Técnico inválido." });
    }
    const call = await prisma_1.prisma.call.create({
        data: {
            title,
            description,
            serviceId,
            technicianId: technician.id,
            customerId,
        },
        include: {
            technician: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            service: true,
        },
    });
    return res.status(201).json(call);
}
async function updateCallStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatus = ["open", "in_progress", "closed"];
    if (typeof status !== "string" ||
        !allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
    }
    const callExists = await prisma_1.prisma.call.findUnique({
        where: { id },
    });
    if (!callExists) {
        return res.status(404).json({ message: "Chamado não encontrado" });
    }
    const call = await prisma_1.prisma.call.update({
        where: { id },
        data: { status: status },
        include: {
            technician: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            service: {
                select: {
                    id: true,
                    name: true,
                    basePrice: true,
                },
            },
            additionalServices: {
                include: {
                    service: true,
                },
            },
        },
    });
    return res.json(call);
}
async function listCalls(req, res) {
    const userId = req.user.id;
    const userRole = req.user.role;
    let where = {};
    if (userRole === "customer") {
        where = { customerId: userId };
    }
    if (userRole === "technical") {
        where = { technicianId: userId };
    }
    const calls = await prisma_1.prisma.call.findMany({
        where,
        include: {
            technician: {
                select: {
                    id: true,
                    name: true,
                },
            },
            customer: {
                select: {
                    id: true,
                    name: true,
                },
            },
            service: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return res.json(calls);
}
async function listCallById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const call = await prisma_1.prisma.call.findUnique({
        where: { id },
        include: {
            technician: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            service: true,
            additionalServices: {
                include: {
                    service: true,
                },
            },
        },
    });
    if (!call) {
        return res.status(404).json({ message: "Chamado não encontrado" });
    }
    if (userRole === "customer" && call.customerId !== userId) {
        return res.status(403).json({ message: "Acesso não permitido" });
    }
    if (userRole === "technical" && call.technicianId !== userId) {
        return res.status(403).json({ message: "Acesso não permitido" });
    }
    return res.json(call);
}
async function addAdditionalService(req, res) {
    const { id } = req.params;
    const { serviceId } = req.body;
    if (!serviceId) {
        return res.status(400).json({ message: "Serviço não informado." });
    }
    const call = await prisma_1.prisma.call.findUnique({
        where: { id },
    });
    if (!call) {
        return res.status(404).json({ message: "Chamado não encontrado." });
    }
    const service = await prisma_1.prisma.service.findUnique({
        where: { id: serviceId },
    });
    if (!service || !service.active) {
        return res
            .status(400)
            .json({ message: "Serviço inválido ou desativado." });
    }
    const additionalService = await prisma_1.prisma.callAdditionalService.create({
        data: {
            callId: id,
            serviceId,
        },
        include: {
            service: true,
        },
    });
    return res.status(201).json(additionalService);
}
async function removeAdditionalService(req, res) {
    const { additionalServiceId } = req.params;
    const additionalService = await prisma_1.prisma.callAdditionalService.findUnique({
        where: { id: additionalServiceId },
    });
    if (!additionalService) {
        return res
            .status(404)
            .json({ message: "Serviço adicional não encontrado." });
    }
    await prisma_1.prisma.callAdditionalService.delete({
        where: { id: additionalServiceId },
    });
    return res.status(204).send();
}
