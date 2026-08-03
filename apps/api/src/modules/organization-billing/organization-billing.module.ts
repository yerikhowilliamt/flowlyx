import { Module } from '@nestjs/common';
import { OrganizationBillingService } from './organization-billing.service';
import {
  OrganizationBillingController,
  OrganizationBillingWebhookController,
} from './organization-billing.controller';

@Module({
  controllers: [OrganizationBillingController, OrganizationBillingWebhookController],
  providers: [OrganizationBillingService],
  exports: [OrganizationBillingService],
})
export class OrganizationBillingModule {}
