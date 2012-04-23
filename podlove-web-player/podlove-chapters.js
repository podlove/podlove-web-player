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
            return false;
        });

    player.addEventListener('timeupdate', function (e) {
        list.find('span').each(function (i) {
            var span = jQuery(this),
                row = span.closest('tr'),
                startTime = span.data('start'),
                endTime = span.data('end'),
                isEnabled = span.data('enabled') === '1',
                isBuffered = player.buffered.end(0) > startTime,
                isActive = player.currentTime > startTime - 0.3 &&
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
    }, false);
};