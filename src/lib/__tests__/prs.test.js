import { describe, it, expect } from "vitest";
import { calcularCargaTexto, prsAtuais } from "../prs.js";

const PRS = {
  "Back Squat": 145,
  "Front Squat": 120,
  Deadlift: 180,
  "Clean & Jerk": 100,
  "Power Clean": 90,
  "Squat Snatch": 75,
  "Power Snatch": 65,
};

describe("calcularCargaTexto", () => {
  it("calcula faixa de carga pra sets x reps @ range%", () => {
    expect(calcularCargaTexto("Back Squat 5x5 @ 75–78% · descanso 2min", PRS)).toBe("≈ 110–112.5kg (PR: 145kg)");
  });

  it("calcula carga única quando é uma porcentagem só, arredondada pro múltiplo de 2,5kg mais próximo", () => {
    expect(calcularCargaTexto("Back Squat 3x5 @ 60% — velocidade máxima na subida", PRS)).toBe("≈ 87.5kg (PR: 145kg)");
  });

  it("entende o formato 'construir até ... (~X%)'", () => {
    expect(calcularCargaTexto("Squat Snatch — construir até single pesado do dia (~90%)", PRS)).toBe("≈ 67.5kg (PR: 75kg)");
  });

  it("entende o formato 'N séries subindo até X–Y%'", () => {
    expect(calcularCargaTexto("Power Snatch — 6 séries subindo até 70–75%", PRS)).toBe("≈ 45–50kg (PR: 65kg)");
  });

  it("diferencia Clean & Jerk de Power Clean", () => {
    expect(calcularCargaTexto("Clean & Jerk — 5x2 @ 75% · descanso 90s–2min", PRS)).toBe("≈ 75kg (PR: 100kg)");
    expect(calcularCargaTexto("Power Clean 3-3-2-2-1-1-1-1 — subir gradual até um single pesado do dia (~85–90%)", PRS)).toBe("≈ 77.5–80kg (PR: 90kg)");
  });

  it("aproxima 'Clean (qualquer variação)' pelo PR de Clean & Jerk", () => {
    expect(calcularCargaTexto("Clean (qualquer variação) — construir até 1RM do dia (~90%+)", PRS)).toBe("≈ 90kg (PR: 100kg)");
  });

  it("retorna null sem porcentagem no texto", () => {
    expect(calcularCargaTexto("Deadlift 3x5 — velocidade e postura", PRS)).toBeNull();
  });

  it("retorna null pra texto de complexo sem movimento único no início", () => {
    expect(calcularCargaTexto("Complexo: 1 Clean + 1 Front Squat + 1 Jerk — 6 séries até 80%", PRS)).toBeNull();
  });

  it("retorna null quando o movimento não tem PR cadastrado", () => {
    expect(calcularCargaTexto("Front Squat 5x5 @ 70–75% (do rack) · descanso 2min", {})).toBeNull();
  });

  it("retorna null pra texto vazio/ausente", () => {
    expect(calcularCargaTexto("", PRS)).toBeNull();
    expect(calcularCargaTexto(undefined, PRS)).toBeNull();
  });
});

describe("prsAtuais", () => {
  it("pega o valor mais recente de cada movimento (histórico mais novo primeiro)", () => {
    const historico = [
      { movimento: "Back Squat", valor: 150, data: "2026-08-10" },
      { movimento: "Deadlift", valor: 180, data: "2026-08-05" },
      { movimento: "Back Squat", valor: 145, data: "2026-07-01" },
    ];
    expect(prsAtuais(historico)).toEqual({ "Back Squat": 150, Deadlift: 180 });
  });

  it("lida com histórico vazio ou ausente", () => {
    expect(prsAtuais([])).toEqual({});
    expect(prsAtuais(undefined)).toEqual({});
  });
});
