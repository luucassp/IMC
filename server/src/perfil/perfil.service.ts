import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PerfilDto } from './dto/perfil.dto';

type PerfilRow = {
  equipamentos: string;
  restricoes: string;
  objetivosExtras: string;
} & Record<string, unknown>;

@Injectable()
export class PerfilService {
  constructor(private readonly prisma: PrismaService) {}

  async obter(userId: string) {
    const perfil = await this.prisma.perfil.findUnique({ where: { userId } });
    return perfil ? this.serializar(perfil) : null;
  }

  async salvar(userId: string, dto: PerfilDto) {
    const { equipamentos, restricoes, objetivosExtras, ...resto } = dto;
    const dados: Omit<Prisma.PerfilUncheckedCreateInput, 'userId'> = { ...resto };
    if (equipamentos !== undefined) dados.equipamentos = JSON.stringify(equipamentos);
    if (restricoes !== undefined) dados.restricoes = JSON.stringify(restricoes);
    if (objetivosExtras !== undefined) dados.objetivosExtras = JSON.stringify(objetivosExtras);

    const perfil = await this.prisma.perfil.upsert({
      where: { userId },
      create: { userId, ...dados },
      update: dados,
    });
    return this.serializar(perfil);
  }

  // Arrays voltam de string JSON para array no JSON de resposta.
  private serializar(perfil: PerfilRow) {
    return {
      ...perfil,
      equipamentos: this.parseArray(perfil.equipamentos),
      restricoes: this.parseArray(perfil.restricoes),
      objetivosExtras: this.parseArray(perfil.objetivosExtras ?? '[]'),
    };
  }

  private parseArray(valor: string): string[] {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
