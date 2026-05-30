import { useState, useEffect, useRef } from "react";
import { formatarTempo } from "../lib/tempo.js";

const accent = "#c8ff00";

// Cronômetro de descanso flutuante. `chave` reinicia a contagem quando muda.
export default function RestTimer({ segundos, chave, onFechar }) {
  const [restante, setRestante] = useState(segundos);
  const [pausado, setPausado] = useState(false);
  const intervaloRef = useRef(null);

  // Reinicia ao trocar de exercício/descanso.
  useEffect(() => {
    setRestante(segundos);
    setPausado(false);
  }, [segundos, chave]);

  useEffect(() => {
    if (pausado) return;
    intervaloRef.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          clearInterval(intervaloRef.current);
          if (navigator.vibrate) navigator.vibrate(200);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervaloRef.current);
  }, [pausado, segundos, chave]);

  const acabou = restante === 0;
  const cor = acabou ? "#00E5A0" : accent;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#111",
        borderTop: `2px solid ${cor}`,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        maxWidth: 720,
        margin: "0 auto",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ fontFamily: "monospace", fontSize: 32, fontWeight: 700, color: cor, minWidth: 80 }}>
        {formatarTempo(restante)}
      </div>
      <div style={{ flex: 1, fontFamily: "monospace", fontSize: 12, color: "#666", letterSpacing: 1 }}>
        {acabou ? "DESCANSO CONCLUÍDO — próxima série" : "DESCANSO"}
      </div>
      {!acabou && (
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          style={{ background: "none", border: "1px solid #333", color: "#aaa", borderRadius: 6, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
        >
          {pausado ? "Retomar" : "Pausar"}
        </button>
      )}
      <button
        type="button"
        onClick={onFechar}
        style={{ background: cor, border: "none", color: "#000", borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
      >
        {acabou ? "Fechar" : "Encerrar"}
      </button>
    </div>
  );
}
