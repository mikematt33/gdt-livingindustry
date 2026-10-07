(function () {
	LivingIndustry.GameMenu = {};

	// The vanilla Esc / right-click menu (#mainMenu in defaultBrowser.html, wired up by
	// UI.toggleMainMenu in codeNw.js) has a single Exit button that closes the window; the window's
	// close handler autosaves first. While a game is running this module splits it into Main Menu
	// and Exit to Desktop. Main Menu autosaves the same way, then reloads the page, so the game, its
	// mods and the title menu start fresh instead of a half-torn-down company lingering behind the
	// splash.
	//
	// The reload is a plain nw Window.reload(), not the base game's PlatformShim.restartApp
	// (reload(3), which vanilla never calls): reload(3) gives the page a new Node context whose
	// Window object is not bound to the native window, so close requests (Exit, Quit, Alt+F4) are
	// never delivered and the game can't be quit. A plain reload keeps the bound Window object, and
	// nw itself drops the previous page's 'close' listeners.

	var BUTTON_CLASS = 'li-mainMenuButton';
	var SMALL_CLASS = 'mainMenuButtonSmall'; // vanilla half-width menu button (Save / Load row)
	var MAIN_MENU_LABEL = 'Main Menu';
	var SAVING_LABEL = 'Saving ...';
	var EXIT_LABEL = 'Exit to Desktop';

	var busy = false;
	var vanillaExitLabel = null; // localized Exit text, restored whenever the menu is not split

	// --- pure (no DOM) ------------------------------------------------------------------------

	// What the in-game menu shows. Main Menu needs a loaded company to save and leave, so the title
	// screen (and a load in progress) keeps the vanilla Exit. The Windows Store build hides Exit.
	LivingIndustry.GameMenu.layout = function (options) {
		var o = options || {};
		var split = !!(o.enabled && o.hasCompany && !o.splashVisible && !o.loading && !o.isWin8);
		return {
			mainMenu: split,
			exitLabel: split ? EXIT_LABEL : null
		};
	};

	// --- actions --------------------------------------------------------------------------------

	var setMenuLocked = function (locked) {
		if (typeof UI === 'undefined')
			return;
		var fn = locked ? UI.disableMainMenu : UI.enableMainMenu;
		if (typeof fn === 'function')
			fn.call(UI);
	};

	// GameManager.autoSave (codeNw.js) skips the save in G782 builds from year 11 on, but it never
	// reports a failed save, so the same rule is applied here around GameManager.save.
	var saveAuto = function (done, failed) {
		var company = GameManager.company;
		if (typeof GameFlags !== 'undefined' && GameFlags.G782 && company && typeof company.getCurrentDate === 'function' &&
			company.getCurrentDate().year >= 11) {
			done();
			return;
		}
		GameManager.save('auto', done, failed);
	};

	LivingIndustry.GameMenu.nwWindow = function () {
		try {
			if (typeof require === 'function')
				return require('nw.gui').Window.get();
		} catch (e) { /* not running under node-webkit */ }
		return null;
	};

	LivingIndustry.GameMenu.restartApp = function () {
		var win = LivingIndustry.GameMenu.nwWindow();
		if (win && typeof win.reload === 'function')
			win.reload();
		else
			window.location.reload();
	};

	// Autosaves, then restarts into the title screen. Returns false when there is no game to leave
	// or a return is already under way. A failed save keeps the player in the game.
	LivingIndustry.GameMenu.returnToTitle = function (onFailed) {
		if (busy || typeof GameManager === 'undefined' || !GameManager.company || typeof GameManager.save !== 'function')
			return false;
		busy = true;
		setMenuLocked(true);
		var fail = function (e) {
			busy = false;
			setMenuLocked(false);
			LivingIndustry.error('Living Industry: autosave before returning to the main menu failed - staying in the game.', e);
			if (onFailed)
				onFailed(e);
		};
		try {
			saveAuto(function () {
				LivingIndustry.GameMenu.restartApp();
			}, fail);
		} catch (e) {
			fail(e);
		}
		return true;
	};

	// --- DOM ------------------------------------------------------------------------------------

	var resetButton = function (button) {
		button.removeClass('disabled').text(MAIN_MENU_LABEL);
	};

	var onMainMenuClick = function () {
		var button = $('#mainMenu .' + BUTTON_CLASS);
		if (busy || button.hasClass('disabled'))
			return;
		if (typeof Sound !== 'undefined' && Sound.click)
			Sound.click();
		button.addClass('disabled').text(SAVING_LABEL);
		var started = LivingIndustry.GameMenu.returnToTitle(function () {
			resetButton(button);
		});
		if (!started)
			resetButton(button);
	};

	var ensureButton = function (exit) {
		var button = exit.siblings('.' + BUTTON_CLASS);
		if (button.length)
			return button;
		button = $('<div></div>')
			.addClass(BUTTON_CLASS + ' selectorButton orangeButton windowLargeOkButton mainMenuButton ' + SMALL_CLASS)
			.text(MAIN_MENU_LABEL);
		// clickExcl = the base game's button binding (pressed-state class + single click handler).
		button.clickExcl(onMainMenuClick);
		button.insertBefore(exit);
		return button;
	};

	var currentLayout = function () {
		return LivingIndustry.GameMenu.layout({
			enabled: LivingIndustry.Settings.get('gameMenuMainMenu'),
			hasCompany: !!GameManager.company,
			splashVisible: typeof SplashScreen !== 'undefined' && typeof SplashScreen.isVisible === 'function' && SplashScreen.isVisible(),
			loading: !!GameManager.loadInProgress,
			isWin8: typeof PlatformShim !== 'undefined' && !!PlatformShim.ISWIN8
		});
	};

	// Runs before every open so the setting and the title-screen/in-game switch apply immediately.
	var decorate = function () {
		var exit = $('#mainMenu .exitButton');
		if (!exit.length)
			return;
		if (vanillaExitLabel === null)
			vanillaExitLabel = $.trim(exit.text());
		var layout = currentLayout();
		if (layout.mainMenu) {
			var button = ensureButton(exit);
			if (!busy)
				resetButton(button);
			button.show();
			exit.addClass(SMALL_CLASS).text(layout.exitLabel);
		} else {
			exit.siblings('.' + BUTTON_CLASS).hide();
			exit.removeClass(SMALL_CLASS).text(vanillaExitLabel);
		}
	};

	LivingIndustry.GameMenu.init = function () {
		if (typeof UI === 'undefined' || typeof UI.toggleMainMenu !== 'function' || typeof $ === 'undefined' ||
			typeof GameManager === 'undefined') {
			LivingIndustry.error('Living Industry game menu: UI.toggleMainMenu not found - Main Menu button disabled.');
			return;
		}
		if (UI.toggleMainMenu.__livingIndustryPatched)
			return;
		var original = UI.toggleMainMenu;
		// The vanilla Esc / right-click listeners look UI.toggleMainMenu up on every press.
		var patched = function () {
			try {
				decorate();
			} catch (e) {
				LivingIndustry.error('Living Industry game menu: could not add the Main Menu button.', e);
			}
			return original.apply(this, arguments);
		};
		patched.__livingIndustryPatched = true;
		UI.toggleMainMenu = patched;
	};
})();
