// Helpers do ciclo CrossFit: sessão por data e status da semana atual.

import { CICLO } from "../data/ciclo.js";

// "YYYY-MM-DD" no fuso local.
export function isoLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todosDias() {
  return CICLO.flatMap((semana) => semana.dias);
}

// Dia do ciclo para uma data ("YYYY-MM-DD"), ou null (descanso / fora do ciclo).
export function diaPorData(iso) {
  return todosDias().find((d) => d.date === iso) ?? null;
}

// Semana em que a data cai, ou null.
export function semanaPorData(iso) {
  return CICLO.find((s) => s.dias.some((d) => d.date === iso)) ?? null;
}

// Próximo dia de treino estritamente após a data.
export function proximoDia(iso) {
  return todosDias().find((d) => d.date > iso) ?? null;
}

// Índice 0=SEG..6=DOM.
function indiceDia(date) {
  return (date.getDay() + 6) % 7;
}

const DOWS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

// Semana corrente (SEG..DOM) com o dia do ciclo de cada data e status:
// feito | hoje | perdido | proximo | descanso.
export function semanaDoCiclo(historico, agora = new Date()) {
  const hojeIdx = indiceDia(agora);
  const inicio = new Date(agora);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - hojeIdx);

  const feitos = new Set(historico.map((h) => h.diaId));

  return DOWS.map((dow, idx) => {
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + idx);
    const iso = isoLocal(data);
    const dia = diaPorData(iso);

    let status;
    if (!dia) status = "descanso";
    else if (feitos.has(iso)) status = "feito";
    else if (idx < hojeIdx) status = "perdido";
    else if (idx === hojeIdx) status = "hoje";
    else status = "proximo";

    return { dow, date: iso, diaDoMes: data.getDate(), dia, status };
  });
}
