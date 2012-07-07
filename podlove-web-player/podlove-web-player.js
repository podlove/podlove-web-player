var PODLOVE = PODLOVE || {};

(function ($) {
	'use strict';

	var deepLink = false,
		// Count Players on site
		playerCount = 0,
		// Timecode as described in http://podlove.org/deep-link/
		// and http://www.w3.org/TR/media-frags/#fragment-dimensions
		timecodeRegExp = /(\d\d:)?(\d\d):(\d\d)(\.\d\d\d)?(,(\d\d:)?(\d\d):(\d\d)(\.\d\d\d)?)?/,
		// check if to use html5 pushState
		usePushState = false;

	/**
	 * return number as string lefthand filled with zeros
	 * @param number number
	 * @param width number
	 * @return string
	 **/
	function zeroFill(number, width) {
		width -= number.toString().length;
		return width > 0 ? new Array(width + 1).join('0') + number : number + '';
	}

	/**
	 * accepts array with start and end time in seconds
	 * returns timecode in deep-linking format
	 * @param times array
	 * @return string
	 **/
	function generateTimecode(times) {
		function generatePart(seconds) {
			var part, hours, milliseconds;
			// prevent negative values from player
			if (!seconds || seconds <= 0) {
				return '00:00';
			}

			// required (minutes : seconds)
			part = zeroFill(Math.floor(seconds / 60) % 60, 2) + ':' +
					zeroFill(Math.floor(seconds % 60) % 60, 2);

			hours = zeroFill(Math.floor(seconds / 60 / 60), 2);
			hours = hours === '00' ? '' : hours + ':';
			milliseconds = zeroFill(Math.floor(seconds % 1 * 1000), 3);
			milliseconds = milliseconds === '000' ? '' : '.' + milliseconds;

			return hours + part + milliseconds;
		}

		if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
			return generatePart(times[0]) + ',' + generatePart(times[1]);
		}

		return generatePart(times[0]);
	}

	/**
	 * parses time code into seconds
	 * @param string timecode
	 * @return number
	 **/
	function parseTimecode(timecode) {
		var parts, startTime = 0, endTime = 0;

		if (timecode) {
			parts = timecode.match(timecodeRegExp);

			if (parts && parts.length === 10) {
				// hours
				startTime += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
				// minutes
				startTime += parseInt(parts[2], 10) * 60;
				// seconds
				startTime += parseInt(parts[3], 10);
				// milliseconds
				startTime += parts[4] ? parseFloat(parts[4]) : 0;
				// no negative time
				startTime = Math.max(startTime, 0);

				// if there only a startTime but no endTime
				if (parts[5] === undefined) {
					return [startTime, false];
				}

				// hours
				endTime += parts[6] ? parseInt(parts[6], 10) * 60 * 60 : 0;
				// minutes
				endTime += parseInt(parts[7], 10) * 60;
				// seconds
				endTime += parseInt(parts[8], 10);
				// milliseconds
				endTime += parts[9] ? parseFloat(parts[9]) : 0;
				// no negative time
				endTime = Math.max(endTime, 0);

				return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
			}
		}
		return false;
	}

	function setFragmentURL(fragment) {
		var url;

		if (usePushState) {
			url = window.location.href.split('#')[0] + '#' + fragment;
			window.history.pushState(null, null, url);
		} else {
			window.location.hash = fragment;
		}
	}

	// update the chapter list when the data is loaded
	function updateChapterMarks(player, marks) {
		marks.each(function () {
			var deepLink,
				span       = $(this),
				startTime  = span.data('start'),
				endTime    = span.data('end'),
				isEnabled  = span.data('enabled') === '1',
				isBuffered = player.buffered.end(0) > startTime,
				isActive   = player.currentTime > startTime - 0.3 &&
						player.currentTime <= endTime;

			if (isActive) {
				span.closest('tr')
					.addClass('active')
					.siblings().removeClass('active');
			}
			if (!isEnabled && isBuffered) {
				deepLink = '#t=' + generateTimecode([startTime, endTime]);
				span
					.data('enabled', '1')
					.wrap('<a href="' + deepLink + '"></a>');
			}
		});
	}

	function skipToLinkedTime(e) {
		if (deepLink !== false && playerCount === 1) {
			e.data.player.setCurrentTime(deepLink[0]);
			deepLink = false;
		}
	}

	function addressCurrentTime(e) {
		var fragment;
		if (deepLink === false && playerCount === 1) {
			fragment = 't=' + generateTimecode([e.data.player.currentTime]);
			setFragmentURL(fragment);
		}
	}

	PODLOVE.web_player = function (playerId) {
		playerCount = $('.mediaelementjs_player_container').length;
		// parse deeplink
		deepLink = parseTimecode(window.location.href);

		if (deepLink !== false && playerCount === 1) {
			$('#' + playerId)
				.attr({preload: 'auto', autoplay: 'autoplay'});
		}

		window.MediaElementPlayer('#' + playerId, {
			success: function (player) {
				PODLOVE.web_player.addBehavior(player);
				if (deepLink !== false && playerCount === 1) {
					$('html, body')
						.delay(150)
						.animate({
							scrollTop: $('.mediaelementjs_player_container:first').offset().top - 25
						});
				}
			}
		});
	};

	/**
	 * add chapter behavior and deeplinking: skip to referenced
	 * time position & write current time into address
	 * @param player object
	 */
	PODLOVE.web_player.addBehavior = function (player) {
		var jqPlayer = $(player),
			playerId = jqPlayer.attr('id'),
			list = $('table[rel=' + playerId + ']'),
			marks = list.find('span');

		list
			.show()
			.delegate('a', 'click', function (e) {
				e.preventDefault();

				var startTime = $(this).find('span').data('start'),
					endTime = $(this).find('span').data('end');

				// Basic Chapter Mark function (without deeplinking)
				player.setCurrentTime(startTime);
				if (player.pluginType !== 'flash') {
					player.play();
				}

				// If there is only one player also set deepLink
				if (playerCount === 1) {
					setFragmentURL('t=' + generateTimecode([startTime, endTime]));
				}
			});

		// wait for the player or you'll get DOM EXCEPTIONS
		jqPlayer.bind('canplay', function () {

			// add Deeplink Behavior if there is only one player on the site
			if (playerCount === 1) {
				jqPlayer.bind({
					play: skipToLinkedTime,
					timeupdate: skipToLinkedTime,
					pause: addressCurrentTime
					// disabled 'cause it overrides chapter clicks
					// seeked: addressCurrentTime
				}, {player: player});

				// handle browser history navigation
				$(window).bind('hashchange onpopstate', function () {
					// parse deeplink
					deepLink = parseTimecode(window.location.href);
				});
			}

			// always update Chaptermarks though
			jqPlayer.bind('timeupdate', function () {
				updateChapterMarks(player, marks);
			});

		});
	};
}(jQuery));