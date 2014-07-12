/**
 * Return an html section element as a wrapper for the tab
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

/**
 * Create a tab
 * @param options
 * @constructor
 */
function Tab(options) {
  this.icon = options.icon;
  this.title = options.title;
  this.headline = options.headline;
  //console.log(options.headline);
  this.box = createContentBox(options);
  this.box.append(this.createHeader());
  this.active = false;
  this.close();
}

/**
 * Add class 'active' to the active tab
 */
Tab.prototype.open = function () {
  this.active = true;
  this.box.addClass('active');
};

/**
 * Remove class 'active' from the inactive tab
 */
Tab.prototype.close = function () {
  this.active = false;
  this.box.removeClass('active');
};

/**
 * Return an html link element
 * @param icon
 * @param title
 * @returns {*|jQuery|HTMLElement}
 */
Tab.prototype.createToggleButton = function(icon, title) {
  return $('<a href="#" class="button button-toggle ' + icon + '" title="' + title + '"></a>');
}

/**
 * Return an html header element with a headline
 * @returns {*|jQuery|HTMLElement}
 */
Tab.prototype.createHeader = function() {
  return $('<header><h2 class="' + this.icon + '">' + this.headline + '</h2></header>');
}

/**
 * Append an html section element to the tab's content box
 * @param content
 */
Tab.prototype.createSection = function(content) {
  this.box.append('<section class="main">' + content + '</section>');
}

/**
 * Append an html aside element to the tab's content box
 * @param content
 */
Tab.prototype.createAside = function(content) {
  this.box.append('<aside class="aside">' + content + '</aside>');
}

/**
 * Append an html footer element to the tab's content box
 * @param content
 */
Tab.prototype.createFooter = function(content) {
  this.box.append('<footer>' + content + '</footer>');
}

module.exports = Tab;
