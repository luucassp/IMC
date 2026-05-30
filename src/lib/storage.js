// Token de autenticação no localStorage. Boundary do navegador → try/catch
// protege contra modo privado / cota cheia. Perfil, histórico e registros
// agora vivem na API.

const K_TOKEN = "imc-treino:token:v1";

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
  try {
    localStorage.removeItem(K_TOKEN);
  } catch {
    /* ignora */
  }
}
