// Variants de entrada em cascata (fade + slide-up com delay incremental),
// mesma técnica já validada em Home.tsx, generalizada pro resto do app.
// Uso: <motion.div custom={i} variants={fadeUpVariants} initial="hidden" animate="show">

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" },
  }),
};
