import { Outlet } from "react-router";

import { ScrollToTop } from "@/app/ScrollToTop";
import { Nav } from "@/shared/ui/Nav";
import { SiteFooter } from "@/shared/ui/SiteFooter";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <ScrollToTop />
      <Nav />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <Outlet />

      <SiteFooter />
    </div>
  );
}
