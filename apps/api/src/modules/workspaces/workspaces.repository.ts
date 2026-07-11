import { Injectable } from '@nestjs/common';
import { prisma, Workspace } from '@flowlyx/database';
import { BaseRepository } from '../../core/base/base.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesRepository implements BaseRepository<Workspace> {
  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    return prisma.workspace.create({
      data: createWorkspaceDto as never,
    });
  }

  async findAllByOrganizationId(organizationId: string): Promise<Workspace[]> {
    return prisma.workspace.findMany({
      where: { organizationId },
    });
  }

  async findAll(query?: unknown): Promise<Workspace[]> {
    return prisma.workspace.findMany({ where: query as never });
  }

  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { slug },
    });
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto as never,
    });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.workspace.delete({
      where: { id },
    });
    return true;
  }
}
