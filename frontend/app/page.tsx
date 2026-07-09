import { api } from "@/lib/api";
import { IntroOverlay } from "@/components/ui/intro-overlay";
import { HeroSection } from "@/components/sections/hero-section";
import { PremiseSection } from "@/components/sections/premise-section";
import { StatsSection } from "@/components/sections/stats-section";
import { LimitsSection } from "@/components/sections/limits-section";
import MapSection from "@/components/sections/map-section-lazy";
import { TrendsSection } from "@/components/sections/trends-section";
import { CaseStudiesSection } from "@/components/sections/case-studies-section";
import { ContinueSection } from "@/components/sections/continue-section";

export default async function Home() {
  const [summary, monthlyTrends, categoryTrends] = await Promise.all([
    api.getSummary(),
    api.getMonthlyTrends(),
    api.getCategoryTrends(),
  ]);

  return (
    <>
      <IntroOverlay />
      <HeroSection />
      <PremiseSection />
      <StatsSection summary={summary} />
      <LimitsSection />
      <MapSection />
      <TrendsSection
        monthlyTrends={monthlyTrends}
        categoryTrends={categoryTrends}
        cityTotals={summary.cities}
      />
      <CaseStudiesSection />
      <ContinueSection />
    </>
  );
}
