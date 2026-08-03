import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService, ActivityWithUser } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { FindActivitiesDto } from './dto/find-activities.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { ActivityResponse } from '../../models/activity.model';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Serialize(ActivityResponse)
  @Post()
  @ApiOperation({ summary: 'Create a new activity log' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Activity created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createActivityDto: CreateActivityDto): Promise<ActivityWithUser> {
    return this.activitiesService.create(createActivityDto);
  }

  @Serialize(ActivityResponse)
  @Get('entity/:entityId')
  @ApiOperation({ summary: 'Get activities by entity ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of activities retrieved successfully' })
  findByEntityId(
    @Param('entityId') entityId: string,
    @Query() query: FindActivitiesDto,
  ): Promise<unknown> {
    return this.activitiesService.findByEntityId(entityId, query);
  }

  @Serialize(ActivityResponse)
  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Activity retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Activity not found' })
  findById(@Param('id') id: string): Promise<ActivityWithUser> {
    return this.activitiesService.findById(id);
  }
}
