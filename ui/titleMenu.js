(function () {
	LivingIndustry.TitleMenu = {};

	// The vanilla title screen (SplashScreen in codeNw.js) is the orange rotating-sunrays backdrop,
	// the 620px logo and a pulsating "Click to continue ..." label; clicking anywhere loads the
	// newest save (or starts a new game), and every other action hides behind Esc. This module keeps
	// that screen but replaces the click-anywhere label with the Esc menu's buttons laid out under
	// the logo, adds a "Living Industry" ribbon, and scales the whole thing (and the sunrays, whose
	// 2990px image stops short of the corners on large monitors) with the window.

	var MENU_ID = 'livingindustry-title-menu';
	var STYLE_ID = 'livingindustry-title-menu-style';
	var HELP_ID = 'livingindustry-help';
	var RAYS_CLASS = 'li-canvas-rays';
	var RAYS_PERIOD_MS = 120000; // vanilla: animation-duration 120s
	var RAYS_FRAME_MS = 1000 / 30;

	var menu = null;
	var refs = {};
	var active = false;
	var busy = false;
	var layoutTimer = null;
	// The runtime is Chromium 30, where the vanilla 2990px CSS-animated sunrays pseudo-element is one
	// huge compositor layer that gets evicted to black whenever dialogs add layers on top. We hide it
	// and draw the same image, pre-scaled to the window, on a window-sized canvas instead.
	var rays = { canvas: null, ctx: null, image: null, scaled: null, layout: null, failed: false, running: false, lastFrame: 0 };

	// --- pure (no DOM) ------------------------------------------------------------------------

	var cfg = function () {
		return LivingIndustry.CONFIG.ui.titleMenu;
	};

	// Menu scale for a window: fits the 1024x768 design, grows with the smaller ratio, never shrinks.
	LivingIndustry.TitleMenu.scaleFor = function (width, height) {
		var c = cfg();
		var w = Number(width) || c.baseWidth;
		var h = Number(height) || c.baseHeight;
		var ratio = Math.min(w / c.baseWidth, h / c.baseHeight);
		return Math.min(Math.max(ratio, 1), c.maxScale);
	};

	// Size and position for the rotating sunrays so the (off-centre) sun sits at the window centre
	// and the disc covers the corners; a window whose diagonal + margin equals the image size gets
	// exactly the vanilla placement.
	LivingIndustry.TitleMenu.sunraysLayout = function (width, height) {
		var c = cfg();
		var w = Number(width) || c.baseWidth;
		var h = Number(height) || c.baseHeight;
		var diagonal = Math.sqrt(w * w + h * h);
		var size = Math.ceil(diagonal + c.sunraysMargin);
		var factor = size / c.sunraysImageSize;
		var centreX = (c.sunraysImageSize / 2 + c.sunraysCentreOffsetX) * factor;
		var centreY = (c.sunraysImageSize / 2 + c.sunraysCentreOffsetY) * factor;
		return {
			size: size,
			left: Math.round(w / 2 - centreX),
			top: Math.round(h / 2 - centreY)
		};
	};

	// Same arithmetic as the base game's Company.getDate (codeNw.js): 4 weeks a month, 12 months a year.
	LivingIndustry.TitleMenu.dateOfWeek = function (week) {
		var w = Math.floor(Number(week) || 0);
		return {
			year: Math.floor(w / 48) + 1,
			month: Math.floor((w / 4) % 12) + 1,
			week: (w % 4) + 1
		};
	};

	// Continue-button text for a SaveGameData header (GameManager.getGameToContinue()), or null.
	LivingIndustry.TitleMenu.describeSave = function (header) {
		if (!header || typeof header !== 'object')
			return null;
		var name = header.companyName ? String(header.companyName) : '';
		var parts = [];
		if (name)
			parts.push(name);
		if (LivingIndustry.State.isFiniteNumber(header.currentWeek)) {
			var d = LivingIndustry.TitleMenu.dateOfWeek(header.currentWeek);
			parts.push('Y' + d.year + ' M' + d.month + ' W' + d.week);
		}
		if (header.slot === 'auto')
			parts.push('autosave');
		return {
			name: name,
			detail: parts.join(' \u00B7 ')
		};
	};

	// Button list for the current environment; `continue` is only present when there is a save and
	// Mods/Quit are absent where the vanilla menu hides them (Windows Store build).
	LivingIndustry.TitleMenu.buttons = function (options) {
		var o = options || {};
		var list = [];
		if (o.hasSave)
			list.push({ id: 'continue', label: 'Continue', kind: 'primary', wide: true });
		list.push({ id: 'new', label: 'New Game', kind: 'primary', wide: true });
		list.push([
			{ id: 'load', label: 'Load', kind: 'primary' },
			{ id: 'settings', label: 'Settings', kind: 'primary' }
		]);
		var row = [];
		if (!o.isWin8)
			row.push({ id: 'mods', label: 'Mods', kind: 'primary' });
		row.push({ id: 'highscore', label: 'High Score', kind: 'primary' });
		list.push(row);
		list.push([
			{ id: 'achievements', label: 'Achievements', kind: 'primary' },
			{ id: 'help', label: 'Help', kind: 'primary' }
		]);
		if (!o.isWin8)
			list.push({ id: 'quit', label: 'Quit', kind: 'danger', wide: true });
		return list;
	};

	// --- actions (mirror UI.toggleMainMenu / the vanilla splash click handlers) -------------------

	var hideTitleWidgets = function () {
		if (typeof UI === 'undefined')
			return;
		if (typeof UI.hideAboutBadge === 'function')
			UI.hideAboutBadge();
		if (typeof UI.closeNewsletterWidget === 'function')
			UI.closeNewsletterWidget();
		if (typeof UI.hideMainMenuBanner === 'function')
			UI.hideMainMenuBanner();
	};

	var ACTIONS = {
		'continue': function () {
			if (typeof GameManager.getGameToContinue === 'function' && !GameManager.getGameToContinue()) {
				render();
				return;
			}
			setBusy('Loading ' + (refs.continueName || 'game') + ' ...');
			hideTitleWidgets();
			GameManager.continueGame();
		},
		'new': function () {
			setBusy('Starting game ...');
			hideTitleWidgets();
			GameManager.startNewGame();
		},
		load: function () {
			GameManager.openLoadView();
		},
		settings: function () {
			UI.toggleSettingsPanel();
		},
		mods: function () {
			UI.toggleModsPanel();
		},
		highscore: function () {
			UI.toggleHighScorePanel();
		},
		achievements: function () {
			UI.toggleAchievementPanel();
		},
		help: function () {
			UI.toggleHelpPanel();
		},
		quit: function () {
			window.close();
		}
	};

	// High Score / Achievements are slide-in panels that close on any other click; the toggles
	// handle their own open/close, everything else closes them first.
	var TOGGLE_ACTIONS = { highscore: true, achievements: true };

	var runAction = function (id) {
		if (busy || !ACTIONS[id])
			return;
		if (typeof Sound !== 'undefined' && Sound.click)
			Sound.click();
		if (!TOGGLE_ACTIONS[id] && typeof UI !== 'undefined' && typeof UI.isPanelOpen === 'function' && UI.isPanelOpen())
			UI.closePanels();
		try {
			ACTIONS[id]();
		} catch (e) {
			busy = false;
			setStatus('');
			LivingIndustry.error('Living Industry title menu: "' + id + '" failed.', e);
		}
	};

	var setStatus = function (text) {
		if (refs.status)
			refs.status.textContent = text || '';
	};

	var setBusy = function (text) {
		busy = true;
		setStatus(text);
		if (menu)
			menu.className = 'li-busy';
	};

	// --- DOM ------------------------------------------------------------------------------------

	var ensureStyles = function () {
		if (document.getElementById(STYLE_ID))
			return;
		var style = document.createElement('style');
		style.id = STYLE_ID;
		// Everything is in em so applyLayout() only has to set the root font-size. Colours are the
		// game's own: orange button gradient via .selectorButton.orangeButton, #FFD17B window border
		// gold, #212121 text. The vanilla label/logo are hidden with !important because the base game
		// re-shows them inline (fadeIn / arctext) every time the splash screen appears.
		style.textContent = [
			'#splashScreen #gameReadyLabel, #splashScreen #isAGameTycoonLabel, #splashScreen #splashImage { display: none !important; }',
			// Fallback behind the sunrays: if they ever fail to paint the screen shows the image's own
			// colours instead of the black page body (the vanilla static backdrop fades out).
			'#splashScreen #animatedSplashBackdrop { background-color: #ff9a12;',
			'  background-image: -webkit-radial-gradient(50% 50%, circle, #ffd400 0%, #ffb400 22%, #ff9a12 60%, #ff8a10 100%);',
			'  background-image: radial-gradient(circle at 50% 50%, #ffd400 0%, #ffb400 22%, #ff9a12 60%, #ff8a10 100%); }',
			'#splashScreen.' + RAYS_CLASS + ' #animatedSplashBackdrop:before { display: none !important; }',
			'#splashScreen .li-sunrays { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }',
			// Flex centring rather than translateY(-50%): a transformed element is another compositor
			// layer on this old Chromium, and layers are exactly what was dropping out to black.
			'#' + MENU_ID + ' { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: -webkit-flex; display: flex;',
			'  -webkit-flex-direction: column; flex-direction: column; -webkit-justify-content: center; justify-content: center; -webkit-align-items: center; align-items: center;',
			'  text-align: center; font-family: "Segoe UI", "Open Sans", sans-serif; color: #212121; -webkit-user-select: none; user-select: none; }',
			'#' + MENU_ID + ' .li-logo { display: block; width: 30em; margin: 0 auto; pointer-events: none; }',
			'#' + MENU_ID + ' .li-ribbon-wrap { position: relative; display: inline-block; margin: -1.6em 0 0.7em; -webkit-transform: rotate(-2deg); transform: rotate(-2deg); }',
			'#' + MENU_ID + ' .li-ribbon { position: relative; z-index: 1; display: inline-block; padding: 0.3em 1.5em 0.35em;',
			'  background: #2c2118; background-image: -webkit-linear-gradient(top, #3d2e20 0%, #211813 100%); background-image: linear-gradient(to bottom, #3d2e20 0%, #211813 100%);',
			'  color: #FFD17B; font-size: 1.35em; font-weight: bold; letter-spacing: 0.22em; text-transform: uppercase; white-space: nowrap;',
			'  box-shadow: 0 0.15em 0.45em rgba(0,0,0,0.4); text-shadow: 0 0.06em 0 rgba(0,0,0,0.6); }',
			'#' + MENU_ID + ' .li-ribbon small { display: block; font-size: 0.45em; letter-spacing: 0.3em; font-weight: normal; opacity: 0.75; margin-top: 0.15em; }',
			// Tails are border-only boxes: one transparent side turns the corner joins into a V notch.
			'#' + MENU_ID + ' .li-ribbon-tail { position: absolute; top: 0.6em; width: 0; height: 0; border: 0.95em solid #8a4a14; z-index: 0; }',
			'#' + MENU_ID + ' .li-ribbon-tail.li-left { left: -1.35em; border-left-color: transparent; }',
			'#' + MENU_ID + ' .li-ribbon-tail.li-right { right: -1.35em; border-right-color: transparent; }',
			'#' + MENU_ID + ' .li-row { display: block; }',
			'#' + MENU_ID + ' .li-btn.selectorButton { display: block; width: 24.6em; height: auto; line-height: 2.3em; margin: 0.3em auto;',
			'  font-size: 1.15em; font-weight: 600; border-radius: 0.2em; box-shadow: 0 0.12em 0.25em rgba(0,0,0,0.3); }',
			'#' + MENU_ID + ' .li-row .li-btn.selectorButton { display: inline-block; width: 11.9em; margin: 0.3em 0.4em; vertical-align: top; }',
			'#' + MENU_ID + ' .li-btn.li-continue.selectorButton { line-height: 1.25em; padding: 0.25em 0 0.3em; }',
			'#' + MENU_ID + ' .li-continue .li-sub { display: block; font-size: 0.68em; font-weight: normal; opacity: 0.85; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 0.6em; }',
			'#' + MENU_ID + ' .li-status { min-height: 1.3em; margin-top: 0.3em; font-size: 1.05em; font-weight: bold; }',
			'#' + MENU_ID + ' .li-footer { margin-top: 0.1em; font-size: 0.8em; color: rgba(0,0,0,0.65); }',
			'#' + MENU_ID + '.li-busy .li-btn { opacity: 0.5; pointer-events: none; }'
		].join('\n');
		document.head.appendChild(style);
	};

	var createButton = function (def) {
		var b = document.createElement('div');
		b.className = 'li-btn li-' + def.id + ' selectorButton ' + (def.kind === 'danger' ? 'deleteButton' : 'orangeButton');
		if (def.id === 'continue') {
			var main = document.createElement('span');
			main.textContent = def.label;
			b.appendChild(main);
			var sub = document.createElement('span');
			sub.className = 'li-sub';
			b.appendChild(sub);
			refs.continueSub = sub;
		} else {
			b.textContent = def.label;
		}
		// clickExcl = the base game's button binding (pressed-state class + single click handler).
		// stopPropagation keeps the click from reaching the splash background handler, which would
		// immediately close the panel a toggle button just opened.
		$(b).clickExcl(function (e) {
			e.stopPropagation();
			runAction(def.id);
		});
		refs[def.id] = b;
		return b;
	};

	var ensureMenu = function () {
		if (menu && menu.parentNode)
			return menu;
		var splash = document.getElementById('splashScreen');
		if (!splash)
			return null;
		menu = document.getElementById(MENU_ID);
		if (menu)
			menu.parentNode.removeChild(menu);
		menu = document.createElement('div');
		menu.id = MENU_ID;
		menu.style.display = 'none';

		var logo = document.createElement('img');
		logo.className = 'li-logo';
		logo.src = './images/splashscreen.png';
		logo.alt = 'Game Dev Tycoon';
		menu.appendChild(logo);

		var wrap = document.createElement('div');
		wrap.className = 'li-ribbon-wrap';
		var tailLeft = document.createElement('div');
		tailLeft.className = 'li-ribbon-tail li-left';
		var tailRight = document.createElement('div');
		tailRight.className = 'li-ribbon-tail li-right';
		var ribbon = document.createElement('div');
		ribbon.className = 'li-ribbon';
		ribbon.appendChild(document.createTextNode('Living Industry'));
		var tag = document.createElement('small');
		tag.textContent = 'overhaul mod';
		ribbon.appendChild(tag);
		wrap.appendChild(tailLeft);
		wrap.appendChild(tailRight);
		wrap.appendChild(ribbon);
		menu.appendChild(wrap);

		var isWin8 = typeof PlatformShim !== 'undefined' && !!PlatformShim.ISWIN8;
		var layout = LivingIndustry.TitleMenu.buttons({ hasSave: true, isWin8: isWin8 });
		var buttons = document.createElement('div');
		buttons.className = 'li-buttons';
		for (var i = 0; i < layout.length; i++) {
			var entry = layout[i];
			if (Array.isArray(entry)) {
				var row = document.createElement('div');
				row.className = 'li-row';
				for (var j = 0; j < entry.length; j++)
					row.appendChild(createButton(entry[j]));
				buttons.appendChild(row);
			} else {
				buttons.appendChild(createButton(entry));
			}
		}
		menu.appendChild(buttons);

		refs.status = document.createElement('div');
		refs.status.className = 'li-status';
		menu.appendChild(refs.status);

		refs.footer = document.createElement('div');
		refs.footer.className = 'li-footer';
		menu.appendChild(refs.footer);

		splash.appendChild(menu);
		return menu;
	};

	var gameVersion = function () {
		try {
			if (typeof PlatformShim !== 'undefined' && typeof PlatformShim.getVersion === 'function')
				return (typeof GameFlags !== 'undefined' && GameFlags.G782 ? 'V' : 'v') + PlatformShim.getVersion();
		} catch (e) { /* version is decoration only */ }
		return '';
	};

	var render = function () {
		if (!menu)
			return;
		var header = null;
		try {
			if (typeof GameManager !== 'undefined' && typeof GameManager.getGameToContinue === 'function')
				header = GameManager.getGameToContinue();
		} catch (e) {
			LivingIndustry.error('Living Industry title menu: could not read save headers.', e);
		}
		var info = LivingIndustry.TitleMenu.describeSave(header);
		refs.continueName = info ? info.name : '';
		if (refs['continue']) {
			refs['continue'].style.display = info ? '' : 'none';
			if (info && refs.continueSub) {
				refs.continueSub.textContent = info.detail;
				refs.continueSub.title = info.detail;
			}
		}
		var version = gameVersion();
		refs.footer.textContent = (version ? 'Game Dev Tycoon ' + version + ' \u00B7 ' : '') +
			'Living Industry v' + LivingIndustry.VERSION_LABEL;
	};

	var applyLayout = function () {
		var w = window.innerWidth;
		var h = window.innerHeight;
		if (menu)
			menu.style.fontSize = (cfg().baseFontPx * LivingIndustry.TitleMenu.scaleFor(w, h)).toFixed(2) + 'px';
		resizeRays(w, h);
	};

	// --- sunrays canvas -------------------------------------------------------------------------

	var splashVisible = function () {
		var splash = document.getElementById('splashScreen');
		return !!splash && $(splash).is(':visible');
	};

	var raf = function (fn) {
		var native = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
		if (native)
			return native.call(window, fn);
		return setTimeout(function () { fn(Date.now()); }, RAYS_FRAME_MS);
	};

	var drawRays = function () {
		if (!rays.running)
			return;
		if (!active || !rays.canvas || !rays.canvas.parentNode || !splashVisible()) {
			rays.running = false;
			return;
		}
		var now = Date.now();
		if (rays.scaled && now - rays.lastFrame >= RAYS_FRAME_MS) {
			rays.lastFrame = now;
			var l = rays.layout;
			var ctx = rays.ctx;
			// Vanilla rotates about the image centre (transform-origin 50% 50%), so the slightly
			// off-centre sun wobbles around the window centre exactly as it does there.
			ctx.clearRect(0, 0, rays.canvas.width, rays.canvas.height);
			ctx.save();
			ctx.translate(l.left + l.size / 2, l.top + l.size / 2);
			ctx.rotate((now % RAYS_PERIOD_MS) / RAYS_PERIOD_MS * Math.PI * 2);
			ctx.drawImage(rays.scaled, -l.size / 2, -l.size / 2);
			ctx.restore();
		}
		raf(drawRays);
	};

	var startRays = function () {
		if (rays.running || !rays.canvas)
			return;
		rays.running = true;
		rays.lastFrame = 0;
		raf(drawRays);
	};

	// Pre-scales the image once per window size so each frame is a single textured draw.
	var resizeRays = function (w, h) {
		if (!rays.canvas || !rays.image)
			return;
		var layout = LivingIndustry.TitleMenu.sunraysLayout(w, h);
		if (!rays.scaled || !rays.layout || rays.layout.size !== layout.size) {
			var off = document.createElement('canvas');
			off.width = off.height = layout.size;
			off.getContext('2d').drawImage(rays.image, 0, 0, layout.size, layout.size);
			rays.scaled = off;
		}
		rays.layout = layout;
		if (rays.canvas.width !== w || rays.canvas.height !== h) {
			rays.canvas.width = w;
			rays.canvas.height = h;
		}
		rays.lastFrame = 0;
	};

	// Installs the canvas under the vanilla backdrop; on any failure the vanilla pseudo-element is
	// left untouched.
	var ensureRays = function () {
		if (rays.failed)
			return false;
		if (rays.canvas && rays.canvas.parentNode)
			return true;
		var host = document.getElementById('animatedSplashBackdrop');
		var splash = document.getElementById('splashScreen');
		if (!host || !splash)
			return false;
		try {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext && canvas.getContext('2d');
			if (!ctx)
				throw new Error('no 2d context');
			canvas.className = 'li-sunrays';
			host.appendChild(canvas);
			rays.canvas = canvas;
			rays.ctx = ctx;
			if (!rays.image) {
				var img = new Image();
				img.onload = function () {
					rays.image = img;
					$(splash).addClass(RAYS_CLASS);
					resizeRays(window.innerWidth, window.innerHeight);
					if (active)
						startRays();
				};
				img.onerror = function () {
					rays.failed = true;
					$(splash).removeClass(RAYS_CLASS);
				};
				img.src = './images/sunrays.png';
			} else {
				$(splash).addClass(RAYS_CLASS);
			}
			return true;
		} catch (e) {
			rays.failed = true;
			LivingIndustry.error('Living Industry title menu: sunrays canvas unavailable - vanilla backdrop kept.', e);
			return false;
		}
	};

	var scheduleLayout = function () {
		clearTimeout(layoutTimer);
		layoutTimer = setTimeout(applyLayout, 50);
	};

	// The vanilla splash click handler doubled as "close the High Score / Achievements panel";
	// keep that part, drop the load/new-game part.
	var onBackgroundClick = function () {
		if (typeof UI !== 'undefined' && typeof UI.isPanelOpen === 'function' && UI.isPanelOpen())
			UI.closePanels();
		return false;
	};

	// jQuery 1.7 keeps handlers in the element's internal data; the startup function is the only
	// thing that binds click on #splashScreen, so a bound click means the screen is interactive.
	var vanillaClickBound = function (splash) {
		var events = typeof $._data === 'function' ? $._data(splash[0], 'events') : splash.data('events');
		return !!(events && events.click && events.click.length);
	};

	// Replaces the click-anywhere behaviour with the button menu. Safe to run repeatedly: the base
	// game rebinds its click handler every time the splash is (re)shown, and so do we.
	var takeOver = function () {
		var splash = $('#splashScreen');
		if (!splash.length)
			return false;
		splash.off('click').on('click', onBackgroundClick);
		$('#gameReadyLabel, #isAGameTycoonLabel').stop(true, true).hide();
		ensureStyles();
		if (!ensureMenu())
			return false;
		busy = false;
		menu.className = '';
		setStatus('');
		render();
		ensureRays();
		applyLayout();
		menu.style.display = '';
		active = true;
		startRays();
		return true;
	};

	// Adds a "Living Industry" section to the vanilla Help window (reachable from this menu and
	// from Esc > Help in-game).
	var addHelpSection = function () {
		var panel = document.getElementById('helpPanel');
		if (!panel || document.getElementById(HELP_ID))
			return;
		var section = document.createElement('div');
		section.id = HELP_ID;

		var h2 = document.createElement('h2');
		h2.textContent = 'Living Industry (mod) v' + LivingIndustry.VERSION_LABEL;
		section.appendChild(h2);

		var intro = document.createElement('p');
		intro.textContent = 'Living Industry turns the fixed, predictable game market into one that moves. Each of the six ' +
			'genres has its own demand, momentum and saturation; rival studios release games that push those around, and ' +
			'your own releases push back. Releasing into a hot genre sells better, a cold or crowded one sells worse, and ' +
			'every save writes a different industry history.';
		section.appendChild(intro);

		var items = [
			['Market Pulse', 'The panel in the top-left corner shows every genre\'s trend arrow, HOT/COLD state and a "crowded" flag. Click its header to collapse it; hover details are an opt-in setting.'],
			['Industry news', 'Rival hits and flops and genres turning hot or cold arrive in the sidebar (click one to read it). Popups or off are available in settings.'],
			['Game Concept', 'While defining a game, the chosen genre\'s market line appears under the topic/genre hint so timing is part of the decision.'],
			['Assists', 'Slider marks, snap-to-hints, remembered sliders, the release slider check and learn-by-doing are optional helpers under one master switch - turn it off for the pure vanilla challenge.'],
			['Settings', 'Settings > Living Industry holds every display option and assist, plus a one-click Quiet mode that routes chatty vanilla popups to the sidebar. This title menu can be switched back to the vanilla click-to-continue screen there (takes effect next launch).'],
			['In-game menu', 'Esc or right-click still opens the regular game menu while playing.']
		];
		for (var i = 0; i < items.length; i++) {
			var h3 = document.createElement('h3');
			h3.textContent = items[i][0];
			section.appendChild(h3);
			var p = document.createElement('p');
			p.textContent = items[i][1];
			section.appendChild(p);
		}

		var title = panel.querySelector('.windowTitle');
		if (title && title.nextSibling)
			panel.insertBefore(section, title.nextSibling);
		else
			panel.appendChild(section);

		// jQuery UI 1.8's dialog focuses the first tabbable element on open - the #devStages accordion
		// headers, which our section has pushed below the fold - so the window opened scrolled down.
		if (typeof UI !== 'undefined' && typeof UI.toggleHelpPanel === 'function') {
			var originalToggleHelp = UI.toggleHelpPanel;
			UI.toggleHelpPanel = function () {
				var result = originalToggleHelp.apply(this, arguments);
				var reset = function () {
					$('#helpPanel').scrollTop(0).parent().scrollTop(0);
				};
				reset();
				setTimeout(reset, 0);
				return result;
			};
		}
	};

	LivingIndustry.TitleMenu.isActive = function () {
		return active;
	};

	LivingIndustry.TitleMenu.init = function () {
		if (typeof document === 'undefined' || typeof $ === 'undefined')
			return;
		if (!LivingIndustry.hookOnce('titleMenu'))
			return;
		addHelpSection();
		if (!LivingIndustry.Settings.get('titleMenu'))
			return;
		if (typeof GameManager === 'undefined' || typeof SplashScreen === 'undefined') {
			LivingIndustry.error('Living Industry title menu: GameManager/SplashScreen not available - vanilla title screen kept.');
			return;
		}
		ensureStyles();

		// The splash becomes interactive at the end of the base game's startup function, whose last
		// call is GameManager.startDrawLoop() (its only call site). Mods may finish loading before or
		// after that point, so hook the future case and check for the already-ready case.
		if (typeof GameManager.startDrawLoop === 'function') {
			var originalStart = GameManager.startDrawLoop;
			GameManager.startDrawLoop = function () {
				var result = originalStart.apply(this, arguments);
				takeOver();
				return result;
			};
		}
		// Re-shown after a failed/cancelled load; the base game rebinds click-to-continue there.
		if (typeof SplashScreen.reshow === 'function') {
			var originalReshow = SplashScreen.reshow;
			SplashScreen.reshow = function () {
				var result = originalReshow.apply(this, arguments);
				takeOver();
				return result;
			};
		}
		var splash = $('#splashScreen');
		if (splash.length && splash.is(':visible') && vanillaClickBound(splash))
			takeOver();

		$(window).on('resize.livingIndustryTitleMenu', scheduleLayout);
	};
})();
