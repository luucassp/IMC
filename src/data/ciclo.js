// Ciclo de treino CrossFit — Mayrencrosfit. Um arquivo por mês (cicloJulho.js, cicloAgosto.js, ...).
// Este arquivo concatena as semanas de todos os meses e escolhe o CICLO_INFO ativo pela data
// de hoje (o mês em curso; se estiver num intervalo sem mês definido, o próximo já programado;
// se não houver nenhum à frente, o último). Nada pra atualizar à mão ao virar o mês.
// Pra adicionar um novo mês: criar cicloMesX.js exportando SEMANAS_MESX + INFO_MESX
// ({ ciclo, periodo, inicio, fim }) no mesmo formato dos demais, e listar em CICLOS abaixo.

import { SEMANAS_JULHO, INFO_JULHO } from "./cicloJulho.js";
import { SEMANAS_AGOSTO, INFO_AGOSTO } from "./cicloAgosto.js";
import { SEMANAS_SETEMBRO, INFO_SETEMBRO } from "./cicloSetembro.js";
import { SEMANAS_OUTUBRO, INFO_OUTUBRO } from "./cicloOutubro.js";

const CICLOS = [
  { semanas: SEMANAS_JULHO, info: INFO_JULHO },
  { semanas: SEMANAS_AGOSTO, info: INFO_AGOSTO },
  { semanas: SEMANAS_SETEMBRO, info: INFO_SETEMBRO },
  { semanas: SEMANAS_OUTUBRO, info: INFO_OUTUBRO },
];

export const CICLO = CICLOS.flatMap((c) => c.semanas);

function isoHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Ciclo cujo [inicio, fim] contém hoje; senão o próximo ainda não começado; senão o último.
function cicloAtivo() {
  const hoje = isoHoje();
  return (
    CICLOS.find((c) => hoje >= c.info.inicio && hoje <= c.info.fim) ??
    CICLOS.find((c) => c.info.inicio > hoje) ??
    CICLOS[CICLOS.length - 1]
  ).info;
}

const ativo = cicloAtivo();

export const CICLO_INFO = {
  nome: "MAYRENCROSFIT",
  ciclo: ativo.ciclo,
  periodo: ativo.periodo,
  coach: "Coach Sergio · CF-L4",
  estilo: "Estilo Cross do Brasil",
  rodape: "Preparação competitiva RX · Sessões principais de 90–120 min · Segunda descanso e domingo recuperação · Clean e Snatch separados · Sem argolas — muscle-up sempre na barra fixa",
  tags: [
    { id: "lpo", label: "LPO", cor: "#4d9fff" },
    { id: "gin", label: "Ginástica", cor: "#ff5d7a" },
    { id: "end", label: "Endurance", cor: "#3ecf8e" },
  ],
};
