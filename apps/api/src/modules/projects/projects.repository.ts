import { Injectable } from '@nestjs/common';
import { prisma, Project } from '@flowlyx/database';
import { BaseRepository } from '../../core/base/base.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsRepository implements BaseRepository<Project> {
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    return prisma.project.create({
      data: createProjectDto as never,
    });
  }

  async findAllByWorkspaceId(workspaceId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { workspaceId },
    });
  }

  async findAll(query?: unknown): Promise<Project[]> {
    return prisma.project.findMany({ where: query as never });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { slug },
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: updateProjectDto as never,
    });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.project.delete({
      where: { id },
    });
    return true;
  }
}
