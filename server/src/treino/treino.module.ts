import { Module } from '@nestjs/common';
import { TreinoService } from './treino.service';
import { DashboardService } from './dashboard.service';
import { HistoricoController } from './historico.controller';
import { RegistroController } from './registro.controller';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [HistoricoController, RegistroController, DashboardController],
  providers: [TreinoService, DashboardService],
})
export class TreinoModule {}
