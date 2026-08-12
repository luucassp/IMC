// Trava de acesso simples: uma senha única, verificada só no cliente via hash
// SHA-256 (Web Crypto, já embutido no navegador). Não é um sistema de contas —
// é só pra afastar quem achar o link do Vercel por acaso. A senha em texto puro
// nunca fica no código, só o hash abaixo.

const HASH_ESPERADO = "9c5cb288d53bc76aa2ec4143c36455f38a627a6d4078b5a0f61403254050f7a7";

async function hashSenha(texto) {
  const dados = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function senhaCorreta(tentativa) {
  if (!tentativa) return false;
  return (await hashSenha(tentativa)) === HASH_ESPERADO;
}
