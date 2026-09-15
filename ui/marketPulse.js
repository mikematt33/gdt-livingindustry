(function () {
	LivingIndustry.MarketPulse = {};

	var PANEL_ID = 'livingindustry-market-pulse';
	var panel = null;
	var body = null;
	var toggle = null;
	var renderedRevision = -1;
	var renderedCollapsed = null;

	// --- pure description (no DOM) -------------------------------------------------------------

	var zoneOf = function (demand) {
		var cfg = LivingIndustry.CONFIG.news;
		if (demand >= cfg.hotDemand)
			return 'hot';
		if (demand <= cfg.coldDemand)
			return 'cold';
		return 'normal';
	};

	var signed = function (value, digits) {
		var n = Number(value) || 0;
		return (n > 0 ? '+' : '') + n.toFixed(digits);
	};

	// Turns one recorded cause into a short human line. Unknown types still render generically so a
	// future cause shape never blanks the tooltip.
	LivingIndustry.MarketPulse.describeCause = function (cause) {
		if (!cause || typeof cause !== 'object')
			return '';
		var type = String(cause.type || 'change');
		var label;
		if (type.indexOf('rival_') === 0) {
			var outcome = type.slice(6);
			label = (cause.name || 'A rival studio') + ' ' +
				(outcome === 'hit' ? 'scored a hit' : outcome === 'flop' ? 'released a flop' : 'released a game');
		} else if (type.indexOf('player_') === 0) {
			var band = type.slice(7).replace('_', ' ');
			label = 'Your ' + (band === 'average' ? 'release' : band) + (cause.title ? ': ' + cause.title : '') +
				(LivingIndustry.State.isFiniteNumber(cause.score) ? ' (' + cause.score + ')' : '');
		} else if (type === 'taste_shift') {
			label = 'Audience tastes shifting ' + (cause.direction === 'down' ? 'away from' : 'toward') + ' the genre';
		} else {
			label = type.replace(/_/g, ' ');
		}
		var parts = [];
		if (LivingIndustry.State.isFiniteNumber(cause.momentum) && cause.momentum !== 0)
			parts.push(signed(cause.momentum, 2) + ' momentum');
		if (LivingIndustry.State.isFiniteNumber(cause.saturation) && cause.saturation !== 0)
			parts.push(signed(cause.saturation, 2) + ' saturation');
		var week = LivingIndustry.State.isFiniteNumber(cause.week) ? 'wk ' + cause.week + ': ' : '';
		return week + label + (parts.length ? ' (' + parts.join(', ') + ')' : '');
	};

	// Compact per-genre summary used by the panel; exposed for tests and devtools.
	LivingIndustry.MarketPulse.describeGenre = function (genreId, genreState) {
		var g = genreState || {};
		var demand = LivingIndustry.State.isFiniteNumber(g.demand) ? g.demand : 1;
		var momentum = LivingIndustry.State.isFiniteNumber(g.momentum) ? g.momentum : 0;
		var saturation = LivingIndustry.State.isFiniteNumber(g.saturation) ? g.saturation : 0;
		var trend = LivingIndustry.Market.trendOf(g);
		var zone = zoneOf(demand);
		var crowded = saturation >= LivingIndustry.CONFIG.ui.saturationWarn;
		var causes = Array.isArray(g.recentCauses) ? g.recentCauses.slice(-LivingIndustry.CONFIG.ui.maxCausesShown).reverse() : [];
		var lines = causes.map(LivingIndustry.MarketPulse.describeCause).filter(function (l) { return l; });
		// Zone is the demand level, the arrow is where tastes are heading; spell out the two cases where
		// they point opposite ways so "COLD ↗" reads as a recovery rather than a contradiction.
		var note = zone === 'cold' && trend === 'rising' ? 'recovering' : (zone === 'hot' && trend === 'falling' ? 'cooling' : '');
		return {
			genreId: genreId,
			trend: trend,
			arrow: trend === 'rising' ? '\u2197' : (trend === 'falling' ? '\u2198' : '\u2192'),
			zone: zone,
			zoneLabel: zone === 'hot' ? 'HOT' : (zone === 'cold' ? 'COLD' : ''),
			note: note,
			crowded: crowded,
			demand: demand,
			momentum: momentum,
			saturation: saturation,
			tooltip: genreId + ' - demand ' + demand.toFixed(2) + ', momentum ' + signed(momentum, 3) +
				', saturation ' + saturation.toFixed(2) + (note ? ' (' + note + ')' : '') +
				(lines.length ? '\n' + lines.join('\n') : '\nNo recent releases in this genre.')
		};
	};

	// --- DOM ------------------------------------------------------------------------------------

	var ensurePanel = function () {
		if (panel)
			return panel;
		panel = document.getElementById(PANEL_ID);
		if (panel) {
			body = panel.querySelector('.rp-body');
			toggle = panel.querySelector('.rp-toggle');
			return panel;
		}
		panel = document.createElement('div');
		panel.id = PANEL_ID;
		// Same box treatment as the vanilla #statusBar (white, grey 2px border, 5px radius). Sizes are
		// in em so the uiScale setting only has to change the font-size. Top offset clears the game's
		// own FPS readout in that corner.
		panel.style.cssText = 'position:fixed; top:26px; left:8px; z-index:9998; min-width:14em; ' +
			'background:#fff; color:#000; border:2px solid #A4A4A4; border-radius:5px; ' +
			'font-family:"Segoe UI", "Open Sans", sans-serif; padding:0.25em 0.5em 0.35em; display:none; user-select:none;';

		var header = document.createElement('div');
		header.style.cssText = 'cursor:pointer; font-weight:600; letter-spacing:0.04em; display:flex; justify-content:space-between;';
		header.appendChild(document.createTextNode('MARKET PULSE'));
		toggle = document.createElement('span');
		toggle.className = 'rp-toggle';
		toggle.style.cssText = 'margin-left:0.6em; opacity:0.7;';
		header.appendChild(toggle);
		header.addEventListener('click', function () {
			LivingIndustry.Settings.set('marketPulseCollapsed', !LivingIndustry.Settings.get('marketPulseCollapsed'));
		});
		panel.appendChild(header);

		body = document.createElement('div');
		body.className = 'rp-body';
		body.style.cssText = 'margin-top:0.25em;';
		panel.appendChild(body);

		document.body.appendChild(panel);
		return panel;
	};

	var zoneColor = { hot: '#d9531e', cold: '#1f74c4', normal: '' };

	var renderRows = function () {
		var data = LivingIndustry.State.get();
		var tooltips = !!LivingIndustry.Settings.get('marketTooltips');
		while (body.firstChild)
			body.removeChild(body.firstChild);
		var genres = LivingIndustry.State.GENRE_IDS;
		for (var i = 0; i < genres.length; i++) {
			var info = LivingIndustry.MarketPulse.describeGenre(genres[i], data.market && data.market[genres[i]]);
			var row = document.createElement('div');
			row.style.cssText = 'display:flex; gap:0.5em; line-height:1.45; white-space:nowrap;';
			if (tooltips)
				row.title = info.tooltip;

			var name = document.createElement('span');
			name.style.cssText = 'display:inline-block; width:6.2em;';
			name.textContent = info.genreId;
			row.appendChild(name);

			var arrow = document.createElement('span');
			arrow.style.cssText = 'display:inline-block; width:1.2em; text-align:center; font-weight:700;' +
				(info.trend === 'rising' ? 'color:#2e9e3a;' : info.trend === 'falling' ? 'color:#c0392b;' : 'color:#888;');
			arrow.textContent = info.arrow;
			row.appendChild(arrow);

			var zone = document.createElement('span');
			zone.style.cssText = 'display:inline-block; width:3em; font-weight:600;' + (zoneColor[info.zone] ? 'color:' + zoneColor[info.zone] + ';' : '');
			zone.textContent = info.zoneLabel;
			row.appendChild(zone);

			if (info.note) {
				var note = document.createElement('span');
				note.style.cssText = 'color:#666; font-style:italic;';
				note.textContent = info.note;
				row.appendChild(note);
			}
			if (info.crowded) {
				var flag = document.createElement('span');
				flag.style.cssText = 'color:#b8860b;';
				flag.textContent = '\u26A0 crowded';
				row.appendChild(flag);
			}
			body.appendChild(row);
		}
	};

	var BASE_FONT_PT = 11;
	var renderedScale = null;
	var renderedTooltips = null;

	var render = function () {
		var el = ensurePanel();
		var company = GameManager.company;
		if (!LivingIndustry.Settings.get('showMarketPulse') || !company || !LivingIndustry.store || !LivingIndustry.State.get().market) {
			el.style.display = 'none';
			return;
		}
		el.style.display = 'block';

		var scale = LivingIndustry.Settings.get('uiScale');
		if (scale !== renderedScale) {
			el.style.fontSize = (BASE_FONT_PT * (scale > 0 ? scale : 1)).toFixed(2) + 'pt';
			renderedScale = scale;
		}

		var collapsed = LivingIndustry.Settings.get('marketPulseCollapsed');
		if (collapsed !== renderedCollapsed) {
			body.style.display = collapsed ? 'none' : 'block';
			toggle.textContent = collapsed ? '\u25B8' : '\u25BE';
			renderedCollapsed = collapsed;
		}
		var tooltips = !!LivingIndustry.Settings.get('marketTooltips');
		if (collapsed || (LivingIndustry.Market.revision === renderedRevision && tooltips === renderedTooltips))
			return;
		renderRows();
		renderedRevision = LivingIndustry.Market.revision;
		renderedTooltips = tooltips;
	};

	LivingIndustry.MarketPulse.init = function () {
		if (typeof document === 'undefined') {
			LivingIndustry.error('Living Industry market pulse: no document available - panel disabled.');
			return;
		}
		if (!LivingIndustry.hookOnce('marketPulse'))
			return;
		GameManager.addTickListener(function () {
			try {
				render();
			} catch (e) {
				LivingIndustry.error('Living Industry market pulse panel failed', e);
			}
		}, false);
	};
})();
