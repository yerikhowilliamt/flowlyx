import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, Prisma } from '@flowlyx/database';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  async create(dto: CreateIntegrationDto, userId: string) {
    this.logger.log({
      message: 'Creating integration',
      provider: dto.provider,
      workspaceId: dto.workspaceId,
      userId,
    });

    const workspace = await prisma.workspace.findUnique({ where: { id: dto.workspaceId } });
    if (!workspace) {
      throw new NotFoundException(`Workspace ${dto.workspaceId} not found`);
    }

    const integration = await prisma.integration.create({
      data: {
        workspaceId: dto.workspaceId,
        provider: dto.provider,
        name: dto.name,
        webhookUrl: dto.webhookUrl,
        accessToken: dto.accessToken,
        config: dto.config ? (dto.config as Prisma.InputJsonValue) : undefined,
        createdBy: userId,
      },
    });

    this.logger.log({ message: 'Integration created', id: integration.id });
    return integration;
  }

  async findAllByWorkspace(workspaceId: string) {
    this.logger.log({ message: 'Fetching integrations', workspaceId });
    return prisma.integration.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const integration = await prisma.integration.findFirst({
      where: { id, deletedAt: null },
    });
    if (!integration) {
      throw new NotFoundException(`Integration ${id} not found`);
    }
    return integration;
  }

  async update(id: string, dto: UpdateIntegrationDto, userId: string) {
    await this.findOne(id);

    this.logger.log({ message: 'Updating integration', id, userId });

    const updated = await prisma.integration.update({
      where: { id },
      data: {
        ...dto,
        config: dto.config ? (dto.config as Prisma.InputJsonValue) : undefined,
        updatedBy: userId,
      },
    });

    this.logger.log({ message: 'Integration updated', id });
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    this.logger.log({ message: 'Deleting integration', id, userId });

    await prisma.integration.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId, status: 'INACTIVE' },
    });

    this.logger.log({ message: 'Integration deleted', id });
    return { success: true };
  }

  async testPing(id: string, userId: string) {
    const integration = await this.findOne(id);

    this.logger.log({
      message: 'Testing integration ping',
      id,
      provider: integration.provider,
      userId,
    });

    if (!integration.webhookUrl) {
      throw new BadRequestException('Integration has no webhook URL configured');
    }

    const payload = (
      {
        SLACK: { text: '✅ Flowlyx integration test ping' },
        DISCORD: { content: '✅ Flowlyx integration test ping' },
      } as Record<string, Record<string, unknown>>
    )[integration.provider] ?? { event: 'ping', source: 'flowlyx' };

    try {
      const res = await fetch(integration.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      this.logger.log({
        message: 'Integration ping response',
        id,
        status: res.status,
      });

      return { success: res.ok, statusCode: res.status };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn({ message: 'Integration ping failed', id, error: message });
      return { success: false, error: message };
    }
  }
}
