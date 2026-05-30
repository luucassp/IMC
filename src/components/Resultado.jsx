import { OBJETIVOS, NIVEIS } from "../data/onboarding.js";

const accent = "#c8ff00";

function rotulo(lista, id) {
  return lista.find((x) => x.id === id)?.label ?? id;
}

function Bloco({ titulo, children }) {
  return (
    <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, padding: "18px 20px" }}>
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
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 28px", letterSpacing: -0.5 }}>
        Pronto, {perfil.nome.split(" ")[0]} 👊
      </h1>

      {/* IMC em destaque */}
      <div
        style={{
          background: `${faixa.cor}12`,
          border: `1px solid ${faixa.cor}40`,
          borderLeft: `4px solid ${faixa.cor}`,
          borderRadius: 12,
          padding: "22px 24px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontFamily: "monospace", fontSize: 10, color: faixa.cor, letterSpacing: 3, marginBottom: 8 }}>
          SEU IMC
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, color: "#fff" }}>{imc}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: faixa.cor }}>{faixa.classe}</span>
        </div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 10, fontFamily: "monospace" }}>
          {perfil.peso} kg · {perfil.altura} cm
        </div>
      </div>

      {/* Recomendação */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <Bloco titulo="TREINO RECOMENDADO">
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

        <Bloco titulo="SEU PERFIL">
          <Linha label="Nível" valor={rotulo(NIVEIS, perfil.nivel)} />
          <Linha label="Tempo por treino" valor={`${perfil.tempoPorTreino} min`} />
          <div style={{ paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: "#777", marginBottom: 10 }}>Objetivo (toque para trocar)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {OBJETIVOS.map((o) => {
                const ativo = perfil.objetivo === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => onTrocarObjetivo(o.id)}
                    style={{
                      background: ativo ? `${accent}18` : "#141414",
                      border: `1px solid ${ativo ? accent : "#222"}`,
                      color: ativo ? accent : "#999",
                      borderRadius: 999,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {o.icon} {o.label}
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
          padding: "16px 20px",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: 0.5,
          marginBottom: 12,
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
