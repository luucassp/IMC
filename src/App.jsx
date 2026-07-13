import { useState, useEffect, lazy, Suspense } from "react";
import Auth from "./components/Auth.jsx";
import { calcularIMC, classificarIMC } from "./lib/imc.js";
import { recomendarTreino } from "./lib/recomendacao.js";
import { gerarPlano } from "./lib/plano.js";
import { api } from "./lib/api.js";
import { carregarToken, salvarToken, limparToken } from "./lib/storage.js";

const Home = lazy(() => import("./components/Home.tsx"));
const Onboarding = lazy(() => import("./components/Onboarding.jsx"));
const Resultado = lazy(() => import("./components/Resultado.jsx"));
const Plano = lazy(() => import("./components/Plano.jsx"));
const TreinoLivre = lazy(() => import("./components/TreinoLivre.jsx"));
const Ciclo = lazy(() => import("./components/Ciclo.jsx"));

// Normaliza os campos do onboarding para os tipos esperados pela API.
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
  const [token, setToken] = useState(() => carregarToken());
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(token));
  const [view, setView] = useState("home");
  const [erro, setErro] = useState("");

  // Ao ter token (login ou restaurado), valida e busca o perfil.
  useEffect(() => {
    if (!token) {
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    (async () => {
      try {
        const [u, p] = await Promise.all([api.me(token), api.getPerfil(token)]);
        if (!ativo) return;
        setUser(u);
        setPerfil(p);
      } catch {
        if (!ativo) return;
        limparToken();
        setToken(null);
        setUser(null);
        setPerfil(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [token]);

  const aoAutenticar = ({ token: t, user: u }) => {
    salvarToken(t);
    setUser(u);
    setToken(t);
  };

  const sair = () => {
    limparToken();
    setToken(null);
    setUser(null);
    setPerfil(null);
    setView("home");
  };

  const concluirOnboarding = async (p) => {
    setErro("");
    try {
      const salvo = await api.putPerfil(token, perfilParaApi(p));
      setPerfil(salvo);
      setView("home");
    } catch (e) {
      setErro(e.message || "Não foi possível salvar seu perfil.");
    }
  };

  const trocarObjetivo = async (objetivo) => {
    const anterior = perfil;
    setPerfil({ ...perfil, objetivo }); // atualização otimista
    try {
      const salvo = await api.putPerfil(token, { objetivo });
      setPerfil(salvo);
    } catch {
      setPerfil(anterior); // reverte em caso de erro
    }
  };

  const refazer = () => {
    setPerfil(null);
    setView("home");
  };

  if (!token) return <Auth onAutenticado={aoAutenticar} />;
  if (carregando) return <Carregando />;

  if (!perfil) {
    return (
      <Suspense fallback={<Carregando />}>
        <Onboarding onConcluir={concluirOnboarding} erro={erro} />
      </Suspense>
    );
  }

  const perfilUI = { ...perfil, nome: user?.nome ?? "" };
  const imc = calcularIMC(perfil.peso, perfil.altura);
  const faixa = classificarIMC(imc);
  const recomendacao = recomendarTreino(perfil, imc, faixa);
  const plano = gerarPlano(perfil, recomendacao);

  let conteudo;

  if (view === "ciclo") {
    conteudo = <Ciclo token={token} onVoltar={() => setView("home")} />;
  } else if (view === "plano") {
    conteudo = <Plano plano={plano} perfil={perfilUI} recomendacao={recomendacao} token={token} onVoltar={() => setView("home")} />;
  } else if (view === "evolucao") {
    conteudo = <Plano plano={plano} perfil={perfilUI} recomendacao={recomendacao} token={token} onVoltar={() => setView("home")} tabInicial="historico" />;
  } else if (view === "treino-livre") {
    conteudo = <TreinoLivre perfil={perfilUI} token={token} onVoltar={() => setView("home")} />;
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
        onSair={sair}
      />
    );
  } else {
    conteudo = (
      <Home
        user={user}
        token={token}
        onVerCiclo={() => setView("ciclo")}
        onVerPerfil={() => setView("perfil")}
        onVerEvolucao={() => setView("evolucao")}
        onTreinoLivre={() => setView("treino-livre")}
        onSair={sair}
      />
    );
  }

  return <Suspense fallback={<Carregando />}>{conteudo}</Suspense>;
}
