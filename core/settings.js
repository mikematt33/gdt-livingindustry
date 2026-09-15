(function () {
	LivingIndustry.Settings = {};

	// Player-facing toggles live in gdt-modAPI's app-wide store.settings (DataStore.settings.modData),
	// not in the per-save data, so they follow the player across saves. CONFIG.settings holds the
	// defaults; only keys defined there are accepted.
	var store = function () {
		return LivingIndustry.store && LivingIndustry.store.settings;
	};

	LivingIndustry.Settings.has = function (key) {
		return LivingIndustry.CONFIG.settings.hasOwnProperty(key);
	};

	LivingIndustry.Settings.isAssist = function (key) {
		return LivingIndustry.CONFIG.assistKeys.indexOf(key) >= 0;
	};

	var normalise = function (s) {
		return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
	};

	// The enabled mod (base game ModSupport.availableMods entry) that duplicates this setting's
	// feature, or null. `active` is set by ModSupport.loadMods before any mod script runs.
	LivingIndustry.Settings.conflictingMod = function (key) {
		var conflicts = LivingIndustry.CONFIG.settingConflicts && LivingIndustry.CONFIG.settingConflicts[key];
		if (!conflicts || typeof ModSupport === 'undefined' || !Array.isArray(ModSupport.availableMods))
			return null;
		var wanted = conflicts.map(normalise);
		var enabledIds = Array.isArray(ModSupport.currentMods) ? ModSupport.currentMods : [];
		for (var i = 0; i < ModSupport.availableMods.length; i++) {
			var mod = ModSupport.availableMods[i];
			if (!mod || mod.id === LivingIndustry.MOD_ID)
				continue;
			if (mod.active !== true && enabledIds.indexOf(mod.id) < 0)
				continue;
			if (wanted.indexOf(normalise(mod.id)) >= 0 || wanted.indexOf(normalise(mod.name)) >= 0)
				return mod;
		}
		return null;
	};

	// The default for a key the player has never set: CONFIG.settings, except that a boolean
	// feature duplicated by an enabled Workshop mod defaults to off.
	LivingIndustry.Settings.getDefault = function (key) {
		var value = LivingIndustry.CONFIG.settings[key];
		if (value === true && LivingIndustry.Settings.conflictingMod(key))
			return false;
		return value;
	};

	// The stored value, ignoring the assists master switch (what the settings UI shows).
	LivingIndustry.Settings.getRaw = function (key) {
		var defaults = LivingIndustry.CONFIG.settings;
		var saved = store();
		if (saved && saved.hasOwnProperty(key) && typeof saved[key] === typeof defaults[key])
			return saved[key];
		return LivingIndustry.Settings.getDefault(key);
	};

	// The effective value: assist features read as off while the master switch is off.
	LivingIndustry.Settings.get = function (key) {
		if (LivingIndustry.Settings.isAssist(key) && !LivingIndustry.Settings.getRaw('assistsEnabled'))
			return false;
		return LivingIndustry.Settings.getRaw(key);
	};

	LivingIndustry.Settings.set = function (key, value) {
		if (!LivingIndustry.Settings.has(key) || typeof value !== typeof LivingIndustry.CONFIG.settings[key])
			return false;
		var saved = store();
		if (!saved)
			return false;
		saved[key] = value;
		if (typeof DataStore !== 'undefined' && typeof DataStore.saveSettings === 'function') {
			try {
				DataStore.saveSettings();
			} catch (e) {
				LivingIndustry.error('Living Industry settings: could not persist settings', e);
			}
		}
		return true;
	};

	LivingIndustry.Settings.init = function () {
		if (!store())
			LivingIndustry.error('Living Industry settings: store.settings unavailable - settings will use defaults only.');
	};
})();
