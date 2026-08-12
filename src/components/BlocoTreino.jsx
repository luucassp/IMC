// Renderiza um bloco de treino ({ titulo, extra?, itens?, texto? } ou { nota }).
// Compartilhado entre o Ciclo e a Biblioteca de WODs.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ACCENT, ACCENT_LIGHT, cardStyle } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { calcularCargaTexto, prsAtuais } from "../lib/prs.js";
import BoxTimer from "./BoxTimer.jsx";

const ACC = ACCENT;
const ACC2 = ACCENT_LIGHT;

export default function BlocoTreino({ blk, cor = ACCENT }) {
  const [timerAberto, setTimerAberto] = useState(false);
  const [prs, setPrs] = useState({});

  useEffect(() => {
    let ativo = true;
    api.getPrs().then((h) => { if (ativo) setPrs(prsAtuais(h)); }).catch(() => {});
    return () => { ativo = false; };
  }, []);

  if (blk.nota) {
    return (
      <div style={{ background: "#1e2027", borderLeft: `3px solid ${ACC}`, padding: "8px 12px", borderRadius: "0 8px 8px 0", fontSize: 13, color: "#9a9da8", marginTop: 10, lineHeight: 1.55 }}>
        {blk.nota}
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle({ padding: "12px 14px", radius: 8 }), marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: ACC2, fontWeight: 700 }}>
          {blk.titulo}
          {blk.extra && <span style={{ color: "#9a9da8", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}> · {blk.extra}</span>}
        </div>
        <button
          type="button"
          onClick={() => setTimerAberto(true)}
          style={{ flexShrink: 0, background: "none", border: `1px solid ${cor}50`, color: cor, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          ▶ Timer
        </button>
      </div>
      {blk.texto && <p style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}>{blk.texto}</p>}
      {blk.texto && (() => {
        const carga = calcularCargaTexto(blk.texto, prs);
        return carga ? (
          <div style={{ fontSize: 12, color: cor, fontFamily: "monospace", marginTop: 4, fontWeight: 700 }}>{carga}</div>
        ) : null;
      })()}
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

      {timerAberto && createPortal(<BoxTimer blk={blk} cor={cor} onFechar={() => setTimerAberto(false)} />, document.body)}
    </div>
  );
}
