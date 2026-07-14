import { Injectable, NotFoundException } from '@nestjs/common';
import { Activity } from '@flowlyx/database';
import { CreateActivityDto } from './dto/create-activity.dto';
import { FindActivitiesDto } from './dto/find-activities.dto';
import { ActivitiesRepository } from './activities.repository';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepository: ActivitiesRepository) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activitiesRepository.create(createActivityDto);
  }

  async findByEntityId(entityId: string, query: FindActivitiesDto) {
    const [data, total] = await this.activitiesRepository.findByEntityId(entityId, query);
    return createPaginatedResponse(data, total, query.page, query.limit);
  }

  async findById(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findById(id);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }
}
