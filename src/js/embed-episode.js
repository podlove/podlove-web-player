var moderate = require('./moderate');

/**
 *
 * @param selector default selector '[podlove-web-player-source]'
 */
function getElementsBySelector (selector) {
  if (!selector) {
    return document.querySelectorAll('[rel="embed"]');
  }
  return document.querySelectorAll(selector);
}

function replaceAll () {
  var elementList = getElementsBySelector();
  var l = elementList.length;
  var frame, element;
  while (l--) {
    element = elementList[l];
    frame = moderate.getIframeReplacement.call(element);
    element.parentElement.insertBefore(frame, element);
  }
}

// decide what to do based on given context
if (!window.jQuery) {
  replaceAll();
}

window.pwp = {
  players: moderate.players
};
