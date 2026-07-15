import { Injectable } from '@nestjs/common';
import { prisma, Setting, Prisma } from '@flowlyx/database';

@Injectable()
export class SettingsRepository {
  async create(data: Prisma.SettingCreateInput): Promise<Setting> {
    return prisma.setting.create({ data });
  }

  async findByKey(key: string): Promise<Setting | null> {
    return prisma.setting.findUnique({ where: { key } });
  }

  async findById(id: string): Promise<Setting | null> {
    return prisma.setting.findUnique({ where: { id } });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SettingWhereInput;
    orderBy?: Prisma.SettingOrderByWithRelationInput;
  }): Promise<[Setting[], number]> {
    const { skip, take, where, orderBy } = params;
    return Promise.all([
      prisma.setting.findMany({ skip, take, where, orderBy }),
      prisma.setting.count({ where }),
    ]);
  }

  async update(id: string, data: Prisma.SettingUpdateInput): Promise<Setting> {
    return prisma.setting.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Setting> {
    return prisma.setting.delete({ where: { id } });
  }
}
