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
  updateTimes(this);
};

/**
 * set chapter title and badge
 */
ProgressBar.prototype.setChapter = function () {
  if (!this.chapterModule) { return; }

  var index = this.chapterModule.currentChapter;
  var chapter = this.chapterModule.chapters[index];
  this.chapterBadge.text(index + 1);
  this.chapterTitle.text(chapter.title);
};

/**
 * This update method is to be called when a players `currentTime` changes.
 */
var _update = function (timeline) {
  this.setProgress(timeline.getTime());
  this.buffer.val(timeline.getBuffered());
  this.setChapter();
};

/**
 * Renders a new progress bar jQuery object.
 */
ProgressBar.prototype.render = function () {

  // progress info
  this.durationTimeElement = renderDurationTimeElement(this);
  this.currentTime = renderTimeElement('current', '00:00:00');
  var progressInfo = renderProgressInfo(this);

  updateTimes(this);

  // timeline and buffer bars
  var progress = $('<div class="progress"></div>');
  var timelineBar = $('<progress class="current"></progress>')
      .attr({ min: 0, max: this.duration });
  var handle = $('<div class="handle"><div class="inner-handle"></div></div>');
  var buffer = $('<progress class="buffer"></progress>')
      .attr({min: 0, max: this.duration})
      .css({height: '1px'});

  progress
    .append(timelineBar)
    .append(buffer)
    .append(handle);

  this.setHandlePosition(this.timeline);

  if (this.chapterModule) {
    var chapterMarkers = this.chapterModule.chapters.map(renderChapterMarker, this);
    chapterMarkers.shift(); // remove first one
    progress.append(chapterMarkers);
  }

  // progress bar
  var bar = $('<div class="progressbar"></div>');
  bar
    .append(progressInfo)
    .append(progress)
  ;

  this.bar = bar;
  this.progress = timelineBar;
  this.buffer = buffer;
  this.handle = handle;

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

function renderProgressInfo(progressBar) {
  var progressInfo = $('<div class="progress-info"></div>');

  return progressInfo
    .append(progressBar.currentTime)
    .append(renderCurrentChapterElement.call(progressBar))
    .append(progressBar.durationTimeElement);
}

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

function renderDurationTimeElement(progressBar) {
  var formattedDuration = tc.fromTimeStamp(progressBar.duration);
  var durationTimeElement = renderTimeElement('duration', 0);

  durationTimeElement.on('click', function () {
    progressBar.showDuration = !progressBar.showDuration;
    if (progressBar.showDuration) {
      durationTimeElement.text(formattedDuration);
      return;
    }
    updateTimes(progressBar);
  }.bind(this));

  return durationTimeElement;
}

function updateTimes(progressBar) {
  var time = progressBar.timeline.getTime();
  progressBar.currentTime.html(tc.fromTimeStamp(time));

  if (this.showDuration) { return; }

  var remainingTime = Math.abs(time - progressBar.duration);
  progressBar.durationTimeElement.text('-' + tc.fromTimeStamp(remainingTime));
}

function renderChapterMarker(chapter) {
  return renderMarkerAt.call(this, chapter.start);
}

function renderMarkerAt(time) {
  var percent = 100*time/this.duration;
  return $('<div class="marker" style="left:' + percent + '%;"></div>');
}

module.exports = ProgressBar;

