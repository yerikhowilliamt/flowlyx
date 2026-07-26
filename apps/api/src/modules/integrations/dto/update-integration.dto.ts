import { createZodDto } from 'nestjs-zod';
import { createIntegrationSchema } from './create-integration.dto';

export class UpdateIntegrationDto extends createZodDto(
  createIntegrationSchema.partial().omit({ workspaceId: true }),
) {}
