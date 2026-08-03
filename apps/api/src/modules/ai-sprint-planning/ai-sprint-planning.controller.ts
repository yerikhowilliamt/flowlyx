import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AiSprintPlanningService } from './ai-sprint-planning.service';
import { GenerateSprintPlanDto } from './dto/generate-sprint-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRoles } from '../rbac/decorators/project-roles.decorator';
import { ProjectRolesGuard } from '../rbac/guards/project-roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';
import { ProjectRole } from '../rbac/enums';

@ApiTags('AI Sprint Planning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('ai-sprint-planning')
export class AiSprintPlanningController {
  constructor(private readonly aiSprintPlanningService: AiSprintPlanningService) {}

  @Post('generate')
  @ProjectRoles(ProjectRole.PROJECT_MANAGER, ProjectRole.ADMIN, ProjectRole.MEMBER)
  @ApiOperation({ summary: 'Generate an AI-powered sprint plan for a project' })
  @SwaggerResponse({ status: 201, description: 'Sprint plan generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Project not found' })
  async generateSprintPlan(@Body() dto: GenerateSprintPlanDto, @CurrentUser() user: User) {
    const data = await this.aiSprintPlanningService.generateSprintPlan(dto, user.id);
    return { success: true, message: 'Sprint plan generated successfully', data };
  }
}
