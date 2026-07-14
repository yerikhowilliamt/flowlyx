import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileEntity } from './entities/file.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a file to storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        workspaceId: {
          type: 'string',
          format: 'uuid',
        },
        projectId: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File successfully uploaded',
    type: FileEntity,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: Request & { user?: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<FileEntity> {
    if (!req.user) {
      throw new BadRequestException('User context is missing');
    }
    const userId = req.user.id;
    return this.storageService.uploadFile(file, uploadFileDto, userId);
  }
}
