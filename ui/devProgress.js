(function () {
	LivingIndustry.DevProgress = {};

	var el = null;

	// Rendered as an extra row inside the vanilla #statusBar (Fans/Date/Cash box, top-right) so it
	// shares that box's font/size and can't overlap it. Falls back to a fixed badge if the status
	// bar markup isn't there.
	var ensureElement = function () {
		if (el && el.parentNode)
			return el;
		// Reuse an element left by an earlier run of this script rather than stacking duplicates.
		el = document.getElementById('livingindustry-dev-progress');
		if (el)
			return el;
		el = document.createElement('div');
		el.id = 'livingindustry-dev-progress';
		var statusBar = document.getElementById('statusBar');
		if (statusBar) {
			el.className = 'statusBarItem';
			el.style.cssText = 'display:none; font-size:11pt; color:#444; white-space:nowrap;';
			statusBar.appendChild(el);
		} else {
			el.style.cssText = 'position:fixed; top:72px; right:20px; z-index:9999; ' +
				'background:rgba(0,0,0,0.65); color:#fff; font:12px "Segoe UI", sans-serif; ' +
				'padding:4px 8px; border-radius:4px; pointer-events:none; display:none;';
			document.body.appendChild(el);
		}
		return el;
	};

	var percent = function (fraction) {
		if (!LivingIndustry.State.isFiniteNumber(fraction))
			return 0;
		return Math.round(fraction.clamp(0, 1) * 100);
	};

	// GameManager.currentFeature/getCurrentGameProgress aren't documented by gdt-modAPI, but were
	// confirmed live properties/methods by reading compressed/codeNw.js (same approach used to
	// confirm Sales.calculateSales in integration/sales.js).
	var render = function () {
		var badge = ensureElement();
		var company = GameManager.company;
		var feature = GameManager.currentFeature;

		if (!LivingIndustry.Settings.get('showDevProgress') || !company || !company.currentGame || !feature ||
			typeof GameManager.getCurrentGameProgress !== 'function') {
			badge.style.display = 'none';
			return;
		}

		var overall = percent(GameManager.getCurrentGameProgress());
		var current = percent(feature.progress);
		badge.textContent = (feature.name || feature.id || 'Feature') + ': ' + current + '% (game ' + overall + '%)';
		badge.style.display = 'block';
	};

	LivingIndustry.DevProgress.init = function () {
		if (typeof document === 'undefined') {
			LivingIndustry.error('Living Industry dev-progress: no document available - overlay disabled.');
			return;
		}
		if (!LivingIndustry.hookOnce('devProgress'))
			return;
		GameManager.addTickListener(function () {
			try {
				render();
			} catch (e) {
				LivingIndustry.error('Living Industry dev-progress overlay failed', e);
			}
		}, false);
	};
})();
