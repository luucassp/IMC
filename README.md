# IMC + Treino

App de treino personalizado que começa pelo cálculo de IMC. O usuário passa por
um **onboarding** (perfil físico), recebe uma **recomendação** por regras
(divisão, frequência, reps, descanso, ênfase) e acessa o **plano completo** com
exercícios, cronômetro de descanso, registro de carga e dashboard de evolução.

Projeto em evolução, construído passo a passo a partir da calculadora de IMC
original (preservada em [`legacy/`](./legacy)).

## Funcionalidades

- Onboarding multi-etapas (perfil físico)
- Cálculo e classificação de IMC (padrão OMS)
- Recomendação de treino por regras (objetivo, nível, disponibilidade, IMC)
- Plano completo: dias, exercícios e progressão (UI do bloco de treino)
- Cronômetro de descanso por exercício (RF06)
- Registro de carga × reps por série e histórico de sessões (RF04/RF05)
- Dashboard de evolução: consistência semanal e progressão de carga (RF07)
- Trocar o objetivo a qualquer momento (RF08)
- Persistência local (localStorage), sem necessidade de refazer o onboarding

## Stack

- React 18 + Vite
- Sem backend ainda — regras fixas e persistência no `localStorage`

## Como rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção
```

## Estrutura

```
src/
  components/
    Onboarding.jsx   # questionário multi-etapas (perfil físico)
    Resultado.jsx    # IMC + classificação + recomendação + trocar objetivo
    Plano.jsx        # plano completo (treino, progressão, semana, evolução)
    RestTimer.jsx    # cronômetro de descanso flutuante
    MiniGrafico.jsx  # gráfico de barras em SVG (sem dependências)
  data/
    onboarding.js    # opções dos campos (objetivos, níveis, equipamentos...)
    planos.js        # biblioteca de dias de treino + templates de divisão
  lib/
    imc.js           # cálculo e classificação de IMC (padrão OMS)
    recomendacao.js  # motor de recomendação por regras
    plano.js         # monta o plano e a semana a partir da recomendação
    storage.js       # persistência (perfil, histórico, registros de carga)
    tempo.js         # parsing/format de descanso
    estatisticas.js  # agregações do dashboard (frequência, progressão)
  App.jsx
  main.jsx
legacy/              # calculadora de IMC original (HTML/CSS/JS puro)
```

## Próximos passos

- Autenticação e backend (login, sincronização entre dispositivos).
- Substituir as regras fixas por personalização adaptativa.
- Ajuste por fadiga e reorganização automática da semana ao faltar treino.
