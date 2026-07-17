import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const uploadFileSchema = z.object({
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
});

export class UploadFileDto extends createZodDto(uploadFileSchema) {}
