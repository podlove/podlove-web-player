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

  this.update = _update.bind(this);
}

/**
 * This update method is to be called when a players `currentTime` changes.
 */
var _update = function (timeline) {
  var time = timeline.getTime();
  console.log('ProgressBar', 'update', time);

  this.progress.val(time);
  this.currentTime.html(tc.fromTimeStamp(time));
};

/**
 * Renders a new progress bar jQuery object.
 */
ProgressBar.prototype.render = function () {
  console.debug('params', this.params);

  var formattedDuration = tc.fromTimeStamp(this.params.duration),
    bar = $('<div class="progressbar"></div>'),
    currentTimeElement = renderTimeElement('current', '00:00'),
    durationTimeElement = renderTimeElement('duration', formattedDuration),
   // meter = $('<div class="meter"></div>').css('width', this.params.width),
    meter = $('<div class="meter"></div>')  ,
    progress = $('<progress class="progress"></progress>').attr({
      min: 0,
      max: this.params.duration
    });

  progress.append(meter);
  bar
    .append(currentTimeElement)
    .append(progress)
    .append(durationTimeElement)
  ;

  this.bar = bar;
  this.progress = progress;
  this.currentTime = currentTimeElement;
  return bar;
};

function renderTimeElement(className, time) {
  return $('<span class="time time-' + className + '">' + time + '</span>');
}

module.exports = ProgressBar;
