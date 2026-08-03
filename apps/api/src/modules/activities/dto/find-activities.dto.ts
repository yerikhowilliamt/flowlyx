import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const findActivitiesSchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(100).default(10)),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
});

export class FindActivitiesDto extends createZodDto(findActivitiesSchema) {}
