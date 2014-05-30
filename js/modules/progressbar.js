var tc = require('../timecode');

/**
 * @constructor
 * Creates a new pgrogress bar object.
 * @param timeline - The players timeline to attach to.
 * @param params - Various parameters
 */
function ProgressBar (timeline, params){
	if( !timeline){
		console.error('no timline?', arguments);
		return;
	}
	this.params = params;
	this.cache;
	this.timeline = timeline;

	this.update = this.update.bind(this);
}

/**
 * This update method is to be called when a players `currentTime` changes.
 */
ProgressBar.prototype.update = function(timeline) {
	var time = timeline.getTime();
	console.log('ProgressBar','update', time);

	this.cache.filter('progress').val(time);
	this.cache.filter('#currentTime').html(tc.generate([time], true));
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

	cache.filter('#duration').html(tc.generate([this.params.duration], false));

	return cache;
};

module.exports = ProgressBar;
