import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { User } from '@flowlyx/database';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { UserResponse } from '../../models/user.model';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: UserResponse })
  @Post('register')
  @Serialize(UserResponse)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return user;
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'User successfully logged in, returning access token' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(req.user);

    res.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      access_token: tokens.accessToken,
    };
  }
}
