### Living Industry — Roadmap

Where the mod is and where it is going. Versions are planning buckets, not promises: a feature moves
when the systems it depends on are ready, and nothing gets bundled into a release just to fill a
version number.

The guiding idea throughout: **every company becomes a build, and every save creates its own
industry history.** A run should create stories the player did not plan.

---

#### Where we are: v0.1.0 — Living Industry foundation

Shipped:

- A living market: per-genre demand, momentum and saturation that tick weekly, drift, boom, cool
  off and recover. Hot genres sell up to +15%, cold ones down to -15%.
- Generated rival studios whose hits and flops move the market; your own releases move it too,
  based on review score and game size.
- Market Pulse panel, market line in the Game Concept dialog, and non-blocking industry news.
- A title menu with Continue / New / Load / Settings / Mods / High Score / Achievements / Help /
  Quit that scales to the window.
- Quality of life (dev progress, time-allocation percentages, instant reviews, Quiet mode) and
  optional assists (slider marks, snap to hints, remembered sliders, release slider check, learn by
  doing) behind one master switch.
- A short opt-in tutorial, and a Settings > Living Industry tab for all of the above.

Still to do before the foundation is called finished (**v0.1.x**):

- **Slow the market to the player's timescale.** Right now a genre that is HOT when you conceive
  a game is usually no longer hot when you release it a year later. Planned: a slow per-genre
  cycle (each genre draws a new multi-year target level and reverts toward that instead of toward
  neutral) so HOT/COLD become year-long plateaus you can plan around, with the fast layer at
  roughly half strength.
- Full-length balance pass on market, rivals, player influence and learn-by-doing so genre timing
  matters without making game quality irrelevant.
- Route all mod randomness through a seedable helper so later systems can be reproduced from a
  seed.
- Review rival news volume (roughly 17 items a year with 8 rivals) - possibly only rivals above a
  reputation threshold make headlines.
- In-game verification of everything shipped in 0.1.0 and any fixes that exposes.

---

#### v0.2.0 — Studio Identity

The centrepiece of the roguelite layer: **Studio Traits**, the company's persistent build.

- Traits are offered at meaningful milestones (not every few minutes), usually three choices,
  take one. Soft cap of 4-6 active traits; traits can be replaced, transformed or evolved so the
  build can change over a long run.
- Traits are conditions, trade-offs and synergies - never flat "+5% speed". Examples being
  designed: *Cult Following* (weaker launch, stronger long tail and sequel retention), *Trend
  Chaser* (faster and stronger entering a rising genre, punished harder in a saturated one),
  *Perfectionists*, *Sequel Machine*, *Genre Loyalists*, *Creative Chaos*, *No Crunch* /
  *Crunch Culture*.
- Every effect is visible in a tooltip or on a new **Studio Identity** panel.
- Smallest convincing scope: 12-18 traits, the milestone draft, the identity panel.

Done when a player can describe their studio using its traits and at least three meaningfully
different synergies are viable.

#### v0.3.0 — Choices & Gambits

- **Industry Opportunities**: occasional card-style decisions (a publisher approaches, an
  experimental prototype, a rival's staff want to jump ship...) with 2-3 concise options and
  visible costs. They connect to the current market, rivals and studio identity, never generic
  random events. An unobtrusive indicator; the player opens it when convenient.
- **Project Gambits**: an optional per-game rule chosen at the start of development - Safe
  Production, Rush Development, Experimental Design, Prestige Project, Trend Chase, Focused Scope -
  each a legible risk/reward trade, recorded on the finished game's history.
- Smallest convincing scope: the card system, 8-12 opportunities, 5-6 gambits.

#### v0.4.0 — Rivalries

- Rival profiles: name, archetype, reputation, preferred genres, risk tendency, current or
  rumoured project, recent hits/flops, signature franchises, and their relationship with you.
- Rivals grow and decline; breakout hits and major flops get a short presentation, routine
  releases stay quiet.
- Rivals react to the player: imitating a breakout game until the genre saturates, or abandoning a
  genre the player dominates.

#### v0.5.0 — Run Structure

- Seeded starts you can share.
- **Era modifiers**: each console/technology generation brings one or two temporary global
  conditions (RPG Renaissance, Arcade Fever, Hardware Arms Race, Indie Boom, Sequel Mania,
  Economic Downturn) with a brief transition.
- A **run timeline**: the compact history of this company and this industry - booms, busts,
  rival moments, trait picks, gambits - readable at any time and at the end of a run.

---

#### Expansion toward 1.0

| Version | Theme |
|---|---|
| v0.6.0 | **Legacy** - franchises, sequels, fanbases, prestige, fatigue, rival IP |
| v0.7.0 | **After Launch** - patches, ports, expansions, DLC, remasters, long-tail support |
| v0.8.0 | **Studio & Publishing** - culture, deals, contracts, funding, acquisitions |
| v0.9.0 | **Console Wars** - platform audiences, support, exclusivity, dynamic competition |
| v1.0.0 | **Living Industry** - integrated balance, polished UI, compatibility, scenarios, full history |

#### Beyond 1.0 (directions, not plans)

Community and reputation; engine and technology competition; online games and distribution
changes; audience segments and global markets; deeper alternate-history simulation; an optional
Platform Holder endgame; an extension API for other mods.

---

#### Principles that decide what gets in

1. **Interconnection over feature count** - every major feature must interact with at least two
   existing systems.
2. **Decisions over passive bonuses** - a feature should make you reconsider what to do, not make a
   number bigger.
3. **Readable simulation** - you should understand the important causes without seeing every
   hidden calculation.
4. **Bounded effects** - one roll can redirect a run, never win or lose it outright.
5. **Preserve the vanilla core** - enhance game creation, growth, research and progression rather
   than replace them.
6. **Earn interruptions** - only decisions and truly major moments stop play.
7. **Start with the smallest fun version** - a system proves itself before getting deeper AI,
   content or presentation.
