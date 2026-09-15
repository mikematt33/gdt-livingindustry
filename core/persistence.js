(function () {
	LivingIndustry.Persistence = {};

	// Shared by every module that hooks into the game: markers live on the base game's GDT object
	// (not on LivingIndustry) so re-running the mod's scripts can't register a second set of hooks.
	LivingIndustry.hookOnce = function (name) {
		var hooks = GDT.__livingIndustryHooks || (GDT.__livingIndustryHooks = {});
		if (hooks[name])
			return false;
		hooks[name] = true;
		return true;
	};

	// Reads the week the loaded save was at. saves.loading fires before Company.load, so
	// GameManager.company still points at the previous company (or nothing) at that moment.
	var loadedWeek = function (e) {
		var company = e && e.data && e.data.company;
		var week = company && company.currentWeek;
		return LivingIndustry.State.isFiniteNumber(week) ? Math.floor(week) : 0;
	};

	LivingIndustry.Persistence.init = function () {
		if (!GDT.on || !GDT.eventKeys) {
			LivingIndustry.error('GDT.on/eventKeys not found - is gdt-modAPI installed? Living Industry persistence hooks were not registered.');
			return;
		}
		if (!LivingIndustry.hookOnce('persistence'))
			return;

		// gdt-modAPI's own persistence hook (in helpers loaded as the first mod) already swapped
		// store.data to the loaded save's data by the time this runs, so we only need to backfill
		// any fields that didn't exist in that save yet.
		GDT.on(GDT.eventKeys.saves.loading, function (e) {
			var modData = e && e.data && e.data.modData;
			if (!modData || !modData[LivingIndustry.MOD_ID])
				LivingIndustry.State.reset();
			LivingIndustry.State.ensureDefaults(LivingIndustry.store.data);
			LivingIndustry.State.migrate(LivingIndustry.store.data);
			LivingIndustry.Rivals.ensureRoster(loadedWeek(e));
			LivingIndustry.Market.onStateLoaded();
			LivingIndustry.News.onStateLoaded();
		});

		GDT.on(GDT.eventKeys.saves.newGame, function () {
			LivingIndustry.State.ensureDefaults(LivingIndustry.store.data);
			LivingIndustry.Market.randomizeStart();
			LivingIndustry.Rivals.ensureRoster(0);
			LivingIndustry.Market.onStateLoaded();
			LivingIndustry.News.onStateLoaded();
		});
	};
})();
