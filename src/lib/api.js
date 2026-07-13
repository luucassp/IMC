// Modo local: perfil, histórico e registros vivem no localStorage do navegador.
// Sem backend, sem banco — o site é 100% estático (Vercel).
// A interface é a mesma do antigo cliente HTTP; o parâmetro `token` é ignorado.

const API_URL = import.meta.env?.VITE_API_URL || "";

const K_PERFIL = "imc-treino:perfil:v1";
const K_HISTORICO = "imc-treino:historico:v1";
const K_REGISTROS = "imc-treino:registros:v1";

function ler(chave, padrao) {
  try {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : padrao;
  } catch {
    return padrao;
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* modo privado / cota cheia */
  }
}

function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function inserir(chave, entrada) {
  const novo = { id: uid(), data: new Date().toISOString(), ...entrada };
  salvar(chave, [novo, ...ler(chave, [])]);
  return novo;
}

// Agregados que antes o servidor calculava (GET /dashboard).
function computarDashboard(historico, registros) {
  const total = historico.length;
  const seteDiasAtras = Date.now() - 7 * 86400000;
  const ultimos7 = historico.filter((h) => new Date(h.data).getTime() >= seteDiasAtras).length;

  // Treinos por semana (segunda como início), últimas 6 semanas com atividade.
  const porSemana = new Map();
  for (const h of historico) {
    const d = new Date(h.data);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    porSemana.set(d.getTime(), (porSemana.get(d.getTime()) ?? 0) + 1);
  }
  const frequencia = [...porSemana.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(-6)
    .map(([ts, valor]) => ({
      label: new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      valor,
    }));

  // Progressão: maior carga do dia, por exercício.
  const progressao = {};
  const ordenados = [...registros].sort((a, b) => new Date(a.data) - new Date(b.data));
  for (const r of ordenados) {
    const dia = new Date(r.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const serie = (progressao[r.exercicio] ??= []);
    const ultimo = serie.at(-1);
    if (ultimo?.label === dia) ultimo.valor = Math.max(ultimo.valor, r.carga);
    else serie.push({ label: dia, valor: r.carga });
  }

  return { total, ultimos7, frequencia, progressao };
}

export const api = {
  getPerfil: async () => ler(K_PERFIL, null),
  putPerfil: async (_token, dto) => {
    const novo = { ...(ler(K_PERFIL, null) ?? {}), ...dto };
    salvar(K_PERFIL, novo);
    return novo;
  },
  resetPerfil: async () => {
    try {
      localStorage.removeItem(K_PERFIL);
    } catch {
      /* ignora */
    }
  },

  // Backup completo para sincronizar entre aparelhos (arquivo JSON).
  exportarDados: async () => ({
    app: "mayrencrosfit",
    versao: 1,
    exportadoEm: new Date().toISOString(),
    perfil: ler(K_PERFIL, null),
    historico: ler(K_HISTORICO, []),
    registros: ler(K_REGISTROS, []),
  }),
  importarDados: async (dados) => {
    if (!dados || typeof dados !== "object" || dados.app !== "mayrencrosfit") {
      throw new Error("Arquivo inválido — exporte o backup pelo próprio app.");
    }
    if (!Array.isArray(dados.historico) || !Array.isArray(dados.registros)) {
      throw new Error("Backup incompleto — histórico ou registros ausentes.");
    }
    if (dados.perfil) salvar(K_PERFIL, dados.perfil);
    salvar(K_HISTORICO, dados.historico);
    salvar(K_REGISTROS, dados.registros);
  },

  getHistorico: async () => ler(K_HISTORICO, []),
  addHistorico: async (_token, entrada) => inserir(K_HISTORICO, entrada),

  getRegistros: async () => ler(K_REGISTROS, []),
  addRegistro: async (_token, entrada) => inserir(K_REGISTROS, entrada),

  getDashboard: async () => computarDashboard(ler(K_HISTORICO, []), ler(K_REGISTROS, [])),

  // IA continua precisando de um servidor (a chave não pode ficar no navegador).
  // Sem VITE_API_URL configurada, o Treino Livre mostra o aviso abaixo.
  gerarTreinoIA: async (_token, dto) => {
    if (!API_URL) {
      throw new Error("IA indisponível no modo local. Configure VITE_API_URL quando tiver um backend de IA.");
    }
    const res = await fetch(`${API_URL}/ia/treino`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const texto = await res.text();
    const dados = texto ? JSON.parse(texto) : null;
    if (!res.ok) {
      const msg = dados?.message ?? "Erro ao gerar treino.";
      throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
    return dados;
  },
};
