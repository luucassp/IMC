// Fundo animado da Home — CSS puro (sem canvas/WebGL), pra funcionar igual em
// qualquer navegador. Substitui o antigo PaperDesignBackground (shader WebGL,
// instável em Safari iOS). Grade de pontos com deriva sutil + glow radial estático.

interface BackgroundAnimadoProps {
  /** Intensidade visual 0..1 */
  intensity?: number;
  className?: string;
}

export function BackgroundAnimado({ intensity = 0.5, className = "" }: BackgroundAnimadoProps) {
  const t = Math.max(0, Math.min(1, intensity));
  const opacidadePontos = 0.25 + t * 0.35;
  const opacidadeGlow = 0.12 + t * 0.18;
  const duracao = 22 - t * 6; // mais intenso = deriva um pouco mais rápida

  return (
    <div
      className={["pointer-events-none fixed inset-0 z-0 overflow-hidden", className].join(" ")}
      style={{ backgroundColor: "#0a0a0a" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes bg-drift {
          from { transform: translate(0, 0); }
          to   { transform: translate(-28px, -28px); }
        }
        .bg-dots {
          animation: bg-drift ${duracao}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bg-dots { animation: none; }
        }
      `}</style>

      <div
        className="bg-dots absolute"
        style={{
          top: "-15%",
          left: "-15%",
          width: "130%",
          height: "130%",
          backgroundImage: `radial-gradient(circle, #ff8c1a 1.4px, transparent 1.6px)`,
          backgroundSize: "28px 28px",
          opacity: opacidadePontos,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 42% at 18% 0%, rgba(255,140,26,${opacidadeGlow}), transparent 70%)`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}

export default BackgroundAnimado;
