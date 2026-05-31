# almahri.node

My personal site — projects, devlogs, and a now-page, built to a custom design
spec ("warm-dark desk + beige paper", disciplined red, lowercase mono, Wired
chrome). [Hugo](https://gohugo.io/), hand-written templates + CSS + a little
vanilla JS. No theme, no framework, no tracker. Lives at <https://almahri.dev>.

Push to `main` → GitHub Actions builds it → it goes live. That's the whole loop.

---

## Add a devlog

Three kinds of entry live in `content/devlogs/`. The `type` frontmatter field
decides how it renders.

**Essay** (long-form, its own reading page):
```markdown
---
type: essay
date: 2026-06-01T09:00:00
title: "how i stopped leaking particles"
project: digon          # optional — links it to a project's "signal log"
tags: ["memory", "rust"]
reading_time: 8         # optional; auto-computed if omitted
---
Body in markdown. Code blocks, images, lists — all supported.
```

**Fragment** (a short thought, no title):
```markdown
---
type: fragment
date: 2026-06-01T23:14:00
tags: ["debugging"]
---
one or two lines. that's it.
```

**Thread** (numbered, multi-part). Separate the parts with a line containing
only `---`:
```markdown
---
type: thread
date: 2026-06-01T18:00:00
title: "notes on stage 0"
project: digon
tags: ["compilers"]
---
part one.

---

part two.

---

part three.
```

Then `git add . && git commit -m "devlog: ..." && git push`. Everything in
`content/devlogs/` also shows up in the flat `/archive/` index and the RSS feed.

## Add / edit a project

Each project is its own page under `content/projects/`:
```markdown
---
title: "thing"
slug: "thing"
descriptor: "one human sentence, shown on the index"
status: "running"       # running | live | wip | archived  (running == red/alive)
stack: ["rust", "wasm"]
started: "2026.01"
last_signal: "2026.05"  # last meaningful update
metric: "~6k loc"       # optional honest stat
repo: "https://github.com/Cyberpsych0s1s/thing"   # optional
live: "https://thing.almahri.dev"                 # optional
pinned: true            # optional
order: 1                # index order (lower = first)
---
Long-form writeup in markdown.
```
**Red discipline:** only mark a project `running` if it's genuinely alive —
that status spends the site's rationed red. Keep it to one or two at a time.

## Update the now-page

Edit `content/now.md`. It's all frontmatter — `focus`, `building`, `reading`,
`listening`, `location`, `mood`, and `updated`. The "updated Nd ago" badge is
computed from the `updated` date, so bump it when you edit.

## Edit identity / config

`hugo.toml` `[params]` — handle, node name, github, description. The footer-rail
nav is the `[menu]` block.

---

## One-time setup (do these once)

1. **Turn on Actions deploy.** Repo → Settings → Pages → Source = **"GitHub
   Actions"** (not "deploy from a branch"). Until you flip this, pushes won't
   deploy.
2. **Guestbook (optional).** The `/signal/` page uses [giscus](https://giscus.app)
   (GitHub Discussions). To enable it:
   - Repo → Settings → enable **Discussions**, add a category (e.g. `guestbook`).
   - Install the **giscus** GitHub App on this repo.
   - Get your `repo-id` and `category-id` from <https://giscus.app> (paste the
     repo + category there).
   - Put them in `hugo.toml` under `[params.giscus]` (`repoId`, `categoryId`).
   Until then `/signal/` shows a "channel offline" placeholder.

## Preview locally (optional)

```bash
hugo server      # open http://localhost:1313
```
Install Hugo (extended) on Windows: `winget install Hugo.Hugo.Extended`.

## Structure

```
content/
  _index.md        home (the handshake/handle/grid are in the template)
  now.md           /now (frontmatter-driven)
  colophon.md      /colophon (the making-of)
  contact.md       /contact
  signal.md        /signal (guestbook)
  archive.md       /archive (flat devlog index)
  projects/*.md    one file per project
  devlogs/*.md     essays / fragments / threads
layouts/           the templates (the look)
assets/css/main.css   all styling + design tokens
assets/js/site.js     boot, sound, crt toggle, soft-navigation, filters
static/fonts/      self-hosted Departure Mono
static/sfx/        startup.wav (Kenney, CC0); optional mouseclick.wav override
static/CNAME       custom domain — don't delete
hugo.toml          config, menu, params
```

The custom domain is set by `static/CNAME`. Don't delete it.

## Sounds

Ambient starts on your **first interaction** with the page (a click or key) —
this is not a bug or a setting we can change: browsers block all audio until a
user gesture (the autoplay policy), so no site can play sound on load. The first
click both unlocks audio and triggers the power-on chime. Pref persists, so set
`ambient: off` once and it stays off. Sound also survives page changes because
navigation is a soft fetch-and-swap rather than a full reload.

**The bed:** a low mains hum + dull HDD ticks/seeks. `startup.wav` plays once on
power-on.

**Action feedback (all synthesised in `site.js`, no files, gated on `ambient:
on`):**

- **mouse-click** — a press+release clack on every primary click (drop a
  `mouseclick.wav` into `static/sfx/` to override with a real recording).
- **hover** — a soft high tick when the pointer enters a link or button.
- **navigation** — an HDD seek + low whir on each soft-nav page change.
- **toggle** — a relay thunk on the crt/sound controls (pitched up = engage).
- **copy** — a rising two-note confirm when a code block is copied.

To override the mouse-click with a real recording, good license-clear sources:
[Freesound CC0](https://freesound.org), [Mixkit](https://mixkit.co/free-sound-effects/click/),
or [Kenney](https://kenney.nl/assets/interface-sounds) (CC0).
