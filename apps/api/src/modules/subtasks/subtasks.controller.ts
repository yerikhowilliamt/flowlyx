import { SubtaskResponse, SubtaskSummary } from '../../models/subtask.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
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
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
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
@ApiTags('Subtasks')
@Controller('subtasks')
export class SubtasksController {
  private readonly logger = new Logger(SubtasksController.name);

  constructor(private readonly subtasksService: SubtasksService) {}
  @ApiOperation({ summary: 'Create a new subtask' })
  @ApiCreatedResponse({ type: SubtaskResponse })
  @Serialize(SubtaskResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubtaskDto: CreateSubtaskDto) {
    this.logger.log(`Creating subtask in task: ${createSubtaskDto.taskId}`);
    return this.subtasksService.create(createSubtaskDto);
  }
  @ApiOperation({ summary: 'List all subtasks' })
  @ApiOkResponse({ type: [SubtaskSummary] })
  @Serialize([SubtaskSummary])
  @Get()
  async findAll(@Query('taskId') taskId?: string) {
    if (taskId) {
      this.logger.log(`Fetching subtasks for taskId: ${taskId}`);
      return this.subtasksService.findAllByTaskId(taskId);
    }
    return [];
  }
  @ApiOperation({ summary: 'Get a subtask by ID' })
  @ApiOkResponse({ type: SubtaskResponse })
  @Serialize(SubtaskResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching subtask with id: ${id}`);
    return this.subtasksService.findById(id);
  }
  @ApiOperation({ summary: 'Update a subtask' })
  @ApiOkResponse({ type: SubtaskResponse })
  @Serialize(SubtaskResponse)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSubtaskDto: UpdateSubtaskDto) {
    this.logger.log(`Updating subtask with id: ${id}`);
    return this.subtasksService.update(id, updateSubtaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting subtask with id: ${id}`);
    await this.subtasksService.remove(id);
  }
}
