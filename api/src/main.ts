import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { HttpExceptionFilter } from './filters/http_exception.filter';

import { LogService } from './modules/log/services/log.service';
import { ConfigurationService } from './modules/shared/services/configuration/configuration.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET, POST, PUT, DELETE'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter(new ConfigurationService()));
  app.useLogger(new LogService());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );
  await app.listen(process.env.PORT_RUNTIME || 3000);
  console.log(
    `Hcmue homepage service is listenning on ${
      process.env.PORT_RUNTIME || 3000
    }.`,
  );
}

bootstrap();
