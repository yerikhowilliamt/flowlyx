import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { prisma, Organization } from '@flowlyx/database';

@Injectable()
export class OrganizationsService {
  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const existing = await prisma.organization.findUnique({
      where: { slug: createOrganizationDto.slug },
    });
    if (existing) {
      throw new ConflictException('Organization with this slug already exists');
    }
    return prisma.organization.create({ data: createOrganizationDto });
  }

  async findAll(query?: unknown): Promise<Organization[]> {
    return prisma.organization.findMany({ where: query as Record<string, unknown> });
  }

  async findById(id: string): Promise<Organization> {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    await this.findById(id);
    return prisma.organization.update({ where: { id }, data: updateOrganizationDto });
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await prisma.organization.delete({ where: { id } });
    return true;
  }
}
