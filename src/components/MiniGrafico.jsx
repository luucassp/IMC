import { ACCENT } from "../lib/theme.js";

// Gráfico de barras leve em SVG (sem dependências externas).
// dados: [{ label, valor }]. cor opcional.
export default function MiniGrafico({ dados, cor = ACCENT, sufixo = "" }) {
  if (!dados?.length) return null;
  const max = Math.max(...dados.map((d) => d.valor), 1);
  const alturaMax = 90;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: alturaMax + 40, padding: "8px 0" }}>
      {dados.map((d, i) => {
        const altura = d.valor > 0 ? Math.max((d.valor / max) * alturaMax, 4) : 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: d.valor > 0 ? "#e8e4dc" : "#444", fontWeight: 700 }}>
              {d.valor > 0 ? `${d.valor}${sufixo}` : "—"}
            </div>
            <div
              title={`${d.label}: ${d.valor}${sufixo}`}
              style={{
                width: "100%",
                maxWidth: 36,
                height: altura,
                background: d.valor > 0 ? cor : "transparent",
                border: d.valor > 0 ? "none" : "1px dashed #2a2a2a",
                borderRadius: "4px 4px 0 0",
                transition: "height 0.3s",
              }}
            />
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 0.5 }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
