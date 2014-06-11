var tc = require('../timecode');

/**
 * @constructor
 * Creates a new pgrogress bar object.
 * @param timeline - The players timeline to attach to.
 * @param params - Various parameters
 */
function ProgressBar (timeline, params){
	if( !timeline){
		console.error('no timeline?', arguments);
		return;
	}
	this.params = params;
	this.cache;
	this.timeline = timeline;

	this.update = _update.bind(this);
}

/**
 * This update method is to be called when a players `currentTime` changes.
 */
var _update = function(timeline) {
	var time = timeline.getTime();
	console.debug('ProgressBar','update', time);

	this.cache.filter('progress').val(time);
	this.cache.filter('#currentTime').html(tc.fromTimeStamp(time));
};

/**
 * Renders a new progress bar jQuery object.
 */
ProgressBar.prototype.render = function () {
	console.log('params', this.params);

	var cache = this.cache = $(
		'<span id="currentTime">--:--</span>' +
		'<progress class="progress"><div class="meter"></div></progress>' +
		'<span id="duration">--:--</span>'
	);

	cache.find('.meter').css('width', this.params.width);
	cache.filter('.progress').attr({
		min: 0,
		max: this.params.duration
	});

	cache.filter('#duration').html(tc.fromTimeStamp(this.params.duration));

	return cache;
};

module.exports = ProgressBar;
