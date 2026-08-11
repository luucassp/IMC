import { describe, it, expect } from "vitest";
import { isoLocal, todosDias, diaPorData, semanaPorData, proximoDia, semanaDoCiclo, mesDoCiclo, mesesDisponiveis } from "../ciclo.js";

describe("isoLocal", () => {
  it("formata data como YYYY-MM-DD", () => {
    expect(isoLocal(new Date(2026, 6, 7))).toBe("2026-07-07");
  });

  it("preenche mês e dia com zero", () => {
    expect(isoLocal(new Date(2026, 7, 1))).toBe("2026-08-01");
  });
});

describe("todosDias", () => {
  it("ciclo tem 96 dias de treino (jul+ago+set+out, 16 semanas x 6 dias)", () => {
    expect(todosDias()).toHaveLength(96);
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

  it("a ponte entre agosto e setembro encadeia normalmente", () => {
    expect(proximoDia("2026-09-06")?.date).toBe("2026-09-08");
  });

  it("a ponte entre setembro e outubro encadeia normalmente", () => {
    expect(proximoDia("2026-10-04")?.date).toBe("2026-10-06");
  });

  it("após o último dia não há próximo", () => {
    expect(proximoDia("2026-11-01")).toBeNull();
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

describe("mesDoCiclo", () => {
  // Sábado 15/08/2026 como "hoje".
  const hoje = new Date(2026, 7, 15, 12, 0);

  it("grade de agosto tem semanas completas (SEG..DOM) cobrindo o mês", () => {
    const { semanas } = mesDoCiclo(2026, 7, [], hoje);
    for (const semana of semanas) expect(semana).toHaveLength(7);
    expect(semanas[0][0].date).toBe("2026-07-27"); // segunda antes do dia 1
    expect(semanas.at(-1).at(-1).date).toBe("2026-09-06"); // domingo depois do dia 31
  });

  it("marca dias fora do mês em foco", () => {
    const { semanas } = mesDoCiclo(2026, 7, [], hoje);
    expect(semanas[0][0].foraDoMes).toBe(true); // 27/07
    const dia11 = semanas.flat().find((c) => c.date === "2026-08-11");
    expect(dia11.foraDoMes).toBe(false);
  });

  it("aplica o mesmo vocabulário de status de semanaDoCiclo", () => {
    const { semanas } = mesDoCiclo(2026, 7, [], hoje);
    const porData = Object.fromEntries(semanas.flat().map((c) => [c.date, c]));
    expect(porData["2026-08-15"].status).toBe("hoje");
    expect(porData["2026-08-16"].status).toBe("proximo");
    expect(porData["2026-08-11"].status).toBe("perdido");
    expect(porData["2026-08-11"].dia?.title).toContain("Bar Muscle-Up");
    expect(porData["2026-08-03"].status).toBe("descanso"); // fora de qualquer ciclo
    expect(porData["2026-08-03"].dia).toBeNull();
  });

  it("histórico marca o dia como feito", () => {
    const { semanas } = mesDoCiclo(2026, 7, [{ diaId: "2026-08-11" }], hoje);
    const dia11 = semanas.flat().find((c) => c.date === "2026-08-11");
    expect(dia11.status).toBe("feito");
  });
});

describe("mesesDisponiveis", () => {
  it("lista julho a novembro de 2026 em ordem", () => {
    expect(mesesDisponiveis()).toEqual([
      { ano: 2026, mes: 6 },
      { ano: 2026, mes: 7 },
      { ano: 2026, mes: 8 },
      { ano: 2026, mes: 9 },
      { ano: 2026, mes: 10 },
    ]);
  });
});
