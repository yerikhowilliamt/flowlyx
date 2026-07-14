import { Injectable, Logger } from '@nestjs/common';
import { prisma, Prisma } from '@flowlyx/database';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class StorageRepository {
  private readonly logger = new Logger(StorageRepository.name);

  async create(data: Prisma.FileUncheckedCreateInput): Promise<FileEntity> {
    this.logger.log(`Creating file record for workspace ${data.workspaceId}`);
    return prisma.file.create({
      data,
    }) as unknown as FileEntity;
  }

  async findById(id: string): Promise<FileEntity | null> {
    return prisma.file.findUnique({
      where: { id },
    }) as unknown as FileEntity;
  }

  async delete(id: string): Promise<FileEntity> {
    this.logger.log(`Deleting file record ${id}`);
    return prisma.file.delete({
      where: { id },
    }) as unknown as FileEntity;
  }
}
