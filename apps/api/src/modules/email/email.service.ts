import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue) {}

  /**
   * Adds an email job to the queue.
   * @param data The email data to send
   */
  async sendEmail(data: SendEmailDto): Promise<void> {
    this.logger.log(
      `Adding email to queue for: ${Array.isArray(data.to) ? data.to.join(', ') : data.to}`,
    );

    // Add job to BullMQ queue
    await this.emailQueue.add('send', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
