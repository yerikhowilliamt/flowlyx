import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponse {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() type!: string;
  @Expose() @ApiProperty() title!: string;
  @Expose({ name: 'content' }) @ApiProperty() message!: string;
  @Expose({ name: 'userId' }) @ApiProperty() userId!: string;
  @Expose({ name: 'isRead' }) @ApiProperty() read!: boolean;
  @Expose() @ApiPropertyOptional() link?: string;
  @Expose({ name: 'referenceId' }) @ApiPropertyOptional() referenceId?: string | null;
  @Expose({ name: 'referenceType' }) @ApiPropertyOptional() referenceType?: string | null;
  @Expose({ name: 'status' }) @ApiProperty() status!: string;
  @Expose() @ApiProperty() createdAt!: Date;
}

export class NotificationSummary {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() title!: string;
  @Expose({ name: 'isRead' }) @ApiProperty() read!: boolean;
  @Expose() @ApiProperty() createdAt!: Date;
}
