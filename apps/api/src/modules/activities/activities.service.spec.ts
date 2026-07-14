import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { NotFoundException } from '@nestjs/common';
import { ActivityAction } from './dto/create-activity.dto';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let mockRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByEntityId: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: ActivitiesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an activity', async () => {
      const dto = {
        entityId: 'uuid1',
        entityType: 'TASK',
        userId: 'uuid2',
        action: ActivityAction.CREATED,
      };
      const result = { id: 'uuid3', ...dto };
      mockRepository.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findByEntityId', () => {
    it('should return paginated activities', async () => {
      const entityId = 'uuid1';
      const query = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' as const };
      const data = [{ id: 'uuid3', entityId }];
      mockRepository.findByEntityId.mockResolvedValue([data, 1]);

      const result = await service.findByEntityId(entityId, query);
      expect(result.data).toEqual(data);
      expect(result.meta.total).toEqual(1);
    });
  });

  describe('findById', () => {
    it('should return an activity by id', async () => {
      const activity = { id: 'uuid1', entityId: 'uuid2' };
      mockRepository.findById.mockResolvedValue(activity);

      expect(await service.findById('uuid1')).toEqual(activity);
    });

    it('should throw NotFoundException if activity not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('uuid1')).rejects.toThrow(NotFoundException);
    });
  });
});
