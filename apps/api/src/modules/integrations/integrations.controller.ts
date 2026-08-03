import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse as SwaggerResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new integration (Slack, Discord, GitHub)' })
  @SwaggerResponse({ status: 201, description: 'Integration created' })
  @SwaggerResponse({ status: 404, description: 'Workspace not found' })
  async create(@Body() dto: CreateIntegrationDto, @CurrentUser() user: User): Promise<object> {
    const data = await this.integrationsService.create(dto, user.id);
    return { success: true, message: 'Integration created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List integrations for a workspace' })
  @ApiQuery({ name: 'workspaceId', required: true, type: String })
  @SwaggerResponse({ status: 200, description: 'List of integrations' })
  async findAll(@Query('workspaceId', ParseUUIDPipe) workspaceId: string): Promise<object> {
    const data = await this.integrationsService.findAllByWorkspace(workspaceId);
    return { success: true, message: 'Integrations retrieved', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single integration by ID' })
  @SwaggerResponse({ status: 200, description: 'Integration details' })
  @SwaggerResponse({ status: 404, description: 'Integration not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<object> {
    const data = await this.integrationsService.findOne(id);
    return { success: true, message: 'Integration retrieved', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an integration' })
  @SwaggerResponse({ status: 200, description: 'Integration updated' })
  @SwaggerResponse({ status: 404, description: 'Integration not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntegrationDto,
    @CurrentUser() user: User,
  ): Promise<object> {
    const data = await this.integrationsService.update(id, dto, user.id);
    return { success: true, message: 'Integration updated', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete (soft-delete) an integration' })
  @SwaggerResponse({ status: 200, description: 'Integration deleted' })
  @SwaggerResponse({ status: 404, description: 'Integration not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<object> {
    const data = await this.integrationsService.remove(id, user.id);
    return { success: true, message: 'Integration deleted', data };
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test ping to the integration webhook' })
  @SwaggerResponse({ status: 200, description: 'Test ping result' })
  @SwaggerResponse({ status: 400, description: 'No webhook URL configured' })
  @SwaggerResponse({ status: 404, description: 'Integration not found' })
  async testPing(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<object> {
    const data = await this.integrationsService.testPing(id, user.id);
    return { success: true, message: 'Test ping sent', data };
  }
}
