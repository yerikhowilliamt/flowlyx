import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashedpassword',
  isEmailVerified: false,
  role: 'USER',
  status: 'ACTIVE',
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const mockUsersRepository = {
  create: jest.fn().mockResolvedValue(mockUser),
  findAll: jest.fn().mockResolvedValue([mockUser]),
  findByEmail: jest.fn().mockResolvedValue(mockUser),
  findById: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue({ ...mockUser, status: 'INACTIVE' }),
  delete: jest.fn().mockResolvedValue(true),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        passwordHash: 'hashedpassword',
      };
      const result = await service.create(dto);
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const result = await service.findById('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const result = await service.update('1', { status: 'INACTIVE' });
      expect(result.status).toEqual('INACTIVE');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce(null);
      await expect(service.update('2', { status: 'INACTIVE' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const result = await service.delete('1');
      expect(result).toEqual(true);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce(null);
      await expect(service.delete('2')).rejects.toThrow(NotFoundException);
    });
  });
});
