import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createTaskAssignmentSchema = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
});

export class CreateTaskAssignmentDto extends createZodDto(createTaskAssignmentSchema) {}
