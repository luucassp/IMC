import { useState, lazy, Suspense } from "react";

const Home = lazy(() => import("./components/Home.tsx"));
const Ciclo = lazy(() => import("./components/Ciclo.jsx"));
const Biblioteca = lazy(() => import("./components/Biblioteca.jsx"));
const Evolucao = lazy(() => import("./components/Evolucao.jsx"));
const DiaTreino = lazy(() => import("./components/DiaTreino.jsx"));

function Carregando() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#666", fontFamily: "monospace", fontSize: 14 }}>
      Carregando...
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [diaIso, setDiaIso] = useState(null);

  const user = { nome: "Sergio" };

  const abrirDia = (iso) => {
    setDiaIso(iso);
    setView("dia");
  };

  let conteudo;

  if (view === "ciclo") {
    conteudo = <Ciclo token="" onVoltar={() => setView("home")} onAbrirDia={abrirDia} />;
  } else if (view === "biblioteca") {
    conteudo = <Biblioteca token="" onVoltar={() => setView("home")} />;
  } else if (view === "evolucao") {
    conteudo = <Evolucao onVoltar={() => setView("home")} />;
  } else if (view === "dia") {
    conteudo = <DiaTreino iso={diaIso} token="" onVoltar={() => setView("home")} onVerCalendario={() => setView("ciclo")} />;
  } else {
    conteudo = (
      <Home
        user={user}
        token=""
        onVerCiclo={() => setView("ciclo")}
        onVerBiblioteca={() => setView("biblioteca")}
        onVerEvolucao={() => setView("evolucao")}
        onAbrirDia={abrirDia}
      />
    );
  }

  return <Suspense fallback={<Carregando />}>{conteudo}</Suspense>;
}
