import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { OrganizationsRepository } from './organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from '@flowlyx/database';

@Injectable()
export class OrganizationsService {
  constructor(private readonly organizationsRepository: OrganizationsRepository) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.organizationsRepository.findBySlug(createOrganizationDto.slug);
    if (existing) {
      throw new ConflictException('Organization with this slug already exists');
    }
    return this.organizationsRepository.create(createOrganizationDto);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationsRepository.findAll();
  }

  async findById(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findBySlug(slug);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findById(id);
    return this.organizationsRepository.update(organization.id, updateOrganizationDto);
  }

  async remove(id: string): Promise<boolean> {
    const organization = await this.findById(id);
    return this.organizationsRepository.delete(organization.id);
  }
}
