import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IaService } from './ia.service';
import { GerarTreinoDto } from './dto/gerar-treino.dto';

@Controller('ia')
@UseGuards(JwtAuthGuard)
export class IaController {
  constructor(private readonly ia: IaService) {}

  @Post('treino')
  gerarTreino(@Body() dto: GerarTreinoDto) {
    return this.ia.gerarTreino(dto);
  }
}
