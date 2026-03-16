import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export function TrustSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full border-b border-border bg-muted/10 px-6 py-20 sm:px-12 lg:py-32" id="privacy-consent">
      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold uppercase tracking-widest text-primary"
        >
          {t("trust.eyebrow")}
        </motion.p>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <p className="text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("trust.manifesto")}
          </p>
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground"
        >
          {t("trust.description")}
        </motion.p>
      </div>
    </section>
  );
}
