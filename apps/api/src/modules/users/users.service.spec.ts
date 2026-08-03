import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginationDto } from '../../core/pagination';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organizationMember: {
      findMany: jest.fn(),
    },
    workspaceMember: {
      findMany: jest.fn(),
    },
    projectMember: {
      findMany: jest.fn(),
    },
  },
}));

describe('UsersService', () => {
  let service: UsersService;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CloudinaryService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { name: 'T', email: 't@t.com', password: '1', passwordHash: 'hashed' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'T', email: 't@t.com', passwordHash: 'hashed' },
      });
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw ConflictException if email exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      await expect(
        service.create({ name: 'T', email: 't@t.com', password: '1', passwordHash: 'hashed' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query: PaginationDto = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };
      const users = [{ id: '1', name: 'U1' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(query);
      expect(result.data).toEqual(users);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findById / findByEmail', () => {
    it('should find by id', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      const result = await service.findById('1');
      expect(result).toEqual({ id: '1' });
    });

    it('should find by email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    it('should update user properties', async () => {
      const user = { id: '1', name: 'U1' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...user, name: 'U2' });

      const result = await service.update('1', { name: 'U2' }, { id: '2', role: 'SUPER_ADMIN' });
      expect(result.name).toBe('U2');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'U2' },
      });
    });

    it('should upload file and update avatarUrl if file is provided', async () => {
      const user = { id: '1', name: 'U1' };
      const file = { originalname: 'avatar.png' } as Express.Multer.File;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (cloudinaryService.uploadFile as jest.Mock).mockResolvedValue({
        url: 'http://cloudinary/avatar.png',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...user,
        avatarUrl: 'http://cloudinary/avatar.png',
      });

      await service.update('1', { name: 'U2' }, { id: '2', role: 'SUPER_ADMIN' }, file);
      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(file, 'flowlyx/avatars');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'U2', avatarUrl: 'http://cloudinary/avatar.png' },
      });
    });

    it('should throw NotFoundException on update if not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.update('1', {}, { id: '2', role: 'SUPER_ADMIN' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const user = { id: '1' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.user.delete as jest.Mock).mockResolvedValue(user);

      const result = await service.delete('1', { id: '2', role: 'SUPER_ADMIN' });
      expect(result).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException on delete if not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.delete('1', { id: '2', role: 'SUPER_ADMIN' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: '1', refreshToken: 'token' });
      const result = await service.updateRefreshToken('1', 'token');
      expect(result.refreshToken).toBe('token');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { refreshToken: 'token' },
      });
    });
  });
});
