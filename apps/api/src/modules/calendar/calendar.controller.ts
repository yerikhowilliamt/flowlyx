import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { GetCalendarDto } from './dto/get-calendar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TaskSummary } from '../../models/task.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(private readonly calendarService: CalendarService) {}

  @ApiOperation({ summary: 'Get calendar tasks' })
  @ApiOkResponse({ type: [TaskSummary] })
  @Serialize([TaskSummary])
  @Get()
  async getTasks(@Query() query: GetCalendarDto) {
    this.logger.log(`Fetching calendar tasks for workspace: ${query.workspaceId}`);
    return this.calendarService.getTasks(query);
  }
}
