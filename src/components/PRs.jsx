// Tela de PRs (recordes pessoais) — guarda o 1RM de cada levantamento principal.
// Esses valores alimentam o cálculo automático de carga em BlocoTreino.jsx (blocos
// com "@ X%") e a Progressão de carga da tela de Evolução.

import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { PRS_RASTREADOS, prsAtuais } from "../lib/prs.js";
import MiniGrafico from "./MiniGrafico.jsx";
import TopoVoltar from "./TopoVoltar.jsx";
import { ACCENT } from "../lib/theme.js";

const ACC = ACCENT;

function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function CardPR({ movimento, atual, historico, onSalvar }) {
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const serie = historico
    .filter((p) => p.movimento === movimento)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map((p) => ({ label: formatarData(p.data), valor: p.valor }));

  const ultimo = historico.find((p) => p.movimento === movimento);

  const salvar = async () => {
    const n = Number(valor);
    if (!n || n <= 0) return;
    setSalvando(true);
    try {
      await onSalvar(movimento, n);
      setValor("");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{movimento}</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: ACC, fontFamily: "monospace", lineHeight: 1 }}>
            {atual ? `${atual}kg` : "—"}
          </div>
          {ultimo && <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{formatarData(ultimo.data)}</div>}
        </div>
      </div>

      {serie.length >= 2 && (
        <div style={{ marginBottom: 10 }}>
          <MiniGrafico dados={serie} cor={ACC} sufixo="kg" />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          inputMode="decimal"
          placeholder={atual ? `novo PR (kg)` : "PR atual (kg)"}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ flex: 1, background: "#141414", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#f0ece4" }}
        />
        <button
          type="button"
          onClick={salvar}
          disabled={!valor || salvando}
          style={{
            background: valor ? ACC : "#1a1a1a",
            color: valor ? "#000" : "#444",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: valor ? "pointer" : "not-allowed",
          }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

export default function PRs({ onVoltar }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    let ativo = true;
    api.getPrs().then((h) => { if (ativo) setHistorico(h); }).catch(() => {});
    return () => { ativo = false; };
  }, []);

  const atuais = prsAtuais(historico);

  const salvar = async (movimento, valor) => {
    const novo = await api.addPr(null, { movimento, valor });
    setHistorico((prev) => [novo, ...prev]);
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8ea", paddingBottom: 60 }}>
      <TopoVoltar onVoltar={onVoltar} titulo="Meus PRs" />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: ACC, letterSpacing: 3, textTransform: "uppercase" }}>Meus PRs</span>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "4px 0 4px", letterSpacing: -1, lineHeight: 1.1 }}>Recordes pessoais</h1>
          <p style={{ fontSize: 13, color: "#9a9da8", lineHeight: 1.6 }}>
            Cadastre seu 1RM de cada levantamento. Nos dias de treino com carga em percentual (ex: "Back Squat 5x5 @ 75%"), o app calcula o peso em kg automaticamente a partir daqui.
          </p>
        </div>

        {PRS_RASTREADOS.map((mov) => (
          <CardPR key={mov} movimento={mov} atual={atuais[mov]} historico={historico} onSalvar={salvar} />
        ))}
      </div>
    </div>
  );
}
