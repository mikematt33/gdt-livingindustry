# Living Industry - Roadmap

Where the mod is and where it is going. Versions are planning buckets, not promises. Features move when their dependencies are ready, and a small system gets expanded only after it has shown it creates good decisions. Everything below (scope, order, version numbers, and names) is a current best guess and will change as design and playtesting turn up new information.

The foundation is shipped through v0.1.1 as described below. Everything after that, including the v0.1.2 market additions and the v0.1.3 presentation pass, is planned.

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

The roguelike parts are about adapting, committing to a direction, and finding strong combinations. A recognizable strategy can remain satisfying throughout a run; later runs should offer different paths to success. The normal campaign remains the main experience, with shorter scenarios considered only once the core loop is proven.

## The core tension

> **Ride the wave, or find the gap.**

A rising genre or topic pays well, but everyone else can see it too, and crowding erodes it. An overlooked opening pays less on paper, but it can be yours. Most systems should restate this trade-off in a new form: Trend Chaser against Counterprogrammers, Crowded Shelves, the Trend Chase gambit, rival announcements, and opportunists who follow a hit into its genre. A player who learns the tension once should recognize it everywhere.

Two things keep the tension alive:

- **Success draws a crowd.** The bigger and more successful the studio, the more the industry reacts to it. A late-game studio should still face decisions with real money and reputation at stake, not just a growing bank balance.
- **Reading the market is a skill, not a lookup.** The present is visible; the future is a forecast with stated confidence. Better information is available, at a cost.

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

### Planned for v0.1.2 - A market worth reading

Every later system (traits, conditions, gambits, rivalries) multiplies the market signal. If the player cannot feel the market, they will not feel the builds layered on it either. These additions make the market strong, varied, contested, and uncertain before the roguelite layer depends on it.

- **Market strength check.** The current ±15% sales modifier sits beside a vanilla review score that moves sales far more, and 70% of taste targets land in the ordinary band. Measure whether timing is noticeable in a played campaign. If not, widen the effect where the core tension is sharpest (a hot, uncrowded genre pays more; a hot, crowded one can pay less than an ordinary one) rather than raising every number.
- **Topic trends.** The market currently tracks only the six genres. Give topics a lighter version of the same model: a few topics in fashion or out of fashion at a time, with headlines ("Zombie games are everywhere", "Space is out"). Topics add variety, story texture, and a second axis to the concept choice the player already makes every project. Start with a small, slow layer and check the per-tick cost.
- **Rival announcements.** Prominent rivals announce a genre, size, and rough release window several months ahead. A clash becomes a decision: delay, change genre, rush, or commit anyway. This gives the player something to do about rivals and gives the market an honest telegraph.
- **Rivals follow hits.** A simple bias in rival genre choice toward genres where the player recently had a hit. Success draws competition and saturation, which keeps the late game contested. Founders in v0.2.5 later replace the bias with personality-driven decisions.
- **Forecasts with a price.** Market Pulse shows the present and a forecast with stated confidence rather than a reliable arrow. An optional, paid market research report sharpens the forecast for a chosen genre or topic. Information becomes a resource, and the hottest genre stops being an automatic answer.

**Done when:** the foundation works through a played campaign, the player can understand its main effects, and the player can name a release where market timing (or a rival announcement) changed the outcome.

### Planned for v0.1.3 - A market you can see

The last version before the roguelite layer. v0.1.2 makes the market worth reading; this version makes it readable at a glance and makes the mod's surfaces feel like part of Game Dev Tycoon rather than a debug overlay sitting on top of it. No new simulation. Everything here is presentation, and the one rule is that the panel must say what the numbers mean without the player ever needing the numbers.

**Market Pulse redesign.** The panel today is text rows (genre, arrow, HOT/COLD, an italic note, a "crowded" flag) with demand, momentum, and saturation hidden in a title tooltip. Replace it with:

- **Four named states instead of two.** Demand and saturation combine into one label per genre so the core tension is literally on the panel: a hot genre with room (*ride the wave*), a hot genre that is crowded (the wave is breaking), a cold genre with room (*the gap*), and a cold, crowded genre (stay away). Names are placeholders until playtesting; the test is that a new player reads the label and knows what it is asking them.
- **Bars, not numbers.** Demand as a short filled bar, saturation as a second bar or hatching over it, the trend arrow kept. Raw values stay available in an expanded row for players who want them, never as the primary reading.
- **Short history.** A small sparkline per genre covering roughly the last two years, so the arrow has context ("falling from a long high" reads differently from "dipped last month"). Backed by a small, bounded ring of monthly samples per genre; check save size once it records.
- **Expand in place.** Clicking a row opens the cause list under it instead of relying on native tooltips, which are slow and easy to miss in the game's embedded browser. One row expanded at a time.
- **Change is the only animation.** A row highlights briefly when a genre changes state. Weekly ticks are too frequent to animate, and Quiet mode disables the highlight.
- **Room for v0.1.2.** Reserve a visual slot per row for the forecast and its confidence (a solid arrow for a confident forecast, a hollow or dotted one for an uncertain one) and for an announced rival release (a small marker with the studio name on hover). Those features land in v0.1.2 as text; this version gives them a proper home.

**Feel and fit.**

- One shared stylesheet for every mod surface, matching the vanilla status bar and dialogs: the game's palette, fonts, radius, and border weight. The Studio Identity panel in v0.2.0 and the expanded identity layer in v0.2.3 reuse it rather than inventing their own look.
- Collapse and expand with a short transition. Remember position (left or right edge, or docked under the status bar) and collapsed state per save.
- The Game Concept market line becomes a compact version of the same row (state label, bar, arrow) instead of a sentence, so the player sees the same thing in the dialog that they see on the panel.
- Industry news headlines use the same visual language and stay non-blocking.
- Never carry information on color alone. Every state has a label and a shape as well as a color, the palette is checked against common color blindness, and the panel stays legible at every uiScale setting.
- Render only when market state or settings change, as now. The redesign must not add per-tick work.

**Done when:** a player can state every genre's situation from the panel without opening a row or a tooltip, a screenshot of the panel reads as part of the base game, and someone who has never seen the tooltip numbers makes the same genre call as someone who has.

---

## v0.2.0 - Studio Traits

Give the player a persistent build: the first roguelite step, before Project Gambits and Industry Conditions layer on top of it.

**Builds on:** the stable v0.1.x market, including the v0.1.2 additions, and the v0.1.3 shared visual language. Traits need a market worth reacting to before they're worth choosing.

- The first trait draft follows the first completed game. Further drafts arrive at major milestones.
- Usually offer three traits and choose one. Offers are seeded, with some influenced by company history and some leaving room for a new direction.
- Begin with three active trait slots for the initial pool. Expand toward 4–6 only as the pool grows enough to preserve distinct builds. Replacement or evolution happens at clear milestones, with any transition cost shown beforehand.
- Traits change priorities, constraints, or opportunities. Numerical effects are fine when they force a decision.
- **Every trait has a stated, always-on cost** shown on its card next to its benefit. A trait that is pure upside is a stat boost, not a build. Strong combinations should feel powerful; their costs and limitations should remain relevant.
- Prefer traits that change what the player does over traits that only change how much they earn.
- A basic **Studio Identity panel** lists active traits with their benefits and costs, so the player can always see their build. It uses the v0.1.3 stylesheet and row treatment. The fuller identity and feedback layer follows in v0.2.3.

Initial candidates:

- **Counterprogrammers:** well-received games gain an advantage in genres with little recent competition. *Cost:* weaker results in hot or crowded genres. An overlooked opening can matter even when another genre is hotter.
- **Trend Chaser:** stronger gains from entering rising genres or topics. *Cost:* weaker results in flat or falling ones, so a fading trend hurts more.
- **Perfectionists:** an optional, costly polish commitment creates greater potential for an exceptional release. *Cost:* the studio must finance the extra time, and a merely good result from a perfectionist studio disappoints more.
- **Experimental Studio:** respectable releases using combinations absent from the studio's recent history produce extra learning or research. *Cost:* repeating a familiar combination earns less, and a repeated experiment eventually becomes familiar.
- **Genre Loyalists:** sustained, successful work in a genre builds a specialization that the player weighs against opportunities elsewhere. *Cost:* results outside the specialty are weaker. Changing direction remains possible.
- **Prototype Culture:** a successful small project can prepare the studio for a larger project in the same genre. Preparation is limited and consumed, giving small releases a role in an ambitious portfolio. *Cost:* large projects without preparation start at a disadvantage.

Start with 6–8 distinct traits. Expand toward 12 after playtesting shows that the initial choices support different companies. Each effect must be checked against the base game's review, research, and progression systems before joining the pool.

Traits carry internal tags such as Prestige, Experimental, Commercial, Efficient, Trend, Niche, Community, and Technology. Later systems (Gambits, Industry Conditions, Opportunities, Rivalries) recognize a build through these tags rather than reading traits directly.

**Done when:** at least three distinct trait-based studio approaches are viable, a player can describe their build using its traits, and a player has declined an attractive trait because of its cost.

---

## v0.2.1 - Project Gambits

Give every project a decision of its own, so each new game feels different from the last one.

**Builds on:** v0.2.0 traits (gambits read trait tags for eligibility and payoff) and the v0.1.2 market additions (announcements and forecasts give gambits something to respond to). Gambits don't need founders or opportunities, so they ship as soon as traits are stable.

An optional choice in the Game Concept dialog commits the current project to a clear trade-off. Ordinary development remains available.

Ship four to six gambits:

- **Focused Scope:** concentrate the project, trading ambition for a more manageable commitment.
- **Rush Development:** reach the market sooner while accepting development risks. Useful for beating an announced rival release.
- **Prestige Project:** commit additional resources to a release with higher expectations.
- **Experimental Design:** pursue an unfamiliar approach with greater learning potential and uncertainty.
- **Trend Chase:** commit to a rising opportunity whose value may change before release.

Eligibility follows the current situation. Costs, requirements, and risks are visible before commitment. Studio traits change how attractive a gambit is, but the trade-off stays.

Record the chosen gambit and its outcome with the finished game.

**Done when:** players choose different gambits for different projects in the same run, and the choice depends on the market, the competition, or the build rather than on a single best option.

---

## v0.2.2 - Industry Conditions

Make each run structurally different, on top of whatever traits the studio has drafted, and keep the late game contested.

**Builds on:** the v0.1.x market directly. Reads Studio Trait tags and changes gambit trade-offs once those exist, but a condition's own rules don't require a trait to exist first.

One clearly displayed condition changes the rules of the current era. Show the starting condition before play and signal major transitions early enough to influence project planning.

Initial candidates:

- **Indie Boom:** smaller releases have greater market influence, giving small studios more opportunity to shape the industry.
- **Review Culture:** review quality has a stronger effect on market influence and commercial results.
- **Crowded Shelves:** release-driven saturation lasts longer, making repeated entry into busy genres more costly.
- **Blockbuster Economy - later eras:** large releases have more pronounced upside and downside, increasing the importance of commitment and financial reserves.

Ship three starting conditions first. Starting conditions must affect decisions available to an early studio; introduce Blockbuster Economy when larger projects become available. Conditions should last long enough for several project decisions. Genre-specific booms such as an RPG Renaissance remain market developments that can occur within these conditions.

Conditions change during the campaign, not only at the start, and each transition is signaled early enough to change a project already in planning. Conditions are the tool for varying the early and middle of a run, when money still constrains choices. They are not the tool for late-game stakes: by then the player has millions and everything unlocked, so a condition that threatens or offers money pulls a lever that is already disconnected. Late-game stakes come from named competition (rivals that scale with the era, genre leads, awards in v0.2.5), rivalries (v0.4.0), and the legacy ambition (v0.5.0).

**Done when:** a run's starting condition visibly changes which early decisions make sense, without needing a tooltip to notice it, and at least one mid-campaign transition has made a player change a project they were already planning.

---

## v0.2.3 - Studio Identity & Feedback

Tie traits, gambits, and conditions together into something the player can see and recognize as their build.

**Builds on:** v0.2.0 Studio Traits, v0.2.1 Project Gambits, and v0.2.2 Industry Conditions directly. This version extends the basic v0.2.0 identity panel and has little new to show without them.

- Expand the Studio Identity panel to explain relevant conditions, recent gambits, and how they interact with active traits.
- An emerging doctrine names the dominant direction: Auteur Studio, Market Machine, Niche Specialist, or Technical Pioneer. It only describes the build; if playtesting shows nobody reads it, cut it rather than adding a progression system to justify it.
- Begin recording significant choices and their causes for the future timeline (this pays off in full at v0.5.0).
- Add a compact explanation of the mod's major contributions to a release result. Show measured effects; distinguish uncertain forecasts from known outcomes.

**Done when:** different trait, gambit, and condition combinations produce recognizably different opening plans, and the identity panel matches what a player would already say about their studio.

---

## v0.2.5 - People With Motives

Give the industry a small recurring cast whose decisions reflect their personalities and histories.

**Builds on:** the v0.1.x rival roster (founders are layered onto studios that already exist, replacing the simple v0.1.2 "rivals follow hits" bias), and loosely on v0.2.0's trait tags, since a founder's personality is designed to reinforce or push against the player's own build.

### Rival founders

Start with one named founder for each of a small set of prominent rivals. A founder has:

- **A motive:** recognition, growth, independence, or creative discovery.
- **An approach:** cautious, stubborn, opportunistic, or experimental.
- **A current ambition:** reclaim a genre, recover from failure, establish a specialty, or pursue a breakout hit.
- **A few significant memories:** a defining success, a costly failure, or a competitor that repeatedly challenged them.

Studio traits describe how a company operates. Founder personalities describe what a person values and how they pursue it. The two can reinforce each other or create tension.

### Decisions with consequences

Founders influence the rival behaviors the simulation can already express: genre choice, project ambition, risk, and whether to persist or change direction.

Each result updates their circumstances and memories. Filter available actions by what is currently possible, then let personality, ambition, pressure, and relevant memories influence how likely each action is. Seeded randomness selects among those possibilities. The next release produces new consequences.

Examples:

- A proud specialist becomes more determined after losing recognition in its strongest genre.
- A cautious founder retreats after repeated disappointments.
- An opportunist follows another studio's breakthrough into a newly promising genre.
- An experimental founder uses a successful release as the opportunity to try something unfamiliar.

Early financial pressure can be represented by a simple, clearly defined performance state based on rival results. A complete rival accounting system can wait.

Rivals also react to one another. Their stories continue while the player concentrates on their own projects.

### Rivals scale with the era

The late game only stays contested if the top rivals are the player's size. A rival roster that stays small while the player grows turns every scoreboard into a formality by year 15.

- Prominent rivals' project size and quality ceiling track the era, so the leading studios in year 25 release at the same tier as the player.
- Growth is uneven and personal: a founder's results, ambition, and memories decide who climbs and who stalls, so the leaders in year 25 are not necessarily the leaders in year 5.
- Rivals that fall far enough can fold, and a replacement studio can appear with a name and a reason, so the roster turns over across a campaign instead of being fixed at the start. Wider character careers (a founder leaving and returning with a new studio) wait for v0.8.
- Scaling is about who the player is competing against for leads and awards, not about raising the market's sales pressure. Rival growth must not become a tax on the player's sales.

### Charts and awards

Give the player a scoreboard with names on it before full rivalries exist.

- **Genre leaders.** Each genre shows which studio currently leads it, based on recent results. Taking a genre from a named rival is a clear, legible goal, and losing one is a clear signal.
- **Year-end industry awards.** A short annual recap names the year's standout games from the player and rivals, a few nominees per category. It surfaces the year's story in one screen and gives founders recognition to win or lose, which feeds their memories.
- Keep both compact and skippable; they summarize, they don't interrupt.

### Presentation

- Show the founder, personality, ambition, and recent history in the rival profile.
- Explain consequential decisions through short reports tied to what happened.
- Keep routine activity quiet. Reserve attention for a recognizable person doing something that matters.
- Preserve people, motives, memories, and pending decisions through save/load.

**Done when:** players recognize several founders, form expectations about them, occasionally see a surprising decision that still makes sense, can name the rival that leads a genre they care about, and in the late game have lost a lead or an award to a rival that grew alongside them.

---

## v0.3.0 - Opportunities & First Defining Moments

Give the player repeated opportunities to use their build and respond to the people around them.

**Builds on:** v0.2.0 traits (opportunities read trait tags for eligibility and payoff), v0.2.1 gambits (an opportunity can offer or modify a gambit), and v0.2.5 founders (opportunities reference live rival/founder state).

**What ships:**

- Roughly 6–10 Industry Opportunities, generated from live company, market, and founder state rather than drawn from a static event table.
- The first one or two Defining Moments, reusing the trait-draft path to prove out a non-milestone trigger ahead of the full set in v0.4.0.

### Industry Opportunities

Create roughly 6–10 reusable situations built from the current company, market, or character state.

Examples:

- An experimental success attracts press interest: make an ambitious public commitment for more attention, or keep expectations modest.
- A rival abandons its specialty after repeated failures, creating an opening the player can investigate or pursue.
- A studio known for safe releases receives a creative challenge that rewards a successful unfamiliar project.
- A struggling company encounters an opportunity to make a smaller recovery project, changing the trade-off between survival and ambition.

Authored event templates provide the situations. Current state determines who is involved, which options make sense, and what can happen afterward. Store consequential commitments so later events can refer to them.

Use an unobtrusive indicator and concise choices. Information can remain in the industry feed; decisions appear when they are relevant. Any deadline is explicit.

The first pool uses implemented effects on projects, money, fans, research, market behavior, and memories. Personnel transfers and publishing negotiations join once their supporting systems exist.

**Done when:** opportunities create decisions that depend on this run, and players sometimes make a choice they would reject with another build.

---

## v0.4.0 - Rivalries & Turning Points

Connect builds, personalities, memories, and results into longer stories.

**Builds on:** v0.2.5 founders (their personalities and memories are what react), v0.2.0 trait tags (rivals read the player's build), v0.2.1 gambits and v0.3.0 opportunities (a turning point can reference a past commitment), and the v0.2.5 charts and awards (lost genre leads and awards are memories with concrete causes).

**What ships:**

- Emergent rivalries: relationships between the player and rivals, and between rivals themselves, built from real outcomes instead of a hidden meter.
- Defining Moments: the full set of roughly 5–10 rare, campaign-shaping choices, keyed to what actually happened rather than a level-up schedule.

### Emergent rivalries

- Competition, imitation, repeated defeats, and abandoned opportunities create relationships with concrete causes.
- Personality shapes the response: a founder may confront, imitate, avoid, or outlast a competitor.
- Relationship descriptions explain history: "Lost the strategy lead to your studio" is more useful than an unexplained hostility score.
- Every displayed relationship has an observable consequence for behavior or available opportunities.
- A rare leadership change can alter an established rival's direction while preserving the company's history. Wider character careers come later.

A possible sequence:

> Your unusual strategy game becomes a hit. An opportunistic competitor follows it. A proud specialist commits to defending its reputation. Competition increases saturation, and its expensive release disappoints. The opportunist moves on; the specialist becomes determined to reclaim the genre.

Each step comes from reusable rules and real outcomes. Different founders, releases, or player choices can send the sequence elsewhere.

### Defining Moments

Rare choices, roughly 5–10 across a full campaign, respond to events that actually happened:

- **Overnight Sensation:** a breakthrough release offers different ways to develop the studio's new identity.
- **On the Brink:** serious financial pressure creates a chance to adopt a leaner approach or commit to a risky recovery.
- **Outgrowing the Formula:** a once-reliable specialty begins to struggle, prompting a choice between reinvention and renewed commitment.
- **The Rival Falls:** an established competitor's collapse changes the opportunities around its former specialty.

Moments can offer trait evolution, a replacement, or a lasting commitment. Costs and consequences are visible. A difficult period can redirect a company without automatically locking it into permanent decline.

**Done when:** a campaign contains memorable stories connecting multiple systems, and the player has room to respond to them.

---

## v0.5.0 - Industry History & Reasons to Replay

Make each campaign's identity and consequences easy to revisit.

**Builds on:** every system from v0.2.0 through v0.4.0. This version records and surfaces what they produced. Its one new mechanic is the legacy ambition, which exists to give the final stretch of a run a direction.

- **Legacy ambition.** Around the start of the last decade, the player can declare what this run is about: hold every genre lead at once, revive a dead genre, sweep the awards three years running, outlast a named rival, or make the studio's doctrine unmistakable. Chosen from a short list generated from the run so far, never assigned, and never penalized for failing. The ambition is what the end-of-run recap is written around. It answers the late-game problem directly: when money and unlocks no longer constrain, the player needs something to want that cannot be bought.
- **Run timeline:** releases, booms, saturation crises, conditions, trait choices, gambits, founder decisions, and defining moments.
- **Causal connections:** show which earlier release, decision, or setback contributed to an important later development.
- **Studio legacy:** summarize what the company became known for and how its identity changed.
- **Character histories:** revisit a founder's breakthrough, obsession, retreat, recovery, or departure.
- **End-of-run recap:** recognize different accomplishments, including financial success, influential games, experimentation, persistence, and successful reinvention, and tell the story of the legacy ambition, whether it was achieved or not.
- **Shared seeds:** expose the seed and record the mod version and relevant settings alongside it. Shared starting conditions can produce different histories through player decisions.
- **Deeper doctrine content:** add selected trait variants, gambits, and opportunities after the base builds have been tested across repeated runs.

Seeded systems must continue consistently across save/load. Keep the external condition schedule independent of random draws used by player opportunities. Cross-version reproduction is only promised where compatibility is explicitly supported.

If permanent unlocks are added, prioritize extra possibilities and starting options. The first run should already contain a complete, viable experience.

**Done when:** after two campaigns, players can explain why they built different studios, tell different stories about the industry around them, and describe what they were chasing in the last ten years of each run.

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
4. Preferably restate the core tension (ride the wave or find the gap) in a new form, rather than adding an unrelated one.

## Beyond v1.0 - Directions to explore

Engine and technology competition; online games and distribution changes; regional audiences; deeper alternate industry histories; an optional platform-holder endgame; and an extension API for other mods.

These remain possibilities. The core promise takes priority over the feature count.

---

## Revisit later - possible optimization points

None of these block the current plan. They're flagged here so a full-length campaign, or the version that grows the relevant system further, can confirm whether they're still cheap enough before the pool grows past this point.

- **Timeline and history storage (v0.5.0+):** cap and compact recorded entries so a long campaign's save doesn't grow without bound; check actual save size once the timeline is recording for real.
- **Rival roster at scale (v0.2.5+):** founder memories, relationships, and Defining Moments per rival should stay small and bounded per studio; recheck once the whole roster carries a full persona instead of just release stats.
- **Weekly market tick cost (ongoing):** each genre's tick already touches several layers (target, momentum, saturation). v0.1.2 topic trends multiply the number of tracked entries, so keep the topic layer lighter than the genre layer (fewer fields, or ticked less often) and revisit if conditions or opportunities add noticeable per-tick work on top.
- **Opportunity and gambit pool growth (v0.2.1+):** eligibility filtering across a growing pool should stay simple; recheck if the pool approaches the size of the trait pool (~12).

---

## Principles that decide what gets in

1. **Make another run worth starting.** Vary available tools, circumstances, people, and commitments so experience helps the player adapt.
2. **Let builds feel powerful.** Reward coherent combinations while keeping their costs and the competing opportunities relevant.
3. **Make personalities affect behavior.** A character's motives and memories must influence something the player can observe.
4. **Give surprises understandable causes.** Use seeded uncertainty among plausible possibilities, with signals that help the player form expectations.
5. **Let the world act independently.** Rivals pursue ambitions and respond to one another as well as to the player.
6. **Carry consequences forward.** Important decisions change later behavior, opportunities, or history. Record their causes when they occur.
7. **Preserve the game-making core.** People and events enrich project creation, research, growth, and progression. Familiar foundational rules remain learnable.
8. **Protect agency and recovery.** Serious setbacks can change a run's direction. Avoid unanswerable cascades and check combined effects across systems.
9. **Earn attention.** Explain what matters, keep routine activity quiet, and interrupt only for consequential choices or major moments.
10. **Prove the smallest fun version.** Test complete interactions in played campaigns before expanding the content pool.
11. **Keep success contested.** Growth should draw competition, crowding, and higher stakes, so the late game still asks real questions. Pressure comes from the world reacting, not from a flat tax on success. Once money no longer constrains the player, the stakes are names: genre leads, awards, rivalries, and the legacy the run is remembered for.

The final test for every major update:

> Did this help the player build a different company, make an interesting decision, or experience a story they could not have planned?
