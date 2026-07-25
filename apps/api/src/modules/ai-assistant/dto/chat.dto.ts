import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.string().max(1000).optional(),
});

export class ChatDto extends createZodDto(chatSchema) {}

export class ChatResponseDto {
  @ApiProperty()
  reply!: string;

  @ApiProperty()
  model!: string;

  @ApiProperty()
  promptTokens!: number;

  @ApiProperty()
  completionTokens!: number;
}
