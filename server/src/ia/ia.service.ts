import { Injectable, BadGatewayException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { GerarTreinoDto } from './dto/gerar-treino.dto';

const SYSTEM_PROMPT = `You are a certified personal trainer generating structured workout programs.

Return ONLY a valid JSON array of exercises — no markdown, no explanation, no surrounding text.

Each exercise object must have exactly these fields:
- "name": string (exercise name in Portuguese)
- "englishName": string (English name for image lookup, e.g. "Bench Press")
- "category": "PRINCIPAL" or "ACESSÓRIO"
- "sets": string (number, e.g. "4")
- "reps": string (range or text, e.g. "8–12" or "12–15")
- "rest": string (with unit, e.g. "90 s" or "2 min")
- "muscles": array of strings (Portuguese muscle group names)
- "cues": array of 2–4 short Portuguese coaching tips

Rules:
- PRINCIPAL = compound movements (squat, deadlift, bench press, row, overhead press, hip hinge)
- ACESSÓRIO = isolation or complementary movements
- Include 2–3 PRINCIPAL and 3–5 ACESSÓRIO exercises
- Respect equipment constraints strictly
- Skip or substitute exercises that stress the user's physical restrictions
- Match reps/rest to the primary goal:
  emagrecimento → 12–15 reps / 30–60 s rest
  hipertrofia    → 8–12 reps / 60–90 s rest
  forca          → 3–6 reps / 3–5 min rest
  condicionamento → 10–15 reps / 45 s rest
  resistencia    → 15–20 reps / 30–45 s rest
  default        → 10–12 reps / 60–90 s rest

Equipment mapping:
  academia = full gym (barbells, cables, machines, dumbbells)
  halteres = dumbbells at home only
  elasticos = resistance bands only
  peso_corporal = bodyweight only (no external load)`;

// Treinos demo por objetivo — usados quando não há ANTHROPIC_API_KEY.
const MOCK_TREINOS: Record<string, unknown[]> = {
  hipertrofia: [
    { name: 'Supino Reto com Barra', englishName: 'Barbell Bench Press', category: 'PRINCIPAL', sets: '4', reps: '8–12', rest: '90 s', muscles: ['Peitoral maior', 'Tríceps', 'Deltóide anterior'], cues: ['Escápulas retraídas e deprimidas', 'Desça até tocar levemente o peitoral', 'Empurre explosivo na subida'] },
    { name: 'Remada Curvada', englishName: 'Barbell Row', category: 'PRINCIPAL', sets: '4', reps: '8–10', rest: '90 s', muscles: ['Latíssimo do dorso', 'Romboides', 'Bíceps'], cues: ['Costas neutras, quadril empurrado para trás', 'Puxe o cotovelo para o bolso traseiro', 'Controle a descida'] },
    { name: 'Desenvolvimento com Halteres', englishName: 'Dumbbell Shoulder Press', category: 'ACESSÓRIO', sets: '3', reps: '10–12', rest: '75 s', muscles: ['Deltóide medial', 'Deltóide anterior', 'Tríceps'], cues: ['Cotovelos a 90° no início', 'Não hiperestenda o cotovelo no topo'] },
    { name: 'Elevação Lateral', englishName: 'Lateral Raise', category: 'ACESSÓRIO', sets: '3', reps: '12–15', rest: '60 s', muscles: ['Deltóide medial'], cues: ['Leve flexão do cotovelo', 'Polegar levemente baixo (pinça de água)', 'Pare na altura dos ombros'] },
    { name: 'Rosca Direta', englishName: 'Barbell Curl', category: 'ACESSÓRIO', sets: '3', reps: '10–12', rest: '60 s', muscles: ['Bíceps braquial', 'Braquial'], cues: ['Cotovelos fixos ao lado do corpo', 'Supinação total no topo'] },
    { name: 'Tríceps Corda', englishName: 'Triceps Rope Pushdown', category: 'ACESSÓRIO', sets: '3', reps: '12–15', rest: '60 s', muscles: ['Tríceps braquial'], cues: ['Cotovelos fixos', 'Abra a corda no final do movimento'] },
  ],
  emagrecimento: [
    { name: 'Agachamento Livre', englishName: 'Barbell Squat', category: 'PRINCIPAL', sets: '4', reps: '12–15', rest: '45 s', muscles: ['Quadríceps', 'Glúteo máximo', 'Isquiotibiais'], cues: ['Joelhos alinhados com os pés', 'Desça até a coxa paralela', 'Core contraído em todo o movimento'] },
    { name: 'Levantamento Terra Romeno', englishName: 'Romanian Deadlift', category: 'PRINCIPAL', sets: '3', reps: '12–15', rest: '45 s', muscles: ['Isquiotibiais', 'Glúteo máximo', 'Eretores'], cues: ['Empurre o quadril para trás', 'Barra desliza pelas coxas', 'Mantenha coluna neutra'] },
    { name: 'Agachamento Búlgaro', englishName: 'Bulgarian Split Squat', category: 'ACESSÓRIO', sets: '3', reps: '12–15 cada', rest: '45 s', muscles: ['Quadríceps', 'Glúteo'], cues: ['Pé traseiro elevado', 'Joelho dianteiro sobre o tornozelo'] },
    { name: 'Flexão de Joelho na Mesa', englishName: 'Lying Leg Curl', category: 'ACESSÓRIO', sets: '3', reps: '15', rest: '30 s', muscles: ['Isquiotibiais'], cues: ['Movimento controlado', 'Pelve na mesa durante todo o exercício'] },
    { name: 'Extensão de Quadril no Cabo', englishName: 'Cable Hip Extension', category: 'ACESSÓRIO', sets: '3', reps: '15 cada', rest: '30 s', muscles: ['Glúteo máximo'], cues: ['Core firme', 'Não hiperextenda a lombar'] },
  ],
  forca: [
    { name: 'Agachamento com Barra', englishName: 'Barbell Back Squat', category: 'PRINCIPAL', sets: '5', reps: '3–5', rest: '3 min', muscles: ['Quadríceps', 'Glúteo', 'Isquiotibiais', 'Core'], cues: ['Barra na prateleira alta ou baixa conforme preferência', 'Descida controlada ~3 s', 'Drive dos calcanhares na subida', 'Cinturão ajuda mas não substitui o core'] },
    { name: 'Supino Reto com Barra', englishName: 'Barbell Bench Press', category: 'PRINCIPAL', sets: '5', reps: '3–5', rest: '3 min', muscles: ['Peitoral maior', 'Tríceps', 'Deltóide anterior'], cues: ['Arco lombar moderado', 'Pés firmes no chão', 'Barra em linha com os mamilos'] },
    { name: 'Levantamento Terra', englishName: 'Conventional Deadlift', category: 'PRINCIPAL', sets: '3', reps: '3–5', rest: '4 min', muscles: ['Isquiotibiais', 'Glúteo', 'Lombar', 'Trapézio'], cues: ['Quadril em posição de força antes de puxar', 'Ombros acima do quadril', 'Empurre o chão, não puxe a barra'] },
    { name: 'Agachamento Frontal', englishName: 'Front Squat', category: 'ACESSÓRIO', sets: '3', reps: '5–6', rest: '2 min', muscles: ['Quadríceps', 'Core'], cues: ['Cotovelos altos', 'Torso mais ereto que no agachamento traseiro'] },
    { name: 'Barra Fixa com Peso', englishName: 'Weighted Pull-Up', category: 'ACESSÓRIO', sets: '4', reps: '4–6', rest: '2 min', muscles: ['Latíssimo', 'Bíceps', 'Romboides'], cues: ['Depressão escapular antes de puxar', 'Queixo acima da barra'] },
  ],
};

function mockPorObjetivo(objetivo: string): unknown[] {
  return (
    MOCK_TREINOS[objetivo] ??
    MOCK_TREINOS['hipertrofia']
  );
}

@Injectable()
export class IaService {
  private client: Anthropic | null;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    this.client = key ? new Anthropic({ apiKey: key }) : null;
  }

  async gerarTreino(dto: GerarTreinoDto): Promise<unknown[]> {
    // Sem chave configurada → retorna treino demo para o UX ser testável.
    if (!this.client) {
      return this.gerarMock(dto);
    }

    const objetivos = [dto.objetivo, ...(dto.objetivosExtras ?? [])].filter(Boolean).join(', ');
    const equipamentos = (dto.equipamentos ?? []).join(', ') || 'academia';
    const restricoes = (dto.restricoes ?? []).join(', ') || 'nenhuma';

    const userMessage = `Generate a workout for a ${dto.nivel ?? 'intermediario'} athlete.
Primary goal: ${dto.objetivo ?? 'hipertrofia'}
Secondary goals: ${objetivos}
Workout focus: ${dto.diaFoco}
Session duration: ${dto.tempoPorTreino ?? 60} minutes
Available equipment: ${equipamentos}
Physical restrictions: ${restricoes}`;

    let raw: string;
    try {
      const msg = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            // @ts-ignore — cache_control is a valid Anthropic param
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      });

      raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadGatewayException(`Anthropic API error: ${msg}`);
    }

    try {
      const match = raw.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(match ? match[0] : raw);
      if (!Array.isArray(parsed)) throw new Error('not an array');
      return parsed;
    } catch {
      throw new BadGatewayException('Resposta da IA não é JSON válido. Tente novamente.');
    }
  }

  private gerarMock(dto: GerarTreinoDto): unknown[] {
    const base = mockPorObjetivo(dto.objetivo ?? 'hipertrofia');
    // Filtra exercícios com barra se não há academia/halteres
    const temEquipamento = (eq: string) => (dto.equipamentos ?? []).includes(eq);
    const soPesoCorporal =
      !temEquipamento('academia') && !temEquipamento('halteres') && !temEquipamento('elasticos');
    if (soPesoCorporal) {
      return base
        .filter((ex: any) => !['Barbell', 'Dumbbell', 'Cable', 'Machine'].some((k) => ex.englishName?.includes(k)))
        .map((ex: any) => ({ ...ex, name: `${ex.name} (peso corporal)` }));
    }
    return base;
  }
}
