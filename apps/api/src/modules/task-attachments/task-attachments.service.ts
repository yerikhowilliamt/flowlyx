import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { prisma, TaskAttachment } from '@flowlyx/database';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class TaskAttachmentsService {
  private readonly logger = new Logger(TaskAttachmentsService.name);
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  private async verifyAccess(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: {
              include: { project: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const projectId = task.list.board.projectId;
    const workspaceId = task.list.board.project.workspaceId;

    // Check project member
    const projectMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (projectMember) return task;

    // Check workspace member
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (workspaceMember) return task;

    throw new ForbiddenException('User is not a member of the project or workspace');
  }

  async uploadAttachments(
    taskId: string,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<TaskAttachment[]> {
    await this.verifyAccess(taskId, userId);

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const attachments: TaskAttachment[] = [];

    for (const file of files) {
      // Upload to Cloudinary
      let uploadResult: UploadApiResponse;
      try {
        uploadResult = (await this.cloudinaryService.uploadFile(file)) as UploadApiResponse;
      } catch {
        throw new BadRequestException(`Failed to upload file: ${file.originalname}`);
      }

      // Save attachment record in DB
      const attachment = await prisma.taskAttachment.create({
        data: {
          taskId,
          userId,
          fileName: file.originalname,
          fileUrl: uploadResult.secure_url,
          fileSize: file.size,
          fileType: file.mimetype,
          createdBy: userId,
        },
      });
      attachments.push(attachment);
    }

    return attachments;
  }

  async updateAttachment(
    taskId: string,
    attachmentId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<TaskAttachment> {
    await this.verifyAccess(taskId, userId);

    if (!file) {
      throw new BadRequestException('No file provided for update');
    }

    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.taskId !== taskId) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.userId !== userId) {
      throw new ForbiddenException('You can only update your own attachments');
    }

    // Delete old file from Cloudinary
    try {
      const publicId = attachment.fileUrl.split('/').pop()?.split('.')[0];
      await this.cloudinaryService.deleteFile(`flowlyx/task-attachments/${publicId}`);
    } catch (error) {
      this.logger.error('Failed to delete old file from Cloudinary', error);
    }

    // Upload new file to Cloudinary
    let uploadResult: UploadApiResponse;
    try {
      uploadResult = (await this.cloudinaryService.uploadFile(file)) as UploadApiResponse;
    } catch {
      throw new BadRequestException('Failed to upload new file');
    }

    // Update attachment record in DB
    return prisma.taskAttachment.update({
      where: { id: attachmentId },
      data: {
        fileName: file.originalname,
        fileUrl: uploadResult.secure_url,
        fileSize: file.size,
        fileType: file.mimetype,
        updatedBy: userId,
      },
    });
  }

  async getAttachments(taskId: string, userId: string): Promise<TaskAttachment[]> {
    await this.verifyAccess(taskId, userId);

    return prisma.taskAttachment.findMany({
      where: { taskId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeAttachment(taskId: string, attachmentId: string, userId: string): Promise<boolean> {
    await this.verifyAccess(taskId, userId);

    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.taskId !== taskId) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own attachments');
    }

    // Attempt to delete from cloudinary. The URL usually contains the public ID.
    // Example: https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg
    // publicId would be 'sample'
    // To properly delete, we need the public ID. We can extract it from the URL.
    try {
      const publicId = attachment.fileUrl.split('/').pop()?.split('.')[0];
      // Note: Cloudinary folders complicate this, if we use a specific folder it needs to be included in public ID.
      // E.g., 'flowlyx/task-attachments/' + publicId
      await this.cloudinaryService.deleteFile(`flowlyx/task-attachments/${publicId}`);
    } catch (error) {
      // Ignore cloudinary deletion error, we still want to remove from DB.
      this.logger.error('Failed to delete file from Cloudinary', error);
    }

    await prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });

    return true;
  }
}
