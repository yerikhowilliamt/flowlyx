import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SCHEDULED_JOBS_QUEUE } from './scheduled-jobs.constants';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ScheduledJobsService implements OnModuleInit {
  constructor(
    @InjectQueue(SCHEDULED_JOBS_QUEUE)
    private readonly scheduledJobsQueue: Queue,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ScheduledJobsService.name);
  }

  async onModuleInit() {
    this.logger.info('Initializing Scheduled Jobs Module');
    // Example: Register a basic health check heartbeat job if none exists
    // This job acts as a placeholder to ensure the module works.
    await this.addCronJob('system-heartbeat', '*/5 * * * *', {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Adds or updates a repeatable cron job
   */
  async addCronJob(name: string, cronPattern: string, data: Record<string, unknown> = {}) {
    this.logger.info({ name, cronPattern }, 'Adding/Updating cron job');

    // BullMQ requires a job name, we'll use the provided name.
    await this.scheduledJobsQueue.add(name, data, {
      repeat: {
        pattern: cronPattern,
      },
      jobId: name, // Using name as jobId helps ensure uniqueness and makes it easy to replace
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  /**
   * Retrieves all repeatable jobs currently registered in the queue
   */
  async getRegisteredJobs() {
    return this.scheduledJobsQueue.getRepeatableJobs();
  }

  /**
   * Removes a specific repeatable job by name and pattern
   */
  async removeCronJob(name: string, cronPattern: string, id: string) {
    this.logger.info({ name, cronPattern }, 'Removing cron job');
    await this.scheduledJobsQueue.removeRepeatable(
      name,
      {
        pattern: cronPattern,
      },
      id,
    );
  }
}
