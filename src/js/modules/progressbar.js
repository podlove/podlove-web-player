var tc = require('../timecode');

/**
 * @constructor
 * Creates a new progress bar object.
 * @param {Timeline} timeline - The players timeline to attach to.
 * @param {Object} params - Various parameters
 */
function ProgressBar(timeline, params) {
  if (!timeline) {
    console.error('Timeline missing', arguments);
    return;
  }
  this.params = params;
  this.timeline = timeline;

  this.bar = null;
  this.currentTime = null;
  this.progress = null;
  this.buffer = null;

  this.update = _update.bind(this);
}

ProgressBar.prototype.setHandlePosition = function (timeline) {
  var time = timeline.getTime(),
    newWidth = Math.round(this.progress.width() * time / timeline.duration),
    handlePos = newWidth - Math.round(this.handle.outerWidth(true) / 2);
  console.debug('ProgressBar', 'setHandlePosition', handlePos);
  this.handle.css('left', handlePos);
};

/**
 * This update method is to be called when a players `currentTime` changes.
 */
var _update = function (timeline) {
  var time = timeline.getTime();
  this.progress.val(time);

  console.log('ProgressBar', 'update', time);

  var buffer = timeline.getBuffered();
  this.buffer.val(buffer);

  this.setHandlePosition(timeline);
  this.currentTime.html(tc.fromTimeStamp(time));
};

/**
 * Renders a new progress bar jQuery object.
 */
ProgressBar.prototype.render = function () {
  console.debug('params', this.params);

  var formattedDuration = tc.fromTimeStamp(this.params.duration),
    bar = $('<div class="progressbar"></div>'),
    currentTimeElement = renderTimeElement('current', '00:00:00'),
    durationTimeElement = renderTimeElement('duration', formattedDuration),
    progress = $('<div class="progress"></div>'),
    current = $('<progress class="current"></progress>')
      .attr({ min: 0, max: this.params.duration }),
    handle = $('<div class="handle"></div>'),
    buffer = $('<progress class="buffer"></progress>')
      .attr({min: 0, max: 1})
      .css({height:"1px;"});

  progress
    .append(current)
    .append(buffer)
    .append(handle)
  ;

  bar
    .append(currentTimeElement)
    .append(progress)
    .append(durationTimeElement)
  ;

  this.bar = bar;
  this.progress = current;
  this.buffer = buffer;
  this.handle = handle;
  this.currentTime = currentTimeElement;

  return bar;
};

ProgressBar.prototype.addEvents = function() {

  var update = this.update,
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
        newTime = (percentage <= 0.02) ? 0 : percentage * timeline.duration;

        // seek to where the mouse is
        if (mouseIsDown && newTime !== timeline.currentTime) {
          update(newTime);
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
  return $('<span class="time time-' + className + '">' + time + '</span>');
}

module.exports = ProgressBar;

