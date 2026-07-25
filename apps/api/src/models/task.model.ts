import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskAssignmentResponse } from './task-assignment.model';

export class TaskResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
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

  @ApiPropertyOptional()
  @Expose()
  @Transform(({ obj }) => obj?.priorityId || obj?.priority_id || null)
  priorityId?: string | null;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiPropertyOptional()
  @Expose()
  startDate?: Date | null;

  @ApiPropertyOptional()
  @Expose()
  dueDate?: Date | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;

  @ApiPropertyOptional()
  @Expose()
  deletedAt?: Date | null;

  @ApiPropertyOptional()
  @Expose()
  createdBy?: string | null;

  @ApiPropertyOptional()
  @Expose()
  updatedBy?: string | null;

  @ApiPropertyOptional({ type: () => [TaskAssignmentResponse] })
  @Expose()
  taskAssignments?: TaskAssignmentResponse[];
}

export class TaskSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  listId!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  order!: number;

  @ApiPropertyOptional()
  @Expose()
  @Transform(({ obj }) => obj?.priorityId || obj?.priority_id || null)
  priorityId?: string | null;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiPropertyOptional()
  @Expose()
  startDate?: Date | null;

  @ApiPropertyOptional()
  @Expose()
  dueDate?: Date | null;

  @ApiPropertyOptional({ type: () => [TaskAssignmentResponse] })
  @Expose()
  taskAssignments?: TaskAssignmentResponse[];
}
