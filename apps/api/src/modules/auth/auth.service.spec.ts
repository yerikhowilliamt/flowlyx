import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@flowlyx/database';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2', () => ({
  verify: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(() => 'test-token'),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'secret';
        if (key === 'JWT_EXPIRATION') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
        if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
        return null;
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'secret';
        if (key === 'JWT_EXPIRATION') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
        if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
        throw new Error('Key not found');
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      await expect(service.validateUser('test@test.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = { id: '1', email: 'test@test.com', passwordHash: 'hashed' } as User;
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.validateUser('test@test.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user if password matches', async () => {
      const mockUser = { id: '1', email: 'test@test.com', passwordHash: 'hashed' } as User;
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens and update refresh token in db', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: 'USER' } as User;

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('1', 'refresh-token');
    });
  });

  describe('register', () => {
    it('should hash password and create a user', async () => {
      const dto = { name: 'Test', email: 'test@test.com', password: 'password123' };
      const mockCreatedUser = { id: '1', ...dto, passwordHash: 'hashed' } as unknown as User;

      jest.spyOn(usersService, 'create').mockResolvedValue(mockCreatedUser);

      const result = await service.register(dto);

      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(usersService.create).toHaveBeenCalledWith({ ...dto, passwordHash: 'hashed' });
      expect(result).toEqual(mockCreatedUser);
    });
  });
});
