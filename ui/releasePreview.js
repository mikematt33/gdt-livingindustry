(function () {
	LivingIndustry.ReleasePreview = {};

	var original = null;

	// Same review-time rules as Reviews.rateGame (see focusPercent.js): an important mission
	// (+++/++) is rewarded at >= 40% of its stage and penalised at <= 20%; a low one (--/---) is
	// penalised at >= 40%. Only missions the player already has a hint for are judged, so this
	// never reveals weightings the game itself keeps hidden.
	// entries: [{ name, hint, share }] with share in [0,1]. Returns { items, good, bad, unknown }.
	LivingIndustry.ReleasePreview.evaluate = function (entries) {
		var result = { items: [], good: 0, bad: 0, unknown: 0 };
		if (!Array.isArray(entries))
			return result;
		entries.forEach(function (e) {
			if (!e || !LivingIndustry.State.isFiniteNumber(e.share))
				return;
			var pct = Math.round(e.share * 100);
			var klass = e.hint ? LivingIndustry.FocusPercent.classifyHint(e.hint) : null;
			var item = { name: e.name || '?', hint: e.hint || '?', pct: pct, status: 'neutral', note: '' };
			if (!klass) {
				item.status = 'unknown';
				result.unknown++;
			} else if (klass === 'important') {
				if (e.share >= 0.4) {
					item.status = 'good';
					result.good++;
				} else if (e.share <= 0.2) {
					item.status = 'bad';
					item.note = 'neglected (needs > 20%)';
					result.bad++;
				}
			} else if (klass === 'low' && e.share >= 0.4) {
				item.status = 'bad';
				item.note = 'over-focused (keep < 40%)';
				result.bad++;
			}
			result.items.push(item);
		});
		return result;
	};

	var STATUS_MARK = { good: '\u2713', bad: '\u2717', neutral: '\u2013', unknown: '?' };

	LivingIndustry.ReleasePreview.describe = function (summary) {
		var lines = summary.items.map(function (item) {
			return STATUS_MARK[item.status] + ' ' + item.name + ' (' + item.hint + ') ' + item.pct + '%' + (item.note ? ' - ' + item.note : '');
		});
		// Nothing judged (no hints known yet, or every slider in the neutral band): no badge at all
		// rather than a row of question marks.
		var badge = '';
		if (summary.good || summary.bad) {
			var parts = [summary.good + ' \u2713 met'];
			if (summary.bad)
				parts.push(summary.bad + ' \u2717 broken');
			if (summary.unknown)
				parts.push(summary.unknown + ' ? no hint');
			badge = 'Slider hints: ' + parts.join('  \u00B7  ');
		}
		return { badge: badge, tooltip: lines.length ? lines.join('\n') : 'No slider data for this game.' };
	};

	// Builds the entries from the finished game's featureLog, mirroring how Reviews.rateGame derives
	// each mission's share of its stage from its duration.
	var collect = function (game) {
		if (!game || !Array.isArray(game.featureLog) || typeof Missions === 'undefined' || typeof General === 'undefined')
			return [];
		var sizeFactor = General.getGameSizeDurationFactor(game.gameSize) * General.getMultiPlatformDurationFactor(game);
		var stageDuration = 3 * Missions.BASE_DURATION;
		var entries = [];
		game.featureLog.forEach(function (feature) {
			if (!feature || feature.missionType !== 'mission' || !LivingIndustry.State.isFiniteNumber(feature.duration))
				return;
			var mission = Missions.getMissionWithId(feature.id);
			if (!mission)
				return;
			var hint = null;
			if (typeof Knowledge !== 'undefined' && typeof Knowledge.getMissionWeightingHint === 'function' &&
				(typeof GameManager.areHintsEnabled !== 'function' || GameManager.areHintsEnabled())) {
				var known = Knowledge.getMissionWeightingHint(mission, game);
				if (known && known.hint)
					hint = known.hint;
			}
			entries.push({ name: mission.name || feature.id, hint: hint, share: feature.duration / sizeFactor / stageDuration });
		});
		return entries;
	};

	// The release dialog is a simplemodal clone of #releaseGameDialog, so the badge is written into
	// the template before the original shows it and comes along in the clone. It sits on its own
	// centred line under the "is ready!" title, not inside it (the title is a 2-line 34pt block).
	var decorateTemplate = function () {
		var dialog = $('#releaseGameDialog');
		var title = dialog.find('.windowTitle').first();
		if (!title.length)
			return;
		var badge = dialog.find('.livingindustry-review-preview');
		if (!LivingIndustry.Settings.get('reviewPreview')) {
			badge.remove();
			return;
		}
		var summary = LivingIndustry.ReleasePreview.evaluate(collect(GameManager.company.currentGame));
		var text = LivingIndustry.ReleasePreview.describe(summary);
		if (!text.badge) {
			badge.remove();
			return;
		}
		if (!badge.length) {
			badge = $('<div class="livingindustry-review-preview"></div>').css({
				'text-align': 'center', 'font-size': '11pt', 'font-weight': '600', 'line-height': '1.4',
				margin: '4px auto 0', cursor: 'help', 'letter-spacing': 'normal'
			});
			title.after(badge);
		}
		badge.text(text.badge).attr('title', text.tooltip)
			.css('color', summary.bad ? '#c0392b' : '#2e7d32');
	};

	var patched = function () {
		try {
			decorateTemplate();
		} catch (e) {
			LivingIndustry.error('Living Industry review preview failed - release dialog left vanilla', e);
		}
		return original.apply(this, arguments);
	};

	LivingIndustry.ReleasePreview.init = function () {
		if (typeof UI === 'undefined' || typeof UI.showReleaseGameDialog !== 'function' || typeof $ === 'undefined') {
			LivingIndustry.error('Living Industry review preview: UI.showReleaseGameDialog not found - feature disabled.');
			return;
		}
		if (UI.showReleaseGameDialog.__livingIndustryPatched)
			return;
		original = UI.showReleaseGameDialog;
		patched.__livingIndustryPatched = true;
		UI.showReleaseGameDialog = patched;
	};
})();
