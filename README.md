# Sambit Swain — Portfolio

> A monochrome, minimal designer-developer portfolio. Dithered-wave WebGL backdrop, an entry gate with sound, a target cursor — and a CI/CD pipeline that ships every push straight to GitHub Pages.

## 🌐 Live

https://ssambit635-svg.github.io/portfolio.site/

---

## ✨ Experience

**One palette, one column, a lot of restraint.** Near-black and near-white, Geist type, whitespace as the layout. The wallpaper is a WebGL shader that quantizes drifting sine fields through an ordered-dither matrix, so the whole site sits on a retro dithered wave.

| Layer | Details |
| --- | --- |
| **Signature loader** | "Sambit Swain" writes itself in hand-built monoline cursive SVG strokes — Apple-style penmanship — then the curtain lifts (once per session) |
| **Entry gate** | The name snaps between rack-focus frames over a beam-fan shader, then *Enter with / without sound* — sound effects are synthesized live with the Web Audio API, no audio files |
| **Backdrop** | Raw-WebGL fragment shader: layered sine field → Bayer-style ordered dithering → 3-step gray waves, tinted by three slow-drifting aurora blobs (Gemini-style glow) with a soft vignette |
| **Navigation** | Four sections (`intro · work · credentials · connect`) tracked by a slim pill rail on the left edge, IntersectionObserver-driven |
| **Interaction** | Target cursor with corner brackets that frame interactive elements, click sparks, cursor-following image previews on every project and certificate, hover-invert buttons |
| **Motion** | Lenis buttery smooth scrolling with custom easing, blur-fade section reveals on the way in |
| **Theme** | Dark by default with a persisted dark/cream toggle in the footer (light mode is warm paper, not plain white) |

Motion is opt-out friendly: `prefers-reduced-motion` freezes the shader loop, the custom cursor only exists on fine pointers, and touch devices keep the native cursor.

---

## 🗂 Structure

```
portfolio.site/
├── .github/workflows/deploy.yml   # typecheck → build → deploy to Pages
├── public/                        # robots.txt, sitemap.xml
├── scripts/
│   └── smoke.mjs                  # headless render check (jsdom + esbuild)
├── src/
│   ├── components/
│   │   ├── Loader.tsx             # handwritten signature intro
│   │   ├── EnterScreen.tsx        # sound gate + animated name
│   │   ├── HomePage.tsx           # intro / work / credentials / connect / footer
│   │   ├── PillNav.tsx            # left-edge section tracker
│   │   └── fx/                    # WaveCanvas (WebGL dither + aurora), FocusName,
│   │                              # TargetCursor, ClickSpark, BlurFade, HoverPreview
│   ├── providers/SmoothScroll.tsx # Lenis buttery scrolling
│   ├── context/SoundContext.tsx   # global sound toggle + click hook
│   ├── lib/
│   │   ├── site.ts                # every word of copy lives here
│   │   ├── theme.ts               # dark-first theme hook
│   │   ├── audio.ts               # synthesized click / glitch SFX
│   │   └── utils.ts
│   └── assets/certs/              # certificate scans
├── Dockerfile · nginx.conf
└── index.html
```

---

## 🚀 Commands

```bash
npm ci            # install
npm run dev       # dev server
npm run build     # typecheck + production build
npm run preview   # serve the production build locally
npm run typecheck # tsc --noEmit
npm run smoke     # headless render check
```

## 🛠 Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Lenis · motion · lucide-react · raw WebGL shaders · Web Audio API

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`. A multi-stage `Dockerfile` (node build → nginx) is included for containers.

---

© 2026 Sambit Swain. Designed & built in Berhampur, Odisha.
