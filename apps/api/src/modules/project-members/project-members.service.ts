import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, ProjectMember, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@Injectable()
export class ProjectMembersService {
  async create(createProjectMemberDto: CreateProjectMemberDto): Promise<ProjectMember> {
    return prisma.projectMember.create({ data: createProjectMemberDto });
  }

  async findAll(projectId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectMemberWhereInput = { projectId };

    const [data, total] = await Promise.all([
      prisma.projectMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.projectMember.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
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
