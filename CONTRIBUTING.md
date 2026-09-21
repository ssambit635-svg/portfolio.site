# Contributing

Thank you for looking at this repo. The bar here is small but specific:
**calm, monochrome, and interactive without being noisy.**

---

## Ground rules

1. **Copy lives in data.** Every word a visitor reads belongs in [`src/lib/site.ts`](src/lib/site.ts). Never hard-code text inside a component.
2. **No state per animation frame.** If it moves every frame, write to the DOM inside a rAF loop (`transform` / `opacity` only) — never `setState`. Look at `fx/Magnetic.tsx` or `fx/TiltCard.tsx` as the reference pattern.
3. **One pointer loop.** Read the shared smoothed pointer from [`src/lib/pointer.ts`](src/lib/pointer.ts) instead of adding another `pointermove` listener.
4. **Respect `prefers-reduced-motion`.** Every new animation needs a static path. `lib/motion.ts#prefersReducedMotion()` is the switch.
5. **Touch stays native.** Pointer theatres (custom cursor, hover previews, tilt) must be gated behind `hasFinePointer()`.
6. **No audio files.** Sound is synthesised in [`src/lib/audio.ts`](src/lib/audio.ts) and always opt-in through `SoundContext`.
7. **TypeScript is strict** (`noUnusedLocals`, `noUnusedParameters`). `npm run build` will not pass otherwise.

---

## Workflow

```bash
git clone https://github.com/ssambit635-svg/portfolio.site.git
cd portfolio.site
npm ci
npm run dev
```

Before opening a PR:

```bash
npm run typecheck   # strict TS
npm run smoke       # headless render of loader → gate → home
npm run build       # production build
```

Pull requests run all three automatically in CI (`.github/workflows/ci.yml`).

`npm run smoke` walks the real flow in jsdom — it clicks through the entry
gate and asserts that every section and every line of hero copy rendered. If
you rename a section, change the gate buttons or edit `home.headline`, update
`scripts/smoke.mjs` in the same commit.

---

## Where things are

| I want to…                                    | Touch this                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Change any text, project, certificate or link | `src/lib/site.ts`                                                                     |
| Redraw the signature / add a flourish         | `src/components/loader/signature.ts`                                                  |
| Retune the loader timing                      | `src/components/Loader.tsx` (`WRITE_SECONDS`, `START_DELAY`, `HOLD_AFTER_WRITE`)      |
| Change colours or gradients                   | `src/index.css` (tokens) and `src/components/fx/GradientField.tsx` (presets)          |
| Change the backdrop shader                    | `src/components/fx/WaveCanvas.tsx`                                                    |
| Add or change a sound                         | `src/lib/audio.ts`, then expose it in `src/context/SoundContext.tsx`                  |
| Add a section to the page                     | `src/components/HomePage.tsx` **and** the `SECTIONS` array (the rail is driven by it) |
| Change deploy behaviour                       | `.github/workflows/deploy.yml`                                                        |

---

## Pull requests

- Branch from `main`, keep the diff focused, one idea per PR.
- Describe what the change **feels** like, not only what it does — this is an interface repo.
- Include a before/after if you touched motion, colour or timing.
- Squash-merge is fine; the Pages deploy runs automatically on `main`.

---

## Design vocabulary

| Word       | Meaning here                                     |
| ---------- | ------------------------------------------------ |
| _ink_      | the dark background field                        |
| _paper_    | the light/cream theme                            |
| _maison_   | the champagne-gold accent family                 |
| _nib_      | the moving highlight that leads a drawing stroke |
| _hairline_ | a 1px rule, usually gradient-filled              |
| _sheen_    | the light bar that sweeps a finished surface     |

If a change needs a new word, add it to this table.

---

© 2026 Sambit Swain · MIT
