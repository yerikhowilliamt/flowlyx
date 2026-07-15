import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  OrganizationBillingResponseDto,
  UpdatePlanRequestDto,
} from './dto/organization-billing.dto';

@Injectable()
export class OrganizationBillingService {
  /**
   * Retrieves placeholder billing information for an organization.
   * In the future, this will fetch from the database or payment gateway.
   */
  getBillingInfo(organizationId: string): OrganizationBillingResponseDto {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Mock data based on DTO
    return {
      id: randomUUID(),
      organizationId,
      currentPlan: 'FREE',
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      nextBillingDate: nextMonth.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  /**
   * Updates placeholder billing plan for an organization.
   * In the future, this will update the database and payment gateway.
   */
  updatePlan(
    organizationId: string,
    updatePlanRequestDto: UpdatePlanRequestDto,
  ): OrganizationBillingResponseDto {
    const now = new Date();
    const nextDate = new Date(now);
    if (updatePlanRequestDto.billingCycle === 'MONTHLY') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    // Mock data reflecting the updated plan
    return {
      id: randomUUID(),
      organizationId,
      currentPlan: updatePlanRequestDto.plan,
      billingCycle: updatePlanRequestDto.billingCycle,
      status: 'ACTIVE',
      nextBillingDate: nextDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }
}
