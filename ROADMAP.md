# Living Industry - Roadmap

Where the mod is and where it is going. Versions are planning buckets, not promises. Features move when their dependencies are ready, and a small system that creates good decisions earns its expansion. Everything below — scope, order, version numbers, and names — is a current best guess and subject to change as design and playtesting reveal new information.

The foundation is shipped as described below. Everything after v0.1.x is planned.

## The vision

**Every company becomes a build. Every industry develops a cast of characters. Every save creates its own history.**

Living Industry should make Game Dev Tycoon exciting to return to after the player understands the base game. Each run should offer different strengths, pressures, opportunities, competitors, and reasons to change direction.

Two questions guide the design:

> What is the best move for this studio, in this industry, right now?
>
> What happened in this run that makes me want to tell someone about it?

A successful run might become the story of a small studio that revived an abandoned genre, an experimental company that accidentally started a trend, or a prestige developer whose fiercest competitor refused to admit defeat.

## The core loop

1. Read the market and recognize an opportunity or threat.
2. Choose a project that fits the company's strengths, ambitions, and available resources.
3. Optionally make a project gambit or accept a meaningful commitment.
4. Release the game and see its commercial, creative, and industry consequences.
5. Develop the studio through limited trait drafts and occasional defining choices.
6. Respond as competitors act, conditions change, and earlier decisions return in new forms.

Roguelike elements provide adaptation, commitment, and powerful combinations. A recognizable strategy can remain satisfying throughout a run; later runs should offer different paths to success. The normal campaign remains the main experience, with shorter scenarios considered only once the core loop is proven.

---

## v0.1.x - Finish the living industry foundation

### Shipped in v0.1.0

- A living market: genre demand, momentum, and saturation change weekly. Hot genres sell up to +15%; cold genres down to -15%.
- Generated rival studios whose hits and flops move the market. Player releases influence it too, based on review score and game size.
- Market Pulse, a market line in the Game Concept dialog, and non-blocking industry news.
- A window-scaled title menu with Continue, New, Load, Settings, Mods, High Score, Achievements, Help, and Quit.
- Quality of life (development progress, time-allocation percentages, instant reviews, Quiet mode) and optional assists (slider marks, snap to hints, remembered sliders, release slider checks, learn-by-doing) behind one master switch.
- A short opt-in tutorial and a Settings > Living Industry tab.

### Completed in v0.1.1

- **Slower market changes.** Each genre holds a taste target for two to four years, with demand settling toward it over about six months. Market Pulse arrows follow that target; the faster noise and release effects run at half strength.
- **Seeded mod randomness.** Market noise, taste shifts, the rival roster, and rival releases derive from a saved run seed and continue consistently across save/load.
- **Quieter rival news.** Hit/flop headlines are limited to studios with average quality of at least 0.6. Every release still affects the market and appears in the cause list.

The simulation probe showed that a genre hot at conception remained hot a year later about 70% of the time, compared with 13% previously. Headline volume fell to roughly 6–9 items per year from about 17. These are simulation findings, not results from a completed played campaign.

### Still required

- A full-length in-game balance pass covering the market, rivals, player influence, and learn-by-doing.
- In-game verification of everything shipped in v0.1.0 and v0.1.1, followed by fixes.
- Confirmation that market timing matters while game quality and the vanilla progression remain important.

**Done when:** the foundation works through a played campaign and the player can understand its meaningful effects.

---

## v0.2.0 - Studio Traits

Give the player a persistent build: a first, self-contained step before Industry Conditions and the identity UI layer on top of it.

**Builds on:** the stable v0.1.x market — traits need a market worth reacting to before they're worth choosing.

- The first trait draft follows the first completed game. Further drafts arrive at meaningful milestones.
- Usually offer three traits and choose one. Offers are seeded, with some influenced by company history and some leaving room for a new direction.
- Begin with three active trait slots for the initial pool. Expand toward 4–6 only as the pool grows enough to preserve distinct builds. Replacement or evolution happens at clear milestones, with any transition cost shown beforehand.
- Traits change priorities, constraints, or opportunities. Numerical effects are welcome when they produce a meaningful decision.
- Strong combinations should feel powerful. Their costs and limitations should remain relevant.

Initial candidates:

- **Counterprogrammers:** well-received games gain an advantage in genres with little recent competition. This responds to saturation, so an overlooked opening can matter even when another genre is hotter.
- **Trend Chaser:** stronger gains from entering rising genres, with greater exposure when the opportunity fades.
- **Perfectionists:** an optional, costly polish commitment creates greater potential for an exceptional release. The studio must finance the extra time.
- **Experimental Studio:** respectable releases using combinations absent from the studio's recent history produce extra learning or research. Repeating an experiment eventually makes it familiar.
- **Genre Loyalists:** sustained, successful work in a genre builds a specialization that the player weighs against opportunities elsewhere. Changing direction remains possible.
- **Prototype Culture:** a successful small project can prepare the studio for a larger project in the same genre. Preparation is limited and consumed, giving small releases a role in an ambitious portfolio.

Start with 6–8 distinct traits. Expand toward 12 after playtesting shows that the initial choices support different companies. Each effect must be checked against the base game's review, research, and progression systems before joining the pool.

Traits carry internal tags such as Prestige, Experimental, Commercial, Efficient, Trend, Niche, Community, and Technology. Later systems (Industry Conditions, Opportunities, Gambits, Rivalries) recognize a build through these tags rather than reading traits directly.

**Done when:** at least three distinct trait-based studio approaches are viable and a player can describe their build using its traits.

---

## v0.2.1 - Industry Conditions

Make each run structurally different, on top of whatever traits the studio has drafted.

**Builds on:** the v0.1.x market directly. Reads Studio Trait tags once v0.2.0 traits exist, but a condition's own rules don't require a trait to exist first.

One clearly displayed condition changes the rules of the current era. Show the starting condition before play and signal major transitions early enough to influence project planning.

Initial candidates:

- **Indie Boom:** smaller releases have greater market influence, giving small studios more opportunity to shape the industry.
- **Review Culture:** review quality has a stronger effect on market influence and commercial results.
- **Crowded Shelves:** release-driven saturation lasts longer, making repeated entry into busy genres more costly.
- **Blockbuster Economy - later eras:** large releases have more pronounced upside and downside, increasing the importance of commitment and financial reserves.

Ship three starting conditions first. Starting conditions must affect decisions available to an early studio; introduce Blockbuster Economy when larger projects become available. Conditions should last long enough for several meaningful project decisions. Genre-specific booms such as an RPG Renaissance remain market developments that can occur within these conditions.

**Done when:** a run's starting condition visibly changes which early decisions make sense, without needing a tooltip to notice it.

---

## v0.2.2 - Studio Identity & Feedback

Tie traits and conditions together into something the player can see and recognize as their build.

**Builds on:** v0.2.0 Studio Traits and v0.2.1 Industry Conditions directly — this version has nothing new to show without them.

- A Studio Identity panel explains active traits, relevant conditions, and their effects.
- An emerging doctrine names the dominant direction: Auteur Studio, Market Machine, Niche Specialist, or Technical Pioneer. At first it only describes the build; it does not require a separate progression system.
- Begin recording significant choices and their causes for the future timeline (this pays off in full at v0.5.0).
- Add a compact explanation of the mod's major contributions to a release result. Show measured effects; distinguish uncertain forecasts from known outcomes.
- Prototype two gambits alongside the traits — Focused Scope and Prestige Project — to test interactions before expanding the pool in v0.3.0.

**Done when:** different trait/condition combinations produce recognizably different opening plans, and the identity panel matches what a player would already say about their studio.

---

## v0.2.5 - People With Motives

Give the industry a small recurring cast whose decisions reflect their personalities and histories.

**Builds on:** the v0.1.x rival roster — founders are layered onto studios that already exist — and loosely on v0.2.0's trait tags, since a founder's personality is designed to reinforce or push against the player's own build.

### Rival founders

Start with one named founder for each of a small set of prominent rivals. A founder has:

- **A motive:** recognition, growth, independence, or creative discovery.
- **An approach:** cautious, stubborn, opportunistic, or experimental.
- **A current ambition:** reclaim a genre, recover from failure, establish a specialty, or pursue a breakout hit.
- **A few significant memories:** a defining success, a costly failure, or a competitor that repeatedly challenged them.

Studio traits describe how a company operates. Founder personalities describe what a person values and how they pursue it. The two can reinforce each other or create tension.

### Decisions with consequences

Founders influence the rival behaviors the simulation can already express: genre choice, project ambition, risk, and whether to persist or change direction.

An actual result updates their circumstances and memories. Filter available actions by what is currently possible, then let personality, ambition, pressure, and relevant memories influence how likely each action is. Seeded randomness selects among those possibilities. The next release produces new consequences.

Examples:

- A proud specialist becomes more determined after losing recognition in its strongest genre.
- A cautious founder retreats after repeated disappointments.
- An opportunist follows another studio's breakthrough into a newly promising genre.
- An experimental founder uses a successful release as the opportunity to try something unfamiliar.

Early financial pressure can be represented by a simple, clearly defined performance state based on rival results. A complete rival accounting system can wait.

Rivals also react to one another. Their stories continue while the player concentrates on their own projects.

### Presentation

- Show the founder, personality, ambition, and recent history in the rival profile.
- Explain consequential decisions through short reports tied to actual events.
- Keep routine activity quiet. Reserve attention for a recognizable person doing something that matters.
- Preserve people, motives, memories, and pending decisions through save/load.

**Done when:** players recognize several founders, form expectations about them, and occasionally see a surprising decision that still makes sense.

---

## v0.3.0 - Gambits & Opportunities

Give the player repeated opportunities to use their build and respond to the people around them.

**Builds on:** v0.2.0 traits (gambits and opportunities read trait tags for eligibility and payoff), the v0.2.2 gambit prototype (Focused Scope, Prestige Project), and v0.2.5 founders (opportunities reference live rival/founder state).

**What ships:**

- Four to six Project Gambits, selectable per project from the Game Concept dialog.
- Roughly 6–10 Industry Opportunities, generated from live company, market, and founder state rather than drawn from a static event table.
- The first one or two Defining Moments, reusing the trait-draft path to prove out a non-milestone trigger ahead of the full set in v0.4.0.

### Project Gambits

An optional choice in the Game Concept dialog commits the current project to a clear trade-off. Ordinary development remains available.

Expand the prototype into four to six gambits:

- **Focused Scope:** concentrate the project, trading ambition for a more manageable commitment.
- **Rush Development:** reach the market sooner while accepting development risks.
- **Prestige Project:** commit additional resources to a release with higher expectations.
- **Experimental Design:** pursue an unfamiliar approach with greater learning potential and uncertainty.
- **Trend Chase:** commit to a rising opportunity whose value may change before release.

Eligibility follows the current situation. Costs, requirements, and risks are visible before commitment. Studio traits change how attractive a gambit is, while preserving its meaningful trade-off.

Record the chosen gambit and its outcome with the finished game.

### Industry Opportunities

Create roughly 6–10 reusable situations grounded in actual company, market, or character state.

Examples:

- An experimental success attracts press interest: make an ambitious public commitment for more attention, or keep expectations modest.
- A rival abandons its specialty after repeated failures, creating an opening the player can investigate or pursue.
- A studio known for safe releases receives a creative challenge that rewards a successful unfamiliar project.
- A struggling company encounters an opportunity to make a smaller recovery project, changing the trade-off between survival and ambition.

Authored event templates provide the situations. Current state determines who is involved, which options make sense, and what can happen afterward. Store consequential commitments so later events can refer to them.

Use an unobtrusive indicator and concise choices. Information can remain in the industry feed; decisions appear when they are relevant. Any deadline is explicit.

The first pool uses implemented effects on projects, money, fans, research, market behavior, and memories. Personnel transfers and publishing negotiations join once their supporting systems exist.

**Done when:** opportunities and gambits create decisions that depend on this run, and players sometimes make a choice they would reject with another build.

---

## v0.4.0 - Rivalries & Turning Points

Connect builds, personalities, memories, and results into longer stories.

**Builds on:** v0.2.5 founders (their personalities and memories are what react), v0.2.0 trait tags (rivals read the player's build), and v0.3.0 gambits/opportunities (a turning point can reference a past commitment).

**What ships:**

- Emergent rivalries: relationships between the player and rivals, and between rivals themselves, built from real outcomes instead of a hidden meter.
- Defining Moments: the full set of roughly 5–10 rare, campaign-shaping choices, keyed to what actually happened rather than a level-up schedule.

### Emergent rivalries

- Competition, imitation, repeated defeats, and abandoned opportunities create relationships with concrete causes.
- Personality shapes the response: a founder may confront, imitate, avoid, or outlast a competitor.
- Relationship descriptions explain history: “Lost the strategy lead to your studio” is more useful than an unexplained hostility score.
- Every displayed relationship has an observable consequence for behavior or available opportunities.
- A rare leadership change can alter an established rival's direction while preserving the company's history. Wider character careers come later.

A possible sequence:

> Your unusual strategy game becomes a hit. An opportunistic competitor follows it. A proud specialist commits to defending its reputation. Competition increases saturation, and its expensive release disappoints. The opportunist moves on; the specialist becomes determined to reclaim the genre.

Each step comes from reusable rules and real outcomes. Different founders, releases, or player choices can send the sequence elsewhere.

### Defining Moments

Rare choices — roughly 5–10 across a full campaign — respond to events that actually happened:

- **Overnight Sensation:** a breakthrough release offers different ways to develop the studio's new identity.
- **On the Brink:** serious financial pressure creates a chance to adopt a leaner approach or commit to a risky recovery.
- **Outgrowing the Formula:** a once-reliable specialty begins to struggle, prompting a choice between reinvention and renewed commitment.
- **The Rival Falls:** an established competitor's collapse changes the opportunities around its former specialty.

Moments can offer trait evolution, a replacement, or a lasting commitment. Costs and consequences are visible. A difficult period can redirect a company without automatically locking it into permanent decline.

**Done when:** a campaign contains memorable stories connecting multiple systems, with meaningful room for the player to respond.

---

## v0.5.0 - Industry History & Reasons to Replay

Make each campaign's identity and consequences easy to revisit.

**Builds on:** every system from v0.2.0 through v0.4.0 — this version's entire job is to record and surface what they produced, not to add new mechanics of its own.

- **Run timeline:** releases, booms, saturation crises, conditions, trait choices, gambits, founder decisions, and defining moments.
- **Causal connections:** show which earlier release, decision, or setback contributed to an important later development.
- **Studio legacy:** summarize what the company became known for and how its identity changed.
- **Character histories:** revisit a founder's breakthrough, obsession, retreat, recovery, or departure.
- **End-of-run recap:** recognize different accomplishments, including financial success, influential games, experimentation, persistence, and successful reinvention.
- **Shared seeds:** expose the seed and record the mod version and relevant settings alongside it. Shared starting conditions can produce different histories through player decisions.
- **Deeper doctrine content:** add selected trait variants, gambits, and opportunities after the base builds have been tested across repeated runs.

Seeded systems must continue consistently across save/load. Keep the external condition schedule independent of random draws used by player opportunities. Cross-version reproduction is only promised where compatibility is explicitly supported.

If permanent unlocks are added, prioritize extra possibilities and starting options. The first run should already contain a complete, viable experience.

**Done when:** after two campaigns, players can explain why they built different studios and tell different stories about the industry around them.

---

## Expansion toward v1.0

These expand the proven core. Each must pass the Expansion Rule below.

| Version | Theme | What makes it worth adding |
|---|---|---|
| **v0.6.0** | **Legacy & Audiences** | Deeper franchise identity, sequels, audience expectations, cult followings, fatigue, and rival IP make past releases shape future choices. |
| **v0.7.0** | **Life After Launch** | Patches, ports, expansions, DLC, remasters, and ongoing support create competing uses for time and resources. Routine upkeep stays manageable. |
| **v0.8.0** | **People, Studios & Publishing** | Staff ambitions, creative disagreements, departures, new studios, publisher deals, funding, and acquisitions let people and opportunities move through the industry. |
| **v0.9.0** | **Console Wars** | Platform audiences, support, exclusivity, and dynamic competition change where different studios can succeed. |
| **v1.0.0** | **Living Industry** | Integrated balance, compatibility, polished explanations, complete histories, and optional shorter scenarios support repeated play. |

The character ambition grows in v0.8: a designer can leave a failing company and return years later with a small studio, keeping their specialty and memories. A cautious successor can redirect an aggressive rival. A publisher can favor creators it previously helped succeed.

After-launch features must earn their place through decisions. A remaster becomes interesting when franchise history, audience demand, platform fit, and studio strengths make its value situational. The same standard applies to acquisitions, contracts, and exclusivity.

### Expansion Rule

A major feature should:

1. Interact meaningfully with at least two existing systems.
2. Create a decision, a persistent consequence, or a different viable way to play.
3. Have a small version that proves its value before receiving extensive content or simulation.

## Beyond v1.0 - Directions to explore

Engine and technology competition; online games and distribution changes; regional audiences; deeper alternate industry histories; an optional platform-holder endgame; and an extension API for other mods.

These remain possibilities. The core promise takes priority over the feature count.

---

## Revisit later - possible optimization points

None of these block the current plan. They're flagged here so a full-length campaign, or the version that grows the relevant system further, can confirm whether they're still cheap enough before the pool grows past this point.

- **Timeline and history storage (v0.5.0+):** cap and compact recorded entries so a long campaign's save doesn't grow without bound; check actual save size once the timeline is recording for real.
- **Rival roster at scale (v0.2.5+):** founder memories, relationships, and Defining Moments per rival should stay small and bounded per studio; recheck once the whole roster carries a full persona instead of just release stats.
- **Weekly market tick cost (ongoing):** each genre's tick already touches several layers (target, momentum, saturation); revisit only if a later system (conditions, opportunities) adds meaningful per-tick work on top.
- **Opportunity and gambit pool growth (v0.3.0+):** eligibility filtering across a growing pool should stay simple; recheck if the pool approaches the size of the trait pool (~12).

---

## Principles that decide what gets in

1. **Make another run worth starting.** Vary available tools, circumstances, people, and commitments so experience helps the player adapt.
2. **Let builds feel powerful.** Reward coherent combinations while retaining meaningful costs and competing opportunities.
3. **Make personalities affect behavior.** A character's motives and memories must influence something the player can observe.
4. **Give surprises understandable causes.** Use seeded uncertainty among plausible possibilities, with signals that help the player form expectations.
5. **Let the world act independently.** Rivals pursue ambitions and respond to one another as well as to the player.
6. **Carry consequences forward.** Important decisions change later behavior, opportunities, or history. Record their causes when they occur.
7. **Preserve the game-making core.** People and events enrich project creation, research, growth, and progression. Familiar foundational rules remain learnable.
8. **Protect agency and recovery.** Serious setbacks can change a run's direction. Avoid unanswerable cascades and check combined effects across systems.
9. **Earn attention.** Explain what matters, keep routine activity quiet, and interrupt only for consequential choices or major moments.
10. **Prove the smallest fun version.** Test complete interactions in played campaigns before expanding the content pool.

The final test for every major update:

> Did this help the player build a different company, make an interesting decision, or experience a story they could not have planned?
