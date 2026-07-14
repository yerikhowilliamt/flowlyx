import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'list_id' })
  @Expose({ name: 'list_id' })
  listId!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string | null;

  @ApiProperty()
  @Expose()
  order!: number;

  @ApiPropertyOptional({ name: 'priority_id' })
  @Expose({ name: 'priority_id' })
  priorityId?: string | null;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiPropertyOptional({ name: 'start_date' })
  @Expose({ name: 'start_date' })
  startDate?: Date | null;

  @ApiPropertyOptional({ name: 'due_date' })
  @Expose({ name: 'due_date' })
  dueDate?: Date | null;

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

export class TaskSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'list_id' })
  @Expose({ name: 'list_id' })
  listId!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  order!: number;

  @ApiPropertyOptional({ name: 'priority_id' })
  @Expose({ name: 'priority_id' })
  priorityId?: string | null;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiPropertyOptional({ name: 'start_date' })
  @Expose({ name: 'start_date' })
  startDate?: Date | null;

  @ApiPropertyOptional({ name: 'due_date' })
  @Expose({ name: 'due_date' })
  dueDate?: Date | null;
}
