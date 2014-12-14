'use strict';

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
  this.togglebar = $('<div class="togglebar bar"></div>');
  this.toggleList = $('<ul class="tablist"></ul>');
  this.togglebar.append(this.toggleList);
  this.container = $('<div class="tabs"></div>');
  this.listeners = [logCurrentTime];
  this.tabs = [];
}

module.exports = TabRegistry;

TabRegistry.prototype.createToggleFor = function (tab) {
  var toggle = $('<li title="' + tab.title + '">' +
      '<a href="javascript:;" class="button button-toggle ' + tab.icon + '"></a>' +
    '</li>');
  toggle.on('click', getToggleClickHandler.bind(this, tab));
  this.toggleList.append(toggle);
  return toggle;
};

/**
 * Register a tab and open it if it is initially visible
 * @param {Tab} tab
 * @param {Boolean} visible
 */
TabRegistry.prototype.add = function(tab, visible) {
  if (tab === null) { return; }
  this.tabs.push(tab);
  this.container.append(tab.box);

  tab.toggle = this.createToggleFor(tab);
  if (visible) {
    tab.open();
    this.activeTab = tab;
  }
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
  console.debug('TabRegistry', 'activeTab', this.activeTab);
  if (this.activeTab) {
    this.activeTab.close();
  }
  if (this.activeTab === tab) {
    this.activeTab  = null;
    return false;
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
