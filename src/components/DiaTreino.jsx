// Página de um único dia do ciclo — versão focada do que o Ciclo mostra por dia,
// pra abrir direto no treino de hoje/próximo sem passar pela lista inteira.

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { api } from "../lib/api.js";
import { diaPorData, semanaPorData, isoLocal } from "../lib/ciclo.js";
import BlocoTreino from "./BlocoTreino.jsx";
import TopoVoltar from "./TopoVoltar.jsx";
import { ACCENT, SUCCESS } from "../lib/theme.js";
import { fadeUpVariants } from "../lib/motion.js";

const ACC = ACCENT;

export default function DiaTreino({ iso, token, onVoltar, onVerCalendario }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    let ativo = true;
    api.getHistorico(token).then((h) => { if (ativo) setHistorico(h); }).catch(() => {});
    return () => { ativo = false; };
  }, [token]);

  const dia = diaPorData(iso);
  const semana = semanaPorData(iso);
  const hoje = isoLocal(new Date());
  const feito = historico.some((h) => h.diaId === iso);
  const podeConcluir = iso <= hoje;

  const concluir = async () => {
    if (feito) return;
    try {
      const novo = await api.addHistorico(token, { diaId: dia.date, diaLabel: `${dia.dow} ${dia.num}`, foco: dia.title });
      setHistorico((prev) => [novo, ...prev]);
    } catch {
      /* modo local não falha, mas mantém o app estável se falhar */
    }
  };

  if (!dia) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8ea" }}>
        <TopoVoltar onVoltar={onVoltar} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💤</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Dia de descanso</h1>
          <p style={{ color: "#9a9da8", fontSize: 13, marginBottom: 24 }}>Sem treino programado para esta data.</p>
          <button
            type="button"
            onClick={onVerCalendario}
            style={{ background: ACC, color: "#000", border: "none", borderRadius: 999, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Ver ciclo completo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8ea", paddingBottom: 60 }}>
      <TopoVoltar onVoltar={onVoltar} titulo={`${dia.dow} ${dia.num}`} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 0" }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 20 }}>
          {semana && (
            <div style={{ fontFamily: "monospace", fontSize: 11, color: ACC, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
              {semana.titulo}
            </div>
          )}
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{dia.title}</h1>
          <p style={{ color: "#9a9da8", fontSize: 13, marginTop: 4 }}>{dia.subtitle}</p>
        </motion.div>

        <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="show">
          {dia.blocks.map((blk, i) => <BlocoTreino key={i} blk={blk} />)}
        </motion.div>

        {podeConcluir && (
          feito ? (
            <div style={{ marginTop: 20, textAlign: "center", color: SUCCESS, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>
              ✓ Treino concluído
            </div>
          ) : (
            <button
              type="button"
              onClick={concluir}
              style={{ width: "100%", marginTop: 20, background: ACC, color: "#000", border: "none", borderRadius: 999, padding: "14px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              ✓ Concluir treino
            </button>
          )
        )}

        <button
          type="button"
          onClick={onVerCalendario}
          style={{ display: "block", margin: "24px auto 0", background: "none", border: "none", color: "#9a9da8", cursor: "pointer", fontSize: 13 }}
        >
          Ver ciclo completo →
        </button>
      </div>
    </div>
  );
}
