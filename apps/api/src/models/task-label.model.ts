import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskLabelSummary {
  @ApiProperty({ name: 'task_id' })
  @Expose({ name: 'task_id' })
  taskId!: string;

  @ApiProperty({ name: 'label_id' })
  @Expose({ name: 'label_id' })
  labelId!: string;
}

export class TaskLabelResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'task_id' })
  @Expose({ name: 'task_id' })
  taskId!: string;

  @ApiProperty({ name: 'label_id' })
  @Expose({ name: 'label_id' })
  labelId!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;
}
