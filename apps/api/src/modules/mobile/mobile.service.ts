import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class MobileService {
  private readonly logger = new Logger(MobileService.name);

  async registerDevice(dto: RegisterDeviceDto, userId: string) {
    this.logger.log({
      message: 'Registering mobile device',
      userId,
      platform: dto.platform,
      deviceId: dto.deviceId,
    });

    const device = await prisma.mobileDevice.upsert({
      where: { userId_deviceId: { userId, deviceId: dto.deviceId } },
      create: {
        userId,
        deviceId: dto.deviceId,
        platform: dto.platform,
        pushToken: dto.pushToken,
        appVersion: dto.appVersion,
        createdBy: userId,
      },
      update: {
        pushToken: dto.pushToken,
        appVersion: dto.appVersion,
        status: 'ACTIVE',
        deletedAt: null,
        updatedBy: userId,
      },
    });

    this.logger.log({ message: 'Mobile device registered', id: device.id, userId });
    return device;
  }

  async revokeDevice(deviceId: string, userId: string) {
    const device = await prisma.mobileDevice.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });

    if (!device || device.deletedAt) {
      throw new NotFoundException('Device not found');
    }

    this.logger.log({ message: 'Revoking mobile device', deviceId, userId });

    await prisma.mobileDevice.update({
      where: { userId_deviceId: { userId, deviceId } },
      data: { status: 'INACTIVE', deletedAt: new Date(), updatedBy: userId },
    });

    this.logger.log({ message: 'Mobile device revoked', deviceId, userId });
    return { success: true };
  }

  getMobileConfig() {
    return {
      minVersion: '1.0.0',
      features: {
        pushNotifications: true,
        offlineMode: false,
        darkMode: true,
      },
      supportUrl: 'https://flowlyx.com/support',
    };
  }
}
