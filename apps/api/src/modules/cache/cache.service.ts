import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { EnvConfig } from '../../core/config/env.validation';
import { Logger } from 'nestjs-pino';

@Injectable()
export class CacheService extends Redis implements OnModuleDestroy {
  constructor(configService: ConfigService<EnvConfig>, logger: Logger) {
    super({
      host: configService.get('REDIS_HOST', { infer: true }),
      port: configService.get('REDIS_PORT', { infer: true }),
      password: configService.get('REDIS_PASSWORD', { infer: true }),
    });

    this.on('connect', () => logger.log('Successfully connected to Redis cache'));
    this.on('error', (err) => logger.error(`Redis cache connection error: ${err.message}`));
  }

  getClient(): Redis {
    return this;
  }

  onModuleDestroy() {
    this.disconnect();
  }
}
