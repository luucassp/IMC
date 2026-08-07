// Fonte única de verdade para cor/profundidade visual do app.
// Antes disso cada componente hardcodava seu próprio hex — dois acentos
// (laranja e lima) e três escalas de fundo conviviam sem reconciliação.

export const ACCENT = "#ff8c1a";
export const ACCENT_LIGHT = "#ffb14d";
export const SUCCESS = "#3ecf8e";
export const WARNING = "#FF6B35";
export const DANGER = "#FF3B3B";

export const BG = "#0a0a0a";
export const CARD = "#0f0f0f";
export const CARD_2 = "#141414";
export const BORDER = "#1a1a1a";
export const BORDER_2 = "#2a2a2a";

export const TEXT = "#f0ece4";
export const TEXT_DIM = "#888";
export const TEXT_FAINT = "#555";

const CARD_GRADIENT_FROM = "#111318";
const CARD_GRADIENT_TO = "#0d0d0f";

// Card com profundidade (gradiente + sombra externa + realce interno),
// recipe original de Resultado.jsx generalizada para o resto do app.
// Radius 16 / padding 24 seguem o mesmo respiro do card system de referência.
export function cardStyle({ padding = "24px", radius = 16 } = {}) {
  return {
    background: `linear-gradient(145deg, ${CARD_GRADIENT_FROM} 0%, ${CARD_GRADIENT_TO} 100%)`,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: radius,
    padding,
    boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  };
}
