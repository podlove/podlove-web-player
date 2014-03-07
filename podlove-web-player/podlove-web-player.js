/*jslint browser: true, plusplus: true, unparam: true, indent: 2 */
/*global jQuery, console */
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    "use strict";
    return this.replace(/^\s+|\s+$/g, '');
  };
}

var pwp = {};

