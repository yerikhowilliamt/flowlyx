import { TaskCommentResponse } from '../../models/task-comment.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { PaginationDto } from '../../core/pagination';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Task Comments')
@Controller('task-comments')
export class TaskCommentsController {
  private readonly logger = new Logger(TaskCommentsController.name);

  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @ApiOperation({ summary: 'Create a new task comment' })
  @ApiCreatedResponse({ type: TaskCommentResponse })
  @Serialize(TaskCommentResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: User, @Body() createDto: CreateTaskCommentDto) {
    this.logger.log(`User ${user.id} creating comment for task: ${createDto.taskId}`);
    return this.taskCommentsService.create(user.id, createDto);
  }

  @ApiOperation({ summary: 'List all comments for a task' })
  @ApiOkResponse({ type: [TaskCommentResponse] })
  @Serialize([TaskCommentResponse])
  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationDto,
    @Query('taskId') taskId: string,
  ) {
    this.logger.log(`User ${user.id} fetching comments for taskId: ${taskId}`);
    return this.taskCommentsService.findAllByTaskId(taskId, user.id, query);
  }

  @ApiOperation({ summary: 'Update a task comment' })
  @ApiOkResponse({ type: TaskCommentResponse })
  @Serialize(TaskCommentResponse)
  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskCommentDto,
  ) {
    this.logger.log(`User ${user.id} updating comment with id: ${id}`);
    return this.taskCommentsService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    this.logger.log(`User ${user.id} deleting comment with id: ${id}`);
    await this.taskCommentsService.remove(id, user.id);
  }
}
