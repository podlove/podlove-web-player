/**
 *
 * @param {string} name
 * @param {boolean} active
 * @returns {*|jQuery|HTMLElement}
 */
function createControlBox(options) {
  var classes = ["tab"];
  classes.push(options.name);
  if (options.active) {
    classes.push("active");
  }
  //return $('<section class="' + classes.join(' ') + '"><header><h2>headline</h2></header></section>');
  return $('<section class="' + classes.join(' ') + '"><header><h2>' + options.headline + '</h2></header></section>');
}

function Tab(options) {
  this.icon = options.icon;
  this.title = options.title;
  this.headline = options.headline;
  console.log(options.headline);
  this.box = createControlBox(options);
  this.active = false;
  this.close();
}

Tab.prototype.open = function () {
  this.active = true;
  this.box.addClass('active');
};

Tab.prototype.close = function () {
  this.active = false;
  this.box.removeClass('active');
};

Tab.prototype.createToggleButton = function(icon, title) {
  return $('<a href="#" class="button button-toggle ' + icon + '" title="' + title + '"></a>');
}

module.exports = Tab;
