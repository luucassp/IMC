import { useEffect, useRef, useState } from "react";
import { CICLO, CICLO_INFO } from "../data/ciclo.js";
import { isoLocal, diaPorData, proximoDia } from "../lib/ciclo.js";
import { api } from "../lib/api.js";

const ACC = "#ff8c1a";
const ACC2 = "#ffb14d";

function Bloco({ blk }) {
  if (blk.nota) {
    return (
      <div style={{ background: "#1e2027", borderLeft: `3px solid ${ACC}`, padding: "8px 12px", borderRadius: "0 8px 8px 0", fontSize: 13, color: "#9a9da8", marginTop: 10, lineHeight: 1.55 }}>
        {blk.nota}
      </div>
    );
  }
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: ACC2, fontWeight: 700, marginBottom: 6 }}>
        {blk.titulo}
        {blk.extra && <span style={{ color: "#9a9da8", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}> · {blk.extra}</span>}
      </div>
      {blk.texto && <p style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}>{blk.texto}</p>}
      {blk.itens && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {blk.itens.map((item, i) => (
            <li key={i} style={{ padding: "3px 0 3px 14px", position: "relative", fontSize: 14, lineHeight: 1.55 }}>
              <span style={{ position: "absolute", left: 0, top: 12, width: 6, height: 2, background: ACC }} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Dia({ dia, aberto, hoje, feito, podeConcluir, onToggle, onConcluir }) {
  return (
    <div style={{ background: "#17181d", border: `1px solid ${hoje ? ACC : feito ? "#3ecf8e55" : "#2a2d36"}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        className="ciclo-day-head"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", background: "none", border: "none", color: "inherit", textAlign: "left", transition: "background .15s" }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: feito ? "#3ecf8e" : ACC, minWidth: 52, lineHeight: 1.2 }}>
          {dia.dow}<br />{dia.num}
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 15, fontWeight: 600, display: "block" }}>{dia.title}</strong>
          <small style={{ color: "#9a9da8", fontSize: 12 }}>{dia.subtitle}</small>
        </div>
        {feito && <span style={{ color: "#3ecf8e", fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>✓ FEITO</span>}
        {hoje && !feito && <span style={{ color: ACC, fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>HOJE</span>}
        <span style={{ color: "#9a9da8", transform: aberto ? "rotate(90deg)" : "none", transition: "transform .2s", fontSize: 12 }}>▶</span>
      </button>

      {aberto && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #2a2d36" }}>
          {dia.blocks.map((blk, i) => <Bloco key={i} blk={blk} />)}

          {podeConcluir && !feito && (
            <button
              type="button"
              onClick={onConcluir}
              style={{ width: "100%", marginTop: 16, background: ACC, color: "#000", border: "none", borderRadius: 999, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              ✓ Concluir treino
            </button>
          )}
          {feito && (
            <div style={{ marginTop: 16, textAlign: "center", color: "#3ecf8e", fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>
              ✓ Treino concluído
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Ciclo({ token, onVoltar }) {
  const hoje = isoLocal(new Date());
  // Dia em destaque: hoje se for dia de treino; senão o próximo (ou o 1º do ciclo).
  const diaFoco = diaPorData(hoje) ? hoje : (proximoDia(hoje)?.date ?? CICLO[0].dias[0].date);
  const [historico, setHistorico] = useState([]);
  const [abertos, setAbertos] = useState(() => new Set([diaFoco]));
  const hojeRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    api.getHistorico(token).then((h) => { if (ativo) setHistorico(h); }).catch(() => {});
    return () => { ativo = false; };
  }, [token]);

  useEffect(() => {
    hojeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const feitos = new Set(historico.map((h) => h.diaId));

  const toggle = (date) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  const concluir = async (dia) => {
    try {
      const novo = await api.addHistorico(token, { diaId: dia.date, diaLabel: `${dia.dow} ${dia.num}`, foco: dia.title });
      setHistorico((prev) => [novo, ...prev]);
    } catch {}
  };

  return (
    <div style={{ background: "#0e0f12", minHeight: "100vh", color: "#e8e8ea", paddingBottom: 60 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
        <header style={{ padding: "28px 0 20px", borderBottom: `2px solid ${ACC}` }}>
          <button
            type="button"
            onClick={onVoltar}
            style={{ background: "none", border: "none", color: "#9a9da8", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 16 }}
          >
            ← Voltar
          </button>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: 0.5, margin: 0 }}>
            MAYREN<span style={{ color: ACC }}>CROSFIT</span>
          </h1>
          <p style={{ color: "#9a9da8", fontSize: 13, marginTop: 4 }}>
            {CICLO_INFO.ciclo} · {CICLO_INFO.periodo} · {CICLO_INFO.estilo} · {CICLO_INFO.coach}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0 8px" }}>
            {CICLO_INFO.tags.map((t) => (
              <span key={t.id} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: `${t.cor}26`, color: t.cor }}>
                {t.label}
              </span>
            ))}
          </div>
        </header>

        {CICLO.map((semana) => (
          <div key={semana.id} style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: ACC, fontWeight: 700, marginBottom: 4 }}>{semana.titulo}</h2>
            <p style={{ color: "#9a9da8", fontSize: 13, marginBottom: 12 }}>{semana.sub}</p>

            {semana.dias.map((dia) => (
              <div key={dia.date} ref={dia.date === diaFoco ? hojeRef : null}>
                <Dia
                  dia={dia}
                  aberto={abertos.has(dia.date)}
                  hoje={dia.date === hoje}
                  feito={feitos.has(dia.date)}
                  podeConcluir={dia.date <= hoje}
                  onToggle={() => toggle(dia.date)}
                  onConcluir={() => concluir(dia)}
                />
              </div>
            ))}

            {semana.descanso && (
              <div style={{ background: "#1e2027", border: "1px dashed #2a2d36", borderRadius: 12, padding: "12px 16px", color: "#9a9da8", fontSize: 13, marginBottom: 10 }}>
                {semana.descanso}
              </div>
            )}
          </div>
        ))}

        <footer style={{ marginTop: 40, textAlign: "center", color: "#9a9da8", fontSize: 12 }}>
          <p><strong style={{ color: ACC }}>{CICLO_INFO.nome}</strong> · {CICLO_INFO.coach}</p>
          <p style={{ marginTop: 4 }}>{CICLO_INFO.rodape}</p>
        </footer>
      </div>
    </div>
  );
}
