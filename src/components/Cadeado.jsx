// Tela de bloqueio — pede a senha antes de mostrar o app. Ver src/lib/cadeado.js.

import { useState } from "react";
import { senhaCorreta } from "../lib/cadeado.js";
import { ACCENT } from "../lib/theme.js";

const ACC = ACCENT;
const CHAVE_DESBLOQUEADO = "mayrencrosfit:desbloqueado";

export default function Cadeado({ onDesbloquear }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [verificando, setVerificando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    if (!senha || verificando) return;
    setVerificando(true);
    setErro(false);
    const ok = await senhaCorreta(senha);
    if (ok) {
      localStorage.setItem(CHAVE_DESBLOQUEADO, "1");
      onDesbloquear();
    } else {
      setErro(true);
      setSenha("");
      setVerificando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#f0ece4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
      }}
    >
      <div style={{ fontFamily: "monospace", fontSize: 11, color: ACC, letterSpacing: 3, marginBottom: 8 }}>MAYRENCROSFIT</div>
      <div style={{ fontSize: 40, marginBottom: 24 }}>🔒</div>

      <form onSubmit={entrar} style={{ width: "100%", maxWidth: 320 }}>
        <input
          type="password"
          inputMode="text"
          autoFocus
          placeholder="Senha"
          value={senha}
          onChange={(e) => { setSenha(e.target.value); setErro(false); }}
          style={{
            width: "100%",
            background: "#141414",
            border: `1px solid ${erro ? "#ff5d7a" : "#2a2a2a"}`,
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 16,
            color: "#f0ece4",
            textAlign: "center",
            letterSpacing: 2,
          }}
        />
        {erro && (
          <div style={{ color: "#ff5d7a", fontSize: 12, textAlign: "center", marginTop: 10, fontFamily: "monospace" }}>
            Senha incorreta
          </div>
        )}
        <button
          type="submit"
          disabled={!senha || verificando}
          style={{
            width: "100%",
            marginTop: 16,
            background: senha ? ACC : "#1a1a1a",
            color: senha ? "#000" : "#444",
            border: "none",
            borderRadius: 999,
            padding: "14px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: senha ? "pointer" : "not-allowed",
          }}
        >
          {verificando ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
