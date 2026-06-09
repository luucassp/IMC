import { useState } from "react";
import {
  SEXOS,
  OBJETIVOS,
  NIVEIS,
  TEMPOS,
  EQUIPAMENTOS,
  ENFASES_CORPORAIS,
  RESTRICOES,
} from "../data/onboarding.js";

const PERFIL_INICIAL = {
  idade: "",
  sexo: "",
  altura: "",
  peso: "",
  objetivos: [], // primário = índice 0; restantes são secundários
  enfaseCorporal: "equilibrado",
  nivel: "",
  diasPorSemana: "",
  tempoPorTreino: "",
  equipamentos: [],
  restricoes: [],
};

const accent = "#c8ff00";

const s = {
  campoLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#777",
    letterSpacing: 2,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    background: "#141414",
    border: "1px solid #222",
    borderRadius: 8,
    padding: "14px 16px",
    fontSize: 18,
    color: "#f0ece4",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 },
};

function Card({ ativo, selecionado, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: selecionado ? `${accent}18` : "#141414",
        border: `1px solid ${selecionado ? accent : "#222"}`,
        borderRadius: 10,
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        color: selecionado ? accent : "#d8d4cc",
        transition: "all 0.15s",
        width: "100%",
      }}
    >
      {children}
    </button>
  );
}

export default function Onboarding({ onConcluir, erro }) {
  const [etapa, setEtapa] = useState(0);
  const [perfil, setPerfil] = useState(PERFIL_INICIAL);

  const set = (campo, valor) => setPerfil((p) => ({ ...p, [campo]: valor }));

  const toggle = (campo, id) =>
    setPerfil((p) => {
      const atual = p[campo];
      return {
        ...p,
        [campo]: atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
      };
    });

  const etapas = [
    {
      titulo: "Sobre você",
      sub: "Idade e sexo biológico",
      valido: () => Number(perfil.idade) > 0 && perfil.sexo,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={s.campoLabel} htmlFor="idade">Idade</label>
            <input
              id="idade"
              type="number"
              min="10"
              max="100"
              style={s.input}
              value={perfil.idade}
              onChange={(e) => set("idade", e.target.value)}
              placeholder="Ex.: 28"
              autoFocus
            />
          </div>
          <div>
            <span style={s.campoLabel}>Sexo</span>
            <div style={s.grid}>
              {SEXOS.map((opt) => (
                <Card key={opt.id} selecionado={perfil.sexo === opt.id} onClick={() => set("sexo", opt.id)}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      titulo: "Medidas",
      sub: "Usamos isso para calcular seu IMC",
      valido: () => Number(perfil.altura) > 0 && Number(perfil.peso) > 0,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={s.campoLabel} htmlFor="altura">Altura (cm)</label>
            <input
              id="altura"
              type="number"
              min="100"
              max="250"
              style={s.input}
              value={perfil.altura}
              onChange={(e) => set("altura", e.target.value)}
              placeholder="Ex.: 194"
            />
          </div>
          <div>
            <label style={s.campoLabel} htmlFor="peso">Peso (kg)</label>
            <input
              id="peso"
              type="number"
              min="30"
              max="300"
              step="0.1"
              style={s.input}
              value={perfil.peso}
              onChange={(e) => set("peso", e.target.value)}
              placeholder="Ex.: 113"
            />
          </div>
        </div>
      ),
    },
    {
      titulo: "Seus objetivos",
      sub: "Escolha o foco principal (1º) e mescle até 2 secundários",
      valido: () => perfil.objetivos.length > 0,
      render: () => {
        const alternar = (id) => {
          const atual = perfil.objetivos;
          if (atual.includes(id)) {
            set("objetivos", atual.filter((x) => x !== id));
          } else if (atual.length < 3) {
            set("objetivos", [...atual, id]);
          }
        };
        return (
          <div style={s.grid}>
            {OBJETIVOS.map((opt) => {
              const idx = perfil.objetivos.indexOf(opt.id);
              const ativo = idx >= 0;
              const ehPrimario = idx === 0;
              return (
                <Card key={opt.id} selecionado={ativo} onClick={() => alternar(opt.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
                    {ativo && (
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: ehPrimario ? "#c8ff00" : "#888", letterSpacing: 1.5, padding: "2px 6px", border: `1px solid ${ehPrimario ? "#c8ff00" : "#333"}`, borderRadius: 4 }}>
                        {ehPrimario ? "PRIMÁRIO" : `+${idx}`}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
                </Card>
              );
            })}
          </div>
        );
      },
    },
    {
      titulo: "Ênfase corporal",
      sub: "Como quer distribuir o volume entre superior e inferior?",
      valido: () => Boolean(perfil.enfaseCorporal),
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ENFASES_CORPORAIS.map((opt) => (
            <Card
              key={opt.id}
              selecionado={perfil.enfaseCorporal === opt.id}
              onClick={() => set("enfaseCorporal", opt.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>{opt.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{opt.label}</span>
              </div>
              <div style={{ fontSize: 12, color: "#777" }}>{opt.desc}</div>
            </Card>
          ))}
        </div>
      ),
    },
    {
      titulo: "Experiência",
      sub: "Há quanto tempo você treina?",
      valido: () => perfil.nivel,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {NIVEIS.map((opt) => (
            <Card key={opt.id} selecionado={perfil.nivel === opt.id} onClick={() => set("nivel", opt.id)}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{opt.label}</div>
              <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>{opt.desc}</div>
            </Card>
          ))}
        </div>
      ),
    },
    {
      titulo: "Disponibilidade",
      sub: "Frequência e tempo por sessão",
      valido: () => Number(perfil.diasPorSemana) > 0 && Number(perfil.tempoPorTreino) > 0,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <span style={s.campoLabel}>Dias por semana</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("diasPorSemana", n)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 700,
                    background: perfil.diasPorSemana === n ? accent : "#141414",
                    color: perfil.diasPorSemana === n ? "#000" : "#888",
                    border: `1px solid ${perfil.diasPorSemana === n ? accent : "#222"}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={s.campoLabel}>Tempo por treino</span>
            <div style={s.grid}>
              {TEMPOS.map((opt) => (
                <Card
                  key={opt.id}
                  selecionado={perfil.tempoPorTreino === opt.id}
                  onClick={() => set("tempoPorTreino", opt.id)}
                >
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      titulo: "Equipamentos",
      sub: "O que você tem disponível? (pode marcar vários)",
      valido: () => perfil.equipamentos.length > 0,
      render: () => (
        <div style={s.grid}>
          {EQUIPAMENTOS.map((opt) => (
            <Card
              key={opt.id}
              selecionado={perfil.equipamentos.includes(opt.id)}
              onClick={() => toggle("equipamentos", opt.id)}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
            </Card>
          ))}
        </div>
      ),
    },
    {
      titulo: "Restrições físicas",
      sub: "Alguma região exige cuidado? (opcional)",
      valido: () => true,
      render: () => (
        <div style={s.grid}>
          {RESTRICOES.map((opt) => (
            <Card
              key={opt.id}
              selecionado={perfil.restricoes.includes(opt.id)}
              onClick={() => toggle("restricoes", opt.id)}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  const etapaAtual = etapas[etapa];
  const ehUltima = etapa === etapas.length - 1;
  const progresso = ((etapa + 1) / etapas.length) * 100;
  const podeAvancar = etapaAtual.valido();

  const avancar = () => {
    if (!podeAvancar) return;
    if (ehUltima) onConcluir(perfil);
    else setEtapa((e) => e + 1);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>
      {/* Barra de progresso */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: accent, letterSpacing: 2 }}>
            PASSO {etapa + 1}/{etapas.length}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#555" }}>
            {Math.round(progresso)}%
          </span>
        </div>
        <div style={{ height: 4, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progresso}%`, background: accent, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Cabeçalho da etapa */}
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: -0.5 }}>
        {etapaAtual.titulo}
      </h1>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 28px", fontFamily: "monospace" }}>
        {etapaAtual.sub}
      </p>

      {/* Conteúdo */}
      <div style={{ marginBottom: 32 }}>{etapaAtual.render()}</div>

      {erro && (
        <div style={{ background: "#FF3B3B15", border: "1px solid #FF3B3B40", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff8c8c", marginBottom: 12 }}>
          {erro}
        </div>
      )}

      {/* Navegação */}
      <div style={{ display: "flex", gap: 12 }}>
        {etapa > 0 && (
          <button
            type="button"
            onClick={() => setEtapa((e) => e - 1)}
            style={{
              background: "none",
              border: "1px solid #2a2a2a",
              color: "#888",
              borderRadius: 8,
              padding: "14px 20px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Voltar
          </button>
        )}
        <button
          type="button"
          onClick={avancar}
          disabled={!podeAvancar}
          style={{
            flex: 1,
            background: podeAvancar ? accent : "#1a1a1a",
            color: podeAvancar ? "#000" : "#444",
            border: "none",
            borderRadius: 8,
            padding: "14px 20px",
            fontSize: 15,
            fontWeight: 700,
            cursor: podeAvancar ? "pointer" : "not-allowed",
            letterSpacing: 0.5,
          }}
        >
          {ehUltima ? "Ver meu resultado" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
