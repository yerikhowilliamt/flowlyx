import { Module } from '@nestjs/common';
import { TimeEntryService } from './services/time-entry.service';
import { TimeEntryController } from './controllers/time-entry.controller';

@Module({
  imports: [],
  controllers: [TimeEntryController],
  providers: [TimeEntryService],
  exports: [TimeEntryService],
})
export class TimeTrackingModule {}
