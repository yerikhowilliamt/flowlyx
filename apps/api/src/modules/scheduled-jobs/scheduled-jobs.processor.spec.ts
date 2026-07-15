import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledJobsProcessor } from './scheduled-jobs.processor';
import { PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';

describe('ScheduledJobsProcessor', () => {
  let processor: ScheduledJobsProcessor;
  let loggerMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    loggerMock = {
      setContext: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledJobsProcessor,
        {
          provide: PinoLogger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    processor = module.get<ScheduledJobsProcessor>(ScheduledJobsProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process system-heartbeat successfully', async () => {
      const mockJob = {
        id: '1',
        name: 'system-heartbeat',
        data: {},
      } as Job;

      const result = await processor.process(mockJob);

      expect(loggerMock.info).toHaveBeenCalledWith('System heartbeat executed successfully.');
      expect(result).toEqual({ success: true, timestamp: expect.any(String) });
    });

    it('should log a warning for unknown jobs', async () => {
      const mockJob = {
        id: '2',
        name: 'unknown-job',
        data: {},
      } as Job;

      const result = await processor.process(mockJob);

      expect(loggerMock.warn).toHaveBeenCalledWith(
        { jobName: 'unknown-job' },
        'Unknown scheduled job name encountered',
      );
      expect(result).toEqual({ success: true, timestamp: expect.any(String) });
    });
  });
});
