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
  this.endTime = data.duration;
  this.bufferedTime = 0;
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

Timeline.prototype.playRange = function (range) {
  if (!range || !range.length || !range.shift) {
    throw TypeError('Timeline.playRange called without a range');
  }
  this.setTime(range.shift());
  this.stopAt(range.shift());
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
  if (this.currentTime >= this.endTime) {
    this.player.stop();
  }
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

/**
 * returns if time is a valid timestamp in current timeline
 * @param {*} time
 * @returns {boolean}
 */
Timeline.prototype.isValidTime = function (time) {
  return (typeof time === 'number' && !isNaN(time) && time >= 0 && time <= this.duration);
};

Timeline.prototype.setTime = function (time) {
  if (!this.isValidTime(time)) {
    console.warn('Timeline', 'setTime', 'time out of bounds', time);
    return this.player.currentTime;
  }
  if (this.player.readyState == this.player.HAVE_ENOUGH_DATA ){
    this.player.setCurrentTime(time);
    this.currentTime = time;
    return this.player.currentTime;
  } else {
    $(this.player).one('canplay', function(){
      this.setCurrentTime(time);
    });
  }
};

Timeline.prototype.stopAt = function (time) {
  if (!time || time <= 0 || time > this.duration) {
    return console.warn('Timeline', 'stopAt', 'time out of bounds', time);
  }
  this.endTime = time;
};

Timeline.prototype.getTime = function () {
  return this.player.currentTime;
};

Timeline.prototype.getBuffered = function () {
  return this.bufferedTime;
};

Timeline.prototype.setBufferedTime = function (e) {
  var
    target = (e != undefined) ? e.target : this.player,
    percent = null;

  // newest HTML5 spec has buffered array (FF4, Webkit)
  if (target && target.buffered && target.buffered.length > 0 && target.buffered.end && target.duration) {
    // TODO: account for a real array with multiple values (only Firefox 4 has this so far)
    percent = target.buffered.end(0) / target.duration;
  }
  // Some browsers (e.g., FF3.6 and Safari 5) cannot calculate target.bufferered.end()
  // to be anything other than 0. If the byte count is available we use this instead.
  // Browsers that support the else if do not seem to have the bufferedBytes value and
  // should skip to there. Tested in Safari 5, Webkit head, FF3.6, Chrome 6, IE 7/8.
  else if (target && target.bytesTotal != undefined && target.bytesTotal > 0 && target.bufferedBytes != undefined) {
    percent = target.bufferedBytes / target.bytesTotal;
  }
  // Firefox 3 with an Ogg file seems to go this way
  else if (e && e.lengthComputable && e.total != 0) {
    percent = e.loaded/e.total;
  }

  // finally update the progress bar
  if (percent !== null) {
    percent = Math.min(1, Math.max(0, percent));
  }

  this.bufferedTime = percent;
  console.log('Timeline', 'setBufferedTime', percent);
};

Timeline.prototype.rewind = function () {
  this.setTime(0);
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
};

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
    element.type = type;
    return element;
  };
}
