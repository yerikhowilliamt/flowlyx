import { ApiProperty } from '@nestjs/swagger';

export class TaskAttachmentResponse {
  @ApiProperty() id!: string;
  @ApiProperty() taskId!: string;
  @ApiProperty() fileUrl!: string;
  @ApiProperty() fileName!: string;
  @ApiProperty() fileSize!: number;
  @ApiProperty() fileType!: string;
  @ApiProperty() uploadedBy!: string;
  @ApiProperty() createdAt!: Date;
}

export class TaskAttachmentSummary {
  @ApiProperty() id!: string;
  @ApiProperty() fileName!: string;
  @ApiProperty() fileUrl!: string;
}
