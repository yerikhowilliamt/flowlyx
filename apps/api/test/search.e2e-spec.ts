import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from '@flowlyx/database';
import { JwtService } from '@nestjs/jwt';

describe('Search Module (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;

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
        name: 'Search Test User',
        email: 'search-test@example.com',
        passwordHash: 'hashed',
        role: 'USER',
      },
    });

    const org = await prisma.organization.create({
      data: { name: 'Super Searchable Org', slug: 'searchable-org' },
    });
    const ws = await prisma.workspace.create({
      data: { name: 'Super Searchable Workspace', slug: 'searchable-ws', organizationId: org.id },
    });
    const proj = await prisma.project.create({
      data: { name: 'Super Searchable Project', slug: 'searchable-proj', workspaceId: ws.id },
    });
    const board = await prisma.board.create({
      data: { name: 'Search Board', projectId: proj.id },
    });
    const list = await prisma.list.create({
      data: { name: 'Search List', boardId: board.id },
    });
    await prisma.task.create({
      data: { title: 'Super Searchable Task', listId: list.id },
    });

    // Generate token
    userToken = jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET || 'test-secret' },
    );
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { title: 'Super Searchable Task' } });
    await prisma.board.deleteMany({ where: { name: 'Search Board' } });
    await prisma.project.deleteMany({ where: { slug: 'searchable-proj' } });
    await prisma.workspace.deleteMany({ where: { slug: 'searchable-ws' } });
    await prisma.organization.deleteMany({ where: { slug: 'searchable-org' } });
    await prisma.user.deleteMany({ where: { email: 'search-test@example.com' } });
    await app.close();
  });

  it('/search (GET) - empty query', async () => {
    const res = await request(app.getHttpServer())
      .get('/search')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.tasks).toEqual([]);
    expect(res.body.projects).toEqual([]);
    expect(res.body.workspaces).toEqual([]);
  });

  it('/search (GET) - matching query', async () => {
    const res = await request(app.getHttpServer())
      .get('/search?q=Searchable')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
    expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
    expect(res.body.workspaces.length).toBeGreaterThanOrEqual(1);

    expect(res.body.tasks[0].title).toBe('Super Searchable Task');
    expect(res.body.projects[0].name).toBe('Super Searchable Project');
    expect(res.body.workspaces[0].name).toBe('Super Searchable Workspace');
  });

  it('/search (GET) - no match', async () => {
    const res = await request(app.getHttpServer())
      .get('/search?q=XYZNonExistent123')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.tasks).toEqual([]);
    expect(res.body.projects).toEqual([]);
    expect(res.body.workspaces).toEqual([]);
  });
});
