// Barra "Voltar" fixa no topo — fica visível mesmo rolando a página inteira.
// Compartilhada entre Ciclo, DiaTreino, Biblioteca e Evolução.

export default function TopoVoltar({ onVoltar, titulo, texto = "← Voltar" }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#0a0a0a",
        borderBottom: "1px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
      }}
    >
      <button
        type="button"
        onClick={onVoltar}
        style={{ background: "none", border: "none", color: "#9a9da8", cursor: "pointer", fontSize: 13, padding: "6px 0", flexShrink: 0 }}
      >
        {texto}
      </button>
      {titulo && (
        <span style={{ fontSize: 12, color: "#666", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {titulo}
        </span>
      )}
    </div>
  );
}
