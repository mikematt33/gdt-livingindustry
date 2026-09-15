(function () {
	LivingIndustry.Tutorial = {};

	var WELCOME_ID = 'welcome';
	var SOURCE_ID = 'livingIndustryWelcome';
	var HEADER = 'Living Industry tip';

	// Per-save list of tips already shown. The welcome is recorded here too, and tips only run in
	// a save whose welcome was shown and answered - an older save never gets tips sprung on it.
	var seen = function () {
		var data = LivingIndustry.State.get();
		if (!data.meta || typeof data.meta !== 'object')
			data.meta = { lastTickWeek: -1 };
		if (!Array.isArray(data.meta.tipsSeen))
			data.meta.tipsSeen = [];
		return data.meta.tipsSeen;
	};

	var enabled = function () {
		return !!LivingIndustry.Settings.get('tutorialTips');
	};

	LivingIndustry.Tutorial.tipsActive = function () {
		return enabled() && seen().indexOf(WELCOME_ID) >= 0;
	};

	var pct = function (modifier) {
		return Math.round(Math.abs(modifier - 1) * 100) + '%';
	};

	var on = function (key) {
		return !!LivingIndustry.Settings.get(key);
	};

	// Copy lives here so a new system is one entry. `text()` returns null when nothing it would
	// describe is enabled, and the tip is then skipped (and not marked seen).
	var TIPS = {
		concept: {
			hook: 'createGame',
			text: function () {
				if (!on('conceptMarketHint'))
					return null;
				var cfg = LivingIndustry.CONFIG.integration;
				return 'Under the topic/genre hint you will see the chosen genre\'s market state, e.g. "RPG market: hot \u2197, crowded".\n' +
					'A hot genre sells up to ' + pct(cfg.salesModifierMax) + ' more, a cold one up to ' + pct(cfg.salesModifierMin) +
					' less. That is a real edge, but a good game in a cold genre still beats a bad game in a hot one.';
			}
		},
		stage: {
			hook: 'devPhases',
			text: function () {
				var lines = [];
				if (on('showFocusPercent'))
					lines.push('The Time Allocation bar shows each slider\'s share as a percentage.');
				if (on('focusSliderMarks'))
					lines.push('Marks along each slider (+++ / ++ / - / -- / ---) are the game\'s hint scale; the orange one is this slider\'s hint. Click a mark to jump to it, or use "Snap to marks: On/Off" to make dragging jump between the marks or move freely.');
				if (on('focusSnapControls'))
					lines.push('"Snap to hints" sets every slider to satisfy the review rules in one click.');
				if (on('rememberSliders'))
					lines.push('Sliders you confirm are remembered and restored the next time you make the same topic + genre.');
				return lines.length ? lines.join('\n') : null;
			}
		},
		points: {
			hook: 'gamePoints',
			text: function () {
				if (!on('learnByDoing'))
					return null;
				return 'Staff learn by doing: each point they produce has a small chance to add a skill point - watch for green "+1 Design" or "+1 Technology" bubbles.\n' +
					'Gains get rarer as a skill grows, so training still matters.';
			}
		},
		release: {
			hook: 'gameDevCompleted',
			text: function () {
				var lines = [];
				if (on('reviewPreview'))
					lines.push('Once you know some slider hints, the "is ready!" screen gets a Slider hints line counting which sliders met or broke the review rules. Hover it for the list.');
				if (on('instantReviews'))
					lines.push('Reviews appear without the slow reveal. Settings > Living Industry brings the animation back.');
				return lines.length ? lines.join('\n') : null;
			}
		},
		market: {
			event: 'afterReleaseGame',
			delay: 0.5,
			text: function () {
				return 'Your release just moved the market. Every game adds to its genre\'s crowding, and a hit or a flop pushes demand up or down - watch the genre\'s arrow and flags in Market Pulse' +
					(on('marketTooltips') ? ', or hover it to see your game listed as a cause' : '') + '.\n' +
					'Rival studios do the same; their hits and flops arrive as Industry News in the sidebar.{n}' +
					'That was the last tip. Everything Living Industry adds can be adjusted or switched off under Settings > Living Industry.';
			}
		}
	};
	LivingIndustry.Tutorial.TIPS = TIPS;

	var company = function () {
		return typeof GameManager !== 'undefined' && GameManager.company && Array.isArray(GameManager.company.notifications) ?
			GameManager.company : null;
	};

	var popupType = function () {
		return typeof NotificationType !== 'undefined' ? NotificationType.AutoPopup : undefined;
	};

	// Queues a tip exactly like the vanilla Tutorial does: an AutoPopup notification (never routed
	// to the sidebar) with the same delay the base game gave its own tutorial for that screen.
	LivingIndustry.Tutorial.showTip = function (id, delay) {
		var tip = TIPS[id];
		var c = company();
		if (!tip || !c || !LivingIndustry.Tutorial.tipsActive())
			return false;
		var list = seen();
		if (list.indexOf(id) >= 0)
			return false;
		var text = tip.text();
		if (!text)
			return false;
		list.push(id);
		c.notifications.push(new Notification({
			header: HEADER,
			text: text,
			buttonText: 'OK',
			weeksUntilFired: LivingIndustry.State.isFiniteNumber(delay) ? delay : (tip.delay || 0),
			type: popupType()
		}));
		LivingIndustry.log('[Living Industry] tutorial: tip "' + id + '" queued');
		return true;
	};

	// Shown once per run right after the company is created. Two answers: keep the tips for this
	// run, or switch the whole tutorial off app-wide so it never asks again on later new games.
	LivingIndustry.Tutorial.showWelcome = function () {
		var c = company();
		if (!c || !enabled())
			return false;
		var list = seen();
		if (list.indexOf(WELCOME_ID) >= 0)
			return false;
		list.push(WELCOME_ID);
		c.notifications.push(new Notification({
			header: 'Welcome to Living Industry',
			text: 'This company runs the Living Industry mod. Its biggest change: the market is alive.\n' +
				'Demand for each genre rises and falls with rival releases and with yours - a hit warms a genre up, a flood of releases makes it crowded, and a crowded genre sells less.\n\n' +
				'The MARKET PULSE box in the top-left shows every genre\'s state: trend arrow, HOT/COLD and a crowded flag.{n}' +
				'Living Industry can show a short one-time tip the first time each new screen appears (game concept, development sliders, release, your first game\'s effect on the market).\n\n' +
				'If you already know the mod, choose "Don\'t show again" and it will never ask on a new game again. You can turn tips back on under Settings > Living Industry.',
			options: ['Show tips as I play', 'Don\'t show again'],
			sourceId: SOURCE_ID,
			weeksUntilFired: 0,
			type: popupType()
		}));
		LivingIndustry.log('[Living Industry] tutorial: welcome queued');
		return true;
	};

	// Option index comes back through General.broadCastNofificationComplete by sourceId.
	LivingIndustry.Tutorial.onWelcomeAnswered = function (optionIndex) {
		if (optionIndex === 1)
			LivingIndustry.Settings.set('tutorialTips', false);
		LivingIndustry.log('[Living Industry] tutorial: welcome answered ' + optionIndex + ' -> tips ' + (enabled() ? 'on' : 'off'));
	};

	// Settings > Living Industry "Show tips again": re-arms every tip in the current save.
	LivingIndustry.Tutorial.resetRun = function () {
		var data = LivingIndustry.State.get();
		if (!data.meta || typeof data.meta !== 'object')
			return;
		data.meta.tipsSeen = [WELCOME_ID];
	};

	var wrap = function (name, after) {
		var original = Tutorial[name];
		if (typeof original !== 'function' || original.__livingIndustryPatched)
			return;
		var patched = function () {
			var result = original.apply(this, arguments);
			try {
				after.apply(null, arguments);
			} catch (e) {
				LivingIndustry.error('Living Industry tutorial: hook ' + name + ' failed', e);
			}
			return result;
		};
		patched.__livingIndustryPatched = true;
		Tutorial[name] = patched;
	};

	// The base game calls its Tutorial.* entry points at every teaching moment whether or not the
	// player has vanilla tutorials on (the check is inside), so wrapping them gives the same
	// timing and the same "before the dialog opens" ordering for free.
	LivingIndustry.Tutorial.init = function () {
		if (typeof Notification === 'undefined') {
			LivingIndustry.error('Living Industry tutorial: Notification not found - tutorial disabled.');
			return;
		}
		if (typeof Tutorial !== 'undefined') {
			wrap('createdCompany', function () {
				LivingIndustry.Tutorial.showWelcome();
			});
			for (var id in TIPS) {
				if (!TIPS.hasOwnProperty(id) || !TIPS[id].hook)
					continue;
				(function (tipId, hook) {
					wrap(hook, function (delay) {
						LivingIndustry.Tutorial.showTip(tipId, delay);
					});
				})(id, TIPS[id].hook);
			}
		} else {
			LivingIndustry.error('Living Industry tutorial: base-game Tutorial object not found - welcome and screen tips disabled.');
		}

		if (LivingIndustry.hookOnce('tutorial')) {
			if (typeof General !== 'undefined' && typeof General.registerAsNotificationSource === 'function') {
				General.registerAsNotificationSource({
					getAllNotificationsObjects: function () {
						return [{ id: SOURCE_ID, complete: LivingIndustry.Tutorial.onWelcomeAnswered }];
					}
				});
			} else {
				LivingIndustry.error('Living Industry tutorial: General.registerAsNotificationSource not found - welcome answer will be ignored.');
			}
			var key = GDT.eventKeys && GDT.eventKeys.gameplay && GDT.eventKeys.gameplay.afterReleaseGame;
			if (key && typeof GDT.on === 'function') {
				GDT.on(key, function () {
					try {
						LivingIndustry.Tutorial.showTip('market');
					} catch (e) {
						LivingIndustry.error('Living Industry tutorial: market tip failed', e);
					}
				});
			}
		}
	};
})();
