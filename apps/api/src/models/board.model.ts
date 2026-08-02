import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BoardResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'project_id' })
  @Expose({ name: 'project_id' })
  @Transform(({ obj }) => obj?.projectId || obj?.project_id)
  projectId!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string | null;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose({ name: 'created_at' })
  @Transform(({ obj }) => obj?.createdAt || obj?.created_at)
  createdAt!: Date;

  @ApiProperty({ name: 'updated_at' })
  @Expose({ name: 'updated_at' })
  @Transform(({ obj }) => obj?.updatedAt || obj?.updated_at)
  updatedAt!: Date;

  @ApiPropertyOptional({ name: 'deleted_at' })
  @Expose({ name: 'deleted_at' })
  @Transform(({ obj }) => obj?.deletedAt || obj?.deleted_at)
  deletedAt?: Date | null;

  @ApiPropertyOptional({ name: 'created_by' })
  @Expose({ name: 'created_by' })
  @Transform(({ obj }) => obj?.createdBy || obj?.created_by)
  createdBy?: string | null;

  @ApiPropertyOptional({ name: 'updated_by' })
  @Expose({ name: 'updated_by' })
  @Transform(({ obj }) => obj?.updatedBy || obj?.updated_by)
  updatedBy?: string | null;
}

export class BoardSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'project_id' })
  @Expose({ name: 'project_id' })
  @Transform(({ obj }) => obj?.projectId || obj?.project_id)
  projectId!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string | null;

  @ApiProperty()
  @Expose()
  status!: string;
}
