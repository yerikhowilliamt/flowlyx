import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@flowlyx/database';
import { TimeEntryService } from '../services/time-entry.service';
import { CreateTimeEntryDto } from '../dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from '../dto/update-time-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Time Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-entries')
export class TimeEntryController {
  constructor(private readonly timeEntryService: TimeEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new time entry or start a timer' })
  @ApiResponse({ status: 201, description: 'Time entry created successfully' })
  async create(@Req() req: Request & { user: User }, @Body() createDto: CreateTimeEntryDto) {
    return this.timeEntryService.create(req.user.id, createDto);
  }

  @Put(':id/stop')
  @ApiOperation({ summary: 'Stop an active timer' })
  @ApiResponse({ status: 200, description: 'Timer stopped successfully' })
  async stopTimer(@Req() req: Request & { user: User }, @Param('id') id: string) {
    return this.timeEntryService.stopTimer(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a time entry' })
  @ApiResponse({ status: 200, description: 'Time entry updated successfully' })
  async update(
    @Req() req: Request & { user: User },
    @Param('id') id: string,
    @Body() updateDto: UpdateTimeEntryDto,
  ) {
    return this.timeEntryService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a time entry' })
  @ApiResponse({ status: 200, description: 'Time entry deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.timeEntryService.delete(id);
  }

  @Get('tasks/:taskId')
  @ApiOperation({ summary: 'Get all time entries for a task' })
  @ApiResponse({ status: 200, description: 'Time entries retrieved successfully' })
  async findByTaskId(@Param('taskId') taskId: string) {
    return this.timeEntryService.findByTaskId(taskId);
  }
}
