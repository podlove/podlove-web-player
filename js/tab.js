/**
 *
 * @param {string} name
 * @param {boolean} active
 * @returns {*|jQuery|HTMLElement}
 */
function createControlBox(name, active) {
  var classes = ["tab"];
  classes.push(name);
  if (active) {
    classes.push("active");
  }
  return $('<div class="' + classes.join(' ') + '"></div>');
}

function Tab(options) {
  this.icon = options.icon;
  this.title = options.title;
  this.box = createControlBox(options.name, options.active);
  this.active = false;
  this.close();
}

Tab.prototype.open = function () {
  this.active = true;
  this.box.addClass('active');
  this.box.css('height', 'auto');
};

Tab.prototype.close = function () {
  this.active = false;
  this.box.removeClass('active');
  this.box.css('height', 0);
};

Tab.prototype.createToggleButton = function(icon, title) {
  return $('<a href="#" class="infobuttons ' + icon + '" title="' + title + '"></a>');
}

module.exports = Tab;
