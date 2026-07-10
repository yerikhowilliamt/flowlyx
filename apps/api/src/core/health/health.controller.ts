import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Standard health check' })
  checkHealth() {
    return this.healthService.checkLive();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  checkLive() {
    return this.healthService.checkLive();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  checkReady() {
    return this.healthService.checkReady();
  }
}
