import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Update billing plan for an organization (Placeholder)' })
  @ApiParam({ name: 'organizationId', description: 'The ID of the organization' })
  @ApiResponse({
    status: 200,
    description: 'Plan successfully updated.',
    type: OrganizationBillingResponseDto,
  })
  updatePlan(
    @Param('organizationId') organizationId: string,
    @Body() updatePlanRequestDto: UpdatePlanRequestDto,
  ) {
    return this.organizationBillingService.updatePlan(organizationId, updatePlanRequestDto);
  }
}
