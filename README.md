# Sambit Swain — Portfolio

Personal portfolio, currently being rebuilt from scratch with a new design.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · GSAP · Lenis

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build
```

Deploys to GitHub Pages automatically on every push to `main` (`.github/workflows/deploy.yml`).
All site copy lives in `src/lib/site.ts`.

### What's on the page

- **Preloader** — `src/components/Preloader.tsx`. 0→100 counter that tracks real font/image
  loading, then a pixel-block dissolve hands the page over. Mount-time animations wait for it
  via `src/lib/ready.ts`.
- **Background music** — `src/lib/music.ts`. A generative lo-fi track (pads, arp, kick, hats,
  sub bass, vinyl bed) synthesised live with WebAudio at 68bpm — no audio file, no licensing.
  Toggled in the header, remembered in `localStorage`, paused when the tab is hidden. It starts
  on the visitor's first interaction (browser autoplay rules).
- **Skills** — `src/lib/skills.ts`. Every skill in the repo with its **real** brand mark from
  Simple Icons (bundled locally, works offline). AWS is vendored at `src/assets/logos/aws.svg`
  (dropped from recent Simple Icons releases). Tools with no icon-set entry pull their real
  favicon from their own domain; `cryptography` falls back to a typographic wordmark.
- **Scramble** — `src/components/fx/Scramble.tsx`. Chunky decode: per-character flip clocks
  (~40–110ms, never per-frame), randomised settle order with a pre-roll of pure garbage, and
  width-locked character slots so nothing reflows.
