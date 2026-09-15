(function () {
	LivingIndustry.Integration = {};

	var original = null;

	// demand of 1 is neutral; deviation from 1 is scaled down and clamped so a hot/cold genre
	// nudges the outcome without overriding the game's own quality/score-driven sales curve.
	var computeModifier = function (genreId) {
		var data = LivingIndustry.State.get();
		var genreState = genreId && data && data.market && data.market[genreId];
		if (!genreState || !LivingIndustry.State.isFiniteNumber(genreState.demand))
			return 1;

		var cfg = LivingIndustry.CONFIG.integration;
		var deviation = (genreState.demand - 1) * cfg.salesSensitivity;
		return (1 + deviation).clamp(cfg.salesModifierMin, cfg.salesModifierMax);
	};

	// Wraps the base game's Sales.calculateSales(company, game) - called once when a game is
	// released (and repeatedly by the game's own score-sweep debug harness). We let the original
	// run untouched, then scale only the totalSalesCash it just added, by genre demand. Any
	// failure in our part leaves the vanilla result in place.
	var patched = function (company, game) {
		var before = (game && LivingIndustry.State.isFiniteNumber(game.totalSalesCash)) ? game.totalSalesCash : 0;
		var result = original.apply(this, arguments);
		try {
			applyModifier(game, before);
		} catch (e) {
			LivingIndustry.error('Living Industry sales modifier failed - vanilla sales kept', e);
		}
		return result;
	};

	var applyModifier = function (game, before) {
		if (!game)
			return;
		var genreId = game.genre && game.genre.id;
		var modifier = computeModifier(genreId);
		if (Math.abs(modifier - 1) < 0.0005)
			return;

		var delta = game.totalSalesCash - before;
		if (!LivingIndustry.State.isFiniteNumber(delta))
			return;
		var adjusted = Math.round(delta * modifier);
		game.totalSalesCash = before + adjusted;
		LivingIndustry.log('[Living Industry] ' + genreId + ' demand modifier x' + modifier.toFixed(3) +
			' applied to ' + game.title + ' (' + delta + ' -> ' + adjusted + ')');
	};

	LivingIndustry.Integration.init = function () {
		if (typeof Sales === 'undefined' || typeof Sales.calculateSales !== 'function') {
			LivingIndustry.error('Living Industry integration: Sales.calculateSales not found - market modifier not applied.');
			return;
		}

		// The marker lives on the installed function so a re-run of this script (fresh closure,
		// original === null again) can't wrap the already-wrapped function a second time.
		if (Sales.calculateSales.__livingIndustryPatched)
			return;

		original = Sales.calculateSales;
		patched.__livingIndustryPatched = true;
		Sales.calculateSales = patched;
	};
})();
