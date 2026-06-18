import { describe, it, expect } from "vitest";
import { calcularIMC, classificarIMC } from "../imc.js";

describe("calcularIMC", () => {
  it("calcula IMC corretamente (70kg, 175cm → 22.9)", () => {
    expect(calcularIMC(70, 175)).toBe(22.9);
  });

  it("calcula IMC para peso alto (120kg, 170cm → 41.5)", () => {
    expect(calcularIMC(120, 170)).toBe(41.5);
  });

  it("calcula IMC para peso baixo (45kg, 165cm → 16.5)", () => {
    expect(calcularIMC(45, 165)).toBe(16.5);
  });

  it("retorna null para peso zero", () => {
    expect(calcularIMC(0, 175)).toBeNull();
  });

  it("retorna null para altura zero", () => {
    expect(calcularIMC(70, 0)).toBeNull();
  });

  it("retorna null para valores inválidos", () => {
    expect(calcularIMC("abc", 175)).toBeNull();
  });

  it("aceita strings numéricas", () => {
    expect(calcularIMC("70", "175")).toBe(22.9);
  });
});

describe("classificarIMC", () => {
  it("classifica abaixo do peso (< 18.5)", () => {
    expect(classificarIMC(16.5).classe).toBe("Abaixo do peso");
  });

  it("classifica peso normal (18.5–24.9)", () => {
    expect(classificarIMC(22.9).classe).toBe("Peso normal");
  });

  it("classifica sobrepeso (25–29.9)", () => {
    expect(classificarIMC(27).classe).toBe("Sobrepeso");
  });

  it("classifica obesidade grau 1 (30–34.9)", () => {
    expect(classificarIMC(32).classe).toBe("Obesidade grau 1");
  });

  it("classifica obesidade grau 2 (35–39.9)", () => {
    expect(classificarIMC(37).classe).toBe("Obesidade grau 2");
  });

  it("classifica obesidade grau 3 (≥ 40)", () => {
    expect(classificarIMC(42).classe).toBe("Obesidade grau 3");
  });

  it("retorna null para imc null", () => {
    expect(classificarIMC(null)).toBeNull();
  });

  it("cada faixa tem uma cor definida", () => {
    const result = classificarIMC(22);
    expect(result.cor).toBeTruthy();
  });
});
