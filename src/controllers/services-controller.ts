import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export class ServicesController {

  async create(req: Request, res: Response) {
    const { name, basePrice } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        basePrice,
      },
    });

    return res.status(201).json(service);
  }

  async index(req: Request, res: Response) {
    const services = await prisma.service.findMany({
      where: {
        active: true,
      },
    });

    return res.json(services);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, basePrice } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        basePrice,
      },
    });

    return res.json(service);
  }

  async deactivate(req: Request, res: Response) {
    const { id } = req.params;

    const service = await prisma.service.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.json(service);
  }
}