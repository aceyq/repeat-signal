import { api } from "@/lib/api";
import { HeroSection } from "@/components/sections/hero-section";
import { PremiseSection } from "@/components/sections/premise-section";
import { StatsSection } from "@/components/sections/stats-section";
import { LimitsSection } from "@/components/sections/limits-section";
import { MapSection } from "@/components/sections/map-section";
import { ContinueSection } from "@/components/sections/continue-section";

export default async function Home() {
  const summary = await api.getSummary();

  return (
    <>
      <HeroSection />
      <PremiseSection />
      <StatsSection summary={summary} />
      <LimitsSection />
      <MapSection />
      <ContinueSection />
    </>
  );
}
