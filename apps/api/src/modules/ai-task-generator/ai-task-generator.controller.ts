import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AiTaskGeneratorService } from './ai-task-generator.service';
import { GenerateTasksDto } from './dto/generate-tasks.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { ProjectRoles } from '../../modules/rbac/decorators/project-roles.decorator';
import { ProjectRolesGuard } from '../../modules/rbac/guards/project-roles.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';
import { ProjectRole } from '../../modules/rbac/enums';

@ApiTags('AI Task Generator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('ai-task-generator')
export class AiTaskGeneratorController {
  constructor(private readonly aiTaskGeneratorService: AiTaskGeneratorService) {}

  @Post('generate')
  @ProjectRoles(ProjectRole.PROJECT_MANAGER, ProjectRole.ADMIN, ProjectRole.MEMBER)
  @ApiOperation({ summary: 'Generate tasks using AI based on a prompt' })
  @SwaggerResponse({ status: 201, description: 'Tasks generated successfully' })
  async generateTasks(@Body() dto: GenerateTasksDto, @CurrentUser() user: User) {
    const tasks = await this.aiTaskGeneratorService.generateTasks(dto, user.id);
    return {
      success: true,
      message: 'Tasks generated successfully',
      data: tasks,
    };
  }
}
