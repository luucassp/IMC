// Biblioteca de dias de treino + templates de divisão.
// Cada split referencia ids de dias; lib/plano.js monta a semana a partir daqui.

export const DIAS = {
  // ---- Push / Pull / Legs + Upper (bloco avançado original) ----
  A: {
    id: "A",
    label: "PUSH",
    focus: "PUSH — Peito · Ombro · Tríceps",
    color: "#C8FF00",
    tag: "EMPURRAR",
    exercises: [
      { category: "PRINCIPAL", name: "Supino Inclinado com Barra", sets: "4", reps: "5–6", rest: "3–4 min", note: "Amplitude total; cotovelo 70° do tronco.", progression: "Carga +2,5 kg/semana" },
      { category: "PRINCIPAL", name: "Desenvolvimento com Halteres", sets: "4", reps: "6–8", rest: "3 min", note: "Descida controlada (3s).", progression: "Carga ou +1 rep/semana" },
      { category: "ACESSÓRIO", name: "Crossover na Polia Alta", sets: "3", reps: "10–12", rest: "90 s", note: "Foco na adução e peak contraction.", progression: "+1 rep até 12, depois +carga" },
      { category: "ACESSÓRIO", name: "Elevação Lateral", sets: "3", reps: "12–15", rest: "60 s", note: "Carga leve com controle total.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Tríceps Corda na Polia", sets: "3", reps: "12–15", rest: "60 s", note: "Extensão total com separação das mãos no final.", progression: "+1 rep até 15, depois +carga" },
      { category: "ACESSÓRIO", name: "Mergulho no Banco", sets: "3", reps: "10–12", rest: "90 s", note: "Cotovelos para trás, não para os lados.", progression: "+lastro quando atingir 12 reps" },
    ],
  },
  B: {
    id: "B",
    label: "PULL",
    focus: "PULL — Costas · Bíceps · Posterior de Ombro",
    color: "#00D4FF",
    tag: "PUXAR",
    exercises: [
      { category: "PRINCIPAL", name: "Barra Fixa (ou Puxada)", sets: "4", reps: "4–6", rest: "3–4 min", note: "Escápulas retraídas antes de puxar.", progression: "Carga +2,5 kg/semana" },
      { category: "PRINCIPAL", name: "Remada Curvada com Barra", sets: "4", reps: "5–7", rest: "3 min", note: "Tronco 45°, barra conduzida ao umbigo.", progression: "Carga +2,5 kg/semana" },
      { category: "ACESSÓRIO", name: "Puxada na Polia (pegada neutra)", sets: "3", reps: "10–12", rest: "90 s", note: "Cotovelos apontando para o chão.", progression: "+1 rep até 12, depois +carga" },
      { category: "ACESSÓRIO", name: "Remada Unilateral com Halter", sets: "3", reps: "10/cada", rest: "60 s", note: "Apoio no banco; amplitude máxima.", progression: "+1 rep até 12, depois +carga" },
      { category: "ACESSÓRIO", name: "Rosca com Barra EZ", sets: "3", reps: "8–10", rest: "90 s", note: "Controle excêntrico de 3s.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Crucifixo Inverso", sets: "3", reps: "12–15", rest: "60 s", note: "Posterior de ombro — cotovelos semiflexionados.", progression: "+1 rep até 15, depois +carga" },
    ],
  },
  C: {
    id: "C",
    label: "LEGS",
    focus: "LEGS — Quadríceps · Glúteo · Posterior · Panturrilha",
    color: "#FF6B35",
    tag: "MEMBROS INF.",
    exercises: [
      { category: "PRINCIPAL", name: "Agachamento Livre com Barra", sets: "4", reps: "4–6", rest: "4–5 min", note: "Profundidade total com lordose preservada.", progression: "Carga +5 kg/semana" },
      { category: "PRINCIPAL", name: "Leg Press 45°", sets: "3", reps: "8–10", rest: "3 min", note: "Joelhos não travam no topo.", progression: "Carga +10 kg/semana" },
      { category: "ACESSÓRIO", name: "Cadeira Extensora", sets: "3", reps: "12–15", rest: "60 s", note: "Isometria de 2s no topo.", progression: "+1 rep até 15, depois +carga" },
      { category: "ACESSÓRIO", name: "Stiff com Halteres", sets: "3", reps: "8–10", rest: "90 s", note: "Amplitude máxima na descida.", progression: "+1 rep até 10, depois +carga" },
      { category: "ACESSÓRIO", name: "Cadeira Flexora", sets: "3", reps: "10–12", rest: "60 s", note: "Excêntrico lento (3s).", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Panturrilha em Pé", sets: "4", reps: "12–15", rest: "60 s", note: "Descer abaixo do nível da plataforma.", progression: "+carga quando atingir 15 reps" },
    ],
  },
  D: {
    id: "D",
    label: "UPPER",
    focus: "UPPER — Força + Volume (Full Upper)",
    color: "#A855F7",
    tag: "SUPERIOR",
    exercises: [
      { category: "PRINCIPAL", name: "Supino Reto com Barra", sets: "5", reps: "3–5", rest: "4–5 min", note: "Sessão de força — carga máxima com técnica.", progression: "Carga +2,5 kg/semana" },
      { category: "PRINCIPAL", name: "Remada na Polia Baixa", sets: "4", reps: "6–8", rest: "3 min", note: "Pegada neutra. Puxe até o abdômen.", progression: "Carga +2,5 kg/semana" },
      { category: "ACESSÓRIO", name: "Desenvolvimento Militar (em pé)", sets: "3", reps: "6–8", rest: "3 min", note: "Recrutamento de core.", progression: "+1 rep até 8, depois +carga" },
      { category: "ACESSÓRIO", name: "Puxada na Polia", sets: "3", reps: "10–12", rest: "90 s", note: "Amplitude completa.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Tríceps Testa com Barra EZ", sets: "3", reps: "10–12", rest: "60 s", note: "Cotovelos fixos.", progression: "+1 rep até 12, depois +carga" },
      { category: "ACESSÓRIO", name: "Rosca Concentrada", sets: "3", reps: "10/cada", rest: "60 s", note: "Pico de contração com supinação.", progression: "+1 rep até 12, depois +carga" },
    ],
  },
  E: {
    id: "E",
    label: "LOWER",
    focus: "LOWER — Glúteo + Posterior (Volume / Pump)",
    color: "#00E5A0",
    tag: "MEMBROS INF.",
    exercises: [
      { category: "PRINCIPAL", name: "Hip Thrust com Barra", sets: "4", reps: "8–10", rest: "2–3 min", note: "Isometria de 2s no topo.", progression: "Carga +5 kg/semana" },
      { category: "PRINCIPAL", name: "Agachamento Búlgaro", sets: "3", reps: "8/cada", rest: "2 min", note: "Pé dianteiro à frente para amplitude de glúteo.", progression: "+1 rep até 10, depois +carga" },
      { category: "ACESSÓRIO", name: "Cadeira Abdutora", sets: "3", reps: "15–20", rest: "60 s", note: "Drop set opcional na última série.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Stiff Unilateral com Halter", sets: "3", reps: "10/cada", rest: "90 s", note: "Equilíbrio + posterior. Controle total.", progression: "+1 rep até 12, depois +carga" },
      { category: "ACESSÓRIO", name: "Flexão de Joelho (cadeira flexora)", sets: "3", reps: "10–12", rest: "60 s", note: "Excêntrico lento e controlado.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Panturrilha Sentado", sets: "3", reps: "15–20", rest: "60 s", note: "Recruta o sóleo.", progression: "+carga quando atingir 20 reps" },
    ],
  },

  // ---- Upper / Lower (4 dias) ----
  U: {
    id: "U",
    label: "UPPER",
    focus: "UPPER — Superiores Completo",
    color: "#00D4FF",
    tag: "SUPERIOR",
    exercises: [
      { category: "PRINCIPAL", name: "Supino Reto com Barra", sets: "4", reps: "6–8", rest: "3 min", note: "Base do superior. Técnica preservada.", progression: "Carga +2,5 kg/semana" },
      { category: "PRINCIPAL", name: "Remada Curvada com Barra", sets: "4", reps: "6–8", rest: "3 min", note: "Equilibra o volume de empurrar.", progression: "Carga +2,5 kg/semana" },
      { category: "ACESSÓRIO", name: "Desenvolvimento com Halteres", sets: "3", reps: "8–10", rest: "90 s", note: "Descida controlada.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Puxada na Polia", sets: "3", reps: "10–12", rest: "90 s", note: "Amplitude completa.", progression: "+1 rep até 12, depois +carga" },
      { category: "ACESSÓRIO", name: "Rosca Direta + Tríceps Corda", sets: "3", reps: "10–12", rest: "60 s", note: "Bi-set de braços.", progression: "+1 rep/semana" },
    ],
  },
  L: {
    id: "L",
    label: "LOWER",
    focus: "LOWER — Inferiores Completo",
    color: "#FF6B35",
    tag: "MEMBROS INF.",
    exercises: [
      { category: "PRINCIPAL", name: "Agachamento Livre com Barra", sets: "4", reps: "6–8", rest: "4 min", note: "Profundidade com lordose preservada.", progression: "Carga +5 kg/semana" },
      { category: "PRINCIPAL", name: "Stiff com Barra", sets: "4", reps: "8–10", rest: "3 min", note: "Posterior e glúteo. Coluna neutra.", progression: "Carga +2,5 kg/semana" },
      { category: "ACESSÓRIO", name: "Leg Press 45°", sets: "3", reps: "10–12", rest: "90 s", note: "Joelhos não travam.", progression: "+1 rep até 12, depois +carga" },
      { category: "ACESSÓRIO", name: "Cadeira Flexora", sets: "3", reps: "12–15", rest: "60 s", note: "Excêntrico lento.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Panturrilha em Pé", sets: "4", reps: "12–15", rest: "60 s", note: "Amplitude total.", progression: "+carga quando atingir 15 reps" },
    ],
  },

  // ---- Full Body (1–3 dias) ----
  FB1: {
    id: "FB1",
    label: "FULL A",
    focus: "FULL BODY A — Agachamento + Empurrar",
    color: "#C8FF00",
    tag: "CORPO TODO",
    exercises: [
      { category: "PRINCIPAL", name: "Agachamento Livre (ou Goblet)", sets: "3", reps: "8–10", rest: "2–3 min", note: "Sem barra? Use halter junto ao peito.", progression: "+1 rep, depois +carga" },
      { category: "PRINCIPAL", name: "Supino Reto (barra, halter ou flexão)", sets: "3", reps: "8–10", rest: "2 min", note: "Adapte ao equipamento disponível.", progression: "+1 rep, depois +carga" },
      { category: "ACESSÓRIO", name: "Remada Curvada (ou na máquina)", sets: "3", reps: "10–12", rest: "90 s", note: "Equilibra o empurrar.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Desenvolvimento de Ombro", sets: "2", reps: "10–12", rest: "60 s", note: "Halteres ou máquina.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Prancha", sets: "3", reps: "30–45 s", rest: "45 s", note: "Core: mantenha o tronco rígido.", progression: "+5 s/semana" },
    ],
  },
  FB2: {
    id: "FB2",
    label: "FULL B",
    focus: "FULL BODY B — Posterior + Puxar",
    color: "#00D4FF",
    tag: "CORPO TODO",
    exercises: [
      { category: "PRINCIPAL", name: "Levantamento Terra (ou Stiff)", sets: "3", reps: "6–8", rest: "3 min", note: "Coluna neutra. Foco na técnica.", progression: "+carga conforme técnica" },
      { category: "PRINCIPAL", name: "Barra Fixa (ou Puxada)", sets: "3", reps: "6–10", rest: "2 min", note: "Sem barra fixa? Use puxada ou remada elástica.", progression: "+1 rep, depois +carga" },
      { category: "ACESSÓRIO", name: "Leg Press (ou Afundo)", sets: "3", reps: "10–12", rest: "90 s", note: "Amplitude controlada.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Desenvolvimento com Halteres", sets: "2", reps: "10–12", rest: "60 s", note: "Ombro.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Rosca + Abdominal", sets: "2", reps: "12–15", rest: "60 s", note: "Bi-set braço + core.", progression: "+1 rep/semana" },
    ],
  },
  FB3: {
    id: "FB3",
    label: "FULL C",
    focus: "FULL BODY C — Unilateral + Volume",
    color: "#A855F7",
    tag: "CORPO TODO",
    exercises: [
      { category: "PRINCIPAL", name: "Agachamento Búlgaro", sets: "3", reps: "8/cada", rest: "2 min", note: "Unilateral: corrige assimetrias.", progression: "+1 rep, depois +carga" },
      { category: "PRINCIPAL", name: "Supino Inclinado (ou flexão inclinada)", sets: "3", reps: "8–10", rest: "2 min", note: "Foco em peito superior.", progression: "+1 rep, depois +carga" },
      { category: "ACESSÓRIO", name: "Remada Unilateral com Halter", sets: "3", reps: "10/cada", rest: "90 s", note: "Amplitude máxima.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Elevação Lateral", sets: "3", reps: "12–15", rest: "60 s", note: "Controle total.", progression: "+1 rep/semana" },
      { category: "ACESSÓRIO", name: "Panturrilha + Prancha Lateral", sets: "3", reps: "15 / 30 s", rest: "60 s", note: "Bi-set panturrilha + core lateral.", progression: "+1 rep/semana" },
    ],
  },
};

// Cada divisão (gerada por lib/recomendacao) mapeia para uma sequência de dias.
export const SPLITS = {
  "Full Body": ["FB1", "FB2", "FB3"],
  "Upper / Lower": ["U", "L"],
  "Push / Pull / Legs + Upper": ["A", "B", "C", "D", "E"],
  "Push / Pull / Legs (2x)": ["A", "B", "C"],
};

// Distribuição preferida de dias de treino na semana (índices SEG..DOM = 0..6).
export const DISTRIBUICAO_SEMANA = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

export const METRICAS = [
  { icon: "📊", title: "Diário de Cargas", desc: "Registre carga × séries × reps de cada exercício." },
  { icon: "💪", title: "Volume Total Semanal", desc: "Σ(carga × séries × reps) por grupo muscular. Meta: +2–5% por semana." },
  { icon: "📸", title: "Foto Quinzenal", desc: "Mesma luz, horário e posição. Não use a balança como único indicador." },
  { icon: "⚡", title: "RPE / RIR", desc: "Esforço percebido (1–10). 7–8 nos compostos, 8–9 nos acessórios." },
  { icon: "🎯", title: "Progressão de Força", desc: "Compare a carga nos compostos a cada 4 semanas. Meta: +5–10% no mês." },
];
