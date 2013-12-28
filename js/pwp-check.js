(function () {
    var doc = window.document
        , baseUrl
        ;


    function replaceWithPlayerElement(e) {
        var $e = $(e)
            , options = $e.data('podlove-web-player')
            , player = new Player(options)
            , frame = player.frame
            ;
        $e.replaceWith(frame);
        return player;
    }

    function createFrame(options) {
        var replacement = doc.createElement('iframe')
            , options = options || {}
            , type = options.type || 'default'
            ;
        replacement.src = 'index.html?type=' + type;
        replacement.className = 'podlove-web-player-frame';
        replacement.width = options.width || 590;
        replacement.height = options.height || 170;
        return replacement;
    }

    function getFrameUrl(id, type) {

        return baseUrl + '?id=' + id;
    }

    function Player(options) {
        this.frame = createFrame(options);
        var frame = this.frame;
        this.sendMessage = function (message) {
//            var contentWindow = frame.contentWindow;
//            contentWindow.postMessage(message);
            return false;
        };
    }


    function init(options) {
        var elements = $('audio[data-podlove-web-player]')
            , opts = options || {}
            , players = []
        ;

        baseUrl = opts.baseUrl;
        if (elements.length > 0) {
            players = elements.map(replaceWithPlayerElement);
        }

        players.forEach(function (player) {
            player.sendMessage('init');
        });
        console.log(players);

    }

    window.pwp = {
        init: init
    };
})();
