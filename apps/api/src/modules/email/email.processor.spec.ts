import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let mockConfigService: jest.Mocked<Partial<ConfigService>>;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '12345' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'SMTP_FROM') return 'test@example.com';
        if (key === 'SMTP_HOST') return 'localhost';
        if (key === 'SMTP_PORT') return 1025;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handle', () => {
    it('should send email using nodemailer', async () => {
      const job = {
        id: 'job1',
        data: {
          to: 'recipient@example.com',
          subject: 'Test Subject',
          text: 'Hello World',
        },
      };

      const result = await processor.handle(
        job as unknown as import('bullmq').Job<
          import('./dto/send-email.dto').SendEmailDto,
          unknown,
          string
        >,
      );

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Hello World',
        html: undefined,
      });

      expect(result).toEqual({ success: true, messageId: '12345' });
    });
  });
});
