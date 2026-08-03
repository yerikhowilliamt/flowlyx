import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTaskAttachmentSchema = z.object({
  // Normally DTOs have properties, but for file upload,
  // the file itself is handled by interceptor.
  // We can just keep an empty DTO or remove it if not needed.
  // Let's keep it empty or maybe just a marker.
});

export class CreateTaskAttachmentDto extends createZodDto(CreateTaskAttachmentSchema) {}
