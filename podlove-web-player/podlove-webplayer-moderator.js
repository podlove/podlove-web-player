;(function($) {
    var players = [];
    $.fn.podlovewebplayer = function (options) {
        return this.replaceWith(function() {
            var $element = $(this);
            var frame = $('<iframe>', {
                src : $element.data('podlove-web-player-source'),
                height: 300,
                width: 800,
                className: 'podlove-webplayer-frame',
                css:{
                    border:"none",
                    overflow:"hidden"
                }
            });

            $(window).on('message', function(event){
                var orig = event.originalEvent;
                console.log(orig.source.location);
                if( frame.get(0).contentWindow != orig.source) {
                    return;
                }

                if( orig.data.action == 'ready' && orig.source == frame.get(0).contentWindow ){
                }

                if( orig.data.action == 'resize'){
                    console.log(orig.data.arg);
                    frame.height(orig.data.arg);
                }
            });

            // register player frame
            players.push(frame);

            return frame;
        });
    }

})(jQuery);

