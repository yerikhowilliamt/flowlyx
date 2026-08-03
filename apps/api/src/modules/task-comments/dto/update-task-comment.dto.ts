import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateTaskCommentSchema = z.object({
  content: z.string().min(1).max(5000), // Markdown support
});

export class UpdateTaskCommentDto extends createZodDto(updateTaskCommentSchema) {}
