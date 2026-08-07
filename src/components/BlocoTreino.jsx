// Renderiza um bloco de treino ({ titulo, extra?, itens?, texto? } ou { nota }).
// Compartilhado entre o Ciclo e a Biblioteca de WODs.

import { ACCENT, ACCENT_LIGHT, cardStyle } from "../lib/theme.js";

const ACC = ACCENT;
const ACC2 = ACCENT_LIGHT;

export default function BlocoTreino({ blk }) {
  if (blk.nota) {
    return (
      <div style={{ background: "#1e2027", borderLeft: `3px solid ${ACC}`, padding: "8px 12px", borderRadius: "0 8px 8px 0", fontSize: 13, color: "#9a9da8", marginTop: 10, lineHeight: 1.55 }}>
        {blk.nota}
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle({ padding: "12px 14px", radius: 8 }), marginTop: 14 }}>
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
