import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReleaseCandidateService {
  private readonly logger = new Logger(ReleaseCandidateService.name);

  getVersionInfo() {
    this.logger.log('Fetching version info for RC v1.0');
    return {
      version: '1.0.0-rc.1',
      status: 'production-ready',
      timestamp: new Date().toISOString(),
    };
  }
}
