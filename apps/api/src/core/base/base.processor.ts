import { WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export abstract class BaseProcessor extends WorkerHost {
  protected abstract readonly logger: Logger;

  /**
   * Must be implemented by the child processor to handle the actual job logic.
   */
  abstract handle(job: Job<unknown, unknown, string>, token?: string): Promise<unknown>;

  /**
   * Wraps the job execution with standardized logging and error handling.
   */
  async process(job: Job<unknown, unknown, string>, token?: string): Promise<unknown> {
    this.logger.log(`[JobStarted] ID: ${job.id} | Name: ${job.name}`);
    const startTime = Date.now();

    try {
      const result = await this.handle(job, token);
      const duration = Date.now() - startTime;
      this.logger.log(`[JobCompleted] ID: ${job.id} | Name: ${job.name} | Duration: ${duration}ms`);
      return result;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[JobFailed] ID: ${job.id} | Name: ${job.name} | Duration: ${duration}ms | Error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw to let BullMQ handle retries and DLQ
    }
  }
}
