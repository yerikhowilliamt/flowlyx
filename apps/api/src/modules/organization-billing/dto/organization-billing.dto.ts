import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const organizationBillingResponseSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  currentPlan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED']),
  nextBillingDate: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export class OrganizationBillingResponseDto extends createZodDto(
  organizationBillingResponseSchema,
) {}

export const updatePlanRequestSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
});

export class UpdatePlanRequestDto extends createZodDto(updatePlanRequestSchema) {}
