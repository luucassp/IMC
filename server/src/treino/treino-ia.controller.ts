import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TreinoService } from './treino.service';
import { GerarTreinoIaDto } from './dto/treino-ia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('treino')
export class TreinoIaController {
  constructor(private readonly treino: TreinoService) {}

  @Post('ia')
  gerarIA(@CurrentUser() user: AuthUser, @Body() dto: GerarTreinoIaDto) {
    return this.treino.gerarTreinoComIA(user.id, dto.fadiga ?? 'normal', dto.force ?? false);
  }
}
