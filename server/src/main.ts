import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Em produção, defina CORS_ORIGIN com a URL do front (separe por vírgula).
  const origin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : true;
  app.enableCors({ origin });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API IMC+Treino em http://localhost:${port}`);
}

bootstrap();
