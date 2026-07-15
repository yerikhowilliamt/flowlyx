import { Module } from '@nestjs/common';
import { OrganizationBillingService } from './organization-billing.service';
import { OrganizationBillingController } from './organization-billing.controller';

@Module({
  controllers: [OrganizationBillingController],
  providers: [OrganizationBillingService],
  exports: [OrganizationBillingService],
})
export class OrganizationBillingModule {}
