import { useEffect, useState, lazy, Suspense } from "react";

const Home = lazy(() => import("./components/Home.tsx"));
const Ciclo = lazy(() => import("./components/Ciclo.jsx"));
const Biblioteca = lazy(() => import("./components/Biblioteca.jsx"));
const Evolucao = lazy(() => import("./components/Evolucao.jsx"));
const DiaTreino = lazy(() => import("./components/DiaTreino.jsx"));
const PRs = lazy(() => import("./components/PRs.jsx"));

function Carregando() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#666", fontFamily: "monospace", fontSize: 14 }}>
      Carregando...
    </div>
  );
}

const VIEWS_SIMPLES = ["ciclo", "biblioteca", "evolucao", "prs"];

// Estado <-> URL, pra cada tela virar uma entrada de histórico de verdade —
// gesto de voltar do iOS e botão físico do Android passam a funcionar igual
// a qualquer outro app, em vez de só resetar pra Home.
function caminhoDe(view, diaIso) {
  if (view === "dia" && diaIso) return `/dia/${diaIso}`;
  if (VIEWS_SIMPLES.includes(view)) return `/${view}`;
  return "/";
}

function estadoDoCaminho(pathname) {
  const diaMatch = pathname.match(/^\/dia\/([\d-]+)\/?$/);
  if (diaMatch) return { view: "dia", diaIso: diaMatch[1] };
  const nome = pathname.replace(/^\/|\/$/g, "");
  if (VIEWS_SIMPLES.includes(nome)) return { view: nome, diaIso: null };
  return { view: "home", diaIso: null };
}

export default function App() {
  const [estado, setEstado] = useState(() => estadoDoCaminho(window.location.pathname));
  const { view, diaIso } = estado;

  useEffect(() => {
    const aoNavegarPeloHistorico = () => setEstado(estadoDoCaminho(window.location.pathname));
    window.addEventListener("popstate", aoNavegarPeloHistorico);
    return () => window.removeEventListener("popstate", aoNavegarPeloHistorico);
  }, []);

  const navegar = (novaView, novoIso = null) => {
    const caminho = caminhoDe(novaView, novoIso);
    if (window.location.pathname !== caminho) {
      window.history.pushState({ view: novaView, diaIso: novoIso }, "", caminho);
    }
    setEstado({ view: novaView, diaIso: novoIso });
  };

  // "Voltar" sempre desempilha o histórico de verdade (volta pra tela anterior
  // real, não sempre pra Home) — só cai pra Home se não houver pra onde voltar
  // (ex: abriu um link direto pra um dia específico).
  const voltar = () => {
    if (window.history.state) window.history.back();
    else navegar("home");
  };

  const user = { nome: "Sergio" };
  const abrirDia = (iso) => navegar("dia", iso);

  let conteudo;

  if (view === "ciclo") {
    conteudo = <Ciclo token="" onVoltar={voltar} onAbrirDia={abrirDia} />;
  } else if (view === "biblioteca") {
    conteudo = <Biblioteca token="" onVoltar={voltar} />;
  } else if (view === "evolucao") {
    conteudo = <Evolucao onVoltar={voltar} />;
  } else if (view === "prs") {
    conteudo = <PRs onVoltar={voltar} />;
  } else if (view === "dia") {
    conteudo = <DiaTreino iso={diaIso} token="" onVoltar={voltar} onVerCalendario={() => navegar("ciclo")} />;
  } else {
    conteudo = (
      <Home
        user={user}
        token=""
        onVerCiclo={() => navegar("ciclo")}
        onVerBiblioteca={() => navegar("biblioteca")}
        onVerEvolucao={() => navegar("evolucao")}
        onVerPRs={() => navegar("prs")}
        onAbrirDia={abrirDia}
      />
    );
  }

  return <Suspense fallback={<Carregando />}>{conteudo}</Suspense>;
}
