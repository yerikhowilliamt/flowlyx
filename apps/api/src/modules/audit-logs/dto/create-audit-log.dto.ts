import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createAuditLogSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional().describe('Additional details in JSON format'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export class CreateAuditLogDto extends createZodDto(createAuditLogSchema) {}
