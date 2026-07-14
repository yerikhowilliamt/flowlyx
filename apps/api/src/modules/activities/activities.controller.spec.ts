import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityAction } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let mockService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findByEntityId: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findByEntityId', () => {
    it('should return paginated activities', async () => {
      const entityId = 'uuid1';
      const query = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' as const };
      const result = { data: [{ id: 'uuid3', entityId }], meta: { total: 1 } };
      mockService.findByEntityId.mockResolvedValue(result);

      expect(await controller.findByEntityId(entityId, query)).toEqual(result);
      expect(mockService.findByEntityId).toHaveBeenCalledWith(entityId, query);
    });
  });

  describe('findById', () => {
    it('should return an activity by id', async () => {
      const activity = { id: 'uuid1', entityId: 'uuid2' };
      mockService.findById.mockResolvedValue(activity);

      expect(await controller.findById('uuid1')).toEqual(activity);
      expect(mockService.findById).toHaveBeenCalledWith('uuid1');
    });
  });
});
