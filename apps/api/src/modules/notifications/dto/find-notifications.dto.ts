import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const findNotificationsSchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(100).default(10)),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  isRead: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
});

export class FindNotificationsDto extends createZodDto(findNotificationsSchema) {}
