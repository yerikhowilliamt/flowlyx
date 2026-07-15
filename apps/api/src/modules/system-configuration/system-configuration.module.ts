import { Module } from '@nestjs/common';
import { SystemConfigurationController } from './system-configuration.controller';
import { SystemConfigurationService } from './system-configuration.service';

@Module({
  controllers: [SystemConfigurationController],
  providers: [SystemConfigurationService],
  exports: [SystemConfigurationService],
})
export class SystemConfigurationModule {}
