import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TimeEntryResponse {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() taskId!: string;
  @Expose() @ApiProperty() userId!: string;
  @Expose() @ApiProperty() duration!: number;
  @Expose() @ApiPropertyOptional() description?: string;
  @Expose() @ApiProperty() startTime!: Date;
  @Expose() @ApiPropertyOptional() endTime?: Date;
  @Expose() @ApiProperty() createdAt!: Date;
}

export class TimeEntrySummary {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() duration!: number;
  @Expose() @ApiProperty() startTime!: Date;
}
