(function () {
	LivingIndustry.InstantReviews = {};

	var original = null;

	// Animation-free version of the base game's review reveal (UI.showReviewWindow in codeNw.js):
	// same #reviewWindow modal, same #reviewItemTemplate markup and final layout values, without
	// the multi-second typewriter/star tweens. The base game reads the reviewed game the same way
	// (company.gameLog.last()), since the window is opened from the "{Reviews}" notification queued
	// at release.
	var renderInstant = function () {
		var modal = $('.simplemodal-data');
		var container = modal.find('#reviewAnimationContainer');
		var game = GameManager.company.gameLog.last();
		var rtl = typeof Localization !== 'undefined' && typeof Localization.isRTLLanguage === 'function' && Localization.isRTLLanguage();
		var template = $('#reviewItemTemplate');

		modal.find('.windowTitle').text('Reviews for {0}'.localize().format(game.title));
		var reviews = Array.isArray(game.reviews) ? game.reviews : [];
		for (var i = 0; i < reviews.length; i++) {
			var review = reviews[i];
			var score = Math.floor(Number(review.score) || 0).clamp(0, 10);
			var item = template.clone().removeAttr('id');

			if (rtl) {
				item.find('.award').attr('src', 'images/misc/icon_starlarge_rtl.png');
				item.find('.star.full').attr('src', 'images/misc/icon_starfull_rtl.png');
				item.find('.star.half').attr('src', 'images/misc/icon_starhalf_rtl.png');
			}
			item.find('.score').text(score).css('opacity', 1);
			item.find('.starsEmpty').show();
			var fullCount = Math.floor(score / 2);
			item.find('.star').hide().css('opacity', 1);
			item.find('.star.full').slice(0, fullCount).show();
			if (score % 2 !== 0)
				item.find('.star.half').eq(fullCount).show();
			item.find('.award').css('opacity', score >= 10 ? 1 : 0);
			if (score >= 8) {
				item.find('.score').css('font-weight', 500);
				item.find('.text').css('font-weight', 600);
			}

			var text = item.find('.text').text(review.message || '');
			var fontSize = 19;
			if (typeof UI.getMeasuredHeight === 'function') {
				var height = 40;
				do {
					fontSize -= 1;
					height = UI.getMeasuredHeight(review.message || '', fontSize, 500);
				} while (height > 70 && fontSize > 9);
				if (height > 44) {
					text.css('transform', 'translate(0px,20px)');
					item.find('.reviewer').css('transform', 'translate(0px,10px)');
				}
			}
			text.css({ 'font-size': fontSize + 'pt', opacity: 1 });
			text.css(rtl ? 'margin-right' : 'margin-left', 40);

			var reviewer = item.find('.reviewer').text('... {0}'.format(review.reviewerName || '')).css('opacity', 1);
			reviewer.css(rtl ? 'margin-left' : 'margin-right', -30);

			item.css(rtl ? { right: 60, top: 20 + 120 * i } : { left: 60, top: 20 + 120 * i });
			container.append(item);
		}
		modal.find('.okButton').show();
	};

	var showInstant = function (notification, callback) {
		var win = $('#reviewWindow');
		win.find('#reviewAnimationContainer').empty();
		win.find('.okButton').hide().clickExclOnce(function () {
			UI.closeModal(callback);
		});
		UI.showModalContent('#reviewWindow', {
			disableCheckForNotifications: true,
			onOpen: function () {
				try {
					renderInstant();
				} catch (e) {
					// Never leave the player stuck in an empty modal.
					LivingIndustry.error('Living Industry instant reviews: render failed', e);
					$('.simplemodal-data').find('.okButton').show();
				}
			},
			onClose: function () {
				GameManager.company.activeNotifications.remove(notification);
			}
		});
	};

	// Decides per call so the setting can be flipped without restarting the game.
	var dispatch = function (notification, callback) {
		if (LivingIndustry.Settings.get('instantReviews'))
			return showInstant(notification, callback);
		return original.apply(this, arguments);
	};

	LivingIndustry.InstantReviews.init = function () {
		if (typeof UI === 'undefined' || typeof UI.showReviewWindow !== 'function' || typeof $ === 'undefined') {
			LivingIndustry.error('Living Industry instant reviews: UI.showReviewWindow not found - feature disabled.');
			return;
		}
		if (UI.showReviewWindow.__livingIndustryPatched)
			return;
		original = UI.showReviewWindow;
		dispatch.__livingIndustryPatched = true;
		UI.showReviewWindow = dispatch;
	};
})();
