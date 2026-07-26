import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExportService } from '../services/export.service';
import { ImportService } from '../services/import.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from '../../rbac/guards/workspace-roles.guard';
import { WorkspaceRoles } from '../../rbac/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../../rbac/enums/workspace-role.enum';

@Controller('v1/workspaces/:workspaceId/export-import')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class ExportImportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly importService: ImportService,
  ) {}

  @Get('export')
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  async exportWorkspace(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Res() res: Response,
  ) {
    const data = await this.exportService.exportWorkspaceData(workspaceId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="workspace-${workspaceId}-export.json"`,
    );
    return res.send(data);
  }

  @Post('import')
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importWorkspace(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('File is required');
    }

    const fileContent = file.buffer.toString('utf-8');
    const data = JSON.parse(fileContent);

    return this.importService.importWorkspaceData(workspaceId, data);
  }
}
