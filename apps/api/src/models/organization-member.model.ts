import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationMemberSummary {
  @ApiProperty({ name: 'organization_id' })
  @Expose({ name: 'organization_id' })
  organizationId!: string;

  @ApiProperty()
  @Expose()
  role!: string;
}

export class OrganizationMemberResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'organization_id' })
  @Expose({ name: 'organization_id' })
  organizationId!: string;

  @ApiProperty({ name: 'user_id' })
  @Expose({ name: 'user_id' })
  userId!: string;

  @ApiProperty()
  @Expose()
  role!: string;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ name: 'updated_at' })
  @Expose({ name: 'updated_at' })
  updatedAt!: Date;
}
