import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

// Placeholder contributors - replace with real data later
// Types: voice (recorded audio), transcribe (transcribed audio), review (validated audio), code (technical)
const contributors = [
  { id: 1, name: "Amina", role: "Voice contributor", type: "voice", size: "large" },
  { id: 2, name: "Omar", role: "Developer", type: "code", size: "medium" },
  { id: 3, name: "Fatima", role: "Transcriber", type: "transcribe", size: "medium" },
  { id: 4, name: "Ali", role: "Voice contributor", type: "voice", size: "small" },
  { id: 5, name: "Hassan", role: "Reviewer", type: "review", size: "small" },
  { id: 6, name: "Mariam", role: "Transcriber", type: "transcribe", size: "small" },
  { id: 7, name: "Said", role: "Voice contributor", type: "voice", size: "small" },
  { id: 8, name: "You?", role: "Join us", type: "join", size: "medium" },
];

const typeStyles = {
  voice: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
  transcribe: "bg-amber-500/10 border-amber-500/30 text-amber-600",
  review: "bg-blue-500/10 border-blue-500/30 text-blue-600",
  code: "bg-violet-500/10 border-violet-500/30 text-violet-600",
  join: "bg-primary/10 border-primary",
};

// Fixed positions for each avatar (percent-based)
const positions = [
  { x: 15, y: 20 },
  { x: 45, y: 15 },
  { x: 75, y: 25 },
  { x: 25, y: 55 },
  { x: 60, y: 50 },
  { x: 85, y: 60 },
  { x: 40, y: 80 },
  { x: 70, y: 85 },
];

const sizeClasses = {
  large: "h-20 w-20 sm:h-24 sm:w-24",
  medium: "h-14 w-14 sm:h-16 sm:w-16",
  small: "h-10 w-10 sm:h-12 sm:w-12",
};

export function ContributorsSection() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full overflow-hidden border-b border-border bg-background px-6 py-20 sm:px-12 lg:py-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {t("contributors.eyebrow")}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("contributors.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          {t("contributors.description")}
        </p>
      </motion.div>

      {/* Constellation Cloud */}
      <div className="relative mx-auto aspect-[16/9] max-w-5xl">
        {contributors.map((contributor, index) => {
          const pos = positions[index];
          const isYou = contributor.name === "You?";

          return (
            <motion.div
              key={contributor.id}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              {/* Floating animation */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.1, zIndex: 50 }}
                className="group relative cursor-pointer"
              >
                {/* Avatar */}
                <div
                  className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl ${sizeClasses[contributor.size as keyof typeof sizeClasses]} ${typeStyles[contributor.type as keyof typeof typeStyles]}`}
                >
                  {isYou ? (
                    <span className="text-lg font-bold text-primary transition-transform group-hover:scale-110">+</span>
                  ) : (
                    <span className="text-sm font-bold">
                      {contributor.name.charAt(0)}
                    </span>
                  )}

                  {/* Type indicator dot */}
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background sm:h-4 sm:w-4 ${
                    contributor.type === "voice" ? "bg-emerald-500" :
                    contributor.type === "transcribe" ? "bg-amber-500" :
                    contributor.type === "review" ? "bg-blue-500" :
                    contributor.type === "code" ? "bg-violet-500" :
                    "bg-primary"
                  }`} />
                </div>

                {/* Name + Role tooltip - positioned above */}
                <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap opacity-0 transition-all duration-200 group-hover:opacity-100">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="rounded bg-foreground px-3 py-1.5 text-sm font-semibold text-background">
                      {contributor.name}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {contributor.role}
                    </span>
                  </div>
                  {/* Arrow */}
                  <div className="mx-auto mt-1 h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
                </div>

                {/* Connecting lines (subtle) */}
                {index < contributors.length - 1 && (
                  <svg
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-full w-full"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${index * 45}deg)`,
                    }}
                  >
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`${positions[(index + 1) % positions.length].x - pos.x + 50}%`}
                      y2={`${positions[(index + 1) % positions.length].y - pos.y + 50}%`}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-border opacity-30"
                    />
                  </svg>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
