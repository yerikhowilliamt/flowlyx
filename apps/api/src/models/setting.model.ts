import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingResponse {
  @ApiProperty() id!: string;
  @ApiProperty() key!: string;
  @ApiProperty() value!: string;
  @ApiProperty() type!: string;
  @ApiProperty() group!: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() isPublic!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class SettingSummary {
  @ApiProperty() id!: string;
  @ApiProperty() key!: string;
  @ApiProperty() type!: string;
  @ApiProperty() group!: string;
}
