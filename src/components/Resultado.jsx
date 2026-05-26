import { calcularIMC, classificarIMC } from "../lib/imc.js";
import { recomendarTreino } from "../lib/recomendacao.js";
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

export default function Resultado({ perfil, onReiniciar }) {
  const imc = calcularIMC(perfil.peso, perfil.altura);
  const faixa = classificarIMC(imc);
  const plano = recomendarTreino(perfil, imc, faixa);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>
      <span style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 3, textTransform: "uppercase" }}>
        Perfil concluído
      </span>
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
          <Linha label="Divisão" valor={plano.divisao} />
          <Linha label="Frequência" valor={`${plano.dias}x por semana`} />
          <Linha label="Faixa de repetições" valor={plano.reps} />
          <Linha label="Descanso" valor={plano.descanso} />
          <Linha label="Cardio" valor={plano.cardio} />
          <Linha label="Volume alvo" valor={plano.volume} />
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.6, marginTop: 12 }}>
            <strong style={{ color: "#c8ccc0" }}>Ênfase: </strong>
            {plano.enfase}
          </div>
        </Bloco>

        {plano.alertas.length > 0 && (
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
              {plano.alertas.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <Bloco titulo="SEU PERFIL">
          <Linha label="Objetivo" valor={rotulo(OBJETIVOS, perfil.objetivo)} />
          <Linha label="Nível" valor={rotulo(NIVEIS, perfil.nivel)} />
          <Linha label="Tempo por treino" valor={`${perfil.tempoPorTreino} min`} />
        </Bloco>
      </div>

      <button
        type="button"
        onClick={onReiniciar}
        style={{
          width: "100%",
          background: "none",
          border: "1px solid #2a2a2a",
          color: "#888",
          borderRadius: 8,
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
