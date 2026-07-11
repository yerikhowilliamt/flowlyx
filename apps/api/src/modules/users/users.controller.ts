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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@flowlyx/database';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'List all users' })
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, refreshToken, ...result } = user;
      return result;
    });
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'Update a user' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'Delete a user' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { success: true };
  }
}
