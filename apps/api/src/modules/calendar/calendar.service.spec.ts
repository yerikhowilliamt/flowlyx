import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { prisma } from '@flowlyx/database';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
    },
  },
}));

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarService],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should query tasks using workspaceId when projectId is not provided', async () => {
    (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 't1' }]);

    const result = await service.getTasks({
      workspaceId: 'w1',
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-01-31T23:59:59Z',
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          list: { board: { project: { workspaceId: 'w1' } } },
        }),
      }),
    );
    expect(result).toEqual([{ id: 't1' }]);
  });

  it('should query tasks using projectId when provided', async () => {
    (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 't2' }]);

    const result = await service.getTasks({
      workspaceId: 'w1',
      projectId: 'p2',
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-01-31T23:59:59Z',
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          list: { board: { project: { id: 'p2' } } },
        }),
      }),
    );
    expect(result).toEqual([{ id: 't2' }]);
  });
});
