import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ResponseInterceptor } from './core/response/response.interceptor';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './core/exceptions/global-exception.filter';
import { AuditLogInterceptor } from './core/interceptors/audit-log.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, patchNestJsSwagger } from 'nestjs-zod';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix('api');
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3015', 'https://flowlyx-dev.vercel.app'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
    credentials: true,
  });
  app.use(helmet());
  app.use(compression());
  // 1. Logger
  const logger = app.get(Logger);
  app.useLogger(logger);

  // 2. Exception Filter & Response Interceptor
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(), new AuditLogInterceptor());

  // 3. Validation
  app.useGlobalPipes(new ZodValidationPipe());

  // 4. Swagger
  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('Flowlyx API')
    .setDescription('Enterprise Project Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Start Server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
