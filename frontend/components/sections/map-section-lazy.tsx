"use client";

// next/dynamic's `ssr: false` is only allowed inside a Client Component -- this thin
// wrapper exists so app/page.tsx (a Server Component) can still just import a plain
// component, without itself needing to become a Client Component. See map-section.tsx
// for why this is dynamically imported at all (maplibre-gl is ~1.1MB minified).
import dynamic from "next/dynamic";

const MapSection = dynamic(() => import("./map-section").then((m) => m.MapSection), {
  ssr: false,
  loading: () => <div style={{ height: "300vh" }} className="bg-background" />,
});

export default MapSection;
