import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api.js";
import CelestialSphere from "./ui/celestial-sphere";

const accent = "#c8ff00";
const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

// Carrega o script do Google Identity Services uma única vez.
function carregarGIS() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existente = document.getElementById("gis-script");
    if (existente) {
      existente.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.id = "gis-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

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
  const googleBtnRef = useRef(null);

  const ehRegistro = modo === "registro";

  // Botão "Continuar com o Google" (só se VITE_GOOGLE_CLIENT_ID estiver definido).
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelado = false;
    carregarGIS()
      .then(() => {
        if (cancelado || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            try {
              const sessao = await api.loginGoogle(resp.credential);
              onAutenticado(sessao);
            } catch (err) {
              setErro(err.message || "Falha no login com Google.");
            }
          },
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            text: "continue_with",
            width: 320,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [onAutenticado]);

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
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#000" }}>
      <CelestialSphere
        hue={210}
        speed={0.4}
        zoom={1.2}
        particleSize={4.0}
        className="absolute inset-0 w-full h-full"
      />
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        padding: "48px 32px",
        background: "rgba(10,10,10,0.75)",
        backdropFilter: "blur(18px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
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

      {GOOGLE_CLIENT_ID && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#222" }} />
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#555" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#222" }} />
          </div>
          <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center" }} />
        </>
      )}

      <button
        type="button"
        onClick={() => { setModo(ehRegistro ? "login" : "registro"); setErro(""); }}
        style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, marginTop: 20, textAlign: "center", width: "100%" }}
      >
        {ehRegistro ? "Já tem conta? Entrar" : "Não tem conta? Criar agora"}
      </button>
      </div>
    </div>
  );
}
