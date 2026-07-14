import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ description: 'The ID of the workspace this file belongs to' })
  @IsNotEmpty()
  @IsUUID()
  workspaceId!: string;

  @ApiPropertyOptional({ description: 'The ID of the project this file belongs to (optional)' })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
