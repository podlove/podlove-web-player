/**
 * @type {Tab}
 */
var Tab = require('./tab.js');

function TabRegistry() {
  /**
   * will store a reference to currently active tab instance to close it when another one is opened
   * @type {object}
   */
  this.activeTab = null;
  this.togglebar = $('<ul class="togglebar"></ul>');
  this.container = $('<div class="tabs"></div>');
  this.listeners = [logCurrentTime];
  this.tabs = [];
}

module.exports = TabRegistry;

/**
 *
 * @param {Tab} tab
 */
TabRegistry.prototype.add = function(tab) {
  this.tabs.push(tab);
  this.container.append(tab.box);
  var toggle = tab.createToggleButton(tab.icon, tab.title);
  //this.togglebar.append('<li>' + toggle + '</li>');
  $('<li></li>').append(toggle).appendTo(this.togglebar);
  toggle.on('click', getToggleClickHandler.bind(this, tab));
};

/**
 *
 * @param {Tab} tab
 */
TabRegistry.prototype.open = function(tab) {
  var open = getToggleClickHandler.bind(this);
  $.each(this.tabs, function () {
    if (this.name == tab.name) {
      open(this);
    }
  });
};

/**
 *
 * @param {object} module
 */
TabRegistry.prototype.addModule = function(module) {
  if (module.tab) {
    this.add(module.tab);
  }
  if (module.update) {
    this.listeners.push(module.update);
  }
};

TabRegistry.prototype.update = function(event) {
  console.log('TabRegistry#update', event);
  var player = event.currentTarget;
  $.each(this.listeners, function (i, listener) { listener(player); });
};

/**
 *
 * @param {Tab} tab
 * @returns {boolean}
 */
function getToggleClickHandler(tab) {
  console.log(this.activeTab);
  if (this.activeTab) {
    this.activeTab.close();
  }
  this.activeTab = tab;
  this.activeTab.open();
  return false;
}

/**
 *
 * @param {HTMLElement} player
 */
function logCurrentTime (player) {
  console.log('player.currentTime', player.currentTime);
}
