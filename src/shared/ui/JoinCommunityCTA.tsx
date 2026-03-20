import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useContribution } from "@/features/contribution";

export function JoinCommunityCTA() {
  const { t } = useTranslation();
  const { openContributionModal } = useContribution();

  return (
    <section className="w-full border-t border-border bg-background py-24 sm:py-32 px-6 sm:px-12">
      <div className="lg:flex lg:items-center lg:justify-between gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-none mb-8 text-foreground">
            {t("about.join.title")}
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
            {t("about.join.description")}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 lg:mt-0 shrink-0"
        >
          <button
            onClick={openContributionModal}
            className="inline-flex h-20 items-center border-2 border-foreground bg-foreground px-12 text-sm font-black uppercase tracking-widest text-background transition-all hover:bg-primary hover:border-primary hover:text-white group cursor-pointer"
          >
            {t("about.join.cta")}
            <span className="ml-3 transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
