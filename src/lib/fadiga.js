// Ajuste de intensidade conforme o estado do usuário no dia ("Como você está hoje?").

export const NIVEIS_FADIGA = [
  { id: "exausto", label: "Exausto", emoji: "😴", dica: "Reduza a carga ~10% e pare 2–3 reps antes da falha (RIR 3). Volume reduzido hoje." },
  { id: "normal", label: "Normal", emoji: "💪", dica: "Siga o plano como está." },
  { id: "pronto", label: "Pronto pra tudo", emoji: "🔥", dica: "Mande ver: 1 rep extra ou série a mais nos principais." },
];

// Ajusta o número de séries dos exercícios conforme a fadiga.
// exausto: -1 série (mínimo 2). pronto: +1 série nos compostos (PRINCIPAL).
export function ajustarExercicios(exercicios, fadigaId) {
  if (!fadigaId || fadigaId === "normal") return exercicios;

  return exercicios.map((ex) => {
    const base = parseInt(ex.sets, 10);
    if (!Number.isFinite(base)) return ex;

    if (fadigaId === "exausto") {
      const novo = Math.max(2, base - 1);
      return { ...ex, sets: String(novo), ajusteSets: novo - base };
    }
    if (fadigaId === "pronto" && ex.category === "PRINCIPAL") {
      return { ...ex, sets: String(base + 1), ajusteSets: 1 };
    }
    return ex;
  });
}
