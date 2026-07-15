import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { prisma, Workspace, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class WorkspacesService {
  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const existing = await prisma.workspace.findUnique({
      where: { slug: createWorkspaceDto.slug },
    });
    if (existing) {
      throw new ConflictException(
        'A workspace with this slug already exists. Please choose another one.',
      );
    }
    return prisma.workspace.create({ data: createWorkspaceDto });
  }

  async findAllByOrganizationId(organizationId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkspaceWhereInput = { organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.workspace.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.workspace.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
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
