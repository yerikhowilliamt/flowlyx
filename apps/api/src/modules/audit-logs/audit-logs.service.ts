import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLog } from '@flowlyx/database';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { AuditLogsRepository } from './audit-logs.repository';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogsRepository.create(createAuditLogDto);
  }

  async findAll(query: FindAuditLogsDto) {
    const [data, total] = await this.auditLogsRepository.findAll(query);
    return createPaginatedResponse(data, total, query.page, query.limit);
  }

  async findById(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogsRepository.findById(id);
    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return auditLog;
  }
}
