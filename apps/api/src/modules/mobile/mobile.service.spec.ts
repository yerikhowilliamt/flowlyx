import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MobileService } from './mobile.service';

const USER_ID = 'usr-uuid-1111-1111-1111-111111111111';
const DEVICE_ID = 'device-abc-123';

const mockDevice = {
  id: 'dev-uuid-1111-1111-1111-111111111111',
  userId: USER_ID,
  deviceId: DEVICE_ID,
  platform: 'IOS',
  pushToken: 'token-xyz',
  appVersion: '1.0.0',
  status: 'ACTIVE',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: USER_ID,
  updatedBy: null,
};

jest.mock('@flowlyx/database', () => ({
  prisma: {
    mobileDevice: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '@flowlyx/database';

describe('MobileService', () => {
  let service: MobileService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MobileService],
    }).compile();
    service = module.get<MobileService>(MobileService);
  });

  describe('registerDevice()', () => {
    it('should upsert and return device', async () => {
      (prisma.mobileDevice.upsert as jest.Mock).mockResolvedValue(mockDevice);

      const result = await service.registerDevice(
        { deviceId: DEVICE_ID, platform: 'IOS', pushToken: 'token-xyz', appVersion: '1.0.0' },
        USER_ID,
      );

      expect(result).toEqual(mockDevice);
      expect(prisma.mobileDevice.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_deviceId: { userId: USER_ID, deviceId: DEVICE_ID } },
        }),
      );
    });
  });

  describe('revokeDevice()', () => {
    it('should soft-delete device', async () => {
      (prisma.mobileDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (prisma.mobileDevice.update as jest.Mock).mockResolvedValue({
        ...mockDevice,
        status: 'INACTIVE',
      });

      const result = await service.revokeDevice(DEVICE_ID, USER_ID);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException when device not found', async () => {
      (prisma.mobileDevice.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.revokeDevice(DEVICE_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when device already deleted', async () => {
      (prisma.mobileDevice.findUnique as jest.Mock).mockResolvedValue({
        ...mockDevice,
        deletedAt: new Date(),
      });

      await expect(service.revokeDevice(DEVICE_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMobileConfig()', () => {
    it('should return config object with required fields', () => {
      const config = service.getMobileConfig();
      expect(config).toHaveProperty('minVersion');
      expect(config).toHaveProperty('features');
      expect(config.features).toHaveProperty('pushNotifications');
    });
  });
});
