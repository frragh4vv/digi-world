# 🎯 Asset Regen Shortlist — match the cozy reference

> **RECOMMENDED: generate by SECTION (see "Option B" at the bottom)** — one image per
> zone is far more cohesive and fewer generations than per-prop. The per-prop list
> (Option A) below is still valid if you prefer maximum flexibility/animation.



The room now has a warm **wood-plank floor**, but most props were generated with the old
**neon-synthwave** recipe in `ASSETS.md`, so they clash with the cozy reference. This file
is the corrected, **warm/cozy** recipe + the priority list of sprites to re-generate.

> Workflow (unchanged): generate → make background transparent → save with the EXACT
> filename → drop in `public/props/` → tell me the filenames and I wire + size + position
> them. Floors go in `public/` (already done).

---

## 1. The NEW shared style recipe (use for EVERY prop — this is the important change)

Build each prompt as: **`[PREFIX]` + `[the object]` + `[SUFFIX]`**

**PREFIX** (paste at the start of every prompt):
```
16-bit cozy RPG pixel-art game sprite, top-down Stardew Valley / SNES JRPG overworld
style, drawn straight-on from the FRONT in a flat orthographic 2D view (NO isometric
angle, NO 3D perspective, NO tilt), a single object standing upright facing the camera
head-on, crisp clean chunky pixels, soft warm daytime lighting from the top-left, bold
readable silhouette, subtle dark outline,
```

**SUFFIX** (paste at the end of every prompt):
```
, warm cozy colour palette — honey-wood browns, soft cream, muted teal and coral accents,
gentle saturation (NOT neon, NOT dark synthwave, NOT cyberpunk), flat front elevation with
only a thin sliver of the top surface visible, small soft oval contact shadow directly
beneath the object, centered, isolated on a FULLY TRANSPARENT background, no text, no
watermark, no border, no floor, no ground tiles, single sprite only. Square 1024x1024.
```

**Why this matters:** keep the **same PREFIX + SUFFIX** for the whole batch — that single
consistent recipe is what makes the set look like one cohesive room instead of stickers.
The #1 failure mode is mixing styles or getting an isometric/3D-tilted object back: re-roll
those.

---

## 2. Priority props to re-generate (highest visual impact first)

`File → public/props/<name>.png`, then tell me. Object text goes between PREFIX & SUFFIX.

| Priority | File | Cells | Object prompt (the middle part) |
|---|---|---|---|
| 🔴 1 | `kitchen-counter.png` | 1×1 | `a built-in light-wood kitchen counter cabinet with a stone top, a cutting board and a small pot` |
| 🔴 1 | `fridge.png` | 1×1 | `a cream / pastel retro kitchen fridge-freezer with rounded edges and a chrome handle, matching a cozy wooden kitchen` |
| 🔴 1 | `stove.png` | 1×1 | `a cozy wood-and-cream kitchen stove range with a lit warm-orange burner and a kettle on top` |
| 🔴 2 | `bouldering-wall.png` | 1×6 tall | `a tall indoor bouldering climbing wall panel, warm grey textured plywood studded with colourful rounded climbing holds (teal, coral, mustard, sage), a few chalk smudges` — *generate at 2:6 tall aspect* |
| 🔴 2 | `bed.png` | 2×2 | `a cozy single bed with a soft teal duvet, a cream pillow, and a warm honey-wood frame` |
| 🟠 3 | `bookshelf.png` | 1×2 tall | `a tall warm-wood bookshelf packed with colourful books and manga and a couple of small plants and trophies` — *generate at 2:3 tall portrait* |
| 🟠 3 | `computerglowing.png` | 1×1 | `a wooden study desk with a dual-monitor computer, screens with a soft glow, a keyboard and a desk chair, cozy not neon` |
| 🟠 3 | `arcade.png` | 1×1 | `a retro upright arcade cabinet with a warm-toned manga trivia screen and cream side art` |
| 🟠 4 | `toolbox.png` | 1×1 | `a glossy red rolling tool chest with stacked drawers and chrome handles` |
| 🟠 4 | `tacticboard.png` | 1×1 | `a green chalkboard tactics board on a wooden stand, white football formation arrows` |
| 🟢 5 | `beanbag.png` | 1×1 | `a squishy round coral / terracotta bean-bag chair` |
| 🟢 5 | `travel-table.png` | 1×1 | `a small wooden table with an open travel scrapbook, a pen, and a tiny potted plant` |
| 🟢 5 | `hangboard.png` | 1×1 | `a wooden climbing hangboard / fingerboard with carved finger pockets on two straps` |

---

## 3. NEW assets — the top-wall frames (currently missing)

The reference has a row of framed art on the top wall. These are new files — generate them,
and I'll mount them along the top wall (row 1). Each 1×1, same PREFIX/SUFFIX:

| File | Object prompt |
|---|---|
| `frame-landscape.png` | `a framed pixel-art landscape painting of green mountains and a sky, simple wooden frame, hung flat on a wall` |
| `frame-photo.png` | `a small framed photo portrait with a thin wooden frame, hung flat on a wall` |
| `poster-anime.png` | `a framed anime / manga poster showing a stylised character, hung flat on a wall` |
| `poster-band.png` | `a framed retro poster with bold simple graphic art, hung flat on a wall` |

> If you'd rather, I can mount your existing photo images (`anime.png`, `trekking.png`,
> `football.png`, `profile.png`) inside simple drawn frames on the top wall right now — no
> new art needed. Say the word.

---

## 4. Soccer / mini-game net (optional, for cohesion)

| File | Cells | Prompt |
|---|---|---|
| `goalpost-top.png` | 1×1 | `the TOP-LEFT corner of a clean white soccer goal net (post + crossbar corner with netting)` |
| `goalpost-mid.png` | 1×1 | `the MIDDLE vertical section of a white soccer goal net (net mesh + side post)` |
| `goalpost-bottom.png` | 1×1 | `the BOTTOM-LEFT corner of a white soccer goal net (post base + netting)` |

> Keep the netting lines aligned across all three so they stack into one seamless net.

---

## Checklist per asset
- [ ] Same PREFIX + SUFFIX as everything else (cozy/warm, NOT neon).
- [ ] Flat **front** view (re-roll any isometric/3D-tilted result).
- [ ] Background fully transparent, exact filename, in `public/props/`.
- [ ] Square 1024×1024 (except the tall ones noted).

When a batch is ready, just list the filenames you dropped in and I'll enable + tune them.

---

# Option B — generate by SECTION (recommended)

One image per zone = automatic cohesion. **Rules for every section:**
- Use the **same warm PREFIX/SUFFIX** style as Option A.
- **Furniture/objects only on a FULLY TRANSPARENT background — NO floor** (the wood / grass
  / tatami / concrete floors are already in the game and show underneath).
- **Flat top-down front elevation**, no isometric tilt.
- Generate at the **aspect ratio listed** (so it isn't stretched when placed on the grid).
- Optionally attach a clean (numbers-off) screenshot of that corner as a *layout* reference,
  and the warm vision image as the *style* reference. Tell it "redraw warm & cozy."

`File → public/sections/<name>.png`, then tell me which you added.

| File | Tiles (col,row → size) | Aspect | What's in it (between PREFIX & SUFFIX) |
|---|---|---|---|
| `sec-bed.png` | (1,1) 2×2 | 1:1 | `a cozy single bed with a teal duvet and cream pillow on a honey-wood frame, a small rug edge` |
| `sec-kitchen.png` | (6,1) 3×1 | 3:1 wide | `a built-in cozy wooden kitchen run: a cream retro fridge, a counter with a cutting board and pot, and a stove with a warm burner and kettle — one continuous unit` |
| `sec-topwall.png` | (3,1) 12×1 | 12:1 strip | `a row of framed wall art hung on a wall: a mountain landscape painting, two small photo portraits, an anime/manga character poster, and a bold graphic poster, evenly spaced` |
| `sec-climbing.png` | (1,4) 3×6 | 1:2 tall | `a tall indoor bouldering wall of warm plywood studded with colourful rounded holds, plus a small wooden hangboard mounted beside it` |
| `sec-desk.png` | (8,4) 3×3 | 1:1 | `a wooden study desk with dual computer monitors (soft glow), keyboard, mouse and a desk chair, a mug and a small plant` |
| `sec-camping.png` | (2,11) 4×3 | 4:3 | `a cozy camping corner: a small orange dome tent, a campfire of logs, a leather suitcase with stickers, and a little wooden table with an open travel scrapbook` |
| `sec-garage.png` | (9,12) 4×2 | 2:1 wide | `a small home garage scene: a red commuter motorbike, a glossy red rolling tool chest, and a spare tyre` |
| `sec-manga.png` | (15,1) 4×3 | 4:3 | `a cozy manga lounge corner: a retro arcade cabinet, a glowing pedestal display, a small slide projector, and a round terracotta bean-bag chair` |
| `sec-bookshelf.png` | (13,1) 1×2 | 1:2 tall | `a tall warm-wood bookshelf packed with colourful books, manga, small plants and trophies` |
| `sec-goal.png` | (18,10) 1×3 | 1:3 tall | `a clean white soccer goal net seen flat from the front, three vertical sections stacking into one net` |

> The central **rug**, the **soccer turf**, **camping grass**, **garage concrete**, and
> **manga tatami** are floor layers already handled in code — don't draw floors into the
> sections.

When you've generated some sections, drop them in `public/sections/` and tell me the
filenames; I'll add the overlay layer, position each to its tiles, and hide the old
individual sprites underneath.

