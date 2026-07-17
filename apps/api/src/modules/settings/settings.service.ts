import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting, prisma, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  async create(createSettingDto: CreateSettingDto, userId: string): Promise<Setting> {
    const existing = await prisma.setting.findUnique({ where: { key: createSettingDto.key } });
    if (existing) {
      throw new ConflictException(`Setting with key '${createSettingDto.key}' already exists`);
    }

    const setting = await prisma.setting.create({
      data: {
        ...createSettingDto,
        createdBy: userId,
      },
    });

    this.logger.log(`Created new setting: ${setting.key}`);
    return setting;
  }

  async findAll(query: PaginationDto, isPublicOnly: boolean = false) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SettingWhereInput = {};
    if (isPublicOnly) {
      where.isPublic = true;
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { group: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.setting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.setting.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }
    return setting;
  }

  async findById(id: string): Promise<Setting> {
    const setting = await prisma.setting.findUnique({ where: { id } });
    if (!setting) {
      throw new NotFoundException(`Setting with ID '${id}' not found`);
    }
    return setting;
  }

  async update(id: string, updateSettingDto: UpdateSettingDto, userId: string): Promise<Setting> {
    const setting = await this.findById(id);

    if (updateSettingDto.key && updateSettingDto.key !== setting.key) {
      const existing = await prisma.setting.findUnique({ where: { key: updateSettingDto.key } });
      if (existing) {
        throw new ConflictException(`Setting with key '${updateSettingDto.key}' already exists`);
      }
    }

    const data: Prisma.SettingUpdateInput = { ...updateSettingDto, updatedBy: userId };
    if (updateSettingDto.value !== undefined) {
      data.value = updateSettingDto.value;
    }

    const updatedSetting = await prisma.setting.update({
      where: { id },
      data,
    });

    this.logger.log(`Updated setting: ${updatedSetting.key}`);
    return updatedSetting;
  }

  async delete(id: string): Promise<boolean> {
    const setting = await this.findById(id);
    await prisma.setting.delete({ where: { id } });
    this.logger.log(`Deleted setting: ${setting.key}`);
    return true;
  }
}
