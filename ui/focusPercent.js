(function () {
	LivingIndustry.FocusPercent = {};

	var original = null;

	// Percent shares for the three focus sliders, as the base game computes them
	// (UI._getSelectedFeaturePercentages: each slider gets 10 + 70 * its share, summing to 100).
	LivingIndustry.FocusPercent.formatPercentages = function (values) {
		if (!Array.isArray(values))
			return [];
		return values.map(function (v) {
			return LivingIndustry.State.isFiniteNumber(v) ? Math.round(v) + '%' : '';
		});
	};

	// The Development Stage dialog is displayed through simplemodal, which clones the markup into
	// .simplemodal-data - so the live bar segments must be looked up there, not in the hidden
	// #selectFeatureMenu template (that lookup is why the Workshop "Percentager" mod shows nothing
	// in this game version).
	var renderPercentages = function () {
		if (!LivingIndustry.Settings.get('showFocusPercent'))
			return;
		var segments = $('.simplemodal-data .featureDurationPreview');
		if (!segments.length || typeof UI._getSelectedFeaturePercentages !== 'function')
			return;
		var labels = LivingIndustry.FocusPercent.formatPercentages(UI._getSelectedFeaturePercentages());
		segments.each(function (i, el) {
			var segment = $(el).css('vertical-align', 'top');
			var label = segment.children('.livingindustry-focus-percent');
			if (!label.length) {
				label = $('<span class="livingindustry-focus-percent"></span>').css({
					display: 'block', 'text-align': 'center', 'line-height': '40px', 'word-spacing': '0',
					color: '#fff', 'font-weight': '700', 'font-size': '15pt', 'text-shadow': '0 0 3px rgba(0,0,0,0.6)',
					'pointer-events': 'none', overflow: 'hidden', 'white-space': 'nowrap'
				});
				segment.append(label);
			}
			label.text(labels[i] || '');
		});
	};

	// --- snap to hints ------------------------------------------------------------------------

	// Review-time rules in Reviews.rateGame (codeNw.js): a mission with genre weighting >= 0.9
	// (shown as +++ / ++) wants >= 40% of the stage's time and is penalised at <= 20%; a mission
	// with weighting < 0.8 (-- / ---) is penalised at >= 40%. 0.8 (shown as -) is scored neither way.
	LivingIndustry.FocusPercent.classifyHint = function (text) {
		var hint = String(text || '').replace(/[\s?]/g, '');
		if (hint === '+++' || hint === '++')
			return 'important';
		if (hint === '--' || hint === '---')
			return 'low';
		return 'neutral';
	};

	var IMPORTANT_MIN_PCT = 41; // margin above the 40% rule so rounding can't land exactly on it
	var NEUTRAL_BASE_PCT = 20;
	var MIN_PCT = 10; // a slider at 0 still gets 10% (see UI._getSelectedFeaturePercentages)

	// Pure: hint texts for the three sliders -> raw slider values (0-100) whose resulting time
	// shares satisfy the review rules where possible. Exposed for tests.
	LivingIndustry.FocusPercent.snapValues = function (hints) {
		var classes = [0, 1, 2].map(function (i) {
			return LivingIndustry.FocusPercent.classifyHint(hints && hints[i]);
		});
		var important = [], neutral = [], low = [];
		classes.forEach(function (c, i) {
			(c === 'important' ? important : c === 'low' ? low : neutral).push(i);
		});

		var pct = [0, 0, 0];
		if (low.length === 3 || (important.length === 0 && neutral.length === 0)) {
			pct = [100 / 3, 100 / 3, 100 / 3];
		} else {
			low.forEach(function (i) { pct[i] = MIN_PCT; });
			var remaining = 100 - MIN_PCT * low.length;
			if (important.length === 0) {
				neutral.forEach(function (i) { pct[i] = remaining / neutral.length; });
			} else if (important.length === 3) {
				// Only two can clear 40%; the third takes what is left.
				pct = [IMPORTANT_MIN_PCT, IMPORTANT_MIN_PCT, remaining - 2 * IMPORTANT_MIN_PCT];
			} else {
				var neutralPct = neutral.length ? Math.min(NEUTRAL_BASE_PCT, (remaining - IMPORTANT_MIN_PCT * important.length) / neutral.length) : 0;
				neutral.forEach(function (i) { pct[i] = neutralPct; });
				var importantPct = (remaining - neutralPct * neutral.length) / important.length;
				important.forEach(function (i) { pct[i] = importantPct; });
			}
		}

		// pct = 10 + 70 * share, share = raw / sum(raw)  =>  raw is proportional to (pct - 10).
		var excess = pct.map(function (p) { return Math.max(0, p - MIN_PCT); });
		var max = Math.max.apply(null, excess);
		if (max <= 0)
			return [50, 50, 50];
		return excess.map(function (e) { return Math.round(e / max * 100); });
	};

	// Percentages the game will derive from raw slider values (mirrors UI._getSelectedFeaturePercentages).
	LivingIndustry.FocusPercent.percentagesFor = function (raws) {
		var sum = raws.reduce(function (a, b) { return a + b; }, 0);
		return sum === 0 ? [100 / 3, 100 / 3, 100 / 3] : raws.map(function (r) { return MIN_PCT + 70 * r / sum; });
	};

	var sliderWrappers = function () {
		return $('.simplemodal-data .focusSliderWrapper');
	};

	var readHints = function () {
		return sliderWrappers().map(function (i, el) {
			return $(el).find('.focusSliderHint').text();
		}).get();
	};

	// jQuery UI 1.8's slider('value', v) only fires 'change', but the dialog stores each slider's
	// value inside its 'slide' callback - so invoke that callback the way a drag would. value() also
	// aligns to the current 'step', so it is lifted for the write to keep exact hint values.
	var setSliderValue = function (wrapper, value) {
		var slider = $(wrapper).find('.focusSlider');
		if (!slider.length || typeof slider.slider !== 'function')
			return;
		var step = slider.slider('option', 'step');
		slider.slider('option', 'step', 1);
		slider.slider('value', value);
		slider.slider('option', 'step', step);
		var slide = slider.slider('option', 'slide');
		if (typeof slide === 'function')
			slide.call(slider[0], null, { value: value });
	};

	LivingIndustry.FocusPercent.applySnap = function () {
		var wrappers = sliderWrappers();
		if (wrappers.length !== 3)
			return false;
		var values = LivingIndustry.FocusPercent.snapValues(readHints());
		wrappers.each(function (i, el) {
			setSliderValue(el, values[i]);
		});
		LivingIndustry.log('[Living Industry] focus: snapped sliders to hints -> ' + values.join('/'));
		return true;
	};

	// --- tick marks on the sliders --------------------------------------------------------------

	// Five stops along each slider labelled with the hint symbols, top to bottom. The raw value at
	// a stop is what the slider snaps to (jQuery UI 'step' = 25) when "Snap to marks" is on.
	var TICKS = [
		{ label: '+++', value: 100 },
		{ label: '++', value: 75 },
		{ label: '-', value: 50 },
		{ label: '--', value: 25 },
		{ label: '---', value: 0 }
	];
	var TICK_STEP = 25;
	LivingIndustry.FocusPercent.TICKS = TICKS;

	var applySliderStep = function (wrapper, snap) {
		var slider = $(wrapper).find('.focusSlider');
		if (slider.length && typeof slider.slider === 'function')
			slider.slider('option', 'step', snap ? TICK_STEP : 1);
	};

	// Adds the labelled stops to one slider; the tick matching that slider's hint is emphasised.
	var decorateSlider = function (wrapper) {
		var $wrapper = $(wrapper);
		var slider = $wrapper.find('.focusSlider');
		if (!slider.length || slider.children('.livingindustry-slider-ticks').length)
			return;
		var hint = String($wrapper.find('.focusSliderHint').text() || '').replace(/[\s?]/g, '');
		var ticks = $('<div class="livingindustry-slider-ticks"></div>').css({
			position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', 'z-index': 1,
			'pointer-events': 'none', 'font-size': '11pt', 'line-height': '16px', 'text-align': 'center', 'word-spacing': '0'
		});
		TICKS.forEach(function (tick) {
			var isHint = hint && tick.label === hint;
			var label = $('<div></div>').text(tick.label).css({
				position: 'absolute', left: 0, width: '100%', top: (4 + (100 - tick.value) * 0.84) + '%',
				color: isHint ? '#d9531e' : '#2b2b2b', 'font-weight': isHint ? '700' : '500',
				cursor: 'pointer', 'pointer-events': 'auto'
			});
			label.on('click', function (e) {
				e.stopPropagation();
				setSliderValue(wrapper, tick.value);
			});
			ticks.append(label);
		});
		slider.append(ticks);
	};

	// .selectorButton in layout.css is a fixed 180x50 block with a 10px margin; every size property
	// is overridden so the control fits on the title line.
	var smallButton = function (text) {
		return $('<div class="selectorButton orangeButton"></div>').text(text).css({
			display: 'inline-block', width: 'auto', height: 'auto', margin: 0, padding: '1px 9px',
			'font-size': '10pt', 'line-height': '18px', 'box-shadow': 'none',
			cursor: 'pointer', 'word-spacing': '0', 'white-space': 'nowrap'
		});
	};

	var refreshToggle = function (button, on) {
		button.text('Snap to marks: ' + (on ? 'On' : 'Off')).css('opacity', on ? 1 : 0.55);
	};

	// Snap-to-marks is a per-run choice: the save's meta.snapMarks is seeded from the settings
	// default the first time a stage opens in that run, and the dialog toggle flips only the run's
	// value. The assists master switch still overrides it.
	LivingIndustry.FocusPercent.isSnapActive = function () {
		var meta = LivingIndustry.State.get().meta;
		if (typeof meta.snapMarks !== 'boolean')
			meta.snapMarks = !!LivingIndustry.Settings.getRaw('focusSnapMarks');
		return meta.snapMarks && !!LivingIndustry.Settings.getRaw('assistsEnabled');
	};

	LivingIndustry.FocusPercent.setSnapActive = function (on) {
		LivingIndustry.State.get().meta.snapMarks = !!on;
		return LivingIndustry.FocusPercent.isSnapActive();
	};

	// Controls live on the "Time Allocation (Preview)" title line so they add no height - the
	// dialog has no room to grow before its OK button falls outside the frame.
	var ensureControls = function () {
		var modal = $('.simplemodal-data');
		var wrappers = modal.find('.focusSliderWrapper');
		var title = modal.find('.featureDurationPreviewTitle');
		if (!title.length || wrappers.length !== 3 || modal.find('.livingindustry-focus-snap').length)
			return;

		var snapMarks = LivingIndustry.FocusPercent.isSnapActive();
		var showMarks = !!LivingIndustry.Settings.get('focusSliderMarks');
		wrappers.each(function (i, el) {
			if (showMarks)
				decorateSlider(el);
			applySliderStep(el, snapMarks);
		});

		var controls = $('<span class="livingindustry-focus-snap"></span>').css({
			display: 'inline-flex', gap: '6px', 'align-items': 'center', 'vertical-align': 'middle', 'word-spacing': '0'
		});
		// The marks' own on/off switch travels with the marks; "Snap to hints" is the separate, stronger assist.
		if (showMarks) {
			var toggle = smallButton('');
			refreshToggle(toggle, snapMarks);
			toggle.on('click', function () {
				var on = LivingIndustry.FocusPercent.setSnapActive(!LivingIndustry.FocusPercent.isSnapActive());
				refreshToggle(toggle, on);
				sliderWrappers().each(function (i, el) { applySliderStep(el, on); });
				if (typeof Sound !== 'undefined' && Sound.click)
					Sound.click();
			});
			controls.append(toggle);
		}
		if (LivingIndustry.Settings.get('focusSnapControls')) {
			var hints = smallButton('Snap to hints');
			hints.on('click', function () {
				if (typeof Sound !== 'undefined' && Sound.click)
					Sound.click();
				LivingIndustry.FocusPercent.applySnap();
			});
			controls.append(hints);
		}
		// Always inserted (possibly empty) so this runs once per dialog instance.
		title.css({ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }).append(controls);

		// New dialog instance (the clone is rebuilt every time it opens): a remembered allocation for
		// this combo wins over auto-snap, since it is the player's own last decision.
		if (!applyRemembered() && LivingIndustry.Settings.get('focusSnapControls') && LivingIndustry.Settings.get('focusSnapAuto'))
			LivingIndustry.FocusPercent.applySnap();
	};

	// --- remember sliders per topic/genre combo ------------------------------------------------

	var originalFeaturesSelected = null;

	LivingIndustry.FocusPercent.comboKey = function (game) {
		if (!game || !game.genre || !game.genre.id)
			return null;
		return (game.topic && game.topic.id ? game.topic.id : '') + '|' + game.genre.id + '|' +
			(game.secondGenre && game.secondGenre.id ? game.secondGenre.id : '');
	};

	var validRaws = function (values) {
		return Array.isArray(values) && values.length === 3 && values.every(function (v) {
			return LivingIndustry.State.isFiniteNumber(v) && v >= 0 && v <= 100;
		});
	};

	// Pure-ish store/recall against the per-save state; exposed for tests.
	LivingIndustry.FocusPercent.rememberValues = function (game, stage, values) {
		var key = LivingIndustry.FocusPercent.comboKey(game);
		if (!key || !validRaws(values) || [1, 2, 3].indexOf(stage) < 0)
			return false;
		var memory = LivingIndustry.State.get().sliderMemory;
		if (!memory[key] || typeof memory[key] !== 'object')
			memory[key] = {};
		memory[key][String(stage)] = values.map(function (v) { return Math.round(v); });
		return true;
	};

	LivingIndustry.FocusPercent.recallValues = function (game, stage) {
		var key = LivingIndustry.FocusPercent.comboKey(game);
		var memory = key && LivingIndustry.State.get().sliderMemory[key];
		var values = memory && memory[String(stage)];
		return validRaws(values) ? values.slice() : null;
	};

	var currentStage = function () {
		var stage = typeof GameManager.getCurrentDevStage === 'function' ? GameManager.getCurrentDevStage() : null;
		return LivingIndustry.State.isFiniteNumber(stage) ? stage : null;
	};

	var applyRemembered = function () {
		if (!LivingIndustry.Settings.get('rememberSliders') || !GameManager.company)
			return false;
		var values = LivingIndustry.FocusPercent.recallValues(GameManager.company.currentGame, currentStage());
		if (!values)
			return false;
		var wrappers = sliderWrappers();
		if (wrappers.length !== 3)
			return false;
		wrappers.each(function (i, el) {
			setSliderValue(el, values[i]);
		});
		LivingIndustry.log('[Living Industry] focus: restored remembered sliders ' + values.join('/'));
		return true;
	};

	// UI.featuresSelectedClick is the stage dialog's OK. Values are stored before the original runs;
	// if its own validation rejects the click, the player presses OK again and overwrites them.
	var patchedFeaturesSelected = function () {
		try {
			if (LivingIndustry.Settings.get('rememberSliders') && GameManager.company && typeof UI._getSelectedSliderValues === 'function')
				LivingIndustry.FocusPercent.rememberValues(GameManager.company.currentGame, currentStage(), UI._getSelectedSliderValues());
		} catch (e) {
			LivingIndustry.error('Living Industry focus: could not remember slider values', e);
		}
		return originalFeaturesSelected.apply(this, arguments);
	};

	var patched = function () {
		var result = original.apply(this, arguments);
		try {
			renderPercentages();
			ensureControls();
		} catch (e) {
			LivingIndustry.error('Living Industry focus percentages failed - vanilla preview kept', e);
		}
		return result;
	};

	LivingIndustry.FocusPercent.init = function () {
		if (typeof UI === 'undefined' || typeof UI._updateFeatureFocusPreview !== 'function' || typeof $ === 'undefined') {
			LivingIndustry.error('Living Industry focus percentages: UI._updateFeatureFocusPreview not found - feature disabled.');
			return;
		}
		if (UI._updateFeatureFocusPreview.__livingIndustryPatched)
			return;
		original = UI._updateFeatureFocusPreview;
		patched.__livingIndustryPatched = true;
		UI._updateFeatureFocusPreview = patched;

		if (typeof UI.featuresSelectedClick === 'function' && !UI.featuresSelectedClick.__livingIndustryPatched) {
			originalFeaturesSelected = UI.featuresSelectedClick;
			patchedFeaturesSelected.__livingIndustryPatched = true;
			UI.featuresSelectedClick = patchedFeaturesSelected;
		}
	};
})();
