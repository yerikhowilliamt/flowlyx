import { Module } from '@nestjs/common';
import { TimeEntryService } from './services/time-entry.service';
import { TimeEntryController } from './controllers/time-entry.controller';
import { TimeEntryRepository } from './repositories/time-entry.repository';

@Module({
  imports: [],
  controllers: [TimeEntryController],
  providers: [TimeEntryService, TimeEntryRepository],
  exports: [TimeEntryService],
})
export class TimeTrackingModule {}
