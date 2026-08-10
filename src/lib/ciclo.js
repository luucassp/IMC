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

// Grade de calendário (semanas SEG..DOM) para um mês, com preenchimento dos
// dias do mês anterior/seguinte que completam a primeira/última semana.
// Mesmo vocabulário de status de semanaDoCiclo: feito | hoje | perdido | proximo | descanso.
export function mesDoCiclo(ano, mes, historico, agora = new Date()) {
  const hojeIso = isoLocal(agora);
  const feitos = new Set(historico.map((h) => h.diaId));

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const inicio = new Date(primeiroDia);
  inicio.setDate(inicio.getDate() - indiceDia(primeiroDia));
  const fim = new Date(ultimoDia);
  fim.setDate(fim.getDate() + (6 - indiceDia(ultimoDia)));

  const semanas = [];
  const cursor = new Date(inicio);
  while (cursor <= fim) {
    const semana = [];
    for (let i = 0; i < 7; i++) {
      const iso = isoLocal(cursor);
      const dia = diaPorData(iso);

      let status;
      if (!dia) status = "descanso";
      else if (feitos.has(iso)) status = "feito";
      else if (iso === hojeIso) status = "hoje";
      else if (iso < hojeIso) status = "perdido";
      else status = "proximo";

      semana.push({ date: iso, diaDoMes: cursor.getDate(), foraDoMes: cursor.getMonth() !== mes, dia, status });
      cursor.setDate(cursor.getDate() + 1);
    }
    semanas.push(semana);
  }

  return { ano, mes, semanas };
}

// Meses ({ano, mes}, mes 0-indexado) com pelo menos um dia programado no CICLO,
// em ordem cronológica — usado para limitar a navegação do calendário.
export function mesesDisponiveis() {
  const chaves = new Set(todosDias().map((d) => d.date.slice(0, 7)));
  return [...chaves].sort().map((chave) => {
    const [ano, mes] = chave.split("-").map(Number);
    return { ano, mes: mes - 1 };
  });
}
