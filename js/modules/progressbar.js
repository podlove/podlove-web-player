var tc = require('../timecode');

function ProgressBar (timeline, params){
	this.params = params;
	this.cache;
}

ProgressBar.prototype.render = function () {
	console.log('params', this.params);

	var cache = this.cache = $(
		'<span id="currentTime">--:--</span>' +
		'<progress></progress>' +
		'<span id="duration">--:--</span>'
	);

	cache.filter('progress').css('width', this.params.width);

	return cache;
};

module.exports = ProgressBar;
