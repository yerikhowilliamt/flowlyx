import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TaskAttachmentResponse {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() taskId!: string;
  @ApiProperty() @Expose() fileUrl!: string;
  @ApiProperty() @Expose() fileName!: string;
  @ApiProperty() @Expose() fileSize!: number;
  @ApiProperty() @Expose() fileType!: string;
  @ApiProperty() @Expose() uploadedBy!: string;
  @ApiProperty() @Expose() createdAt!: Date;
}

export class TaskAttachmentSummary {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() fileName!: string;
  @ApiProperty() @Expose() fileUrl!: string;
}
