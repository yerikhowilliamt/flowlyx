import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { Response, Request } from 'express';
import { User } from '@flowlyx/database';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { UserResponse } from '../../models/user.model';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/core/config/env.validation';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService<EnvConfig>,
  ) {}

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
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.authService.login(user);

    res.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', { infer: true }) === 'production',
      sameSite: 'strict',
    });

    return {
      access_token: tokens.accessToken,
    };
  }

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request & { user: User }, @Res() res: Response) {
    const user = req.user;
    const tokens = await this.authService.login(user);

    res.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', { infer: true }) === 'production',
      sameSite: 'strict',
    });

    const frontendUrl =
      this.configService.get('AUTHORIZED_JAVASCRIPT_ORIGINS', { infer: true }) ||
      'http://localhost:3015';
    return res.redirect(`${frontendUrl}?access_token=${tokens.accessToken}`);
  }
}
