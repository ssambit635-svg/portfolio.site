<div align="center">

<img src="docs/logo.svg" width="112" height="112" alt="Sambit Swain logo" />

# Sambit Swain

**Cloud & full-stack developer · Computer Science, NIST University**

A personal portfolio: a dark editorial landing page, a certificates dashboard, a one-page printable CV, and three small features built on top of it.

[**Live site ↗**](https://ssambit635-svg.github.io/portfolio.site/) · [GitHub](https://github.com/ssambit635-svg) · [LinkedIn](https://www.linkedin.com/in/sambit-swain-7032a8378) · [Email](mailto:ssambit635@gmail.com)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=nodedotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-00f083)

</div>

---

## Contents

- [What it is](#what-it-is)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Project layout](#project-layout)
- [Editing content](#editing-content)
- [Quality gates](#quality-gates)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [License](#license)

## What it is

| Page | Route | What it does |
| --- | --- | --- |
| Portfolio | `/` | Hero with a live desktop, a works wheel of projects, certifications, Ask Emo, skills, about and contact. |
| Certificates | `/dashboard/` | Certificates and achievements as tiles, opened from the Certified section. |
| CV | `/cv/` | A one-page A4 CV. Prints, or saves as a single PDF page. |

Features:

- **Ask Emo.** A text panel that answers questions about projects, skills, certificates and contact. It runs fully in the browser from the site's own data. There is no model and no paid API.
- **Live status dots.** Each live project shows whether it is up, slow, asleep on free hosting, down or unreachable, as of the last build. A scheduled deploy refreshes it daily.
- **Skills.** Technologies in use, grouped into Build and Cloud & DevOps. Each is a 3D button: press one to ask Ask Emo which projects use it.
- **Static output.** Every page is pre-rendered HTML with real content, metadata and JSON-LD. There is no runtime backend.

## Quick start

Requires **Node.js 20+** and npm.

```bash
git clone https://github.com/ssambit635-svg/portfolio.site.git
cd portfolio.site
npm ci
npm run dev
```

Then open the URL Vite prints. To serve the production build locally:

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server. Creates the status snapshot if it is missing. |
| `npm run build` | Refresh status, type-check, bundle, pre-render every page, generate crawl files, then run the SEO, feature and voice tests. |
| `npm run typecheck` | Strict TypeScript check. |
| `npm run lint` | ESLint (typescript-eslint and React hooks rules). |
| `npm run format:css` / `format:check` | Prettier for the stylesheets. |
| `npm run uptime` | Check every live project now and rewrite `src/generated/uptime.json`. |
| `npm run test` | SEO, feature and voice tests on their own. Run `build` first. |
| `npm run test:a11y` | axe-core (WCAG 2.x A/AA) on `/`, `/dashboard/` and `/cv/` at desktop and phone widths, and a one-page A4 check of the CV. Needs Chromium: set `CHROME_PATH`, or run `npx playwright install chromium`. |

## Project layout

```text
index.html                     Landing page entry
dashboard/index.html           Certificates entry (served at /dashboard/)
cv/index.html                  CV entry (served at /cv/)
public/                        Favicon, portrait, static files copied as-is
docs/                          Logo and the SEO report
scripts/
  prerender.mjs                Build-time HTML for every page, sitemap, robots.txt
  check-uptime.mjs             Checks live projects, writes src/generated/uptime.json
  test-seo.mjs                 Output, metadata and crawl-file assertions
  test-features.mjs            Ask Emo answers and technology matching
  test-voice.mjs               Emo's voice, against a mock browser
  test-a11y.mjs                Accessibility audit and CV print check
src/
  App.tsx                      Landing page composition
  components/                  Hero, works wheel, Ask Emo, skills, menu, laptop and desktop
  pages/                       Certificates dashboard and CV
  lib/
    site.ts                    Profile, projects, credentials, achievements (the content)
    ask.ts                     Ask Emo: matches a question against the site's facts
    stack.ts                   Technology matching used by Ask Emo and the CV
    seo.ts                     Metadata, page list and structured data
  features.css, skills.css, cv.css, index.css   Styles
  assets/                      Screenshots, certificate scans, wallpapers, skill logos
```

Stack: **React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · GSAP · Lenis**.

## Editing content

Most changes never touch a component.

| To change | Edit |
| --- | --- |
| Name, contact, social profiles, projects | `src/lib/site.ts` |
| Certificates and achievements | `credentials` and `achievements` in `src/lib/site.ts` |
| Technologies shown in Ask Emo and the CV | `stack` on each project in `src/lib/site.ts` |
| Skills buttons and their groups | `src/components/SkillsButtons.tsx` |
| Ask Emo wording and matching | `src/lib/ask.ts` |
| CV layout | `src/pages/Cv.tsx`, `src/cv.css` |
| Colours, type and label styles | `src/index.css` |
| How a status is judged (slow, asleep, down) | `scripts/lib/uptime-status.mjs` |
| Page titles, paths and structured data | `pages` in `src/lib/seo.ts` |
| Portrait | `public/sambit-swain.jpg` |

## Quality gates

CI runs these on every push to `main` and on a daily schedule:

1. `npm ci`
2. Lint, format check and type check
3. Build, including the pre-render and the SEO, feature and voice tests
4. Accessibility audit with Chromium, including the one-page CV check
5. Deploy `dist/` to GitHub Pages

Run them locally with `npm run lint && npm run format:check && npm run typecheck && npm run build && npm run test:a11y`.

## Deployment

The workflow in `.github/workflows/deploy.yml` deploys to GitHub Pages.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Branch mode serves the raw source, which will not render.

If the live site shows GitHub's "There isn't a GitHub Pages site here" page, Pages is not enabled. Enable it as above, then re-run **Actions → Deploy Portfolio**. The workflow cannot enable Pages with its own token.

To check Pages from the API: `GET /repos/{owner}/{repo}/pages` returns `200` when it is configured and `404` when it is not.

## Configuration

Both values are optional and public. Set them in `.env.local` locally, or as repository variables for CI.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Absolute production URL, including any subpath. Defaults to the GitHub Pages URL above. |
| `VITE_GOOGLE_SITE_VERIFICATION` | The `content` value of Google's HTML verification tag. Omit it if you do not use Search Console. |

Crawlers only read `robots.txt` from the origin root. On a project site such as this one, add the sitemap line to the root user-site repository, or serve the portfolio from a custom domain at the root.

## License

Code is released under the [MIT License](LICENSE). Personal photographs, certificates and third-party brand marks belong to their owners. Replace them before reusing this code for yourself.
