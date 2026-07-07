# frontend/

Next.js (App Router, TypeScript) + Tailwind CSS v4 application. Serves the interactive documentary-style site; reads all its data from `../backend`'s API, never queries the database directly.

## Design system

- **Dark-first, editorial palette** — the site defaults to dark mode (the "documentary" reading experience the project is going for), with a full light-mode toggle for accessibility/preference (`components/theme-toggle.tsx`, powered by `next-themes`).
- **Typography**: [Fraunces](https://fonts.google.com/specimen/Fraunces) (a warm, editorial serif) for headlines, [Inter](https://fonts.google.com/specimen/Inter) for body/UI text. Both self-hosted via `next/font/google` — no external font requests at runtime.
- **Color tokens** live in `app/globals.css` as CSS custom properties (Tailwind v4's CSS-first `@theme` config, not a `tailwind.config.js`). Each city has its own accent hue (`accent-chicago`, `accent-nyc`, `accent-sf`) used consistently across every chart and map in later milestones.
- Dark mode is class-based (`@custom-variant dark (&:where(.dark, .dark *))`), toggled by `next-themes` setting a `.dark` class on `<html>` — not just `prefers-color-scheme` — so the toggle button actually works regardless of OS setting.

## Running locally

Requires the backend running (see `../backend/README.md`) — the homepage does a live server-side fetch to `/api/summary`.

```bash
cd frontend
npm install
cp .env.local.example .env.local   # adjust NEXT_PUBLIC_API_BASE_URL if needed
npm run dev
```

Visit `http://localhost:3000`.

## Structure

```
frontend/
├── app/
│   ├── layout.tsx       # fonts, ThemeProvider, header/footer shell
│   ├── page.tsx          # homepage: hero + scrollytelling intro (Milestone 5)
│   └── globals.css       # design tokens (Tailwind v4 @theme)
├── components/
│   ├── site-header.tsx, site-footer.tsx, theme-provider.tsx, theme-toggle.tsx
│   ├── sections/          # homepage narrative beats (hero, premise, stats, limits, continue)
│   └── ui/                # reusable primitives (reveal-on-scroll, animated count-up, ambient background)
└── lib/
    ├── api.ts            # typed fetch client for the backend
    └── types.ts          # mirrors backend/app/schemas.py
```

## Scrollytelling implementation notes (Milestone 5)

- **Narrative reveals** (`components/ui/reveal.tsx`) use Framer Motion's `whileInView` with `once: true` — simple, robust, and standard for this kind of site. No scroll-linked pinning/scrubbing for the narrative text; that's reserved for the hero's parallax fade only (`components/sections/hero-section.tsx`, via `useScroll`/`useTransform`).
- **Count-up numbers** (`components/ui/animated-number.tsx`) intentionally do **not** use Framer Motion's `animate()` + `useMotionValue` combo — an earlier version built that way silently never completed the animation on real (non-instant) scroll in testing, only appearing to work under artificial `scrollIntoView` jumps. Replaced with a plain `IntersectionObserver` + `requestAnimationFrame` tween, which is simple enough to fully reason about and was verified correct via a scripted Playwright scroll-through (dark mode, light mode, and mobile viewport) before considering this milestone done.
- All animated components respect `prefers-reduced-motion` (via Framer Motion's `useReducedMotion`), checked from the start rather than bolted on later — full accessibility audit is still Milestone 9.
- The ambient hero background (`components/ui/signal-field.tsx`) uses a seeded pseudo-random generator (not `Math.random()`) so server and client render the same dot layout — avoids a hydration mismatch.

## A note on Next.js 16

This project uses Next.js 16, which shipped after this assistant's training cutoff with real breaking changes (Turbopack on by default, fully-async `params`/`searchParams`, opt-in Cache Components/PPR). Before writing App Router code here, check `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` (bundled with the installed package) rather than assuming older Next.js conventions still apply.

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build + type check
npm run lint     # ESLint
```
