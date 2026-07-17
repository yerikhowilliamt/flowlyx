import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from '@flowlyx/database';
import { JwtService } from '@nestjs/jwt';

describe('Workspaces Module (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let orgId: string;
  let workspaceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Create a user and organization for testing
    const user = await prisma.user.create({
      data: {
        name: 'Workspace Test User',
        email: 'workspace-test@example.com',
        passwordHash: 'hashed',
        role: 'USER',
      },
    });

    const org = await prisma.organization.create({
      data: {
        name: 'Workspace Test Org',
        slug: 'workspace-test-org',
      },
    });
    orgId = org.id;

    await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: org.id,
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
    await prisma.workspace.deleteMany({ where: { slug: { contains: 'workspace-e2e' } } });
    await prisma.user.deleteMany({ where: { email: 'workspace-test@example.com' } });
    await prisma.organization.deleteMany({ where: { slug: 'workspace-test-org' } });
    await app.close();
  });

  it('/workspaces (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspaces`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Workspace E2E',
        slug: 'workspace-e2e',
        organizationId: orgId,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Workspace E2E');
    workspaceId = res.body.id;

    // Create a workspace member so the next endpoints (PATCH, DELETE) pass the WorkspaceRolesGuard
    // Note: In a real app, the service or an event might do this automatically
    const decoded = jwtService.decode(userToken) as any;
    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: decoded.sub,
        role: 'ADMIN',
      },
    });
  });

  it('/workspaces (POST) - conflict slug', async () => {
    await request(app.getHttpServer())
      .post(`/workspaces`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Workspace E2E 2',
        slug: 'workspace-e2e', // Same slug
        organizationId: orgId,
      })
      .expect(409);
  });

  it('/workspaces (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspaces?organizationId=${orgId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('/workspaces/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.id).toBe(workspaceId);
    expect(res.body.name).toBe('Workspace E2E');
  });

  it('/workspaces/:id (PATCH)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Workspace E2E Updated',
      })
      .expect(200);

    expect(res.body.name).toBe('Workspace E2E Updated');
  });

  it('/workspaces/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204); // HttpCode(HttpStatus.NO_CONTENT) returns 204, not 200

    // Verify it is deleted
    await request(app.getHttpServer())
      .get(`/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
});
