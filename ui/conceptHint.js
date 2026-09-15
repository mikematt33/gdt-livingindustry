(function () {
	LivingIndustry.ConceptHint = {};

	var original = null;

	// One line for the Game Concept dialog: the Market Pulse state of the chosen primary genre, so
	// the market is visible at the moment the genre decision is made. Uses only the mod's own
	// market data (the vanilla ".comboHint" above it still depends on the player's knowledge).
	LivingIndustry.ConceptHint.describe = function (genreId) {
		var data = LivingIndustry.State.get();
		var info = LivingIndustry.MarketPulse.describeGenre(genreId, data.market && data.market[genreId]);
		var parts = [genreId + ' market: ' + (info.zoneLabel ? info.zoneLabel.toLowerCase() : 'steady') + ' ' + info.arrow];
		if (info.note)
			parts.push(info.note);
		if (info.crowded)
			parts.push('crowded');
		return { text: parts.join(', '), tooltip: info.tooltip, zone: info.zone, crowded: info.crowded };
	};

	var render = function () {
		var modal = $('.simplemodal-data');
		var combo = modal.find('#gameDefinition .comboHint');
		if (!combo.length)
			return;
		var line = combo.siblings('.livingindustry-concept-hint');
		var game = GameManager.company && GameManager.company.currentGame;
		var genreId = game && game.genre && game.genre.id;
		if (!LivingIndustry.Settings.get('conceptMarketHint') || !genreId || LivingIndustry.State.GENRE_IDS.indexOf(genreId) < 0) {
			line.remove();
			return;
		}
		if (!line.length) {
			line = $('<div class="livingindustry-concept-hint"></div>').css({
				'font-size': '12pt', 'text-align': 'center', 'margin-top': '2px', cursor: 'help', 'word-spacing': '0'
			});
			combo.after(line);
		}
		var d = LivingIndustry.ConceptHint.describe(genreId);
		var tooltips = !!LivingIndustry.Settings.get('marketTooltips');
		line.text(d.text).attr('title', tooltips ? d.tooltip : null).css('cursor', tooltips ? 'help' : 'default')
			.css('color', d.zone === 'hot' ? '#d9531e' : d.zone === 'cold' ? '#1f74c4' : (d.crowded ? '#b8860b' : '#444'));
	};

	// UI._updateGameDefinitionNextButtonEnabled runs after every topic/genre/platform change in
	// the concept dialog, which is exactly when the hint needs refreshing.
	var patched = function () {
		var result = original.apply(this, arguments);
		try {
			render();
		} catch (e) {
			LivingIndustry.error('Living Industry concept hint failed - dialog left vanilla', e);
		}
		return result;
	};

	LivingIndustry.ConceptHint.init = function () {
		if (typeof UI === 'undefined' || typeof UI._updateGameDefinitionNextButtonEnabled !== 'function' || typeof $ === 'undefined') {
			LivingIndustry.error('Living Industry concept hint: UI._updateGameDefinitionNextButtonEnabled not found - feature disabled.');
			return;
		}
		if (UI._updateGameDefinitionNextButtonEnabled.__livingIndustryPatched)
			return;
		original = UI._updateGameDefinitionNextButtonEnabled;
		patched.__livingIndustryPatched = true;
		UI._updateGameDefinitionNextButtonEnabled = patched;
	};
})();
