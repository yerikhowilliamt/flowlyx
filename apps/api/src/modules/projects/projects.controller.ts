import { ProjectResponse, ProjectSummary } from '../../models/project.model';
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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from '../rbac/guards/workspace-roles.guard';
import { WorkspaceRoles } from '../rbac/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../rbac/enums/workspace-role.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ type: ProjectResponse })
  @Serialize(ProjectResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProjectDto: CreateProjectDto) {
    this.logger.log(`Creating project: ${createProjectDto.slug}`);
    return this.projectsService.create(createProjectDto);
  }
  @ApiOperation({ summary: 'List all projects' })
  @ApiOkResponse({ type: [ProjectSummary] })
  @Serialize([ProjectSummary])
  @Get()
  async findAll(@Query('workspaceId') workspaceId?: string) {
    if (workspaceId) {
      this.logger.log(`Fetching projects for workspaceId: ${workspaceId}`);
      return this.projectsService.findAllByWorkspaceId(workspaceId);
    }
    this.logger.log('Fetching all projects is not supported without workspaceId, returning empty');
    return [];
  }
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiOkResponse({ type: ProjectResponse })
  @Serialize(ProjectResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching project with id: ${id}`);
    return this.projectsService.findById(id);
  }
  @ApiOperation({ summary: 'Get a project by slug' })
  @ApiOkResponse({ type: ProjectResponse })
  @Serialize(ProjectResponse)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    this.logger.log(`Fetching project with slug: ${slug}`);
    return this.projectsService.findBySlug(slug);
  }
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({ type: ProjectResponse })
  @Serialize(ProjectResponse)
  @Patch(':id')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    this.logger.log(`Updating project with id: ${id}`);
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting project with id: ${id}`);
    await this.projectsService.remove(id);
  }
}
