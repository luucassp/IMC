import { useState } from "react";
import Onboarding from "./components/Onboarding.jsx";
import Resultado from "./components/Resultado.jsx";

export default function App() {
  const [perfil, setPerfil] = useState(null);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Topo */}
      <header style={{ borderBottom: "1px solid #1a1a1a", padding: "20px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#c8ff00",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            IMC + Treino
          </span>
          <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0", fontFamily: "monospace" }}>
            Seu personal inteligente no bolso
          </p>
        </div>
      </header>

      {perfil ? (
        <Resultado perfil={perfil} onReiniciar={() => setPerfil(null)} />
      ) : (
        <Onboarding onConcluir={setPerfil} />
      )}
    </div>
  );
}
