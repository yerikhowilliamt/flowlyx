import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
// Removed LoggerService import
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';

describe('SettingsService', () => {
  let service: SettingsService;
  let repository: jest.Mocked<SettingsRepository>;

  const mockSetting = {
    id: 'test-id',
    key: 'site_name',
    value: 'Flowlyx',
    type: 'STRING',
    group: 'GENERAL',
    description: null,
    isPublic: false,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: 'user-id',
    updatedBy: null,
  };

  const mockRepository = {
    create: jest.fn(),
    findByKey: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // removed logger mock

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService, { provide: SettingsRepository, useValue: mockRepository }],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    repository = module.get(SettingsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a setting successfully', async () => {
      repository.findByKey.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockSetting);

      const result = await service.create(
        { key: 'site_name', value: 'Flowlyx' } as unknown as CreateSettingDto,
        'user-id',
      );

      expect(result).toEqual(mockSetting);
      expect(repository.create).toHaveBeenCalledWith({
        key: 'site_name',
        value: 'Flowlyx',
        createdBy: 'user-id',
      });
    });

    it('should throw ConflictException if setting key already exists', async () => {
      repository.findByKey.mockResolvedValue(mockSetting);

      await expect(
        service.create(
          { key: 'site_name', value: 'New' } as unknown as CreateSettingDto,
          'user-id',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByKey', () => {
    it('should return a setting', async () => {
      repository.findByKey.mockResolvedValue(mockSetting);

      const result = await service.findByKey('site_name');
      expect(result).toEqual(mockSetting);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findByKey.mockResolvedValue(null);

      await expect(service.findByKey('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
