---
type: essay
date: 2026-06-19T18:00:00
title: "crawling myself"
weight: 1
reading_time: 3
tags: ["quert"]
---
<!-- DRAFT. real logs + numbers are from the actual run; prose is a scaffold — reword in your voice. -->

i made [quert](https://github.com/cyberpsych0s1s/quert) to explore the wired and retain what's worth keeping. so i pointed it at the node i'm responsible for: this one.

it ignored it.

```
WARN  result processing failed  {"url": "https://almahri.dev/projects",
  "status_code": 301, "error": "HTTP error status: 301"}
crawl complete  {"dispatched": 5, "succeeded": 2, "failed": 3, "written": 0}
```

a solid five urls, three of them died on a '301'. my own trailing slashes: '/projects' redirecting to '/projects/', and the crawler got lost trying to follow it. it fetched a door, thought the room moved one inch to the left, and gave up. a bust.


the fetcher would only ever make one move per url. a redirect is a second move. so i taught it to take the second move: follow the 'location' up to ten hops, and re check robots and the rate limiter, so a redirect can never reach a host i haven't cleared first.

so then i went to run it again.

```
crawl complete  {"dispatched": 100, "succeeded": 96, "duplicate": 3, "written": 29}
```

it fetched 96 pages, and even wandered off my site down the links i'd left, eventually, a few hosts told it no, exactly the way they should:

```
WARN  failed to submit job  {"url": "https://www.google.com/shopping/...",
  "error": "URL disallowed by robots.txt"}
```

good. it respects the wired.

i went to look at what it kept. twenty nine pages, and none of them were mine.

```
written pages by domain:
   20  github.com
    2  doc.rust-lang.org
    1  en.wikipedia.org, docs.rs, rust-for-rustaceans.com, insta.rs, jmmv.dev, ...
survivor word count: 272 – 7853
```

every page it saved was somewhere i'd linked *to*. the rust docs. github. a
stranger's blog. the verbose ones. it kept the rooms full of words and threw
away the node that pointed at them.

because i write short. one or two sentences, the second one cut if it's filler.
the crawler has a `quality_threshold` of `0.8` and a floor under the word count,
and my devlogs walked straight under both. it counted my words, found too few,
and decided i wasn't worth training on.

the filter isn't wrong, exactly. it kept the long pages and skipped the short
one, and that's all `0.8` was ever measuring. more words, more worth saving.
nothing's taught it to doubt that yet.

i made a thing to decide which words are worth keeping. it kept everyone's but
mine.

during this process, the commit made to fix 3xx redirect issues can be found [here](https://github.com/Cyberpsych0s1s/quert/commit/51a4a2e7f578a8e0f0d438a796546abaabdbf212)