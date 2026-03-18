import { Outlet } from "react-router";

import { ScrollToTop } from "@/app/ScrollToTop";
import { Nav } from "@/shared/ui/Nav";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { ContributionProvider, useContribution, EntryChoiceModal, ProfileSetupModal } from "@/features/contribution";
import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "@/features/contribution/services/supabase";

function ContributionModals() {
  const {
    isEntryModalOpen,
    isProfileModalOpen,
    closeEntryModal,
    closeProfileModal,
    handleEmailAuth,
    handleAnonymousAuth,
    handleProfileSetup,
    isAuthLoading,
    isProfileSubmitting,
    authError,
  } = useContribution();

  return (
    <>
      <EntryChoiceModal
        isOpen={isEntryModalOpen}
        onClose={closeEntryModal}
        onEmailAuth={handleEmailAuth}
        onAnonymousAuth={handleAnonymousAuth}
        isLoading={isAuthLoading}
        error={authError}
      />

      <ProfileSetupModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        onSubmit={handleProfileSetup}
        isSubmitting={isProfileSubmitting}
      />
    </>
  );
}

function SupabaseWarning() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="text-center max-w-md bg-card border border-border p-8 rounded-xl shadow-2xl">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">System Not Configured</h1>
        <p className="text-muted-foreground">Supabase environment variables are missing.</p>
      </div>
    </div>
  );
}

export function PublicLayout() {
  return (
    <ContributionProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <ScrollToTop />
        <Nav />

        {/* Spacer for fixed header */}
        <div className="h-16" />

        <Outlet />

        <SiteFooter />
        <ContributionModals />
        <SupabaseWarning />
      </div>
    </ContributionProvider>
  );
}
