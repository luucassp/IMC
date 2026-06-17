import { describe, it, expect } from "vitest";
import { ajustarExercicios } from "./fadiga.js";

const exs = [
  { category: "PRINCIPAL", name: "Supino", sets: "4" },
  { category: "ACESSÓRIO", name: "Crossover", sets: "3" },
  { category: "ACESSÓRIO", name: "Elevação", sets: "2" },
];

describe("ajustarExercicios", () => {
  it("normal não altera nada", () => {
    expect(ajustarExercicios(exs, "normal")).toEqual(exs);
  });

  it("exausto reduz 1 série de todos, com piso de 2", () => {
    const out = ajustarExercicios(exs, "exausto");
    expect(out[0].sets).toBe("3"); // 4 → 3
    expect(out[1].sets).toBe("2"); // 3 → 2
    expect(out[2].sets).toBe("2"); // 2 → 2 (piso)
    expect(out[2].ajusteSets).toBe(0);
  });

  it("pronto adiciona 1 série só nos compostos (PRINCIPAL)", () => {
    const out = ajustarExercicios(exs, "pronto");
    expect(out[0].sets).toBe("5"); // PRINCIPAL +1
    expect(out[1].sets).toBe("3"); // ACESSÓRIO inalterado
  });

  it("ignora exercícios sem sets numérico", () => {
    const out = ajustarExercicios([{ category: "PRINCIPAL", sets: "AMRAP" }], "exausto");
    expect(out[0].sets).toBe("AMRAP");
  });
});
