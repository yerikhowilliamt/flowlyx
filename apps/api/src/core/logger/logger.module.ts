import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-correlation-id'] || randomUUID(),
        transport: {
          targets: [
            ...(process.env.NODE_ENV === 'development'
              ? [
                  {
                    target: 'pino-pretty',
                    options: {
                      singleLine: true,
                      colorize: true,
                    },
                  },
                ]
              : []),
            {
              target: 'pino-loki',
              options: {
                batching: true,
                interval: 5,
                host: process.env.LOKI_URL || 'http://localhost:3100',
              },
            },
          ],
        },
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
