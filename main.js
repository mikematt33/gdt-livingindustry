var LivingIndustry = {};
(function () {
	LivingIndustry.MOD_ID = 'gdt-livingindustry';
	LivingIndustry.path = GDT.getRelativePath();

	// Order matters: state must exist before any hook reads it. Each later module is isolated so
	// one failing integration (e.g. a base-game function renamed by an update) can't take the
	// simulation down with it.
	var ready = function () {
		try {
			LivingIndustry.State.init();
		} catch (e) {
			LivingIndustry.error('[Living Industry] state init failed - mod disabled for this session.', e);
			return;
		}
		var modules = ['Settings', 'Persistence', 'Market', 'Rivals', 'News', 'Integration', 'PlayerInfluence', 'Learning',
			'DevProgress', 'FocusPercent', 'ReleasePreview', 'ConceptHint', 'MarketPulse', 'InstantReviews', 'Tutorial', 'TitleMenu', 'SettingsTab'];
		for (var i = 0; i < modules.length; i++) {
			try {
				LivingIndustry[modules[i]].init();
			} catch (e) {
				LivingIndustry.error('[Living Industry] ' + modules[i] + ' init failed.', e);
			}
		}
		LivingIndustry.log('Living Industry v' + LivingIndustry.VERSION_LABEL + ' (state v' + LivingIndustry.VERSION + ', seed ' +
			LivingIndustry.Rng.seed() + ') loaded. ' + LivingIndustry.Market.getDebugSummary());
	};

	var error = function () {
		console.error('[Living Industry] failed to load one or more of its scripts.');
	};

	// Load order matters: constants before state, state before anything that reads/writes it.
	GDT.loadJs([
		LivingIndustry.path + '/balance/constants.js',
		LivingIndustry.path + '/core/state.js',
		LivingIndustry.path + '/core/rng.js',
		LivingIndustry.path + '/core/settings.js',
		LivingIndustry.path + '/core/persistence.js',
		LivingIndustry.path + '/market/market.js',
		LivingIndustry.path + '/rivals/rivals.js',
		LivingIndustry.path + '/events/news.js',
		LivingIndustry.path + '/integration/sales.js',
		LivingIndustry.path + '/integration/player.js',
		LivingIndustry.path + '/integration/learning.js',
		LivingIndustry.path + '/ui/devProgress.js',
		LivingIndustry.path + '/ui/focusPercent.js',
		LivingIndustry.path + '/ui/marketPulse.js',
		LivingIndustry.path + '/ui/releasePreview.js',
		LivingIndustry.path + '/ui/conceptHint.js',
		LivingIndustry.path + '/ui/instantReviews.js',
		LivingIndustry.path + '/ui/tutorial.js',
		LivingIndustry.path + '/ui/titleMenu.js',
		LivingIndustry.path + '/ui/settingsTab.js'
	], ready, error);
})();
