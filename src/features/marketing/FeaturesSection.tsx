import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Mic, Users, Database, Brain } from "lucide-react";

const features = [
  { key: "record", icon: Mic, size: "large" },
  { key: "community", icon: Users, size: "small" },
  { key: "dataset", icon: Database, size: "small" },
  { key: "ai", icon: Brain, size: "large" },
];

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full border-y border-border bg-background px-6 py-16 sm:px-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Why it matters
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Built by Comorians, for Comorians
        </h2>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isLarge = feature.size === "large";

          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`group border border-border bg-muted/20 p-6 transition-colors hover:bg-muted/30 ${
                isLarge ? "md:col-span-2 lg:row-span-2 lg:p-10" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center border border-border bg-background ${
                  isLarge ? "h-20 w-20" : "h-14 w-14"
                }`}
              >
                <Icon
                  className="text-primary"
                  strokeWidth={1.5}
                  size={isLarge ? 40 : 28}
                />
              </div>

              <p
                className={`mt-6 text-xs font-bold uppercase tracking-widest text-primary ${
                  isLarge ? "mt-10" : ""
                }`}
              >
                {t(`features.${feature.key}.eyebrow`)}
              </p>

              <h3
                className={`mt-3 font-semibold tracking-tight text-foreground ${
                  isLarge ? "text-2xl lg:text-3xl" : "text-lg"
                }`}
              >
                {t(`features.${feature.key}.title`)}
              </h3>

              <p
                className={`mt-3 leading-relaxed text-muted-foreground ${
                  isLarge ? "text-base max-w-sm" : "text-sm"
                }`}
              >
                {t(`features.${feature.key}.description`)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
