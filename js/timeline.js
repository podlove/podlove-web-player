/*
[
 {type: "image", "title": "The very best Image", "url": "http://domain.com/images/test1.png"},
 {type: "shownote", "text": "PAPAPAPAPAPAGENO"},
 {type: "topic", start: 0, end: 1, q:true, title: "The very first chapter" },
 {type: "audio", start: 0, end: 1, q:true, class: 'speech'},
 {type: "audio", start: 1, end: 2, q:true, class: 'music'},
 {type: "audio", start: 2, end: 3, q:true, class: 'noise'},
 {type: "audio", start: 4, end: 5, q:true, class: 'silence'},
 {type: "content", start: 0, end: 1, q:true, title: "The very first chapter", class:'advertisement'},
 {type: "location", start: 0, end: 1, q:false, title: "Around Berlin", lat:12.123, lon:52.234, diameter:123 },
 {type: "chat", q:false, start: 0.12, "data": "ERSTER & HITLER!!!"},
 {type: "shownote", start: 0.23, "data": "Jemand vadert"},
 {type: "image", "name": "The very best Image", "url": "http://domain.com/images/test1.png"},
 {type: "link", "name": "An interesting link", "url": "http://"},
 {type: "topic", start: 1, end: 2, "name": "The very first chapter", "url": ""},
]
 */
var tc = require('./timecode');

/**
 *
 * @param {HTMLMediaElement} player
 * @param {object} data
 * @constructor
 */
function Timeline(player, data) {
  this.player = player;
  this.hasChapters = checkForChapters(data);
  this.data = this.parseSimpleChapter(data);
  this.modules = [];
  this.listeners = [logCurrentTime];
  this.currentTime = -1;
  this.duration = data.duration;
}

module.exports = Timeline;

Timeline.prototype.addMetadata = function (data) {
  var parsed = _parse(data);
  this.data = _merge(this.data, parsed);
};

Timeline.prototype.getData = function () {
  return this.data;
};

Timeline.prototype.getDataByType = function (type) {
  return this.data.filter(_filterByType(type));
};

Timeline.prototype.addModule = function (module) {
  if (module.update) {
    this.listeners.push(module.update);
  }
  this.modules.push(module);
};

Timeline.prototype.update = function(event) {
  console.log('Timeline', 'update', event);
  var player = event.currentTarget,
    rewind = (this.currentTime > player.currentTime),
    start = this.currentTime,
    end = player.currentTime;

  var call = function call (i, listener) {
    listener(this);
  }.bind(this);

  if (rewind) {
    start = end;
    end = this.currentTime;
  }

  this.emitEventsBetween(start, end);
  this.currentTime = player.currentTime;
  console.log('Listeners', this.listeners);
  $.each(this.listeners, call);
};

Timeline.prototype.emitEventsBetween = function (start, end) {
  var emitStarted = false,
    emit = function (event) {
      var customEvent = new jQuery.Event(event.type, event);
      $(this).trigger(customEvent);
    }.bind(this);
  this.data.map(function (event) {
    var later = (event.start > start),
      earlier = (event.end < start),
      ended = (event.end < end)
      ;
    if (later && earlier && !ended || emitStarted) {
      emit(event);
    }
    emitStarted = later;
  });
};

Timeline.prototype.setTime = function (time) {
  if (time < 0 && time > this.duration) {
    console.warn('Timeline', 'setTime', 'time out of bounds', time);
    return this.player.currentTime;
  }
  if( this.player.readyState == this.player.HAVE_ENOUGH_DATA ){
    this.player.setCurrentTime(time);
    return this.player.currentTime;
  } else {
    $(this.player).one('canplay', function(){
      this.setCurrentTime(time);
    });
  }
};

Timeline.prototype.getTime = function () {
  return this.player.currentTime;
};

Timeline.prototype.rewind = function () {
  this.player.currentTime = 0;
  var call = function call (i, listener) {
    listener(this);
  }.bind(this);
  $.each(this.listeners, call);
};

function _filterByType (type) {
  return function (record) {
    return (record.type === type);
  };
}

/**
 *
 * @param {Timeline} timeline
 */
function logCurrentTime (timeline) {
  console.log('Timeline', 'currentTime', timeline.getTime());
}

/**
 *
 * @param {object} params
 * @returns {boolean} true if at least one chapter is present
 */
function checkForChapters(params) {
  return !!params.chapters && (
      typeof params.chapters === 'object' && params.chapters.length > 1
    );
}

function _parse (data) {
  return data;
}

function _merge (a, b) {

}

Timeline.prototype.parseSimpleChapter = function (data) {
  var chapters = data.chapters.map(transformChapter);

  // order is not guaranteed: http://podlove.org/simple-chapters/
  return chapters
    .map(addType('chapter'))
    .map(addEndTime(data.duration))
    .sort(function (a, b) {
    return a.start - b.start;
  });
}

function transformChapter (chapter) {
  chapter.code = chapter.title;
  if (typeof chapter.start === 'string') {
    chapter.start = tc.getStartTimeCode(chapter.start);
  }
  return chapter;
}

/**
 * add `end` property to each simple chapter,
 * needed for proper formatting
 * @param {Array} chapters
 * @param {number} duration
 * @returns {function}
 */
function addEndTime(duration) {
  return function (chapter, i, chapters) {
    var next = chapters[i + 1];
    chapter.end = next ? next.start : duration;
    return chapter;
  };
}

function addType(type) {
  return function(element) {
    element.type = type
    return element;
  };
}
