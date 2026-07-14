import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const getCalendarSchema = z.object({
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export class GetCalendarDto extends createZodDto(getCalendarSchema) {}
