import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/shared/ui/PageHeader";
import { SEO } from "@/shared/ui/SEO";

interface Section {
  title: string;
  content: string;
}

export function PrivacyPage() {
  const { t, i18n } = useTranslation();
  const sections = t("legal.privacy.sections", { returnObjects: true }) as Section[];

  return (
    <>
      <SEO
        title={t("legal.privacy.seoTitle", "Privacy Policy")}
        description={t("legal.privacy.seoDescription", "OpenShikomori privacy policy. Learn how we protect your data and privacy.")}
        pathname="privacy"
        lang={i18n.language}
      />
      <main className="w-full">
      <PageHeader
        eyebrow={t("legal.privacy.eyebrow")}
        subtitle={t("legal.privacy.lastUpdated")}
        title={t("legal.privacy.title")}
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
                Your Data
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Privacy First
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                We collect minimal data and store nothing on our servers. Your privacy is built into the design, not an afterthought.
              </p>
            </motion.div>
          </div>

          {/* Right: Privacy sections */}
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
