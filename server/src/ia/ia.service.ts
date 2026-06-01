import { Injectable, ServiceUnavailableException, BadGatewayException } from '@nestjs/common';
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

@Injectable()
export class IaService {
  private client: Anthropic | null;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    this.client = key ? new Anthropic({ apiKey: key }) : null;
  }

  async gerarTreino(dto: GerarTreinoDto): Promise<unknown[]> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'ANTHROPIC_API_KEY não configurada. Adicione a chave em server/.env para usar geração por IA.',
      );
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
}
