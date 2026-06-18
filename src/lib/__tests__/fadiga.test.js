import { describe, it, expect } from "vitest";
import { ajustarExercicios } from "../fadiga.js";

describe("ajustarExercicios", () => {
  const exercicios = [
    { name: "Supino", sets: "4", category: "PRINCIPAL" },
    { name: "Rosca", sets: "3", category: "ACESSÓRIO" },
    { name: "Agachamento", sets: "4", category: "PRINCIPAL" },
  ];

  it("normal não altera nada", () => {
    const resultado = ajustarExercicios(exercicios, "normal");
    expect(resultado).toEqual(exercicios);
  });

  it("null/undefined não altera nada", () => {
    expect(ajustarExercicios(exercicios, null)).toEqual(exercicios);
    expect(ajustarExercicios(exercicios, undefined)).toEqual(exercicios);
  });

  it("exausto reduz 1 série de todos", () => {
    const resultado = ajustarExercicios(exercicios, "exausto");
    expect(resultado[0].sets).toBe("3");
    expect(resultado[1].sets).toBe("2");
    expect(resultado[2].sets).toBe("3");
  });

  it("exausto não desce abaixo de 2 séries", () => {
    const exs = [{ name: "X", sets: "2", category: "ACESSÓRIO" }];
    const resultado = ajustarExercicios(exs, "exausto");
    expect(resultado[0].sets).toBe("2");
  });

  it("exausto adiciona ajusteSets negativo", () => {
    const resultado = ajustarExercicios(exercicios, "exausto");
    expect(resultado[0].ajusteSets).toBe(-1);
  });

  it("pronto adiciona +1 série nos PRINCIPAL apenas", () => {
    const resultado = ajustarExercicios(exercicios, "pronto");
    expect(resultado[0].sets).toBe("5");
    expect(resultado[0].ajusteSets).toBe(1);
    expect(resultado[1].sets).toBe("3");
    expect(resultado[1].ajusteSets).toBeUndefined();
  });

  it("pronto não altera ACESSÓRIO", () => {
    const resultado = ajustarExercicios(exercicios, "pronto");
    expect(resultado[1]).toEqual(exercicios[1]);
  });

  it("sets não-numérico (ex: AMRAP) permanece inalterado", () => {
    const exs = [{ name: "WOD", sets: "AMRAP", category: "PRINCIPAL" }];
    const resultado = ajustarExercicios(exs, "exausto");
    expect(resultado[0].sets).toBe("AMRAP");
  });
});
