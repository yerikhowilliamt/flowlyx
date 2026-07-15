import { Controller, Get, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { AuditLogResponse, AuditLogSummary } from '../../models/audit-log.model';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Serialize([AuditLogSummary])
  @Get()
  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of audit logs retrieved successfully' })
  findAll(@Query() query: FindAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }

  @Serialize(AuditLogResponse)
  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit log retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Audit log not found' })
  findById(@Param('id') id: string) {
    return this.auditLogsService.findById(id);
  }
}
