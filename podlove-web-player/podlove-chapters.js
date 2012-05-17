var PODLOVE = PODLOVE || {};
PODLOVE.playercount = 0;

PODLOVE.chapters = function (playerId) {
    if (!PODLOVE.playercount) {
        //console.log('startpos:' + PODLOVE.chapters.startpos);
        if (PODLOVE.chapters.startpos = PODLOVE.chapters.parseTimecode((window.location.href.match(/#(\d\d:\d\d:\d\d\.\d\d\d)/) || [])[1])) {
            $('#' + playerId).attr('preload', 'auto');
            //console.log ('preload of player ' + $('#' + playerId).attr('preload'));
        }
    }

    MediaElement(playerId, {
        success: function (player) {
            PODLOVE.playercount++;
            PODLOVE.chapters.addBehaviour(playerId, player);
        }
    });
};

PODLOVE.chapters.addBehaviour = function (playerId, player) {
    var list = jQuery('table[rel=' + playerId + ']')
        .show()
        .on('click', 'a', function () {
            var time = jQuery(this).find('span').data('start');
            player.setCurrentTime(time);
            player.play();
            history.pushState(null, null, '#' + PODLOVE.chapters.generateTimecode(time) + '-' + PODLOVE.chapters.generateTimecode(jQuery(this).find('span').data('end')));
            return false;
        })
     , skip_to_linked_time = function (e) {

            if (PODLOVE.chapters.startpos && PODLOVE.playercount < 2) {
	        player.setCurrentTime(PODLOVE.chapters.startpos);
                PODLOVE.chapters.startpos = null;
            }
        };

    if (PODLOVE.chapters.startpos && PODLOVE.playercount < 2) {
        player.addEventListener('play', skip_to_linked_time , false);
        player.addEventListener('timeupdate', skip_to_linked_time , false);
    }

    player.addEventListener('timeupdate', function (e) {
        //console.log('timeupdate ' + window.location.href + ' - ' + PODLOVE.chapters.startpos + ' --- ' + player.buffered.end(0));
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
                if (PODLOVE.playercount < 2 && !PODLOVE.chapters.startpos) {
                    if (!(tmpTimecode = window.location.href.match(/#(\d\d:\d\d:\d\d\.\d\d\d)-(\d\d:\d\d:\d\d\.\d\d\d)/)) || (tmpTimecode[2] && PODLOVE.chapters.parseTimecode(tmpTimecode[2]) <= startTime)) {
                        history.pushState(null, null, '#' + PODLOVE.chapters.generateTimecode(startTime));
                    }
                }
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

