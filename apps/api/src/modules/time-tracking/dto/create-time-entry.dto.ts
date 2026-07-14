import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTimeEntryDto {
  @ApiProperty({
    description: 'The ID of the task to track time against',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  taskId!: string;

  @ApiProperty({ description: 'The start time of the time entry', example: '2023-01-01T10:00:00Z' })
  @IsDateString()
  startTime!: string;

  @ApiPropertyOptional({
    description: 'The end time of the time entry (if logging manual past entry)',
    example: '2023-01-01T11:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Optional description of what was worked on',
    example: 'Fixing bug XYZ',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
