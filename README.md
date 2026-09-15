### Game Dev Tycoon: Living Industry

**Version 0.1.1**

Living Industry makes the game market *move*. In vanilla Game Dev Tycoon the best topic/genre
combination is always the best; here every genre has its own demand that rises and falls, rival
studios release games that push it around, and your own releases push back. Reading the market
and timing a release becomes part of the game, and no two saves write the same industry history.

It also bundles a set of quality-of-life features and optional "assists" (slider marks, snap to
hints, instant reviews, learn by doing, and more) so you don't need three separate Workshop mods
for them - each one can be switched off.

Living Industry does **not** change topics, genres, platforms, research, staff or the vanilla
development loop. It sits on top of the game you already know.

---

#### Installation

1. Requires **Game Dev Tycoon 1.7.x (Steam)** and the **gdt-modAPI** mod that ships with the game.
2. Copy the `gdt-livingindustry` folder into the game's `mods` folder
   (Steam: `...\steamapps\common\Game Dev Tycoon\mods\`).
3. Start the game, open **Mods** from the title menu, and tick both **gdt-modAPI** and
   **Game Dev Tycoon: Living Industry**. Restart when asked.
4. Start a new game or load a save. Saves made without the mod work: they simply start with a
   neutral market and a fresh set of rivals.

If you also use the Workshop mods **Percentager**, **instaReview** or **Learn By Doing**, disable
them - Living Industry includes all three features (Learn By Doing is detected and Living
Industry's version defaults to off while it is enabled, so skill gains don't double up).

---

#### The title screen

The title screen keeps the vanilla look (spinning sunrays, logo) but replaces "Click to
continue..." with a menu under the logo:

- **Continue** - loads your newest save; the button shows the company name and in-game date, and
  `autosave` if that is the newest. Hidden when there are no saves.
- **New Game**, **Load**, **Settings**, **Mods**, **High Score**, **Achievements**, **Help**, **Quit**.

Everything scales with the window, so it stays readable on large monitors and the sunrays reach
all four corners. Clicking the background no longer loads a game. Esc / right-click still open the
regular in-game menu while playing, and **Help** has a "Living Industry" section at the top.

Prefer the vanilla screen? Turn off *Living Industry title menu* in Settings > Living Industry
(applies the next time you start the game).

---

#### The living market

Each of the six genres (Action, Adventure, RPG, Simulation, Strategy, Casual) has three hidden
values that tick every in-game week:

| Value | What it means for you |
|---|---|
| **Demand** | How much players want that genre right now. Neutral is 1. At or above 1.5 the genre is **HOT**, at or below 0.6 it is **COLD**. Demand settles toward where audience tastes currently sit for that genre, so a boom that isn't backed by a real shift in tastes cools off and a dead genre recovers. |
| **Tastes** | Where demand is heading over the coming months. Every few years each genre's audience shifts - a genre comes into fashion, goes out of fashion, or settles back to ordinary - and holds that for two to four years. Shown as the trend arrow (rising / flat / falling), so a genre that is HOT when you start a game is usually still hot when you ship it. |
| **Momentum** | Short-lived pushes from recent releases and week-to-week noise. Fades over about three months. |
| **Saturation** | How many games recently landed in that genre. A **crowded** genre grows more slowly. Fades over a few months. |

**What moves it**

- **Rival studios.** Every save generates its own roster of named competitors, each with a
  release cadence, a typical quality and a risk appetite. A rival hit lifts its genre's momentum,
  a flop drags it down, and every rival release adds saturation. Only the better-known studios
  make the news with their hits and flops; the small ones move the market quietly.
- **You.** Every game you release adds saturation to its genre (larger games add more). Its
  review score decides the rest: 9+ is a breakout hit and pushes momentum up hard, 8+ is a hit,
  6-7.9 is average (saturation only), below 6 a flop, below 4 a major flop.
- **Shifting tastes** every few years per genre, plus a little random drift.
- **New games start different.** Every run has its own seed: starting tastes, demand and the
  rival roster are drawn from it, so the first years of every run look different.

**What it does to you**

Your release's sales are multiplied by a modifier taken from its genre's demand: **up to +15% in
a hot genre, down to -15% in a cold one**. Quality still matters most - a great game in a cold
genre beats a bad game in a hot one - but timing is now worth real money, and chasing a boom that
five rivals also chased will meet a crowded, cooling market.

**Reading the market**

- **Market Pulse** - a compact panel in the top-left corner, one line per genre:
  `Action  ↗ HOT`, `RPG  → COLD recovering`, `Casual  ↘ crowded`. The word is the demand level,
  the arrow its direction; `COLD recovering` and `HOT cooling` spell out the two cases where they
  point opposite ways. Click the header to collapse it. Turn on *Hover details* in settings to
  see the numbers and the recent releases that moved each genre.
- **Game Concept dialog** - when you pick a genre, its Market Pulse line appears under the
  topic/genre hint (orange for hot, blue for cold).
- **Industry news** - rival hits and flops, and genres turning hot or cold, arrive as
  non-blocking sidebar items that fade out on their own (click one to read it in full). You can
  switch to popups or off, and optionally get trend-reversal news too. News about any one genre
  is rate limited so the sidebar never floods.

**Tutorial.** Right after you create your company a two-page welcome explains the above and
offers *Show tips as I play* or *Don't show again*. With tips on, a short one-time tip appears
the first time each new screen shows up in that save (Game Concept, Development Stage, dev
points, release, and your first game's effect on the market).

---

#### Quality of life (Display settings)

All on by default; each has a toggle in Settings > Living Industry > Display.

- **Development progress** - a `Feature: 62% (game 34%)` line in the Fans/Cash box while developing.
- **Time allocation percentages** - each slider's share on the Development Stage
  "Time Allocation (Preview)" bar.
- **Instant reviews** - review scores appear at once instead of the slow reveal animation.
- **Industry news delivery** - sidebar (default), popup, or off; plus *Also report trend reversals*.
- **Market Pulse panel**, its *Hover details*, and an **overlay size** (100-200%) for high-resolution
  screens (vanilla UI is unaffected).
- **Quiet mode** - one button that routes the chatty vanilla popups (Industry News, Platform
  News, New Research, Company Milestones) to the sidebar; *Vanilla popups* flips them back.
  Decisions and reports are untouched.
- **Living Industry tutorial** toggle and a *Show tips again in this save* button.
- **Living Industry title menu** toggle.

---

#### Assists (gameplay help, optional)

Assists reveal or apply the game's hidden slider rules, so a purist may want them off. They sit
under one **Enable assists** master switch in Settings > Living Industry (off = vanilla help level;
your individual choices are kept), with a toggle each:

- **Slider marks** - `+++ / ++ / - / -- / ---` marks along each Development Stage slider, with the
  mark matching that slider's known hint highlighted. Click a mark to jump there. Adds a
  *Snap to marks: On/Off* button to the window (snapping while dragging is remembered per save).
- **Snap to hints** - a button that sets every slider from its hint according to the game's review
  rules (`+++`/`++` to at least 40%, `--`/`---` to the minimum). Only works on features you
  already have hints for. **Auto-snap** applies it every time a stage opens. This is the strongest
  assist.
- **Remember sliders** - each stage reopens with the values you last used for the same
  topic + genre combination (stored in the save).
- **Slider check on the "is ready!" screen** - a `Slider hints: 4 ✓ met · 1 ✗ broken` line
  counting which known hints you met or broke; hover for the per-feature list. Absent until you
  know some hints.
- **Market state in the Game Concept dialog** - the line described above.
- **Learn by doing** - staff have a small, diminishing chance to gain Design / Technology /
  Research skill from the points they produce (a green `+1 Design` bubble), capped at 900. A
  helping hand before training, not a replacement.

Settings are app-wide and follow you across saves. Changes apply immediately (except the title
menu, which applies at next launch).

---

#### Compatibility and saves

- Market state, the rival roster and remembered sliders are stored inside your save through
  gdt-modAPI, so they survive save/load and restarting the game.
- Loading a save from an older Living Industry version silently upgrades it, keeping your market
  and rivals.
- Disabling the mod leaves your saves playable; the market data is simply ignored.
- The mod never blocks play on its own: if a base-game hook it relies on is missing (for example
  after a game update), that one feature switches off and logs an error while the rest keeps
  working.

Something odd? Open devtools with `F12` and look for `[Living Industry]` lines in the console; the
first should read `Living Industry v0.1.1 (state v4, seed N) loaded.`

---

#### Roadmap

v0.1.x tunes the market to the game's development cycle (hot genres should stay hot long enough
to plan a game around) and runs a full-length balance pass. After that comes the roguelite
layer: **Studio Traits** that build up your company's identity, drafted **Industry
Opportunities**, and optional per-game **Project Gambits**, with era modifiers and deeper rivals
later. The full plan, version by version, is in [ROADMAP.md](./ROADMAP.md).

---

#### For developers

How the mod is put together:

```
gdt-livingindustry/
	package.json       mod manifest (id, version, main entry point)
	main.js             loads the modules below in order, then initializes them
	balance/            tunable constants + player-setting defaults, nothing else should hardcode numbers
	core/               state shape, save/load wiring, app-wide settings store
	market/             market tick logic + the shared release-effect/cause path
	rivals/             rival studio roster + generated releases
	events/             industry news conditions, surfaced through the sidebar/popups
	integration/        hooks into vanilla release/sales/staff systems (sales modifier, player influence, learn by doing)
	ui/                 title menu, Market Pulse, status-bar dev progress, focus percentages/marks/snap, release badge, concept hint, instant reviews, tutorial, settings tab
```

Every number lives in `balance/constants.js` (`LivingIndustry.CONFIG`); set `CONFIG.debug = false`
to silence the console logging. Each module is isolated: if a base-game function it wraps is
missing, that module logs an error and switches itself off while the rest keeps running.
