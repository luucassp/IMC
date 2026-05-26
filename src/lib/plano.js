// Monta o plano de treino concreto a partir do perfil + recomendação.

import { DIAS, SPLITS, DISTRIBUICAO_SEMANA, DIAS_SEMANA } from "../data/planos.js";

function idsDoSplit(divisao, dias) {
  const base = SPLITS[divisao] ?? SPLITS["Full Body"];
  // Full Body com menos dias usa menos sessões distintas (1–3).
  if (divisao === "Full Body") return base.slice(0, Math.min(dias, 3));
  return base;
}

// Distribui as sessões nos dias da semana, ciclando o split e marcando descansos.
function montarSemana(idsSplit, dias) {
  const treinoEm = DISTRIBUICAO_SEMANA[dias] ?? DISTRIBUICAO_SEMANA[3];
  let i = 0;
  return DIAS_SEMANA.map((nome, idx) => {
    if (treinoEm.includes(idx)) {
      const session = idsSplit[i % idsSplit.length];
      i += 1;
      return { day: nome, session, rest: false };
    }
    return { day: nome, session: null, rest: true };
  });
}

export function gerarPlano(perfil, recomendacao) {
  const dias = recomendacao.dias;
  const idsSplit = idsDoSplit(recomendacao.divisao, dias);

  // Dias únicos exibidos no seletor (na ordem do split).
  const idsUnicos = [...new Set(idsSplit)];
  const diasTreino = idsUnicos.map((id) => DIAS[id]).filter(Boolean);

  const schedule = montarSemana(idsSplit, dias);

  const semAcademia =
    !perfil.equipamentos?.includes("academia") && !perfil.equipamentos?.includes("halteres");

  return {
    divisao: recomendacao.divisao,
    days: diasTreino,
    schedule,
    semAcademia,
  };
}
