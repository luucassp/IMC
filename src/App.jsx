import { useState, useEffect, lazy, Suspense } from "react";
import { calcularIMC, classificarIMC } from "./lib/imc.js";
import { recomendarTreino } from "./lib/recomendacao.js";
import { gerarPlano } from "./lib/plano.js";
import { api } from "./lib/api.js";

const Home = lazy(() => import("./components/Home.tsx"));
const Onboarding = lazy(() => import("./components/Onboarding.jsx"));
const Resultado = lazy(() => import("./components/Resultado.jsx"));
const Plano = lazy(() => import("./components/Plano.jsx"));
const TreinoLivre = lazy(() => import("./components/TreinoLivre.jsx"));
const Ciclo = lazy(() => import("./components/Ciclo.jsx"));

// Normaliza os campos do onboarding para os tipos esperados pelo storage local.
function perfilParaApi(p) {
  const objetivos = p.objetivos ?? (p.objetivo ? [p.objetivo] : []);
  return {
    idade: Number(p.idade),
    sexo: p.sexo,
    altura: Number(p.altura),
    peso: Number(p.peso),
    objetivo: objetivos[0] ?? "",
    objetivosExtras: objetivos.slice(1),
    nivel: p.nivel,
    diasPorSemana: Number(p.diasPorSemana),
    tempoPorTreino: Number(p.tempoPorTreino),
    equipamentos: p.equipamentos,
    restricoes: p.restricoes,
  };
}

function Carregando() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#666", fontFamily: "monospace", fontSize: 14 }}>
      Carregando...
    </div>
  );
}

export default function App() {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [view, setView] = useState("home");
  const [erro, setErro] = useState("");

  // App pessoal, modo local: perfil vem do localStorage — sem login.
  useEffect(() => {
    api.getPerfil()
      .then(setPerfil)
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const concluirOnboarding = async (p) => {
    setErro("");
    try {
      const salvo = await api.putPerfil(null, perfilParaApi(p));
      setPerfil(salvo);
      setView("home");
    } catch (e) {
      setErro(e.message || "Não foi possível salvar seu perfil.");
    }
  };

  const trocarObjetivo = async (objetivo) => {
    const anterior = perfil;
    setPerfil({ ...perfil, objetivo });
    try {
      const salvo = await api.putPerfil(null, { objetivo });
      setPerfil(salvo);
    } catch {
      setPerfil(anterior);
    }
  };

  const refazer = async () => {
    await api.resetPerfil();
    setPerfil(null);
    setView("home");
  };

  if (carregando) return <Carregando />;

  if (!perfil) {
    return (
      <Suspense fallback={<Carregando />}>
        <Onboarding onConcluir={concluirOnboarding} erro={erro} />
      </Suspense>
    );
  }

  const user = { nome: perfil.nome || "Atleta" };
  const perfilUI = { ...perfil, nome: user.nome };
  const imc = calcularIMC(perfil.peso, perfil.altura);
  const faixa = classificarIMC(imc);
  const recomendacao = recomendarTreino(perfil, imc, faixa);
  const plano = gerarPlano(perfil, recomendacao);

  let conteudo;

  if (view === "ciclo") {
    conteudo = <Ciclo token="" onVoltar={() => setView("home")} />;
  } else if (view === "plano") {
    conteudo = <Plano plano={plano} perfil={perfilUI} recomendacao={recomendacao} token="" onVoltar={() => setView("home")} />;
  } else if (view === "evolucao") {
    conteudo = <Plano plano={plano} perfil={perfilUI} recomendacao={recomendacao} token="" onVoltar={() => setView("home")} tabInicial="historico" />;
  } else if (view === "treino-livre") {
    conteudo = <TreinoLivre perfil={perfilUI} token="" onVoltar={() => setView("home")} />;
  } else if (view === "perfil") {
    conteudo = (
      <Resultado
        perfil={perfilUI}
        imc={imc}
        faixa={faixa}
        recomendacao={recomendacao}
        onVerPlano={() => setView("plano")}
        onTrocarObjetivo={trocarObjetivo}
        onReiniciar={refazer}
        onVoltar={() => setView("home")}
      />
    );
  } else {
    conteudo = (
      <Home
        user={user}
        token=""
        onVerCiclo={() => setView("ciclo")}
        onVerPerfil={() => setView("perfil")}
        onVerEvolucao={() => setView("evolucao")}
        onTreinoLivre={() => setView("treino-livre")}
      />
    );
  }

  return <Suspense fallback={<Carregando />}>{conteudo}</Suspense>;
}
