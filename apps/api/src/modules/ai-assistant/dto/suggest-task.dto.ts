import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

const suggestTaskSchema = z.object({
  description: z.string().min(1).max(2000),
  projectContext: z.string().max(500).optional(),
});

export class SuggestTaskDto extends createZodDto(suggestTaskSchema) {}

export class SuggestTaskResponseDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  suggestedPriority!: string;

  @ApiProperty({ type: [String] })
  subtasks!: string[];
}
