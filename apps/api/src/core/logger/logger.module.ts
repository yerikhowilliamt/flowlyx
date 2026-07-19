import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
// import pretty from 'pino-pretty';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-correlation-id'] || randomUUID(),
        // stream:
        //   process.env.NODE_ENV === 'development'
        //     ? pretty({ singleLine: true, colorize: true })
        //     : undefined,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
