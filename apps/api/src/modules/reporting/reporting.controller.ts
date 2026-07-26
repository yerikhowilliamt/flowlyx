import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { ProjectReportQueryDto } from './dto/project-report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRolesGuard } from '../rbac/guards/project-roles.guard';
import { ProjectRoles } from '../rbac/decorators/project-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';
import { ProjectRole } from '../rbac/enums';

@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('project/:projectId/overview')
  @UseGuards(ProjectRolesGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER, ProjectRole.ADMIN, ProjectRole.MEMBER)
  @ApiOperation({ summary: 'Get task overview report for a project' })
  @SwaggerResponse({ status: 200, description: 'Project overview report' })
  @SwaggerResponse({ status: 404, description: 'Project not found' })
  async getProjectOverview(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ProjectReportQueryDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.reportingService.getProjectOverview(projectId, user.id, query);
    return { success: true, message: 'Project overview report generated', data };
  }

  @Get('project/:projectId/time-tracking')
  @UseGuards(ProjectRolesGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER, ProjectRole.ADMIN, ProjectRole.MEMBER)
  @ApiOperation({ summary: 'Get time tracking report for a project' })
  @SwaggerResponse({ status: 200, description: 'Time tracking report' })
  @SwaggerResponse({ status: 404, description: 'Project not found' })
  async getTimeTrackingReport(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ProjectReportQueryDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.reportingService.getTimeTrackingReport(projectId, user.id, query);
    return { success: true, message: 'Time tracking report generated', data };
  }

  @Get('project/:projectId/member-activity')
  @UseGuards(ProjectRolesGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER, ProjectRole.ADMIN, ProjectRole.MEMBER)
  @ApiOperation({ summary: 'Get member activity report for a project' })
  @SwaggerResponse({ status: 200, description: 'Member activity report' })
  @SwaggerResponse({ status: 404, description: 'Project not found' })
  async getMemberActivityReport(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ProjectReportQueryDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.reportingService.getMemberActivityReport(projectId, user.id, query);
    return { success: true, message: 'Member activity report generated', data };
  }

  @Get('workspace/:workspaceId/summary')
  @ApiOperation({ summary: 'Get summary report for a workspace' })
  @SwaggerResponse({ status: 200, description: 'Workspace summary report' })
  @SwaggerResponse({ status: 404, description: 'Workspace not found' })
  async getWorkspaceSummary(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.reportingService.getWorkspaceSummary(workspaceId, user.id);
    return { success: true, message: 'Workspace summary report generated', data };
  }
}
