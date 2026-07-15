import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsRepository } from './audit-logs.repository';
import { NotFoundException } from '@nestjs/common';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { AuditLog } from '@flowlyx/database';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let repository: AuditLogsRepository;

  const mockAuditLogsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: AuditLogsRepository,
          useValue: mockAuditLogsRepository,
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    repository = module.get<AuditLogsRepository>(AuditLogsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log', async () => {
      const dto = { action: 'CREATE', resourceType: 'TASK' };
      const expected = { id: '1', ...dto } as unknown as AuditLog;
      jest.spyOn(repository, 'create').mockResolvedValue(expected);

      expect(await service.create(dto as Parameters<typeof service.create>[0])).toBe(expected);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated result', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 } as FindAuditLogsDto);
      expect(result.meta.total).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return an audit log', async () => {
      const expected = { id: '1', action: 'CREATE' } as unknown as AuditLog;
      jest.spyOn(repository, 'findById').mockResolvedValue(expected);

      expect(await service.findById('1')).toBe(expected);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });
});
