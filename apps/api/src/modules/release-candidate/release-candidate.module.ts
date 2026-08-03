import { Module } from '@nestjs/common';
import { ReleaseCandidateController } from './release-candidate.controller';
import { ReleaseCandidateService } from './release-candidate.service';

@Module({
  controllers: [ReleaseCandidateController],
  providers: [ReleaseCandidateService],
})
export class ReleaseCandidateModule {}
