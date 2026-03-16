import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Database, Mic, FileAudio, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SEO } from "@/shared/ui/SEO";

export function DatasetPage() {
  const { t, i18n } = useTranslation();

  const stats = [
    {
      icon: Mic,
      value: "1,247",
      label: t("dataset.stats.speakers"),
      description: t("dataset.stats.speakersDesc"),
    },
    {
      icon: FileAudio,
      value: "8,532",
      label: t("dataset.stats.clips"),
      description: t("dataset.stats.clipsDesc"),
    },
    {
      icon: Database,
      value: "142h",
      label: t("dataset.stats.hours"),
      description: t("dataset.stats.hoursDesc"),
    },
    {
      icon: Users,
      value: "3",
      label: t("dataset.stats.languages"),
      description: t("dataset.stats.languagesDesc"),
    },
  ];

  const datasets = [
    {
      name: t("dataset.datasets.commonvoice.name"),
      description: t("dataset.datasets.commonvoice.description"),
      size: "124 GB",
      updated: "2025-03-01",
      downloadUrl: "#",
    },
    {
      name: t("dataset.datasets.validated.name"),
      description: t("dataset.datasets.validated.description"),
      size: "89 GB",
      updated: "2025-03-10",
      downloadUrl: "#",
    },
    {
      name: t("dataset.datasets.processed.name"),
      description: t("dataset.datasets.processed.description"),
      size: "45 GB",
      updated: "2025-03-12",
      downloadUrl: "#",
    },
  ];

  return (
    <>
      <SEO
        title={t("dataset.seoTitle", "Dataset")}
        description={t("dataset.seoDescription", "Download the OpenShikomori speech dataset. Free, open-source audio data for Shikomori language AI research.")}
        pathname="dataset"
        lang={i18n.language}
      />
      <main className="w-full">
      <PageHeader
        eyebrow={t("dataset.eyebrow")}
        title={t("dataset.title")}
        subtitle={t("dataset.subtitle")}
      />

      {/* Stats Grid */}
      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-background px-6 py-12 sm:px-12 lg:py-16"
            >
              <stat.icon className="mb-4 h-8 w-8 text-primary" />
              <p className="mb-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-xs text-muted-foreground/70">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Progress Section */}
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
                Progress
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {t("dataset.progress.title")}
              </h2>
            </motion.div>
          </div>
          <div className="bg-background px-6 py-16 sm:px-12 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8"
            >
              {["comorian", "french", "arabic"].map((lang) => (
                <div key={lang}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {t(`dataset.progress.${lang}`)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t(`dataset.progress.${lang}Hours`)}
                    </span>
                  </div>
                  <Progress
                    value={lang === "comorian" ? 65 : lang === "french" ? 42 : 28}
                    className="h-2"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Datasets */}
      <section className="w-full border-b border-border px-6 py-16 sm:px-12 lg:py-24">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Downloads
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("dataset.datasets.title")}
          </h2>
        </div>
        <div className="space-y-4">
          {datasets.map((dataset, index) => (
            <motion.div
              key={dataset.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg tracking-tight">{dataset.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{dataset.description}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {dataset.size}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t("dataset.datasets.updated")}: {dataset.updated}
                    </span>
                    <button className="inline-flex h-9 items-center border border-border bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90">
                      {t("dataset.datasets.download")}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="w-full px-6 py-16 sm:px-12 lg:py-24">
        <div className="grid gap-px bg-border lg:grid-cols-2">
          <div className="bg-background px-6 py-12 sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("dataset.contribute.title")}
            </h2>
          </div>
          <div className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12">
            <p className="mb-6 text-muted-foreground">{t("dataset.contribute.description")}</p>
            <a
              href="https://github.com/Open-Shikomori"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-fit items-center border border-border bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {t("dataset.contribute.cta")}
            </a>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
