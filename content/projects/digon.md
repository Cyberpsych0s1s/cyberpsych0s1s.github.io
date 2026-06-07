---
title: "digon"
slug: "digon"
descriptor: "a new systems language — stage-0 compiler in c++17 on llvm"
status: "wip"
stack: ["c++", "llvm", "compilers", "language-design"]
repo: "https://github.com/Cyberpsych0s1s/digon"
pinned: true
order: 1
date: 2026-05-30
---

a new systems programming language i'm building in c++17, currently in it's very early stages. it sits somewhere between c, rust and zig.

what it's reaching for:

- safety without lifetime annotations — a lexical borrow checker that lets go early
- arenas as the memory model: you keep your data where you put it
- structural traits and ufcs, so `p.area()` and `area(p)` are the same call
- native c interop
- one binary for the whole toolchain

the bootstrap compiler (stage 0) is ~7k lines of c++17 riding llvm. it lexes, parses, checks types, checks borrows, lowers to a small ir, and leaves a native binary on disk. no generics, no stdlib, and the arena model isn't built yet — it's pre-alpha and can't do real work yet.

the bootstrap compiler is around 7 thousand lines of c++17, it rides llvm and lexes, parses, checks types and borrows, lowers to a small ir, and leaves a native binary on disk. currently it has no generics, no stdlib, and the arena model isn't built yet, it's pre alpha and can't do real work yet.

repo is [on github](https://github.com/Cyberpsych0s1s/digon).

essays:
- [stage zero](https://almahri.dev/devlogs/stage-zero/) — where the name came from and what the first compiler can do
