import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const findAuditLogsSchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(100).default(10)),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  resourceType: z.string().optional(),
});

export class FindAuditLogsDto extends createZodDto(findAuditLogsSchema) {}
