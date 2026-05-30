import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HistoricoDto } from './dto/historico.dto';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class TreinoService {
  constructor(private readonly prisma: PrismaService) {}

  listarHistorico(userId: string) {
    return this.prisma.historico.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
    });
  }

  criarHistorico(userId: string, dto: HistoricoDto) {
    return this.prisma.historico.create({ data: { userId, ...dto } });
  }

  listarRegistros(userId: string) {
    return this.prisma.registro.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
    });
  }

  criarRegistro(userId: string, dto: RegistroDto) {
    return this.prisma.registro.create({ data: { userId, ...dto } });
  }
}
