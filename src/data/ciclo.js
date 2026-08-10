// Ciclo de treino CrossFit — Mayrencrosfit. Um arquivo por mês (cicloJulho.js, cicloAgosto.js, ...).
// Este arquivo concatena as semanas de todos os meses e mantém o CICLO_INFO do ciclo em curso.
// Pra adicionar um novo mês: criar cicloMesX.js no mesmo formato, importar aqui e:
//   1. incluir suas semanas no array CICLO (spread, na ordem cronológica)
//   2. atualizar CICLO_INFO (ciclo/periodo/rodape) pro novo mês em curso

import { SEMANAS_JULHO } from "./cicloJulho.js";
import { SEMANAS_AGOSTO } from "./cicloAgosto.js";

export const CICLO_INFO = {
  nome: "MAYRENCROSFIT",
  ciclo: "Ciclo Agosto 2026",
  periodo: "11/08 – 06/09",
  coach: "Coach Sergio · CF-L4",
  estilo: "Estilo Cross do Brasil",
  rodape: "Clean e Snatch sempre em dias separados · Deadlift 1x/semana · Sem argolas na academia — muscle-up e dip sempre na barra fixa",
  tags: [
    { id: "lpo", label: "LPO", cor: "#4d9fff" },
    { id: "gin", label: "Ginástica", cor: "#ff5d7a" },
    { id: "end", label: "Endurance", cor: "#3ecf8e" },
  ],
};

export const CICLO = [...SEMANAS_JULHO, ...SEMANAS_AGOSTO];
