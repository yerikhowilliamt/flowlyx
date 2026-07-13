import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrioritiesService } from './priorities.service';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRolesGuard } from '../rbac/guards/project-roles.guard';
import { ProjectRoles } from '../rbac/decorators/project-roles.decorator';
import { ProjectRole } from '../rbac/enums/project-role.enum';
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
import { PriorityResponse, PrioritySummary } from '../../models/priority.model';
import { PaginationDto } from '../../core/pagination';

@ApiTags('Priorities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('priorities')
export class PrioritiesController {
  private readonly logger = new Logger(PrioritiesController.name);

  constructor(private readonly prioritiesService: PrioritiesService) {}

  @ApiOperation({ summary: 'Create a new priority' })
  @ApiCreatedResponse({ type: PriorityResponse })
  @Serialize(PriorityResponse)
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.PROJECT_MANAGER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPriorityDto: CreatePriorityDto, @CurrentUser() user: User) {
    this.logger.log(`Creating priority in project: ${createPriorityDto.projectId}`);
    return this.prioritiesService.create(createPriorityDto, user.id);
  }

  @ApiOperation({ summary: 'Get all priorities in a project' })
  @ApiOkResponse({ type: [PrioritySummary] })
  @Serialize([PrioritySummary])
  @ApiQuery({ name: 'projectId', required: false })
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('projectId') projectId?: string) {
    if (projectId) {
      this.logger.log(`Fetching priorities for project: ${projectId}`);
      return this.prioritiesService.findAllByProjectId(projectId, query);
    }
    this.logger.log(
      'Fetching all priorities is not supported without projectId, returning empty array',
    );
    return [];
  }

  @ApiOperation({ summary: 'Get a priority by ID' })
  @ApiOkResponse({ type: PriorityResponse })
  @Serialize(PriorityResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching priority with ID: ${id}`);
    return this.prioritiesService.findById(id);
  }

  @ApiOperation({ summary: 'Update a priority' })
  @ApiOkResponse({ type: PriorityResponse })
  @Serialize(PriorityResponse)
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.PROJECT_MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePriorityDto: UpdatePriorityDto,
    @CurrentUser() user: User,
  ) {
    this.logger.log(`Updating priority with ID: ${id}`);
    return this.prioritiesService.update(id, updatePriorityDto, user.id);
  }

  @ApiOperation({ summary: 'Delete a priority' })
  @ProjectRoles(ProjectRole.ADMIN, ProjectRole.PROJECT_MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    this.logger.log(`Deleting priority with ID: ${id}`);
    await this.prioritiesService.remove(id, user.id);
  }
}
