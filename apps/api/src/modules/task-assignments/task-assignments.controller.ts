import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TaskAssignmentsService } from './task-assignments.service';
import { CreateTaskAssignmentDto } from './dto/create-task-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { PaginationDto } from '../../core/pagination';
import { TaskAssignmentResponse, TaskAssignmentSummary } from '../../models/task-assignment.model';
import { SuccessResponse } from '../../models/api.model';

@ApiTags('Task Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('task-assignments')
export class TaskAssignmentsController {
  private readonly logger = new Logger(TaskAssignmentsController.name);

  constructor(private readonly taskAssignmentsService: TaskAssignmentsService) {}

  @ApiOperation({ summary: 'Assign a user to a task' })
  @ApiCreatedResponse({ type: TaskAssignmentResponse })
  @Serialize(TaskAssignmentResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskAssignmentDto, @CurrentUser() user: User) {
    this.logger.log(`Assigning user ${dto.userId} to task ${dto.taskId}`);
    return this.taskAssignmentsService.create(dto, user.id);
  }

  @ApiOperation({ summary: 'Get all assignments for a task' })
  @ApiOkResponse({ type: [TaskAssignmentSummary] })
  @Serialize([TaskAssignmentSummary])
  @ApiQuery({ name: 'taskId', required: false })
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('taskId') taskId?: string) {
    if (taskId) {
      this.logger.log(`Fetching assignments for task: ${taskId}`);
      return this.taskAssignmentsService.findAllByTaskId(taskId, query);
    }
    return [];
  }

  @ApiOperation({ summary: 'Remove a task assignment' })
  @Serialize(SuccessResponse)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting task assignment with ID: ${id}`);
    await this.taskAssignmentsService.remove(id);
  }
}
