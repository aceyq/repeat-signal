import { LoadingScreen } from "@/components/ui/loading-screen";

// Next.js's file-based convention: automatically wraps app/page.tsx's async
// Server Component in a Suspense boundary, shown while its data fetches are in
// flight. See components/ui/loading-screen.tsx for why this matters here
// specifically (the free-tier backend's cold-start delay after Milestone 10).
export default function Loading() {
  return <LoadingScreen />;
}
