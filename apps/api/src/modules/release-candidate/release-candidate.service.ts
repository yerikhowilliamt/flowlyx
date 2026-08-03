import { Injectable, Logger } from '@nestjs/common';
import { ReleaseInfoDto } from './dto/release-info.dto';

@Injectable()
export class ReleaseCandidateService {
  private readonly logger = new Logger(ReleaseCandidateService.name);

  getVersionInfo(): ReleaseInfoDto {
    this.logger.log('Fetching version info for Release v1.0.0');
    return {
      version: '1.0.0',
      status: 'production-ready',
      timestamp: new Date().toISOString(),
    };
  }
}
