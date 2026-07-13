import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string | null;

  @ApiPropertyOptional({ name: 'logo_url' })
  @Expose({ name: 'logo_url' })
  logoUrl?: string | null;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ name: 'updated_at' })
  @Expose({ name: 'updated_at' })
  updatedAt!: Date;

  @ApiPropertyOptional({ name: 'deleted_at' })
  @Expose({ name: 'deleted_at' })
  deletedAt?: Date | null;

  @ApiPropertyOptional({ name: 'created_by' })
  @Expose({ name: 'created_by' })
  createdBy?: string | null;

  @ApiPropertyOptional({ name: 'updated_by' })
  @Expose({ name: 'updated_by' })
  updatedBy?: string | null;
}

export class OrganizationSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  status!: string;
}
