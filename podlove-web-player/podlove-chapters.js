var PODLOVE = PODLOVE || {};

(function ($) {
    'use strict';

    var deepLink;

    // Count Players on site
    var playerCount;

    // Timecode as described in http://podlove.org/deep-link/
    var timecodeRegExp = /(\d\d:)?\d\d:\d\d(\.\d\d\d)?/;

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
     * returns seconds in deep-linking time format
     * @param seconds number
     * @return string
     **/
    function generateTimecode(seconds) {
        var timecode;

        // prevent negative values from player
        if (seconds <= 0) {
            return '00:00';
        }

        // hours
        timecode += zeroFill(Math.floor(seconds / 60 / 60), 2);
        // minutes
        timecode += ':' + zeroFill(Math.floor(seconds / 60) % 60, 2);
        // seconds
        timecode += ':' + zeroFill(Math.floor(seconds % 60) % 60, 2);
        // milliseconds
        timecode += '.' + zeroFill(Math.floor(seconds % 1 * 1000), 3);

        return timecode;
    }

    /**
     * parses time code into seconds
     * @param string timecode
     * @return number
     **/
    function parseTimecode(timecode) {
        var parts, seconds = 0;

        if (timecode) {
            parts = timecode.match(timecodeRegExp);
            if (parts.length === 5) {
                // hours
                seconds += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
                // minutes
                seconds += parts[2] * 60;
                // seconds
                seconds += parts[3];
                // milliseconds
                seconds += parts[4] ? parseFloat(parts[4]) : 0;

                return Math.max(seconds, 0);
            }
        }
    }

    PODLOVE.web_player = function (playerId) {
        playerCount = $('.mediaelementjs_player_container').length;
        // parse deeplink
        deepLink = parseTimecode(window.location.href);

        if (deepLink && playerCount === 1) {
            $('#' + playerId).attr({preload: 'auto', autoplay: 'autoplay'});
        }

        window.MediaElementPlayer('#' + playerId, {
            success: function (player) {
                PODLOVE.web_player.addChapters(playerId, player);
                PODLOVE.web_player.addDeepLinking(playerId, player);
                if (deepLink && playerCount === 1) {
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
     * add chapter behavior
     * @param player object
     */
    PODLOVE.web_player.addChapters = function (player) {
        var list, playerId = player.attr('id');

        $('table[rel=' + playerId + ']')
            .show()
            .delegate('a', 'click', function () {
                var time = $(this).find('span').data('start');
                player.setCurrentTime(time);
                if (player.pluginType !== 'flash') {
                    player.play();
                }
                return false;
            });

        player.bind('timeupdate', function () {
            try {
                // update the chapter list when the data is loaded
                list.find('span').each(function (i) {
                    var span       = $(this),
                        row        = span.closest('tr'),
                        startTime  = span.data('start'),
                        endTime    = span.data('end'),
                        isEnabled  = span.data('enabled') === '1',
                        isBuffered = player.buffered.end(0) > startTime,
                        isActive   = player.currentTime > startTime - 0.3 &&
                                     player.currentTime <= endTime;

                    if (isActive && !row.hasClass('active')) {
                        span.closest('table')
                            .find('tr.active')
                            .removeClass('active');
                        row.addClass('active');
                    }
                    if (!isEnabled && isBuffered) {
                        span.data('enabled', '1').wrap('<a href="#"></a>');
                    }
                });
            } catch (e) {
                window.console.log('[podlove-web-player] timeupdate::: ' + e);
            }
        }, false);
    };


    /**
     * deeplinking: skip to referenced time position & write current time into address
     * @param player object
     */
    PODLOVE.web_player.addDeepLinking = function (player) {
        var playerId = player.attr('id');

        function skipToLinkedTime() {
            if (playerCount === 1 && deepLink) {
                try {
                    player.setCurrentTime(deepLink);
                    deepLink = false;
                } catch (e) {
                    window.console.log('[podlove-web-player] skipToLinkedTime::: ' + e);
                }

            }
        }
        function addressCurrentTime() {
            var timecode;
            if (playerCount === 1 && !deepLink) {
                timecode = generateTimecode(player.currentTime);
                window.location.hash = '#' + timecode;
            }
        }

        if (playerCount === 1) {
            player.bind({
                play: skipToLinkedTime,
                timeupdate: skipToLinkedTime,
                pause: addressCurrentTime,
                seeked: addressCurrentTime
            });

            $('table[rel=' + playerId + ']').delegate('a', 'click', function () {
                var start;
                if (playerCount === 1) {
                    start = $(this).find('span').data('start');
                    deepLink = start;
                    window.location.hash = '#' + generateTimecode(start);
                }
            });
        }
    };
}(jQuery));