import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createTaskCommentSchema = z.object({
  taskId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  content: z.string().min(1).max(5000), // Markdown support
  mentions: z.array(z.string().uuid()).optional(),
});

export class CreateTaskCommentDto extends createZodDto(createTaskCommentSchema) {}
