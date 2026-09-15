(function () {
	LivingIndustry.Rng = {};

	// Math.imul is missing on the game's old Chromium; same 32-bit wrap-around multiply by hand.
	var imul = Math.imul || function (a, b) {
		var ah = (a >>> 16) & 0xffff, al = a & 0xffff;
		var bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
		return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
	};

	// Fresh 31-bit seed for a new run (or a save predating seeds). This is the only Math.random
	// call the simulation makes; everything else derives from the persisted stream below.
	LivingIndustry.Rng.newSeed = function () {
		return Math.floor(Math.random() * 0x7fffffff);
	};

	LivingIndustry.Rng.seed = function () {
		var meta = LivingIndustry.State.get().meta;
		return LivingIndustry.State.isFiniteNumber(meta.seed) ? meta.seed : null;
	};

	// mulberry32 over one 32-bit state word kept in the save (meta.rngState), so a reloaded game
	// continues the exact sequence it would have produced without the reload, and a run's market
	// and rivals are a function of its seed plus the player's own releases. Player-driven rolls
	// (learn by doing) deliberately stay on the company's own RNG so they can't perturb this stream.
	LivingIndustry.Rng.random = function () {
		var meta = LivingIndustry.State.get().meta;
		if (!LivingIndustry.State.isFiniteNumber(meta.rngState))
			meta.rngState = LivingIndustry.State.isFiniteNumber(meta.seed) ? meta.seed : LivingIndustry.Rng.newSeed();
		var state = (meta.rngState + 0x6D2B79F5) | 0;
		meta.rngState = state;
		var t = imul(state ^ (state >>> 15), 1 | state);
		t = (t + imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};

	LivingIndustry.Rng.between = function (min, max) {
		return min + LivingIndustry.Rng.random() * (max - min);
	};

	// Integer in [0, n).
	LivingIndustry.Rng.int = function (n) {
		return Math.floor(LivingIndustry.Rng.random() * n);
	};

	LivingIndustry.Rng.pick = function (array) {
		return array[LivingIndustry.Rng.int(array.length)];
	};

	LivingIndustry.Rng.chance = function (probability) {
		return LivingIndustry.Rng.random() < probability;
	};

	// Fisher-Yates copy; Array.sort with a random comparator is neither uniform nor seed-stable.
	LivingIndustry.Rng.shuffle = function (array) {
		var copy = array.slice();
		for (var i = copy.length - 1; i > 0; i--) {
			var j = LivingIndustry.Rng.int(i + 1);
			var tmp = copy[i];
			copy[i] = copy[j];
			copy[j] = tmp;
		}
		return copy;
	};
})();
