# MAYRENCROSFIT 🏋️

[![CI](https://github.com/luucassp/mayrencrosfit/actions/workflows/ci.yml/badge.svg)](https://github.com/luucassp/mayrencrosfit/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-67%20passing-brightgreen)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)

App pessoal de treino **CrossFit**, construído em volta de um ciclo mensal
programado (atual: **Ciclo Julho 2026** · 07/07 – 02/08 · Estilo Cross do
Brasil). Roda **100% no navegador** — sem backend, sem banco de dados e sem
contas de usuário. A entrada tem uma trava por senha única (hash SHA-256
verificado no cliente), só para afastar quem topar com o link por acaso — não
é um sistema de autenticação. Os dados ficam no `localStorage` e podem ser exportados/importados
entre aparelhos por arquivo JSON.

**No ar:** https://imc-neon.vercel.app

## Como funciona

1. **Primeira visita** → onboarding rápido (medidas, objetivo, nível,
   disponibilidade, equipamentos, restrições). Preenche uma vez, fica salvo.
2. **Home** → treino do dia do ciclo pela **data real** (segunda = descanso
   total), strip da semana com status, sequência de dias, meta semanal
   (6 treinos: TER–DOM) e progressão de carga.
3. **Ciclo de Treinos** → as 4 semanas completas (Volume → Intensidade →
   Pico → Deload + Testes), cada dia com mobilidade, aquecimento, skill,
   LPO/força, WOD e notas de pacing. O dia de hoje abre destacado; botão
   **"Concluir treino"** marca a sessão no histórico.
4. **Meu Perfil** → IMC com classificação OMS, objetivos e **backup dos
   dados** (exportar/importar JSON).

## Funcionalidades

- **Ciclo Julho 2026** completo: 24 sessões datadas em 4 semanas
  (`src/data/ciclo.js`) — benchmarks Isabel, Grace, 2k remo na semana de testes
- Treino do dia automático pela data, com status da semana
  (feito / hoje / perdido / próximo / descanso)
- Histórico de sessões, sequência (streak) e dashboard de consistência —
  tudo calculado no navegador
- Registro de carga × reps por exercício com gráfico de progressão
- **Treino guiado** passo a passo com cronômetro de descanso
- **Treino Livre**: escolha 1–4 grupos musculares + equipamento e a IA monta
  um WOD (requer um backend de IA — ver abaixo; opcional)
- **Backup**: exporta/importa perfil + histórico + registros em JSON para
  sincronizar celular ↔ computador
- Cálculo e classificação de IMC (padrão OMS)

## Stack

- **React 18 + Vite 6** · Tailwind CSS v4 · [motion](https://motion.dev)
- **Sem backend**: `src/lib/api.js` implementa perfil, histórico, registros e
  dashboard sobre `localStorage`
- **Site estático** no Vercel (SPA rewrite em `vercel.json`)
- **Testes**: Vitest — 67 testes na lógica pura
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) — testes + build a cada
  push/PR na `main`

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 67 testes (Vitest)
npm run build    # build de produção em dist/
```

Não precisa de mais nada — sem banco, sem variáveis de ambiente.

## Estrutura

```
src/
  components/
    Home.tsx          # dashboard: treino do dia, semana, stats, menu
    Ciclo.jsx         # ciclo completo (4 semanas) com concluir treino
    Onboarding.jsx    # questionário multi-etapas (primeira visita)
    Resultado.jsx     # perfil: IMC, objetivos, backup exportar/importar
    Plano.jsx         # plano de musculação legado + aba Evolução (gráficos)
    TreinoLivre.jsx   # WOD por grupo muscular via IA (opcional)
    GuidedWorkout.jsx # treino guiado passo a passo
    RestTimer.jsx     # cronômetro de descanso flutuante
    MiniGrafico.jsx   # gráfico de barras em SVG
  data/
    ciclo.js          # ★ Ciclo Julho 2026 — semanas, dias e blocos
    planos.js         # biblioteca de treinos de musculação (legado)
    onboarding.js     # opções dos campos do questionário
  lib/
    api.js            # ★ store local (localStorage) + backup + cliente IA
    ciclo.js          # ★ sessão por data + status da semana do ciclo
    imc.js            # cálculo e classificação de IMC
    semana.js         # status semanal do plano legado
    fadiga.js         # ajuste de intensidade ("como você está hoje?")
    recomendacao.js   # motor de recomendação por regras (legado)
    plano.js          # montagem do plano de musculação (legado)
    tempo.js          # parsing/format de tempo de descanso
    __tests__/        # 67 testes (Vitest)

server/               # backend NestJS legado — NÃO é necessário.
                      # Útil apenas para reativar a IA do Treino Livre
                      # (OpenAI/Anthropic/Gemini) via VITE_API_URL.
```

## IA do Treino Livre (opcional)

O app funciona completo sem isso. Para ativar a geração de WOD por IA:

1. Suba o `server/` em qualquer host Node (define `OPENAI_API_KEY`,
   `ANTHROPIC_API_KEY` **ou** `GEMINI_API_KEY`)
2. No front, crie `.env.local` com `VITE_API_URL=https://seu-backend`

Sem `VITE_API_URL`, o botão do Treino Livre mostra um aviso amigável.

## Próximo ciclo

Quando o ciclo de agosto sair, é só adicionar as semanas em
`src/data/ciclo.js` seguindo o mesmo formato (`date`, `dow`, `title`,
`blocks`) — a Home e o Ciclo passam a usar as novas datas automaticamente.
A semana 4 do ciclo atual registra os benchmarks que viram base de % do
ciclo seguinte.
