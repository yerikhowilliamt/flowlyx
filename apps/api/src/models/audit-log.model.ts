import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponse {
  @ApiProperty() id!: string;
  @ApiProperty() action!: string;
  @ApiProperty() entityId!: string;
  @ApiProperty() entityType!: string;
  @ApiProperty() userId!: string;
  @ApiPropertyOptional() oldValues?: object;
  @ApiPropertyOptional() newValues?: object;
  @ApiProperty() createdAt!: Date;
}

export class AuditLogSummary {
  @ApiProperty() id!: string;
  @ApiProperty() action!: string;
  @ApiProperty() createdAt!: Date;
}
