---
type: essay
date: 2026-06-06T20:00:00
draft: true
title: "stage zero"
tags: ["digon"]
reading_time: 3
---

ever since i began programming, i've had an itch in the back of my mind: create a programming language.

it usually doesn't get past the parser, but this time i'm documenting it 
so i can't forget it.

this is digon. a small systems language somewhere between c, rust and zig.

safety without lifetime annotations. arenas where you keep your data. structural traits. native c interop. one binary for the whole toolchain.

the name came from a [vsauce](https://www.youtube.com/@Vsauce) short i saw where he spoke about polygons made up of 1 and 2 sides, that is where i learned about the digon, made up of 2 sides. usually you can't draw such a shape in 2d space, but by utilizing 3d you can "cheat" your way into it.

fitting, for a thing that only makes sense once you change the ground you stand on.

right now there is a stage 0. the bootstrap compiler, ~7k lines of c++17 riding llvm.

it lexes, parses, checks types, checks borrows, lowers to a small ir, and leaves a native binary on disk.

this builds and runs:

```
type Point { x: i64, y: i64 }
func area(p: ref Point) -> i64 { p.x * p.y }
func main() -> i32 {
    let p = Point { x: 3, y: 4 }
    p.area() as i32
}
```

structs. sum types with exhaustive match. defer. a lexical borrow checker that lets go early. ufcs, so `p.area()` and `area(p)` are the same call.

the honest checksum: no generics. no stdlib. the arena model the whole pitch rests on isn't built yet. (coming soon :P)

it can't do real work. that's what the log is for — you watch it reach, or watch it fail. (hopefully before i go to the military)

repo at [github.com/Cyberpsych0s1s/digon](https://github.com/Cyberpsych0s1s/digon). pre-alpha. stay on the line.

"why would he call it digon?" "Necause the second you compile it and hit a segfault, your unsaved progress will just die and be gone." - (Gemini)[https://en.wikipedia.org/wiki/Garbage]
