// Calendário mensal do ciclo — visão geral pra navegar entre meses e abrir
// o treino de um dia específico (DiaTreino). Substitui a antiga lista rolável
// de semanas, que não escala bem conforme o ciclo cresce mês a mês.

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CICLO_INFO } from "../data/ciclo.js";
import { isoLocal, diaPorData, proximoDia, mesDoCiclo, mesesDisponiveis } from "../lib/ciclo.js";
import { api } from "../lib/api.js";
import TopoVoltar from "./TopoVoltar.jsx";
import { ACCENT } from "../lib/theme.js";
import { fadeUpVariants } from "../lib/motion.js";

const ACC = ACCENT;
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DOWS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

function CelulaDia({ cel, hojeIso, onAbrirDia }) {
  const clicavel = !!cel.dia;
  const feito = cel.status === "feito";
  const ehHoje = cel.date === hojeIso;
  const perdido = cel.status === "perdido";

  return (
    <button
      type="button"
      onClick={clicavel ? () => onAbrirDia(cel.date) : undefined}
      disabled={!clicavel}
      style={{
        aspectRatio: "1",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        fontSize: 13,
        fontWeight: 700,
        cursor: clicavel ? "pointer" : "default",
        opacity: cel.foraDoMes ? 0.35 : 1,
        background: feito ? ACC : "#0f0f0f",
        color: feito ? "#000" : clicavel ? "#e8e8ea" : "#444",
        border: ehHoje ? `2px solid ${ACC}` : perdido ? "1px solid #ff5d7a55" : "1px solid #1a1a1a",
        transition: "background .15s, border-color .15s",
      }}
    >
      {cel.diaDoMes}
    </button>
  );
}

export default function Ciclo({ token, onVoltar, onAbrirDia }) {
  const hoje = isoLocal(new Date());
  const meses = mesesDisponiveis();

  const diaFocoIso = diaPorData(hoje) ? hoje : (proximoDia(hoje)?.date ?? null);
  const mesInicial = diaFocoIso
    ? { ano: Number(diaFocoIso.slice(0, 4)), mes: Number(diaFocoIso.slice(5, 7)) - 1 }
    : meses[0];

  const [foco, setFoco] = useState(mesInicial);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    let ativo = true;
    api.getHistorico(token).then((h) => { if (ativo) setHistorico(h); }).catch(() => {});
    return () => { ativo = false; };
  }, [token]);

  const idxAtual = meses.findIndex((m) => m.ano === foco.ano && m.mes === foco.mes);
  const temAnterior = idxAtual > 0;
  const temProximo = idxAtual >= 0 && idxAtual < meses.length - 1;

  function irar(delta) {
    const novoIdx = idxAtual + delta;
    if (novoIdx < 0 || novoIdx >= meses.length) return;
    setFoco(meses[novoIdx]);
  }

  const { semanas } = mesDoCiclo(foco.ano, foco.mes, historico);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8ea", paddingBottom: 60 }}>
      <TopoVoltar onVoltar={onVoltar} titulo="Ciclo de treinos" />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>
        <motion.header
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ padding: "20px 0 20px", borderBottom: `2px solid ${ACC}` }}
        >
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
        </motion.header>

        <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="show" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button
              type="button" onClick={() => irar(-1)} disabled={!temAnterior}
              style={{ background: "none", border: "none", color: temAnterior ? ACC : "#333", fontSize: 22, cursor: temAnterior ? "pointer" : "default", padding: "4px 12px" }}
            >
              ‹
            </button>
            <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
              {MESES[foco.mes]} {foco.ano}
            </div>
            <button
              type="button" onClick={() => irar(1)} disabled={!temProximo}
              style={{ background: "none", border: "none", color: temProximo ? ACC : "#333", fontSize: 22, cursor: temProximo ? "pointer" : "default", padding: "4px 12px" }}
            >
              ›
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {DOWS.map((dow) => (
              <div key={dow} style={{ textAlign: "center", fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 0.5 }}>{dow}</div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {semanas.map((semana, si) => (
              <div key={si} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {semana.map((cel) => (
                  <CelulaDia key={cel.date} cel={cel} hojeIso={hoje} onAbrirDia={onAbrirDia} />
                ))}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap", fontSize: 11, color: "#9a9da8", fontFamily: "monospace" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: ACC, marginRight: 6, verticalAlign: -1 }} />feito</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, border: `2px solid ${ACC}`, marginRight: 6, verticalAlign: -1 }} />hoje</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, border: "1px solid #ff5d7a", marginRight: 6, verticalAlign: -1 }} />perdido</span>
          </div>
        </motion.div>

        <footer style={{ marginTop: 40, textAlign: "center", color: "#9a9da8", fontSize: 12 }}>
          <p><strong style={{ color: ACC }}>{CICLO_INFO.nome}</strong> · {CICLO_INFO.coach}</p>
          <p style={{ marginTop: 4 }}>{CICLO_INFO.rodape}</p>
        </footer>
      </div>
    </div>
  );
}
