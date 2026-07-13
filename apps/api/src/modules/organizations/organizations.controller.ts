import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationRolesGuard } from '../rbac/guards/organization-roles.guard';
import { OrganizationRoles } from '../rbac/decorators/organization-roles.decorator';
import { OrganizationRole } from '../rbac/enums/organization-role.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { OrganizationResponse, OrganizationSummary } from '../../models/organization.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private readonly organizationsService: OrganizationsService) {}

  @ApiOperation({ summary: 'Create a new organization' })
  @ApiCreatedResponse({ type: OrganizationResponse })
  @Serialize(OrganizationResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    this.logger.log(`Creating organization: ${createOrganizationDto.slug}`);
    return this.organizationsService.create(createOrganizationDto);
  }

  @ApiOperation({ summary: 'List all organizations' })
  @ApiOkResponse({ type: [OrganizationSummary] })
  @Serialize([OrganizationSummary])
  @Get()
  async findAll() {
    this.logger.log('Fetching all organizations');
    return this.organizationsService.findAll();
  }

  @ApiOperation({ summary: 'Get an organization by ID' })
  @ApiOkResponse({ type: OrganizationResponse })
  @Serialize(OrganizationResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching organization with id: ${id}`);
    return this.organizationsService.findById(id);
  }

  @ApiOperation({ summary: 'Get an organization by slug' })
  @ApiOkResponse({ type: OrganizationResponse })
  @Serialize(OrganizationResponse)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    this.logger.log(`Fetching organization with slug: ${slug}`);
    return this.organizationsService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Update an organization' })
  @ApiOkResponse({ type: OrganizationResponse })
  @Serialize(OrganizationResponse)
  @Patch(':id')
  @UseGuards(OrganizationRolesGuard)
  @OrganizationRoles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    this.logger.log(`Updating organization with id: ${id}`);
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @UseGuards(OrganizationRolesGuard)
  @OrganizationRoles(OrganizationRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting organization with id: ${id}`);
    await this.organizationsService.remove(id);
  }
}
