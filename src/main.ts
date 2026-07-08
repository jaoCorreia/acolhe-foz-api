import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // CORS restrito à lista branca (RNF-014).
  const origins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
  });

  // Validação global de DTOs (RNF-015): rejeita campos não mapeados.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger / OpenAPI (RNF-050) — em /api/docs.
  if (config.get('NODE_ENV') !== 'production') {
    const swagger = new DocumentBuilder()
      .setTitle('ACOLHE Foz · API')
      .setDescription('API centralizada do Sistema Integrado de Abordagem e Acolhimento')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('api/docs', app, doc);
  }

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🟢 ACOLHE Foz API em http://localhost:${port}/api  ·  docs: /api/docs`);
}
bootstrap();
