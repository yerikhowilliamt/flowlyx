import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { SystemConfigurationType } from '../../../models/system-configuration.model';

const createSystemConfigurationSchema = z.object({
  key: z.string().min(1).describe('Unique configuration key'),
  value: z.any().describe('Configuration value'),
  type: z.nativeEnum(SystemConfigurationType).describe('Type of the value'),
  description: z.string().optional().describe('Configuration description'),
  isPublic: z.boolean().optional().describe('Is public'),
});

export class CreateSystemConfigurationDto extends createZodDto(createSystemConfigurationSchema) {}
