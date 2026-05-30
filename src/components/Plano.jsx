import { useState, useEffect } from "react";
import { DIAS, METRICAS } from "../data/planos.js";
import { api } from "../lib/api.js";
import { parseDescanso } from "../lib/tempo.js";
import { NIVEIS_FADIGA, ajustarExercicios } from "../lib/fadiga.js";
import { planejarSemana } from "../lib/semana.js";
import RestTimer from "./RestTimer.jsx";
import MiniGrafico from "./MiniGrafico.jsx";

const accent = "#c8ff00";

function mesmoDia(isoA, isoB) {
  return new Date(isoA).toDateString() === new Date(isoB).toDateString();
}

function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

const STATUS_SEMANA = {
  feito: { label: "✓ feito", cor: "#00E5A0" },
  hoje: { label: "hoje", cor: "#c8ff00" },
  perdido: { label: "perdido", cor: "#FF6B35" },
  proximo: { label: "próximo", cor: "#555" },
  descanso: { label: "descanso", cor: "#333" },
};

// Inputs de carga × reps de uma série, com feedback da última registrada.
function LogCarga({ exercicio, cor, ultima, onRegistrar }) {
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
        {ultima && (
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#666" }}>
            última: {ultima.carga} kg × {ultima.reps}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Plano({ plano, perfil, recomendacao, token, onVoltar }) {
  const { days, schedule, semAcademia } = plano;
  const [activeDay, setActiveDay] = useState(days[0]?.id);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [tab, setTab] = useState("treino");
  const [historico, setHistorico] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [descanso, setDescanso] = useState(null); // { segundos, chave }
  const [exGrafico, setExGrafico] = useState("");
  const [fadiga, setFadiga] = useState("normal");

  // Carrega histórico, registros e dashboard (agregado no servidor) ao montar.
  useEffect(() => {
    let ativo = true;
    Promise.all([api.getHistorico(token), api.getRegistros(token), api.getDashboard(token)])
      .then(([h, r, d]) => {
        if (!ativo) return;
        setHistorico(h);
        setRegistros(r);
        setDashboard(d);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [token]);

  const recarregarDashboard = () => api.getDashboard(token).then(setDashboard).catch(() => {});

  const currentDay = days.find((d) => d.id === activeDay) ?? days[0];

  const hoje = new Date().toISOString();
  const feitoHoje = historico.some((h) => h.diaId === currentDay.id && mesmoDia(h.data, hoje));

  const concluirTreino = async () => {
    if (feitoHoje) return;
    const novo = await api.addHistorico(token, { diaId: currentDay.id, diaLabel: currentDay.label, foco: currentDay.focus });
    setHistorico((prev) => [novo, ...prev]);
    recarregarDashboard();
  };

  const iniciarDescanso = (rest) => setDescanso({ segundos: parseDescanso(rest), chave: Date.now() });

  const salvarSerie = async (entrada) => {
    const novo = await api.addRegistro(token, entrada);
    setRegistros((prev) => [novo, ...prev]);
    recarregarDashboard();
  };

  const ultimaSerieDe = (nome) => registros.find((r) => r.exercicio === nome);

  // Agregados do dashboard (calculados no servidor).
  const total = dashboard?.total ?? 0;
  const ultimos7 = dashboard?.ultimos7 ?? 0;
  const freqSemana = dashboard?.frequencia ?? [];
  const exercicios = dashboard ? Object.keys(dashboard.progressao) : [];
  const exSelecionado = exGrafico || exercicios[0] || "";
  const dadosCarga = dashboard?.progressao?.[exSelecionado] ?? [];

  // Ajuste de intensidade do dia e planejamento da semana.
  const exerciciosDoDia = ajustarExercicios(currentDay.exercises, fadiga);
  const dicaFadiga = NIVEIS_FADIGA.find((n) => n.id === fadiga);
  const planejamento = planejarSemana(schedule, historico);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#f0ece4" }}>
      {/* Header */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "20px 20px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button
            type="button"
            onClick={onVoltar}
            style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 16 }}
          >
            ← Voltar ao resultado
          </button>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: "#555" }}>
              {(() => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; })()},
            </span>{" "}
            <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{perfil.nome.split(" ")[0]}</span>
          </div>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 3, textTransform: "uppercase" }}>
            {recomendacao.enfase}
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "4px 0 4px", letterSpacing: -1, lineHeight: 1.1 }}>
            Seu Plano — <span style={{ color: accent }}>{plano.divisao}</span>
          </h1>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px", fontFamily: "monospace" }}>
            {perfil.peso} kg · {perfil.altura} cm · {recomendacao.dias}x/semana · {recomendacao.volume}
          </p>

          {semAcademia && (
            <div style={{ background: "#FF6B3510", border: "1px solid #FF6B3530", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#cda", lineHeight: 1.5 }}>
              Sem academia/halteres? Use as variações sugeridas em cada exercício (peso corporal, elásticos) e progrida por repetições e cadência.
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1e1e1e" }}>
            {[["treino", "Treino"], ["progressao", "Progressão"], ["semana", "Semana"], ["historico", "Evolução"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "10px 16px",
                  fontSize: 13,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  color: tab === id ? accent : "#555",
                  borderBottom: tab === id ? `2px solid ${accent}` : "2px solid transparent",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px", paddingBottom: descanso ? 110 : 24 }}>
        {tab === "treino" && (
          <>
            {/* Seletor de dia */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {days.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setActiveDay(d.id); setExpandedExercise(null); }}
                  style={{
                    background: activeDay === d.id ? d.color : "#141414",
                    color: activeDay === d.id ? "#000" : "#666",
                    border: activeDay === d.id ? "none" : "1px solid #222",
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: 1,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Cabeçalho do dia */}
            <div style={{ background: "#111", border: `1px solid ${currentDay.color}22`, borderLeft: `3px solid ${currentDay.color}`, borderRadius: 8, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: currentDay.color, letterSpacing: 3, marginBottom: 6 }}>
                {currentDay.tag}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f0ece4", lineHeight: 1.4 }}>{currentDay.focus}</div>
            </div>

            {/* Como você está hoje? (ajuste por fadiga) */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#777", letterSpacing: 2, marginBottom: 8 }}>
                COMO VOCÊ ESTÁ HOJE?
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {NIVEIS_FADIGA.map((n) => {
                  const ativo = fadiga === n.id;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setFadiga(n.id)}
                      style={{
                        flex: "1 1 0",
                        minWidth: 96,
                        background: ativo ? `${accent}18` : "#141414",
                        border: `1px solid ${ativo ? accent : "#222"}`,
                        color: ativo ? accent : "#999",
                        borderRadius: 8,
                        padding: "10px 8px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {n.emoji} {n.label}
                    </button>
                  );
                })}
              </div>
              {fadiga !== "normal" && dicaFadiga && (
                <div style={{ marginTop: 10, background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: 6, padding: "10px 12px", fontSize: 12, color: "#bcd", lineHeight: 1.5 }}>
                  {dicaFadiga.dica}
                </div>
              )}
            </div>

            {/* CTA principal do dia */}
            <button
              type="button"
              onClick={concluirTreino}
              disabled={feitoHoje}
              style={{
                width: "100%",
                marginBottom: 20,
                background: feitoHoje ? "#141414" : currentDay.color,
                color: feitoHoje ? "#5a5" : "#000",
                border: feitoHoje ? "1px solid #2a3a2a" : "none",
                borderRadius: 999,
                padding: "16px 20px",
                fontSize: 15,
                fontWeight: 700,
                cursor: feitoHoje ? "default" : "pointer",
                letterSpacing: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {feitoHoje
                ? `✓ ${currentDay.label} concluído hoje`
                : <><span style={{ fontSize: 18 }}>▶</span> Iniciar {currentDay.label}</>}
            </button>

            {/* Exercícios */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exerciciosDoDia.map((ex, i) => {
                const isOpen = expandedExercise === i;
                return (
                  <div key={i} style={{ background: isOpen ? "#141414" : "#0f0f0f", border: `1px solid ${isOpen ? "#2a2a2a" : "#1a1a1a"}`, borderRadius: 8, overflow: "hidden" }}>
                    <button
                      onClick={() => setExpandedExercise(isOpen ? null : i)}
                      style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: ex.category === "PRINCIPAL" ? currentDay.color : "#555", minWidth: 70, textTransform: "uppercase" }}>
                        {ex.category}
                      </span>
                      <span style={{ fontSize: 14, color: "#e8e4dc", fontWeight: 500, flex: 1 }}>{ex.name}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#444" }}>{isOpen ? "▲" : "▼"}</span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid #1a1a1a" }}>
                        <div style={{ display: "flex", gap: 16, marginTop: 12, marginBottom: 12, flexWrap: "wrap" }}>
                          {[["SÉRIES", ex.sets, ex.ajusteSets], ["REPS", ex.reps], ["DESCANSO", ex.rest]].map(([label, val, ajuste]) => (
                            <div key={label} style={{ background: "#1a1a1a", borderRadius: 6, padding: "8px 12px" }}>
                              <div style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: 2 }}>{label}</div>
                              <div style={{ fontFamily: "monospace", fontSize: 14, color: "#f0ece4", fontWeight: 700, marginTop: 2 }}>
                                {val}
                                {ajuste ? (
                                  <span style={{ color: accent, fontSize: 10, marginLeft: 4 }}>
                                    ({ajuste > 0 ? `+${ajuste}` : ajuste})
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 10 }}>{ex.note}</div>
                        <div style={{ background: `${currentDay.color}15`, border: `1px solid ${currentDay.color}30`, borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 11, color: currentDay.color, letterSpacing: 0.5 }}>
                          ↑ PROGRESSÃO: {ex.progression}
                        </div>

                        <button
                          type="button"
                          onClick={() => iniciarDescanso(ex.rest)}
                          style={{ marginTop: 10, background: "none", border: `1px solid ${currentDay.color}40`, color: currentDay.color, borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                          ⏱ Iniciar descanso ({ex.rest})
                        </button>

                        <LogCarga
                          exercicio={ex.name}
                          cor={currentDay.color}
                          ultima={ultimaSerieDe(ex.name)}
                          onRegistrar={salvarSerie}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </>
        )}

        {tab === "progressao" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: -0.5 }}>Como Medir a Evolução</h2>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 24, fontFamily: "monospace" }}>Métricas semanais e mensais</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {METRICAS.map((m, i) => (
                <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{m.title}</div>
                    <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#0f0f0f", border: "1px solid #222", borderRadius: 8, padding: "20px", marginBottom: 20 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: accent, letterSpacing: 3, marginBottom: 12 }}>MODELO DE DUPLA PROGRESSÃO</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["SEMANA 1", "Carga base estabelecida. Todas as séries com ~2 reps de reserva (RIR 2).", "#333"],
                  ["SEMANA 2", "Se atingiu todas as reps → +carga nos compostos.", "#1a2a1a"],
                  ["SEMANA 3", "Adicione 1 rep por série nos acessórios até o teto, depois aumente a carga.", "#1a1a2a"],
                  ["SEMANA 4", "Deload: reduza o volume em 40%, mantenha a carga. Recuperação ativa.", "#2a1a1a"],
                ].map(([week, desc, bg]) => (
                  <div key={week} style={{ background: bg, borderRadius: 6, padding: "10px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: accent, minWidth: 72 }}>{week}</span>
                    <span style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {Number(perfil.altura) >= 190 && (
              <div style={{ background: "#FF6B3510", border: "1px solid #FF6B3530", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#FF6B35", letterSpacing: 3, marginBottom: 8 }}>
                  ATENÇÃO — ALAVANCAS LONGAS ({(Number(perfil.altura) / 100).toFixed(2)} m)
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 13, color: "#888", lineHeight: 1.8 }}>
                  <li>Sua amplitude de movimento é maior que a média — use isso a favor (ROM = estímulo mecânico).</li>
                  <li>Progrida mais devagar em agachamento, terra e barra fixa.</li>
                  <li>Verifique a técnica no espelho ou câmera antes de aumentar carga.</li>
                  <li>Respeite o descanso mais longo nos compostos.</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "semana" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: -0.5 }}>Estrutura Semanal</h2>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 24, fontFamily: "monospace" }}>{plano.divisao} · {recomendacao.dias} dias</p>

            {/* Reorganização ao faltar treino */}
            {planejamento.sugestoes.some((s) => s.para) && (
              <div style={{ background: "#FF6B3510", border: "1px solid #FF6B3530", borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#FF6B35", letterSpacing: 3, marginBottom: 8 }}>
                  VOCÊ PERDEU {planejamento.perdidos.length} TREINO(S)
                </div>
                <div style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>
                  Sugestão para não perder o volume da semana:
                  <ul style={{ margin: "6px 0 0", padding: "0 0 0 18px" }}>
                    {planejamento.sugestoes.filter((s) => s.para).map((s, i) => (
                      <li key={i}>
                        Faça <strong style={{ color: "#cdd" }}>{DIAS[s.session]?.label ?? s.session}</strong> no {s.para}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {planejamento.dias.map((day, i) => {
                const dayData = day.session ? DIAS[day.session] : null;
                const info = STATUS_SEMANA[day.status];
                const destaque = day.status === "perdido" || day.status === "hoje";
                return (
                  <div key={i} style={{ background: day.rest ? "#0a0a0a" : "#0f0f0f", border: `1px solid ${destaque ? `${info.cor}55` : day.rest ? "#141414" : "#1a1a1a"}`, borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: day.rest ? "#333" : "#666", minWidth: 36 }}>{day.day}</div>
                    {day.rest ? (
                      <div style={{ flex: 1, fontSize: 13, color: "#333", fontStyle: "italic" }}>Descanso / Recuperação Ativa</div>
                    ) : (
                      <>
                        <div style={{ background: dayData.color, color: "#000", borderRadius: 4, padding: "2px 8px", fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{dayData.label}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "#e8e4dc", fontWeight: 500 }}>{dayData.focus.split(" — ")[0]}</div>
                          <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginTop: 2 }}>{dayData.focus.split(" — ")[1]}</div>
                        </div>
                      </>
                    )}
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: info.cor, fontWeight: 700 }}>{info.label}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "20px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: accent, letterSpacing: 3, marginBottom: 14 }}>PRINCÍPIOS DO BLOCO</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Sobrecarga Progressiva", "A base do treino. Sem progressão registrada, não há estímulo de crescimento."],
                  ["Frequência por Grupo", "Treine cada músculo 2× por semana sempre que a divisão permitir."],
                  ["Técnica sobre Ego", "Carga técnica bate carga máxima — especialmente nos compostos."],
                  ["Deload a cada 4 sem.", "Evita overreaching e potencializa a supercompensação no ciclo seguinte."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ borderLeft: "2px solid #222", paddingLeft: 12 }}>
                    <div style={{ fontSize: 13, color: "#e8e4dc", fontWeight: 500, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "historico" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: -0.5 }}>Evolução</h2>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 24, fontFamily: "monospace" }}>Consistência, cargas e histórico</p>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1, background: "#0f0f0f", border: `1px solid ${accent}30`, borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Última semana</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: accent, lineHeight: 1 }}>{ultimos7}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 4 }}>treinos</div>
              </div>
              <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Total</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: "#e8e4dc", lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 4 }}>sessões</div>
              </div>
              <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Semanas</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: "#888", lineHeight: 1 }}>{freqSemana.length}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 4 }}>ativas</div>
              </div>
            </div>

            {/* Consistência semanal */}
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: accent, letterSpacing: 3, marginBottom: 4 }}>CONSISTÊNCIA</div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Treinos por semana (últimas 6)</div>
              <MiniGrafico dados={freqSemana} cor={accent} />
            </div>

            {/* Progressão de carga */}
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "18px 20px", marginBottom: 24 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#00D4FF", letterSpacing: 3, marginBottom: 10 }}>PROGRESSÃO DE CARGA</div>
              {exercicios.length === 0 ? (
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                  Registre séries (kg × reps) ao expandir um exercício na aba <strong style={{ color: "#888" }}>Treino</strong> para ver a evolução de carga aqui.
                </div>
              ) : (
                <>
                  <select
                    value={exSelecionado}
                    onChange={(e) => setExGrafico(e.target.value)}
                    style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "#f0ece4", marginBottom: 4 }}
                  >
                    {exercicios.map((nome) => (
                      <option key={nome} value={nome}>{nome}</option>
                    ))}
                  </select>
                  <MiniGrafico dados={dadosCarga} cor="#00D4FF" sufixo="kg" />
                </>
              )}
            </div>

            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 12 }}>SESSÕES CONCLUÍDAS</div>
            {historico.length === 0 ? (
              <div style={{ background: "#0f0f0f", border: "1px dashed #2a2a2a", borderRadius: 8, padding: "28px 20px", textAlign: "center", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                Nenhum treino registrado ainda.<br />Conclua um treino na aba <strong style={{ color: "#888" }}>Treino</strong> para começar.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {historico.map((h) => {
                  const cor = DIAS[h.diaId]?.color ?? "#888";
                  return (
                    <div key={h.id} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ background: cor, color: "#000", borderRadius: 4, padding: "2px 8px", fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{h.diaLabel}</div>
                      <div style={{ flex: 1, fontSize: 13, color: "#e8e4dc" }}>{h.foco?.split(" — ")[0]}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#555", textTransform: "capitalize" }}>{formatarData(h.data)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {descanso && (
        <RestTimer segundos={descanso.segundos} chave={descanso.chave} onFechar={() => setDescanso(null)} />
      )}
    </div>
  );
}
