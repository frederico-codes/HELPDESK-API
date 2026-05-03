import request from "supertest";
import { app } from "../app";
import { prisma } from "@/database/prisma";

async function createUserAndAuthenticate(role: string) {
  const email = `${role}-${Date.now()}@test.com`;

  const userResponse = await request(app).post("/users").send({
    name: role,
    email,
    password: "123456",
    role,
  });

  const sessionResponse = await request(app).post("/sessions").send({
    email,
    password: "123456",
  });

  return {
    user: userResponse.body,
    token: sessionResponse.body.token,
  };
}

describe("CallsController", () => {
  let serviceId: string;
  let technicianId: string;

  afterAll(async () => {
    await prisma.callAdditionalService.deleteMany({
      where: {
        call: {
          title: {
            contains: "Call Test",
          },
        },
      },
    });
    
    await prisma.call.deleteMany({
      where: {
        title: {
          contains: "Call Test",
        },
      },
    });

    await prisma.service.deleteMany({
      where: {
        name: {
           in: ["Service Test", "Extra"],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "@test.com",
        },
      },
    });

    await prisma.$disconnect();
  });

  it("should create a call", async () => {
    const { token: customerToken } =
      await createUserAndAuthenticate("customer");

    const { token: managerToken } =
      await createUserAndAuthenticate("manager");

    const { user: technician } = 
      await createUserAndAuthenticate("technical");

    technicianId = technician.id;
    

    const service = await prisma.service.create({
      data: {
        name: "Service Test",
        basePrice: 100,
        active: true,
      },
    });

    serviceId = service.id;

    const response = await request(app)
      .post("/calls")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        title: "Call Test",
        description: "Test description",
        serviceId,
        technicianId,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });


it("should get call by id", async () => {
  const { token: customerToken, user: customer } =
    await createUserAndAuthenticate("customer");

  const call = await prisma.call.create({
    data: {
      title: "Call Test",
      description: "Desc",
      serviceId,
      technicianId,
      customerId: customer.id,
    },
  });

  const response = await request(app)
    .get(`/calls/${call.id}`)
    .set("Authorization", `Bearer ${customerToken}`);

  expect(response.status).toBe(200);
  expect(response.body.id).toBe(call.id);
});


  it("should update call status", async () => {
    const { token } = await createUserAndAuthenticate("technical");

    const call = await prisma.call.create({
      data: {
        title: "Call Test",
        description: "Desc",
        serviceId,
        technicianId,
        customerId: (
          await prisma.user.findFirst({
            where: { role: "customer" },
          })
        )!.id,
      },
    });

    const response = await request(app)
      .patch(`/calls/${call.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "in_progress",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("in_progress");
  });

  it("should add additional service", async () => {
    const { token } = await createUserAndAuthenticate("technical");

    const technical = await prisma.user.findFirst({
      where: { role: "technical" },
    });

    if (!technical) {
      throw new Error("Nenhum técnico encontrado");
    }

    const customer = await prisma.user.create({
      data: {
        name: "Customer Test",
        email: `customer-${Date.now()}@test.com`,
        password: "123456",
        role: "customer",
      },
    });

    const call = await prisma.call.create({
      data: {
        title: "Call Test",
        description: "Desc",
        serviceId,
        technicianId: technical.id,
        customerId: customer.id,
      },
    });

    const extraService = await prisma.service.create({
      data: {
        name: "Extra",
        basePrice: 50,
        active: true,
      },
    });

    const response = await request(app)
      .post(`/calls/${call.id}/additional-services`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        serviceId: extraService.id,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should remove additional service", async () => {
    const { token } = await createUserAndAuthenticate("technical");

    const customer = await prisma.user.findFirst({
      where: { role: "customer" },
    });

    if (!customer) {
      throw new Error("Nenhum customer encontrado");
    }

    const call = await prisma.call.create({
      data: {
        title: "Call Test",
        description: "Desc",
        serviceId,
        technicianId,
        customerId: customer.id,
      },
    });

    const service = await prisma.service.create({
      data: {
        name: "Extra",
        basePrice: 50,
        active: true,
      },
    });

    const additionalService = await prisma.callAdditionalService.create({
      data: {
        callId: call.id,
        serviceId: service.id,
      },
    });

    const response = await request(app)
      .delete(
        `/calls/${call.id}/additional-services/${additionalService.id}`
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});