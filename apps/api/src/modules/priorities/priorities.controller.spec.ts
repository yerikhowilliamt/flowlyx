/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { PrioritiesController } from './priorities.controller';
import { PrioritiesService } from './priorities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRolesGuard } from '../rbac/guards/project-roles.guard';
import { User } from '@flowlyx/database';

const mockPrioritiesService = {
  create: jest.fn(),
  findAllByProjectId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PrioritiesController', () => {
  let controller: PrioritiesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrioritiesController],
      providers: [
        {
          provide: PrioritiesService,
          useValue: mockPrioritiesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ProjectRolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PrioritiesController>(PrioritiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create priority', async () => {
      const dto = { projectId: 'project-1', name: 'High' };
      mockPrioritiesService.create.mockResolvedValue({ id: 'id-1', ...dto });

      const result = await controller.create(dto, { id: 'user-1' } as User);
      expect(result).toEqual({ id: 'id-1', ...dto });
      expect(mockPrioritiesService.create).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return array if projectId provided', async () => {
      mockPrioritiesService.findAllByProjectId.mockResolvedValue([{ id: 'id-1' }]);

      const result = await controller.findAll({ page: 1, limit: 10 } as any, 'project-1');
      expect(result).toEqual([{ id: 'id-1' }]);
    });

    it('should return empty if projectId not provided', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as any);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return priority', async () => {
      mockPrioritiesService.findById.mockResolvedValue({ id: 'id-1' });

      const result = await controller.findOne('id-1');
      expect(result).toEqual({ id: 'id-1' });
    });
  });

  describe('update', () => {
    it('should update priority', async () => {
      const dto = { name: 'Updated' };
      mockPrioritiesService.update.mockResolvedValue({ id: 'id-1', ...dto });

      const result = await controller.update('id-1', dto, { id: 'user-1' } as User);
      expect(result).toEqual({ id: 'id-1', ...dto });
      expect(mockPrioritiesService.update).toHaveBeenCalledWith('id-1', dto, 'user-1');
    });
  });

  describe('remove', () => {
    it('should remove priority', async () => {
      mockPrioritiesService.remove.mockResolvedValue(true);

      await controller.remove('id-1', { id: 'user-1' } as User);
      expect(mockPrioritiesService.remove).toHaveBeenCalledWith('id-1', 'user-1');
    });
  });
});
