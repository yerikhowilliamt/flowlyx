import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from '@flowlyx/database';
import { JwtService } from '@nestjs/jwt';

describe('Tasks Module (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let orgId: string;
  let workspaceId: string;
  let projectId: string;
  let boardId: string;
  let listId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Setup Test Data
    const user = await prisma.user.create({
      data: {
        name: 'Task Test User',
        email: 'task-test@example.com',
        passwordHash: 'hashed',
        role: 'USER',
      },
    });

    const org = await prisma.organization.create({
      data: { name: 'Task Test Org', slug: 'task-test-org' },
    });
    orgId = org.id;

    await prisma.organizationMember.create({
      data: { userId: user.id, organizationId: org.id, role: 'ADMIN' },
    });

    const workspace = await prisma.workspace.create({
      data: { name: 'Task Test Workspace', slug: 'task-test-workspace', organizationId: orgId },
    });
    workspaceId = workspace.id;

    await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId, role: 'ADMIN' },
    });

    const project = await prisma.project.create({
      data: { name: 'Task Test Project', slug: 'task-test-project', workspaceId },
    });
    projectId = project.id;

    await prisma.projectMember.create({
      data: { userId: user.id, projectId, role: 'ADMIN' },
    });

    const board = await prisma.board.create({
      data: { name: 'Task Test Board', projectId },
    });
    boardId = board.id;

    const list = await prisma.list.create({
      data: { name: 'Task Test List', boardId },
    });
    listId = list.id;

    // Generate JWT token
    userToken = jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET || 'test-secret' },
    );
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { listId } });
    await prisma.list.deleteMany({ where: { id: listId } });
    await prisma.board.deleteMany({ where: { id: boardId } });
    await prisma.project.deleteMany({ where: { slug: 'task-test-project' } });
    await prisma.workspace.deleteMany({ where: { slug: 'task-test-workspace' } });
    await prisma.organization.deleteMany({ where: { slug: 'task-test-org' } });
    await prisma.user.deleteMany({ where: { email: 'task-test@example.com' } });
    await app.close();
  });

  it('/tasks (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        listId,
        title: 'E2E Task 1',
        description: 'Testing task creation via E2E',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('E2E Task 1');
    expect(res.body.listId).toBe(listId);
    taskId = res.body.id;
  });

  it('/tasks (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tasks?listId=${listId}&page=1&limit=10`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('title', 'E2E Task 1');
  });

  it('/tasks/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', taskId);
    expect(res.body).toHaveProperty('title', 'E2E Task 1');
  });

  it('/tasks/:id (PATCH)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'E2E Task 1 Updated',
      })
      .expect(200);

    expect(res.body).toHaveProperty('id', taskId);
    expect(res.body).toHaveProperty('title', 'E2E Task 1 Updated');
  });

  it('/tasks/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);

    // Verify it's deleted
    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
});
