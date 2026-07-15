import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { EnvConfig } from '../../core/config/env.validation';
import { Logger } from 'nestjs-pino';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(
    private readonly configService: ConfigService<EnvConfig>,
    private readonly logger: Logger,
  ) {
    const host = this.configService.get('REDIS_HOST', { infer: true });
    const port = this.configService.get('REDIS_PORT', { infer: true });
    const password = this.configService.get('REDIS_PASSWORD', { infer: true });

    this.redis = new Redis({
      host,
      port,
      password,
    });

    this.redis.on('connect', () => {
      this.logger.log('Successfully connected to Redis cache');
    });

    this.redis.on('error', (err) => {
      this.logger.error(`Redis cache connection error: ${err.message}`);
    });
  }

  async set(key: string, value: string | number | Buffer, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.redis.set(key, value, 'EX', ttlSeconds);
    }
    return this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  getClient(): Redis {
    return this.redis;
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
