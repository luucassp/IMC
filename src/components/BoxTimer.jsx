// Timer avançado tipo "box" — modos: contagem regressiva, intervalos (EMOM/Tabata),
// séries + descanso manual, e for time (cronômetro crescente com cap opcional).
// Abre pré-configurado a partir do bloco (sugerirTimer), sempre editável antes de iniciar.

import { useEffect, useRef, useState } from "react";
import { formatarTempo } from "../lib/tempo.js";
import { sugerirTimer, som, vibrar, MODOS } from "../lib/boxTimer.js";

function Anel({ fracao, cor, size = 220, thickness = 12, children }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(fracao, 0), 1);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1a1a1a" strokeWidth={thickness} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={cor} strokeWidth={thickness} fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">{children}</div>
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, step = 1, suffix }) {
  return (
    <div style={{ flex: 1, minWidth: 90 }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, color: "#666", letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 10px", fontSize: 16, color: "#f0ece4", fontFamily: "monospace" }}
        />
        {suffix && <span style={{ color: "#555", fontSize: 12, fontFamily: "monospace" }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function BoxTimer({ blk, cor, onFechar }) {
  const [tela, setTela] = useState("config"); // config | preparando | correndo | concluido
  const [config, setConfig] = useState(() => sugerirTimer(blk));
  const [pausado, setPausado] = useState(false);
  const [preCount, setPreCount] = useState(3);

  // Estado de execução — formato varia por modo.
  const [roundAtual, setRoundAtual] = useState(1);
  const [fase, setFase] = useState("trabalho"); // trabalho | descanso | serie
  const [restante, setRestante] = useState(0);
  const [decorrido, setDecorrido] = useState(0);
  const [capEstourado, setCapEstourado] = useState(false);

  const intervaloRef = useRef(null);

  const set = (patch) => setConfig((c) => ({ ...c, ...patch }));

  function iniciar() {
    setPreCount(3);
    setTela("preparando");
  }

  // Contagem 3-2-1 antes de começar.
  useEffect(() => {
    if (tela !== "preparando") return;
    if (preCount <= 0) {
      // Arma o estado inicial de cada modo e entra em "correndo".
      if (config.modo === "countdown") setRestante(config.minutos * 60);
      else if (config.modo === "intervalos") { setRoundAtual(1); setFase("trabalho"); setRestante(config.trabalho); }
      else if (config.modo === "rounds") { setRoundAtual(1); setFase("serie"); }
      else if (config.modo === "fortime") { setDecorrido(0); setCapEstourado(false); }
      setPausado(false);
      som.inicioTrabalho();
      vibrar(200);
      setTela("correndo");
      return;
    }
    som.tick();
    const t = setTimeout(() => setPreCount((n) => n - 1), 700);
    return () => clearTimeout(t);
  }, [tela, preCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Motor da contagem — 1 tick por segundo enquanto "correndo" e não pausado.
  useEffect(() => {
    if (tela !== "correndo" || pausado) return;
    intervaloRef.current = setInterval(() => {
      if (config.modo === "fortime") {
        setDecorrido((d) => {
          const novo = d + 1;
          if (config.capMinutos && !capEstourado && novo >= config.capMinutos * 60) {
            som.fim();
            vibrar([200, 100, 200]);
            setCapEstourado(true);
          }
          return novo;
        });
        return;
      }

      if (config.modo === "countdown") {
        setRestante((r) => {
          if (r <= 1) {
            som.fim();
            vibrar([300, 100, 300]);
            setTela("concluido");
            return 0;
          }
          if (r <= 4) som.tick();
          return r - 1;
        });
        return;
      }

      if (config.modo === "intervalos") {
        setRestante((r) => {
          if (r > 1) {
            if (r <= 4) som.tick();
            return r - 1;
          }
          // Fase acabou — decide o próximo passo.
          if (fase === "trabalho" && config.descanso > 0) {
            som.inicioDescanso();
            vibrar(150);
            setFase("descanso");
            return config.descanso;
          }
          if (roundAtual >= config.rounds) {
            som.fim();
            vibrar([300, 100, 300]);
            setTela("concluido");
            return 0;
          }
          som.inicioTrabalho();
          vibrar(150);
          setRoundAtual((n) => n + 1);
          setFase("trabalho");
          return config.trabalho;
        });
        return;
      }

      if (config.modo === "rounds" && fase === "descanso") {
        setRestante((r) => {
          if (r <= 1) {
            if (roundAtual >= config.rounds) {
              som.fim();
              vibrar([300, 100, 300]);
              setTela("concluido");
              return 0;
            }
            som.inicioTrabalho();
            vibrar(150);
            setRoundAtual((n) => n + 1);
            setFase("serie");
            return 0;
          }
          if (r <= 4) som.tick();
          return r - 1;
        });
      }
    }, 1000);
    return () => clearInterval(intervaloRef.current);
  }, [tela, pausado, config, fase, roundAtual, capEstourado]);

  function concluirSerie() {
    som.inicioDescanso();
    vibrar(150);
    setFase("descanso");
    setRestante(config.descanso);
  }

  function encerrar() {
    clearInterval(intervaloRef.current);
    setTela("concluido");
  }

  const passoAjuste = config.modo === "countdown" ? 30 : 10;
  function ajustarRestante(delta) {
    setRestante((r) => Math.max(0, r + delta));
  }

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 300,
    background: `radial-gradient(ellipse 100% 80% at 50% 25%, ${cor}1a 0%, transparent 60%), #080808`,
    display: "flex", flexDirection: "column", color: "#f0ece4",
  };

  // ── Config ──────────────────────────────────────────────────────────────
  if (tela === "config") {
    return (
      <div style={overlayStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 20px 0" }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: cor, letterSpacing: 2 }}>TIMER</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{blk.titulo}</div>
          </div>
          <button onClick={onFechar} style={{ background: "none", border: "none", color: "#666", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
          {(blk.texto || blk.itens) && (
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: "#999", lineHeight: 1.6 }}>
              {blk.texto}
              {blk.itens && (
                <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                  {blk.itens.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {MODOS.map((m) => (
              <button
                key={m.id}
                onClick={() => set({ modo: m.id })}
                style={{
                  background: config.modo === m.id ? `${cor}20` : "#141414",
                  border: `1px solid ${config.modo === m.id ? cor : "#2a2a2a"}`,
                  color: config.modo === m.id ? cor : "#888",
                  borderRadius: 999, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {config.modo === "countdown" && (
            <div style={{ display: "flex", gap: 12 }}>
              <NumberField label="Minutos" value={config.minutos} onChange={(v) => set({ minutos: v })} min={1} suffix="min" />
            </div>
          )}

          {config.modo === "intervalos" && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <NumberField label="Rounds" value={config.rounds} onChange={(v) => set({ rounds: v })} min={1} />
              <NumberField label="Trabalho" value={config.trabalho} onChange={(v) => set({ trabalho: v })} min={5} suffix="s" />
              <NumberField label="Descanso" value={config.descanso} onChange={(v) => set({ descanso: v })} min={0} suffix="s" />
            </div>
          )}

          {config.modo === "rounds" && (
            <div style={{ display: "flex", gap: 12 }}>
              <NumberField label="Séries" value={config.rounds} onChange={(v) => set({ rounds: v })} min={1} />
              <NumberField label="Descanso" value={config.descanso} onChange={(v) => set({ descanso: v })} min={10} suffix="s" />
            </div>
          )}

          {config.modo === "fortime" && (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#999", marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.capMinutos != null}
                  onChange={(e) => set({ capMinutos: e.target.checked ? 12 : null })}
                />
                Definir cap (tempo limite)
              </label>
              {config.capMinutos != null && (
                <NumberField label="Cap" value={config.capMinutos} onChange={(v) => set({ capMinutos: v })} min={1} suffix="min" />
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 20px 32px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
          <button
            onClick={iniciar}
            style={{ width: "100%", background: cor, color: "#000", border: "none", borderRadius: 999, padding: "18px 20px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <span style={{ fontSize: 18 }}>▶</span> Começar
          </button>
        </div>
      </div>
    );
  }

  // ── Pré-contagem 3-2-1 ─────────────────────────────────────────────────
  if (tela === "preparando") {
    return (
      <div style={{ ...overlayStyle, alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#666", letterSpacing: 3, marginBottom: 12 }}>PREPARE-SE</div>
        <div style={{ fontSize: 96, fontWeight: 900, color: cor, fontFamily: "monospace" }}>{preCount || "GO"}</div>
      </div>
    );
  }

  // ── Concluído ──────────────────────────────────────────────────────────
  if (tela === "concluido") {
    const resumo =
      config.modo === "fortime" ? `Tempo: ${formatarTempo(decorrido)}${capEstourado ? " (cap estourado)" : ""}`
      : config.modo === "intervalos" ? `${roundAtual}/${config.rounds} rounds`
      : config.modo === "rounds" ? `${roundAtual}/${config.rounds} séries`
      : `${config.minutos} min`;
    return (
      <div style={{ ...overlayStyle, alignItems: "center", justifyContent: "center", textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🏁</div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: cor, margin: "8px 0", letterSpacing: -1 }}>Timer concluído</h2>
        <p style={{ color: "#888", fontFamily: "monospace", fontSize: 14, marginBottom: 32 }}>{resumo}</p>
        <button
          onClick={onFechar}
          style={{ background: cor, color: "#000", border: "none", borderRadius: 999, padding: "16px 40px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
        >
          Fechar
        </button>
      </div>
    );
  }

  // ── Correndo ───────────────────────────────────────────────────────────
  const rótulo =
    config.modo === "countdown" ? config.label
    : config.modo === "intervalos" ? `ROUND ${roundAtual}/${config.rounds} · ${fase === "trabalho" ? "TRABALHO" : "DESCANSO"}`
    : config.modo === "rounds" ? `SÉRIE ${roundAtual}/${config.rounds}`
    : "FOR TIME";

  const corFase = config.modo === "intervalos" && fase === "descanso" ? "#4d9fff" : cor;

  return (
    <div style={{ ...overlayStyle, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <button onClick={onFechar} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#444", fontSize: 24, cursor: "pointer" }}>×</button>

      <div style={{ fontFamily: "monospace", fontSize: 12, color: corFase, letterSpacing: 3, marginBottom: 20, textAlign: "center" }}>{rótulo}</div>

      {config.modo === "rounds" && fase === "serie" ? (
        <>
          <div style={{ fontSize: 22, color: "#666", marginBottom: 40, fontFamily: "monospace" }}>faça sua série</div>
          <button
            onClick={concluirSerie}
            style={{ background: cor, color: "#000", border: "none", borderRadius: "50%", width: 180, height: 180, fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: `0 0 40px ${cor}50` }}
          >
            ✓ Concluí a série
          </button>
        </>
      ) : config.modo === "fortime" ? (
        <Anel fracao={config.capMinutos ? Math.min(decorrido / (config.capMinutos * 60), 1) : 0} cor={capEstourado ? "#ff5d5d" : cor}>
          <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "monospace", color: capEstourado ? "#ff5d5d" : "#f0ece4" }}>{formatarTempo(decorrido)}</div>
          {config.capMinutos && <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 4 }}>cap {config.capMinutos}:00</div>}
        </Anel>
      ) : (
        <>
          <Anel fracao={config.modo === "countdown" ? restante / (config.minutos * 60) : restante / (fase === "trabalho" ? config.trabalho : config.descanso)} cor={corFase}>
            <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "monospace", color: "#f0ece4" }}>{formatarTempo(restante)}</div>
          </Anel>
          <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
            <button
              onClick={() => ajustarRestante(-passoAjuste)}
              style={{ background: "none", border: "1px solid #333", color: "#aaa", borderRadius: "50%", width: 40, height: 40, fontSize: 18, fontWeight: 700, cursor: "pointer" }}
            >
              −
            </button>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", alignSelf: "center" }}>{passoAjuste}s</div>
            <button
              onClick={() => ajustarRestante(passoAjuste)}
              style={{ background: "none", border: "1px solid #333", color: "#aaa", borderRadius: "50%", width: 40, height: 40, fontSize: 18, fontWeight: 700, cursor: "pointer" }}
            >
              +
            </button>
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
        {config.modo !== "rounds" || fase === "descanso" ? (
          <button
            onClick={() => setPausado((p) => !p)}
            style={{ background: "none", border: "1px solid #333", color: "#aaa", borderRadius: 999, padding: "12px 24px", fontSize: 14, cursor: "pointer" }}
          >
            {pausado ? "Retomar" : "Pausar"}
          </button>
        ) : null}
        <button
          onClick={encerrar}
          style={{ background: "none", border: `1px solid ${cor}50`, color: cor, borderRadius: 999, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Encerrar
        </button>
      </div>
    </div>
  );
}
