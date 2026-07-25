import { Module } from '@nestjs/common';
import { AiTaskGeneratorService } from './ai-task-generator.service';
import { AiTaskGeneratorController } from './ai-task-generator.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [AiTaskGeneratorController],
  providers: [AiTaskGeneratorService],
  exports: [AiTaskGeneratorService],
})
export class AiTaskGeneratorModule {}
