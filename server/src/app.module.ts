import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PerfilModule } from './perfil/perfil.module';
import { TreinoModule } from './treino/treino.module';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PerfilModule,
    TreinoModule,
    IaModule,
  ],
})
export class AppModule {}
