# IMC + Treino

App de treino personalizado que começa pelo cálculo de IMC. O usuário passa por
um **onboarding** (perfil físico) e recebe uma recomendação de treino baseada em
regras — divisão, frequência, repetições, descanso e ênfase.

Projeto em evolução, construído passo a passo a partir da calculadora de IMC
original (preservada em [`legacy/`](./legacy)).

## Stack

- React 18 + Vite
- Sem backend ainda — recomendação por regras fixas no front-end

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
    Resultado.jsx    # IMC + classificação + treino recomendado
  data/
    onboarding.js    # opções dos campos (objetivos, níveis, equipamentos...)
  lib/
    imc.js           # cálculo e classificação de IMC (padrão OMS)
    recomendacao.js  # motor de recomendação por regras
  App.jsx
  main.jsx
legacy/              # calculadora de IMC original (HTML/CSS/JS puro)
```

## Próximos passos

- Mostrar o plano de treino completo (dias, exercícios, progressão) a partir da recomendação.
- Persistir o perfil (histórico) e login.
- Substituir as regras fixas por personalização adaptativa.
