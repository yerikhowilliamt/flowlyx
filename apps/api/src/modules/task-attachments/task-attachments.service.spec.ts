import { Test, TestingModule } from '@nestjs/testing';
import { TaskAttachmentsService } from './task-attachments.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { prisma } from '@flowlyx/database';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
    },
    projectMember: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
    },
    taskAttachment: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('TaskAttachmentsService', () => {
  let service: TaskAttachmentsService;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  beforeEach(async () => {
    const mockCloudinaryService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskAttachmentsService,
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<TaskAttachmentsService>(TaskAttachmentsService);
    cloudinaryService = module.get(CloudinaryService);
    jest.clearAllMocks();
  });

  describe('verifyAccess', () => {
    it('should throw NotFoundException if task not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service['verifyAccess']('task1', 'user1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not member of project or workspace', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: 'task1',
        list: { board: { projectId: 'project1', project: { workspaceId: 'workspace1' } } },
      });
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service['verifyAccess']('task1', 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('should return task if user is project member', async () => {
      const mockTask = {
        id: 'task1',
        list: { board: { projectId: 'project1', project: { workspaceId: 'workspace1' } } },
      };
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({ id: 'member1' });

      const result = await service['verifyAccess']('task1', 'user1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('uploadAttachments', () => {
    it('should throw BadRequestException if files are missing', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      await expect(
        service.uploadAttachments('task1', 'user1', undefined as unknown as Express.Multer.File[]),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload files and create records in db', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      cloudinaryService.uploadFile.mockResolvedValue({
        secure_url: 'http://test.com/img.jpg',
      } as unknown as UploadApiResponse);
      const mockDbAttachment = { id: 'attachment1', fileUrl: 'http://test.com/img.jpg' };
      (prisma.taskAttachment.create as jest.Mock).mockResolvedValue(mockDbAttachment);

      const result = await service.uploadAttachments('task1', 'user1', [mockFile]);

      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(prisma.taskAttachment.create).toHaveBeenCalled();
      expect(result).toEqual([mockDbAttachment]);
    });
  });

  describe('updateAttachment', () => {
    it('should throw NotFoundException if attachment not found', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      (prisma.taskAttachment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateAttachment('task1', 'attachment1', 'user1', mockFile),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      (prisma.taskAttachment.findUnique as jest.Mock).mockResolvedValue({
        id: 'attachment1',
        taskId: 'task1',
        userId: 'user2', // Not user1
      });

      await expect(
        service.updateAttachment('task1', 'attachment1', 'user1', mockFile),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update file in cloudinary and db', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      (prisma.taskAttachment.findUnique as jest.Mock).mockResolvedValue({
        id: 'attachment1',
        taskId: 'task1',
        userId: 'user1',
        fileUrl: 'http://res.cloudinary.com/demo/image/upload/v12345/sample.jpg',
      });
      cloudinaryService.deleteFile.mockResolvedValue(true);
      cloudinaryService.uploadFile.mockResolvedValue({
        secure_url: 'http://test.com/img2.jpg',
      } as unknown as UploadApiResponse);
      (prisma.taskAttachment.update as jest.Mock).mockResolvedValue({
        id: 'attachment1',
        fileUrl: 'http://test.com/img2.jpg',
      });

      const result = await service.updateAttachment('task1', 'attachment1', 'user1', mockFile);

      expect(cloudinaryService.deleteFile).toHaveBeenCalled();
      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(prisma.taskAttachment.update).toHaveBeenCalled();
      expect(result.fileUrl).toBe('http://test.com/img2.jpg');
    });
  });

  describe('getAttachments', () => {
    it('should return task attachments', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      const mockAttachments = [{ id: 'attachment1' }];
      (prisma.taskAttachment.findMany as jest.Mock).mockResolvedValue(mockAttachments);

      const result = await service.getAttachments('task1', 'user1');

      expect(prisma.taskAttachment.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task1', status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockAttachments);
    });
  });

  describe('removeAttachment', () => {
    it('should throw NotFoundException if attachment not found', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      (prisma.taskAttachment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.removeAttachment('task1', 'attachment1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not author', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      (prisma.taskAttachment.findUnique as jest.Mock).mockResolvedValue({
        id: 'attachment1',
        taskId: 'task1',
        userId: 'user2', // Not user1
      });

      await expect(service.removeAttachment('task1', 'attachment1', 'user1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should delete file from cloudinary and db', async () => {
      service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
      (prisma.taskAttachment.findUnique as jest.Mock).mockResolvedValue({
        id: 'attachment1',
        taskId: 'task1',
        userId: 'user1',
        fileUrl: 'http://res.cloudinary.com/demo/image/upload/v12345/sample.jpg',
      });
      cloudinaryService.deleteFile.mockResolvedValue(true);
      (prisma.taskAttachment.delete as jest.Mock).mockResolvedValue(true);

      const result = await service.removeAttachment('task1', 'attachment1', 'user1');

      expect(cloudinaryService.deleteFile).toHaveBeenCalled();
      expect(prisma.taskAttachment.delete).toHaveBeenCalledWith({ where: { id: 'attachment1' } });
      expect(result).toBe(true);
    });
  });
});
