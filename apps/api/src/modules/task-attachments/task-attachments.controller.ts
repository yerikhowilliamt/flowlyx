import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskAttachmentsService } from './task-attachments.service';

@ApiTags('Task Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/attachments')
export class TaskAttachmentsController {
  constructor(private readonly taskAttachmentsService: TaskAttachmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a task attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Attachments uploaded successfully' })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadAttachments(
    @Param('taskId') taskId: string,
    @Request() req: { user: { id: string } },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.taskAttachmentsService.uploadAttachments(taskId, req.user.id, files);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Attachment updated successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async updateAttachment(
    @Param('taskId') taskId: string,
    @Param('id') attachmentId: string,
    @Request() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.taskAttachmentsService.updateAttachment(taskId, attachmentId, req.user.id, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attachments for a task' })
  @ApiResponse({ status: 200, description: 'Return all task attachments' })
  async getAttachments(@Param('taskId') taskId: string, @Request() req: { user: { id: string } }) {
    return this.taskAttachmentsService.getAttachments(taskId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async removeAttachment(
    @Param('taskId') taskId: string,
    @Param('id') attachmentId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.taskAttachmentsService.removeAttachment(taskId, attachmentId, req.user.id);
  }
}
