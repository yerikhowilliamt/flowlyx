import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const assignOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
  role: z.string().optional().default('MEMBER'),
});

export class AssignOrganizationDto extends createZodDto(assignOrganizationSchema) {}

const assignWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
  role: z.string().optional().default('MEMBER'),
});

export class AssignWorkspaceDto extends createZodDto(assignWorkspaceSchema) {}

const assignProjectSchema = z.object({
  projectId: z.string().uuid(),
  role: z.string().optional().default('MEMBER'),
});

export class AssignProjectDto extends createZodDto(assignProjectSchema) {}
