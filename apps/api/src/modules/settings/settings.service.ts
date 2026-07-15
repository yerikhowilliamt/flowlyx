import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsRepository } from './settings.repository';
import { Setting, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
// Removed LoggerService import

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly settingsRepository: SettingsRepository) {}

  async create(createSettingDto: CreateSettingDto, userId: string): Promise<Setting> {
    const existing = await this.settingsRepository.findByKey(createSettingDto.key);
    if (existing) {
      throw new ConflictException(`Setting with key '${createSettingDto.key}' already exists`);
    }

    const setting = await this.settingsRepository.create({
      ...createSettingDto,
      createdBy: userId,
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

    const [data, total] = await this.settingsRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return createPaginatedResponse(data, total, page, limit);
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingsRepository.findByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }
    return setting;
  }

  async findById(id: string): Promise<Setting> {
    const setting = await this.settingsRepository.findById(id);
    if (!setting) {
      throw new NotFoundException(`Setting with ID '${id}' not found`);
    }
    return setting;
  }

  async update(id: string, updateSettingDto: UpdateSettingDto, userId: string): Promise<Setting> {
    const setting = await this.findById(id);

    if (updateSettingDto.key && updateSettingDto.key !== setting.key) {
      const existing = await this.settingsRepository.findByKey(updateSettingDto.key);
      if (existing) {
        throw new ConflictException(`Setting with key '${updateSettingDto.key}' already exists`);
      }
    }

    const updatedSetting = await this.settingsRepository.update(id, {
      ...updateSettingDto,
      updatedBy: userId,
    });

    this.logger.log(`Updated setting: ${updatedSetting.key}`);
    return updatedSetting;
  }

  async delete(id: string): Promise<boolean> {
    const setting = await this.findById(id);
    await this.settingsRepository.delete(id);
    this.logger.log(`Deleted setting: ${setting.key}`);
    return true;
  }
}
