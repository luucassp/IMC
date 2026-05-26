// Cálculo e classificação de IMC (padrão OMS).
// Mantém a regra original do projeto, com limiares corrigidos.

export const FAIXAS_IMC = [
  { max: 18.5, classe: "Abaixo do peso", cor: "#00D4FF" },
  { max: 25, classe: "Peso normal", cor: "#00E5A0" },
  { max: 30, classe: "Sobrepeso", cor: "#C8FF00" },
  { max: 35, classe: "Obesidade grau 1", cor: "#FFB000" },
  { max: 40, classe: "Obesidade grau 2", cor: "#FF6B35" },
  { max: Infinity, classe: "Obesidade grau 3", cor: "#FF3B3B" },
];

// pesoKg em quilos, alturaCm em centímetros.
export function calcularIMC(pesoKg, alturaCm) {
  const peso = Number(pesoKg);
  const alturaM = Number(alturaCm) / 100;
  if (!peso || !alturaM) return null;
  return Number((peso / alturaM ** 2).toFixed(1));
}

export function classificarIMC(imc) {
  if (imc == null) return null;
  return FAIXAS_IMC.find((faixa) => imc < faixa.max) ?? FAIXAS_IMC.at(-1);
}
