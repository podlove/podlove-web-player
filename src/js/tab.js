/**
 *
 * @param {string} name
 * @param {boolean} active
 * @returns {*|jQuery|HTMLElement}
 */
function createContentBox(options) {
  var classes = ["tab"];
  classes.push(options.name);
  if (options.active) {
    classes.push("active");
  }
  return $('<section class="' + classes.join(' ') + '"></section>');
}

function Tab(options) {
  this.icon = options.icon;
  this.title = options.title;
  this.headline = options.headline;
  console.log(options.headline);
  this.box = createContentBox(options);
  this.box.append(this.createHeader());
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

Tab.prototype.createHeader = function() {
  return $('<header><h2>' + this.headline + '</h2></header>');
}

Tab.prototype.createSection = function(content) {
  this.box.append('<section>' + content + '</section>');
}

Tab.prototype.createAside = function(content) {
  this.box.append('<aside>' + content + '</aside>');
}

Tab.prototype.createFooter = function(content) {
  this.box.append('<footer>' + content + '</footer>');
}

module.exports = Tab;
