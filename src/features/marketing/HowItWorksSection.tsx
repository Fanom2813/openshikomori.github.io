import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Mic, Shield, Globe } from "lucide-react";

const steps = [
  { key: "record", icon: Mic },
  { key: "review", icon: Shield },
  { key: "release", icon: Globe },
];

export function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full border-b border-border bg-muted/20 px-6 py-16 sm:px-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          How it works
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Three simple steps
        </h2>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-px w-full -translate-x-0 border-t border-dashed border-border md:block" />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Number badge */}
                <div className="relative">
                  <span className="flex h-8 w-8 items-center justify-center border border-border bg-background text-sm font-bold text-primary">
                    0{index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="mt-6 flex h-16 w-16 items-center justify-center border border-border bg-background">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
                  {t(`howItWorks.${step.key}.title`)}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {t(`howItWorks.${step.key}.description`)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
