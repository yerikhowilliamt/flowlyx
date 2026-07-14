import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { prisma } from '@flowlyx/database';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    file: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('StorageService', () => {
  let service: StorageService;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  beforeEach(async () => {
    const mockCloudinaryService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, { provide: CloudinaryService, useValue: mockCloudinaryService }],
    }).compile();

    service = module.get<StorageService>(StorageService);
    cloudinaryService = module.get(CloudinaryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const dto: UploadFileDto = {
      workspaceId: 'workspace-1',
    };
    const mockFile = {
      originalname: 'test.png',
      size: 1024,
      mimetype: 'image/png',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        service.uploadFile(null as unknown as Express.Multer.File, dto, 'test-user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload file and save to db', async () => {
      cloudinaryService.uploadFile.mockResolvedValue({
        secure_url: 'http://cloudinary.com/test.png',
      } as unknown as import('cloudinary').UploadApiResponse);
      (prisma.file.create as jest.Mock).mockResolvedValue({ id: 'file-1' });

      const result = await service.uploadFile(mockFile, dto, 'test-user-id');

      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'flowlyx/workspaces/workspace-1/files',
      );
      expect(prisma.file.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            workspaceId: 'workspace-1',
            uploaderId: 'test-user-id',
            originalName: 'test.png',
            fileUrl: 'http://cloudinary.com/test.png',
            fileSize: 1024,
            fileType: 'image/png',
          }),
        }),
      );
      expect(result.id).toBe('file-1');
    });

    it('should throw InternalServerErrorException if cloudinary fails', async () => {
      cloudinaryService.uploadFile.mockRejectedValue(new Error('Cloudinary error'));

      await expect(service.uploadFile(mockFile, dto, 'test-user-id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
