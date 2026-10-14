<div align="center">

# Sambit Swain
### Software Developer · Web Development · Cloud Technology

A personal portfolio for the projects, experiments and hackathon builds I ship.
Editorial paper layout, a systems map of the work and a separate certificates dashboard—backed by crawlable HTML.

[**Explore the portfolio ↗**](https://ssambit635-svg.github.io/portfolio.site/) · [GitHub](https://github.com/ssambit635-svg) · [LinkedIn](https://www.linkedin.com/in/sambit-swain-7032a8378) · [Email](mailto:ssambit635@gmail.com)

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-b48cff)

</div>

---

## At a glance

- **Identity first:** Sambit Swain, a software developer and computer science student in Berhampur, India.
- **Eight projects, on a works wheel:** the index rests as a ring of covers around a title, the first scroll opens it into a drum and keeps turning until the last piece has passed the front. The same eight follow as a text index with their descriptions and genuine live/repository links.
- **Two pages:** the portfolio, plus `/dashboard` for square certificate tiles and achievements — opened from the "More certificates & achievements" button in the Learning section.
- **Calmer motion:** scroll reveals, depth parallax and a pixel dissolve between blocks. No glitch/scramble text, no blocking intro sequence, no audio.
- **Search-ready delivery:** both pages render real content into the initial HTML, with canonical metadata, social previews, JSON-LD and generated crawl files.
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
dashboard/
  index.html                 Certificates & achievements page (served at /dashboard/)
public/
  sambit-swain.jpg             Current portrait used by the hero and social previews
  favicon.svg                 Existing header mark adapted as a favicon
scripts/
  prerender.mjs               Build-time rendering of both pages + sitemap / robots generation
  test-seo.mjs                Production HTML and crawl-file assertions
src/
  assets/                    Project screenshots, certificate scans, AWS logo
  components/
    Seo.tsx                  Central React 19 metadata (per page)
    WorksWheel.tsx           The works index as a wheel you turn (see src/works-wheel.css)
    sections/                Hero, Systems, Work, About, Stats (Toolbox), WorkedAt (Learning)
    fx/                      Counter, pixel dissolve, skill logos
  pages/Dashboard.tsx        Certificates + achievements page
  hooks/                     Scrolling, reveal, clock, theme
  lib/site.ts                Profile, projects, experience, credentials, achievements
  lib/seo.ts                 Production URL, page metadata and Schema.org graphs
  lib/skills.ts              Skills and brand marks
  entry-server.tsx           Render the landing page at build time
  entry-dashboard.tsx        Render the dashboard at build time
  main.tsx                   Interactive client entry (landing page)
  dashboard.tsx              Interactive client entry (dashboard)
```

### Rendering and routing

There are **two real pages**, both plain files in the build — there is no client-side router:

| Page | File | Served at |
| --- | --- | --- |
| Portfolio | `dist/index.html` | `/` |
| Certificates & achievements | `dist/dashboard/index.html` | `/dashboard/` |

On the landing page, Home, Work, Systems, Toolbox, About, Learning and Contact are section links (`#top`, `#work`, `#systems`, `#toolbox`, `#about`, `#learning`, `#contact`). Project cards have stable `#project-…` anchors and link to their existing external destinations; there are no invented detail pages. The Learning section ends with a **More certificates & achievements** button that opens `/dashboard/`.

The build renders the actual React component tree into both HTML files. The client mounts the interactive version over that static content rather than hydrating it. With JavaScript disabled, a small fallback stylesheet keeps the static content readable. This is not a crawler-only or hidden-text version.

Vite has no built-in sitemap or metadata routing API. Metadata comes from React 19's native elements in one component (`pages` in `src/lib/seo.ts` holds each page's title, description and path); a small build script renders both pages and generates crawl files. Links between pages are relative (`dashboard/` and `../`), so both work unchanged under a GitHub Pages project subpath, a custom domain or a local preview. Temporary server output is removed after rendering—no Node server is deployed.

### Emo, the robot on the desk

The hero photo has a small desk robot standing left of the keyboard, and his eyes are
painted into `src/assets/hero-monitor.jpg`. He is given a live face without the photo
ever being retouched, and without anything laid over it:

- `scripts/emo-geometry.mjs` measures him — the cyan cores of both eyes (found as pixels
  in a band over his face, split at the emptiest column), how far each glow's foot
  reaches, how bright his glass is around each eye, and his eye colours at their hot
  centre, their body and their halo. It writes `src/lib/emoFace.ts` with every position
  in percentages of the photo, so the face rides the hero crop at any viewport instead
  of drifting off his head, and the travel limit that keeps an eye inside his display
  and never across into the other one.
- His face is **three blend layers per eye and no wrapper around them**. `darken` clips
  whatever is brighter than his glass back down to his glass — that erases the painted
  eyes and leaves the dark around them, and the reflection across the screen, exactly as
  it was. `screen` then adds a halo, and `screen` adds the eye itself, in the colours
  sampled from his own paint: light on glass, which is why it saturates over the
  reflection instead of smearing across it. There is no plate, no patch and no rectangle
  to colour-match, so there is no seam and no second display inside his head.
  The layers are siblings for a reason: a `transform`, `z-index`, `filter` or faded
  `opacity` on any ancestor turns it into a *blend container*, and the blending would
  happen against that element's empty contents instead of against the photograph. Head
  motion therefore reaches each layer as its own translation. `npm run test:seo` fails if
  the isolation creeps back in, or if the paint order stops being clips → halos → eyes.
- `src/hooks/useEmo.ts` watches the pointer, the keyboard under his nose, scroll
  velocity, copy and cut, window resizes, battery, connectivity, the first gesture's tilt
  ask (iOS only), and — while the visitor holds `Space` — the microphone. There are no
  visible controls: the mic opens on Space and closes when Space comes up (the OS record
  light goes out the moment they let go, and nothing is ever buffered, stored or sent),
  and `Escape` mutes him for the rest of the visit. Handlers only record what happened;
  one rAF loop paints ~11 custom properties straight onto the DOM, then stops when he
  settles, when the hero scrolls away, when the tab is hidden and when a narrow crop
  leaves him out of frame. While nobody is at the keyboard he wakes for a breath every
  few seconds, which is where blinking, the wandering gaze and the late-night sleep live.
- He speaks. Every line used to be a caption chip over the photograph; there is no chip
  now. Words go into a screen-reader live region and out through `speechSynthesis` (a
  small-cute pitch shift, two-note triangle-wave throat-clear from an oscillator, no
  audio asset), and only fall back to visible text when the browser has no speech engine
  or the visitor muted him. That way a muted or engine-less browser still gets the joke,
  and a normal browser gets just a robot on a desk — not UI pasted on a still life.
- `src/emo.css` turns those properties into blinks, squints, dilations and a dozen
  moods — all of them brightness, size and colour, because a face that is a display does
  not have eyelids. Tap him four times inside a second and the moods stop being polite:
  his eyes squeeze shut inward (`pain`) and the flinch runs through the same lean and
  wobble numbers while he says **that hurts** out loud. `prefers-reduced-motion` keeps his face and drops the twitching.

Nothing is measured by eye and nothing is trusted to stay true: `npm run build` ends by
re-measuring the photo (`emo-geometry.mjs --check`), so re-cropping the hero either moves
his eyes or breaks the build — never misaligns them quietly.

## Customize content

| Change | Edit |
| --- | --- |
| Name, contact, social profiles, project descriptions | `src/lib/site.ts` |
| Skills / technologies | `src/lib/skills.ts` |
| Portrait | `public/sambit-swain.jpg` |
| Screenshots / certificate scans | `src/assets/projects/`, `src/assets/certs/` |
| Certificates and achievements (dashboard) | `credentials` / `achievements` in `src/lib/site.ts` |
| Metadata and social image tags | `src/components/Seo.tsx` |
| Page paths, titles and structured data | `pages` in `src/lib/seo.ts` |
| Color tokens, fonts and label styles | `src/index.css` |
| Certificates & achievements page | `src/pages/Dashboard.tsx` |

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
- Open Graph and Twitter/X previews use Sambit’s actual 1087 × 1446 portrait, shared with the interactive halftone hero.
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
- Keyboard-only navigation, the learning-list buttons, anchors and resume if configured.
- Both pages — `/` and `/dashboard/` — and the link between them.
- Scroll reveals, parallax and the pixel dissolve between blocks, including with reduced motion enabled.
- Certificate tiles on the dashboard, including a credential whose scan has not been uploaded yet.
- JavaScript-disabled content and a slow mobile connection.
- PageSpeed Insights / Lighthouse on the deployed URL; field Core Web Vitals require real traffic.

See [SEO implementation report](docs/SEO-REPORT.md) for checks actually completed and remaining limitations. No performance score or ranking outcome is asserted without measurement.

## License

Code is licensed under the [MIT License](LICENSE). Personal identity, photographs, certificates and third-party brand marks remain associated with their respective owners; replace personal assets when adapting the code for yourself.
