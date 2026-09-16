(function () {
	LivingIndustry.SettingsTab = {};

	var DISPLAY_CONTROLS = [
		{ key: 'showMarketPulse', kind: 'checkbox', label: 'Market Pulse panel',
			hint: 'Compact per-genre demand readout in the top-left corner. Click the header to collapse.' },
		{ key: 'marketTooltips', kind: 'checkbox', label: 'Hover details on market lines',
			hint: 'Show demand/momentum/saturation and the recent causes as a hover tooltip on Market Pulse rows and the Game Concept market line.' },
		{ key: 'uiScale', kind: 'select', label: 'Living Industry overlay size',
			options: [[1, '100%'], [1.25, '125%'], [1.5, '150%'], [1.75, '175%'], [2, '200%']],
			hint: 'Scales the Market Pulse panel for large or high-resolution screens. Vanilla UI is not affected.' },
		{ key: 'showDevProgress', kind: 'checkbox', label: 'Development progress in the status bar',
			hint: 'Adds a "Feature: N% (game M%)" line to the Fans/Cash box while developing.' },
		{ key: 'showFocusPercent', kind: 'checkbox', label: 'Time allocation percentages',
			hint: 'Shows each slider\'s share on the Development Stage "Time Allocation (Preview)" bar. Replaces the "Percentager" mod.' },
		{ key: 'instantReviews', kind: 'checkbox', label: 'Instant reviews',
			hint: 'Show review scores immediately instead of the slow reveal animation. Replaces the "instaReview" mod.' },
		{ key: 'newsDelivery', kind: 'select', label: 'Industry news from Living Industry',
			options: [['sidebar', 'Sidebar (non-blocking, fades out)'], ['popup', 'Popup (must be acknowledged)'], ['off', 'Off']],
			hint: 'How rival hits/flops and hot/cold genre changes are reported. Clicking a sidebar item opens it as a popup.' },
		{ key: 'trendNews', kind: 'checkbox', label: 'Also report trend reversals',
			hint: 'News when a genre switches from rising to falling or back. Market Pulse shows this with an arrow already.' },
		{ key: 'tutorialTips', kind: 'checkbox', label: 'Living Industry tutorial',
			hint: 'A short welcome after you create your company, then one-time tips the first time each new screen appears. "Don\'t show again" on the welcome turns this off.' },
		{ key: 'titleMenu', kind: 'checkbox', label: 'Living Industry title menu',
			hint: 'Continue / New Game / Load / Settings / ... buttons on the title screen, scaled to the window, instead of the vanilla click-to-continue. Takes effect the next time the game starts.' }
	];

	var ASSIST_CONTROLS = [
		{ key: 'focusSliderMarks', kind: 'checkbox', label: 'Slider marks (+++ / ++ / - / -- / ---)',
			hint: 'Draws the hint scale along each Development Stage slider, highlights the mark matching that slider\'s hint, lets you click a mark to jump there, and adds a "Snap to marks: On/Off" toggle to the window.' },
		{ key: 'focusSnapMarks', kind: 'checkbox', label: 'Snap to marks on by default',
			hint: 'Starting state of the "Snap to marks" toggle for each new run (the toggle in the Development Stage window changes only the current save).' },
		{ key: 'focusSnapControls', kind: 'checkbox', label: '"Snap to hints" button in the Development Stage window',
			hint: 'One click sets +++/++ sliders to at least 40% and --/--- to the minimum, per the game\'s review rules. The strongest assist, so it is off by default - turn it on only if you would rather not work the sliders out yourself.' },
		{ key: 'focusSnapAuto', kind: 'checkbox', label: 'Auto-snap to hints when a stage opens',
			hint: 'Applies "Snap to hints" automatically every time a Development Stage window opens.' },
		{ key: 'rememberSliders', kind: 'checkbox', label: 'Remember sliders per topic/genre',
			hint: 'Each stage reopens with the values you last used for the same topic + genre combination (stored in the save).' },
		{ key: 'reviewPreview', kind: 'checkbox', label: 'Slider check on the "game is ready" screen',
			hint: 'A "Slider hints: 4 \u2713 met \u00B7 1 \u2717 broken" line under "is ready!" counting sliders that met / broke the review rules; hover for details. Only judges features you already have hints for, and stays hidden until you know some.' },
		{ key: 'conceptMarketHint', kind: 'checkbox', label: 'Market state in the Game Concept dialog',
			hint: 'Shows the chosen genre\'s Market Pulse line (hot/cold, trend, crowded) under the combo hint while defining a game.' },
		{ key: 'learnByDoing', kind: 'checkbox', label: 'Learn by doing',
			hint: 'Staff have a small chance to gain Design/Technology/Research skill from each point they produce; rarer as they get better. Replaces the "Learn By Doing" mod (disable it to avoid double gains).' }
	];

	// Vanilla notification categories that interrupt play but carry no decision; "Quiet mode"
	// routes them to the sidebar through the game's own Settings > Messages mechanism.
	var QUIET_TYPES = ['IndustryNews', 'PlatformNews', 'NewResearchAvailable', 'CompanyMilestones'];

	var setMessageRouting = function (toSidebar) {
		if (typeof Notification === 'undefined' || typeof Notification.setShouldShowInSideBar !== 'function' ||
			typeof NotificationType === 'undefined')
			return false;
		for (var i = 0; i < QUIET_TYPES.length; i++) {
			var type = NotificationType[QUIET_TYPES[i]];
			if (type)
				Notification.setShouldShowInSideBar(type, toSidebar);
		}
		return true;
	};

	var buildControl = function (def, registry) {
		var wrapper = document.createElement('div');
		wrapper.style.cssText = 'margin: 0 0 10px 0;';

		var label = document.createElement('label');
		label.style.cssText = 'display:block; cursor:pointer;';
		var input;
		if (def.kind === 'checkbox') {
			// Native checkboxes misbehave inside the draggable Settings dialog (mousedown is captured,
			// check state doesn't redraw), so booleans use a game-style On/Off button. The button's
			// look is always derived from the stored value, never from its own click state.
			input = document.createElement('div');
			input.className = 'selectorButton orangeButton';
			input.style.cssText = 'display:inline-block; width:auto; height:auto; min-width:38px; text-align:center; padding:0 8px; ' +
				'font-size:10pt; line-height:20px; margin:0 8px 0 0; box-shadow:none; vertical-align:middle; cursor:pointer;';
			var refresh = function () {
				var on = !!LivingIndustry.Settings.getRaw(def.key);
				input.textContent = on ? 'On' : 'Off';
				input.style.opacity = on ? '1' : '0.5';
			};
			refresh();
			input.refresh = refresh;
			label.appendChild(input);
			label.appendChild(document.createTextNode(def.label));
			label.addEventListener('click', function (e) {
				e.preventDefault();
				if (input.disabled)
					return;
				var on = !LivingIndustry.Settings.getRaw(def.key);
				LivingIndustry.Settings.set(def.key, on);
				refresh();
				if (typeof Sound !== 'undefined' && Sound.click)
					Sound.click();
				if (def.onChange)
					def.onChange(on);
			});
		} else {
			label.appendChild(document.createTextNode(def.label + ' '));
			input = document.createElement('select');
			input.style.cssText = 'width:auto; margin-left:6px; font-size:inherit;';
			var current = LivingIndustry.Settings.getRaw(def.key);
			for (var i = 0; i < def.options.length; i++) {
				var option = document.createElement('option');
				option.value = String(def.options[i][0]);
				option.textContent = def.options[i][1];
				option.selected = def.options[i][0] === current;
				input.appendChild(option);
			}
			label.appendChild(input);
			// Option values are strings; numeric settings (uiScale) need the original number back.
			input.addEventListener('change', function () {
				var numeric = typeof LivingIndustry.CONFIG.settings[def.key] === 'number';
				LivingIndustry.Settings.set(def.key, numeric ? parseFloat(input.value) : input.value);
			});
		}
		wrapper.appendChild(label);

		if (def.hint) {
			var hint = document.createElement('small');
			hint.style.cssText = 'display:block; opacity:0.75; margin-left:22px;';
			hint.textContent = def.hint;
			wrapper.appendChild(hint);
		}
		var conflict = LivingIndustry.Settings.conflictingMod(def.key);
		if (conflict) {
			var warn = document.createElement('small');
			warn.style.cssText = 'display:block; color:#b35a00; margin-left:22px;';
			warn.textContent = 'The "' + (conflict.name || conflict.id) + '" mod is enabled, so this is off by default. Disable that mod to use the Living Industry version.';
			wrapper.appendChild(warn);
		}
		if (registry)
			registry.push({ wrapper: wrapper, input: input });
		allInputs.push(input);
		return wrapper;
	};

	var allInputs = [];
	var refreshAll = function () {
		for (var i = 0; i < allInputs.length; i++)
			if (typeof allInputs[i].refresh === 'function')
				allInputs[i].refresh();
	};

	var heading = function (text) {
		var h = document.createElement('h3');
		h.textContent = text;
		h.style.cssText = 'margin: 10px 0 6px;';
		return h;
	};

	var smallButton = function (text, onClick) {
		var b = document.createElement('div');
		b.className = 'selectorButton orangeButton';
		b.textContent = text;
		b.style.cssText = 'display:inline-block; width:auto; height:auto; padding:2px 12px; font-size:11pt; line-height:normal; ' +
			'box-shadow:none; cursor:pointer; margin:0 8px 0 0;';
		b.addEventListener('click', onClick);
		return b;
	};

	LivingIndustry.SettingsTab.buildContent = function () {
		var content = document.createElement('div');
		content.className = 'settingsChildPanel';
		content.style.cssText = 'padding: 4px 10px;';

		var title = document.createElement('h2');
		title.textContent = 'Living Industry v' + LivingIndustry.VERSION_LABEL;
		content.appendChild(title);

		content.appendChild(heading('Display'));
		for (var i = 0; i < DISPLAY_CONTROLS.length; i++)
			content.appendChild(buildControl(DISPLAY_CONTROLS[i]));

		var replay = document.createElement('div');
		replay.style.cssText = 'margin: -4px 0 10px 22px;';
		replay.appendChild(smallButton('Show tips again in this save', function () {
			if (!LivingIndustry.Settings.getRaw('tutorialTips'))
				LivingIndustry.Settings.set('tutorialTips', true);
			LivingIndustry.Tutorial.resetRun();
			refreshAll();
			if (typeof Sound !== 'undefined' && Sound.click)
				Sound.click();
		}));
		content.appendChild(replay);

		// Quiet mode: one click to route the chatty vanilla categories to the sidebar (and back).
		var quiet = document.createElement('div');
		quiet.style.cssText = 'margin: 0 0 10px 0;';
		quiet.appendChild(smallButton('Quiet mode', function () {
			setMessageRouting(true);
		}));
		quiet.appendChild(smallButton('Vanilla popups', function () {
			setMessageRouting(false);
		}));
		var quietHint = document.createElement('small');
		quietHint.style.cssText = 'display:block; opacity:0.75; margin-top:4px;';
		quietHint.textContent = 'Quiet mode sends Industry News, Platform News, New Research and Company Milestones to the sidebar instead of popups (same as flipping them in Settings > Messages). Decisions and reports are untouched.';
		quiet.appendChild(quietHint);
		content.appendChild(quiet);

		content.appendChild(heading('Assists'));
		var subControls = [];
		var applyMaster = function (on) {
			for (var j = 0; j < subControls.length; j++) {
				subControls[j].input.disabled = !on;
				subControls[j].wrapper.style.opacity = on ? '1' : '0.45';
			}
		};
		content.appendChild(buildControl({
			key: 'assistsEnabled', kind: 'checkbox', label: 'Enable assists',
			hint: 'Master switch for everything below - gameplay help that a purist may prefer off. Individual choices are kept while this is off.',
			onChange: applyMaster
		}));
		var group = document.createElement('div');
		group.style.cssText = 'margin-left: 22px;';
		for (var k = 0; k < ASSIST_CONTROLS.length; k++)
			group.appendChild(buildControl(ASSIST_CONTROLS[k], subControls));
		content.appendChild(group);
		applyMaster(!!LivingIndustry.Settings.getRaw('assistsEnabled'));

		var note = document.createElement('small');
		note.style.cssText = 'display:block; opacity:0.75; margin-top:6px;';
		note.textContent = 'Changes apply immediately and are remembered across saves. If you also run the Percentager, instaReview or Learn By Doing Workshop mods, disable them - Living Industry covers all three.';
		content.appendChild(note);
		// The tab is built once at load; values toggled elsewhere (e.g. "Snap to marks" in the stage
		// dialog) are picked up when the player moves into the tab.
		content.addEventListener('mouseenter', function () {
			refreshAll();
			applyMaster(!!LivingIndustry.Settings.getRaw('assistsEnabled'));
		});
		return content;
	};

	// GDT.addSettingsTab (base game js/GDT.js) appends a jQuery UI tab to the vanilla Settings
	// dialog's #tabs; the dialog markup is part of the static page, so it exists at mod load time.
	LivingIndustry.SettingsTab.init = function () {
		if (typeof document === 'undefined' || typeof GDT.addSettingsTab !== 'function' || !document.getElementById('tabs')) {
			LivingIndustry.error('Living Industry settings tab: GDT.addSettingsTab or #tabs not available - tab not added.');
			return;
		}
		if (!LivingIndustry.hookOnce('settingsTab'))
			return;
		GDT.addSettingsTab('Living Industry', LivingIndustry.SettingsTab.buildContent());
	};
})();
