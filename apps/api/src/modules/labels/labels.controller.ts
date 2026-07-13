import { LabelResponse, LabelSummary } from '../../models/label.model';
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
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
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
@ApiTags('Labels')
@Controller('labels')
export class LabelsController {
  private readonly logger = new Logger(LabelsController.name);

  constructor(private readonly labelsService: LabelsService) {}
  @ApiOperation({ summary: 'Create a new label' })
  @ApiCreatedResponse({ type: LabelResponse })
  @Serialize(LabelResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLabelDto: CreateLabelDto) {
    this.logger.log(`Creating label in project: ${createLabelDto.projectId}`);
    return this.labelsService.create(createLabelDto);
  }
  @ApiOperation({ summary: 'List all labels' })
  @ApiOkResponse({ type: [LabelSummary] })
  @Serialize([LabelSummary])
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('projectId') projectId?: string, @Query('taskId') taskId?: string) {
    if (taskId) {
      this.logger.log(`Fetching labels for taskId: ${taskId}`);
      return this.labelsService.findByTaskId(taskId, query);
    }
    if (projectId) {
      this.logger.log(`Fetching labels for projectId: ${projectId}`);
      return this.labelsService.findAllByProjectId(projectId, query);
    }
    return [];
  }
  @ApiOperation({ summary: 'Get a label by ID' })
  @ApiOkResponse({ type: LabelResponse })
  @Serialize(LabelResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching label with id: ${id}`);
    return this.labelsService.findById(id);
  }
  @ApiOperation({ summary: 'Update a label' })
  @ApiOkResponse({ type: LabelResponse })
  @Serialize(LabelResponse)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto) {
    this.logger.log(`Updating label with id: ${id}`);
    return this.labelsService.update(id, updateLabelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting label with id: ${id}`);
    await this.labelsService.remove(id);
  }

  @Post(':labelId/tasks/:taskId')
  @HttpCode(HttpStatus.CREATED)
  async addToTask(@Param('labelId') labelId: string, @Param('taskId') taskId: string) {
    this.logger.log(`Assigning label ${labelId} to task ${taskId}`);
    return this.labelsService.addToTask(labelId, taskId);
  }

  @Delete(':labelId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromTask(@Param('labelId') labelId: string, @Param('taskId') taskId: string) {
    this.logger.log(`Unassigning label ${labelId} from task ${taskId}`);
    await this.labelsService.removeFromTask(labelId, taskId);
  }
}
