import { describe, it, expect } from "vitest";
import { planejarSemana } from "../semana.js";

describe("planejarSemana", () => {
  const schedule = [
    { day: "SEG", session: "A", rest: false },
    { day: "TER", session: null, rest: true },
    { day: "QUA", session: "B", rest: false },
    { day: "QUI", session: null, rest: true },
    { day: "SEX", session: "C", rest: false },
    { day: "SÁB", session: null, rest: true },
    { day: "DOM", session: null, rest: true },
  ];

  function wednesday() {
    const d = new Date(2025, 0, 8, 12, 0); // Wed Jan 8, 2025
    return d;
  }

  function monday() {
    const d = new Date(2025, 0, 6, 12, 0); // Mon Jan 6, 2025
    return d;
  }

  it("retorna 7 dias", () => {
    const { dias } = planejarSemana(schedule, [], monday());
    expect(dias).toHaveLength(7);
  });

  it("marca dia de descanso corretamente", () => {
    const { dias } = planejarSemana(schedule, [], monday());
    expect(dias[1].status).toBe("descanso");
    expect(dias[3].status).toBe("descanso");
  });

  it("marca hoje corretamente (segunda-feira)", () => {
    const { dias } = planejarSemana(schedule, [], monday());
    expect(dias[0].status).toBe("hoje");
  });

  it("marca próximos dias corretamente", () => {
    const { dias } = planejarSemana(schedule, [], monday());
    expect(dias[2].status).toBe("proximo");
    expect(dias[4].status).toBe("proximo");
  });

  it("marca treino feito quando no histórico da semana", () => {
    const historico = [{ diaId: "A", data: monday().toISOString() }];
    const agora = wednesday();
    const { dias } = planejarSemana(schedule, historico, agora);
    expect(dias[0].status).toBe("feito");
  });

  it("marca treino perdido quando passado sem histórico", () => {
    const agora = wednesday();
    const { dias } = planejarSemana(schedule, [], agora);
    expect(dias[0].status).toBe("perdido");
  });

  it("sugere reposição de treinos perdidos em dias de descanso futuros", () => {
    const agora = wednesday();
    const { sugestoes } = planejarSemana(schedule, [], agora);
    expect(sugestoes.length).toBeGreaterThan(0);
    expect(sugestoes[0].session).toBe("A");
    expect(sugestoes[0].para).toBeTruthy();
  });

  it("sem histórico de outra semana não conta como feito", () => {
    const historico = [{ diaId: "A", data: "2024-12-01T12:00:00.000Z" }];
    const agora = monday();
    const { dias } = planejarSemana(schedule, historico, agora);
    expect(dias[0].status).toBe("hoje");
  });

  it("histórico vazio: sem perdidos na segunda (tudo proximo ou hoje)", () => {
    const { perdidos } = planejarSemana(schedule, [], monday());
    expect(perdidos).toHaveLength(0);
  });
});
