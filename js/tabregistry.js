var Tab = require('./tab.js');

function TabRegistry() {
  /**
   * will store a reference to currently active tab instance to close it when another one is opened
   * @type {object}
   */
  this.activeTab = null;
  this.toggles = $('<div class="togglers"></div>');
  this.container = $('<div class="tabs"></div>');
}

module.exports = TabRegistry;

TabRegistry.prototype.add = function(tab) {
  this.container.append(tab.box);
  var toggle = tab.createToggleButton(tab.icon, tab.title);
  this.toggles.append(toggle);
  toggle.on('click', getToggleClickHandler.bind(this, tab));
};

function getToggleClickHandler(tab) {
  console.log(this.activeTab);
  if (this.activeTab) {
    this.activeTab.close();
  }
  this.activeTab = tab;
  this.activeTab.open();
  return false;
}
