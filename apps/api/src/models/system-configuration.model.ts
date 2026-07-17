import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SystemConfigurationType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export class SystemConfigurationResponse {
  @ApiProperty({ description: 'Configuration ID in UUID format' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Unique configuration key' })
  @Expose()
  key!: string;

  @ApiProperty({
    description: 'Configuration value (can be of various types depending on type field)',
  })
  @Expose()
  value!: unknown;

  @ApiProperty({
    enum: SystemConfigurationType,
    description: 'Data type of the configuration value',
  })
  @Expose()
  type!: SystemConfigurationType;

  @ApiPropertyOptional({ description: 'Description of the configuration' })
  @Expose()
  description?: string | null;

  @ApiProperty({ description: 'Indicates if the configuration is public' })
  @Expose({ name: 'is_public' })
  isPublic!: boolean;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ name: 'updated_at' })
  @Expose({ name: 'updated_at' })
  updatedAt!: Date;
}
