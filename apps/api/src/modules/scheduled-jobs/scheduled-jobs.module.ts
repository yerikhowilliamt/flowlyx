import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SCHEDULED_JOBS_QUEUE } from './scheduled-jobs.constants';
import { ScheduledJobsService } from './scheduled-jobs.service';
import { ScheduledJobsProcessor } from './scheduled-jobs.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SCHEDULED_JOBS_QUEUE,
    }),
  ],
  providers: [ScheduledJobsService, ScheduledJobsProcessor],
  exports: [ScheduledJobsService],
})
export class ScheduledJobsModule {}
