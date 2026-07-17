import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskAssignmentSummary {
  @ApiProperty()
  @Expose()
  taskId!: string;

  @ApiProperty()
  @Expose()
  userId!: string;
}

export class TaskAssignmentResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  taskId!: string;

  @ApiProperty()
  @Expose()
  userId!: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty({ required: false })
  @Expose()
  createdBy?: string | null;
}
