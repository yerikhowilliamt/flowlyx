import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { prisma } from '@flowlyx/database';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call prisma.project.create', async () => {
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.project.create as jest.Mock).mockResolvedValue({ id: '1' });
    await service.create({ name: 'P', slug: 'p', workspaceId: 'w' });
    expect(prisma.project.create).toHaveBeenCalled();
  });
});
