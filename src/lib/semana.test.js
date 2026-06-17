import { describe, it, expect } from "vitest";
import { planejarSemana } from "./semana.js";

// Schedule PPL+Upper: A B C - D E -
const schedule = [
  { day: "SEG", session: "A", rest: false },
  { day: "TER", session: "B", rest: false },
  { day: "QUA", session: "C", rest: false },
  { day: "QUI", session: null, rest: true },
  { day: "SEX", session: "D", rest: false },
  { day: "SÁB", session: "E", rest: false },
  { day: "DOM", session: null, rest: true },
];

const SEG = new Date("2026-06-01T10:00:00"); // segunda da semana
const QUI = new Date("2026-06-04T12:00:00"); // "hoje" = quinta

describe("planejarSemana", () => {
  it("marca feito/perdido/hoje/proximo corretamente", () => {
    // Concluiu A (segunda); faltou B e C; hoje é quinta (descanso).
    const historico = [{ diaId: "A", data: SEG.toISOString() }];
    const { dias } = planejarSemana(schedule, historico, QUI);
    const byDay = Object.fromEntries(dias.map((d) => [d.day, d.status]));
    expect(byDay.SEG).toBe("feito");
    expect(byDay.TER).toBe("perdido");
    expect(byDay.QUA).toBe("perdido");
    expect(byDay.QUI).toBe("descanso");
    expect(byDay.SEX).toBe("proximo");
  });

  it("sugere remanejar treinos perdidos para dias de descanso a partir de hoje", () => {
    const historico = [{ diaId: "A", data: SEG.toISOString() }];
    const { perdidos, sugestoes } = planejarSemana(schedule, historico, QUI);
    expect(perdidos.map((p) => p.session)).toEqual(["B", "C"]);
    // Descansos de hoje em diante: QUI (hoje) e DOM. Ambos os perdidos cabem.
    expect(sugestoes[0]).toEqual({ session: "B", para: "QUI" });
    expect(sugestoes[1]).toEqual({ session: "C", para: "DOM" });
  });

  it("ignora histórico de semanas anteriores", () => {
    const semanaPassada = new Date("2026-05-25T10:00:00");
    const historico = [{ diaId: "A", data: semanaPassada.toISOString() }];
    const { dias } = planejarSemana(schedule, historico, QUI);
    expect(dias.find((d) => d.day === "SEG").status).toBe("perdido");
  });
});
