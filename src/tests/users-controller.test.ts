import request from "supertest"
import { prisma } from "../database/prisma"
import { app } from "../app"

describe("UsersController", () => {
  

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "testuser@example.com",
        },
    }
  });
  

    await prisma.$disconnect();
  });

  it("should create a new user sucessfully", async () => {
    const response = await request(app).post("/users").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.name).toBe("Test User")

    
  })

  it("should throw an error if user with same email already exists", async () => {
    const response = await request(app).post("/users").send({
      name: "Duplicate User",
      email: "testuser@example.com",
      password: "password123",
    })

    expect(response.status).toBe(409)
    expect(response.body.message).toBe("Email already exists")
  })

  it("should throw a validation error if email already is invalid", async () => {
    const response = await request(app).post("/users").send({
      name: "Test User",
      email: "invalid-email",
      password: "password123",
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("validation error")
  })
})












