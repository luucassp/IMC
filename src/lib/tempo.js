// Converte o texto de descanso ("90 s", "3 min", "3–4 min") em segundos.
export function parseDescanso(texto) {
  if (!texto) return 60;
  const primeiroNumero = Number(String(texto).match(/\d+/)?.[0] ?? 60);
  return /min/i.test(texto) ? primeiroNumero * 60 : primeiroNumero;
}

// Segundos → "M:SS".
export function formatarTempo(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const min = Math.floor(s / 60);
  const seg = String(s % 60).padStart(2, "0");
  return `${min}:${seg}`;
}
