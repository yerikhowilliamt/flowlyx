import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('EmailService', () => {
  let service: EmailService;
  let mockQueue: jest.Mocked<Partial<import('bullmq').Queue>>;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken('email-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should add job to the queue', async () => {
      const data = {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Hello',
      };

      await service.sendEmail(data);

      expect(mockQueue.add).toHaveBeenCalledWith('send', data, expect.any(Object));
    });
  });
});
