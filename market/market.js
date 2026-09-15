(function () {
	LivingIndustry.Market = {};

	// Bumped whenever market state changes, so presentation can cheaply detect "something moved".
	LivingIndustry.Market.revision = 0;

	var round4 = function (value) {
		return Number(value.toFixed(4));
	};

	var currentWeek = function () {
		var company = typeof GameManager !== 'undefined' && GameManager.company;
		var week = company && company.currentWeek;
		return LivingIndustry.State.isFiniteNumber(week) ? Math.floor(week) : 0;
	};

	var targetOf = function (genreState) {
		return LivingIndustry.State.isFiniteNumber(genreState.target) ? genreState.target : 1;
	};

	// Picks a taste band by weight, then a level inside it.
	var drawTarget = function () {
		var cfg = LivingIndustry.CONFIG.market;
		var bands = cfg.targetBands;
		var total = 0;
		for (var i = 0; i < bands.length; i++)
			total += bands[i].weight;
		var roll = LivingIndustry.Rng.random() * total;
		var band = bands[bands.length - 1];
		for (var j = 0; j < bands.length; j++) {
			roll -= bands[j].weight;
			if (roll < 0) {
				band = bands[j];
				break;
			}
		}
		return round4(LivingIndustry.Rng.between(band.min, band.max).clamp(cfg.demandMin, cfg.demandMax));
	};

	var recordCause = function (genreState, cause) {
		if (!Array.isArray(genreState.recentCauses))
			genreState.recentCauses = [];
		genreState.recentCauses.push(cause);
		while (genreState.recentCauses.length > LivingIndustry.CONFIG.market.maxRecentCauses)
			genreState.recentCauses.shift();
	};

	// Slow layer: when a genre's cycle runs out it draws a new taste target and holds it for
	// 1-3 years. Left alone in deterministic mode so hand verification only sees the reversion.
	var maybeShiftTarget = function (genreState, week) {
		var cfg = LivingIndustry.CONFIG.market;
		if (!LivingIndustry.CONFIG.useRandomMarket)
			return;
		if (LivingIndustry.State.isFiniteNumber(genreState.nextTargetWeek) && week < genreState.nextTargetWeek)
			return;
		var previous = targetOf(genreState);
		genreState.target = drawTarget();
		genreState.nextTargetWeek = week + Math.round(LivingIndustry.Rng.between(cfg.cycleMinWeeks, cfg.cycleMaxWeeks));
		recordCause(genreState, { type: 'taste_shift', week: week, direction: genreState.target >= previous ? 'up' : 'down' });
	};

	// Weekly step. Fast layer: momentum (noise + release nudges) decays toward zero and moves demand,
	// so a hit or flop redirects a genre for a few months. Slow layer: demand closes a fixed fraction
	// of its gap to the taste target each week, independent of momentum, so plateaus are reached
	// without overshoot. CONFIG.useRandomMarket=false leaves only the deterministic base step + pull,
	// which is what makes the tick easy to verify by hand.
	var stepGenre = function (genreState, week) {
		var cfg = LivingIndustry.CONFIG.market;
		maybeShiftTarget(genreState, week);
		var drift = cfg.baseMomentumStep;
		if (LivingIndustry.CONFIG.useRandomMarket)
			drift += (LivingIndustry.Rng.random() * 2 - 1) * cfg.momentumRandomness;
		var pull = (targetOf(genreState) - genreState.demand) * cfg.demandReversion;

		// Saturation (fed by rival and player releases) dampens upward movement while elevated.
		var damping = 1 - (cfg.saturationMomentumDamping * genreState.saturation).clamp(0, 1);
		if (drift > 0)
			drift *= damping;
		if (pull > 0)
			pull *= damping;
		var saturation = (genreState.saturation * (1 - cfg.saturationDecayPerWeek)).clamp(cfg.saturationMin, cfg.saturationMax);

		var momentum = (genreState.momentum * (1 - cfg.momentumDecayPerWeek) + drift).clamp(cfg.momentumMin, cfg.momentumMax);
		var demand = (genreState.demand + momentum + pull).clamp(cfg.demandMin, cfg.demandMax);
		genreState.momentum = round4(momentum);
		genreState.demand = round4(demand);
		genreState.saturation = round4(saturation);
	};

	// The one place a release (rival or player) touches the market, so both use identical clamping
	// and leave the same kind of compact cause entry behind for Market Pulse tooltips/timelines.
	// effect: { genreId, saturation, momentum, cause: { type, ... } }. Returns the applied deltas or null.
	LivingIndustry.Market.applyRelease = function (effect) {
		var cfg = LivingIndustry.CONFIG.market;
		var data = LivingIndustry.State.get();
		var genreState = effect && effect.genreId && data.market && data.market[effect.genreId];
		if (!genreState)
			return null;

		var saturationDelta = LivingIndustry.State.isFiniteNumber(effect.saturation) ? effect.saturation : 0;
		var momentumDelta = LivingIndustry.State.isFiniteNumber(effect.momentum) ? effect.momentum : 0;

		var beforeSaturation = genreState.saturation;
		var beforeMomentum = genreState.momentum;
		genreState.saturation = round4((genreState.saturation + saturationDelta).clamp(cfg.saturationMin, cfg.saturationMax));
		genreState.momentum = round4((genreState.momentum + momentumDelta).clamp(cfg.momentumMin, cfg.momentumMax));

		var applied = {
			saturation: round4(genreState.saturation - beforeSaturation),
			momentum: round4(genreState.momentum - beforeMomentum)
		};

		var cause = effect.cause || {};
		cause.week = currentWeek();
		cause.saturation = applied.saturation;
		cause.momentum = applied.momentum;
		recordCause(genreState, cause);

		LivingIndustry.Market.revision++;
		return applied;
	};

	// Where a genre is heading over the coming months: the slow layer (taste target vs demand)
	// decides, so the Market Pulse arrow doesn't flicker with weekly noise. A partial state without
	// a target (older data, tests) falls back to the sign of momentum.
	LivingIndustry.Market.trendOf = function (genreState) {
		var g = genreState || {};
		if (LivingIndustry.State.isFiniteNumber(g.target) && LivingIndustry.State.isFiniteNumber(g.demand)) {
			var gap = g.target - g.demand;
			var trendGap = LivingIndustry.CONFIG.market.trendGap;
			return gap >= trendGap ? 'rising' : (gap <= -trendGap ? 'falling' : 'flat');
		}
		var momentum = LivingIndustry.State.isFiniteNumber(g.momentum) ? g.momentum : 0;
		var threshold = LivingIndustry.CONFIG.news.trendMomentum;
		return momentum >= threshold ? 'rising' : (momentum <= -threshold ? 'falling' : 'flat');
	};

	LivingIndustry.Market.tick = function () {
		var data = LivingIndustry.State.get();
		var week = currentWeek();
		LivingIndustry.Rivals.onMarketTick();
		for (var genreId in data.market) {
			if (data.market.hasOwnProperty(genreId))
				stepGenre(data.market[genreId], week);
		}
		data.meta.lastTickWeek = week;
		LivingIndustry.Market.revision++;
		LivingIndustry.log(LivingIndustry.Market.getDebugSummary());
		LivingIndustry.News.onMarketTick();
	};

	LivingIndustry.Market.getDebugSummary = function () {
		var data = LivingIndustry.State.get();
		var parts = [];
		for (var genreId in data.market) {
			if (!data.market.hasOwnProperty(genreId))
				continue;
			var g = data.market[genreId];
			var direction = g.momentum > 0.0005 ? 'rising' : (g.momentum < -0.0005 ? 'falling' : 'flat');
			parts.push(genreId + ': demand=' + g.demand.toFixed(3) + ' (' + direction + ', target ' + targetOf(g).toFixed(2) + ')' +
				(g.saturation > 0.0005 ? ' sat=' + g.saturation.toFixed(3) : ''));
		}
		return '[Living Industry] week ' + currentWeek() + ' - ' + parts.join(', ');
	};

	// Transient tracking hook kept for symmetry with News.onStateLoaded; the weekly step itself is
	// driven by the base game's weekProceeded event, which never fires on load/new game.
	LivingIndustry.Market.onStateLoaded = function () {
		LivingIndustry.Market.revision++;
	};

	// Gives each new game a distinct genre landscape instead of always starting flat at
	// demand=1/momentum=0: each genre draws its own taste target, starts near it, and gets its own
	// cycle phase. New game only - never called for old-save backfill.
	LivingIndustry.Market.randomizeStart = function () {
		var cfg = LivingIndustry.CONFIG.market;
		var data = LivingIndustry.State.get();
		for (var genreId in data.market) {
			if (!data.market.hasOwnProperty(genreId))
				continue;
			var g = data.market[genreId];
			g.target = drawTarget();
			g.nextTargetWeek = Math.round(LivingIndustry.Rng.between(cfg.cycleMinWeeks, cfg.cycleMaxWeeks));
			var demand = g.target + (LivingIndustry.Rng.random() * 2 - 1) * cfg.startDemandVariance;
			var momentum = (LivingIndustry.Rng.random() * 2 - 1) * cfg.startMomentumVariance;
			g.demand = round4(demand.clamp(cfg.demandMin, cfg.demandMax));
			g.momentum = round4(momentum.clamp(cfg.momentumMin, cfg.momentumMax));
		}
	};

	var safeTick = function () {
		try {
			LivingIndustry.Market.tick();
		} catch (e) {
			LivingIndustry.error('Living Industry market tick failed', e);
		}
	};

	LivingIndustry.Market.init = function () {
		if (!LivingIndustry.hookOnce('marketTick'))
			return;

		// gameplay.weekProceeded is defined in the base game's js/GDT.js and fired from
		// General.proceedOneWeek once per whole week crossed (including multi-week jumps), never on
		// load or new game - so there's nothing to de-duplicate ourselves.
		var weekKey = GDT.eventKeys && GDT.eventKeys.gameplay && GDT.eventKeys.gameplay.weekProceeded;
		if (weekKey) {
			GDT.on(weekKey, safeTick);
			return;
		}

		// Fallback for a base game without that event: poll the live week from a tick listener,
		// resuming from the persisted lastTickWeek so a load never re-runs the week it saved on.
		LivingIndustry.error('Living Industry market: gameplay.weekProceeded not available - falling back to week polling.');
		GameManager.addTickListener(function () {
			if (GameManager.loadInProgress)
				return;
			var week = currentWeek();
			if (week <= LivingIndustry.State.get().meta.lastTickWeek)
				return;
			safeTick();
		}, false);
	};
})();
