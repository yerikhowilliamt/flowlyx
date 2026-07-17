import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from '@flowlyx/database';
import { JwtService } from '@nestjs/jwt';

describe('Projects Module (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let workspaceId: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Create a user, organization, and workspace for testing
    const user = await prisma.user.create({
      data: {
        name: 'Project Test User',
        email: 'project-test@example.com',
        passwordHash: 'hashed',
        role: 'USER',
      },
    });

    const org = await prisma.organization.create({
      data: {
        name: 'Project Test Org',
        slug: 'project-test-org',
      },
    });

    await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'ADMIN',
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: 'Project Test Workspace',
        slug: 'project-test-workspace',
        organizationId: org.id,
      },
    });
    workspaceId = workspace.id;

    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    // Generate JWT token
    userToken = jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET || 'test-secret' },
    );
  });

  afterAll(async () => {
    await prisma.project.deleteMany({ where: { slug: { contains: 'project-e2e' } } });
    await prisma.workspace.deleteMany({ where: { slug: 'project-test-workspace' } });
    await prisma.user.deleteMany({ where: { email: 'project-test@example.com' } });
    await prisma.organization.deleteMany({ where: { slug: 'project-test-org' } });
    await app.close();
  });

  it('/projects (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/projects`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Project E2E',
        slug: 'project-e2e',
        workspaceId: workspaceId,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Project E2E');
    projectId = res.body.id;
  });

  it('/projects (POST) - conflict slug', async () => {
    await request(app.getHttpServer())
      .post(`/projects`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Project E2E 2',
        slug: 'project-e2e', // Same slug
        workspaceId: workspaceId,
      })
      .expect(409);
  });

  it('/projects (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects?workspaceId=${workspaceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('/projects/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.id).toBe(projectId);
    expect(res.body.name).toBe('Project E2E');
  });

  it('/projects/:id (PATCH)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Project E2E Updated',
        workspaceId, // Passed for the guard
      })
      .expect(200);

    expect(res.body.name).toBe('Project E2E Updated');
  });

  it('/projects/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/projects/${projectId}?workspaceId=${workspaceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);

    // Verify it is deleted
    await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
});
