import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from '@flowlyx/database';
import { JwtService } from '@nestjs/jwt';

import { CloudinaryService } from '../src/modules/cloudinary/cloudinary.service';

describe('Users Module (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let jwtService: JwtService;

  const testUser = {
    name: 'Test Users Module',
    email: 'test-users-module@example.com',
    passwordHash: 'hashedpassword',
    role: 'ADMIN',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CloudinaryService)
      .useValue({
        uploadFile: jest.fn().mockResolvedValue({ url: 'http://mock-cloudinary/test-avatar.png' }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    // Create user directly via Prisma
    const user = await prisma.user.create({
      data: testUser,
    });

    userId = user.id;

    // Generate JWT token
    accessToken = jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET || 'test-secret' },
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('/users/me (GET) - success', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('email', testUser.email);
    expect(res.body).toHaveProperty('name', testUser.name);
  });

  it('/users/me (GET) - fail without token', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('/users/:id (GET) - success', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('email', testUser.email);
  });

  it('/users/:id (PATCH) - success', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
      })
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('name', 'Updated Name');
  });

  it('/users/:id (PATCH) - success with avatar upload', async () => {
    // We mock a file upload by using supertest .attach()
    jest.spyOn(app.get(CloudinaryService), 'uploadFile');

    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('name', 'Name With Avatar')
      .attach('avatar', Buffer.from('fake image content'), 'avatar.png')
      .expect(200);

    expect(res.body).toHaveProperty('name', 'Name With Avatar');
    expect(res.body).toHaveProperty('avatarUrl', 'http://mock-cloudinary/test-avatar.png');
  });
});
