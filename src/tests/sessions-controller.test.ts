import request from 'supertest';
import { app } from '../app';
import { prisma } from '@/database/prisma';

describe('SessionsController', () => {
  let user_id: string;

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: 'john.doe@example.com'
      }
    });

    await prisma.$disconnect();
  });

  it('should authenticate a user and return a token', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });

    user_id = userResponse.body.id;

    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });
});
