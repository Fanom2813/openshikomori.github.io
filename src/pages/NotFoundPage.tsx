import { motion } from "motion/react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Home, ArrowLeft, Search } from "lucide-react";
import { SEO } from "@/shared/ui/SEO";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title="404 - Page Not Found"
        description="The page you are looking for doesn't exist or has been moved."
      />
      <main className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-24 sm:px-12 lg:py-32">
        {/* Decorative background element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden whitespace-nowrap">
          <span className="text-[30vw] font-black uppercase tracking-tighter">LOST</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex max-w-2xl flex-col items-center text-center"
        >
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-muted/20">
            <Search className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">
            Error 404
          </p>
          
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {t("common:notFound.title", "Page Not Found")}
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {t("common:notFound.description", "The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.")}
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/"
              className="inline-flex h-14 items-center gap-3 border border-border bg-foreground px-8 text-xs font-black uppercase tracking-widest text-background transition-colors hover:bg-foreground/90"
            >
              <Home className="h-4 w-4" />
              {t("common:notFound.backHome", "Back to Home")}
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex h-14 items-center gap-3 border border-border bg-background px-8 text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common:notFound.goBack", "Go Back")}
            </button>
          </div>
        </motion.div>

        {/* Bottom grid pattern - matching site aesthetic */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      </main>
    </>
  );
}
