import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PaginationDto } from '../../core/pagination';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../rbac/enums/role.enum';
import { SuccessResponse } from '../../models/api.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { SettingResponse, SettingSummary } from '../../models/setting.model';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Serialize(SettingResponse)
  @Post()
  @ApiOperation({ summary: 'Create a new global setting (Admin only)' })
  @ApiResponse({ status: 201, description: 'Setting successfully created.' })
  @ApiResponse({ status: 409, description: 'Setting key already exists.' })
  create(@Body() createSettingDto: CreateSettingDto, @CurrentUser('id') userId: string) {
    return this.settingsService.create(createSettingDto, userId);
  }

  @Serialize([SettingSummary])
  @Get()
  @ApiOperation({ summary: 'Get all settings (Admin only)' })
  findAll(@Query() query: PaginationDto) {
    return this.settingsService.findAll(query, false);
  }

  @Serialize(SettingResponse)
  @Get('public')
  @ApiOperation({ summary: 'Get all public settings' })
  findPublic(@Query() query: PaginationDto) {
    return this.settingsService.findAll(query, true);
  }

  @Serialize(SettingResponse)
  @Get(':key')
  @ApiOperation({ summary: 'Get a setting by key (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return the setting.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Serialize(SettingResponse)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a setting (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateSettingDto: UpdateSettingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.settingsService.update(id, updateSettingDto, userId);
  }

  @Serialize(SuccessResponse)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a setting (Admin only)' })
  remove(@Param('id') id: string) {
    return this.settingsService.delete(id);
  }
}
