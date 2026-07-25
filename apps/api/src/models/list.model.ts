import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ListResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'board_id' })
  @Expose({ name: 'board_id' })
  @Transform(({ obj }) => obj?.boardId || obj?.board_id)
  boardId!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  order!: number;

  @ApiPropertyOptional()
  @Expose()
  color?: string | null;

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

export class ListSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'board_id' })
  @Expose({ name: 'board_id' })
  @Transform(({ obj }) => obj?.boardId || obj?.board_id)
  boardId!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  order!: number;

  @ApiProperty()
  @Expose()
  status!: string;
}
