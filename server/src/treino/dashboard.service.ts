import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DIA_MS = 864e5;

type ComData = { data: Date };
type RegistroCarga = { exercicio: string; carga: number; data: Date };

function ddmm(date: Date): string {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

// Janelas móveis de 7 dias terminando hoje; mais antiga → mais recente.
function frequenciaPorSemana(historico: ComData[], semanas = 6) {
  const agora = Date.now();
  const baldes: { label: string; valor: number }[] = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const fim = agora - i * 7 * DIA_MS;
    const inicio = fim - 7 * DIA_MS;
    const valor = historico.filter((h) => {
      const t = h.data.getTime();
      return t > inicio && t <= fim;
    }).length;
    baldes.push({ label: i === 0 ? 'atual' : ddmm(new Date(inicio + DIA_MS)), valor });
  }
  return baldes;
}

// Maior carga por dia para um exercício; últimas N sessões, antiga → recente.
function progressaoCarga(registros: RegistroCarga[], exercicio: string, limite = 6) {
  const porDia = new Map<string, { label: string; valor: number; ordem: number }>();
  for (const r of registros.filter((x) => x.exercicio === exercicio)) {
    const dia = r.data.toDateString();
    const carga = Number(r.carga) || 0;
    const atual = porDia.get(dia);
    if (!atual || carga > atual.valor) {
      porDia.set(dia, { label: ddmm(r.data), valor: carga, ordem: r.data.getTime() });
    }
  }
  return [...porDia.values()]
    .sort((a, b) => a.ordem - b.ordem)
    .slice(-limite)
    .map(({ label, valor }) => ({ label, valor }));
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async montar(userId: string) {
    const [historico, registros] = await Promise.all([
      this.prisma.historico.findMany({ where: { userId } }),
      this.prisma.registro.findMany({ where: { userId } }),
    ]);

    const ultimos7 = historico.filter(
      (h) => Date.now() - h.data.getTime() <= 7 * DIA_MS,
    ).length;

    const exercicios = [...new Set(registros.map((r) => r.exercicio))];
    const progressao: Record<string, { label: string; valor: number }[]> = {};
    for (const ex of exercicios) {
      progressao[ex] = progressaoCarga(registros, ex);
    }

    return {
      total: historico.length,
      ultimos7,
      frequencia: frequenciaPorSemana(historico),
      progressao,
    };
  }
}
