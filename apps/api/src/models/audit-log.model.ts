import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuditLogResponse {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() action!: string;
  @Expose() @ApiPropertyOptional() resourceType?: string;
  @Expose() @ApiPropertyOptional() resourceId?: string;
  @Expose() @ApiPropertyOptional() userId?: string;
  @Expose() @ApiPropertyOptional() details?: object;
  @Expose() @ApiPropertyOptional() ipAddress?: string;
  @Expose() @ApiPropertyOptional() userAgent?: string;
  @Expose() @ApiPropertyOptional() user?: { id: string; name: string; email: string };
  @Expose() @ApiProperty() createdAt!: Date;
}

export class AuditLogSummary {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() action!: string;
  @Expose() @ApiPropertyOptional() resourceType?: string;
  @Expose() @ApiPropertyOptional() resourceId?: string;
  @Expose() @ApiPropertyOptional() userId?: string;
  @Expose() @ApiPropertyOptional() details?: object;
  @Expose() @ApiPropertyOptional() ipAddress?: string;
  @Expose() @ApiPropertyOptional() userAgent?: string;
  @Expose() @ApiPropertyOptional() user?: { id: string; name: string; email: string };
  @Expose() @ApiProperty() createdAt!: Date;
}
