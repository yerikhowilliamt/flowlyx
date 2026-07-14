import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileEntity } from './entities/file.entity';

describe('StorageController', () => {
  let controller: StorageController;
  let storageService: jest.Mocked<StorageService>;

  beforeEach(async () => {
    const mockStorageService = {
      uploadFile: jest.fn(),
      getFileById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [{ provide: StorageService, useValue: mockStorageService }],
    }).compile();

    controller = module.get<StorageController>(StorageController);
    storageService = module.get(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should call storageService.uploadFile and return FileResponseDto', async () => {
      const mockReq = { user: { id: 'test-user-id' } };
      const mockFile = { originalname: 'test.png' } as Express.Multer.File;
      const dto: UploadFileDto = { workspaceId: 'workspace-1' };

      const mockResult = { id: 'file-1', fileUrl: 'http://url.com' } as FileEntity;
      storageService.uploadFile.mockResolvedValue(mockResult);

      const result = await controller.uploadFile(mockReq, mockFile, dto);

      expect(storageService.uploadFile).toHaveBeenCalledWith(mockFile, dto, 'test-user-id');
      expect(result.id).toEqual('file-1');
      expect(result.fileUrl).toEqual('http://url.com');
    });
  });
});
