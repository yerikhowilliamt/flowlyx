import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const sendEmailSchema = z
  .object({
    to: z.union([z.string().email(), z.array(z.string().email())]),
    subject: z.string().min(1, 'Subject is required'),
    text: z.string().optional(),
    html: z.string().optional(),
  })
  .refine((data) => data.text || data.html, {
    message: 'Either text or html must be provided',
  });

export class SendEmailDto extends createZodDto(sendEmailSchema) {}
