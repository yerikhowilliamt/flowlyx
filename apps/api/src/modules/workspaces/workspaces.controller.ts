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
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from '../rbac/guards/workspace-roles.guard';
import { WorkspaceRoles } from '../rbac/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../rbac/enums/workspace-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  private readonly logger = new Logger(WorkspacesController.name);

  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    this.logger.log(`Creating workspace: ${createWorkspaceDto.slug}`);
    return this.workspacesService.create(createWorkspaceDto);
  }

  @Get()
  async findAll(@Query('organizationId') organizationId?: string) {
    if (organizationId) {
      this.logger.log(`Fetching workspaces for organizationId: ${organizationId}`);
      return this.workspacesService.findAllByOrganizationId(organizationId);
    }
    this.logger.log(
      'Fetching all workspaces is not supported without organizationId, returning empty',
    );
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching workspace with id: ${id}`);
    return this.workspacesService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    this.logger.log(`Fetching workspace with slug: ${slug}`);
    return this.workspacesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    this.logger.log(`Updating workspace with id: ${id}`);
    return this.workspacesService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting workspace with id: ${id}`);
    await this.workspacesService.remove(id);
  }
}
