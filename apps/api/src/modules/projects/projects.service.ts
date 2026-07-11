import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '@flowlyx/database';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const existing = await this.projectsRepository.findBySlug(createProjectDto.slug);
    if (existing) {
      throw new ConflictException('Project with this slug already exists');
    }
    return this.projectsRepository.create(createProjectDto);
  }

  async findAllByWorkspaceId(workspaceId: string): Promise<Project[]> {
    return this.projectsRepository.findAllByWorkspaceId(workspaceId);
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findBySlug(slug: string): Promise<Project> {
    const project = await this.projectsRepository.findBySlug(slug);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);
    return this.projectsRepository.update(project.id, updateProjectDto);
  }

  async remove(id: string): Promise<boolean> {
    const project = await this.findById(id);
    return this.projectsRepository.delete(project.id);
  }
}
