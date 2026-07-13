/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return UP status', () => {
      const result = controller.checkHealth();
      expect(result.status).toBe('UP');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('checkLive', () => {
    it('should return UP status', () => {
      const result = controller.checkLive();
      expect(result.status).toBe('UP');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('checkReady', () => {
    it('should return UP status', () => {
      const result = controller.checkReady();
      expect(result.status).toBe('UP');
      expect(result.timestamp).toBeDefined();
    });
  });
});
