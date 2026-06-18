import { describe, it, expect } from "vitest";
import { parseDescanso, formatarTempo } from "../tempo.js";

describe("parseDescanso", () => {
  it("converte '90 s' para 90 segundos", () => {
    expect(parseDescanso("90 s")).toBe(90);
  });

  it("converte '60 s' para 60 segundos", () => {
    expect(parseDescanso("60 s")).toBe(60);
  });

  it("converte '3 min' para 180 segundos", () => {
    expect(parseDescanso("3 min")).toBe(180);
  });

  it("converte '5 min' para 300 segundos", () => {
    expect(parseDescanso("5 min")).toBe(300);
  });

  it("converte '3–4 min' usando o primeiro número (180)", () => {
    expect(parseDescanso("3–4 min")).toBe(180);
  });

  it("converte '30–60 s' usando o primeiro número (30)", () => {
    expect(parseDescanso("30–60 s")).toBe(30);
  });

  it("converte '45–60 s' usando o primeiro número (45)", () => {
    expect(parseDescanso("45–60 s")).toBe(45);
  });

  it("retorna 60 para null", () => {
    expect(parseDescanso(null)).toBe(60);
  });

  it("retorna 60 para undefined", () => {
    expect(parseDescanso(undefined)).toBe(60);
  });

  it("retorna 60 para string vazia", () => {
    expect(parseDescanso("")).toBe(60);
  });

  it("converte número puro como segundos", () => {
    expect(parseDescanso("120")).toBe(120);
  });

  it("case insensitive para MIN", () => {
    expect(parseDescanso("2 MIN")).toBe(120);
  });
});

describe("formatarTempo", () => {
  it("formata 0 segundos como 0:00", () => {
    expect(formatarTempo(0)).toBe("0:00");
  });

  it("formata 5 segundos como 0:05", () => {
    expect(formatarTempo(5)).toBe("0:05");
  });

  it("formata 60 segundos como 1:00", () => {
    expect(formatarTempo(60)).toBe("1:00");
  });

  it("formata 90 segundos como 1:30", () => {
    expect(formatarTempo(90)).toBe("1:30");
  });

  it("formata 180 segundos como 3:00", () => {
    expect(formatarTempo(180)).toBe("3:00");
  });

  it("formata 125 segundos como 2:05", () => {
    expect(formatarTempo(125)).toBe("2:05");
  });

  it("formata 599 segundos como 9:59", () => {
    expect(formatarTempo(599)).toBe("9:59");
  });

  it("trata negativo como 0:00", () => {
    expect(formatarTempo(-10)).toBe("0:00");
  });

  it("trunca decimais", () => {
    expect(formatarTempo(90.7)).toBe("1:30");
  });
});
