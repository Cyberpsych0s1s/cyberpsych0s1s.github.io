# almahri.node

a hand-built node on the wired — projects, devlogs, and a now-page. hugo,
hand-written templates, a little vanilla js. no theme, no framework, no tracker.
it lives at <https://almahri.dev>.

the whole loop: push to `main`, the wire carries it, the node goes live.

## transmissions (devlogs)

drop a markdown file in `content/devlogs/`. the `type` decides its shape:

- **essay** — long-form, its own page. needs a `title`.
- **fragment** — a line or two, no title.
- **thread** — numbered parts, split by a lone `---`.

```markdown
---
type: essay            # essay | fragment | thread
date: 2026-06-01T09:00:00
title: "how i stopped leaking particles"
project: digon         # optional — threads it into a project's signal log
tags: ["memory", "rust"]
---
body in markdown.
```

every entry also surfaces in `/archive/` and the rss feed.

## projects

one file per project under `content/projects/`:

```markdown
---
title: "thing"
descriptor: "one human sentence, shown on the index"
status: "wip"          # running | live | wip | archived
stack: ["rust", "wasm"]
repo: "https://github.com/..."   # optional
order: 1
---
the writeup.
```

red is rationed. mark a project `running` only when it's genuinely alive — that
status spends the node's red. one or two at most.

## now-page

`content/now.md` is all frontmatter: `focus`, `building`, `reading`,
`listening`, `location`, `mood`, `updated`. bump `updated` when you touch it — it
drives the "updated Nd ago" pulse. list fields take markdown links if you quote
the whole string: `["[label](url)"]`.

## running it locally

```bash
hugo server      # http://localhost:1313
```

need hugo (extended): `winget install Hugo.Hugo.Extended`.

## the map

```
content/   the words — projects, devlogs, now, colophon, signal
layouts/   the look — hand-written templates
assets/    main.css (tokens + style), site.js (boot, sound, soft-nav)
static/    fonts, sfx, og.png, favicon, CNAME (the domain — keep it)
hugo.toml  config, menu, params
```

identity lives in `hugo.toml [params]`; the footer nav is the `[menu]` block. the
`/signal/` guestbook runs on giscus — its ids are in `[params.giscus]`.
