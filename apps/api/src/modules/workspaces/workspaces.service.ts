import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { WorkspacesRepository } from './workspaces.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from '@flowlyx/database';

@Injectable()
export class WorkspacesService {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}

  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const existing = await this.workspacesRepository.findBySlug(createWorkspaceDto.slug);
    if (existing) {
      throw new ConflictException('Workspace with this slug already exists');
    }
    return this.workspacesRepository.create(createWorkspaceDto);
  }

  async findAllByOrganizationId(organizationId: string): Promise<Workspace[]> {
    return this.workspacesRepository.findAllByOrganizationId(organizationId);
  }

  async findById(id: string): Promise<Workspace> {
    const workspace = await this.workspacesRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async findBySlug(slug: string): Promise<Workspace> {
    const workspace = await this.workspacesRepository.findBySlug(slug);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.findById(id);
    return this.workspacesRepository.update(workspace.id, updateWorkspaceDto);
  }

  async remove(id: string): Promise<boolean> {
    const workspace = await this.findById(id);
    return this.workspacesRepository.delete(workspace.id);
  }
}
