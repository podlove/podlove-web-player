/**
 * Saving the playtime
 */
var prefix = 'podlove-web-player-playtime-';

var getItem = function () {
  return +localStorage[this.key];
};


var removeItem = function () {
  return localStorage.removeItem(this.key);
};

var hasItem = function () {
  return (this.key) in localStorage;
};

var update = function () {
  console.debug('SaveTime', 'update', this.timeline.getTime());
  this.setItem(this.timeline.getTime());
};

function SaveTime (timeline, params) {
  this.timeline = timeline;
  this.key = prefix + params.permalink;
  this.getItem = getItem.bind(this);
  this.removeItem = removeItem.bind(this);
  this.hasItem = hasItem.bind(this);
  this.update = update.bind(this);

  // set the time on start
  if( this.hasItem() ){
    timeline.setTime( this.getItem());
  }
}

SaveTime.prototype.setItem = function (value) {
  return localStorage[this.key] = value;
};


module.exports = SaveTime;

