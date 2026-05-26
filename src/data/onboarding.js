// Opções do questionário de perfil físico (levantamento de requisitos).

export const SEXOS = [
  { id: "masculino", label: "Masculino" },
  { id: "feminino", label: "Feminino" },
  { id: "outro", label: "Outro / Prefiro não dizer" },
];

export const OBJETIVOS = [
  { id: "emagrecimento", label: "Emagrecimento", icon: "🔥" },
  { id: "hipertrofia", label: "Hipertrofia", icon: "💪" },
  { id: "forca", label: "Ganho de força", icon: "🏋️" },
  { id: "condicionamento", label: "Condicionamento", icon: "⚡" },
  { id: "mobilidade", label: "Mobilidade", icon: "🧘" },
  { id: "core", label: "Core", icon: "🎯" },
  { id: "crossfit", label: "Crossfit", icon: "🤸" },
  { id: "corrida", label: "Corrida", icon: "🏃" },
  { id: "resistencia", label: "Resistência", icon: "🔋" },
  { id: "funcional", label: "Funcional", icon: "🪢" },
  { id: "reabilitacao", label: "Reabilitação leve", icon: "🩹" },
];

export const NIVEIS = [
  { id: "iniciante", label: "Iniciante", desc: "Pouca ou nenhuma experiência" },
  { id: "intermediario", label: "Intermediário", desc: "Treina há 6 meses a 2 anos" },
  { id: "avancado", label: "Avançado", desc: "Treina de forma consistente há 2+ anos" },
];

export const TEMPOS = [
  { id: 30, label: "30 min" },
  { id: 45, label: "45 min" },
  { id: 60, label: "60 min" },
  { id: 90, label: "90 min" },
];

export const EQUIPAMENTOS = [
  { id: "academia", label: "Academia completa", icon: "🏟️" },
  { id: "halteres", label: "Halteres em casa", icon: "🏠" },
  { id: "elasticos", label: "Elásticos / faixas", icon: "➰" },
  { id: "peso_corporal", label: "Apenas peso corporal", icon: "🤲" },
];

export const RESTRICOES = [
  { id: "joelho", label: "Joelho" },
  { id: "ombro", label: "Ombro" },
  { id: "lombar", label: "Lombar / coluna" },
  { id: "punho", label: "Punho" },
  { id: "cardiaca", label: "Condição cardíaca" },
];
