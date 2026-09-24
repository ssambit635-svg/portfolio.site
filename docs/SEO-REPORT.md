# SEO implementation report

## Scope and discoveries

- Framework: React 19, TypeScript, Vite, Tailwind CSS; GSAP/Lenis effects.
- Routing: one homepage with section anchors, no project-detail/auth/API/dashboard routes.
- Hosting: GitHub Pages workflow; production URL **https://ssambit635-svg.github.io/portfolio.site/** confirmed in existing profile/package/crawl files.
- Existing public portrait reused. No favicon existed; the existing header triangle mark now supplies the favicon.
- Previously the initial HTML had an empty root and animated headings rendered no initial text. Project descriptions existed in data but were not displayed.

## Changes made

| Area | Implementation |
| --- | --- |
| Metadata | Central React 19 component: title, description, author, language, robots, theme color and optional Search Console verification. |
| Canonical | Configurable production URL, normalized trailing slash; identical canonical for homepage, index.html and tracking-query access. |
| Structured data | Safely serialized Person and WebSite graph, existing portrait and genuine public profiles, publisher relationship. |
| Social sharing | Open Graph and Twitter/X title, description, existing portrait, alt text; OG image dimensions/type. |
| Sitemap / robots | Generated from the same canonical configuration during every build. Homepage only; no duplicate fragments or invented routes. |
| Crawlability / GEO | Actual React page prerendered at build time. All eight project cards and descriptions appear in initial HTML; no hidden SEO copy. |
| Semantics | One meaningful H1, project H3s, About H2, footer landmark outside main, stable section/project IDs. |
| Content / linking | Natural About identity, visible existing project descriptions, Home/About/Projects/Contact navigation, genuine external links. Placeholder resume button withheld until a valid URL is supplied. |
| Images | Descriptive preview/certificate alt text, sizing attributes, lazy loading and async decoding; accessible portrait canvas label. |
| Performance | Latin-only local fonts, removed eager project-image loading from preloader, reused portrait canvas buffer. Existing effects retained. |
| Accessibility / mobile | Skip link, focus indicators, 44px header button minimum, labelled toggles, menu expanded state, inert closed menu, keyboard focus trap/return, scrollable menu, removed desktop zig-zag margins on mobile cards. |
| Documentation | Rewritten README with architecture, commands, configuration, deployment and indexing runbook. |

Project content remains based on existing repository descriptions. Shadow Quest is described as a focus/streak-based deep-work app; unverified RPG mechanics were not invented. Visible descriptions require additional card space, so the desktop project section gets an 880px minimum height to prevent clipping. Colors, typography, card imagery, scroll effects and other components remain in place.

## Validation actually completed

| Check | Result |
| --- | --- |
| Clean `npm ci` | Pass; installation audit reported 0 vulnerabilities at test time. |
| `npm run typecheck` | Pass. |
| Existing lint | No lint script/config exists. `npm run lint --if-present` is a no-op, not a lint pass. |
| `npm run build` | Pass, including prerender and automated SEO assertions. |
| `npm run test:seo` | Pass: one title/H1, static project content, internal anchor targets, metadata, canonical, JSON-LD, assets, sitemap and robots. |
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
2. Verify live content, mobile layout, animations, portrait, music/SFX controls, menu keyboard behavior, certificate selection, anchors and external links. Browser automation could not run in this environment.
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
- `src/components/Menu.tsx`
- `src/components/Preloader.tsx`
- `src/components/Seo.tsx`
- `src/components/fx/Counter.tsx`
- `src/components/fx/Halftone.tsx`
- `src/components/fx/Scramble.tsx`
- `src/components/sections/Footer.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/Manifesto.tsx`
- `src/components/sections/Work.tsx`
- `src/components/sections/WorkedAt.tsx`
- `src/entry-server.tsx`
- `src/index.css`
- `src/lib/seo.ts`
- `src/lib/site.ts`
- `src/main.tsx`
