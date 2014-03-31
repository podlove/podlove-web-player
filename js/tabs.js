/**
 * will store references to tab instances to close all other when one is opened
 * @type {Array}
 */
var tabs = [];

module.exports.add = function(options) {
  tabs.push(options.tab);
};

function createToggleButton(icon, title) {
  return $('<a href="#" class="infobuttons ' + icon + '" title="' + title + '"></a>');
}

module.exports.createToggleButton = createToggleButton;

/**
 *
 * @param {string} name
 * @param {boolean} active
 * @returns {*|jQuery|HTMLElement}
 */
function createControlBox(name, active) {
  var classes = ["podlovewebplayer_controlbox"];
  classes.push(name);
  if (active) {
    classes.push("active");
  }
  return $('<div class="' + classes.join(' ') + '"></div>');
}

module.exports.createControlBox = createControlBox;
