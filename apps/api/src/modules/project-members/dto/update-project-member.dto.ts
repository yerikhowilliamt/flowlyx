import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateProjectMemberSchema = z.object({
  role: z.enum(['MEMBER', 'ADMIN', 'VIEWER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class UpdateProjectMemberDto extends createZodDto(updateProjectMemberSchema) {}
