import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export const createSystemConfigSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .regex(
      /^[A-Z0-9_]+$/,
      'Key must be uppercase alphanumeric with underscores (e.g. MAX_LOGIN_ATTEMPTS)',
    ),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  type: z.string().optional(),
});

export type CreateSystemConfigSchema = z.infer<typeof createSystemConfigSchema>;

export const updateSystemConfigSchema = z.object({
  value: z.string().min(1, 'Value is required').optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});

export type UpdateSystemConfigSchema = z.infer<typeof updateSystemConfigSchema>;
