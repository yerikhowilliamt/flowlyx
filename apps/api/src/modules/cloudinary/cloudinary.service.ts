import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    this.logger.log(`Uploading file to Cloudinary: ${file.originalname}`);
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'flowlyx/task-attachments',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Failed to upload file to Cloudinary`, error.stack);
            return reject(error);
          }
          this.logger.log(`File uploaded successfully: ${result?.url}`);
          resolve(result as UploadApiResponse);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  deleteFile(publicId: string): Promise<unknown> {
    this.logger.log(`Deleting file from Cloudinary: ${publicId}`);
    return cloudinary.uploader.destroy(publicId);
  }
}
