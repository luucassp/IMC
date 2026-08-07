import { useState } from "react";
import { motion } from "motion/react";
import { WODS } from "../data/wods.js";
import { CICLO_INFO } from "../data/ciclo.js";
import { api } from "../lib/api.js";
import BlocoTreino from "./BlocoTreino.jsx";
import { ACCENT, SUCCESS, cardStyle } from "../lib/theme.js";

const ACC = ACCENT;

const TAGS = Object.fromEntries(CICLO_INFO.tags.map((t) => [t.id, t]));

function Wod({ wod, aberto, registrado, onToggle, onRegistrar }) {
  return (
    <div style={{ ...cardStyle({ padding: 0, radius: 12 }), border: `1px solid ${registrado ? `${SUCCESS}55` : "#2a2d36"}`, marginBottom: 10, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        className="ciclo-day-head"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", background: "none", border: "none", color: "inherit", textAlign: "left", transition: "background .15s" }}
      >
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 15, fontWeight: 600, display: "block" }}>{wod.nome}</strong>
          <small style={{ color: "#9a9da8", fontSize: 12 }}>{wod.tipo} · {wod.subtitulo}</small>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {wod.tags.map((id) => {
            const t = TAGS[id];
            return t ? (
              <span key={id} style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: `${t.cor}26`, color: t.cor }}>
                {t.label}
              </span>
            ) : null;
          })}
        </div>
        <span style={{ color: "#9a9da8", transform: aberto ? "rotate(90deg)" : "none", transition: "transform .2s", fontSize: 12 }}>▶</span>
      </button>

      {aberto && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #2a2d36" }}>
          {wod.blocks.map((blk, i) => <BlocoTreino key={i} blk={blk} />)}

          <div style={{ marginTop: 14, fontSize: 11, color: "#6a6d78", fontFamily: "monospace" }}>
            FONTE: {wod.fonte}
          </div>

          {registrado ? (
            <div style={{ marginTop: 14, textAlign: "center", color: SUCCESS, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>
              ✓ Registrado hoje
            </div>
          ) : (
            <button
              type="button"
              onClick={onRegistrar}
              style={{ width: "100%", marginTop: 14, background: ACC, color: "#000", border: "none", borderRadius: 999, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              ✓ Fiz este treino hoje
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Biblioteca({ token, onVoltar }) {
  const [abertos, setAbertos] = useState(() => new Set());
  const [registrados, setRegistrados] = useState(() => new Set());

  const toggle = (id) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const registrar = async (wod) => {
    try {
      await api.addHistorico(token, { diaId: `wod:${wod.id}`, diaLabel: "WOD", foco: wod.nome });
      setRegistrados((prev) => new Set(prev).add(wod.id));
    } catch {
      /* modo local não falha, mas mantém o app estável se falhar */
    }
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8ea", paddingBottom: 60 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
        <motion.header
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ padding: "28px 0 20px", borderBottom: `2px solid ${ACC}` }}
        >
          <button
            type="button"
            onClick={onVoltar}
            style={{ background: "none", border: "none", color: "#9a9da8", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 16 }}
          >
            ← Voltar
          </button>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: 0.5, margin: 0 }}>
            BIBLIOTECA DE <span style={{ color: ACC }}>WODS</span>
          </h1>
          <p style={{ color: "#9a9da8", fontSize: 13, marginTop: 4 }}>
            {WODS.length} treinos guardados como fonte · puxe em qualquer dia fora do ciclo
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
          style={{ marginTop: 24 }}
        >
          {WODS.map((wod) => (
            <Wod
              key={wod.id}
              wod={wod}
              aberto={abertos.has(wod.id)}
              registrado={registrados.has(wod.id)}
              onToggle={() => toggle(wod.id)}
              onRegistrar={() => registrar(wod)}
            />
          ))}
        </motion.div>

        <footer style={{ marginTop: 40, textAlign: "center", color: "#9a9da8", fontSize: 12 }}>
          <p><strong style={{ color: ACC }}>{CICLO_INFO.nome}</strong> · Biblioteca de referência</p>
          <p style={{ marginTop: 4 }}>Cargas em kg com o equivalente original entre parênteses</p>
        </footer>
      </div>
    </div>
  );
}
