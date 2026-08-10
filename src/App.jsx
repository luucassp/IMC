import { useState, lazy, Suspense } from "react";

const Home = lazy(() => import("./components/Home.tsx"));
const Ciclo = lazy(() => import("./components/Ciclo.jsx"));
const Biblioteca = lazy(() => import("./components/Biblioteca.jsx"));
const Evolucao = lazy(() => import("./components/Evolucao.jsx"));

function Carregando() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#666", fontFamily: "monospace", fontSize: 14 }}>
      Carregando...
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");

  const user = { nome: "Atleta" };

  let conteudo;

  if (view === "ciclo") {
    conteudo = <Ciclo token="" onVoltar={() => setView("home")} />;
  } else if (view === "biblioteca") {
    conteudo = <Biblioteca token="" onVoltar={() => setView("home")} />;
  } else if (view === "evolucao") {
    conteudo = <Evolucao onVoltar={() => setView("home")} />;
  } else {
    conteudo = (
      <Home
        user={user}
        token=""
        onVerCiclo={() => setView("ciclo")}
        onVerBiblioteca={() => setView("biblioteca")}
        onVerEvolucao={() => setView("evolucao")}
      />
    );
  }

  return <Suspense fallback={<Carregando />}>{conteudo}</Suspense>;
}
