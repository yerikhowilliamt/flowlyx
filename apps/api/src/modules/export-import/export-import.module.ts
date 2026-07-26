import { Module } from '@nestjs/common';
import { ExportImportController } from './controllers/export-import.controller';
import { ExportService } from './services/export.service';
import { ImportService } from './services/import.service';

@Module({
  imports: [],
  controllers: [ExportImportController],
  providers: [ExportService, ImportService],
})
export class ExportImportModule {}
