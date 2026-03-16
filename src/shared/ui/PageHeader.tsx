import { motion } from "motion/react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="relative z-10 w-full px-6 py-24 sm:px-12 sm:py-28 lg:px-16 lg:py-32">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
