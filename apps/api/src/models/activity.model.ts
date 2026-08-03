import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entityId!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional()
  details?: object;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class ActivitySummary {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  createdAt!: Date;
}
