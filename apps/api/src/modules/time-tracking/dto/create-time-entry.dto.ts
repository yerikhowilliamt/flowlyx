import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createTimeEntrySchema = z.object({
  taskId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z
    .string()
    .datetime()
    .optional()
    .describe('The end time of the time entry (if logging manual past entry)'),
  description: z.string().optional(),
});

export class CreateTimeEntryDto extends createZodDto(createTimeEntrySchema) {}
