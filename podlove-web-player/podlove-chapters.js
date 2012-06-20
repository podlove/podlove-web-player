var PODLOVE = PODLOVE || {};

jQuery(document).ready(function($) {
    PODLOVE.chapters = function (playerId) {
        // parse deeplinks
        PODLOVE.playercount    = $('.mediaelementjs_player_container').length
        PODLOVE.ref_deep_links = [];
        PODLOVE.ref_deep_links = window.location.href.match(/((\d\d:)?\d\d:\d\d(\.\d\d\d)?)/) || [];
        PODLOVE.ref_deep_links.splice(1,1);
        $(PODLOVE.ref_deep_links).each(function (i, e) {
            PODLOVE.ref_deep_links[i] = PODLOVE.chapters.parseTimecode(e);
        });

        if (PODLOVE.ref_deep_links.length && PODLOVE.playercount === 1) {
            $('#' + playerId).attr('preload', 'auto');
            $('#' + playerId).attr('autoplay', 'autoplay');
        }

        MediaElement(playerId, {
            success: function (player) {
                PODLOVE.chapters.addBehaviour_chapter(playerId, player);
                PODLOVE.chapters.addBehaviour_deep_linking(playerId, player);
                if (PODLOVE.ref_deep_links.length && PODLOVE.playercount === 1) {
                    window.setTimeout(
                        function () {
                            $('html, body').animate({scrollTop: $('.mediaelementjs_player_container:first').offset().top - 25});
                        }, 150);
                }
            }
        });
    };

    PODLOVE.chapters.addBehaviour_chapter = function (playerId, player) {
        var list = jQuery('table[rel=' + playerId + ']')
            .show()
            .on('click', 'a', function () {
                var time = jQuery(this).find('span').data('start');
                player.setCurrentTime(time);
                player.play();
                return false;
            });

        PODLOVE.playerel = player;


        player.addEventListener('timeupdate', function (e) {
            try {
                // update the chapter list when the data is loaded
                list.find('span').each(function (i) {
                    var span       = jQuery(this),
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
                console.log('[podlove-web-player] timeupdate::: ' + e);
            }
        }, false);
    };


    /** 
     * deeplinking: skipt to referenced time position & write current times into adress
     * @param playerId string
     * @param player object
     */
    PODLOVE.chapters.addBehaviour_deep_linking = function (playerId, player) {
        var skip_to_linked_time = function (e) {
                if (PODLOVE.playercount === 1 && PODLOVE.ref_deep_links.length) {
                    try {
                        player.setCurrentTime(PODLOVE.ref_deep_links[0]);
                        PODLOVE.ref_deep_links = [];
                    } catch (e) {
                        console.log('[podlove-web-player] skip_to_linked_time::: ' + e);
                    }
                    
                }
            }
          , address_current_time = function (e) {
                if (PODLOVE.playercount === 1 && !PODLOVE.ref_deep_links.length) {
                    history.pushState(null, null, '#' + PODLOVE.chapters.generateTimecode(player.currentTime));
                }
          };

        if (PODLOVE.playercount === 1) {
            if (PODLOVE.ref_deep_links.length) {
                player.addEventListener('play',       skip_to_linked_time , false);
                player.addEventListener('timeupdate', skip_to_linked_time , false);
            }
            player.addEventListener('pause',  address_current_time, false);
            player.addEventListener('seeked', address_current_time, false);

            jQuery('table[rel=' + playerId + ']').on('click', 'a', function () {
                if (PODLOVE.playercount === 1) {
                    history.pushState(null, null, '#' + PODLOVE.chapters.generateTimecode(jQuery(this).find('span').data('start')));
                }
            });
        }
    };

    /**
     * returns seconds in deep-linking time format
     * @param sec number 
     * @return string
     **/
    PODLOVE.chapters.generateTimecode = function (sec) {
        sec = Math.max(sec, 0); // prevent negative values from player
        var prim = function (v, mil) {
                       v = (v || 0) + '';
                       return (mil && v.length <3 ? '0' : '') + (v.length < 2 ? '0' : '') + v;
                   }
          , tcode;
        tcode = prim(Math.floor(sec/60/60)) + ':' + prim(Math.floor(sec/60)%60) + ':' + prim(Math.floor(sec%60)%60) + '.' + prim(((sec-Math.floor(sec)) + '').substring(2,5) || '000', true);
        return tcode;
    };

    /**
     * parses time code into seconds
     * @param string timecode
     * @return number 
     **/
    PODLOVE.chapters.parseTimecode = function (tcode) {
        var parts;
        if ((parts = (tcode || '').match(/((\d\d:)?(\d\d):(\d\d)(\.\d\d\d)?)/)) && parts.length === 6) {
            parts = (parts[2] ? parseInt (parts[2].substring(0,2)) * 60 * 60 : 0) + 
                    parseInt (parts[3]) * 60 + 
                    parseInt (parts[4]) +
                    (parts[5] ? parseFloat('0' + parts[5]) : 0);
            parts = Math.max(parts, 0);
            return parts;
        }
    };
});
