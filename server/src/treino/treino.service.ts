import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../llm/gemini.service';
import { HistoricoDto } from './dto/historico.dto';
import { RegistroDto } from './dto/registro.dto';

function dataHoje(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function classificarIMC(imc: number | null): string {
  if (imc == null) return 'desconhecida';
  if (imc < 18.5) return 'abaixo do peso';
  if (imc < 25) return 'peso normal';
  if (imc < 30) return 'sobrepeso';
  if (imc < 35) return 'obesidade grau 1';
  if (imc < 40) return 'obesidade grau 2';
  return 'obesidade grau 3';
}

function parseArray(valor: string | null | undefined): string[] {
  if (!valor) return [];
  try {
    const v = JSON.parse(valor);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export type ParametrosIaEntrada = {
  fadiga: string;
  diaId: string;
  diaFoco: string;
  force: boolean;
};

@Injectable()
export class TreinoService {
  private readonly logger = new Logger(TreinoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

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

  // Gera (ou recupera do cache do dia + sessão) um treino com IA. Em qualquer
  // falha retorna source:"base" para o front cair no plano de regras.
  async gerarTreinoComIA(userId: string, entrada: ParametrosIaEntrada) {
    const hoje = dataHoje();
    const { fadiga, diaId, diaFoco, force } = entrada;

    if (!force) {
      const cache = await this.prisma.treinoIA.findUnique({
        where: { userId_data_diaId: { userId, data: hoje, diaId } },
      });
      if (cache) {
        return {
          source: 'ia' as const,
          treino: JSON.parse(cache.treino),
          justificativa: cache.justificativa ?? '',
          fadiga: cache.fadiga,
          diaId: cache.diaId,
          cached: true,
        };
      }
    }

    const perfil = await this.prisma.perfil.findUnique({ where: { userId } });
    if (!perfil) {
      this.logger.warn(`Sem perfil para userId=${userId}; fallback para base.`);
      return { source: 'base' as const, treino: null };
    }

    const imc =
      perfil.peso && perfil.altura
        ? Number((perfil.peso / (perfil.altura / 100) ** 2).toFixed(1))
        : null;

    try {
      const resp = await this.gemini.gerarTreino({
        imc,
        classificacao: classificarIMC(imc),
        sexo: perfil.sexo ?? '',
        nivel: perfil.nivel ?? 'iniciante',
        objetivo: perfil.objetivo ?? 'hipertrofia',
        objetivosExtras: parseArray(perfil.objetivosExtras),
        enfaseCorporal: perfil.enfaseCorporal ?? 'equilibrado',
        equipamentos: parseArray(perfil.equipamentos),
        lesoes: parseArray(perfil.restricoes),
        fadiga,
        diaFoco,
      });

      await this.prisma.treinoIA.upsert({
        where: { userId_data_diaId: { userId, data: hoje, diaId } },
        create: {
          userId,
          data: hoje,
          diaId,
          fadiga,
          treino: JSON.stringify(resp.treino),
          justificativa: resp.justificativa_resumida,
        },
        update: {
          fadiga,
          treino: JSON.stringify(resp.treino),
          justificativa: resp.justificativa_resumida,
        },
      });

      return {
        source: 'ia' as const,
        treino: resp.treino,
        justificativa: resp.justificativa_resumida,
        fadiga,
        diaId,
        cached: false,
      };
    } catch (err) {
      this.logger.warn(`Falha gerando IA: ${(err as Error).message}; fallback base.`);
      return { source: 'base' as const, treino: null };
    }
  }
}
