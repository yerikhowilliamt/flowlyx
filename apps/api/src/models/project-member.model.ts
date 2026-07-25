import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectMemberSummary {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  projectId!: string;

  @ApiProperty()
  @Expose()
  userId!: string;

  @ApiProperty()
  @Expose()
  role!: string;

  @ApiProperty()
  @Expose()
  status!: string;
}

export class ProjectMemberResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  projectId!: string;

  @ApiProperty()
  @Expose()
  userId!: string;

  @ApiProperty()
  @Expose()
  role!: string;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
