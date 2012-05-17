var PODLOVE = PODLOVE || {};

PODLOVE.chapters = function (playerId) {
    MediaElement(playerId, {
        success: function (player) {
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
      , startpos;

    player.addEventListener('canplay', function (e) {
        console.log('canplay ' + window.location.href + ' - ' + startpos + ' --- ' + player.buffered.end(0));
        var prm;
        if (prm = window.location.href.match(/#(\d\d:\d\d:\d\d\.\d\d\d)/)) {
            startpos = PODLOVE.chapters.parseTimecode(prm[1]);
            if (startpos > player.buffered.end(0)) {
                player.pause();
                // check every half second if the requestet time mark is in the cache
                window.setTimeout( function () { 
                    console.log('timeout-fnc ' + startpos + ' --- ' + player.buffered.end(0));
                    if (startpos <= player.buffered.end(0)) {
                        startpos = null;
                        player.play();
                        clearTimeout(this);
                    }
                }, 500);
                console.log('pause');
            } else {
                console.log('play canplay');
                player.setCurrentTime(startpos);
                startpos = null;
            }
        }
    }, false);

    player.addEventListener('timeupdate', function (e) {
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
                if (!startpos) {
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
               };
    return prim(Math.floor(sec/60/60)) + ':' + prim(Math.floor(sec/60)) + ':' + prim(Math.floor(sec%60)) + '.' + prim(((sec-Math.floor(sec)) + '').substring(2,5) || '000', true);
}

/**
 * parses time code into seconds
 * @param string timecode
 * @return number 
 **/
PODLOVE.chapters.parseTimecode = function (tcode) {
    var parts;
    if ((parts = (tcode || '').match(/(\d\d):(\d\d):(\d\d).(\d\d\d)/)) && parts.length === 5) {
        return parseInt (parts[1]) * 60 * 60 + 
               parseInt (parts[2]) * 60 + 
               parseInt (parts[3]) +
               parseFloat('0.' + parts[4]);
    }
}

