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

	// Weekly step. Momentum decays toward zero and demand is pulled back toward neutral, so a hit or
	// flop redirects a genre for a while instead of pinning it at a bound forever; random noise (if
	// enabled) keeps genres drifting apart. CONFIG.useRandomMarket=false leaves only the
	// deterministic base step + reversion, which is what makes the tick easy to verify by hand.
	var stepGenre = function (genreState) {
		var cfg = LivingIndustry.CONFIG.market;
		var drift = cfg.baseMomentumStep;
		if (LivingIndustry.CONFIG.useRandomMarket)
			drift += (Math.random() * 2 - 1) * cfg.momentumRandomness;
		drift += (1 - genreState.demand) * cfg.demandReversion;

		// Saturation (fed by rival and player releases) dampens positive drift while elevated.
		if (drift > 0)
			drift *= 1 - (cfg.saturationMomentumDamping * genreState.saturation).clamp(0, 1);
		var saturation = (genreState.saturation * (1 - cfg.saturationDecayPerWeek)).clamp(cfg.saturationMin, cfg.saturationMax);

		var momentum = (genreState.momentum * (1 - cfg.momentumDecayPerWeek) + drift).clamp(cfg.momentumMin, cfg.momentumMax);
		var demand = (genreState.demand + momentum).clamp(cfg.demandMin, cfg.demandMax);
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
		if (!Array.isArray(genreState.recentCauses))
			genreState.recentCauses = [];
		genreState.recentCauses.push(cause);
		while (genreState.recentCauses.length > cfg.maxRecentCauses)
			genreState.recentCauses.shift();

		LivingIndustry.Market.revision++;
		return applied;
	};

	LivingIndustry.Market.tick = function () {
		var data = LivingIndustry.State.get();
		LivingIndustry.Rivals.onMarketTick();
		for (var genreId in data.market) {
			if (data.market.hasOwnProperty(genreId))
				stepGenre(data.market[genreId]);
		}
		data.meta.lastTickWeek = currentWeek();
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
			parts.push(genreId + ': demand=' + g.demand.toFixed(3) + ' (' + direction + ')' +
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
	// demand=1/momentum=0. New game only - never called for old-save backfill.
	LivingIndustry.Market.randomizeStart = function () {
		var cfg = LivingIndustry.CONFIG.market;
		var data = LivingIndustry.State.get();
		for (var genreId in data.market) {
			if (!data.market.hasOwnProperty(genreId))
				continue;
			var g = data.market[genreId];
			var demand = 1 + (Math.random() * 2 - 1) * cfg.startDemandVariance;
			var momentum = (Math.random() * 2 - 1) * cfg.startMomentumVariance;
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
