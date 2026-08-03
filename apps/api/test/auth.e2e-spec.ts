import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from '@flowlyx/database';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;

  const testUser = {
    name: 'Test Auth User',
    email: 'test-auth@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await app.close();
  });

  it('/auth/register (POST) - success', async () => {
    // Clean up before test just in case
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', testUser.email);
    expect(res.body).toHaveProperty('name', testUser.name);
    // Should not return passwordHash
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('/auth/login (POST) - success', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(res.body).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - fail with unregistered email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'notfound@example.com',
        password: 'password',
      })
      .expect(404);
  });

  it('/auth/login (POST) - fail with invalid password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      })
      .expect(401);
  });
});
