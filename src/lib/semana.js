// Status da semana atual e sugestão de reorganização ao faltar treino.

// Índice 0=SEG..6=DOM a partir de um Date (getDay: 0=Dom..6=Sáb).
function indiceDia(date) {
  return (date.getDay() + 6) % 7;
}

// Segunda-feira 00:00 da semana que contém `agora`.
function inicioSemana(agora) {
  const d = new Date(agora);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - indiceDia(d));
  return d.getTime();
}

// Para cada dia do schedule (ordem SEG..DOM), define o status com base no
// histórico desta semana: feito, hoje, perdido, proximo ou descanso.
export function planejarSemana(schedule, historico, agora = new Date()) {
  const hojeIdx = indiceDia(agora);
  const inicio = inicioSemana(agora);

  // Quantas vezes cada sessão foi concluída nesta semana.
  const concluidos = new Map();
  for (const h of historico) {
    if (new Date(h.data).getTime() >= inicio) {
      concluidos.set(h.diaId, (concluidos.get(h.diaId) ?? 0) + 1);
    }
  }

  const dias = schedule.map((slot, idx) => {
    if (slot.rest) return { ...slot, idx, status: "descanso" };

    let status;
    if ((concluidos.get(slot.session) ?? 0) > 0) {
      concluidos.set(slot.session, concluidos.get(slot.session) - 1);
      status = "feito";
    } else if (idx < hojeIdx) {
      status = "perdido";
    } else if (idx === hojeIdx) {
      status = "hoje";
    } else {
      status = "proximo";
    }
    return { ...slot, idx, status };
  });

  const perdidos = dias.filter((d) => d.status === "perdido");
  const livres = dias.filter((d) => d.rest && d.idx >= hojeIdx);
  const sugestoes = perdidos.map((p, k) => ({ session: p.session, para: livres[k]?.day ?? null }));

  return { dias, perdidos, sugestoes };
}
