import { CTASection } from "@/features/marketing/CTASection";
import { ContributorsSection } from "@/features/marketing/ContributorsSection";
import { FeaturesSection } from "@/features/marketing/FeaturesSection";
import { HeroSection } from "@/features/marketing/HeroSection";
import { MarqueeSection } from "@/features/marketing/MarqueeSection";
import { ProgressSection } from "@/features/marketing/ProgressSection";
import { TrustSection } from "@/features/marketing/TrustSection";
import { SEO } from "@/shared/ui/SEO";

export function HomePage() {
  return (
    <>
      <SEO />
      <HeroSection />
      <MarqueeSection />
      <FeaturesSection />
      <ProgressSection />
      <TrustSection />
      <ContributorsSection />
      <CTASection />
    </>
  );
}
