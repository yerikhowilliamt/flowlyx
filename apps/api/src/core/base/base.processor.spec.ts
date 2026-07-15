import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BaseProcessor } from './base.processor';

class TestProcessor extends BaseProcessor {
  protected readonly logger = new Logger(TestProcessor.name);

  async handle(job: Job<unknown, unknown, string>): Promise<unknown> {
    if (job.name === 'fail') {
      throw new Error('Test error');
    }
    return 'success';
  }
}

describe('BaseProcessor', () => {
  let processor: TestProcessor;
  let job: Job;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    processor = new TestProcessor();
    job = { id: '1', name: 'test' } as Job;
    loggerLogSpy = jest.spyOn(processor['logger'], 'log').mockImplementation();
    loggerErrorSpy = jest.spyOn(processor['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process job successfully and log start/end', async () => {
    const result = await processor.process(job);

    expect(result).toBe('success');
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[JobStarted] ID: 1 | Name: test'),
    );
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[JobCompleted] ID: 1 | Name: test'),
    );
  });

  it('should handle errors, log them, and re-throw', async () => {
    job.name = 'fail';

    await expect(processor.process(job)).rejects.toThrow('Test error');

    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[JobStarted] ID: 1 | Name: fail'),
    );
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[JobFailed] ID: 1 | Name: fail'),
      expect.any(String),
    );
  });
});
