(function () {
	LivingIndustry.PlayerInfluence = {};

	// Vanilla review score (game.score) is set by Reviews.rateGame before afterReleaseGame fires,
	// which is why that event (not the sales wrapper) is the release hook: it runs exactly once per
	// released game, after the score exists. An invalid score is treated as neutral - the release
	// still adds saturation because another game entered the genre.
	var classify = function (score) {
		var cfg = LivingIndustry.CONFIG.player;
		if (!LivingIndustry.State.isFiniteNumber(score))
			return { outcome: 'average', momentum: cfg.averageMomentum, score: null };
		score = score.clamp(1, 10);
		if (score >= cfg.breakoutScore)
			return { outcome: 'breakout', momentum: cfg.breakoutMomentum, score: score };
		if (score >= cfg.hitScore)
			return { outcome: 'hit', momentum: cfg.hitMomentum, score: score };
		if (score < cfg.majorFlopScore)
			return { outcome: 'major_flop', momentum: cfg.majorFlopMomentum, score: score };
		if (score < cfg.flopScore)
			return { outcome: 'flop', momentum: cfg.flopMomentum, score: score };
		return { outcome: 'average', momentum: cfg.averageMomentum, score: score };
	};

	var saturationFor = function (gameSize) {
		var cfg = LivingIndustry.CONFIG.player;
		var sizes = cfg.saturationBySize || {};
		var scale = sizes.hasOwnProperty(gameSize) && LivingIndustry.State.isFiniteNumber(sizes[gameSize]) ? sizes[gameSize] : 1;
		return (cfg.releaseSaturationBump * scale).clamp(0, cfg.saturationBumpMax);
	};

	// Pure: computes the market effect for a released game without touching state. Exposed for tests.
	LivingIndustry.PlayerInfluence.effectFor = function (game) {
		var genreId = game && game.genre && game.genre.id;
		if (!genreId || LivingIndustry.State.GENRE_IDS.indexOf(genreId) < 0)
			return null;
		var result = classify(game.score);
		return {
			genreId: genreId,
			saturation: saturationFor(game.gameSize),
			momentum: result.momentum,
			cause: {
				type: 'player_' + result.outcome,
				gameId: game.id,
				title: game.title,
				score: result.score === null ? null : Number(result.score.toFixed(1))
			}
		};
	};

	// Applies a released game's influence once. The marker is stored in game.flags because the
	// base game persists that object with the game, so a save right after release can't replay it.
	LivingIndustry.PlayerInfluence.onGameReleased = function (game) {
		if (!LivingIndustry.CONFIG.player.enabled || !game)
			return null;
		if (!game.flags || typeof game.flags !== 'object')
			game.flags = {};
		if (game.flags.livingIndustryInfluenced)
			return null;

		var effect = LivingIndustry.PlayerInfluence.effectFor(game);
		if (!effect) {
			LivingIndustry.log('[Living Industry] player: no market entry for ' + (game.title || 'untitled') + ' - influence skipped');
			return null;
		}

		var applied = LivingIndustry.Market.applyRelease(effect);
		if (!applied)
			return null;
		game.flags.livingIndustryInfluenced = true;
		LivingIndustry.log('[Living Industry] player: ' + game.title + ' (' + effect.cause.type + ', score ' +
			effect.cause.score + ') -> ' + effect.genreId + ' saturation +' + applied.saturation +
			', momentum ' + (applied.momentum >= 0 ? '+' : '') + applied.momentum);
		return applied;
	};

	LivingIndustry.PlayerInfluence.init = function () {
		var key = GDT.eventKeys && GDT.eventKeys.gameplay && GDT.eventKeys.gameplay.afterReleaseGame;
		if (!key || typeof GDT.on !== 'function') {
			LivingIndustry.error('Living Industry player influence: gameplay.afterReleaseGame not available - player releases will not affect the market.');
			return;
		}
		if (!LivingIndustry.hookOnce('playerInfluence'))
			return;
		GDT.on(key, function (e) {
			try {
				LivingIndustry.PlayerInfluence.onGameReleased(e && e.game);
			} catch (err) {
				LivingIndustry.error('Living Industry player influence failed - release left untouched', err);
			}
		});
	};
})();
