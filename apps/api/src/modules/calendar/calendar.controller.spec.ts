import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

describe('CalendarController', () => {
  let controller: CalendarController;
  let service: CalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: {
            getTasks: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
    service = module.get<CalendarService>(CalendarService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get tasks from service', async () => {
    const query = {
      workspaceId: 'w1',
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-01-31T23:59:59Z',
    };
    (service.getTasks as jest.Mock).mockResolvedValue([{ id: 't1' }]);

    const result = await controller.getTasks(query);

    expect(service.getTasks).toHaveBeenCalledWith(query);
    expect(result).toEqual([{ id: 't1' }]);
  });
});
