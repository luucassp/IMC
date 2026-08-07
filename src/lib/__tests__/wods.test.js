import { describe, it, expect } from "vitest";
import { WODS } from "../../data/wods.js";
import { CICLO_INFO } from "../../data/ciclo.js";

const IDS_TAGS = CICLO_INFO.tags.map((t) => t.id);

describe("WODS", () => {
  it("tem os 5 WODs guardados", () => {
    expect(WODS).toHaveLength(5);
  });

  it("ids são únicos", () => {
    const ids = WODS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todo WOD tem nome, tipo, fonte e blocos", () => {
    for (const w of WODS) {
      expect(w.nome).toBeTruthy();
      expect(w.tipo).toBeTruthy();
      expect(w.fonte).toBeTruthy();
      expect(w.blocks.length).toBeGreaterThan(0);
    }
  });

  it("todas as tags existem na legenda do ciclo", () => {
    for (const w of WODS) {
      expect(w.tags.length).toBeGreaterThan(0);
      for (const tag of w.tags) expect(IDS_TAGS).toContain(tag);
    }
  });

  it("todo bloco é uma nota ou tem título com conteúdo", () => {
    for (const w of WODS) {
      for (const blk of w.blocks) {
        if (blk.nota) expect(typeof blk.nota).toBe("string");
        else {
          expect(blk.titulo).toBeTruthy();
          expect(blk.itens ?? blk.texto).toBeTruthy();
        }
      }
    }
  });

  it("GAME OVER mantém a estrutura do post original", () => {
    const wod = WODS.find((w) => w.id === "game-over");
    const itens = wod.blocks[0].itens;
    expect(itens[0]).toMatch(/1000\/900 m remo/);
    expect(itens.some((i) => /100 wall ball/.test(i))).toBe(true);
    expect(itens.some((i) => /50 burpee over rower/.test(i))).toBe(true);
  });

  it("Community Cup W3 registra a progressão snatch → OHS → squat snatch", () => {
    const wod = WODS.find((w) => w.id === "community-cup-2026-w3");
    const notas = wod.blocks.filter((b) => b.nota).map((b) => b.nota).join(" ");
    expect(notas).toMatch(/overhead squat/i);
    expect(notas).toMatch(/squat snatch/i);
  });
});
