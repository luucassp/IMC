// Fundo animado (dithering shader) para a Home — ambiente sutil atrás do conteúdo.
// Dark-only (o app não tem modo claro) e sintonizado com o ACCENT já estabelecido.
// Adaptado de um componente Next.js: sem "use client" e sem a lógica de tema
// light/dark (prefers-color-scheme + classList), que não se aplica aqui.

import { useEffect, useMemo, useState } from "react";
import { Dithering } from "@paper-design/shaders-react";
import { ACCENT } from "../lib/theme.js";

interface PaperDesignBackgroundProps {
  /** Intensidade visual 0..1 */
  intensity?: number;
  /** Parallax sutil ao mover o mouse (inofensivo em touch) */
  parallax?: boolean;
  className?: string;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function mix(a: string, b: string, t: number): string {
  const ai = parseInt(a.replace("#", ""), 16);
  const bi = parseInt(b.replace("#", ""), 16);
  const ar = (ai >> 16) & 0xff, ag = (ai >> 8) & 0xff, ab = ai & 0xff;
  const br = (bi >> 16) & 0xff, bg = (bi >> 8) & 0xff, bb = bi & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1)}`;
}

export function PaperDesignBackground({ intensity = 0.5, parallax = true, className = "" }: PaperDesignBackgroundProps) {
  const reducedMotion = usePrefersReducedMotion();

  const config = useMemo(() => {
    const t = Math.max(0, Math.min(1, intensity));
    return {
      bg: "#0a0a0a",
      front: mix("#3d1f00", ACCENT, 0.3 + t * 0.3), // brasa → laranja da marca
      speed: reducedMotion ? 0 : 0.22 + t * 0.3,
      px: Math.round(2 + t * 2), // 2..4
      scale: 1.05 + t * 0.15,
      glow: "radial-gradient(60% 40% at 50% 40%, rgba(255,140,26,0.10), transparent 70%)",
    };
  }, [intensity, reducedMotion]);

  const ativarParallax = parallax && !reducedMotion;

  useEffect(() => {
    if (!ativarParallax) return;
    const root = document.getElementById("paper-bg-parallax");
    if (!root) return;

    const strength = 8; // px nas bordas
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w) * 2 - 1;
      const y = (e.clientY / h) * 2 - 1;
      root.style.setProperty("--parallax-x", `${(-x * strength).toFixed(2)}px`);
      root.style.setProperty("--parallax-y", `${(-y * strength).toFixed(2)}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [ativarParallax]);

  return (
    <div
      id="paper-bg-parallax"
      className={["pointer-events-none fixed inset-0 z-0", className].join(" ")}
      style={{
        backgroundColor: config.bg,
        transform: ativarParallax ? "translate3d(var(--parallax-x,0), var(--parallax-y,0), 0)" : undefined,
        willChange: ativarParallax ? "transform" : undefined,
      }}
    >
      <Dithering
        colorBack="#00000000"
        colorFront={config.front}
        speed={config.speed}
        shape="wave"
        type="4x4"
        size={config.px}
        scale={config.scale}
        style={{ height: "100vh", width: "100vw" }}
      />

      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: config.glow, mixBlendMode: "screen" }} />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25) 100%)" }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.11'/%3E%3C/svg%3E\")",
          backgroundSize: "cover",
          opacity: 0.5,
          mixBlendMode: "screen",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 35%)", opacity: 0.25 }}
      />
    </div>
  );
}

export default PaperDesignBackground;
