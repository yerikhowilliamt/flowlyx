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
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProjectDto: CreateProjectDto) {
    this.logger.log(`Creating project: ${createProjectDto.slug}`);
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(@Query('workspaceId') workspaceId?: string) {
    if (workspaceId) {
      this.logger.log(`Fetching projects for workspaceId: ${workspaceId}`);
      return this.projectsService.findAllByWorkspaceId(workspaceId);
    }
    this.logger.log('Fetching all projects is not supported without workspaceId, returning empty');
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching project with id: ${id}`);
    return this.projectsService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    this.logger.log(`Fetching project with slug: ${slug}`);
    return this.projectsService.findBySlug(slug);
  }

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
