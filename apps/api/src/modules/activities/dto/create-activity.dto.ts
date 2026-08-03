import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export enum ActivityAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ASSIGNED = 'ASSIGNED',
  UNASSIGNED = 'UNASSIGNED',
}

const createActivitySchema = z.object({
  entityId: z.string().uuid(),
  entityType: z.string(),
  userId: z.string().uuid(),
  action: z.nativeEnum(ActivityAction).or(z.string()),
  details: z.record(z.any()).optional(),
});

export class CreateActivityDto extends createZodDto(createActivitySchema) {}
