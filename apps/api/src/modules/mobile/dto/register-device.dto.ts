import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const MobilePlatform = z.enum(['IOS', 'ANDROID']);

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1).max(255),
  platform: MobilePlatform,
  pushToken: z.string().min(1).max(512),
  appVersion: z.string().max(20).optional(),
});

export class RegisterDeviceDto extends createZodDto(registerDeviceSchema) {}
