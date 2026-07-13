import { useState } from "react";
import { api } from "../lib/api.js";
import { parseDescanso } from "../lib/tempo.js";
import RestTimer from "./RestTimer.jsx";
import GuidedWorkout from "./GuidedWorkout.jsx";

const accent = "#c8ff00";

const GRUPOS_MUSCULARES = [
  { id: "peito", label: "Peito", icon: "💪" },
  { id: "costas", label: "Costas", icon: "🔙" },
  { id: "ombro", label: "Ombro", icon: "🏋️" },
  { id: "biceps", label: "Bíceps", icon: "💪" },
  { id: "triceps", label: "Tríceps", icon: "💪" },
  { id: "quadriceps", label: "Quadríceps", icon: "🦵" },
  { id: "posterior", label: "Posterior", icon: "🦵" },
  { id: "gluteo", label: "Glúteo", icon: "🍑" },
  { id: "panturrilha", label: "Panturrilha", icon: "🦶" },
  { id: "core", label: "Core", icon: "🎯" },
];

const EQUIPAMENTOS = [
  { id: "academia", label: "Academia completa" },
  { id: "halteres", label: "Halteres em casa" },
  { id: "peso_corporal", label: "Peso corporal" },
  { id: "elasticos", label: "Elásticos" },
];

function LogCarga({ exercicio, cor, onRegistrar }) {
  const [carga, setCarga] = useState("");
  const [reps, setReps] = useState("");

  const salvar = () => {
    if (!carga || !reps) return;
    onRegistrar({ exercicio, carga: Number(carga), reps: Number(reps) });
    setCarga("");
    setReps("");
  };

  const inputStyle = { width: 70, background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "#f0ece4" };

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>REGISTRAR SÉRIE</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input type="number" placeholder="kg" value={carga} onChange={(e) => setCarga(e.target.value)} style={inputStyle} />
        <span style={{ color: "#444" }}>×</span>
        <input type="number" placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value)} style={inputStyle} />
        <button
          type="button"
          onClick={salvar}
          disabled={!carga || !reps}
          style={{ background: carga && reps ? cor : "#1a1a1a", color: carga && reps ? "#000" : "#444", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: carga && reps ? "pointer" : "not-allowed" }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

export default function TreinoLivre({ perfil, token, onVoltar }) {
  const [etapa, setEtapa] = useState("grupos");
  const [grupos, setGrupos] = useState([]);
  const [equipamento, setEquipamento] = useState(perfil.equipamentos?.[0] ?? "academia");
  const [exercicios, setExercicios] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [descanso, setDescanso] = useState(null);
  const [guidedMode, setGuidedMode] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const toggleGrupo = (id) => {
    setGrupos((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const gerarTreino = async () => {
    setErro("");
    setCarregando(true);
    try {
      const foco = grupos.map((g) => GRUPOS_MUSCULARES.find((gm) => gm.id === g)?.label).join(" · ");
      const resultado = await api.gerarTreinoIA(token, {
        diaId: "LIVRE",
        diaFoco: `WOD estilo CrossFit (aquecimento + skill/força + metcon) — foco: ${foco}`,
        nivel: perfil.nivel,
        objetivo: perfil.objetivo,
        objetivosExtras: perfil.objetivosExtras,
        tempoPorTreino: perfil.tempoPorTreino,
        equipamentos: [equipamento],
        restricoes: perfil.restricoes,
      });
      setExercicios(resultado);
      setEtapa("treino");
    } catch (e) {
      setErro(e.message || "Erro ao gerar treino.");
    } finally {
      setCarregando(false);
    }
  };

  const concluirTreino = async () => {
    const foco = grupos.map((g) => GRUPOS_MUSCULARES.find((gm) => gm.id === g)?.label).join(" · ");
    try {
      await api.addHistorico(token, { diaId: "LIVRE", diaLabel: "LIVRE", foco: `Treino Livre — ${foco}` });
      setConcluido(true);
    } catch {}
  };

  const salvarSerie = async (entrada) => {
    try {
      await api.addRegistro(token, entrada);
    } catch {}
  };

  const cor = accent;

  if (etapa === "grupos") {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#f0ece4" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 60px" }}>
          <button type="button" onClick={onVoltar} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 24 }}>
            ← Voltar
          </button>

          <div style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 3, marginBottom: 4 }}>TREINO LIVRE</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: -1 }}>O que quer treinar hoje?</h1>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 28, fontFamily: "monospace" }}>Selecione 1 a 4 grupos musculares</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 32 }}>
            {GRUPOS_MUSCULARES.map((g) => {
              const ativo = grupos.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGrupo(g.id)}
                  style={{
                    background: ativo ? `${accent}15` : "#0f0f0f",
                    border: `1px solid ${ativo ? accent : "#222"}`,
                    borderRadius: 12,
                    padding: "16px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: ativo ? accent : "#999",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  {g.label}
                  {ativo && <span style={{ marginLeft: "auto", fontSize: 16 }}>✓</span>}
                </button>
              );
            })}
          </div>

          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>EQUIPAMENTO DISPONÍVEL</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {EQUIPAMENTOS.map((eq) => {
              const ativo = equipamento === eq.id;
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => setEquipamento(eq.id)}
                  style={{
                    background: ativo ? `${accent}18` : "#141414",
                    border: `1px solid ${ativo ? accent : "#222"}`,
                    color: ativo ? accent : "#999",
                    borderRadius: 999,
                    padding: "10px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {eq.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={gerarTreino}
            disabled={grupos.length === 0 || carregando}
            style={{
              width: "100%",
              background: grupos.length === 0 ? "#1a1a1a" : accent,
              color: grupos.length === 0 ? "#444" : "#000",
              border: "none",
              borderRadius: 999,
              padding: "18px 20px",
              fontSize: 15,
              fontWeight: 800,
              cursor: grupos.length === 0 ? "not-allowed" : "pointer",
              letterSpacing: 0.5,
            }}
          >
            {carregando ? "Gerando treino..." : `Montar treino (${grupos.length} grupo${grupos.length !== 1 ? "s" : ""})`}
          </button>

          {erro && (
            <div style={{ fontSize: 12, color: "#ff6b6b", marginTop: 12, textAlign: "center", fontFamily: "monospace" }}>{erro}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#f0ece4" }}>
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "20px 20px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button type="button" onClick={() => setEtapa("grupos")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 12 }}>
            ← Escolher outros grupos
          </button>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 3, marginBottom: 4 }}>TREINO LIVRE</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
            {grupos.map((g) => GRUPOS_MUSCULARES.find((gm) => gm.id === g)?.label).join(" · ")}
          </h1>
          <p style={{ fontSize: 12, color: "#555", fontFamily: "monospace", marginTop: 4 }}>
            {EQUIPAMENTOS.find((eq) => eq.id === equipamento)?.label}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px", paddingBottom: descanso ? 110 : 24 }}>
        <button
          type="button"
          onClick={concluido ? undefined : () => setGuidedMode(true)}
          disabled={concluido}
          style={{
            width: "100%",
            marginBottom: 20,
            background: concluido ? "#141414" : accent,
            color: concluido ? "#5a5" : "#000",
            border: concluido ? "1px solid #2a3a2a" : "none",
            borderRadius: 999,
            padding: "16px 20px",
            fontSize: 15,
            fontWeight: 700,
            cursor: concluido ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {concluido
            ? "✓ Treino concluído"
            : <><span style={{ fontSize: 18 }}>▶</span> Iniciar treino guiado</>}
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {exercicios?.map((ex, i) => {
            const isOpen = expandedExercise === i;
            return (
              <div key={i} style={{ background: isOpen ? "#141414" : "#0f0f0f", border: `1px solid ${isOpen ? "#2a2a2a" : "#1a1a1a"}`, borderRadius: 8, overflow: "hidden" }}>
                <button
                  onClick={() => setExpandedExercise(isOpen ? null : i)}
                  style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: ex.category === "PRINCIPAL" ? accent : "#555", minWidth: 70, textTransform: "uppercase" }}>
                    {ex.category}
                  </span>
                  <span style={{ fontSize: 14, color: "#e8e4dc", fontWeight: 500, flex: 1 }}>{ex.name}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#444" }}>{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid #1a1a1a" }}>
                    {ex.muscles && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, marginBottom: 12 }}>
                        {ex.muscles.map((m) => (
                          <span key={m} style={{ background: `${accent}18`, border: `1px solid ${accent}30`, color: accent, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontFamily: "monospace" }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                      {[["SÉRIES", ex.sets], ["REPS", ex.reps], ["DESCANSO", ex.rest]].map(([label, val]) => (
                        <div key={label} style={{ background: "#1a1a1a", borderRadius: 6, padding: "8px 12px" }}>
                          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: 2 }}>{label}</div>
                          <div style={{ fontFamily: "monospace", fontSize: 14, color: "#f0ece4", fontWeight: 700, marginTop: 2 }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {ex.cues && (
                      <div style={{ background: `${accent}10`, border: `1px solid ${accent}20`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 9, color: accent, letterSpacing: 2, marginBottom: 8 }}>TÉCNICA</div>
                        {ex.cues.map((cue, ci) => (
                          <div key={ci} style={{ display: "flex", gap: 8, marginBottom: ci < ex.cues.length - 1 ? 6 : 0 }}>
                            <span style={{ color: accent, fontFamily: "monospace", fontSize: 11, flexShrink: 0 }}>{ci + 1}.</span>
                            <span style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>{cue}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setDescanso({ segundos: parseDescanso(ex.rest), chave: Date.now() })}
                      style={{ background: "none", border: `1px solid ${accent}40`, color: accent, borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      ⏱ Iniciar descanso ({ex.rest})
                    </button>

                    <LogCarga exercicio={ex.name} cor={accent} onRegistrar={salvarSerie} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {descanso && <RestTimer segundos={descanso.segundos} chave={descanso.chave} onFechar={() => setDescanso(null)} />}

      {guidedMode && exercicios && (
        <GuidedWorkout
          exercicios={exercicios}
          nivel={perfil.nivel || "iniciante"}
          cor={accent}
          onConcluir={() => { setGuidedMode(false); concluirTreino(); }}
          onSair={() => setGuidedMode(false)}
        />
      )}
    </div>
  );
}
