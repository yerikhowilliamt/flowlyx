import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskAssignmentSummary {
  @ApiProperty({ name: 'task_id' })
  @Expose({ name: 'task_id' })
  taskId!: string;

  @ApiProperty({ name: 'user_id' })
  @Expose({ name: 'user_id' })
  userId!: string;
}

export class TaskAssignmentResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'task_id' })
  @Expose({ name: 'task_id' })
  taskId!: string;

  @ApiProperty({ name: 'user_id' })
  @Expose({ name: 'user_id' })
  userId!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ name: 'created_by', required: false })
  @Expose({ name: 'created_by' })
  createdBy?: string | null;
}
