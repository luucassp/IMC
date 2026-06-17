import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PerfilModule } from './perfil/perfil.module';
import { TreinoModule } from './treino/treino.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Limite global: 60 req/min por IP. Rotas sensíveis (login/register)
    // restringem mais via @Throttle no próprio controller.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    PerfilModule,
    TreinoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
