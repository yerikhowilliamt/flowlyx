import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { StorageRepository } from './storage.repository';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [StorageController],
  providers: [StorageService, StorageRepository],
  exports: [StorageService],
})
export class StorageModule {}
