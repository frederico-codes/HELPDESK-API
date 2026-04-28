import request from "supertest"
import { prisma } from "../database/prisma"
import { app } from "../app"

describe("UsersController", () => {
  let user_id: string

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user_id } })
  })

  it("should create a new user sucessfully", async () => {
    const response = await request(app).post("/users").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.name).toBe("Test User")

    user_id = response.body.id
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












// import request from 'supertest';
// import { app } from '../app';
// import { prisma } from '@/database/prisma';

// describe("UsersController", () => {  

//   beforeEach(async () => {
//     await prisma.user.deleteMany({
//       where: {
//         email: "john.doe@example.com",
//       },
//     });
//   });

//   afterAll(async () => {
//     await prisma.user.deleteMany({
//       where: {
//         email: {
//           in: ["john.doe@example.com"],
//         },
//       },
//     });

//     await prisma.$disconnect();
//   });

//   it("should create a new user", async () => {
//     const response = await request(app)
//       .post("/users")
//       .send({
//         name: "John Doe",
//         email: "john.doe@example.com",
//         password: "password123",
//       });

//     expect(response.status).toBe(201);
//     expect(response.body).toHaveProperty("id");
//     expect(response.body.name).toBe("John Doe");
    
   
//   });
  

//   it("should throw an error if user with same email already exists", async () => {
//     const response = await request(app).post("/users").send({
//       name: "Duplicate User",
//       email: "testuser@example.com",
//       password: "password123",
//     });

//     expect(response.status).toBe(409);
//     expect(response.body.message).toBe("Email already exists");
//   });

//   it("should throw a validation error if email already is invalid", async () => {
//     const response = await request(app)
//       .post("/users")
//       .send({
//         name: "Invalid Email User",
//         email: "invalid-email",
//         password: "password123"
//       });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe("validation error");
//   });
// });
