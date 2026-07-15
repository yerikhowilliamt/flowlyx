import { SuccessResponse } from '../../models/api.model';
import { TaskResponse, TaskSummary } from '../../models/task.model';
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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({ type: TaskResponse })
  @Serialize(TaskResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto) {
    this.logger.log(`Creating task in list: ${createTaskDto.listId}`);
    return this.tasksService.create(createTaskDto);
  }
  @ApiOperation({ summary: 'List all tasks' })
  @ApiOkResponse({ type: [TaskSummary] })
  @Serialize([TaskSummary])
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('listId') listId?: string) {
    if (listId) {
      this.logger.log(`Fetching tasks for listId: ${listId}`);
      return this.tasksService.findAllByListId(listId, query);
    }
    this.logger.log('Fetching all tasks is not supported without listId, returning empty');
    return [];
  }
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiOkResponse({ type: TaskResponse })
  @Serialize(TaskResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching task with id: ${id}`);
    return this.tasksService.findById(id);
  }
  @ApiOperation({ summary: 'Update a task' })
  @ApiOkResponse({ type: TaskResponse })
  @Serialize(TaskResponse)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    this.logger.log(`Updating task with id: ${id}`);
    return this.tasksService.update(id, updateTaskDto);
  }

  @Serialize(SuccessResponse)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting task with id: ${id}`);
    await this.tasksService.remove(id);
  }
}
