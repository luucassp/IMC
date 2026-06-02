import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const TIMEOUT_MS = 10_000;

const exercicioSchema = z.object({
  nome: z.string().min(1),
  musculo: z.string().optional().default(''),
  series: z.number().int().positive(),
  reps: z.string().min(1),
  descansoSegundos: z.number().int().nonnegative(),
  intensidade: z.enum(['leve', 'moderado', 'pesado']).optional(),
});

const respostaSchema = z.object({
  treino: z.array(exercicioSchema).min(1),
  justificativa_resumida: z.string().optional().default(''),
});

export type TreinoIA = z.infer<typeof respostaSchema>;

export type ParametrosIA = {
  imc: number | null;
  classificacao: string;
  nivel: string;
  objetivo: string;
  equipamentos: string[];
  lesoes: string[];
  fadiga: string;
};

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private client?: GoogleGenerativeAI;

  habilitado(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async gerarTreino(p: ParametrosIA): Promise<TreinoIA> {
    if (!this.habilitado()) {
      throw new Error('GEMINI_API_KEY não configurada');
    }
    const prompt = this.montarPrompt(p);

    // 1 tentativa extra em caso de erro/timeout.
    try {
      return await this.chamarComTimeout(prompt);
    } catch (err) {
      this.logger.warn(`Gemini tentativa 1 falhou: ${(err as Error).message}; tentando de novo`);
      return await this.chamarComTimeout(prompt);
    }
  }

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    }
    return this.client;
  }

  private async chamarComTimeout(prompt: string): Promise<TreinoIA> {
    const modelo = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
    const model = this.getClient().getGenerativeModel({
      model: modelo,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const chamada = model.generateContent(prompt);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout 10s na API do Gemini')), TIMEOUT_MS),
    );
    const result = await Promise.race([chamada, timeout]);

    const texto = result.response.text().trim();
    // Remove cercas de código se vierem (gemini às vezes adiciona apesar do mime type).
    const limpo = texto.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    const parsed = JSON.parse(limpo);
    return respostaSchema.parse(parsed);
  }

  private montarPrompt(p: ParametrosIA): string {
    const equip = p.equipamentos?.length ? p.equipamentos.join(', ') : 'nenhum';
    const lesoes = p.lesoes?.length ? p.lesoes.join(', ') : 'nenhuma';
    const imcTxt = p.imc != null ? `${p.imc.toFixed(1)}` : 'desconhecido';
    return [
      'Você é um personal trainer. Gere um treino para o dia em JSON estrito.',
      `Perfil: IMC ${imcTxt} (${p.classificacao}), nível ${p.nivel}, objetivo ${p.objetivo}, equipamentos: ${equip}, fadiga: ${p.fadiga}, lesões: ${lesoes}.`,
      'Regras: IMC>=30 evite impacto. Fadiga "exausto" reduza volume para no máximo 4 exercícios.',
      'Retorne JSON com:',
      '{',
      '  "treino": [',
      '    { "nome": "...", "musculo": "...", "series": number, "reps": "string", "descansoSegundos": number, "intensidade": "leve|moderado|pesado" }',
      '  ],',
      '  "justificativa_resumida": "..."',
      '}',
    ].join('\n');
  }
}
