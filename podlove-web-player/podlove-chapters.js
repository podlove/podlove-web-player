var PODLOVE = PODLOVE || {};
PODLOVE.playercount = 0;

PODLOVE.chapters = function (playerId) {
    // look for deeplinks, if no other player has been loaded
    if (!PODLOVE.playercount) {
        //console.log('startpos:' + PODLOVE.ref_deep_links);
        PODLOVE.ref_deep_links = window.location.href.match(/(\d\d:\d\d:\d\d\.\d\d\d)/) || [];
        PODLOVE.ref_deep_links.splice(1,1);
        $(PODLOVE.ref_deep_links).each(function (i, e) {
            PODLOVE.ref_deep_links[i] = PODLOVE.chapters.parseTimecode(e);
        });

        if (PODLOVE.ref_deep_links.length) {
            $('#' + playerId).attr('preload', 'auto');
            //console.log ('preload of player ' + $('#' + playerId).attr('preload'));
        }
    }

    MediaElement(playerId, {
        success: function (player) {
            PODLOVE.playercount++;
            PODLOVE.chapters.addBehaviour_chapter(playerId, player);
            PODLOVE.chapters.addBehaviour_deep_linking(playerId, player);
        }
    });
};

PODLOVE.chapters.addBehaviour_deep_linking = function (playerId, player) {
    var skip_to_linked_time = function (e) {
            if (PODLOVE.playercount === 1) {
                if (PODLOVE.ref_deep_links.length  === 1) {
                    player.setCurrentTime(PODLOVE.ref_deep_links[0]);
                    PODLOVE.ref_deep_links = null;
                } else {
                    if (PODLOVE.ref_deep_links[0]) {
                        player.setCurrentTime(PODLOVE.ref_deep_links[0]);
                        PODLOVE.ref_deep_links[0] = null;
                    } else if (PODLOVE.ref_deep_links[1]) {
                        player.pause();
                        PODLOVE.ref_deep_links[0] = null;
                    }
                }
                
            }
        }
      , address_current_time = function (e) {
            if (PODLOVE.playercount === 1) {
                history.pushState(null, null, '#' + PODLOVE.chapters.generateTimecode(player.currentTime));
            }
      }

    if (PODLOVE.playercount === 1) {
        if (PODLOVE.ref_deep_links.length) {
            player.addEventListener('play', skip_to_linked_time , false);
            player.addEventListener('timeupdate', skip_to_linked_time , false);
        } else {
            player.addEventListener('pause', address_current_time, false);
            player.addEventListener('seeked', address_current_time, false);
        }
        jQuery('table[rel=' + playerId + ']').on('click', 'a', function () {
            history.pushState(null, null, '#' + PODLOVE.chapters.generateTimecode(time) + '-' + PODLOVE.chapters.generateTimecode(jQuery(this).find('span').data('end')));
        });
    }


}

PODLOVE.chapters.addBehaviour_chapter = function (playerId, player) {
    var list = jQuery('table[rel=' + playerId + ']')
        .show()
        .on('click', 'a', function () {
            var time = jQuery(this).find('span').data('start');
            player.setCurrentTime(time);
            player.play();
            return false;
        })


    player.addEventListener('timeupdate', function (e) {
        //console.log('timeupdate ' + window.location.href + ' - ' + PODLOVE.ref_deep_links + ' --- ' + player.buffered.end(0));
        // update the chapter list when the data is loaded
        list.find('span').each(function (i) {
            var span = jQuery(this),
                row = span.closest('tr'),
                startTime = span.data('start'),
                endTime = span.data('end'),
                isEnabled = span.data('enabled') === '1',
                isBuffered = player.buffered.end(0) > startTime,
                isActive =  player.currentTime > startTime - 0.3 &&
                            player.currentTime <= endTime,
                tmpTimecode;

            if (isActive && !row.hasClass('active')) {
                span.closest('table')
                    .find('tr.active')
                    .removeClass('active');
                row.addClass('active');
                // we don't update the address if a selectedchapter is selected and we have not yet played through it
/*
                if (PODLOVE.playercount < 2 && !PODLOVE.ref_deep_links) {
                    if (!(tmpTimecode = window.location.href.match(/#(\d\d:\d\d:\d\d\.\d\d\d)-(\d\d:\d\d:\d\d\.\d\d\d)/)) || (tmpTimecode[2] && PODLOVE.chapters.parseTimecode(tmpTimecode[2]) <= startTime)) {
                        history.pushState(null, null, '#' + PODLOVE.chapters.generateTimecode(startTime));
                    }
                }
*/
            }
            if (!isEnabled && isBuffered) {
                span.data('enabled', '1').wrap('<a href="#"></a>');
            }
        });
    }, false);
};

/**
 * returns seconds in deep-linking time format
 * @param sec number 
 * @return string
 **/
PODLOVE.chapters.generateTimecode = function (sec) {
    var prim = function (v, mil) {
                   v = (v || 0) + '';
                   return (mil && v.length <3 ? '0' : '') + (v.length < 2 ? '0' : '') + v;
               }
      , tcode;
    tcode = prim(Math.floor(sec/60/60)) + ':' + prim(Math.floor(sec/60)%60) + ':' + prim(Math.floor(sec%60)%60) + '.' + prim(((sec-Math.floor(sec)) + '').substring(2,5) || '000', true);
    //console.log('generateTimecode (' + sec + ') ==> ' + tcode);
    return tcode;
}

/**
 * parses time code into seconds
 * @param string timecode
 * @return number 
 **/
PODLOVE.chapters.parseTimecode = function (tcode) {
    var parts;
    if ((parts = (tcode || '').match(/(\d\d):(\d\d):(\d\d).(\d\d\d)/)) && parts.length === 5) {
        parts = parseInt (parts[1]) * 60 * 60 + 
                parseInt (parts[2]) * 60 + 
                parseInt (parts[3]) +
                parseFloat('0.' + parts[4]);
       //console.log ('parseTimecode (' + tcode + ') ==> ' + parts);
       return parts;
    }
}

