### Living Industry — Roadmap

Where the mod is and where it is going. Versions are planning buckets, not promises: a feature moves
when the systems it depends on are ready, and nothing gets bundled into a release just to fill a
version number.

The guiding idea throughout: **every company becomes a build, and every save creates its own
industry history.** A run should create stories the player did not plan.

v0.1 answers *"how can the world be different every time?"* The next stretch has one design goal:

> **The same market situation should produce a different correct decision depending on the company
> you have built.**

So the versions after v0.1.x focus on making the *player's company* dynamic before widening the
world again. The order is: studio builds, then run conditions, then repeated risk/reward decisions,
then rivals that react to the build, then the history that records all of it.

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

- ~~**Slow the market to the player's timescale.**~~ Done in 0.1.1: each genre draws a taste
  target (in fashion / ordinary / out of fashion) and holds it for two to four years while demand
  settles toward it over about six months; the Market Pulse arrow follows that target rather than
  weekly momentum, and the fast layer (noise, release pushes) runs at half strength. In the probe
  a genre that is HOT when you conceive a game is still hot a year later 70% of the time (was 13%).
- ~~Route all mod randomness through a seedable helper.~~ Done in 0.1.1: every run has a seed
  saved with it; market noise, taste shifts, the rival roster and rival releases all derive from
  it and continue identically across save/load. Showing and sharing the seed is v0.5.0.
- ~~Review rival news volume.~~ Done in 0.1.1: only studios with an average quality of 0.6 or
  better make hit/flop headlines (roughly 6-9 items a year instead of ~17); every release still
  moves the market and appears in the Market Pulse cause list.
- Full-length in-game balance pass on market, rivals, player influence and learn-by-doing so
  genre timing matters without making game quality irrelevant. The numbers above were tuned
  against the simulation, not a played run.
- In-game verification of everything shipped in 0.1.0 and 0.1.1, and any fixes that exposes.

---

#### v0.2.0 — Studio Builds

The backbone of the mod: **Studio Traits**, the company's persistent build.

- Traits are offered at meaningful milestones (not every few minutes), usually three choices,
  take one. Soft cap of 4-6 active traits; traits can be replaced, transformed or evolved so the
  build can change over a long run.
- The test for every trait: **does it make the player want to behave differently?** A trait is a
  condition, trade-off or synergy - never "+5% speed" or "+10% RPG sales" (those are upgrades,
  not traits). Two players looking at the same market should not necessarily make the same game.
  Candidates: *Cult Following* (COLD/niche genres build disproportionately loyal fans, HOT genres
  give you less), *Trend Chaser* (stronger launching into a rising genre, hit much harder by
  reversals and saturation), *Perfectionists* (long projects reach exceptional quality more often,
  rushed ones suffer extra), *Experimental Studio* (unusual topic/genre combos rewarded, safe ones
  slightly weaker), *Sequel Machine*, *Genre Loyalists*, *Creative Chaos*, *No Crunch* / *Crunch
  Culture*.
- Every trait carries internal **tags** - Prestige, Experimental, Commercial, Efficient, Trend,
  Niche, Community, Technology, Risk. The player need not see them at first; they exist so later
  systems can react to the build (a condition that favours Niche studios, a rival that dislikes
  Commercial ones, a gambit that is stronger for Prestige builds, an opportunity with an extra
  option for Experimental studios).
- **Studio Doctrine** (emerging, not chosen): the identity panel reads the dominant tag pair off
  the drafted traits and names it - *Auteur Studio* (Prestige/Experimental), *Market Machine*
  (Commercial/Trend), *Niche Specialist* (Community/Niche), *Technical Pioneer*
  (Technology/Experimental), *Production House* (Efficient/Commercial). In 0.2.0 this is a label
  the player earns by drafting; doctrine-specific trait pools and unlocks come once the base pool
  is proven.
- The draft trigger is generic: milestones drive it in 0.2.0, and the same path carries the
  first one or two **Defining Moments** (see 0.5.0) so the mechanism is exercised early.
- Every effect is visible in a tooltip or on the **Studio Identity** panel.
- Smallest convincing scope: **about 12 genuinely distinct traits** (not 18 unless the first 12
  are all pulling their weight), tags, synergies/anti-synergies, the milestone draft, the identity
  panel with the doctrine label.

Done when a player can describe their studio using its traits and at least three meaningfully
different synergies are viable.

#### v0.2.5 — Industry Conditions

Pulled forward from Run Structure because it is the cheapest way to make each run structurally
different, and the taste cycle already gives it a seeded, weekly-ticking foundation.

- At run start and at major era transitions the industry receives a **rule modifier**, not a
  demand bump (the market already does that). Six to eight **loud** conditions beat thirty subtle
  ones.
- Conditions are seeded multipliers over values the mod already has - taste-cycle length,
  saturation strength, size-scaled player influence, review-band influence, the sales-modifier
  band, rival risk appetite - so the first pool needs no new systems. Candidates that fit now:
  **Indie Boom** (small games move the market far more; small studios become prominent),
  **Review Culture** (review score has more say over market momentum and sales), **Blockbuster
  Economy** (large/AAA games have far bigger upside and downside), **Genre Fragmentation** (tastes
  turn over fast; a volatile market), **Experimental Era** (rivals take more risks; unusual
  combinations are tolerated), **Economic Downturn** (the sales band tilts negative; budgets bite),
  plus genre-flavoured ones like **RPG Renaissance** / **Arcade Fever** as taste-band weights.
- Conditions that need later systems wait for them: *Sequel Mania* and *Long Tail Era* (0.6/0.7),
  *Publisher Consolidation* (0.8).
- Brief, polished transition when a condition changes; the current one is always readable from
  the Market Pulse header and the identity panel.
- Because conditions are seeded, a run can be described as a sequence - *Indie Boom → RPG
  Renaissance → Economic Downturn* - which is what makes shared seeds (0.5.0) worth sharing.

#### v0.3.0 — Gambits & Opportunities

Repeated risk/reward decisions that give the player something to *do* with the build.

- **Project Gambits**: an optional per-game bet made in the Game Concept dialog - Safe
  Production (no effects), Rush Development, Experimental Design, Prestige Project, Trend Chase,
  Focused Scope - each a legible trade recorded on the finished game's history. Ordinary games
  stay ordinary: the gambit is a non-interrupting button, and **eligibility varies with the run**
  (Trend Chase only while the genre is rising, Prestige only after an 8+ release) rather than the
  prompt being rolled randomly. Traits modify gambits - *Perfectionists + Prestige Project*,
  *Trend Chaser + Rush*, *Experimental Studio + Experimental Design* - which is where build
  synergies become visible.
- **Industry Opportunities**: lightweight encounters with 2-3 concise options and visible costs
  (*a rival producer wants out*: hire them / recruit their team, rival turns hostile / pass;
  *a publisher wants your next RPG*: accept / renegotiate / self-publish for Prestige). Every
  opportunity is generated from **simulation state** - a rival really is struggling, a genre really
  is rising, your cash really is low, your traits really are Prestige-tagged - never from a
  generic event table. Unobtrusive indicator; the player opens it when convenient.
- Smallest convincing scope: 5-6 gambits with eligibility rules and trait interactions, the card
  system, about 10 state-driven opportunities.

#### v0.4.0 — Rivalries

Rivals become persistent characters that respond to the ecosystem, not market generators.

- Rival profiles: name, archetype, reputation, preferred genres, risk tendency, current or
  rumoured project, recent hits/flops, signature franchises.
- Rivals grow and decline; breakout hits and major flops get a short presentation, routine
  releases stay quiet.
- Rivals react to the player's build and results: a high-risk studio copies your three successful
  strategy games, fails, pivots to Simulation, lands a hit there years later, and resents you
  entering its new genre. A rival may dislike Commercial studios or court Prestige ones (tags).
- **Rivalry is emergent, not a meter.** No "Rivalry 73/100"; any relationship the UI shows
  describes something that already happened in the simulation. The player's story should be
  "NovaWorks copied my strategy games, failed, reinvented themselves and now dominate simulations".

#### v0.5.0 — Industry History

- **Run timeline**: the compact history of this company and this industry - booms, busts,
  conditions, rival moments, trait picks, doctrine, gambits, famous games - readable at any time
  and at the end of a run.
- **Defining Moments**: rare (5-10 per full run) events keyed to what actually happened - your
  first 10/10 (*Overnight Sensation*: embrace the fans / chase the spotlight / stay focused), a
  near-bankruptcy (*On the Brink*: a scar-like trait), a rival's collapse - each permanently marks
  the run and the timeline.
- **Doctrine unlocks**: doctrine-specific trait pools, gambits, opportunities and rival responses,
  now that the base pool has been played.
- Seeded starts you can share, shown with the run's condition sequence.

---

#### Expansion toward 1.0

| Version | Theme |
|---|---|
| v0.6.0 | **Legacy** - franchises, sequels, fanbases, prestige, fatigue, rival IP |
| v0.7.0 | **After Launch** - patches, ports, expansions, DLC, remasters, long-tail support |
| v0.8.0 | **Studio & Publishing** - culture, deals, contracts, funding, acquisitions |
| v0.9.0 | **Console Wars** - platform audiences, support, exclusivity, dynamic competition |
| v1.0.0 | **Living Industry** - integrated balance, polished UI, compatibility, scenarios, full history |

These wait until the roguelite loop (0.2-0.5) is proven, and each is held to the Expansion Rule
below. DLC, ports, patches and remasters in particular can add a lot of clicking without adding
depth: a remaster is interesting when franchise strength, a nostalgia condition, the platform's
audience and a studio trait together decide whether it is a smart move; "spend $2M, receive $5M"
is just another button. The same applies to acquisitions, contracts and exclusives.

#### Beyond 1.0 (directions, not plans)

Community and reputation; engine and technology competition; online games and distribution
changes; audience segments and global markets; deeper alternate-history simulation; an optional
Platform Holder endgame; an extension API for other mods.

---

#### Principles that decide what gets in

1. **Interconnection over feature count** - every major feature must interact with at least two
   existing systems.
2. **Decisions over passive bonuses** - a feature should make you reconsider what to do, not make a
   number bigger. For traits specifically: would the player behave differently with it?
3. **Readable simulation** - you should understand the important causes without seeing every
   hidden calculation.
4. **Bounded effects** - one roll can redirect a run, never win or lose it outright.
5. **Preserve the vanilla core** - enhance game creation, growth, research and progression rather
   than replace them.
6. **Earn interruptions** - only decisions and truly major moments stop play.
7. **Start with the smallest fun version** - a system proves itself before getting deeper AI,
   content or presentation.
8. **Protect the market from becoming the new optimum.** "HOT → make that genre → profit" is
   better than vanilla's static best combo, but it is still an optimum if HOT is strong and
   predictable. Every later system should make demand one consideration among several: does the
   genre fit my build, is it saturating, is a rival about to land there, does the current condition
   favour small games, do I have a gambit that makes another project attractive, can I ship before
   the trend turns. The question should shift from "what is the best game?" to "what is the best
   move for *this* studio, in *this* industry, right now?"
