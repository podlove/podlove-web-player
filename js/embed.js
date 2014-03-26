// everything for an embedded player
var
  players = require('./player').players,
  lastHeight = 0,
  $body;

function init($) {
  $body = $(document.body);
  $(window).on('message', messageListener);
  pollHeight();
}

function postToOpener(obj) {
  console.debug('postToOpener', obj);
  window.parent.postMessage(obj, '*');
}

function messageListener (event) {
  var orig = event.originalEvent;

  if (orig.data.action == 'pause') {
    players.forEach(function (player) {
      player.pause();
    });
  }
}

function pollHeight() {
  var newHeight = $body.height();
  if (lastHeight != newHeight) {
    postToOpener({
      action: 'resize',
      arg: newHeight
    });
  }

  lastHeight = newHeight;
  requestAnimationFrame(pollHeight, document.body);
}

module.exports = {
  postToOpener: postToOpener,
  init: init
};
