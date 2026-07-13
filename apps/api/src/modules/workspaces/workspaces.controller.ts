import { WorkspaceResponse, WorkspaceSummary } from '../../models/workspace.model';
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
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
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
@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspacesController {
  private readonly logger = new Logger(WorkspacesController.name);

  constructor(private readonly workspacesService: WorkspacesService) {}
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiCreatedResponse({ type: WorkspaceResponse })
  @Serialize(WorkspaceResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    this.logger.log(`Creating workspace: ${createWorkspaceDto.slug}`);
    return this.workspacesService.create(createWorkspaceDto);
  }
  @ApiOperation({ summary: 'List all workspaces' })
  @ApiOkResponse({ type: [WorkspaceSummary] })
  @Serialize([WorkspaceSummary])
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('organizationId') organizationId?: string) {
    if (organizationId) {
      this.logger.log(`Fetching workspaces for organizationId: ${organizationId}`);
      return this.workspacesService.findAllByOrganizationId(organizationId, query);
    }
    this.logger.log(
      'Fetching all workspaces is not supported without organizationId, returning empty',
    );
    return [];
  }
  @ApiOperation({ summary: 'Get a workspace by ID' })
  @ApiOkResponse({ type: WorkspaceResponse })
  @Serialize(WorkspaceResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching workspace with id: ${id}`);
    return this.workspacesService.findById(id);
  }
  @ApiOperation({ summary: 'Get a workspace by slug' })
  @ApiOkResponse({ type: WorkspaceResponse })
  @Serialize(WorkspaceResponse)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    this.logger.log(`Fetching workspace with slug: ${slug}`);
    return this.workspacesService.findBySlug(slug);
  }
  @ApiOperation({ summary: 'Update a workspace' })
  @ApiOkResponse({ type: WorkspaceResponse })
  @Serialize(WorkspaceResponse)
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
