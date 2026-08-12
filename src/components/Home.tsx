import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { api } from "../lib/api.js";
import { semanaDoCiclo, isoLocal, proximoDia } from "../lib/ciclo.js";
import { CICLO_INFO } from "../data/ciclo.js";
import { ACCENT } from "../lib/theme.js";
import { BackgroundAnimado } from "./BackgroundAnimado.tsx";

type Historico = { id: string; data: string; diaId: string; diaLabel: string; foco: string };
type Dashboard = {
  total: number;
  ultimos7: number;
  frequencia: { label: string; valor: number }[];
  progressao: Record<string, { label: string; valor: number }[]>;
};

type Props = {
  user: { nome: string; avatarUrl?: string | null };
  token: string;
  onVerCiclo: () => void;
  onVerBiblioteca: () => void;
  onVerEvolucao: () => void;
  onVerPRs: () => void;
  onAbrirDia: (iso: string) => void;
};

const TREINOS_SEMANA = 6; // TER–DOM · segunda = descanso

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// Anel de progresso estilo Apple Fitness.
function Ring({ value, max, color, size = 72, thickness = 7, children }: {
  value: number; max: number; color: string; size?: number; thickness?: number; children?: React.ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / Math.max(max, 1), 0), 1);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1f1f1f" strokeWidth={thickness} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{children}</div>
    </div>
  );
}

// Badge com ícone vetorial e fundo semântico translúcido (mesma convenção
// de tinta ${cor}26 já usada nas tags de Ciclo/Biblioteca).
function IconBadge({ children, color = ACCENT }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${color}26`, color }}
    >
      {children}
    </div>
  );
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TargetIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
const AwardIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
);
const FlameIcon = () => (
  <svg {...iconProps}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
);
const CalendarIcon = () => (
  <svg {...iconProps}><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>
);
const TrendingUpIcon = () => (
  <svg {...iconProps}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
);
const ChevronDownIcon = () => (
  <svg {...iconProps} width={14} height={14}><polyline points="6 9 12 15 18 9" /></svg>
);

// Linha simples em SVG para a progressão de carga.
function Sparkline({ pontos, color }: { pontos: number[]; color: string }) {
  if (pontos.length < 2) return null;
  const w = 240, h = 56, pad = 4;
  const min = Math.min(...pontos);
  const max = Math.max(...pontos);
  const rng = max - min || 1;
  const xs = pontos.map((_, i) => pad + (i * (w - pad * 2)) / (pontos.length - 1));
  const ys = pontos.map((v) => h - pad - ((v - min) / rng) * (h - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

export default function Home({ user, token, onVerCiclo, onVerBiblioteca, onVerEvolucao, onVerPRs, onAbrirDia }: Props) {
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    let ativo = true;
    Promise.all([api.getHistorico(token), api.getDashboard(token)])
      .then(([h, d]: [Historico[], Dashboard]) => {
        if (!ativo) return;
        setHistorico(h);
        setDashboard(d);
      })
      .catch(() => {});
    return () => { ativo = false; };
  }, [token]);

  const semana = semanaDoCiclo(historico);
  const hojeIdx = (new Date().getDay() + 6) % 7;
  const slotHoje = semana[hojeIdx];
  const diaHoje = slotHoje?.dia ?? null;
  const proximo = proximoDia(isoLocal(new Date()));

  // Exercício com mais registros — melhor candidato pra mostrar progressão.
  const melhorExercicio = dashboard
    ? Object.entries(dashboard.progressao).sort((a, b) => b[1].length - a[1].length)[0]
    : undefined;

  const streak = (() => {
    if (!historico.length) return 0;
    const datas = [...new Set(historico.map((h) => new Date(h.data).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    let count = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    for (let i = 0; i < datas.length; i++) {
      const d = new Date(datas[i]);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((hoje.getTime() - d.getTime()) / 86400000);
      if (diff === count || diff === count + 1) {
        count = diff + 1;
      } else break;
    }
    return count;
  })();

  const cardCls = "rounded-2xl bg-[#0f0f0f] border border-white/[0.08] p-6";
  const statCardCls = `${cardCls} text-left w-full hover:bg-[#141414] hover:border-white/[0.15] active:scale-[0.97] transition-all duration-150 cursor-pointer`;

  return (
    <div className="min-h-screen text-[#f0ece4] pb-20 relative">
      <BackgroundAnimado intensity={0.5} />
      <div className="max-w-2xl mx-auto px-5 pt-10 relative">

        {/* Top: saudação + sair */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <div className="text-[#888] text-sm font-mono tracking-widest uppercase">{saudacao()} 🔥</div>
            <h1 className="text-3xl font-bold font-display mt-1 leading-tight">{user.nome}</h1>
            <div className="text-[10px] font-mono tracking-widest mt-1" style={{ color: ACCENT }}>
              MAYRENCROSFIT · {CICLO_INFO.ciclo.toUpperCase()}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuAberto((v) => !v)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform duration-150"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-[#222]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#222] flex items-center justify-center text-sm font-bold">
                  {user.nome?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-[#666]"><ChevronDownIcon /></span>
            </button>
            {menuAberto && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                <div className="absolute right-0 top-14 z-50 w-52 rounded-xl bg-[#141414] border border-[#222] shadow-2xl overflow-hidden">
                  {([
                    { icon: "📊", label: "Minha Evolução", action: () => { setMenuAberto(false); onVerEvolucao(); } },
                    { icon: "🏆", label: "Meus PRs", action: () => { setMenuAberto(false); onVerPRs(); } },
                    { icon: "🏋️", label: "Ciclo de Treinos", action: () => { setMenuAberto(false); onVerCiclo(); } },
                    { icon: "📚", label: "Biblioteca de WODs", action: () => { setMenuAberto(false); onVerBiblioteca(); } },
                  ] as { icon: string; label: string; action: () => void }[]).map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full text-left px-4 py-3 text-sm text-[#ccc] hover:bg-[#1a1a1a] flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Strip da semana */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
          className="flex gap-2 mb-6 overflow-x-auto"
        >
          {semana.map((d, i) => {
            const ehHoje = i === hojeIdx;
            const feito = d.status === "feito";
            const perdido = d.status === "perdido";
            const clicavel = !!d.dia;
            return (
              <button
                type="button"
                key={i}
                onClick={clicavel ? () => onAbrirDia(d.date) : undefined}
                disabled={!clicavel}
                className={[
                  "flex-1 min-w-[42px] py-3 rounded-2xl flex flex-col items-center transition-all duration-150",
                  clicavel ? "cursor-pointer active:scale-95" : "cursor-default opacity-50",
                  feito ? "bg-[#ff8c1a] text-black"
                  : ehHoje ? "bg-[#141414] ring-2 ring-[#ff8c1a] text-[#ff8c1a]"
                  : perdido ? "bg-[#1a1010] text-[#ff5d7a] border border-[#ff5d7a40]"
                  : "bg-[#0f0f0f] text-[#666] border border-[#1a1a1a]",
                ].join(" ")}
              >
                <span className="text-[10px] font-mono tracking-widest">{d.dow}</span>
                <span className="text-lg font-bold font-display mt-1">{d.diaDoMes}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Hero do dia */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
          className="mb-6"
        >
          {!diaHoje ? (
            <div className={`${cardCls} flex items-center justify-between`}>
              <div>
                <div className="text-[10px] font-mono text-[#666] tracking-widest">HOJE</div>
                <div className="text-xl font-bold mt-1">Dia de descanso 💤</div>
                <div className="text-sm text-[#666] mt-2">Descanso total — recuperar pra semana que vem.</div>
              </div>
              <div className="text-4xl">😌</div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${ACCENT}66 0%, #3d1f00 50%, #0f0f0f 100%)`, border: `1px solid ${ACCENT}55` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-[#f0ece4]/80">
                    HOJE · {slotHoje.dow} {diaHoje.num}
                  </div>
                  <h2 className="text-2xl font-bold font-display mt-2">{diaHoje.title}</h2>
                  <div className="text-sm text-[#aaa] mt-1">{diaHoje.subtitle}</div>
                </div>
              </div>
              <button
                onClick={() => onAbrirDia(slotHoje.date)}
                className="mt-5 px-5 py-3 rounded-xl font-bold text-sm tracking-wide cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-150"
                style={{ background: ACCENT, color: "#000" }}
              >
                Ver treino →
              </button>
            </div>
          )}
        </motion.div>

        {/* Grid 2x2 de stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <button type="button" onClick={onVerCiclo} className={statCardCls}>
            <div className="flex items-center gap-3 mb-3">
              <IconBadge><TargetIcon /></IconBadge>
              <div className="text-[10px] font-mono text-[#666] tracking-widest">ESTA SEMANA</div>
            </div>
            <div className="flex items-center gap-3">
              <Ring value={dashboard?.ultimos7 ?? 0} max={TREINOS_SEMANA} color={ACCENT}>
                <span className="text-[#f0ece4] font-display">{dashboard?.ultimos7 ?? 0}</span>
              </Ring>
              <div className="text-xs text-[#888] leading-tight">
                de <span className="text-[#aaa] font-bold">{TREINOS_SEMANA}</span> treinos
              </div>
            </div>
          </button>

          <button type="button" onClick={onVerEvolucao} className={statCardCls}>
            <div className="flex items-center gap-3 mb-3">
              <IconBadge><AwardIcon /></IconBadge>
              <div className="text-[10px] font-mono text-[#666] tracking-widest">TOTAL</div>
            </div>
            <div className="text-3xl font-bold font-display">{dashboard?.total ?? 0}</div>
            <div className="text-xs text-[#666] mt-1">treinos concluídos</div>
          </button>

          <button type="button" onClick={onVerEvolucao} className={statCardCls}>
            <div className="flex items-center gap-3 mb-3">
              <IconBadge color="#ff5d3a"><FlameIcon /></IconBadge>
              <div className="text-[10px] font-mono text-[#666] tracking-widest">SEQUÊNCIA</div>
            </div>
            <div className="text-3xl font-bold font-display">{streak}</div>
            <div className="text-xs mt-1 text-[#666]">
              {streak === 1 ? "dia seguido" : "dias seguidos"}
            </div>
          </button>

          <button type="button" onClick={proximo ? () => onAbrirDia(proximo.date) : onVerCiclo} className={statCardCls}>
            <div className="flex items-center gap-3 mb-3">
              <IconBadge color="#8a8f98"><CalendarIcon /></IconBadge>
              <div className="text-[10px] font-mono text-[#666] tracking-widest">PRÓXIMO</div>
            </div>
            {proximo ? (
              <>
                <div className="text-xl font-bold font-display">{proximo.dow} {proximo.num}</div>
                <div className="text-xs text-[#666] mt-1 truncate">{proximo.title}</div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-[#666]">—</div>
                <div className="text-xs text-[#666] mt-1">ciclo encerrado</div>
              </>
            )}
          </button>
        </motion.div>

        {/* Progressão do exercício principal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
          className={`${cardCls} mb-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <IconBadge><TrendingUpIcon /></IconBadge>
              <div>
                <div className="text-[10px] font-mono text-[#666] tracking-widest">PROGRESSÃO DE CARGA</div>
                <div className="text-base font-bold mt-1">
                  {melhorExercicio ? melhorExercicio[0] : "Nenhum registro ainda"}
                </div>
              </div>
            </div>
            {melhorExercicio && melhorExercicio[1].length > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold font-display" style={{ color: ACCENT }}>{melhorExercicio[1].at(-1)?.valor} kg</div>
                <div className="text-[10px] text-[#666] font-mono">última sessão</div>
              </div>
            )}
          </div>
          {melhorExercicio && melhorExercicio[1].length >= 2 ? (
            <Sparkline pontos={melhorExercicio[1].map((p) => p.valor)} color={ACCENT} />
          ) : (
            <div className="text-sm text-[#555] mt-2">
              Registre séries (kg × reps) na aba <span className="text-[#888] font-bold">Treino</span> pra ver sua evolução aqui.
            </div>
          )}
        </motion.div>

        {/* Atalhos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }}
          className="grid grid-cols-2 gap-3"
        >
          <button onClick={onVerCiclo} className={`${cardCls} text-left hover:bg-[#141414] active:scale-[0.97] transition-all duration-150 cursor-pointer`}>
            <div className="text-xl mb-1">📋</div>
            <div className="font-bold text-sm">Ciclo completo</div>
            <div className="text-xs text-[#666] mt-1">{CICLO_INFO.periodo} · 4 semanas</div>
          </button>
          <button onClick={onVerBiblioteca} className={`${cardCls} text-left hover:bg-[#141414] active:scale-[0.97] transition-all duration-150 cursor-pointer`}>
            <div className="text-xl mb-1">📚</div>
            <div className="font-bold text-sm">Biblioteca de WODs</div>
            <div className="text-xs text-[#666] mt-1">Referências salvas</div>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
