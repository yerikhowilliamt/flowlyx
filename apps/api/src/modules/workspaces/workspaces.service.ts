import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { prisma, Workspace } from '@flowlyx/database';

@Injectable()
export class WorkspacesService {
  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const existing = await prisma.workspace.findUnique({
      where: { slug: createWorkspaceDto.slug },
    });
    if (existing) {
      throw new ConflictException('Workspace with this slug already exists');
    }
    return prisma.workspace.create({ data: createWorkspaceDto });
  }

  async findAllByOrganizationId(organizationId: string): Promise<Workspace[]> {
    return prisma.workspace.findMany({ where: { organizationId } });
  }

  async findById(id: string): Promise<Workspace> {
    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async findBySlug(slug: string): Promise<Workspace> {
    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    await this.findById(id);
    return prisma.workspace.update({ where: { id }, data: updateWorkspaceDto });
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await prisma.workspace.delete({ where: { id } });
    return true;
  }
}
