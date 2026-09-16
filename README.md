# Sambit Swain — Portfolio

> A monochrome, minimal designer-developer portfolio. Dithered-wave WebGL backdrop, an entry gate with sound, a target cursor — and a CI/CD pipeline that ships every push straight to GitHub Pages.

## 🌐 Live

https://ssambit635-svg.github.io/portfolio.site/

---

## ✨ Experience

**One palette, one column, a lot of restraint.** Near-black and near-white, Geist type, whitespace as the layout. The wallpaper is a WebGL shader that quantizes drifting sine fields through an ordered-dither matrix, so the whole site sits on a retro dithered wave.

| Layer | Details |
| --- | --- |
| **Entry gate** | The name snaps between rack-focus frames over a beam-fan shader, then *Enter with / without sound* — sound effects are synthesized live with the Web Audio API, no audio files |
| **Backdrop** | Raw-WebGL fragment shader: layered sine field → Bayer-style ordered dithering → 3-step gray waves; a fan-of-beams variant powers the entry screen |
| **Navigation** | Four sections (`intro · work · credentials · connect`) tracked by a slim pill rail on the left edge, IntersectionObserver-driven |
| **Interaction** | Target cursor with corner brackets that frame interactive elements, click sparks, blur-fade section reveals, hover-invert buttons |
| **Theme** | Dark by default with a persisted light/dark toggle in the footer |

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
│   │   ├── EnterScreen.tsx        # sound gate + animated name
│   │   ├── HomePage.tsx           # intro / work / credentials / connect / footer
│   │   ├── PillNav.tsx            # left-edge section tracker
│   │   └── fx/                    # WaveCanvas (WebGL dither), FocusName,
│   │                              # TargetCursor, ClickSpark, BlurFade
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

React 19 · TypeScript · Vite · Tailwind CSS 4 · motion · lucide-react · raw WebGL shaders · Web Audio API

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`. A multi-stage `Dockerfile` (node build → nginx) is included for containers.

---

© 2026 Sambit Swain. Designed & built in Berhampur, Odisha.
