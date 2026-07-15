import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledJobsProcessor } from './scheduled-jobs.processor';
import { Job } from 'bullmq';

describe('ScheduledJobsProcessor', () => {
  let processor: ScheduledJobsProcessor;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledJobsProcessor],
    }).compile();

    processor = module.get<ScheduledJobsProcessor>(ScheduledJobsProcessor);

    // Mock the logger protected property
    loggerWarnSpy = jest.spyOn(processor['logger'], 'warn').mockImplementation();
    jest.spyOn(processor['logger'], 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handle', () => {
    it('should log a warning for unknown jobs', async () => {
      const mockJob = {
        id: '2',
        name: 'unknown-job',
        data: {},
      } as Job;

      const result = await processor.handle(mockJob);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Unknown scheduled job name encountered: unknown-job',
      );
      expect(result).toEqual({ success: true, timestamp: expect.any(String) });
    });
  });
});
