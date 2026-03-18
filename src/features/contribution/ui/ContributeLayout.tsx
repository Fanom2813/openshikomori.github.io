import { Outlet, Link, useLocation } from "react-router";
import { ArrowLeft, Mic2, LayoutDashboard, BarChart3 } from "lucide-react";
import { ContributionProvider } from "../context/ContributionContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function ContributeLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const isStats = location.pathname.includes('/stats');

  return (
    <ContributionProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Simplified header for contribution interface */}
        <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline">Back to OpenShikomori</span>
                <span className="md:hidden">Back</span>
              </Link>

              {/* Main Navigation */}
              <nav className="flex items-center gap-1">
                <Link
                  to="/contribute"
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors border-b-2",
                    !isStats
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t('contribution.tabs.work', { defaultValue: 'Contribute' })}</span>
                </Link>
                <Link
                  to="/contribute/stats"
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors border-b-2",
                    isStats
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>{t('contribution.tabs.stats')}</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold hidden sm:inline">Portal</span>
            </div>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-14" />

        <main className="min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </ContributionProvider>
  );
}
