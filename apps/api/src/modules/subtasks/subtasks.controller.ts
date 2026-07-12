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
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subtasks')
export class SubtasksController {
  private readonly logger = new Logger(SubtasksController.name);

  constructor(private readonly subtasksService: SubtasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubtaskDto: CreateSubtaskDto) {
    this.logger.log(`Creating subtask in task: ${createSubtaskDto.taskId}`);
    return this.subtasksService.create(createSubtaskDto);
  }

  @Get()
  async findAll(@Query('taskId') taskId?: string) {
    if (taskId) {
      this.logger.log(`Fetching subtasks for taskId: ${taskId}`);
      return this.subtasksService.findAllByTaskId(taskId);
    }
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching subtask with id: ${id}`);
    return this.subtasksService.findById(id);
  }

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
