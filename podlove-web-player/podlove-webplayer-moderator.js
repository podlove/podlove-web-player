;
(function ($) {
    var players = {};

    $.fn.podlovewebplayer = function (options) {
        return this.replaceWith(function () {
            var $element = $(this);
            var $frame = $('<iframe>', {
                src: $element.data('podlove-web-player-source'),
                height: $element.data('podlove-web-player-height') || 300,
                width: $element.data('podlove-web-player-width') || 800,
                className: 'podlove-webplayer-frame',
                css: {
                    border: "none",
                    overflow: "hidden"
                }
            });
            var frame = $frame.get(0);

            $(window).on('message', handleMessage);

            // register player frame
            console.debug('registered player with src=', frame.src);
            players[frame.src] = {
                frame: $frame,
                state: -1
            };

            return frame;
        });
    };

    function handleMessage (event) {
        var orig = event.originalEvent;

        // discard hash - it changes along with the time media is played
        var src = orig.source.location.href;
        var hash = orig.source.location.hash;
        var id = src.substr(0, src.length - hash.length);
        var player = players[id];

        console.debug(orig.data.action, orig.data.arg);

        if (player == null) {
            console.warn('no player found with src=', id);
            return;
        }

        console.debug('received action:', orig.data.action, 'from', id, 'with:', orig.data.arg);

        if (orig.data.action == 'ready') {
            player.state = 0;
        }

        if (orig.data.action == 'play') {
            if (player.state === 1) return;
            player.state = 1;
            pausePlayersExceptOne(id);
        }

        if (orig.data.action == 'pause') {
            if (player.state === 0) return;
            player.state = 0;
        }

        if (orig.data.action == 'resize') {
            player.frame.height(orig.data.arg);
        }

    }

    function pausePlayersExceptOne(currentPlayerId) {
        var playerData, playerId, message = {action: 'pause'};
        for (playerId in players) {
            console.debug('probe', playerId);
            if (playerId === currentPlayerId || !players.hasOwnProperty(playerId))
                return;
            console.debug('pausing', playerId);
            playerData = players[playerId];
            playerData.frame.get(0).contentWindow.postMessage(message, playerId);
        }
    }
})(jQuery);

