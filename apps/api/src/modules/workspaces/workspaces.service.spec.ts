import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { ConflictException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    workspace: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspacesService],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ConflictException on create if exists', async () => {
    (prisma.workspace.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
    await expect(service.create({ name: 'W', slug: 'w', organizationId: 'o' })).rejects.toThrow(
      ConflictException,
    );
  });
});
