import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTimeEntryDto } from './create-time-entry.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateTimeEntryDto extends PartialType(CreateTimeEntryDto) {
  @ApiPropertyOptional({
    description: 'The end time to stop the timer',
    example: '2023-01-01T12:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Update description' })
  @IsOptional()
  @IsString()
  description?: string;
}
