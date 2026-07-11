import { Injectable } from '@nestjs/common';
import { prisma, Organization } from '@flowlyx/database';
import { BaseRepository } from '../../core/base/base.repository';

@Injectable()
export class OrganizationsRepository implements BaseRepository<Organization> {
  async findAll(query?: unknown): Promise<Organization[]> {
    return prisma.organization.findMany({ where: query as never });
  }

  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { slug } });
  }

  async create(data: unknown): Promise<Organization> {
    return prisma.organization.create({ data: data as never });
  }

  async update(id: string, data: unknown): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data: data as never,
    });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.organization.delete({ where: { id } });
    return true;
  }
}
