;
(function ($) {
    $.fn.podlovewebplayer = function (options) {
        var players = {};
        function handleMessage (event) {
            // discard hash - it changes along with the time media is played
            var src = event.source.location.href;
            var hash = event.source.location.hash;
            var id = src.substr(0, src.length - hash.length);
            var player = players[id];

            console.debug(event.data.action, event.data.arg);

            if (player == null) {
                console.warn('no player found with src=', id);
                return;
            }

            console.debug('received', event.data.action, 'from', id, 'with', event.data.arg);

            if (event.data.action == 'ready') {
                player.state = 0;
            }

            if (event.data.action == 'play') {
                if (player.state === 1) return;
                player.state = 1;
                pausePlayersExceptOne(id);
            }

            if (event.data.action == 'pause') {
                if (player.state === 0) return;
                player.state = 0;
            }

            if (event.data.action == 'resize') {
                player.frame.height(event.data.arg);
            }
        }

        function pausePlayersExceptOne(currentPlayerId) {
            var playerData, playerId, message = {action: 'pause'};
            for (playerId in players) {
                if (playerId === currentPlayerId || !players.hasOwnProperty(playerId))
                    continue;
                console.debug('pausing', playerId);
                playerData = players[playerId];
                playerData.frame.get(0).contentWindow.postMessage(message, playerId);
            }
        }
        
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

            //$(window).on('message', handleMessage);
            window.addEventListener("message", handleMessage, false);

            // register player frame
            console.debug('registered player with src=', frame.src);
            players[frame.src] = {
                frame: $frame,
                state: -1
            };

            return $frame;
        });
    };
})(jQuery);

