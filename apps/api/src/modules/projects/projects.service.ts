import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { prisma, Project } from '@flowlyx/database';

@Injectable()
export class ProjectsService {
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const existing = await prisma.project.findUnique({ where: { slug: createProjectDto.slug } });
    if (existing) {
      throw new ConflictException('Project with this slug already exists');
    }
    return prisma.project.create({ data: createProjectDto });
  }

  async findAllByWorkspaceId(workspaceId: string): Promise<Project[]> {
    return prisma.project.findMany({ where: { workspaceId } });
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
