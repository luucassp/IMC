import { Module } from '@nestjs/common';
import { TreinoService } from './treino.service';
import { DashboardService } from './dashboard.service';
import { HistoricoController } from './historico.controller';
import { RegistroController } from './registro.controller';
import { DashboardController } from './dashboard.controller';
import { TreinoIaController } from './treino-ia.controller';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  controllers: [HistoricoController, RegistroController, DashboardController, TreinoIaController],
  providers: [TreinoService, DashboardService],
})
export class TreinoModule {}
