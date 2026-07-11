import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createProjectMemberSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['MEMBER', 'ADMIN', 'VIEWER']).default('MEMBER'),
});

export class CreateProjectMemberDto extends createZodDto(createProjectMemberSchema) {}
