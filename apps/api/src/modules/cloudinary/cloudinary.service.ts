import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    this.logger.log(`Uploading file to Cloudinary: ${file.originalname}`);
    return new Promise((resolve, reject) => {
      const fileExtension = file.originalname.split('.').pop() || '';
      const fileNameWithoutExt = file.originalname.includes('.')
        ? file.originalname.substring(0, file.originalname.lastIndexOf('.'))
        : file.originalname;
      const cleanFileName = fileNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
      const publicId = `${cleanFileName}_${Date.now()}`;

      const options = {
        folder: folder || 'flowlyx/task-attachments',
        resource_type: 'auto' as const,
      };

      const isImage = file.mimetype?.startsWith('image/');
      const isVideo = file.mimetype?.startsWith('video/');
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

      if (!isImage && !isVideo && !isPdf) {
        options.resource_type = 'raw';
        options.public_id = `${publicId}.${fileExtension}`;
      } else {
        options.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            this.logger.error(`Failed to upload file to Cloudinary`, error.stack);
            return reject(error);
          }
          this.logger.log(`File uploaded successfully: ${result?.url}`);
          resolve(result as UploadApiResponse);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  deleteFile(publicId: string): Promise<unknown> {
    this.logger.log(`Deleting file from Cloudinary: ${publicId}`);
    return cloudinary.uploader.destroy(publicId);
  }
}
