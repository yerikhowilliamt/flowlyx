/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashed',
  refreshToken: 'refresh',
  role: 'USER',
  status: 'ACTIVE',
};

const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([mockUser]),
  findById: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue({ ...mockUser, status: 'INACTIVE' }),
  delete: jest.fn().mockResolvedValue(true),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = { user: { id: '1' } } as any;
      const result = await controller.getProfile(req);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockResolvedValueOnce(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = { user: { id: '2' } } as any;
      await expect(controller.getProfile(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 } as any);
      expect((result as any).data || result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return user', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const result = await controller.update('1', {
        status: 'INACTIVE',
      } as unknown as UpdateUserDto);
      expect(result).toEqual({ ...mockUser, status: 'INACTIVE' });
    });
  });

  describe('remove', () => {
    it('should remove user and return success message', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ success: true });
    });
  });
});
