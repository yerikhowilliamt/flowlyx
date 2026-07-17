import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskCommentResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'task_id' })
  @Expose({ name: 'task_id' })
  taskId!: string;

  @ApiProperty({ name: 'user_id' })
  @Expose({ name: 'user_id' })
  userId!: string;

  @ApiPropertyOptional({ name: 'parent_id' })
  @Expose({ name: 'parent_id' })
  parentId?: string | null;

  @ApiProperty()
  @Expose()
  content!: string;

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
}
