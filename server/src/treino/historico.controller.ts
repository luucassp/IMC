import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TreinoService } from './treino.service';
import { HistoricoDto } from './dto/historico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('historico')
export class HistoricoController {
  constructor(private readonly treino: TreinoService) {}

  @Get()
  listar(@CurrentUser() user: AuthUser) {
    return this.treino.listarHistorico(user.id);
  }

  @Post()
  criar(@CurrentUser() user: AuthUser, @Body() dto: HistoricoDto) {
    return this.treino.criarHistorico(user.id, dto);
  }
}
