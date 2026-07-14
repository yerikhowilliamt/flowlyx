import { Injectable } from '@nestjs/common';
import { prisma, TimeEntry, Prisma } from '@flowlyx/database';

@Injectable()
export class TimeEntryRepository {
  async create(data: Prisma.TimeEntryUncheckedCreateInput): Promise<TimeEntry> {
    return prisma.timeEntry.create({ data });
  }

  async findById(id: string): Promise<TimeEntry | null> {
    return prisma.timeEntry.findUnique({ where: { id } });
  }

  async findByTaskId(taskId: string): Promise<TimeEntry[]> {
    return prisma.timeEntry.findMany({
      where: { taskId, status: 'ACTIVE' },
      orderBy: { startTime: 'desc' },
    });
  }

  async update(id: string, data: Prisma.TimeEntryUpdateInput): Promise<TimeEntry> {
    return prisma.timeEntry.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<TimeEntry> {
    return prisma.timeEntry.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() },
    });
  }

  async findActiveTimer(userId: string): Promise<TimeEntry | null> {
    return prisma.timeEntry.findFirst({
      where: { userId, endTime: null, status: 'ACTIVE' },
    });
  }
}
