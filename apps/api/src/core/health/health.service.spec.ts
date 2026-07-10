import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkLive', () => {
    it('should return UP status', () => {
      const result = service.checkLive();
      expect(result.status).toBe('UP');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('checkReady', () => {
    it('should return UP status', () => {
      const result = service.checkReady();
      expect(result.status).toBe('UP');
      expect(result.timestamp).toBeDefined();
    });
  });
});
