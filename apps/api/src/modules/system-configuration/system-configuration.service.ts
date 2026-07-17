import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSystemConfigurationDto } from './dto/create-system-configuration.dto';
import { UpdateSystemConfigurationDto } from './dto/update-system-configuration.dto';
import { prisma, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class SystemConfigurationService {
  async create(createDto: CreateSystemConfigurationDto) {
    const existing = await prisma.systemConfiguration.findUnique({ where: { key: createDto.key } });
    if (existing) {
      throw new ConflictException(`Configuration with key ${createDto.key} already exists`);
    }
    return prisma.systemConfiguration.create({
      data: {
        ...createDto,
        value: createDto.value as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SystemConfigurationWhereInput = {};
    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.systemConfiguration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.systemConfiguration.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findByKey(key: string) {
    const config = await prisma.systemConfiguration.findUnique({ where: { key } });
    if (!config) {
      throw new NotFoundException(`Configuration with key ${key} not found`);
    }
    return config;
  }

  async update(key: string, updateDto: UpdateSystemConfigurationDto) {
    const config = await prisma.systemConfiguration.findUnique({ where: { key } });
    if (!config) {
      throw new NotFoundException(`Configuration with key ${key} not found`);
    }

    return prisma.systemConfiguration.update({
      where: { key },
      data: {
        ...updateDto,
        value: updateDto.value as Prisma.InputJsonValue,
      },
    });
  }

  async delete(key: string) {
    const config = await prisma.systemConfiguration.findUnique({ where: { key } });
    if (!config) {
      throw new NotFoundException(`Configuration with key ${key} not found`);
    }
    await prisma.systemConfiguration.delete({ where: { key } });
    return true;
  }
}
