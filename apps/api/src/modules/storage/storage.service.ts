import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { prisma } from '@flowlyx/database';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileEntity } from './entities/file.entity';
import { requestContext } from '../../core/middleware/request-context.middleware';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    userId: string,
  ): Promise<FileEntity> {
    const store = requestContext.getStore();
    const correlationId = store?.get('correlationId') || 'unknown';
    this.logger.log(
      `[${correlationId}] Uploading file for workspace ${dto.workspaceId} by user ${userId}`,
    );

    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // 1. Upload to Cloudinary
      const folder = `flowlyx/workspaces/${dto.workspaceId}/files`;
      const uploadResult = await this.cloudinaryService.uploadFile(file, folder);

      // 2. Save to Database
      const fileRecord = (await prisma.file.create({
        data: {
          workspaceId: dto.workspaceId,
          projectId: dto.projectId,
          uploaderId: userId,
          originalName: file.originalname,
          fileUrl: uploadResult.secure_url,
          fileSize: file.size,
          fileType: file.mimetype,
          createdBy: userId,
        },
      })) as unknown as FileEntity;

      this.logger.log(
        `[${correlationId}] File successfully uploaded and saved with ID ${fileRecord.id}`,
      );
      return fileRecord;
    } catch (error) {
      this.logger.error(
        `[${correlationId}] Failed to upload file`,
        error instanceof Error ? error.stack : 'Unknown error',
      );
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getFileById(id: string): Promise<FileEntity | null> {
    return prisma.file.findUnique({ where: { id } }) as unknown as FileEntity;
  }
}
