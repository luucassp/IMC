// Detecta prescrições por percentual ("Back Squat 5x5 @ 75–78%") no texto de um
// bloco de força/LPO e calcula a carga em kg a partir do PR (1RM) cadastrado.

// Movimentos rastreados como PR — nessa ordem, do mais específico pro mais genérico,
// pra "Squat Snatch"/"Clean & Jerk" não caírem incorretamente em "Snatch"/"Clean" bare.
const MOVIMENTOS = [
  { padrao: "Squat Snatch", pr: "Squat Snatch" },
  { padrao: "Power Snatch", pr: "Power Snatch" },
  { padrao: "Snatch", pr: "Squat Snatch" },
  { padrao: "Clean & Jerk", pr: "Clean & Jerk" },
  { padrao: "Power Clean", pr: "Power Clean" },
  { padrao: "Clean", pr: "Clean & Jerk" }, // "Clean (qualquer variação)" — aproxima pelo PR de C&J
  { padrao: "Back Squat", pr: "Back Squat" },
  { padrao: "Front Squat", pr: "Front Squat" },
  { padrao: "Deadlift", pr: "Deadlift" },
];

export const PRS_RASTREADOS = ["Back Squat", "Front Squat", "Deadlift", "Clean & Jerk", "Power Clean", "Squat Snatch", "Power Snatch"];

function arredondar25(v) {
  return Math.round(v / 2.5) * 2.5;
}

// texto: string do bloco (blk.texto). prs: { [movimento]: valorKg }.
// Retorna string tipo "≈ 109–113 kg (PR: 145kg)" ou null se não der pra calcular.
export function calcularCargaTexto(texto, prs) {
  if (!texto) return null;

  const mPct = texto.match(/(\d+)(?:[–-](\d+))?\s*%/);
  if (!mPct) return null;

  const mov = MOVIMENTOS.find((m) => texto.startsWith(m.padrao));
  if (!mov) return null;

  const pr = prs?.[mov.pr];
  if (!pr) return null;

  const min = Number(mPct[1]);
  const max = mPct[2] ? Number(mPct[2]) : min;
  const kgMin = arredondar25((pr * min) / 100);
  const kgMax = arredondar25((pr * max) / 100);

  return kgMin === kgMax ? `≈ ${kgMin}kg (PR: ${pr}kg)` : `≈ ${kgMin}–${kgMax}kg (PR: ${pr}kg)`;
}

// historico: lista de { movimento, valor, data }, mais recente primeiro (como api.getPrs() retorna).
// Retorna { [movimento]: valor } só com o PR atual de cada movimento.
export function prsAtuais(historico) {
  const atuais = {};
  for (const p of historico ?? []) {
    if (!(p.movimento in atuais)) atuais[p.movimento] = p.valor;
  }
  return atuais;
}
