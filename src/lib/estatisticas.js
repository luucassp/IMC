// Agregações para o dashboard de evolução (RF07).

const DIA_MS = 864e5;

function ddmm(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Janelas móveis de 7 dias terminando hoje; mais antiga → mais recente.
export function frequenciaPorSemana(historico, semanas = 6) {
  const agora = Date.now();
  const baldes = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const fim = agora - i * 7 * DIA_MS;
    const inicio = fim - 7 * DIA_MS;
    const valor = historico.filter((h) => {
      const t = new Date(h.data).getTime();
      return t > inicio && t <= fim;
    }).length;
    baldes.push({ label: i === 0 ? "atual" : ddmm(new Date(inicio + DIA_MS)), valor });
  }
  return baldes;
}

// Nomes de exercícios que possuem registro de carga.
export function exerciciosComRegistro(registros) {
  return [...new Set(registros.map((r) => r.exercicio))];
}

// Maior carga por dia para um exercício; últimas N sessões, antiga → recente.
export function progressaoCarga(registros, exercicio, limite = 6) {
  const doExercicio = registros.filter((r) => r.exercicio === exercicio);
  const porDia = new Map();
  for (const r of doExercicio) {
    const dia = new Date(r.data).toDateString();
    const carga = Number(r.carga) || 0;
    if (!porDia.has(dia) || carga > porDia.get(dia).valor) {
      porDia.set(dia, { label: ddmm(new Date(r.data)), valor: carga, ordem: new Date(r.data).getTime() });
    }
  }
  return [...porDia.values()].sort((a, b) => a.ordem - b.ordem).slice(-limite);
}
