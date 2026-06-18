import { describe, it, expect } from "vitest";
import { recomendarTreino, ajustarPorObjetivo } from "../recomendacao.js";

describe("recomendarTreino", () => {
  it("3 dias → Full Body", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "hipertrofia", nivel: "iniciante" }, 22, null);
    expect(rec.divisao).toBe("Full Body");
    expect(rec.dias).toBe(3);
  });

  it("4 dias → Upper / Lower", () => {
    const rec = recomendarTreino({ diasPorSemana: 4, objetivo: "hipertrofia", nivel: "intermediario" }, 22, null);
    expect(rec.divisao).toBe("Upper / Lower");
  });

  it("5 dias → Push / Pull / Legs + Upper", () => {
    const rec = recomendarTreino({ diasPorSemana: 5, objetivo: "forca", nivel: "avancado" }, 22, null);
    expect(rec.divisao).toBe("Push / Pull / Legs + Upper");
  });

  it("6 dias → Push / Pull / Legs (2x)", () => {
    const rec = recomendarTreino({ diasPorSemana: 6, objetivo: "hipertrofia", nivel: "avancado" }, 22, null);
    expect(rec.divisao).toBe("Push / Pull / Legs (2x)");
  });

  it("sem diasPorSemana → default 3 → Full Body", () => {
    const rec = recomendarTreino({ objetivo: "hipertrofia", nivel: "iniciante" }, 22, null);
    expect(rec.dias).toBe(3);
    expect(rec.divisao).toBe("Full Body");
  });

  it("aplica reps e descanso do objetivo", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "forca", nivel: "avancado" }, 22, null);
    expect(rec.reps).toBe("3–6");
    expect(rec.descanso).toBe("3–5 min");
  });

  it("alerta obesidade + objetivo não-emagrecimento", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "hipertrofia", nivel: "iniciante" }, 32, null);
    expect(rec.alertas.length).toBeGreaterThan(0);
    expect(rec.alertas[0]).toMatch(/obesidade/i);
  });

  it("alerta abaixo do peso + emagrecimento", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "emagrecimento", nivel: "iniciante" }, 17, null);
    expect(rec.alertas.some((a) => /abaixo do peso/i.test(a))).toBe(true);
  });

  it("alerta para sessão curta (≤30min) com poucos dias", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "hipertrofia", nivel: "iniciante", tempoPorTreino: 30 }, 22, null);
    expect(rec.alertas.some((a) => /sessões curtas/i.test(a))).toBe(true);
  });

  it("alerta para restrições físicas", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "hipertrofia", nivel: "iniciante", restricoes: ["joelho"] }, 22, null);
    expect(rec.alertas.some((a) => /joelho/i.test(a))).toBe(true);
  });

  it("alerta para peso corporal sem academia", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "hipertrofia", nivel: "iniciante", equipamentos: ["peso_corporal"] }, 22, null);
    expect(rec.alertas.some((a) => /cargas externas/i.test(a))).toBe(true);
  });

  it("volume por nível iniciante", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "hipertrofia", nivel: "iniciante" }, 22, null);
    expect(rec.volume).toMatch(/10–12/);
  });

  it("volume por nível avancado", () => {
    const rec = recomendarTreino({ diasPorSemana: 3, objetivo: "hipertrofia", nivel: "avancado" }, 22, null);
    expect(rec.volume).toMatch(/16–20/);
  });
});

describe("ajustarPorObjetivo", () => {
  const exercicios = [
    { name: "Supino", sets: "4", reps: "8–12", rest: "90 s" },
    { name: "Rosca", sets: "3", reps: "10–12", rest: "60 s" },
  ];

  it("aplica reps e descanso do objetivo primário", () => {
    const resultado = ajustarPorObjetivo(exercicios, { objetivo: "forca" });
    expect(resultado[0].reps).toBe("3–6");
    expect(resultado[0].rest).toBe("3–5 min");
  });

  it("com objetivos extras, adiciona enfaseMista", () => {
    const resultado = ajustarPorObjetivo(exercicios, {
      objetivo: "hipertrofia",
      objetivosExtras: ["forca"],
    });
    expect(resultado[0].enfaseMista).toContain("Volume progressivo");
    expect(resultado[0].enfaseMista).toContain("Cargas altas");
  });

  it("sem objetivo válido retorna exercícios inalterados", () => {
    const resultado = ajustarPorObjetivo(exercicios, { objetivo: "invalido" });
    expect(resultado).toEqual(exercicios);
  });

  it("sem objetivos extras não adiciona enfaseMista", () => {
    const resultado = ajustarPorObjetivo(exercicios, { objetivo: "hipertrofia" });
    expect(resultado[0].enfaseMista).toBeUndefined();
  });
});
