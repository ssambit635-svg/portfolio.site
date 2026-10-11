# SEO implementation report

## Scope and discoveries

- Framework: React 19, TypeScript, Vite, Tailwind CSS; GSAP/Lenis effects.
- Routing: two static pages — the landing page (section anchors) and `/dashboard/` for certificates and achievements. No client router, no project-detail/auth/API routes.
- Hosting: GitHub Pages workflow; production URL **https://ssambit635-svg.github.io/portfolio.site/** confirmed in existing profile/package/crawl files.
- The homepage and social previews use the current real portrait at `public/sambit-swain.jpg`; the previous `public/portrait.png` asset has been removed. The existing header triangle mark supplies the favicon.
- Previously the initial HTML had an empty root and animated headings rendered no initial text. Project descriptions existed in data but were not displayed.

## Changes made

| Area | Implementation |
| --- | --- |
| Metadata | Central React 19 component: title, description, author, language, robots, theme color and optional Search Console verification. |
| Canonical | Configurable production URL, normalized trailing slash; identical canonical for homepage, index.html and tracking-query access. |
| Structured data | Safely serialized Person and WebSite graph, current portrait and genuine public profiles, publisher relationship. |
| Social sharing | Open Graph and Twitter/X title, description, current portrait, descriptive alt text, accurate image dimensions/type and large-image card. |
| Sitemap / robots | Generated from the same canonical configuration during every build. Both real pages only; no duplicate fragments or invented routes. |
| Crawlability / GEO | Both React pages prerendered at build time. All seven listed projects and their descriptions, plus every certificate and achievement, appear in the initial HTML; no hidden SEO copy. |
| Semantics | One meaningful H1, project H3s, About H2, footer landmark outside main, stable section/project IDs. |
| Certificates dashboard | Second prerendered page at `/dashboard/` with square certificate tiles, an achievements list, its own title/description/canonical and a `CollectionPage` + `ItemList` graph. Reached from the Learning section's "More certificates & achievements" button. |
| Motion | Scroll reveals, depth parallax and a pixel dissolve between blocks only. The four-second wordmark entry sequence, the glitch/scramble text effect, the marquee ticker, the halftone portrait, the slide-in menu and the UI/ambient audio have been removed; reduced-motion users get a still page. |
| Content / linking | Natural About identity, visible existing project descriptions, Home/About/Projects/Contact navigation, genuine external links. Placeholder resume button withheld until a valid URL is supplied. |
| Images | Descriptive preview/certificate alt text, sizing attributes, lazy loading and async decoding; accessible portrait canvas label. |
| Performance | Latin-only local fonts, no eager project-image loading, reused portrait canvas buffers, and paused canvas effects when offscreen or when reduced motion is requested. |
| Accessibility / mobile | Skip link, focus indicators, labelled controls, labelled project stacks and source links, reduced-motion alternatives, and responsive project cards and certificate tiles. |
| Documentation | Rewritten README with architecture, commands, configuration, deployment and indexing runbook. |

Project content remains based on existing repository descriptions. Shadow Quest is described as a focus/streak-based deep-work app; unverified RPG mechanics were not invented. Visible descriptions require additional card space, so the desktop project section gets an 880px minimum height to prevent clipping. Colors, typography, card imagery, scroll effects and other components remain in place.

## Validation actually completed

| Check | Result |
| --- | --- |
| Clean `npm ci` | Pass; installation audit reported 0 vulnerabilities at test time. |
| `npm run typecheck` | Pass. |
| Existing lint | No lint script/config exists. `npm run lint --if-present` is a no-op, not a lint pass. |
| `npm run build` | Pass, including prerender and automated SEO assertions. |
| `npm run test:seo` | Pass: one title/H1 per page, static project and certificate content, internal anchor targets, dashboard routing, metadata, canonical, JSON-LD, relative assets, sitemap and robots. |
| HTTP preview | Homepage, sitemap, robots and favicon return 200 with expected content types. |
| Query / index.html canonical | Both preview responses contain the same production homepage canonical. |
| JSON-LD | Present in initial HTML, parses as JSON, expected entity URLs and publisher reference asserted. |
| `git diff --check` | Pass. |
| Browser / mobile visual regression | Not completed: Playwright Chromium download failed with TLS/network ECONNRESET. Responsive code reviewed; visual/functionality verification still required. |
| Lighthouse / Core Web Vitals | Not measured; no performance score asserted. |
| Live production / Google indexing | Not validated or deployed from this session. Search Console remains an owner action. |

Local production preview is available on port 4173. Crawl files are generated into `dist/`, not maintained as stale copies in `public/`. Only source changes are tracked; build artifacts and temporary SSR bundles are not committed.

## Manual follow-up

1. Review and merge these changes for the existing Pages deployment. Current domain works without a new environment value.
2. Verify live content, mobile layout, scroll motion, portrait, the learning list, certificate tiles on `/dashboard/`, anchors and external links. Browser automation could not run in this environment.
3. Add a Search Console URL-prefix property for **https://ssambit635-svg.github.io/portfolio.site/**.
4. Set GitHub Actions repository variable `VITE_GOOGLE_SITE_VERIFICATION` to the content value of Google's verification meta tag; redeploy and verify. Alternatively use Google's verification-file method.
5. Submit **https://ssambit635-svg.github.io/portfolio.site/sitemap.xml** in Search Console.
6. Inspect the canonical homepage, run **Test live URL**, then **Request indexing**.
7. Important hosting caveat: crawlers consult **https://ssambit635-svg.github.io/robots.txt**, not the project-subpath file. Publish/merge the generated rules in the root user-site repository if you control it, or host the portfolio at a custom-domain root. Confirm existing root rules do not block `/portfolio.site/`. The project-level robots endpoint is generated and serves correctly, but cannot govern the origin by itself.
8. Link this exact portfolio URL from genuine GitHub, LinkedIn and other owned professional/hackathon profiles.
9. Supply a real `profile.resume` URL if you want a CV download. If the domain changes, set `VITE_SITE_URL`, update repository identity links and rebuild.

These changes improve technical eligibility and association with Sambit Swain. They cannot guarantee a #1 ranking, an indexing timeline, rich results or AI citations.

## Exact files created / modified / removed

`public/robots.txt` and `public/sitemap.xml` are removed as static sources; `scripts/prerender.mjs` now generates their deployment equivalents.

- `.env.example`
- `.github/workflows/deploy.yml`
- `README.md`
- `docs/SEO-REPORT.md`
- `index.html`
- `package.json`
- `public/favicon.svg`
- `public/robots.txt`
- `public/sitemap.xml`
- `scripts/prerender.mjs`
- `scripts/test-seo.mjs`
- `src/App.tsx`
- `src/components/Header.tsx`
- `src/components/Seo.tsx`
- `src/components/fx/Counter.tsx`
- `src/components/sections/Footer.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/Stats.tsx`
- `src/components/sections/Work.tsx`
- `src/components/sections/WorkedAt.tsx`
- `src/dashboard.tsx`
- `src/entry-dashboard.tsx`
- `src/entry-server.tsx`
- `src/pages/Dashboard.tsx`
- `src/index.css`
- `src/lib/seo.ts`
- `src/lib/site.ts`
- `src/main.tsx`
- `dashboard/index.html`

Removed in the same pass: `src/components/Preloader.tsx`, `src/components/VectorWordmark.tsx`,
`src/components/Menu.tsx`, `src/components/SideBadge.tsx`, `src/components/fx/Scramble.tsx`,
`src/components/fx/Halftone.tsx`, `src/components/fx/DotText.tsx`,
`src/components/sections/Manifesto.tsx`, `src/components/sections/Ticker.tsx`,
`src/components/sections/Path.tsx`, `src/components/sections/Stack.tsx`,
`src/hooks/useSound.tsx`, `src/lib/music.ts`, `src/lib/ready.ts`.
