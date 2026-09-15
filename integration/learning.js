(function () {
	LivingIndustry.Learning = {};

	var original = null;

	// Skill values are stored as factors where 500 * factor is the number shown in the staff panel
	// (Character.applyTrainingUpdate adds p / 500), so a "skill point" here is 1/500 of a factor.
	var FACTOR_PER_POINT = 500;
	var SKILL_FIELD = { d: 'designFactor', t: 'technologyFactor', r: 'researchFactor' };

	var rng = function () {
		var company = typeof GameManager !== 'undefined' && GameManager.company;
		if (company && typeof company.getRandom === 'function')
			return company.getRandom();
		return Math.random();
	};

	var pickSkill = function (weights, roll) {
		var total = 0, key;
		for (key in weights)
			if (weights.hasOwnProperty(key))
				total += weights[key];
		var cursor = roll * total;
		for (key in weights) {
			if (!weights.hasOwnProperty(key))
				continue;
			cursor -= weights[key];
			if (cursor <= 0)
				return key;
		}
		return null;
	};

	// Pure: decides whether producing `amount` points of `type` teaches the character anything.
	// rolls = [chanceRoll, skillRoll, gainRoll] in [0,1). Returns { skill: 'd'|'t'|'r', points } or null.
	LivingIndustry.Learning.rollGain = function (character, amount, type, rolls) {
		var cfg = LivingIndustry.CONFIG.learning;
		var weights = cfg.skillWeights[type];
		if (!weights || !LivingIndustry.State.isFiniteNumber(amount) || amount <= 0)
			return null;
		var skill = pickSkill(weights, rolls[1]);
		var field = SKILL_FIELD[skill];
		if (!field)
			return null;
		var current = LivingIndustry.State.isFiniteNumber(character[field]) ? character[field] : 0;
		var maxFactor = cfg.maxSkill / FACTOR_PER_POINT;
		var headroom = Math.floor((maxFactor - current) * FACTOR_PER_POINT + 1e-6);
		if (headroom <= 0)
			return null;

		// The better they already are, the rarer the lesson.
		var diminish = (1 - current / maxFactor).clamp(cfg.minLearnFactor, 1);
		var chance = (cfg.chancePerPoint * amount * diminish).clamp(0, 1);
		if (rolls[0] >= chance)
			return null;

		var points = cfg.gainMin + Math.floor(rolls[2] * (cfg.gainMax - cfg.gainMin + 1));
		return { skill: skill, points: Math.min(points, headroom) };
	};

	var SKILL_NAME = { d: 'Design', t: 'Technology', r: 'Research' };

	// Small floating "+N Design" over the character, in the style of the base game's point bubbles.
	var showGainText = function (character, gain) {
		if (typeof createjs === 'undefined' || typeof VisualsManager === 'undefined' ||
			typeof VisualsManager.getCharacterOverlay !== 'function')
			return;
		var overlay = VisualsManager.getCharacterOverlay(character, true);
		if (!overlay || typeof overlay.addChild !== 'function')
			return;
		var text = new createjs.Text('+' + gain.points + ' ' + SKILL_NAME[gain.skill], 'bold 9pt "Segoe UI", Arial', '#2d6a1f');
		text.textBaseline = 'top';
		var container = new createjs.Container();
		container.x = 20;
		container.y = -30;
		container.alpha = 0;
		var bg = new createjs.Shape();
		bg.graphics.beginFill('rgba(255,255,255,0.85)').beginStroke('#7aa86a').setStrokeStyle(1)
			.drawRoundRect(-4, -3, text.getMeasuredWidth() + 8, text.getMeasuredLineHeight() + 6, 4);
		container.addChild(bg);
		container.addChild(text);
		overlay.addChild(container);
		createjs.Tween.get(container).to({ alpha: 1 }, 150).to({ y: -60 }, 900).to({ alpha: 0 }, 250).call(function () {
			overlay.removeChild(container);
		});
		if (typeof Sound !== 'undefined' && typeof Sound.playSoundOnce === 'function')
			Sound.playSoundOnce('trainingProgress', 0.08);
	};

	var applyGain = function (character, gain) {
		if (typeof character.applyTrainingUpdate === 'function')
			character.applyTrainingUpdate({ p: gain.points, t: gain.skill });
		else
			character[SKILL_FIELD[gain.skill]] += gain.points / FACTOR_PER_POINT;
		showGainText(character, gain);
		LivingIndustry.log('[Living Industry] learning: ' + character.name + ' +' + gain.points + ' ' + SKILL_NAME[gain.skill] +
			' (now ' + Math.floor(character[SKILL_FIELD[gain.skill]] * FACTOR_PER_POINT) + ')');
	};

	// Wraps Character.prototype.spawnPoints(amount, type, delay) - the base game's "produce a
	// point bubble" call, which is the moment a staff member is demonstrably doing work of a
	// given kind. Vanilla behaviour runs untouched first; our roll never throws into it.
	var patched = function (amount, type) {
		var result = original.apply(this, arguments);
		try {
			if (LivingIndustry.Settings.get('learnByDoing') && GameManager.company && !GameManager.loadInProgress) {
				var gain = LivingIndustry.Learning.rollGain(this, amount, type, [rng(), rng(), rng()]);
				if (gain)
					applyGain(this, gain);
			}
		} catch (e) {
			LivingIndustry.error('Living Industry learning roll failed - vanilla points kept', e);
		}
		return result;
	};

	LivingIndustry.Learning.init = function () {
		if (typeof Character === 'undefined' || !Character.prototype || typeof Character.prototype.spawnPoints !== 'function') {
			LivingIndustry.error('Living Industry learning: Character.prototype.spawnPoints not found - learn-by-doing disabled.');
			return;
		}
		if (Character.prototype.spawnPoints.__livingIndustryPatched)
			return;
		original = Character.prototype.spawnPoints;
		patched.__livingIndustryPatched = true;
		Character.prototype.spawnPoints = patched;
	};
})();
