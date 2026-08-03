import { Module } from '@nestjs/common';
import { AiProjectSummaryService } from './ai-project-summary.service';
import { AiProjectSummaryController } from './ai-project-summary.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [AiProjectSummaryController],
  providers: [AiProjectSummaryService],
  exports: [AiProjectSummaryService],
})
export class AiProjectSummaryModule {}
