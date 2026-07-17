import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponse {
  @ApiProperty() id!: string;
  @ApiProperty() type!: string;
  @ApiProperty() title!: string;
  @ApiProperty() message!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() read!: boolean;
  @ApiPropertyOptional() link?: string;
  @ApiProperty() createdAt!: Date;
}

export class NotificationSummary {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() read!: boolean;
  @ApiProperty() createdAt!: Date;
}
