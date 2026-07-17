import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationBillingService } from './organization-billing.service';
import {
  OrganizationBillingResponseDto,
  UpdatePlanRequestDto,
} from './dto/organization-billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { Role } from '../rbac/enums/role.enum';

@ApiTags('Organization Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations/:organizationId/billing')
export class OrganizationBillingController {
  constructor(private readonly organizationBillingService: OrganizationBillingService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get billing information for an organization (Placeholder)' })
  @ApiParam({ name: 'organizationId', description: 'The ID of the organization' })
  @ApiResponse({
    status: 200,
    description: 'Return billing information.',
    type: OrganizationBillingResponseDto,
  })
  getBillingInfo(@Param('organizationId') organizationId: string) {
    return this.organizationBillingService.getBillingInfo(organizationId);
  }

  @Put('plan')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update billing plan for an organization (Midtrans)' })
  @ApiParam({ name: 'organizationId', description: 'The ID of the organization' })
  @ApiResponse({
    status: 200,
    description: 'Returns midtrans Snap token and redirect URL.',
  })
  updatePlan(
    @Param('organizationId') organizationId: string,
    @Body() updatePlanRequestDto: UpdatePlanRequestDto,
  ) {
    return this.organizationBillingService.updatePlan(organizationId, updatePlanRequestDto);
  }
}

@ApiTags('Organization Billing Webhook')
@Controller('billing')
export class OrganizationBillingWebhookController {
  constructor(private readonly organizationBillingService: OrganizationBillingService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Midtrans Webhook Callback' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
  handleWebhook(@Body() payload: any) {
    return this.organizationBillingService.handleWebhook(payload);
  }
}
