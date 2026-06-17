import { describe, it, expect } from "vitest";
import { calcularIMC, classificarIMC } from "./imc.js";

describe("calcularIMC", () => {
  it("calcula IMC a partir de peso (kg) e altura (cm)", () => {
    // 80 / 1.80^2 = 24.69 → 24.7
    expect(calcularIMC(80, 180)).toBe(24.7);
  });

  it("retorna null para entradas inválidas", () => {
    expect(calcularIMC(0, 180)).toBeNull();
    expect(calcularIMC(80, 0)).toBeNull();
    expect(calcularIMC("", "")).toBeNull();
  });

  it("aceita strings numéricas", () => {
    expect(calcularIMC("113", "194")).toBe(30);
  });
});

describe("classificarIMC", () => {
  it("classifica nas faixas da OMS", () => {
    expect(classificarIMC(17).classe).toBe("Abaixo do peso");
    expect(classificarIMC(22).classe).toBe("Peso normal");
    expect(classificarIMC(27).classe).toBe("Sobrepeso");
    expect(classificarIMC(32).classe).toBe("Obesidade grau 1");
    expect(classificarIMC(37).classe).toBe("Obesidade grau 2");
    expect(classificarIMC(45).classe).toBe("Obesidade grau 3");
  });

  it("usa limite inferior exclusivo (25 não é mais 'peso normal')", () => {
    expect(classificarIMC(24.9).classe).toBe("Peso normal");
    expect(classificarIMC(25).classe).toBe("Sobrepeso");
  });

  it("retorna null quando imc é null", () => {
    expect(classificarIMC(null)).toBeNull();
  });
});
