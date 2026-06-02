// Cliente HTTP da API. O token é passado pelo App (que o guarda no storage).
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3333";

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const texto = await res.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!res.ok) {
    const msg = dados?.message ?? "Erro na requisição.";
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return dados;
}

export const api = {
  register: (dados) => request("/auth/register", { method: "POST", body: dados }),
  login: (dados) => request("/auth/login", { method: "POST", body: dados }),
  loginGoogle: (idToken) => request("/auth/google", { method: "POST", body: { idToken } }),
  me: (token) => request("/auth/me", { token }),
  getPerfil: (token) => request("/perfil", { token }),
  putPerfil: (token, perfil) => request("/perfil", { method: "PUT", token, body: perfil }),
  getHistorico: (token) => request("/historico", { token }),
  addHistorico: (token, entrada) => request("/historico", { method: "POST", token, body: entrada }),
  getRegistros: (token) => request("/registros", { token }),
  addRegistro: (token, entrada) => request("/registros", { method: "POST", token, body: entrada }),
  getDashboard: (token) => request("/dashboard", { token }),
  gerarTreinoIA: (token, { fadiga, force } = {}) =>
    request("/treino/ia", { method: "POST", token, body: { fadiga, force } }),
};
