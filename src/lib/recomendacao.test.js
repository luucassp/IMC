import { describe, it, expect } from "vitest";
import { recomendarTreino, ajustarPorObjetivo } from "./recomendacao.js";
import { calcularIMC, classificarIMC } from "./imc.js";

function rec(perfil) {
  const imc = calcularIMC(perfil.peso, perfil.altura);
  return recomendarTreino(perfil, imc, classificarIMC(imc));
}

const base = {
  peso: 80, altura: 180, objetivo: "hipertrofia", objetivosExtras: [],
  nivel: "intermediario", diasPorSemana: 5, tempoPorTreino: 60,
  equipamentos: ["academia"], restricoes: [],
};

describe("recomendarTreino — divisão por dias", () => {
  it("3 dias → Full Body", () => {
    expect(rec({ ...base, diasPorSemana: 3 }).divisao).toBe("Full Body");
  });
  it("4 dias → Upper / Lower", () => {
    expect(rec({ ...base, diasPorSemana: 4 }).divisao).toBe("Upper / Lower");
  });
  it("5 dias → Push / Pull / Legs + Upper", () => {
    expect(rec({ ...base, diasPorSemana: 5 }).divisao).toBe("Push / Pull / Legs + Upper");
  });
});

describe("recomendarTreino — alertas de segurança", () => {
  it("IMC >= 30 sem objetivo emagrecimento gera alerta", () => {
    const r = rec({ ...base, peso: 110, altura: 170 }); // IMC ~38
    expect(r.alertas.some((a) => /obesidade/i.test(a))).toBe(true);
  });

  it("restrições geram alerta", () => {
    const r = rec({ ...base, restricoes: ["joelho"] });
    expect(r.alertas.some((a) => /joelho/i.test(a))).toBe(true);
  });
});

describe("recomendarTreino — múltiplos objetivos", () => {
  it("mescla ênfase dos objetivos secundários", () => {
    const r = rec({ ...base, objetivosExtras: ["forca", "mobilidade"] });
    expect(r.objetivos).toEqual(["hipertrofia", "forca", "mobilidade"]);
    expect(r.enfase).toMatch(/também:/);
  });
});

describe("ajustarPorObjetivo", () => {
  const exs = [
    { category: "PRINCIPAL", name: "Supino", sets: "4", reps: "5-6", rest: "180 s" },
    { category: "ACESSÓRIO", name: "Elevação", sets: "3", reps: "12-15", rest: "60 s" },
  ];

  it("hipertrofia não altera (objetivo neutro)", () => {
    const out = ajustarPorObjetivo(exs, "hipertrofia");
    expect(out[1].reps).toBe("12-15");
  });

  it("força sobrescreve reps/descanso dos acessórios", () => {
    const out = ajustarPorObjetivo(exs, "forca");
    expect(out[1].reps).toBe("3–6");
    expect(out[1].rest).toBe("3–5 min");
  });

  it("nos compostos preserva reps autorais mas alinha descanso", () => {
    const out = ajustarPorObjetivo(exs, "forca");
    expect(out[0].reps).toBe("5-6"); // preservado
    expect(out[0].rest).toBe("3–5 min"); // alinhado
  });
});
