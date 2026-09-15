(function () {
	LivingIndustry.State = {};

	// Matches GameGenre's 6 genre ids (Action, Adventure, RPG, Simulation, Strategy, Casual).
	var genreIds = ['Action', 'Adventure', 'RPG', 'Simulation', 'Strategy', 'Casual'];
	LivingIndustry.State.GENRE_IDS = genreIds; // exposed so other modules (e.g. rivals/rivals.js) don't duplicate this list

	var isFiniteNumber = function (value) {
		return typeof value === 'number' && isFinite(value);
	};
	LivingIndustry.State.isFiniteNumber = isFiniteNumber;

	var defaultGenreState = function () {
		return { demand: 1, momentum: 0, saturation: 0, recentCauses: [] };
	};

	var defaultState = function () {
		var market = {};
		for (var i = 0; i < genreIds.length; i++)
			market[genreIds[i]] = defaultGenreState();

		return {
			version: LivingIndustry.VERSION,
			market: market,
			rivals: [],
			meta: { lastTickWeek: -1 },
			sliderMemory: {} // "topic|genre|secondGenre" -> { "1": [raw,raw,raw], "2": [...], "3": [...] }
		};
	};

	// A save can only hand back what JSON round-trips, so a genre entry may be missing fields or
	// carry NaN/strings from an older or hand-edited save. Repair per field rather than resetting
	// the whole genre so surviving values are kept.
	var sanitizeGenre = function (genreState) {
		var fallback = defaultGenreState();
		if (!genreState || typeof genreState !== 'object')
			return fallback;
		for (var key in fallback) {
			if (!fallback.hasOwnProperty(key))
				continue;
			if (key === 'recentCauses') {
				if (!Array.isArray(genreState.recentCauses))
					genreState.recentCauses = [];
			} else if (!isFiniteNumber(genreState[key])) {
				genreState[key] = fallback[key];
			}
		}
		return genreState;
	};

	// Fills in fields missing from `data` (a fresh {} from a new game, or an older save) without touching values that already exist.
	LivingIndustry.State.ensureDefaults = function (data) {
		var fallback = defaultState();
		if (!isFiniteNumber(data.version))
			data.version = fallback.version;

		if (!data.market || typeof data.market !== 'object')
			data.market = {};
		for (var i = 0; i < genreIds.length; i++) {
			var genreId = genreIds[i];
			data.market[genreId] = sanitizeGenre(data.market.hasOwnProperty(genreId) ? data.market[genreId] : null);
		}

		if (!data.meta || typeof data.meta !== 'object')
			data.meta = fallback.meta;
		if (!isFiniteNumber(data.meta.lastTickWeek))
			data.meta.lastTickWeek = -1;
		if (data.meta.hasOwnProperty('snapMarks') && typeof data.meta.snapMarks !== 'boolean')
			delete data.meta.snapMarks; // unset -> re-seeded from the settings default on next use
		if (data.meta.hasOwnProperty('tipsSeen') && !Array.isArray(data.meta.tipsSeen))
			delete data.meta.tipsSeen; // absent -> ui/tutorial.js treats the run as never welcomed

		if (!Array.isArray(data.rivals))
			data.rivals = fallback.rivals;

		if (!data.sliderMemory || typeof data.sliderMemory !== 'object' || Array.isArray(data.sliderMemory))
			data.sliderMemory = {};

		return data;
	};

	// Placeholder for converting older save versions forward; bump LivingIndustry.VERSION in balance/constants.js when the shape changes.
	LivingIndustry.State.migrate = function (data) {
		if (data.version < LivingIndustry.VERSION)
			data.version = LivingIndustry.VERSION;
		return data;
	};

	// gdt-modAPI only swaps store.data for plugin ids present in the loaded save, so a save that
	// never had Living Industry data would otherwise inherit the previous session's market/rivals.
	LivingIndustry.State.reset = function () {
		LivingIndustry.store.data = {};
		LivingIndustry.State.ensureDefaults(LivingIndustry.store.data);
	};

	LivingIndustry.State.init = function () {
		if (typeof GDT === 'undefined' || typeof GDT.getDataStore !== 'function')
			throw new Error('GDT.getDataStore not found - is gdt-modAPI installed and enabled before Living Industry?');
		LivingIndustry.store = GDT.getDataStore(LivingIndustry.MOD_ID);
		LivingIndustry.State.ensureDefaults(LivingIndustry.store.data);
		LivingIndustry.State.migrate(LivingIndustry.store.data);
	};

	// Always read live off the store - GDT swaps store.data out wholesale when a save is loaded.
	LivingIndustry.State.get = function () {
		return LivingIndustry.store.data;
	};
})();
