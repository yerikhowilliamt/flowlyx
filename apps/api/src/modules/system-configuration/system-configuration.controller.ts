import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SystemConfigurationService } from './system-configuration.service';
import { CreateSystemConfigurationDto } from './dto/create-system-configuration.dto';
import { UpdateSystemConfigurationDto } from './dto/update-system-configuration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { SystemConfigurationResponse } from '../../models/system-configuration.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { Role } from '../rbac/enums/role.enum';
import { PaginationDto } from '../../core/pagination';

@ApiTags('System Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-configurations')
export class SystemConfigurationController {
  constructor(private readonly systemConfigurationService: SystemConfigurationService) {}

  @ApiOperation({ summary: 'Create a new system configuration' })
  @ApiCreatedResponse({ type: SystemConfigurationResponse })
  @Serialize(SystemConfigurationResponse)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  async create(@Body() createDto: CreateSystemConfigurationDto) {
    return this.systemConfigurationService.create(createDto);
  }

  @ApiOperation({ summary: 'List all system configurations' })
  @ApiOkResponse({ type: [SystemConfigurationResponse] })
  @Serialize([SystemConfigurationResponse])
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.systemConfigurationService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a system configuration by key' })
  @ApiOkResponse({ type: SystemConfigurationResponse })
  @Serialize(SystemConfigurationResponse)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':key')
  async findOne(@Param('key') key: string) {
    return this.systemConfigurationService.findByKey(key);
  }

  @ApiOperation({ summary: 'Update a system configuration by key' })
  @ApiOkResponse({ type: SystemConfigurationResponse })
  @Serialize(SystemConfigurationResponse)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':key')
  async update(@Param('key') key: string, @Body() updateDto: UpdateSystemConfigurationDto) {
    return this.systemConfigurationService.update(key, updateDto);
  }

  @ApiOperation({ summary: 'Delete a system configuration by key' })
  @Roles(Role.SUPER_ADMIN)
  @Delete(':key')
  async remove(@Param('key') key: string) {
    await this.systemConfigurationService.delete(key);
    return { success: true };
  }
}
