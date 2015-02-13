(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 *
 * MediaElement.js
 * HTML5 <video> and <audio> shim and player
 * http://mediaelementjs.com/
 *
 * Creates a JavaScript object that mimics HTML5 MediaElement API
 * for browsers that don't understand HTML5 or can't play the provided codec
 * Can play MP4 (H.264), Ogg, WebM, FLV, WMV, WMA, ACC, and MP3
 *
 * Copyright 2010-2014, John Dyer (http://j.hn)
 * License: MIT
 *
 */
// Namespace
var mejs = mejs || {};

// version number
mejs.version = '2.16.2'; 


// player number (for missing, same id attr)
mejs.meIndex = 0;

// media types accepted by plugins
mejs.plugins = {
	silverlight: [
		{version: [3,0], types: ['video/mp4','video/m4v','video/mov','video/wmv','audio/wma','audio/m4a','audio/mp3','audio/wav','audio/mpeg']}
	],
	flash: [
		{version: [9,0,124], types: ['video/mp4','video/m4v','video/mov','video/flv','video/rtmp','video/x-flv','audio/flv','audio/x-flv','audio/mp3','audio/m4a','audio/mpeg', 'video/youtube', 'video/x-youtube', 'application/x-mpegURL']}
		//,{version: [12,0], types: ['video/webm']} // for future reference (hopefully!)
	],
	youtube: [
		{version: null, types: ['video/youtube', 'video/x-youtube', 'audio/youtube', 'audio/x-youtube']}
	],
	vimeo: [
		{version: null, types: ['video/vimeo', 'video/x-vimeo']}
	]
};

/*
Utility methods
*/
mejs.Utility = {
	encodeUrl: function(url) {
		return encodeURIComponent(url); //.replace(/\?/gi,'%3F').replace(/=/gi,'%3D').replace(/&/gi,'%26');
	},
	escapeHTML: function(s) {
		return s.toString().split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
	},
	absolutizeUrl: function(url) {
		var el = document.createElement('div');
		el.innerHTML = '<a href="' + this.escapeHTML(url) + '">x</a>';
		return el.firstChild.href;
	},
	getScriptPath: function(scriptNames) {
		var
			i = 0,
			j,
			codePath = '',
			testname = '',
			slashPos,
			filenamePos,
			scriptUrl,
			scriptPath,			
			scriptFilename,
			scripts = document.getElementsByTagName('script'),
			il = scripts.length,
			jl = scriptNames.length;
			
		// go through all <script> tags
		for (; i < il; i++) {
			scriptUrl = scripts[i].src;
			slashPos = scriptUrl.lastIndexOf('/');
			if (slashPos > -1) {
				scriptFilename = scriptUrl.substring(slashPos + 1);
				scriptPath = scriptUrl.substring(0, slashPos + 1);
			} else {
				scriptFilename = scriptUrl;
				scriptPath = '';			
			}
			
			// see if any <script> tags have a file name that matches the 
			for (j = 0; j < jl; j++) {
				testname = scriptNames[j];
				filenamePos = scriptFilename.indexOf(testname);
				if (filenamePos > -1) {
					codePath = scriptPath;
					break;
				}
			}
			
			// if we found a path, then break and return it
			if (codePath !== '') {
				break;
			}
		}
		
		// send the best path back
		return codePath;
	},
	secondsToTimeCode: function(time, forceHours, showFrameCount, fps) {
		//add framecount
		if (typeof showFrameCount == 'undefined') {
		    showFrameCount=false;
		} else if(typeof fps == 'undefined') {
		    fps = 25;
		}
	
		var hours = Math.floor(time / 3600) % 24,
			minutes = Math.floor(time / 60) % 60,
			seconds = Math.floor(time % 60),
			frames = Math.floor(((time % 1)*fps).toFixed(3)),
			result = 
					( (forceHours || hours > 0) ? (hours < 10 ? '0' + hours : hours) + ':' : '')
						+ (minutes < 10 ? '0' + minutes : minutes) + ':'
						+ (seconds < 10 ? '0' + seconds : seconds)
						+ ((showFrameCount) ? ':' + (frames < 10 ? '0' + frames : frames) : '');
	
		return result;
	},
	
	timeCodeToSeconds: function(hh_mm_ss_ff, forceHours, showFrameCount, fps){
		if (typeof showFrameCount == 'undefined') {
		    showFrameCount=false;
		} else if(typeof fps == 'undefined') {
		    fps = 25;
		}
	
		var tc_array = hh_mm_ss_ff.split(":"),
			tc_hh = parseInt(tc_array[0], 10),
			tc_mm = parseInt(tc_array[1], 10),
			tc_ss = parseInt(tc_array[2], 10),
			tc_ff = 0,
			tc_in_seconds = 0;
		
		if (showFrameCount) {
		    tc_ff = parseInt(tc_array[3])/fps;
		}
		
		tc_in_seconds = ( tc_hh * 3600 ) + ( tc_mm * 60 ) + tc_ss + tc_ff;
		
		return tc_in_seconds;
	},
	

	convertSMPTEtoSeconds: function (SMPTE) {
		if (typeof SMPTE != 'string') 
			return false;

		SMPTE = SMPTE.replace(',', '.');
		
		var secs = 0,
			decimalLen = (SMPTE.indexOf('.') != -1) ? SMPTE.split('.')[1].length : 0,
			multiplier = 1;
		
		SMPTE = SMPTE.split(':').reverse();
		
		for (var i = 0; i < SMPTE.length; i++) {
			multiplier = 1;
			if (i > 0) {
				multiplier = Math.pow(60, i); 
			}
			secs += Number(SMPTE[i]) * multiplier;
		}
		return Number(secs.toFixed(decimalLen));
	},	
	
	/* borrowed from SWFObject: http://code.google.com/p/swfobject/source/browse/trunk/swfobject/src/swfobject.js#474 */
	removeSwf: function(id) {
		var obj = document.getElementById(id);
		if (obj && /object|embed/i.test(obj.nodeName)) {
			if (mejs.MediaFeatures.isIE) {
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						mejs.Utility.removeObjectInIE(id);
					} else {
						setTimeout(arguments.callee, 10);
					}
				})();
			} else {
				obj.parentNode.removeChild(obj);
			}
		}
	},
	removeObjectInIE: function(id) {
		var obj = document.getElementById(id);
		if (obj) {
			for (var i in obj) {
				if (typeof obj[i] == "function") {
					obj[i] = null;
				}
			}
			obj.parentNode.removeChild(obj);
		}		
	}
};


// Core detector, plugins are added below
mejs.PluginDetector = {

	// main public function to test a plug version number PluginDetector.hasPluginVersion('flash',[9,0,125]);
	hasPluginVersion: function(plugin, v) {
		var pv = this.plugins[plugin];
		v[1] = v[1] || 0;
		v[2] = v[2] || 0;
		return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
	},

	// cached values
	nav: window.navigator,
	ua: window.navigator.userAgent.toLowerCase(),

	// stored version numbers
	plugins: [],

	// runs detectPlugin() and stores the version number
	addPlugin: function(p, pluginName, mimeType, activeX, axDetect) {
		this.plugins[p] = this.detectPlugin(pluginName, mimeType, activeX, axDetect);
	},

	// get the version number from the mimetype (all but IE) or ActiveX (IE)
	detectPlugin: function(pluginName, mimeType, activeX, axDetect) {

		var version = [0,0,0],
			description,
			i,
			ax;

		// Firefox, Webkit, Opera
		if (typeof(this.nav.plugins) != 'undefined' && typeof this.nav.plugins[pluginName] == 'object') {
			description = this.nav.plugins[pluginName].description;
			if (description && !(typeof this.nav.mimeTypes != 'undefined' && this.nav.mimeTypes[mimeType] && !this.nav.mimeTypes[mimeType].enabledPlugin)) {
				version = description.replace(pluginName, '').replace(/^\s+/,'').replace(/\sr/gi,'.').split('.');
				for (i=0; i<version.length; i++) {
					version[i] = parseInt(version[i].match(/\d+/), 10);
				}
			}
		// Internet Explorer / ActiveX
		} else if (typeof(window.ActiveXObject) != 'undefined') {
			try {
				ax = new ActiveXObject(activeX);
				if (ax) {
					version = axDetect(ax);
				}
			}
			catch (e) { }
		}
		return version;
	}
};

// Add Flash detection
mejs.PluginDetector.addPlugin('flash','Shockwave Flash','application/x-shockwave-flash','ShockwaveFlash.ShockwaveFlash', function(ax) {
	// adapted from SWFObject
	var version = [],
		d = ax.GetVariable("$version");
	if (d) {
		d = d.split(" ")[1].split(",");
		version = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
	}
	return version;
});

// Add Silverlight detection
mejs.PluginDetector.addPlugin('silverlight','Silverlight Plug-In','application/x-silverlight-2','AgControl.AgControl', function (ax) {
	// Silverlight cannot report its version number to IE
	// but it does have a isVersionSupported function, so we have to loop through it to get a version number.
	// adapted from http://www.silverlightversion.com/
	var v = [0,0,0,0],
		loopMatch = function(ax, v, i, n) {
			while(ax.isVersionSupported(v[0]+ "."+ v[1] + "." + v[2] + "." + v[3])){
				v[i]+=n;
			}
			v[i] -= n;
		};
	loopMatch(ax, v, 0, 1);
	loopMatch(ax, v, 1, 1);
	loopMatch(ax, v, 2, 10000); // the third place in the version number is usually 5 digits (4.0.xxxxx)
	loopMatch(ax, v, 2, 1000);
	loopMatch(ax, v, 2, 100);
	loopMatch(ax, v, 2, 10);
	loopMatch(ax, v, 2, 1);
	loopMatch(ax, v, 3, 1);

	return v;
});
// add adobe acrobat
/*
PluginDetector.addPlugin('acrobat','Adobe Acrobat','application/pdf','AcroPDF.PDF', function (ax) {
	var version = [],
		d = ax.GetVersions().split(',')[0].split('=')[1].split('.');

	if (d) {
		version = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
	}
	return version;
});
*/
// necessary detection (fixes for <IE9)
mejs.MediaFeatures = {
	init: function() {
		var
			t = this,
			d = document,
			nav = mejs.PluginDetector.nav,
			ua = mejs.PluginDetector.ua.toLowerCase(),
			i,
			v,
			html5Elements = ['source','track','audio','video'];

		// detect browsers (only the ones that have some kind of quirk we need to work around)
		t.isiPad = (ua.match(/ipad/i) !== null);
		t.isiPhone = (ua.match(/iphone/i) !== null);
		t.isiOS = t.isiPhone || t.isiPad;
		t.isAndroid = (ua.match(/android/i) !== null);
		t.isBustedAndroid = (ua.match(/android 2\.[12]/) !== null);
		t.isBustedNativeHTTPS = (location.protocol === 'https:' && (ua.match(/android [12]\./) !== null || ua.match(/macintosh.* version.* safari/) !== null));
		t.isIE = (nav.appName.toLowerCase().indexOf("microsoft") != -1 || nav.appName.toLowerCase().match(/trident/gi) !== null);
		t.isChrome = (ua.match(/chrome/gi) !== null);
		t.isChromium = (ua.match(/chromium/gi) !== null);
		t.isFirefox = (ua.match(/firefox/gi) !== null);
		t.isWebkit = (ua.match(/webkit/gi) !== null);
		t.isGecko = (ua.match(/gecko/gi) !== null) && !t.isWebkit && !t.isIE;
		t.isOpera = (ua.match(/opera/gi) !== null);
		t.hasTouch = ('ontouchstart' in window); //  && window.ontouchstart != null); // this breaks iOS 7
		
		// borrowed from Modernizr
		t.svg = !! document.createElementNS &&
				!! document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect;

		// create HTML5 media elements for IE before 9, get a <video> element for fullscreen detection
		for (i=0; i<html5Elements.length; i++) {
			v = document.createElement(html5Elements[i]);
		}
		
		t.supportsMediaTag = (typeof v.canPlayType !== 'undefined' || t.isBustedAndroid);

		// Fix for IE9 on Windows 7N / Windows 7KN (Media Player not installer)
		try{
			v.canPlayType("video/mp4");
		}catch(e){
			t.supportsMediaTag = false;
		}

		// detect native JavaScript fullscreen (Safari/Firefox only, Chrome still fails)
		
		// iOS
		t.hasSemiNativeFullScreen = (typeof v.webkitEnterFullscreen !== 'undefined');
		
		// W3C
		t.hasNativeFullscreen = (typeof v.requestFullscreen !== 'undefined');
		
		// webkit/firefox/IE11+
		t.hasWebkitNativeFullScreen = (typeof v.webkitRequestFullScreen !== 'undefined');
		t.hasMozNativeFullScreen = (typeof v.mozRequestFullScreen !== 'undefined');
		t.hasMsNativeFullScreen = (typeof v.msRequestFullscreen !== 'undefined');
		
		t.hasTrueNativeFullScreen = (t.hasWebkitNativeFullScreen || t.hasMozNativeFullScreen || t.hasMsNativeFullScreen);
		t.nativeFullScreenEnabled = t.hasTrueNativeFullScreen;
		
		// Enabled?
		if (t.hasMozNativeFullScreen) {
			t.nativeFullScreenEnabled = document.mozFullScreenEnabled;
		} else if (t.hasMsNativeFullScreen) {
			t.nativeFullScreenEnabled = document.msFullscreenEnabled;		
		}
		
		if (t.isChrome) {
			t.hasSemiNativeFullScreen = false;
		}
		
		if (t.hasTrueNativeFullScreen) {
			
			t.fullScreenEventName = '';
			if (t.hasWebkitNativeFullScreen) { 
				t.fullScreenEventName = 'webkitfullscreenchange';
				
			} else if (t.hasMozNativeFullScreen) {
				t.fullScreenEventName = 'mozfullscreenchange';
				
			} else if (t.hasMsNativeFullScreen) {
				t.fullScreenEventName = 'MSFullscreenChange';
			}
			
			t.isFullScreen = function() {
				if (t.hasMozNativeFullScreen) {
					return d.mozFullScreen;
				
				} else if (t.hasWebkitNativeFullScreen) {
					return d.webkitIsFullScreen;
				
				} else if (t.hasMsNativeFullScreen) {
					return d.msFullscreenElement !== null;
				}
			}
					
			t.requestFullScreen = function(el) {
		
				if (t.hasWebkitNativeFullScreen) {
					el.webkitRequestFullScreen();
					
				} else if (t.hasMozNativeFullScreen) {
					el.mozRequestFullScreen();

				} else if (t.hasMsNativeFullScreen) {
					el.msRequestFullscreen();

				}
			}
			
			t.cancelFullScreen = function() {				
				if (t.hasWebkitNativeFullScreen) {
					document.webkitCancelFullScreen();
					
				} else if (t.hasMozNativeFullScreen) {
					document.mozCancelFullScreen();
					
				} else if (t.hasMsNativeFullScreen) {
					document.msExitFullscreen();
					
				}
			}	
			
		}
		
		
		// OS X 10.5 can't do this even if it says it can :(
		if (t.hasSemiNativeFullScreen && ua.match(/mac os x 10_5/i)) {
			t.hasNativeFullScreen = false;
			t.hasSemiNativeFullScreen = false;
		}
		
	}
};
mejs.MediaFeatures.init();

/*
extension methods to <video> or <audio> object to bring it into parity with PluginMediaElement (see below)
*/
mejs.HtmlMediaElement = {
	pluginType: 'native',
	isFullScreen: false,

	setCurrentTime: function (time) {
		this.currentTime = time;
	},

	setMuted: function (muted) {
		this.muted = muted;
	},

	setVolume: function (volume) {
		this.volume = volume;
	},

	// for parity with the plugin versions
	stop: function () {
		this.pause();
	},

	// This can be a url string
	// or an array [{src:'file.mp4',type:'video/mp4'},{src:'file.webm',type:'video/webm'}]
	setSrc: function (url) {
		
		// Fix for IE9 which can't set .src when there are <source> elements. Awesome, right?
		var 
			existingSources = this.getElementsByTagName('source');
		while (existingSources.length > 0){
			this.removeChild(existingSources[0]);
		}
	
		if (typeof url == 'string') {
			this.src = url;
		} else {
			var i, media;

			for (i=0; i<url.length; i++) {
				media = url[i];
				if (this.canPlayType(media.type)) {
					this.src = media.src;
					break;
				}
			}
		}
	},

	setVideoSize: function (width, height) {
		this.width = width;
		this.height = height;
	}
};

/*
Mimics the <video/audio> element by calling Flash's External Interface or Silverlights [ScriptableMember]
*/
mejs.PluginMediaElement = function (pluginid, pluginType, mediaUrl) {
	this.id = pluginid;
	this.pluginType = pluginType;
	this.src = mediaUrl;
	this.events = {};
	this.attributes = {};
};

// JavaScript values and ExternalInterface methods that match HTML5 video properties methods
// http://www.adobe.com/livedocs/flash/9.0/ActionScriptLangRefV3/fl/video/FLVPlayback.html
// http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html
mejs.PluginMediaElement.prototype = {

	// special
	pluginElement: null,
	pluginType: '',
	isFullScreen: false,

	// not implemented :(
	playbackRate: -1,
	defaultPlaybackRate: -1,
	seekable: [],
	played: [],

	// HTML5 read-only properties
	paused: true,
	ended: false,
	seeking: false,
	duration: 0,
	error: null,
	tagName: '',

	// HTML5 get/set properties, but only set (updated by event handlers)
	muted: false,
	volume: 1,
	currentTime: 0,

	// HTML5 methods
	play: function () {
		if (this.pluginApi != null) {
			if (this.pluginType == 'youtube' || this.pluginType == 'vimeo') {
				this.pluginApi.playVideo();
			} else {
				this.pluginApi.playMedia();
			}
			this.paused = false;
		}
	},
	load: function () {
		if (this.pluginApi != null) {
			if (this.pluginType == 'youtube' || this.pluginType == 'vimeo') {
			} else {
				this.pluginApi.loadMedia();
			}
			
			this.paused = false;
		}
	},
	pause: function () {
		if (this.pluginApi != null) {
			if (this.pluginType == 'youtube' || this.pluginType == 'vimeo') {
				this.pluginApi.pauseVideo();
			} else {
				this.pluginApi.pauseMedia();
			}			
			
			
			this.paused = true;
		}
	},
	stop: function () {
		if (this.pluginApi != null) {
			if (this.pluginType == 'youtube' || this.pluginType == 'vimeo') {
				this.pluginApi.stopVideo();
			} else {
				this.pluginApi.stopMedia();
			}	
			this.paused = true;
		}
	},
	canPlayType: function(type) {
		var i,
			j,
			pluginInfo,
			pluginVersions = mejs.plugins[this.pluginType];

		for (i=0; i<pluginVersions.length; i++) {
			pluginInfo = pluginVersions[i];

			// test if user has the correct plugin version
			if (mejs.PluginDetector.hasPluginVersion(this.pluginType, pluginInfo.version)) {

				// test for plugin playback types
				for (j=0; j<pluginInfo.types.length; j++) {
					// find plugin that can play the type
					if (type == pluginInfo.types[j]) {
						return 'probably';
					}
				}
			}
		}

		return '';
	},
	
	positionFullscreenButton: function(x,y,visibleAndAbove) {
		if (this.pluginApi != null && this.pluginApi.positionFullscreenButton) {
			this.pluginApi.positionFullscreenButton(Math.floor(x),Math.floor(y),visibleAndAbove);
		}
	},
	
	hideFullscreenButton: function() {
		if (this.pluginApi != null && this.pluginApi.hideFullscreenButton) {
			this.pluginApi.hideFullscreenButton();
		}		
	},	
	

	// custom methods since not all JavaScript implementations support get/set

	// This can be a url string
	// or an array [{src:'file.mp4',type:'video/mp4'},{src:'file.webm',type:'video/webm'}]
	setSrc: function (url) {
		if (typeof url == 'string') {
			this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(url));
			this.src = mejs.Utility.absolutizeUrl(url);
		} else {
			var i, media;

			for (i=0; i<url.length; i++) {
				media = url[i];
				if (this.canPlayType(media.type)) {
					this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(media.src));
					this.src = mejs.Utility.absolutizeUrl(url);
					break;
				}
			}
		}

	},
	setCurrentTime: function (time) {
		if (this.pluginApi != null) {
			if (this.pluginType == 'youtube' || this.pluginType == 'vimeo') {
				this.pluginApi.seekTo(time);
			} else {
				this.pluginApi.setCurrentTime(time);
			}				
			
			
			
			this.currentTime = time;
		}
	},
	setVolume: function (volume) {
		if (this.pluginApi != null) {
			// same on YouTube and MEjs
			if (this.pluginType == 'youtube') {
				this.pluginApi.setVolume(volume * 100);
			} else {
				this.pluginApi.setVolume(volume);
			}
			this.volume = volume;
		}
	},
	setMuted: function (muted) {
		if (this.pluginApi != null) {
			if (this.pluginType == 'youtube') {
				if (muted) {
					this.pluginApi.mute();
				} else {
					this.pluginApi.unMute();
				}
				this.muted = muted;
				this.dispatchEvent('volumechange');
			} else {
				this.pluginApi.setMuted(muted);
			}
			this.muted = muted;
		}
	},

	// additional non-HTML5 methods
	setVideoSize: function (width, height) {
		
		//if (this.pluginType == 'flash' || this.pluginType == 'silverlight') {
			if (this.pluginElement && this.pluginElement.style) {
				this.pluginElement.style.width = width + 'px';
				this.pluginElement.style.height = height + 'px';
			}
			if (this.pluginApi != null && this.pluginApi.setVideoSize) {
				this.pluginApi.setVideoSize(width, height);
			}
		//}
	},

	setFullscreen: function (fullscreen) {
		if (this.pluginApi != null && this.pluginApi.setFullscreen) {
			this.pluginApi.setFullscreen(fullscreen);
		}
	},
	
	enterFullScreen: function() {
		if (this.pluginApi != null && this.pluginApi.setFullscreen) {
			this.setFullscreen(true);
		}		
		
	},
	
	exitFullScreen: function() {
		if (this.pluginApi != null && this.pluginApi.setFullscreen) {
			this.setFullscreen(false);
		}
	},	

	// start: fake events
	addEventListener: function (eventName, callback, bubble) {
		this.events[eventName] = this.events[eventName] || [];
		this.events[eventName].push(callback);
	},
	removeEventListener: function (eventName, callback) {
		if (!eventName) { this.events = {}; return true; }
		var callbacks = this.events[eventName];
		if (!callbacks) return true;
		if (!callback) { this.events[eventName] = []; return true; }
		for (var i = 0; i < callbacks.length; i++) {
			if (callbacks[i] === callback) {
				this.events[eventName].splice(i, 1);
				return true;
			}
		}
		return false;
	},	
	dispatchEvent: function (eventName) {
		var i,
			args,
			callbacks = this.events[eventName];

		if (callbacks) {
			args = Array.prototype.slice.call(arguments, 1);
			for (i = 0; i < callbacks.length; i++) {
				callbacks[i].apply(this, args);
			}
		}
	},
	// end: fake events
	
	// fake DOM attribute methods
	hasAttribute: function(name){
		return (name in this.attributes);  
	},
	removeAttribute: function(name){
		delete this.attributes[name];
	},
	getAttribute: function(name){
		if (this.hasAttribute(name)) {
			return this.attributes[name];
		}
		return '';
	},
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},

	remove: function() {
		mejs.Utility.removeSwf(this.pluginElement.id);
		mejs.MediaPluginBridge.unregisterPluginElement(this.pluginElement.id);
	}
};

// Handles calls from Flash/Silverlight and reports them as native <video/audio> events and properties
mejs.MediaPluginBridge = {

	pluginMediaElements:{},
	htmlMediaElements:{},

	registerPluginElement: function (id, pluginMediaElement, htmlMediaElement) {
		this.pluginMediaElements[id] = pluginMediaElement;
		this.htmlMediaElements[id] = htmlMediaElement;
	},

	unregisterPluginElement: function (id) {
		delete this.pluginMediaElements[id];
		delete this.htmlMediaElements[id];
	},

	// when Flash/Silverlight is ready, it calls out to this method
	initPlugin: function (id) {

		var pluginMediaElement = this.pluginMediaElements[id],
			htmlMediaElement = this.htmlMediaElements[id];

		if (pluginMediaElement) {
			// find the javascript bridge
			switch (pluginMediaElement.pluginType) {
				case "flash":
					pluginMediaElement.pluginElement = pluginMediaElement.pluginApi = document.getElementById(id);
					break;
				case "silverlight":
					pluginMediaElement.pluginElement = document.getElementById(pluginMediaElement.id);
					pluginMediaElement.pluginApi = pluginMediaElement.pluginElement.Content.MediaElementJS;
					break;
			}
	
			if (pluginMediaElement.pluginApi != null && pluginMediaElement.success) {
				pluginMediaElement.success(pluginMediaElement, htmlMediaElement);
			}
		}
	},

	// receives events from Flash/Silverlight and sends them out as HTML5 media events
	// http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html
	fireEvent: function (id, eventName, values) {

		var
			e,
			i,
			bufferedTime,
			pluginMediaElement = this.pluginMediaElements[id];

		if(!pluginMediaElement){
            return;
        }
        
		// fake event object to mimic real HTML media event.
		e = {
			type: eventName,
			target: pluginMediaElement
		};

		// attach all values to element and event object
		for (i in values) {
			pluginMediaElement[i] = values[i];
			e[i] = values[i];
		}

		// fake the newer W3C buffered TimeRange (loaded and total have been removed)
		bufferedTime = values.bufferedTime || 0;

		e.target.buffered = e.buffered = {
			start: function(index) {
				return 0;
			},
			end: function (index) {
				return bufferedTime;
			},
			length: 1
		};

		pluginMediaElement.dispatchEvent(e.type, e);
	}
};

/*
Default options
*/
mejs.MediaElementDefaults = {
	// allows testing on HTML5, flash, silverlight
	// auto: attempts to detect what the browser can do
	// auto_plugin: prefer plugins and then attempt native HTML5
	// native: forces HTML5 playback
	// shim: disallows HTML5, will attempt either Flash or Silverlight
	// none: forces fallback view
	mode: 'auto',
	// remove or reorder to change plugin priority and availability
	plugins: ['flash','silverlight','youtube','vimeo'],
	// shows debug errors on screen
	enablePluginDebug: false,
	// use plugin for browsers that have trouble with Basic Authentication on HTTPS sites
	httpsBasicAuthSite: false,
	// overrides the type specified, useful for dynamic instantiation
	type: '',
	// path to Flash and Silverlight plugins
	pluginPath: mejs.Utility.getScriptPath(['mediaelement.js','mediaelement.min.js','mediaelement-and-player.js','mediaelement-and-player.min.js']),
	// name of flash file
	flashName: 'flashmediaelement.swf',
	// streamer for RTMP streaming
	flashStreamer: '',
	// turns on the smoothing filter in Flash
	enablePluginSmoothing: false,
	// enabled pseudo-streaming (seek) on .mp4 files
	enablePseudoStreaming: false,
	// start query parameter sent to server for pseudo-streaming
	pseudoStreamingStartQueryParam: 'start',
	// name of silverlight file
	silverlightName: 'silverlightmediaelement.xap',
	// default if the <video width> is not specified
	defaultVideoWidth: 480,
	// default if the <video height> is not specified
	defaultVideoHeight: 270,
	// overrides <video width>
	pluginWidth: -1,
	// overrides <video height>
	pluginHeight: -1,
	// additional plugin variables in 'key=value' form
	pluginVars: [],	
	// rate in milliseconds for Flash and Silverlight to fire the timeupdate event
	// larger number is less accurate, but less strain on plugin->JavaScript bridge
	timerRate: 250,
	// initial volume for player
	startVolume: 0.8,
	success: function () { },
	error: function () { }
};

/*
Determines if a browser supports the <video> or <audio> element
and returns either the native element or a Flash/Silverlight version that
mimics HTML5 MediaElement
*/
mejs.MediaElement = function (el, o) {
	return mejs.HtmlMediaElementShim.create(el,o);
};

mejs.HtmlMediaElementShim = {

	create: function(el, o) {
		var
			options = mejs.MediaElementDefaults,
			htmlMediaElement = (typeof(el) == 'string') ? document.getElementById(el) : el,
			tagName = htmlMediaElement.tagName.toLowerCase(),
			isMediaTag = (tagName === 'audio' || tagName === 'video'),
			src = (isMediaTag) ? htmlMediaElement.getAttribute('src') : htmlMediaElement.getAttribute('href'),
			poster = htmlMediaElement.getAttribute('poster'),
			autoplay =  htmlMediaElement.getAttribute('autoplay'),
			preload =  htmlMediaElement.getAttribute('preload'),
			controls =  htmlMediaElement.getAttribute('controls'),
			playback,
			prop;

		// extend options
		for (prop in o) {
			options[prop] = o[prop];
		}

		// clean up attributes
		src = 		(typeof src == 'undefined' 	|| src === null || src == '') ? null : src;		
		poster =	(typeof poster == 'undefined' 	|| poster === null) ? '' : poster;
		preload = 	(typeof preload == 'undefined' 	|| preload === null || preload === 'false') ? 'none' : preload;
		autoplay = 	!(typeof autoplay == 'undefined' || autoplay === null || autoplay === 'false');
		controls = 	!(typeof controls == 'undefined' || controls === null || controls === 'false');

		// test for HTML5 and plugin capabilities
		playback = this.determinePlayback(htmlMediaElement, options, mejs.MediaFeatures.supportsMediaTag, isMediaTag, src);
		playback.url = (playback.url !== null) ? mejs.Utility.absolutizeUrl(playback.url) : '';

		if (playback.method == 'native') {
			// second fix for android
			if (mejs.MediaFeatures.isBustedAndroid) {
				htmlMediaElement.src = playback.url;
				htmlMediaElement.addEventListener('click', function() {
					htmlMediaElement.play();
				}, false);
			}
		
			// add methods to native HTMLMediaElement
			return this.updateNative(playback, options, autoplay, preload);
		} else if (playback.method !== '') {
			// create plugin to mimic HTMLMediaElement
			
			return this.createPlugin( playback,  options, poster, autoplay, preload, controls);
		} else {
			// boo, no HTML5, no Flash, no Silverlight.
			this.createErrorMessage( playback, options, poster );
			
			return this;
		}
	},
	
	determinePlayback: function(htmlMediaElement, options, supportsMediaTag, isMediaTag, src) {
		var
			mediaFiles = [],
			i,
			j,
			k,
			l,
			n,
			type,
			result = { method: '', url: '', htmlMediaElement: htmlMediaElement, isVideo: (htmlMediaElement.tagName.toLowerCase() != 'audio')},
			pluginName,
			pluginVersions,
			pluginInfo,
			dummy,
			media;
			
		// STEP 1: Get URL and type from <video src> or <source src>

		// supplied type overrides <video type> and <source type>
		if (typeof options.type != 'undefined' && options.type !== '') {
			
			// accept either string or array of types
			if (typeof options.type == 'string') {
				mediaFiles.push({type:options.type, url:src});
			} else {
				
				for (i=0; i<options.type.length; i++) {
					mediaFiles.push({type:options.type[i], url:src});
				}
			}

		// test for src attribute first
		} else if (src !== null) {
			type = this.formatType(src, htmlMediaElement.getAttribute('type'));
			mediaFiles.push({type:type, url:src});

		// then test for <source> elements
		} else {
			// test <source> types to see if they are usable
			for (i = 0; i < htmlMediaElement.childNodes.length; i++) {
				n = htmlMediaElement.childNodes[i];
				if (n.nodeType == 1 && n.tagName.toLowerCase() == 'source') {
					src = n.getAttribute('src');
					type = this.formatType(src, n.getAttribute('type'));
					media = n.getAttribute('media');

					if (!media || !window.matchMedia || (window.matchMedia && window.matchMedia(media).matches)) {
						mediaFiles.push({type:type, url:src});
					}
				}
			}
		}
		
		// in the case of dynamicly created players
		// check for audio types
		if (!isMediaTag && mediaFiles.length > 0 && mediaFiles[0].url !== null && this.getTypeFromFile(mediaFiles[0].url).indexOf('audio') > -1) {
			result.isVideo = false;
		}
		

		// STEP 2: Test for playback method
		
		// special case for Android which sadly doesn't implement the canPlayType function (always returns '')
		if (mejs.MediaFeatures.isBustedAndroid) {
			htmlMediaElement.canPlayType = function(type) {
				return (type.match(/video\/(mp4|m4v)/gi) !== null) ? 'maybe' : '';
			};
		}		
		
		// special case for Chromium to specify natively supported video codecs (i.e. WebM and Theora) 
		if (mejs.MediaFeatures.isChromium) { 
			htmlMediaElement.canPlayType = function(type) { 
				return (type.match(/video\/(webm|ogv|ogg)/gi) !== null) ? 'maybe' : ''; 
			}; 
		}

		// test for native playback first
		if (supportsMediaTag && (options.mode === 'auto' || options.mode === 'auto_plugin' || options.mode === 'native')  && !(mejs.MediaFeatures.isBustedNativeHTTPS && options.httpsBasicAuthSite === true)) {
						
			if (!isMediaTag) {

				// create a real HTML5 Media Element 
				dummy = document.createElement( result.isVideo ? 'video' : 'audio');			
				htmlMediaElement.parentNode.insertBefore(dummy, htmlMediaElement);
				htmlMediaElement.style.display = 'none';
				
				// use this one from now on
				result.htmlMediaElement = htmlMediaElement = dummy;
			}
				
			for (i=0; i<mediaFiles.length; i++) {
				// normal check
				if (mediaFiles[i].type == "video/m3u8" || htmlMediaElement.canPlayType(mediaFiles[i].type).replace(/no/, '') !== ''
					// special case for Mac/Safari 5.0.3 which answers '' to canPlayType('audio/mp3') but 'maybe' to canPlayType('audio/mpeg')
					|| htmlMediaElement.canPlayType(mediaFiles[i].type.replace(/mp3/,'mpeg')).replace(/no/, '') !== ''
					// special case for m4a supported by detecting mp4 support
					|| htmlMediaElement.canPlayType(mediaFiles[i].type.replace(/m4a/,'mp4')).replace(/no/, '') !== '') {
					result.method = 'native';
					result.url = mediaFiles[i].url;
					break;
				}
			}			
			
			if (result.method === 'native') {
				if (result.url !== null) {
					htmlMediaElement.src = result.url;
				}
			
				// if `auto_plugin` mode, then cache the native result but try plugins.
				if (options.mode !== 'auto_plugin') {
					return result;
				}
			}
		}

		// if native playback didn't work, then test plugins
		if (options.mode === 'auto' || options.mode === 'auto_plugin' || options.mode === 'shim') {
			for (i=0; i<mediaFiles.length; i++) {
				type = mediaFiles[i].type;

				// test all plugins in order of preference [silverlight, flash]
				for (j=0; j<options.plugins.length; j++) {

					pluginName = options.plugins[j];
			
					// test version of plugin (for future features)
					pluginVersions = mejs.plugins[pluginName];				
					
					for (k=0; k<pluginVersions.length; k++) {
						pluginInfo = pluginVersions[k];
					
						// test if user has the correct plugin version
						
						// for youtube/vimeo
						if (pluginInfo.version == null || 
							
							mejs.PluginDetector.hasPluginVersion(pluginName, pluginInfo.version)) {

							// test for plugin playback types
							for (l=0; l<pluginInfo.types.length; l++) {
								// find plugin that can play the type
								if (type == pluginInfo.types[l]) {
									result.method = pluginName;
									result.url = mediaFiles[i].url;
									return result;
								}
							}
						}
					}
				}
			}
		}
		
		// at this point, being in 'auto_plugin' mode implies that we tried plugins but failed.
		// if we have native support then return that.
		if (options.mode === 'auto_plugin' && result.method === 'native') {
			return result;
		}

		// what if there's nothing to play? just grab the first available
		if (result.method === '' && mediaFiles.length > 0) {
			result.url = mediaFiles[0].url;
		}

		return result;
	},

	formatType: function(url, type) {
		var ext;

		// if no type is supplied, fake it with the extension
		if (url && !type) {		
			return this.getTypeFromFile(url);
		} else {
			// only return the mime part of the type in case the attribute contains the codec
			// see http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#the-source-element
			// `video/mp4; codecs="avc1.42E01E, mp4a.40.2"` becomes `video/mp4`
			
			if (type && ~type.indexOf(';')) {
				return type.substr(0, type.indexOf(';')); 
			} else {
				return type;
			}
		}
	},
	
	getTypeFromFile: function(url) {
		url = url.split('?')[0];
		var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
		return (/(mp4|m4v|ogg|ogv|m3u8|webm|webmv|flv|wmv|mpeg|mov)/gi.test(ext) ? 'video' : 'audio') + '/' + this.getTypeFromExtension(ext);
	},
	
	getTypeFromExtension: function(ext) {
		
		switch (ext) {
			case 'mp4':
			case 'm4v':
			case 'm4a':
				return 'mp4';
			case 'webm':
			case 'webma':
			case 'webmv':	
				return 'webm';
			case 'ogg':
			case 'oga':
			case 'ogv':	
				return 'ogg';
			default:
				return ext;
		}
	},

	createErrorMessage: function(playback, options, poster) {
		var 
			htmlMediaElement = playback.htmlMediaElement,
			errorContainer = document.createElement('div');
			
		errorContainer.className = 'me-cannotplay';

		try {
			errorContainer.style.width = htmlMediaElement.width + 'px';
			errorContainer.style.height = htmlMediaElement.height + 'px';
		} catch (e) {}

    if (options.customError) {
      errorContainer.innerHTML = options.customError;
    } else {
      errorContainer.innerHTML = (poster !== '') ?
        '<a href="' + playback.url + '"><img src="' + poster + '" width="100%" height="100%" /></a>' :
        '<a href="' + playback.url + '"><span>' + mejs.i18n.t('Download File') + '</span></a>';
    }

		htmlMediaElement.parentNode.insertBefore(errorContainer, htmlMediaElement);
		htmlMediaElement.style.display = 'none';

		options.error(htmlMediaElement);
	},

	createPlugin:function(playback, options, poster, autoplay, preload, controls) {
		var 
			htmlMediaElement = playback.htmlMediaElement,
			width = 1,
			height = 1,
			pluginid = 'me_' + playback.method + '_' + (mejs.meIndex++),
			pluginMediaElement = new mejs.PluginMediaElement(pluginid, playback.method, playback.url),
			container = document.createElement('div'),
			specialIEContainer,
			node,
			initVars;

		// copy tagName from html media element
		pluginMediaElement.tagName = htmlMediaElement.tagName

		// copy attributes from html media element to plugin media element
		for (var i = 0; i < htmlMediaElement.attributes.length; i++) {
			var attribute = htmlMediaElement.attributes[i];
			if (attribute.specified == true) {
				pluginMediaElement.setAttribute(attribute.name, attribute.value);
			}
		}

		// check for placement inside a <p> tag (sometimes WYSIWYG editors do this)
		node = htmlMediaElement.parentNode;
		while (node !== null && node.tagName.toLowerCase() !== 'body' && node.parentNode != null) {
			if (node.parentNode.tagName.toLowerCase() === 'p') {
				node.parentNode.parentNode.insertBefore(node, node.parentNode);
				break;
			}
			node = node.parentNode;
		}

		if (playback.isVideo) {
			width = (options.pluginWidth > 0) ? options.pluginWidth : (options.videoWidth > 0) ? options.videoWidth : (htmlMediaElement.getAttribute('width') !== null) ? htmlMediaElement.getAttribute('width') : options.defaultVideoWidth;
			height = (options.pluginHeight > 0) ? options.pluginHeight : (options.videoHeight > 0) ? options.videoHeight : (htmlMediaElement.getAttribute('height') !== null) ? htmlMediaElement.getAttribute('height') : options.defaultVideoHeight;
		
			// in case of '%' make sure it's encoded
			width = mejs.Utility.encodeUrl(width);
			height = mejs.Utility.encodeUrl(height);
		
		} else {
			if (options.enablePluginDebug) {
				width = 320;
				height = 240;
			}
		}

		// register plugin
		pluginMediaElement.success = options.success;
		mejs.MediaPluginBridge.registerPluginElement(pluginid, pluginMediaElement, htmlMediaElement);

		// add container (must be added to DOM before inserting HTML for IE)
		container.className = 'me-plugin';
		container.id = pluginid + '_container';
		
		if (playback.isVideo) {
				htmlMediaElement.parentNode.insertBefore(container, htmlMediaElement);
		} else {
				document.body.insertBefore(container, document.body.childNodes[0]);
		}

		// flash/silverlight vars
		initVars = [
			'id=' + pluginid,
			'isvideo=' + ((playback.isVideo) ? "true" : "false"),
			'autoplay=' + ((autoplay) ? "true" : "false"),
			'preload=' + preload,
			'width=' + width,
			'startvolume=' + options.startVolume,
			'timerrate=' + options.timerRate,
			'flashstreamer=' + options.flashStreamer,
			'height=' + height,
      'pseudostreamstart=' + options.pseudoStreamingStartQueryParam];

		if (playback.url !== null) {
			if (playback.method == 'flash') {
				initVars.push('file=' + mejs.Utility.encodeUrl(playback.url));
			} else {
				initVars.push('file=' + playback.url);
			}
		}
		if (options.enablePluginDebug) {
			initVars.push('debug=true');
		}
		if (options.enablePluginSmoothing) {
			initVars.push('smoothing=true');
		}
    if (options.enablePseudoStreaming) {
      initVars.push('pseudostreaming=true');
    }
		if (controls) {
			initVars.push('controls=true'); // shows controls in the plugin if desired
		}
		if (options.pluginVars) {
			initVars = initVars.concat(options.pluginVars);
		}		

		switch (playback.method) {
			case 'silverlight':
				container.innerHTML =
'<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="' + pluginid + '" name="' + pluginid + '" width="' + width + '" height="' + height + '" class="mejs-shim">' +
'<param name="initParams" value="' + initVars.join(',') + '" />' +
'<param name="windowless" value="true" />' +
'<param name="background" value="black" />' +
'<param name="minRuntimeVersion" value="3.0.0.0" />' +
'<param name="autoUpgrade" value="true" />' +
'<param name="source" value="' + options.pluginPath + options.silverlightName + '" />' +
'</object>';
					break;

			case 'flash':

				if (mejs.MediaFeatures.isIE) {
					specialIEContainer = document.createElement('div');
					container.appendChild(specialIEContainer);
					specialIEContainer.outerHTML =
'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" ' +
'id="' + pluginid + '" width="' + width + '" height="' + height + '" class="mejs-shim">' +
'<param name="movie" value="' + options.pluginPath + options.flashName + '?x=' + (new Date()) + '" />' +
'<param name="flashvars" value="' + initVars.join('&amp;') + '" />' +
'<param name="quality" value="high" />' +
'<param name="bgcolor" value="#000000" />' +
'<param name="wmode" value="transparent" />' +
'<param name="allowScriptAccess" value="always" />' +
'<param name="allowFullScreen" value="true" />' +
'<param name="scale" value="default" />' + 
'</object>';

				} else {

					container.innerHTML =
'<embed id="' + pluginid + '" name="' + pluginid + '" ' +
'play="true" ' +
'loop="false" ' +
'quality="high" ' +
'bgcolor="#000000" ' +
'wmode="transparent" ' +
'allowScriptAccess="always" ' +
'allowFullScreen="true" ' +
'type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" ' +
'src="' + options.pluginPath + options.flashName + '" ' +
'flashvars="' + initVars.join('&') + '" ' +
'width="' + width + '" ' +
'height="' + height + '" ' +
'scale="default"' + 
'class="mejs-shim"></embed>';
				}
				break;
			
			case 'youtube':
			
				
				var videoId;
				// youtu.be url from share button
				if (playback.url.lastIndexOf("youtu.be") != -1) {
					videoId = playback.url.substr(playback.url.lastIndexOf('/')+1);
					if (videoId.indexOf('?') != -1) {
						videoId = videoId.substr(0, videoId.indexOf('?'));
					}
				}
				else {
					videoId = playback.url.substr(playback.url.lastIndexOf('=')+1);
				}
				youtubeSettings = {
						container: container,
						containerId: container.id,
						pluginMediaElement: pluginMediaElement,
						pluginId: pluginid,
						videoId: videoId,
						height: height,
						width: width	
					};				
				
				if (mejs.PluginDetector.hasPluginVersion('flash', [10,0,0]) ) {
					mejs.YouTubeApi.createFlash(youtubeSettings);
				} else {
					mejs.YouTubeApi.enqueueIframe(youtubeSettings);		
				}
				
				break;
			
			// DEMO Code. Does NOT work.
			case 'vimeo':
				var player_id = pluginid + "_player";
				pluginMediaElement.vimeoid = playback.url.substr(playback.url.lastIndexOf('/')+1);
				
				container.innerHTML ='<iframe src="//player.vimeo.com/video/' + pluginMediaElement.vimeoid + '?api=1&portrait=0&byline=0&title=0&player_id=' + player_id + '" width="' + width +'" height="' + height +'" frameborder="0" class="mejs-shim" id="' + player_id + '" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
				if (typeof($f) == 'function') { // froogaloop available
					var player = $f(container.childNodes[0]);
					player.addEvent('ready', function() {
						$.extend( player, {
							playVideo: function() {
								player.api( 'play' );
							}, 
							stopVideo: function() {
								player.api( 'unload' );
							}, 
							pauseVideo: function() {
								player.api( 'pause' );
							}, 
							seekTo: function( seconds ) {
								player.api( 'seekTo', seconds );
							}, 
							setVolume: function( volume ) {
								player.api( 'setVolume', volume );
							}, 
							setMuted: function( muted ) {
								if( muted ) {
									player.lastVolume = player.api( 'getVolume' );
									player.api( 'setVolume', 0 );
								} else {
									player.api( 'setVolume', player.lastVolume );
									delete player.lastVolume;
								}
							}
						});

						function createEvent(player, pluginMediaElement, eventName, e) {
							var obj = {
								type: eventName,
								target: pluginMediaElement
							};
							if (eventName == 'timeupdate') {
								pluginMediaElement.currentTime = obj.currentTime = e.seconds;
								pluginMediaElement.duration = obj.duration = e.duration;
							}
							pluginMediaElement.dispatchEvent(obj.type, obj);
						}

						player.addEvent('play', function() {
							createEvent(player, pluginMediaElement, 'play');
							createEvent(player, pluginMediaElement, 'playing');
						});

						player.addEvent('pause', function() {
							createEvent(player, pluginMediaElement, 'pause');
						});

						player.addEvent('finish', function() {
							createEvent(player, pluginMediaElement, 'ended');
						});

						player.addEvent('playProgress', function(e) {
							createEvent(player, pluginMediaElement, 'timeupdate', e);
						});

						pluginMediaElement.pluginElement = container;
						pluginMediaElement.pluginApi = player;

						// init mejs
						mejs.MediaPluginBridge.initPlugin(pluginid);
					});
				}
				else {
					console.warn("You need to include froogaloop for vimeo to work");
				}
				break;			
		}
		// hide original element
		htmlMediaElement.style.display = 'none';
		// prevent browser from autoplaying when using a plugin
		htmlMediaElement.removeAttribute('autoplay');

		// FYI: options.success will be fired by the MediaPluginBridge
		
		return pluginMediaElement;
	},

	updateNative: function(playback, options, autoplay, preload) {
		
		var htmlMediaElement = playback.htmlMediaElement,
			m;
		
		
		// add methods to video object to bring it into parity with Flash Object
		for (m in mejs.HtmlMediaElement) {
			htmlMediaElement[m] = mejs.HtmlMediaElement[m];
		}

		/*
		Chrome now supports preload="none"
		if (mejs.MediaFeatures.isChrome) {
		
			// special case to enforce preload attribute (Chrome doesn't respect this)
			if (preload === 'none' && !autoplay) {
			
				// forces the browser to stop loading (note: fails in IE9)
				htmlMediaElement.src = '';
				htmlMediaElement.load();
				htmlMediaElement.canceledPreload = true;

				htmlMediaElement.addEventListener('play',function() {
					if (htmlMediaElement.canceledPreload) {
						htmlMediaElement.src = playback.url;
						htmlMediaElement.load();
						htmlMediaElement.play();
						htmlMediaElement.canceledPreload = false;
					}
				}, false);
			// for some reason Chrome forgets how to autoplay sometimes.
			} else if (autoplay) {
				htmlMediaElement.load();
				htmlMediaElement.play();
			}
		}
		*/

		// fire success code
		options.success(htmlMediaElement, htmlMediaElement);
		
		return htmlMediaElement;
	}
};

/*
 - test on IE (object vs. embed)
 - determine when to use iframe (Firefox, Safari, Mobile) vs. Flash (Chrome, IE)
 - fullscreen?
*/

// YouTube Flash and Iframe API
mejs.YouTubeApi = {
	isIframeStarted: false,
	isIframeLoaded: false,
	loadIframeApi: function() {
		if (!this.isIframeStarted) {
			var tag = document.createElement('script');
			tag.src = "//www.youtube.com/player_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			this.isIframeStarted = true;
		}
	},
	iframeQueue: [],
	enqueueIframe: function(yt) {
		
		if (this.isLoaded) {
			this.createIframe(yt);
		} else {
			this.loadIframeApi();
			this.iframeQueue.push(yt);
		}
	},
	createIframe: function(settings) {
		
		var
		pluginMediaElement = settings.pluginMediaElement,	
		player = new YT.Player(settings.containerId, {
			height: settings.height,
			width: settings.width,
			videoId: settings.videoId,
			playerVars: {controls:0},
			events: {
				'onReady': function() {
					
					// hook up iframe object to MEjs
					settings.pluginMediaElement.pluginApi = player;
					
					// init mejs
					mejs.MediaPluginBridge.initPlugin(settings.pluginId);
					
					// create timer
					setInterval(function() {
						mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'timeupdate');
					}, 250);					
				},
				'onStateChange': function(e) {
					
					mejs.YouTubeApi.handleStateChange(e.data, player, pluginMediaElement);
					
				}
			}
		});
	},
	
	createEvent: function (player, pluginMediaElement, eventName) {
		var obj = {
			type: eventName,
			target: pluginMediaElement
		};

		if (player && player.getDuration) {
			
			// time 
			pluginMediaElement.currentTime = obj.currentTime = player.getCurrentTime();
			pluginMediaElement.duration = obj.duration = player.getDuration();
			
			// state
			obj.paused = pluginMediaElement.paused;
			obj.ended = pluginMediaElement.ended;			
			
			// sound
			obj.muted = player.isMuted();
			obj.volume = player.getVolume() / 100;
			
			// progress
			obj.bytesTotal = player.getVideoBytesTotal();
			obj.bufferedBytes = player.getVideoBytesLoaded();
			
			// fake the W3C buffered TimeRange
			var bufferedTime = obj.bufferedBytes / obj.bytesTotal * obj.duration;
			
			obj.target.buffered = obj.buffered = {
				start: function(index) {
					return 0;
				},
				end: function (index) {
					return bufferedTime;
				},
				length: 1
			};

		}
		
		// send event up the chain
		pluginMediaElement.dispatchEvent(obj.type, obj);
	},	
	
	iFrameReady: function() {
		
		this.isLoaded = true;
		this.isIframeLoaded = true;
		
		while (this.iframeQueue.length > 0) {
			var settings = this.iframeQueue.pop();
			this.createIframe(settings);
		}	
	},
	
	// FLASH!
	flashPlayers: {},
	createFlash: function(settings) {
		
		this.flashPlayers[settings.pluginId] = settings;
		
		/*
		settings.container.innerHTML =
			'<object type="application/x-shockwave-flash" id="' + settings.pluginId + '" data="//www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid=' + settings.pluginId  + '&amp;version=3&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0" ' +
				'width="' + settings.width + '" height="' + settings.height + '" style="visibility: visible; " class="mejs-shim">' +
				'<param name="allowScriptAccess" value="always">' +
				'<param name="wmode" value="transparent">' +
			'</object>';
		*/

		var specialIEContainer,
			youtubeUrl = '//www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid=' + settings.pluginId  + '&amp;version=3&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0';
			
		if (mejs.MediaFeatures.isIE) {
			
			specialIEContainer = document.createElement('div');
			settings.container.appendChild(specialIEContainer);
			specialIEContainer.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" ' +
'id="' + settings.pluginId + '" width="' + settings.width + '" height="' + settings.height + '" class="mejs-shim">' +
	'<param name="movie" value="' + youtubeUrl + '" />' +
	'<param name="wmode" value="transparent" />' +
	'<param name="allowScriptAccess" value="always" />' +
	'<param name="allowFullScreen" value="true" />' +
'</object>';
		} else {
		settings.container.innerHTML =
			'<object type="application/x-shockwave-flash" id="' + settings.pluginId + '" data="' + youtubeUrl + '" ' +
				'width="' + settings.width + '" height="' + settings.height + '" style="visibility: visible; " class="mejs-shim">' +
				'<param name="allowScriptAccess" value="always">' +
				'<param name="wmode" value="transparent">' +
			'</object>';
		}		
		
	},
	
	flashReady: function(id) {
		var
			settings = this.flashPlayers[id],
			player = document.getElementById(id),
			pluginMediaElement = settings.pluginMediaElement;
		
		// hook up and return to MediaELementPlayer.success	
		pluginMediaElement.pluginApi = 
		pluginMediaElement.pluginElement = player;
		mejs.MediaPluginBridge.initPlugin(id);
		
		// load the youtube video
		player.cueVideoById(settings.videoId);
		
		var callbackName = settings.containerId + '_callback';
		
		window[callbackName] = function(e) {
			mejs.YouTubeApi.handleStateChange(e, player, pluginMediaElement);
		}
		
		player.addEventListener('onStateChange', callbackName);
		
		setInterval(function() {
			mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'timeupdate');
		}, 250);
		
		mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'canplay');
	},
	
	handleStateChange: function(youTubeState, player, pluginMediaElement) {
		switch (youTubeState) {
			case -1: // not started
				pluginMediaElement.paused = true;
				pluginMediaElement.ended = true;
				mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'loadedmetadata');
				//createYouTubeEvent(player, pluginMediaElement, 'loadeddata');
				break;
			case 0:
				pluginMediaElement.paused = false;
				pluginMediaElement.ended = true;
				mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'ended');
				break;
			case 1:
				pluginMediaElement.paused = false;
				pluginMediaElement.ended = false;				
				mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'play');
				mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'playing');
				break;
			case 2:
				pluginMediaElement.paused = true;
				pluginMediaElement.ended = false;				
				mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'pause');
				break;
			case 3: // buffering
				mejs.YouTubeApi.createEvent(player, pluginMediaElement, 'progress');
				break;
			case 5:
				// cued?
				break;						
			
		}			
		
	}
}
// IFRAME
function onYouTubePlayerAPIReady() {
	mejs.YouTubeApi.iFrameReady();
}
// FLASH
function onYouTubePlayerReady(id) {
	mejs.YouTubeApi.flashReady(id);
}

window.mejs = mejs;
window.MediaElement = mejs.MediaElement;

/*
 * Adds Internationalization and localization to mediaelement.
 *
 * This file does not contain translations, you have to add them manually.
 * The schema is always the same: me-i18n-locale-[IETF-language-tag].js
 *
 * Examples are provided both for german and chinese translation.
 *
 *
 * What is the concept beyond i18n?
 *   http://en.wikipedia.org/wiki/Internationalization_and_localization
 *
 * What langcode should i use?
 *   http://en.wikipedia.org/wiki/IETF_language_tag
 *   https://tools.ietf.org/html/rfc5646
 *
 *
 * License?
 *
 *   The i18n file uses methods from the Drupal project (drupal.js):
 *     - i18n.methods.t() (modified)
 *     - i18n.methods.checkPlain() (full copy)
 *
 *   The Drupal project is (like mediaelementjs) licensed under GPLv2.
 *    - http://drupal.org/licensing/faq/#q1
 *    - https://github.com/johndyer/mediaelement
 *    - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 *
 * @author
 *   Tim Latz (latz.tim@gmail.com)
 *
 *
 * @params
 *  - context - document, iframe ..
 *  - exports - CommonJS, window ..
 *
 */
;(function(context, exports, undefined) {
    "use strict";

    var i18n = {
        "locale": {
            // Ensure previous values aren't overwritten.
            "language" : (exports.i18n && exports.i18n.locale.language) || '',
            "strings" : (exports.i18n && exports.i18n.locale.strings) || {}
        },
        "ietf_lang_regex" : /^(x\-)?[a-z]{2,}(\-\w{2,})?(\-\w{2,})?$/,
        "methods" : {}
    };
// start i18n


    /**
     * Get language, fallback to browser's language if empty
     *
     * IETF: RFC 5646, https://tools.ietf.org/html/rfc5646
     * Examples: en, zh-CN, cmn-Hans-CN, sr-Latn-RS, es-419, x-private
     */
    i18n.getLanguage = function () {
        var language = i18n.locale.language || window.navigator.userLanguage || window.navigator.language;
        return i18n.ietf_lang_regex.exec(language) ? language : null;

        //(WAS: convert to iso 639-1 (2-letters, lower case))
        //return language.substr(0, 2).toLowerCase();
    };

    // i18n fixes for compatibility with WordPress
    if ( typeof mejsL10n != 'undefined' ) {
        i18n.locale.language = mejsL10n.language;
    }



    /**
     * Encode special characters in a plain-text string for display as HTML.
     */
    i18n.methods.checkPlain = function (str) {
        var character, regex,
        replace = {
            '&': '&amp;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        };
        str = String(str);
        for (character in replace) {
            if (replace.hasOwnProperty(character)) {
                regex = new RegExp(character, 'g');
                str = str.replace(regex, replace[character]);
            }
        }
        return str;
    };

    /**
     * Translate strings to the page language or a given language.
     *
     *
     * @param str
     *   A string containing the English string to translate.
     *
     * @param options
     *   - 'context' (defaults to the default context): The context the source string
     *     belongs to.
     *
     * @return
     *   The translated string, escaped via i18n.methods.checkPlain()
     */
    i18n.methods.t = function (str, options) {

        // Fetch the localized version of the string.
        if (i18n.locale.strings && i18n.locale.strings[options.context] && i18n.locale.strings[options.context][str]) {
            str = i18n.locale.strings[options.context][str];
        }

        return i18n.methods.checkPlain(str);
    };


    /**
     * Wrapper for i18n.methods.t()
     *
     * @see i18n.methods.t()
     * @throws InvalidArgumentException
     */
    i18n.t = function(str, options) {

        if (typeof str === 'string' && str.length > 0) {

            // check every time due language can change for
            // different reasons (translation, lang switcher ..)
            var language = i18n.getLanguage();

            options = options || {
                "context" : language
            };

            return i18n.methods.t(str, options);
        }
        else {
            throw {
                "name" : 'InvalidArgumentException',
                "message" : 'First argument is either not a string or empty.'
            };
        }
    };

// end i18n
    exports.i18n = i18n;
}(document, mejs));

// i18n fixes for compatibility with WordPress
;(function(exports, undefined) {

    "use strict";

    if ( typeof mejsL10n != 'undefined' ) {
        exports[mejsL10n.language] = mejsL10n.strings;
    }

}(mejs.i18n.locale.strings));

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../bower_components/mediaelement/build/mediaelement.js","/../../bower_components/mediaelement/build")
},{"buffer":2,"oMfpAn":5}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"base64-js":3,"buffer":2,"ieee754":4,"oMfpAn":5}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"buffer":2,"oMfpAn":5}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"buffer":2,"oMfpAn":5}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"buffer":2,"oMfpAn":5}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * @type {Tab}
 */
var Tab = require('./tab');
/**
 * @type {Chapters}
 */
var Chapters = require('./modules/chapter');

function createTimeControls() {
  return $('<ul class="timecontrolbar"></ul>');
}

function createBox() {
  return $('<div class="controlbar bar"></div>');
}

function playerStarted(player) {
  return ((typeof player.currentTime === 'number') && (player.currentTime > 0));
}

function getCombinedCallback(callback) {
  return function (evt) {
    console.debug('Controls', 'controlbutton clicked', evt);
    evt.preventDefault();
    console.debug('Controls', 'player started?', playerStarted(this.player));
    if (!playerStarted(this.player)) {
      this.player.play();
    }
    var boundCallBack = callback.bind(this);
    boundCallBack();
  };
}

/**
 * instantiate new controls element
 * @param {jQuery|HTMLElement} player Player element reference
 * @param {Timeline} timeline Timeline object for this player
 * @constructor
 */
function Controls (player, timeline) {
  this.player = player;
  this.timeline = timeline;
  this.box = createBox();
  this.timeControlElement = createTimeControls();
  this.box.append(this.timeControlElement);
}

/**
 * create time control buttons and add them to timeControlElement
 * @param {null|Chapters} chapterModule when present will add next and previous chapter controls
 * @returns {void}
 */
Controls.prototype.createTimeControls = function (chapterModule) {
  var hasChapters = (chapterModule instanceof Chapters);
  if (!hasChapters) {
    console.info('Controls', 'createTimeControls', 'no chapterTab found');
  }
  if (hasChapters) {
    this.createButton('pwp-controls-previous-chapter', 'Jump backward to previous chapter', function () {
      var activeChapter = chapterModule.getActiveChapter();
      if (this.timeline.getTime() > activeChapter.start + 10) {
        console.debug('Controls', 'back to chapter start', chapterModule.currentChapter, 'from', this.timeline.getTime());
        return chapterModule.playCurrentChapter();
      }
      console.debug('Controls', 'back to previous chapter', chapterModule.currentChapter);
      return chapterModule.previous();
    });
  }

  this.createButton('pwp-controls-back-30', 'Rewind 30 seconds', function () {
    console.debug('Controls', 'rewind before', this.timeline.getTime());
    this.timeline.setTime(this.timeline.getTime() - 30);
    console.debug('Controls', 'rewind after', this.timeline.getTime());
  });

  this.createButton('pwp-controls-forward-30', 'Fast forward 30 seconds', function () {
    console.debug('Controls', 'ffwd before', this.timeline.getTime());
    this.timeline.setTime(this.timeline.getTime() + 30);
    console.debug('Controls', 'ffwd after', this.timeline.getTime());
  });

  if (hasChapters) {
    this.createButton('pwp-controls-next-chapter', 'Jump to next chapter', function () {
      console.debug('Controls', 'next Chapter before', this.timeline.getTime());
      chapterModule.next();
      console.debug('Controls', 'next Chapter after', this.timeline.getTime());
    });
  }
};

Controls.prototype.createButton = function createButton(icon, title, callback) {
  var button = $('<li><a href="#" class="button button-control" title="' + title + '">' +
    '<i class="icon ' + icon + '"></i></a></li>');
  this.timeControlElement.append(button);
  var combinedCallback = getCombinedCallback(callback);
  button.on('click', combinedCallback.bind(this));
};

module.exports = Controls;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/controls.js","/")
},{"./modules/chapter":9,"./tab":19,"buffer":2,"oMfpAn":5}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

// everything for an embedded player
var
  players = [],
  lastHeight = 0,
  $body;

function postToOpener(obj) {
  console.debug('postToOpener', obj);
  window.parent.postMessage(obj, '*');
}

function messageListener (event) {
  var orig = event.originalEvent;

  if (orig.data.action === 'pause') {
    players.forEach(function (player) {
      player.pause();
    });
  }
}

function waitForMetadata (callback) {
  function metaDataListener (event) {
    var orig = event.originalEvent;
    if (orig.data.playerOptions) {
      callback(orig.data.playerOptions);
    }
  }
  $(window).on('message', metaDataListener);
}

function pollHeight() {
  var newHeight = $body.height();
  if (lastHeight !== newHeight) {
    postToOpener({
      action: 'resize',
      arg: newHeight
    });
  }

  lastHeight = newHeight;
  requestAnimationFrame(pollHeight, document.body);
}

/**
 * initialize embed functionality
 * @param {function} $ jQuery
 * @param {Array} playerList all playersin this window
 * @returns {void}
 */
function init($, playerList) {
  players = playerList;
  $body = $(document.body);
  $(window).on('message', messageListener);
  pollHeight();
}

module.exports = {
  postToOpener: postToOpener,
  waitForMetadata: waitForMetadata,
  init: init
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/embed.js","/")
},{"buffer":2,"oMfpAn":5}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**!
 * ===========================================
 * Podlove Web Player v3.0.0-alpha
 * Licensed under The BSD 2-Clause License
 * http://opensource.org/licenses/BSD-2-Clause
 * ===========================================
 * Copyright (c) 2014, Gerrit van Aaken (https://github.com/gerritvanaaken/), Simon Waldherr (https://github.com/simonwaldherr/), Frank Hase (https://github.com/Kambfhase/), Eric Teubert (https://github.com/eteubert/) and others (https://github.com/podlove/podlove-web-player/contributors)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

var TabRegistry = require('./tabregistry'),
  embed = require('./embed'),
  Timeline = require('./timeline'),
  Info = require('./modules/info'),
  Share = require('./modules/share'),
  Downloads = require('./modules/downloads'),
  Chapters = require('./modules/chapter'),
  SaveTime = require('./modules/savetime'),
  Controls = require('./controls'),
  player = require('./player'),
  ProgressBar = require('./modules/progressbar');

var autoplay = false;

var pwp;

// will expose/attach itself to the $ global
require('../../bower_components/mediaelement/build/mediaelement.js');

/**
 * The most missing feature regarding embedded players
 * @param {string} title the title of the show
 * @param {string} url (optional) the link to the show
 * @returns {string}
 */
function renderShowTitle(title, url) {
  if (!title) {
    return '';
  }
  if (url) {
    title = '<a href="' + url + '">' + title + '</a>';
  }
  return '<h3 class="showtitle">' + title + '</h3>';
}

/**
 * Render episode title HTML
 * @param {string} text
 * @param {string} link
 * @returns {string}
 */
function renderTitle(text, link) {
  var titleBegin = '<h1 class="episodetitle">',
    titleEnd = '</h1>';
  if (text !== undefined && link !== undefined) {
    text = '<a href="' + link + '">' + text + '</a>';
  }
  return titleBegin + text + titleEnd;
}

/**
 * Render HTML subtitle
 * @param {string} text
 * @returns {string}
 */
function renderSubTitle(text) {
  if (!text) {
    return '';
  }
  return '<h2 class="subtitle">' + text + '</h2>';
}

/**
 * Render HTML title area
 * @param params
 * @returns {string}
 */
function renderTitleArea(params) {
  return '<header>' +
    renderShowTitle(params.show.title, params.show.url) +
    renderTitle(params.title, params.permalink) +
    renderSubTitle(params.subtitle) +
    '</header>';
}

/**
 * Render HTML playbutton
 * @returns {string}
 */
function renderPlaybutton() {
  return $('<a class="play" title="Play Episode" href="javascript:;"></a>');
}

/**
 * Render the poster image in HTML
 * returns an empty string if posterUrl is empty
 * @param {string} posterUrl
 * @returns {string} rendered HTML
 */
function renderPoster(posterUrl) {
  if (!posterUrl) {
    return '';
  }
  return '<div class="coverart"><img class="coverimg" src="' + posterUrl + '" data-img="' + posterUrl + '" alt="Poster Image"></div>';
}

/**
 * checks if the current window is hidden
 * @returns {boolean} true if the window is hidden
 */
function isHidden() {
  var props = [
    'hidden',
    'mozHidden',
    'msHidden',
    'webkitHidden'
  ];

  for (var index in props) {
    if (props[index] in document) {
      return !!document[props[index]];
    }
  }
  return false;
}

/**
 * add chapter behavior and deeplinking: skip to referenced
 * time position & write current time into address
 * @param {object} player
 * @param {object} params
 * @param {object} wrapper
 */
function addBehavior(player, params, wrapper) {
  var jqPlayer = $(player),

    timeline = new Timeline(player, params),
    controls = new Controls(player, timeline),
    tabs = new TabRegistry(),

    hasChapters = timeline.hasChapters,
    metaElement = $('<div class="titlebar"></div>'),
    playerType = params.type,
    controlBox = controls.box,
    playButton = renderPlaybutton(),
    poster = params.poster || jqPlayer.attr('poster'),
    deepLink;

  console.debug('webplayer', 'metadata', timeline.getData());

  /**
   * Build rich player with meta data
   */
  wrapper.addClass('podlovewebplayer_' + playerType);

  if (playerType === 'audio') {
    // Render playbutton in titlebar
    metaElement.prepend(playButton);
    metaElement.append(renderPoster(poster));
    wrapper.prepend(metaElement);
  }

  if (playerType === 'video') {
    var videoPane = $('<div class="video-pane"></div>');
    var overlay = $('<div class="video-overlay"></div>');
    overlay.append(playButton);
    overlay.on('click', function () {
      if (player.paused) {
        playButton.addClass('playing');
        player.play();
        return;
      }
      playButton.removeClass('playing');
      player.pause();
    });

    videoPane
      .append(overlay)
      .append(jqPlayer);

    wrapper
      .append(metaElement)
      .append(videoPane);

    jqPlayer.prop({
      poster: poster,
      controls: null,
      preload: 'auto'
    });
  }

  // Render title area with title h2 and subtitle h3
  metaElement.append(renderTitleArea(params));

  /**
   * -- MODULES --
   */
  var chapters;
  if (hasChapters) {
    chapters = new Chapters(timeline);
    timeline.addModule(chapters);
    chapters.addEventhandlers(player);
  }
  controls.createTimeControls(chapters);

  var saveTime = new SaveTime(timeline, params);
  timeline.addModule(saveTime);

  var progressBar = new ProgressBar(timeline);
  timeline.addModule(progressBar);

  var sharing = new Share(params);
  var downloads = new Downloads(params);
  var infos = new Info(params);

  /**
   * -- TABS --
   * The tabs in controlbar will appear in following order:
   */

  if (hasChapters) {
    tabs.add(chapters.tab, !!params.chaptersVisible);
  }

  tabs.add(sharing.tab, !!params.sharebuttonsVisible);
  tabs.add(downloads.tab, !!params.downloadbuttonsVisible);
  tabs.add(infos.tab, !!params.summaryVisible);

  // Render controlbar with togglebar and timecontrols
  var controlbarWrapper = $('<div class="controlbar-wrapper"></div>');
  controlbarWrapper.append(tabs.togglebar);
  controlbarWrapper.append(controlBox);

  // render progressbar, controlbar and tabs
  wrapper
    .append(progressBar.render())
    .append(controlbarWrapper)
    .append(tabs.container);

  progressBar.addEvents();

  // expose the player interface
  wrapper.data('podlovewebplayer', {
    player: jqPlayer
  });

  // parse deeplink
  deepLink = require('./url').checkCurrent();
  if (deepLink[0] && pwp.players.length === 1) {
    var playerAttributes = {preload: 'auto'};
    if (!isHidden() && autoplay) {
      playerAttributes.autoplay = 'autoplay';
    }
    jqPlayer.attr(playerAttributes);
    //stopAtTime = deepLink[1];
    timeline.playRange(deepLink);

    $('html, body').delay(150).animate({
      scrollTop: $('.container:first').offset().top - 25
    });
  }

  playButton.on('click', function (evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (player.currentTime && player.currentTime > 0 && !player.paused) {
      playButton.removeClass('playing');
      player.pause();
      if (player.pluginType === 'flash') {
        player.pause();    // flash fallback needs additional pause
      }
      return;
    }

    if (!playButton.hasClass('playing')) {
      playButton.addClass('playing');
    }
    player.play();
  });

  // wait for the player or you'll get DOM EXCEPTIONS
  // And just listen once because of a special behaviour in firefox
  // --> https://bugzilla.mozilla.org/show_bug.cgi?id=664842
  jqPlayer.one('canplay', function (evt) {
    console.debug('canplay', evt);
  });

  jqPlayer
    .on('timelineElement', function (event) {
      console.log(event.currentTarget.id, event);
    })
    .on('timeupdate progress', function (event) {
      timeline.update(event);
    })
    // update play/pause status
    .on('play', function () {})
    .on('playing', function () {
      playButton.addClass('playing');
      embed.postToOpener({ action: 'play', arg: player.currentTime });
    })
    .on('pause', function () {
      playButton.removeClass('playing');
      embed.postToOpener({ action: 'pause', arg: player.currentTime });
    })
    .on('ended', function () {
      embed.postToOpener({ action: 'stop', arg: player.currentTime });
      // delete the cached play time
      saveTime.removeItem();
      timeline.rewind();
    });
}

/**
 * return callback function that will attach source elements to the deferred audio element
 * @param {object} deferredPlayer
 * @returns {Function}
 */
function getDeferredPlayerCallBack(deferredPlayer) {
  return function (data) {
    var params = $.extend({}, player.defaults, data);
    data.sources.forEach(function (sourceObject) {
      $('<source>', sourceObject).appendTo(deferredPlayer);
    });
    player.create(deferredPlayer, params, addBehavior);
  };
}

/**
 *
 * @param {object} options
 * @returns {jQuery}
 */
$.fn.podlovewebplayer = function webPlayer(options) {
  if (options.deferred) {
    var deferredPlayer = this[0];
    var callback = getDeferredPlayerCallBack(deferredPlayer);
    embed.waitForMetadata(callback);
    embed.postToOpener({action: 'waiting'});
    return this;
  }

  // Additional parameters default values
  var params = $.extend({}, player.defaults, options);

  // turn each player in the current set into a Podlove Web Player
  return this.each(function (i, playerElement) {
    player.create(playerElement, params, addBehavior);
  });
};

pwp = { players: player.players };

embed.init($, player.players);

window.pwp = pwp;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_4c78cf7b.js","/")
},{"../../bower_components/mediaelement/build/mediaelement.js":1,"./controls":6,"./embed":7,"./modules/chapter":9,"./modules/downloads":10,"./modules/info":11,"./modules/progressbar":12,"./modules/savetime":13,"./modules/share":14,"./player":15,"./tabregistry":20,"./timeline":22,"./url":23,"buffer":2,"oMfpAn":5}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var tc = require('../timecode')
  , url = require('../url')
  , Tab = require('../tab')
  , Timeline = require('../timeline');

var ACTIVE_CHAPTER_THRESHHOLD = 0.1;

function render(html) {
  return $(html);
}

/**
 * render HTMLTableElement for chapters
 * @returns {jQuery|HTMLElement}
 */
function renderChapterTable() {
  return render(
    '<table class="podlovewebplayer_chapters"><caption>Podcast Chapters</caption>' +
      '<thead>' +
        '<tr>' +
          '<th scope="col">Chapter Number</th>' +
          '<th scope="col">Start time</th>' +
          '<th scope="col">Title</th>' +
          '<th scope="col">Duration</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody></tbody>' +
    '</table>'
  );
}

/**
 *
 * @param {object} chapter
 * @returns {jQuery|HTMLElement}
 */
function renderRow (chapter, index) {
  return render(
    '<tr class="chapter">' +
      '<td class="chapter-number"><span class="badge">' + (index + 1) + '</span></td>' +
      '<td class="chapter-name"><span>' + chapter.code + '</span></td>' +
      '<td class="chapter-duration"><span>' + chapter.duration + '</span></td>' +
    '</tr>'
  );
}

/**
 *
 * @param {Array} chapters
 * @returns {number}
 */
function getMaxChapterStart(chapters) {
  function getStartTime (chapter) {
    return chapter.start;
  }
  return Math.max.apply(Math, $.map(chapters, getStartTime));
}

/**
 *
 * @param {{end:{number}, start:{number}}} chapter
 * @param {number} currentTime
 * @returns {boolean}
 */
function isActiveChapter (chapter, currentTime) {
  if (!chapter) {
    return false;
  }
  return (currentTime > chapter.start - ACTIVE_CHAPTER_THRESHHOLD && currentTime <= chapter.end);
}

/**
 * update the chapter list when the data is loaded
 * @param {Timeline} timeline
 */
function update (timeline) {
  var chapter = this.getActiveChapter()
    , currentTime = timeline.getTime();

  console.debug('Chapters', 'update', this, chapter, currentTime);
  if (isActiveChapter(chapter, currentTime)) {
    console.log('Chapters', 'update', 'already set', this.currentChapter);
    return;
  }
  function markChapter (chapter, i) {
    var isActive = isActiveChapter(chapter, currentTime);
    if (isActive) {
      this.setCurrentChapter(i);
    }
  }
  this.chapters.forEach(markChapter, this);
}

/**
 * chapter handling
 * @params {Timeline} params
 * @return {Chapters} chapter module
 */
function Chapters (timeline) {

  if (!timeline || !timeline.hasChapters) {
    return null;
  }
  if (timeline.duration === 0) {
    console.warn('Chapters', 'constructor', 'Zero length media?', timeline);
  }

  this.timeline = timeline;
  this.duration = timeline.duration;
  this.chapters = timeline.getDataByType('chapter');
  this.chapterlinks = !!timeline.chapterlinks;
  this.currentChapter = 0;

  this.tab = new Tab({
    icon: 'pwp-chapters',
    title: 'Show/hide chapters',
    headline: 'Chapters',
    name: 'podlovewebplayer_chapterbox'
  });

  this.tab
    .createMainContent('')
    .append(this.generateTable());

  this.update = update.bind(this);
}

/**
 * Given a list of chapters, this function creates the chapter table for the player.
 * @returns {jQuery|HTMLDivElement}
 */
Chapters.prototype.generateTable = function () {
  var table, tbody, maxchapterstart, forceHours;

  table = renderChapterTable();
  tbody = table.children('tbody');

  if (this.chapterlinks !== 'false') {
    table.addClass('linked linked_' + this.chapterlinks);
  }

  maxchapterstart = getMaxChapterStart(this.chapters);
  forceHours = (maxchapterstart >= 3600);

  function buildChapter(i) {
    var duration = Math.round(this.end - this.start),
      row;
    //make sure the duration for all chapters are equally formatted
    this.duration = tc.generate([duration], false);

    //if there is a chapter that starts after an hour, force '00:' on all previous chapters
    //insert the chapter data
    this.startTime = tc.generate([Math.round(this.start)], true, forceHours);

    row = renderRow(this, i);
    if (i % 2) {
      row.addClass('oddchapter');
    }
    row.appendTo(tbody);
    this.element = row;
  }

  $.each(this.chapters, buildChapter);
  return table;
};

/**
 *
 * @param {mejs.HtmlMediaElement} player
 */
Chapters.prototype.addEventhandlers = function (player) {
  function onClick(e) {
    // enable external links to be opened in a new tab or window
    // cancels event to bubble up
    if (e.target.className === 'pwp-outgoing button button-toggle') {
      return true;
    }
    //console.log('chapter#clickHandler: start chapter at', chapterStart);
    e.preventDefault();
    // Basic Chapter Mark function (without deeplinking)
    console.log('Chapter', 'clickHandler', 'setCurrentChapter to', e.data.index);
    e.data.module.setCurrentChapter(e.data.index);
    // flash fallback needs additional pause
    if (player.pluginType === 'flash') {
      player.pause();
    }
    e.data.module.playCurrentChapter();
    return false;
  }

  function addClickHandler (chapter, index) {
    chapter.element.on('click', {module: this, index: index}, onClick);
  }

  this.chapters.forEach(addClickHandler, this);
};

Chapters.prototype.getActiveChapter = function () {
  var active = this.chapters[this.currentChapter];
  console.log('Chapters', 'getActiveChapter', active);
  return active;
};

/**
 *
 * @param {number} chapterIndex
 */
Chapters.prototype.setCurrentChapter = function (chapterIndex) {
  if (chapterIndex < this.chapters.length && chapterIndex >= 0) {
    this.currentChapter = chapterIndex;
  }
  this.markActiveChapter();
  console.log('Chapters', 'setCurrentChapter', 'to', this.currentChapter);
};

Chapters.prototype.markActiveChapter = function () {
  var activeChapter = this.getActiveChapter();
  $.each(this.chapters, function () {
    this.element.removeClass('active');
  });
  activeChapter.element.addClass('active');
};

Chapters.prototype.next = function () {
  var current = this.currentChapter,
    next = this.setCurrentChapter(current + 1);
  if (current === next) {
    console.log('Chapters', 'next', 'already in last chapter');
    return current;
  }
  console.log('Chapters', 'next', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return next;
};

Chapters.prototype.previous = function () {
  var current = this.currentChapter,
    previous = this.setCurrentChapter(current - 1);
  if (current === previous) {
    console.log('Chapters', 'previous', 'already in first chapter');
    this.playCurrentChapter();
    return current;
  }
  console.log('Chapters', 'previous', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return previous;
};

Chapters.prototype.playCurrentChapter = function () {
  var start = this.getActiveChapter().start;
  console.log('Chapters', '#playCurrentChapter', 'start', start);
  var time = this.timeline.setTime(start);
  console.log('Chapters', '#playCurrentChapter', 'currentTime', time);
};

module.exports = Chapters;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/chapter.js","/modules")
},{"../tab":19,"../timecode":21,"../timeline":22,"../url":23,"buffer":2,"oMfpAn":5}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var Tab = require('../tab')
  , timeCode = require('../timecode');

/**
 * Calculate the filesize into KB and MB
 * @param size
 * @returns {string}
 */
function formatSize(size) {
  var oneMb = 1048576;
  var fileSize = parseInt(size, 10);
  var kBFileSize = Math.round(fileSize / 1024);
  var mBFileSIze = Math.round(fileSize / 1024 / 1024);
  if (!size) {
    return ' -- ';
  }
  // in case, the filesize is smaller than 1MB,
  // the format will be rendered in KB
  // otherwise in MB
  return (fileSize < oneMb) ? kBFileSize + ' KB' : mBFileSIze + ' MB';
}

/**
 *
 * @param listElement
 * @returns {string}
 */
function createOption(listElement) {
  console.log(listElement);
  return '<option>' + listElement.assetTitle + ' ' + formatSize(listElement.size) + '</option>';
}

function getPosterImage(params) {
  var defaultPoster = '/img/icon-podlove-subscribe-600.png';
  var defaultClass = 'default-poster';

  var poster = defaultPoster;
  if (params.show.poster) {
    poster = params.show.poster;
    defaultClass = '';
  }
  if (params.poster) {
    poster = params.poster;
    defaultClass = '';
  }

  return '<img class="poster-image ' + defaultClass + '" src="' + poster + '" data-img="' + poster + '" ' +
    'alt="Poster Image">';
}

function getPublicationDate(rawDate) {
  if (!rawDate) {
    return '';
  }
  var date = new Date(rawDate);
  return '<p>Published: ' + date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + '</p>';
}

/**
 *
 * @param element
 * @returns {{assetTitle: String, downloadUrl: String, url: String, size: Number}}
 */
function normalizeDownload (element) {
  return {
    assetTitle: element.name,
    downloadUrl: element.dlurl,
    url: element.url,
    size: element.size
  };
}

/**
 *
 * @param element
 * @returns {{assetTitle: String, downloadUrl: String, url: String, size: Number}}
 */
function normalizeSource(element) {
  var source = (typeof element === 'string') ? element : element.src;
  var parts = source.split('.');
  return {
    assetTitle: parts[parts.length - 1],
    downloadUrl: source,
    url: source,
    size: -1
  };
}

/**
 *
 * @param {Object} params
 * @returns {Array}
 */
function createList (params) {
  if (params.downloads && params.downloads[0].assetTitle) {
    return params.downloads;
  }

  if (params.downloads) {
    return params.downloads.map(normalizeDownload);
  }
  // build from source elements
  return params.sources.map(normalizeSource);
}

/**
 *
 * @param {object} params
 * @constructor
 */
function Downloads (params) {
  this.list = createList(params);
  this.tab = this.createDownloadTab(params);
}

/**
 *
 * @param {object} params
 * @returns {null|Tab} download tab
 */
Downloads.prototype.createDownloadTab = function (params) {
  if ((!params.downloads && !params.sources) || params.hidedownloadbutton === true) {
    return null;
  }
  var downloadTab = new Tab({
    icon: 'pwp-download',
    title: 'Show/hide download bar',
    name: 'downloads',
    headline: 'Download'
  });

  var $tabContent = downloadTab.createMainContent('<div class="download">' +
    '<div class="poster-wrapper">' +
    '<div class="download download-overlay"></div>' +
    getPosterImage(params) +
    '</div>' +
    '</div>' +
    '<div class="download">' +
    '<h2>' + params.title + '</h2>' +
    getPublicationDate(params.publicationDate) +
    '<p>Duration: ' + timeCode.fromTimeStamp(params.duration) + '</p>' +
    '</div>'
  );
  downloadTab.box.append($tabContent);

  downloadTab.createFooter('<form action="" method="">' +
    '<button class="download button-submit icon pwp-download" name="download-file">' +
    '<span class="download label">Download Episode</span>' +
    '</button>' +
    '<select class="select" name="select-file">' + this.list.map(createOption) + '</select></form>'
  );

  return downloadTab;
};

module.exports = Downloads;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/downloads.js","/modules")
},{"../tab":19,"../timecode":21,"buffer":2,"oMfpAn":5}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var Tab = require('../tab')
  , timeCode = require('../timecode')
  , services = require('../social-networks');

function getPublicationDate(rawDate) {
  if (!rawDate) {
    return '';
  }
  var date = new Date(rawDate);
  return '<p>Published: ' + date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + '</p>';
}

function createEpisodeInfo(tab, params) {
  tab.createMainContent(
    '<h2>' + params.title + '</h2>' +
    '<h3>' + params.subtitle + '</h3>' +
    '<p>' + params.summary + '</p>' +
    '<p>Duration: ' + timeCode.fromTimeStamp(params.duration) + '</p>' +
     getPublicationDate(params.publicationDate) +
    '<p>' +
      'Permalink for this episode:<br>' +
      '<a href="' + params.permalink + '">' + params.permalink + '</a>' +
    '</p>'
  );
}

function createPosterImage(poster) {
  if (!poster) {
    return '';
  }
  return '<div class="poster-image">' +
    '<img src="' + poster + '" data-img="' + poster + '" alt="Poster Image">' +
    '</div>';
}

function createSubscribeButton(params) {
  if (!params.subscribeButton) {
    return '';
  }
  return '<button class="button-submit">' +
      '<span class="showtitle-label">' + params.show.title + '</span>' +
      '<span class="submit-label">' + params.subscribeButton + '</span>' +
    '</button>';
}

function createShowInfo (tab, params) {
  tab.createAside(
    '<h2>' + params.show.title + '</h2>' +
    '<h3>' + params.show.subtitle + '</h3>' +
    createPosterImage(params.show.poster) +
    createSubscribeButton(params) +
    '<p>Link to the show:<br>' +
      '<a href="' + params.show.url + '">' + params.show.url + '</a></p>'
  );
}

function createSocialLink(options) {
  var service = services.get(options.serviceName);
  var listItem = $('<li></li>');
  var button = service.getButton(options);
  listItem.append(button.element);
  this.append(listItem);
}

function createSocialInfo(profiles) {
  if (!profiles) {
    return null;
  }

  var profileList = $('<ul></ul>');
  profiles.forEach(createSocialLink, profileList);

  var container = $('<div class="social-links"><h3>Stay in touch</h3></div>');
  container.append(profileList);
  return container;
}

function createSocialAndLicenseInfo (tab, params) {
  if (!params.license && !params.profiles) {
    return;
  }
  tab.createFooter(
    '<p>The show "' + params.show.title + '" is licenced under<br>' +
      '<a href="' + params.license.url + '">' + params.license.name + '</a>' +
    '</p>'
  ).prepend(createSocialInfo(params.profiles));
}

/**
 * create info tab if params.summary is defined
 * @param {object} params parameter object
 * @returns {null|Tab} info tab instance or null
 */
function createInfoTab(params) {
  if (!params.summary) {
    return null;
  }
  var infoTab = new Tab({
    icon: 'pwp-info',
    title: 'More information about this',
    headline: 'Info',
    name: 'info'
  });

  createEpisodeInfo(infoTab, params);
  createShowInfo(infoTab, params);
  createSocialAndLicenseInfo(infoTab, params);

  return infoTab;
}

/**
 * Information module to display podcast and episode info
 * @param {object} params parameter object
 * @constructor
 */
function Info(params) {
  this.tab = createInfoTab(params);
}

module.exports = Info;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/info.js","/modules")
},{"../social-networks":18,"../tab":19,"../timecode":21,"buffer":2,"oMfpAn":5}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var tc = require('../timecode');
var cap = require('../util').cap;

function renderTimeElement(className, time) {
  return $('<div class="time time-' + className + '">' + time + '</div>');
}

/**
 * Render an HTML Element for the current chapter
 * @returns {jQuery|HTMLElement}
 */
function renderCurrentChapterElement() {
  var chapterElement = $('<div class="chapter"></div>');

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

function renderProgressInfo(progressBar) {
  var progressInfo = $('<div class="progress-info"></div>');

  return progressInfo
    .append(progressBar.currentTime)
    .append(renderCurrentChapterElement.call(progressBar))
    .append(progressBar.durationTimeElement);
}

function updateTimes(progressBar) {
  var time = progressBar.timeline.getTime();
  progressBar.currentTime.html(tc.fromTimeStamp(time));

  if (progressBar.showDuration) { return; }

  var remainingTime = Math.abs(time - progressBar.duration);
  progressBar.durationTimeElement.text('-' + tc.fromTimeStamp(remainingTime));
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
  });

  return durationTimeElement;
}

function renderMarkerAt(time) {
  var percent = 100 * time / this.duration;
  return $('<div class="marker" style="left:' + percent + '%;"></div>');
}

function renderChapterMarker(chapter) {
  return renderMarkerAt.call(this, chapter.start);
}

/**
 * This update method is to be called when a players `currentTime` changes.
 */
function update (timeline) {
  this.setProgress(timeline.getTime());
  this.buffer.val(timeline.getBuffered());
  this.setChapter();
}

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
  this.update = update.bind(this);
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
 * Renders a new progress bar jQuery object.
 */
ProgressBar.prototype.render = function () {

  // time elements
  var initialTime = tc.fromTimeStamp(this.timeline.getTime());
  this.currentTime = renderTimeElement('current', initialTime);
  this.durationTimeElement = renderDurationTimeElement(this);

  // progress info
  var progressInfo = renderProgressInfo(this);
  updateTimes(this);

  // timeline and buffer bars
  var progress = $('<div class="progress"></div>');
  var timelineBar = $('<progress class="current"></progress>')
      .attr({ min: 0, max: this.duration});
  var buffer = $('<progress class="buffer"></progress>')
      .attr({min: 0, max: this.duration});
  var handle = $('<div class="handle"><div class="inner-handle"></div></div>');

  progress
    .append(timelineBar)
    .append(buffer)
    .append(handle);

  this.progress = timelineBar;
  this.buffer = buffer;
  this.handle = handle;
  this.setProgress(this.timeline.getTime());

  if (this.chapterModule) {
    var chapterMarkers = this.chapterModule.chapters.map(renderChapterMarker, this);
    chapterMarkers.shift(); // remove first one
    progress.append(chapterMarkers);
  }

  // progress bar
  var bar = $('<div class="progressbar"></div>');
  bar
    .append(progressInfo)
    .append(progress);

  this.bar = bar;
  return bar;
};

ProgressBar.prototype.addEvents = function() {
  var mouseIsDown = false;
  var timeline = this.timeline;
  var progress = this.progress;

  function calculateNewTime (pageX) {
    // mouse position relative to the object
    var width = progress.outerWidth(true);
    var offset = progress.offset();
    var pos = cap(pageX - offset.left, 0, width);
    var percentage = (pos / width);
    return percentage * timeline.duration;
  }

  function handleMouseMove (event) {
    if (typeof timeline.duration !== 'number' || !mouseIsDown ) { return; }
    var newTime = calculateNewTime(event.pageX);
    if (newTime === timeline.getTime()) { return; }
    timeline.seek(newTime);
  }

  function seekStart () {
    timeline.seekStart();
    $(document)
      .bind('mousemove.dur', handleMouseMove)
      .bind('touchmove.dur', handleMouseMove);
  }

  function handleMouseUp () {
    mouseIsDown = false;
    timeline.seekEnd();
    $(document)
      .unbind('touchend.dur')
      .unbind('mouseup.dur')
      .unbind('touchmove.dur')
      .unbind('mousemove.dur');
  }

  function handleMouseDown (event) {
    // only handle left clicks
    if (event.which !== 1) { return; }

    mouseIsDown = true;
    handleMouseMove(event);
    seekStart();
    $(document)
      .bind('mouseup.dur', handleMouseUp)
      .bind('touchend.dur', handleMouseUp);
  }

  // handle click and drag with mouse or touch in progressbar and on handle
  this.progress
    .bind('touchstart', handleMouseDown)
    .bind('mousedown', handleMouseDown);

  this.handle
    .bind('touchstart', handleMouseDown)
    .bind('mousedown', handleMouseDown);
};

module.exports = ProgressBar;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/progressbar.js","/modules")
},{"../timecode":21,"../util":24,"buffer":2,"oMfpAn":5}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * Saving the playtime
 */
var prefix = 'podlove-web-player-playtime-';

function getItem () {
  return +localStorage[this.key];
}

function removeItem () {
  return localStorage.removeItem(this.key);
}

function hasItem () {
  return (this.key) in localStorage;
}

function update () {
  console.debug('SaveTime', 'update', this.timeline.getTime());
  this.setItem(this.timeline.getTime());
}

function SaveTime(timeline, params) {
  this.timeline = timeline;
  this.key = prefix + params.permalink;
  this.getItem = getItem.bind(this);
  this.removeItem = removeItem.bind(this);
  this.hasItem = hasItem.bind(this);
  this.update = update.bind(this);

  // set the time on start
  if (this.hasItem()) {
    timeline.setTime(this.getItem());
  }
}

SaveTime.prototype.setItem = function (value) {
  localStorage[this.key] = value;
};

module.exports = SaveTime;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/savetime.js","/modules")
},{"buffer":2,"oMfpAn":5}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var Tab = require('../tab')
  , SocialButtonList = require('../social-button-list');

var services = ['twitter', 'facebook', 'gplus', 'tumblr', 'email']
  , shareOptions = [
    {name: 'Show', value: 'show'},
    {name: 'Episode', value: 'episode', default: true},
    {name: 'Chapter', value: 'chapter', disabled: true},
    {name: 'Exactly this part here', value: 'timed', disabled: true}
  ]
  , shareData = {};

// module globals
var selectedOption, shareButtons, linkInput;

function getShareData(value) {
  if (value === 'show') {
    return shareData.show;
  }
  var data = shareData.episode;
  // todo add chapter start and end time to url
  //if (value === 'chapter') {
  //}
  // todo add selected start and end time to url
  //if (value === 'timed') {
  //}
  return data;
}

function updateUrls(data) {
  shareButtons.update(data);
  linkInput.update(data);
}

function onShareOptionChangeTo (element, value) {
  var data = getShareData(value);

  return function (event) {
    console.log('sharing options changed', value);
    selectedOption.removeClass('selected');
    element.addClass('selected');
    selectedOption = element;
    event.preventDefault();
    updateUrls(data);
  };
}

/**
 * Create html for an poster image
 * @param {string} type 'episode' or 'show'
 * @returns {string} HTML for the image
 */
function createPosterFor(type) {
  var data = shareData[type];
  if (!type || !data || !data.poster) {
    console.warn('cannot create poster for', type);
    return '';
  }
  console.log('create poster for', type, ' > url', data.poster);
  return '<img src="' + data.poster + '" data-img="' + data.poster + '" alt="Poster Image">';
}

/**
 * create sharing button
 * @param {object} option sharing option definition
 * @returns {jQuery} share button reference
 */
function createOption(option) {
  if (option.disabled) {
    console.log('Share', 'createOption', 'omit disabled option', option.name);
    return null;
  }

  var data = getShareData(option.value);

  if (!data) {
    console.log('Share', 'createOption', 'omit option without data', option.name);
    return null;
  }

  var element = $('<div class="share-select-option">' + createPosterFor(option.value) +
      '<span>Share this ' + option.name + '</span>' +
    '</div>');

  if (option.default) {
    selectedOption = element;
    element.addClass('selected');
    updateUrls(data);
  }
  element.on('click', onShareOptionChangeTo(element, option.value));
  return element;
}

/**
 * Creates an html div element to wrap all share buttons
 * @returns {jQuery|HTMLElement} share button wrapper reference
 */
function createShareButtonWrapper() {
  var div = $('<div class="share-button-wrapper"></div>');
  div.append(shareOptions.map(createOption));

  return div;
}

/**
 * create sharing buttons in a form
 * @returns {jQuery} form element reference
 */
function createShareOptions() {
  var form = $('<form>' +
    '<legend>What would you like to share?</legend>' +
  '</form>');
  form.append(createShareButtonWrapper);
  return form;
}

/**
 * build and return tab instance for sharing
 * @param {object} params player configuration
 * @returns {null|Tab} sharing tab instance or null if permalink missing or sharing disabled
 */
function createShareTab(params) {
  if (!params.permalink || params.hidesharebutton === true) {
    return null;
  }

  var shareTab = new Tab({
    icon: 'pwp-share',
    title: 'Show/hide sharing tabs',
    name: 'podlovewebplayer_share',
    headline: 'Share'
  });

  shareButtons = new SocialButtonList(services, getShareData('episode'));
  linkInput = $('<h3>Link</h3>' +
    '<input type="url" name="share-link-url" readonly>');
  linkInput.update = function(data) {
    this.val(data.rawUrl);
  };

  shareTab.createMainContent('').append(createShareOptions());
  shareTab.createFooter('<h3>Share via ...</h3>').append(shareButtons.list).append(linkInput);

  return shareTab;
}

module.exports = function Share(params) {
  shareData.episode = {
    poster: params.poster,
    title: encodeURIComponent(params.title),
    url: encodeURIComponent(params.permalink),
    rawUrl: params.permalink,
    text: encodeURIComponent(params.title + ' ' + params.permalink)
  };
  shareData.chapters = params.chapters;

  if (params.show.url) {
    shareData.show = {
      poster: params.show.poster,
      title: encodeURIComponent(params.show.title),
      url: encodeURIComponent(params.show.url),
      rawUrl: params.show.url,
      text: encodeURIComponent(params.show.title + ' ' + params.show.url)
    };
  }

  selectedOption = 'episode';
  this.tab = createShareTab(params);
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/share.js","/modules")
},{"../social-button-list":16,"../tab":19,"buffer":2,"oMfpAn":5}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var embed = require('./embed'),
  parseTimecode = require('./timecode').parse;

/**
 * player
 */
var
// Keep all Players on site - for inline players
// embedded players are registered in podlove-webplayer-moderator in the embedding page
  players = [],
// all used functions
  mejsoptions = {
    defaultVideoWidth: 480,
    defaultVideoHeight: 270,
    videoWidth: -1,
    videoHeight: -1,
    audioWidth: -1,
    audioHeight: 30,
    startVolume: 0.8,
    loop: false,
    enableAutosize: true,
    features: ['playpause', 'current', 'progress', 'duration', 'tracks', 'fullscreen'],
    alwaysShowControls: false,
    iPadUseNativeControls: false,
    iPhoneUseNativeControls: false,
    AndroidUseNativeControls: false,
    alwaysShowHours: false,
    showTimecodeFrameCount: false,
    framesPerSecond: 25,
    enableKeyboard: true,
    pauseOtherPlayers: true,
    duration: false,
    plugins: ['flash', 'silverlight'],
    pluginPath: './bin/',
    flashName: 'flashmediaelement.swf',
    silverlightName: 'silverlightmediaelement.xap'
  },
  defaults = {
    chapterlinks: 'all',
    width: '100%',
    duration: false,
    chaptersVisible: false,
    timecontrolsVisible: false,
    sharebuttonsVisible: false,
    downloadbuttonsVisible: false,
    summaryVisible: false,
    hidetimebutton: false,
    hidedownloadbutton: false,
    hidesharebutton: false,
    sharewholeepisode: false,
    sources: []
  };

/**
 * remove 'px' unit, set witdth to 100% for 'auto'
 * @param {string} width
 * @returns {string}
 */
function normalizeWidth(width) {
  if (width.toLowerCase() === 'auto') {
    return '100%';
  }
  return width.replace('px', '');
}

/**
 * audio or video tag
 * @param {HTMLElement} player
 * @returns {string} 'audio' | 'video'
 */
function getPlayerType (player) {
  return player.tagName.toLowerCase();
}

/**
 * kill play/pause button from miniplayer
 * @param options
 */
function removePlayPause(options) {
  $.each(options.features, function (i) {
    if (this === 'playpause') {
      options.features.splice(i, 1);
    }
  });
}

/**
 * player error handling function
 * will remove the topmost mediafile from src or source list
 * possible fix for Firefox AAC issues
 */
function removeUnplayableMedia() {
  var $this = $(this);
  if ($this.attr('src')) {
    $this.removeAttr('src');
    return;
  }
  var sourceList = $this.children('source');
  if (sourceList.length) {
    sourceList.first().remove();
  }
}

function create(player, params, callback) {
  var jqPlayer,
    playerType = getPlayerType(player),
    secArray,
    wrapper;

  jqPlayer = $(player);
  wrapper = $('<div class="container"></div>');
  jqPlayer.replaceWith(wrapper);

  //fine tuning params
  params.width = normalizeWidth(params.width);
  if (playerType === 'audio') {
    // FIXME: Since the player is no longer visible it has no width
    if (params.audioWidth !== undefined) {
      params.width = params.audioWidth;
    }
    mejsoptions.audioWidth = params.width;
    //kill fullscreen button
    $.each(mejsoptions.features, function (i) {
      if (this === 'fullscreen') {
        mejsoptions.features.splice(i, 1);
      }
    });
    removePlayPause(mejsoptions);
  }
  else if (playerType === 'video') {
    //video params
    if (false && params.height !== undefined) {
      mejsoptions.videoWidth = params.width;
      mejsoptions.videoHeight = params.height;
    }
    // FIXME
    if (false && $(player).attr('width') !== undefined) {
      params.width = $(player).attr('width');
    }
  }

  //duration can be given in seconds or in NPT format
  if (params.duration && params.duration !== parseInt(params.duration, 10)) {
    secArray = parseTimecode(params.duration);
    params.duration = secArray[0];
  }

  //Overwrite MEJS default values with actual data
  $.each(mejsoptions, function (key) {
    if (key in params) {
      mejsoptions[key] = params[key];
    }
  });

  //wrapper and init stuff
  // FIXME: better check for numerical value
  if (params.width.toString().trim() === parseInt(params.width, 10).toString()) {
    params.width = parseInt(params.width, 10) + 'px';
  }

  players.push(player);

  //add params from audio and video elements
  jqPlayer.find('source').each(function () {
    if (!params.sources) {
      params.sources = [];
    }
    params.sources.push($(this).attr('src'));
  });

  params.type = playerType;
  // init MEJS to player
  mejsoptions.success = function (player) {
    jqPlayer.on('error', removeUnplayableMedia);   // This might be a fix to some Firefox AAC issues.
    callback(player, params, wrapper);
  };
  var me = new MediaElement(player, mejsoptions);
  console.log(me);
}

module.exports = {
  create: create,
  defaults: defaults,
  players: players
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/player.js","/")
},{"./embed":7,"./timecode":21,"buffer":2,"oMfpAn":5}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var services = require('./social-networks');

function createButtonWith(options) {
  return function (serviceName) {
    var service = services.get(serviceName);
    return service.getButton(options);
  };
}

function SocialButtonList (services, options) {
  var createButton = createButtonWith(options);
  this.buttons = services.map(createButton);

  this.list = $('<ul></ul>');
  this.buttons.forEach(function (button) {
    var listElement = $('<li></li>').append(button.element);
    this.list.append(listElement);
  }, this);
}

SocialButtonList.prototype.update = function (options) {
  this.buttons.forEach(function (button) {
    button.updateUrl(options);
  });
};

module.exports = SocialButtonList;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/social-button-list.js","/")
},{"./social-networks":18,"buffer":2,"oMfpAn":5}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

function createButton (options) {
  return $('<a class="pwp-contrast-' + options.icon + '" target="_blank" href="' + options.url + '" ' +
  'title="' + options.title + '"><i class="icon pwp-' + options.icon + '"></i></a>' +
  '<span>' + options.title + '</span>');
}

/**
 * Creates an object to interact with a social network
 * @param {object} options Icon, title profile- and sharing-URL-templates
 * @constructor
 */
function SocialNetwork (options) {
  this.icon = options.icon;
  this.title = options.title;
  this.url = options.profileUrl;
  this.shareUrl = options.shareUrl;
}

/**
 * build URL for sharing a text, a title and a url
 * @param {object} options contents to be shared
 * @returns {string} URL to share the contents
 */
SocialNetwork.prototype.getShareUrl = function (options) {
  var shareUrl = this.shareUrl
    .replace('$text$', options.text)
    .replace('$title$', options.title)
    .replace('$url$', options.url);
  return this.url + shareUrl;
};

/**
 * build URL to a given profile
 * @param {object} profile Username to link to
 * @returns {string} profile URL
 */
SocialNetwork.prototype.getProfileUrl = function (profile) {
  return this.url + profile;
};

/**
 * get profile button element
 * @param {object} options options.profile defines the profile the button links to
 * @returns {{element:{jQuery}}} button reference
 */
SocialNetwork.prototype.getProfileButton = function (options) {
  if (!options.profile) {
    return null;
  }
  return {
    element: createButton({
      url: this.getProfileUrl(options.profile),
      title: this.title,
      icon: this.icon
    })
  };
};

/**
 * get share button element and URL update function
 * @param {object} options initial contents to be shared with the button
 * @returns {{element:{jQuery}, updateUrl:{function}}} button reference and update function
 */
SocialNetwork.prototype.getShareButton = function (options) {

  if (!this.shareUrl || !options.title || !options.url) {
    return null;
  }

  if (!options.text) {
    options.text = options.title + '%20' + options.url;
  }

  var element = createButton({
    url: this.getShareUrl(options),
    title: this.title,
    icon: this.icon
  });

  var updateUrl = function (options) {
    element.get(0).href = this.getShareUrl(options);
  }.bind(this);

  return {
    element: element,
    updateUrl: updateUrl
  };
};

/**
 * get share or profile button depending on the options given
 * @param {object} options object with either profilename or contents to share
 * @returns {object} button object
 */
SocialNetwork.prototype.getButton = function (options) {
  if (options.profile) {
    return this.getProfileButton(options);
  }
  if (this.shareUrl && options.title && options.url) {
    return this.getShareButton(options);
  }
  return null;
};

module.exports = SocialNetwork;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/social-network.js","/")
},{"buffer":2,"oMfpAn":5}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var SocialNetwork = require('./social-network');
var socialNetworks = {
  twitter: new SocialNetwork({
    icon: 'twitter',
    title: 'Twitter',
    profileUrl: 'https://twitter.com/',
    shareUrl: 'share?text=$text$&url=$url$'
  }),

  flattr: new SocialNetwork({
    icon: 'flattr',
    title: 'Flattr',
    profileUrl: 'https://flattr.com/profile/',
    shareUrl: 'share?text=$text$&url=$url$'
  }),

  facebook: new SocialNetwork({
    icon: 'facebook',
    title: 'Facebook',
    profileUrl: 'https://facebook.com/',
    shareUrl: 'share.php?t=$text$&u=$url$'
  }),

  adn: new SocialNetwork({
    icon: 'adn',
    title: 'App.net',
    profileUrl: 'https://alpha.app.net/',
    shareUrl: 'intent/post?text=$text$'
  }),

  soundcloud: new SocialNetwork({
    icon: 'soundcloud',
    title: 'SoundCloud',
    profileUrl: 'https://soundcloud.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  }),

  instagram: new SocialNetwork({
    icon: 'instagram',
    title: 'Instagram',
    profileUrl: 'http://instagram.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  }),

  tumblr: new SocialNetwork({
    icon: 'tumblr',
    title: 'Tumblr',
    profileUrl: 'https://www.tumblr.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  }),

  email: new SocialNetwork({
    icon: 'message',
    title: 'E-Mail',
    profileUrl: 'mailto:',
    shareUrl: '?subject=$title$&body=$text$'
  }),
  gplus: new SocialNetwork({
    icon: 'google-plus',
    title: 'Google+',
    profileUrl: 'https://plus.google.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  })
};

/**
 * returns the service registered with the given name
 * @param {string} serviceName The name of the social network
 * @returns {SocialNetwork} The network with the given name
 */
function getService (serviceName) {
  var service = socialNetworks[serviceName];
  if (!service) {
    console.error('Unknown service', serviceName);
  }
  return service;
}

module.exports = {
  get: getService
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/social-networks.js","/")
},{"./social-network":17,"buffer":2,"oMfpAn":5}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * When tab content is scrolled, a boxshadow is added to the header
 * @param event
 */
function addShadowOnScroll(event) {
  var scroll = event.currentTarget.scrollTop;
  event.data.header.toggleClass('scrolled', (scroll >= 5 ));
}

/**
 * Return an html section element as a wrapper for the tab
 * @param {object} options
 * @returns {*|jQuery|HTMLElement}
 */
function createContentBox(options) {
  var classes = ['tab'];
  classes.push(options.name);
  if (options.active) {
    classes.push('active');
  }
  return $('<section class="' + classes.join(' ') + '"></section>');
}

/**
 * Create a tab
 * @param options
 * @constructor
 */
function Tab(options) {
  this.icon = options.icon;
  this.title = options.title;
  this.headline = options.headline;

  this.box = createContentBox(options);
  var header = this.createHeader();
  this.box.on('scroll', {header: header}, addShadowOnScroll);

  this.active = false;
  this.toggle = null;
}

/**
 * Add class 'active' to the active tab
 */
Tab.prototype.open = function () {
  this.active = true;
  this.box.addClass('active');
  this.toggle.addClass('active');
};

/**
 * Remove class 'active' from the inactive tab
 */
Tab.prototype.close = function () {
  this.active = false;
  this.box.removeClass('active');
  this.toggle.removeClass('active');
};

/**
 * Return an html header element with a headline
 */
Tab.prototype.createHeader = function() {
  var header = $('<header class="tab-header"><h2 class="tab-headline">' +
    '<i class="icon ' + this.icon + '"></i>' + this.headline + '</h2></header>');
  this.box.append(header);
  return header;
};

/**
 * Append an html div element with class main to the tab's content box
 * @param content
 */
Tab.prototype.createMainContent = function(content) {
  var mainDiv = $('<div class="main">' + content + '</div');
  this.box.append(mainDiv);
  return mainDiv;
};

/**
 * Append an html aside element to the tab's content box
 * @param content
 */
Tab.prototype.createAside = function(content) {
  var aside = $('<aside class="aside">' + content + '</aside>');
  this.box.append(aside);
  return aside;
};

/**
 * Append an html footer element to the tab's content box
 * @param content
 */
Tab.prototype.createFooter = function(content) {
  var footer = $('<footer>' + content + '</footer>');
  this.box.append(footer);
  return footer;
};

module.exports = Tab;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/tab.js","/")
},{"buffer":2,"oMfpAn":5}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * @type {Tab}
 */
var Tab = require('./tab.js');

/**
 *
 * @param {Tab} tab
 * @returns {boolean}
 */
function getToggleClickHandler(tab) {
  /*jshint validthis:true */
  console.debug('TabRegistry', 'activeTab', this.activeTab);
  if (this.activeTab) {
    this.activeTab.close();
  }
  if (this.activeTab === tab) {
    this.activeTab = null;
    return false;
  }
  this.activeTab = tab;
  this.activeTab.open();
  return false;
}

/**
 *
 * @param {HTMLElement} player
 */
function logCurrentTime (player) {
  console.log('player.currentTime', player.currentTime);
}

function TabRegistry() {
  /**
   * will store a reference to currently active tab instance to close it when another one is opened
   * @type {object}
   */
  this.activeTab = null;
  this.togglebar = $('<div class="togglebar bar"></div>');
  this.toggleList = $('<ul class="tablist"></ul>');
  this.togglebar.append(this.toggleList);
  this.container = $('<div class="tabs"></div>');
  this.listeners = [logCurrentTime];
  this.tabs = [];
}

TabRegistry.prototype.createToggleFor = function (tab) {
  var toggle = $('<li title="' + tab.title + '">' +
      '<a href="javascript:;" class="button button-toggle ' + tab.icon + '"></a>' +
    '</li>');
  toggle.on('click', getToggleClickHandler.bind(this, tab));
  this.toggleList.append(toggle);
  return toggle;
};

/**
 * Register a tab and open it if it is initially visible
 * @param {Tab} tab
 * @param {Boolean} visible
 */
TabRegistry.prototype.add = function(tab, visible) {
  if (tab === null) { return; }
  this.tabs.push(tab);
  this.container.append(tab.box);

  tab.toggle = this.createToggleFor(tab);
  if (visible) {
    tab.open();
    this.activeTab = tab;
  }
};

/**
 *
 * @param {object} module
 */
TabRegistry.prototype.addModule = function(module) {
  if (module.tab) {
    this.add(module.tab);
  }
  if (module.update) {
    this.listeners.push(module.update);
  }
};

TabRegistry.prototype.update = function(event) {
  console.log('TabRegistry#update', event);
  var player = event.currentTarget;
  $.each(this.listeners, function (i, listener) { listener(player); });
};

module.exports = TabRegistry;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/tabregistry.js","/")
},{"./tab.js":19,"buffer":2,"oMfpAn":5}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var zeroFill = require('./util').zeroFill;

/**
 * Timecode as described in http://podlove.org/deep-link/
 * and http://www.w3.org/TR/media-frags/#fragment-dimensions
 */
var timeCodeMatcher = /(?:(\d+):)?(\d{1,2}):(\d\d)(\.\d{1,3})?/;

/**
 * convert an array of string to timecode
 * @param {string} tc
 * @returns {number|boolean}
 */
function extractTime(tc) {
  if (!tc) {
    return false;
  }
  var parts = timeCodeMatcher.exec(tc);
  if (!parts) {
    console.warn('Could not extract time from', tc);
    return false;
  }
  var time = 0;
  // hours
  time += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
  // minutes
  time += parseInt(parts[2], 10) * 60;
  // seconds
  time += parseInt(parts[3], 10);
  // milliseconds
  time += parts[4] ? parseFloat(parts[4]) : 0;
  // no negative time
  time = Math.max(time, 0);
  return time;
}

/**
 * convert a timestamp to a timecode in ${insert RFC here} format
 * @param {Number} time
 * @param {Boolean} leadingZeros
 * @param {Boolean} [forceHours] force output of hours, defaults to false
 * @param {Boolean} [showMillis] output milliseconds separated with a dot from the seconds - defaults to false
 * @return {string}
 */
function ts2tc(time, leadingZeros, forceHours, showMillis) {
  var hours, minutes, seconds, milliseconds;
  var timecode = '';

  if (time === 0) {
    return (forceHours ? '00:00:00' : '00:00');
  }

  // prevent negative values from player
  if (!time || time <= 0) {
    return (forceHours ? '--:--:--' : '--:--');
  }

  hours = Math.floor(time / 60 / 60);
  minutes = Math.floor(time / 60) % 60;
  seconds = Math.floor(time % 60) % 60;
  milliseconds = Math.floor(time % 1 * 1000);

  if (showMillis && milliseconds) {
    timecode = '.' + zeroFill(milliseconds, 3);
  }

  timecode = ':' + zeroFill(seconds, 2) + timecode;

  if (hours === 0 && !forceHours && !leadingZeros ) {
    return minutes.toString() + timecode;
  }

  timecode = zeroFill(minutes, 2) + timecode;

  if (hours === 0 && !forceHours) {
    // required (minutes : seconds)
    return timecode;
  }

  if (leadingZeros) {
    return zeroFill(hours, 2) + ':' + timecode;
  }

  return hours + ':' + timecode;
}

module.exports = {

  /**
   * convenience method for converting timestamps to
   * @param {Number} timestamp
   * @returns {String} timecode
   */
  fromTimeStamp: function (timestamp) {
    return ts2tc(timestamp, true, true);
  },

  /**
   * accepts array with start and end time in seconds
   * returns timecode in deep-linking format
   * @param {Array} times
   * @param {Boolean} leadingZeros
   * @param {Boolean} [forceHours]
   * @return {string}
   */
  generate: function (times, leadingZeros, forceHours) {
    if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
      return ts2tc(times[0], leadingZeros, forceHours) + ',' + ts2tc(times[1], leadingZeros, forceHours);
    }
    return ts2tc(times[0], leadingZeros, forceHours);
  },

  /**
   * parses time code into seconds
   * @param {String} timecode
   * @return {Array}
   */
  parse: function (timecode) {
    if (!timecode) {
      return [false, false];
    }

    var timeparts = timecode.split('-');

    if (!timeparts.length) {
      console.warn('no timeparts:', timecode);
      return [false, false];
    }

    var startTime = extractTime(timeparts.shift());
    var endTime = extractTime(timeparts.shift());

    return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
  },

  getStartTimeCode: function getStartTimecode(start) {
      return this.parse(start)[0];
  }
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/timecode.js","/")
},{"./util":24,"buffer":2,"oMfpAn":5}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

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
var tc = require('./timecode')
  , cap = require('./util').cap;

function transformChapter(chapter) {
  chapter.code = chapter.title;
  if (typeof chapter.start === 'string') {
    chapter.start = tc.getStartTimeCode(chapter.start);
  }
  return chapter;
}

/**
 * add `end` property to each simple chapter,
 * needed for proper formatting
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
  return function (element) {
    element.type = type;
    return element;
  };
}

function call(listener) {
  listener(this);
}

function filterByType(type) {
  return function (record) {
    return (record.type === type);
  };
}

/**
 *
 * @param {Timeline} timeline
 */
function logCurrentTime(timeline) {
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

function parse(data) {
  return data;
}

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
  this.resume = player.paused;
  this.seeking = false;
}

Timeline.prototype.getData = function () {
  return this.data;
};

Timeline.prototype.getDataByType = function (type) {
  return this.data.filter(filterByType(type));
};

Timeline.prototype.addModule = function (module) {
  if (module.update) {
    this.listeners.push(module.update);
  }
  this.modules.push(module);
};

Timeline.prototype.playRange = function (range) {
  if (!range || !range.length || !range.shift) {
    throw new TypeError('Timeline.playRange called without a range');
  }
  this.setTime(range.shift());
  this.stopAt(range.shift());
};

Timeline.prototype.update = function (event) {
  console.log('Timeline', 'update', event);
  this.setBufferedTime(event);

  if (event && event.type === 'timeupdate') {
    this.currentTime = this.player.currentTime;
  }
  this.listeners.forEach(call, this);
  if (this.currentTime >= this.endTime) {
    this.player.stop();
  }
};

Timeline.prototype.emitEventsBetween = function (start, end) {
  var emitStarted = false,
    emit = function (event) {
      var customEvent = new $.Event(event.type, event);
      $(this).trigger(customEvent);
    }.bind(this);
  this.data.map(function (event) {
    var later = (event.start > start),
      earlier = (event.end < start),
      ended = (event.end < end);

    if (later && earlier && !ended || emitStarted) {
      console.log('Timeline', 'Emit', event);
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
    return this.currentTime;
  }

  console.log('Timeline', 'setTime', 'time', time);
  this.currentTime = time;
  this.update();

  // avoid event hellfire
  if (this.seeking) { return this.currentTime; }

  console.log('canplay', 'setTime', 'playerState', this.player.readyState);
  if (this.player.readyState === this.player.HAVE_ENOUGH_DATA) {
    this.player.setCurrentTime(time);
    return this.currentTime;
  }

  // TODO visualize buffer state
  // $(document).find('.play').css({color:'red'});
  $(this.player).one('canplay', function () {
    // TODO remove buffer state visual
    // $(document).find('.play').css({color:'white'});
    console.log('Player', 'canplay', 'buffered', time);
    this.setCurrentTime(time);
  });

  return this.currentTime;
};

Timeline.prototype.seek = function (time) {
  console.log('seek', 'seek', this.resume);
  this.seeking = true;
  this.currentTime = cap(time, 0, this.duration);
  this.setTime(this.currentTime);
};

Timeline.prototype.seekStart = function () {
  console.log('seek', 'start', this.resume);
  this.resume = !this.player.paused; // setting this to false makes Safari happy
  if (this.resume) {
    this.player.pause();
  }
};

Timeline.prototype.seekEnd = function () {
  console.log('seek', 'end', this.resume);
  this.seeking = false;
  this.setTime(this.currentTime); //force latest position in track
  if (this.resume) {
    console.log('seek', 'end', 'resume', this.currentTime);
    this.player.play();
  }
  this.resume = !this.player.paused; // seekstart may not be called
};

Timeline.prototype.stopAt = function (time) {
  if (!time || time <= 0 || time > this.duration) {
    return console.warn('Timeline', 'stopAt', 'time out of bounds', time);
  }
  this.endTime = time;
};

Timeline.prototype.getTime = function () {
  return this.currentTime;
};

Timeline.prototype.getBuffered = function () {
  if (isNaN(this.bufferedTime)) {
    console.warn('Timeline', 'getBuffered', 'bufferedTime is not a number');
    return 0;
  }
  return this.bufferedTime;
};

Timeline.prototype.setBufferedTime = function (e) {
  var target = (e !== undefined) ? e.target : this.player;
  var buffered = 0;

  // newest HTML5 spec has buffered array (FF4, Webkit)
  if (target && target.buffered && target.buffered.length > 0 && target.buffered.end && target.duration) {
    buffered = target.buffered.end(target.buffered.length - 1);
  }
  // Some browsers (e.g., FF3.6 and Safari 5) cannot calculate target.bufferered.end()
  // to be anything other than 0. If the byte count is available we use this instead.
  // Browsers that support the else if do not seem to have the bufferedBytes value and
  // should skip to there. Tested in Safari 5, Webkit head, FF3.6, Chrome 6, IE 7/8.
  else if (target && target.bytesTotal !== undefined && target.bytesTotal > 0 && target.bufferedBytes !== undefined) {
    buffered = target.bufferedBytes / target.bytesTotal * target.duration;
  }
  // Firefox 3 with an Ogg file seems to go this way
  else if (e && e.lengthComputable && e.total !== 0) {
    buffered = e.loaded / e.total * target.duration;
  }
  var cappedTime = cap(buffered, 0, target.duration);
  console.log('Timeline', 'setBufferedTime', cappedTime);
  this.bufferedTime = cappedTime;
};

Timeline.prototype.rewind = function () {
  this.setTime(0);
  var callListenerWithThis = function _callListenerWithThis(i, listener) {
    listener(this);
  }.bind(this);
  $.each(this.listeners, callListenerWithThis);
};

Timeline.prototype.parseSimpleChapter = function (data) {
  if (!data.chapters) {
    return [];
  }

  var chapters = data.chapters.map(transformChapter);

  // order is not guaranteed: http://podlove.org/simple-chapters/
  return chapters
    .map(addType('chapter'))
    .map(addEndTime(data.duration))
    .sort(function (a, b) {
      return a.start - b.start;
    });
};

module.exports = Timeline;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/timeline.js","/")
},{"./timecode":21,"./util":24,"buffer":2,"oMfpAn":5}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var tc = require('./timecode');

/*
  "t=1"	[("t", "1")]	simple case
  "t=1&t=2"	[("t", "1"), ("t", "2")]	repeated name
  "a=b=c"	[("a", "b=c")]	"=" in value
  "a&b=c"	[("a", ""), ("b", "c")]	missing value
  "%74=%6ept%3A%310"	[("t", "npt:10")]	unnecssary percent-encoding
  "id=%xy&t=1"	[("t", "1")]	invalid percent-encoding
  "id=%E4r&t=1"	[("t", "1")]	invalid UTF-8
 */

/**
 * get the value of a specific URL hash fragment
 * @param {string} key name of the fragment
 * @returns {string|boolean} value of the fragment or false when not found in URL
 */
function getFragment(key) {
  var query = window.location.hash.substring(1),
    pairs = query.split('&');

  if (query.indexOf(key) === -1) {
    return false;
  }

  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    if (pair[0] !== key) {
      continue;
    }
    if (pair.length === 1) {
      return true;
    }
    return decodeURIComponent(pair[1]);
  }
  return false;
}

/**
 * URL handling helpers
 */
module.exports = {
  getFragment: getFragment,
  checkCurrent: function () {
    var t = getFragment('t');
    return tc.parse(t);
  }
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/url.js","/")
},{"./timecode":21,"buffer":2,"oMfpAn":5}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * return new value in bounds of min and max
 * @param {number} val any number
 * @param {number} min lower boundary for val
 * @param {number} max upper boundary for val
 * @returns {number} resulting value
 */
function cap(val, min, max) {
  // cap x values
  val = Math.max(val, min);
  val = Math.min(val, max);
  return val;
}

/**
 * return number as string lefthand filled with zeros
 * @param {number} number (integer) value to be padded
 * @param {number} width length of the string that is returned
 * @returns {string} padded number
 */
function zeroFill (number, width) {
  var s = number.toString();
  while (s.length < width) {
    s = '0' + s;
  }
  return s;
}

module.exports = {
  cap: cap,
  zeroFill: zeroFill
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util.js","/")
},{"buffer":2,"oMfpAn":5}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZC9tZWRpYWVsZW1lbnQuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9jb250cm9scy5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL2VtYmVkLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvZmFrZV80Yzc4Y2Y3Yi5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvY2hhcHRlci5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvZG93bmxvYWRzLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9pbmZvLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9wcm9ncmVzc2Jhci5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvc2F2ZXRpbWUuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL3NoYXJlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvcGxheWVyLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLWJ1dHRvbi1saXN0LmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLW5ldHdvcmsuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9zb2NpYWwtbmV0d29ya3MuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWIuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWJyZWdpc3RyeS5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3RpbWVjb2RlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvdGltZWxpbmUuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91cmwuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICpcbiAqIE1lZGlhRWxlbWVudC5qc1xuICogSFRNTDUgPHZpZGVvPiBhbmQgPGF1ZGlvPiBzaGltIGFuZCBwbGF5ZXJcbiAqIGh0dHA6Ly9tZWRpYWVsZW1lbnRqcy5jb20vXG4gKlxuICogQ3JlYXRlcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRoYXQgbWltaWNzIEhUTUw1IE1lZGlhRWxlbWVudCBBUElcbiAqIGZvciBicm93c2VycyB0aGF0IGRvbid0IHVuZGVyc3RhbmQgSFRNTDUgb3IgY2FuJ3QgcGxheSB0aGUgcHJvdmlkZWQgY29kZWNcbiAqIENhbiBwbGF5IE1QNCAoSC4yNjQpLCBPZ2csIFdlYk0sIEZMViwgV01WLCBXTUEsIEFDQywgYW5kIE1QM1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQsIEpvaG4gRHllciAoaHR0cDovL2ouaG4pXG4gKiBMaWNlbnNlOiBNSVRcbiAqXG4gKi9cbi8vIE5hbWVzcGFjZVxudmFyIG1lanMgPSBtZWpzIHx8IHt9O1xuXG4vLyB2ZXJzaW9uIG51bWJlclxubWVqcy52ZXJzaW9uID0gJzIuMTYuMic7IFxuXG5cbi8vIHBsYXllciBudW1iZXIgKGZvciBtaXNzaW5nLCBzYW1lIGlkIGF0dHIpXG5tZWpzLm1lSW5kZXggPSAwO1xuXG4vLyBtZWRpYSB0eXBlcyBhY2NlcHRlZCBieSBwbHVnaW5zXG5tZWpzLnBsdWdpbnMgPSB7XG5cdHNpbHZlcmxpZ2h0OiBbXG5cdFx0e3ZlcnNpb246IFszLDBdLCB0eXBlczogWyd2aWRlby9tcDQnLCd2aWRlby9tNHYnLCd2aWRlby9tb3YnLCd2aWRlby93bXYnLCdhdWRpby93bWEnLCdhdWRpby9tNGEnLCdhdWRpby9tcDMnLCdhdWRpby93YXYnLCdhdWRpby9tcGVnJ119XG5cdF0sXG5cdGZsYXNoOiBbXG5cdFx0e3ZlcnNpb246IFs5LDAsMTI0XSwgdHlwZXM6IFsndmlkZW8vbXA0JywndmlkZW8vbTR2JywndmlkZW8vbW92JywndmlkZW8vZmx2JywndmlkZW8vcnRtcCcsJ3ZpZGVvL3gtZmx2JywnYXVkaW8vZmx2JywnYXVkaW8veC1mbHYnLCdhdWRpby9tcDMnLCdhdWRpby9tNGEnLCdhdWRpby9tcGVnJywgJ3ZpZGVvL3lvdXR1YmUnLCAndmlkZW8veC15b3V0dWJlJywgJ2FwcGxpY2F0aW9uL3gtbXBlZ1VSTCddfVxuXHRcdC8vLHt2ZXJzaW9uOiBbMTIsMF0sIHR5cGVzOiBbJ3ZpZGVvL3dlYm0nXX0gLy8gZm9yIGZ1dHVyZSByZWZlcmVuY2UgKGhvcGVmdWxseSEpXG5cdF0sXG5cdHlvdXR1YmU6IFtcblx0XHR7dmVyc2lvbjogbnVsbCwgdHlwZXM6IFsndmlkZW8veW91dHViZScsICd2aWRlby94LXlvdXR1YmUnLCAnYXVkaW8veW91dHViZScsICdhdWRpby94LXlvdXR1YmUnXX1cblx0XSxcblx0dmltZW86IFtcblx0XHR7dmVyc2lvbjogbnVsbCwgdHlwZXM6IFsndmlkZW8vdmltZW8nLCAndmlkZW8veC12aW1lbyddfVxuXHRdXG59O1xuXG4vKlxuVXRpbGl0eSBtZXRob2RzXG4qL1xubWVqcy5VdGlsaXR5ID0ge1xuXHRlbmNvZGVVcmw6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodXJsKTsgLy8ucmVwbGFjZSgvXFw/L2dpLCclM0YnKS5yZXBsYWNlKC89L2dpLCclM0QnKS5yZXBsYWNlKC8mL2dpLCclMjYnKTtcblx0fSxcblx0ZXNjYXBlSFRNTDogZnVuY3Rpb24ocykge1xuXHRcdHJldHVybiBzLnRvU3RyaW5nKCkuc3BsaXQoJyYnKS5qb2luKCcmYW1wOycpLnNwbGl0KCc8Jykuam9pbignJmx0OycpLnNwbGl0KCdcIicpLmpvaW4oJyZxdW90OycpO1xuXHR9LFxuXHRhYnNvbHV0aXplVXJsOiBmdW5jdGlvbih1cmwpIHtcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRlbC5pbm5lckhUTUwgPSAnPGEgaHJlZj1cIicgKyB0aGlzLmVzY2FwZUhUTUwodXJsKSArICdcIj54PC9hPic7XG5cdFx0cmV0dXJuIGVsLmZpcnN0Q2hpbGQuaHJlZjtcblx0fSxcblx0Z2V0U2NyaXB0UGF0aDogZnVuY3Rpb24oc2NyaXB0TmFtZXMpIHtcblx0XHR2YXJcblx0XHRcdGkgPSAwLFxuXHRcdFx0aixcblx0XHRcdGNvZGVQYXRoID0gJycsXG5cdFx0XHR0ZXN0bmFtZSA9ICcnLFxuXHRcdFx0c2xhc2hQb3MsXG5cdFx0XHRmaWxlbmFtZVBvcyxcblx0XHRcdHNjcmlwdFVybCxcblx0XHRcdHNjcmlwdFBhdGgsXHRcdFx0XG5cdFx0XHRzY3JpcHRGaWxlbmFtZSxcblx0XHRcdHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksXG5cdFx0XHRpbCA9IHNjcmlwdHMubGVuZ3RoLFxuXHRcdFx0amwgPSBzY3JpcHROYW1lcy5sZW5ndGg7XG5cdFx0XHRcblx0XHQvLyBnbyB0aHJvdWdoIGFsbCA8c2NyaXB0PiB0YWdzXG5cdFx0Zm9yICg7IGkgPCBpbDsgaSsrKSB7XG5cdFx0XHRzY3JpcHRVcmwgPSBzY3JpcHRzW2ldLnNyYztcblx0XHRcdHNsYXNoUG9zID0gc2NyaXB0VXJsLmxhc3RJbmRleE9mKCcvJyk7XG5cdFx0XHRpZiAoc2xhc2hQb3MgPiAtMSkge1xuXHRcdFx0XHRzY3JpcHRGaWxlbmFtZSA9IHNjcmlwdFVybC5zdWJzdHJpbmcoc2xhc2hQb3MgKyAxKTtcblx0XHRcdFx0c2NyaXB0UGF0aCA9IHNjcmlwdFVybC5zdWJzdHJpbmcoMCwgc2xhc2hQb3MgKyAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNjcmlwdEZpbGVuYW1lID0gc2NyaXB0VXJsO1xuXHRcdFx0XHRzY3JpcHRQYXRoID0gJyc7XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIHNlZSBpZiBhbnkgPHNjcmlwdD4gdGFncyBoYXZlIGEgZmlsZSBuYW1lIHRoYXQgbWF0Y2hlcyB0aGUgXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgamw7IGorKykge1xuXHRcdFx0XHR0ZXN0bmFtZSA9IHNjcmlwdE5hbWVzW2pdO1xuXHRcdFx0XHRmaWxlbmFtZVBvcyA9IHNjcmlwdEZpbGVuYW1lLmluZGV4T2YodGVzdG5hbWUpO1xuXHRcdFx0XHRpZiAoZmlsZW5hbWVQb3MgPiAtMSkge1xuXHRcdFx0XHRcdGNvZGVQYXRoID0gc2NyaXB0UGF0aDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBpZiB3ZSBmb3VuZCBhIHBhdGgsIHRoZW4gYnJlYWsgYW5kIHJldHVybiBpdFxuXHRcdFx0aWYgKGNvZGVQYXRoICE9PSAnJykge1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gc2VuZCB0aGUgYmVzdCBwYXRoIGJhY2tcblx0XHRyZXR1cm4gY29kZVBhdGg7XG5cdH0sXG5cdHNlY29uZHNUb1RpbWVDb2RlOiBmdW5jdGlvbih0aW1lLCBmb3JjZUhvdXJzLCBzaG93RnJhbWVDb3VudCwgZnBzKSB7XG5cdFx0Ly9hZGQgZnJhbWVjb3VudFxuXHRcdGlmICh0eXBlb2Ygc2hvd0ZyYW1lQ291bnQgPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQgICAgc2hvd0ZyYW1lQ291bnQ9ZmFsc2U7XG5cdFx0fSBlbHNlIGlmKHR5cGVvZiBmcHMgPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQgICAgZnBzID0gMjU7XG5cdFx0fVxuXHRcblx0XHR2YXIgaG91cnMgPSBNYXRoLmZsb29yKHRpbWUgLyAzNjAwKSAlIDI0LFxuXHRcdFx0bWludXRlcyA9IE1hdGguZmxvb3IodGltZSAvIDYwKSAlIDYwLFxuXHRcdFx0c2Vjb25kcyA9IE1hdGguZmxvb3IodGltZSAlIDYwKSxcblx0XHRcdGZyYW1lcyA9IE1hdGguZmxvb3IoKCh0aW1lICUgMSkqZnBzKS50b0ZpeGVkKDMpKSxcblx0XHRcdHJlc3VsdCA9IFxuXHRcdFx0XHRcdCggKGZvcmNlSG91cnMgfHwgaG91cnMgPiAwKSA/IChob3VycyA8IDEwID8gJzAnICsgaG91cnMgOiBob3VycykgKyAnOicgOiAnJylcblx0XHRcdFx0XHRcdCsgKG1pbnV0ZXMgPCAxMCA/ICcwJyArIG1pbnV0ZXMgOiBtaW51dGVzKSArICc6J1xuXHRcdFx0XHRcdFx0KyAoc2Vjb25kcyA8IDEwID8gJzAnICsgc2Vjb25kcyA6IHNlY29uZHMpXG5cdFx0XHRcdFx0XHQrICgoc2hvd0ZyYW1lQ291bnQpID8gJzonICsgKGZyYW1lcyA8IDEwID8gJzAnICsgZnJhbWVzIDogZnJhbWVzKSA6ICcnKTtcblx0XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0XG5cdHRpbWVDb2RlVG9TZWNvbmRzOiBmdW5jdGlvbihoaF9tbV9zc19mZiwgZm9yY2VIb3Vycywgc2hvd0ZyYW1lQ291bnQsIGZwcyl7XG5cdFx0aWYgKHR5cGVvZiBzaG93RnJhbWVDb3VudCA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBzaG93RnJhbWVDb3VudD1mYWxzZTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZwcyA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBmcHMgPSAyNTtcblx0XHR9XG5cdFxuXHRcdHZhciB0Y19hcnJheSA9IGhoX21tX3NzX2ZmLnNwbGl0KFwiOlwiKSxcblx0XHRcdHRjX2hoID0gcGFyc2VJbnQodGNfYXJyYXlbMF0sIDEwKSxcblx0XHRcdHRjX21tID0gcGFyc2VJbnQodGNfYXJyYXlbMV0sIDEwKSxcblx0XHRcdHRjX3NzID0gcGFyc2VJbnQodGNfYXJyYXlbMl0sIDEwKSxcblx0XHRcdHRjX2ZmID0gMCxcblx0XHRcdHRjX2luX3NlY29uZHMgPSAwO1xuXHRcdFxuXHRcdGlmIChzaG93RnJhbWVDb3VudCkge1xuXHRcdCAgICB0Y19mZiA9IHBhcnNlSW50KHRjX2FycmF5WzNdKS9mcHM7XG5cdFx0fVxuXHRcdFxuXHRcdHRjX2luX3NlY29uZHMgPSAoIHRjX2hoICogMzYwMCApICsgKCB0Y19tbSAqIDYwICkgKyB0Y19zcyArIHRjX2ZmO1xuXHRcdFxuXHRcdHJldHVybiB0Y19pbl9zZWNvbmRzO1xuXHR9LFxuXHRcblxuXHRjb252ZXJ0U01QVEV0b1NlY29uZHM6IGZ1bmN0aW9uIChTTVBURSkge1xuXHRcdGlmICh0eXBlb2YgU01QVEUgIT0gJ3N0cmluZycpIFxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0U01QVEUgPSBTTVBURS5yZXBsYWNlKCcsJywgJy4nKTtcblx0XHRcblx0XHR2YXIgc2VjcyA9IDAsXG5cdFx0XHRkZWNpbWFsTGVuID0gKFNNUFRFLmluZGV4T2YoJy4nKSAhPSAtMSkgPyBTTVBURS5zcGxpdCgnLicpWzFdLmxlbmd0aCA6IDAsXG5cdFx0XHRtdWx0aXBsaWVyID0gMTtcblx0XHRcblx0XHRTTVBURSA9IFNNUFRFLnNwbGl0KCc6JykucmV2ZXJzZSgpO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgU01QVEUubGVuZ3RoOyBpKyspIHtcblx0XHRcdG11bHRpcGxpZXIgPSAxO1xuXHRcdFx0aWYgKGkgPiAwKSB7XG5cdFx0XHRcdG11bHRpcGxpZXIgPSBNYXRoLnBvdyg2MCwgaSk7IFxuXHRcdFx0fVxuXHRcdFx0c2VjcyArPSBOdW1iZXIoU01QVEVbaV0pICogbXVsdGlwbGllcjtcblx0XHR9XG5cdFx0cmV0dXJuIE51bWJlcihzZWNzLnRvRml4ZWQoZGVjaW1hbExlbikpO1xuXHR9LFx0XG5cdFxuXHQvKiBib3Jyb3dlZCBmcm9tIFNXRk9iamVjdDogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3N3Zm9iamVjdC9zb3VyY2UvYnJvd3NlL3RydW5rL3N3Zm9iamVjdC9zcmMvc3dmb2JqZWN0LmpzIzQ3NCAqL1xuXHRyZW1vdmVTd2Y6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIG9iaiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblx0XHRpZiAob2JqICYmIC9vYmplY3R8ZW1iZWQvaS50ZXN0KG9iai5ub2RlTmFtZSkpIHtcblx0XHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNJRSkge1xuXHRcdFx0XHRvYmouc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHRcdFx0XHQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZiAob2JqLnJlYWR5U3RhdGUgPT0gNCkge1xuXHRcdFx0XHRcdFx0bWVqcy5VdGlsaXR5LnJlbW92ZU9iamVjdEluSUUoaWQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsIDEwKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvYmoucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvYmopO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cmVtb3ZlT2JqZWN0SW5JRTogZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgb2JqID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXHRcdGlmIChvYmopIHtcblx0XHRcdGZvciAodmFyIGkgaW4gb2JqKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygb2JqW2ldID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdG9ialtpXSA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9iai5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9iaik7XG5cdFx0fVx0XHRcblx0fVxufTtcblxuXG4vLyBDb3JlIGRldGVjdG9yLCBwbHVnaW5zIGFyZSBhZGRlZCBiZWxvd1xubWVqcy5QbHVnaW5EZXRlY3RvciA9IHtcblxuXHQvLyBtYWluIHB1YmxpYyBmdW5jdGlvbiB0byB0ZXN0IGEgcGx1ZyB2ZXJzaW9uIG51bWJlciBQbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKCdmbGFzaCcsWzksMCwxMjVdKTtcblx0aGFzUGx1Z2luVmVyc2lvbjogZnVuY3Rpb24ocGx1Z2luLCB2KSB7XG5cdFx0dmFyIHB2ID0gdGhpcy5wbHVnaW5zW3BsdWdpbl07XG5cdFx0dlsxXSA9IHZbMV0gfHwgMDtcblx0XHR2WzJdID0gdlsyXSB8fCAwO1xuXHRcdHJldHVybiAocHZbMF0gPiB2WzBdIHx8IChwdlswXSA9PSB2WzBdICYmIHB2WzFdID4gdlsxXSkgfHwgKHB2WzBdID09IHZbMF0gJiYgcHZbMV0gPT0gdlsxXSAmJiBwdlsyXSA+PSB2WzJdKSkgPyB0cnVlIDogZmFsc2U7XG5cdH0sXG5cblx0Ly8gY2FjaGVkIHZhbHVlc1xuXHRuYXY6IHdpbmRvdy5uYXZpZ2F0b3IsXG5cdHVhOiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFxuXG5cdC8vIHN0b3JlZCB2ZXJzaW9uIG51bWJlcnNcblx0cGx1Z2luczogW10sXG5cblx0Ly8gcnVucyBkZXRlY3RQbHVnaW4oKSBhbmQgc3RvcmVzIHRoZSB2ZXJzaW9uIG51bWJlclxuXHRhZGRQbHVnaW46IGZ1bmN0aW9uKHAsIHBsdWdpbk5hbWUsIG1pbWVUeXBlLCBhY3RpdmVYLCBheERldGVjdCkge1xuXHRcdHRoaXMucGx1Z2luc1twXSA9IHRoaXMuZGV0ZWN0UGx1Z2luKHBsdWdpbk5hbWUsIG1pbWVUeXBlLCBhY3RpdmVYLCBheERldGVjdCk7XG5cdH0sXG5cblx0Ly8gZ2V0IHRoZSB2ZXJzaW9uIG51bWJlciBmcm9tIHRoZSBtaW1ldHlwZSAoYWxsIGJ1dCBJRSkgb3IgQWN0aXZlWCAoSUUpXG5cdGRldGVjdFBsdWdpbjogZnVuY3Rpb24ocGx1Z2luTmFtZSwgbWltZVR5cGUsIGFjdGl2ZVgsIGF4RGV0ZWN0KSB7XG5cblx0XHR2YXIgdmVyc2lvbiA9IFswLDAsMF0sXG5cdFx0XHRkZXNjcmlwdGlvbixcblx0XHRcdGksXG5cdFx0XHRheDtcblxuXHRcdC8vIEZpcmVmb3gsIFdlYmtpdCwgT3BlcmFcblx0XHRpZiAodHlwZW9mKHRoaXMubmF2LnBsdWdpbnMpICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLm5hdi5wbHVnaW5zW3BsdWdpbk5hbWVdID09ICdvYmplY3QnKSB7XG5cdFx0XHRkZXNjcmlwdGlvbiA9IHRoaXMubmF2LnBsdWdpbnNbcGx1Z2luTmFtZV0uZGVzY3JpcHRpb247XG5cdFx0XHRpZiAoZGVzY3JpcHRpb24gJiYgISh0eXBlb2YgdGhpcy5uYXYubWltZVR5cGVzICE9ICd1bmRlZmluZWQnICYmIHRoaXMubmF2Lm1pbWVUeXBlc1ttaW1lVHlwZV0gJiYgIXRoaXMubmF2Lm1pbWVUeXBlc1ttaW1lVHlwZV0uZW5hYmxlZFBsdWdpbikpIHtcblx0XHRcdFx0dmVyc2lvbiA9IGRlc2NyaXB0aW9uLnJlcGxhY2UocGx1Z2luTmFtZSwgJycpLnJlcGxhY2UoL15cXHMrLywnJykucmVwbGFjZSgvXFxzci9naSwnLicpLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGZvciAoaT0wOyBpPHZlcnNpb24ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2ZXJzaW9uW2ldID0gcGFyc2VJbnQodmVyc2lvbltpXS5tYXRjaCgvXFxkKy8pLCAxMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHQvLyBJbnRlcm5ldCBFeHBsb3JlciAvIEFjdGl2ZVhcblx0XHR9IGVsc2UgaWYgKHR5cGVvZih3aW5kb3cuQWN0aXZlWE9iamVjdCkgIT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF4ID0gbmV3IEFjdGl2ZVhPYmplY3QoYWN0aXZlWCk7XG5cdFx0XHRcdGlmIChheCkge1xuXHRcdFx0XHRcdHZlcnNpb24gPSBheERldGVjdChheCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKSB7IH1cblx0XHR9XG5cdFx0cmV0dXJuIHZlcnNpb247XG5cdH1cbn07XG5cbi8vIEFkZCBGbGFzaCBkZXRlY3Rpb25cbm1lanMuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdmbGFzaCcsJ1Nob2Nrd2F2ZSBGbGFzaCcsJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJywnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnLCBmdW5jdGlvbihheCkge1xuXHQvLyBhZGFwdGVkIGZyb20gU1dGT2JqZWN0XG5cdHZhciB2ZXJzaW9uID0gW10sXG5cdFx0ZCA9IGF4LkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7XG5cdGlmIChkKSB7XG5cdFx0ZCA9IGQuc3BsaXQoXCIgXCIpWzFdLnNwbGl0KFwiLFwiKTtcblx0XHR2ZXJzaW9uID0gW3BhcnNlSW50KGRbMF0sIDEwKSwgcGFyc2VJbnQoZFsxXSwgMTApLCBwYXJzZUludChkWzJdLCAxMCldO1xuXHR9XG5cdHJldHVybiB2ZXJzaW9uO1xufSk7XG5cbi8vIEFkZCBTaWx2ZXJsaWdodCBkZXRlY3Rpb25cbm1lanMuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdzaWx2ZXJsaWdodCcsJ1NpbHZlcmxpZ2h0IFBsdWctSW4nLCdhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LTInLCdBZ0NvbnRyb2wuQWdDb250cm9sJywgZnVuY3Rpb24gKGF4KSB7XG5cdC8vIFNpbHZlcmxpZ2h0IGNhbm5vdCByZXBvcnQgaXRzIHZlcnNpb24gbnVtYmVyIHRvIElFXG5cdC8vIGJ1dCBpdCBkb2VzIGhhdmUgYSBpc1ZlcnNpb25TdXBwb3J0ZWQgZnVuY3Rpb24sIHNvIHdlIGhhdmUgdG8gbG9vcCB0aHJvdWdoIGl0IHRvIGdldCBhIHZlcnNpb24gbnVtYmVyLlxuXHQvLyBhZGFwdGVkIGZyb20gaHR0cDovL3d3dy5zaWx2ZXJsaWdodHZlcnNpb24uY29tL1xuXHR2YXIgdiA9IFswLDAsMCwwXSxcblx0XHRsb29wTWF0Y2ggPSBmdW5jdGlvbihheCwgdiwgaSwgbikge1xuXHRcdFx0d2hpbGUoYXguaXNWZXJzaW9uU3VwcG9ydGVkKHZbMF0rIFwiLlwiKyB2WzFdICsgXCIuXCIgKyB2WzJdICsgXCIuXCIgKyB2WzNdKSl7XG5cdFx0XHRcdHZbaV0rPW47XG5cdFx0XHR9XG5cdFx0XHR2W2ldIC09IG47XG5cdFx0fTtcblx0bG9vcE1hdGNoKGF4LCB2LCAwLCAxKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAxLCAxKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAyLCAxMDAwMCk7IC8vIHRoZSB0aGlyZCBwbGFjZSBpbiB0aGUgdmVyc2lvbiBudW1iZXIgaXMgdXN1YWxseSA1IGRpZ2l0cyAoNC4wLnh4eHh4KVxuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMDApO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMCk7XG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMTApO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEpO1xuXHRsb29wTWF0Y2goYXgsIHYsIDMsIDEpO1xuXG5cdHJldHVybiB2O1xufSk7XG4vLyBhZGQgYWRvYmUgYWNyb2JhdFxuLypcblBsdWdpbkRldGVjdG9yLmFkZFBsdWdpbignYWNyb2JhdCcsJ0Fkb2JlIEFjcm9iYXQnLCdhcHBsaWNhdGlvbi9wZGYnLCdBY3JvUERGLlBERicsIGZ1bmN0aW9uIChheCkge1xuXHR2YXIgdmVyc2lvbiA9IFtdLFxuXHRcdGQgPSBheC5HZXRWZXJzaW9ucygpLnNwbGl0KCcsJylbMF0uc3BsaXQoJz0nKVsxXS5zcGxpdCgnLicpO1xuXG5cdGlmIChkKSB7XG5cdFx0dmVyc2lvbiA9IFtwYXJzZUludChkWzBdLCAxMCksIHBhcnNlSW50KGRbMV0sIDEwKSwgcGFyc2VJbnQoZFsyXSwgMTApXTtcblx0fVxuXHRyZXR1cm4gdmVyc2lvbjtcbn0pO1xuKi9cbi8vIG5lY2Vzc2FyeSBkZXRlY3Rpb24gKGZpeGVzIGZvciA8SUU5KVxubWVqcy5NZWRpYUZlYXR1cmVzID0ge1xuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHR2YXJcblx0XHRcdHQgPSB0aGlzLFxuXHRcdFx0ZCA9IGRvY3VtZW50LFxuXHRcdFx0bmF2ID0gbWVqcy5QbHVnaW5EZXRlY3Rvci5uYXYsXG5cdFx0XHR1YSA9IG1lanMuUGx1Z2luRGV0ZWN0b3IudWEudG9Mb3dlckNhc2UoKSxcblx0XHRcdGksXG5cdFx0XHR2LFxuXHRcdFx0aHRtbDVFbGVtZW50cyA9IFsnc291cmNlJywndHJhY2snLCdhdWRpbycsJ3ZpZGVvJ107XG5cblx0XHQvLyBkZXRlY3QgYnJvd3NlcnMgKG9ubHkgdGhlIG9uZXMgdGhhdCBoYXZlIHNvbWUga2luZCBvZiBxdWlyayB3ZSBuZWVkIHRvIHdvcmsgYXJvdW5kKVxuXHRcdHQuaXNpUGFkID0gKHVhLm1hdGNoKC9pcGFkL2kpICE9PSBudWxsKTtcblx0XHR0LmlzaVBob25lID0gKHVhLm1hdGNoKC9pcGhvbmUvaSkgIT09IG51bGwpO1xuXHRcdHQuaXNpT1MgPSB0LmlzaVBob25lIHx8IHQuaXNpUGFkO1xuXHRcdHQuaXNBbmRyb2lkID0gKHVhLm1hdGNoKC9hbmRyb2lkL2kpICE9PSBudWxsKTtcblx0XHR0LmlzQnVzdGVkQW5kcm9pZCA9ICh1YS5tYXRjaCgvYW5kcm9pZCAyXFwuWzEyXS8pICE9PSBudWxsKTtcblx0XHR0LmlzQnVzdGVkTmF0aXZlSFRUUFMgPSAobG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonICYmICh1YS5tYXRjaCgvYW5kcm9pZCBbMTJdXFwuLykgIT09IG51bGwgfHwgdWEubWF0Y2goL21hY2ludG9zaC4qIHZlcnNpb24uKiBzYWZhcmkvKSAhPT0gbnVsbCkpO1xuXHRcdHQuaXNJRSA9IChuYXYuYXBwTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJtaWNyb3NvZnRcIikgIT0gLTEgfHwgbmF2LmFwcE5hbWUudG9Mb3dlckNhc2UoKS5tYXRjaCgvdHJpZGVudC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNDaHJvbWUgPSAodWEubWF0Y2goL2Nocm9tZS9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNDaHJvbWl1bSA9ICh1YS5tYXRjaCgvY2hyb21pdW0vZ2kpICE9PSBudWxsKTtcblx0XHR0LmlzRmlyZWZveCA9ICh1YS5tYXRjaCgvZmlyZWZveC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNXZWJraXQgPSAodWEubWF0Y2goL3dlYmtpdC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNHZWNrbyA9ICh1YS5tYXRjaCgvZ2Vja28vZ2kpICE9PSBudWxsKSAmJiAhdC5pc1dlYmtpdCAmJiAhdC5pc0lFO1xuXHRcdHQuaXNPcGVyYSA9ICh1YS5tYXRjaCgvb3BlcmEvZ2kpICE9PSBudWxsKTtcblx0XHR0Lmhhc1RvdWNoID0gKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyk7IC8vICAmJiB3aW5kb3cub250b3VjaHN0YXJ0ICE9IG51bGwpOyAvLyB0aGlzIGJyZWFrcyBpT1MgN1xuXHRcdFxuXHRcdC8vIGJvcnJvd2VkIGZyb20gTW9kZXJuaXpyXG5cdFx0dC5zdmcgPSAhISBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiZcblx0XHRcdFx0ISEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3N2ZycpLmNyZWF0ZVNWR1JlY3Q7XG5cblx0XHQvLyBjcmVhdGUgSFRNTDUgbWVkaWEgZWxlbWVudHMgZm9yIElFIGJlZm9yZSA5LCBnZXQgYSA8dmlkZW8+IGVsZW1lbnQgZm9yIGZ1bGxzY3JlZW4gZGV0ZWN0aW9uXG5cdFx0Zm9yIChpPTA7IGk8aHRtbDVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0diA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaHRtbDVFbGVtZW50c1tpXSk7XG5cdFx0fVxuXHRcdFxuXHRcdHQuc3VwcG9ydHNNZWRpYVRhZyA9ICh0eXBlb2Ygdi5jYW5QbGF5VHlwZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdC5pc0J1c3RlZEFuZHJvaWQpO1xuXG5cdFx0Ly8gRml4IGZvciBJRTkgb24gV2luZG93cyA3TiAvIFdpbmRvd3MgN0tOIChNZWRpYSBQbGF5ZXIgbm90IGluc3RhbGxlcilcblx0XHR0cnl7XG5cdFx0XHR2LmNhblBsYXlUeXBlKFwidmlkZW8vbXA0XCIpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdHQuc3VwcG9ydHNNZWRpYVRhZyA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGRldGVjdCBuYXRpdmUgSmF2YVNjcmlwdCBmdWxsc2NyZWVuIChTYWZhcmkvRmlyZWZveCBvbmx5LCBDaHJvbWUgc3RpbGwgZmFpbHMpXG5cdFx0XG5cdFx0Ly8gaU9TXG5cdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi53ZWJraXRFbnRlckZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHQvLyBXM0Ncblx0XHR0Lmhhc05hdGl2ZUZ1bGxzY3JlZW4gPSAodHlwZW9mIHYucmVxdWVzdEZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHQvLyB3ZWJraXQvZmlyZWZveC9JRTExK1xuXHRcdHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi5tb3pSZXF1ZXN0RnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2Lm1zUmVxdWVzdEZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHR0Lmhhc1RydWVOYXRpdmVGdWxsU2NyZWVuID0gKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbiB8fCB0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4gfHwgdC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pO1xuXHRcdHQubmF0aXZlRnVsbFNjcmVlbkVuYWJsZWQgPSB0Lmhhc1RydWVOYXRpdmVGdWxsU2NyZWVuO1xuXHRcdFxuXHRcdC8vIEVuYWJsZWQ/XG5cdFx0aWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0dC5uYXRpdmVGdWxsU2NyZWVuRW5hYmxlZCA9IGRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbmFibGVkO1xuXHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdHQubmF0aXZlRnVsbFNjcmVlbkVuYWJsZWQgPSBkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbmFibGVkO1x0XHRcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHQuaXNDaHJvbWUpIHtcblx0XHRcdHQuaGFzU2VtaU5hdGl2ZUZ1bGxTY3JlZW4gPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHQuaGFzVHJ1ZU5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFxuXHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJyc7XG5cdFx0XHRpZiAodC5oYXNXZWJraXROYXRpdmVGdWxsU2NyZWVuKSB7IFxuXHRcdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSc7XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJ21vemZ1bGxzY3JlZW5jaGFuZ2UnO1xuXHRcdFx0XHRcblx0XHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJ01TRnVsbHNjcmVlbkNoYW5nZSc7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHQuaXNGdWxsU2NyZWVuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC5tb3pGdWxsU2NyZWVuO1xuXHRcdFx0XHRcblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC53ZWJraXRJc0Z1bGxTY3JlZW47XG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGQubXNGdWxsc2NyZWVuRWxlbWVudCAhPT0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0dC5yZXF1ZXN0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uKGVsKSB7XG5cdFx0XG5cdFx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRlbC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLm1velJlcXVlc3RGdWxsU2NyZWVuKCk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLm1zUmVxdWVzdEZ1bGxzY3JlZW4oKTtcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHQuY2FuY2VsRnVsbFNjcmVlbiA9IGZ1bmN0aW9uKCkge1x0XHRcdFx0XG5cdFx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRkb2N1bWVudC53ZWJraXRDYW5jZWxGdWxsU2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XHRcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRcblx0XHQvLyBPUyBYIDEwLjUgY2FuJ3QgZG8gdGhpcyBldmVuIGlmIGl0IHNheXMgaXQgY2FuIDooXG5cdFx0aWYgKHQuaGFzU2VtaU5hdGl2ZUZ1bGxTY3JlZW4gJiYgdWEubWF0Y2goL21hYyBvcyB4IDEwXzUvaSkpIHtcblx0XHRcdHQuaGFzTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0fVxufTtcbm1lanMuTWVkaWFGZWF0dXJlcy5pbml0KCk7XG5cbi8qXG5leHRlbnNpb24gbWV0aG9kcyB0byA8dmlkZW8+IG9yIDxhdWRpbz4gb2JqZWN0IHRvIGJyaW5nIGl0IGludG8gcGFyaXR5IHdpdGggUGx1Z2luTWVkaWFFbGVtZW50IChzZWUgYmVsb3cpXG4qL1xubWVqcy5IdG1sTWVkaWFFbGVtZW50ID0ge1xuXHRwbHVnaW5UeXBlOiAnbmF0aXZlJyxcblx0aXNGdWxsU2NyZWVuOiBmYWxzZSxcblxuXHRzZXRDdXJyZW50VGltZTogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHR0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcblx0fSxcblxuXHRzZXRNdXRlZDogZnVuY3Rpb24gKG11dGVkKSB7XG5cdFx0dGhpcy5tdXRlZCA9IG11dGVkO1xuXHR9LFxuXG5cdHNldFZvbHVtZTogZnVuY3Rpb24gKHZvbHVtZSkge1xuXHRcdHRoaXMudm9sdW1lID0gdm9sdW1lO1xuXHR9LFxuXG5cdC8vIGZvciBwYXJpdHkgd2l0aCB0aGUgcGx1Z2luIHZlcnNpb25zXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnBhdXNlKCk7XG5cdH0sXG5cblx0Ly8gVGhpcyBjYW4gYmUgYSB1cmwgc3RyaW5nXG5cdC8vIG9yIGFuIGFycmF5IFt7c3JjOidmaWxlLm1wNCcsdHlwZTondmlkZW8vbXA0J30se3NyYzonZmlsZS53ZWJtJyx0eXBlOid2aWRlby93ZWJtJ31dXG5cdHNldFNyYzogZnVuY3Rpb24gKHVybCkge1xuXHRcdFxuXHRcdC8vIEZpeCBmb3IgSUU5IHdoaWNoIGNhbid0IHNldCAuc3JjIHdoZW4gdGhlcmUgYXJlIDxzb3VyY2U+IGVsZW1lbnRzLiBBd2Vzb21lLCByaWdodD9cblx0XHR2YXIgXG5cdFx0XHRleGlzdGluZ1NvdXJjZXMgPSB0aGlzLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKTtcblx0XHR3aGlsZSAoZXhpc3RpbmdTb3VyY2VzLmxlbmd0aCA+IDApe1xuXHRcdFx0dGhpcy5yZW1vdmVDaGlsZChleGlzdGluZ1NvdXJjZXNbMF0pO1xuXHRcdH1cblx0XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT0gJ3N0cmluZycpIHtcblx0XHRcdHRoaXMuc3JjID0gdXJsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaSwgbWVkaWE7XG5cblx0XHRcdGZvciAoaT0wOyBpPHVybC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRtZWRpYSA9IHVybFtpXTtcblx0XHRcdFx0aWYgKHRoaXMuY2FuUGxheVR5cGUobWVkaWEudHlwZSkpIHtcblx0XHRcdFx0XHR0aGlzLnNyYyA9IG1lZGlhLnNyYztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzZXRWaWRlb1NpemU6IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG59O1xuXG4vKlxuTWltaWNzIHRoZSA8dmlkZW8vYXVkaW8+IGVsZW1lbnQgYnkgY2FsbGluZyBGbGFzaCdzIEV4dGVybmFsIEludGVyZmFjZSBvciBTaWx2ZXJsaWdodHMgW1NjcmlwdGFibGVNZW1iZXJdXG4qL1xubWVqcy5QbHVnaW5NZWRpYUVsZW1lbnQgPSBmdW5jdGlvbiAocGx1Z2luaWQsIHBsdWdpblR5cGUsIG1lZGlhVXJsKSB7XG5cdHRoaXMuaWQgPSBwbHVnaW5pZDtcblx0dGhpcy5wbHVnaW5UeXBlID0gcGx1Z2luVHlwZTtcblx0dGhpcy5zcmMgPSBtZWRpYVVybDtcblx0dGhpcy5ldmVudHMgPSB7fTtcblx0dGhpcy5hdHRyaWJ1dGVzID0ge307XG59O1xuXG4vLyBKYXZhU2NyaXB0IHZhbHVlcyBhbmQgRXh0ZXJuYWxJbnRlcmZhY2UgbWV0aG9kcyB0aGF0IG1hdGNoIEhUTUw1IHZpZGVvIHByb3BlcnRpZXMgbWV0aG9kc1xuLy8gaHR0cDovL3d3dy5hZG9iZS5jb20vbGl2ZWRvY3MvZmxhc2gvOS4wL0FjdGlvblNjcmlwdExhbmdSZWZWMy9mbC92aWRlby9GTFZQbGF5YmFjay5odG1sXG4vLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS92aWRlby5odG1sXG5tZWpzLlBsdWdpbk1lZGlhRWxlbWVudC5wcm90b3R5cGUgPSB7XG5cblx0Ly8gc3BlY2lhbFxuXHRwbHVnaW5FbGVtZW50OiBudWxsLFxuXHRwbHVnaW5UeXBlOiAnJyxcblx0aXNGdWxsU2NyZWVuOiBmYWxzZSxcblxuXHQvLyBub3QgaW1wbGVtZW50ZWQgOihcblx0cGxheWJhY2tSYXRlOiAtMSxcblx0ZGVmYXVsdFBsYXliYWNrUmF0ZTogLTEsXG5cdHNlZWthYmxlOiBbXSxcblx0cGxheWVkOiBbXSxcblxuXHQvLyBIVE1MNSByZWFkLW9ubHkgcHJvcGVydGllc1xuXHRwYXVzZWQ6IHRydWUsXG5cdGVuZGVkOiBmYWxzZSxcblx0c2Vla2luZzogZmFsc2UsXG5cdGR1cmF0aW9uOiAwLFxuXHRlcnJvcjogbnVsbCxcblx0dGFnTmFtZTogJycsXG5cblx0Ly8gSFRNTDUgZ2V0L3NldCBwcm9wZXJ0aWVzLCBidXQgb25seSBzZXQgKHVwZGF0ZWQgYnkgZXZlbnQgaGFuZGxlcnMpXG5cdG11dGVkOiBmYWxzZSxcblx0dm9sdW1lOiAxLFxuXHRjdXJyZW50VGltZTogMCxcblxuXHQvLyBIVE1MNSBtZXRob2RzXG5cdHBsYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkucGxheVZpZGVvKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5wbGF5TWVkaWEoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucGF1c2VkID0gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRsb2FkOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5sb2FkTWVkaWEoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy5wYXVzZWQgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdHBhdXNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBhdXNlVmlkZW8oKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBhdXNlTWVkaWEoKTtcblx0XHRcdH1cdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHR0aGlzLnBhdXNlZCA9IHRydWU7XG5cdFx0fVxuXHR9LFxuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnN0b3BWaWRlbygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc3RvcE1lZGlhKCk7XG5cdFx0XHR9XHRcblx0XHRcdHRoaXMucGF1c2VkID0gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNhblBsYXlUeXBlOiBmdW5jdGlvbih0eXBlKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRqLFxuXHRcdFx0cGx1Z2luSW5mbyxcblx0XHRcdHBsdWdpblZlcnNpb25zID0gbWVqcy5wbHVnaW5zW3RoaXMucGx1Z2luVHlwZV07XG5cblx0XHRmb3IgKGk9MDsgaTxwbHVnaW5WZXJzaW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cGx1Z2luSW5mbyA9IHBsdWdpblZlcnNpb25zW2ldO1xuXG5cdFx0XHQvLyB0ZXN0IGlmIHVzZXIgaGFzIHRoZSBjb3JyZWN0IHBsdWdpbiB2ZXJzaW9uXG5cdFx0XHRpZiAobWVqcy5QbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKHRoaXMucGx1Z2luVHlwZSwgcGx1Z2luSW5mby52ZXJzaW9uKSkge1xuXG5cdFx0XHRcdC8vIHRlc3QgZm9yIHBsdWdpbiBwbGF5YmFjayB0eXBlc1xuXHRcdFx0XHRmb3IgKGo9MDsgajxwbHVnaW5JbmZvLnR5cGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0Ly8gZmluZCBwbHVnaW4gdGhhdCBjYW4gcGxheSB0aGUgdHlwZVxuXHRcdFx0XHRcdGlmICh0eXBlID09IHBsdWdpbkluZm8udHlwZXNbal0pIHtcblx0XHRcdFx0XHRcdHJldHVybiAncHJvYmFibHknO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAnJztcblx0fSxcblx0XG5cdHBvc2l0aW9uRnVsbHNjcmVlbkJ1dHRvbjogZnVuY3Rpb24oeCx5LHZpc2libGVBbmRBYm92ZSkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnBvc2l0aW9uRnVsbHNjcmVlbkJ1dHRvbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkucG9zaXRpb25GdWxsc2NyZWVuQnV0dG9uKE1hdGguZmxvb3IoeCksTWF0aC5mbG9vcih5KSx2aXNpYmxlQW5kQWJvdmUpO1xuXHRcdH1cblx0fSxcblx0XG5cdGhpZGVGdWxsc2NyZWVuQnV0dG9uOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5oaWRlRnVsbHNjcmVlbkJ1dHRvbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkuaGlkZUZ1bGxzY3JlZW5CdXR0b24oKTtcblx0XHR9XHRcdFxuXHR9LFx0XG5cdFxuXG5cdC8vIGN1c3RvbSBtZXRob2RzIHNpbmNlIG5vdCBhbGwgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbnMgc3VwcG9ydCBnZXQvc2V0XG5cblx0Ly8gVGhpcyBjYW4gYmUgYSB1cmwgc3RyaW5nXG5cdC8vIG9yIGFuIGFycmF5IFt7c3JjOidmaWxlLm1wNCcsdHlwZTondmlkZW8vbXA0J30se3NyYzonZmlsZS53ZWJtJyx0eXBlOid2aWRlby93ZWJtJ31dXG5cdHNldFNyYzogZnVuY3Rpb24gKHVybCkge1xuXHRcdGlmICh0eXBlb2YgdXJsID09ICdzdHJpbmcnKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRTcmMobWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwodXJsKSk7XG5cdFx0XHR0aGlzLnNyYyA9IG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKHVybCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpLCBtZWRpYTtcblxuXHRcdFx0Zm9yIChpPTA7IGk8dXJsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG1lZGlhID0gdXJsW2ldO1xuXHRcdFx0XHRpZiAodGhpcy5jYW5QbGF5VHlwZShtZWRpYS50eXBlKSkge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFNyYyhtZWpzLlV0aWxpdHkuYWJzb2x1dGl6ZVVybChtZWRpYS5zcmMpKTtcblx0XHRcdFx0XHR0aGlzLnNyYyA9IG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKHVybCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0fSxcblx0c2V0Q3VycmVudFRpbWU6IGZ1bmN0aW9uICh0aW1lKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNlZWtUbyh0aW1lKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldEN1cnJlbnRUaW1lKHRpbWUpO1xuXHRcdFx0fVx0XHRcdFx0XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHR0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcblx0XHR9XG5cdH0sXG5cdHNldFZvbHVtZTogZnVuY3Rpb24gKHZvbHVtZSkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsKSB7XG5cdFx0XHQvLyBzYW1lIG9uIFlvdVR1YmUgYW5kIE1FanNcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFZvbHVtZSh2b2x1bWUgKiAxMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0Vm9sdW1lKHZvbHVtZSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnZvbHVtZSA9IHZvbHVtZTtcblx0XHR9XG5cdH0sXG5cdHNldE11dGVkOiBmdW5jdGlvbiAobXV0ZWQpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScpIHtcblx0XHRcdFx0aWYgKG11dGVkKSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5BcGkubXV0ZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luQXBpLnVuTXV0ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubXV0ZWQgPSBtdXRlZDtcblx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCd2b2x1bWVjaGFuZ2UnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldE11dGVkKG11dGVkKTtcblx0XHRcdH1cblx0XHRcdHRoaXMubXV0ZWQgPSBtdXRlZDtcblx0XHR9XG5cdH0sXG5cblx0Ly8gYWRkaXRpb25hbCBub24tSFRNTDUgbWV0aG9kc1xuXHRzZXRWaWRlb1NpemU6IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0XG5cdFx0Ly9pZiAodGhpcy5wbHVnaW5UeXBlID09ICdmbGFzaCcgfHwgdGhpcy5wbHVnaW5UeXBlID09ICdzaWx2ZXJsaWdodCcpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpbkVsZW1lbnQgJiYgdGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luRWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5zZXRWaWRlb1NpemUpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0VmlkZW9TaXplKHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0fVxuXHRcdC8vfVxuXHR9LFxuXG5cdHNldEZ1bGxzY3JlZW46IGZ1bmN0aW9uIChmdWxsc2NyZWVuKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbihmdWxsc2NyZWVuKTtcblx0XHR9XG5cdH0sXG5cdFxuXHRlbnRlckZ1bGxTY3JlZW46IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldEZ1bGxzY3JlZW4pIHtcblx0XHRcdHRoaXMuc2V0RnVsbHNjcmVlbih0cnVlKTtcblx0XHR9XHRcdFxuXHRcdFxuXHR9LFxuXHRcblx0ZXhpdEZ1bGxTY3JlZW46IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldEZ1bGxzY3JlZW4pIHtcblx0XHRcdHRoaXMuc2V0RnVsbHNjcmVlbihmYWxzZSk7XG5cdFx0fVxuXHR9LFx0XG5cblx0Ly8gc3RhcnQ6IGZha2UgZXZlbnRzXG5cdGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrLCBidWJibGUpIHtcblx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXTtcblx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xuXHR9LFxuXHRyZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuXHRcdGlmICghZXZlbnROYW1lKSB7IHRoaXMuZXZlbnRzID0ge307IHJldHVybiB0cnVlOyB9XG5cdFx0dmFyIGNhbGxiYWNrcyA9IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV07XG5cdFx0aWYgKCFjYWxsYmFja3MpIHJldHVybiB0cnVlO1xuXHRcdGlmICghY2FsbGJhY2spIHsgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdOyByZXR1cm4gdHJ1ZTsgfVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoY2FsbGJhY2tzW2ldID09PSBjYWxsYmFjaykge1xuXHRcdFx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdLnNwbGljZShpLCAxKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcdFxuXHRkaXNwYXRjaEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRhcmdzLFxuXHRcdFx0Y2FsbGJhY2tzID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXTtcblxuXHRcdGlmIChjYWxsYmFja3MpIHtcblx0XHRcdGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvLyBlbmQ6IGZha2UgZXZlbnRzXG5cdFxuXHQvLyBmYWtlIERPTSBhdHRyaWJ1dGUgbWV0aG9kc1xuXHRoYXNBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdHJldHVybiAobmFtZSBpbiB0aGlzLmF0dHJpYnV0ZXMpOyAgXG5cdH0sXG5cdHJlbW92ZUF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG5cdFx0ZGVsZXRlIHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcblx0fSxcblx0Z2V0QXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcblx0XHRpZiAodGhpcy5oYXNBdHRyaWJ1dGUobmFtZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG5cdFx0fVxuXHRcdHJldHVybiAnJztcblx0fSxcblx0c2V0QXR0cmlidXRlOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSl7XG5cdFx0dGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gdmFsdWU7XG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHRtZWpzLlV0aWxpdHkucmVtb3ZlU3dmKHRoaXMucGx1Z2luRWxlbWVudC5pZCk7XG5cdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS51bnJlZ2lzdGVyUGx1Z2luRWxlbWVudCh0aGlzLnBsdWdpbkVsZW1lbnQuaWQpO1xuXHR9XG59O1xuXG4vLyBIYW5kbGVzIGNhbGxzIGZyb20gRmxhc2gvU2lsdmVybGlnaHQgYW5kIHJlcG9ydHMgdGhlbSBhcyBuYXRpdmUgPHZpZGVvL2F1ZGlvPiBldmVudHMgYW5kIHByb3BlcnRpZXNcbm1lanMuTWVkaWFQbHVnaW5CcmlkZ2UgPSB7XG5cblx0cGx1Z2luTWVkaWFFbGVtZW50czp7fSxcblx0aHRtbE1lZGlhRWxlbWVudHM6e30sXG5cblx0cmVnaXN0ZXJQbHVnaW5FbGVtZW50OiBmdW5jdGlvbiAoaWQsIHBsdWdpbk1lZGlhRWxlbWVudCwgaHRtbE1lZGlhRWxlbWVudCkge1xuXHRcdHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF0gPSBwbHVnaW5NZWRpYUVsZW1lbnQ7XG5cdFx0dGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF0gPSBodG1sTWVkaWFFbGVtZW50O1xuXHR9LFxuXG5cdHVucmVnaXN0ZXJQbHVnaW5FbGVtZW50OiBmdW5jdGlvbiAoaWQpIHtcblx0XHRkZWxldGUgdGhpcy5wbHVnaW5NZWRpYUVsZW1lbnRzW2lkXTtcblx0XHRkZWxldGUgdGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF07XG5cdH0sXG5cblx0Ly8gd2hlbiBGbGFzaC9TaWx2ZXJsaWdodCBpcyByZWFkeSwgaXQgY2FsbHMgb3V0IHRvIHRoaXMgbWV0aG9kXG5cdGluaXRQbHVnaW46IGZ1bmN0aW9uIChpZCkge1xuXG5cdFx0dmFyIHBsdWdpbk1lZGlhRWxlbWVudCA9IHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF0sXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50ID0gdGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF07XG5cblx0XHRpZiAocGx1Z2luTWVkaWFFbGVtZW50KSB7XG5cdFx0XHQvLyBmaW5kIHRoZSBqYXZhc2NyaXB0IGJyaWRnZVxuXHRcdFx0c3dpdGNoIChwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luVHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiZmxhc2hcIjpcblx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudCA9IHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJzaWx2ZXJsaWdodFwiOlxuXHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGx1Z2luTWVkaWFFbGVtZW50LmlkKTtcblx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQuQ29udGVudC5NZWRpYUVsZW1lbnRKUztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XG5cdFx0XHRpZiAocGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkFwaSAhPSBudWxsICYmIHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzKSB7XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzKHBsdWdpbk1lZGlhRWxlbWVudCwgaHRtbE1lZGlhRWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vIHJlY2VpdmVzIGV2ZW50cyBmcm9tIEZsYXNoL1NpbHZlcmxpZ2h0IGFuZCBzZW5kcyB0aGVtIG91dCBhcyBIVE1MNSBtZWRpYSBldmVudHNcblx0Ly8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdmlkZW8uaHRtbFxuXHRmaXJlRXZlbnQ6IGZ1bmN0aW9uIChpZCwgZXZlbnROYW1lLCB2YWx1ZXMpIHtcblxuXHRcdHZhclxuXHRcdFx0ZSxcblx0XHRcdGksXG5cdFx0XHRidWZmZXJlZFRpbWUsXG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSB0aGlzLnBsdWdpbk1lZGlhRWxlbWVudHNbaWRdO1xuXG5cdFx0aWYoIXBsdWdpbk1lZGlhRWxlbWVudCl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG5cdFx0Ly8gZmFrZSBldmVudCBvYmplY3QgdG8gbWltaWMgcmVhbCBIVE1MIG1lZGlhIGV2ZW50LlxuXHRcdGUgPSB7XG5cdFx0XHR0eXBlOiBldmVudE5hbWUsXG5cdFx0XHR0YXJnZXQ6IHBsdWdpbk1lZGlhRWxlbWVudFxuXHRcdH07XG5cblx0XHQvLyBhdHRhY2ggYWxsIHZhbHVlcyB0byBlbGVtZW50IGFuZCBldmVudCBvYmplY3Rcblx0XHRmb3IgKGkgaW4gdmFsdWVzKSB7XG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnRbaV0gPSB2YWx1ZXNbaV07XG5cdFx0XHRlW2ldID0gdmFsdWVzW2ldO1xuXHRcdH1cblxuXHRcdC8vIGZha2UgdGhlIG5ld2VyIFczQyBidWZmZXJlZCBUaW1lUmFuZ2UgKGxvYWRlZCBhbmQgdG90YWwgaGF2ZSBiZWVuIHJlbW92ZWQpXG5cdFx0YnVmZmVyZWRUaW1lID0gdmFsdWVzLmJ1ZmZlcmVkVGltZSB8fCAwO1xuXG5cdFx0ZS50YXJnZXQuYnVmZmVyZWQgPSBlLmJ1ZmZlcmVkID0ge1xuXHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSxcblx0XHRcdGVuZDogZnVuY3Rpb24gKGluZGV4KSB7XG5cdFx0XHRcdHJldHVybiBidWZmZXJlZFRpbWU7XG5cdFx0XHR9LFxuXHRcdFx0bGVuZ3RoOiAxXG5cdFx0fTtcblxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kaXNwYXRjaEV2ZW50KGUudHlwZSwgZSk7XG5cdH1cbn07XG5cbi8qXG5EZWZhdWx0IG9wdGlvbnNcbiovXG5tZWpzLk1lZGlhRWxlbWVudERlZmF1bHRzID0ge1xuXHQvLyBhbGxvd3MgdGVzdGluZyBvbiBIVE1MNSwgZmxhc2gsIHNpbHZlcmxpZ2h0XG5cdC8vIGF1dG86IGF0dGVtcHRzIHRvIGRldGVjdCB3aGF0IHRoZSBicm93c2VyIGNhbiBkb1xuXHQvLyBhdXRvX3BsdWdpbjogcHJlZmVyIHBsdWdpbnMgYW5kIHRoZW4gYXR0ZW1wdCBuYXRpdmUgSFRNTDVcblx0Ly8gbmF0aXZlOiBmb3JjZXMgSFRNTDUgcGxheWJhY2tcblx0Ly8gc2hpbTogZGlzYWxsb3dzIEhUTUw1LCB3aWxsIGF0dGVtcHQgZWl0aGVyIEZsYXNoIG9yIFNpbHZlcmxpZ2h0XG5cdC8vIG5vbmU6IGZvcmNlcyBmYWxsYmFjayB2aWV3XG5cdG1vZGU6ICdhdXRvJyxcblx0Ly8gcmVtb3ZlIG9yIHJlb3JkZXIgdG8gY2hhbmdlIHBsdWdpbiBwcmlvcml0eSBhbmQgYXZhaWxhYmlsaXR5XG5cdHBsdWdpbnM6IFsnZmxhc2gnLCdzaWx2ZXJsaWdodCcsJ3lvdXR1YmUnLCd2aW1lbyddLFxuXHQvLyBzaG93cyBkZWJ1ZyBlcnJvcnMgb24gc2NyZWVuXG5cdGVuYWJsZVBsdWdpbkRlYnVnOiBmYWxzZSxcblx0Ly8gdXNlIHBsdWdpbiBmb3IgYnJvd3NlcnMgdGhhdCBoYXZlIHRyb3VibGUgd2l0aCBCYXNpYyBBdXRoZW50aWNhdGlvbiBvbiBIVFRQUyBzaXRlc1xuXHRodHRwc0Jhc2ljQXV0aFNpdGU6IGZhbHNlLFxuXHQvLyBvdmVycmlkZXMgdGhlIHR5cGUgc3BlY2lmaWVkLCB1c2VmdWwgZm9yIGR5bmFtaWMgaW5zdGFudGlhdGlvblxuXHR0eXBlOiAnJyxcblx0Ly8gcGF0aCB0byBGbGFzaCBhbmQgU2lsdmVybGlnaHQgcGx1Z2luc1xuXHRwbHVnaW5QYXRoOiBtZWpzLlV0aWxpdHkuZ2V0U2NyaXB0UGF0aChbJ21lZGlhZWxlbWVudC5qcycsJ21lZGlhZWxlbWVudC5taW4uanMnLCdtZWRpYWVsZW1lbnQtYW5kLXBsYXllci5qcycsJ21lZGlhZWxlbWVudC1hbmQtcGxheWVyLm1pbi5qcyddKSxcblx0Ly8gbmFtZSBvZiBmbGFzaCBmaWxlXG5cdGZsYXNoTmFtZTogJ2ZsYXNobWVkaWFlbGVtZW50LnN3ZicsXG5cdC8vIHN0cmVhbWVyIGZvciBSVE1QIHN0cmVhbWluZ1xuXHRmbGFzaFN0cmVhbWVyOiAnJyxcblx0Ly8gdHVybnMgb24gdGhlIHNtb290aGluZyBmaWx0ZXIgaW4gRmxhc2hcblx0ZW5hYmxlUGx1Z2luU21vb3RoaW5nOiBmYWxzZSxcblx0Ly8gZW5hYmxlZCBwc2V1ZG8tc3RyZWFtaW5nIChzZWVrKSBvbiAubXA0IGZpbGVzXG5cdGVuYWJsZVBzZXVkb1N0cmVhbWluZzogZmFsc2UsXG5cdC8vIHN0YXJ0IHF1ZXJ5IHBhcmFtZXRlciBzZW50IHRvIHNlcnZlciBmb3IgcHNldWRvLXN0cmVhbWluZ1xuXHRwc2V1ZG9TdHJlYW1pbmdTdGFydFF1ZXJ5UGFyYW06ICdzdGFydCcsXG5cdC8vIG5hbWUgb2Ygc2lsdmVybGlnaHQgZmlsZVxuXHRzaWx2ZXJsaWdodE5hbWU6ICdzaWx2ZXJsaWdodG1lZGlhZWxlbWVudC54YXAnLFxuXHQvLyBkZWZhdWx0IGlmIHRoZSA8dmlkZW8gd2lkdGg+IGlzIG5vdCBzcGVjaWZpZWRcblx0ZGVmYXVsdFZpZGVvV2lkdGg6IDQ4MCxcblx0Ly8gZGVmYXVsdCBpZiB0aGUgPHZpZGVvIGhlaWdodD4gaXMgbm90IHNwZWNpZmllZFxuXHRkZWZhdWx0VmlkZW9IZWlnaHQ6IDI3MCxcblx0Ly8gb3ZlcnJpZGVzIDx2aWRlbyB3aWR0aD5cblx0cGx1Z2luV2lkdGg6IC0xLFxuXHQvLyBvdmVycmlkZXMgPHZpZGVvIGhlaWdodD5cblx0cGx1Z2luSGVpZ2h0OiAtMSxcblx0Ly8gYWRkaXRpb25hbCBwbHVnaW4gdmFyaWFibGVzIGluICdrZXk9dmFsdWUnIGZvcm1cblx0cGx1Z2luVmFyczogW10sXHRcblx0Ly8gcmF0ZSBpbiBtaWxsaXNlY29uZHMgZm9yIEZsYXNoIGFuZCBTaWx2ZXJsaWdodCB0byBmaXJlIHRoZSB0aW1ldXBkYXRlIGV2ZW50XG5cdC8vIGxhcmdlciBudW1iZXIgaXMgbGVzcyBhY2N1cmF0ZSwgYnV0IGxlc3Mgc3RyYWluIG9uIHBsdWdpbi0+SmF2YVNjcmlwdCBicmlkZ2Vcblx0dGltZXJSYXRlOiAyNTAsXG5cdC8vIGluaXRpYWwgdm9sdW1lIGZvciBwbGF5ZXJcblx0c3RhcnRWb2x1bWU6IDAuOCxcblx0c3VjY2VzczogZnVuY3Rpb24gKCkgeyB9LFxuXHRlcnJvcjogZnVuY3Rpb24gKCkgeyB9XG59O1xuXG4vKlxuRGV0ZXJtaW5lcyBpZiBhIGJyb3dzZXIgc3VwcG9ydHMgdGhlIDx2aWRlbz4gb3IgPGF1ZGlvPiBlbGVtZW50XG5hbmQgcmV0dXJucyBlaXRoZXIgdGhlIG5hdGl2ZSBlbGVtZW50IG9yIGEgRmxhc2gvU2lsdmVybGlnaHQgdmVyc2lvbiB0aGF0XG5taW1pY3MgSFRNTDUgTWVkaWFFbGVtZW50XG4qL1xubWVqcy5NZWRpYUVsZW1lbnQgPSBmdW5jdGlvbiAoZWwsIG8pIHtcblx0cmV0dXJuIG1lanMuSHRtbE1lZGlhRWxlbWVudFNoaW0uY3JlYXRlKGVsLG8pO1xufTtcblxubWVqcy5IdG1sTWVkaWFFbGVtZW50U2hpbSA9IHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKGVsLCBvKSB7XG5cdFx0dmFyXG5cdFx0XHRvcHRpb25zID0gbWVqcy5NZWRpYUVsZW1lbnREZWZhdWx0cyxcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSAodHlwZW9mKGVsKSA9PSAnc3RyaW5nJykgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbCkgOiBlbCxcblx0XHRcdHRhZ05hbWUgPSBodG1sTWVkaWFFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcblx0XHRcdGlzTWVkaWFUYWcgPSAodGFnTmFtZSA9PT0gJ2F1ZGlvJyB8fCB0YWdOYW1lID09PSAndmlkZW8nKSxcblx0XHRcdHNyYyA9IChpc01lZGlhVGFnKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSA6IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyksXG5cdFx0XHRwb3N0ZXIgPSBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdGVyJyksXG5cdFx0XHRhdXRvcGxheSA9ICBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnYXV0b3BsYXknKSxcblx0XHRcdHByZWxvYWQgPSAgaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3ByZWxvYWQnKSxcblx0XHRcdGNvbnRyb2xzID0gIGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjb250cm9scycpLFxuXHRcdFx0cGxheWJhY2ssXG5cdFx0XHRwcm9wO1xuXG5cdFx0Ly8gZXh0ZW5kIG9wdGlvbnNcblx0XHRmb3IgKHByb3AgaW4gbykge1xuXHRcdFx0b3B0aW9uc1twcm9wXSA9IG9bcHJvcF07XG5cdFx0fVxuXG5cdFx0Ly8gY2xlYW4gdXAgYXR0cmlidXRlc1xuXHRcdHNyYyA9IFx0XHQodHlwZW9mIHNyYyA9PSAndW5kZWZpbmVkJyBcdHx8IHNyYyA9PT0gbnVsbCB8fCBzcmMgPT0gJycpID8gbnVsbCA6IHNyYztcdFx0XG5cdFx0cG9zdGVyID1cdCh0eXBlb2YgcG9zdGVyID09ICd1bmRlZmluZWQnIFx0fHwgcG9zdGVyID09PSBudWxsKSA/ICcnIDogcG9zdGVyO1xuXHRcdHByZWxvYWQgPSBcdCh0eXBlb2YgcHJlbG9hZCA9PSAndW5kZWZpbmVkJyBcdHx8IHByZWxvYWQgPT09IG51bGwgfHwgcHJlbG9hZCA9PT0gJ2ZhbHNlJykgPyAnbm9uZScgOiBwcmVsb2FkO1xuXHRcdGF1dG9wbGF5ID0gXHQhKHR5cGVvZiBhdXRvcGxheSA9PSAndW5kZWZpbmVkJyB8fCBhdXRvcGxheSA9PT0gbnVsbCB8fCBhdXRvcGxheSA9PT0gJ2ZhbHNlJyk7XG5cdFx0Y29udHJvbHMgPSBcdCEodHlwZW9mIGNvbnRyb2xzID09ICd1bmRlZmluZWQnIHx8IGNvbnRyb2xzID09PSBudWxsIHx8IGNvbnRyb2xzID09PSAnZmFsc2UnKTtcblxuXHRcdC8vIHRlc3QgZm9yIEhUTUw1IGFuZCBwbHVnaW4gY2FwYWJpbGl0aWVzXG5cdFx0cGxheWJhY2sgPSB0aGlzLmRldGVybWluZVBsYXliYWNrKGh0bWxNZWRpYUVsZW1lbnQsIG9wdGlvbnMsIG1lanMuTWVkaWFGZWF0dXJlcy5zdXBwb3J0c01lZGlhVGFnLCBpc01lZGlhVGFnLCBzcmMpO1xuXHRcdHBsYXliYWNrLnVybCA9IChwbGF5YmFjay51cmwgIT09IG51bGwpID8gbWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwocGxheWJhY2sudXJsKSA6ICcnO1xuXG5cdFx0aWYgKHBsYXliYWNrLm1ldGhvZCA9PSAnbmF0aXZlJykge1xuXHRcdFx0Ly8gc2Vjb25kIGZpeCBmb3IgYW5kcm9pZFxuXHRcdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0J1c3RlZEFuZHJvaWQpIHtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSBwbGF5YmFjay51cmw7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBsYXkoKTtcblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFxuXHRcdFx0Ly8gYWRkIG1ldGhvZHMgdG8gbmF0aXZlIEhUTUxNZWRpYUVsZW1lbnRcblx0XHRcdHJldHVybiB0aGlzLnVwZGF0ZU5hdGl2ZShwbGF5YmFjaywgb3B0aW9ucywgYXV0b3BsYXksIHByZWxvYWQpO1xuXHRcdH0gZWxzZSBpZiAocGxheWJhY2subWV0aG9kICE9PSAnJykge1xuXHRcdFx0Ly8gY3JlYXRlIHBsdWdpbiB0byBtaW1pYyBIVE1MTWVkaWFFbGVtZW50XG5cdFx0XHRcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZVBsdWdpbiggcGxheWJhY2ssICBvcHRpb25zLCBwb3N0ZXIsIGF1dG9wbGF5LCBwcmVsb2FkLCBjb250cm9scyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGJvbywgbm8gSFRNTDUsIG5vIEZsYXNoLCBubyBTaWx2ZXJsaWdodC5cblx0XHRcdHRoaXMuY3JlYXRlRXJyb3JNZXNzYWdlKCBwbGF5YmFjaywgb3B0aW9ucywgcG9zdGVyICk7XG5cdFx0XHRcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSxcblx0XG5cdGRldGVybWluZVBsYXliYWNrOiBmdW5jdGlvbihodG1sTWVkaWFFbGVtZW50LCBvcHRpb25zLCBzdXBwb3J0c01lZGlhVGFnLCBpc01lZGlhVGFnLCBzcmMpIHtcblx0XHR2YXJcblx0XHRcdG1lZGlhRmlsZXMgPSBbXSxcblx0XHRcdGksXG5cdFx0XHRqLFxuXHRcdFx0ayxcblx0XHRcdGwsXG5cdFx0XHRuLFxuXHRcdFx0dHlwZSxcblx0XHRcdHJlc3VsdCA9IHsgbWV0aG9kOiAnJywgdXJsOiAnJywgaHRtbE1lZGlhRWxlbWVudDogaHRtbE1lZGlhRWxlbWVudCwgaXNWaWRlbzogKGh0bWxNZWRpYUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9ICdhdWRpbycpfSxcblx0XHRcdHBsdWdpbk5hbWUsXG5cdFx0XHRwbHVnaW5WZXJzaW9ucyxcblx0XHRcdHBsdWdpbkluZm8sXG5cdFx0XHRkdW1teSxcblx0XHRcdG1lZGlhO1xuXHRcdFx0XG5cdFx0Ly8gU1RFUCAxOiBHZXQgVVJMIGFuZCB0eXBlIGZyb20gPHZpZGVvIHNyYz4gb3IgPHNvdXJjZSBzcmM+XG5cblx0XHQvLyBzdXBwbGllZCB0eXBlIG92ZXJyaWRlcyA8dmlkZW8gdHlwZT4gYW5kIDxzb3VyY2UgdHlwZT5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHlwZSAhPSAndW5kZWZpbmVkJyAmJiBvcHRpb25zLnR5cGUgIT09ICcnKSB7XG5cdFx0XHRcblx0XHRcdC8vIGFjY2VwdCBlaXRoZXIgc3RyaW5nIG9yIGFycmF5IG9mIHR5cGVzXG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHlwZSA9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRtZWRpYUZpbGVzLnB1c2goe3R5cGU6b3B0aW9ucy50eXBlLCB1cmw6c3JjfSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yIChpPTA7IGk8b3B0aW9ucy50eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOm9wdGlvbnMudHlwZVtpXSwgdXJsOnNyY30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHQvLyB0ZXN0IGZvciBzcmMgYXR0cmlidXRlIGZpcnN0XG5cdFx0fSBlbHNlIGlmIChzcmMgIT09IG51bGwpIHtcblx0XHRcdHR5cGUgPSB0aGlzLmZvcm1hdFR5cGUoc3JjLCBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKTtcblx0XHRcdG1lZGlhRmlsZXMucHVzaCh7dHlwZTp0eXBlLCB1cmw6c3JjfSk7XG5cblx0XHQvLyB0aGVuIHRlc3QgZm9yIDxzb3VyY2U+IGVsZW1lbnRzXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRlc3QgPHNvdXJjZT4gdHlwZXMgdG8gc2VlIGlmIHRoZXkgYXJlIHVzYWJsZVxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGh0bWxNZWRpYUVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRuID0gaHRtbE1lZGlhRWxlbWVudC5jaGlsZE5vZGVzW2ldO1xuXHRcdFx0XHRpZiAobi5ub2RlVHlwZSA9PSAxICYmIG4udGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICdzb3VyY2UnKSB7XG5cdFx0XHRcdFx0c3JjID0gbi5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXHRcdFx0XHRcdHR5cGUgPSB0aGlzLmZvcm1hdFR5cGUoc3JjLCBuLmdldEF0dHJpYnV0ZSgndHlwZScpKTtcblx0XHRcdFx0XHRtZWRpYSA9IG4uZ2V0QXR0cmlidXRlKCdtZWRpYScpO1xuXG5cdFx0XHRcdFx0aWYgKCFtZWRpYSB8fCAhd2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhICYmIHdpbmRvdy5tYXRjaE1lZGlhKG1lZGlhKS5tYXRjaGVzKSkge1xuXHRcdFx0XHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOnR5cGUsIHVybDpzcmN9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gaW4gdGhlIGNhc2Ugb2YgZHluYW1pY2x5IGNyZWF0ZWQgcGxheWVyc1xuXHRcdC8vIGNoZWNrIGZvciBhdWRpbyB0eXBlc1xuXHRcdGlmICghaXNNZWRpYVRhZyAmJiBtZWRpYUZpbGVzLmxlbmd0aCA+IDAgJiYgbWVkaWFGaWxlc1swXS51cmwgIT09IG51bGwgJiYgdGhpcy5nZXRUeXBlRnJvbUZpbGUobWVkaWFGaWxlc1swXS51cmwpLmluZGV4T2YoJ2F1ZGlvJykgPiAtMSkge1xuXHRcdFx0cmVzdWx0LmlzVmlkZW8gPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cblx0XHQvLyBTVEVQIDI6IFRlc3QgZm9yIHBsYXliYWNrIG1ldGhvZFxuXHRcdFxuXHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgQW5kcm9pZCB3aGljaCBzYWRseSBkb2Vzbid0IGltcGxlbWVudCB0aGUgY2FuUGxheVR5cGUgZnVuY3Rpb24gKGFsd2F5cyByZXR1cm5zICcnKVxuXHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNCdXN0ZWRBbmRyb2lkKSB7XG5cdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuXHRcdFx0XHRyZXR1cm4gKHR5cGUubWF0Y2goL3ZpZGVvXFwvKG1wNHxtNHYpL2dpKSAhPT0gbnVsbCkgPyAnbWF5YmUnIDogJyc7XG5cdFx0XHR9O1xuXHRcdH1cdFx0XG5cdFx0XG5cdFx0Ly8gc3BlY2lhbCBjYXNlIGZvciBDaHJvbWl1bSB0byBzcGVjaWZ5IG5hdGl2ZWx5IHN1cHBvcnRlZCB2aWRlbyBjb2RlY3MgKGkuZS4gV2ViTSBhbmQgVGhlb3JhKSBcblx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzQ2hyb21pdW0pIHsgXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlID0gZnVuY3Rpb24odHlwZSkgeyBcblx0XHRcdFx0cmV0dXJuICh0eXBlLm1hdGNoKC92aWRlb1xcLyh3ZWJtfG9ndnxvZ2cpL2dpKSAhPT0gbnVsbCkgPyAnbWF5YmUnIDogJyc7IFxuXHRcdFx0fTsgXG5cdFx0fVxuXG5cdFx0Ly8gdGVzdCBmb3IgbmF0aXZlIHBsYXliYWNrIGZpcnN0XG5cdFx0aWYgKHN1cHBvcnRzTWVkaWFUYWcgJiYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG8nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyB8fCBvcHRpb25zLm1vZGUgPT09ICduYXRpdmUnKSAgJiYgIShtZWpzLk1lZGlhRmVhdHVyZXMuaXNCdXN0ZWROYXRpdmVIVFRQUyAmJiBvcHRpb25zLmh0dHBzQmFzaWNBdXRoU2l0ZSA9PT0gdHJ1ZSkpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0aWYgKCFpc01lZGlhVGFnKSB7XG5cblx0XHRcdFx0Ly8gY3JlYXRlIGEgcmVhbCBIVE1MNSBNZWRpYSBFbGVtZW50IFxuXHRcdFx0XHRkdW1teSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIHJlc3VsdC5pc1ZpZGVvID8gJ3ZpZGVvJyA6ICdhdWRpbycpO1x0XHRcdFxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGR1bW15LCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gdXNlIHRoaXMgb25lIGZyb20gbm93IG9uXG5cdFx0XHRcdHJlc3VsdC5odG1sTWVkaWFFbGVtZW50ID0gaHRtbE1lZGlhRWxlbWVudCA9IGR1bW15O1xuXHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdGZvciAoaT0wOyBpPG1lZGlhRmlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gbm9ybWFsIGNoZWNrXG5cdFx0XHRcdGlmIChtZWRpYUZpbGVzW2ldLnR5cGUgPT0gXCJ2aWRlby9tM3U4XCIgfHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJ1xuXHRcdFx0XHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgTWFjL1NhZmFyaSA1LjAuMyB3aGljaCBhbnN3ZXJzICcnIHRvIGNhblBsYXlUeXBlKCdhdWRpby9tcDMnKSBidXQgJ21heWJlJyB0byBjYW5QbGF5VHlwZSgnYXVkaW8vbXBlZycpXG5cdFx0XHRcdFx0fHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUucmVwbGFjZSgvbXAzLywnbXBlZycpKS5yZXBsYWNlKC9uby8sICcnKSAhPT0gJydcblx0XHRcdFx0XHQvLyBzcGVjaWFsIGNhc2UgZm9yIG00YSBzdXBwb3J0ZWQgYnkgZGV0ZWN0aW5nIG1wNCBzdXBwb3J0XG5cdFx0XHRcdFx0fHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUucmVwbGFjZSgvbTRhLywnbXA0JykpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJykge1xuXHRcdFx0XHRcdHJlc3VsdC5tZXRob2QgPSAnbmF0aXZlJztcblx0XHRcdFx0XHRyZXN1bHQudXJsID0gbWVkaWFGaWxlc1tpXS51cmw7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cdFx0XHRcblx0XHRcdFxuXHRcdFx0aWYgKHJlc3VsdC5tZXRob2QgPT09ICduYXRpdmUnKSB7XG5cdFx0XHRcdGlmIChyZXN1bHQudXJsICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSByZXN1bHQudXJsO1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdFx0Ly8gaWYgYGF1dG9fcGx1Z2luYCBtb2RlLCB0aGVuIGNhY2hlIHRoZSBuYXRpdmUgcmVzdWx0IGJ1dCB0cnkgcGx1Z2lucy5cblx0XHRcdFx0aWYgKG9wdGlvbnMubW9kZSAhPT0gJ2F1dG9fcGx1Z2luJykge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBpZiBuYXRpdmUgcGxheWJhY2sgZGlkbid0IHdvcmssIHRoZW4gdGVzdCBwbHVnaW5zXG5cdFx0aWYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG8nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyB8fCBvcHRpb25zLm1vZGUgPT09ICdzaGltJykge1xuXHRcdFx0Zm9yIChpPTA7IGk8bWVkaWFGaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0eXBlID0gbWVkaWFGaWxlc1tpXS50eXBlO1xuXG5cdFx0XHRcdC8vIHRlc3QgYWxsIHBsdWdpbnMgaW4gb3JkZXIgb2YgcHJlZmVyZW5jZSBbc2lsdmVybGlnaHQsIGZsYXNoXVxuXHRcdFx0XHRmb3IgKGo9MDsgajxvcHRpb25zLnBsdWdpbnMubGVuZ3RoOyBqKyspIHtcblxuXHRcdFx0XHRcdHBsdWdpbk5hbWUgPSBvcHRpb25zLnBsdWdpbnNbal07XG5cdFx0XHRcblx0XHRcdFx0XHQvLyB0ZXN0IHZlcnNpb24gb2YgcGx1Z2luIChmb3IgZnV0dXJlIGZlYXR1cmVzKVxuXHRcdFx0XHRcdHBsdWdpblZlcnNpb25zID0gbWVqcy5wbHVnaW5zW3BsdWdpbk5hbWVdO1x0XHRcdFx0XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yIChrPTA7IGs8cGx1Z2luVmVyc2lvbnMubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcdHBsdWdpbkluZm8gPSBwbHVnaW5WZXJzaW9uc1trXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdC8vIHRlc3QgaWYgdXNlciBoYXMgdGhlIGNvcnJlY3QgcGx1Z2luIHZlcnNpb25cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Ly8gZm9yIHlvdXR1YmUvdmltZW9cblx0XHRcdFx0XHRcdGlmIChwbHVnaW5JbmZvLnZlcnNpb24gPT0gbnVsbCB8fCBcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdG1lanMuUGx1Z2luRGV0ZWN0b3IuaGFzUGx1Z2luVmVyc2lvbihwbHVnaW5OYW1lLCBwbHVnaW5JbmZvLnZlcnNpb24pKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gdGVzdCBmb3IgcGx1Z2luIHBsYXliYWNrIHR5cGVzXG5cdFx0XHRcdFx0XHRcdGZvciAobD0wOyBsPHBsdWdpbkluZm8udHlwZXMubGVuZ3RoOyBsKyspIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBmaW5kIHBsdWdpbiB0aGF0IGNhbiBwbGF5IHRoZSB0eXBlXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGUgPT0gcGx1Z2luSW5mby50eXBlc1tsXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0Lm1ldGhvZCA9IHBsdWdpbk5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQudXJsID0gbWVkaWFGaWxlc1tpXS51cmw7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBhdCB0aGlzIHBvaW50LCBiZWluZyBpbiAnYXV0b19wbHVnaW4nIG1vZGUgaW1wbGllcyB0aGF0IHdlIHRyaWVkIHBsdWdpbnMgYnV0IGZhaWxlZC5cblx0XHQvLyBpZiB3ZSBoYXZlIG5hdGl2ZSBzdXBwb3J0IHRoZW4gcmV0dXJuIHRoYXQuXG5cdFx0aWYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyAmJiByZXN1bHQubWV0aG9kID09PSAnbmF0aXZlJykge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHQvLyB3aGF0IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBwbGF5PyBqdXN0IGdyYWIgdGhlIGZpcnN0IGF2YWlsYWJsZVxuXHRcdGlmIChyZXN1bHQubWV0aG9kID09PSAnJyAmJiBtZWRpYUZpbGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdHJlc3VsdC51cmwgPSBtZWRpYUZpbGVzWzBdLnVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdGZvcm1hdFR5cGU6IGZ1bmN0aW9uKHVybCwgdHlwZSkge1xuXHRcdHZhciBleHQ7XG5cblx0XHQvLyBpZiBubyB0eXBlIGlzIHN1cHBsaWVkLCBmYWtlIGl0IHdpdGggdGhlIGV4dGVuc2lvblxuXHRcdGlmICh1cmwgJiYgIXR5cGUpIHtcdFx0XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRUeXBlRnJvbUZpbGUodXJsKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gb25seSByZXR1cm4gdGhlIG1pbWUgcGFydCBvZiB0aGUgdHlwZSBpbiBjYXNlIHRoZSBhdHRyaWJ1dGUgY29udGFpbnMgdGhlIGNvZGVjXG5cdFx0XHQvLyBzZWUgaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdmlkZW8uaHRtbCN0aGUtc291cmNlLWVsZW1lbnRcblx0XHRcdC8vIGB2aWRlby9tcDQ7IGNvZGVjcz1cImF2YzEuNDJFMDFFLCBtcDRhLjQwLjJcImAgYmVjb21lcyBgdmlkZW8vbXA0YFxuXHRcdFx0XG5cdFx0XHRpZiAodHlwZSAmJiB+dHlwZS5pbmRleE9mKCc7JykpIHtcblx0XHRcdFx0cmV0dXJuIHR5cGUuc3Vic3RyKDAsIHR5cGUuaW5kZXhPZignOycpKTsgXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdHlwZTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFxuXHRnZXRUeXBlRnJvbUZpbGU6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHVybCA9IHVybC5zcGxpdCgnPycpWzBdO1xuXHRcdHZhciBleHQgPSB1cmwuc3Vic3RyaW5nKHVybC5sYXN0SW5kZXhPZignLicpICsgMSkudG9Mb3dlckNhc2UoKTtcblx0XHRyZXR1cm4gKC8obXA0fG00dnxvZ2d8b2d2fG0zdTh8d2VibXx3ZWJtdnxmbHZ8d212fG1wZWd8bW92KS9naS50ZXN0KGV4dCkgPyAndmlkZW8nIDogJ2F1ZGlvJykgKyAnLycgKyB0aGlzLmdldFR5cGVGcm9tRXh0ZW5zaW9uKGV4dCk7XG5cdH0sXG5cdFxuXHRnZXRUeXBlRnJvbUV4dGVuc2lvbjogZnVuY3Rpb24oZXh0KSB7XG5cdFx0XG5cdFx0c3dpdGNoIChleHQpIHtcblx0XHRcdGNhc2UgJ21wNCc6XG5cdFx0XHRjYXNlICdtNHYnOlxuXHRcdFx0Y2FzZSAnbTRhJzpcblx0XHRcdFx0cmV0dXJuICdtcDQnO1xuXHRcdFx0Y2FzZSAnd2VibSc6XG5cdFx0XHRjYXNlICd3ZWJtYSc6XG5cdFx0XHRjYXNlICd3ZWJtdic6XHRcblx0XHRcdFx0cmV0dXJuICd3ZWJtJztcblx0XHRcdGNhc2UgJ29nZyc6XG5cdFx0XHRjYXNlICdvZ2EnOlxuXHRcdFx0Y2FzZSAnb2d2JzpcdFxuXHRcdFx0XHRyZXR1cm4gJ29nZyc7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXh0O1xuXHRcdH1cblx0fSxcblxuXHRjcmVhdGVFcnJvck1lc3NhZ2U6IGZ1bmN0aW9uKHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIpIHtcblx0XHR2YXIgXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50ID0gcGxheWJhY2suaHRtbE1lZGlhRWxlbWVudCxcblx0XHRcdGVycm9yQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcblx0XHRlcnJvckNvbnRhaW5lci5jbGFzc05hbWUgPSAnbWUtY2Fubm90cGxheSc7XG5cblx0XHR0cnkge1xuXHRcdFx0ZXJyb3JDb250YWluZXIuc3R5bGUud2lkdGggPSBodG1sTWVkaWFFbGVtZW50LndpZHRoICsgJ3B4Jztcblx0XHRcdGVycm9yQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGh0bWxNZWRpYUVsZW1lbnQuaGVpZ2h0ICsgJ3B4Jztcblx0XHR9IGNhdGNoIChlKSB7fVxuXG4gICAgaWYgKG9wdGlvbnMuY3VzdG9tRXJyb3IpIHtcbiAgICAgIGVycm9yQ29udGFpbmVyLmlubmVySFRNTCA9IG9wdGlvbnMuY3VzdG9tRXJyb3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29udGFpbmVyLmlubmVySFRNTCA9IChwb3N0ZXIgIT09ICcnKSA/XG4gICAgICAgICc8YSBocmVmPVwiJyArIHBsYXliYWNrLnVybCArICdcIj48aW1nIHNyYz1cIicgKyBwb3N0ZXIgKyAnXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIC8+PC9hPicgOlxuICAgICAgICAnPGEgaHJlZj1cIicgKyBwbGF5YmFjay51cmwgKyAnXCI+PHNwYW4+JyArIG1lanMuaTE4bi50KCdEb3dubG9hZCBGaWxlJykgKyAnPC9zcGFuPjwvYT4nO1xuICAgIH1cblxuXHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZXJyb3JDb250YWluZXIsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdGh0bWxNZWRpYUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdG9wdGlvbnMuZXJyb3IoaHRtbE1lZGlhRWxlbWVudCk7XG5cdH0sXG5cblx0Y3JlYXRlUGx1Z2luOmZ1bmN0aW9uKHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIsIGF1dG9wbGF5LCBwcmVsb2FkLCBjb250cm9scykge1xuXHRcdHZhciBcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0d2lkdGggPSAxLFxuXHRcdFx0aGVpZ2h0ID0gMSxcblx0XHRcdHBsdWdpbmlkID0gJ21lXycgKyBwbGF5YmFjay5tZXRob2QgKyAnXycgKyAobWVqcy5tZUluZGV4KyspLFxuXHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50ID0gbmV3IG1lanMuUGx1Z2luTWVkaWFFbGVtZW50KHBsdWdpbmlkLCBwbGF5YmFjay5tZXRob2QsIHBsYXliYWNrLnVybCksXG5cdFx0XHRjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lcixcblx0XHRcdG5vZGUsXG5cdFx0XHRpbml0VmFycztcblxuXHRcdC8vIGNvcHkgdGFnTmFtZSBmcm9tIGh0bWwgbWVkaWEgZWxlbWVudFxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC50YWdOYW1lID0gaHRtbE1lZGlhRWxlbWVudC50YWdOYW1lXG5cblx0XHQvLyBjb3B5IGF0dHJpYnV0ZXMgZnJvbSBodG1sIG1lZGlhIGVsZW1lbnQgdG8gcGx1Z2luIG1lZGlhIGVsZW1lbnRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGh0bWxNZWRpYUVsZW1lbnQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZSA9IGh0bWxNZWRpYUVsZW1lbnQuYXR0cmlidXRlc1tpXTtcblx0XHRcdGlmIChhdHRyaWJ1dGUuc3BlY2lmaWVkID09IHRydWUpIHtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBjaGVjayBmb3IgcGxhY2VtZW50IGluc2lkZSBhIDxwPiB0YWcgKHNvbWV0aW1lcyBXWVNJV1lHIGVkaXRvcnMgZG8gdGhpcylcblx0XHRub2RlID0gaHRtbE1lZGlhRWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdHdoaWxlIChub2RlICE9PSBudWxsICYmIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnYm9keScgJiYgbm9kZS5wYXJlbnROb2RlICE9IG51bGwpIHtcblx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAncCcpIHtcblx0XHRcdFx0bm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5vZGUucGFyZW50Tm9kZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRpZiAocGxheWJhY2suaXNWaWRlbykge1xuXHRcdFx0d2lkdGggPSAob3B0aW9ucy5wbHVnaW5XaWR0aCA+IDApID8gb3B0aW9ucy5wbHVnaW5XaWR0aCA6IChvcHRpb25zLnZpZGVvV2lkdGggPiAwKSA/IG9wdGlvbnMudmlkZW9XaWR0aCA6IChodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAhPT0gbnVsbCkgPyBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKSA6IG9wdGlvbnMuZGVmYXVsdFZpZGVvV2lkdGg7XG5cdFx0XHRoZWlnaHQgPSAob3B0aW9ucy5wbHVnaW5IZWlnaHQgPiAwKSA/IG9wdGlvbnMucGx1Z2luSGVpZ2h0IDogKG9wdGlvbnMudmlkZW9IZWlnaHQgPiAwKSA/IG9wdGlvbnMudmlkZW9IZWlnaHQgOiAoaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpICE9PSBudWxsKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSA6IG9wdGlvbnMuZGVmYXVsdFZpZGVvSGVpZ2h0O1xuXHRcdFxuXHRcdFx0Ly8gaW4gY2FzZSBvZiAnJScgbWFrZSBzdXJlIGl0J3MgZW5jb2RlZFxuXHRcdFx0d2lkdGggPSBtZWpzLlV0aWxpdHkuZW5jb2RlVXJsKHdpZHRoKTtcblx0XHRcdGhlaWdodCA9IG1lanMuVXRpbGl0eS5lbmNvZGVVcmwoaGVpZ2h0KTtcblx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKG9wdGlvbnMuZW5hYmxlUGx1Z2luRGVidWcpIHtcblx0XHRcdFx0d2lkdGggPSAzMjA7XG5cdFx0XHRcdGhlaWdodCA9IDI0MDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyByZWdpc3RlciBwbHVnaW5cblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzcztcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLnJlZ2lzdGVyUGx1Z2luRWxlbWVudChwbHVnaW5pZCwgcGx1Z2luTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KTtcblxuXHRcdC8vIGFkZCBjb250YWluZXIgKG11c3QgYmUgYWRkZWQgdG8gRE9NIGJlZm9yZSBpbnNlcnRpbmcgSFRNTCBmb3IgSUUpXG5cdFx0Y29udGFpbmVyLmNsYXNzTmFtZSA9ICdtZS1wbHVnaW4nO1xuXHRcdGNvbnRhaW5lci5pZCA9IHBsdWdpbmlkICsgJ19jb250YWluZXInO1xuXHRcdFxuXHRcdGlmIChwbGF5YmFjay5pc1ZpZGVvKSB7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShjb250YWluZXIsIGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlc1swXSk7XG5cdFx0fVxuXG5cdFx0Ly8gZmxhc2gvc2lsdmVybGlnaHQgdmFyc1xuXHRcdGluaXRWYXJzID0gW1xuXHRcdFx0J2lkPScgKyBwbHVnaW5pZCxcblx0XHRcdCdpc3ZpZGVvPScgKyAoKHBsYXliYWNrLmlzVmlkZW8pID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpLFxuXHRcdFx0J2F1dG9wbGF5PScgKyAoKGF1dG9wbGF5KSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiKSxcblx0XHRcdCdwcmVsb2FkPScgKyBwcmVsb2FkLFxuXHRcdFx0J3dpZHRoPScgKyB3aWR0aCxcblx0XHRcdCdzdGFydHZvbHVtZT0nICsgb3B0aW9ucy5zdGFydFZvbHVtZSxcblx0XHRcdCd0aW1lcnJhdGU9JyArIG9wdGlvbnMudGltZXJSYXRlLFxuXHRcdFx0J2ZsYXNoc3RyZWFtZXI9JyArIG9wdGlvbnMuZmxhc2hTdHJlYW1lcixcblx0XHRcdCdoZWlnaHQ9JyArIGhlaWdodCxcbiAgICAgICdwc2V1ZG9zdHJlYW1zdGFydD0nICsgb3B0aW9ucy5wc2V1ZG9TdHJlYW1pbmdTdGFydFF1ZXJ5UGFyYW1dO1xuXG5cdFx0aWYgKHBsYXliYWNrLnVybCAhPT0gbnVsbCkge1xuXHRcdFx0aWYgKHBsYXliYWNrLm1ldGhvZCA9PSAnZmxhc2gnKSB7XG5cdFx0XHRcdGluaXRWYXJzLnB1c2goJ2ZpbGU9JyArIG1lanMuVXRpbGl0eS5lbmNvZGVVcmwocGxheWJhY2sudXJsKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbml0VmFycy5wdXNoKCdmaWxlPScgKyBwbGF5YmFjay51cmwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5EZWJ1Zykge1xuXHRcdFx0aW5pdFZhcnMucHVzaCgnZGVidWc9dHJ1ZScpO1xuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5TbW9vdGhpbmcpIHtcblx0XHRcdGluaXRWYXJzLnB1c2goJ3Ntb290aGluZz10cnVlJyk7XG5cdFx0fVxuICAgIGlmIChvcHRpb25zLmVuYWJsZVBzZXVkb1N0cmVhbWluZykge1xuICAgICAgaW5pdFZhcnMucHVzaCgncHNldWRvc3RyZWFtaW5nPXRydWUnKTtcbiAgICB9XG5cdFx0aWYgKGNvbnRyb2xzKSB7XG5cdFx0XHRpbml0VmFycy5wdXNoKCdjb250cm9scz10cnVlJyk7IC8vIHNob3dzIGNvbnRyb2xzIGluIHRoZSBwbHVnaW4gaWYgZGVzaXJlZFxuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5wbHVnaW5WYXJzKSB7XG5cdFx0XHRpbml0VmFycyA9IGluaXRWYXJzLmNvbmNhdChvcHRpb25zLnBsdWdpblZhcnMpO1xuXHRcdH1cdFx0XG5cblx0XHRzd2l0Y2ggKHBsYXliYWNrLm1ldGhvZCkge1xuXHRcdFx0Y2FzZSAnc2lsdmVybGlnaHQnOlxuXHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID1cbic8b2JqZWN0IGRhdGE9XCJkYXRhOmFwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtMixcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC0yXCIgaWQ9XCInICsgcGx1Z2luaWQgKyAnXCIgbmFtZT1cIicgKyBwbHVnaW5pZCArICdcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsgJ1wiIGNsYXNzPVwibWVqcy1zaGltXCI+JyArXG4nPHBhcmFtIG5hbWU9XCJpbml0UGFyYW1zXCIgdmFsdWU9XCInICsgaW5pdFZhcnMuam9pbignLCcpICsgJ1wiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJ3aW5kb3dsZXNzXCIgdmFsdWU9XCJ0cnVlXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImJhY2tncm91bmRcIiB2YWx1ZT1cImJsYWNrXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cIm1pblJ1bnRpbWVWZXJzaW9uXCIgdmFsdWU9XCIzLjAuMC4wXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImF1dG9VcGdyYWRlXCIgdmFsdWU9XCJ0cnVlXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cInNvdXJjZVwiIHZhbHVlPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuc2lsdmVybGlnaHROYW1lICsgJ1wiIC8+JyArXG4nPC9vYmplY3Q+Jztcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnZmxhc2gnOlxuXG5cdFx0XHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNJRSkge1xuXHRcdFx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChzcGVjaWFsSUVDb250YWluZXIpO1xuXHRcdFx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lci5vdXRlckhUTUwgPVxuJzxvYmplY3QgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiIGNvZGViYXNlPVwiLy9kb3dubG9hZC5tYWNyb21lZGlhLmNvbS9wdWIvc2hvY2t3YXZlL2NhYnMvZmxhc2gvc3dmbGFzaC5jYWJcIiAnICtcbidpZD1cIicgKyBwbHVnaW5pZCArICdcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsgJ1wiIGNsYXNzPVwibWVqcy1zaGltXCI+JyArXG4nPHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuZmxhc2hOYW1lICsgJz94PScgKyAobmV3IERhdGUoKSkgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImZsYXNodmFyc1wiIHZhbHVlPVwiJyArIGluaXRWYXJzLmpvaW4oJyZhbXA7JykgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cInF1YWxpdHlcIiB2YWx1ZT1cImhpZ2hcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYmdjb2xvclwiIHZhbHVlPVwiIzAwMDAwMFwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYWxsb3dTY3JpcHRBY2Nlc3NcIiB2YWx1ZT1cImFsd2F5c1wiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJhbGxvd0Z1bGxTY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwic2NhbGVcIiB2YWx1ZT1cImRlZmF1bHRcIiAvPicgKyBcbic8L29iamVjdD4nO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID1cbic8ZW1iZWQgaWQ9XCInICsgcGx1Z2luaWQgKyAnXCIgbmFtZT1cIicgKyBwbHVnaW5pZCArICdcIiAnICtcbidwbGF5PVwidHJ1ZVwiICcgK1xuJ2xvb3A9XCJmYWxzZVwiICcgK1xuJ3F1YWxpdHk9XCJoaWdoXCIgJyArXG4nYmdjb2xvcj1cIiMwMDAwMDBcIiAnICtcbid3bW9kZT1cInRyYW5zcGFyZW50XCIgJyArXG4nYWxsb3dTY3JpcHRBY2Nlc3M9XCJhbHdheXNcIiAnICtcbidhbGxvd0Z1bGxTY3JlZW49XCJ0cnVlXCIgJyArXG4ndHlwZT1cImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIgcGx1Z2luc3BhZ2U9XCIvL3d3dy5tYWNyb21lZGlhLmNvbS9nby9nZXRmbGFzaHBsYXllclwiICcgK1xuJ3NyYz1cIicgKyBvcHRpb25zLnBsdWdpblBhdGggKyBvcHRpb25zLmZsYXNoTmFtZSArICdcIiAnICtcbidmbGFzaHZhcnM9XCInICsgaW5pdFZhcnMuam9pbignJicpICsgJ1wiICcgK1xuJ3dpZHRoPVwiJyArIHdpZHRoICsgJ1wiICcgK1xuJ2hlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgJyArXG4nc2NhbGU9XCJkZWZhdWx0XCInICsgXG4nY2xhc3M9XCJtZWpzLXNoaW1cIj48L2VtYmVkPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGNhc2UgJ3lvdXR1YmUnOlxuXHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgdmlkZW9JZDtcblx0XHRcdFx0Ly8geW91dHUuYmUgdXJsIGZyb20gc2hhcmUgYnV0dG9uXG5cdFx0XHRcdGlmIChwbGF5YmFjay51cmwubGFzdEluZGV4T2YoXCJ5b3V0dS5iZVwiKSAhPSAtMSkge1xuXHRcdFx0XHRcdHZpZGVvSWQgPSBwbGF5YmFjay51cmwuc3Vic3RyKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZignLycpKzEpO1xuXHRcdFx0XHRcdGlmICh2aWRlb0lkLmluZGV4T2YoJz8nKSAhPSAtMSkge1xuXHRcdFx0XHRcdFx0dmlkZW9JZCA9IHZpZGVvSWQuc3Vic3RyKDAsIHZpZGVvSWQuaW5kZXhPZignPycpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0dmlkZW9JZCA9IHBsYXliYWNrLnVybC5zdWJzdHIocGxheWJhY2sudXJsLmxhc3RJbmRleE9mKCc9JykrMSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0eW91dHViZVNldHRpbmdzID0ge1xuXHRcdFx0XHRcdFx0Y29udGFpbmVyOiBjb250YWluZXIsXG5cdFx0XHRcdFx0XHRjb250YWluZXJJZDogY29udGFpbmVyLmlkLFxuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50OiBwbHVnaW5NZWRpYUVsZW1lbnQsXG5cdFx0XHRcdFx0XHRwbHVnaW5JZDogcGx1Z2luaWQsXG5cdFx0XHRcdFx0XHR2aWRlb0lkOiB2aWRlb0lkLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0XHRcdFx0XHR3aWR0aDogd2lkdGhcdFxuXHRcdFx0XHRcdH07XHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChtZWpzLlBsdWdpbkRldGVjdG9yLmhhc1BsdWdpblZlcnNpb24oJ2ZsYXNoJywgWzEwLDAsMF0pICkge1xuXHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVGbGFzaCh5b3V0dWJlU2V0dGluZ3MpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5lbnF1ZXVlSWZyYW1lKHlvdXR1YmVTZXR0aW5ncyk7XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Ly8gREVNTyBDb2RlLiBEb2VzIE5PVCB3b3JrLlxuXHRcdFx0Y2FzZSAndmltZW8nOlxuXHRcdFx0XHR2YXIgcGxheWVyX2lkID0gcGx1Z2luaWQgKyBcIl9wbGF5ZXJcIjtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnZpbWVvaWQgPSBwbGF5YmFjay51cmwuc3Vic3RyKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZignLycpKzEpO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9JzxpZnJhbWUgc3JjPVwiLy9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLycgKyBwbHVnaW5NZWRpYUVsZW1lbnQudmltZW9pZCArICc/YXBpPTEmcG9ydHJhaXQ9MCZieWxpbmU9MCZ0aXRsZT0wJnBsYXllcl9pZD0nICsgcGxheWVyX2lkICsgJ1wiIHdpZHRoPVwiJyArIHdpZHRoICsnXCIgaGVpZ2h0PVwiJyArIGhlaWdodCArJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIGNsYXNzPVwibWVqcy1zaGltXCIgaWQ9XCInICsgcGxheWVyX2lkICsgJ1wiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7XG5cdFx0XHRcdGlmICh0eXBlb2YoJGYpID09ICdmdW5jdGlvbicpIHsgLy8gZnJvb2dhbG9vcCBhdmFpbGFibGVcblx0XHRcdFx0XHR2YXIgcGxheWVyID0gJGYoY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuXHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncmVhZHknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdCQuZXh0ZW5kKCBwbGF5ZXIsIHtcblx0XHRcdFx0XHRcdFx0cGxheVZpZGVvOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAncGxheScgKTtcblx0XHRcdFx0XHRcdFx0fSwgXG5cdFx0XHRcdFx0XHRcdHN0b3BWaWRlbzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3VubG9hZCcgKTtcblx0XHRcdFx0XHRcdFx0fSwgXG5cdFx0XHRcdFx0XHRcdHBhdXNlVmlkZW86IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICdwYXVzZScgKTtcblx0XHRcdFx0XHRcdFx0fSwgXG5cdFx0XHRcdFx0XHRcdHNlZWtUbzogZnVuY3Rpb24oIHNlY29uZHMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NlZWtUbycsIHNlY29uZHMgKTtcblx0XHRcdFx0XHRcdFx0fSwgXG5cdFx0XHRcdFx0XHRcdHNldFZvbHVtZTogZnVuY3Rpb24oIHZvbHVtZSApIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAnc2V0Vm9sdW1lJywgdm9sdW1lICk7XG5cdFx0XHRcdFx0XHRcdH0sIFxuXHRcdFx0XHRcdFx0XHRzZXRNdXRlZDogZnVuY3Rpb24oIG11dGVkICkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKCBtdXRlZCApIHtcblx0XHRcdFx0XHRcdFx0XHRcdHBsYXllci5sYXN0Vm9sdW1lID0gcGxheWVyLmFwaSggJ2dldFZvbHVtZScgKTtcblx0XHRcdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICdzZXRWb2x1bWUnLCAwICk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICdzZXRWb2x1bWUnLCBwbGF5ZXIubGFzdFZvbHVtZSApO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIHBsYXllci5sYXN0Vm9sdW1lO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCBldmVudE5hbWUsIGUpIHtcblx0XHRcdFx0XHRcdFx0dmFyIG9iaiA9IHtcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBldmVudE5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0OiBwbHVnaW5NZWRpYUVsZW1lbnRcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0aWYgKGV2ZW50TmFtZSA9PSAndGltZXVwZGF0ZScpIHtcblx0XHRcdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuY3VycmVudFRpbWUgPSBvYmouY3VycmVudFRpbWUgPSBlLnNlY29uZHM7XG5cdFx0XHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmR1cmF0aW9uID0gb2JqLmR1cmF0aW9uID0gZS5kdXJhdGlvbjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZGlzcGF0Y2hFdmVudChvYmoudHlwZSwgb2JqKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cGxheWVyLmFkZEV2ZW50KCdwbGF5JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGxheScpO1xuXHRcdFx0XHRcdFx0XHRjcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3BsYXlpbmcnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BhdXNlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGF1c2UnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ2ZpbmlzaCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRjcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ2VuZGVkJyk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cGxheWVyLmFkZEV2ZW50KCdwbGF5UHJvZ3Jlc3MnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAndGltZXVwZGF0ZScsIGUpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5FbGVtZW50ID0gY29udGFpbmVyO1xuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkFwaSA9IHBsYXllcjtcblxuXHRcdFx0XHRcdFx0Ly8gaW5pdCBtZWpzXG5cdFx0XHRcdFx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLmluaXRQbHVnaW4ocGx1Z2luaWQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybihcIllvdSBuZWVkIHRvIGluY2x1ZGUgZnJvb2dhbG9vcCBmb3IgdmltZW8gdG8gd29ya1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcdFx0XHRcblx0XHR9XG5cdFx0Ly8gaGlkZSBvcmlnaW5hbCBlbGVtZW50XG5cdFx0aHRtbE1lZGlhRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdC8vIHByZXZlbnQgYnJvd3NlciBmcm9tIGF1dG9wbGF5aW5nIHdoZW4gdXNpbmcgYSBwbHVnaW5cblx0XHRodG1sTWVkaWFFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXV0b3BsYXknKTtcblxuXHRcdC8vIEZZSTogb3B0aW9ucy5zdWNjZXNzIHdpbGwgYmUgZmlyZWQgYnkgdGhlIE1lZGlhUGx1Z2luQnJpZGdlXG5cdFx0XG5cdFx0cmV0dXJuIHBsdWdpbk1lZGlhRWxlbWVudDtcblx0fSxcblxuXHR1cGRhdGVOYXRpdmU6IGZ1bmN0aW9uKHBsYXliYWNrLCBvcHRpb25zLCBhdXRvcGxheSwgcHJlbG9hZCkge1xuXHRcdFxuXHRcdHZhciBodG1sTWVkaWFFbGVtZW50ID0gcGxheWJhY2suaHRtbE1lZGlhRWxlbWVudCxcblx0XHRcdG07XG5cdFx0XG5cdFx0XG5cdFx0Ly8gYWRkIG1ldGhvZHMgdG8gdmlkZW8gb2JqZWN0IHRvIGJyaW5nIGl0IGludG8gcGFyaXR5IHdpdGggRmxhc2ggT2JqZWN0XG5cdFx0Zm9yIChtIGluIG1lanMuSHRtbE1lZGlhRWxlbWVudCkge1xuXHRcdFx0aHRtbE1lZGlhRWxlbWVudFttXSA9IG1lanMuSHRtbE1lZGlhRWxlbWVudFttXTtcblx0XHR9XG5cblx0XHQvKlxuXHRcdENocm9tZSBub3cgc3VwcG9ydHMgcHJlbG9hZD1cIm5vbmVcIlxuXHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNDaHJvbWUpIHtcblx0XHRcblx0XHRcdC8vIHNwZWNpYWwgY2FzZSB0byBlbmZvcmNlIHByZWxvYWQgYXR0cmlidXRlIChDaHJvbWUgZG9lc24ndCByZXNwZWN0IHRoaXMpXG5cdFx0XHRpZiAocHJlbG9hZCA9PT0gJ25vbmUnICYmICFhdXRvcGxheSkge1xuXHRcdFx0XG5cdFx0XHRcdC8vIGZvcmNlcyB0aGUgYnJvd3NlciB0byBzdG9wIGxvYWRpbmcgKG5vdGU6IGZhaWxzIGluIElFOSlcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSAnJztcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5sb2FkKCk7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuY2FuY2VsZWRQcmVsb2FkID0gdHJ1ZTtcblxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmIChodG1sTWVkaWFFbGVtZW50LmNhbmNlbGVkUHJlbG9hZCkge1xuXHRcdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSBwbGF5YmFjay51cmw7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmxvYWQoKTtcblx0XHRcdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGxheSgpO1xuXHRcdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5jYW5jZWxlZFByZWxvYWQgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdC8vIGZvciBzb21lIHJlYXNvbiBDaHJvbWUgZm9yZ2V0cyBob3cgdG8gYXV0b3BsYXkgc29tZXRpbWVzLlxuXHRcdFx0fSBlbHNlIGlmIChhdXRvcGxheSkge1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmxvYWQoKTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5wbGF5KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCovXG5cblx0XHQvLyBmaXJlIHN1Y2Nlc3MgY29kZVxuXHRcdG9wdGlvbnMuc3VjY2VzcyhodG1sTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHRcblx0XHRyZXR1cm4gaHRtbE1lZGlhRWxlbWVudDtcblx0fVxufTtcblxuLypcbiAtIHRlc3Qgb24gSUUgKG9iamVjdCB2cy4gZW1iZWQpXG4gLSBkZXRlcm1pbmUgd2hlbiB0byB1c2UgaWZyYW1lIChGaXJlZm94LCBTYWZhcmksIE1vYmlsZSkgdnMuIEZsYXNoIChDaHJvbWUsIElFKVxuIC0gZnVsbHNjcmVlbj9cbiovXG5cbi8vIFlvdVR1YmUgRmxhc2ggYW5kIElmcmFtZSBBUElcbm1lanMuWW91VHViZUFwaSA9IHtcblx0aXNJZnJhbWVTdGFydGVkOiBmYWxzZSxcblx0aXNJZnJhbWVMb2FkZWQ6IGZhbHNlLFxuXHRsb2FkSWZyYW1lQXBpOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIXRoaXMuaXNJZnJhbWVTdGFydGVkKSB7XG5cdFx0XHR2YXIgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cdFx0XHR0YWcuc3JjID0gXCIvL3d3dy55b3V0dWJlLmNvbS9wbGF5ZXJfYXBpXCI7XG5cdFx0XHR2YXIgZmlyc3RTY3JpcHRUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG5cdFx0XHRmaXJzdFNjcmlwdFRhZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YWcsIGZpcnN0U2NyaXB0VGFnKTtcblx0XHRcdHRoaXMuaXNJZnJhbWVTdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGlmcmFtZVF1ZXVlOiBbXSxcblx0ZW5xdWV1ZUlmcmFtZTogZnVuY3Rpb24oeXQpIHtcblx0XHRcblx0XHRpZiAodGhpcy5pc0xvYWRlZCkge1xuXHRcdFx0dGhpcy5jcmVhdGVJZnJhbWUoeXQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxvYWRJZnJhbWVBcGkoKTtcblx0XHRcdHRoaXMuaWZyYW1lUXVldWUucHVzaCh5dCk7XG5cdFx0fVxuXHR9LFxuXHRjcmVhdGVJZnJhbWU6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0XG5cdFx0dmFyXG5cdFx0cGx1Z2luTWVkaWFFbGVtZW50ID0gc2V0dGluZ3MucGx1Z2luTWVkaWFFbGVtZW50LFx0XG5cdFx0cGxheWVyID0gbmV3IFlULlBsYXllcihzZXR0aW5ncy5jb250YWluZXJJZCwge1xuXHRcdFx0aGVpZ2h0OiBzZXR0aW5ncy5oZWlnaHQsXG5cdFx0XHR3aWR0aDogc2V0dGluZ3Mud2lkdGgsXG5cdFx0XHR2aWRlb0lkOiBzZXR0aW5ncy52aWRlb0lkLFxuXHRcdFx0cGxheWVyVmFyczoge2NvbnRyb2xzOjB9LFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHRcdCdvblJlYWR5JzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gaG9vayB1cCBpZnJhbWUgb2JqZWN0IHRvIE1FanNcblx0XHRcdFx0XHRzZXR0aW5ncy5wbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGxheWVyO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIGluaXQgbWVqc1xuXHRcdFx0XHRcdG1lanMuTWVkaWFQbHVnaW5CcmlkZ2UuaW5pdFBsdWdpbihzZXR0aW5ncy5wbHVnaW5JZCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gY3JlYXRlIHRpbWVyXG5cdFx0XHRcdFx0c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICd0aW1ldXBkYXRlJyk7XG5cdFx0XHRcdFx0fSwgMjUwKTtcdFx0XHRcdFx0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdvblN0YXRlQ2hhbmdlJzogZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5oYW5kbGVTdGF0ZUNoYW5nZShlLmRhdGEsIHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50KTtcblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRcblx0Y3JlYXRlRXZlbnQ6IGZ1bmN0aW9uIChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgZXZlbnROYW1lKSB7XG5cdFx0dmFyIG9iaiA9IHtcblx0XHRcdHR5cGU6IGV2ZW50TmFtZSxcblx0XHRcdHRhcmdldDogcGx1Z2luTWVkaWFFbGVtZW50XG5cdFx0fTtcblxuXHRcdGlmIChwbGF5ZXIgJiYgcGxheWVyLmdldER1cmF0aW9uKSB7XG5cdFx0XHRcblx0XHRcdC8vIHRpbWUgXG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuY3VycmVudFRpbWUgPSBvYmouY3VycmVudFRpbWUgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kdXJhdGlvbiA9IG9iai5kdXJhdGlvbiA9IHBsYXllci5nZXREdXJhdGlvbigpO1xuXHRcdFx0XG5cdFx0XHQvLyBzdGF0ZVxuXHRcdFx0b2JqLnBhdXNlZCA9IHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQ7XG5cdFx0XHRvYmouZW5kZWQgPSBwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQ7XHRcdFx0XG5cdFx0XHRcblx0XHRcdC8vIHNvdW5kXG5cdFx0XHRvYmoubXV0ZWQgPSBwbGF5ZXIuaXNNdXRlZCgpO1xuXHRcdFx0b2JqLnZvbHVtZSA9IHBsYXllci5nZXRWb2x1bWUoKSAvIDEwMDtcblx0XHRcdFxuXHRcdFx0Ly8gcHJvZ3Jlc3Ncblx0XHRcdG9iai5ieXRlc1RvdGFsID0gcGxheWVyLmdldFZpZGVvQnl0ZXNUb3RhbCgpO1xuXHRcdFx0b2JqLmJ1ZmZlcmVkQnl0ZXMgPSBwbGF5ZXIuZ2V0VmlkZW9CeXRlc0xvYWRlZCgpO1xuXHRcdFx0XG5cdFx0XHQvLyBmYWtlIHRoZSBXM0MgYnVmZmVyZWQgVGltZVJhbmdlXG5cdFx0XHR2YXIgYnVmZmVyZWRUaW1lID0gb2JqLmJ1ZmZlcmVkQnl0ZXMgLyBvYmouYnl0ZXNUb3RhbCAqIG9iai5kdXJhdGlvbjtcblx0XHRcdFxuXHRcdFx0b2JqLnRhcmdldC5idWZmZXJlZCA9IG9iai5idWZmZXJlZCA9IHtcblx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVuZDogZnVuY3Rpb24gKGluZGV4KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGJ1ZmZlcmVkVGltZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0bGVuZ3RoOiAxXG5cdFx0XHR9O1xuXG5cdFx0fVxuXHRcdFxuXHRcdC8vIHNlbmQgZXZlbnQgdXAgdGhlIGNoYWluXG5cdFx0cGx1Z2luTWVkaWFFbGVtZW50LmRpc3BhdGNoRXZlbnQob2JqLnR5cGUsIG9iaik7XG5cdH0sXHRcblx0XG5cdGlGcmFtZVJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR0aGlzLmlzTG9hZGVkID0gdHJ1ZTtcblx0XHR0aGlzLmlzSWZyYW1lTG9hZGVkID0gdHJ1ZTtcblx0XHRcblx0XHR3aGlsZSAodGhpcy5pZnJhbWVRdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHR2YXIgc2V0dGluZ3MgPSB0aGlzLmlmcmFtZVF1ZXVlLnBvcCgpO1xuXHRcdFx0dGhpcy5jcmVhdGVJZnJhbWUoc2V0dGluZ3MpO1xuXHRcdH1cdFxuXHR9LFxuXHRcblx0Ly8gRkxBU0ghXG5cdGZsYXNoUGxheWVyczoge30sXG5cdGNyZWF0ZUZsYXNoOiBmdW5jdGlvbihzZXR0aW5ncykge1xuXHRcdFxuXHRcdHRoaXMuZmxhc2hQbGF5ZXJzW3NldHRpbmdzLnBsdWdpbklkXSA9IHNldHRpbmdzO1xuXHRcdFxuXHRcdC8qXG5cdFx0c2V0dGluZ3MuY29udGFpbmVyLmlubmVySFRNTCA9XG5cdFx0XHQnPG9iamVjdCB0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiBpZD1cIicgKyBzZXR0aW5ncy5wbHVnaW5JZCArICdcIiBkYXRhPVwiLy93d3cueW91dHViZS5jb20vYXBpcGxheWVyP2VuYWJsZWpzYXBpPTEmYW1wO3BsYXllcmFwaWlkPScgKyBzZXR0aW5ncy5wbHVnaW5JZCAgKyAnJmFtcDt2ZXJzaW9uPTMmYW1wO2F1dG9wbGF5PTAmYW1wO2NvbnRyb2xzPTAmYW1wO21vZGVzdGJyYW5kaW5nPTEmbG9vcD0wXCIgJyArXG5cdFx0XHRcdCd3aWR0aD1cIicgKyBzZXR0aW5ncy53aWR0aCArICdcIiBoZWlnaHQ9XCInICsgc2V0dGluZ3MuaGVpZ2h0ICsgJ1wiIHN0eWxlPVwidmlzaWJpbGl0eTogdmlzaWJsZTsgXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcblx0XHRcdFx0JzxwYXJhbSBuYW1lPVwiYWxsb3dTY3JpcHRBY2Nlc3NcIiB2YWx1ZT1cImFsd2F5c1wiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIj4nICtcblx0XHRcdCc8L29iamVjdD4nO1xuXHRcdCovXG5cblx0XHR2YXIgc3BlY2lhbElFQ29udGFpbmVyLFxuXHRcdFx0eW91dHViZVVybCA9ICcvL3d3dy55b3V0dWJlLmNvbS9hcGlwbGF5ZXI/ZW5hYmxlanNhcGk9MSZhbXA7cGxheWVyYXBpaWQ9JyArIHNldHRpbmdzLnBsdWdpbklkICArICcmYW1wO3ZlcnNpb249MyZhbXA7YXV0b3BsYXk9MCZhbXA7Y29udHJvbHM9MCZhbXA7bW9kZXN0YnJhbmRpbmc9MSZsb29wPTAnO1xuXHRcdFx0XG5cdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0lFKSB7XG5cdFx0XHRcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0c2V0dGluZ3MuY29udGFpbmVyLmFwcGVuZENoaWxkKHNwZWNpYWxJRUNvbnRhaW5lcik7XG5cdFx0XHRzcGVjaWFsSUVDb250YWluZXIub3V0ZXJIVE1MID0gJzxvYmplY3QgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiIGNvZGViYXNlPVwiLy9kb3dubG9hZC5tYWNyb21lZGlhLmNvbS9wdWIvc2hvY2t3YXZlL2NhYnMvZmxhc2gvc3dmbGFzaC5jYWJcIiAnICtcbidpZD1cIicgKyBzZXR0aW5ncy5wbHVnaW5JZCArICdcIiB3aWR0aD1cIicgKyBzZXR0aW5ncy53aWR0aCArICdcIiBoZWlnaHQ9XCInICsgc2V0dGluZ3MuaGVpZ2h0ICsgJ1wiIGNsYXNzPVwibWVqcy1zaGltXCI+JyArXG5cdCc8cGFyYW0gbmFtZT1cIm1vdmllXCIgdmFsdWU9XCInICsgeW91dHViZVVybCArICdcIiAvPicgK1xuXHQnPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIiAvPicgK1xuXHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCIgLz4nICtcblx0JzxwYXJhbSBuYW1lPVwiYWxsb3dGdWxsU2NyZWVuXCIgdmFsdWU9XCJ0cnVlXCIgLz4nICtcbic8L29iamVjdD4nO1xuXHRcdH0gZWxzZSB7XG5cdFx0c2V0dGluZ3MuY29udGFpbmVyLmlubmVySFRNTCA9XG5cdFx0XHQnPG9iamVjdCB0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiBpZD1cIicgKyBzZXR0aW5ncy5wbHVnaW5JZCArICdcIiBkYXRhPVwiJyArIHlvdXR1YmVVcmwgKyAnXCIgJyArXG5cdFx0XHRcdCd3aWR0aD1cIicgKyBzZXR0aW5ncy53aWR0aCArICdcIiBoZWlnaHQ9XCInICsgc2V0dGluZ3MuaGVpZ2h0ICsgJ1wiIHN0eWxlPVwidmlzaWJpbGl0eTogdmlzaWJsZTsgXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcblx0XHRcdFx0JzxwYXJhbSBuYW1lPVwiYWxsb3dTY3JpcHRBY2Nlc3NcIiB2YWx1ZT1cImFsd2F5c1wiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIj4nICtcblx0XHRcdCc8L29iamVjdD4nO1xuXHRcdH1cdFx0XG5cdFx0XG5cdH0sXG5cdFxuXHRmbGFzaFJlYWR5OiBmdW5jdGlvbihpZCkge1xuXHRcdHZhclxuXHRcdFx0c2V0dGluZ3MgPSB0aGlzLmZsYXNoUGxheWVyc1tpZF0sXG5cdFx0XHRwbGF5ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCksXG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSBzZXR0aW5ncy5wbHVnaW5NZWRpYUVsZW1lbnQ7XG5cdFx0XG5cdFx0Ly8gaG9vayB1cCBhbmQgcmV0dXJuIHRvIE1lZGlhRUxlbWVudFBsYXllci5zdWNjZXNzXHRcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gXG5cdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQgPSBwbGF5ZXI7XG5cdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS5pbml0UGx1Z2luKGlkKTtcblx0XHRcblx0XHQvLyBsb2FkIHRoZSB5b3V0dWJlIHZpZGVvXG5cdFx0cGxheWVyLmN1ZVZpZGVvQnlJZChzZXR0aW5ncy52aWRlb0lkKTtcblx0XHRcblx0XHR2YXIgY2FsbGJhY2tOYW1lID0gc2V0dGluZ3MuY29udGFpbmVySWQgKyAnX2NhbGxiYWNrJztcblx0XHRcblx0XHR3aW5kb3dbY2FsbGJhY2tOYW1lXSA9IGZ1bmN0aW9uKGUpIHtcblx0XHRcdG1lanMuWW91VHViZUFwaS5oYW5kbGVTdGF0ZUNoYW5nZShlLCBwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCk7XG5cdFx0fVxuXHRcdFxuXHRcdHBsYXllci5hZGRFdmVudExpc3RlbmVyKCdvblN0YXRlQ2hhbmdlJywgY2FsbGJhY2tOYW1lKTtcblx0XHRcblx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3RpbWV1cGRhdGUnKTtcblx0XHR9LCAyNTApO1xuXHRcdFxuXHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ2NhbnBsYXknKTtcblx0fSxcblx0XG5cdGhhbmRsZVN0YXRlQ2hhbmdlOiBmdW5jdGlvbih5b3VUdWJlU3RhdGUsIHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50KSB7XG5cdFx0c3dpdGNoICh5b3VUdWJlU3RhdGUpIHtcblx0XHRcdGNhc2UgLTE6IC8vIG5vdCBzdGFydGVkXG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSB0cnVlO1xuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdsb2FkZWRtZXRhZGF0YScpO1xuXHRcdFx0XHQvL2NyZWF0ZVlvdVR1YmVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ2xvYWRlZGRhdGEnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmVuZGVkID0gdHJ1ZTtcblx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnZW5kZWQnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmVuZGVkID0gZmFsc2U7XHRcdFx0XHRcblx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGxheScpO1xuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5aW5nJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGF1c2VkID0gdHJ1ZTtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmVuZGVkID0gZmFsc2U7XHRcdFx0XHRcblx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGF1c2UnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM6IC8vIGJ1ZmZlcmluZ1xuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwcm9ncmVzcycpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgNTpcblx0XHRcdFx0Ly8gY3VlZD9cblx0XHRcdFx0YnJlYWs7XHRcdFx0XHRcdFx0XG5cdFx0XHRcblx0XHR9XHRcdFx0XG5cdFx0XG5cdH1cbn1cbi8vIElGUkFNRVxuZnVuY3Rpb24gb25Zb3VUdWJlUGxheWVyQVBJUmVhZHkoKSB7XG5cdG1lanMuWW91VHViZUFwaS5pRnJhbWVSZWFkeSgpO1xufVxuLy8gRkxBU0hcbmZ1bmN0aW9uIG9uWW91VHViZVBsYXllclJlYWR5KGlkKSB7XG5cdG1lanMuWW91VHViZUFwaS5mbGFzaFJlYWR5KGlkKTtcbn1cblxud2luZG93Lm1lanMgPSBtZWpzO1xud2luZG93Lk1lZGlhRWxlbWVudCA9IG1lanMuTWVkaWFFbGVtZW50O1xuXG4vKlxuICogQWRkcyBJbnRlcm5hdGlvbmFsaXphdGlvbiBhbmQgbG9jYWxpemF0aW9uIHRvIG1lZGlhZWxlbWVudC5cbiAqXG4gKiBUaGlzIGZpbGUgZG9lcyBub3QgY29udGFpbiB0cmFuc2xhdGlvbnMsIHlvdSBoYXZlIHRvIGFkZCB0aGVtIG1hbnVhbGx5LlxuICogVGhlIHNjaGVtYSBpcyBhbHdheXMgdGhlIHNhbWU6IG1lLWkxOG4tbG9jYWxlLVtJRVRGLWxhbmd1YWdlLXRhZ10uanNcbiAqXG4gKiBFeGFtcGxlcyBhcmUgcHJvdmlkZWQgYm90aCBmb3IgZ2VybWFuIGFuZCBjaGluZXNlIHRyYW5zbGF0aW9uLlxuICpcbiAqXG4gKiBXaGF0IGlzIHRoZSBjb25jZXB0IGJleW9uZCBpMThuP1xuICogICBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0ludGVybmF0aW9uYWxpemF0aW9uX2FuZF9sb2NhbGl6YXRpb25cbiAqXG4gKiBXaGF0IGxhbmdjb2RlIHNob3VsZCBpIHVzZT9cbiAqICAgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JRVRGX2xhbmd1YWdlX3RhZ1xuICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNTY0NlxuICpcbiAqXG4gKiBMaWNlbnNlP1xuICpcbiAqICAgVGhlIGkxOG4gZmlsZSB1c2VzIG1ldGhvZHMgZnJvbSB0aGUgRHJ1cGFsIHByb2plY3QgKGRydXBhbC5qcyk6XG4gKiAgICAgLSBpMThuLm1ldGhvZHMudCgpIChtb2RpZmllZClcbiAqICAgICAtIGkxOG4ubWV0aG9kcy5jaGVja1BsYWluKCkgKGZ1bGwgY29weSlcbiAqXG4gKiAgIFRoZSBEcnVwYWwgcHJvamVjdCBpcyAobGlrZSBtZWRpYWVsZW1lbnRqcykgbGljZW5zZWQgdW5kZXIgR1BMdjIuXG4gKiAgICAtIGh0dHA6Ly9kcnVwYWwub3JnL2xpY2Vuc2luZy9mYXEvI3ExXG4gKiAgICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9qb2huZHllci9tZWRpYWVsZW1lbnRcbiAqICAgIC0gaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL29sZC1saWNlbnNlcy9ncGwtMi4wLmh0bWxcbiAqXG4gKlxuICogQGF1dGhvclxuICogICBUaW0gTGF0eiAobGF0ei50aW1AZ21haWwuY29tKVxuICpcbiAqXG4gKiBAcGFyYW1zXG4gKiAgLSBjb250ZXh0IC0gZG9jdW1lbnQsIGlmcmFtZSAuLlxuICogIC0gZXhwb3J0cyAtIENvbW1vbkpTLCB3aW5kb3cgLi5cbiAqXG4gKi9cbjsoZnVuY3Rpb24oY29udGV4dCwgZXhwb3J0cywgdW5kZWZpbmVkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgaTE4biA9IHtcbiAgICAgICAgXCJsb2NhbGVcIjoge1xuICAgICAgICAgICAgLy8gRW5zdXJlIHByZXZpb3VzIHZhbHVlcyBhcmVuJ3Qgb3ZlcndyaXR0ZW4uXG4gICAgICAgICAgICBcImxhbmd1YWdlXCIgOiAoZXhwb3J0cy5pMThuICYmIGV4cG9ydHMuaTE4bi5sb2NhbGUubGFuZ3VhZ2UpIHx8ICcnLFxuICAgICAgICAgICAgXCJzdHJpbmdzXCIgOiAoZXhwb3J0cy5pMThuICYmIGV4cG9ydHMuaTE4bi5sb2NhbGUuc3RyaW5ncykgfHwge31cbiAgICAgICAgfSxcbiAgICAgICAgXCJpZXRmX2xhbmdfcmVnZXhcIiA6IC9eKHhcXC0pP1thLXpdezIsfShcXC1cXHd7Mix9KT8oXFwtXFx3ezIsfSk/JC8sXG4gICAgICAgIFwibWV0aG9kc1wiIDoge31cbiAgICB9O1xuLy8gc3RhcnQgaTE4blxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGFuZ3VhZ2UsIGZhbGxiYWNrIHRvIGJyb3dzZXIncyBsYW5ndWFnZSBpZiBlbXB0eVxuICAgICAqXG4gICAgICogSUVURjogUkZDIDU2NDYsIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM1NjQ2XG4gICAgICogRXhhbXBsZXM6IGVuLCB6aC1DTiwgY21uLUhhbnMtQ04sIHNyLUxhdG4tUlMsIGVzLTQxOSwgeC1wcml2YXRlXG4gICAgICovXG4gICAgaTE4bi5nZXRMYW5ndWFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxhbmd1YWdlID0gaTE4bi5sb2NhbGUubGFuZ3VhZ2UgfHwgd2luZG93Lm5hdmlnYXRvci51c2VyTGFuZ3VhZ2UgfHwgd2luZG93Lm5hdmlnYXRvci5sYW5ndWFnZTtcbiAgICAgICAgcmV0dXJuIGkxOG4uaWV0Zl9sYW5nX3JlZ2V4LmV4ZWMobGFuZ3VhZ2UpID8gbGFuZ3VhZ2UgOiBudWxsO1xuXG4gICAgICAgIC8vKFdBUzogY29udmVydCB0byBpc28gNjM5LTEgKDItbGV0dGVycywgbG93ZXIgY2FzZSkpXG4gICAgICAgIC8vcmV0dXJuIGxhbmd1YWdlLnN1YnN0cigwLCAyKS50b0xvd2VyQ2FzZSgpO1xuICAgIH07XG5cbiAgICAvLyBpMThuIGZpeGVzIGZvciBjb21wYXRpYmlsaXR5IHdpdGggV29yZFByZXNzXG4gICAgaWYgKCB0eXBlb2YgbWVqc0wxMG4gIT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgIGkxOG4ubG9jYWxlLmxhbmd1YWdlID0gbWVqc0wxMG4ubGFuZ3VhZ2U7XG4gICAgfVxuXG5cblxuICAgIC8qKlxuICAgICAqIEVuY29kZSBzcGVjaWFsIGNoYXJhY3RlcnMgaW4gYSBwbGFpbi10ZXh0IHN0cmluZyBmb3IgZGlzcGxheSBhcyBIVE1MLlxuICAgICAqL1xuICAgIGkxOG4ubWV0aG9kcy5jaGVja1BsYWluID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgY2hhcmFjdGVyLCByZWdleCxcbiAgICAgICAgcmVwbGFjZSA9IHtcbiAgICAgICAgICAgICcmJzogJyZhbXA7JyxcbiAgICAgICAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAgICAgICAnPic6ICcmZ3Q7J1xuICAgICAgICB9O1xuICAgICAgICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgICAgICAgZm9yIChjaGFyYWN0ZXIgaW4gcmVwbGFjZSkge1xuICAgICAgICAgICAgaWYgKHJlcGxhY2UuaGFzT3duUHJvcGVydHkoY2hhcmFjdGVyKSkge1xuICAgICAgICAgICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChjaGFyYWN0ZXIsICdnJyk7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UocmVnZXgsIHJlcGxhY2VbY2hhcmFjdGVyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVHJhbnNsYXRlIHN0cmluZ3MgdG8gdGhlIHBhZ2UgbGFuZ3VhZ2Ugb3IgYSBnaXZlbiBsYW5ndWFnZS5cbiAgICAgKlxuICAgICAqXG4gICAgICogQHBhcmFtIHN0clxuICAgICAqICAgQSBzdHJpbmcgY29udGFpbmluZyB0aGUgRW5nbGlzaCBzdHJpbmcgdG8gdHJhbnNsYXRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiAgIC0gJ2NvbnRleHQnIChkZWZhdWx0cyB0byB0aGUgZGVmYXVsdCBjb250ZXh0KTogVGhlIGNvbnRleHQgdGhlIHNvdXJjZSBzdHJpbmdcbiAgICAgKiAgICAgYmVsb25ncyB0by5cbiAgICAgKlxuICAgICAqIEByZXR1cm5cbiAgICAgKiAgIFRoZSB0cmFuc2xhdGVkIHN0cmluZywgZXNjYXBlZCB2aWEgaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oKVxuICAgICAqL1xuICAgIGkxOG4ubWV0aG9kcy50ID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuXG4gICAgICAgIC8vIEZldGNoIHRoZSBsb2NhbGl6ZWQgdmVyc2lvbiBvZiB0aGUgc3RyaW5nLlxuICAgICAgICBpZiAoaTE4bi5sb2NhbGUuc3RyaW5ncyAmJiBpMThuLmxvY2FsZS5zdHJpbmdzW29wdGlvbnMuY29udGV4dF0gJiYgaTE4bi5sb2NhbGUuc3RyaW5nc1tvcHRpb25zLmNvbnRleHRdW3N0cl0pIHtcbiAgICAgICAgICAgIHN0ciA9IGkxOG4ubG9jYWxlLnN0cmluZ3Nbb3B0aW9ucy5jb250ZXh0XVtzdHJdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGkxOG4ubWV0aG9kcy5jaGVja1BsYWluKHN0cik7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogV3JhcHBlciBmb3IgaTE4bi5tZXRob2RzLnQoKVxuICAgICAqXG4gICAgICogQHNlZSBpMThuLm1ldGhvZHMudCgpXG4gICAgICogQHRocm93cyBJbnZhbGlkQXJndW1lbnRFeGNlcHRpb25cbiAgICAgKi9cbiAgICBpMThuLnQgPSBmdW5jdGlvbihzdHIsIG9wdGlvbnMpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgJiYgc3RyLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgICAgLy8gY2hlY2sgZXZlcnkgdGltZSBkdWUgbGFuZ3VhZ2UgY2FuIGNoYW5nZSBmb3JcbiAgICAgICAgICAgIC8vIGRpZmZlcmVudCByZWFzb25zICh0cmFuc2xhdGlvbiwgbGFuZyBzd2l0Y2hlciAuLilcbiAgICAgICAgICAgIHZhciBsYW5ndWFnZSA9IGkxOG4uZ2V0TGFuZ3VhZ2UoKTtcblxuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge1xuICAgICAgICAgICAgICAgIFwiY29udGV4dFwiIDogbGFuZ3VhZ2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBpMThuLm1ldGhvZHMudChzdHIsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cge1xuICAgICAgICAgICAgICAgIFwibmFtZVwiIDogJ0ludmFsaWRBcmd1bWVudEV4Y2VwdGlvbicsXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCIgOiAnRmlyc3QgYXJndW1lbnQgaXMgZWl0aGVyIG5vdCBhIHN0cmluZyBvciBlbXB0eS4nXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcblxuLy8gZW5kIGkxOG5cbiAgICBleHBvcnRzLmkxOG4gPSBpMThuO1xufShkb2N1bWVudCwgbWVqcykpO1xuXG4vLyBpMThuIGZpeGVzIGZvciBjb21wYXRpYmlsaXR5IHdpdGggV29yZFByZXNzXG47KGZ1bmN0aW9uKGV4cG9ydHMsIHVuZGVmaW5lZCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoIHR5cGVvZiBtZWpzTDEwbiAhPSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgZXhwb3J0c1ttZWpzTDEwbi5sYW5ndWFnZV0gPSBtZWpzTDEwbi5zdHJpbmdzO1xuICAgIH1cblxufShtZWpzLmkxOG4ubG9jYWxlLnN0cmluZ3MpKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZC9tZWRpYWVsZW1lbnQuanNcIixcIi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUylcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0gpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24oYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldO1xuXG4gIGkgKz0gZDtcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgcyA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IGVMZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBlID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gbUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzO1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICBlID0gZSAtIGVCaWFzO1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pO1xufTtcblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAdHlwZSB7VGFifVxuICovXG52YXIgVGFiID0gcmVxdWlyZSgnLi90YWInKTtcbi8qKlxuICogQHR5cGUge0NoYXB0ZXJzfVxuICovXG52YXIgQ2hhcHRlcnMgPSByZXF1aXJlKCcuL21vZHVsZXMvY2hhcHRlcicpO1xuXG5mdW5jdGlvbiBjcmVhdGVUaW1lQ29udHJvbHMoKSB7XG4gIHJldHVybiAkKCc8dWwgY2xhc3M9XCJ0aW1lY29udHJvbGJhclwiPjwvdWw+Jyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgcmV0dXJuICQoJzxkaXYgY2xhc3M9XCJjb250cm9sYmFyIGJhclwiPjwvZGl2PicpO1xufVxuXG5mdW5jdGlvbiBwbGF5ZXJTdGFydGVkKHBsYXllcikge1xuICByZXR1cm4gKCh0eXBlb2YgcGxheWVyLmN1cnJlbnRUaW1lID09PSAnbnVtYmVyJykgJiYgKHBsYXllci5jdXJyZW50VGltZSA+IDApKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29tYmluZWRDYWxsYmFjayhjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gKGV2dCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ2NvbnRyb2xidXR0b24gY2xpY2tlZCcsIGV2dCk7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAncGxheWVyIHN0YXJ0ZWQ/JywgcGxheWVyU3RhcnRlZCh0aGlzLnBsYXllcikpO1xuICAgIGlmICghcGxheWVyU3RhcnRlZCh0aGlzLnBsYXllcikpIHtcbiAgICAgIHRoaXMucGxheWVyLnBsYXkoKTtcbiAgICB9XG4gICAgdmFyIGJvdW5kQ2FsbEJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgIGJvdW5kQ2FsbEJhY2soKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBpbnN0YW50aWF0ZSBuZXcgY29udHJvbHMgZWxlbWVudFxuICogQHBhcmFtIHtqUXVlcnl8SFRNTEVsZW1lbnR9IHBsYXllciBQbGF5ZXIgZWxlbWVudCByZWZlcmVuY2VcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lIFRpbWVsaW5lIG9iamVjdCBmb3IgdGhpcyBwbGF5ZXJcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBDb250cm9scyAocGxheWVyLCB0aW1lbGluZSkge1xuICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lO1xuICB0aGlzLmJveCA9IGNyZWF0ZUJveCgpO1xuICB0aGlzLnRpbWVDb250cm9sRWxlbWVudCA9IGNyZWF0ZVRpbWVDb250cm9scygpO1xuICB0aGlzLmJveC5hcHBlbmQodGhpcy50aW1lQ29udHJvbEVsZW1lbnQpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSB0aW1lIGNvbnRyb2wgYnV0dG9ucyBhbmQgYWRkIHRoZW0gdG8gdGltZUNvbnRyb2xFbGVtZW50XG4gKiBAcGFyYW0ge251bGx8Q2hhcHRlcnN9IGNoYXB0ZXJNb2R1bGUgd2hlbiBwcmVzZW50IHdpbGwgYWRkIG5leHQgYW5kIHByZXZpb3VzIGNoYXB0ZXIgY29udHJvbHNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5Db250cm9scy5wcm90b3R5cGUuY3JlYXRlVGltZUNvbnRyb2xzID0gZnVuY3Rpb24gKGNoYXB0ZXJNb2R1bGUpIHtcbiAgdmFyIGhhc0NoYXB0ZXJzID0gKGNoYXB0ZXJNb2R1bGUgaW5zdGFuY2VvZiBDaGFwdGVycyk7XG4gIGlmICghaGFzQ2hhcHRlcnMpIHtcbiAgICBjb25zb2xlLmluZm8oJ0NvbnRyb2xzJywgJ2NyZWF0ZVRpbWVDb250cm9scycsICdubyBjaGFwdGVyVGFiIGZvdW5kJyk7XG4gIH1cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1wcmV2aW91cy1jaGFwdGVyJywgJ0p1bXAgYmFja3dhcmQgdG8gcHJldmlvdXMgY2hhcHRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhY3RpdmVDaGFwdGVyID0gY2hhcHRlck1vZHVsZS5nZXRBY3RpdmVDaGFwdGVyKCk7XG4gICAgICBpZiAodGhpcy50aW1lbGluZS5nZXRUaW1lKCkgPiBhY3RpdmVDaGFwdGVyLnN0YXJ0ICsgMTApIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnYmFjayB0byBjaGFwdGVyIHN0YXJ0JywgY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlciwgJ2Zyb20nLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgICAgIHJldHVybiBjaGFwdGVyTW9kdWxlLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnYmFjayB0byBwcmV2aW91cyBjaGFwdGVyJywgY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlcik7XG4gICAgICByZXR1cm4gY2hhcHRlck1vZHVsZS5wcmV2aW91cygpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1iYWNrLTMwJywgJ1Jld2luZCAzMCBzZWNvbmRzJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ3Jld2luZCBiZWZvcmUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgdGhpcy50aW1lbGluZS5zZXRUaW1lKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpIC0gMzApO1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ3Jld2luZCBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgfSk7XG5cbiAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1mb3J3YXJkLTMwJywgJ0Zhc3QgZm9yd2FyZCAzMCBzZWNvbmRzJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ2Zmd2QgYmVmb3JlJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgIHRoaXMudGltZWxpbmUuc2V0VGltZSh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSArIDMwKTtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdmZndkIGFmdGVyJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICB9KTtcblxuICBpZiAoaGFzQ2hhcHRlcnMpIHtcbiAgICB0aGlzLmNyZWF0ZUJ1dHRvbigncHdwLWNvbnRyb2xzLW5leHQtY2hhcHRlcicsICdKdW1wIHRvIG5leHQgY2hhcHRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ25leHQgQ2hhcHRlciBiZWZvcmUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgICBjaGFwdGVyTW9kdWxlLm5leHQoKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ25leHQgQ2hhcHRlciBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgICB9KTtcbiAgfVxufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmNyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbihpY29uLCB0aXRsZSwgY2FsbGJhY2spIHtcbiAgdmFyIGJ1dHRvbiA9ICQoJzxsaT48YSBocmVmPVwiI1wiIGNsYXNzPVwiYnV0dG9uIGJ1dHRvbi1jb250cm9sXCIgdGl0bGU9XCInICsgdGl0bGUgKyAnXCI+JyArXG4gICAgJzxpIGNsYXNzPVwiaWNvbiAnICsgaWNvbiArICdcIj48L2k+PC9hPjwvbGk+Jyk7XG4gIHRoaXMudGltZUNvbnRyb2xFbGVtZW50LmFwcGVuZChidXR0b24pO1xuICB2YXIgY29tYmluZWRDYWxsYmFjayA9IGdldENvbWJpbmVkQ2FsbGJhY2soY2FsbGJhY2spO1xuICBidXR0b24ub24oJ2NsaWNrJywgY29tYmluZWRDYWxsYmFjay5iaW5kKHRoaXMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29udHJvbHMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbi8vIGV2ZXJ5dGhpbmcgZm9yIGFuIGVtYmVkZGVkIHBsYXllclxudmFyXG4gIHBsYXllcnMgPSBbXSxcbiAgbGFzdEhlaWdodCA9IDAsXG4gICRib2R5O1xuXG5mdW5jdGlvbiBwb3N0VG9PcGVuZXIob2JqKSB7XG4gIGNvbnNvbGUuZGVidWcoJ3Bvc3RUb09wZW5lcicsIG9iaik7XG4gIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2Uob2JqLCAnKicpO1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlTGlzdGVuZXIgKGV2ZW50KSB7XG4gIHZhciBvcmlnID0gZXZlbnQub3JpZ2luYWxFdmVudDtcblxuICBpZiAob3JpZy5kYXRhLmFjdGlvbiA9PT0gJ3BhdXNlJykge1xuICAgIHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3YWl0Rm9yTWV0YWRhdGEgKGNhbGxiYWNrKSB7XG4gIGZ1bmN0aW9uIG1ldGFEYXRhTGlzdGVuZXIgKGV2ZW50KSB7XG4gICAgdmFyIG9yaWcgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuICAgIGlmIChvcmlnLmRhdGEucGxheWVyT3B0aW9ucykge1xuICAgICAgY2FsbGJhY2sob3JpZy5kYXRhLnBsYXllck9wdGlvbnMpO1xuICAgIH1cbiAgfVxuICAkKHdpbmRvdykub24oJ21lc3NhZ2UnLCBtZXRhRGF0YUxpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gcG9sbEhlaWdodCgpIHtcbiAgdmFyIG5ld0hlaWdodCA9ICRib2R5LmhlaWdodCgpO1xuICBpZiAobGFzdEhlaWdodCAhPT0gbmV3SGVpZ2h0KSB7XG4gICAgcG9zdFRvT3BlbmVyKHtcbiAgICAgIGFjdGlvbjogJ3Jlc2l6ZScsXG4gICAgICBhcmc6IG5ld0hlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgbGFzdEhlaWdodCA9IG5ld0hlaWdodDtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGxIZWlnaHQsIGRvY3VtZW50LmJvZHkpO1xufVxuXG4vKipcbiAqIGluaXRpYWxpemUgZW1iZWQgZnVuY3Rpb25hbGl0eVxuICogQHBhcmFtIHtmdW5jdGlvbn0gJCBqUXVlcnlcbiAqIEBwYXJhbSB7QXJyYXl9IHBsYXllckxpc3QgYWxsIHBsYXllcnNpbiB0aGlzIHdpbmRvd1xuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluaXQoJCwgcGxheWVyTGlzdCkge1xuICBwbGF5ZXJzID0gcGxheWVyTGlzdDtcbiAgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpO1xuICAkKHdpbmRvdykub24oJ21lc3NhZ2UnLCBtZXNzYWdlTGlzdGVuZXIpO1xuICBwb2xsSGVpZ2h0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwb3N0VG9PcGVuZXI6IHBvc3RUb09wZW5lcixcbiAgd2FpdEZvck1ldGFkYXRhOiB3YWl0Rm9yTWV0YWRhdGEsXG4gIGluaXQ6IGluaXRcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW1iZWQuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiohXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBQb2Rsb3ZlIFdlYiBQbGF5ZXIgdjMuMC4wLWFscGhhXG4gKiBMaWNlbnNlZCB1bmRlciBUaGUgQlNEIDItQ2xhdXNlIExpY2Vuc2VcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMi1DbGF1c2VcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAoYykgMjAxNCwgR2Vycml0IHZhbiBBYWtlbiAoaHR0cHM6Ly9naXRodWIuY29tL2dlcnJpdHZhbmFha2VuLyksIFNpbW9uIFdhbGRoZXJyIChodHRwczovL2dpdGh1Yi5jb20vc2ltb253YWxkaGVyci8pLCBGcmFuayBIYXNlIChodHRwczovL2dpdGh1Yi5jb20vS2FtYmZoYXNlLyksIEVyaWMgVGV1YmVydCAoaHR0cHM6Ly9naXRodWIuY29tL2V0ZXViZXJ0LykgYW5kIG90aGVycyAoaHR0cHM6Ly9naXRodWIuY29tL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL2NvbnRyaWJ1dG9ycylcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICpcbiAqIC0gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogLSBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUYWJSZWdpc3RyeSA9IHJlcXVpcmUoJy4vdGFicmVnaXN0cnknKSxcbiAgZW1iZWQgPSByZXF1aXJlKCcuL2VtYmVkJyksXG4gIFRpbWVsaW5lID0gcmVxdWlyZSgnLi90aW1lbGluZScpLFxuICBJbmZvID0gcmVxdWlyZSgnLi9tb2R1bGVzL2luZm8nKSxcbiAgU2hhcmUgPSByZXF1aXJlKCcuL21vZHVsZXMvc2hhcmUnKSxcbiAgRG93bmxvYWRzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2Rvd25sb2FkcycpLFxuICBDaGFwdGVycyA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jaGFwdGVyJyksXG4gIFNhdmVUaW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL3NhdmV0aW1lJyksXG4gIENvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpLFxuICBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpLFxuICBQcm9ncmVzc0JhciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9wcm9ncmVzc2JhcicpO1xuXG52YXIgYXV0b3BsYXkgPSBmYWxzZTtcblxudmFyIHB3cDtcblxuLy8gd2lsbCBleHBvc2UvYXR0YWNoIGl0c2VsZiB0byB0aGUgJCBnbG9iYWxcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkL21lZGlhZWxlbWVudC5qcycpO1xuXG4vKipcbiAqIFRoZSBtb3N0IG1pc3NpbmcgZmVhdHVyZSByZWdhcmRpbmcgZW1iZWRkZWQgcGxheWVyc1xuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIHRoZSB0aXRsZSBvZiB0aGUgc2hvd1xuICogQHBhcmFtIHtzdHJpbmd9IHVybCAob3B0aW9uYWwpIHRoZSBsaW5rIHRvIHRoZSBzaG93XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJTaG93VGl0bGUodGl0bGUsIHVybCkge1xuICBpZiAoIXRpdGxlKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGlmICh1cmwpIHtcbiAgICB0aXRsZSA9ICc8YSBocmVmPVwiJyArIHVybCArICdcIj4nICsgdGl0bGUgKyAnPC9hPic7XG4gIH1cbiAgcmV0dXJuICc8aDMgY2xhc3M9XCJzaG93dGl0bGVcIj4nICsgdGl0bGUgKyAnPC9oMz4nO1xufVxuXG4vKipcbiAqIFJlbmRlciBlcGlzb2RlIHRpdGxlIEhUTUxcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGlua1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyVGl0bGUodGV4dCwgbGluaykge1xuICB2YXIgdGl0bGVCZWdpbiA9ICc8aDEgY2xhc3M9XCJlcGlzb2RldGl0bGVcIj4nLFxuICAgIHRpdGxlRW5kID0gJzwvaDE+JztcbiAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCAmJiBsaW5rICE9PSB1bmRlZmluZWQpIHtcbiAgICB0ZXh0ID0gJzxhIGhyZWY9XCInICsgbGluayArICdcIj4nICsgdGV4dCArICc8L2E+JztcbiAgfVxuICByZXR1cm4gdGl0bGVCZWdpbiArIHRleHQgKyB0aXRsZUVuZDtcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCBzdWJ0aXRsZVxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclN1YlRpdGxlKHRleHQpIHtcbiAgaWYgKCF0ZXh0KSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGgyIGNsYXNzPVwic3VidGl0bGVcIj4nICsgdGV4dCArICc8L2gyPic7XG59XG5cbi8qKlxuICogUmVuZGVyIEhUTUwgdGl0bGUgYXJlYVxuICogQHBhcmFtIHBhcmFtc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyVGl0bGVBcmVhKHBhcmFtcykge1xuICByZXR1cm4gJzxoZWFkZXI+JyArXG4gICAgcmVuZGVyU2hvd1RpdGxlKHBhcmFtcy5zaG93LnRpdGxlLCBwYXJhbXMuc2hvdy51cmwpICtcbiAgICByZW5kZXJUaXRsZShwYXJhbXMudGl0bGUsIHBhcmFtcy5wZXJtYWxpbmspICtcbiAgICByZW5kZXJTdWJUaXRsZShwYXJhbXMuc3VidGl0bGUpICtcbiAgICAnPC9oZWFkZXI+Jztcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCBwbGF5YnV0dG9uXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJQbGF5YnV0dG9uKCkge1xuICByZXR1cm4gJCgnPGEgY2xhc3M9XCJwbGF5XCIgdGl0bGU9XCJQbGF5IEVwaXNvZGVcIiBocmVmPVwiamF2YXNjcmlwdDo7XCI+PC9hPicpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgcG9zdGVyIGltYWdlIGluIEhUTUxcbiAqIHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGlmIHBvc3RlclVybCBpcyBlbXB0eVxuICogQHBhcmFtIHtzdHJpbmd9IHBvc3RlclVybFxuICogQHJldHVybnMge3N0cmluZ30gcmVuZGVyZWQgSFRNTFxuICovXG5mdW5jdGlvbiByZW5kZXJQb3N0ZXIocG9zdGVyVXJsKSB7XG4gIGlmICghcG9zdGVyVXJsKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGRpdiBjbGFzcz1cImNvdmVyYXJ0XCI+PGltZyBjbGFzcz1cImNvdmVyaW1nXCIgc3JjPVwiJyArIHBvc3RlclVybCArICdcIiBkYXRhLWltZz1cIicgKyBwb3N0ZXJVcmwgKyAnXCIgYWx0PVwiUG9zdGVyIEltYWdlXCI+PC9kaXY+Jztcbn1cblxuLyoqXG4gKiBjaGVja3MgaWYgdGhlIGN1cnJlbnQgd2luZG93IGlzIGhpZGRlblxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdyBpcyBoaWRkZW5cbiAqL1xuZnVuY3Rpb24gaXNIaWRkZW4oKSB7XG4gIHZhciBwcm9wcyA9IFtcbiAgICAnaGlkZGVuJyxcbiAgICAnbW96SGlkZGVuJyxcbiAgICAnbXNIaWRkZW4nLFxuICAgICd3ZWJraXRIaWRkZW4nXG4gIF07XG5cbiAgZm9yICh2YXIgaW5kZXggaW4gcHJvcHMpIHtcbiAgICBpZiAocHJvcHNbaW5kZXhdIGluIGRvY3VtZW50KSB7XG4gICAgICByZXR1cm4gISFkb2N1bWVudFtwcm9wc1tpbmRleF1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogYWRkIGNoYXB0ZXIgYmVoYXZpb3IgYW5kIGRlZXBsaW5raW5nOiBza2lwIHRvIHJlZmVyZW5jZWRcbiAqIHRpbWUgcG9zaXRpb24gJiB3cml0ZSBjdXJyZW50IHRpbWUgaW50byBhZGRyZXNzXG4gKiBAcGFyYW0ge29iamVjdH0gcGxheWVyXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0ge29iamVjdH0gd3JhcHBlclxuICovXG5mdW5jdGlvbiBhZGRCZWhhdmlvcihwbGF5ZXIsIHBhcmFtcywgd3JhcHBlcikge1xuICB2YXIganFQbGF5ZXIgPSAkKHBsYXllciksXG5cbiAgICB0aW1lbGluZSA9IG5ldyBUaW1lbGluZShwbGF5ZXIsIHBhcmFtcyksXG4gICAgY29udHJvbHMgPSBuZXcgQ29udHJvbHMocGxheWVyLCB0aW1lbGluZSksXG4gICAgdGFicyA9IG5ldyBUYWJSZWdpc3RyeSgpLFxuXG4gICAgaGFzQ2hhcHRlcnMgPSB0aW1lbGluZS5oYXNDaGFwdGVycyxcbiAgICBtZXRhRWxlbWVudCA9ICQoJzxkaXYgY2xhc3M9XCJ0aXRsZWJhclwiPjwvZGl2PicpLFxuICAgIHBsYXllclR5cGUgPSBwYXJhbXMudHlwZSxcbiAgICBjb250cm9sQm94ID0gY29udHJvbHMuYm94LFxuICAgIHBsYXlCdXR0b24gPSByZW5kZXJQbGF5YnV0dG9uKCksXG4gICAgcG9zdGVyID0gcGFyYW1zLnBvc3RlciB8fCBqcVBsYXllci5hdHRyKCdwb3N0ZXInKSxcbiAgICBkZWVwTGluaztcblxuICBjb25zb2xlLmRlYnVnKCd3ZWJwbGF5ZXInLCAnbWV0YWRhdGEnLCB0aW1lbGluZS5nZXREYXRhKCkpO1xuXG4gIC8qKlxuICAgKiBCdWlsZCByaWNoIHBsYXllciB3aXRoIG1ldGEgZGF0YVxuICAgKi9cbiAgd3JhcHBlci5hZGRDbGFzcygncG9kbG92ZXdlYnBsYXllcl8nICsgcGxheWVyVHlwZSk7XG5cbiAgaWYgKHBsYXllclR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAvLyBSZW5kZXIgcGxheWJ1dHRvbiBpbiB0aXRsZWJhclxuICAgIG1ldGFFbGVtZW50LnByZXBlbmQocGxheUJ1dHRvbik7XG4gICAgbWV0YUVsZW1lbnQuYXBwZW5kKHJlbmRlclBvc3Rlcihwb3N0ZXIpKTtcbiAgICB3cmFwcGVyLnByZXBlbmQobWV0YUVsZW1lbnQpO1xuICB9XG5cbiAgaWYgKHBsYXllclR5cGUgPT09ICd2aWRlbycpIHtcbiAgICB2YXIgdmlkZW9QYW5lID0gJCgnPGRpdiBjbGFzcz1cInZpZGVvLXBhbmVcIj48L2Rpdj4nKTtcbiAgICB2YXIgb3ZlcmxheSA9ICQoJzxkaXYgY2xhc3M9XCJ2aWRlby1vdmVybGF5XCI+PC9kaXY+Jyk7XG4gICAgb3ZlcmxheS5hcHBlbmQocGxheUJ1dHRvbik7XG4gICAgb3ZlcmxheS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocGxheWVyLnBhdXNlZCkge1xuICAgICAgICBwbGF5QnV0dG9uLmFkZENsYXNzKCdwbGF5aW5nJyk7XG4gICAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgIH0pO1xuXG4gICAgdmlkZW9QYW5lXG4gICAgICAuYXBwZW5kKG92ZXJsYXkpXG4gICAgICAuYXBwZW5kKGpxUGxheWVyKTtcblxuICAgIHdyYXBwZXJcbiAgICAgIC5hcHBlbmQobWV0YUVsZW1lbnQpXG4gICAgICAuYXBwZW5kKHZpZGVvUGFuZSk7XG5cbiAgICBqcVBsYXllci5wcm9wKHtcbiAgICAgIHBvc3RlcjogcG9zdGVyLFxuICAgICAgY29udHJvbHM6IG51bGwsXG4gICAgICBwcmVsb2FkOiAnYXV0bydcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJlbmRlciB0aXRsZSBhcmVhIHdpdGggdGl0bGUgaDIgYW5kIHN1YnRpdGxlIGgzXG4gIG1ldGFFbGVtZW50LmFwcGVuZChyZW5kZXJUaXRsZUFyZWEocGFyYW1zKSk7XG5cbiAgLyoqXG4gICAqIC0tIE1PRFVMRVMgLS1cbiAgICovXG4gIHZhciBjaGFwdGVycztcbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgY2hhcHRlcnMgPSBuZXcgQ2hhcHRlcnModGltZWxpbmUpO1xuICAgIHRpbWVsaW5lLmFkZE1vZHVsZShjaGFwdGVycyk7XG4gICAgY2hhcHRlcnMuYWRkRXZlbnRoYW5kbGVycyhwbGF5ZXIpO1xuICB9XG4gIGNvbnRyb2xzLmNyZWF0ZVRpbWVDb250cm9scyhjaGFwdGVycyk7XG5cbiAgdmFyIHNhdmVUaW1lID0gbmV3IFNhdmVUaW1lKHRpbWVsaW5lLCBwYXJhbXMpO1xuICB0aW1lbGluZS5hZGRNb2R1bGUoc2F2ZVRpbWUpO1xuXG4gIHZhciBwcm9ncmVzc0JhciA9IG5ldyBQcm9ncmVzc0Jhcih0aW1lbGluZSk7XG4gIHRpbWVsaW5lLmFkZE1vZHVsZShwcm9ncmVzc0Jhcik7XG5cbiAgdmFyIHNoYXJpbmcgPSBuZXcgU2hhcmUocGFyYW1zKTtcbiAgdmFyIGRvd25sb2FkcyA9IG5ldyBEb3dubG9hZHMocGFyYW1zKTtcbiAgdmFyIGluZm9zID0gbmV3IEluZm8ocGFyYW1zKTtcblxuICAvKipcbiAgICogLS0gVEFCUyAtLVxuICAgKiBUaGUgdGFicyBpbiBjb250cm9sYmFyIHdpbGwgYXBwZWFyIGluIGZvbGxvd2luZyBvcmRlcjpcbiAgICovXG5cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGFicy5hZGQoY2hhcHRlcnMudGFiLCAhIXBhcmFtcy5jaGFwdGVyc1Zpc2libGUpO1xuICB9XG5cbiAgdGFicy5hZGQoc2hhcmluZy50YWIsICEhcGFyYW1zLnNoYXJlYnV0dG9uc1Zpc2libGUpO1xuICB0YWJzLmFkZChkb3dubG9hZHMudGFiLCAhIXBhcmFtcy5kb3dubG9hZGJ1dHRvbnNWaXNpYmxlKTtcbiAgdGFicy5hZGQoaW5mb3MudGFiLCAhIXBhcmFtcy5zdW1tYXJ5VmlzaWJsZSk7XG5cbiAgLy8gUmVuZGVyIGNvbnRyb2xiYXIgd2l0aCB0b2dnbGViYXIgYW5kIHRpbWVjb250cm9sc1xuICB2YXIgY29udHJvbGJhcldyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwiY29udHJvbGJhci13cmFwcGVyXCI+PC9kaXY+Jyk7XG4gIGNvbnRyb2xiYXJXcmFwcGVyLmFwcGVuZCh0YWJzLnRvZ2dsZWJhcik7XG4gIGNvbnRyb2xiYXJXcmFwcGVyLmFwcGVuZChjb250cm9sQm94KTtcblxuICAvLyByZW5kZXIgcHJvZ3Jlc3NiYXIsIGNvbnRyb2xiYXIgYW5kIHRhYnNcbiAgd3JhcHBlclxuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIucmVuZGVyKCkpXG4gICAgLmFwcGVuZChjb250cm9sYmFyV3JhcHBlcilcbiAgICAuYXBwZW5kKHRhYnMuY29udGFpbmVyKTtcblxuICBwcm9ncmVzc0Jhci5hZGRFdmVudHMoKTtcblxuICAvLyBleHBvc2UgdGhlIHBsYXllciBpbnRlcmZhY2VcbiAgd3JhcHBlci5kYXRhKCdwb2Rsb3Zld2VicGxheWVyJywge1xuICAgIHBsYXllcjoganFQbGF5ZXJcbiAgfSk7XG5cbiAgLy8gcGFyc2UgZGVlcGxpbmtcbiAgZGVlcExpbmsgPSByZXF1aXJlKCcuL3VybCcpLmNoZWNrQ3VycmVudCgpO1xuICBpZiAoZGVlcExpbmtbMF0gJiYgcHdwLnBsYXllcnMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHBsYXllckF0dHJpYnV0ZXMgPSB7cHJlbG9hZDogJ2F1dG8nfTtcbiAgICBpZiAoIWlzSGlkZGVuKCkgJiYgYXV0b3BsYXkpIHtcbiAgICAgIHBsYXllckF0dHJpYnV0ZXMuYXV0b3BsYXkgPSAnYXV0b3BsYXknO1xuICAgIH1cbiAgICBqcVBsYXllci5hdHRyKHBsYXllckF0dHJpYnV0ZXMpO1xuICAgIC8vc3RvcEF0VGltZSA9IGRlZXBMaW5rWzFdO1xuICAgIHRpbWVsaW5lLnBsYXlSYW5nZShkZWVwTGluayk7XG5cbiAgICAkKCdodG1sLCBib2R5JykuZGVsYXkoMTUwKS5hbmltYXRlKHtcbiAgICAgIHNjcm9sbFRvcDogJCgnLmNvbnRhaW5lcjpmaXJzdCcpLm9mZnNldCgpLnRvcCAtIDI1XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAocGxheWVyLmN1cnJlbnRUaW1lICYmIHBsYXllci5jdXJyZW50VGltZSA+IDAgJiYgIXBsYXllci5wYXVzZWQpIHtcbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgICAgaWYgKHBsYXllci5wbHVnaW5UeXBlID09PSAnZmxhc2gnKSB7XG4gICAgICAgIHBsYXllci5wYXVzZSgpOyAgICAvLyBmbGFzaCBmYWxsYmFjayBuZWVkcyBhZGRpdGlvbmFsIHBhdXNlXG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFwbGF5QnV0dG9uLmhhc0NsYXNzKCdwbGF5aW5nJykpIHtcbiAgICAgIHBsYXlCdXR0b24uYWRkQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICB9XG4gICAgcGxheWVyLnBsYXkoKTtcbiAgfSk7XG5cbiAgLy8gd2FpdCBmb3IgdGhlIHBsYXllciBvciB5b3UnbGwgZ2V0IERPTSBFWENFUFRJT05TXG4gIC8vIEFuZCBqdXN0IGxpc3RlbiBvbmNlIGJlY2F1c2Ugb2YgYSBzcGVjaWFsIGJlaGF2aW91ciBpbiBmaXJlZm94XG4gIC8vIC0tPiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02NjQ4NDJcbiAganFQbGF5ZXIub25lKCdjYW5wbGF5JywgZnVuY3Rpb24gKGV2dCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ2NhbnBsYXknLCBldnQpO1xuICB9KTtcblxuICBqcVBsYXllclxuICAgIC5vbigndGltZWxpbmVFbGVtZW50JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhldmVudC5jdXJyZW50VGFyZ2V0LmlkLCBldmVudCk7XG4gICAgfSlcbiAgICAub24oJ3RpbWV1cGRhdGUgcHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRpbWVsaW5lLnVwZGF0ZShldmVudCk7XG4gICAgfSlcbiAgICAvLyB1cGRhdGUgcGxheS9wYXVzZSBzdGF0dXNcbiAgICAub24oJ3BsYXknLCBmdW5jdGlvbiAoKSB7fSlcbiAgICAub24oJ3BsYXlpbmcnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwbGF5QnV0dG9uLmFkZENsYXNzKCdwbGF5aW5nJyk7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdwbGF5JywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgfSlcbiAgICAub24oJ3BhdXNlJywgZnVuY3Rpb24gKCkge1xuICAgICAgcGxheUJ1dHRvbi5yZW1vdmVDbGFzcygncGxheWluZycpO1xuICAgICAgZW1iZWQucG9zdFRvT3BlbmVyKHsgYWN0aW9uOiAncGF1c2UnLCBhcmc6IHBsYXllci5jdXJyZW50VGltZSB9KTtcbiAgICB9KVxuICAgIC5vbignZW5kZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdzdG9wJywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgICAvLyBkZWxldGUgdGhlIGNhY2hlZCBwbGF5IHRpbWVcbiAgICAgIHNhdmVUaW1lLnJlbW92ZUl0ZW0oKTtcbiAgICAgIHRpbWVsaW5lLnJld2luZCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHJldHVybiBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgYXR0YWNoIHNvdXJjZSBlbGVtZW50cyB0byB0aGUgZGVmZXJyZWQgYXVkaW8gZWxlbWVudFxuICogQHBhcmFtIHtvYmplY3R9IGRlZmVycmVkUGxheWVyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGdldERlZmVycmVkUGxheWVyQ2FsbEJhY2soZGVmZXJyZWRQbGF5ZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBwbGF5ZXIuZGVmYXVsdHMsIGRhdGEpO1xuICAgIGRhdGEuc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2VPYmplY3QpIHtcbiAgICAgICQoJzxzb3VyY2U+Jywgc291cmNlT2JqZWN0KS5hcHBlbmRUbyhkZWZlcnJlZFBsYXllcik7XG4gICAgfSk7XG4gICAgcGxheWVyLmNyZWF0ZShkZWZlcnJlZFBsYXllciwgcGFyYW1zLCBhZGRCZWhhdmlvcik7XG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7alF1ZXJ5fVxuICovXG4kLmZuLnBvZGxvdmV3ZWJwbGF5ZXIgPSBmdW5jdGlvbiB3ZWJQbGF5ZXIob3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5kZWZlcnJlZCkge1xuICAgIHZhciBkZWZlcnJlZFBsYXllciA9IHRoaXNbMF07XG4gICAgdmFyIGNhbGxiYWNrID0gZ2V0RGVmZXJyZWRQbGF5ZXJDYWxsQmFjayhkZWZlcnJlZFBsYXllcik7XG4gICAgZW1iZWQud2FpdEZvck1ldGFkYXRhKGNhbGxiYWNrKTtcbiAgICBlbWJlZC5wb3N0VG9PcGVuZXIoe2FjdGlvbjogJ3dhaXRpbmcnfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBBZGRpdGlvbmFsIHBhcmFtZXRlcnMgZGVmYXVsdCB2YWx1ZXNcbiAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBwbGF5ZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gIC8vIHR1cm4gZWFjaCBwbGF5ZXIgaW4gdGhlIGN1cnJlbnQgc2V0IGludG8gYSBQb2Rsb3ZlIFdlYiBQbGF5ZXJcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgcGxheWVyRWxlbWVudCkge1xuICAgIHBsYXllci5jcmVhdGUocGxheWVyRWxlbWVudCwgcGFyYW1zLCBhZGRCZWhhdmlvcik7XG4gIH0pO1xufTtcblxucHdwID0geyBwbGF5ZXJzOiBwbGF5ZXIucGxheWVycyB9O1xuXG5lbWJlZC5pbml0KCQsIHBsYXllci5wbGF5ZXJzKTtcblxud2luZG93LnB3cCA9IHB3cDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzRjNzhjZjdiLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuLi90aW1lY29kZScpXG4gICwgdXJsID0gcmVxdWlyZSgnLi4vdXJsJylcbiAgLCBUYWIgPSByZXF1aXJlKCcuLi90YWInKVxuICAsIFRpbWVsaW5lID0gcmVxdWlyZSgnLi4vdGltZWxpbmUnKTtcblxudmFyIEFDVElWRV9DSEFQVEVSX1RIUkVTSEhPTEQgPSAwLjE7XG5cbmZ1bmN0aW9uIHJlbmRlcihodG1sKSB7XG4gIHJldHVybiAkKGh0bWwpO1xufVxuXG4vKipcbiAqIHJlbmRlciBIVE1MVGFibGVFbGVtZW50IGZvciBjaGFwdGVyc1xuICogQHJldHVybnMge2pRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVuZGVyQ2hhcHRlclRhYmxlKCkge1xuICByZXR1cm4gcmVuZGVyKFxuICAgICc8dGFibGUgY2xhc3M9XCJwb2Rsb3Zld2VicGxheWVyX2NoYXB0ZXJzXCI+PGNhcHRpb24+UG9kY2FzdCBDaGFwdGVyczwvY2FwdGlvbj4nICtcbiAgICAgICc8dGhlYWQ+JyArXG4gICAgICAgICc8dHI+JyArXG4gICAgICAgICAgJzx0aCBzY29wZT1cImNvbFwiPkNoYXB0ZXIgTnVtYmVyPC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+U3RhcnQgdGltZTwvdGg+JyArXG4gICAgICAgICAgJzx0aCBzY29wZT1cImNvbFwiPlRpdGxlPC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+RHVyYXRpb248L3RoPicgK1xuICAgICAgICAnPC90cj4nICtcbiAgICAgICc8L3RoZWFkPicgK1xuICAgICAgJzx0Ym9keT48L3Rib2R5PicgK1xuICAgICc8L3RhYmxlPidcbiAgKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNoYXB0ZXJcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclJvdyAoY2hhcHRlciwgaW5kZXgpIHtcbiAgcmV0dXJuIHJlbmRlcihcbiAgICAnPHRyIGNsYXNzPVwiY2hhcHRlclwiPicgK1xuICAgICAgJzx0ZCBjbGFzcz1cImNoYXB0ZXItbnVtYmVyXCI+PHNwYW4gY2xhc3M9XCJiYWRnZVwiPicgKyAoaW5kZXggKyAxKSArICc8L3NwYW4+PC90ZD4nICtcbiAgICAgICc8dGQgY2xhc3M9XCJjaGFwdGVyLW5hbWVcIj48c3Bhbj4nICsgY2hhcHRlci5jb2RlICsgJzwvc3Bhbj48L3RkPicgK1xuICAgICAgJzx0ZCBjbGFzcz1cImNoYXB0ZXItZHVyYXRpb25cIj48c3Bhbj4nICsgY2hhcHRlci5kdXJhdGlvbiArICc8L3NwYW4+PC90ZD4nICtcbiAgICAnPC90cj4nXG4gICk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNoYXB0ZXJzXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRNYXhDaGFwdGVyU3RhcnQoY2hhcHRlcnMpIHtcbiAgZnVuY3Rpb24gZ2V0U3RhcnRUaW1lIChjaGFwdGVyKSB7XG4gICAgcmV0dXJuIGNoYXB0ZXIuc3RhcnQ7XG4gIH1cbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsICQubWFwKGNoYXB0ZXJzLCBnZXRTdGFydFRpbWUpKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHt7ZW5kOntudW1iZXJ9LCBzdGFydDp7bnVtYmVyfX19IGNoYXB0ZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50VGltZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQWN0aXZlQ2hhcHRlciAoY2hhcHRlciwgY3VycmVudFRpbWUpIHtcbiAgaWYgKCFjaGFwdGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoY3VycmVudFRpbWUgPiBjaGFwdGVyLnN0YXJ0IC0gQUNUSVZFX0NIQVBURVJfVEhSRVNISE9MRCAmJiBjdXJyZW50VGltZSA8PSBjaGFwdGVyLmVuZCk7XG59XG5cbi8qKlxuICogdXBkYXRlIHRoZSBjaGFwdGVyIGxpc3Qgd2hlbiB0aGUgZGF0YSBpcyBsb2FkZWRcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZSAodGltZWxpbmUpIHtcbiAgdmFyIGNoYXB0ZXIgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKVxuICAgICwgY3VycmVudFRpbWUgPSB0aW1lbGluZS5nZXRUaW1lKCk7XG5cbiAgY29uc29sZS5kZWJ1ZygnQ2hhcHRlcnMnLCAndXBkYXRlJywgdGhpcywgY2hhcHRlciwgY3VycmVudFRpbWUpO1xuICBpZiAoaXNBY3RpdmVDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRUaW1lKSkge1xuICAgIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICd1cGRhdGUnLCAnYWxyZWFkeSBzZXQnLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgICByZXR1cm47XG4gIH1cbiAgZnVuY3Rpb24gbWFya0NoYXB0ZXIgKGNoYXB0ZXIsIGkpIHtcbiAgICB2YXIgaXNBY3RpdmUgPSBpc0FjdGl2ZUNoYXB0ZXIoY2hhcHRlciwgY3VycmVudFRpbWUpO1xuICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgdGhpcy5zZXRDdXJyZW50Q2hhcHRlcihpKTtcbiAgICB9XG4gIH1cbiAgdGhpcy5jaGFwdGVycy5mb3JFYWNoKG1hcmtDaGFwdGVyLCB0aGlzKTtcbn1cblxuLyoqXG4gKiBjaGFwdGVyIGhhbmRsaW5nXG4gKiBAcGFyYW1zIHtUaW1lbGluZX0gcGFyYW1zXG4gKiBAcmV0dXJuIHtDaGFwdGVyc30gY2hhcHRlciBtb2R1bGVcbiAqL1xuZnVuY3Rpb24gQ2hhcHRlcnMgKHRpbWVsaW5lKSB7XG5cbiAgaWYgKCF0aW1lbGluZSB8fCAhdGltZWxpbmUuaGFzQ2hhcHRlcnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodGltZWxpbmUuZHVyYXRpb24gPT09IDApIHtcbiAgICBjb25zb2xlLndhcm4oJ0NoYXB0ZXJzJywgJ2NvbnN0cnVjdG9yJywgJ1plcm8gbGVuZ3RoIG1lZGlhPycsIHRpbWVsaW5lKTtcbiAgfVxuXG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5kdXJhdGlvbiA9IHRpbWVsaW5lLmR1cmF0aW9uO1xuICB0aGlzLmNoYXB0ZXJzID0gdGltZWxpbmUuZ2V0RGF0YUJ5VHlwZSgnY2hhcHRlcicpO1xuICB0aGlzLmNoYXB0ZXJsaW5rcyA9ICEhdGltZWxpbmUuY2hhcHRlcmxpbmtzO1xuICB0aGlzLmN1cnJlbnRDaGFwdGVyID0gMDtcblxuICB0aGlzLnRhYiA9IG5ldyBUYWIoe1xuICAgIGljb246ICdwd3AtY2hhcHRlcnMnLFxuICAgIHRpdGxlOiAnU2hvdy9oaWRlIGNoYXB0ZXJzJyxcbiAgICBoZWFkbGluZTogJ0NoYXB0ZXJzJyxcbiAgICBuYW1lOiAncG9kbG92ZXdlYnBsYXllcl9jaGFwdGVyYm94J1xuICB9KTtcblxuICB0aGlzLnRhYlxuICAgIC5jcmVhdGVNYWluQ29udGVudCgnJylcbiAgICAuYXBwZW5kKHRoaXMuZ2VuZXJhdGVUYWJsZSgpKTtcblxuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgbGlzdCBvZiBjaGFwdGVycywgdGhpcyBmdW5jdGlvbiBjcmVhdGVzIHRoZSBjaGFwdGVyIHRhYmxlIGZvciB0aGUgcGxheWVyLlxuICogQHJldHVybnMge2pRdWVyeXxIVE1MRGl2RWxlbWVudH1cbiAqL1xuQ2hhcHRlcnMucHJvdG90eXBlLmdlbmVyYXRlVGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0YWJsZSwgdGJvZHksIG1heGNoYXB0ZXJzdGFydCwgZm9yY2VIb3VycztcblxuICB0YWJsZSA9IHJlbmRlckNoYXB0ZXJUYWJsZSgpO1xuICB0Ym9keSA9IHRhYmxlLmNoaWxkcmVuKCd0Ym9keScpO1xuXG4gIGlmICh0aGlzLmNoYXB0ZXJsaW5rcyAhPT0gJ2ZhbHNlJykge1xuICAgIHRhYmxlLmFkZENsYXNzKCdsaW5rZWQgbGlua2VkXycgKyB0aGlzLmNoYXB0ZXJsaW5rcyk7XG4gIH1cblxuICBtYXhjaGFwdGVyc3RhcnQgPSBnZXRNYXhDaGFwdGVyU3RhcnQodGhpcy5jaGFwdGVycyk7XG4gIGZvcmNlSG91cnMgPSAobWF4Y2hhcHRlcnN0YXJ0ID49IDM2MDApO1xuXG4gIGZ1bmN0aW9uIGJ1aWxkQ2hhcHRlcihpKSB7XG4gICAgdmFyIGR1cmF0aW9uID0gTWF0aC5yb3VuZCh0aGlzLmVuZCAtIHRoaXMuc3RhcnQpLFxuICAgICAgcm93O1xuICAgIC8vbWFrZSBzdXJlIHRoZSBkdXJhdGlvbiBmb3IgYWxsIGNoYXB0ZXJzIGFyZSBlcXVhbGx5IGZvcm1hdHRlZFxuICAgIHRoaXMuZHVyYXRpb24gPSB0Yy5nZW5lcmF0ZShbZHVyYXRpb25dLCBmYWxzZSk7XG5cbiAgICAvL2lmIHRoZXJlIGlzIGEgY2hhcHRlciB0aGF0IHN0YXJ0cyBhZnRlciBhbiBob3VyLCBmb3JjZSAnMDA6JyBvbiBhbGwgcHJldmlvdXMgY2hhcHRlcnNcbiAgICAvL2luc2VydCB0aGUgY2hhcHRlciBkYXRhXG4gICAgdGhpcy5zdGFydFRpbWUgPSB0Yy5nZW5lcmF0ZShbTWF0aC5yb3VuZCh0aGlzLnN0YXJ0KV0sIHRydWUsIGZvcmNlSG91cnMpO1xuXG4gICAgcm93ID0gcmVuZGVyUm93KHRoaXMsIGkpO1xuICAgIGlmIChpICUgMikge1xuICAgICAgcm93LmFkZENsYXNzKCdvZGRjaGFwdGVyJyk7XG4gICAgfVxuICAgIHJvdy5hcHBlbmRUbyh0Ym9keSk7XG4gICAgdGhpcy5lbGVtZW50ID0gcm93O1xuICB9XG5cbiAgJC5lYWNoKHRoaXMuY2hhcHRlcnMsIGJ1aWxkQ2hhcHRlcik7XG4gIHJldHVybiB0YWJsZTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7bWVqcy5IdG1sTWVkaWFFbGVtZW50fSBwbGF5ZXJcbiAqL1xuQ2hhcHRlcnMucHJvdG90eXBlLmFkZEV2ZW50aGFuZGxlcnMgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gIGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgIC8vIGVuYWJsZSBleHRlcm5hbCBsaW5rcyB0byBiZSBvcGVuZWQgaW4gYSBuZXcgdGFiIG9yIHdpbmRvd1xuICAgIC8vIGNhbmNlbHMgZXZlbnQgdG8gYnViYmxlIHVwXG4gICAgaWYgKGUudGFyZ2V0LmNsYXNzTmFtZSA9PT0gJ3B3cC1vdXRnb2luZyBidXR0b24gYnV0dG9uLXRvZ2dsZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCdjaGFwdGVyI2NsaWNrSGFuZGxlcjogc3RhcnQgY2hhcHRlciBhdCcsIGNoYXB0ZXJTdGFydCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIEJhc2ljIENoYXB0ZXIgTWFyayBmdW5jdGlvbiAod2l0aG91dCBkZWVwbGlua2luZylcbiAgICBjb25zb2xlLmxvZygnQ2hhcHRlcicsICdjbGlja0hhbmRsZXInLCAnc2V0Q3VycmVudENoYXB0ZXIgdG8nLCBlLmRhdGEuaW5kZXgpO1xuICAgIGUuZGF0YS5tb2R1bGUuc2V0Q3VycmVudENoYXB0ZXIoZS5kYXRhLmluZGV4KTtcbiAgICAvLyBmbGFzaCBmYWxsYmFjayBuZWVkcyBhZGRpdGlvbmFsIHBhdXNlXG4gICAgaWYgKHBsYXllci5wbHVnaW5UeXBlID09PSAnZmxhc2gnKSB7XG4gICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICB9XG4gICAgZS5kYXRhLm1vZHVsZS5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDbGlja0hhbmRsZXIgKGNoYXB0ZXIsIGluZGV4KSB7XG4gICAgY2hhcHRlci5lbGVtZW50Lm9uKCdjbGljaycsIHttb2R1bGU6IHRoaXMsIGluZGV4OiBpbmRleH0sIG9uQ2xpY2spO1xuICB9XG5cbiAgdGhpcy5jaGFwdGVycy5mb3JFYWNoKGFkZENsaWNrSGFuZGxlciwgdGhpcyk7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUuZ2V0QWN0aXZlQ2hhcHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFjdGl2ZSA9IHRoaXMuY2hhcHRlcnNbdGhpcy5jdXJyZW50Q2hhcHRlcl07XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICdnZXRBY3RpdmVDaGFwdGVyJywgYWN0aXZlKTtcbiAgcmV0dXJuIGFjdGl2ZTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBjaGFwdGVySW5kZXhcbiAqL1xuQ2hhcHRlcnMucHJvdG90eXBlLnNldEN1cnJlbnRDaGFwdGVyID0gZnVuY3Rpb24gKGNoYXB0ZXJJbmRleCkge1xuICBpZiAoY2hhcHRlckluZGV4IDwgdGhpcy5jaGFwdGVycy5sZW5ndGggJiYgY2hhcHRlckluZGV4ID49IDApIHtcbiAgICB0aGlzLmN1cnJlbnRDaGFwdGVyID0gY2hhcHRlckluZGV4O1xuICB9XG4gIHRoaXMubWFya0FjdGl2ZUNoYXB0ZXIoKTtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ3NldEN1cnJlbnRDaGFwdGVyJywgJ3RvJywgdGhpcy5jdXJyZW50Q2hhcHRlcik7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUubWFya0FjdGl2ZUNoYXB0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhY3RpdmVDaGFwdGVyID0gdGhpcy5nZXRBY3RpdmVDaGFwdGVyKCk7XG4gICQuZWFjaCh0aGlzLmNoYXB0ZXJzLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgfSk7XG4gIGFjdGl2ZUNoYXB0ZXIuZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJyk7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRDaGFwdGVyLFxuICAgIG5leHQgPSB0aGlzLnNldEN1cnJlbnRDaGFwdGVyKGN1cnJlbnQgKyAxKTtcbiAgaWYgKGN1cnJlbnQgPT09IG5leHQpIHtcbiAgICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAnbmV4dCcsICdhbHJlYWR5IGluIGxhc3QgY2hhcHRlcicpO1xuICAgIHJldHVybiBjdXJyZW50O1xuICB9XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICduZXh0JywgJ2NoYXB0ZXInLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgcmV0dXJuIG5leHQ7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50Q2hhcHRlcixcbiAgICBwcmV2aW91cyA9IHRoaXMuc2V0Q3VycmVudENoYXB0ZXIoY3VycmVudCAtIDEpO1xuICBpZiAoY3VycmVudCA9PT0gcHJldmlvdXMpIHtcbiAgICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAncHJldmlvdXMnLCAnYWxyZWFkeSBpbiBmaXJzdCBjaGFwdGVyJyk7XG4gICAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxuICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAncHJldmlvdXMnLCAnY2hhcHRlcicsIHRoaXMuY3VycmVudENoYXB0ZXIpO1xuICB0aGlzLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICByZXR1cm4gcHJldmlvdXM7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUucGxheUN1cnJlbnRDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhcnQgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKS5zdGFydDtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJyNwbGF5Q3VycmVudENoYXB0ZXInLCAnc3RhcnQnLCBzdGFydCk7XG4gIHZhciB0aW1lID0gdGhpcy50aW1lbGluZS5zZXRUaW1lKHN0YXJ0KTtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJyNwbGF5Q3VycmVudENoYXB0ZXInLCAnY3VycmVudFRpbWUnLCB0aW1lKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcHRlcnM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jaGFwdGVyLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFRhYiA9IHJlcXVpcmUoJy4uL3RhYicpXG4gICwgdGltZUNvZGUgPSByZXF1aXJlKCcuLi90aW1lY29kZScpO1xuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgZmlsZXNpemUgaW50byBLQiBhbmQgTUJcbiAqIEBwYXJhbSBzaXplXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRTaXplKHNpemUpIHtcbiAgdmFyIG9uZU1iID0gMTA0ODU3NjtcbiAgdmFyIGZpbGVTaXplID0gcGFyc2VJbnQoc2l6ZSwgMTApO1xuICB2YXIga0JGaWxlU2l6ZSA9IE1hdGgucm91bmQoZmlsZVNpemUgLyAxMDI0KTtcbiAgdmFyIG1CRmlsZVNJemUgPSBNYXRoLnJvdW5kKGZpbGVTaXplIC8gMTAyNCAvIDEwMjQpO1xuICBpZiAoIXNpemUpIHtcbiAgICByZXR1cm4gJyAtLSAnO1xuICB9XG4gIC8vIGluIGNhc2UsIHRoZSBmaWxlc2l6ZSBpcyBzbWFsbGVyIHRoYW4gMU1CLFxuICAvLyB0aGUgZm9ybWF0IHdpbGwgYmUgcmVuZGVyZWQgaW4gS0JcbiAgLy8gb3RoZXJ3aXNlIGluIE1CXG4gIHJldHVybiAoZmlsZVNpemUgPCBvbmVNYikgPyBrQkZpbGVTaXplICsgJyBLQicgOiBtQkZpbGVTSXplICsgJyBNQic7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBsaXN0RWxlbWVudFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gY3JlYXRlT3B0aW9uKGxpc3RFbGVtZW50KSB7XG4gIGNvbnNvbGUubG9nKGxpc3RFbGVtZW50KTtcbiAgcmV0dXJuICc8b3B0aW9uPicgKyBsaXN0RWxlbWVudC5hc3NldFRpdGxlICsgJyAnICsgZm9ybWF0U2l6ZShsaXN0RWxlbWVudC5zaXplKSArICc8L29wdGlvbj4nO1xufVxuXG5mdW5jdGlvbiBnZXRQb3N0ZXJJbWFnZShwYXJhbXMpIHtcbiAgdmFyIGRlZmF1bHRQb3N0ZXIgPSAnL2ltZy9pY29uLXBvZGxvdmUtc3Vic2NyaWJlLTYwMC5wbmcnO1xuICB2YXIgZGVmYXVsdENsYXNzID0gJ2RlZmF1bHQtcG9zdGVyJztcblxuICB2YXIgcG9zdGVyID0gZGVmYXVsdFBvc3RlcjtcbiAgaWYgKHBhcmFtcy5zaG93LnBvc3Rlcikge1xuICAgIHBvc3RlciA9IHBhcmFtcy5zaG93LnBvc3RlcjtcbiAgICBkZWZhdWx0Q2xhc3MgPSAnJztcbiAgfVxuICBpZiAocGFyYW1zLnBvc3Rlcikge1xuICAgIHBvc3RlciA9IHBhcmFtcy5wb3N0ZXI7XG4gICAgZGVmYXVsdENsYXNzID0gJyc7XG4gIH1cblxuICByZXR1cm4gJzxpbWcgY2xhc3M9XCJwb3N0ZXItaW1hZ2UgJyArIGRlZmF1bHRDbGFzcyArICdcIiBzcmM9XCInICsgcG9zdGVyICsgJ1wiIGRhdGEtaW1nPVwiJyArIHBvc3RlciArICdcIiAnICtcbiAgICAnYWx0PVwiUG9zdGVyIEltYWdlXCI+Jztcbn1cblxuZnVuY3Rpb24gZ2V0UHVibGljYXRpb25EYXRlKHJhd0RhdGUpIHtcbiAgaWYgKCFyYXdEYXRlKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHZhciBkYXRlID0gbmV3IERhdGUocmF3RGF0ZSk7XG4gIHJldHVybiAnPHA+UHVibGlzaGVkOiAnICsgZGF0ZS5nZXREYXRlKCkgKyAnLicgKyBkYXRlLmdldE1vbnRoKCkgKyAnLicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnPC9wPic7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcmV0dXJucyB7e2Fzc2V0VGl0bGU6IFN0cmluZywgZG93bmxvYWRVcmw6IFN0cmluZywgdXJsOiBTdHJpbmcsIHNpemU6IE51bWJlcn19XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZURvd25sb2FkIChlbGVtZW50KSB7XG4gIHJldHVybiB7XG4gICAgYXNzZXRUaXRsZTogZWxlbWVudC5uYW1lLFxuICAgIGRvd25sb2FkVXJsOiBlbGVtZW50LmRsdXJsLFxuICAgIHVybDogZWxlbWVudC51cmwsXG4gICAgc2l6ZTogZWxlbWVudC5zaXplXG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcmV0dXJucyB7e2Fzc2V0VGl0bGU6IFN0cmluZywgZG93bmxvYWRVcmw6IFN0cmluZywgdXJsOiBTdHJpbmcsIHNpemU6IE51bWJlcn19XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNvdXJjZShlbGVtZW50KSB7XG4gIHZhciBzb3VyY2UgPSAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSA/IGVsZW1lbnQgOiBlbGVtZW50LnNyYztcbiAgdmFyIHBhcnRzID0gc291cmNlLnNwbGl0KCcuJyk7XG4gIHJldHVybiB7XG4gICAgYXNzZXRUaXRsZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV0sXG4gICAgZG93bmxvYWRVcmw6IHNvdXJjZSxcbiAgICB1cmw6IHNvdXJjZSxcbiAgICBzaXplOiAtMVxuICB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxpc3QgKHBhcmFtcykge1xuICBpZiAocGFyYW1zLmRvd25sb2FkcyAmJiBwYXJhbXMuZG93bmxvYWRzWzBdLmFzc2V0VGl0bGUpIHtcbiAgICByZXR1cm4gcGFyYW1zLmRvd25sb2FkcztcbiAgfVxuXG4gIGlmIChwYXJhbXMuZG93bmxvYWRzKSB7XG4gICAgcmV0dXJuIHBhcmFtcy5kb3dubG9hZHMubWFwKG5vcm1hbGl6ZURvd25sb2FkKTtcbiAgfVxuICAvLyBidWlsZCBmcm9tIHNvdXJjZSBlbGVtZW50c1xuICByZXR1cm4gcGFyYW1zLnNvdXJjZXMubWFwKG5vcm1hbGl6ZVNvdXJjZSk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEb3dubG9hZHMgKHBhcmFtcykge1xuICB0aGlzLmxpc3QgPSBjcmVhdGVMaXN0KHBhcmFtcyk7XG4gIHRoaXMudGFiID0gdGhpcy5jcmVhdGVEb3dubG9hZFRhYihwYXJhbXMpO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAcmV0dXJucyB7bnVsbHxUYWJ9IGRvd25sb2FkIHRhYlxuICovXG5Eb3dubG9hZHMucHJvdG90eXBlLmNyZWF0ZURvd25sb2FkVGFiID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICBpZiAoKCFwYXJhbXMuZG93bmxvYWRzICYmICFwYXJhbXMuc291cmNlcykgfHwgcGFyYW1zLmhpZGVkb3dubG9hZGJ1dHRvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBkb3dubG9hZFRhYiA9IG5ldyBUYWIoe1xuICAgIGljb246ICdwd3AtZG93bmxvYWQnLFxuICAgIHRpdGxlOiAnU2hvdy9oaWRlIGRvd25sb2FkIGJhcicsXG4gICAgbmFtZTogJ2Rvd25sb2FkcycsXG4gICAgaGVhZGxpbmU6ICdEb3dubG9hZCdcbiAgfSk7XG5cbiAgdmFyICR0YWJDb250ZW50ID0gZG93bmxvYWRUYWIuY3JlYXRlTWFpbkNvbnRlbnQoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPicgK1xuICAgICc8ZGl2IGNsYXNzPVwicG9zdGVyLXdyYXBwZXJcIj4nICtcbiAgICAnPGRpdiBjbGFzcz1cImRvd25sb2FkIGRvd25sb2FkLW92ZXJsYXlcIj48L2Rpdj4nICtcbiAgICBnZXRQb3N0ZXJJbWFnZShwYXJhbXMpICtcbiAgICAnPC9kaXY+JyArXG4gICAgJzwvZGl2PicgK1xuICAgICc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj4nICtcbiAgICAnPGgyPicgKyBwYXJhbXMudGl0bGUgKyAnPC9oMj4nICtcbiAgICBnZXRQdWJsaWNhdGlvbkRhdGUocGFyYW1zLnB1YmxpY2F0aW9uRGF0ZSkgK1xuICAgICc8cD5EdXJhdGlvbjogJyArIHRpbWVDb2RlLmZyb21UaW1lU3RhbXAocGFyYW1zLmR1cmF0aW9uKSArICc8L3A+JyArXG4gICAgJzwvZGl2PidcbiAgKTtcbiAgZG93bmxvYWRUYWIuYm94LmFwcGVuZCgkdGFiQ29udGVudCk7XG5cbiAgZG93bmxvYWRUYWIuY3JlYXRlRm9vdGVyKCc8Zm9ybSBhY3Rpb249XCJcIiBtZXRob2Q9XCJcIj4nICtcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImRvd25sb2FkIGJ1dHRvbi1zdWJtaXQgaWNvbiBwd3AtZG93bmxvYWRcIiBuYW1lPVwiZG93bmxvYWQtZmlsZVwiPicgK1xuICAgICc8c3BhbiBjbGFzcz1cImRvd25sb2FkIGxhYmVsXCI+RG93bmxvYWQgRXBpc29kZTwvc3Bhbj4nICtcbiAgICAnPC9idXR0b24+JyArXG4gICAgJzxzZWxlY3QgY2xhc3M9XCJzZWxlY3RcIiBuYW1lPVwic2VsZWN0LWZpbGVcIj4nICsgdGhpcy5saXN0Lm1hcChjcmVhdGVPcHRpb24pICsgJzwvc2VsZWN0PjwvZm9ybT4nXG4gICk7XG5cbiAgcmV0dXJuIGRvd25sb2FkVGFiO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEb3dubG9hZHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9kb3dubG9hZHMuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGFiID0gcmVxdWlyZSgnLi4vdGFiJylcbiAgLCB0aW1lQ29kZSA9IHJlcXVpcmUoJy4uL3RpbWVjb2RlJylcbiAgLCBzZXJ2aWNlcyA9IHJlcXVpcmUoJy4uL3NvY2lhbC1uZXR3b3JrcycpO1xuXG5mdW5jdGlvbiBnZXRQdWJsaWNhdGlvbkRhdGUocmF3RGF0ZSkge1xuICBpZiAoIXJhd0RhdGUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZShyYXdEYXRlKTtcbiAgcmV0dXJuICc8cD5QdWJsaXNoZWQ6ICcgKyBkYXRlLmdldERhdGUoKSArICcuJyArIGRhdGUuZ2V0TW9udGgoKSArICcuJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICc8L3A+Jztcbn1cblxuZnVuY3Rpb24gY3JlYXRlRXBpc29kZUluZm8odGFiLCBwYXJhbXMpIHtcbiAgdGFiLmNyZWF0ZU1haW5Db250ZW50KFxuICAgICc8aDI+JyArIHBhcmFtcy50aXRsZSArICc8L2gyPicgK1xuICAgICc8aDM+JyArIHBhcmFtcy5zdWJ0aXRsZSArICc8L2gzPicgK1xuICAgICc8cD4nICsgcGFyYW1zLnN1bW1hcnkgKyAnPC9wPicgK1xuICAgICc8cD5EdXJhdGlvbjogJyArIHRpbWVDb2RlLmZyb21UaW1lU3RhbXAocGFyYW1zLmR1cmF0aW9uKSArICc8L3A+JyArXG4gICAgIGdldFB1YmxpY2F0aW9uRGF0ZShwYXJhbXMucHVibGljYXRpb25EYXRlKSArXG4gICAgJzxwPicgK1xuICAgICAgJ1Blcm1hbGluayBmb3IgdGhpcyBlcGlzb2RlOjxicj4nICtcbiAgICAgICc8YSBocmVmPVwiJyArIHBhcmFtcy5wZXJtYWxpbmsgKyAnXCI+JyArIHBhcmFtcy5wZXJtYWxpbmsgKyAnPC9hPicgK1xuICAgICc8L3A+J1xuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3N0ZXJJbWFnZShwb3N0ZXIpIHtcbiAgaWYgKCFwb3N0ZXIpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuICc8ZGl2IGNsYXNzPVwicG9zdGVyLWltYWdlXCI+JyArXG4gICAgJzxpbWcgc3JjPVwiJyArIHBvc3RlciArICdcIiBkYXRhLWltZz1cIicgKyBwb3N0ZXIgKyAnXCIgYWx0PVwiUG9zdGVyIEltYWdlXCI+JyArXG4gICAgJzwvZGl2Pic7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1YnNjcmliZUJ1dHRvbihwYXJhbXMpIHtcbiAgaWYgKCFwYXJhbXMuc3Vic2NyaWJlQnV0dG9uKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGJ1dHRvbiBjbGFzcz1cImJ1dHRvbi1zdWJtaXRcIj4nICtcbiAgICAgICc8c3BhbiBjbGFzcz1cInNob3d0aXRsZS1sYWJlbFwiPicgKyBwYXJhbXMuc2hvdy50aXRsZSArICc8L3NwYW4+JyArXG4gICAgICAnPHNwYW4gY2xhc3M9XCJzdWJtaXQtbGFiZWxcIj4nICsgcGFyYW1zLnN1YnNjcmliZUJ1dHRvbiArICc8L3NwYW4+JyArXG4gICAgJzwvYnV0dG9uPic7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNob3dJbmZvICh0YWIsIHBhcmFtcykge1xuICB0YWIuY3JlYXRlQXNpZGUoXG4gICAgJzxoMj4nICsgcGFyYW1zLnNob3cudGl0bGUgKyAnPC9oMj4nICtcbiAgICAnPGgzPicgKyBwYXJhbXMuc2hvdy5zdWJ0aXRsZSArICc8L2gzPicgK1xuICAgIGNyZWF0ZVBvc3RlckltYWdlKHBhcmFtcy5zaG93LnBvc3RlcikgK1xuICAgIGNyZWF0ZVN1YnNjcmliZUJ1dHRvbihwYXJhbXMpICtcbiAgICAnPHA+TGluayB0byB0aGUgc2hvdzo8YnI+JyArXG4gICAgICAnPGEgaHJlZj1cIicgKyBwYXJhbXMuc2hvdy51cmwgKyAnXCI+JyArIHBhcmFtcy5zaG93LnVybCArICc8L2E+PC9wPidcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU29jaWFsTGluayhvcHRpb25zKSB7XG4gIHZhciBzZXJ2aWNlID0gc2VydmljZXMuZ2V0KG9wdGlvbnMuc2VydmljZU5hbWUpO1xuICB2YXIgbGlzdEl0ZW0gPSAkKCc8bGk+PC9saT4nKTtcbiAgdmFyIGJ1dHRvbiA9IHNlcnZpY2UuZ2V0QnV0dG9uKG9wdGlvbnMpO1xuICBsaXN0SXRlbS5hcHBlbmQoYnV0dG9uLmVsZW1lbnQpO1xuICB0aGlzLmFwcGVuZChsaXN0SXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNvY2lhbEluZm8ocHJvZmlsZXMpIHtcbiAgaWYgKCFwcm9maWxlcykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHByb2ZpbGVMaXN0ID0gJCgnPHVsPjwvdWw+Jyk7XG4gIHByb2ZpbGVzLmZvckVhY2goY3JlYXRlU29jaWFsTGluaywgcHJvZmlsZUxpc3QpO1xuXG4gIHZhciBjb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwic29jaWFsLWxpbmtzXCI+PGgzPlN0YXkgaW4gdG91Y2g8L2gzPjwvZGl2PicpO1xuICBjb250YWluZXIuYXBwZW5kKHByb2ZpbGVMaXN0KTtcbiAgcmV0dXJuIGNvbnRhaW5lcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU29jaWFsQW5kTGljZW5zZUluZm8gKHRhYiwgcGFyYW1zKSB7XG4gIGlmICghcGFyYW1zLmxpY2Vuc2UgJiYgIXBhcmFtcy5wcm9maWxlcykge1xuICAgIHJldHVybjtcbiAgfVxuICB0YWIuY3JlYXRlRm9vdGVyKFxuICAgICc8cD5UaGUgc2hvdyBcIicgKyBwYXJhbXMuc2hvdy50aXRsZSArICdcIiBpcyBsaWNlbmNlZCB1bmRlcjxicj4nICtcbiAgICAgICc8YSBocmVmPVwiJyArIHBhcmFtcy5saWNlbnNlLnVybCArICdcIj4nICsgcGFyYW1zLmxpY2Vuc2UubmFtZSArICc8L2E+JyArXG4gICAgJzwvcD4nXG4gICkucHJlcGVuZChjcmVhdGVTb2NpYWxJbmZvKHBhcmFtcy5wcm9maWxlcykpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSBpbmZvIHRhYiBpZiBwYXJhbXMuc3VtbWFyeSBpcyBkZWZpbmVkXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlciBvYmplY3RcbiAqIEByZXR1cm5zIHtudWxsfFRhYn0gaW5mbyB0YWIgaW5zdGFuY2Ugb3IgbnVsbFxuICovXG5mdW5jdGlvbiBjcmVhdGVJbmZvVGFiKHBhcmFtcykge1xuICBpZiAoIXBhcmFtcy5zdW1tYXJ5KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGluZm9UYWIgPSBuZXcgVGFiKHtcbiAgICBpY29uOiAncHdwLWluZm8nLFxuICAgIHRpdGxlOiAnTW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzJyxcbiAgICBoZWFkbGluZTogJ0luZm8nLFxuICAgIG5hbWU6ICdpbmZvJ1xuICB9KTtcblxuICBjcmVhdGVFcGlzb2RlSW5mbyhpbmZvVGFiLCBwYXJhbXMpO1xuICBjcmVhdGVTaG93SW5mbyhpbmZvVGFiLCBwYXJhbXMpO1xuICBjcmVhdGVTb2NpYWxBbmRMaWNlbnNlSW5mbyhpbmZvVGFiLCBwYXJhbXMpO1xuXG4gIHJldHVybiBpbmZvVGFiO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIG1vZHVsZSB0byBkaXNwbGF5IHBvZGNhc3QgYW5kIGVwaXNvZGUgaW5mb1xuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXIgb2JqZWN0XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSW5mbyhwYXJhbXMpIHtcbiAgdGhpcy50YWIgPSBjcmVhdGVJbmZvVGFiKHBhcmFtcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5mbztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL2luZm8uanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuLi90aW1lY29kZScpO1xudmFyIGNhcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS5jYXA7XG5cbmZ1bmN0aW9uIHJlbmRlclRpbWVFbGVtZW50KGNsYXNzTmFtZSwgdGltZSkge1xuICByZXR1cm4gJCgnPGRpdiBjbGFzcz1cInRpbWUgdGltZS0nICsgY2xhc3NOYW1lICsgJ1wiPicgKyB0aW1lICsgJzwvZGl2PicpO1xufVxuXG4vKipcbiAqIFJlbmRlciBhbiBIVE1MIEVsZW1lbnQgZm9yIHRoZSBjdXJyZW50IGNoYXB0ZXJcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlckN1cnJlbnRDaGFwdGVyRWxlbWVudCgpIHtcbiAgdmFyIGNoYXB0ZXJFbGVtZW50ID0gJCgnPGRpdiBjbGFzcz1cImNoYXB0ZXJcIj48L2Rpdj4nKTtcblxuICBpZiAoIXRoaXMuY2hhcHRlck1vZHVsZSkge1xuICAgIHJldHVybiBjaGFwdGVyRWxlbWVudDtcbiAgfVxuXG4gIHZhciBpbmRleCA9IHRoaXMuY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlcjtcbiAgdmFyIGNoYXB0ZXIgPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY2hhcHRlcnNbaW5kZXhdO1xuICBjb25zb2xlLmRlYnVnKCdQcm9ncmVzc2JhcicsICdyZW5kZXJDdXJyZW50Q2hhcHRlckVsZW1lbnQnLCBpbmRleCwgY2hhcHRlcik7XG5cbiAgdGhpcy5jaGFwdGVyQmFkZ2UgPSAkKCc8c3BhbiBjbGFzcz1cImJhZGdlXCI+JyArIChpbmRleCArIDEpICsgJzwvc3Bhbj4nKTtcbiAgdGhpcy5jaGFwdGVyVGl0bGUgPSAkKCc8c3BhbiBjbGFzcz1cImNoYXB0ZXItdGl0bGVcIj4nICsgY2hhcHRlci50aXRsZSArICc8L3NwYW4+Jyk7XG5cbiAgY2hhcHRlckVsZW1lbnRcbiAgICAuYXBwZW5kKHRoaXMuY2hhcHRlckJhZGdlKVxuICAgIC5hcHBlbmQodGhpcy5jaGFwdGVyVGl0bGUpO1xuXG4gIHJldHVybiBjaGFwdGVyRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvZ3Jlc3NJbmZvKHByb2dyZXNzQmFyKSB7XG4gIHZhciBwcm9ncmVzc0luZm8gPSAkKCc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtaW5mb1wiPjwvZGl2PicpO1xuXG4gIHJldHVybiBwcm9ncmVzc0luZm9cbiAgICAuYXBwZW5kKHByb2dyZXNzQmFyLmN1cnJlbnRUaW1lKVxuICAgIC5hcHBlbmQocmVuZGVyQ3VycmVudENoYXB0ZXJFbGVtZW50LmNhbGwocHJvZ3Jlc3NCYXIpKVxuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIuZHVyYXRpb25UaW1lRWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRpbWVzKHByb2dyZXNzQmFyKSB7XG4gIHZhciB0aW1lID0gcHJvZ3Jlc3NCYXIudGltZWxpbmUuZ2V0VGltZSgpO1xuICBwcm9ncmVzc0Jhci5jdXJyZW50VGltZS5odG1sKHRjLmZyb21UaW1lU3RhbXAodGltZSkpO1xuXG4gIGlmIChwcm9ncmVzc0Jhci5zaG93RHVyYXRpb24pIHsgcmV0dXJuOyB9XG5cbiAgdmFyIHJlbWFpbmluZ1RpbWUgPSBNYXRoLmFicyh0aW1lIC0gcHJvZ3Jlc3NCYXIuZHVyYXRpb24pO1xuICBwcm9ncmVzc0Jhci5kdXJhdGlvblRpbWVFbGVtZW50LnRleHQoJy0nICsgdGMuZnJvbVRpbWVTdGFtcChyZW1haW5pbmdUaW1lKSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckR1cmF0aW9uVGltZUVsZW1lbnQocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIGZvcm1hdHRlZER1cmF0aW9uID0gdGMuZnJvbVRpbWVTdGFtcChwcm9ncmVzc0Jhci5kdXJhdGlvbik7XG4gIHZhciBkdXJhdGlvblRpbWVFbGVtZW50ID0gcmVuZGVyVGltZUVsZW1lbnQoJ2R1cmF0aW9uJywgMCk7XG5cbiAgZHVyYXRpb25UaW1lRWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgcHJvZ3Jlc3NCYXIuc2hvd0R1cmF0aW9uID0gIXByb2dyZXNzQmFyLnNob3dEdXJhdGlvbjtcbiAgICBpZiAocHJvZ3Jlc3NCYXIuc2hvd0R1cmF0aW9uKSB7XG4gICAgICBkdXJhdGlvblRpbWVFbGVtZW50LnRleHQoZm9ybWF0dGVkRHVyYXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB1cGRhdGVUaW1lcyhwcm9ncmVzc0Jhcik7XG4gIH0pO1xuXG4gIHJldHVybiBkdXJhdGlvblRpbWVFbGVtZW50O1xufVxuXG5mdW5jdGlvbiByZW5kZXJNYXJrZXJBdCh0aW1lKSB7XG4gIHZhciBwZXJjZW50ID0gMTAwICogdGltZSAvIHRoaXMuZHVyYXRpb247XG4gIHJldHVybiAkKCc8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJsZWZ0OicgKyBwZXJjZW50ICsgJyU7XCI+PC9kaXY+Jyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNoYXB0ZXJNYXJrZXIoY2hhcHRlcikge1xuICByZXR1cm4gcmVuZGVyTWFya2VyQXQuY2FsbCh0aGlzLCBjaGFwdGVyLnN0YXJ0KTtcbn1cblxuLyoqXG4gKiBUaGlzIHVwZGF0ZSBtZXRob2QgaXMgdG8gYmUgY2FsbGVkIHdoZW4gYSBwbGF5ZXJzIGBjdXJyZW50VGltZWAgY2hhbmdlcy5cbiAqL1xuZnVuY3Rpb24gdXBkYXRlICh0aW1lbGluZSkge1xuICB0aGlzLnNldFByb2dyZXNzKHRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIHRoaXMuYnVmZmVyLnZhbCh0aW1lbGluZS5nZXRCdWZmZXJlZCgpKTtcbiAgdGhpcy5zZXRDaGFwdGVyKCk7XG59XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBDcmVhdGVzIGEgbmV3IHByb2dyZXNzIGJhciBvYmplY3QuXG4gKiBAcGFyYW0ge1RpbWVsaW5lfSB0aW1lbGluZSAtIFRoZSBwbGF5ZXJzIHRpbWVsaW5lIHRvIGF0dGFjaCB0by5cbiAqL1xuZnVuY3Rpb24gUHJvZ3Jlc3NCYXIodGltZWxpbmUpIHtcbiAgaWYgKCF0aW1lbGluZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RpbWVsaW5lIG1pc3NpbmcnLCBhcmd1bWVudHMpO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnRpbWVsaW5lID0gdGltZWxpbmU7XG4gIHRoaXMuZHVyYXRpb24gPSB0aW1lbGluZS5kdXJhdGlvbjtcblxuICB0aGlzLmJhciA9IG51bGw7XG4gIHRoaXMuY3VycmVudFRpbWUgPSBudWxsO1xuXG4gIGlmICh0aW1lbGluZS5oYXNDaGFwdGVycykge1xuICAgIC8vIEZJWE1FIGdldCBhY2Nlc3MgdG8gY2hhcHRlck1vZHVsZSByZWxpYWJseVxuICAgIC8vIHRoaXMudGltZWxpbmUuZ2V0TW9kdWxlKCdjaGFwdGVycycpXG4gICAgdGhpcy5jaGFwdGVyTW9kdWxlID0gdGhpcy50aW1lbGluZS5tb2R1bGVzWzBdO1xuICAgIHRoaXMuY2hhcHRlckJhZGdlID0gbnVsbDtcbiAgICB0aGlzLmNoYXB0ZXJUaXRsZSA9IG51bGw7XG4gIH1cblxuICB0aGlzLnNob3dEdXJhdGlvbiA9IGZhbHNlO1xuICB0aGlzLnByb2dyZXNzID0gbnVsbDtcbiAgdGhpcy5idWZmZXIgPSBudWxsO1xuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xufVxuXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUuc2V0SGFuZGxlUG9zaXRpb24gPSBmdW5jdGlvbiAodGltZSkge1xuICB2YXIgcGVyY2VudCA9IHRpbWUgLyB0aGlzLmR1cmF0aW9uICogMTAwO1xuICB2YXIgbmV3TGVmdE9mZnNldCA9IHBlcmNlbnQgKyAnJSc7XG4gIGNvbnNvbGUuZGVidWcoJ1Byb2dyZXNzQmFyJywgJ3NldEhhbmRsZVBvc2l0aW9uJywgJ3RpbWUnLCB0aW1lLCAnbmV3TGVmdE9mZnNldCcsIG5ld0xlZnRPZmZzZXQpO1xuICB0aGlzLmhhbmRsZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0T2Zmc2V0KTtcbn07XG5cbi8qKlxuICogc2V0IHByb2dyZXNzIGJhciB2YWx1ZSwgc2xpZGVyIHBvc2l0aW9uIGFuZCBjdXJyZW50IHRpbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIHRoaXMucHJvZ3Jlc3MudmFsKHRpbWUpO1xuICB0aGlzLnNldEhhbmRsZVBvc2l0aW9uKHRpbWUpO1xuICB1cGRhdGVUaW1lcyh0aGlzKTtcbn07XG5cbi8qKlxuICogc2V0IGNoYXB0ZXIgdGl0bGUgYW5kIGJhZGdlXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY2hhcHRlck1vZHVsZSkgeyByZXR1cm47IH1cblxuICB2YXIgaW5kZXggPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXI7XG4gIHZhciBjaGFwdGVyID0gdGhpcy5jaGFwdGVyTW9kdWxlLmNoYXB0ZXJzW2luZGV4XTtcbiAgdGhpcy5jaGFwdGVyQmFkZ2UudGV4dChpbmRleCArIDEpO1xuICB0aGlzLmNoYXB0ZXJUaXRsZS50ZXh0KGNoYXB0ZXIudGl0bGUpO1xufTtcblxuLyoqXG4gKiBSZW5kZXJzIGEgbmV3IHByb2dyZXNzIGJhciBqUXVlcnkgb2JqZWN0LlxuICovXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuXG4gIC8vIHRpbWUgZWxlbWVudHNcbiAgdmFyIGluaXRpYWxUaW1lID0gdGMuZnJvbVRpbWVTdGFtcCh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIHRoaXMuY3VycmVudFRpbWUgPSByZW5kZXJUaW1lRWxlbWVudCgnY3VycmVudCcsIGluaXRpYWxUaW1lKTtcbiAgdGhpcy5kdXJhdGlvblRpbWVFbGVtZW50ID0gcmVuZGVyRHVyYXRpb25UaW1lRWxlbWVudCh0aGlzKTtcblxuICAvLyBwcm9ncmVzcyBpbmZvXG4gIHZhciBwcm9ncmVzc0luZm8gPSByZW5kZXJQcm9ncmVzc0luZm8odGhpcyk7XG4gIHVwZGF0ZVRpbWVzKHRoaXMpO1xuXG4gIC8vIHRpbWVsaW5lIGFuZCBidWZmZXIgYmFyc1xuICB2YXIgcHJvZ3Jlc3MgPSAkKCc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIj48L2Rpdj4nKTtcbiAgdmFyIHRpbWVsaW5lQmFyID0gJCgnPHByb2dyZXNzIGNsYXNzPVwiY3VycmVudFwiPjwvcHJvZ3Jlc3M+JylcbiAgICAgIC5hdHRyKHsgbWluOiAwLCBtYXg6IHRoaXMuZHVyYXRpb259KTtcbiAgdmFyIGJ1ZmZlciA9ICQoJzxwcm9ncmVzcyBjbGFzcz1cImJ1ZmZlclwiPjwvcHJvZ3Jlc3M+JylcbiAgICAgIC5hdHRyKHttaW46IDAsIG1heDogdGhpcy5kdXJhdGlvbn0pO1xuICB2YXIgaGFuZGxlID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZVwiPjxkaXYgY2xhc3M9XCJpbm5lci1oYW5kbGVcIj48L2Rpdj48L2Rpdj4nKTtcblxuICBwcm9ncmVzc1xuICAgIC5hcHBlbmQodGltZWxpbmVCYXIpXG4gICAgLmFwcGVuZChidWZmZXIpXG4gICAgLmFwcGVuZChoYW5kbGUpO1xuXG4gIHRoaXMucHJvZ3Jlc3MgPSB0aW1lbGluZUJhcjtcbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gIHRoaXMuaGFuZGxlID0gaGFuZGxlO1xuICB0aGlzLnNldFByb2dyZXNzKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcblxuICBpZiAodGhpcy5jaGFwdGVyTW9kdWxlKSB7XG4gICAgdmFyIGNoYXB0ZXJNYXJrZXJzID0gdGhpcy5jaGFwdGVyTW9kdWxlLmNoYXB0ZXJzLm1hcChyZW5kZXJDaGFwdGVyTWFya2VyLCB0aGlzKTtcbiAgICBjaGFwdGVyTWFya2Vycy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3Qgb25lXG4gICAgcHJvZ3Jlc3MuYXBwZW5kKGNoYXB0ZXJNYXJrZXJzKTtcbiAgfVxuXG4gIC8vIHByb2dyZXNzIGJhclxuICB2YXIgYmFyID0gJCgnPGRpdiBjbGFzcz1cInByb2dyZXNzYmFyXCI+PC9kaXY+Jyk7XG4gIGJhclxuICAgIC5hcHBlbmQocHJvZ3Jlc3NJbmZvKVxuICAgIC5hcHBlbmQocHJvZ3Jlc3MpO1xuXG4gIHRoaXMuYmFyID0gYmFyO1xuICByZXR1cm4gYmFyO1xufTtcblxuUHJvZ3Jlc3NCYXIucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbW91c2VJc0Rvd24gPSBmYWxzZTtcbiAgdmFyIHRpbWVsaW5lID0gdGhpcy50aW1lbGluZTtcbiAgdmFyIHByb2dyZXNzID0gdGhpcy5wcm9ncmVzcztcblxuICBmdW5jdGlvbiBjYWxjdWxhdGVOZXdUaW1lIChwYWdlWCkge1xuICAgIC8vIG1vdXNlIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSBvYmplY3RcbiAgICB2YXIgd2lkdGggPSBwcm9ncmVzcy5vdXRlcldpZHRoKHRydWUpO1xuICAgIHZhciBvZmZzZXQgPSBwcm9ncmVzcy5vZmZzZXQoKTtcbiAgICB2YXIgcG9zID0gY2FwKHBhZ2VYIC0gb2Zmc2V0LmxlZnQsIDAsIHdpZHRoKTtcbiAgICB2YXIgcGVyY2VudGFnZSA9IChwb3MgLyB3aWR0aCk7XG4gICAgcmV0dXJuIHBlcmNlbnRhZ2UgKiB0aW1lbGluZS5kdXJhdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZSAoZXZlbnQpIHtcbiAgICBpZiAodHlwZW9mIHRpbWVsaW5lLmR1cmF0aW9uICE9PSAnbnVtYmVyJyB8fCAhbW91c2VJc0Rvd24gKSB7IHJldHVybjsgfVxuICAgIHZhciBuZXdUaW1lID0gY2FsY3VsYXRlTmV3VGltZShldmVudC5wYWdlWCk7XG4gICAgaWYgKG5ld1RpbWUgPT09IHRpbWVsaW5lLmdldFRpbWUoKSkgeyByZXR1cm47IH1cbiAgICB0aW1lbGluZS5zZWVrKG5ld1RpbWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2Vla1N0YXJ0ICgpIHtcbiAgICB0aW1lbGluZS5zZWVrU3RhcnQoKTtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLmJpbmQoJ21vdXNlbW92ZS5kdXInLCBoYW5kbGVNb3VzZU1vdmUpXG4gICAgICAuYmluZCgndG91Y2htb3ZlLmR1cicsIGhhbmRsZU1vdXNlTW92ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZVVwICgpIHtcbiAgICBtb3VzZUlzRG93biA9IGZhbHNlO1xuICAgIHRpbWVsaW5lLnNlZWtFbmQoKTtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLnVuYmluZCgndG91Y2hlbmQuZHVyJylcbiAgICAgIC51bmJpbmQoJ21vdXNldXAuZHVyJylcbiAgICAgIC51bmJpbmQoJ3RvdWNobW92ZS5kdXInKVxuICAgICAgLnVuYmluZCgnbW91c2Vtb3ZlLmR1cicpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VEb3duIChldmVudCkge1xuICAgIC8vIG9ubHkgaGFuZGxlIGxlZnQgY2xpY2tzXG4gICAgaWYgKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxuXG4gICAgbW91c2VJc0Rvd24gPSB0cnVlO1xuICAgIGhhbmRsZU1vdXNlTW92ZShldmVudCk7XG4gICAgc2Vla1N0YXJ0KCk7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC5iaW5kKCdtb3VzZXVwLmR1cicsIGhhbmRsZU1vdXNlVXApXG4gICAgICAuYmluZCgndG91Y2hlbmQuZHVyJywgaGFuZGxlTW91c2VVcCk7XG4gIH1cblxuICAvLyBoYW5kbGUgY2xpY2sgYW5kIGRyYWcgd2l0aCBtb3VzZSBvciB0b3VjaCBpbiBwcm9ncmVzc2JhciBhbmQgb24gaGFuZGxlXG4gIHRoaXMucHJvZ3Jlc3NcbiAgICAuYmluZCgndG91Y2hzdGFydCcsIGhhbmRsZU1vdXNlRG93bilcbiAgICAuYmluZCgnbW91c2Vkb3duJywgaGFuZGxlTW91c2VEb3duKTtcblxuICB0aGlzLmhhbmRsZVxuICAgIC5iaW5kKCd0b3VjaHN0YXJ0JywgaGFuZGxlTW91c2VEb3duKVxuICAgIC5iaW5kKCdtb3VzZWRvd24nLCBoYW5kbGVNb3VzZURvd24pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9ncmVzc0JhcjtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL3Byb2dyZXNzYmFyLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTYXZpbmcgdGhlIHBsYXl0aW1lXG4gKi9cbnZhciBwcmVmaXggPSAncG9kbG92ZS13ZWItcGxheWVyLXBsYXl0aW1lLSc7XG5cbmZ1bmN0aW9uIGdldEl0ZW0gKCkge1xuICByZXR1cm4gK2xvY2FsU3RvcmFnZVt0aGlzLmtleV07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUl0ZW0gKCkge1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5rZXkpO1xufVxuXG5mdW5jdGlvbiBoYXNJdGVtICgpIHtcbiAgcmV0dXJuICh0aGlzLmtleSkgaW4gbG9jYWxTdG9yYWdlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUgKCkge1xuICBjb25zb2xlLmRlYnVnKCdTYXZlVGltZScsICd1cGRhdGUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIHRoaXMuc2V0SXRlbSh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG59XG5cbmZ1bmN0aW9uIFNhdmVUaW1lKHRpbWVsaW5lLCBwYXJhbXMpIHtcbiAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lO1xuICB0aGlzLmtleSA9IHByZWZpeCArIHBhcmFtcy5wZXJtYWxpbms7XG4gIHRoaXMuZ2V0SXRlbSA9IGdldEl0ZW0uYmluZCh0aGlzKTtcbiAgdGhpcy5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbS5iaW5kKHRoaXMpO1xuICB0aGlzLmhhc0l0ZW0gPSBoYXNJdGVtLmJpbmQodGhpcyk7XG4gIHRoaXMudXBkYXRlID0gdXBkYXRlLmJpbmQodGhpcyk7XG5cbiAgLy8gc2V0IHRoZSB0aW1lIG9uIHN0YXJ0XG4gIGlmICh0aGlzLmhhc0l0ZW0oKSkge1xuICAgIHRpbWVsaW5lLnNldFRpbWUodGhpcy5nZXRJdGVtKCkpO1xuICB9XG59XG5cblNhdmVUaW1lLnByb3RvdHlwZS5zZXRJdGVtID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGxvY2FsU3RvcmFnZVt0aGlzLmtleV0gPSB2YWx1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZVRpbWU7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9zYXZldGltZS5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBUYWIgPSByZXF1aXJlKCcuLi90YWInKVxuICAsIFNvY2lhbEJ1dHRvbkxpc3QgPSByZXF1aXJlKCcuLi9zb2NpYWwtYnV0dG9uLWxpc3QnKTtcblxudmFyIHNlcnZpY2VzID0gWyd0d2l0dGVyJywgJ2ZhY2Vib29rJywgJ2dwbHVzJywgJ3R1bWJscicsICdlbWFpbCddXG4gICwgc2hhcmVPcHRpb25zID0gW1xuICAgIHtuYW1lOiAnU2hvdycsIHZhbHVlOiAnc2hvdyd9LFxuICAgIHtuYW1lOiAnRXBpc29kZScsIHZhbHVlOiAnZXBpc29kZScsIGRlZmF1bHQ6IHRydWV9LFxuICAgIHtuYW1lOiAnQ2hhcHRlcicsIHZhbHVlOiAnY2hhcHRlcicsIGRpc2FibGVkOiB0cnVlfSxcbiAgICB7bmFtZTogJ0V4YWN0bHkgdGhpcyBwYXJ0IGhlcmUnLCB2YWx1ZTogJ3RpbWVkJywgZGlzYWJsZWQ6IHRydWV9XG4gIF1cbiAgLCBzaGFyZURhdGEgPSB7fTtcblxuLy8gbW9kdWxlIGdsb2JhbHNcbnZhciBzZWxlY3RlZE9wdGlvbiwgc2hhcmVCdXR0b25zLCBsaW5rSW5wdXQ7XG5cbmZ1bmN0aW9uIGdldFNoYXJlRGF0YSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09ICdzaG93Jykge1xuICAgIHJldHVybiBzaGFyZURhdGEuc2hvdztcbiAgfVxuICB2YXIgZGF0YSA9IHNoYXJlRGF0YS5lcGlzb2RlO1xuICAvLyB0b2RvIGFkZCBjaGFwdGVyIHN0YXJ0IGFuZCBlbmQgdGltZSB0byB1cmxcbiAgLy9pZiAodmFsdWUgPT09ICdjaGFwdGVyJykge1xuICAvL31cbiAgLy8gdG9kbyBhZGQgc2VsZWN0ZWQgc3RhcnQgYW5kIGVuZCB0aW1lIHRvIHVybFxuICAvL2lmICh2YWx1ZSA9PT0gJ3RpbWVkJykge1xuICAvL31cbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVVybHMoZGF0YSkge1xuICBzaGFyZUJ1dHRvbnMudXBkYXRlKGRhdGEpO1xuICBsaW5rSW5wdXQudXBkYXRlKGRhdGEpO1xufVxuXG5mdW5jdGlvbiBvblNoYXJlT3B0aW9uQ2hhbmdlVG8gKGVsZW1lbnQsIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gZ2V0U2hhcmVEYXRhKHZhbHVlKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ3NoYXJpbmcgb3B0aW9ucyBjaGFuZ2VkJywgdmFsdWUpO1xuICAgIHNlbGVjdGVkT3B0aW9uLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgc2VsZWN0ZWRPcHRpb24gPSBlbGVtZW50O1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXBkYXRlVXJscyhkYXRhKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgaHRtbCBmb3IgYW4gcG9zdGVyIGltYWdlXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAnZXBpc29kZScgb3IgJ3Nob3cnXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIVE1MIGZvciB0aGUgaW1hZ2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlUG9zdGVyRm9yKHR5cGUpIHtcbiAgdmFyIGRhdGEgPSBzaGFyZURhdGFbdHlwZV07XG4gIGlmICghdHlwZSB8fCAhZGF0YSB8fCAhZGF0YS5wb3N0ZXIpIHtcbiAgICBjb25zb2xlLndhcm4oJ2Nhbm5vdCBjcmVhdGUgcG9zdGVyIGZvcicsIHR5cGUpO1xuICAgIHJldHVybiAnJztcbiAgfVxuICBjb25zb2xlLmxvZygnY3JlYXRlIHBvc3RlciBmb3InLCB0eXBlLCAnID4gdXJsJywgZGF0YS5wb3N0ZXIpO1xuICByZXR1cm4gJzxpbWcgc3JjPVwiJyArIGRhdGEucG9zdGVyICsgJ1wiIGRhdGEtaW1nPVwiJyArIGRhdGEucG9zdGVyICsgJ1wiIGFsdD1cIlBvc3RlciBJbWFnZVwiPic7XG59XG5cbi8qKlxuICogY3JlYXRlIHNoYXJpbmcgYnV0dG9uXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uIHNoYXJpbmcgb3B0aW9uIGRlZmluaXRpb25cbiAqIEByZXR1cm5zIHtqUXVlcnl9IHNoYXJlIGJ1dHRvbiByZWZlcmVuY2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlT3B0aW9uKG9wdGlvbikge1xuICBpZiAob3B0aW9uLmRpc2FibGVkKSB7XG4gICAgY29uc29sZS5sb2coJ1NoYXJlJywgJ2NyZWF0ZU9wdGlvbicsICdvbWl0IGRpc2FibGVkIG9wdGlvbicsIG9wdGlvbi5uYW1lKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBkYXRhID0gZ2V0U2hhcmVEYXRhKG9wdGlvbi52YWx1ZSk7XG5cbiAgaWYgKCFkYXRhKSB7XG4gICAgY29uc29sZS5sb2coJ1NoYXJlJywgJ2NyZWF0ZU9wdGlvbicsICdvbWl0IG9wdGlvbiB3aXRob3V0IGRhdGEnLCBvcHRpb24ubmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgZWxlbWVudCA9ICQoJzxkaXYgY2xhc3M9XCJzaGFyZS1zZWxlY3Qtb3B0aW9uXCI+JyArIGNyZWF0ZVBvc3RlckZvcihvcHRpb24udmFsdWUpICtcbiAgICAgICc8c3Bhbj5TaGFyZSB0aGlzICcgKyBvcHRpb24ubmFtZSArICc8L3NwYW4+JyArXG4gICAgJzwvZGl2PicpO1xuXG4gIGlmIChvcHRpb24uZGVmYXVsdCkge1xuICAgIHNlbGVjdGVkT3B0aW9uID0gZWxlbWVudDtcbiAgICBlbGVtZW50LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIHVwZGF0ZVVybHMoZGF0YSk7XG4gIH1cbiAgZWxlbWVudC5vbignY2xpY2snLCBvblNoYXJlT3B0aW9uQ2hhbmdlVG8oZWxlbWVudCwgb3B0aW9uLnZhbHVlKSk7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gaHRtbCBkaXYgZWxlbWVudCB0byB3cmFwIGFsbCBzaGFyZSBidXR0b25zXG4gKiBAcmV0dXJucyB7alF1ZXJ5fEhUTUxFbGVtZW50fSBzaGFyZSBidXR0b24gd3JhcHBlciByZWZlcmVuY2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2hhcmVCdXR0b25XcmFwcGVyKCkge1xuICB2YXIgZGl2ID0gJCgnPGRpdiBjbGFzcz1cInNoYXJlLWJ1dHRvbi13cmFwcGVyXCI+PC9kaXY+Jyk7XG4gIGRpdi5hcHBlbmQoc2hhcmVPcHRpb25zLm1hcChjcmVhdGVPcHRpb24pKTtcblxuICByZXR1cm4gZGl2O1xufVxuXG4vKipcbiAqIGNyZWF0ZSBzaGFyaW5nIGJ1dHRvbnMgaW4gYSBmb3JtXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBmb3JtIGVsZW1lbnQgcmVmZXJlbmNlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNoYXJlT3B0aW9ucygpIHtcbiAgdmFyIGZvcm0gPSAkKCc8Zm9ybT4nICtcbiAgICAnPGxlZ2VuZD5XaGF0IHdvdWxkIHlvdSBsaWtlIHRvIHNoYXJlPzwvbGVnZW5kPicgK1xuICAnPC9mb3JtPicpO1xuICBmb3JtLmFwcGVuZChjcmVhdGVTaGFyZUJ1dHRvbldyYXBwZXIpO1xuICByZXR1cm4gZm9ybTtcbn1cblxuLyoqXG4gKiBidWlsZCBhbmQgcmV0dXJuIHRhYiBpbnN0YW5jZSBmb3Igc2hhcmluZ1xuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwbGF5ZXIgY29uZmlndXJhdGlvblxuICogQHJldHVybnMge251bGx8VGFifSBzaGFyaW5nIHRhYiBpbnN0YW5jZSBvciBudWxsIGlmIHBlcm1hbGluayBtaXNzaW5nIG9yIHNoYXJpbmcgZGlzYWJsZWRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2hhcmVUYWIocGFyYW1zKSB7XG4gIGlmICghcGFyYW1zLnBlcm1hbGluayB8fCBwYXJhbXMuaGlkZXNoYXJlYnV0dG9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgc2hhcmVUYWIgPSBuZXcgVGFiKHtcbiAgICBpY29uOiAncHdwLXNoYXJlJyxcbiAgICB0aXRsZTogJ1Nob3cvaGlkZSBzaGFyaW5nIHRhYnMnLFxuICAgIG5hbWU6ICdwb2Rsb3Zld2VicGxheWVyX3NoYXJlJyxcbiAgICBoZWFkbGluZTogJ1NoYXJlJ1xuICB9KTtcblxuICBzaGFyZUJ1dHRvbnMgPSBuZXcgU29jaWFsQnV0dG9uTGlzdChzZXJ2aWNlcywgZ2V0U2hhcmVEYXRhKCdlcGlzb2RlJykpO1xuICBsaW5rSW5wdXQgPSAkKCc8aDM+TGluazwvaDM+JyArXG4gICAgJzxpbnB1dCB0eXBlPVwidXJsXCIgbmFtZT1cInNoYXJlLWxpbmstdXJsXCIgcmVhZG9ubHk+Jyk7XG4gIGxpbmtJbnB1dC51cGRhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy52YWwoZGF0YS5yYXdVcmwpO1xuICB9O1xuXG4gIHNoYXJlVGFiLmNyZWF0ZU1haW5Db250ZW50KCcnKS5hcHBlbmQoY3JlYXRlU2hhcmVPcHRpb25zKCkpO1xuICBzaGFyZVRhYi5jcmVhdGVGb290ZXIoJzxoMz5TaGFyZSB2aWEgLi4uPC9oMz4nKS5hcHBlbmQoc2hhcmVCdXR0b25zLmxpc3QpLmFwcGVuZChsaW5rSW5wdXQpO1xuXG4gIHJldHVybiBzaGFyZVRhYjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaGFyZShwYXJhbXMpIHtcbiAgc2hhcmVEYXRhLmVwaXNvZGUgPSB7XG4gICAgcG9zdGVyOiBwYXJhbXMucG9zdGVyLFxuICAgIHRpdGxlOiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnRpdGxlKSxcbiAgICB1cmw6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMucGVybWFsaW5rKSxcbiAgICByYXdVcmw6IHBhcmFtcy5wZXJtYWxpbmssXG4gICAgdGV4dDogZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy50aXRsZSArICcgJyArIHBhcmFtcy5wZXJtYWxpbmspXG4gIH07XG4gIHNoYXJlRGF0YS5jaGFwdGVycyA9IHBhcmFtcy5jaGFwdGVycztcblxuICBpZiAocGFyYW1zLnNob3cudXJsKSB7XG4gICAgc2hhcmVEYXRhLnNob3cgPSB7XG4gICAgICBwb3N0ZXI6IHBhcmFtcy5zaG93LnBvc3RlcixcbiAgICAgIHRpdGxlOiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnNob3cudGl0bGUpLFxuICAgICAgdXJsOiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnNob3cudXJsKSxcbiAgICAgIHJhd1VybDogcGFyYW1zLnNob3cudXJsLFxuICAgICAgdGV4dDogZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5zaG93LnRpdGxlICsgJyAnICsgcGFyYW1zLnNob3cudXJsKVxuICAgIH07XG4gIH1cblxuICBzZWxlY3RlZE9wdGlvbiA9ICdlcGlzb2RlJztcbiAgdGhpcy50YWIgPSBjcmVhdGVTaGFyZVRhYihwYXJhbXMpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL3NoYXJlLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGVtYmVkID0gcmVxdWlyZSgnLi9lbWJlZCcpLFxuICBwYXJzZVRpbWVjb2RlID0gcmVxdWlyZSgnLi90aW1lY29kZScpLnBhcnNlO1xuXG4vKipcbiAqIHBsYXllclxuICovXG52YXJcbi8vIEtlZXAgYWxsIFBsYXllcnMgb24gc2l0ZSAtIGZvciBpbmxpbmUgcGxheWVyc1xuLy8gZW1iZWRkZWQgcGxheWVycyBhcmUgcmVnaXN0ZXJlZCBpbiBwb2Rsb3ZlLXdlYnBsYXllci1tb2RlcmF0b3IgaW4gdGhlIGVtYmVkZGluZyBwYWdlXG4gIHBsYXllcnMgPSBbXSxcbi8vIGFsbCB1c2VkIGZ1bmN0aW9uc1xuICBtZWpzb3B0aW9ucyA9IHtcbiAgICBkZWZhdWx0VmlkZW9XaWR0aDogNDgwLFxuICAgIGRlZmF1bHRWaWRlb0hlaWdodDogMjcwLFxuICAgIHZpZGVvV2lkdGg6IC0xLFxuICAgIHZpZGVvSGVpZ2h0OiAtMSxcbiAgICBhdWRpb1dpZHRoOiAtMSxcbiAgICBhdWRpb0hlaWdodDogMzAsXG4gICAgc3RhcnRWb2x1bWU6IDAuOCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBlbmFibGVBdXRvc2l6ZTogdHJ1ZSxcbiAgICBmZWF0dXJlczogWydwbGF5cGF1c2UnLCAnY3VycmVudCcsICdwcm9ncmVzcycsICdkdXJhdGlvbicsICd0cmFja3MnLCAnZnVsbHNjcmVlbiddLFxuICAgIGFsd2F5c1Nob3dDb250cm9sczogZmFsc2UsXG4gICAgaVBhZFVzZU5hdGl2ZUNvbnRyb2xzOiBmYWxzZSxcbiAgICBpUGhvbmVVc2VOYXRpdmVDb250cm9sczogZmFsc2UsXG4gICAgQW5kcm9pZFVzZU5hdGl2ZUNvbnRyb2xzOiBmYWxzZSxcbiAgICBhbHdheXNTaG93SG91cnM6IGZhbHNlLFxuICAgIHNob3dUaW1lY29kZUZyYW1lQ291bnQ6IGZhbHNlLFxuICAgIGZyYW1lc1BlclNlY29uZDogMjUsXG4gICAgZW5hYmxlS2V5Ym9hcmQ6IHRydWUsXG4gICAgcGF1c2VPdGhlclBsYXllcnM6IHRydWUsXG4gICAgZHVyYXRpb246IGZhbHNlLFxuICAgIHBsdWdpbnM6IFsnZmxhc2gnLCAnc2lsdmVybGlnaHQnXSxcbiAgICBwbHVnaW5QYXRoOiAnLi9iaW4vJyxcbiAgICBmbGFzaE5hbWU6ICdmbGFzaG1lZGlhZWxlbWVudC5zd2YnLFxuICAgIHNpbHZlcmxpZ2h0TmFtZTogJ3NpbHZlcmxpZ2h0bWVkaWFlbGVtZW50LnhhcCdcbiAgfSxcbiAgZGVmYXVsdHMgPSB7XG4gICAgY2hhcHRlcmxpbmtzOiAnYWxsJyxcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIGR1cmF0aW9uOiBmYWxzZSxcbiAgICBjaGFwdGVyc1Zpc2libGU6IGZhbHNlLFxuICAgIHRpbWVjb250cm9sc1Zpc2libGU6IGZhbHNlLFxuICAgIHNoYXJlYnV0dG9uc1Zpc2libGU6IGZhbHNlLFxuICAgIGRvd25sb2FkYnV0dG9uc1Zpc2libGU6IGZhbHNlLFxuICAgIHN1bW1hcnlWaXNpYmxlOiBmYWxzZSxcbiAgICBoaWRldGltZWJ1dHRvbjogZmFsc2UsXG4gICAgaGlkZWRvd25sb2FkYnV0dG9uOiBmYWxzZSxcbiAgICBoaWRlc2hhcmVidXR0b246IGZhbHNlLFxuICAgIHNoYXJld2hvbGVlcGlzb2RlOiBmYWxzZSxcbiAgICBzb3VyY2VzOiBbXVxuICB9O1xuXG4vKipcbiAqIHJlbW92ZSAncHgnIHVuaXQsIHNldCB3aXRkdGggdG8gMTAwJSBmb3IgJ2F1dG8nXG4gKiBAcGFyYW0ge3N0cmluZ30gd2lkdGhcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVdpZHRoKHdpZHRoKSB7XG4gIGlmICh3aWR0aC50b0xvd2VyQ2FzZSgpID09PSAnYXV0bycpIHtcbiAgICByZXR1cm4gJzEwMCUnO1xuICB9XG4gIHJldHVybiB3aWR0aC5yZXBsYWNlKCdweCcsICcnKTtcbn1cblxuLyoqXG4gKiBhdWRpbyBvciB2aWRlbyB0YWdcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBsYXllclxuICogQHJldHVybnMge3N0cmluZ30gJ2F1ZGlvJyB8ICd2aWRlbydcbiAqL1xuZnVuY3Rpb24gZ2V0UGxheWVyVHlwZSAocGxheWVyKSB7XG4gIHJldHVybiBwbGF5ZXIudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vKipcbiAqIGtpbGwgcGxheS9wYXVzZSBidXR0b24gZnJvbSBtaW5pcGxheWVyXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiByZW1vdmVQbGF5UGF1c2Uob3B0aW9ucykge1xuICAkLmVhY2gob3B0aW9ucy5mZWF0dXJlcywgZnVuY3Rpb24gKGkpIHtcbiAgICBpZiAodGhpcyA9PT0gJ3BsYXlwYXVzZScpIHtcbiAgICAgIG9wdGlvbnMuZmVhdHVyZXMuc3BsaWNlKGksIDEpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogcGxheWVyIGVycm9yIGhhbmRsaW5nIGZ1bmN0aW9uXG4gKiB3aWxsIHJlbW92ZSB0aGUgdG9wbW9zdCBtZWRpYWZpbGUgZnJvbSBzcmMgb3Igc291cmNlIGxpc3RcbiAqIHBvc3NpYmxlIGZpeCBmb3IgRmlyZWZveCBBQUMgaXNzdWVzXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZVVucGxheWFibGVNZWRpYSgpIHtcbiAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgaWYgKCR0aGlzLmF0dHIoJ3NyYycpKSB7XG4gICAgJHRoaXMucmVtb3ZlQXR0cignc3JjJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBzb3VyY2VMaXN0ID0gJHRoaXMuY2hpbGRyZW4oJ3NvdXJjZScpO1xuICBpZiAoc291cmNlTGlzdC5sZW5ndGgpIHtcbiAgICBzb3VyY2VMaXN0LmZpcnN0KCkucmVtb3ZlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlKHBsYXllciwgcGFyYW1zLCBjYWxsYmFjaykge1xuICB2YXIganFQbGF5ZXIsXG4gICAgcGxheWVyVHlwZSA9IGdldFBsYXllclR5cGUocGxheWVyKSxcbiAgICBzZWNBcnJheSxcbiAgICB3cmFwcGVyO1xuXG4gIGpxUGxheWVyID0gJChwbGF5ZXIpO1xuICB3cmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPjwvZGl2PicpO1xuICBqcVBsYXllci5yZXBsYWNlV2l0aCh3cmFwcGVyKTtcblxuICAvL2ZpbmUgdHVuaW5nIHBhcmFtc1xuICBwYXJhbXMud2lkdGggPSBub3JtYWxpemVXaWR0aChwYXJhbXMud2lkdGgpO1xuICBpZiAocGxheWVyVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgIC8vIEZJWE1FOiBTaW5jZSB0aGUgcGxheWVyIGlzIG5vIGxvbmdlciB2aXNpYmxlIGl0IGhhcyBubyB3aWR0aFxuICAgIGlmIChwYXJhbXMuYXVkaW9XaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbXMud2lkdGggPSBwYXJhbXMuYXVkaW9XaWR0aDtcbiAgICB9XG4gICAgbWVqc29wdGlvbnMuYXVkaW9XaWR0aCA9IHBhcmFtcy53aWR0aDtcbiAgICAvL2tpbGwgZnVsbHNjcmVlbiBidXR0b25cbiAgICAkLmVhY2gobWVqc29wdGlvbnMuZmVhdHVyZXMsIGZ1bmN0aW9uIChpKSB7XG4gICAgICBpZiAodGhpcyA9PT0gJ2Z1bGxzY3JlZW4nKSB7XG4gICAgICAgIG1lanNvcHRpb25zLmZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZW1vdmVQbGF5UGF1c2UobWVqc29wdGlvbnMpO1xuICB9XG4gIGVsc2UgaWYgKHBsYXllclR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAvL3ZpZGVvIHBhcmFtc1xuICAgIGlmIChmYWxzZSAmJiBwYXJhbXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1lanNvcHRpb25zLnZpZGVvV2lkdGggPSBwYXJhbXMud2lkdGg7XG4gICAgICBtZWpzb3B0aW9ucy52aWRlb0hlaWdodCA9IHBhcmFtcy5oZWlnaHQ7XG4gICAgfVxuICAgIC8vIEZJWE1FXG4gICAgaWYgKGZhbHNlICYmICQocGxheWVyKS5hdHRyKCd3aWR0aCcpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhcmFtcy53aWR0aCA9ICQocGxheWVyKS5hdHRyKCd3aWR0aCcpO1xuICAgIH1cbiAgfVxuXG4gIC8vZHVyYXRpb24gY2FuIGJlIGdpdmVuIGluIHNlY29uZHMgb3IgaW4gTlBUIGZvcm1hdFxuICBpZiAocGFyYW1zLmR1cmF0aW9uICYmIHBhcmFtcy5kdXJhdGlvbiAhPT0gcGFyc2VJbnQocGFyYW1zLmR1cmF0aW9uLCAxMCkpIHtcbiAgICBzZWNBcnJheSA9IHBhcnNlVGltZWNvZGUocGFyYW1zLmR1cmF0aW9uKTtcbiAgICBwYXJhbXMuZHVyYXRpb24gPSBzZWNBcnJheVswXTtcbiAgfVxuXG4gIC8vT3ZlcndyaXRlIE1FSlMgZGVmYXVsdCB2YWx1ZXMgd2l0aCBhY3R1YWwgZGF0YVxuICAkLmVhY2gobWVqc29wdGlvbnMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5IGluIHBhcmFtcykge1xuICAgICAgbWVqc29wdGlvbnNba2V5XSA9IHBhcmFtc1trZXldO1xuICAgIH1cbiAgfSk7XG5cbiAgLy93cmFwcGVyIGFuZCBpbml0IHN0dWZmXG4gIC8vIEZJWE1FOiBiZXR0ZXIgY2hlY2sgZm9yIG51bWVyaWNhbCB2YWx1ZVxuICBpZiAocGFyYW1zLndpZHRoLnRvU3RyaW5nKCkudHJpbSgpID09PSBwYXJzZUludChwYXJhbXMud2lkdGgsIDEwKS50b1N0cmluZygpKSB7XG4gICAgcGFyYW1zLndpZHRoID0gcGFyc2VJbnQocGFyYW1zLndpZHRoLCAxMCkgKyAncHgnO1xuICB9XG5cbiAgcGxheWVycy5wdXNoKHBsYXllcik7XG5cbiAgLy9hZGQgcGFyYW1zIGZyb20gYXVkaW8gYW5kIHZpZGVvIGVsZW1lbnRzXG4gIGpxUGxheWVyLmZpbmQoJ3NvdXJjZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgIGlmICghcGFyYW1zLnNvdXJjZXMpIHtcbiAgICAgIHBhcmFtcy5zb3VyY2VzID0gW107XG4gICAgfVxuICAgIHBhcmFtcy5zb3VyY2VzLnB1c2goJCh0aGlzKS5hdHRyKCdzcmMnKSk7XG4gIH0pO1xuXG4gIHBhcmFtcy50eXBlID0gcGxheWVyVHlwZTtcbiAgLy8gaW5pdCBNRUpTIHRvIHBsYXllclxuICBtZWpzb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24gKHBsYXllcikge1xuICAgIGpxUGxheWVyLm9uKCdlcnJvcicsIHJlbW92ZVVucGxheWFibGVNZWRpYSk7ICAgLy8gVGhpcyBtaWdodCBiZSBhIGZpeCB0byBzb21lIEZpcmVmb3ggQUFDIGlzc3Vlcy5cbiAgICBjYWxsYmFjayhwbGF5ZXIsIHBhcmFtcywgd3JhcHBlcik7XG4gIH07XG4gIHZhciBtZSA9IG5ldyBNZWRpYUVsZW1lbnQocGxheWVyLCBtZWpzb3B0aW9ucyk7XG4gIGNvbnNvbGUubG9nKG1lKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY3JlYXRlLFxuICBkZWZhdWx0czogZGVmYXVsdHMsXG4gIHBsYXllcnM6IHBsYXllcnNcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvcGxheWVyLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2VydmljZXMgPSByZXF1aXJlKCcuL3NvY2lhbC1uZXR3b3JrcycpO1xuXG5mdW5jdGlvbiBjcmVhdGVCdXR0b25XaXRoKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzZXJ2aWNlTmFtZSkge1xuICAgIHZhciBzZXJ2aWNlID0gc2VydmljZXMuZ2V0KHNlcnZpY2VOYW1lKTtcbiAgICByZXR1cm4gc2VydmljZS5nZXRCdXR0b24ob3B0aW9ucyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFNvY2lhbEJ1dHRvbkxpc3QgKHNlcnZpY2VzLCBvcHRpb25zKSB7XG4gIHZhciBjcmVhdGVCdXR0b24gPSBjcmVhdGVCdXR0b25XaXRoKG9wdGlvbnMpO1xuICB0aGlzLmJ1dHRvbnMgPSBzZXJ2aWNlcy5tYXAoY3JlYXRlQnV0dG9uKTtcblxuICB0aGlzLmxpc3QgPSAkKCc8dWw+PC91bD4nKTtcbiAgdGhpcy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgIHZhciBsaXN0RWxlbWVudCA9ICQoJzxsaT48L2xpPicpLmFwcGVuZChidXR0b24uZWxlbWVudCk7XG4gICAgdGhpcy5saXN0LmFwcGVuZChsaXN0RWxlbWVudCk7XG4gIH0sIHRoaXMpO1xufVxuXG5Tb2NpYWxCdXR0b25MaXN0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB0aGlzLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgYnV0dG9uLnVwZGF0ZVVybChvcHRpb25zKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvY2lhbEJ1dHRvbkxpc3Q7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvc29jaWFsLWJ1dHRvbi1saXN0LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBjcmVhdGVCdXR0b24gKG9wdGlvbnMpIHtcbiAgcmV0dXJuICQoJzxhIGNsYXNzPVwicHdwLWNvbnRyYXN0LScgKyBvcHRpb25zLmljb24gKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIicgKyBvcHRpb25zLnVybCArICdcIiAnICtcbiAgJ3RpdGxlPVwiJyArIG9wdGlvbnMudGl0bGUgKyAnXCI+PGkgY2xhc3M9XCJpY29uIHB3cC0nICsgb3B0aW9ucy5pY29uICsgJ1wiPjwvaT48L2E+JyArXG4gICc8c3Bhbj4nICsgb3B0aW9ucy50aXRsZSArICc8L3NwYW4+Jyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3QgdG8gaW50ZXJhY3Qgd2l0aCBhIHNvY2lhbCBuZXR3b3JrXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBJY29uLCB0aXRsZSBwcm9maWxlLSBhbmQgc2hhcmluZy1VUkwtdGVtcGxhdGVzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gU29jaWFsTmV0d29yayAob3B0aW9ucykge1xuICB0aGlzLmljb24gPSBvcHRpb25zLmljb247XG4gIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICB0aGlzLnVybCA9IG9wdGlvbnMucHJvZmlsZVVybDtcbiAgdGhpcy5zaGFyZVVybCA9IG9wdGlvbnMuc2hhcmVVcmw7XG59XG5cbi8qKlxuICogYnVpbGQgVVJMIGZvciBzaGFyaW5nIGEgdGV4dCwgYSB0aXRsZSBhbmQgYSB1cmxcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNvbnRlbnRzIHRvIGJlIHNoYXJlZFxuICogQHJldHVybnMge3N0cmluZ30gVVJMIHRvIHNoYXJlIHRoZSBjb250ZW50c1xuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRTaGFyZVVybCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBzaGFyZVVybCA9IHRoaXMuc2hhcmVVcmxcbiAgICAucmVwbGFjZSgnJHRleHQkJywgb3B0aW9ucy50ZXh0KVxuICAgIC5yZXBsYWNlKCckdGl0bGUkJywgb3B0aW9ucy50aXRsZSlcbiAgICAucmVwbGFjZSgnJHVybCQnLCBvcHRpb25zLnVybCk7XG4gIHJldHVybiB0aGlzLnVybCArIHNoYXJlVXJsO1xufTtcblxuLyoqXG4gKiBidWlsZCBVUkwgdG8gYSBnaXZlbiBwcm9maWxlXG4gKiBAcGFyYW0ge29iamVjdH0gcHJvZmlsZSBVc2VybmFtZSB0byBsaW5rIHRvXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBwcm9maWxlIFVSTFxuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRQcm9maWxlVXJsID0gZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgcmV0dXJuIHRoaXMudXJsICsgcHJvZmlsZTtcbn07XG5cbi8qKlxuICogZ2V0IHByb2ZpbGUgYnV0dG9uIGVsZW1lbnRcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIG9wdGlvbnMucHJvZmlsZSBkZWZpbmVzIHRoZSBwcm9maWxlIHRoZSBidXR0b24gbGlua3MgdG9cbiAqIEByZXR1cm5zIHt7ZWxlbWVudDp7alF1ZXJ5fX19IGJ1dHRvbiByZWZlcmVuY2VcbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0UHJvZmlsZUJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucy5wcm9maWxlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50OiBjcmVhdGVCdXR0b24oe1xuICAgICAgdXJsOiB0aGlzLmdldFByb2ZpbGVVcmwob3B0aW9ucy5wcm9maWxlKSxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgaWNvbjogdGhpcy5pY29uXG4gICAgfSlcbiAgfTtcbn07XG5cbi8qKlxuICogZ2V0IHNoYXJlIGJ1dHRvbiBlbGVtZW50IGFuZCBVUkwgdXBkYXRlIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBpbml0aWFsIGNvbnRlbnRzIHRvIGJlIHNoYXJlZCB3aXRoIHRoZSBidXR0b25cbiAqIEByZXR1cm5zIHt7ZWxlbWVudDp7alF1ZXJ5fSwgdXBkYXRlVXJsOntmdW5jdGlvbn19fSBidXR0b24gcmVmZXJlbmNlIGFuZCB1cGRhdGUgZnVuY3Rpb25cbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0U2hhcmVCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gIGlmICghdGhpcy5zaGFyZVVybCB8fCAhb3B0aW9ucy50aXRsZSB8fCAhb3B0aW9ucy51cmwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy50ZXh0KSB7XG4gICAgb3B0aW9ucy50ZXh0ID0gb3B0aW9ucy50aXRsZSArICclMjAnICsgb3B0aW9ucy51cmw7XG4gIH1cblxuICB2YXIgZWxlbWVudCA9IGNyZWF0ZUJ1dHRvbih7XG4gICAgdXJsOiB0aGlzLmdldFNoYXJlVXJsKG9wdGlvbnMpLFxuICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgIGljb246IHRoaXMuaWNvblxuICB9KTtcblxuICB2YXIgdXBkYXRlVXJsID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBlbGVtZW50LmdldCgwKS5ocmVmID0gdGhpcy5nZXRTaGFyZVVybChvcHRpb25zKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogZWxlbWVudCxcbiAgICB1cGRhdGVVcmw6IHVwZGF0ZVVybFxuICB9O1xufTtcblxuLyoqXG4gKiBnZXQgc2hhcmUgb3IgcHJvZmlsZSBidXR0b24gZGVwZW5kaW5nIG9uIHRoZSBvcHRpb25zIGdpdmVuXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBvYmplY3Qgd2l0aCBlaXRoZXIgcHJvZmlsZW5hbWUgb3IgY29udGVudHMgdG8gc2hhcmVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJ1dHRvbiBvYmplY3RcbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0QnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMucHJvZmlsZSkge1xuICAgIHJldHVybiB0aGlzLmdldFByb2ZpbGVCdXR0b24ob3B0aW9ucyk7XG4gIH1cbiAgaWYgKHRoaXMuc2hhcmVVcmwgJiYgb3B0aW9ucy50aXRsZSAmJiBvcHRpb25zLnVybCkge1xuICAgIHJldHVybiB0aGlzLmdldFNoYXJlQnV0dG9uKG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb2NpYWxOZXR3b3JrO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NvY2lhbC1uZXR3b3JrLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU29jaWFsTmV0d29yayA9IHJlcXVpcmUoJy4vc29jaWFsLW5ldHdvcmsnKTtcbnZhciBzb2NpYWxOZXR3b3JrcyA9IHtcbiAgdHdpdHRlcjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICd0d2l0dGVyJyxcbiAgICB0aXRsZTogJ1R3aXR0ZXInLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3R3aXR0ZXIuY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90ZXh0PSR0ZXh0JCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGZsYXR0cjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdmbGF0dHInLFxuICAgIHRpdGxlOiAnRmxhdHRyJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9mbGF0dHIuY29tL3Byb2ZpbGUvJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RleHQ9JHRleHQkJnVybD0kdXJsJCdcbiAgfSksXG5cbiAgZmFjZWJvb2s6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnZmFjZWJvb2snLFxuICAgIHRpdGxlOiAnRmFjZWJvb2snLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL2ZhY2Vib29rLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmUucGhwP3Q9JHRleHQkJnU9JHVybCQnXG4gIH0pLFxuXG4gIGFkbjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdhZG4nLFxuICAgIHRpdGxlOiAnQXBwLm5ldCcsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vYWxwaGEuYXBwLm5ldC8nLFxuICAgIHNoYXJlVXJsOiAnaW50ZW50L3Bvc3Q/dGV4dD0kdGV4dCQnXG4gIH0pLFxuXG4gIHNvdW5kY2xvdWQ6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnc291bmRjbG91ZCcsXG4gICAgdGl0bGU6ICdTb3VuZENsb3VkJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGluc3RhZ3JhbTogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdpbnN0YWdyYW0nLFxuICAgIHRpdGxlOiAnSW5zdGFncmFtJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cDovL2luc3RhZ3JhbS5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RpdGxlPSR0aXRsZSQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICB0dW1ibHI6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAndHVtYmxyJyxcbiAgICB0aXRsZTogJ1R1bWJscicsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vd3d3LnR1bWJsci5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RpdGxlPSR0aXRsZSQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICBlbWFpbDogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdtZXNzYWdlJyxcbiAgICB0aXRsZTogJ0UtTWFpbCcsXG4gICAgcHJvZmlsZVVybDogJ21haWx0bzonLFxuICAgIHNoYXJlVXJsOiAnP3N1YmplY3Q9JHRpdGxlJCZib2R5PSR0ZXh0JCdcbiAgfSksXG4gIGdwbHVzOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ2dvb2dsZS1wbHVzJyxcbiAgICB0aXRsZTogJ0dvb2dsZSsnLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3BsdXMuZ29vZ2xlLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pXG59O1xuXG4vKipcbiAqIHJldHVybnMgdGhlIHNlcnZpY2UgcmVnaXN0ZXJlZCB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VydmljZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHNvY2lhbCBuZXR3b3JrXG4gKiBAcmV0dXJucyB7U29jaWFsTmV0d29ya30gVGhlIG5ldHdvcmsgd2l0aCB0aGUgZ2l2ZW4gbmFtZVxuICovXG5mdW5jdGlvbiBnZXRTZXJ2aWNlIChzZXJ2aWNlTmFtZSkge1xuICB2YXIgc2VydmljZSA9IHNvY2lhbE5ldHdvcmtzW3NlcnZpY2VOYW1lXTtcbiAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgY29uc29sZS5lcnJvcignVW5rbm93biBzZXJ2aWNlJywgc2VydmljZU5hbWUpO1xuICB9XG4gIHJldHVybiBzZXJ2aWNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0OiBnZXRTZXJ2aWNlXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NvY2lhbC1uZXR3b3Jrcy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBXaGVuIHRhYiBjb250ZW50IGlzIHNjcm9sbGVkLCBhIGJveHNoYWRvdyBpcyBhZGRlZCB0byB0aGUgaGVhZGVyXG4gKiBAcGFyYW0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gYWRkU2hhZG93T25TY3JvbGwoZXZlbnQpIHtcbiAgdmFyIHNjcm9sbCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuc2Nyb2xsVG9wO1xuICBldmVudC5kYXRhLmhlYWRlci50b2dnbGVDbGFzcygnc2Nyb2xsZWQnLCAoc2Nyb2xsID49IDUgKSk7XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGh0bWwgc2VjdGlvbiBlbGVtZW50IGFzIGEgd3JhcHBlciBmb3IgdGhlIHRhYlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHsqfGpRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29udGVudEJveChvcHRpb25zKSB7XG4gIHZhciBjbGFzc2VzID0gWyd0YWInXTtcbiAgY2xhc3Nlcy5wdXNoKG9wdGlvbnMubmFtZSk7XG4gIGlmIChvcHRpb25zLmFjdGl2ZSkge1xuICAgIGNsYXNzZXMucHVzaCgnYWN0aXZlJyk7XG4gIH1cbiAgcmV0dXJuICQoJzxzZWN0aW9uIGNsYXNzPVwiJyArIGNsYXNzZXMuam9pbignICcpICsgJ1wiPjwvc2VjdGlvbj4nKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB0YWJcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVGFiKG9wdGlvbnMpIHtcbiAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uO1xuICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgdGhpcy5oZWFkbGluZSA9IG9wdGlvbnMuaGVhZGxpbmU7XG5cbiAgdGhpcy5ib3ggPSBjcmVhdGVDb250ZW50Qm94KG9wdGlvbnMpO1xuICB2YXIgaGVhZGVyID0gdGhpcy5jcmVhdGVIZWFkZXIoKTtcbiAgdGhpcy5ib3gub24oJ3Njcm9sbCcsIHtoZWFkZXI6IGhlYWRlcn0sIGFkZFNoYWRvd09uU2Nyb2xsKTtcblxuICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLnRvZ2dsZSA9IG51bGw7XG59XG5cbi8qKlxuICogQWRkIGNsYXNzICdhY3RpdmUnIHRvIHRoZSBhY3RpdmUgdGFiXG4gKi9cblRhYi5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICB0aGlzLmJveC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIHRoaXMudG9nZ2xlLmFkZENsYXNzKCdhY3RpdmUnKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzICdhY3RpdmUnIGZyb20gdGhlIGluYWN0aXZlIHRhYlxuICovXG5UYWIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLmJveC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gIHRoaXMudG9nZ2xlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGh0bWwgaGVhZGVyIGVsZW1lbnQgd2l0aCBhIGhlYWRsaW5lXG4gKi9cblRhYi5wcm90b3R5cGUuY3JlYXRlSGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBoZWFkZXIgPSAkKCc8aGVhZGVyIGNsYXNzPVwidGFiLWhlYWRlclwiPjxoMiBjbGFzcz1cInRhYi1oZWFkbGluZVwiPicgK1xuICAgICc8aSBjbGFzcz1cImljb24gJyArIHRoaXMuaWNvbiArICdcIj48L2k+JyArIHRoaXMuaGVhZGxpbmUgKyAnPC9oMj48L2hlYWRlcj4nKTtcbiAgdGhpcy5ib3guYXBwZW5kKGhlYWRlcik7XG4gIHJldHVybiBoZWFkZXI7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGRpdiBlbGVtZW50IHdpdGggY2xhc3MgbWFpbiB0byB0aGUgdGFiJ3MgY29udGVudCBib3hcbiAqIEBwYXJhbSBjb250ZW50XG4gKi9cblRhYi5wcm90b3R5cGUuY3JlYXRlTWFpbkNvbnRlbnQgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBtYWluRGl2ID0gJCgnPGRpdiBjbGFzcz1cIm1haW5cIj4nICsgY29udGVudCArICc8L2RpdicpO1xuICB0aGlzLmJveC5hcHBlbmQobWFpbkRpdik7XG4gIHJldHVybiBtYWluRGl2O1xufTtcblxuLyoqXG4gKiBBcHBlbmQgYW4gaHRtbCBhc2lkZSBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVBc2lkZSA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgdmFyIGFzaWRlID0gJCgnPGFzaWRlIGNsYXNzPVwiYXNpZGVcIj4nICsgY29udGVudCArICc8L2FzaWRlPicpO1xuICB0aGlzLmJveC5hcHBlbmQoYXNpZGUpO1xuICByZXR1cm4gYXNpZGU7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGZvb3RlciBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVGb290ZXIgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBmb290ZXIgPSAkKCc8Zm9vdGVyPicgKyBjb250ZW50ICsgJzwvZm9vdGVyPicpO1xuICB0aGlzLmJveC5hcHBlbmQoZm9vdGVyKTtcbiAgcmV0dXJuIGZvb3Rlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFiO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RhYi5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAdHlwZSB7VGFifVxuICovXG52YXIgVGFiID0gcmVxdWlyZSgnLi90YWIuanMnKTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtUYWJ9IHRhYlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGdldFRvZ2dsZUNsaWNrSGFuZGxlcih0YWIpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgY29uc29sZS5kZWJ1ZygnVGFiUmVnaXN0cnknLCAnYWN0aXZlVGFiJywgdGhpcy5hY3RpdmVUYWIpO1xuICBpZiAodGhpcy5hY3RpdmVUYWIpIHtcbiAgICB0aGlzLmFjdGl2ZVRhYi5jbG9zZSgpO1xuICB9XG4gIGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gdGFiKSB7XG4gICAgdGhpcy5hY3RpdmVUYWIgPSBudWxsO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcbiAgdGhpcy5hY3RpdmVUYWIub3BlbigpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBsYXllclxuICovXG5mdW5jdGlvbiBsb2dDdXJyZW50VGltZSAocGxheWVyKSB7XG4gIGNvbnNvbGUubG9nKCdwbGF5ZXIuY3VycmVudFRpbWUnLCBwbGF5ZXIuY3VycmVudFRpbWUpO1xufVxuXG5mdW5jdGlvbiBUYWJSZWdpc3RyeSgpIHtcbiAgLyoqXG4gICAqIHdpbGwgc3RvcmUgYSByZWZlcmVuY2UgdG8gY3VycmVudGx5IGFjdGl2ZSB0YWIgaW5zdGFuY2UgdG8gY2xvc2UgaXQgd2hlbiBhbm90aGVyIG9uZSBpcyBvcGVuZWRcbiAgICogQHR5cGUge29iamVjdH1cbiAgICovXG4gIHRoaXMuYWN0aXZlVGFiID0gbnVsbDtcbiAgdGhpcy50b2dnbGViYXIgPSAkKCc8ZGl2IGNsYXNzPVwidG9nZ2xlYmFyIGJhclwiPjwvZGl2PicpO1xuICB0aGlzLnRvZ2dsZUxpc3QgPSAkKCc8dWwgY2xhc3M9XCJ0YWJsaXN0XCI+PC91bD4nKTtcbiAgdGhpcy50b2dnbGViYXIuYXBwZW5kKHRoaXMudG9nZ2xlTGlzdCk7XG4gIHRoaXMuY29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cInRhYnNcIj48L2Rpdj4nKTtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbbG9nQ3VycmVudFRpbWVdO1xuICB0aGlzLnRhYnMgPSBbXTtcbn1cblxuVGFiUmVnaXN0cnkucHJvdG90eXBlLmNyZWF0ZVRvZ2dsZUZvciA9IGZ1bmN0aW9uICh0YWIpIHtcbiAgdmFyIHRvZ2dsZSA9ICQoJzxsaSB0aXRsZT1cIicgKyB0YWIudGl0bGUgKyAnXCI+JyArXG4gICAgICAnPGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwiYnV0dG9uIGJ1dHRvbi10b2dnbGUgJyArIHRhYi5pY29uICsgJ1wiPjwvYT4nICtcbiAgICAnPC9saT4nKTtcbiAgdG9nZ2xlLm9uKCdjbGljaycsIGdldFRvZ2dsZUNsaWNrSGFuZGxlci5iaW5kKHRoaXMsIHRhYikpO1xuICB0aGlzLnRvZ2dsZUxpc3QuYXBwZW5kKHRvZ2dsZSk7XG4gIHJldHVybiB0b2dnbGU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgdGFiIGFuZCBvcGVuIGl0IGlmIGl0IGlzIGluaXRpYWxseSB2aXNpYmxlXG4gKiBAcGFyYW0ge1RhYn0gdGFiXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZpc2libGVcbiAqL1xuVGFiUmVnaXN0cnkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhYiwgdmlzaWJsZSkge1xuICBpZiAodGFiID09PSBudWxsKSB7IHJldHVybjsgfVxuICB0aGlzLnRhYnMucHVzaCh0YWIpO1xuICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGFiLmJveCk7XG5cbiAgdGFiLnRvZ2dsZSA9IHRoaXMuY3JlYXRlVG9nZ2xlRm9yKHRhYik7XG4gIGlmICh2aXNpYmxlKSB7XG4gICAgdGFiLm9wZW4oKTtcbiAgICB0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcbiAgfVxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG1vZHVsZVxuICovXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuYWRkTW9kdWxlID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gIGlmIChtb2R1bGUudGFiKSB7XG4gICAgdGhpcy5hZGQobW9kdWxlLnRhYik7XG4gIH1cbiAgaWYgKG1vZHVsZS51cGRhdGUpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG1vZHVsZS51cGRhdGUpO1xuICB9XG59O1xuXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJ1RhYlJlZ2lzdHJ5I3VwZGF0ZScsIGV2ZW50KTtcbiAgdmFyIHBsYXllciA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICQuZWFjaCh0aGlzLmxpc3RlbmVycywgZnVuY3Rpb24gKGksIGxpc3RlbmVyKSB7IGxpc3RlbmVyKHBsYXllcik7IH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJSZWdpc3RyeTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi90YWJyZWdpc3RyeS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIHplcm9GaWxsID0gcmVxdWlyZSgnLi91dGlsJykuemVyb0ZpbGw7XG5cbi8qKlxuICogVGltZWNvZGUgYXMgZGVzY3JpYmVkIGluIGh0dHA6Ly9wb2Rsb3ZlLm9yZy9kZWVwLWxpbmsvXG4gKiBhbmQgaHR0cDovL3d3dy53My5vcmcvVFIvbWVkaWEtZnJhZ3MvI2ZyYWdtZW50LWRpbWVuc2lvbnNcbiAqL1xudmFyIHRpbWVDb2RlTWF0Y2hlciA9IC8oPzooXFxkKyk6KT8oXFxkezEsMn0pOihcXGRcXGQpKFxcLlxcZHsxLDN9KT8vO1xuXG4vKipcbiAqIGNvbnZlcnQgYW4gYXJyYXkgb2Ygc3RyaW5nIHRvIHRpbWVjb2RlXG4gKiBAcGFyYW0ge3N0cmluZ30gdGNcbiAqIEByZXR1cm5zIHtudW1iZXJ8Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFRpbWUodGMpIHtcbiAgaWYgKCF0Yykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGFydHMgPSB0aW1lQ29kZU1hdGNoZXIuZXhlYyh0Yyk7XG4gIGlmICghcGFydHMpIHtcbiAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBleHRyYWN0IHRpbWUgZnJvbScsIHRjKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHRpbWUgPSAwO1xuICAvLyBob3Vyc1xuICB0aW1lICs9IHBhcnRzWzFdID8gcGFyc2VJbnQocGFydHNbMV0sIDEwKSAqIDYwICogNjAgOiAwO1xuICAvLyBtaW51dGVzXG4gIHRpbWUgKz0gcGFyc2VJbnQocGFydHNbMl0sIDEwKSAqIDYwO1xuICAvLyBzZWNvbmRzXG4gIHRpbWUgKz0gcGFyc2VJbnQocGFydHNbM10sIDEwKTtcbiAgLy8gbWlsbGlzZWNvbmRzXG4gIHRpbWUgKz0gcGFydHNbNF0gPyBwYXJzZUZsb2F0KHBhcnRzWzRdKSA6IDA7XG4gIC8vIG5vIG5lZ2F0aXZlIHRpbWVcbiAgdGltZSA9IE1hdGgubWF4KHRpbWUsIDApO1xuICByZXR1cm4gdGltZTtcbn1cblxuLyoqXG4gKiBjb252ZXJ0IGEgdGltZXN0YW1wIHRvIGEgdGltZWNvZGUgaW4gJHtpbnNlcnQgUkZDIGhlcmV9IGZvcm1hdFxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbGVhZGluZ1plcm9zXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZUhvdXJzXSBmb3JjZSBvdXRwdXQgb2YgaG91cnMsIGRlZmF1bHRzIHRvIGZhbHNlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtzaG93TWlsbGlzXSBvdXRwdXQgbWlsbGlzZWNvbmRzIHNlcGFyYXRlZCB3aXRoIGEgZG90IGZyb20gdGhlIHNlY29uZHMgLSBkZWZhdWx0cyB0byBmYWxzZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB0czJ0Yyh0aW1lLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMsIHNob3dNaWxsaXMpIHtcbiAgdmFyIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNlY29uZHM7XG4gIHZhciB0aW1lY29kZSA9ICcnO1xuXG4gIGlmICh0aW1lID09PSAwKSB7XG4gICAgcmV0dXJuIChmb3JjZUhvdXJzID8gJzAwOjAwOjAwJyA6ICcwMDowMCcpO1xuICB9XG5cbiAgLy8gcHJldmVudCBuZWdhdGl2ZSB2YWx1ZXMgZnJvbSBwbGF5ZXJcbiAgaWYgKCF0aW1lIHx8IHRpbWUgPD0gMCkge1xuICAgIHJldHVybiAoZm9yY2VIb3VycyA/ICctLTotLTotLScgOiAnLS06LS0nKTtcbiAgfVxuXG4gIGhvdXJzID0gTWF0aC5mbG9vcih0aW1lIC8gNjAgLyA2MCk7XG4gIG1pbnV0ZXMgPSBNYXRoLmZsb29yKHRpbWUgLyA2MCkgJSA2MDtcbiAgc2Vjb25kcyA9IE1hdGguZmxvb3IodGltZSAlIDYwKSAlIDYwO1xuICBtaWxsaXNlY29uZHMgPSBNYXRoLmZsb29yKHRpbWUgJSAxICogMTAwMCk7XG5cbiAgaWYgKHNob3dNaWxsaXMgJiYgbWlsbGlzZWNvbmRzKSB7XG4gICAgdGltZWNvZGUgPSAnLicgKyB6ZXJvRmlsbChtaWxsaXNlY29uZHMsIDMpO1xuICB9XG5cbiAgdGltZWNvZGUgPSAnOicgKyB6ZXJvRmlsbChzZWNvbmRzLCAyKSArIHRpbWVjb2RlO1xuXG4gIGlmIChob3VycyA9PT0gMCAmJiAhZm9yY2VIb3VycyAmJiAhbGVhZGluZ1plcm9zICkge1xuICAgIHJldHVybiBtaW51dGVzLnRvU3RyaW5nKCkgKyB0aW1lY29kZTtcbiAgfVxuXG4gIHRpbWVjb2RlID0gemVyb0ZpbGwobWludXRlcywgMikgKyB0aW1lY29kZTtcblxuICBpZiAoaG91cnMgPT09IDAgJiYgIWZvcmNlSG91cnMpIHtcbiAgICAvLyByZXF1aXJlZCAobWludXRlcyA6IHNlY29uZHMpXG4gICAgcmV0dXJuIHRpbWVjb2RlO1xuICB9XG5cbiAgaWYgKGxlYWRpbmdaZXJvcykge1xuICAgIHJldHVybiB6ZXJvRmlsbChob3VycywgMikgKyAnOicgKyB0aW1lY29kZTtcbiAgfVxuXG4gIHJldHVybiBob3VycyArICc6JyArIHRpbWVjb2RlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogY29udmVuaWVuY2UgbWV0aG9kIGZvciBjb252ZXJ0aW5nIHRpbWVzdGFtcHMgdG9cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVzdGFtcFxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSB0aW1lY29kZVxuICAgKi9cbiAgZnJvbVRpbWVTdGFtcDogZnVuY3Rpb24gKHRpbWVzdGFtcCkge1xuICAgIHJldHVybiB0czJ0Yyh0aW1lc3RhbXAsIHRydWUsIHRydWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBhY2NlcHRzIGFycmF5IHdpdGggc3RhcnQgYW5kIGVuZCB0aW1lIGluIHNlY29uZHNcbiAgICogcmV0dXJucyB0aW1lY29kZSBpbiBkZWVwLWxpbmtpbmcgZm9ybWF0XG4gICAqIEBwYXJhbSB7QXJyYXl9IHRpbWVzXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbGVhZGluZ1plcm9zXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlSG91cnNdXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdlbmVyYXRlOiBmdW5jdGlvbiAodGltZXMsIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycykge1xuICAgIGlmICh0aW1lc1sxXSA+IDAgJiYgdGltZXNbMV0gPCA5OTk5OTk5ICYmIHRpbWVzWzBdIDwgdGltZXNbMV0pIHtcbiAgICAgIHJldHVybiB0czJ0Yyh0aW1lc1swXSwgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzKSArICcsJyArIHRzMnRjKHRpbWVzWzFdLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMpO1xuICAgIH1cbiAgICByZXR1cm4gdHMydGModGltZXNbMF0sIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIHBhcnNlcyB0aW1lIGNvZGUgaW50byBzZWNvbmRzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0aW1lY29kZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIHBhcnNlOiBmdW5jdGlvbiAodGltZWNvZGUpIHtcbiAgICBpZiAoIXRpbWVjb2RlKSB7XG4gICAgICByZXR1cm4gW2ZhbHNlLCBmYWxzZV07XG4gICAgfVxuXG4gICAgdmFyIHRpbWVwYXJ0cyA9IHRpbWVjb2RlLnNwbGl0KCctJyk7XG5cbiAgICBpZiAoIXRpbWVwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIGNvbnNvbGUud2Fybignbm8gdGltZXBhcnRzOicsIHRpbWVjb2RlKTtcbiAgICAgIHJldHVybiBbZmFsc2UsIGZhbHNlXTtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnRUaW1lID0gZXh0cmFjdFRpbWUodGltZXBhcnRzLnNoaWZ0KCkpO1xuICAgIHZhciBlbmRUaW1lID0gZXh0cmFjdFRpbWUodGltZXBhcnRzLnNoaWZ0KCkpO1xuXG4gICAgcmV0dXJuIChlbmRUaW1lID4gc3RhcnRUaW1lKSA/IFtzdGFydFRpbWUsIGVuZFRpbWVdIDogW3N0YXJ0VGltZSwgZmFsc2VdO1xuICB9LFxuXG4gIGdldFN0YXJ0VGltZUNvZGU6IGZ1bmN0aW9uIGdldFN0YXJ0VGltZWNvZGUoc3RhcnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlKHN0YXJ0KVswXTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi90aW1lY29kZS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLypcbiBbXG4ge3R5cGU6IFwiaW1hZ2VcIiwgXCJ0aXRsZVwiOiBcIlRoZSB2ZXJ5IGJlc3QgSW1hZ2VcIiwgXCJ1cmxcIjogXCJodHRwOi8vZG9tYWluLmNvbS9pbWFnZXMvdGVzdDEucG5nXCJ9LFxuIHt0eXBlOiBcInNob3dub3RlXCIsIFwidGV4dFwiOiBcIlBBUEFQQVBBUEFQQUdFTk9cIn0sXG4ge3R5cGU6IFwidG9waWNcIiwgc3RhcnQ6IDAsIGVuZDogMSwgcTp0cnVlLCB0aXRsZTogXCJUaGUgdmVyeSBmaXJzdCBjaGFwdGVyXCIgfSxcbiB7dHlwZTogXCJhdWRpb1wiLCBzdGFydDogMCwgZW5kOiAxLCBxOnRydWUsIGNsYXNzOiAnc3BlZWNoJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDEsIGVuZDogMiwgcTp0cnVlLCBjbGFzczogJ211c2ljJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDIsIGVuZDogMywgcTp0cnVlLCBjbGFzczogJ25vaXNlJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDQsIGVuZDogNSwgcTp0cnVlLCBjbGFzczogJ3NpbGVuY2UnfSxcbiB7dHlwZTogXCJjb250ZW50XCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6dHJ1ZSwgdGl0bGU6IFwiVGhlIHZlcnkgZmlyc3QgY2hhcHRlclwiLCBjbGFzczonYWR2ZXJ0aXNlbWVudCd9LFxuIHt0eXBlOiBcImxvY2F0aW9uXCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6ZmFsc2UsIHRpdGxlOiBcIkFyb3VuZCBCZXJsaW5cIiwgbGF0OjEyLjEyMywgbG9uOjUyLjIzNCwgZGlhbWV0ZXI6MTIzIH0sXG4ge3R5cGU6IFwiY2hhdFwiLCBxOmZhbHNlLCBzdGFydDogMC4xMiwgXCJkYXRhXCI6IFwiRVJTVEVSICYgSElUTEVSISEhXCJ9LFxuIHt0eXBlOiBcInNob3dub3RlXCIsIHN0YXJ0OiAwLjIzLCBcImRhdGFcIjogXCJKZW1hbmQgdmFkZXJ0XCJ9LFxuIHt0eXBlOiBcImltYWdlXCIsIFwibmFtZVwiOiBcIlRoZSB2ZXJ5IGJlc3QgSW1hZ2VcIiwgXCJ1cmxcIjogXCJodHRwOi8vZG9tYWluLmNvbS9pbWFnZXMvdGVzdDEucG5nXCJ9LFxuIHt0eXBlOiBcImxpbmtcIiwgXCJuYW1lXCI6IFwiQW4gaW50ZXJlc3RpbmcgbGlua1wiLCBcInVybFwiOiBcImh0dHA6Ly9cIn0sXG4ge3R5cGU6IFwidG9waWNcIiwgc3RhcnQ6IDEsIGVuZDogMiwgXCJuYW1lXCI6IFwiVGhlIHZlcnkgZmlyc3QgY2hhcHRlclwiLCBcInVybFwiOiBcIlwifSxcbiBdXG4gKi9cbnZhciB0YyA9IHJlcXVpcmUoJy4vdGltZWNvZGUnKVxuICAsIGNhcCA9IHJlcXVpcmUoJy4vdXRpbCcpLmNhcDtcblxuZnVuY3Rpb24gdHJhbnNmb3JtQ2hhcHRlcihjaGFwdGVyKSB7XG4gIGNoYXB0ZXIuY29kZSA9IGNoYXB0ZXIudGl0bGU7XG4gIGlmICh0eXBlb2YgY2hhcHRlci5zdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICBjaGFwdGVyLnN0YXJ0ID0gdGMuZ2V0U3RhcnRUaW1lQ29kZShjaGFwdGVyLnN0YXJ0KTtcbiAgfVxuICByZXR1cm4gY2hhcHRlcjtcbn1cblxuLyoqXG4gKiBhZGQgYGVuZGAgcHJvcGVydHkgdG8gZWFjaCBzaW1wbGUgY2hhcHRlcixcbiAqIG5lZWRlZCBmb3IgcHJvcGVyIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvblxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBhZGRFbmRUaW1lKGR1cmF0aW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoY2hhcHRlciwgaSwgY2hhcHRlcnMpIHtcbiAgICB2YXIgbmV4dCA9IGNoYXB0ZXJzW2kgKyAxXTtcbiAgICBjaGFwdGVyLmVuZCA9IG5leHQgPyBuZXh0LnN0YXJ0IDogZHVyYXRpb247XG4gICAgcmV0dXJuIGNoYXB0ZXI7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFR5cGUodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnR5cGUgPSB0eXBlO1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9O1xufVxuXG5mdW5jdGlvbiBjYWxsKGxpc3RlbmVyKSB7XG4gIGxpc3RlbmVyKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJCeVR5cGUodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIHJldHVybiAocmVjb3JkLnR5cGUgPT09IHR5cGUpO1xuICB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1RpbWVsaW5lfSB0aW1lbGluZVxuICovXG5mdW5jdGlvbiBsb2dDdXJyZW50VGltZSh0aW1lbGluZSkge1xuICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAnY3VycmVudFRpbWUnLCB0aW1lbGluZS5nZXRUaW1lKCkpO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBhdCBsZWFzdCBvbmUgY2hhcHRlciBpcyBwcmVzZW50XG4gKi9cbmZ1bmN0aW9uIGNoZWNrRm9yQ2hhcHRlcnMocGFyYW1zKSB7XG4gIHJldHVybiAhIXBhcmFtcy5jaGFwdGVycyAmJiAoXG4gICAgdHlwZW9mIHBhcmFtcy5jaGFwdGVycyA9PT0gJ29iamVjdCcgJiYgcGFyYW1zLmNoYXB0ZXJzLmxlbmd0aCA+IDFcbiAgICApO1xufVxuXG5mdW5jdGlvbiBwYXJzZShkYXRhKSB7XG4gIHJldHVybiBkYXRhO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0hUTUxNZWRpYUVsZW1lbnR9IHBsYXllclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUaW1lbGluZShwbGF5ZXIsIGRhdGEpIHtcbiAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gIHRoaXMuaGFzQ2hhcHRlcnMgPSBjaGVja0ZvckNoYXB0ZXJzKGRhdGEpO1xuICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlU2ltcGxlQ2hhcHRlcihkYXRhKTtcbiAgdGhpcy5tb2R1bGVzID0gW107XG4gIHRoaXMubGlzdGVuZXJzID0gW2xvZ0N1cnJlbnRUaW1lXTtcbiAgdGhpcy5jdXJyZW50VGltZSA9IC0xO1xuICB0aGlzLmR1cmF0aW9uID0gZGF0YS5kdXJhdGlvbjtcbiAgdGhpcy5lbmRUaW1lID0gZGF0YS5kdXJhdGlvbjtcbiAgdGhpcy5idWZmZXJlZFRpbWUgPSAwO1xuICB0aGlzLnJlc3VtZSA9IHBsYXllci5wYXVzZWQ7XG4gIHRoaXMuc2Vla2luZyA9IGZhbHNlO1xufVxuXG5UaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhQnlUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5maWx0ZXIoZmlsdGVyQnlUeXBlKHR5cGUpKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5hZGRNb2R1bGUgPSBmdW5jdGlvbiAobW9kdWxlKSB7XG4gIGlmIChtb2R1bGUudXBkYXRlKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaChtb2R1bGUudXBkYXRlKTtcbiAgfVxuICB0aGlzLm1vZHVsZXMucHVzaChtb2R1bGUpO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnBsYXlSYW5nZSA9IGZ1bmN0aW9uIChyYW5nZSkge1xuICBpZiAoIXJhbmdlIHx8ICFyYW5nZS5sZW5ndGggfHwgIXJhbmdlLnNoaWZ0KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGltZWxpbmUucGxheVJhbmdlIGNhbGxlZCB3aXRob3V0IGEgcmFuZ2UnKTtcbiAgfVxuICB0aGlzLnNldFRpbWUocmFuZ2Uuc2hpZnQoKSk7XG4gIHRoaXMuc3RvcEF0KHJhbmdlLnNoaWZ0KCkpO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAndXBkYXRlJywgZXZlbnQpO1xuICB0aGlzLnNldEJ1ZmZlcmVkVGltZShldmVudCk7XG5cbiAgaWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICd0aW1ldXBkYXRlJykge1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnBsYXllci5jdXJyZW50VGltZTtcbiAgfVxuICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGNhbGwsIHRoaXMpO1xuICBpZiAodGhpcy5jdXJyZW50VGltZSA+PSB0aGlzLmVuZFRpbWUpIHtcbiAgICB0aGlzLnBsYXllci5zdG9wKCk7XG4gIH1cbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5lbWl0RXZlbnRzQmV0d2VlbiA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBlbWl0U3RhcnRlZCA9IGZhbHNlLFxuICAgIGVtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBjdXN0b21FdmVudCA9IG5ldyAkLkV2ZW50KGV2ZW50LnR5cGUsIGV2ZW50KTtcbiAgICAgICQodGhpcykudHJpZ2dlcihjdXN0b21FdmVudCk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICB0aGlzLmRhdGEubWFwKGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBsYXRlciA9IChldmVudC5zdGFydCA+IHN0YXJ0KSxcbiAgICAgIGVhcmxpZXIgPSAoZXZlbnQuZW5kIDwgc3RhcnQpLFxuICAgICAgZW5kZWQgPSAoZXZlbnQuZW5kIDwgZW5kKTtcblxuICAgIGlmIChsYXRlciAmJiBlYXJsaWVyICYmICFlbmRlZCB8fCBlbWl0U3RhcnRlZCkge1xuICAgICAgY29uc29sZS5sb2coJ1RpbWVsaW5lJywgJ0VtaXQnLCBldmVudCk7XG4gICAgICBlbWl0KGV2ZW50KTtcbiAgICB9XG4gICAgZW1pdFN0YXJ0ZWQgPSBsYXRlcjtcbiAgfSk7XG59O1xuXG4vKipcbiAqIHJldHVybnMgaWYgdGltZSBpcyBhIHZhbGlkIHRpbWVzdGFtcCBpbiBjdXJyZW50IHRpbWVsaW5lXG4gKiBAcGFyYW0geyp9IHRpbWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5UaW1lbGluZS5wcm90b3R5cGUuaXNWYWxpZFRpbWUgPSBmdW5jdGlvbiAodGltZSkge1xuICByZXR1cm4gKHR5cGVvZiB0aW1lID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odGltZSkgJiYgdGltZSA+PSAwICYmIHRpbWUgPD0gdGhpcy5kdXJhdGlvbik7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZSA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIGlmICghdGhpcy5pc1ZhbGlkVGltZSh0aW1lKSkge1xuICAgIGNvbnNvbGUud2FybignVGltZWxpbmUnLCAnc2V0VGltZScsICd0aW1lIG91dCBvZiBib3VuZHMnLCB0aW1lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICdzZXRUaW1lJywgJ3RpbWUnLCB0aW1lKTtcbiAgdGhpcy5jdXJyZW50VGltZSA9IHRpbWU7XG4gIHRoaXMudXBkYXRlKCk7XG5cbiAgLy8gYXZvaWQgZXZlbnQgaGVsbGZpcmVcbiAgaWYgKHRoaXMuc2Vla2luZykgeyByZXR1cm4gdGhpcy5jdXJyZW50VGltZTsgfVxuXG4gIGNvbnNvbGUubG9nKCdjYW5wbGF5JywgJ3NldFRpbWUnLCAncGxheWVyU3RhdGUnLCB0aGlzLnBsYXllci5yZWFkeVN0YXRlKTtcbiAgaWYgKHRoaXMucGxheWVyLnJlYWR5U3RhdGUgPT09IHRoaXMucGxheWVyLkhBVkVfRU5PVUdIX0RBVEEpIHtcbiAgICB0aGlzLnBsYXllci5zZXRDdXJyZW50VGltZSh0aW1lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8vIFRPRE8gdmlzdWFsaXplIGJ1ZmZlciBzdGF0ZVxuICAvLyAkKGRvY3VtZW50KS5maW5kKCcucGxheScpLmNzcyh7Y29sb3I6J3JlZCd9KTtcbiAgJCh0aGlzLnBsYXllcikub25lKCdjYW5wbGF5JywgZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE8gcmVtb3ZlIGJ1ZmZlciBzdGF0ZSB2aXN1YWxcbiAgICAvLyAkKGRvY3VtZW50KS5maW5kKCcucGxheScpLmNzcyh7Y29sb3I6J3doaXRlJ30pO1xuICAgIGNvbnNvbGUubG9nKCdQbGF5ZXInLCAnY2FucGxheScsICdidWZmZXJlZCcsIHRpbWUpO1xuICAgIHRoaXMuc2V0Q3VycmVudFRpbWUodGltZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnNlZWsgPSBmdW5jdGlvbiAodGltZSkge1xuICBjb25zb2xlLmxvZygnc2VlaycsICdzZWVrJywgdGhpcy5yZXN1bWUpO1xuICB0aGlzLnNlZWtpbmcgPSB0cnVlO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gY2FwKHRpbWUsIDAsIHRoaXMuZHVyYXRpb24pO1xuICB0aGlzLnNldFRpbWUodGhpcy5jdXJyZW50VGltZSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2Vla1N0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZygnc2VlaycsICdzdGFydCcsIHRoaXMucmVzdW1lKTtcbiAgdGhpcy5yZXN1bWUgPSAhdGhpcy5wbGF5ZXIucGF1c2VkOyAvLyBzZXR0aW5nIHRoaXMgdG8gZmFsc2UgbWFrZXMgU2FmYXJpIGhhcHB5XG4gIGlmICh0aGlzLnJlc3VtZSkge1xuICAgIHRoaXMucGxheWVyLnBhdXNlKCk7XG4gIH1cbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zZWVrRW5kID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZygnc2VlaycsICdlbmQnLCB0aGlzLnJlc3VtZSk7XG4gIHRoaXMuc2Vla2luZyA9IGZhbHNlO1xuICB0aGlzLnNldFRpbWUodGhpcy5jdXJyZW50VGltZSk7IC8vZm9yY2UgbGF0ZXN0IHBvc2l0aW9uIGluIHRyYWNrXG4gIGlmICh0aGlzLnJlc3VtZSkge1xuICAgIGNvbnNvbGUubG9nKCdzZWVrJywgJ2VuZCcsICdyZXN1bWUnLCB0aGlzLmN1cnJlbnRUaW1lKTtcbiAgICB0aGlzLnBsYXllci5wbGF5KCk7XG4gIH1cbiAgdGhpcy5yZXN1bWUgPSAhdGhpcy5wbGF5ZXIucGF1c2VkOyAvLyBzZWVrc3RhcnQgbWF5IG5vdCBiZSBjYWxsZWRcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zdG9wQXQgPSBmdW5jdGlvbiAodGltZSkge1xuICBpZiAoIXRpbWUgfHwgdGltZSA8PSAwIHx8IHRpbWUgPiB0aGlzLmR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUud2FybignVGltZWxpbmUnLCAnc3RvcEF0JywgJ3RpbWUgb3V0IG9mIGJvdW5kcycsIHRpbWUpO1xuICB9XG4gIHRoaXMuZW5kVGltZSA9IHRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZ2V0VGltZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZ2V0QnVmZmVyZWQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChpc05hTih0aGlzLmJ1ZmZlcmVkVGltZSkpIHtcbiAgICBjb25zb2xlLndhcm4oJ1RpbWVsaW5lJywgJ2dldEJ1ZmZlcmVkJywgJ2J1ZmZlcmVkVGltZSBpcyBub3QgYSBudW1iZXInKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuICByZXR1cm4gdGhpcy5idWZmZXJlZFRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2V0QnVmZmVyZWRUaW1lID0gZnVuY3Rpb24gKGUpIHtcbiAgdmFyIHRhcmdldCA9IChlICE9PSB1bmRlZmluZWQpID8gZS50YXJnZXQgOiB0aGlzLnBsYXllcjtcbiAgdmFyIGJ1ZmZlcmVkID0gMDtcblxuICAvLyBuZXdlc3QgSFRNTDUgc3BlYyBoYXMgYnVmZmVyZWQgYXJyYXkgKEZGNCwgV2Via2l0KVxuICBpZiAodGFyZ2V0ICYmIHRhcmdldC5idWZmZXJlZCAmJiB0YXJnZXQuYnVmZmVyZWQubGVuZ3RoID4gMCAmJiB0YXJnZXQuYnVmZmVyZWQuZW5kICYmIHRhcmdldC5kdXJhdGlvbikge1xuICAgIGJ1ZmZlcmVkID0gdGFyZ2V0LmJ1ZmZlcmVkLmVuZCh0YXJnZXQuYnVmZmVyZWQubGVuZ3RoIC0gMSk7XG4gIH1cbiAgLy8gU29tZSBicm93c2VycyAoZS5nLiwgRkYzLjYgYW5kIFNhZmFyaSA1KSBjYW5ub3QgY2FsY3VsYXRlIHRhcmdldC5idWZmZXJlcmVkLmVuZCgpXG4gIC8vIHRvIGJlIGFueXRoaW5nIG90aGVyIHRoYW4gMC4gSWYgdGhlIGJ5dGUgY291bnQgaXMgYXZhaWxhYmxlIHdlIHVzZSB0aGlzIGluc3RlYWQuXG4gIC8vIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0aGUgZWxzZSBpZiBkbyBub3Qgc2VlbSB0byBoYXZlIHRoZSBidWZmZXJlZEJ5dGVzIHZhbHVlIGFuZFxuICAvLyBzaG91bGQgc2tpcCB0byB0aGVyZS4gVGVzdGVkIGluIFNhZmFyaSA1LCBXZWJraXQgaGVhZCwgRkYzLjYsIENocm9tZSA2LCBJRSA3LzguXG4gIGVsc2UgaWYgKHRhcmdldCAmJiB0YXJnZXQuYnl0ZXNUb3RhbCAhPT0gdW5kZWZpbmVkICYmIHRhcmdldC5ieXRlc1RvdGFsID4gMCAmJiB0YXJnZXQuYnVmZmVyZWRCeXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmZmVyZWQgPSB0YXJnZXQuYnVmZmVyZWRCeXRlcyAvIHRhcmdldC5ieXRlc1RvdGFsICogdGFyZ2V0LmR1cmF0aW9uO1xuICB9XG4gIC8vIEZpcmVmb3ggMyB3aXRoIGFuIE9nZyBmaWxlIHNlZW1zIHRvIGdvIHRoaXMgd2F5XG4gIGVsc2UgaWYgKGUgJiYgZS5sZW5ndGhDb21wdXRhYmxlICYmIGUudG90YWwgIT09IDApIHtcbiAgICBidWZmZXJlZCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIHRhcmdldC5kdXJhdGlvbjtcbiAgfVxuICB2YXIgY2FwcGVkVGltZSA9IGNhcChidWZmZXJlZCwgMCwgdGFyZ2V0LmR1cmF0aW9uKTtcbiAgY29uc29sZS5sb2coJ1RpbWVsaW5lJywgJ3NldEJ1ZmZlcmVkVGltZScsIGNhcHBlZFRpbWUpO1xuICB0aGlzLmJ1ZmZlcmVkVGltZSA9IGNhcHBlZFRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUucmV3aW5kID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNldFRpbWUoMCk7XG4gIHZhciBjYWxsTGlzdGVuZXJXaXRoVGhpcyA9IGZ1bmN0aW9uIF9jYWxsTGlzdGVuZXJXaXRoVGhpcyhpLCBsaXN0ZW5lcikge1xuICAgIGxpc3RlbmVyKHRoaXMpO1xuICB9LmJpbmQodGhpcyk7XG4gICQuZWFjaCh0aGlzLmxpc3RlbmVycywgY2FsbExpc3RlbmVyV2l0aFRoaXMpO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnBhcnNlU2ltcGxlQ2hhcHRlciA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIGlmICghZGF0YS5jaGFwdGVycykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBjaGFwdGVycyA9IGRhdGEuY2hhcHRlcnMubWFwKHRyYW5zZm9ybUNoYXB0ZXIpO1xuXG4gIC8vIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkOiBodHRwOi8vcG9kbG92ZS5vcmcvc2ltcGxlLWNoYXB0ZXJzL1xuICByZXR1cm4gY2hhcHRlcnNcbiAgICAubWFwKGFkZFR5cGUoJ2NoYXB0ZXInKSlcbiAgICAubWFwKGFkZEVuZFRpbWUoZGF0YS5kdXJhdGlvbikpXG4gICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLnN0YXJ0IC0gYi5zdGFydDtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdGltZWxpbmUuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciB0YyA9IHJlcXVpcmUoJy4vdGltZWNvZGUnKTtcblxuLypcbiAgXCJ0PTFcIlx0WyhcInRcIiwgXCIxXCIpXVx0c2ltcGxlIGNhc2VcbiAgXCJ0PTEmdD0yXCJcdFsoXCJ0XCIsIFwiMVwiKSwgKFwidFwiLCBcIjJcIildXHRyZXBlYXRlZCBuYW1lXG4gIFwiYT1iPWNcIlx0WyhcImFcIiwgXCJiPWNcIildXHRcIj1cIiBpbiB2YWx1ZVxuICBcImEmYj1jXCJcdFsoXCJhXCIsIFwiXCIpLCAoXCJiXCIsIFwiY1wiKV1cdG1pc3NpbmcgdmFsdWVcbiAgXCIlNzQ9JTZlcHQlM0ElMzEwXCJcdFsoXCJ0XCIsIFwibnB0OjEwXCIpXVx0dW5uZWNzc2FyeSBwZXJjZW50LWVuY29kaW5nXG4gIFwiaWQ9JXh5JnQ9MVwiXHRbKFwidFwiLCBcIjFcIildXHRpbnZhbGlkIHBlcmNlbnQtZW5jb2RpbmdcbiAgXCJpZD0lRTRyJnQ9MVwiXHRbKFwidFwiLCBcIjFcIildXHRpbnZhbGlkIFVURi04XG4gKi9cblxuLyoqXG4gKiBnZXQgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWMgVVJMIGhhc2ggZnJhZ21lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgbmFtZSBvZiB0aGUgZnJhZ21lbnRcbiAqIEByZXR1cm5zIHtzdHJpbmd8Ym9vbGVhbn0gdmFsdWUgb2YgdGhlIGZyYWdtZW50IG9yIGZhbHNlIHdoZW4gbm90IGZvdW5kIGluIFVSTFxuICovXG5mdW5jdGlvbiBnZXRGcmFnbWVudChrZXkpIHtcbiAgdmFyIHF1ZXJ5ID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpLFxuICAgIHBhaXJzID0gcXVlcnkuc3BsaXQoJyYnKTtcblxuICBpZiAocXVlcnkuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gcGFpcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIHBhaXIgPSBwYWlyc1tpXS5zcGxpdCgnPScpO1xuICAgIGlmIChwYWlyWzBdICE9PSBrZXkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAocGFpci5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBVUkwgaGFuZGxpbmcgaGVscGVyc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0RnJhZ21lbnQ6IGdldEZyYWdtZW50LFxuICBjaGVja0N1cnJlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdCA9IGdldEZyYWdtZW50KCd0Jyk7XG4gICAgcmV0dXJuIHRjLnBhcnNlKHQpO1xuICB9XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3VybC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiByZXR1cm4gbmV3IHZhbHVlIGluIGJvdW5kcyBvZiBtaW4gYW5kIG1heFxuICogQHBhcmFtIHtudW1iZXJ9IHZhbCBhbnkgbnVtYmVyXG4gKiBAcGFyYW0ge251bWJlcn0gbWluIGxvd2VyIGJvdW5kYXJ5IGZvciB2YWxcbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXggdXBwZXIgYm91bmRhcnkgZm9yIHZhbFxuICogQHJldHVybnMge251bWJlcn0gcmVzdWx0aW5nIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGNhcCh2YWwsIG1pbiwgbWF4KSB7XG4gIC8vIGNhcCB4IHZhbHVlc1xuICB2YWwgPSBNYXRoLm1heCh2YWwsIG1pbik7XG4gIHZhbCA9IE1hdGgubWluKHZhbCwgbWF4KTtcbiAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiByZXR1cm4gbnVtYmVyIGFzIHN0cmluZyBsZWZ0aGFuZCBmaWxsZWQgd2l0aCB6ZXJvc1xuICogQHBhcmFtIHtudW1iZXJ9IG51bWJlciAoaW50ZWdlcikgdmFsdWUgdG8gYmUgcGFkZGVkXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggbGVuZ3RoIG9mIHRoZSBzdHJpbmcgdGhhdCBpcyByZXR1cm5lZFxuICogQHJldHVybnMge3N0cmluZ30gcGFkZGVkIG51bWJlclxuICovXG5mdW5jdGlvbiB6ZXJvRmlsbCAobnVtYmVyLCB3aWR0aCkge1xuICB2YXIgcyA9IG51bWJlci50b1N0cmluZygpO1xuICB3aGlsZSAocy5sZW5ndGggPCB3aWR0aCkge1xuICAgIHMgPSAnMCcgKyBzO1xuICB9XG4gIHJldHVybiBzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2FwOiBjYXAsXG4gIHplcm9GaWxsOiB6ZXJvRmlsbFxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91dGlsLmpzXCIsXCIvXCIpIl19
