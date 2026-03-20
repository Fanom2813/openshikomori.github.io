import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Target, Users, Globe, Shield } from "lucide-react";

import { PageHeader } from "@/shared/ui/PageHeader";
import { SEO } from "@/shared/ui/SEO";
import { JoinCommunityCTA } from "@/shared/ui/JoinCommunityCTA";

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

      {/* Story Section */}
      <section className="w-full border-b border-border bg-muted/30">
        <div className="w-full px-6 py-20 sm:px-12 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {t("about.story.eyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("about.story.title")}
            </h2>
          </motion.div>

          <div className="space-y-12 relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border hidden md:block" />
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative md:pl-12"
            >
              <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary hidden md:block" />
              <p className="text-lg leading-relaxed text-muted-foreground italic">
                {t("about.story.paragraph1")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative md:pl-12"
            >
              <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary hidden md:block" />
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.story.paragraph2")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative md:pl-12"
            >
              <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary hidden md:block" />
              <p className="text-lg leading-relaxed font-semibold text-foreground">
                {t("about.story.paragraph3")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full border-b border-border">
        <div className="px-6 py-16 sm:px-12 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {t("about.values.eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("about.values.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-border">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border-b md:border-r border-border p-10 sm:p-12 lg:p-16 bg-background hover:bg-muted/30 transition-colors"
            >
              <value.icon className="mb-8 h-10 w-10 text-primary" />
              <h3 className="text-2xl font-bold tracking-tight mb-4">{value.title}</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hall of Fame Section */}
      <section className="w-full px-6 py-20 sm:px-12 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {t("about.hallOfFame.eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("about.hallOfFame.title")}
          </h2>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Founders */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 border border-border bg-muted/20 relative group hover:border-primary/50 transition-colors"
            >
              <div className="absolute -top-3 left-6 px-3 bg-primary text-[10px] font-black uppercase tracking-widest text-white">
                Founding Visionary
              </div>
              <div className="flex flex-col md:flex-row md:items-start gap-6 pt-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden border-2 border-primary/20 mt-1">
                  <img 
                    src="/images/hall-of-fame/nayali.jpg" 
                    alt="NaYaLi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerText = '✨👸';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{t("about.hallOfFame.founders.madam.name")}</h3>
                  <p className="text-sm font-black text-primary uppercase tracking-widest mb-4">{t("about.hallOfFame.founders.madam.role")}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("about.hallOfFame.founders.madam.description")}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 border border-border bg-muted/20 relative group hover:border-foreground/50 transition-colors"
            >
              <div className="absolute -top-3 left-6 px-3 bg-foreground text-[10px] font-black uppercase tracking-widest text-background">
                Co-Founder
              </div>
              <div className="flex flex-col md:flex-row md:items-start gap-6 pt-4">
                <div className="h-20 w-20 rounded-full bg-foreground/5 flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden border-2 border-foreground/10 mt-1">
                  <img 
                    src="/images/hall-of-fame/omar.jpg" 
                    alt="Omar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerText = '👨‍💻';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{t("about.hallOfFame.founders.omar.name")}</h3>
                  <p className="text-sm font-black text-primary uppercase tracking-widest mb-4">{t("about.hallOfFame.founders.omar.role")}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("about.hallOfFame.founders.omar.description")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Next Leads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 border border-dashed border-border flex flex-col justify-center items-center text-center bg-muted/5"
          >
            <div className="h-16 w-16 rounded-full border border-dashed border-border flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t("about.hallOfFame.leads.title")}</h3>
            <p className="text-muted-foreground max-w-sm">
              {t("about.hallOfFame.leads.description")}
            </p>
          </motion.div>
        </div>
      </section>

      <JoinCommunityCTA />
    </main>
    </>
  );
}
