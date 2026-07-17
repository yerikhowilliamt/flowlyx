import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { User } from '@flowlyx/database';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User> {
    const { id, emails, displayName, photos } = profile;

    if (!emails || emails.length === 0) {
      throw new UnauthorizedException('No email found from Google profile');
    }

    const user = {
      googleId: id,
      email: emails[0].value,
      name: displayName,
      avatarUrl: photos?.[0]?.value,
    };

    const validatedUser = await this.authService.validateOAuthLogin(user);
    return validatedUser;
  }
}
