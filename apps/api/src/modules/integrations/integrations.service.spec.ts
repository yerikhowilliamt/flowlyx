import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

const WORKSPACE_ID = 'ws-uuid-1111-1111-1111-111111111111';
const INTEGRATION_ID = 'int-uuid-1111-1111-1111-111111111111';
const USER_ID = 'usr-uuid-1111-1111-1111-111111111111';

const mockWorkspace = { id: WORKSPACE_ID, name: 'Test Workspace' };

const mockIntegration = {
  id: INTEGRATION_ID,
  workspaceId: WORKSPACE_ID,
  provider: 'SLACK',
  name: 'Slack Alerts',
  webhookUrl: 'https://hooks.slack.com/test',
  accessToken: null,
  config: null,
  status: 'ACTIVE',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: USER_ID,
  updatedBy: null,
};

jest.mock('@flowlyx/database', () => ({
  prisma: {
    workspace: { findUnique: jest.fn() },
    integration: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '@flowlyx/database';

describe('IntegrationsService', () => {
  let service: IntegrationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegrationsService],
    }).compile();
    service = module.get<IntegrationsService>(IntegrationsService);
  });

  describe('create()', () => {
    it('should create an integration when workspace exists', async () => {
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace);
      (prisma.integration.create as jest.Mock).mockResolvedValue(mockIntegration);

      const result = await service.create(
        {
          workspaceId: WORKSPACE_ID,
          provider: 'SLACK',
          name: 'Slack Alerts',
          webhookUrl: 'https://hooks.slack.com/test',
        },
        USER_ID,
      );

      expect(result).toEqual(mockIntegration);
      expect(prisma.integration.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ provider: 'SLACK' }) }),
      );
    });

    it('should throw NotFoundException when workspace not found', async () => {
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create({ workspaceId: WORKSPACE_ID, provider: 'SLACK', name: 'x' }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByWorkspace()', () => {
    it('should return integrations for a workspace', async () => {
      (prisma.integration.findMany as jest.Mock).mockResolvedValue([mockIntegration]);

      const result = await service.findAllByWorkspace(WORKSPACE_ID);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne()', () => {
    it('should return integration when found', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(mockIntegration);

      const result = await service.findOne(INTEGRATION_ID);
      expect(result.id).toBe(INTEGRATION_ID);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(INTEGRATION_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update integration', async () => {
      const updated = { ...mockIntegration, name: 'Updated Slack' };
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(mockIntegration);
      (prisma.integration.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update(INTEGRATION_ID, { name: 'Updated Slack' }, USER_ID);
      expect(result.name).toBe('Updated Slack');
    });

    it('should throw NotFoundException if integration not found', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.update(INTEGRATION_ID, { name: 'x' }, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should soft-delete integration', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(mockIntegration);
      (prisma.integration.update as jest.Mock).mockResolvedValue({
        ...mockIntegration,
        status: 'INACTIVE',
      });

      const result = await service.remove(INTEGRATION_ID, USER_ID);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(INTEGRATION_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('testPing()', () => {
    it('should throw BadRequestException when no webhook URL', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue({
        ...mockIntegration,
        webhookUrl: null,
      });

      await expect(service.testPing(INTEGRATION_ID, USER_ID)).rejects.toThrow(BadRequestException);
    });

    it('should return success when ping succeeds', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(mockIntegration);
      global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as jest.Mock;

      const result = await service.testPing(INTEGRATION_ID, USER_ID);
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should return failure when ping throws', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(mockIntegration);
      global.fetch = jest.fn().mockRejectedValue(new Error('timeout')) as jest.Mock;

      const result = await service.testPing(INTEGRATION_ID, USER_ID);
      expect(result.success).toBe(false);
      expect(result.error).toBe('timeout');
    });

    it('should throw NotFoundException if integration not found', async () => {
      (prisma.integration.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.testPing(INTEGRATION_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
