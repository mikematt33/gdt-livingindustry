(function () {
	LivingIndustry.Rivals = {};

	var namePrefixes = ['Silver', 'Iron', 'Neon', 'Crimson', 'Northwind', 'Quiet', 'Bright', 'Copper', 'Lunar', 'Rustic'];
	var nameSuffixes = ['Forge', 'Circuit', 'Harbor', 'Peak', 'Grove', 'Works', 'Collective', 'Interactive', 'Studio', 'Labs'];

	var randomBetween = function (min, max) {
		return min + Math.random() * (max - min);
	};

	var randomName = function (usedNames) {
		var name, attempts = 0;
		do {
			name = namePrefixes[Math.floor(Math.random() * namePrefixes.length)] + ' ' +
				nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
			// Only 100 combinations exist; past a sane roster size, disambiguate instead of spinning.
			if (++attempts > 200)
				name += ' ' + attempts;
		} while (usedNames.hasOwnProperty(name));
		usedNames[name] = true;
		return name;
	};

	// 1 or 2 genres this studio favours, out of the 6 - used to weight (not lock) their releases.
	var pickPreferredGenres = function () {
		var shuffled = LivingIndustry.State.GENRE_IDS.slice().sort(function () {
			return Math.random() - 0.5;
		});
		return shuffled.slice(0, 1 + Math.floor(Math.random() * 2));
	};

	// Fills in a roster only if one doesn't already exist - covers both a fresh new game and an
	// old save predating this system. Never regenerates over an existing (already-persisted) roster.
	// baseWeek is the save's current week so a backfilled roster's first releases are spread out
	// ahead of "now" instead of all firing on the first tick.
	LivingIndustry.Rivals.ensureRoster = function (baseWeek) {
		var data = LivingIndustry.State.get();
		if (data.rivals && data.rivals.length > 0)
			return;
		if (!LivingIndustry.State.isFiniteNumber(baseWeek))
			baseWeek = 0;

		var cfg = LivingIndustry.CONFIG.rivals;
		var usedNames = {};
		var roster = [];
		for (var i = 0; i < cfg.count; i++) {
			roster.push({
				id: 'rival-' + i,
				name: randomName(usedNames),
				preferredGenres: pickPreferredGenres(),
				quality: Number(randomBetween(cfg.qualityMin, cfg.qualityMax).toFixed(3)),
				risk: Number(randomBetween(cfg.riskMin, cfg.riskMax).toFixed(3)),
				cadence: Math.round(randomBetween(cfg.cadenceMinWeeks, cfg.cadenceMaxWeeks)),
				nextReleaseWeek: baseWeek + Math.round(randomBetween(cfg.cadenceMinWeeks, cfg.cadenceMaxWeeks))
			});
		}
		data.rivals = roster;
	};

	var randomGenre = function () {
		var all = LivingIndustry.State.GENRE_IDS;
		return all[Math.floor(Math.random() * all.length)];
	};

	// 80% of the time picks one of the studio's preferred genres, otherwise any genre - so a
	// studio has a clear identity without being fully locked to it.
	var pickGenre = function (studio) {
		var preferred = Array.isArray(studio.preferredGenres) ? studio.preferredGenres : [];
		if (preferred.length > 0 && Math.random() < 0.8) {
			var genreId = preferred[Math.floor(Math.random() * preferred.length)];
			if (LivingIndustry.State.GENRE_IDS.indexOf(genreId) >= 0)
				return genreId;
		}
		return randomGenre();
	};

	// Resolves one studio's release: rolls a quality result around the studio's average (spread by
	// its risk tendency), then pushes the genre's momentum/saturation through the shared market
	// release path - the weekly market step (market/market.js) carries that into demand over time,
	// and existing industry news (events/news.js) reports on whatever trend/zone change results.
	var resolveRelease = function (studio, currentWeek) {
		var cfg = LivingIndustry.CONFIG.rivals;
		var genreId = pickGenre(studio);
		var average = LivingIndustry.State.isFiniteNumber(studio.quality) ? studio.quality : (cfg.qualityMin + cfg.qualityMax) / 2;
		var risk = LivingIndustry.State.isFiniteNumber(studio.risk) ? studio.risk : cfg.riskMin;
		var quality = (average + (Math.random() * 2 - 1) * risk).clamp(0, 1);

		var outcome = quality >= cfg.hitThreshold ? 'hit' : (quality <= cfg.flopThreshold ? 'flop' : 'average');
		var momentum = outcome === 'hit' ? cfg.hitMomentumBoost : (outcome === 'flop' ? -cfg.flopMomentumPenalty : 0);

		LivingIndustry.Market.applyRelease({
			genreId: genreId,
			saturation: cfg.releaseSaturationBump,
			momentum: momentum,
			cause: { type: 'rival_' + outcome, rivalId: studio.id, name: studio.name, quality: Number(quality.toFixed(2)) }
		});

		if (outcome === 'hit')
			LivingIndustry.News.announce(studio.name + ' scores a hit with a new ' + genreId +
				' game, turning heads across the industry.');
		else if (outcome === 'flop')
			LivingIndustry.News.announce(studio.name + '\'s latest ' + genreId +
				' release flops, denting confidence in the genre.');

		var cadence = LivingIndustry.State.isFiniteNumber(studio.cadence) && studio.cadence >= 1 ? studio.cadence : cfg.cadenceMinWeeks;
		studio.nextReleaseWeek = currentWeek + cadence;
		LivingIndustry.log('[Living Industry] rivals: ' + studio.name + ' released a ' + genreId +
			' game (quality ' + quality.toFixed(2) + ', ' + outcome + ')');
	};

	// Called once per market tick (see market/market.js), before that week's momentum-to-demand
	// step, so a release resolved this week is already reflected in this week's demand.
	LivingIndustry.Rivals.onMarketTick = function () {
		var data = LivingIndustry.State.get();
		if (!data.rivals || data.rivals.length === 0)
			return;

		var currentWeek = Math.floor(GameManager.company.currentWeek);
		for (var i = 0; i < data.rivals.length; i++) {
			var studio = data.rivals[i];
			if (!studio)
				continue;
			// A missing/corrupt schedule would otherwise never release (undefined comparisons are false).
			if (!LivingIndustry.State.isFiniteNumber(studio.nextReleaseWeek))
				studio.nextReleaseWeek = currentWeek;
			if (currentWeek >= studio.nextReleaseWeek)
				resolveRelease(studio, currentWeek);
		}
	};

	LivingIndustry.Rivals.init = function () {
		// Roster creation/backfill happens via ensureRoster(), called from core/persistence.js.
	};
})();
