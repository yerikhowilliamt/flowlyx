import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { PerformanceInterceptor } from './performance.interceptor';
import { CacheService } from '../../modules/cache/cache.service';
import { CacheModule } from '../../modules/cache/cache.module';

@Global()
@Module({
  imports: [
    CacheModule, // Our internal redis CacheModule
    NestCacheModule.registerAsync({
      imports: [CacheModule],
      useFactory: async (cacheService: CacheService) => ({
        store: () => cacheService.getClient(),
      }),
      inject: [CacheService],
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
  exports: [NestCacheModule],
})
export class PerformanceModule {}
