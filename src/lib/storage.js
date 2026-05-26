// Persistência local (localStorage). Boundary do navegador → try/catch
// protege contra modo privado / cota cheia / JSON corrompido.

const PREFIXO = "imc-treino";
const K_PERFIL = `${PREFIXO}:perfil:v1`;
const K_HIST = `${PREFIXO}:historico:v1`;
const K_REG = `${PREFIXO}:registros:v1`;
const K_TOKEN = `${PREFIXO}:token:v1`;

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

export function carregarToken() {
  try {
    return localStorage.getItem(K_TOKEN);
  } catch {
    return null;
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(K_TOKEN, token);
  } catch {
    /* ignora */
  }
}

export function limparToken() {
  remover(K_TOKEN);
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

// Registros de carga por série (carga × reps de um exercício).
export function carregarRegistros() {
  return ler(K_REG, []);
}

export function registrarSerie(entrada) {
  const novo = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    data: new Date().toISOString(),
    ...entrada,
  };
  const registros = [novo, ...carregarRegistros()];
  escrever(K_REG, registros);
  return registros;
}
