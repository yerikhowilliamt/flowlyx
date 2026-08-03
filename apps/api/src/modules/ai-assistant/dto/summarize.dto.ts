import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

const summarizeSchema = z.object({
  content: z.string().min(1).max(8000),
});

export class SummarizeDto extends createZodDto(summarizeSchema) {}

export class SummarizeResponseDto {
  @ApiProperty()
  summary!: string;

  @ApiProperty()
  keyPoints!: string[];
}
