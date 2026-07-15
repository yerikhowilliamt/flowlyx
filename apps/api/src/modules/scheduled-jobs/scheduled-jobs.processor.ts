import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SCHEDULED_JOBS_QUEUE } from './scheduled-jobs.constants';
import { PinoLogger } from 'nestjs-pino';

@Processor(SCHEDULED_JOBS_QUEUE)
export class ScheduledJobsProcessor extends WorkerHost {
  constructor(private readonly logger: PinoLogger) {
    super();
    this.logger.setContext(ScheduledJobsProcessor.name);
  }

  async process(job: Job<unknown, unknown, string>): Promise<unknown> {
    this.logger.info(
      { jobId: job.id, jobName: job.name, data: job.data },
      'Processing scheduled job',
    );

    try {
      switch (job.name) {
        default:
          this.logger.warn({ jobName: job.name }, 'Unknown scheduled job name encountered');
      }
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error(
        { jobId: job.id, jobName: job.name, error },
        'Error processing scheduled job',
      );
      throw error;
    }
  }
}
