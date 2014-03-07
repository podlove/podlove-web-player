// everything for an embedded player
(function($){
  var lastHeight = 0, $body = $(document.body);

  function postToOpener(obj) {
    console.debug('postToOpener', obj);
    window.parent.postMessage(obj, '*');
  }
  $.postToOpener = postToOpener;

  $(window).on('message', function (event) {
    var orig = event.originalEvent;

    if (orig.data.action == 'pause') {
      pwp.players.forEach(function (player) {
        player.pause();
      });
    }
  });

  (function pollHeight() {
    var newHeight = $body.height();
    if (lastHeight != newHeight) {
      postToOpener({
        action: 'resize',
        arg: newHeight
      });
    }

    lastHeight = newHeight;
    requestAnimationFrame(pollHeight, document.body);
  })();

}(jQuery));
