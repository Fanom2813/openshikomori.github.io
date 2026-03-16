import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="w-full border-t border-border bg-background px-6 py-20 sm:px-12 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl text-center"
      >
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {t("cta.title")}
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
          {t("cta.description")}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="https://github.com/Open-Shikomori"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90"
          >
            {t("cta.github")}
            <ArrowUpRight className="h-4 w-4" />
          </a>

          <a
            href="#"
            className="inline-flex items-center gap-2 border border-border bg-background px-8 py-4 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
          >
            {t("cta.getStarted")}
          </a>
        </div>
      </motion.div>
    </section>
  );
}
