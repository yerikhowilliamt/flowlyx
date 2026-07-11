import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repository: OrganizationsRepository;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: OrganizationsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    repository = module.get<OrganizationsRepository>(OrganizationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      const dto = { name: 'Test', slug: 'test' };
      mockRepository.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto as unknown as CreateOrganizationDto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if slug exists', async () => {
      mockRepository.findBySlug.mockResolvedValue({ id: '1' });
      const dto = { name: 'Test', slug: 'test' };

      await expect(service.create(dto as unknown as CreateOrganizationDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return an organization', async () => {
      const org = { id: '1', name: 'Test' };
      mockRepository.findById.mockResolvedValue(org);

      const result = await service.findById('1');
      expect(result).toEqual(org);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });
});
