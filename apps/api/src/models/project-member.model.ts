import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectMemberSummary {
  @ApiProperty({ name: 'project_id' })
  @Expose({ name: 'project_id' })
  projectId!: string;

  @ApiProperty()
  @Expose()
  role!: string;
}

export class ProjectMemberResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ name: 'project_id' })
  @Expose({ name: 'project_id' })
  projectId!: string;

  @ApiProperty({ name: 'user_id' })
  @Expose({ name: 'user_id' })
  userId!: string;

  @ApiProperty()
  @Expose()
  role!: string;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ name: 'updated_at' })
  @Expose({ name: 'updated_at' })
  updatedAt!: Date;
}
