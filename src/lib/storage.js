// Persistência local (localStorage). Boundary do navegador → try/catch
// protege contra modo privado / cota cheia / JSON corrompido.

const PREFIXO = "imc-treino";
const K_PERFIL = `${PREFIXO}:perfil:v1`;
const K_HIST = `${PREFIXO}:historico:v1`;

function ler(chave, fallback) {
  try {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function escrever(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // localStorage indisponível ou cheio — segue sem persistir.
  }
}

function remover(chave) {
  try {
    localStorage.removeItem(chave);
  } catch {
    /* ignora */
  }
}

export function carregarPerfil() {
  return ler(K_PERFIL, null);
}

export function salvarPerfil(perfil) {
  escrever(K_PERFIL, perfil);
}

export function limparPerfil() {
  remover(K_PERFIL);
}

export function carregarHistorico() {
  return ler(K_HIST, []);
}

export function registrarTreino(entrada) {
  const novo = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    data: new Date().toISOString(),
    ...entrada,
  };
  const historico = [novo, ...carregarHistorico()];
  escrever(K_HIST, historico);
  return historico;
}

export function limparHistorico() {
  escrever(K_HIST, []);
}
