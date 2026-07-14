import { Test, TestingModule } from '@nestjs/testing';
import { TaskAttachmentsController } from './task-attachments.controller';
import { TaskAttachmentsService } from './task-attachments.service';

describe('TaskAttachmentsController', () => {
  let controller: TaskAttachmentsController;
  let service: jest.Mocked<TaskAttachmentsService>;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  beforeEach(async () => {
    const mockService = {
      uploadAttachments: jest.fn(),
      updateAttachment: jest.fn(),
      getAttachments: jest.fn(),
      removeAttachment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskAttachmentsController],
      providers: [
        {
          provide: TaskAttachmentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaskAttachmentsController>(TaskAttachmentsController);
    service = module.get(TaskAttachmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadAttachments', () => {
    it('should upload attachments', async () => {
      const mockResult = [{ id: 'attachment1' }];
      service.uploadAttachments.mockResolvedValue(mockResult as never);

      const result = await controller.uploadAttachments('task1', { user: { id: 'user1' } }, [
        mockFile,
      ]);

      expect(service.uploadAttachments).toHaveBeenCalledWith('task1', 'user1', [mockFile]);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateAttachment', () => {
    it('should update an attachment', async () => {
      const mockResult = { id: 'attachment1' };
      service.updateAttachment.mockResolvedValue(mockResult as never);

      const result = await controller.updateAttachment(
        'task1',
        'attachment1',
        { user: { id: 'user1' } },
        mockFile,
      );

      expect(service.updateAttachment).toHaveBeenCalledWith(
        'task1',
        'attachment1',
        'user1',
        mockFile,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getAttachments', () => {
    it('should get attachments', async () => {
      const mockResult = [{ id: 'attachment1' }];
      service.getAttachments.mockResolvedValue(mockResult as never);

      const result = await controller.getAttachments('task1', { user: { id: 'user1' } });

      expect(service.getAttachments).toHaveBeenCalledWith('task1', 'user1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeAttachment', () => {
    it('should delete an attachment', async () => {
      service.removeAttachment.mockResolvedValue(true);

      const result = await controller.removeAttachment('task1', 'attachment1', {
        user: { id: 'user1' },
      });

      expect(service.removeAttachment).toHaveBeenCalledWith('task1', 'attachment1', 'user1');
      expect(result).toEqual(true);
    });
  });
});
