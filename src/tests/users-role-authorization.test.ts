import request from "supertest";
import { app } from "../app";
import { prisma } from "@/database/prisma";


async function createUserAndAuthenticate(role: string) {
  const email = `${role}@test.com`;

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

describe("User role authorization", () => {

  it("should allow manager to access protected route", async () => {
    const token = await createUserAndAuthenticate("manager");

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should NOT allow customer to access admin route", async () => {
    const token = await createUserAndAuthenticate("customer");

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("should not allow access without token", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(401);
  });

});