import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationMemberSummary } from './organization-member.model';
import { WorkspaceMemberSummary } from './workspace-member.model';
import { ProjectMemberSummary } from './project-member.model';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UserResponse {
  @ApiProperty({ description: 'User ID in UUID format' })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  emailVerified?: boolean | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  accessToken?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  refreshToken?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  avatarUrl?: string | null;

  @ApiProperty({ enum: Role })
  @Expose()
  role!: Role;

  @ApiProperty({ enum: UserStatus })
  @Expose()
  status!: UserStatus;

  @ApiProperty()
  @Expose()
  createdAt!: string;

  @ApiProperty()
  @Expose()
  updatedAt!: string;

  @ApiProperty({ name: 'organization_members', type: [OrganizationMemberSummary] })
  @Expose({ name: 'organization_members' })
  organizationMembers!: OrganizationMemberSummary[];

  @ApiProperty({ name: 'workspace_members', type: [WorkspaceMemberSummary] })
  @Expose({ name: 'workspace_members' })
  workspaceMembers!: WorkspaceMemberSummary[];

  @ApiProperty({ name: 'project_members', type: [ProjectMemberSummary] })
  @Expose({ name: 'project_members' })
  projectMembers!: ProjectMemberSummary[];
}

export class UserSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  avatarUrl?: string | null;

  @ApiProperty({ enum: Role })
  @Expose()
  role!: Role;

  @ApiProperty({ enum: UserStatus })
  @Expose()
  status!: UserStatus;
}
