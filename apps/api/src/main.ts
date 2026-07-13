import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './core/response/response.interceptor';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './core/exceptions/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix('api');
  // 1. Logger
  const logger = app.get(Logger);
  app.useLogger(logger);

  // 2. Exception Filter & Response Interceptor
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 3. Validation
  app.useGlobalPipes(new ZodValidationPipe());

  // 4. Swagger
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
bootstrap();
