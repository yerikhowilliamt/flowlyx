import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReleaseCandidateService } from './release-candidate.service';

@ApiTags('release-candidate')
@Controller('release-candidate')
export class ReleaseCandidateController {
  private readonly logger = new Logger(ReleaseCandidateController.name);

  constructor(private readonly releaseCandidateService: ReleaseCandidateService) {}

  @Get('version')
  @ApiOperation({ summary: 'Get release candidate version' })
  getVersion() {
    this.logger.log('Get version info requested');
    return this.releaseCandidateService.getVersionInfo();
  }
}
