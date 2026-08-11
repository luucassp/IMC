// Timer avançado tipo "box": sugere um modo de contagem a partir do texto de um
// bloco de treino (título/extra/texto/itens) e toca beeps via Web Audio (sem assets).

import { parseDescanso } from "./tempo.js";

export const MODOS = [
  { id: "countdown", label: "Contagem regressiva" },
  { id: "intervalos", label: "Intervalos (EMOM/Tabata)" },
  { id: "rounds", label: "Séries + descanso" },
  { id: "fortime", label: "For time" },
];

function textoDoBloco(blk) {
  return [blk.titulo, blk.extra, blk.texto, ...(blk.itens ?? [])].filter(Boolean).join(" ");
}

// Extrai minutos de um trecho "· 8 min" no título (ex.: "Skill · 10 min").
function minutosDoTitulo(titulo) {
  const m = String(titulo ?? "").match(/(\d+)\s*min/i);
  return m ? Number(m[1]) : null;
}

// "3:30" ou "3" (minutos) → segundos.
function minSegParaSegundos(min, seg) {
  return Number(min) * 60 + Number(seg || 0);
}

// Sugere uma configuração de timer a partir de um bloco { titulo, extra?, texto?, itens? }.
// Sempre retorna algo utilizável — o usuário revisa/edita antes de iniciar.
export function sugerirTimer(blk) {
  const texto = textoDoBloco(blk);
  const tituloCurto = String(blk.titulo ?? "Timer").split("·")[0].trim();

  // EMOM N — N rounds de 1 min, sem descanso entre eles.
  let m = texto.match(/EMOM\s*(\d+)/i);
  if (m) {
    return { modo: "intervalos", label: `EMOM ${m[1]}`, rounds: Number(m[1]), trabalho: 60, descanso: 0 };
  }

  // "A cada 4 min x 5 rounds" / "A cada 3:30 x 5 rounds".
  m = texto.match(/a cada\s*(\d+)(?::(\d+))?\s*min[^x]*x\s*(\d+)\s*rounds?/i);
  if (m) {
    const trabalho = minSegParaSegundos(m[1], m[2]);
    return { modo: "intervalos", label: `${tituloCurto} · a cada ${m[1]}${m[2] ? `:${m[2]}` : ""} min`, rounds: Number(m[3]), trabalho, descanso: 0 };
  }

  // "30s ON / 30s OFF" (+ opcional "2 min entre blocos" — ignorado na sugestão, é só um chute).
  m = texto.match(/(\d+)\s*s\s*ON\s*\/\s*(\d+)\s*s\s*OFF/i);
  if (m) {
    const trabalho = Number(m[1]);
    const descanso = Number(m[2]);
    const totalMin = minutosDoTitulo(blk.titulo) ?? minutosDoTitulo(blk.extra) ?? 6;
    const rounds = Math.max(1, Math.round((totalMin * 60) / (trabalho + descanso)));
    return { modo: "intervalos", label: `${tituloCurto} · ${m[1]}s ON / ${m[2]}s OFF`, rounds, trabalho, descanso };
  }

  // AMRAP N.
  m = texto.match(/AMRAP\s*(\d+)/i);
  if (m) {
    return { modo: "countdown", label: `AMRAP ${m[1]}`, minutos: Number(m[1]) };
  }

  // For time (com cap opcional).
  if (/for time/i.test(texto)) {
    const cap = texto.match(/cap\s*(\d+)/i);
    return { modo: "fortime", label: "FOR TIME", capMinutos: cap ? Number(cap[1]) : null };
  }

  // "5x5", "4x6", "3x3", "5x2" com descanso em algum lugar do texto.
  m = texto.match(/(\d+)\s*x\s*(\d+)/i);
  if (m) {
    const descansoMatch = texto.match(/descanso\s*([\d:,.]+\s*(?:min|s)?)/i);
    const descanso = descansoMatch ? parseDescanso(descansoMatch[1]) : 120;
    return { modo: "rounds", label: `${m[1]}×${m[2]}`, rounds: Number(m[1]), descanso };
  }

  // Duração simples lida do título ("Mobilidade · 3 min", "Força · 14 min"...).
  const minutos = minutosDoTitulo(blk.titulo);
  if (minutos) {
    return { modo: "countdown", label: tituloCurto, minutos };
  }

  // Fallback genérico — editável.
  return { modo: "countdown", label: tituloCurto, minutos: 10 };
}

// ── Som (Web Audio, sem arquivos) ──────────────────────────────────────────

let audioCtx = null;
function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, duracao, atraso = 0) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const inicio = c.currentTime + atraso;
    gain.gain.setValueAtTime(0.0001, inicio);
    gain.gain.exponentialRampToValueAtTime(0.28, inicio + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
    osc.connect(gain).connect(c.destination);
    osc.start(inicio);
    osc.stop(inicio + duracao + 0.02);
  } catch {
    /* Web Audio indisponível — segue silencioso */
  }
}

export const som = {
  tick: () => tone(660, 0.08),
  inicioTrabalho: () => tone(880, 0.22),
  inicioDescanso: () => tone(392, 0.22),
  // Alarme de fim — mais insistente que os outros sons, pra não passar despercebido no barulho da academia.
  fim: () => {
    for (let i = 0; i < 5; i++) tone(1046, 0.25, i * 0.35);
  },
};

export function vibrar(padrao) {
  if (navigator.vibrate) navigator.vibrate(padrao);
}
