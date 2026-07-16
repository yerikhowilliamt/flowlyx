import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTimeEntryDto } from '../dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from '../dto/update-time-entry.dto';
import { prisma } from '@flowlyx/database';

@Injectable()
export class TimeEntryService {
  async create(userId: string, createDto: CreateTimeEntryDto) {
    if (!createDto.endTime) {
      const activeTimer = await prisma.timeEntry.findFirst({
        where: { userId, endTime: null, status: 'ACTIVE' },
      });
      if (activeTimer) {
        throw new BadRequestException('You already have an active timer. Please stop it first.');
      }
    }

    let duration: number | undefined = undefined;
    if (createDto.endTime) {
      const start = new Date(createDto.startTime).getTime();
      const end = new Date(createDto.endTime).getTime();
      if (end < start) {
        throw new BadRequestException('End time cannot be before start time');
      }
      duration = Math.floor((end - start) / 1000);
    }

    return prisma.timeEntry.create({
      data: {
        userId,
        taskId: createDto.taskId,
        startTime: new Date(createDto.startTime),
        endTime: createDto.endTime ? new Date(createDto.endTime) : undefined,
        duration,
        description: createDto.description,
        createdBy: userId,
      },
    });
  }

  async stopTimer(id: string, userId: string) {
    const timeEntry = await prisma.timeEntry.findUnique({ where: { id } });

    if (!timeEntry || timeEntry.status === 'DELETED') {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    if (timeEntry.userId !== userId) {
      throw new BadRequestException('You can only stop your own timer');
    }

    if (timeEntry.endTime) {
      throw new BadRequestException('Timer is already stopped');
    }

    const endTime = new Date();
    const startTime = new Date(timeEntry.startTime).getTime();
    const duration = Math.floor((endTime.getTime() - startTime) / 1000);

    return prisma.timeEntry.update({
      where: { id },
      data: {
        endTime,
        duration,
        updatedBy: userId,
      },
    });
  }

  async update(id: string, userId: string, updateDto: UpdateTimeEntryDto) {
    const timeEntry = await prisma.timeEntry.findUnique({ where: { id } });

    if (!timeEntry || timeEntry.status === 'DELETED') {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    let duration = timeEntry.duration;

    const newStartTime = updateDto.startTime ? new Date(updateDto.startTime) : timeEntry.startTime;
    const newEndTime = updateDto.endTime ? new Date(updateDto.endTime) : timeEntry.endTime;

    if (newEndTime) {
      if (newEndTime.getTime() < newStartTime.getTime()) {
        throw new BadRequestException('End time cannot be before start time');
      }
      duration = Math.floor((newEndTime.getTime() - newStartTime.getTime()) / 1000);
    }

    return prisma.timeEntry.update({
      where: { id },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        duration,
        description: updateDto.description,
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const timeEntry = await prisma.timeEntry.findUnique({ where: { id } });

    if (!timeEntry || timeEntry.status === 'DELETED') {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return prisma.timeEntry.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() },
    });
  }

  async findByTaskId(taskId: string) {
    return prisma.timeEntry.findMany({
      where: { taskId, status: 'ACTIVE' },
      orderBy: { startTime: 'desc' },
    });
  }
}
