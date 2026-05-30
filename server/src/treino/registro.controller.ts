import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TreinoService } from './treino.service';
import { RegistroDto } from './dto/registro.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('registros')
export class RegistroController {
  constructor(private readonly treino: TreinoService) {}

  @Get()
  listar(@CurrentUser() user: AuthUser) {
    return this.treino.listarRegistros(user.id);
  }

  @Post()
  criar(@CurrentUser() user: AuthUser, @Body() dto: RegistroDto) {
    return this.treino.criarRegistro(user.id, dto);
  }
}
