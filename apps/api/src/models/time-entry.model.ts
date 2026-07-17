import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimeEntryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() taskId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() duration!: number;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() date!: Date;
  @ApiProperty() createdAt!: Date;
}

export class TimeEntrySummary {
  @ApiProperty() id!: string;
  @ApiProperty() duration!: number;
  @ApiProperty() date!: Date;
}
