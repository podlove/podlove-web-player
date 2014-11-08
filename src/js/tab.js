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

  this.box = createContentBox(options);
  this.createHeader();
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
};

/**
 * Return an html header element with a headline
 */
Tab.prototype.createHeader = function() {
  var header = $('<header><h2><i class="' + this.icon + '"></i>' + this.headline + '</h2></header>');
  this.box.append(header);
  return header;
};

/**
 * Append an html div element with class main to the tab's content box
 * @param content
 */
Tab.prototype.createMainContent = function(content) {
  var mainDiv = $('<div class="main">' + content + '</div');
  this.box.append(mainDiv);
  return mainDiv;
};

/**
 * Append an html aside element to the tab's content box
 * @param content
 */
Tab.prototype.createAside = function(content) {
  var aside = $('<aside class="aside">' + content + '</aside>');
  this.box.append(aside);
  return aside;
};

/**
 * Append an html footer element to the tab's content box
 * @param content
 */
Tab.prototype.createFooter = function(content) {
  var footer = $('<footer>' + content + '</footer>');
  this.box.append(footer);
  return footer;
};

module.exports = Tab;
