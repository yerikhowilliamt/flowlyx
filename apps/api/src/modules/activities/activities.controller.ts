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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { FindActivitiesDto } from './dto/find-activities.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity log' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Activity created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(createActivityDto);
  }

  @Get('entity/:entityId')
  @ApiOperation({ summary: 'Get activities by entity ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of activities retrieved successfully' })
  findByEntityId(@Param('entityId') entityId: string, @Query() query: FindActivitiesDto) {
    return this.activitiesService.findByEntityId(entityId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Activity retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Activity not found' })
  findById(@Param('id') id: string) {
    return this.activitiesService.findById(id);
  }
}
