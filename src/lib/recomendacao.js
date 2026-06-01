// Motor de recomendação por regras fixas (RF03 — geração automática).
// Recebe o perfil do onboarding + IMC e devolve a estrutura sugerida de treino.

const DIVISAO_POR_DIAS = {
  1: "Full Body",
  2: "Full Body",
  3: "Full Body",
  4: "Upper / Lower",
  5: "Push / Pull / Legs + Upper",
  6: "Push / Pull / Legs (2x)",
  7: "Push / Pull / Legs (2x)",
};

export const PERFIL_OBJETIVO = {
  emagrecimento: { reps: "12–15", descanso: "30–60 s", cardio: "20–30 min pós-treino", enfase: "Circuitos metabólicos + déficit calórico" },
  hipertrofia: { reps: "8–12", descanso: "60–90 s", cardio: "Opcional, leve", enfase: "Volume progressivo por grupo muscular" },
  forca: { reps: "3–6", descanso: "3–5 min", cardio: "Mínimo", enfase: "Cargas altas nos compostos, técnica acima de tudo" },
  condicionamento: { reps: "10–15", descanso: "45–60 s", cardio: "Intervalado (HIIT)", enfase: "Densidade e recuperação entre estímulos" },
  mobilidade: { reps: "Tempo / amplitude", descanso: "Conforme necessário", cardio: "Caminhada leve", enfase: "Amplitude articular e controle" },
  core: { reps: "12–20", descanso: "30–45 s", cardio: "Opcional", enfase: "Estabilização e anti-rotação" },
  crossfit: { reps: "AMRAP / EMOM", descanso: "Variável", cardio: "Integrado ao WOD", enfase: "Trabalho de alta intensidade variado" },
  corrida: { reps: "Distância / tempo", descanso: "Conforme plano", cardio: "Base aeróbica + tiros", enfase: "Progressão de volume e ritmo" },
  resistencia: { reps: "15–20", descanso: "30–45 s", cardio: "Moderado contínuo", enfase: "Resistência muscular localizada" },
  funcional: { reps: "10–15", descanso: "45–60 s", cardio: "Integrado", enfase: "Padrões de movimento multiarticulares" },
  reabilitacao: { reps: "12–15 leves", descanso: "Conforme necessário", cardio: "Caminhada", enfase: "Carga baixa, controle e dor zero" },
};

const VOLUME_POR_NIVEL = {
  iniciante: "10–12 séries por grupo / semana",
  intermediario: "12–16 séries por grupo / semana",
  avancado: "16–20 séries por grupo / semana",
};

export function recomendarTreino(perfil, imc, classificacao) {
  const dias = Number(perfil.diasPorSemana) || 3;
  const objetivo = PERFIL_OBJETIVO[perfil.objetivo] ?? PERFIL_OBJETIVO.hipertrofia;
  const divisao = DIVISAO_POR_DIAS[dias] ?? "Full Body";
  const volume = VOLUME_POR_NIVEL[perfil.nivel] ?? VOLUME_POR_NIVEL.iniciante;

  const alertas = [];

  // Regras que cruzam IMC + objetivo.
  if (imc != null && imc >= 30 && perfil.objetivo !== "emagrecimento") {
    alertas.push(
      "Seu IMC indica obesidade. Considere priorizar emagrecimento e incluir mais trabalho aeróbico, mesmo mantendo o foco escolhido."
    );
  }
  if (imc != null && imc < 18.5 && perfil.objetivo === "emagrecimento") {
    alertas.push(
      "Seu IMC está abaixo do peso. Emagrecimento não é recomendado; foque em ganho de massa e acompanhamento profissional."
    );
  }

  // Tempo disponível curto reduz acessórios.
  if (Number(perfil.tempoPorTreino) <= 30 && dias <= 3) {
    alertas.push("Com sessões curtas, priorize 2–3 exercícios compostos por treino e reduza acessórios.");
  }

  // Restrições físicas.
  if (perfil.restricoes?.length) {
    alertas.push(
      `Restrições informadas (${perfil.restricoes.join(", ")}): substitua exercícios que gerem dor e considere acompanhamento profissional.`
    );
  }

  if (perfil.equipamentos?.includes("peso_corporal") && !perfil.equipamentos?.includes("academia")) {
    alertas.push("Sem cargas externas, progrida por variação de exercício, cadência e número de repetições.");
  }

  return {
    divisao,
    reps: objetivo.reps,
    descanso: objetivo.descanso,
    cardio: objetivo.cardio,
    enfase: objetivo.enfase,
    volume,
    dias,
    alertas,
  };
}

// Sobrescreve reps e descanso dos exercícios conforme o objetivo primário.
// Com objetivos secundários, adiciona nota de ênfase mesclada.
export function ajustarPorObjetivo(exercicios, perfil) {
  const primario = PERFIL_OBJETIVO[perfil.objetivo];
  if (!primario) return exercicios;

  const extras = (perfil.objetivosExtras || []).filter((o) => PERFIL_OBJETIVO[o]);
  const enfaseMista =
    extras.length > 0
      ? [primario.enfase, ...extras.map((o) => PERFIL_OBJETIVO[o].enfase)].join(" · ")
      : null;

  return exercicios.map((ex) => ({
    ...ex,
    reps: primario.reps,
    rest: primario.descanso,
    ...(enfaseMista ? { enfaseMista } : {}),
  }));
}
