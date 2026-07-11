import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('project-members')
@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Post()
  @ApiOperation({ summary: 'Add a user to a project' })
  @ApiResponse({ status: 201, description: 'Project member created successfully.' })
  create(@Body() createProjectMemberDto: CreateProjectMemberDto) {
    return this.projectMembersService.create(createProjectMemberDto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all members of a project' })
  findAll(@Param('projectId') projectId: string) {
    return this.projectMembersService.findAll(projectId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project member' })
  update(@Param('id') id: string, @Body() updateProjectMemberDto: UpdateProjectMemberDto) {
    return this.projectMembersService.update(id, updateProjectMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a project member' })
  delete(@Param('id') id: string) {
    return this.projectMembersService.delete(id);
  }
}
