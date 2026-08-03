import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { MobileService } from './mobile.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';

@ApiTags('Mobile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('devices')
  @ApiOperation({ summary: 'Register or update a mobile device push token' })
  @SwaggerResponse({ status: 201, description: 'Device registered' })
  async registerDevice(@Body() dto: RegisterDeviceDto, @CurrentUser() user: User): Promise<object> {
    const data = await this.mobileService.registerDevice(dto, user.id);
    return { success: true, message: 'Device registered', data };
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a mobile device push token' })
  @SwaggerResponse({ status: 200, description: 'Device revoked' })
  @SwaggerResponse({ status: 404, description: 'Device not found' })
  async revokeDevice(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: User,
  ): Promise<object> {
    const data = await this.mobileService.revokeDevice(deviceId, user.id);
    return { success: true, message: 'Device revoked', data };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get mobile app configuration' })
  @SwaggerResponse({ status: 200, description: 'Mobile config' })
  getConfig(): object {
    const data = this.mobileService.getMobileConfig();
    return { success: true, message: 'Mobile config retrieved', data };
  }

  @Get('health')
  @ApiOperation({ summary: 'Mobile API health check' })
  @SwaggerResponse({ status: 200, description: 'API is healthy' })
  @HttpCode(HttpStatus.OK)
  health(): object {
    return {
      success: true,
      message: 'Mobile API is healthy',
      data: { status: 'ok', timestamp: new Date().toISOString() },
    };
  }
}
