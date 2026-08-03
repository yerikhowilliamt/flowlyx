import { createZodDto } from 'nestjs-zod';
import { createSettingSchema } from './create-setting.dto';

export class UpdateSettingDto extends createZodDto(createSettingSchema.partial()) {}
