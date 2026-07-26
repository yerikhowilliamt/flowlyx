import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const projectReportQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export class ProjectReportQueryDto extends createZodDto(projectReportQuerySchema) {}
