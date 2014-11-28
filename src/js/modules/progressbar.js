var tc = require('../timecode');

/**
 * @constructor
 * Creates a new progress bar object.
 * @param {Timeline} timeline - The players timeline to attach to.
 */
function ProgressBar(timeline) {
  if (!timeline) {
    console.error('Timeline missing', arguments);
    return;
  }
  this.timeline = timeline;
  this.duration = timeline.duration;

  this.bar = null;
  this.currentTime = null;

  if (timeline.hasChapters) {
    // FIXME get access to chapterModule reliably
    // this.timeline.getModule('chapters')
    this.chapterModule = this.timeline.modules[0];
    this.chapterBadge = null;
    this.chapterTitle = null;
  }

  this.showDuration = false;
  this.progress = null;
  this.buffer = null;
  this.update = _update.bind(this);
}

ProgressBar.prototype.setHandlePosition = function (time) {
  var percent = time / this.duration * 100;
  var newLeftOffset = percent + '%';
  console.debug('ProgressBar', 'setHandlePosition', 'time', time, 'newLeftOffset', newLeftOffset);
  this.handle.css('left', newLeftOffset);
};

/**
 * set progress bar value, slider position and current time
 * @param {number} time
 */
ProgressBar.prototype.setProgress = function (time) {
  this.progress.val(time);
  this.setHandlePosition(time);
  this.currentTime.html(tc.fromTimeStamp(time));
};

/**
 * set chapter title and badge
 */
ProgressBar.prototype.setChapter = function () {
  var index = this.chapterModule.currentChapter;
  var chapter = this.chapterModule.chapters[index];
  this.chapterBadge.text(index + 1);
  this.chapterTitle.text(chapter.title);
};

/**
 * This update method is to be called when a players `currentTime` changes.
 */
var _update = function (timeline) {
  var time = timeline.getTime();
  this.setProgress(time);

  var buffer = timeline.getBuffered();
  this.buffer.val(buffer);

  if (!this.showDuration) {
    updateRemainingTime.call(this, time);
  }

  if (this.chapterModule) {
    this.setChapter();
  }
};

/**
 * Renders a new progress bar jQuery object.
 */
ProgressBar.prototype.render = function () {

  var formattedDuration = tc.fromTimeStamp(this.duration);
  var durationTimeElement = renderTimeElement('duration', 0);

  this.durationTimeElement = durationTimeElement;
  updateRemainingTime.call(this, 0);

  var clickHandler = function () {
    this.showDuration = !this.showDuration;
    if (this.showDuration) {
      this.durationTimeElement.text(formattedDuration);
      return;
    }
    updateRemainingTime.call(this, this.player.currentTime);
  }.bind(this);

  durationTimeElement.on('click', function () {
    clickHandler();
  });

  var bar = $('<div class="progressbar"></div>'),
    progressInfo = $('<div class="progress-info"></div>'),
    currentTimeElement = renderTimeElement('current', '00:00:00'),
    progress = $('<div class="progress"></div>'),
    current = $('<progress class="current"></progress>')
      .attr({ min: 0, max: this.duration }),
    handle = $('<div class="handle"><div class="inner-handle"></div></div>'),
    buffer = $('<progress class="buffer"></progress>')
      .attr({min: 0, max: 1})
      .css({height:"1px;"});

  progress
    .append(current)
    .append(buffer)
    .append(handle)
  ;

  if (this.chapterModule) {
    var markers = this.chapterModule.chapters.map(renderChapterMarker, this);
    markers.shift(); // remove first one
    progress.append(markers);
  }

  progressInfo
    .append(currentTimeElement)
    .append(renderCurrentChapterElement.call(this))
    .append(durationTimeElement)
  ;

  bar
    .append(progressInfo)
    .append(progress)
  ;

  this.bar = bar;
  this.progress = current;
  this.buffer = buffer;
  this.handle = handle;
  this.currentTime = currentTimeElement;

  return bar;
};

ProgressBar.prototype.addEvents = function() {
  var setProgress = this.setProgress.bind(this),
    timeline = this.timeline,
    total = this.progress,
    mouseIsDown = false,
    mouseIsOver = false,
    handleMouseMove = function (e) {
      // mouse position relative to the object
      var x = e.pageX,
        offset = total.offset(),
        width = total.outerWidth(true),
        percentage = 0,
        newTime = 0,
        pos = 0;


      if (timeline.duration) {
        if (x < offset.left) {
          x = offset.left;
        } else if (x > width + offset.left) {
          x = width + offset.left;
        }

        pos = x - offset.left;
        percentage = (pos / width);
        newTime = (percentage <= 0) ? 0 : percentage * timeline.duration;

        // seek to where the mouse is
        if (mouseIsDown && newTime !== timeline.currentTime) {
          setProgress(newTime);
          timeline.setTime(newTime);
        }
      }
    },
    mouseDownHandler = function (e) {
      // only handle left clicks
      if (e.which === 1) {
        mouseIsDown = true;
        handleMouseMove(e);
        $(document).bind('mousemove.dur', function(e) {
          handleMouseMove(e);
        });
        $(document).bind('mouseup.dur', function (e) {
          mouseIsDown = false;
          $(document)
            .unbind('mousup.dur')
            .unbind('mousemove.dur');
        });
        return false;
      }
    },
    mouseEnterHandler = function() {
      mouseIsOver = true;
      $(document).bind('mousemove.dur', function(e) {
        handleMouseMove(e);
      });
    },
    mouseLeaveHandler = function() {
      mouseIsOver = false;
      if (!mouseIsDown) {
        $(document)
          .unbind('mousup.dur')
          .unbind('mousemove.dur');
      }
    }
    ;

  this.setHandlePosition(this.timeline);

  // handle clicks and drag in progressbar and on handle
  this.progress
    .bind('mousedown', mouseDownHandler)
    .bind('mouseenter', mouseEnterHandler)
    .bind('mouseleave', mouseLeaveHandler);

  this.handle
    .bind('mousedown', mouseDownHandler)
    .bind('mouseenter', mouseEnterHandler)
    .bind('mouseleave', mouseLeaveHandler)

};

function renderTimeElement(className, time) {
  return $('<div class="time time-' + className + '">' + time + '</div>');
}

/**
 * Render an HTML Element for the current chapter
 * @returns {jQuery|HTMLElement}
 */
function renderCurrentChapterElement() {
  var chapterElement  = $('<div class="chapter"></div>');

  if (!this.chapterModule) {
    return chapterElement;
  }

  var index = this.chapterModule.currentChapter;
  var chapter = this.chapterModule.chapters[index];
  console.debug('Progressbar', 'renderCurrentChapterElement', index, chapter);

  this.chapterBadge = $('<span class="badge">' + (index + 1) + '</span>');
  this.chapterTitle = $('<span class="chapter-title">' + chapter.title + '</span>');

  chapterElement
    .append(this.chapterBadge)
    .append(this.chapterTitle);

  return chapterElement;
}

function updateRemainingTime(time) {
  var text = tc.fromTimeStamp(Math.abs(time - this.duration));
  this.durationTimeElement.text('-' + text);
}

function renderChapterMarker(chapter) {
  return renderMarkerAt.call(this, chapter.start);
}

function renderMarkerAt(time) {
  var percent = 100*time/this.duration;
  return $('<div class="marker" style="left:' + percent + '%;"></div>');
}

module.exports = ProgressBar;

