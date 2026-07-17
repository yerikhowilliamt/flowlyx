import { SuccessResponse } from '../../models/api.model';
import { ProjectMemberResponse, ProjectMemberSummary } from '../../models/project-member.model';
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
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../../core/pagination';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectMembersService } from './project-members.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('project-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}
  @ApiOperation({ summary: 'Create a new projectmember' })
  @ApiCreatedResponse({ type: ProjectMemberResponse })
  @Serialize(ProjectMemberResponse)
  @Post()
  @ApiOperation({ summary: 'Add a user to a project' })
  @ApiResponse({ status: 201, description: 'Project member created successfully.' })
  create(@Body() createProjectMemberDto: CreateProjectMemberDto) {
    return this.projectMembersService.create(createProjectMemberDto);
  }

  @Serialize([ProjectMemberSummary])
  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all members of a project' })
  @ApiOkResponse({ type: [ProjectMemberSummary] })
  @Serialize([ProjectMemberSummary])
  findAll(@Param('projectId') projectId: string, @Query() query: PaginationDto) {
    return this.projectMembersService.findAll(projectId, query);
  }
  @ApiOperation({ summary: 'Update a projectmember' })
  @ApiOkResponse({ type: ProjectMemberResponse })
  @Serialize(ProjectMemberResponse)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a project member' })
  update(@Param('id') id: string, @Body() updateProjectMemberDto: UpdateProjectMemberDto) {
    return this.projectMembersService.update(id, updateProjectMemberDto);
  }

  @Serialize(SuccessResponse)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a project member' })
  delete(@Param('id') id: string) {
    return this.projectMembersService.delete(id);
  }
}
