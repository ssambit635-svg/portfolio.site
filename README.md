<div align="center">

# Sambit Swain
### Cloud & Full-stack Developer

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

- **Identity first:** Sambit Swain, a computer science student and cloud & full-stack developer in Berhampur, India.
- **Eight projects, on a works wheel:** the index rests as a ring of covers around a title, the first scroll opens it into a drum and keeps turning until the last piece has passed the front. The same eight follow as a text index with their descriptions and genuine live/repository links.
- **Two pages:** the portfolio, plus `/dashboard` for square certificate tiles and achievements — opened from the "More certificates & achievements" button in the Learning section.
- **Calmer motion:** scroll reveals, depth parallax and a pixel dissolve between blocks. No glitch/scramble text, and no audio anywhere except the robot in the hero, who speaks only after you have touched something.
- **A shutter, not a splash:** the site opens behind four vertical panels that lift off it from the bottom up, with a line of type arriving one blurred letter at a time. It is the loading sequence in `Recording 2026-10-16 194802.mp4`, rebuilt in code rather than filmed — so it is sharp at any resolution, readable by a screen reader, and weighs nothing.
- **A menu in two faces:** on a desk the sections are a cluster of orbs that unroll out of a single handle; on a phone the same list drops into the panel of one button.
- **Search-ready delivery:** both pages render real content into the initial HTML, with canonical metadata, social previews, JSON-LD and generated crawl files.
- **No runtime backend:** production output is static and deploys to GitHub Pages.

## Selected work

| Project | What it does |
| --- | --- |
| [kivo](https://kivo-api-qzqc.onrender.com/) | Digitizes lab reports with user verification, health trends and a doctor-visit summary. |
| [Shadow Quest](https://shadowquest.onrender.com/) | A samurai-themed deep-work application with focus techniques, an ensō timer and goal streaks. |
| [Annadata Connect](https://ssambit635-svg-annadata-connect.onrender.com/) | A farmer procurement platform with queue tokens, procurement-centre comparisons and officer/authority views. |
| [CivicReport](https://ssambit635-svg.github.io/Civic-report/) | Classifies photographed civic issues, places them on a map and tracks resolution. |
| [Weather Sense](https://weather-sense-kutb55y3djjhmcbymj6wjh.streamlit.app/) | Weather forecasts, air quality and practical lifestyle scores. |

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
| `npm run build` | Type-check, bundle, prerender HTML, generate crawl files, then run the SEO and voice assertions. |
| `npm run test` | Run the SEO and voice assertions on their own. |
| `npm run test:seo` | Check the existing `dist/` output; build first. |
| `npm run test:voice` | Check Emo's voice against a mock browser that behaves like a real one. |
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

### The shutter (the preloader)

`Recording 2026-10-16 194802.mp4` is a screen recording of a loading sequence: a
black screen, a grid of hairline seams, a line of type that arrives one blurred
letter at a time, and then four vertical panels that lift off the page from the
bottom up, half a second apart, until the site is standing there in the open.
That sequence is the site's preloader — rebuilt, not filmed, in
`src/components/Preloader.tsx` and `src/preloader.css`.

Rebuilt, because a screen recording of a preloader is a poor preloader:

- It is 1180 × 606 of h264 with the window chrome baked in — soft on a retina
  screen, blocky on a 4K one, and there is no resolution that is right.
- The type inside it is a photograph of type. It cannot be selected, it cannot be
  read by a screen reader, and it cannot be translated.
- It costs a download before the site can be looked at.

In the rebuild every edge is a real edge. The seams are one device pixel, the
letters are the site's own Inter, and the panels are the page itself: they are
shutters over the live document, not a picture of one, so what slides away at
the end is exactly what was underneath — no cut, no second hero, no download.
The timings are the recording's own: 42 ms a letter, four panels 500 ms apart,
each lifting over 300 ms.

Two rules keep it honest:

- **Nothing starts until the hero photograph and the fonts are in.** A shutter
  that lifts onto an empty hero is worse than no shutter at all. A 1.2 s safety
  timer releases it anyway, so a font that never arrives cannot hold the page
  hostage.
- **A visitor who has asked for less motion gets no shutter at all.**
  `prefers-reduced-motion: reduce` skips the preloader entirely, and the
  prerendered HTML hides it when JavaScript is off.

The one deliberate change is the order. The recording's caption arrives *after*
the panels have lifted, because there it labels content that is already on
screen. A loader has to run the other way round — the caption first, then the
panels uncovering what it was talking about — or the page would have to be
shown and then hidden again, which is a flash, not a loader.

`docs/preloader-recording-vs-replica.png` puts the two side by side, frame for
frame: the recording on the left, the rebuild on the right.

### The scene fills the page

The hero is one photograph of a desk, and it is the first thing on the page, so it
has to reach the edges of the screen. A letterbox around it — a band of black
above the monitor and another below the desk — turns a photograph into a picture
in a frame, and the frame is the thing the eye notices first.

- The scene is sized from the photo's own ratio (`--hero-ar`, 1376 / 768) and always
  covers its section: on a wide desktop it is scaled past the viewport and bleeds
  off the sides; on a landscape phone the height is the viewport's, so the crop
  falls on the sides instead and there is no bar above or below; on a portrait
  phone the section is exactly as tall as the strip above the scene plus the
  scene itself, so the desk ends where the section ends.
- The one place the scene does not fill the width is a landscape phone with spare
  width to spare, where the extra is left dark rather than chopping the top and
  bottom off the monitor.
- The name (`Sambit · Swain`) is anchored to the hero rather than to the photo, so
  it stays above the fold whichever way the scene is cropped, and it lands on the
  dark ceiling the photograph has along its top edge.
- **The glass bends, the type does not.** The monitor's display is a curved panel
  and the clip-path in `src/index.css` draws it that way, but the headline is set
  flat. Every word used to be rotated about its own centre and scaled up toward
  the ends of the line, which bowed the headline into a fisheye and made the last
  words of each line visibly larger than the first — on the one line the site is
  read for, that reads as a mistake rather than as a screen.
- **The display is a surface, not a window.** The headline sits on an opaque
  panel, because a panel you can see the room through is a panel that shows the
  room's light: the photograph's own green edge was coming through as a band
  down each side of the screen, with a hard line where the panel's edge cut
  across it. The panel now covers the whole glass, its outline is the display's
  real outline measured off the photograph, and its outermost hair is the colour
  of the monitor's frame so that where it overlaps the frame there is no edge to
  see. What is left is a matte OLED: deep, even black with one broad sheen
  across it and no banding anywhere.

### The menu

The navigation used to be a column of text in the corner on a desk and a
full-screen sheet on a phone. It is now one component with two faces:

- `src/components/Menu.tsx` holds the menu itself: `Menu` (a dropdown with a
  trigger and a chevron), `MenuItem` (one line of it — a button, or a link when
  it has an `href`) and `MenuContainer` (a cluster of orbs, the first one a
  handle and the rest unrolling out of it).
- On a desk the sections are the orbs in the top-left corner: one handle, and
  the five pages unroll downwards out of it, each labelled on hover.
- On a phone the orbs are gone — a fan of orbs over a small screen is a guess,
  not a menu — and the same sections drop into the panel of a single **Menu**
  button in the top-right, with the ways to write to the author under them.
- The panel is dark glass over the photograph, the orbs are the same glass, and
  the accent is the site's own green.
- The keyboard path works: Tab reaches the handle, Enter opens it, the orbs
  come next in the order they are drawn, and Escape closes the panel and hands
  the focus back to the button that opened it. Choosing an item closes the
  menu, a click outside closes it, and the page behind a phone's panel is held
  still while it is open.

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
- **Petting, like the desk pet he descends from.** The real robot ships a touch sensor
  on his head; here the sensor is the pointer. A hand that keeps stroking the top of
  his head — the top of his tap box, because his face is not a petting zone — leaves
  pet heat behind, and the loop turns it into `purr`: eyes melted into two contented
  arcs, the head leaned toward the hand and lifted into it, a slow brightness pulse on
  the lids at his rumble's rate, and, once the page has a real gesture behind it like
  everything else he voices, an oscillator purr (a 44 Hz sawtooth, low-passed and
  chopped by a 21 Hz LFO). The first stroke of a session gets a line that cycles
  (`hehe`, `oh that is the spot`, …); petting him out of his sleep gets a grumpy
  *five more minutes…*; petting past seven seconds gets `grumpy` and a six-second
  sulk; a hand that leaves after a good session gets a small happy afterglow.
- He speaks, in a voice of his own. Every line used to be a caption chip over the
  photograph; there is no chip now. Words go into a screen-reader live region and out
  through a small formant-babble synthesiser (`src/lib/emoVoice.ts`, WebAudio, no audio
  asset): each word becomes syllables and each syllable a sawtooth blip at a pentatonic
  note of his base pitch, shaped by three band-pass formants from a vowel table — wa-we-oo,
  not beep-beep — with a noise-burst consonant attack, a glide into every note and a
  little vibrato; questions climb at the end and statements fall. The same sentence always
  sounds the same, because its vowels and notes come from a hash of its words. The
  operating system's speech engine is deliberately not used: a calm adult OS voice was
  never him, and in embedded previews and stripped-down browsers it is switched off
  entirely — which is exactly how he once went mute mid-visit and had to caption himself.
  Visible text returns whenever sound cannot: on a device with no WebAudio at all, when
  the visitor hushed him with Escape, and until the first line has actually reached a
  speaker — browsers keep audio locked behind a real gesture, and some embedded frames
  block it outright, so a silent-and-wordless robot is a state he is never allowed into.
- **Three things had to be true for him to be heard at all**, and all three are now
  tested by `npm run test:voice` (`scripts/test-voice.mjs`, which runs the shipped
  module against a mock browser that behaves like a real one):
  - *The context is handed out the instant it exists, not the instant it runs.* The
    browser's `resume()` is asynchronous, so a context created inside a gesture is still
    `suspended` for a tick. A voice that insists on `running` before it speaks throws
    away the first line of every visit; a suspended context still has a clock, and
    anything scheduled against it fires the moment it wakes.
  - *The context is created inside a gesture.* A context made on a hover is born
    suspended and the browser may never let it run, so the first real interaction wakes
    the hardware before it is needed.
  - *The caption is retired by a measurement, not a guess.* The master bus is metered
    (`output()` in `src/lib/emoVoice.ts`), and the chip only goes away once the meter
    has seen the voice. A context that happens to be running is not the same thing as
    sound a person can hear.
  He also got louder: a sawtooth's harmonics only line up with a vowel table by luck,
  so on the low notes the three formants could pass almost nothing. A parallel body
  voice — the note itself, rolled off above 2.2 kHz — now guarantees every syllable has
  a floor under it, and a limiter on the bus keeps a long syllable from clipping.
- The About pegboard is the real photograph. The composited ESP32, the Monster can
  and the drawn ribbon cable that sat over the top of it have been removed; the
  "hover to inspect" zoom card and its orange hint have been removed with them. The
  photo is just the board, the existing headphone hook, the existing IDC plug stub
  and the contact module bolted to the left. The headphone hook is shifted down a
  hair by re-framing the artwork, and the polaroid sits below it instead of
  crowding it.
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

### If the live site shows "Site not found"

`There isn't a GitHub Pages site here.` is GitHub's own 404 page, returned **before** any built file is considered: it means the Pages site for this repository is not currently enabled (or was switched off in the settings). The build itself is not the problem — check the Actions tab first: if the latest **Deploy Portfolio** run is green, the artifact was produced normally.

To bring the site back:

1. Open **Repository Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch" — branch mode serves the raw source files, which do not render).
3. Save. GitHub may ask for sudo mode (a fresh 2FA/email code) before accepting sensitive settings.
4. Publish again: run **Actions → Deploy Portfolio → Re-run all jobs**, trigger **Run workflow**, or push any commit to `main`. A fresh run is required, because the deploy job only publishes an artifact it has just built.
5. Confirm `https://ssambit635-svg.github.io/portfolio.site/` returns the portfolio, then spot-check `/dashboard/` and one asset.

Two quick checks for this failure mode:

- `curl -s -o /dev/null -w "%{http_code}\n" https://api.github.com/repos/ssambit635-svg/portfolio.site/pages` → `404` when the Pages site is missing, `200` when it is configured.
- The next workflow run fails at the **Setup Pages** step with `Get Pages site failed. Please verify that the repository has Pages enabled ...` — same root cause, seen from CI.

The workflow's `GITHUB_TOKEN` cannot create the Pages site itself, so `actions/configure-pages` cannot self-heal this one; the setting must be enabled once from the repository settings page.

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
