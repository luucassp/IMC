import { describe, it, expect } from "vitest";
import { gerarPlano } from "../plano.js";

describe("gerarPlano", () => {
  const basePerfil = { equipamentos: ["academia", "halteres"] };

  it("gera Full Body com 3 dias de treino", () => {
    const rec = { divisao: "Full Body", dias: 3 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.divisao).toBe("Full Body");
    expect(plano.days).toHaveLength(3);
    expect(plano.days.map((d) => d.id)).toEqual(["FB1", "FB2", "FB3"]);
    expect(plano.semAcademia).toBe(false);
  });

  it("Full Body com 1 dia usa apenas 1 sessão distinta", () => {
    const rec = { divisao: "Full Body", dias: 1 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.days).toHaveLength(1);
    expect(plano.days[0].id).toBe("FB1");
  });

  it("Full Body com 2 dias usa 2 sessões distintas", () => {
    const rec = { divisao: "Full Body", dias: 2 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.days).toHaveLength(2);
    expect(plano.days.map((d) => d.id)).toEqual(["FB1", "FB2"]);
  });

  it("Upper / Lower com 4 dias gera 2 sessões distintas", () => {
    const rec = { divisao: "Upper / Lower", dias: 4 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.divisao).toBe("Upper / Lower");
    expect(plano.days).toHaveLength(2);
    expect(plano.days.map((d) => d.id)).toEqual(["U", "L"]);
  });

  it("Push / Pull / Legs (2x) com 6 dias gera 3 sessões ciclando", () => {
    const rec = { divisao: "Push / Pull / Legs (2x)", dias: 6 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.days).toHaveLength(3);
    expect(plano.days.map((d) => d.id)).toEqual(["A", "B", "C"]);
  });

  it("Push / Pull / Legs + Upper com 5 dias gera 5 sessões", () => {
    const rec = { divisao: "Push / Pull / Legs + Upper", dias: 5 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.days).toHaveLength(5);
    expect(plano.days.map((d) => d.id)).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("schedule tem 7 dias (SEG..DOM)", () => {
    const rec = { divisao: "Full Body", dias: 3 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.schedule).toHaveLength(7);
    expect(plano.schedule[0].day).toBe("SEG");
    expect(plano.schedule[6].day).toBe("DOM");
  });

  it("schedule marca dias de descanso corretamente para 3 dias", () => {
    const rec = { divisao: "Full Body", dias: 3 };
    const plano = gerarPlano(basePerfil, rec);

    const treinos = plano.schedule.filter((s) => !s.rest);
    const descansos = plano.schedule.filter((s) => s.rest);
    expect(treinos).toHaveLength(3);
    expect(descansos).toHaveLength(4);
  });

  it("detecta semAcademia quando só tem peso_corporal", () => {
    const perfil = { equipamentos: ["peso_corporal"] };
    const rec = { divisao: "Full Body", dias: 3 };
    const plano = gerarPlano(perfil, rec);

    expect(plano.semAcademia).toBe(true);
  });

  it("semAcademia é false com halteres mesmo sem academia", () => {
    const perfil = { equipamentos: ["halteres"] };
    const rec = { divisao: "Full Body", dias: 3 };
    const plano = gerarPlano(perfil, rec);

    expect(plano.semAcademia).toBe(false);
  });

  it("equipamentos undefined não quebra", () => {
    const perfil = {};
    const rec = { divisao: "Full Body", dias: 3 };
    const plano = gerarPlano(perfil, rec);

    expect(plano.semAcademia).toBe(true);
  });

  it("divisao desconhecida cai em Full Body", () => {
    const rec = { divisao: "Inexistente", dias: 3 };
    const plano = gerarPlano(basePerfil, rec);

    expect(plano.days.length).toBeGreaterThan(0);
  });

  it("schedule cicla sessões quando dias > splits disponíveis", () => {
    const rec = { divisao: "Upper / Lower", dias: 4 };
    const plano = gerarPlano(basePerfil, rec);

    const sessions = plano.schedule.filter((s) => !s.rest).map((s) => s.session);
    expect(sessions).toEqual(["U", "L", "U", "L"]);
  });
});
