/*jslint browser: true, plusplus: true, unparam: true, indent: 2 */
/*global jQuery, console */

// FIXME put in compat mode module
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    "use strict";
    return this.replace(/^\s+|\s+$/g, '');
  };
}

$.cookieHandler = require('./js/cookie');
$.chapters = require('./js/chapter');

var embed = require('./js/embed');

var pwp = {
  tc: require('./js/timecode'),
  players: require('./js/player').players,
  embed: embed
};
