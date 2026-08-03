import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AiProjectSummaryService } from './ai-project-summary.service';
import { GenerateProjectSummaryDto } from './dto/generate-project-summary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRoles } from '../rbac/decorators/project-roles.decorator';
import { ProjectRolesGuard } from '../rbac/guards/project-roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';
import { ProjectRole } from '../rbac/enums';

@ApiTags('AI Project Summary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('ai-project-summary')
export class AiProjectSummaryController {
  constructor(private readonly aiProjectSummaryService: AiProjectSummaryService) {}

  @Post('generate')
  @ProjectRoles(ProjectRole.PROJECT_MANAGER, ProjectRole.ADMIN, ProjectRole.MEMBER)
  @ApiOperation({ summary: 'Generate an AI-powered summary for a project' })
  @SwaggerResponse({ status: 201, description: 'Project summary generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Project not found' })
  async generateSummary(@Body() dto: GenerateProjectSummaryDto, @CurrentUser() user: User) {
    const data = await this.aiProjectSummaryService.generateSummary(dto, user.id);
    return { success: true, message: 'Project summary generated successfully', data };
  }
}
