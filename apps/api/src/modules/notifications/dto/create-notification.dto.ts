import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  COMMENT_MENTION = 'COMMENT_MENTION',
  SYSTEM = 'SYSTEM',
}

const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  type: z.nativeEnum(NotificationType).or(z.string()),
  referenceId: z.string().uuid().optional(),
  referenceType: z.string().optional(),
});

export class CreateNotificationDto extends createZodDto(createNotificationSchema) {}
