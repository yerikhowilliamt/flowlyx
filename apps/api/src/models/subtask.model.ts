import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubtaskResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'task_id' })
  @Expose({ name: 'task_id' })
  taskId!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty({ name: 'is_completed' })
  @Expose({ name: 'is_completed' })
  isCompleted!: boolean;

  @ApiProperty()
  @Expose()
  order!: number;

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

export class SubtaskSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'task_id' })
  @Expose({ name: 'task_id' })
  taskId!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty({ name: 'is_completed' })
  @Expose({ name: 'is_completed' })
  isCompleted!: boolean;

  @ApiProperty()
  @Expose()
  order!: number;

  @ApiProperty()
  @Expose()
  status!: string;
}
