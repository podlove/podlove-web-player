;
(function ($) {
    var IFRAME_HEIGHT_DEFAULT = 300,
        IFRAME_HEIGHT_MIN = 100,
        IFRAME_HEIGHT_MAX = 3000,
        IFRAME_WIDTH_DEFAULT = 800,
        IFRAME_WIDTH_MIN = 400,
        IFRAME_WIDTH_MAX = 2000,
        players = {};

    /**
     * decide what to do with a received message
     * @param {jQuery.Event} event
     */
    function handleMessage (event) {
        // discard hash - it changes along with the time media is played
        var originalEvent = event.originalEvent,
            data = originalEvent.data,
            action = data.action,
            argumentObject = data.arg,
            eventLocation = originalEvent.source.location,
            href = eventLocation.href,
            hash = eventLocation.hash,
            id = href.substr(0, href.length - hash.length),
            player = players[id];

        //console.debug('received message', action, argumentObject);

        if (player == null) {
            //console.debug('no player found with src=', id);
            return;
        }

        if (action == null || argumentObject == null) {
            //console.debug('no action or data was given');
            return;
        }

        //console.debug('received', event.data.action, 'from', id, 'with', event.data.arg);

        if (action == 'ready' || action == 'pause') {
            player.state = 0;
        }

        if (action == 'play') {
            player.state = 1;
            pausePlayersExceptOne(id);
        }

        if (action == 'resize') {
            player.frame.height(getPlayerHeight(argumentObject));
        }
    }

    /**
     * Pause all registered players except the one with the given ID
     * @param {String} currentPlayerId
     */
    function pausePlayersExceptOne(currentPlayerId) {
        var playerData, playerId, message = {action: 'pause'};
        for (playerId in players) {
            if (playerId === currentPlayerId || !players.hasOwnProperty(playerId)) {
                continue;
            }
            playerData = players[playerId];
            if (playerData.state === 0) { continue; } // nothing to do, it is already paused

            playerData.frame.get(0).contentWindow.postMessage(message, playerId);
        }
    }

    /**
     * Sanitize player height
     * @param {Number} height
     * @returns {Number}
     */
    function getPlayerHeight (height) {
        return getDimension(height, IFRAME_HEIGHT_MIN, IFRAME_HEIGHT_MAX, IFRAME_HEIGHT_DEFAULT);
    }

    /**
     * Sanitize player width
     * @param {Number} width
     * @returns {Number}
     */
    function getPlayerWidth (width) {
        return getDimension(width, IFRAME_WIDTH_MIN, IFRAME_WIDTH_MAX, IFRAME_WIDTH_DEFAULT);
    }

    /**
     * Sanitize player dimension
     * @param {Number} value
     * @param {Number} min
     * @param {Number} max
     * @param {Number} defaultValue
     * @returns {Number} new dimension
     */
    function getDimension (value, min, max, defaultValue) {
        if (isNaN(value)) {
            console.warn('Dimension', value, 'is not a number.');
            return defaultValue;
        }
        if (value < min || value > max) {
            console.warn('Dimension', value, 'out of bounds.');
            return defaultValue;
        }
        return value;
    }

    // receive messages from embedded players
    $(window).on('message', handleMessage);

    /**
     * Replace selection of nodes with embedded podlove webplayers and register them internally
     * @param {Object} options
     * @returns {jQuery} jQuery extended HTMLIFrameElement
     */
    $.fn.podlovewebplayer = function (options) {
        return this.replaceWith(function () {
            var $element = $(this);
            var $frame = $('<iframe>', {
                src: $element.data('podlove-web-player-source'),
                height: getPlayerHeight($element.data('podlove-web-player-height')),
                width: getPlayerWidth($element.data('podlove-web-player-width')),
                className: 'podlove-webplayer-frame',
                css: {
                    border: "none",
                    overflow: "hidden"
                }
            });
            var frame = $frame.get(0);

            // register player frame
            players[frame.src] = {
                frame: $frame,
                state: -1
            };
            console.info('registered player with src=', frame.src);

            return $frame;
        });
    };
})(jQuery);

