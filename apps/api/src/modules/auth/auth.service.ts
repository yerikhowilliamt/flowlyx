import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User, prisma } from '@flowlyx/database';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid Email or Password');

    if (user && user.passwordHash) {
      const isValid = await argon2.verify(user.passwordHash, pass);
      if (!isValid) throw new UnauthorizedException('Invalid Email or Password');
      if (isValid) return user;
    }

    return null;
  }

  async validateOAuthLogin(profile: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<User> {
    const user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      return prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
          isEmailVerified: true,
        },
      });
    }

    if (!user.googleId) {
      return prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId },
      });
    }

    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRATION') as never, // to satisfy string | number | undefined without using any
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION') as never, // to satisfy string | number | undefined without using any
    });

    // Optionally store the refresh token in the database
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const passwordHash = await argon2.hash(registerDto.password);
    const user = await this.usersService.create({ ...registerDto, passwordHash });
    
    // Generate simple verification token
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'verify-email' },
      { expiresIn: '24h', secret: this.configService.getOrThrow('JWT_SECRET') }
    );
    
    const verifyUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3015'}/verify-email?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; }
          .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .logo { margin-bottom: 24px; font-size: 24px; font-weight: bold; color: #f97316; }
          h1 { margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #fafafa; }
          p { margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #a1a1aa; }
          .button { display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; transition: background-color 0.2s; }
          .button:hover { background-color: #ea580c; }
          .footer { margin-top: 32px; font-size: 14px; color: #52525b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">Flowlyx</div>
            <h1>Welcome aboard!</h1>
            <p>You're almost ready to start tracking your projects. Please click the button below to verify your email address and activate your account.</p>
            <a href="${verifyUrl}" class="button">Verify Email Address</a>
          </div>
          <div class="footer">
            If you didn't create an account, you can safely ignore this email.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Verify your email for Flowlyx',
      text: `Welcome to Flowlyx! Please verify your email by clicking: ${verifyUrl}`,
      html: htmlContent,
    });
    
    return user;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
