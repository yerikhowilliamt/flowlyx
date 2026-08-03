import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from '@flowlyx/database';
import { JwtService } from '@nestjs/jwt';

describe('Task Assignments Module (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let userId: string;
  let taskId: string;
  let assignmentId: string;
  let listId: string;
  let boardId: string;
  let projectId: string;
  let workspaceId: string;
  let orgId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Create user
    const user = await prisma.user.create({
      data: {
        name: 'Assignment Test User',
        email: 'assignment-test@example.com',
        passwordHash: 'hashed',
        role: 'USER',
      },
    });
    userId = user.id;

    const org = await prisma.organization.create({
      data: { name: 'Assign Test Org', slug: 'assign-test-org' },
    });
    orgId = org.id;

    await prisma.organizationMember.create({
      data: { userId, organizationId: orgId, role: 'ADMIN' },
    });

    const workspace = await prisma.workspace.create({
      data: { name: 'Assign Test WS', slug: 'assign-test-ws', organizationId: orgId },
    });
    workspaceId = workspace.id;

    await prisma.workspaceMember.create({
      data: { userId, workspaceId, role: 'ADMIN' },
    });

    const project = await prisma.project.create({
      data: { name: 'Assign Test Project', slug: 'assign-test-project', workspaceId },
    });
    projectId = project.id;

    await prisma.projectMember.create({
      data: { userId, projectId, role: 'ADMIN' },
    });

    const board = await prisma.board.create({
      data: { name: 'Assign Board', projectId },
    });
    boardId = board.id;

    const list = await prisma.list.create({
      data: { name: 'Assign List', boardId },
    });
    listId = list.id;

    const task = await prisma.task.create({
      data: { listId, title: 'Assign Task' },
    });
    taskId = task.id;

    // Generate token
    userToken = jwtService.sign(
      { sub: userId, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET || 'test-secret' },
    );
  });

  afterAll(async () => {
    await prisma.taskAssignment.deleteMany({ where: { taskId } });
    await prisma.task.deleteMany({ where: { listId } });
    await prisma.list.deleteMany({ where: { id: listId } });
    await prisma.board.deleteMany({ where: { id: boardId } });
    await prisma.project.deleteMany({ where: { slug: 'assign-test-project' } });
    await prisma.workspace.deleteMany({ where: { slug: 'assign-test-ws' } });
    await prisma.organization.deleteMany({ where: { slug: 'assign-test-org' } });
    await prisma.user.deleteMany({ where: { email: 'assignment-test@example.com' } });
    await app.close();
  });

  it('/task-assignments (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/task-assignments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        taskId,
        userId,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.taskId).toBe(taskId);
    expect(res.body.userId).toBe(userId);
    assignmentId = res.body.id;
  });

  it('/task-assignments (POST) - conflict', async () => {
    await request(app.getHttpServer())
      .post('/task-assignments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        taskId,
        userId,
      })
      .expect(409); // Conflict
  });

  it('/task-assignments (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/task-assignments?taskId=${taskId}&page=1&limit=10`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]).toHaveProperty('taskId', taskId);
  });

  it('/task-assignments/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/task-assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);

    // Verify deletion
    const res = await request(app.getHttpServer())
      .get(`/task-assignments?taskId=${taskId}&page=1&limit=10`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data.length).toBe(0);
  });
});
