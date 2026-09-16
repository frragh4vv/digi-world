# 🎨 Asset Generation Guide — Raghav's Digital World

This is the master list of **exact AI prompts** for every visual asset in the world,
plus how each one drops into the code. The goal: replace the placeholder emoji / simple
SVG props with **cohesive retro pixel-art** that matches the neon "digital dev-room"
reference — objects that actually look like a bike, a climbing wall, an arcade cabinet,
etc., while keeping the modern (not crusty-old) retro feel.

---

## 0. How the pipeline works (read this first)

1. Generate an image for an asset using the prompt below.
2. Make the background **transparent** (most generators don't do this cleanly — run the
   result through [remove.bg](https://remove.bg) or Photopea's "Magic Wand → Delete" if needed).
3. Save it as a **PNG** with the **exact filename** listed (e.g. `bike.png`).
4. Put it in **`public/props/`** (it's already created).
5. Open **`src/components/PixelProp.jsx`** and un-comment / add that name to the
   `IMAGE_PROPS` set near the top. That's it — the prop now uses your image, and falls
   back to the old SVG automatically if the file is ever missing.

> Floor/background and hobby images wire in slightly differently — see sections 4 & 5.

---

## 1. The shared STYLE recipe (use this for EVERY prop)

To get a **cohesive set**, every prop must share one style. Build each prompt as:

```
[STYLE PREFIX]  +  [the specific object]  +  [STYLE SUFFIX]
```

> ⚠️ **PERSPECTIVE (read this — it's the #1 thing that went wrong before):**
> The game room is a **flat top-down grid** you walk around on. Props must therefore be
> drawn **straight-on from the front (flat / orthographic)** — NOT in an isometric or
> "3/4 at 30°" view. Angled/isometric sprites look *tilted and pasted-on* against the
> flat floor. Think classic SNES/Pokémon overworld furniture: front elevation, upright,
> with at most a thin sliver of the top surface showing.

**STYLE PREFIX** (paste at the start of every prop prompt):
```
16-bit retro pixel-art game sprite, drawn straight-on from the FRONT in a flat
orthographic 2D view (NO isometric angle, NO 3D perspective, NO tilt — like classic
SNES / Pokémon JRPG overworld furniture), a single object standing upright and facing
the camera head-on, crisp clean pixels, bold readable silhouette, subtle dark outline,
soft neon rim-light from the top-left,
```

**STYLE SUFFIX** (paste at the end of every prop prompt):
```
, vibrant but slightly dark "synthwave / cyberpunk arcade" palette accented with neon
cyan (#00ffff) and magenta (#ff007f), flat front elevation with only a thin sliver of
the top surface visible, small soft oval contact shadow directly beneath the object,
centered, isolated on a fully transparent background, no text, no watermark, no border,
no ground tiles, no floor, no isometric perspective, single sprite only. Square image.
```

**Consistency rules (important):**
- Keep the **same prefix + suffix** for all props — only the middle object changes.
- **Flat front view only** — if an object comes back looking like a tilted 3D box, re-roll
  it; that's the exact problem we're fixing.
- Keep the **same light direction** (light from top-left).
- Same chunky pixel scale on every asset (don't mix tiny-pixel and smooth assets).
- Generate **square 1024×1024** (the code scales them down crisply). For wide/tall props
  the table notes a different aspect.

**Recommended generators:** Google Gemini / "Nano Banana" image, Midjourney (`--style raw`,
add `--no background, text`), DALL·E 3, or Leonardo (Pixel Art model). For Midjourney you
can append `--ar 1:1`. Always finish with a transparency pass if the bg isn't clean.

---

## 2. Room "corner" props — the priority set

These are the landmarks visitors interact with. **File → `public/props/<name>.png`**, then
add `<name>` to `IMAGE_PROPS`. Object descriptions are tuned to Raghav's actual setup.

| File name | Cells (size) | Object prompt (goes between PREFIX and SUFFIX) |
|---|---|---|
| `bike.png` | 1×1 | `a retro red city bicycle / cruiser bike with a basket, chrome details, side profile, leaning slightly` |
| `bouldering-wall.png` | 1×6 (tall) | `a tall indoor bouldering climbing wall panel, dark grey textured surface studded with colourful climbing holds (orange, cyan, magenta, lime), a few chalk marks` — *generate at 2:6 / tall aspect* |
| `hangboard.png` | 1×1 | `a wooden climbing hangboard / fingerboard with carved finger pockets, mounted on two short straps` |
| `computerglowing.png` | 1×1 | `a glowing dual-monitor developer desk setup, two screens showing green code and a stock chart, a mechanical keyboard, a desk chair, cyan and magenta screen glow` |
| `arcade.png` | 1×1 | `a retro upright arcade cabinet glowing with a manga / anime trivia screen, neon side art, coin slot, classic joystick and buttons` |
| `toolbox.png` | 1×1 | `a glossy red rolling tool chest cabinet with stacked drawers and chrome handles (a software "tech stack" toolbox)` |
| `tacticboard.png` | 1×1 | `a green chalkboard / tactics board on a stand, drawn with white football formation arrows and circles` |
| `travel-table.png` | 1×1 | `a small wooden table holding an open travel scrapbook / diary with photos and a pen, a tiny potted plant beside it` |
| `bookshelf.png` | 1×2 (tall) | `a tall wooden bookshelf packed with colourful manga volumes and a few trophies, seen flat from the front` — *generate at 2:3 / tall portrait aspect* |
| `bed.png` | 2×2 | `a cozy single bed with a blue duvet, an orange pillow stripe and a wooden frame (a spawn-point bed)` |
| `fridge.png` | 1×1 | `a tall modern kitchen fridge-freezer, stainless steel, a couple of magnets on the door` |
| `stove.png` | 1×1 | `a kitchen cooking stove / range with a lit blue gas flame and a frying pan on top` |
| `kitchen-counter.png` | 1×1 | `a kitchen counter / prep station with a cutting board, knife and a few ingredients` |
| `beanbag.png` | 1×1 | `a squishy round orange bean-bag reading chair` |
| `projector.png` | 1×1 | `a small retro photo slide projector on a stand, lens glowing cyan` |
| `bulletin.png` | 1×1 | `an ornate gold picture frame / hall-of-fame board on a wall, holding small pixel portraits (a guestbook gallery)` |
| `suitcase.png` | 1×1 | `a worn brown leather travel suitcase covered in colourful destination stickers` |
| `tent.png` | 1×1 | `a small orange camping / trekking dome tent` |
| `campfire.png` | 1×1 | `a small campfire of logs with orange and cyan flames` |
| `tyre.png` | 1×1 | `a single black rubber motorcycle tyre lying flat / propped` |

---

## 3. Soccer + biking mini-game props

| File name | Cells | Object prompt (between PREFIX and SUFFIX) |
|---|---|---|
| `goalpost-top.png` | 1×1 | `the TOP-LEFT corner section of a white soccer goal net (post + crossbar corner with netting)` |
| `goalpost-mid.png` | 1×1 | `the MIDDLE vertical section of a white soccer goal net (net mesh with side post)` |
| `goalpost-bottom.png` | 1×1 | `the BOTTOM-LEFT corner section of a white soccer goal net (post base with netting)` |
| `ball.png` | 1×1 | `a classic black-and-white soccer ball` |
| `goalie.png` | 1×1 | `a cartoon goalkeeper character in a green jersey and gloves, arms spread ready to dive, front view` |
| `motorbike-shine.png` | 1×1 | `a red commuter motorcycle (Honda-Shine style), clean side profile` |
| `motorbike-mt15.png` | 1×1 | `an aggressive dark-blue sport naked motorbike (Yamaha MT-15 style), side profile` |
| `checkpoint.png` | 1×1 | `a glowing cyan neon checkpoint flag on a pole` |

> The three `goalpost-*` pieces stack vertically to form one tall net — keep the netting
> lines aligned across all three so they tile seamlessly.

---

## 4. Food pickups (cyber-diner)

Small collectible items. Same prefix/suffix; these read best as little chunky icons.

| File name | Object prompt |
|---|---|
| `pizza.png` | `a single slice of pepperoni pizza` |
| `can.png` | `a neon-labelled energy-drink can, cyan and magenta` |
| `coffee.png` | `a steaming paper coffee cup` |
| `shwarma.png` | `a wrapped shawarma roll` |
| `chaap.png` | `a skewer of grilled soya chaap` |
| `garlic-bread.png` | `two pieces of cheesy garlic bread` |
| `dbt-popcorn.png` | `a red-striped popcorn bucket, full` |

---

## 5. Background & floor (the "reshape the background" ask)

You have two layers you can upgrade:

**(a) Page background behind the console** — *already redone in CSS* as a neon grid + glow.
If you'd rather use an image, generate this and I'll wire it as the page background:
```
seamless tiling retro synthwave background, dark near-black base #06060c, a faint neon
cyan perspective grid and tiny distant stars, very subtle magenta glow, clean and modern
(NOT a heavy old CRT look), low contrast so foreground UI stays readable, 1024x1024
tileable texture, no text, no characters.
```
→ save as `public/bg-grid.png` and tell me; I'll set it as `body` background.

**(b) In-game floor tiles** (optional, for a richer room). Each is a **seamless square
tile**. Generate at 256×256, tileable:
```
seamless tileable 16-bit pixel-art floor texture, top-down view, [SURFACE], subtle
shading, no objects, no text, edges that tile seamlessly. Square.
```
Swap `[SURFACE]` per zone and save to `public/floors/<name>.png`:
- `wood` → `warm wooden plank flooring`
- `rug` → `a cozy dark rug with a cyan geometric border pattern`
- `grass` → `short green grass`
- `turf` → `a striped green soccer-pitch turf`
- `tatami` → `tan tatami straw mat`
- `diner` → `red and black checkerboard diner tiles`
- `crashpad` → `a thick climbing crash-pad mat, dark with cyan piping`
   - `garage` → `grey concrete garage floor with a faint oil stain`

> Floor images need a small wiring change (map tile `bg` → `background-image`). Once you've
> generated the ones you want, drop them in `public/floors/` and I'll connect them.

---

## 6. Character sprite (optional)

The avatar is currently drawn as live SVG (already customizable + animated), so you don't
*need* an image. If you want a hand-illustrated hero instead, generate a **4-frame walk
sprite sheet** per direction:
```
16-bit pixel-art character sprite sheet, top-down 3/4 RPG view, a young man with [HAIR]
hair wearing [OUTFIT], 4-frame walking animation in a horizontal row, facing [DOWN/UP/
LEFT/RIGHT], consistent size, transparent background, no text. Each frame 32x32.
```
Generate 4 rows (down/up/left/right). This one needs real code changes to slice frames —
flag me if you want to go this route and I'll refactor `Sprite.jsx`.

---

## 7. Hobby / inspection images (optional)

The detail modals currently show real photos (`anime.png`, `bouldering.png`,
`trekking.png`, `football.png`, `profile.png`, plus `*_2.png`). Keep them if you like the
photos, or replace them with cohesive painted pixel scenes (same names, kept in `public/`):

| File | Prompt (use the section-1 SUFFIX but a **filled scene**, not isolated) |
|---|---|
| `profile.png` | `16-bit pixel art portrait of a developer at a glowing dual-monitor desk at night, cyan/magenta lighting` |
| `bouldering.png` | `16-bit pixel art of a climber on a colourful indoor bouldering wall, dynamic pose` |
| `anime.png` | `16-bit pixel art of a cozy shelf of manga volumes and a glowing CRT playing anime` |
| `trekking.png` | `16-bit pixel art of a lone hiker on a misty mountain ridge at sunrise` |
| `football.png` | `16-bit pixel art of a floodlit football pitch with a ball on the penalty spot` |

For these, drop the SUFFIX's "isolated / transparent" part and instead end with:
`, full illustrated scene, 4:3 aspect, no text.`

---

## Quick checklist

- [ ] Generated PNG, background removed, correct **filename**, placed in the right folder.
- [ ] Square 1024×1024 unless the table says wide/tall.
- [ ] Added the name to `IMAGE_PROPS` in `PixelProp.jsx` (for props).
- [ ] Same PREFIX + SUFFIX across the whole batch for a cohesive look.

When you've got a batch generated, just tell me which files you added and I'll enable them,
tune sizes/positions, and wire up any floors/sprites that need code changes.
