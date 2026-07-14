import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TimeEntryRepository } from '../repositories/time-entry.repository';
import { CreateTimeEntryDto } from '../dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from '../dto/update-time-entry.dto';

@Injectable()
export class TimeEntryService {
  constructor(private readonly timeEntryRepository: TimeEntryRepository) {}

  async create(userId: string, createDto: CreateTimeEntryDto) {
    // Check if there is already an active timer for this user
    if (!createDto.endTime) {
      const activeTimer = await this.timeEntryRepository.findActiveTimer(userId);
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

    return this.timeEntryRepository.create({
      userId,
      taskId: createDto.taskId,
      startTime: new Date(createDto.startTime),
      endTime: createDto.endTime ? new Date(createDto.endTime) : undefined,
      duration,
      description: createDto.description,
      createdBy: userId,
    });
  }

  async stopTimer(id: string, userId: string) {
    const timeEntry = await this.timeEntryRepository.findById(id);

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

    return this.timeEntryRepository.update(id, {
      endTime,
      duration,
      updatedBy: userId,
    });
  }

  async update(id: string, userId: string, updateDto: UpdateTimeEntryDto) {
    const timeEntry = await this.timeEntryRepository.findById(id);

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

    return this.timeEntryRepository.update(id, {
      startTime: newStartTime,
      endTime: newEndTime,
      duration,
      description: updateDto.description,
      updatedBy: userId,
    });
  }

  async delete(id: string) {
    const timeEntry = await this.timeEntryRepository.findById(id);

    if (!timeEntry || timeEntry.status === 'DELETED') {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return this.timeEntryRepository.delete(id);
  }

  async findByTaskId(taskId: string) {
    return this.timeEntryRepository.findByTaskId(taskId);
  }
}
