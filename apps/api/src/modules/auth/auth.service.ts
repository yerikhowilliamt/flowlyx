import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User, prisma } from '@flowlyx/database';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRATION') as never, // to satisfy string | number | undefined without using any
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    return this.usersService.create({ ...registerDto, passwordHash });
  }
}
