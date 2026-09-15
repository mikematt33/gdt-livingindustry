(function () {
	// Displayed mod version; keep in sync with package.json.
	LivingIndustry.VERSION_LABEL = '0.1.1';
	// Persisted state-shape version (not the mod version). Bump when the saved shape changes;
	// see core/state.js ensureDefaults()/migrate(). v2: per-genre recentCauses. v3: sliderMemory.
	// v4: meta.seed/rngState, per-genre target/nextTargetWeek.
	LivingIndustry.VERSION = 4;

	LivingIndustry.CONFIG = {
		debug: true, // set false before sharing a build
		useRandomMarket: true, // false = deterministic drift only (base step + reversion, no taste shifts), for hand verification

		// Two layers per genre. Slow: every cycleMin..cycleMax weeks a genre draws a new taste `target`
		// and demand reverts toward it, so HOT/COLD are year-long plateaus a player can plan a game
		// around. Fast: momentum (noise + release nudges) decaying over ~3 months rides on top.
		market: {
			demandMin: 0.3,
			demandMax: 2.5,
			momentumMin: -0.05,
			momentumMax: 0.05,
			baseMomentumStep: 0, // constant weekly nudge; 0 leaves movement to noise, releases and reversion
			momentumRandomness: 0.002,
			momentumDecayPerWeek: 0.08, // fraction of momentum lost each week (half-life ~8 weeks; a release's push fades over ~3 months)
			demandReversion: 0.05, // fraction of the demand->target gap closed per week (about 3/4 of a shift lands within 6 months)

			// A new taste target is drawn from one of these bands (weights are relative). The bands sit
			// clear of news.hotDemand/coldDemand (1.5/0.6) so a plateau reads as HOT or COLD for its whole
			// cycle instead of flickering across the threshold.
			targetBands: [
				{ weight: 0.15, min: 1.65, max: 1.95 }, // in fashion
				{ weight: 0.7, min: 0.75, max: 1.35 }, // ordinary
				{ weight: 0.15, min: 0.4, max: 0.5 } // out of fashion
			],
			cycleMinWeeks: 104, // weeks a target holds before the genre draws a new one (2-4 years, so a HOT genre at concept time is usually still hot at release)
			cycleMaxWeeks: 208,
			trendGap: 0.1, // |target - demand| at/above this shows as a rising/falling arrow (Market Pulse, trend news)

			// Saturation decays toward 0 and dampens momentum; rivals/rivals.js bumps it on every rival
			// release, and momentum on hits/flops.
			saturationMin: 0,
			saturationMax: 3,
			saturationDecayPerWeek: 0.05, // fraction of current saturation lost each week (half-life ~14 weeks)
			saturationMomentumDamping: 0.15, // fraction of positive momentum drift cancelled per point of saturation

			// New game only (see Market.randomizeStart): each genre draws a target, starts within this
			// offset of it, and gets its own cycle phase, so every run starts with a different landscape.
			startDemandVariance: 0.3,
			startMomentumVariance: 0.01,

			// Each genre keeps a short structured log of what moved it (see Market.applyRelease), for
			// the future Market Pulse tooltips/timeline. Oldest entries are dropped past this cap.
			maxRecentCauses: 8
		},

		// Bounded modifier applied to a release's Sales.calculateSales() result; demand of 1 is neutral.
		integration: {
			salesSensitivity: 0.15,
			salesModifierMin: 0.85,
			salesModifierMax: 1.15
		},

		// integration/player.js: the player's own releases feed the same market model rivals use.
		// Success is measured by the vanilla review score (game.score, 1-10), which is normalized
		// across eras/company sizes in a way raw sales cash is not. Every release adds saturation;
		// the score band only decides the direction/strength of the momentum change.
		player: {
			enabled: true,
			breakoutScore: 9, // score >= this: breakout hit
			hitScore: 8, // score >= this: hit
			flopScore: 6, // score < this: flop (6.0-7.9 is average)
			majorFlopScore: 4, // score < this: major flop
			breakoutMomentum: 0.02,
			hitMomentum: 0.01,
			averageMomentum: 0, // 6.0-7.9 releases only add saturation
			flopMomentum: -0.01,
			majorFlopMomentum: -0.02,
			releaseSaturationBump: 0.2, // base saturation added per player release, before size scaling
			saturationBySize: { small: 0.75, medium: 1, large: 1.25, aaa: 1.5 }, // unknown size uses 1
			saturationBumpMax: 0.5 // hard cap on a single release's saturation contribution
		},

		// events/news.js: hot/cold thresholds (separate from the hard demandMin/Max bounds) plus
		// anti-spam controls, since rivals and player releases can now push momentum back and forth.
		// Delivery (sidebar toast / popup / off) and whether trend reversals are reported are player
		// settings - see `settings` below.
		news: {
			hotDemand: 1.5,
			coldDemand: 0.6,
			trendMomentum: 0.01, // fallback trend threshold on |momentum| when a genre has no taste target (partial state)
			genreCooldownWeeks: 12 // min weeks between trend/zone news items about the same genre
		},

		// rivals/rivals.js: a generated roster of competitor studios that periodically "release" games,
		// nudging the same market state a player release does (see integration/player.js).
		rivals: {
			count: 8, // roster size, generated once per save (ensureRoster) and then persisted
			cadenceMinWeeks: 6, // weeks between releases for a given studio
			cadenceMaxWeeks: 20,
			qualityMin: 0.3, // 0-1 average release quality a studio rolls around
			qualityMax: 0.9,
			riskMin: 0.1, // 0-1 how wildly a studio's actual release quality can swing from its average
			riskMax: 0.9,
			hitThreshold: 0.75, // rolled quality at/above this counts as a hit
			flopThreshold: 0.35, // rolled quality at/below this counts as a flop
			hitMomentumBoost: 0.006,
			flopMomentumPenalty: 0.006,
			releaseSaturationBump: 0.15, // added to the genre's saturation on every rival release, hit or flop
			newsMinQuality: 0.6 // only studios whose average quality is at/above this make hit/flop headlines
		},

		// integration/learning.js: staff pick up skill points while producing work ("learn by doing").
		// Rolled per point bubble (Character.spawnPoints); a hit adds gainMin..gainMax skill points
		// (staff-panel units) to a skill weighted by the kind of work. Chance shrinks as the skill
		// approaches maxSkill, so this supplements training early and fades later.
		learning: {
			chancePerPoint: 0.04,
			gainMin: 1,
			gainMax: 3,
			maxSkill: 900, // staff-panel units; matches the highest vanilla training cap
			minLearnFactor: 0.1, // floor on the diminishing multiplier (1 - skill / maxSkill)
			skillWeights: { // point type -> relative odds of which skill improves
				d: { d: 0.8, t: 0.2 },
				t: { t: 0.8, d: 0.2 },
				r: { r: 1 },
				e: { t: 0.6, d: 0.4 } // engine work; bug bubbles ('b') teach nothing
			}
		},

		// ui/marketPulse.js: display thresholds for the compact per-genre readout.
		ui: {
			saturationWarn: 0.5, // saturation at/above this shows the "crowded" flag
			maxCausesShown: 5, // recent causes listed in a genre's tooltip

			// ui/titleMenu.js: the title screen is laid out for the game's 1024x768 minimum and scaled
			// up with the window (never down). sunrays* describe the vanilla images/sunrays.png: its
			// pixel size and how far the sun's centre sits from the image centre (vanilla shifts the
			// image by -10/-70px to compensate). The mod draws the rotating sunrays itself on a
			// window-sized canvas, sized to the window diagonal so it covers the corners of any monitor;
			// the vanilla fixed 2990px CSS-animated layer drops out to black on this old Chromium.
			titleMenu: {
				baseWidth: 1024,
				baseHeight: 768,
				baseFontPx: 16.5, // menu root font-size at scale 1 (everything in the menu is in em)
				maxScale: 2.25,
				sunraysImageSize: 2990,
				sunraysCentreOffsetX: 10,
				sunraysCentreOffsetY: 70,
				sunraysMargin: 200 // extra diameter beyond the window diagonal so the off-centre sun still covers the corners
			}
		},

		// Defaults for player-facing toggles (Settings > Living Industry tab). Values the player changes are
		// stored app-wide via gdt-modAPI's store.settings and read through LivingIndustry.Settings.get().
		settings: {
			// Display / QoL (never affect gameplay outcomes)
			showDevProgress: true, // ui/devProgress.js: extra status-bar row while developing
			showFocusPercent: true, // ui/focusPercent.js: % labels on the Development Stage time-allocation bar
			showMarketPulse: true, // ui/marketPulse.js panel
			marketPulseCollapsed: false, // remembered when the player collapses the panel
			marketTooltips: false, // native hover tooltips (demand/momentum/causes) on Market Pulse rows and the concept market line
			uiScale: 1, // multiplier for Living Industry's own overlays (Market Pulse); vanilla UI is untouched
			instantReviews: true, // ui/instantReviews.js: skip the review reveal animation
			newsDelivery: 'sidebar', // 'sidebar' (non-blocking, auto-dismissing) | 'popup' | 'off'
			trendNews: false, // also report trend reversals (rising <-> falling); Market Pulse shows these anyway
			tutorialTips: true, // ui/tutorial.js: welcome after company creation + one-time tips per run; "Don't show again" clears it
			titleMenu: true, // ui/titleMenu.js: Continue/New/Load/... buttons on the title screen instead of click-anywhere (read at startup)

			// Assists (gameplay help). assistsEnabled is the master switch: when false every key listed
			// in assistKeys below reads as false, whatever its own stored value.
			assistsEnabled: true,
			focusSliderMarks: true, // ui/focusPercent.js: +++/++/-/--/--- marks along each slider (hint mark highlighted)
			focusSnapMarks: true, // default for a new run's "Snap to marks" toggle (the run's own state lives in save meta.snapMarks)
			focusSnapControls: true, // ui/focusPercent.js: "Snap to hints" button in that dialog (the "Snap to marks" toggle comes with focusSliderMarks)
			focusSnapAuto: false, // snap sliders to the +++/++/--/--- hints every time the dialog opens
			rememberSliders: true, // ui/focusPercent.js: restore the last slider values used for the same topic/genre combo
			reviewPreview: true, // ui/releasePreview.js: slider-rule check badge on the "game is ready" screen
			conceptMarketHint: true, // ui/conceptHint.js: Market Pulse state for the chosen genre in the Game Concept dialog
			learnByDoing: true // integration/learning.js: staff gain skill points from the work they do
		}
	};

	LivingIndustry.CONFIG.assistKeys = ['focusSliderMarks', 'focusSnapMarks', 'focusSnapControls', 'focusSnapAuto',
		'rememberSliders', 'reviewPreview', 'conceptMarketHint', 'learnByDoing'];

	// Workshop mods (package id or name, matched case/space-insensitively) that implement the same
	// feature. While one is enabled the Living Industry toggle defaults to Off so gains don't double up;
	// a choice the player stored explicitly still wins.
	LivingIndustry.CONFIG.settingConflicts = {
		learnByDoing: ['LearnByDoing', 'Learn By Doing']
	};

	LivingIndustry.log = function (message) {
		if (!LivingIndustry.CONFIG.debug)
			return;
		console.log(message);
		if (typeof Logger !== 'undefined' && Logger.LogInfo)
			Logger.LogInfo(message);
	};

	LivingIndustry.error = function (message, e) {
		console.error(message, e);
		if (typeof Logger !== 'undefined' && Logger.LogModError)
			Logger.LogModError(message, e, 'Living Industry mod error');
	};
})();
