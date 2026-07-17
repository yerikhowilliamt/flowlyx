import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { prisma, Project, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ProjectsService {
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const existing = await prisma.project.findUnique({ where: { slug: createProjectDto.slug } });
    if (existing) {
      throw new ConflictException(
        'A project with this slug already exists. Please choose another one.',
      );
    }
    return prisma.project.create({ data: createProjectDto });
  }

  async findAllByWorkspaceId(workspaceId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = { workspaceId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.project.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Project> {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findBySlug(slug: string): Promise<Project> {
    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.findById(id);
    return prisma.project.update({ where: { id }, data: updateProjectDto });
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await prisma.project.delete({ where: { id } });
    return true;
  }
}
