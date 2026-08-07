// Biblioteca de WODs avulsos — referências salvas para puxar em qualquer dia.
// Mesmo formato de blocos do ciclo: { titulo, extra?, itens?, texto? } ou { nota }.

export const WODS = [
  {
    id: "game-over",
    nome: "GAME OVER",
    tipo: "For time",
    subtitulo: "Chipper de remo + wall ball · Pura resistência",
    tags: ["end"],
    fonte: "@pedropbmartins",
    blocks: [
      {
        titulo: "WOD · For time",
        itens: [
          "1000/900 m remo",
          "— directly into —",
          "100 wall ball 9/6 kg (20/14 lb)",
          "50 burpee over rower",
        ],
      },
      { nota: "Divida os wall balls e os burpees como quiser — a ordem é livre depois do remo." },
      { nota: "O remo entra all-in no começo: sair forte custa caro nos wall balls. Séries de 20–25 no WB com respiração curta." },
    ],
  },
  {
    id: "8-rounds-cj",
    nome: "8 Rounds · Cal + BFB + C&J",
    tipo: "8 rounds · 45s rest",
    subtitulo: "Barra pesada sob fadiga · Intervalado",
    tags: ["lpo", "end"],
    fonte: "@why_not_josh",
    blocks: [
      {
        titulo: "WOD · 8 rounds",
        extra: "45 s de descanso entre rounds",
        itens: [
          "12 cal (remo ou bike)",
          "8 bar facing burpee",
          "4 clean & jerk 90 kg (escala: 60–70 kg)",
        ],
      },
      { nota: "C&J em singles rápidos e constantes desde o round 1 — a carga é alta e a fadiga acumula." },
      { nota: "Os 45 s de descanso são fixos: se o round passar de ~2:00, reduza a carga da barra." },
    ],
  },
  {
    id: "5-rounds-run-squat",
    nome: "5 Rounds · Run + Air Squat + Sit-up",
    tipo: "5 rounds for time",
    subtitulo: "Volume de pernas e corrida · Longo",
    tags: ["end", "gin"],
    fonte: "CrossFit Sinos · @l.henri93",
    blocks: [
      {
        titulo: "WOD · 5 rounds for time",
        itens: ["600 m corrida", "50 air squat", "30 abmat sit-up"],
      },
      { nota: "Tempo de referência do post: 22:59. Cap sugerido: 30 min." },
      { nota: "Air squat em blocos de 25 desde o round 1 — quebrar cedo salva a corrida do round seguinte." },
    ],
  },
  {
    id: "community-cup-2026-w3",
    nome: "Community Cup 2026 — Workout 3",
    tipo: "3 × AMRAP 4 min",
    subtitulo: "Snatch progressivo · Ginástica sob fadiga",
    tags: ["lpo", "gin"],
    fonte: "CrossFit Games · CrossFit Milpitas",
    blocks: [
      {
        titulo: "WOD · Três AMRAPs de 4 min",
        extra: "2 min de descanso entre AMRAPs",
        itens: [
          "10 shuttle run",
          "21 toes-to-bar",
          "Máx power snatch* 61/43 kg (135/95 lb)",
        ],
      },
      { nota: "*Round 2: máx overhead squat. Round 3: máx squat snatch. O score é o total de reps da barra nos 3 rounds." },
      { nota: "T2B em 2–3 séries planejadas — chegar na barra com o grip inteiro vale mais que 1 minuto a mais de AMRAP." },
    ],
  },
  {
    id: "community-cup-2026-w4",
    nome: "Community Cup 2026 — Workout 4",
    tipo: "2 rounds for time",
    subtitulo: "Corda + volume metabólico · Chipper",
    tags: ["gin", "end"],
    fonte: "CrossFit Games · Iron House CrossFit",
    blocks: [
      {
        titulo: "WOD · 2 rounds for time",
        itens: [
          "150 double-under",
          "100 air squat",
          "50 alternating dumbbell snatch 22,5/15 kg (50/35 lb)",
        ],
      },
      { nota: "Double-unders unbroken no round 1 se possível; no round 2 já quebre em 50–50–50 pra não travar." },
      { nota: "Air squat é o que mais tira a perna da corda — ritmo constante, sem sprint." },
    ],
  },
];
