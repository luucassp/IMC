import { OBJETIVOS, NIVEIS } from "../data/onboarding.js";

const accent = "#c8ff00";

function rotulo(lista, id) {
  return lista.find((x) => x.id === id)?.label ?? id;
}

function Bloco({ titulo, children, delay = 0 }) {
  return (
    <div style={{
      background: "linear-gradient(145deg, #111318 0%, #0d0d0f 100%)",
      border: "1px solid rgba(255,255,255,0.04)",
      borderRadius: 12,
      padding: "18px 20px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      animation: `fadeUp 0.5s ${delay}s ease both`,
    }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: accent, letterSpacing: 3, marginBottom: 14 }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function Linha({ label, valor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 0", borderBottom: "1px solid #161616" }}>
      <span style={{ fontSize: 13, color: "#777" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#e8e4dc", fontWeight: 600, textAlign: "right" }}>{valor}</span>
    </div>
  );
}

export default function Resultado({ perfil, imc, faixa, recomendacao, onVerPlano, onTrocarObjetivo, onReiniciar, onVoltar, onSair }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>
      {onVoltar && (
        <button
          type="button"
          onClick={onVoltar}
          style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 12 }}
        >
          ← Voltar
        </button>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 3, textTransform: "uppercase" }}>
          Meu perfil
        </span>
        <button
          type="button"
          onClick={onSair}
          style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13 }}
        >
          Sair
        </button>
      </div>
      <h1 style={{
        fontSize: "clamp(36px, 9vw, 60px)",
        fontWeight: 900,
        margin: "6px 0 28px",
        letterSpacing: -3,
        lineHeight: 0.95,
        background: "linear-gradient(135deg, #f0ece4 0%, #666 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "fadeUp 0.5s ease both",
      }}>
        Pronto, {perfil.nome.split(" ")[0]}
      </h1>

      {/* Card de perfil de treino */}
      <div style={{ marginBottom: 16, animation: "fadeUp 0.5s 0.08s ease both" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 12 }}>
          PERFIL DE TREINO
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{
            flex: 1,
            background: "linear-gradient(145deg, #111318 0%, #0d0d0f 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "16px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>Nível</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e8e4dc", lineHeight: 1.2 }}>{rotulo(NIVEIS, perfil.nivel)}</div>
          </div>
          <div style={{
            flex: 1,
            background: `linear-gradient(135deg, ${accent}20 0%, ${accent}08 100%)`,
            border: `1px solid ${accent}40`,
            borderRadius: 12,
            padding: "16px 14px",
            boxShadow: `0 0 32px ${accent}12, inset 0 1px 0 ${accent}30`,
          }}>
            <div style={{ fontSize: 10, color: accent, fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>Dias/sem.</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: accent, lineHeight: 1, textShadow: `0 0 24px ${accent}60` }}>{recomendacao.dias}</div>
          </div>
          <div style={{
            flex: 1,
            background: "linear-gradient(145deg, #111318 0%, #0d0d0f 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "16px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>Divisão</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e8e4dc", lineHeight: 1.3 }}>{recomendacao.divisao}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div style={{
            flex: 1,
            background: "linear-gradient(145deg, #111318 0%, #0d0d0f 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>Volume</span>
            <span style={{ fontSize: 13, color: "#e8e4dc", fontWeight: 600 }}>{recomendacao.volume}</span>
          </div>
          <div style={{
            flex: 1,
            background: "linear-gradient(145deg, #111318 0%, #0d0d0f 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>Reps</span>
            <span style={{ fontSize: 13, color: "#e8e4dc", fontWeight: 600 }}>{recomendacao.reps}</span>
          </div>
        </div>
      </div>

      {/* IMC */}
      {imc != null && (
        <div style={{
          display: "flex", gap: 10, marginBottom: 16,
          animation: "fadeUp 0.5s 0.12s ease both",
        }}>
          <div style={{
            flex: 1,
            background: "linear-gradient(145deg, #111318 0%, #0d0d0f 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "16px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>IMC</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: faixa?.cor ?? "#666", lineHeight: 1 }}>{imc}</div>
          </div>
          <div style={{
            flex: 2,
            background: "linear-gradient(145deg, #111318 0%, #0d0d0f 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "16px 14px",
            display: "flex", flexDirection: "column", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>Classificação</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: faixa?.cor ?? "#666", lineHeight: 1.2 }}>{faixa?.classe ?? "—"}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>{perfil.peso} kg · {perfil.altura} cm</div>
          </div>
        </div>
      )}

      {/* Recomendação */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <Bloco titulo="TREINO RECOMENDADO" delay={0.16}>
          <Linha label="Divisão" valor={recomendacao.divisao} />
          <Linha label="Frequência" valor={`${recomendacao.dias}x por semana`} />
          <Linha label="Faixa de repetições" valor={recomendacao.reps} />
          <Linha label="Descanso" valor={recomendacao.descanso} />
          <Linha label="Cardio" valor={recomendacao.cardio} />
          <Linha label="Volume alvo" valor={recomendacao.volume} />
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.6, marginTop: 12 }}>
            <strong style={{ color: "#c8ccc0" }}>Ênfase: </strong>
            {recomendacao.enfase}
          </div>
        </Bloco>

        {recomendacao.alertas.length > 0 && (
          <div
            style={{
              background: "#FF6B3510",
              border: "1px solid #FF6B3530",
              borderRadius: 10,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#FF6B35", letterSpacing: 3, marginBottom: 10 }}>
              ATENÇÃO
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 13, color: "#999", lineHeight: 1.7 }}>
              {recomendacao.alertas.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <Bloco titulo="SEU PERFIL" delay={0.24}>
          <Linha label="Nível" valor={rotulo(NIVEIS, perfil.nivel)} />
          <Linha label="Tempo por treino" valor={`${perfil.tempoPorTreino} min`} />
          <div style={{ paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: "#777", marginBottom: 10 }}>Objetivo (toque para trocar)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {OBJETIVOS.map((o) => {
                const isPrimario = perfil.objetivo === o.id;
                const isSecundario = (perfil.objetivosExtras ?? []).includes(o.id);
                const ativo = isPrimario || isSecundario;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => onTrocarObjetivo(o.id)}
                    style={{
                      background: isPrimario ? `${accent}18` : isSecundario ? "#1a1a1a" : "#141414",
                      border: `1px solid ${isPrimario ? accent : isSecundario ? "#444" : "#222"}`,
                      color: isPrimario ? accent : isSecundario ? "#aaa" : "#999",
                      borderRadius: 999,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {o.icon} {o.label}
                    {isPrimario && <span style={{ fontFamily: "monospace", fontSize: 8, marginLeft: 4, letterSpacing: 1, verticalAlign: "middle", color: accent }}>PRINCIPAL</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </Bloco>
      </div>

      <button
        type="button"
        onClick={onVerPlano}
        style={{
          width: "100%",
          background: accent,
          color: "#000",
          border: "none",
          borderRadius: 999,
          padding: "18px 20px",
          fontSize: 15,
          fontWeight: 800,
          cursor: "pointer",
          letterSpacing: 0.5,
          marginBottom: 12,
          boxShadow: `0 0 32px ${accent}50, 0 4px 16px rgba(0,0,0,0.5)`,
          animation: "fadeUp 0.5s 0.32s ease both",
        }}
      >
        Ver plano completo →
      </button>
      <button
        type="button"
        onClick={onReiniciar}
        style={{
          width: "100%",
          background: "none",
          border: "1px solid #2a2a2a",
          color: "#888",
          borderRadius: 999,
          padding: "14px 20px",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Refazer questionário
      </button>
    </div>
  );
}
