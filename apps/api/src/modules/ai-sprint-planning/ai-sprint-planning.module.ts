import { Module } from '@nestjs/common';
import { AiSprintPlanningService } from './ai-sprint-planning.service';
import { AiSprintPlanningController } from './ai-sprint-planning.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [AiSprintPlanningController],
  providers: [AiSprintPlanningService],
  exports: [AiSprintPlanningService],
})
export class AiSprintPlanningModule {}
