// Tela de evolução: consistência, progressão de carga e histórico de sessões.
// Autossuficiente — busca seus próprios dados, sem depender de perfil/plano.

import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import MiniGrafico from "./MiniGrafico.jsx";
import { ACCENT } from "../lib/theme.js";

const accent = ACCENT;

function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

export default function Evolucao({ onVoltar }) {
  const [historico, setHistorico] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [exGrafico, setExGrafico] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([api.getHistorico(), api.getDashboard()])
      .then(([h, d]) => {
        if (!ativo) return;
        setHistorico(h);
        setDashboard(d);
      })
      .catch(() => {});
    return () => { ativo = false; };
  }, []);

  const total = dashboard?.total ?? 0;
  const ultimos7 = dashboard?.ultimos7 ?? 0;
  const freqSemana = dashboard?.frequencia ?? [];
  const exercicios = dashboard ? Object.keys(dashboard.progressao) : [];
  const exSelecionado = exGrafico || exercicios[0] || "";
  const dadosCarga = dashboard?.progressao?.[exSelecionado] ?? [];

  return (
    <div style={{ background: `radial-gradient(60% 40% at 15% 0%, ${accent}12, transparent 60%), #0a0a0a`, minHeight: "100vh", color: "#f0ece4" }}>
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "20px 20px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button
            type="button"
            onClick={onVoltar}
            style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 16 }}
          >
            ← Voltar
          </button>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 3, textTransform: "uppercase" }}>Evolução</span>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "4px 0 4px", letterSpacing: -1, lineHeight: 1.1 }}>
            Consistência, cargas e histórico
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, background: "#0f0f0f", border: `1px solid ${accent}30`, borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Última semana</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: accent, lineHeight: 1 }}>{ultimos7}</div>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 4 }}>treinos</div>
          </div>
          <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Total</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#e8e4dc", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 4 }}>sessões</div>
          </div>
          <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Semanas</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#888", lineHeight: 1 }}>{freqSemana.length}</div>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 4 }}>ativas</div>
          </div>
        </div>

        {/* Consistência semanal */}
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: accent, letterSpacing: 3, marginBottom: 4 }}>CONSISTÊNCIA</div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Treinos por semana (últimas 6)</div>
          <MiniGrafico dados={freqSemana} cor={accent} />
        </div>

        {/* Progressão de carga */}
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "18px 20px", marginBottom: 24 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#00D4FF", letterSpacing: 3, marginBottom: 10 }}>PROGRESSÃO DE CARGA</div>
          {exercicios.length === 0 ? (
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              Registre séries (kg × reps) pra ver a evolução de carga aqui.
            </div>
          ) : (
            <>
              <select
                value={exSelecionado}
                onChange={(e) => setExGrafico(e.target.value)}
                style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "#f0ece4", marginBottom: 4 }}
              >
                {exercicios.map((nome) => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
              </select>
              <MiniGrafico dados={dadosCarga} cor="#00D4FF" sufixo="kg" />
            </>
          )}
        </div>

        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 12 }}>SESSÕES CONCLUÍDAS</div>
        {historico.length === 0 ? (
          <div style={{ background: "#0f0f0f", border: "1px dashed #2a2a2a", borderRadius: 8, padding: "28px 20px", textAlign: "center", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
            Nenhum treino registrado ainda.<br />Conclua um treino no Ciclo pra começar.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {historico.map((h) => (
              <div key={h.id} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ background: accent, color: "#000", borderRadius: 4, padding: "2px 8px", fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{h.diaLabel}</div>
                <div style={{ flex: 1, fontSize: 13, color: "#e8e4dc" }}>{h.foco}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#555", textTransform: "capitalize" }}>{formatarData(h.data)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
