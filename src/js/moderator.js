'use strict';

var moderate = require('./moderate');

// receive messages from embedded players
window.addEventListener('message', moderate.handleMessage, false);

/**
 * Replace selection of nodes with embedded podlove webplayers and register them internally
 * @param {object} opts
 * @returns {jQuery} jQuery extended HTMLIFrameElement
 */
function replaceWithJQ(opts) {
  if (opts) {
    pwp.options = opts || {};
  }
  return this.replaceWith(moderate.getIframeReplacement);
}

if (window.jQuery) {
   jQuery.fn.podlovewebplayer = replaceWithJQ;
}

window.pwp = {
  players: moderate.players
};
