import { motion } from "motion/react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router";
import { useTranslation } from "react-i18next";
import { Home, AlertCircle, RefreshCcw } from "lucide-react";
import { SEO } from "@/shared/ui/SEO";

export function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();

  let title = t("common:error.title", "Unexpected Error");
  let description = t("common:error.description", "Something went wrong while loading this page. Please try refreshing or return home.");
  let code = "500";

  if (isRouteErrorResponse(error)) {
    code = error.status.toString();
    if (error.status === 404) {
      title = t("common:notFound.title", "Page Not Found");
      description = t("common:notFound.description", "The page you are looking for doesn't exist or has been moved.");
    } else {
      title = error.statusText || title;
    }
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <>
      <SEO 
        title={`${code} - Error`}
        description="An unexpected error occurred."
      />
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24 sm:px-12">
        {/* Decorative background element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden whitespace-nowrap">
          <span className="text-[30vw] font-black uppercase tracking-tighter">ERROR</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex max-w-2xl flex-col items-center text-center"
        >
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive" strokeWidth={1.5} />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-destructive">
            System Error {code}
          </p>
          
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {description}
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
              onClick={() => window.location.reload()}
              className="inline-flex h-14 items-center gap-3 border border-border bg-background px-8 text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              <RefreshCcw className="h-4 w-4" />
              {t("common:error.refresh", "Try Again")}
            </button>
          </div>

          {import.meta.env.DEV && error instanceof Error && (
            <div className="mt-12 w-full text-left overflow-hidden">
              <p className="text-xs font-mono text-muted-foreground bg-muted p-4 rounded overflow-auto max-h-40">
                {error.stack}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
