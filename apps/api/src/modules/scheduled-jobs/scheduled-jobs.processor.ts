import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BaseProcessor } from '../../core/base/base.processor';
import { SCHEDULED_JOBS_QUEUE } from './scheduled-jobs.constants';

@Processor(SCHEDULED_JOBS_QUEUE)
export class ScheduledJobsProcessor extends BaseProcessor {
  protected readonly logger = new Logger(ScheduledJobsProcessor.name);

  async handle(job: Job<unknown, unknown, string>): Promise<unknown> {
    this.logger.log(`Processing scheduled job ${job.name} with data: ${JSON.stringify(job.data)}`);

    switch (job.name) {
      default:
        this.logger.warn(`Unknown scheduled job name encountered: ${job.name}`);
    }
    return { success: true, timestamp: new Date().toISOString() };
  }
}
