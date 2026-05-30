import { useState, useEffect, useCallback } from "react";
import { buscarImagemExercicio } from "../lib/wger.js";

function formatarTimer(segundos) {
  const s = Math.max(0, segundos);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function GuidedWorkout({ exercicios, nivel, cor, onConcluir, onSair }) {
  const [exIdx, setExIdx] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [fase, setFase] = useState("exercicio"); // "exercicio" | "descanso" | "concluido"
  const [tempoRestante, setTempoRestante] = useState(0);
  const [imagemUrl, setImagemUrl] = useState(null);
  const [imgCarregando, setImgCarregando] = useState(false);

  const ex = exercicios[exIdx];
  const prescricao = ex?.prescricao?.[nivel] || { sets: parseInt(ex?.sets) || 3, reps: ex?.reps || "10–12", rest: 75 };
  const totalSeries = prescricao.sets;
  const totalExercicios = exercicios.length;

  const totalSetsGeral = exercicios.reduce((acc, e) => acc + (e.prescricao?.[nivel]?.sets ?? parseInt(e.sets) ?? 3), 0);
  const setsFeitos = exercicios.slice(0, exIdx).reduce((acc, e) => acc + (e.prescricao?.[nivel]?.sets ?? parseInt(e.sets) ?? 3), 0) + (serieAtual - 1);
  const progresso = totalSetsGeral > 0 ? (setsFeitos / totalSetsGeral) * 100 : 0;

  useEffect(() => {
    if (!ex?.englishName) return;
    setImagemUrl(null);
    setImgCarregando(true);
    buscarImagemExercicio(ex.englishName)
      .then((url) => setImagemUrl(url))
      .finally(() => setImgCarregando(false));
  }, [exIdx, ex?.englishName]);

  const avancar = useCallback(() => {
    if (serieAtual < totalSeries) {
      setSerieAtual((s) => s + 1);
      setFase("exercicio");
    } else if (exIdx < totalExercicios - 1) {
      setExIdx((i) => i + 1);
      setSerieAtual(1);
      setFase("exercicio");
    } else {
      setFase("concluido");
    }
  }, [serieAtual, totalSeries, exIdx, totalExercicios]);

  useEffect(() => {
    if (fase !== "descanso") return;
    if (tempoRestante <= 0) { avancar(); return; }
    const t = setTimeout(() => setTempoRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, tempoRestante, avancar]);

  function concluirSerie() {
    setTempoRestante(prescricao.rest);
    setFase("descanso");
  }

  function pularDescanso() {
    setTempoRestante(0);
    avancar();
  }

  // ── Tela concluído ─────────────────────────────────────────────────────────
  if (fase === "concluido") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>🏆</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: cor, margin: "0 0 8px", letterSpacing: -1 }}>Treino concluído!</h2>
        <p style={{ color: "#555", fontFamily: "monospace", fontSize: 13, marginBottom: 8 }}>
          {totalExercicios} exercícios · {totalSetsGeral} séries
        </p>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 40, lineHeight: 1.6 }}>
          Ótimo trabalho — consistência é o segredo.
        </p>
        <button
          onClick={onConcluir}
          style={{ background: cor, color: "#000", border: "none", borderRadius: 999, padding: "18px 48px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}
        >
          Registrar treino
        </button>
        <button
          onClick={onSair}
          style={{ marginTop: 16, background: "none", border: "none", color: "#444", fontSize: 13, cursor: "pointer" }}
        >
          Sair sem registrar
        </button>
      </div>
    );
  }

  // ── Tela de descanso ───────────────────────────────────────────────────────
  if (fase === "descanso") {
    const isUltimaSerie = serieAtual >= totalSeries;
    const isUltimoEx = exIdx >= totalExercicios - 1;
    const proximo = isUltimaSerie
      ? isUltimoEx
        ? "Último exercício — partiu pra conclusão!"
        : `A seguir: ${exercicios[exIdx + 1]?.name}`
      : `Série ${serieAtual + 1}/${totalSeries} de ${ex.name}`;

    return (
      <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        {/* Barra de progresso */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#1a1a1a" }}>
          <div style={{ height: "100%", background: cor, width: `${progresso}%`, transition: "width 0.4s" }} />
        </div>

        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 24 }}>DESCANSANDO</div>

        {/* Timer circular visual */}
        <div style={{ position: "relative", width: 160, height: 160, marginBottom: 24 }}>
          <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="70" fill="none" stroke="#1a1a1a" strokeWidth="8" />
            <circle
              cx="80" cy="80" r="70" fill="none" stroke={cor} strokeWidth="8"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * tempoRestante) / prescricao.rest}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: cor, fontFamily: "monospace", lineHeight: 1 }}>
              {formatarTimer(tempoRestante)}
            </div>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginTop: 4 }}>descanso</div>
          </div>
        </div>

        <p style={{ fontSize: 14, color: "#666", marginBottom: 32, fontFamily: "monospace", maxWidth: 280 }}>{proximo}</p>

        <button
          onClick={pularDescanso}
          style={{ background: "none", border: `1px solid ${cor}50`, color: cor, borderRadius: 999, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Pular descanso →
        </button>

        <button onClick={onSair} style={{ marginTop: 20, background: "none", border: "none", color: "#333", fontSize: 13, cursor: "pointer" }}>
          Sair do modo guiado
        </button>
      </div>
    );
  }

  // ── Tela de exercício ──────────────────────────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 200, overflowY: "auto" }}>
      {/* Barra de progresso */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#1a1a1a", zIndex: 201 }}>
        <div style={{ height: "100%", background: cor, width: `${progresso}%`, transition: "width 0.4s" }} />
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 20px 0" }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#444", letterSpacing: 2 }}>
            {exIdx + 1} / {totalExercicios} exercícios
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: cor, marginTop: 3 }}>
            SÉRIE {serieAtual} de {totalSeries}
          </div>
        </div>
        <button onClick={onSair} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 4 }}>
          ×
        </button>
      </div>

      <div style={{ padding: "16px 20px 120px", maxWidth: 540, margin: "0 auto" }}>
        {/* Nome e categoria */}
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2, margin: "0 0 4px", color: "#f0ece4" }}>
          {ex.name}
        </h2>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: ex.category === "PRINCIPAL" ? cor : "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
          {ex.category}
        </div>

        {/* Músculos */}
        {ex.muscles && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {ex.muscles.map((m) => (
              <span key={m} style={{ background: `${cor}18`, border: `1px solid ${cor}30`, color: cor, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontFamily: "monospace" }}>
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Imagem do exercício */}
        <div style={{ background: "#111", borderRadius: 12, marginBottom: 16, overflow: "hidden", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {imgCarregando && (
            <div style={{ color: "#333", fontFamily: "monospace", fontSize: 12 }}>carregando imagem...</div>
          )}
          {!imgCarregando && imagemUrl && (
            <img src={imagemUrl} alt={ex.name} style={{ width: "100%", maxHeight: 260, objectFit: "contain" }} />
          )}
          {!imgCarregando && !imagemUrl && (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>💪</div>
              <div style={{ color: "#333", fontSize: 11, fontFamily: "monospace" }}>{ex.englishName}</div>
            </div>
          )}
        </div>

        {/* Prescrição da série */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["SÉRIES", `${serieAtual}/${totalSeries}`], ["REPS", prescricao.reps], ["DESCANSO", `${prescricao.rest}s`]].map(([label, val]) => (
            <div key={label} style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#f0ece4" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Dicas de técnica */}
        {ex.cues && (
          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: cor, letterSpacing: 2, marginBottom: 10 }}>TÉCNICA</div>
            {ex.cues.map((cue, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < ex.cues.length - 1 ? 8 : 0 }}>
                <span style={{ color: cor, fontFamily: "monospace", fontSize: 12, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#888", lineHeight: 1.55 }}>{cue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progressão */}
        {ex.progression && (
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", letterSpacing: 0.5 }}>
            ↑ {ex.progression}
          </div>
        )}
      </div>

      {/* Botão fixo no rodapé */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 32px", background: "linear-gradient(to top, #0a0a0a 70%, transparent)", zIndex: 202 }}>
        <button
          onClick={concluirSerie}
          style={{ width: "100%", background: cor, color: "#000", border: "none", borderRadius: 999, padding: "18px 20px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <span>✓</span>
          <span>
            {serieAtual < totalSeries
              ? `Série ${serieAtual} concluída`
              : exIdx < totalExercicios - 1
                ? "Exercício concluído — próximo"
                : "Finalizar treino"}
          </span>
        </button>
      </div>
    </div>
  );
}
