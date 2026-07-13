import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@flowlyx/database';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UserResponse, UserSummary } from '../../models/user.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { Role } from '../rbac/enums/role.enum';
import { PaginationDto } from '../../core/pagination';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserResponse })
  @Serialize(UserResponse)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ type: [UserSummary] })
  @Serialize([UserSummary])
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiOkResponse({ type: UserResponse })
  @Serialize(UserResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ type: UserResponse })
  @Serialize(UserResponse)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { success: true };
  }
}
