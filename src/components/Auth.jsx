import { useState } from "react";
import { api } from "../lib/api.js";

const accent = "#c8ff00";

const inputStyle = {
  width: "100%",
  background: "#141414",
  border: "1px solid #222",
  borderRadius: 8,
  padding: "14px 16px",
  fontSize: 16,
  color: "#f0ece4",
  marginBottom: 12,
};

export default function Auth({ onAutenticado }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ehRegistro = modo === "registro";

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const sessao = ehRegistro
        ? await api.register({ email, senha, nome })
        : await api.login({ email, senha });
      onAutenticado(sessao);
    } catch (err) {
      setErro(err.message || "Não foi possível continuar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "60px 20px" }}>
      <span style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 3, textTransform: "uppercase" }}>
        IMC + Treino
      </span>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "6px 0 4px", letterSpacing: -0.5 }}>
        {ehRegistro ? "Criar conta" : "Entrar"}
      </h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 28px", fontFamily: "monospace" }}>
        Seu personal inteligente no bolso
      </p>

      <form onSubmit={enviar}>
        {ehRegistro && (
          <input
            style={inputStyle}
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
            required
          />
        )}
        <input
          style={inputStyle}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete={ehRegistro ? "new-password" : "current-password"}
          required
        />

        {erro && (
          <div style={{ background: "#FF3B3B15", border: "1px solid #FF3B3B40", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff8c8c", marginBottom: 12 }}>
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          style={{
            width: "100%",
            background: enviando ? "#1a1a1a" : accent,
            color: enviando ? "#555" : "#000",
            border: "none",
            borderRadius: 8,
            padding: "15px 20px",
            fontSize: 15,
            fontWeight: 700,
            cursor: enviando ? "default" : "pointer",
            letterSpacing: 0.5,
          }}
        >
          {enviando ? "..." : ehRegistro ? "Criar conta" : "Entrar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setModo(ehRegistro ? "login" : "registro"); setErro(""); }}
        style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, marginTop: 20, textAlign: "center", width: "100%" }}
      >
        {ehRegistro ? "Já tem conta? Entrar" : "Não tem conta? Criar agora"}
      </button>
    </div>
  );
}
