import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { PerfilDto } from './dto/perfil.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfil: PerfilService) {}

  @Get()
  obter(@CurrentUser() user: AuthUser) {
    return this.perfil.obter(user.id);
  }

  @Put()
  salvar(@CurrentUser() user: AuthUser, @Body() dto: PerfilDto) {
    return this.perfil.salvar(user.id, dto);
  }
}
