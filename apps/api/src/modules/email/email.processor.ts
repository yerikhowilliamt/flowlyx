import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { EnvConfig } from '../../core/config/env.validation';

import { BaseProcessor } from '../../core/base/base.processor';

@Processor('email-queue')
@Injectable()
export class EmailProcessor extends BaseProcessor {
  protected readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService<EnvConfig>) {
    super();
    this.defaultFrom = this.configService.get<string>('SMTP_FROM') as string;

    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<number>('SMTP_PORT') === 465, // true for 465, false for other ports
      auth: this.configService.get<string>('SMTP_USER')
        ? {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
          }
        : undefined,
    });
  }

  async handle(job: Job<SendEmailDto, unknown, string>): Promise<unknown> {
    const { to, subject, text, html } = job.data;

    const info = await this.transporter.sendMail({
      from: this.defaultFrom,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  }
}
