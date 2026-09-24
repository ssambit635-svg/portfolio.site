<div align="center">

# Sambit Swain
### Software Developer · Web Development · Cloud Technology

A personal portfolio for the projects, experiments and hackathon builds I ship.
Built with expressive typography, a live halftone portrait and motion—backed by crawlable HTML.

[**Explore the portfolio ↗**](https://ssambit635-svg.github.io/portfolio.site/) · [GitHub](https://github.com/ssambit635-svg) · [LinkedIn](https://www.linkedin.com/in/sambit-swain-7032a8378) · [Email](mailto:ssambit635@gmail.com)

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-b48cff)

</div>

---

## At a glance

- **Identity first:** Sambit Swain, a software developer and computer science student in Berhampur, India.
- **Eight projects:** product previews, visible descriptions and genuine live/repository links.
- **Distinctive interaction:** GSAP scroll motion, Lenis scrolling, decode-text effects, a pixel preloader and pointer-reactive portrait.
- **Audio controls:** optional UI sounds and a browser-generated ambient soundtrack; preferences are remembered locally.
- **Search-ready delivery:** real page content in the initial HTML, canonical metadata, social previews, JSON-LD and generated crawl files.
- **No runtime backend:** production output is static and deploys to GitHub Pages.

## Selected work

| Project | What it does |
| --- | --- |
| [kivo](https://kivo-api-qzqc.onrender.com/) | Digitizes lab reports with user verification, health trends and a doctor-visit summary. |
| [Shadow Quest](https://shadowquest.onrender.com/) | A samurai-themed deep-work application with focus techniques, an ensō timer and goal streaks. |
| [Annadata Connect](https://ssambit635-svg-annadata-connect.onrender.com/) | A farmer procurement platform with queue tokens, procurement-centre comparisons and officer/authority views. |
| [CivicReport](https://ssambit635-svg.github.io/Civic-report/) | Classifies photographed civic issues, places them on a map and tracks resolution. |
| [Weather Sense](https://weather-sense-pbwmsehcq8etxhy7vufp6i.streamlit.app/) | Weather forecasts, air quality and practical lifestyle scores. |

The website also features AWS Dashboard, Password Manager and this portfolio. Descriptions come from the existing project data; external demos have independent hosting and availability.

## Run locally

**Requirements:** Node.js 22 recommended (the package supports Node 20+; use a Vite-compatible release), npm and Git.

```bash
git clone https://github.com/ssambit635-svg/portfolio.site.git
cd portfolio.site
npm ci
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite development server; React 19 renders metadata in development. |
| `npm run typecheck` | Strict TypeScript checks. |
| `npm run build` | Type-check, bundle, prerender HTML, generate crawl files and run SEO assertions. |
| `npm run test:seo` | Check the existing `dist/` output; build first. |
| `npm run preview -- --host 0.0.0.0` | Serve the actual production output locally. |

There is **no lint script/configuration** in this repository. Type checking and SEO assertions are not a substitute for a dedicated linter.

## Architecture

**React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · GSAP · Lenis · Fontsource · Simple Icons**

```text
.github/workflows/deploy.yml   GitHub Pages build and deployment
public/
  portrait.png                Existing portrait / social sharing image
  favicon.svg                 Existing header mark adapted as a favicon
scripts/
  prerender.mjs               Build-time rendering + sitemap / robots generation
  test-seo.mjs                Production HTML and crawl-file assertions
src/
  assets/                    Project screenshots, certificates, AWS logo
  components/
    Seo.tsx                  Central React 19 metadata
    sections/                Hero, About, skills, projects, learning, contact
    fx/                      Animation / canvas effects
  hooks/                     Scrolling, reveal, clock, audio, theme
  lib/site.ts                Profile, descriptions, experience, external links
  lib/seo.ts                 Production URL and Schema.org identity graph
  lib/skills.ts              Skills and brand marks
  entry-server.tsx           Render the same React page at build time
  main.tsx                   Interactive client entry
```

### Rendering and routing

This is **one public page**, not a multi-route application. Home, About, Projects and Contact are section links (`#top`, `#about`, `#work`, `#contact`). Project cards have stable `#project-…` anchors and link to their existing external destinations; there are no invented detail pages.

The build renders the actual React component tree into `dist/index.html`. The client mounts the interactive version over that static content rather than hydrating it, preserving the existing preloader and stateful effects. With JavaScript disabled, a small fallback stylesheet keeps the static content readable. This is not a crawler-only or hidden-text version.

Vite has no built-in sitemap or metadata routing API. Metadata uses React 19's native elements in one component; a small build script generates crawl files. Temporary server output is removed after rendering—no Node server is deployed.

## Customize content

| Change | Edit |
| --- | --- |
| Name, contact, social profiles, project descriptions | `src/lib/site.ts` |
| Skills / technologies | `src/lib/skills.ts` |
| Portrait | `public/portrait.png` |
| Screenshots / certificates | `src/assets/projects/`, `src/assets/certs/` |
| Metadata and social image tags | `src/components/Seo.tsx` |
| Canonical and structured data | `src/lib/seo.ts` |
| Color tokens and fonts | `src/index.css` |

The resume is currently `#` in profile data, so the nonfunctional download button is not shown. Set `profile.resume` to a genuine public resume URL to enable it. Do not add placeholder professional profiles or unsupported project features.

## Production URL and verification

The existing production URL is:

**https://ssambit635-svg.github.io/portfolio.site/**

It is already configured in project data/package metadata; no domain setup is needed for the current deployment. To override it:

```bash
cp .env.example .env.local
# Edit VITE_SITE_URL and, optionally, VITE_GOOGLE_SITE_VERIFICATION
npm run build
```

- `VITE_SITE_URL`: full absolute URL including the deployment subpath, if any. The build normalizes the trailing slash and rejects queries/fragments/credentials.
- `VITE_GOOGLE_SITE_VERIFICATION`: optional **content value only** from Google's HTML verification tag.
- Both values are public build-time settings, not secrets. Changing them requires rebuilding.
- On GitHub Actions, set them under **Settings → Secrets and variables → Actions → Variables**. The workflow reads these repository variables; empty values retain the configured default URL / omit verification.
- If changing domains, also update the README links, `package.json` homepage and `profile.site` to keep the repository's identity consistent. Configure DNS/Pages separately; an environment variable does not create a domain.

Relative asset paths preserve GitHub Pages subpath support. Canonicals and structured-data URLs are absolute. Tracking queries and `/index.html` point back to the single canonical homepage; canonical tags are signals, not HTTP redirects. Host-level redirects for alternate domains/paths must be configured on the host if needed.

## SEO and generative-search readiness

- One meaningful H1, descriptive H2/H3 sections and readable project descriptions.
- Title and natural description associated with **Sambit Swain**.
- Canonical URL, author, language, robots directive and theme color.
- Open Graph and Twitter/X metadata using the existing 720 × 1024 portrait, not a fabricated preview image.
- Safely serialized `Person` and `WebSite` JSON-LD with genuine linked profiles and a publisher relationship.
- Sitemap includes only the canonical homepage: fragments, APIs, fake routes and external demos do not belong in it.
- Static HTML lets search engines and AI retrieval tools read the same information visitors see.
- Lazy project/certificate images, reserved image boxes, Latin-only self-hosted fonts and no eager preloading of below-the-fold project screenshots.
- Existing header branding reused for the favicon; keyboard focus styles, skip link, labelled controls and focus-managed navigation.

These improve machine understanding and retrieval eligibility. They do **not** guarantee Google ranking, rich results or inclusion/citation in an AI answer. No fake backlinks, ratings, organizations or keyword stuffing are used. There is no speculative `llms.txt` dependency; crawlable source content is the foundation here.

### Important: GitHub Pages and robots.txt

The production build publishes:

- `https://ssambit635-svg.github.io/portfolio.site/sitemap.xml`
- `https://ssambit635-svg.github.io/portfolio.site/robots.txt`

**Crawlers only consult robots.txt at the origin root:**
`https://ssambit635-svg.github.io/robots.txt`.

A project-site repository cannot control that root URL. To advertise the sitemap through robots on this host, publish the following in the root user-site repository (`ssambit635-svg.github.io`), merging with any existing rules rather than overwriting them blindly:

```text
User-agent: *
Allow: /

Sitemap: https://ssambit635-svg.github.io/portfolio.site/sitemap.xml
```

Alternatively, use a custom domain serving this portfolio at its root. A missing root robots.txt does not inherently block indexing; submit the sitemap directly in Search Console and ensure any existing origin-root rules do not disallow this portfolio. The generated project-level file alone is not sufficient to control origin crawling.

## Deploy

1. Push/merge reviewed changes into `main`.
2. In **Repository Settings → Pages**, choose **GitHub Actions** as the source.
3. The existing workflow installs dependencies, type-checks, builds and deploys `dist/`.
4. Check the Pages deployment result and test the live homepage and assets.

The workflow deploys on pushes to `main` and supports manual dispatch. The development preview host is not the canonical production domain. Do not change production metadata to a temporary sandbox URL.

## Google Search Console: after deployment

1. Add a **URL-prefix property** for `https://ssambit635-svg.github.io/portfolio.site/`. A shared `github.io` hostname is not a domain you can DNS-verify yourself.
2. Verify ownership via the HTML meta tag: copy only the `content` value into the repository variable `VITE_GOOGLE_SITE_VERIFICATION`, redeploy, then select **Verify**. Google's HTML-file upload method is another option if you prefer.
3. Open **Sitemaps** and submit `https://ssambit635-svg.github.io/portfolio.site/sitemap.xml`.
4. Use **URL inspection** on the canonical homepage. Run **Test live URL**, inspect crawl availability and rendered content, then **Request indexing**.
5. Check the origin-root robots rules as described above. Validate JSON-LD with Schema.org Validator; generic Person/WebSite markup does not necessarily qualify for a Google rich result.
6. Add this exact portfolio URL to your genuine GitHub profile, LinkedIn website field, Hashnode and any professional/hackathon profiles you actually own.
7. Monitor indexing, Google-selected canonical and searches for your name over time. Keep project content accurate and maintained.

## Release checks

```bash
npm ci
npm run typecheck
npm run build
npm run preview
```

Before promoting a deployment, test:

- Homepage, metadata, social preview image, `/sitemap.xml` and `/robots.txt` over HTTP.
- Mobile widths (320, 375, 390, 768 px), project-card text, menu scrolling and footer wrapping.
- Keyboard-only navigation, menu open/close/Escape, focus return, anchors and resume if configured.
- Preloader, portrait, scroll animations, audio toggles, certificate selection and external links.
- JavaScript-disabled content and a slow mobile connection.
- PageSpeed Insights / Lighthouse on the deployed URL; field Core Web Vitals require real traffic.

See [SEO implementation report](docs/SEO-REPORT.md) for checks actually completed and remaining limitations. No performance score or ranking outcome is asserted without measurement.

## License

Code is licensed under the [MIT License](LICENSE). Personal identity, photographs, certificates and third-party brand marks remain associated with their respective owners; replace personal assets when adapting the code for yourself.
