import { Injectable } from '@nestjs/common';
import { prisma, AuditLog, Prisma } from '@flowlyx/database';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsRepository {
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

  async findAll(query: FindAuditLogsDto): Promise<[AuditLog[], number]> {
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
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return [data, total];
  }

  async findById(id: string): Promise<AuditLog | null> {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
