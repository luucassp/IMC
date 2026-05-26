import { useState } from "react";
import Onboarding from "./components/Onboarding.jsx";
import Resultado from "./components/Resultado.jsx";
import Plano from "./components/Plano.jsx";
import { calcularIMC, classificarIMC } from "./lib/imc.js";
import { recomendarTreino } from "./lib/recomendacao.js";
import { gerarPlano } from "./lib/plano.js";
import { carregarPerfil, salvarPerfil, limparPerfil } from "./lib/storage.js";

export default function App() {
  const [perfil, setPerfil] = useState(() => carregarPerfil());
  const [view, setView] = useState("resultado");

  const concluirOnboarding = (p) => {
    salvarPerfil(p);
    setPerfil(p);
    setView("resultado");
  };

  const reiniciar = () => {
    limparPerfil();
    setPerfil(null);
    setView("resultado");
  };

  const trocarObjetivo = (objetivo) => {
    const atualizado = { ...perfil, objetivo };
    salvarPerfil(atualizado);
    setPerfil(atualizado);
  };

  // Onboarding ainda não concluído.
  if (!perfil) return <Onboarding onConcluir={concluirOnboarding} />;

  const imc = calcularIMC(perfil.peso, perfil.altura);
  const faixa = classificarIMC(imc);
  const recomendacao = recomendarTreino(perfil, imc, faixa);
  const plano = gerarPlano(perfil, recomendacao);

  if (view === "plano") {
    return <Plano plano={plano} perfil={perfil} recomendacao={recomendacao} onVoltar={() => setView("resultado")} />;
  }

  return (
    <Resultado
      perfil={perfil}
      imc={imc}
      faixa={faixa}
      recomendacao={recomendacao}
      onVerPlano={() => setView("plano")}
      onTrocarObjetivo={trocarObjetivo}
      onReiniciar={reiniciar}
    />
  );
}
