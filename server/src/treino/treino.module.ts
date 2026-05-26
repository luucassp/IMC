import { Module } from '@nestjs/common';
import { TreinoService } from './treino.service';
import { HistoricoController } from './historico.controller';
import { RegistroController } from './registro.controller';

@Module({
  controllers: [HistoricoController, RegistroController],
  providers: [TreinoService],
})
export class TreinoModule {}
