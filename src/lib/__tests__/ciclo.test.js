import { describe, it, expect } from "vitest";
import { isoLocal, todosDias, diaPorData, semanaPorData, proximoDia, semanaDoCiclo } from "../ciclo.js";

describe("isoLocal", () => {
  it("formata data como YYYY-MM-DD", () => {
    expect(isoLocal(new Date(2026, 6, 7))).toBe("2026-07-07");
  });

  it("preenche mês e dia com zero", () => {
    expect(isoLocal(new Date(2026, 7, 1))).toBe("2026-08-01");
  });
});

describe("todosDias", () => {
  it("ciclo tem 48 dias de treino (julho + agosto, 8 semanas x 6 dias)", () => {
    expect(todosDias()).toHaveLength(48);
  });

  it("datas em ordem crescente", () => {
    const datas = todosDias().map((d) => d.date);
    expect([...datas].sort()).toEqual(datas);
  });
});

describe("diaPorData", () => {
  it("encontra o primeiro dia do ciclo (07/07)", () => {
    const dia = diaPorData("2026-07-07");
    expect(dia?.title).toContain("Back Squat");
    expect(dia?.dow).toBe("TER");
  });

  it("segunda-feira é descanso (null)", () => {
    expect(diaPorData("2026-07-13")).toBeNull();
    expect(diaPorData("2026-07-20")).toBeNull();
    expect(diaPorData("2026-07-27")).toBeNull();
  });

  it("fora do ciclo é null", () => {
    expect(diaPorData("2026-08-03")).toBeNull();
    expect(diaPorData("2026-07-06")).toBeNull();
  });

  it("último dia de julho (02/08)", () => {
    expect(diaPorData("2026-08-02")?.dow).toBe("DOM");
  });

  it("último dia do ciclo de agosto (06/09)", () => {
    expect(diaPorData("2026-09-06")?.dow).toBe("DOM");
  });
});

describe("semanaPorData", () => {
  it("14/07 está na semana 2", () => {
    expect(semanaPorData("2026-07-14")?.titulo).toContain("Semana 2");
  });

  it("28/07 está na semana 4 (deload)", () => {
    expect(semanaPorData("2026-07-28")?.titulo).toContain("Deload");
  });
});

describe("proximoDia", () => {
  it("após segunda de descanso vem a terça", () => {
    expect(proximoDia("2026-07-13")?.date).toBe("2026-07-14");
  });

  it("a ponte entre julho e agosto encadeia normalmente", () => {
    expect(proximoDia("2026-08-02")?.date).toBe("2026-08-11");
  });

  it("após o último dia não há próximo", () => {
    expect(proximoDia("2026-09-06")).toBeNull();
  });
});

describe("semanaDoCiclo", () => {
  // Quarta 15/07/2026 — semana 2 do ciclo.
  const quarta = new Date(2026, 6, 15, 12, 0);

  it("retorna 7 slots SEG..DOM", () => {
    const semana = semanaDoCiclo([], quarta);
    expect(semana).toHaveLength(7);
    expect(semana[0].dow).toBe("SEG");
    expect(semana[6].dow).toBe("DOM");
  });

  it("segunda é descanso", () => {
    const semana = semanaDoCiclo([], quarta);
    expect(semana[0].status).toBe("descanso");
    expect(semana[0].dia).toBeNull();
  });

  it("hoje (quarta) tem status hoje", () => {
    const semana = semanaDoCiclo([], quarta);
    expect(semana[2].status).toBe("hoje");
    expect(semana[2].dia?.title).toContain("Snatch");
  });

  it("terça sem histórico fica perdido", () => {
    const semana = semanaDoCiclo([], quarta);
    expect(semana[1].status).toBe("perdido");
  });

  it("terça com histórico (diaId = data) fica feito", () => {
    const historico = [{ diaId: "2026-07-14" }];
    const semana = semanaDoCiclo(historico, quarta);
    expect(semana[1].status).toBe("feito");
  });

  it("dias futuros ficam proximo", () => {
    const semana = semanaDoCiclo([], quarta);
    expect(semana[3].status).toBe("proximo");
    expect(semana[6].status).toBe("proximo");
  });
});
