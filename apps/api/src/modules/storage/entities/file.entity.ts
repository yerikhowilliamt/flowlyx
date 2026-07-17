import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileEntity {
  @ApiProperty({ description: 'The unique identifier of the file' })
  id!: string;

  @ApiProperty({ description: 'The ID of the workspace the file belongs to' })
  workspaceId!: string;

  @ApiPropertyOptional({ description: 'The ID of the project the file belongs to' })
  projectId?: string | null;

  @ApiProperty({ description: 'The ID of the user who uploaded the file' })
  uploaderId!: string;

  @ApiProperty({ description: 'The original name of the file' })
  originalName!: string;

  @ApiProperty({ description: 'The URL where the file is stored' })
  fileUrl!: string;

  @ApiProperty({ description: 'The size of the file in bytes' })
  fileSize!: number;

  @ApiProperty({ description: 'The MIME type of the file' })
  fileType!: string;

  @ApiProperty({ description: 'The status of the file record' })
  status!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}
