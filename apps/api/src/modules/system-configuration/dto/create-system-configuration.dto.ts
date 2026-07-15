import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { SystemConfigurationType } from '../../../models/system-configuration.model';

export class CreateSystemConfigurationDto {
  @ApiProperty({ description: 'Unique configuration key' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Configuration value' })
  @IsNotEmpty()
  value!: unknown;

  @ApiProperty({ enum: SystemConfigurationType, description: 'Type of the value' })
  @IsEnum(SystemConfigurationType)
  @IsNotEmpty()
  type!: SystemConfigurationType;

  @ApiPropertyOptional({ description: 'Configuration description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is public' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
