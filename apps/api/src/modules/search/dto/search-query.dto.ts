import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const searchQuerySchema = z.object({
  q: z.string().optional().describe('The search keyword'),
  limit: z
    .preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(50).default(10))
    .describe('Limit results per entity (max 50)'),
});

export class SearchQueryDto extends createZodDto(searchQuerySchema) {}
