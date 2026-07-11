import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, ProjectMember } from '@flowlyx/database';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@Injectable()
export class ProjectMembersService {
  async create(createProjectMemberDto: CreateProjectMemberDto): Promise<ProjectMember> {
    return prisma.projectMember.create({ data: createProjectMemberDto });
  }

  async findAll(projectId: string): Promise<ProjectMember[]> {
    return prisma.projectMember.findMany({ where: { projectId } });
  }

  async update(id: string, updateProjectMemberDto: UpdateProjectMemberDto): Promise<ProjectMember> {
    try {
      return await prisma.projectMember.update({
        where: { id },
        data: updateProjectMemberDto,
      });
    } catch {
      throw new NotFoundException(`Project member with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.projectMember.delete({ where: { id } });
      return true;
    } catch {
      throw new NotFoundException(`Project member with ID ${id} not found`);
    }
  }
}
