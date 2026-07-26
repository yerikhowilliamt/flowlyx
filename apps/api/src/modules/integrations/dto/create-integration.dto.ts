import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const IntegrationProvider = z.enum(['SLACK', 'DISCORD', 'GITHUB']);

export const createIntegrationSchema = z.object({
  workspaceId: z.string().uuid(),
  provider: IntegrationProvider,
  name: z.string().min(1).max(100),
  webhookUrl: z.string().url().optional(),
  accessToken: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

export class CreateIntegrationDto extends createZodDto(createIntegrationSchema) {}
