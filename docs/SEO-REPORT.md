# SEO implementation report

Current state of the site's search and crawl setup, and what was verified. Updated on the `arena/a9ca90a1-portfolio-site` branch.

## Scope

- **Stack:** React 19, TypeScript, Vite 7, Tailwind CSS 4, GSAP and Lenis.
- **Routing:** two static pages. The landing page (`/`, with section anchors) and `/dashboard/` for certificates and achievements. There is no client router and no project-detail, auth or API routes.
- **Hosting:** GitHub Pages. Production URL: **https://ssambit635-svg.github.io/portfolio.site/**. Override with `VITE_SITE_URL`, which must include any deployment subpath.
- **Crawl files** (`robots.txt`, `sitemap.xml`) are generated into `dist/` at build time by `scripts/prerender.mjs`. They are not kept as static files in `public/`.

## What is implemented

| Area | Implementation |
| --- | --- |
| Metadata | One React 19 component (`src/components/Seo.tsx`) renders title, description, author, language, robots, theme colour and optional Search Console verification, per page. Page definitions live in `src/lib/seo.ts`. |
| Canonical | Built from the configured production URL with a normalised trailing slash. The same canonical appears in the homepage HTML and in `index.html` responses. |
| Structured data | Person and WebSite JSON-LD, serialised safely into the initial HTML. Includes the publisher relationship and genuine public profile links. The dashboard adds a `CollectionPage` and `ItemList` graph. |
| Social sharing | Open Graph and Twitter/X tags with title, description, the current portrait (`public/sambit-swain.jpg`), descriptive alt text and dimensions. Large-image card. |
| Sitemap and robots | Generated on every build from the same canonical configuration. Lists the two real pages only. No fragments, no invented routes. |
| Crawlability | Both pages are prerendered. All projects, their descriptions, every certificate and every achievement are in the initial HTML. No hidden SEO copy. |
| Semantics | One H1 per page, project H3s, section H2s, footer landmark outside `<main>`, stable section and project IDs. |
| Dashboard | `/dashboard/` has its own title, description and canonical. Reached from the **All certificates & achievements** button in the Certified section. |
| Images | Descriptive alt text, explicit sizes, lazy loading and async decoding on below-the-fold images. |
| Accessibility | Skip link, visible focus styles, labelled controls, reduced-motion alternatives. Enforced by `npm run test:a11y` (axe-core, WCAG 2.x A/AA) on both pages at desktop and phone widths. |
| Performance | Latin-only local fonts. The menu and project images are not eagerly loaded. Canvas effects pause when offscreen or when reduced motion is requested. The macOS wallpaper is a 108 KB JPEG. |

Visible copy is based on the existing project and experience data in `src/lib/site.ts`. Nothing has been invented to strengthen the SEO. The resume button is withheld until a real `profile.resume` URL is set; it is currently a `#` placeholder.

## Validation actually run

| Check | Command | Result |
| --- | --- | --- |
| Type check (strict, `noUnusedLocals`) | `npm run typecheck` | Pass |
| Lint (ESLint, typescript-eslint, React hooks) | `npm run lint` | Pass |
| Formatting (stylesheets) | `npm run format:check` | Pass |
| Production build, prerender, crawl files | `npm run build` | Pass |
| SEO assertions | `npm run test:seo` | Pass: one H1 and title per page, static project and certificate content, anchor targets, metadata, canonical, JSON-LD, sitemap and robots |
| Voice assertions | `npm run test:voice` | Pass |
| Accessibility audit | `npm run test:a11y` | Pass on 4 page views, 0 violations |
| Browser QA on the built preview | headless Chromium, phone and desktop | No horizontal overflow, no console errors, all images load after scrolling, menu opens and closes with Escape |

Browser testing used a Chromium build available in this environment. It is not the same as a live deployment check.

## Not verified

- **Live deployment.** Nothing here has been deployed or checked against the live GitHub Pages site.
- **Search indexing.** No Search Console property, sitemap submission or indexing request has been made from this environment.
- **Performance scores.** Lighthouse and Core Web Vitals have not been measured, so no performance score is claimed.

## Manual follow-up

1. Merge the branch and let the Pages workflow deploy. The workflow runs the type check, lint, format check, build and accessibility audit before publishing.
2. Check the live site: the portrait, the works wheel on touch devices, certificate tiles on `/dashboard/`, anchors and external links.
3. Add a Search Console URL-prefix property for **https://ssambit635-svg.github.io/portfolio.site/**.
4. Set the GitHub Actions variable `VITE_GOOGLE_SITE_VERIFICATION` to the content value of Google's verification meta tag, then redeploy. Alternatively, use Google's verification-file method.
5. Submit **https://ssambit635-svg.github.io/portfolio.site/sitemap.xml** in Search Console.
6. Inspect the canonical homepage, run **Test live URL**, then **Request indexing**.
7. **Robots caveat.** Crawlers read `robots.txt` from the root of the origin, **https://ssambit635-svg.github.io/robots.txt**, not from the project subpath. The generated file at `/portfolio.site/robots.txt` is correct but cannot govern the origin by itself. Either publish matching rules in the root user-site repository, or serve the portfolio from a custom-domain root.
8. Link the exact portfolio URL from GitHub, LinkedIn and other profiles you own.
9. Supply a real `profile.resume` URL if you want a CV download. If the domain changes, set `VITE_SITE_URL`, update the repository identity links and rebuild.

These changes improve technical eligibility and make the site's identity clear to crawlers. They do not guarantee a ranking, an indexing timeline, rich results or AI citations.

## Where the changes live

Use the git history on `arena/a9ca90a1-portfolio-site` for the exact file-level record. This report no longer keeps a hand-maintained file list, because it went stale on every refactor.
