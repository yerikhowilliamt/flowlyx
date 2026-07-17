import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLog, prisma, Prisma } from '@flowlyx/database';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  async create(data: CreateAuditLogDto): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        workspaceId: data.workspaceId,
        organizationId: data.organizationId,
        projectId: data.projectId,
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details ? (data.details as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findAll(query: FindAuditLogsDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      action,
      userId,
      workspaceId,
      organizationId,
      projectId,
      resourceType,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      action,
      userId,
      workspaceId,
      organizationId,
      projectId,
      resourceType,
    };

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<AuditLog> {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return auditLog;
  }
}
