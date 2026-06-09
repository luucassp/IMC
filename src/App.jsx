import { useState, useEffect } from "react";
import Auth from "./components/Auth.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Home from "./components/Home.tsx";
import Resultado from "./components/Resultado.jsx";
import Plano from "./components/Plano.jsx";
import { calcularIMC, classificarIMC } from "./lib/imc.js";
import { recomendarTreino } from "./lib/recomendacao.js";
import { gerarPlano } from "./lib/plano.js";
import { api } from "./lib/api.js";
import { carregarToken, salvarToken, limparToken } from "./lib/storage.js";

// Normaliza os campos do onboarding para os tipos esperados pela API.
function perfilParaApi(p) {
  const objetivos = p.objetivos ?? (p.objetivo ? [p.objetivo] : []);
  return {
    idade: Number(p.idade),
    sexo: p.sexo,
    altura: Number(p.altura),
    peso: Number(p.peso),
    objetivo: objetivos[0],
    objetivosExtras: objetivos.slice(1),
    enfaseCorporal: p.enfaseCorporal,
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
  if (!perfil) return <Onboarding onConcluir={concluirOnboarding} erro={erro} />;

  const perfilUI = { ...perfil, nome: user?.nome ?? "" };
  const imc = calcularIMC(perfil.peso, perfil.altura);
  const faixa = classificarIMC(imc);
  const recomendacao = recomendarTreino(perfil, imc, faixa);
  const plano = gerarPlano(perfil, recomendacao);

  if (view === "plano") {
    return <Plano plano={plano} perfil={perfilUI} recomendacao={recomendacao} token={token} onVoltar={() => setView("home")} />;
  }

  if (view === "perfil") {
    return (
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
  }

  return (
    <Home
      user={user}
      perfil={perfilUI}
      imc={imc}
      faixa={faixa}
      recomendacao={recomendacao}
      plano={plano}
      token={token}
      onVerPlano={() => setView("plano")}
      onVerPerfil={() => setView("perfil")}
      onSair={sair}
    />
  );
}
