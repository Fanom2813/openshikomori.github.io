import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Target, Users, Globe, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SEO } from "@/shared/ui/SEO";

export function AboutPage() {
  const { t, i18n } = useTranslation();

  const values = [
    {
      icon: Target,
      title: t("about.values.purpose.title"),
      description: t("about.values.purpose.description"),
    },
    {
      icon: Users,
      title: t("about.values.community.title"),
      description: t("about.values.community.description"),
    },
    {
      icon: Globe,
      title: t("about.values.language.title"),
      description: t("about.values.language.description"),
    },
    {
      icon: Shield,
      title: t("about.values.privacy.title"),
      description: t("about.values.privacy.description"),
    },
  ];

  return (
    <>
      <SEO
        title={t("about.seoTitle", "About")}
        description={t("about.seoDescription", "Learn about OpenShikomori's mission to preserve the Shikomori language through open-source AI.")}
        pathname="about"
        lang={i18n.language}
      />
      <main className="w-full">
      <PageHeader
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        subtitle={t("about.subtitle")}
      />

      {/* Mission Section */}
      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border lg:grid-cols-2">
          <div className="bg-background px-6 py-16 sm:px-12 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {t("about.mission.eyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {t("about.mission.title")}
              </h2>
            </motion.div>
          </div>
          <div className="bg-background px-6 py-16 sm:px-12 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <p className="text-base leading-relaxed text-muted-foreground">
                {t("about.mission.paragraph1")}
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t("about.mission.paragraph2")}
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t("about.mission.paragraph3")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full border-b border-border px-6 py-16 sm:px-12 lg:py-24">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {t("about.values.eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("about.values.title")}
          </h2>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full rounded-none border-0 bg-background shadow-none">
                <CardHeader className="pb-3">
                  <value.icon className="mb-3 h-6 w-6 text-primary" />
                  <CardTitle className="text-lg tracking-tight">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section className="w-full px-6 py-16 sm:px-12 lg:py-24">
        <div className="grid gap-px bg-border lg:grid-cols-2">
          <div className="bg-background px-6 py-12 sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("about.join.title")}
            </h2>
          </div>
          <div className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12">
            <p className="mb-6 text-muted-foreground">{t("about.join.description")}</p>
            <a
              href="https://github.com/Open-Shikomori"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-fit items-center border border-border bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {t("about.join.cta")}
            </a>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
