import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/shared/ui/PageHeader";
import { SEO } from "@/shared/ui/SEO";

interface Section {
  title: string;
  content: string;
}

export function TermsPage() {
  const { t, i18n } = useTranslation();
  const sections = t("legal.terms.sections", { returnObjects: true }) as Section[];

  return (
    <>
      <SEO
        title={t("legal.terms.seoTitle", "Terms of Use")}
        description={t("legal.terms.seoDescription", "OpenShikomori terms of use and open source license information.")}
        pathname="terms"
        lang={i18n.language}
      />
      <main className="w-full">
      <PageHeader
        eyebrow={t("legal.terms.eyebrow")}
        subtitle={t("legal.terms.lastUpdated")}
        title={t("legal.terms.title")}
      />

      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border lg:grid-cols-2">
          {/* Left: Intro statement */}
          <div className="bg-background px-6 py-16 sm:px-12 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Open Source
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Terms of Use
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                By using OpenShikomori, you agree to these terms. Our commitment is to keep this project open, accessible, and community-driven.
              </p>
            </motion.div>
          </div>

          {/* Right: Terms sections */}
          <div className="bg-background px-6 py-16 sm:px-12 lg:py-24">
            <div className="space-y-12">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 12 }}
                  transition={{
                    delay: 0.05 * index,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                >
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {section.title}
                  </h3>
                  <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
