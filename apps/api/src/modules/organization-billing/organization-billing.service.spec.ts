import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationBillingService } from './organization-billing.service';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@flowlyx/database';
import { NotFoundException, BadRequestException } from '@nestjs/common';

jest.mock('@flowlyx/database', () => ({
  prisma: {
    organizationSubscription: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    paymentTransaction: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('midtrans-client', () => ({
  Snap: jest.fn().mockImplementation(() => ({
    createTransaction: jest.fn().mockResolvedValue({
      token: 'mock_token',
      redirect_url: 'http://mock.redirect.url',
    }),
  })),
}));

describe('OrganizationBillingService', () => {
  let service: OrganizationBillingService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'MIDTRANS_SERVER_KEY') return 'server_key';
        if (key === 'MIDTRANS_CLIENT_KEY') return 'client_key';
        if (key === 'MIDTRANS_IS_PRODUCTION') return 'false';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationBillingService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OrganizationBillingService>(OrganizationBillingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBillingInfo', () => {
    it('should throw NotFoundException if subscription not found', async () => {
      (prisma.organizationSubscription.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getBillingInfo('org1')).rejects.toThrow(NotFoundException);
    });

    it('should return subscription if found', async () => {
      const mockSub = { id: '1', organizationId: 'org1', plan: 'PRO' };
      (prisma.organizationSubscription.findUnique as jest.Mock).mockResolvedValue(mockSub);

      const result = await service.getBillingInfo('org1');
      expect(result).toEqual(mockSub);
    });
  });

  describe('updatePlan', () => {
    it('should throw BadRequestException if plan is FREE', async () => {
      await expect(
        service.updatePlan('org1', { plan: 'FREE', billingCycle: 'MONTHLY' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create transaction and return token and redirectUrl', async () => {
      const result = await service.updatePlan('org1', { plan: 'PRO', billingCycle: 'MONTHLY' });

      expect(result).toEqual({
        token: 'mock_token',
        redirectUrl: 'http://mock.redirect.url',
      });
      expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: 'org1',
            amount: 150000,
            status: 'PENDING',
          }),
        }),
      );
    });
  });

  describe('handleWebhook', () => {
    it('should throw BadRequestException on invalid signature', async () => {
      await expect(
        service.handleWebhook({
          order_id: 'order1',
          status_code: '200',
          gross_amount: '150000.00',
          signature_key: 'invalid_hash',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update transaction status and upsert subscription on settlement', async () => {
      const payload = {
        order_id: 'order1',
        status_code: '200',
        gross_amount: '150000.00',
        transaction_status: 'settlement',
      };

      // Calculate valid hash for tests
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crypto = require('crypto');
      const validHash = crypto
        .createHash('sha512')
        .update(payload.order_id + payload.status_code + payload.gross_amount + 'server_key')
        .digest('hex');

      const validPayload = { ...payload, signature_key: validHash };

      (prisma.paymentTransaction.update as jest.Mock).mockResolvedValue({
        organizationId: 'org1',
      });

      await service.handleWebhook(validPayload);

      expect(prisma.paymentTransaction.update).toHaveBeenCalledWith({
        where: { orderId: 'order1' },
        data: { status: 'SETTLEMENT' },
      });

      expect(prisma.organizationSubscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org1' },
        }),
      );
    });
  });
});
