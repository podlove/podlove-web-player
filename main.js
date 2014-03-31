/*jslint browser: true, plusplus: true, unparam: true, indent: 2 */
/*global jQuery, console */
'use strict';

require('./libs/mediaelement/build/mediaelement-and-player.js');

// FIXME put in compat mode module
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    "use strict";
    return this.replace(/^\s+|\s+$/g, '');
  };
}

var pwp = {
  tc: require('./js/timecode'),
  players: require('./js/player').players,
  embed: require('./js/embed')
};

//FIXME without embed animations are fluent
//pwp.embed.init($, pwp.players);

module.exports = pwp;
