import request from "supertest";
import { app } from "../app";
import { prisma } from "@/database/prisma";

async function createUserAndAuthenticate(role: string) {
  const email = `${role}-${Date.now()}@test.com`;

  await request(app).post("/users").send({
    name: role,
    email,
    password: "123456",
    role,
  });

  const sessionResponse = await request(app).post("/sessions").send({
    email,
    password: "123456",
  });

  return sessionResponse.body.token;
}

describe("ServicesController", () => {
  let serviceId: string;

  afterAll(async () => {
    await prisma.service.deleteMany({
      where: {
        name: {
          contains: "Service Test",
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

  it("should allow manager to create a service", async () => {
    const token = await createUserAndAuthenticate("manager");

    const response = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Service Test",
        value: 100,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Service Test");
    expect(response.body.basePrice).toBe(100);

    serviceId = response.body.id;
  });

  it("should not allow customer to create a service", async () => {
    const token = await createUserAndAuthenticate("customer");

    const response = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Service Test Customer",
        value: 100,
      });

    expect(response.status).toBe(403);
  });

  it("should allow authenticated user to list services", async () => {
    const token = await createUserAndAuthenticate("customer");

    const response = await request(app)
      .get("/services")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should not allow listing services without token", async () => {
    const response = await request(app).get("/services");

    expect(response.status).toBe(401);
  });

  it("should allow authenticated user to show a service", async () => {
    const token = await createUserAndAuthenticate("customer");

    const response = await request(app)
      .get(`/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(serviceId);
  });

  it("should allow manager to update a service", async () => {
    const token = await createUserAndAuthenticate("manager");

    const response = await request(app)
      .put(`/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Service Test Updated",
        value: 150,
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Service Test Updated");
    expect(response.body.basePrice).toBe(150);
  });

  it("should not allow technical to update a service", async () => {
    const token = await createUserAndAuthenticate("technical");

    const response = await request(app)
      .put(`/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Service Test Technical",
        value: 200,
      });

    expect(response.status).toBe(403);
  });

  it("should allow manager to deactivate a service", async () => {
    const token = await createUserAndAuthenticate("manager");

    const response = await request(app)
      .patch(`/services/${serviceId}/deactivate`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.active).toBe(false);
  });

  it("should allow manager to activate a service", async () => {
    const token = await createUserAndAuthenticate("manager");

    const response = await request(app)
      .patch(`/services/${serviceId}/activate`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.active).toBe(true);
  });
});