var PODLOVE = PODLOVE || {};

(function ($) {
    'use strict';

    var deepLink = false,
        // Count Players on site
        playerCount = 0,
        // Timecode as described in http://podlove.org/deep-link/
        timecodeRegExp = /(\d\d:)?(\d\d):(\d\d)(\.\d\d\d)?/;

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
        var timecode, hours, milliseconds;

        // prevent negative values from player
        if (seconds <= 0) {
            return '00:00';
        }

        // required (minutes : seconds)
        timecode = zeroFill(Math.floor(seconds / 60) % 60, 2) + ':' +
                zeroFill(Math.floor(seconds % 60) % 60, 2);

        hours = zeroFill(Math.floor(seconds / 60 / 60), 2);
        hours = hours === '00' ? '' : hours + ':';
        milliseconds = zeroFill(Math.floor(seconds % 1 * 1000), 3);
        milliseconds = milliseconds === '000' ? '' : '.' + milliseconds;

        return hours + timecode + milliseconds;
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
            if (parts && parts.length === 5) {
                // hours
                seconds += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
                // minutes
                seconds += parseInt(parts[2], 10) * 60;
                // seconds
                seconds += parseInt(parts[3], 10);
                // milliseconds
                seconds += parts[4] ? parseFloat(parts[4]) : 0;

                return Math.max(seconds, 0);
            }
        }
        return false;
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

                var time = $(this).find('span').data('start');
                player.setCurrentTime(time);
                if (player.pluginType !== 'flash') {
                    player.play();
                }
                if (playerCount === 1) {
                    deepLink = time;
                }
            });

        function skipToLinkedTime() {
            if (deepLink !== false && playerCount === 1) {
                player.setCurrentTime(deepLink);
                deepLink = false;
            }
        }
        function addressCurrentTime() {
            var timecode;
            if (deepLink === false && playerCount === 1) {
                timecode = generateTimecode(player.currentTime);
                window.location.hash = '#' + timecode;
            }
        }

        // wait for the player or you'll get DOM EXCEPTIONS
        jqPlayer.bind('canplay', function () {
            if (playerCount === 1) {
                jqPlayer.bind({
                    play: skipToLinkedTime,
                    timeupdate: skipToLinkedTime,
                    pause: addressCurrentTime,
                    seeked: addressCurrentTime
                });
            }
            jqPlayer.bind('timeupdate', function () {
                // update the chapter list when the data is loaded
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
                        deepLink = '#' + generateTimecode(startTime) +
                                (endTime && endTime < 9999999 ? '-' +
                                generateTimecode(endTime) : '');
                        span
                            .data('enabled', '1')
                            .wrap('<a href="' + deepLink + '"></a>');
                    }
                });
            });
        });
    };
}(jQuery));