import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledJobsService } from './scheduled-jobs.service';
import { getQueueToken } from '@nestjs/bullmq';
import { SCHEDULED_JOBS_QUEUE } from './scheduled-jobs.constants';
import { PinoLogger } from 'nestjs-pino';

describe('ScheduledJobsService', () => {
  let service: ScheduledJobsService;
  let queueMock: Record<string, jest.Mock>;
  let loggerMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    queueMock = {
      add: jest.fn(),
      getRepeatableJobs: jest.fn(),
      removeRepeatable: jest.fn(),
    };

    loggerMock = {
      setContext: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledJobsService,
        {
          provide: getQueueToken(SCHEDULED_JOBS_QUEUE),
          useValue: queueMock,
        },
        {
          provide: PinoLogger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<ScheduledJobsService>(ScheduledJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize and add heartbeat cron job', async () => {
      await service.onModuleInit();
      expect(loggerMock.info).toHaveBeenCalledWith('Initializing Scheduled Jobs Module');
      expect(queueMock.add).toHaveBeenCalledWith(
        'system-heartbeat',
        expect.any(Object),
        expect.objectContaining({
          repeat: { pattern: '*/5 * * * *' },
          jobId: 'system-heartbeat',
          removeOnComplete: true,
          removeOnFail: false,
        }),
      );
    });
  });

  describe('addCronJob', () => {
    it('should add a repeatable cron job', async () => {
      await service.addCronJob('test-job', '* * * * *', { foo: 'bar' });
      expect(queueMock.add).toHaveBeenCalledWith(
        'test-job',
        { foo: 'bar' },
        expect.objectContaining({
          repeat: { pattern: '* * * * *' },
          jobId: 'test-job',
        }),
      );
    });
  });
});
