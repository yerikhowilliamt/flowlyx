import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ReleaseCandidateService } from './release-candidate.service';
import { ReleaseInfoDto } from './dto/release-info.dto';

@ApiTags('release-candidate')
@Controller('release-candidate')
export class ReleaseCandidateController {
  private readonly logger = new Logger(ReleaseCandidateController.name);

  constructor(private readonly releaseCandidateService: ReleaseCandidateService) {}

  @Get('version')
  @ApiOperation({ summary: 'Get release candidate version' })
  @ApiOkResponse({ type: ReleaseInfoDto, description: 'Returns version info of Flowlyx' })
  getVersion(): ReleaseInfoDto {
    this.logger.log('Get version info requested');
    return this.releaseCandidateService.getVersionInfo();
  }
}
