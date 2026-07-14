import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
});

export class UpdateNotificationDto extends createZodDto(updateNotificationSchema) {}
