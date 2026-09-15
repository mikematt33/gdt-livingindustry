(function () {
	LivingIndustry.News = {};

	// Transient per-genre tracking (not persisted) - rebuilt from live state after each load so a
	// load itself is never misread as every genre suddenly changing direction/zone.
	var lastDirection = {};
	var lastZone = {};
	var lastAnnouncedWeek = {};

	var zoneOf = function (demand) {
		var cfg = LivingIndustry.CONFIG.news;
		if (demand >= cfg.hotDemand)
			return 'hot';
		if (demand <= cfg.coldDemand)
			return 'cold';
		return 'normal';
	};

	var currentWeek = function () {
		var company = GameManager.company;
		return company && LivingIndustry.State.isFiniteNumber(company.currentWeek) ? Math.floor(company.currentWeek) : 0;
	};

	// Posts one industry news item through the player's chosen channel. 'sidebar' uses the base
	// game's own sidebar list (UI._addSidebarNotification: non-blocking, auto-dismissed after
	// ~30 game-seconds, click to read in full) instead of a modal popup; 'popup' queues a normal
	// delayed company notification exactly like the base game's Industry News; 'off' only logs.
	// Exposed publicly so other modules (e.g. rivals/rivals.js) post through the same channel.
	var announce = function (text) {
		var company = GameManager.company;
		if (!company || !company.notifications)
			return;
		var delivery = LivingIndustry.Settings.get('newsDelivery');
		LivingIndustry.log('[Living Industry] news (' + delivery + '): ' + text);
		if (delivery === 'off')
			return;

		var notification = new Notification({
			header: Media.industryNewsHeadline,
			text: text,
			weeksUntilFired: 0.4
		});
		if (delivery === 'sidebar' && typeof UI !== 'undefined' && typeof UI._addSidebarNotification === 'function' &&
			Array.isArray(company.sidebarNotifications)) {
			try {
				UI._addSidebarNotification(notification);
				return;
			} catch (e) {
				LivingIndustry.error('Living Industry news: sidebar delivery failed - falling back to popup', e);
			}
		}
		company.notifications.push(notification);
	};

	// Trend/zone news about one genre is rate limited so a genre oscillating around a threshold
	// (rivals and player releases now push momentum both ways) can't post every week.
	var announceGenre = function (genreId, text) {
		var week = currentWeek();
		var last = lastAnnouncedWeek[genreId];
		if (last !== undefined && week - last < LivingIndustry.CONFIG.news.genreCooldownWeeks)
			return;
		lastAnnouncedWeek[genreId] = week;
		announce(text);
	};

	// Reports a genre's long-term trend reversing (rising <-> falling; passing through flat first
	// still counts as a reversal once the new direction is established). The trend follows the slow
	// taste layer (Market.trendOf), so this fires on real shifts, not weekly wobble. Off by default
	// since the Market Pulse panel shows the arrow; the direction is still tracked so enabling it
	// mid-game doesn't announce a stale change.
	var checkDirectionFlip = function (genreId, genreState) {
		var dir = LivingIndustry.Market.trendOf(genreState);
		var prev = lastDirection[genreId];
		if (dir === 'flat')
			return;
		if (prev && prev !== dir && LivingIndustry.Settings.get('trendNews')) {
			announceGenre(genreId, dir === 'rising'
				? '{0} demand is picking back up after a decline.'.format(genreId)
				: 'Developers are growing wary as demand for {0} games has started to cool off.'.format(genreId));
		}
		lastDirection[genreId] = dir;
	};

	// Reports a genre crossing into/out of hot or cold territory, once per crossing rather than
	// every week it stays there.
	var checkZoneCrossing = function (genreId, genreState) {
		var zone = zoneOf(genreState.demand);
		var prev = lastZone[genreId];
		if (prev !== undefined && zone !== prev) {
			if (zone === 'hot')
				announceGenre(genreId, '{0} is the genre of the moment - demand has rarely been higher.'.format(genreId));
			else if (zone === 'cold')
				announceGenre(genreId, 'The market for {0} games has gone cold, with demand at a multi-year low.'.format(genreId));
		}
		lastZone[genreId] = zone;
	};

	// Called once per market tick (see market/market.js) to surface notable changes as industry news.
	LivingIndustry.News.onMarketTick = function () {
		var data = LivingIndustry.State.get();
		for (var genreId in data.market) {
			if (!data.market.hasOwnProperty(genreId))
				continue;
			var genreState = data.market[genreId];
			checkDirectionFlip(genreId, genreState);
			checkZoneCrossing(genreId, genreState);
		}
	};

	LivingIndustry.News.onStateLoaded = function () {
		lastDirection = {};
		lastZone = {};
		lastAnnouncedWeek = {};
	};

	LivingIndustry.News.announce = announce;

	LivingIndustry.News.init = function () {
		if (typeof Notification === 'undefined' || typeof Media === 'undefined' || !Media.industryNewsHeadline)
			LivingIndustry.error('Living Industry news: Notification/Media API not found - industry news disabled.');
	};
})();
