import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const generateProjectSummarySchema = z.object({
  projectId: z.string().uuid(),
  includeStats: z.boolean().optional().default(true),
  focusArea: z.enum(['progress', 'risks', 'blockers', 'all']).optional().default('all'),
});

export class GenerateProjectSummaryDto extends createZodDto(generateProjectSummarySchema) {}
