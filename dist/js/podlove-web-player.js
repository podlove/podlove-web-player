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
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
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
  Player = require('./player'),
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
    var params = $.extend({}, Player.defaults, data);
    data.sources.forEach(function (sourceObject) {
      $('<source>', sourceObject).appendTo(deferredPlayer);
    });
    Player.create(deferredPlayer, params, addBehavior);
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
  var params = $.extend({}, Player.defaults, options);

  // turn each player in the current set into a Podlove Web Player
  return this.each(function (i, playerElement) {
    Player.create(playerElement, params, addBehavior);
  });
};

pwp = { players: Player.players };

embed.init($, Player.players);

window.pwp = pwp;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_7b0637b7.js","/")
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
  var activeChapter = this.getActiveChapter()
    , currentTime = timeline.getTime();

  console.debug('Chapters', 'update', this, activeChapter, currentTime);
  if (isActiveChapter(activeChapter, currentTime)) {
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
  mejsoptions.success = function (playerElement) {
    jqPlayer.on('error', removeUnplayableMedia);   // This might be a fix to some Firefox AAC issues.
    callback(playerElement, params, wrapper);
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

var socialNetworks = require('./social-networks');

function createButtonWith(options) {
  return function (serviceName) {
    var service = socialNetworks.get(serviceName);
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

  var updateUrl = function (updateOptions) {
    element.get(0).href = this.getShareUrl(updateOptions);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZC9tZWRpYWVsZW1lbnQuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9jb250cm9scy5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL2VtYmVkLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvZmFrZV83YjA2MzdiNy5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvY2hhcHRlci5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvZG93bmxvYWRzLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9pbmZvLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9wcm9ncmVzc2Jhci5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvc2F2ZXRpbWUuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL3NoYXJlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvcGxheWVyLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLWJ1dHRvbi1saXN0LmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLW5ldHdvcmsuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9zb2NpYWwtbmV0d29ya3MuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWIuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWJyZWdpc3RyeS5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3RpbWVjb2RlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvdGltZWxpbmUuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91cmwuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKlxuICogTWVkaWFFbGVtZW50LmpzXG4gKiBIVE1MNSA8dmlkZW8+IGFuZCA8YXVkaW8+IHNoaW0gYW5kIHBsYXllclxuICogaHR0cDovL21lZGlhZWxlbWVudGpzLmNvbS9cbiAqXG4gKiBDcmVhdGVzIGEgSmF2YVNjcmlwdCBvYmplY3QgdGhhdCBtaW1pY3MgSFRNTDUgTWVkaWFFbGVtZW50IEFQSVxuICogZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3QgdW5kZXJzdGFuZCBIVE1MNSBvciBjYW4ndCBwbGF5IHRoZSBwcm92aWRlZCBjb2RlY1xuICogQ2FuIHBsYXkgTVA0IChILjI2NCksIE9nZywgV2ViTSwgRkxWLCBXTVYsIFdNQSwgQUNDLCBhbmQgTVAzXG4gKlxuICogQ29weXJpZ2h0IDIwMTAtMjAxNCwgSm9obiBEeWVyIChodHRwOi8vai5obilcbiAqIExpY2Vuc2U6IE1JVFxuICpcbiAqL1xuLy8gTmFtZXNwYWNlXG52YXIgbWVqcyA9IG1lanMgfHwge307XG5cbi8vIHZlcnNpb24gbnVtYmVyXG5tZWpzLnZlcnNpb24gPSAnMi4xNi4yJzsgXG5cblxuLy8gcGxheWVyIG51bWJlciAoZm9yIG1pc3NpbmcsIHNhbWUgaWQgYXR0cilcbm1lanMubWVJbmRleCA9IDA7XG5cbi8vIG1lZGlhIHR5cGVzIGFjY2VwdGVkIGJ5IHBsdWdpbnNcbm1lanMucGx1Z2lucyA9IHtcblx0c2lsdmVybGlnaHQ6IFtcblx0XHR7dmVyc2lvbjogWzMsMF0sIHR5cGVzOiBbJ3ZpZGVvL21wNCcsJ3ZpZGVvL200dicsJ3ZpZGVvL21vdicsJ3ZpZGVvL3dtdicsJ2F1ZGlvL3dtYScsJ2F1ZGlvL200YScsJ2F1ZGlvL21wMycsJ2F1ZGlvL3dhdicsJ2F1ZGlvL21wZWcnXX1cblx0XSxcblx0Zmxhc2g6IFtcblx0XHR7dmVyc2lvbjogWzksMCwxMjRdLCB0eXBlczogWyd2aWRlby9tcDQnLCd2aWRlby9tNHYnLCd2aWRlby9tb3YnLCd2aWRlby9mbHYnLCd2aWRlby9ydG1wJywndmlkZW8veC1mbHYnLCdhdWRpby9mbHYnLCdhdWRpby94LWZsdicsJ2F1ZGlvL21wMycsJ2F1ZGlvL200YScsJ2F1ZGlvL21wZWcnLCAndmlkZW8veW91dHViZScsICd2aWRlby94LXlvdXR1YmUnLCAnYXBwbGljYXRpb24veC1tcGVnVVJMJ119XG5cdFx0Ly8se3ZlcnNpb246IFsxMiwwXSwgdHlwZXM6IFsndmlkZW8vd2VibSddfSAvLyBmb3IgZnV0dXJlIHJlZmVyZW5jZSAoaG9wZWZ1bGx5ISlcblx0XSxcblx0eW91dHViZTogW1xuXHRcdHt2ZXJzaW9uOiBudWxsLCB0eXBlczogWyd2aWRlby95b3V0dWJlJywgJ3ZpZGVvL3gteW91dHViZScsICdhdWRpby95b3V0dWJlJywgJ2F1ZGlvL3gteW91dHViZSddfVxuXHRdLFxuXHR2aW1lbzogW1xuXHRcdHt2ZXJzaW9uOiBudWxsLCB0eXBlczogWyd2aWRlby92aW1lbycsICd2aWRlby94LXZpbWVvJ119XG5cdF1cbn07XG5cbi8qXG5VdGlsaXR5IG1ldGhvZHNcbiovXG5tZWpzLlV0aWxpdHkgPSB7XG5cdGVuY29kZVVybDogZnVuY3Rpb24odXJsKSB7XG5cdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpOyAvLy5yZXBsYWNlKC9cXD8vZ2ksJyUzRicpLnJlcGxhY2UoLz0vZ2ksJyUzRCcpLnJlcGxhY2UoLyYvZ2ksJyUyNicpO1xuXHR9LFxuXHRlc2NhcGVIVE1MOiBmdW5jdGlvbihzKSB7XG5cdFx0cmV0dXJuIHMudG9TdHJpbmcoKS5zcGxpdCgnJicpLmpvaW4oJyZhbXA7Jykuc3BsaXQoJzwnKS5qb2luKCcmbHQ7Jykuc3BsaXQoJ1wiJykuam9pbignJnF1b3Q7Jyk7XG5cdH0sXG5cdGFic29sdXRpemVVcmw6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdGVsLmlubmVySFRNTCA9ICc8YSBocmVmPVwiJyArIHRoaXMuZXNjYXBlSFRNTCh1cmwpICsgJ1wiPng8L2E+Jztcblx0XHRyZXR1cm4gZWwuZmlyc3RDaGlsZC5ocmVmO1xuXHR9LFxuXHRnZXRTY3JpcHRQYXRoOiBmdW5jdGlvbihzY3JpcHROYW1lcykge1xuXHRcdHZhclxuXHRcdFx0aSA9IDAsXG5cdFx0XHRqLFxuXHRcdFx0Y29kZVBhdGggPSAnJyxcblx0XHRcdHRlc3RuYW1lID0gJycsXG5cdFx0XHRzbGFzaFBvcyxcblx0XHRcdGZpbGVuYW1lUG9zLFxuXHRcdFx0c2NyaXB0VXJsLFxuXHRcdFx0c2NyaXB0UGF0aCxcdFx0XHRcblx0XHRcdHNjcmlwdEZpbGVuYW1lLFxuXHRcdFx0c2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSxcblx0XHRcdGlsID0gc2NyaXB0cy5sZW5ndGgsXG5cdFx0XHRqbCA9IHNjcmlwdE5hbWVzLmxlbmd0aDtcblx0XHRcdFxuXHRcdC8vIGdvIHRocm91Z2ggYWxsIDxzY3JpcHQ+IHRhZ3Ncblx0XHRmb3IgKDsgaSA8IGlsOyBpKyspIHtcblx0XHRcdHNjcmlwdFVybCA9IHNjcmlwdHNbaV0uc3JjO1xuXHRcdFx0c2xhc2hQb3MgPSBzY3JpcHRVcmwubGFzdEluZGV4T2YoJy8nKTtcblx0XHRcdGlmIChzbGFzaFBvcyA+IC0xKSB7XG5cdFx0XHRcdHNjcmlwdEZpbGVuYW1lID0gc2NyaXB0VXJsLnN1YnN0cmluZyhzbGFzaFBvcyArIDEpO1xuXHRcdFx0XHRzY3JpcHRQYXRoID0gc2NyaXB0VXJsLnN1YnN0cmluZygwLCBzbGFzaFBvcyArIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2NyaXB0RmlsZW5hbWUgPSBzY3JpcHRVcmw7XG5cdFx0XHRcdHNjcmlwdFBhdGggPSAnJztcdFx0XHRcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gc2VlIGlmIGFueSA8c2NyaXB0PiB0YWdzIGhhdmUgYSBmaWxlIG5hbWUgdGhhdCBtYXRjaGVzIHRoZSBcblx0XHRcdGZvciAoaiA9IDA7IGogPCBqbDsgaisrKSB7XG5cdFx0XHRcdHRlc3RuYW1lID0gc2NyaXB0TmFtZXNbal07XG5cdFx0XHRcdGZpbGVuYW1lUG9zID0gc2NyaXB0RmlsZW5hbWUuaW5kZXhPZih0ZXN0bmFtZSk7XG5cdFx0XHRcdGlmIChmaWxlbmFtZVBvcyA+IC0xKSB7XG5cdFx0XHRcdFx0Y29kZVBhdGggPSBzY3JpcHRQYXRoO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIGlmIHdlIGZvdW5kIGEgcGF0aCwgdGhlbiBicmVhayBhbmQgcmV0dXJuIGl0XG5cdFx0XHRpZiAoY29kZVBhdGggIT09ICcnKSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBzZW5kIHRoZSBiZXN0IHBhdGggYmFja1xuXHRcdHJldHVybiBjb2RlUGF0aDtcblx0fSxcblx0c2Vjb25kc1RvVGltZUNvZGU6IGZ1bmN0aW9uKHRpbWUsIGZvcmNlSG91cnMsIHNob3dGcmFtZUNvdW50LCBmcHMpIHtcblx0XHQvL2FkZCBmcmFtZWNvdW50XG5cdFx0aWYgKHR5cGVvZiBzaG93RnJhbWVDb3VudCA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBzaG93RnJhbWVDb3VudD1mYWxzZTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZwcyA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBmcHMgPSAyNTtcblx0XHR9XG5cdFxuXHRcdHZhciBob3VycyA9IE1hdGguZmxvb3IodGltZSAvIDM2MDApICUgMjQsXG5cdFx0XHRtaW51dGVzID0gTWF0aC5mbG9vcih0aW1lIC8gNjApICUgNjAsXG5cdFx0XHRzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lICUgNjApLFxuXHRcdFx0ZnJhbWVzID0gTWF0aC5mbG9vcigoKHRpbWUgJSAxKSpmcHMpLnRvRml4ZWQoMykpLFxuXHRcdFx0cmVzdWx0ID0gXG5cdFx0XHRcdFx0KCAoZm9yY2VIb3VycyB8fCBob3VycyA+IDApID8gKGhvdXJzIDwgMTAgPyAnMCcgKyBob3VycyA6IGhvdXJzKSArICc6JyA6ICcnKVxuXHRcdFx0XHRcdFx0KyAobWludXRlcyA8IDEwID8gJzAnICsgbWludXRlcyA6IG1pbnV0ZXMpICsgJzonXG5cdFx0XHRcdFx0XHQrIChzZWNvbmRzIDwgMTAgPyAnMCcgKyBzZWNvbmRzIDogc2Vjb25kcylcblx0XHRcdFx0XHRcdCsgKChzaG93RnJhbWVDb3VudCkgPyAnOicgKyAoZnJhbWVzIDwgMTAgPyAnMCcgKyBmcmFtZXMgOiBmcmFtZXMpIDogJycpO1xuXHRcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRcblx0dGltZUNvZGVUb1NlY29uZHM6IGZ1bmN0aW9uKGhoX21tX3NzX2ZmLCBmb3JjZUhvdXJzLCBzaG93RnJhbWVDb3VudCwgZnBzKXtcblx0XHRpZiAodHlwZW9mIHNob3dGcmFtZUNvdW50ID09ICd1bmRlZmluZWQnKSB7XG5cdFx0ICAgIHNob3dGcmFtZUNvdW50PWZhbHNlO1xuXHRcdH0gZWxzZSBpZih0eXBlb2YgZnBzID09ICd1bmRlZmluZWQnKSB7XG5cdFx0ICAgIGZwcyA9IDI1O1xuXHRcdH1cblx0XG5cdFx0dmFyIHRjX2FycmF5ID0gaGhfbW1fc3NfZmYuc3BsaXQoXCI6XCIpLFxuXHRcdFx0dGNfaGggPSBwYXJzZUludCh0Y19hcnJheVswXSwgMTApLFxuXHRcdFx0dGNfbW0gPSBwYXJzZUludCh0Y19hcnJheVsxXSwgMTApLFxuXHRcdFx0dGNfc3MgPSBwYXJzZUludCh0Y19hcnJheVsyXSwgMTApLFxuXHRcdFx0dGNfZmYgPSAwLFxuXHRcdFx0dGNfaW5fc2Vjb25kcyA9IDA7XG5cdFx0XG5cdFx0aWYgKHNob3dGcmFtZUNvdW50KSB7XG5cdFx0ICAgIHRjX2ZmID0gcGFyc2VJbnQodGNfYXJyYXlbM10pL2Zwcztcblx0XHR9XG5cdFx0XG5cdFx0dGNfaW5fc2Vjb25kcyA9ICggdGNfaGggKiAzNjAwICkgKyAoIHRjX21tICogNjAgKSArIHRjX3NzICsgdGNfZmY7XG5cdFx0XG5cdFx0cmV0dXJuIHRjX2luX3NlY29uZHM7XG5cdH0sXG5cdFxuXG5cdGNvbnZlcnRTTVBURXRvU2Vjb25kczogZnVuY3Rpb24gKFNNUFRFKSB7XG5cdFx0aWYgKHR5cGVvZiBTTVBURSAhPSAnc3RyaW5nJykgXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRTTVBURSA9IFNNUFRFLnJlcGxhY2UoJywnLCAnLicpO1xuXHRcdFxuXHRcdHZhciBzZWNzID0gMCxcblx0XHRcdGRlY2ltYWxMZW4gPSAoU01QVEUuaW5kZXhPZignLicpICE9IC0xKSA/IFNNUFRFLnNwbGl0KCcuJylbMV0ubGVuZ3RoIDogMCxcblx0XHRcdG11bHRpcGxpZXIgPSAxO1xuXHRcdFxuXHRcdFNNUFRFID0gU01QVEUuc3BsaXQoJzonKS5yZXZlcnNlKCk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBTTVBURS5sZW5ndGg7IGkrKykge1xuXHRcdFx0bXVsdGlwbGllciA9IDE7XG5cdFx0XHRpZiAoaSA+IDApIHtcblx0XHRcdFx0bXVsdGlwbGllciA9IE1hdGgucG93KDYwLCBpKTsgXG5cdFx0XHR9XG5cdFx0XHRzZWNzICs9IE51bWJlcihTTVBURVtpXSkgKiBtdWx0aXBsaWVyO1xuXHRcdH1cblx0XHRyZXR1cm4gTnVtYmVyKHNlY3MudG9GaXhlZChkZWNpbWFsTGVuKSk7XG5cdH0sXHRcblx0XG5cdC8qIGJvcnJvd2VkIGZyb20gU1dGT2JqZWN0OiBodHRwOi8vY29kZS5nb29nbGUuY29tL3Avc3dmb2JqZWN0L3NvdXJjZS9icm93c2UvdHJ1bmsvc3dmb2JqZWN0L3NyYy9zd2ZvYmplY3QuanMjNDc0ICovXG5cdHJlbW92ZVN3ZjogZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgb2JqID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXHRcdGlmIChvYmogJiYgL29iamVjdHxlbWJlZC9pLnRlc3Qob2JqLm5vZGVOYW1lKSkge1xuXHRcdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0lFKSB7XG5cdFx0XHRcdG9iai5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdFx0XHRcdChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmIChvYmoucmVhZHlTdGF0ZSA9PSA0KSB7XG5cdFx0XHRcdFx0XHRtZWpzLlV0aWxpdHkucmVtb3ZlT2JqZWN0SW5JRShpZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwgMTApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9iai5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9iaik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmVPYmplY3RJbklFOiBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBvYmogPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cdFx0aWYgKG9iaikge1xuXHRcdFx0Zm9yICh2YXIgaSBpbiBvYmopIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBvYmpbaV0gPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0b2JqW2ldID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0b2JqLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob2JqKTtcblx0XHR9XHRcdFxuXHR9XG59O1xuXG5cbi8vIENvcmUgZGV0ZWN0b3IsIHBsdWdpbnMgYXJlIGFkZGVkIGJlbG93XG5tZWpzLlBsdWdpbkRldGVjdG9yID0ge1xuXG5cdC8vIG1haW4gcHVibGljIGZ1bmN0aW9uIHRvIHRlc3QgYSBwbHVnIHZlcnNpb24gbnVtYmVyIFBsdWdpbkRldGVjdG9yLmhhc1BsdWdpblZlcnNpb24oJ2ZsYXNoJyxbOSwwLDEyNV0pO1xuXHRoYXNQbHVnaW5WZXJzaW9uOiBmdW5jdGlvbihwbHVnaW4sIHYpIHtcblx0XHR2YXIgcHYgPSB0aGlzLnBsdWdpbnNbcGx1Z2luXTtcblx0XHR2WzFdID0gdlsxXSB8fCAwO1xuXHRcdHZbMl0gPSB2WzJdIHx8IDA7XG5cdFx0cmV0dXJuIChwdlswXSA+IHZbMF0gfHwgKHB2WzBdID09IHZbMF0gJiYgcHZbMV0gPiB2WzFdKSB8fCAocHZbMF0gPT0gdlswXSAmJiBwdlsxXSA9PSB2WzFdICYmIHB2WzJdID49IHZbMl0pKSA/IHRydWUgOiBmYWxzZTtcblx0fSxcblxuXHQvLyBjYWNoZWQgdmFsdWVzXG5cdG5hdjogd2luZG93Lm5hdmlnYXRvcixcblx0dWE6IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCksXG5cblx0Ly8gc3RvcmVkIHZlcnNpb24gbnVtYmVyc1xuXHRwbHVnaW5zOiBbXSxcblxuXHQvLyBydW5zIGRldGVjdFBsdWdpbigpIGFuZCBzdG9yZXMgdGhlIHZlcnNpb24gbnVtYmVyXG5cdGFkZFBsdWdpbjogZnVuY3Rpb24ocCwgcGx1Z2luTmFtZSwgbWltZVR5cGUsIGFjdGl2ZVgsIGF4RGV0ZWN0KSB7XG5cdFx0dGhpcy5wbHVnaW5zW3BdID0gdGhpcy5kZXRlY3RQbHVnaW4ocGx1Z2luTmFtZSwgbWltZVR5cGUsIGFjdGl2ZVgsIGF4RGV0ZWN0KTtcblx0fSxcblxuXHQvLyBnZXQgdGhlIHZlcnNpb24gbnVtYmVyIGZyb20gdGhlIG1pbWV0eXBlIChhbGwgYnV0IElFKSBvciBBY3RpdmVYIChJRSlcblx0ZGV0ZWN0UGx1Z2luOiBmdW5jdGlvbihwbHVnaW5OYW1lLCBtaW1lVHlwZSwgYWN0aXZlWCwgYXhEZXRlY3QpIHtcblxuXHRcdHZhciB2ZXJzaW9uID0gWzAsMCwwXSxcblx0XHRcdGRlc2NyaXB0aW9uLFxuXHRcdFx0aSxcblx0XHRcdGF4O1xuXG5cdFx0Ly8gRmlyZWZveCwgV2Via2l0LCBPcGVyYVxuXHRcdGlmICh0eXBlb2YodGhpcy5uYXYucGx1Z2lucykgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRoaXMubmF2LnBsdWdpbnNbcGx1Z2luTmFtZV0gPT0gJ29iamVjdCcpIHtcblx0XHRcdGRlc2NyaXB0aW9uID0gdGhpcy5uYXYucGx1Z2luc1twbHVnaW5OYW1lXS5kZXNjcmlwdGlvbjtcblx0XHRcdGlmIChkZXNjcmlwdGlvbiAmJiAhKHR5cGVvZiB0aGlzLm5hdi5taW1lVHlwZXMgIT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5uYXYubWltZVR5cGVzW21pbWVUeXBlXSAmJiAhdGhpcy5uYXYubWltZVR5cGVzW21pbWVUeXBlXS5lbmFibGVkUGx1Z2luKSkge1xuXHRcdFx0XHR2ZXJzaW9uID0gZGVzY3JpcHRpb24ucmVwbGFjZShwbHVnaW5OYW1lLCAnJykucmVwbGFjZSgvXlxccysvLCcnKS5yZXBsYWNlKC9cXHNyL2dpLCcuJykuc3BsaXQoJy4nKTtcblx0XHRcdFx0Zm9yIChpPTA7IGk8dmVyc2lvbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZlcnNpb25baV0gPSBwYXJzZUludCh2ZXJzaW9uW2ldLm1hdGNoKC9cXGQrLyksIDEwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdC8vIEludGVybmV0IEV4cGxvcmVyIC8gQWN0aXZlWFxuXHRcdH0gZWxzZSBpZiAodHlwZW9mKHdpbmRvdy5BY3RpdmVYT2JqZWN0KSAhPSAndW5kZWZpbmVkJykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXggPSBuZXcgQWN0aXZlWE9iamVjdChhY3RpdmVYKTtcblx0XHRcdFx0aWYgKGF4KSB7XG5cdFx0XHRcdFx0dmVyc2lvbiA9IGF4RGV0ZWN0KGF4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpIHsgfVxuXHRcdH1cblx0XHRyZXR1cm4gdmVyc2lvbjtcblx0fVxufTtcblxuLy8gQWRkIEZsYXNoIGRldGVjdGlvblxubWVqcy5QbHVnaW5EZXRlY3Rvci5hZGRQbHVnaW4oJ2ZsYXNoJywnU2hvY2t3YXZlIEZsYXNoJywnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnLCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcsIGZ1bmN0aW9uKGF4KSB7XG5cdC8vIGFkYXB0ZWQgZnJvbSBTV0ZPYmplY3Rcblx0dmFyIHZlcnNpb24gPSBbXSxcblx0XHRkID0gYXguR2V0VmFyaWFibGUoXCIkdmVyc2lvblwiKTtcblx0aWYgKGQpIHtcblx0XHRkID0gZC5zcGxpdChcIiBcIilbMV0uc3BsaXQoXCIsXCIpO1xuXHRcdHZlcnNpb24gPSBbcGFyc2VJbnQoZFswXSwgMTApLCBwYXJzZUludChkWzFdLCAxMCksIHBhcnNlSW50KGRbMl0sIDEwKV07XG5cdH1cblx0cmV0dXJuIHZlcnNpb247XG59KTtcblxuLy8gQWRkIFNpbHZlcmxpZ2h0IGRldGVjdGlvblxubWVqcy5QbHVnaW5EZXRlY3Rvci5hZGRQbHVnaW4oJ3NpbHZlcmxpZ2h0JywnU2lsdmVybGlnaHQgUGx1Zy1JbicsJ2FwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtMicsJ0FnQ29udHJvbC5BZ0NvbnRyb2wnLCBmdW5jdGlvbiAoYXgpIHtcblx0Ly8gU2lsdmVybGlnaHQgY2Fubm90IHJlcG9ydCBpdHMgdmVyc2lvbiBudW1iZXIgdG8gSUVcblx0Ly8gYnV0IGl0IGRvZXMgaGF2ZSBhIGlzVmVyc2lvblN1cHBvcnRlZCBmdW5jdGlvbiwgc28gd2UgaGF2ZSB0byBsb29wIHRocm91Z2ggaXQgdG8gZ2V0IGEgdmVyc2lvbiBudW1iZXIuXG5cdC8vIGFkYXB0ZWQgZnJvbSBodHRwOi8vd3d3LnNpbHZlcmxpZ2h0dmVyc2lvbi5jb20vXG5cdHZhciB2ID0gWzAsMCwwLDBdLFxuXHRcdGxvb3BNYXRjaCA9IGZ1bmN0aW9uKGF4LCB2LCBpLCBuKSB7XG5cdFx0XHR3aGlsZShheC5pc1ZlcnNpb25TdXBwb3J0ZWQodlswXSsgXCIuXCIrIHZbMV0gKyBcIi5cIiArIHZbMl0gKyBcIi5cIiArIHZbM10pKXtcblx0XHRcdFx0dltpXSs9bjtcblx0XHRcdH1cblx0XHRcdHZbaV0gLT0gbjtcblx0XHR9O1xuXHRsb29wTWF0Y2goYXgsIHYsIDAsIDEpO1xuXHRsb29wTWF0Y2goYXgsIHYsIDEsIDEpO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMDAwKTsgLy8gdGhlIHRoaXJkIHBsYWNlIGluIHRoZSB2ZXJzaW9uIG51bWJlciBpcyB1c3VhbGx5IDUgZGlnaXRzICg0LjAueHh4eHgpXG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMTAwMCk7XG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMTAwKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAyLCAxMCk7XG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMSk7XG5cdGxvb3BNYXRjaChheCwgdiwgMywgMSk7XG5cblx0cmV0dXJuIHY7XG59KTtcbi8vIGFkZCBhZG9iZSBhY3JvYmF0XG4vKlxuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdhY3JvYmF0JywnQWRvYmUgQWNyb2JhdCcsJ2FwcGxpY2F0aW9uL3BkZicsJ0Fjcm9QREYuUERGJywgZnVuY3Rpb24gKGF4KSB7XG5cdHZhciB2ZXJzaW9uID0gW10sXG5cdFx0ZCA9IGF4LkdldFZlcnNpb25zKCkuc3BsaXQoJywnKVswXS5zcGxpdCgnPScpWzFdLnNwbGl0KCcuJyk7XG5cblx0aWYgKGQpIHtcblx0XHR2ZXJzaW9uID0gW3BhcnNlSW50KGRbMF0sIDEwKSwgcGFyc2VJbnQoZFsxXSwgMTApLCBwYXJzZUludChkWzJdLCAxMCldO1xuXHR9XG5cdHJldHVybiB2ZXJzaW9uO1xufSk7XG4qL1xuLy8gbmVjZXNzYXJ5IGRldGVjdGlvbiAoZml4ZXMgZm9yIDxJRTkpXG5tZWpzLk1lZGlhRmVhdHVyZXMgPSB7XG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhclxuXHRcdFx0dCA9IHRoaXMsXG5cdFx0XHRkID0gZG9jdW1lbnQsXG5cdFx0XHRuYXYgPSBtZWpzLlBsdWdpbkRldGVjdG9yLm5hdixcblx0XHRcdHVhID0gbWVqcy5QbHVnaW5EZXRlY3Rvci51YS50b0xvd2VyQ2FzZSgpLFxuXHRcdFx0aSxcblx0XHRcdHYsXG5cdFx0XHRodG1sNUVsZW1lbnRzID0gWydzb3VyY2UnLCd0cmFjaycsJ2F1ZGlvJywndmlkZW8nXTtcblxuXHRcdC8vIGRldGVjdCBicm93c2VycyAob25seSB0aGUgb25lcyB0aGF0IGhhdmUgc29tZSBraW5kIG9mIHF1aXJrIHdlIG5lZWQgdG8gd29yayBhcm91bmQpXG5cdFx0dC5pc2lQYWQgPSAodWEubWF0Y2goL2lwYWQvaSkgIT09IG51bGwpO1xuXHRcdHQuaXNpUGhvbmUgPSAodWEubWF0Y2goL2lwaG9uZS9pKSAhPT0gbnVsbCk7XG5cdFx0dC5pc2lPUyA9IHQuaXNpUGhvbmUgfHwgdC5pc2lQYWQ7XG5cdFx0dC5pc0FuZHJvaWQgPSAodWEubWF0Y2goL2FuZHJvaWQvaSkgIT09IG51bGwpO1xuXHRcdHQuaXNCdXN0ZWRBbmRyb2lkID0gKHVhLm1hdGNoKC9hbmRyb2lkIDJcXC5bMTJdLykgIT09IG51bGwpO1xuXHRcdHQuaXNCdXN0ZWROYXRpdmVIVFRQUyA9IChsb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgJiYgKHVhLm1hdGNoKC9hbmRyb2lkIFsxMl1cXC4vKSAhPT0gbnVsbCB8fCB1YS5tYXRjaCgvbWFjaW50b3NoLiogdmVyc2lvbi4qIHNhZmFyaS8pICE9PSBudWxsKSk7XG5cdFx0dC5pc0lFID0gKG5hdi5hcHBOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcIm1pY3Jvc29mdFwiKSAhPSAtMSB8fCBuYXYuYXBwTmFtZS50b0xvd2VyQ2FzZSgpLm1hdGNoKC90cmlkZW50L2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc0Nocm9tZSA9ICh1YS5tYXRjaCgvY2hyb21lL2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc0Nocm9taXVtID0gKHVhLm1hdGNoKC9jaHJvbWl1bS9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNGaXJlZm94ID0gKHVhLm1hdGNoKC9maXJlZm94L2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc1dlYmtpdCA9ICh1YS5tYXRjaCgvd2Via2l0L2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc0dlY2tvID0gKHVhLm1hdGNoKC9nZWNrby9naSkgIT09IG51bGwpICYmICF0LmlzV2Via2l0ICYmICF0LmlzSUU7XG5cdFx0dC5pc09wZXJhID0gKHVhLm1hdGNoKC9vcGVyYS9naSkgIT09IG51bGwpO1xuXHRcdHQuaGFzVG91Y2ggPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTsgLy8gICYmIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT0gbnVsbCk7IC8vIHRoaXMgYnJlYWtzIGlPUyA3XG5cdFx0XG5cdFx0Ly8gYm9ycm93ZWQgZnJvbSBNb2Rlcm5penJcblx0XHR0LnN2ZyA9ICEhIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAmJlxuXHRcdFx0XHQhISBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywnc3ZnJykuY3JlYXRlU1ZHUmVjdDtcblxuXHRcdC8vIGNyZWF0ZSBIVE1MNSBtZWRpYSBlbGVtZW50cyBmb3IgSUUgYmVmb3JlIDksIGdldCBhIDx2aWRlbz4gZWxlbWVudCBmb3IgZnVsbHNjcmVlbiBkZXRlY3Rpb25cblx0XHRmb3IgKGk9MDsgaTxodG1sNUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChodG1sNUVsZW1lbnRzW2ldKTtcblx0XHR9XG5cdFx0XG5cdFx0dC5zdXBwb3J0c01lZGlhVGFnID0gKHR5cGVvZiB2LmNhblBsYXlUeXBlICE9PSAndW5kZWZpbmVkJyB8fCB0LmlzQnVzdGVkQW5kcm9pZCk7XG5cblx0XHQvLyBGaXggZm9yIElFOSBvbiBXaW5kb3dzIDdOIC8gV2luZG93cyA3S04gKE1lZGlhIFBsYXllciBub3QgaW5zdGFsbGVyKVxuXHRcdHRyeXtcblx0XHRcdHYuY2FuUGxheVR5cGUoXCJ2aWRlby9tcDRcIik7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0dC5zdXBwb3J0c01lZGlhVGFnID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gZGV0ZWN0IG5hdGl2ZSBKYXZhU2NyaXB0IGZ1bGxzY3JlZW4gKFNhZmFyaS9GaXJlZm94IG9ubHksIENocm9tZSBzdGlsbCBmYWlscylcblx0XHRcblx0XHQvLyBpT1Ncblx0XHR0Lmhhc1NlbWlOYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2LndlYmtpdEVudGVyRnVsbHNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdFxuXHRcdC8vIFczQ1xuXHRcdHQuaGFzTmF0aXZlRnVsbHNjcmVlbiA9ICh0eXBlb2Ygdi5yZXF1ZXN0RnVsbHNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdFxuXHRcdC8vIHdlYmtpdC9maXJlZm94L0lFMTErXG5cdFx0dC5oYXNXZWJraXROYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuICE9PSAndW5kZWZpbmVkJyk7XG5cdFx0dC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2Lm1velJlcXVlc3RGdWxsU2NyZWVuICE9PSAndW5kZWZpbmVkJyk7XG5cdFx0dC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4gPSAodHlwZW9mIHYubXNSZXF1ZXN0RnVsbHNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdFxuXHRcdHQuaGFzVHJ1ZU5hdGl2ZUZ1bGxTY3JlZW4gPSAodC5oYXNXZWJraXROYXRpdmVGdWxsU2NyZWVuIHx8IHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbiB8fCB0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbik7XG5cdFx0dC5uYXRpdmVGdWxsU2NyZWVuRW5hYmxlZCA9IHQuaGFzVHJ1ZU5hdGl2ZUZ1bGxTY3JlZW47XG5cdFx0XG5cdFx0Ly8gRW5hYmxlZD9cblx0XHRpZiAodC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHR0Lm5hdGl2ZUZ1bGxTY3JlZW5FbmFibGVkID0gZG9jdW1lbnQubW96RnVsbFNjcmVlbkVuYWJsZWQ7XG5cdFx0fSBlbHNlIGlmICh0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0dC5uYXRpdmVGdWxsU2NyZWVuRW5hYmxlZCA9IGRvY3VtZW50Lm1zRnVsbHNjcmVlbkVuYWJsZWQ7XHRcdFxuXHRcdH1cblx0XHRcblx0XHRpZiAodC5pc0Nocm9tZSkge1xuXHRcdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRpZiAodC5oYXNUcnVlTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XG5cdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnJztcblx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHsgXG5cdFx0XHRcdHQuZnVsbFNjcmVlbkV2ZW50TmFtZSA9ICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJztcblx0XHRcdFx0XG5cdFx0XHR9IGVsc2UgaWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnbW96ZnVsbHNjcmVlbmNoYW5nZSc7XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmICh0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnTVNGdWxsc2NyZWVuQ2hhbmdlJztcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dC5pc0Z1bGxTY3JlZW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdHJldHVybiBkLm1vekZ1bGxTY3JlZW47XG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdHJldHVybiBkLndlYmtpdElzRnVsbFNjcmVlbjtcblx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC5tc0Z1bGxzY3JlZW5FbGVtZW50ICE9PSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHR0LnJlcXVlc3RGdWxsU2NyZWVuID0gZnVuY3Rpb24oZWwpIHtcblx0XHRcblx0XHRcdFx0aWYgKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZWwubW96UmVxdWVzdEZ1bGxTY3JlZW4oKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZWwubXNSZXF1ZXN0RnVsbHNjcmVlbigpO1xuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dC5jYW5jZWxGdWxsU2NyZWVuID0gZnVuY3Rpb24oKSB7XHRcdFx0XHRcblx0XHRcdFx0aWYgKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGRvY3VtZW50LndlYmtpdENhbmNlbEZ1bGxTY3JlZW4oKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRkb2N1bWVudC5tc0V4aXRGdWxsc2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cdFxuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdFxuXHRcdC8vIE9TIFggMTAuNSBjYW4ndCBkbyB0aGlzIGV2ZW4gaWYgaXQgc2F5cyBpdCBjYW4gOihcblx0XHRpZiAodC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiAmJiB1YS5tYXRjaCgvbWFjIG9zIHggMTBfNS9pKSkge1xuXHRcdFx0dC5oYXNOYXRpdmVGdWxsU2NyZWVuID0gZmFsc2U7XG5cdFx0XHR0Lmhhc1NlbWlOYXRpdmVGdWxsU2NyZWVuID0gZmFsc2U7XG5cdFx0fVxuXHRcdFxuXHR9XG59O1xubWVqcy5NZWRpYUZlYXR1cmVzLmluaXQoKTtcblxuLypcbmV4dGVuc2lvbiBtZXRob2RzIHRvIDx2aWRlbz4gb3IgPGF1ZGlvPiBvYmplY3QgdG8gYnJpbmcgaXQgaW50byBwYXJpdHkgd2l0aCBQbHVnaW5NZWRpYUVsZW1lbnQgKHNlZSBiZWxvdylcbiovXG5tZWpzLkh0bWxNZWRpYUVsZW1lbnQgPSB7XG5cdHBsdWdpblR5cGU6ICduYXRpdmUnLFxuXHRpc0Z1bGxTY3JlZW46IGZhbHNlLFxuXG5cdHNldEN1cnJlbnRUaW1lOiBmdW5jdGlvbiAodGltZSkge1xuXHRcdHRoaXMuY3VycmVudFRpbWUgPSB0aW1lO1xuXHR9LFxuXG5cdHNldE11dGVkOiBmdW5jdGlvbiAobXV0ZWQpIHtcblx0XHR0aGlzLm11dGVkID0gbXV0ZWQ7XG5cdH0sXG5cblx0c2V0Vm9sdW1lOiBmdW5jdGlvbiAodm9sdW1lKSB7XG5cdFx0dGhpcy52b2x1bWUgPSB2b2x1bWU7XG5cdH0sXG5cblx0Ly8gZm9yIHBhcml0eSB3aXRoIHRoZSBwbHVnaW4gdmVyc2lvbnNcblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMucGF1c2UoKTtcblx0fSxcblxuXHQvLyBUaGlzIGNhbiBiZSBhIHVybCBzdHJpbmdcblx0Ly8gb3IgYW4gYXJyYXkgW3tzcmM6J2ZpbGUubXA0Jyx0eXBlOid2aWRlby9tcDQnfSx7c3JjOidmaWxlLndlYm0nLHR5cGU6J3ZpZGVvL3dlYm0nfV1cblx0c2V0U3JjOiBmdW5jdGlvbiAodXJsKSB7XG5cdFx0XG5cdFx0Ly8gRml4IGZvciBJRTkgd2hpY2ggY2FuJ3Qgc2V0IC5zcmMgd2hlbiB0aGVyZSBhcmUgPHNvdXJjZT4gZWxlbWVudHMuIEF3ZXNvbWUsIHJpZ2h0P1xuXHRcdHZhciBcblx0XHRcdGV4aXN0aW5nU291cmNlcyA9IHRoaXMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NvdXJjZScpO1xuXHRcdHdoaWxlIChleGlzdGluZ1NvdXJjZXMubGVuZ3RoID4gMCl7XG5cdFx0XHR0aGlzLnJlbW92ZUNoaWxkKGV4aXN0aW5nU291cmNlc1swXSk7XG5cdFx0fVxuXHRcblx0XHRpZiAodHlwZW9mIHVybCA9PSAnc3RyaW5nJykge1xuXHRcdFx0dGhpcy5zcmMgPSB1cmw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpLCBtZWRpYTtcblxuXHRcdFx0Zm9yIChpPTA7IGk8dXJsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG1lZGlhID0gdXJsW2ldO1xuXHRcdFx0XHRpZiAodGhpcy5jYW5QbGF5VHlwZShtZWRpYS50eXBlKSkge1xuXHRcdFx0XHRcdHRoaXMuc3JjID0gbWVkaWEuc3JjO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNldFZpZGVvU2l6ZTogZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdH1cbn07XG5cbi8qXG5NaW1pY3MgdGhlIDx2aWRlby9hdWRpbz4gZWxlbWVudCBieSBjYWxsaW5nIEZsYXNoJ3MgRXh0ZXJuYWwgSW50ZXJmYWNlIG9yIFNpbHZlcmxpZ2h0cyBbU2NyaXB0YWJsZU1lbWJlcl1cbiovXG5tZWpzLlBsdWdpbk1lZGlhRWxlbWVudCA9IGZ1bmN0aW9uIChwbHVnaW5pZCwgcGx1Z2luVHlwZSwgbWVkaWFVcmwpIHtcblx0dGhpcy5pZCA9IHBsdWdpbmlkO1xuXHR0aGlzLnBsdWdpblR5cGUgPSBwbHVnaW5UeXBlO1xuXHR0aGlzLnNyYyA9IG1lZGlhVXJsO1xuXHR0aGlzLmV2ZW50cyA9IHt9O1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbn07XG5cbi8vIEphdmFTY3JpcHQgdmFsdWVzIGFuZCBFeHRlcm5hbEludGVyZmFjZSBtZXRob2RzIHRoYXQgbWF0Y2ggSFRNTDUgdmlkZW8gcHJvcGVydGllcyBtZXRob2RzXG4vLyBodHRwOi8vd3d3LmFkb2JlLmNvbS9saXZlZG9jcy9mbGFzaC85LjAvQWN0aW9uU2NyaXB0TGFuZ1JlZlYzL2ZsL3ZpZGVvL0ZMVlBsYXliYWNrLmh0bWxcbi8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3ZpZGVvLmh0bWxcbm1lanMuUGx1Z2luTWVkaWFFbGVtZW50LnByb3RvdHlwZSA9IHtcblxuXHQvLyBzcGVjaWFsXG5cdHBsdWdpbkVsZW1lbnQ6IG51bGwsXG5cdHBsdWdpblR5cGU6ICcnLFxuXHRpc0Z1bGxTY3JlZW46IGZhbHNlLFxuXG5cdC8vIG5vdCBpbXBsZW1lbnRlZCA6KFxuXHRwbGF5YmFja1JhdGU6IC0xLFxuXHRkZWZhdWx0UGxheWJhY2tSYXRlOiAtMSxcblx0c2Vla2FibGU6IFtdLFxuXHRwbGF5ZWQ6IFtdLFxuXG5cdC8vIEhUTUw1IHJlYWQtb25seSBwcm9wZXJ0aWVzXG5cdHBhdXNlZDogdHJ1ZSxcblx0ZW5kZWQ6IGZhbHNlLFxuXHRzZWVraW5nOiBmYWxzZSxcblx0ZHVyYXRpb246IDAsXG5cdGVycm9yOiBudWxsLFxuXHR0YWdOYW1lOiAnJyxcblxuXHQvLyBIVE1MNSBnZXQvc2V0IHByb3BlcnRpZXMsIGJ1dCBvbmx5IHNldCAodXBkYXRlZCBieSBldmVudCBoYW5kbGVycylcblx0bXV0ZWQ6IGZhbHNlLFxuXHR2b2x1bWU6IDEsXG5cdGN1cnJlbnRUaW1lOiAwLFxuXG5cdC8vIEhUTUw1IG1ldGhvZHNcblx0cGxheTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsKSB7XG5cdFx0XHRpZiAodGhpcy5wbHVnaW5UeXBlID09ICd5b3V0dWJlJyB8fCB0aGlzLnBsdWdpblR5cGUgPT0gJ3ZpbWVvJykge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5wbGF5VmlkZW8oKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBsYXlNZWRpYSgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5wYXVzZWQgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGxvYWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLmxvYWRNZWRpYSgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aGlzLnBhdXNlZCA9IGZhbHNlO1xuXHRcdH1cblx0fSxcblx0cGF1c2U6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkucGF1c2VWaWRlbygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkucGF1c2VNZWRpYSgpO1xuXHRcdFx0fVx0XHRcdFxuXHRcdFx0XG5cdFx0XHRcblx0XHRcdHRoaXMucGF1c2VkID0gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc3RvcFZpZGVvKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5zdG9wTWVkaWEoKTtcblx0XHRcdH1cdFxuXHRcdFx0dGhpcy5wYXVzZWQgPSB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2FuUGxheVR5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcblx0XHR2YXIgaSxcblx0XHRcdGosXG5cdFx0XHRwbHVnaW5JbmZvLFxuXHRcdFx0cGx1Z2luVmVyc2lvbnMgPSBtZWpzLnBsdWdpbnNbdGhpcy5wbHVnaW5UeXBlXTtcblxuXHRcdGZvciAoaT0wOyBpPHBsdWdpblZlcnNpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwbHVnaW5JbmZvID0gcGx1Z2luVmVyc2lvbnNbaV07XG5cblx0XHRcdC8vIHRlc3QgaWYgdXNlciBoYXMgdGhlIGNvcnJlY3QgcGx1Z2luIHZlcnNpb25cblx0XHRcdGlmIChtZWpzLlBsdWdpbkRldGVjdG9yLmhhc1BsdWdpblZlcnNpb24odGhpcy5wbHVnaW5UeXBlLCBwbHVnaW5JbmZvLnZlcnNpb24pKSB7XG5cblx0XHRcdFx0Ly8gdGVzdCBmb3IgcGx1Z2luIHBsYXliYWNrIHR5cGVzXG5cdFx0XHRcdGZvciAoaj0wOyBqPHBsdWdpbkluZm8udHlwZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHQvLyBmaW5kIHBsdWdpbiB0aGF0IGNhbiBwbGF5IHRoZSB0eXBlXG5cdFx0XHRcdFx0aWYgKHR5cGUgPT0gcGx1Z2luSW5mby50eXBlc1tqXSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICdwcm9iYWJseSc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuICcnO1xuXHR9LFxuXHRcblx0cG9zaXRpb25GdWxsc2NyZWVuQnV0dG9uOiBmdW5jdGlvbih4LHksdmlzaWJsZUFuZEFib3ZlKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkucG9zaXRpb25GdWxsc2NyZWVuQnV0dG9uKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5wb3NpdGlvbkZ1bGxzY3JlZW5CdXR0b24oTWF0aC5mbG9vcih4KSxNYXRoLmZsb29yKHkpLHZpc2libGVBbmRBYm92ZSk7XG5cdFx0fVxuXHR9LFxuXHRcblx0aGlkZUZ1bGxzY3JlZW5CdXR0b246IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLmhpZGVGdWxsc2NyZWVuQnV0dG9uKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5oaWRlRnVsbHNjcmVlbkJ1dHRvbigpO1xuXHRcdH1cdFx0XG5cdH0sXHRcblx0XG5cblx0Ly8gY3VzdG9tIG1ldGhvZHMgc2luY2Ugbm90IGFsbCBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9ucyBzdXBwb3J0IGdldC9zZXRcblxuXHQvLyBUaGlzIGNhbiBiZSBhIHVybCBzdHJpbmdcblx0Ly8gb3IgYW4gYXJyYXkgW3tzcmM6J2ZpbGUubXA0Jyx0eXBlOid2aWRlby9tcDQnfSx7c3JjOidmaWxlLndlYm0nLHR5cGU6J3ZpZGVvL3dlYm0nfV1cblx0c2V0U3JjOiBmdW5jdGlvbiAodXJsKSB7XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT0gJ3N0cmluZycpIHtcblx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFNyYyhtZWpzLlV0aWxpdHkuYWJzb2x1dGl6ZVVybCh1cmwpKTtcblx0XHRcdHRoaXMuc3JjID0gbWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwodXJsKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGksIG1lZGlhO1xuXG5cdFx0XHRmb3IgKGk9MDsgaTx1cmwubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bWVkaWEgPSB1cmxbaV07XG5cdFx0XHRcdGlmICh0aGlzLmNhblBsYXlUeXBlKG1lZGlhLnR5cGUpKSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0U3JjKG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKG1lZGlhLnNyYykpO1xuXHRcdFx0XHRcdHRoaXMuc3JjID0gbWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwodXJsKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9LFxuXHRzZXRDdXJyZW50VGltZTogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2Vla1RvKHRpbWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0Q3VycmVudFRpbWUodGltZSk7XG5cdFx0XHR9XHRcdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRcblx0XHRcdHRoaXMuY3VycmVudFRpbWUgPSB0aW1lO1xuXHRcdH1cblx0fSxcblx0c2V0Vm9sdW1lOiBmdW5jdGlvbiAodm9sdW1lKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdC8vIHNhbWUgb24gWW91VHViZSBhbmQgTUVqc1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0Vm9sdW1lKHZvbHVtZSAqIDEwMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRWb2x1bWUodm9sdW1lKTtcblx0XHRcdH1cblx0XHRcdHRoaXMudm9sdW1lID0gdm9sdW1lO1xuXHRcdH1cblx0fSxcblx0c2V0TXV0ZWQ6IGZ1bmN0aW9uIChtdXRlZCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsKSB7XG5cdFx0XHRpZiAodGhpcy5wbHVnaW5UeXBlID09ICd5b3V0dWJlJykge1xuXHRcdFx0XHRpZiAobXV0ZWQpIHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5tdXRlKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5BcGkudW5NdXRlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5tdXRlZCA9IG11dGVkO1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoJ3ZvbHVtZWNoYW5nZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0TXV0ZWQobXV0ZWQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5tdXRlZCA9IG11dGVkO1xuXHRcdH1cblx0fSxcblxuXHQvLyBhZGRpdGlvbmFsIG5vbi1IVE1MNSBtZXRob2RzXG5cdHNldFZpZGVvU2l6ZTogZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcblx0XHRcblx0XHQvL2lmICh0aGlzLnBsdWdpblR5cGUgPT0gJ2ZsYXNoJyB8fCB0aGlzLnBsdWdpblR5cGUgPT0gJ3NpbHZlcmxpZ2h0Jykge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luRWxlbWVudCAmJiB0aGlzLnBsdWdpbkVsZW1lbnQuc3R5bGUpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuXHRcdFx0XHR0aGlzLnBsdWdpbkVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4Jztcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldFZpZGVvU2l6ZSkge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRWaWRlb1NpemUod2lkdGgsIGhlaWdodCk7XG5cdFx0XHR9XG5cdFx0Ly99XG5cdH0sXG5cblx0c2V0RnVsbHNjcmVlbjogZnVuY3Rpb24gKGZ1bGxzY3JlZW4pIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5zZXRGdWxsc2NyZWVuKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRGdWxsc2NyZWVuKGZ1bGxzY3JlZW4pO1xuXHRcdH1cblx0fSxcblx0XG5cdGVudGVyRnVsbFNjcmVlbjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbikge1xuXHRcdFx0dGhpcy5zZXRGdWxsc2NyZWVuKHRydWUpO1xuXHRcdH1cdFx0XG5cdFx0XG5cdH0sXG5cdFxuXHRleGl0RnVsbFNjcmVlbjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbikge1xuXHRcdFx0dGhpcy5zZXRGdWxsc2NyZWVuKGZhbHNlKTtcblx0XHR9XG5cdH0sXHRcblxuXHQvLyBzdGFydDogZmFrZSBldmVudHNcblx0YWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2ssIGJ1YmJsZSkge1xuXHRcdHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSB0aGlzLmV2ZW50c1tldmVudE5hbWVdIHx8IFtdO1xuXHRcdHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChjYWxsYmFjayk7XG5cdH0sXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKCFldmVudE5hbWUpIHsgdGhpcy5ldmVudHMgPSB7fTsgcmV0dXJuIHRydWU7IH1cblx0XHR2YXIgY2FsbGJhY2tzID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXTtcblx0XHRpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRydWU7XG5cdFx0aWYgKCFjYWxsYmFjaykgeyB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107IHJldHVybiB0cnVlOyB9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChjYWxsYmFja3NbaV0gPT09IGNhbGxiYWNrKSB7XG5cdFx0XHRcdHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFx0XG5cdGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUpIHtcblx0XHR2YXIgaSxcblx0XHRcdGFyZ3MsXG5cdFx0XHRjYWxsYmFja3MgPSB0aGlzLmV2ZW50c1tldmVudE5hbWVdO1xuXG5cdFx0aWYgKGNhbGxiYWNrcykge1xuXHRcdFx0YXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdC8vIGVuZDogZmFrZSBldmVudHNcblx0XG5cdC8vIGZha2UgRE9NIGF0dHJpYnV0ZSBtZXRob2RzXG5cdGhhc0F0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG5cdFx0cmV0dXJuIChuYW1lIGluIHRoaXMuYXR0cmlidXRlcyk7ICBcblx0fSxcblx0cmVtb3ZlQXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcblx0XHRkZWxldGUgdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuXHR9LFxuXHRnZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdGlmICh0aGlzLmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcblx0XHR9XG5cdFx0cmV0dXJuICcnO1xuXHR9LFxuXHRzZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcblx0XHR0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSB2YWx1ZTtcblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHRcdG1lanMuVXRpbGl0eS5yZW1vdmVTd2YodGhpcy5wbHVnaW5FbGVtZW50LmlkKTtcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLnVucmVnaXN0ZXJQbHVnaW5FbGVtZW50KHRoaXMucGx1Z2luRWxlbWVudC5pZCk7XG5cdH1cbn07XG5cbi8vIEhhbmRsZXMgY2FsbHMgZnJvbSBGbGFzaC9TaWx2ZXJsaWdodCBhbmQgcmVwb3J0cyB0aGVtIGFzIG5hdGl2ZSA8dmlkZW8vYXVkaW8+IGV2ZW50cyBhbmQgcHJvcGVydGllc1xubWVqcy5NZWRpYVBsdWdpbkJyaWRnZSA9IHtcblxuXHRwbHVnaW5NZWRpYUVsZW1lbnRzOnt9LFxuXHRodG1sTWVkaWFFbGVtZW50czp7fSxcblxuXHRyZWdpc3RlclBsdWdpbkVsZW1lbnQ6IGZ1bmN0aW9uIChpZCwgcGx1Z2luTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KSB7XG5cdFx0dGhpcy5wbHVnaW5NZWRpYUVsZW1lbnRzW2lkXSA9IHBsdWdpbk1lZGlhRWxlbWVudDtcblx0XHR0aGlzLmh0bWxNZWRpYUVsZW1lbnRzW2lkXSA9IGh0bWxNZWRpYUVsZW1lbnQ7XG5cdH0sXG5cblx0dW5yZWdpc3RlclBsdWdpbkVsZW1lbnQ6IGZ1bmN0aW9uIChpZCkge1xuXHRcdGRlbGV0ZSB0aGlzLnBsdWdpbk1lZGlhRWxlbWVudHNbaWRdO1xuXHRcdGRlbGV0ZSB0aGlzLmh0bWxNZWRpYUVsZW1lbnRzW2lkXTtcblx0fSxcblxuXHQvLyB3aGVuIEZsYXNoL1NpbHZlcmxpZ2h0IGlzIHJlYWR5LCBpdCBjYWxscyBvdXQgdG8gdGhpcyBtZXRob2Rcblx0aW5pdFBsdWdpbjogZnVuY3Rpb24gKGlkKSB7XG5cblx0XHR2YXIgcGx1Z2luTWVkaWFFbGVtZW50ID0gdGhpcy5wbHVnaW5NZWRpYUVsZW1lbnRzW2lkXSxcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSB0aGlzLmh0bWxNZWRpYUVsZW1lbnRzW2lkXTtcblxuXHRcdGlmIChwbHVnaW5NZWRpYUVsZW1lbnQpIHtcblx0XHRcdC8vIGZpbmQgdGhlIGphdmFzY3JpcHQgYnJpZGdlXG5cdFx0XHRzd2l0Y2ggKHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5UeXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJmbGFzaFwiOlxuXHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5FbGVtZW50ID0gcGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkFwaSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInNpbHZlcmxpZ2h0XCI6XG5cdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbHVnaW5NZWRpYUVsZW1lbnQuaWQpO1xuXHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudC5Db250ZW50Lk1lZGlhRWxlbWVudEpTO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcblx0XHRcdGlmIChwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpICE9IG51bGwgJiYgcGx1Z2luTWVkaWFFbGVtZW50LnN1Y2Nlc3MpIHtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnN1Y2Nlc3MocGx1Z2luTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0Ly8gcmVjZWl2ZXMgZXZlbnRzIGZyb20gRmxhc2gvU2lsdmVybGlnaHQgYW5kIHNlbmRzIHRoZW0gb3V0IGFzIEhUTUw1IG1lZGlhIGV2ZW50c1xuXHQvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS92aWRlby5odG1sXG5cdGZpcmVFdmVudDogZnVuY3Rpb24gKGlkLCBldmVudE5hbWUsIHZhbHVlcykge1xuXG5cdFx0dmFyXG5cdFx0XHRlLFxuXHRcdFx0aSxcblx0XHRcdGJ1ZmZlcmVkVGltZSxcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudCA9IHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF07XG5cblx0XHRpZighcGx1Z2luTWVkaWFFbGVtZW50KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcblx0XHQvLyBmYWtlIGV2ZW50IG9iamVjdCB0byBtaW1pYyByZWFsIEhUTUwgbWVkaWEgZXZlbnQuXG5cdFx0ZSA9IHtcblx0XHRcdHR5cGU6IGV2ZW50TmFtZSxcblx0XHRcdHRhcmdldDogcGx1Z2luTWVkaWFFbGVtZW50XG5cdFx0fTtcblxuXHRcdC8vIGF0dGFjaCBhbGwgdmFsdWVzIHRvIGVsZW1lbnQgYW5kIGV2ZW50IG9iamVjdFxuXHRcdGZvciAoaSBpbiB2YWx1ZXMpIHtcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudFtpXSA9IHZhbHVlc1tpXTtcblx0XHRcdGVbaV0gPSB2YWx1ZXNbaV07XG5cdFx0fVxuXG5cdFx0Ly8gZmFrZSB0aGUgbmV3ZXIgVzNDIGJ1ZmZlcmVkIFRpbWVSYW5nZSAobG9hZGVkIGFuZCB0b3RhbCBoYXZlIGJlZW4gcmVtb3ZlZClcblx0XHRidWZmZXJlZFRpbWUgPSB2YWx1ZXMuYnVmZmVyZWRUaW1lIHx8IDA7XG5cblx0XHRlLnRhcmdldC5idWZmZXJlZCA9IGUuYnVmZmVyZWQgPSB7XG5cdFx0XHRzdGFydDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9LFxuXHRcdFx0ZW5kOiBmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1ZmZlcmVkVGltZTtcblx0XHRcdH0sXG5cdFx0XHRsZW5ndGg6IDFcblx0XHR9O1xuXG5cdFx0cGx1Z2luTWVkaWFFbGVtZW50LmRpc3BhdGNoRXZlbnQoZS50eXBlLCBlKTtcblx0fVxufTtcblxuLypcbkRlZmF1bHQgb3B0aW9uc1xuKi9cbm1lanMuTWVkaWFFbGVtZW50RGVmYXVsdHMgPSB7XG5cdC8vIGFsbG93cyB0ZXN0aW5nIG9uIEhUTUw1LCBmbGFzaCwgc2lsdmVybGlnaHRcblx0Ly8gYXV0bzogYXR0ZW1wdHMgdG8gZGV0ZWN0IHdoYXQgdGhlIGJyb3dzZXIgY2FuIGRvXG5cdC8vIGF1dG9fcGx1Z2luOiBwcmVmZXIgcGx1Z2lucyBhbmQgdGhlbiBhdHRlbXB0IG5hdGl2ZSBIVE1MNVxuXHQvLyBuYXRpdmU6IGZvcmNlcyBIVE1MNSBwbGF5YmFja1xuXHQvLyBzaGltOiBkaXNhbGxvd3MgSFRNTDUsIHdpbGwgYXR0ZW1wdCBlaXRoZXIgRmxhc2ggb3IgU2lsdmVybGlnaHRcblx0Ly8gbm9uZTogZm9yY2VzIGZhbGxiYWNrIHZpZXdcblx0bW9kZTogJ2F1dG8nLFxuXHQvLyByZW1vdmUgb3IgcmVvcmRlciB0byBjaGFuZ2UgcGx1Z2luIHByaW9yaXR5IGFuZCBhdmFpbGFiaWxpdHlcblx0cGx1Z2luczogWydmbGFzaCcsJ3NpbHZlcmxpZ2h0JywneW91dHViZScsJ3ZpbWVvJ10sXG5cdC8vIHNob3dzIGRlYnVnIGVycm9ycyBvbiBzY3JlZW5cblx0ZW5hYmxlUGx1Z2luRGVidWc6IGZhbHNlLFxuXHQvLyB1c2UgcGx1Z2luIGZvciBicm93c2VycyB0aGF0IGhhdmUgdHJvdWJsZSB3aXRoIEJhc2ljIEF1dGhlbnRpY2F0aW9uIG9uIEhUVFBTIHNpdGVzXG5cdGh0dHBzQmFzaWNBdXRoU2l0ZTogZmFsc2UsXG5cdC8vIG92ZXJyaWRlcyB0aGUgdHlwZSBzcGVjaWZpZWQsIHVzZWZ1bCBmb3IgZHluYW1pYyBpbnN0YW50aWF0aW9uXG5cdHR5cGU6ICcnLFxuXHQvLyBwYXRoIHRvIEZsYXNoIGFuZCBTaWx2ZXJsaWdodCBwbHVnaW5zXG5cdHBsdWdpblBhdGg6IG1lanMuVXRpbGl0eS5nZXRTY3JpcHRQYXRoKFsnbWVkaWFlbGVtZW50LmpzJywnbWVkaWFlbGVtZW50Lm1pbi5qcycsJ21lZGlhZWxlbWVudC1hbmQtcGxheWVyLmpzJywnbWVkaWFlbGVtZW50LWFuZC1wbGF5ZXIubWluLmpzJ10pLFxuXHQvLyBuYW1lIG9mIGZsYXNoIGZpbGVcblx0Zmxhc2hOYW1lOiAnZmxhc2htZWRpYWVsZW1lbnQuc3dmJyxcblx0Ly8gc3RyZWFtZXIgZm9yIFJUTVAgc3RyZWFtaW5nXG5cdGZsYXNoU3RyZWFtZXI6ICcnLFxuXHQvLyB0dXJucyBvbiB0aGUgc21vb3RoaW5nIGZpbHRlciBpbiBGbGFzaFxuXHRlbmFibGVQbHVnaW5TbW9vdGhpbmc6IGZhbHNlLFxuXHQvLyBlbmFibGVkIHBzZXVkby1zdHJlYW1pbmcgKHNlZWspIG9uIC5tcDQgZmlsZXNcblx0ZW5hYmxlUHNldWRvU3RyZWFtaW5nOiBmYWxzZSxcblx0Ly8gc3RhcnQgcXVlcnkgcGFyYW1ldGVyIHNlbnQgdG8gc2VydmVyIGZvciBwc2V1ZG8tc3RyZWFtaW5nXG5cdHBzZXVkb1N0cmVhbWluZ1N0YXJ0UXVlcnlQYXJhbTogJ3N0YXJ0Jyxcblx0Ly8gbmFtZSBvZiBzaWx2ZXJsaWdodCBmaWxlXG5cdHNpbHZlcmxpZ2h0TmFtZTogJ3NpbHZlcmxpZ2h0bWVkaWFlbGVtZW50LnhhcCcsXG5cdC8vIGRlZmF1bHQgaWYgdGhlIDx2aWRlbyB3aWR0aD4gaXMgbm90IHNwZWNpZmllZFxuXHRkZWZhdWx0VmlkZW9XaWR0aDogNDgwLFxuXHQvLyBkZWZhdWx0IGlmIHRoZSA8dmlkZW8gaGVpZ2h0PiBpcyBub3Qgc3BlY2lmaWVkXG5cdGRlZmF1bHRWaWRlb0hlaWdodDogMjcwLFxuXHQvLyBvdmVycmlkZXMgPHZpZGVvIHdpZHRoPlxuXHRwbHVnaW5XaWR0aDogLTEsXG5cdC8vIG92ZXJyaWRlcyA8dmlkZW8gaGVpZ2h0PlxuXHRwbHVnaW5IZWlnaHQ6IC0xLFxuXHQvLyBhZGRpdGlvbmFsIHBsdWdpbiB2YXJpYWJsZXMgaW4gJ2tleT12YWx1ZScgZm9ybVxuXHRwbHVnaW5WYXJzOiBbXSxcdFxuXHQvLyByYXRlIGluIG1pbGxpc2Vjb25kcyBmb3IgRmxhc2ggYW5kIFNpbHZlcmxpZ2h0IHRvIGZpcmUgdGhlIHRpbWV1cGRhdGUgZXZlbnRcblx0Ly8gbGFyZ2VyIG51bWJlciBpcyBsZXNzIGFjY3VyYXRlLCBidXQgbGVzcyBzdHJhaW4gb24gcGx1Z2luLT5KYXZhU2NyaXB0IGJyaWRnZVxuXHR0aW1lclJhdGU6IDI1MCxcblx0Ly8gaW5pdGlhbCB2b2x1bWUgZm9yIHBsYXllclxuXHRzdGFydFZvbHVtZTogMC44LFxuXHRzdWNjZXNzOiBmdW5jdGlvbiAoKSB7IH0sXG5cdGVycm9yOiBmdW5jdGlvbiAoKSB7IH1cbn07XG5cbi8qXG5EZXRlcm1pbmVzIGlmIGEgYnJvd3NlciBzdXBwb3J0cyB0aGUgPHZpZGVvPiBvciA8YXVkaW8+IGVsZW1lbnRcbmFuZCByZXR1cm5zIGVpdGhlciB0aGUgbmF0aXZlIGVsZW1lbnQgb3IgYSBGbGFzaC9TaWx2ZXJsaWdodCB2ZXJzaW9uIHRoYXRcbm1pbWljcyBIVE1MNSBNZWRpYUVsZW1lbnRcbiovXG5tZWpzLk1lZGlhRWxlbWVudCA9IGZ1bmN0aW9uIChlbCwgbykge1xuXHRyZXR1cm4gbWVqcy5IdG1sTWVkaWFFbGVtZW50U2hpbS5jcmVhdGUoZWwsbyk7XG59O1xuXG5tZWpzLkh0bWxNZWRpYUVsZW1lbnRTaGltID0ge1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oZWwsIG8pIHtcblx0XHR2YXJcblx0XHRcdG9wdGlvbnMgPSBtZWpzLk1lZGlhRWxlbWVudERlZmF1bHRzLFxuXHRcdFx0aHRtbE1lZGlhRWxlbWVudCA9ICh0eXBlb2YoZWwpID09ICdzdHJpbmcnKSA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKSA6IGVsLFxuXHRcdFx0dGFnTmFtZSA9IGh0bWxNZWRpYUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpLFxuXHRcdFx0aXNNZWRpYVRhZyA9ICh0YWdOYW1lID09PSAnYXVkaW8nIHx8IHRhZ05hbWUgPT09ICd2aWRlbycpLFxuXHRcdFx0c3JjID0gKGlzTWVkaWFUYWcpID8gaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpIDogaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSxcblx0XHRcdHBvc3RlciA9IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdwb3N0ZXInKSxcblx0XHRcdGF1dG9wbGF5ID0gIGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhdXRvcGxheScpLFxuXHRcdFx0cHJlbG9hZCA9ICBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgncHJlbG9hZCcpLFxuXHRcdFx0Y29udHJvbHMgPSAgaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NvbnRyb2xzJyksXG5cdFx0XHRwbGF5YmFjayxcblx0XHRcdHByb3A7XG5cblx0XHQvLyBleHRlbmQgb3B0aW9uc1xuXHRcdGZvciAocHJvcCBpbiBvKSB7XG5cdFx0XHRvcHRpb25zW3Byb3BdID0gb1twcm9wXTtcblx0XHR9XG5cblx0XHQvLyBjbGVhbiB1cCBhdHRyaWJ1dGVzXG5cdFx0c3JjID0gXHRcdCh0eXBlb2Ygc3JjID09ICd1bmRlZmluZWQnIFx0fHwgc3JjID09PSBudWxsIHx8IHNyYyA9PSAnJykgPyBudWxsIDogc3JjO1x0XHRcblx0XHRwb3N0ZXIgPVx0KHR5cGVvZiBwb3N0ZXIgPT0gJ3VuZGVmaW5lZCcgXHR8fCBwb3N0ZXIgPT09IG51bGwpID8gJycgOiBwb3N0ZXI7XG5cdFx0cHJlbG9hZCA9IFx0KHR5cGVvZiBwcmVsb2FkID09ICd1bmRlZmluZWQnIFx0fHwgcHJlbG9hZCA9PT0gbnVsbCB8fCBwcmVsb2FkID09PSAnZmFsc2UnKSA/ICdub25lJyA6IHByZWxvYWQ7XG5cdFx0YXV0b3BsYXkgPSBcdCEodHlwZW9mIGF1dG9wbGF5ID09ICd1bmRlZmluZWQnIHx8IGF1dG9wbGF5ID09PSBudWxsIHx8IGF1dG9wbGF5ID09PSAnZmFsc2UnKTtcblx0XHRjb250cm9scyA9IFx0ISh0eXBlb2YgY29udHJvbHMgPT0gJ3VuZGVmaW5lZCcgfHwgY29udHJvbHMgPT09IG51bGwgfHwgY29udHJvbHMgPT09ICdmYWxzZScpO1xuXG5cdFx0Ly8gdGVzdCBmb3IgSFRNTDUgYW5kIHBsdWdpbiBjYXBhYmlsaXRpZXNcblx0XHRwbGF5YmFjayA9IHRoaXMuZGV0ZXJtaW5lUGxheWJhY2soaHRtbE1lZGlhRWxlbWVudCwgb3B0aW9ucywgbWVqcy5NZWRpYUZlYXR1cmVzLnN1cHBvcnRzTWVkaWFUYWcsIGlzTWVkaWFUYWcsIHNyYyk7XG5cdFx0cGxheWJhY2sudXJsID0gKHBsYXliYWNrLnVybCAhPT0gbnVsbCkgPyBtZWpzLlV0aWxpdHkuYWJzb2x1dGl6ZVVybChwbGF5YmFjay51cmwpIDogJyc7XG5cblx0XHRpZiAocGxheWJhY2subWV0aG9kID09ICduYXRpdmUnKSB7XG5cdFx0XHQvLyBzZWNvbmQgZml4IGZvciBhbmRyb2lkXG5cdFx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzQnVzdGVkQW5kcm9pZCkge1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHBsYXliYWNrLnVybDtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGxheSgpO1xuXHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XG5cdFx0XHQvLyBhZGQgbWV0aG9kcyB0byBuYXRpdmUgSFRNTE1lZGlhRWxlbWVudFxuXHRcdFx0cmV0dXJuIHRoaXMudXBkYXRlTmF0aXZlKHBsYXliYWNrLCBvcHRpb25zLCBhdXRvcGxheSwgcHJlbG9hZCk7XG5cdFx0fSBlbHNlIGlmIChwbGF5YmFjay5tZXRob2QgIT09ICcnKSB7XG5cdFx0XHQvLyBjcmVhdGUgcGx1Z2luIHRvIG1pbWljIEhUTUxNZWRpYUVsZW1lbnRcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlUGx1Z2luKCBwbGF5YmFjaywgIG9wdGlvbnMsIHBvc3RlciwgYXV0b3BsYXksIHByZWxvYWQsIGNvbnRyb2xzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gYm9vLCBubyBIVE1MNSwgbm8gRmxhc2gsIG5vIFNpbHZlcmxpZ2h0LlxuXHRcdFx0dGhpcy5jcmVhdGVFcnJvck1lc3NhZ2UoIHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIgKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9LFxuXHRcblx0ZGV0ZXJtaW5lUGxheWJhY2s6IGZ1bmN0aW9uKGh0bWxNZWRpYUVsZW1lbnQsIG9wdGlvbnMsIHN1cHBvcnRzTWVkaWFUYWcsIGlzTWVkaWFUYWcsIHNyYykge1xuXHRcdHZhclxuXHRcdFx0bWVkaWFGaWxlcyA9IFtdLFxuXHRcdFx0aSxcblx0XHRcdGosXG5cdFx0XHRrLFxuXHRcdFx0bCxcblx0XHRcdG4sXG5cdFx0XHR0eXBlLFxuXHRcdFx0cmVzdWx0ID0geyBtZXRob2Q6ICcnLCB1cmw6ICcnLCBodG1sTWVkaWFFbGVtZW50OiBodG1sTWVkaWFFbGVtZW50LCBpc1ZpZGVvOiAoaHRtbE1lZGlhRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT0gJ2F1ZGlvJyl9LFxuXHRcdFx0cGx1Z2luTmFtZSxcblx0XHRcdHBsdWdpblZlcnNpb25zLFxuXHRcdFx0cGx1Z2luSW5mbyxcblx0XHRcdGR1bW15LFxuXHRcdFx0bWVkaWE7XG5cdFx0XHRcblx0XHQvLyBTVEVQIDE6IEdldCBVUkwgYW5kIHR5cGUgZnJvbSA8dmlkZW8gc3JjPiBvciA8c291cmNlIHNyYz5cblxuXHRcdC8vIHN1cHBsaWVkIHR5cGUgb3ZlcnJpZGVzIDx2aWRlbyB0eXBlPiBhbmQgPHNvdXJjZSB0eXBlPlxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy50eXBlICE9ICd1bmRlZmluZWQnICYmIG9wdGlvbnMudHlwZSAhPT0gJycpIHtcblx0XHRcdFxuXHRcdFx0Ly8gYWNjZXB0IGVpdGhlciBzdHJpbmcgb3IgYXJyYXkgb2YgdHlwZXNcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy50eXBlID09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdG1lZGlhRmlsZXMucHVzaCh7dHlwZTpvcHRpb25zLnR5cGUsIHVybDpzcmN9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKGk9MDsgaTxvcHRpb25zLnR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRtZWRpYUZpbGVzLnB1c2goe3R5cGU6b3B0aW9ucy50eXBlW2ldLCB1cmw6c3JjfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdC8vIHRlc3QgZm9yIHNyYyBhdHRyaWJ1dGUgZmlyc3Rcblx0XHR9IGVsc2UgaWYgKHNyYyAhPT0gbnVsbCkge1xuXHRcdFx0dHlwZSA9IHRoaXMuZm9ybWF0VHlwZShzcmMsIGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpO1xuXHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOnR5cGUsIHVybDpzcmN9KTtcblxuXHRcdC8vIHRoZW4gdGVzdCBmb3IgPHNvdXJjZT4gZWxlbWVudHNcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdGVzdCA8c291cmNlPiB0eXBlcyB0byBzZWUgaWYgdGhleSBhcmUgdXNhYmxlXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgaHRtbE1lZGlhRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG4gPSBodG1sTWVkaWFFbGVtZW50LmNoaWxkTm9kZXNbaV07XG5cdFx0XHRcdGlmIChuLm5vZGVUeXBlID09IDEgJiYgbi50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ3NvdXJjZScpIHtcblx0XHRcdFx0XHRzcmMgPSBuLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG5cdFx0XHRcdFx0dHlwZSA9IHRoaXMuZm9ybWF0VHlwZShzcmMsIG4uZ2V0QXR0cmlidXRlKCd0eXBlJykpO1xuXHRcdFx0XHRcdG1lZGlhID0gbi5nZXRBdHRyaWJ1dGUoJ21lZGlhJyk7XG5cblx0XHRcdFx0XHRpZiAoIW1lZGlhIHx8ICF3aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgJiYgd2luZG93Lm1hdGNoTWVkaWEobWVkaWEpLm1hdGNoZXMpKSB7XG5cdFx0XHRcdFx0XHRtZWRpYUZpbGVzLnB1c2goe3R5cGU6dHlwZSwgdXJsOnNyY30pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBpbiB0aGUgY2FzZSBvZiBkeW5hbWljbHkgY3JlYXRlZCBwbGF5ZXJzXG5cdFx0Ly8gY2hlY2sgZm9yIGF1ZGlvIHR5cGVzXG5cdFx0aWYgKCFpc01lZGlhVGFnICYmIG1lZGlhRmlsZXMubGVuZ3RoID4gMCAmJiBtZWRpYUZpbGVzWzBdLnVybCAhPT0gbnVsbCAmJiB0aGlzLmdldFR5cGVGcm9tRmlsZShtZWRpYUZpbGVzWzBdLnVybCkuaW5kZXhPZignYXVkaW8nKSA+IC0xKSB7XG5cdFx0XHRyZXN1bHQuaXNWaWRlbyA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblxuXHRcdC8vIFNURVAgMjogVGVzdCBmb3IgcGxheWJhY2sgbWV0aG9kXG5cdFx0XG5cdFx0Ly8gc3BlY2lhbCBjYXNlIGZvciBBbmRyb2lkIHdoaWNoIHNhZGx5IGRvZXNuJ3QgaW1wbGVtZW50IHRoZSBjYW5QbGF5VHlwZSBmdW5jdGlvbiAoYWx3YXlzIHJldHVybnMgJycpXG5cdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0J1c3RlZEFuZHJvaWQpIHtcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuY2FuUGxheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG5cdFx0XHRcdHJldHVybiAodHlwZS5tYXRjaCgvdmlkZW9cXC8obXA0fG00dikvZ2kpICE9PSBudWxsKSA/ICdtYXliZScgOiAnJztcblx0XHRcdH07XG5cdFx0fVx0XHRcblx0XHRcblx0XHQvLyBzcGVjaWFsIGNhc2UgZm9yIENocm9taXVtIHRvIHNwZWNpZnkgbmF0aXZlbHkgc3VwcG9ydGVkIHZpZGVvIGNvZGVjcyAoaS5lLiBXZWJNIGFuZCBUaGVvcmEpIFxuXHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNDaHJvbWl1bSkgeyBcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuY2FuUGxheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7IFxuXHRcdFx0XHRyZXR1cm4gKHR5cGUubWF0Y2goL3ZpZGVvXFwvKHdlYm18b2d2fG9nZykvZ2kpICE9PSBudWxsKSA/ICdtYXliZScgOiAnJzsgXG5cdFx0XHR9OyBcblx0XHR9XG5cblx0XHQvLyB0ZXN0IGZvciBuYXRpdmUgcGxheWJhY2sgZmlyc3Rcblx0XHRpZiAoc3VwcG9ydHNNZWRpYVRhZyAmJiAob3B0aW9ucy5tb2RlID09PSAnYXV0bycgfHwgb3B0aW9ucy5tb2RlID09PSAnYXV0b19wbHVnaW4nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ25hdGl2ZScpICAmJiAhKG1lanMuTWVkaWFGZWF0dXJlcy5pc0J1c3RlZE5hdGl2ZUhUVFBTICYmIG9wdGlvbnMuaHR0cHNCYXNpY0F1dGhTaXRlID09PSB0cnVlKSkge1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRpZiAoIWlzTWVkaWFUYWcpIHtcblxuXHRcdFx0XHQvLyBjcmVhdGUgYSByZWFsIEhUTUw1IE1lZGlhIEVsZW1lbnQgXG5cdFx0XHRcdGR1bW15ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggcmVzdWx0LmlzVmlkZW8gPyAndmlkZW8nIDogJ2F1ZGlvJyk7XHRcdFx0XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHVtbXksIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyB1c2UgdGhpcyBvbmUgZnJvbSBub3cgb25cblx0XHRcdFx0cmVzdWx0Lmh0bWxNZWRpYUVsZW1lbnQgPSBodG1sTWVkaWFFbGVtZW50ID0gZHVtbXk7XG5cdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0Zm9yIChpPTA7IGk8bWVkaWFGaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQvLyBub3JtYWwgY2hlY2tcblx0XHRcdFx0aWYgKG1lZGlhRmlsZXNbaV0udHlwZSA9PSBcInZpZGVvL20zdThcIiB8fCBodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlKG1lZGlhRmlsZXNbaV0udHlwZSkucmVwbGFjZSgvbm8vLCAnJykgIT09ICcnXG5cdFx0XHRcdFx0Ly8gc3BlY2lhbCBjYXNlIGZvciBNYWMvU2FmYXJpIDUuMC4zIHdoaWNoIGFuc3dlcnMgJycgdG8gY2FuUGxheVR5cGUoJ2F1ZGlvL21wMycpIGJ1dCAnbWF5YmUnIHRvIGNhblBsYXlUeXBlKCdhdWRpby9tcGVnJylcblx0XHRcdFx0XHR8fCBodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlKG1lZGlhRmlsZXNbaV0udHlwZS5yZXBsYWNlKC9tcDMvLCdtcGVnJykpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJ1xuXHRcdFx0XHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgbTRhIHN1cHBvcnRlZCBieSBkZXRlY3RpbmcgbXA0IHN1cHBvcnRcblx0XHRcdFx0XHR8fCBodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlKG1lZGlhRmlsZXNbaV0udHlwZS5yZXBsYWNlKC9tNGEvLCdtcDQnKSkucmVwbGFjZSgvbm8vLCAnJykgIT09ICcnKSB7XG5cdFx0XHRcdFx0cmVzdWx0Lm1ldGhvZCA9ICduYXRpdmUnO1xuXHRcdFx0XHRcdHJlc3VsdC51cmwgPSBtZWRpYUZpbGVzW2ldLnVybDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVx0XHRcdFxuXHRcdFx0XG5cdFx0XHRpZiAocmVzdWx0Lm1ldGhvZCA9PT0gJ25hdGl2ZScpIHtcblx0XHRcdFx0aWYgKHJlc3VsdC51cmwgIT09IG51bGwpIHtcblx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHJlc3VsdC51cmw7XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0XHQvLyBpZiBgYXV0b19wbHVnaW5gIG1vZGUsIHRoZW4gY2FjaGUgdGhlIG5hdGl2ZSByZXN1bHQgYnV0IHRyeSBwbHVnaW5zLlxuXHRcdFx0XHRpZiAob3B0aW9ucy5tb2RlICE9PSAnYXV0b19wbHVnaW4nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGlmIG5hdGl2ZSBwbGF5YmFjayBkaWRuJ3Qgd29yaywgdGhlbiB0ZXN0IHBsdWdpbnNcblx0XHRpZiAob3B0aW9ucy5tb2RlID09PSAnYXV0bycgfHwgb3B0aW9ucy5tb2RlID09PSAnYXV0b19wbHVnaW4nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ3NoaW0nKSB7XG5cdFx0XHRmb3IgKGk9MDsgaTxtZWRpYUZpbGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHR5cGUgPSBtZWRpYUZpbGVzW2ldLnR5cGU7XG5cblx0XHRcdFx0Ly8gdGVzdCBhbGwgcGx1Z2lucyBpbiBvcmRlciBvZiBwcmVmZXJlbmNlIFtzaWx2ZXJsaWdodCwgZmxhc2hdXG5cdFx0XHRcdGZvciAoaj0wOyBqPG9wdGlvbnMucGx1Z2lucy5sZW5ndGg7IGorKykge1xuXG5cdFx0XHRcdFx0cGx1Z2luTmFtZSA9IG9wdGlvbnMucGx1Z2luc1tqXTtcblx0XHRcdFxuXHRcdFx0XHRcdC8vIHRlc3QgdmVyc2lvbiBvZiBwbHVnaW4gKGZvciBmdXR1cmUgZmVhdHVyZXMpXG5cdFx0XHRcdFx0cGx1Z2luVmVyc2lvbnMgPSBtZWpzLnBsdWdpbnNbcGx1Z2luTmFtZV07XHRcdFx0XHRcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKGs9MDsgazxwbHVnaW5WZXJzaW9ucy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRcdFx0cGx1Z2luSW5mbyA9IHBsdWdpblZlcnNpb25zW2tdO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Ly8gdGVzdCBpZiB1c2VyIGhhcyB0aGUgY29ycmVjdCBwbHVnaW4gdmVyc2lvblxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHQvLyBmb3IgeW91dHViZS92aW1lb1xuXHRcdFx0XHRcdFx0aWYgKHBsdWdpbkluZm8udmVyc2lvbiA9PSBudWxsIHx8IFxuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0bWVqcy5QbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKHBsdWdpbk5hbWUsIHBsdWdpbkluZm8udmVyc2lvbikpIHtcblxuXHRcdFx0XHRcdFx0XHQvLyB0ZXN0IGZvciBwbHVnaW4gcGxheWJhY2sgdHlwZXNcblx0XHRcdFx0XHRcdFx0Zm9yIChsPTA7IGw8cGx1Z2luSW5mby50eXBlcy5sZW5ndGg7IGwrKykge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGZpbmQgcGx1Z2luIHRoYXQgY2FuIHBsYXkgdGhlIHR5cGVcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZSA9PSBwbHVnaW5JbmZvLnR5cGVzW2xdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQubWV0aG9kID0gcGx1Z2luTmFtZTtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdC51cmwgPSBtZWRpYUZpbGVzW2ldLnVybDtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8vIGF0IHRoaXMgcG9pbnQsIGJlaW5nIGluICdhdXRvX3BsdWdpbicgbW9kZSBpbXBsaWVzIHRoYXQgd2UgdHJpZWQgcGx1Z2lucyBidXQgZmFpbGVkLlxuXHRcdC8vIGlmIHdlIGhhdmUgbmF0aXZlIHN1cHBvcnQgdGhlbiByZXR1cm4gdGhhdC5cblx0XHRpZiAob3B0aW9ucy5tb2RlID09PSAnYXV0b19wbHVnaW4nICYmIHJlc3VsdC5tZXRob2QgPT09ICduYXRpdmUnKSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdC8vIHdoYXQgaWYgdGhlcmUncyBub3RoaW5nIHRvIHBsYXk/IGp1c3QgZ3JhYiB0aGUgZmlyc3QgYXZhaWxhYmxlXG5cdFx0aWYgKHJlc3VsdC5tZXRob2QgPT09ICcnICYmIG1lZGlhRmlsZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmVzdWx0LnVybCA9IG1lZGlhRmlsZXNbMF0udXJsO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0Zm9ybWF0VHlwZTogZnVuY3Rpb24odXJsLCB0eXBlKSB7XG5cdFx0dmFyIGV4dDtcblxuXHRcdC8vIGlmIG5vIHR5cGUgaXMgc3VwcGxpZWQsIGZha2UgaXQgd2l0aCB0aGUgZXh0ZW5zaW9uXG5cdFx0aWYgKHVybCAmJiAhdHlwZSkge1x0XHRcblx0XHRcdHJldHVybiB0aGlzLmdldFR5cGVGcm9tRmlsZSh1cmwpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBvbmx5IHJldHVybiB0aGUgbWltZSBwYXJ0IG9mIHRoZSB0eXBlIGluIGNhc2UgdGhlIGF0dHJpYnV0ZSBjb250YWlucyB0aGUgY29kZWNcblx0XHRcdC8vIHNlZSBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS92aWRlby5odG1sI3RoZS1zb3VyY2UtZWxlbWVudFxuXHRcdFx0Ly8gYHZpZGVvL21wNDsgY29kZWNzPVwiYXZjMS40MkUwMUUsIG1wNGEuNDAuMlwiYCBiZWNvbWVzIGB2aWRlby9tcDRgXG5cdFx0XHRcblx0XHRcdGlmICh0eXBlICYmIH50eXBlLmluZGV4T2YoJzsnKSkge1xuXHRcdFx0XHRyZXR1cm4gdHlwZS5zdWJzdHIoMCwgdHlwZS5pbmRleE9mKCc7JykpOyBcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0eXBlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XG5cdGdldFR5cGVGcm9tRmlsZTogZnVuY3Rpb24odXJsKSB7XG5cdFx0dXJsID0gdXJsLnNwbGl0KCc/JylbMF07XG5cdFx0dmFyIGV4dCA9IHVybC5zdWJzdHJpbmcodXJsLmxhc3RJbmRleE9mKCcuJykgKyAxKS50b0xvd2VyQ2FzZSgpO1xuXHRcdHJldHVybiAoLyhtcDR8bTR2fG9nZ3xvZ3Z8bTN1OHx3ZWJtfHdlYm12fGZsdnx3bXZ8bXBlZ3xtb3YpL2dpLnRlc3QoZXh0KSA/ICd2aWRlbycgOiAnYXVkaW8nKSArICcvJyArIHRoaXMuZ2V0VHlwZUZyb21FeHRlbnNpb24oZXh0KTtcblx0fSxcblx0XG5cdGdldFR5cGVGcm9tRXh0ZW5zaW9uOiBmdW5jdGlvbihleHQpIHtcblx0XHRcblx0XHRzd2l0Y2ggKGV4dCkge1xuXHRcdFx0Y2FzZSAnbXA0Jzpcblx0XHRcdGNhc2UgJ200dic6XG5cdFx0XHRjYXNlICdtNGEnOlxuXHRcdFx0XHRyZXR1cm4gJ21wNCc7XG5cdFx0XHRjYXNlICd3ZWJtJzpcblx0XHRcdGNhc2UgJ3dlYm1hJzpcblx0XHRcdGNhc2UgJ3dlYm12JzpcdFxuXHRcdFx0XHRyZXR1cm4gJ3dlYm0nO1xuXHRcdFx0Y2FzZSAnb2dnJzpcblx0XHRcdGNhc2UgJ29nYSc6XG5cdFx0XHRjYXNlICdvZ3YnOlx0XG5cdFx0XHRcdHJldHVybiAnb2dnJztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBleHQ7XG5cdFx0fVxuXHR9LFxuXG5cdGNyZWF0ZUVycm9yTWVzc2FnZTogZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIHBvc3Rlcikge1xuXHRcdHZhciBcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0ZXJyb3JDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFxuXHRcdGVycm9yQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdtZS1jYW5ub3RwbGF5JztcblxuXHRcdHRyeSB7XG5cdFx0XHRlcnJvckNvbnRhaW5lci5zdHlsZS53aWR0aCA9IGh0bWxNZWRpYUVsZW1lbnQud2lkdGggKyAncHgnO1xuXHRcdFx0ZXJyb3JDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gaHRtbE1lZGlhRWxlbWVudC5oZWlnaHQgKyAncHgnO1xuXHRcdH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAob3B0aW9ucy5jdXN0b21FcnJvcikge1xuICAgICAgZXJyb3JDb250YWluZXIuaW5uZXJIVE1MID0gb3B0aW9ucy5jdXN0b21FcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JDb250YWluZXIuaW5uZXJIVE1MID0gKHBvc3RlciAhPT0gJycpID9cbiAgICAgICAgJzxhIGhyZWY9XCInICsgcGxheWJhY2sudXJsICsgJ1wiPjxpbWcgc3JjPVwiJyArIHBvc3RlciArICdcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgLz48L2E+JyA6XG4gICAgICAgICc8YSBocmVmPVwiJyArIHBsYXliYWNrLnVybCArICdcIj48c3Bhbj4nICsgbWVqcy5pMThuLnQoJ0Rvd25sb2FkIEZpbGUnKSArICc8L3NwYW4+PC9hPic7XG4gICAgfVxuXG5cdFx0aHRtbE1lZGlhRWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlcnJvckNvbnRhaW5lciwgaHRtbE1lZGlhRWxlbWVudCk7XG5cdFx0aHRtbE1lZGlhRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0b3B0aW9ucy5lcnJvcihodG1sTWVkaWFFbGVtZW50KTtcblx0fSxcblxuXHRjcmVhdGVQbHVnaW46ZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIHBvc3RlciwgYXV0b3BsYXksIHByZWxvYWQsIGNvbnRyb2xzKSB7XG5cdFx0dmFyIFxuXHRcdFx0aHRtbE1lZGlhRWxlbWVudCA9IHBsYXliYWNrLmh0bWxNZWRpYUVsZW1lbnQsXG5cdFx0XHR3aWR0aCA9IDEsXG5cdFx0XHRoZWlnaHQgPSAxLFxuXHRcdFx0cGx1Z2luaWQgPSAnbWVfJyArIHBsYXliYWNrLm1ldGhvZCArICdfJyArIChtZWpzLm1lSW5kZXgrKyksXG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSBuZXcgbWVqcy5QbHVnaW5NZWRpYUVsZW1lbnQocGx1Z2luaWQsIHBsYXliYWNrLm1ldGhvZCwgcGxheWJhY2sudXJsKSxcblx0XHRcdGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuXHRcdFx0c3BlY2lhbElFQ29udGFpbmVyLFxuXHRcdFx0bm9kZSxcblx0XHRcdGluaXRWYXJzO1xuXG5cdFx0Ly8gY29weSB0YWdOYW1lIGZyb20gaHRtbCBtZWRpYSBlbGVtZW50XG5cdFx0cGx1Z2luTWVkaWFFbGVtZW50LnRhZ05hbWUgPSBodG1sTWVkaWFFbGVtZW50LnRhZ05hbWVcblxuXHRcdC8vIGNvcHkgYXR0cmlidXRlcyBmcm9tIGh0bWwgbWVkaWEgZWxlbWVudCB0byBwbHVnaW4gbWVkaWEgZWxlbWVudFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaHRtbE1lZGlhRWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlID0gaHRtbE1lZGlhRWxlbWVudC5hdHRyaWJ1dGVzW2ldO1xuXHRcdFx0aWYgKGF0dHJpYnV0ZS5zcGVjaWZpZWQgPT0gdHJ1ZSkge1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUudmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGNoZWNrIGZvciBwbGFjZW1lbnQgaW5zaWRlIGEgPHA+IHRhZyAoc29tZXRpbWVzIFdZU0lXWUcgZWRpdG9ycyBkbyB0aGlzKVxuXHRcdG5vZGUgPSBodG1sTWVkaWFFbGVtZW50LnBhcmVudE5vZGU7XG5cdFx0d2hpbGUgKG5vZGUgIT09IG51bGwgJiYgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdib2R5JyAmJiBub2RlLnBhcmVudE5vZGUgIT0gbnVsbCkge1xuXHRcdFx0aWYgKG5vZGUucGFyZW50Tm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdwJykge1xuXHRcdFx0XHRub2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgbm9kZS5wYXJlbnROb2RlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuXHRcdH1cblxuXHRcdGlmIChwbGF5YmFjay5pc1ZpZGVvKSB7XG5cdFx0XHR3aWR0aCA9IChvcHRpb25zLnBsdWdpbldpZHRoID4gMCkgPyBvcHRpb25zLnBsdWdpbldpZHRoIDogKG9wdGlvbnMudmlkZW9XaWR0aCA+IDApID8gb3B0aW9ucy52aWRlb1dpZHRoIDogKGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3aWR0aCcpICE9PSBudWxsKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3aWR0aCcpIDogb3B0aW9ucy5kZWZhdWx0VmlkZW9XaWR0aDtcblx0XHRcdGhlaWdodCA9IChvcHRpb25zLnBsdWdpbkhlaWdodCA+IDApID8gb3B0aW9ucy5wbHVnaW5IZWlnaHQgOiAob3B0aW9ucy52aWRlb0hlaWdodCA+IDApID8gb3B0aW9ucy52aWRlb0hlaWdodCA6IChodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykgIT09IG51bGwpID8gaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpIDogb3B0aW9ucy5kZWZhdWx0VmlkZW9IZWlnaHQ7XG5cdFx0XG5cdFx0XHQvLyBpbiBjYXNlIG9mICclJyBtYWtlIHN1cmUgaXQncyBlbmNvZGVkXG5cdFx0XHR3aWR0aCA9IG1lanMuVXRpbGl0eS5lbmNvZGVVcmwod2lkdGgpO1xuXHRcdFx0aGVpZ2h0ID0gbWVqcy5VdGlsaXR5LmVuY29kZVVybChoZWlnaHQpO1xuXHRcdFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5EZWJ1Zykge1xuXHRcdFx0XHR3aWR0aCA9IDMyMDtcblx0XHRcdFx0aGVpZ2h0ID0gMjQwO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHJlZ2lzdGVyIHBsdWdpblxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuXHRcdG1lanMuTWVkaWFQbHVnaW5CcmlkZ2UucmVnaXN0ZXJQbHVnaW5FbGVtZW50KHBsdWdpbmlkLCBwbHVnaW5NZWRpYUVsZW1lbnQsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXG5cdFx0Ly8gYWRkIGNvbnRhaW5lciAobXVzdCBiZSBhZGRlZCB0byBET00gYmVmb3JlIGluc2VydGluZyBIVE1MIGZvciBJRSlcblx0XHRjb250YWluZXIuY2xhc3NOYW1lID0gJ21lLXBsdWdpbic7XG5cdFx0Y29udGFpbmVyLmlkID0gcGx1Z2luaWQgKyAnX2NvbnRhaW5lcic7XG5cdFx0XG5cdFx0aWYgKHBsYXliYWNrLmlzVmlkZW8pIHtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjb250YWluZXIsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKGNvbnRhaW5lciwgZG9jdW1lbnQuYm9keS5jaGlsZE5vZGVzWzBdKTtcblx0XHR9XG5cblx0XHQvLyBmbGFzaC9zaWx2ZXJsaWdodCB2YXJzXG5cdFx0aW5pdFZhcnMgPSBbXG5cdFx0XHQnaWQ9JyArIHBsdWdpbmlkLFxuXHRcdFx0J2lzdmlkZW89JyArICgocGxheWJhY2suaXNWaWRlbykgPyBcInRydWVcIiA6IFwiZmFsc2VcIiksXG5cdFx0XHQnYXV0b3BsYXk9JyArICgoYXV0b3BsYXkpID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpLFxuXHRcdFx0J3ByZWxvYWQ9JyArIHByZWxvYWQsXG5cdFx0XHQnd2lkdGg9JyArIHdpZHRoLFxuXHRcdFx0J3N0YXJ0dm9sdW1lPScgKyBvcHRpb25zLnN0YXJ0Vm9sdW1lLFxuXHRcdFx0J3RpbWVycmF0ZT0nICsgb3B0aW9ucy50aW1lclJhdGUsXG5cdFx0XHQnZmxhc2hzdHJlYW1lcj0nICsgb3B0aW9ucy5mbGFzaFN0cmVhbWVyLFxuXHRcdFx0J2hlaWdodD0nICsgaGVpZ2h0LFxuICAgICAgJ3BzZXVkb3N0cmVhbXN0YXJ0PScgKyBvcHRpb25zLnBzZXVkb1N0cmVhbWluZ1N0YXJ0UXVlcnlQYXJhbV07XG5cblx0XHRpZiAocGxheWJhY2sudXJsICE9PSBudWxsKSB7XG5cdFx0XHRpZiAocGxheWJhY2subWV0aG9kID09ICdmbGFzaCcpIHtcblx0XHRcdFx0aW5pdFZhcnMucHVzaCgnZmlsZT0nICsgbWVqcy5VdGlsaXR5LmVuY29kZVVybChwbGF5YmFjay51cmwpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGluaXRWYXJzLnB1c2goJ2ZpbGU9JyArIHBsYXliYWNrLnVybCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLmVuYWJsZVBsdWdpbkRlYnVnKSB7XG5cdFx0XHRpbml0VmFycy5wdXNoKCdkZWJ1Zz10cnVlJyk7XG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLmVuYWJsZVBsdWdpblNtb290aGluZykge1xuXHRcdFx0aW5pdFZhcnMucHVzaCgnc21vb3RoaW5nPXRydWUnKTtcblx0XHR9XG4gICAgaWYgKG9wdGlvbnMuZW5hYmxlUHNldWRvU3RyZWFtaW5nKSB7XG4gICAgICBpbml0VmFycy5wdXNoKCdwc2V1ZG9zdHJlYW1pbmc9dHJ1ZScpO1xuICAgIH1cblx0XHRpZiAoY29udHJvbHMpIHtcblx0XHRcdGluaXRWYXJzLnB1c2goJ2NvbnRyb2xzPXRydWUnKTsgLy8gc2hvd3MgY29udHJvbHMgaW4gdGhlIHBsdWdpbiBpZiBkZXNpcmVkXG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLnBsdWdpblZhcnMpIHtcblx0XHRcdGluaXRWYXJzID0gaW5pdFZhcnMuY29uY2F0KG9wdGlvbnMucGx1Z2luVmFycyk7XG5cdFx0fVx0XHRcblxuXHRcdHN3aXRjaCAocGxheWJhY2subWV0aG9kKSB7XG5cdFx0XHRjYXNlICdzaWx2ZXJsaWdodCc6XG5cdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPVxuJzxvYmplY3QgZGF0YT1cImRhdGE6YXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC0yLFwiIHR5cGU9XCJhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LTJcIiBpZD1cIicgKyBwbHVnaW5pZCArICdcIiBuYW1lPVwiJyArIHBsdWdpbmlkICsgJ1wiIHdpZHRoPVwiJyArIHdpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcbic8cGFyYW0gbmFtZT1cImluaXRQYXJhbXNcIiB2YWx1ZT1cIicgKyBpbml0VmFycy5qb2luKCcsJykgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cIndpbmRvd2xlc3NcIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYmFja2dyb3VuZFwiIHZhbHVlPVwiYmxhY2tcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwibWluUnVudGltZVZlcnNpb25cIiB2YWx1ZT1cIjMuMC4wLjBcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYXV0b1VwZ3JhZGVcIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwic291cmNlXCIgdmFsdWU9XCInICsgb3B0aW9ucy5wbHVnaW5QYXRoICsgb3B0aW9ucy5zaWx2ZXJsaWdodE5hbWUgKyAnXCIgLz4nICtcbic8L29iamVjdD4nO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdmbGFzaCc6XG5cblx0XHRcdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0lFKSB7XG5cdFx0XHRcdFx0c3BlY2lhbElFQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHNwZWNpYWxJRUNvbnRhaW5lcik7XG5cdFx0XHRcdFx0c3BlY2lhbElFQ29udGFpbmVyLm91dGVySFRNTCA9XG4nPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCIvL2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYlwiICcgK1xuJ2lkPVwiJyArIHBsdWdpbmlkICsgJ1wiIHdpZHRoPVwiJyArIHdpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcbic8cGFyYW0gbmFtZT1cIm1vdmllXCIgdmFsdWU9XCInICsgb3B0aW9ucy5wbHVnaW5QYXRoICsgb3B0aW9ucy5mbGFzaE5hbWUgKyAnP3g9JyArIChuZXcgRGF0ZSgpKSArICdcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiZmxhc2h2YXJzXCIgdmFsdWU9XCInICsgaW5pdFZhcnMuam9pbignJmFtcDsnKSArICdcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwicXVhbGl0eVwiIHZhbHVlPVwiaGlnaFwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJiZ2NvbG9yXCIgdmFsdWU9XCIjMDAwMDAwXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImFsbG93RnVsbFNjcmVlblwiIHZhbHVlPVwidHJ1ZVwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJzY2FsZVwiIHZhbHVlPVwiZGVmYXVsdFwiIC8+JyArIFxuJzwvb2JqZWN0Pic7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPVxuJzxlbWJlZCBpZD1cIicgKyBwbHVnaW5pZCArICdcIiBuYW1lPVwiJyArIHBsdWdpbmlkICsgJ1wiICcgK1xuJ3BsYXk9XCJ0cnVlXCIgJyArXG4nbG9vcD1cImZhbHNlXCIgJyArXG4ncXVhbGl0eT1cImhpZ2hcIiAnICtcbidiZ2NvbG9yPVwiIzAwMDAwMFwiICcgK1xuJ3dtb2RlPVwidHJhbnNwYXJlbnRcIiAnICtcbidhbGxvd1NjcmlwdEFjY2Vzcz1cImFsd2F5c1wiICcgK1xuJ2FsbG93RnVsbFNjcmVlbj1cInRydWVcIiAnICtcbid0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiBwbHVnaW5zcGFnZT1cIi8vd3d3Lm1hY3JvbWVkaWEuY29tL2dvL2dldGZsYXNocGxheWVyXCIgJyArXG4nc3JjPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuZmxhc2hOYW1lICsgJ1wiICcgK1xuJ2ZsYXNodmFycz1cIicgKyBpbml0VmFycy5qb2luKCcmJykgKyAnXCIgJyArXG4nd2lkdGg9XCInICsgd2lkdGggKyAnXCIgJyArXG4naGVpZ2h0PVwiJyArIGhlaWdodCArICdcIiAnICtcbidzY2FsZT1cImRlZmF1bHRcIicgKyBcbidjbGFzcz1cIm1lanMtc2hpbVwiPjwvZW1iZWQ+Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y2FzZSAneW91dHViZSc6XG5cdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdHZhciB2aWRlb0lkO1xuXHRcdFx0XHQvLyB5b3V0dS5iZSB1cmwgZnJvbSBzaGFyZSBidXR0b25cblx0XHRcdFx0aWYgKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZihcInlvdXR1LmJlXCIpICE9IC0xKSB7XG5cdFx0XHRcdFx0dmlkZW9JZCA9IHBsYXliYWNrLnVybC5zdWJzdHIocGxheWJhY2sudXJsLmxhc3RJbmRleE9mKCcvJykrMSk7XG5cdFx0XHRcdFx0aWYgKHZpZGVvSWQuaW5kZXhPZignPycpICE9IC0xKSB7XG5cdFx0XHRcdFx0XHR2aWRlb0lkID0gdmlkZW9JZC5zdWJzdHIoMCwgdmlkZW9JZC5pbmRleE9mKCc/JykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR2aWRlb0lkID0gcGxheWJhY2sudXJsLnN1YnN0cihwbGF5YmFjay51cmwubGFzdEluZGV4T2YoJz0nKSsxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR5b3V0dWJlU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0XHRjb250YWluZXI6IGNvbnRhaW5lcixcblx0XHRcdFx0XHRcdGNvbnRhaW5lcklkOiBjb250YWluZXIuaWQsXG5cdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQ6IHBsdWdpbk1lZGlhRWxlbWVudCxcblx0XHRcdFx0XHRcdHBsdWdpbklkOiBwbHVnaW5pZCxcblx0XHRcdFx0XHRcdHZpZGVvSWQ6IHZpZGVvSWQsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IGhlaWdodCxcblx0XHRcdFx0XHRcdHdpZHRoOiB3aWR0aFx0XG5cdFx0XHRcdFx0fTtcdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG1lanMuUGx1Z2luRGV0ZWN0b3IuaGFzUGx1Z2luVmVyc2lvbignZmxhc2gnLCBbMTAsMCwwXSkgKSB7XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUZsYXNoKHlvdXR1YmVTZXR0aW5ncyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmVucXVldWVJZnJhbWUoeW91dHViZVNldHRpbmdzKTtcdFx0XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XG5cdFx0XHQvLyBERU1PIENvZGUuIERvZXMgTk9UIHdvcmsuXG5cdFx0XHRjYXNlICd2aW1lbyc6XG5cdFx0XHRcdHZhciBwbGF5ZXJfaWQgPSBwbHVnaW5pZCArIFwiX3BsYXllclwiO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQudmltZW9pZCA9IHBsYXliYWNrLnVybC5zdWJzdHIocGxheWJhY2sudXJsLmxhc3RJbmRleE9mKCcvJykrMSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID0nPGlmcmFtZSBzcmM9XCIvL3BsYXllci52aW1lby5jb20vdmlkZW8vJyArIHBsdWdpbk1lZGlhRWxlbWVudC52aW1lb2lkICsgJz9hcGk9MSZwb3J0cmFpdD0wJmJ5bGluZT0wJnRpdGxlPTAmcGxheWVyX2lkPScgKyBwbGF5ZXJfaWQgKyAnXCIgd2lkdGg9XCInICsgd2lkdGggKydcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsnXCIgZnJhbWVib3JkZXI9XCIwXCIgY2xhc3M9XCJtZWpzLXNoaW1cIiBpZD1cIicgKyBwbGF5ZXJfaWQgKyAnXCIgd2Via2l0YWxsb3dmdWxsc2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+Jztcblx0XHRcdFx0aWYgKHR5cGVvZigkZikgPT0gJ2Z1bmN0aW9uJykgeyAvLyBmcm9vZ2Fsb29wIGF2YWlsYWJsZVxuXHRcdFx0XHRcdHZhciBwbGF5ZXIgPSAkZihjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cdFx0XHRcdFx0cGxheWVyLmFkZEV2ZW50KCdyZWFkeScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JC5leHRlbmQoIHBsYXllciwge1xuXHRcdFx0XHRcdFx0XHRwbGF5VmlkZW86IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICdwbGF5JyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0c3RvcFZpZGVvOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAndW5sb2FkJyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0cGF1c2VWaWRlbzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3BhdXNlJyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0c2Vla1RvOiBmdW5jdGlvbiggc2Vjb25kcyApIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAnc2Vla1RvJywgc2Vjb25kcyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0c2V0Vm9sdW1lOiBmdW5jdGlvbiggdm9sdW1lICkge1xuXHRcdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICdzZXRWb2x1bWUnLCB2b2x1bWUgKTtcblx0XHRcdFx0XHRcdFx0fSwgXG5cdFx0XHRcdFx0XHRcdHNldE11dGVkOiBmdW5jdGlvbiggbXV0ZWQgKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYoIG11dGVkICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxheWVyLmxhc3RWb2x1bWUgPSBwbGF5ZXIuYXBpKCAnZ2V0Vm9sdW1lJyApO1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NldFZvbHVtZScsIDAgKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NldFZvbHVtZScsIHBsYXllci5sYXN0Vm9sdW1lICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRkZWxldGUgcGxheWVyLmxhc3RWb2x1bWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsIGV2ZW50TmFtZSwgZSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IGV2ZW50TmFtZSxcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHBsdWdpbk1lZGlhRWxlbWVudFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRpZiAoZXZlbnROYW1lID09ICd0aW1ldXBkYXRlJykge1xuXHRcdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IGUuc2Vjb25kcztcblx0XHRcdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZHVyYXRpb24gPSBvYmouZHVyYXRpb24gPSBlLmR1cmF0aW9uO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kaXNwYXRjaEV2ZW50KG9iai50eXBlLCBvYmopO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGxheWluZycpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncGF1c2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgnZmluaXNoJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnZW5kZWQnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXlQcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICd0aW1ldXBkYXRlJywgZSk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQgPSBjb250YWluZXI7XG5cdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGxheWVyO1xuXG5cdFx0XHRcdFx0XHQvLyBpbml0IG1lanNcblx0XHRcdFx0XHRcdG1lanMuTWVkaWFQbHVnaW5CcmlkZ2UuaW5pdFBsdWdpbihwbHVnaW5pZCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiWW91IG5lZWQgdG8gaW5jbHVkZSBmcm9vZ2Fsb29wIGZvciB2aW1lbyB0byB3b3JrXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1x0XHRcdFxuXHRcdH1cblx0XHQvLyBoaWRlIG9yaWdpbmFsIGVsZW1lbnRcblx0XHRodG1sTWVkaWFFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0Ly8gcHJldmVudCBicm93c2VyIGZyb20gYXV0b3BsYXlpbmcgd2hlbiB1c2luZyBhIHBsdWdpblxuXHRcdGh0bWxNZWRpYUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhdXRvcGxheScpO1xuXG5cdFx0Ly8gRllJOiBvcHRpb25zLnN1Y2Nlc3Mgd2lsbCBiZSBmaXJlZCBieSB0aGUgTWVkaWFQbHVnaW5CcmlkZ2Vcblx0XHRcblx0XHRyZXR1cm4gcGx1Z2luTWVkaWFFbGVtZW50O1xuXHR9LFxuXG5cdHVwZGF0ZU5hdGl2ZTogZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIGF1dG9wbGF5LCBwcmVsb2FkKSB7XG5cdFx0XG5cdFx0dmFyIGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0bTtcblx0XHRcblx0XHRcblx0XHQvLyBhZGQgbWV0aG9kcyB0byB2aWRlbyBvYmplY3QgdG8gYnJpbmcgaXQgaW50byBwYXJpdHkgd2l0aCBGbGFzaCBPYmplY3Rcblx0XHRmb3IgKG0gaW4gbWVqcy5IdG1sTWVkaWFFbGVtZW50KSB7XG5cdFx0XHRodG1sTWVkaWFFbGVtZW50W21dID0gbWVqcy5IdG1sTWVkaWFFbGVtZW50W21dO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0Q2hyb21lIG5vdyBzdXBwb3J0cyBwcmVsb2FkPVwibm9uZVwiXG5cdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0Nocm9tZSkge1xuXHRcdFxuXHRcdFx0Ly8gc3BlY2lhbCBjYXNlIHRvIGVuZm9yY2UgcHJlbG9hZCBhdHRyaWJ1dGUgKENocm9tZSBkb2Vzbid0IHJlc3BlY3QgdGhpcylcblx0XHRcdGlmIChwcmVsb2FkID09PSAnbm9uZScgJiYgIWF1dG9wbGF5KSB7XG5cdFx0XHRcblx0XHRcdFx0Ly8gZm9yY2VzIHRoZSBicm93c2VyIHRvIHN0b3AgbG9hZGluZyAobm90ZTogZmFpbHMgaW4gSUU5KVxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9ICcnO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmxvYWQoKTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5jYW5jZWxlZFByZWxvYWQgPSB0cnVlO1xuXG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKGh0bWxNZWRpYUVsZW1lbnQuY2FuY2VsZWRQcmVsb2FkKSB7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHBsYXliYWNrLnVybDtcblx0XHRcdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5wbGF5KCk7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhbmNlbGVkUHJlbG9hZCA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0Ly8gZm9yIHNvbWUgcmVhc29uIENocm9tZSBmb3JnZXRzIGhvdyB0byBhdXRvcGxheSBzb21ldGltZXMuXG5cdFx0XHR9IGVsc2UgaWYgKGF1dG9wbGF5KSB7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBsYXkoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ki9cblxuXHRcdC8vIGZpcmUgc3VjY2VzcyBjb2RlXG5cdFx0b3B0aW9ucy5zdWNjZXNzKGh0bWxNZWRpYUVsZW1lbnQsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdFxuXHRcdHJldHVybiBodG1sTWVkaWFFbGVtZW50O1xuXHR9XG59O1xuXG4vKlxuIC0gdGVzdCBvbiBJRSAob2JqZWN0IHZzLiBlbWJlZClcbiAtIGRldGVybWluZSB3aGVuIHRvIHVzZSBpZnJhbWUgKEZpcmVmb3gsIFNhZmFyaSwgTW9iaWxlKSB2cy4gRmxhc2ggKENocm9tZSwgSUUpXG4gLSBmdWxsc2NyZWVuP1xuKi9cblxuLy8gWW91VHViZSBGbGFzaCBhbmQgSWZyYW1lIEFQSVxubWVqcy5Zb3VUdWJlQXBpID0ge1xuXHRpc0lmcmFtZVN0YXJ0ZWQ6IGZhbHNlLFxuXHRpc0lmcmFtZUxvYWRlZDogZmFsc2UsXG5cdGxvYWRJZnJhbWVBcGk6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5pc0lmcmFtZVN0YXJ0ZWQpIHtcblx0XHRcdHZhciB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0XHRcdHRhZy5zcmMgPSBcIi8vd3d3LnlvdXR1YmUuY29tL3BsYXllcl9hcGlcIjtcblx0XHRcdHZhciBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcblx0XHRcdGZpcnN0U2NyaXB0VGFnLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhZywgZmlyc3RTY3JpcHRUYWcpO1xuXHRcdFx0dGhpcy5pc0lmcmFtZVN0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0fSxcblx0aWZyYW1lUXVldWU6IFtdLFxuXHRlbnF1ZXVlSWZyYW1lOiBmdW5jdGlvbih5dCkge1xuXHRcdFxuXHRcdGlmICh0aGlzLmlzTG9hZGVkKSB7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZSh5dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9hZElmcmFtZUFwaSgpO1xuXHRcdFx0dGhpcy5pZnJhbWVRdWV1ZS5wdXNoKHl0KTtcblx0XHR9XG5cdH0sXG5cdGNyZWF0ZUlmcmFtZTogZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0XHRcblx0XHR2YXJcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSBzZXR0aW5ncy5wbHVnaW5NZWRpYUVsZW1lbnQsXHRcblx0XHRwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKHNldHRpbmdzLmNvbnRhaW5lcklkLCB7XG5cdFx0XHRoZWlnaHQ6IHNldHRpbmdzLmhlaWdodCxcblx0XHRcdHdpZHRoOiBzZXR0aW5ncy53aWR0aCxcblx0XHRcdHZpZGVvSWQ6IHNldHRpbmdzLnZpZGVvSWQsXG5cdFx0XHRwbGF5ZXJWYXJzOiB7Y29udHJvbHM6MH0sXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdFx0J29uUmVhZHknOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBob29rIHVwIGlmcmFtZSBvYmplY3QgdG8gTUVqc1xuXHRcdFx0XHRcdHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBwbGF5ZXI7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gaW5pdCBtZWpzXG5cdFx0XHRcdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS5pbml0UGx1Z2luKHNldHRpbmdzLnBsdWdpbklkKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBjcmVhdGUgdGltZXJcblx0XHRcdFx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3RpbWV1cGRhdGUnKTtcblx0XHRcdFx0XHR9LCAyNTApO1x0XHRcdFx0XHRcblx0XHRcdFx0fSxcblx0XHRcdFx0J29uU3RhdGVDaGFuZ2UnOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUuZGF0YSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdFxuXHRjcmVhdGVFdmVudDogZnVuY3Rpb24gKHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCBldmVudE5hbWUpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0dHlwZTogZXZlbnROYW1lLFxuXHRcdFx0dGFyZ2V0OiBwbHVnaW5NZWRpYUVsZW1lbnRcblx0XHR9O1xuXG5cdFx0aWYgKHBsYXllciAmJiBwbGF5ZXIuZ2V0RHVyYXRpb24pIHtcblx0XHRcdFxuXHRcdFx0Ly8gdGltZSBcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmR1cmF0aW9uID0gb2JqLmR1cmF0aW9uID0gcGxheWVyLmdldER1cmF0aW9uKCk7XG5cdFx0XHRcblx0XHRcdC8vIHN0YXRlXG5cdFx0XHRvYmoucGF1c2VkID0gcGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZDtcblx0XHRcdG9iai5lbmRlZCA9IHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZDtcdFx0XHRcblx0XHRcdFxuXHRcdFx0Ly8gc291bmRcblx0XHRcdG9iai5tdXRlZCA9IHBsYXllci5pc011dGVkKCk7XG5cdFx0XHRvYmoudm9sdW1lID0gcGxheWVyLmdldFZvbHVtZSgpIC8gMTAwO1xuXHRcdFx0XG5cdFx0XHQvLyBwcm9ncmVzc1xuXHRcdFx0b2JqLmJ5dGVzVG90YWwgPSBwbGF5ZXIuZ2V0VmlkZW9CeXRlc1RvdGFsKCk7XG5cdFx0XHRvYmouYnVmZmVyZWRCeXRlcyA9IHBsYXllci5nZXRWaWRlb0J5dGVzTG9hZGVkKCk7XG5cdFx0XHRcblx0XHRcdC8vIGZha2UgdGhlIFczQyBidWZmZXJlZCBUaW1lUmFuZ2Vcblx0XHRcdHZhciBidWZmZXJlZFRpbWUgPSBvYmouYnVmZmVyZWRCeXRlcyAvIG9iai5ieXRlc1RvdGFsICogb2JqLmR1cmF0aW9uO1xuXHRcdFx0XG5cdFx0XHRvYmoudGFyZ2V0LmJ1ZmZlcmVkID0gb2JqLmJ1ZmZlcmVkID0ge1xuXHRcdFx0XHRzdGFydDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5kOiBmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gYnVmZmVyZWRUaW1lO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRsZW5ndGg6IDFcblx0XHRcdH07XG5cblx0XHR9XG5cdFx0XG5cdFx0Ly8gc2VuZCBldmVudCB1cCB0aGUgY2hhaW5cblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZGlzcGF0Y2hFdmVudChvYmoudHlwZSwgb2JqKTtcblx0fSxcdFxuXHRcblx0aUZyYW1lUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuaXNMb2FkZWQgPSB0cnVlO1xuXHRcdHRoaXMuaXNJZnJhbWVMb2FkZWQgPSB0cnVlO1xuXHRcdFxuXHRcdHdoaWxlICh0aGlzLmlmcmFtZVF1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuaWZyYW1lUXVldWUucG9wKCk7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZShzZXR0aW5ncyk7XG5cdFx0fVx0XG5cdH0sXG5cdFxuXHQvLyBGTEFTSCFcblx0Zmxhc2hQbGF5ZXJzOiB7fSxcblx0Y3JlYXRlRmxhc2g6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0XG5cdFx0dGhpcy5mbGFzaFBsYXllcnNbc2V0dGluZ3MucGx1Z2luSWRdID0gc2V0dGluZ3M7XG5cdFx0XG5cdFx0Lypcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCIvL3d3dy55b3V0dWJlLmNvbS9hcGlwbGF5ZXI/ZW5hYmxlanNhcGk9MSZhbXA7cGxheWVyYXBpaWQ9JyArIHNldHRpbmdzLnBsdWdpbklkICArICcmYW1wO3ZlcnNpb249MyZhbXA7YXV0b3BsYXk9MCZhbXA7Y29udHJvbHM9MCZhbXA7bW9kZXN0YnJhbmRpbmc9MSZsb29wPTBcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0Ki9cblxuXHRcdHZhciBzcGVjaWFsSUVDb250YWluZXIsXG5cdFx0XHR5b3V0dWJlVXJsID0gJy8vd3d3LnlvdXR1YmUuY29tL2FwaXBsYXllcj9lbmFibGVqc2FwaT0xJmFtcDtwbGF5ZXJhcGlpZD0nICsgc2V0dGluZ3MucGx1Z2luSWQgICsgJyZhbXA7dmVyc2lvbj0zJmFtcDthdXRvcGxheT0wJmFtcDtjb250cm9scz0wJmFtcDttb2Rlc3RicmFuZGluZz0xJmxvb3A9MCc7XG5cdFx0XHRcblx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzSUUpIHtcblx0XHRcdFxuXHRcdFx0c3BlY2lhbElFQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRzZXR0aW5ncy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc3BlY2lhbElFQ29udGFpbmVyKTtcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lci5vdXRlckhUTUwgPSAnPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCIvL2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYlwiICcgK1xuJ2lkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIHdpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcblx0JzxwYXJhbSBuYW1lPVwibW92aWVcIiB2YWx1ZT1cIicgKyB5b3V0dWJlVXJsICsgJ1wiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cImFsbG93U2NyaXB0QWNjZXNzXCIgdmFsdWU9XCJhbHdheXNcIiAvPicgK1xuXHQnPHBhcmFtIG5hbWU9XCJhbGxvd0Z1bGxTY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzwvb2JqZWN0Pic7XG5cdFx0fSBlbHNlIHtcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCInICsgeW91dHViZVVybCArICdcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0fVx0XHRcblx0XHRcblx0fSxcblx0XG5cdGZsYXNoUmVhZHk6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyXG5cdFx0XHRzZXR0aW5ncyA9IHRoaXMuZmxhc2hQbGF5ZXJzW2lkXSxcblx0XHRcdHBsYXllciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSxcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudCA9IHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudDtcblx0XHRcblx0XHQvLyBob29rIHVwIGFuZCByZXR1cm4gdG8gTWVkaWFFTGVtZW50UGxheWVyLnN1Y2Nlc3NcdFxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudCA9IHBsYXllcjtcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLmluaXRQbHVnaW4oaWQpO1xuXHRcdFxuXHRcdC8vIGxvYWQgdGhlIHlvdXR1YmUgdmlkZW9cblx0XHRwbGF5ZXIuY3VlVmlkZW9CeUlkKHNldHRpbmdzLnZpZGVvSWQpO1xuXHRcdFxuXHRcdHZhciBjYWxsYmFja05hbWUgPSBzZXR0aW5ncy5jb250YWluZXJJZCArICdfY2FsbGJhY2snO1xuXHRcdFxuXHRcdHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZSkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUsIHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50KTtcblx0XHR9XG5cdFx0XG5cdFx0cGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ29uU3RhdGVDaGFuZ2UnLCBjYWxsYmFja05hbWUpO1xuXHRcdFxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAndGltZXVwZGF0ZScpO1xuXHRcdH0sIDI1MCk7XG5cdFx0XG5cdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnY2FucGxheScpO1xuXHR9LFxuXHRcblx0aGFuZGxlU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKHlvdVR1YmVTdGF0ZSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpIHtcblx0XHRzd2l0Y2ggKHlvdVR1YmVTdGF0ZSkge1xuXHRcdFx0Y2FzZSAtMTogLy8gbm90IHN0YXJ0ZWRcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IHRydWU7XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZCA9IHRydWU7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ2xvYWRlZG1ldGFkYXRhJyk7XG5cdFx0XHRcdC8vY3JlYXRlWW91VHViZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnbG9hZGVkZGF0YScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSB0cnVlO1xuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdlbmRlZCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3BsYXlpbmcnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzogLy8gYnVmZmVyaW5nXG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3Byb2dyZXNzJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHQvLyBjdWVkP1xuXHRcdFx0XHRicmVhaztcdFx0XHRcdFx0XHRcblx0XHRcdFxuXHRcdH1cdFx0XHRcblx0XHRcblx0fVxufVxuLy8gSUZSQU1FXG5mdW5jdGlvbiBvbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmlGcmFtZVJlYWR5KCk7XG59XG4vLyBGTEFTSFxuZnVuY3Rpb24gb25Zb3VUdWJlUGxheWVyUmVhZHkoaWQpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmZsYXNoUmVhZHkoaWQpO1xufVxuXG53aW5kb3cubWVqcyA9IG1lanM7XG53aW5kb3cuTWVkaWFFbGVtZW50ID0gbWVqcy5NZWRpYUVsZW1lbnQ7XG5cbi8qXG4gKiBBZGRzIEludGVybmF0aW9uYWxpemF0aW9uIGFuZCBsb2NhbGl6YXRpb24gdG8gbWVkaWFlbGVtZW50LlxuICpcbiAqIFRoaXMgZmlsZSBkb2VzIG5vdCBjb250YWluIHRyYW5zbGF0aW9ucywgeW91IGhhdmUgdG8gYWRkIHRoZW0gbWFudWFsbHkuXG4gKiBUaGUgc2NoZW1hIGlzIGFsd2F5cyB0aGUgc2FtZTogbWUtaTE4bi1sb2NhbGUtW0lFVEYtbGFuZ3VhZ2UtdGFnXS5qc1xuICpcbiAqIEV4YW1wbGVzIGFyZSBwcm92aWRlZCBib3RoIGZvciBnZXJtYW4gYW5kIGNoaW5lc2UgdHJhbnNsYXRpb24uXG4gKlxuICpcbiAqIFdoYXQgaXMgdGhlIGNvbmNlcHQgYmV5b25kIGkxOG4/XG4gKiAgIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSW50ZXJuYXRpb25hbGl6YXRpb25fYW5kX2xvY2FsaXphdGlvblxuICpcbiAqIFdoYXQgbGFuZ2NvZGUgc2hvdWxkIGkgdXNlP1xuICogICBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lFVEZfbGFuZ3VhZ2VfdGFnXG4gKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM1NjQ2XG4gKlxuICpcbiAqIExpY2Vuc2U/XG4gKlxuICogICBUaGUgaTE4biBmaWxlIHVzZXMgbWV0aG9kcyBmcm9tIHRoZSBEcnVwYWwgcHJvamVjdCAoZHJ1cGFsLmpzKTpcbiAqICAgICAtIGkxOG4ubWV0aG9kcy50KCkgKG1vZGlmaWVkKVxuICogICAgIC0gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oKSAoZnVsbCBjb3B5KVxuICpcbiAqICAgVGhlIERydXBhbCBwcm9qZWN0IGlzIChsaWtlIG1lZGlhZWxlbWVudGpzKSBsaWNlbnNlZCB1bmRlciBHUEx2Mi5cbiAqICAgIC0gaHR0cDovL2RydXBhbC5vcmcvbGljZW5zaW5nL2ZhcS8jcTFcbiAqICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2pvaG5keWVyL21lZGlhZWxlbWVudFxuICogICAgLSBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvb2xkLWxpY2Vuc2VzL2dwbC0yLjAuaHRtbFxuICpcbiAqXG4gKiBAYXV0aG9yXG4gKiAgIFRpbSBMYXR6IChsYXR6LnRpbUBnbWFpbC5jb20pXG4gKlxuICpcbiAqIEBwYXJhbXNcbiAqICAtIGNvbnRleHQgLSBkb2N1bWVudCwgaWZyYW1lIC4uXG4gKiAgLSBleHBvcnRzIC0gQ29tbW9uSlMsIHdpbmRvdyAuLlxuICpcbiAqL1xuOyhmdW5jdGlvbihjb250ZXh0LCBleHBvcnRzLCB1bmRlZmluZWQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBpMThuID0ge1xuICAgICAgICBcImxvY2FsZVwiOiB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgcHJldmlvdXMgdmFsdWVzIGFyZW4ndCBvdmVyd3JpdHRlbi5cbiAgICAgICAgICAgIFwibGFuZ3VhZ2VcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5sYW5ndWFnZSkgfHwgJycsXG4gICAgICAgICAgICBcInN0cmluZ3NcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5zdHJpbmdzKSB8fCB7fVxuICAgICAgICB9LFxuICAgICAgICBcImlldGZfbGFuZ19yZWdleFwiIDogL14oeFxcLSk/W2Etel17Mix9KFxcLVxcd3syLH0pPyhcXC1cXHd7Mix9KT8kLyxcbiAgICAgICAgXCJtZXRob2RzXCIgOiB7fVxuICAgIH07XG4vLyBzdGFydCBpMThuXG5cblxuICAgIC8qKlxuICAgICAqIEdldCBsYW5ndWFnZSwgZmFsbGJhY2sgdG8gYnJvd3NlcidzIGxhbmd1YWdlIGlmIGVtcHR5XG4gICAgICpcbiAgICAgKiBJRVRGOiBSRkMgNTY0NiwgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU2NDZcbiAgICAgKiBFeGFtcGxlczogZW4sIHpoLUNOLCBjbW4tSGFucy1DTiwgc3ItTGF0bi1SUywgZXMtNDE5LCB4LXByaXZhdGVcbiAgICAgKi9cbiAgICBpMThuLmdldExhbmd1YWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFuZ3VhZ2UgPSBpMThuLmxvY2FsZS5sYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJMYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLmxhbmd1YWdlO1xuICAgICAgICByZXR1cm4gaTE4bi5pZXRmX2xhbmdfcmVnZXguZXhlYyhsYW5ndWFnZSkgPyBsYW5ndWFnZSA6IG51bGw7XG5cbiAgICAgICAgLy8oV0FTOiBjb252ZXJ0IHRvIGlzbyA2MzktMSAoMi1sZXR0ZXJzLCBsb3dlciBjYXNlKSlcbiAgICAgICAgLy9yZXR1cm4gbGFuZ3VhZ2Uuc3Vic3RyKDAsIDIpLnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIC8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbiAgICBpZiAoIHR5cGVvZiBtZWpzTDEwbiAhPSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaTE4bi5sb2NhbGUubGFuZ3VhZ2UgPSBtZWpzTDEwbi5sYW5ndWFnZTtcbiAgICB9XG5cblxuXG4gICAgLyoqXG4gICAgICogRW5jb2RlIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBhIHBsYWluLXRleHQgc3RyaW5nIGZvciBkaXNwbGF5IGFzIEhUTUwuXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBjaGFyYWN0ZXIsIHJlZ2V4LFxuICAgICAgICByZXBsYWNlID0ge1xuICAgICAgICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICAgICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICAgICAgICc+JzogJyZndDsnXG4gICAgICAgIH07XG4gICAgICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgICAgICBmb3IgKGNoYXJhY3RlciBpbiByZXBsYWNlKSB7XG4gICAgICAgICAgICBpZiAocmVwbGFjZS5oYXNPd25Qcm9wZXJ0eShjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKGNoYXJhY3RlciwgJ2cnKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShyZWdleCwgcmVwbGFjZVtjaGFyYWN0ZXJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGUgc3RyaW5ncyB0byB0aGUgcGFnZSBsYW5ndWFnZSBvciBhIGdpdmVuIGxhbmd1YWdlLlxuICAgICAqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyXG4gICAgICogICBBIHN0cmluZyBjb250YWluaW5nIHRoZSBFbmdsaXNoIHN0cmluZyB0byB0cmFuc2xhdGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAgLSAnY29udGV4dCcgKGRlZmF1bHRzIHRvIHRoZSBkZWZhdWx0IGNvbnRleHQpOiBUaGUgY29udGV4dCB0aGUgc291cmNlIHN0cmluZ1xuICAgICAqICAgICBiZWxvbmdzIHRvLlxuICAgICAqXG4gICAgICogQHJldHVyblxuICAgICAqICAgVGhlIHRyYW5zbGF0ZWQgc3RyaW5nLCBlc2NhcGVkIHZpYSBpMThuLm1ldGhvZHMuY2hlY2tQbGFpbigpXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLnQgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIGxvY2FsaXplZCB2ZXJzaW9uIG9mIHRoZSBzdHJpbmcuXG4gICAgICAgIGlmIChpMThuLmxvY2FsZS5zdHJpbmdzICYmIGkxOG4ubG9jYWxlLnN0cmluZ3Nbb3B0aW9ucy5jb250ZXh0XSAmJiBpMThuLmxvY2FsZS5zdHJpbmdzW29wdGlvbnMuY29udGV4dF1bc3RyXSkge1xuICAgICAgICAgICAgc3RyID0gaTE4bi5sb2NhbGUuc3RyaW5nc1tvcHRpb25zLmNvbnRleHRdW3N0cl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oc3RyKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGVyIGZvciBpMThuLm1ldGhvZHMudCgpXG4gICAgICpcbiAgICAgKiBAc2VlIGkxOG4ubWV0aG9kcy50KClcbiAgICAgKiBAdGhyb3dzIEludmFsaWRBcmd1bWVudEV4Y2VwdGlvblxuICAgICAqL1xuICAgIGkxOG4udCA9IGZ1bmN0aW9uKHN0ciwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyAmJiBzdHIubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAvLyBjaGVjayBldmVyeSB0aW1lIGR1ZSBsYW5ndWFnZSBjYW4gY2hhbmdlIGZvclxuICAgICAgICAgICAgLy8gZGlmZmVyZW50IHJlYXNvbnMgKHRyYW5zbGF0aW9uLCBsYW5nIHN3aXRjaGVyIC4uKVxuICAgICAgICAgICAgdmFyIGxhbmd1YWdlID0gaTE4bi5nZXRMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgXCJjb250ZXh0XCIgOiBsYW5ndWFnZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGkxOG4ubWV0aG9kcy50KHN0ciwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyB7XG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgOiAnSW52YWxpZEFyZ3VtZW50RXhjZXB0aW9uJyxcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIiA6ICdGaXJzdCBhcmd1bWVudCBpcyBlaXRoZXIgbm90IGEgc3RyaW5nIG9yIGVtcHR5LidcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4vLyBlbmQgaTE4blxuICAgIGV4cG9ydHMuaTE4biA9IGkxOG47XG59KGRvY3VtZW50LCBtZWpzKSk7XG5cbi8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbjsoZnVuY3Rpb24oZXhwb3J0cywgdW5kZWZpbmVkKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICggdHlwZW9mIG1lanNMMTBuICE9ICd1bmRlZmluZWQnICkge1xuICAgICAgICBleHBvcnRzW21lanNMMTBuLmxhbmd1YWdlXSA9IG1lanNMMTBuLnN0cmluZ3M7XG4gICAgfVxuXG59KG1lanMuaTE4bi5sb2NhbGUuc3RyaW5ncykpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkL21lZGlhZWxlbWVudC5qc1wiLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24oYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldO1xuXG4gIGkgKz0gZDtcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgcyA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IGVMZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBlID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gbUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzO1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICBlID0gZSAtIGVCaWFzO1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pO1xufTtcblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAdHlwZSB7VGFifVxuICovXG52YXIgVGFiID0gcmVxdWlyZSgnLi90YWInKTtcbi8qKlxuICogQHR5cGUge0NoYXB0ZXJzfVxuICovXG52YXIgQ2hhcHRlcnMgPSByZXF1aXJlKCcuL21vZHVsZXMvY2hhcHRlcicpO1xuXG5mdW5jdGlvbiBjcmVhdGVUaW1lQ29udHJvbHMoKSB7XG4gIHJldHVybiAkKCc8dWwgY2xhc3M9XCJ0aW1lY29udHJvbGJhclwiPjwvdWw+Jyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgcmV0dXJuICQoJzxkaXYgY2xhc3M9XCJjb250cm9sYmFyIGJhclwiPjwvZGl2PicpO1xufVxuXG5mdW5jdGlvbiBwbGF5ZXJTdGFydGVkKHBsYXllcikge1xuICByZXR1cm4gKCh0eXBlb2YgcGxheWVyLmN1cnJlbnRUaW1lID09PSAnbnVtYmVyJykgJiYgKHBsYXllci5jdXJyZW50VGltZSA+IDApKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29tYmluZWRDYWxsYmFjayhjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gKGV2dCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ2NvbnRyb2xidXR0b24gY2xpY2tlZCcsIGV2dCk7XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAncGxheWVyIHN0YXJ0ZWQ/JywgcGxheWVyU3RhcnRlZCh0aGlzLnBsYXllcikpO1xuICAgIGlmICghcGxheWVyU3RhcnRlZCh0aGlzLnBsYXllcikpIHtcbiAgICAgIHRoaXMucGxheWVyLnBsYXkoKTtcbiAgICB9XG4gICAgdmFyIGJvdW5kQ2FsbEJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgIGJvdW5kQ2FsbEJhY2soKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBpbnN0YW50aWF0ZSBuZXcgY29udHJvbHMgZWxlbWVudFxuICogQHBhcmFtIHtqUXVlcnl8SFRNTEVsZW1lbnR9IHBsYXllciBQbGF5ZXIgZWxlbWVudCByZWZlcmVuY2VcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lIFRpbWVsaW5lIG9iamVjdCBmb3IgdGhpcyBwbGF5ZXJcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBDb250cm9scyAocGxheWVyLCB0aW1lbGluZSkge1xuICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lO1xuICB0aGlzLmJveCA9IGNyZWF0ZUJveCgpO1xuICB0aGlzLnRpbWVDb250cm9sRWxlbWVudCA9IGNyZWF0ZVRpbWVDb250cm9scygpO1xuICB0aGlzLmJveC5hcHBlbmQodGhpcy50aW1lQ29udHJvbEVsZW1lbnQpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSB0aW1lIGNvbnRyb2wgYnV0dG9ucyBhbmQgYWRkIHRoZW0gdG8gdGltZUNvbnRyb2xFbGVtZW50XG4gKiBAcGFyYW0ge251bGx8Q2hhcHRlcnN9IGNoYXB0ZXJNb2R1bGUgd2hlbiBwcmVzZW50IHdpbGwgYWRkIG5leHQgYW5kIHByZXZpb3VzIGNoYXB0ZXIgY29udHJvbHNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5Db250cm9scy5wcm90b3R5cGUuY3JlYXRlVGltZUNvbnRyb2xzID0gZnVuY3Rpb24gKGNoYXB0ZXJNb2R1bGUpIHtcbiAgdmFyIGhhc0NoYXB0ZXJzID0gKGNoYXB0ZXJNb2R1bGUgaW5zdGFuY2VvZiBDaGFwdGVycyk7XG4gIGlmICghaGFzQ2hhcHRlcnMpIHtcbiAgICBjb25zb2xlLmluZm8oJ0NvbnRyb2xzJywgJ2NyZWF0ZVRpbWVDb250cm9scycsICdubyBjaGFwdGVyVGFiIGZvdW5kJyk7XG4gIH1cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1wcmV2aW91cy1jaGFwdGVyJywgJ0p1bXAgYmFja3dhcmQgdG8gcHJldmlvdXMgY2hhcHRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhY3RpdmVDaGFwdGVyID0gY2hhcHRlck1vZHVsZS5nZXRBY3RpdmVDaGFwdGVyKCk7XG4gICAgICBpZiAodGhpcy50aW1lbGluZS5nZXRUaW1lKCkgPiBhY3RpdmVDaGFwdGVyLnN0YXJ0ICsgMTApIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnYmFjayB0byBjaGFwdGVyIHN0YXJ0JywgY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlciwgJ2Zyb20nLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgICAgIHJldHVybiBjaGFwdGVyTW9kdWxlLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnYmFjayB0byBwcmV2aW91cyBjaGFwdGVyJywgY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlcik7XG4gICAgICByZXR1cm4gY2hhcHRlck1vZHVsZS5wcmV2aW91cygpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1iYWNrLTMwJywgJ1Jld2luZCAzMCBzZWNvbmRzJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ3Jld2luZCBiZWZvcmUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgdGhpcy50aW1lbGluZS5zZXRUaW1lKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpIC0gMzApO1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ3Jld2luZCBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgfSk7XG5cbiAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1mb3J3YXJkLTMwJywgJ0Zhc3QgZm9yd2FyZCAzMCBzZWNvbmRzJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ2Zmd2QgYmVmb3JlJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgIHRoaXMudGltZWxpbmUuc2V0VGltZSh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSArIDMwKTtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdmZndkIGFmdGVyJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICB9KTtcblxuICBpZiAoaGFzQ2hhcHRlcnMpIHtcbiAgICB0aGlzLmNyZWF0ZUJ1dHRvbigncHdwLWNvbnRyb2xzLW5leHQtY2hhcHRlcicsICdKdW1wIHRvIG5leHQgY2hhcHRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ25leHQgQ2hhcHRlciBiZWZvcmUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgICBjaGFwdGVyTW9kdWxlLm5leHQoKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ25leHQgQ2hhcHRlciBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgICB9KTtcbiAgfVxufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmNyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbihpY29uLCB0aXRsZSwgY2FsbGJhY2spIHtcbiAgdmFyIGJ1dHRvbiA9ICQoJzxsaT48YSBocmVmPVwiI1wiIGNsYXNzPVwiYnV0dG9uIGJ1dHRvbi1jb250cm9sXCIgdGl0bGU9XCInICsgdGl0bGUgKyAnXCI+JyArXG4gICAgJzxpIGNsYXNzPVwiaWNvbiAnICsgaWNvbiArICdcIj48L2k+PC9hPjwvbGk+Jyk7XG4gIHRoaXMudGltZUNvbnRyb2xFbGVtZW50LmFwcGVuZChidXR0b24pO1xuICB2YXIgY29tYmluZWRDYWxsYmFjayA9IGdldENvbWJpbmVkQ2FsbGJhY2soY2FsbGJhY2spO1xuICBidXR0b24ub24oJ2NsaWNrJywgY29tYmluZWRDYWxsYmFjay5iaW5kKHRoaXMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29udHJvbHMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbi8vIGV2ZXJ5dGhpbmcgZm9yIGFuIGVtYmVkZGVkIHBsYXllclxudmFyXG4gIHBsYXllcnMgPSBbXSxcbiAgbGFzdEhlaWdodCA9IDAsXG4gICRib2R5O1xuXG5mdW5jdGlvbiBwb3N0VG9PcGVuZXIob2JqKSB7XG4gIGNvbnNvbGUuZGVidWcoJ3Bvc3RUb09wZW5lcicsIG9iaik7XG4gIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2Uob2JqLCAnKicpO1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlTGlzdGVuZXIgKGV2ZW50KSB7XG4gIHZhciBvcmlnID0gZXZlbnQub3JpZ2luYWxFdmVudDtcblxuICBpZiAob3JpZy5kYXRhLmFjdGlvbiA9PT0gJ3BhdXNlJykge1xuICAgIHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3YWl0Rm9yTWV0YWRhdGEgKGNhbGxiYWNrKSB7XG4gIGZ1bmN0aW9uIG1ldGFEYXRhTGlzdGVuZXIgKGV2ZW50KSB7XG4gICAgdmFyIG9yaWcgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuICAgIGlmIChvcmlnLmRhdGEucGxheWVyT3B0aW9ucykge1xuICAgICAgY2FsbGJhY2sob3JpZy5kYXRhLnBsYXllck9wdGlvbnMpO1xuICAgIH1cbiAgfVxuICAkKHdpbmRvdykub24oJ21lc3NhZ2UnLCBtZXRhRGF0YUxpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gcG9sbEhlaWdodCgpIHtcbiAgdmFyIG5ld0hlaWdodCA9ICRib2R5LmhlaWdodCgpO1xuICBpZiAobGFzdEhlaWdodCAhPT0gbmV3SGVpZ2h0KSB7XG4gICAgcG9zdFRvT3BlbmVyKHtcbiAgICAgIGFjdGlvbjogJ3Jlc2l6ZScsXG4gICAgICBhcmc6IG5ld0hlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgbGFzdEhlaWdodCA9IG5ld0hlaWdodDtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGxIZWlnaHQsIGRvY3VtZW50LmJvZHkpO1xufVxuXG4vKipcbiAqIGluaXRpYWxpemUgZW1iZWQgZnVuY3Rpb25hbGl0eVxuICogQHBhcmFtIHtmdW5jdGlvbn0gJCBqUXVlcnlcbiAqIEBwYXJhbSB7QXJyYXl9IHBsYXllckxpc3QgYWxsIHBsYXllcnNpbiB0aGlzIHdpbmRvd1xuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluaXQoJCwgcGxheWVyTGlzdCkge1xuICBwbGF5ZXJzID0gcGxheWVyTGlzdDtcbiAgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpO1xuICAkKHdpbmRvdykub24oJ21lc3NhZ2UnLCBtZXNzYWdlTGlzdGVuZXIpO1xuICBwb2xsSGVpZ2h0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwb3N0VG9PcGVuZXI6IHBvc3RUb09wZW5lcixcbiAgd2FpdEZvck1ldGFkYXRhOiB3YWl0Rm9yTWV0YWRhdGEsXG4gIGluaXQ6IGluaXRcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW1iZWQuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiohXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBQb2Rsb3ZlIFdlYiBQbGF5ZXIgdjMuMC4wLWFscGhhXG4gKiBMaWNlbnNlZCB1bmRlciBUaGUgQlNEIDItQ2xhdXNlIExpY2Vuc2VcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMi1DbGF1c2VcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAoYykgMjAxNCwgR2Vycml0IHZhbiBBYWtlbiAoaHR0cHM6Ly9naXRodWIuY29tL2dlcnJpdHZhbmFha2VuLyksIFNpbW9uIFdhbGRoZXJyIChodHRwczovL2dpdGh1Yi5jb20vc2ltb253YWxkaGVyci8pLCBGcmFuayBIYXNlIChodHRwczovL2dpdGh1Yi5jb20vS2FtYmZoYXNlLyksIEVyaWMgVGV1YmVydCAoaHR0cHM6Ly9naXRodWIuY29tL2V0ZXViZXJ0LykgYW5kIG90aGVycyAoaHR0cHM6Ly9naXRodWIuY29tL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL2NvbnRyaWJ1dG9ycylcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICpcbiAqIC0gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogLSBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUYWJSZWdpc3RyeSA9IHJlcXVpcmUoJy4vdGFicmVnaXN0cnknKSxcbiAgZW1iZWQgPSByZXF1aXJlKCcuL2VtYmVkJyksXG4gIFRpbWVsaW5lID0gcmVxdWlyZSgnLi90aW1lbGluZScpLFxuICBJbmZvID0gcmVxdWlyZSgnLi9tb2R1bGVzL2luZm8nKSxcbiAgU2hhcmUgPSByZXF1aXJlKCcuL21vZHVsZXMvc2hhcmUnKSxcbiAgRG93bmxvYWRzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2Rvd25sb2FkcycpLFxuICBDaGFwdGVycyA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jaGFwdGVyJyksXG4gIFNhdmVUaW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL3NhdmV0aW1lJyksXG4gIENvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpLFxuICBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpLFxuICBQcm9ncmVzc0JhciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9wcm9ncmVzc2JhcicpO1xuXG52YXIgYXV0b3BsYXkgPSBmYWxzZTtcblxudmFyIHB3cDtcblxuLy8gd2lsbCBleHBvc2UvYXR0YWNoIGl0c2VsZiB0byB0aGUgJCBnbG9iYWxcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkL21lZGlhZWxlbWVudC5qcycpO1xuXG4vKipcbiAqIFRoZSBtb3N0IG1pc3NpbmcgZmVhdHVyZSByZWdhcmRpbmcgZW1iZWRkZWQgcGxheWVyc1xuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIHRoZSB0aXRsZSBvZiB0aGUgc2hvd1xuICogQHBhcmFtIHtzdHJpbmd9IHVybCAob3B0aW9uYWwpIHRoZSBsaW5rIHRvIHRoZSBzaG93XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJTaG93VGl0bGUodGl0bGUsIHVybCkge1xuICBpZiAoIXRpdGxlKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGlmICh1cmwpIHtcbiAgICB0aXRsZSA9ICc8YSBocmVmPVwiJyArIHVybCArICdcIj4nICsgdGl0bGUgKyAnPC9hPic7XG4gIH1cbiAgcmV0dXJuICc8aDMgY2xhc3M9XCJzaG93dGl0bGVcIj4nICsgdGl0bGUgKyAnPC9oMz4nO1xufVxuXG4vKipcbiAqIFJlbmRlciBlcGlzb2RlIHRpdGxlIEhUTUxcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGlua1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyVGl0bGUodGV4dCwgbGluaykge1xuICB2YXIgdGl0bGVCZWdpbiA9ICc8aDEgY2xhc3M9XCJlcGlzb2RldGl0bGVcIj4nLFxuICAgIHRpdGxlRW5kID0gJzwvaDE+JztcbiAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCAmJiBsaW5rICE9PSB1bmRlZmluZWQpIHtcbiAgICB0ZXh0ID0gJzxhIGhyZWY9XCInICsgbGluayArICdcIj4nICsgdGV4dCArICc8L2E+JztcbiAgfVxuICByZXR1cm4gdGl0bGVCZWdpbiArIHRleHQgKyB0aXRsZUVuZDtcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCBzdWJ0aXRsZVxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclN1YlRpdGxlKHRleHQpIHtcbiAgaWYgKCF0ZXh0KSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGgyIGNsYXNzPVwic3VidGl0bGVcIj4nICsgdGV4dCArICc8L2gyPic7XG59XG5cbi8qKlxuICogUmVuZGVyIEhUTUwgdGl0bGUgYXJlYVxuICogQHBhcmFtIHBhcmFtc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyVGl0bGVBcmVhKHBhcmFtcykge1xuICByZXR1cm4gJzxoZWFkZXI+JyArXG4gICAgcmVuZGVyU2hvd1RpdGxlKHBhcmFtcy5zaG93LnRpdGxlLCBwYXJhbXMuc2hvdy51cmwpICtcbiAgICByZW5kZXJUaXRsZShwYXJhbXMudGl0bGUsIHBhcmFtcy5wZXJtYWxpbmspICtcbiAgICByZW5kZXJTdWJUaXRsZShwYXJhbXMuc3VidGl0bGUpICtcbiAgICAnPC9oZWFkZXI+Jztcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCBwbGF5YnV0dG9uXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJQbGF5YnV0dG9uKCkge1xuICByZXR1cm4gJCgnPGEgY2xhc3M9XCJwbGF5XCIgdGl0bGU9XCJQbGF5IEVwaXNvZGVcIiBocmVmPVwiamF2YXNjcmlwdDo7XCI+PC9hPicpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgcG9zdGVyIGltYWdlIGluIEhUTUxcbiAqIHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGlmIHBvc3RlclVybCBpcyBlbXB0eVxuICogQHBhcmFtIHtzdHJpbmd9IHBvc3RlclVybFxuICogQHJldHVybnMge3N0cmluZ30gcmVuZGVyZWQgSFRNTFxuICovXG5mdW5jdGlvbiByZW5kZXJQb3N0ZXIocG9zdGVyVXJsKSB7XG4gIGlmICghcG9zdGVyVXJsKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGRpdiBjbGFzcz1cImNvdmVyYXJ0XCI+PGltZyBjbGFzcz1cImNvdmVyaW1nXCIgc3JjPVwiJyArIHBvc3RlclVybCArICdcIiBkYXRhLWltZz1cIicgKyBwb3N0ZXJVcmwgKyAnXCIgYWx0PVwiUG9zdGVyIEltYWdlXCI+PC9kaXY+Jztcbn1cblxuLyoqXG4gKiBjaGVja3MgaWYgdGhlIGN1cnJlbnQgd2luZG93IGlzIGhpZGRlblxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdyBpcyBoaWRkZW5cbiAqL1xuZnVuY3Rpb24gaXNIaWRkZW4oKSB7XG4gIHZhciBwcm9wcyA9IFtcbiAgICAnaGlkZGVuJyxcbiAgICAnbW96SGlkZGVuJyxcbiAgICAnbXNIaWRkZW4nLFxuICAgICd3ZWJraXRIaWRkZW4nXG4gIF07XG5cbiAgZm9yICh2YXIgaW5kZXggaW4gcHJvcHMpIHtcbiAgICBpZiAocHJvcHNbaW5kZXhdIGluIGRvY3VtZW50KSB7XG4gICAgICByZXR1cm4gISFkb2N1bWVudFtwcm9wc1tpbmRleF1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogYWRkIGNoYXB0ZXIgYmVoYXZpb3IgYW5kIGRlZXBsaW5raW5nOiBza2lwIHRvIHJlZmVyZW5jZWRcbiAqIHRpbWUgcG9zaXRpb24gJiB3cml0ZSBjdXJyZW50IHRpbWUgaW50byBhZGRyZXNzXG4gKiBAcGFyYW0ge29iamVjdH0gcGxheWVyXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0ge29iamVjdH0gd3JhcHBlclxuICovXG5mdW5jdGlvbiBhZGRCZWhhdmlvcihwbGF5ZXIsIHBhcmFtcywgd3JhcHBlcikge1xuICB2YXIganFQbGF5ZXIgPSAkKHBsYXllciksXG5cbiAgICB0aW1lbGluZSA9IG5ldyBUaW1lbGluZShwbGF5ZXIsIHBhcmFtcyksXG4gICAgY29udHJvbHMgPSBuZXcgQ29udHJvbHMocGxheWVyLCB0aW1lbGluZSksXG4gICAgdGFicyA9IG5ldyBUYWJSZWdpc3RyeSgpLFxuXG4gICAgaGFzQ2hhcHRlcnMgPSB0aW1lbGluZS5oYXNDaGFwdGVycyxcbiAgICBtZXRhRWxlbWVudCA9ICQoJzxkaXYgY2xhc3M9XCJ0aXRsZWJhclwiPjwvZGl2PicpLFxuICAgIHBsYXllclR5cGUgPSBwYXJhbXMudHlwZSxcbiAgICBjb250cm9sQm94ID0gY29udHJvbHMuYm94LFxuICAgIHBsYXlCdXR0b24gPSByZW5kZXJQbGF5YnV0dG9uKCksXG4gICAgcG9zdGVyID0gcGFyYW1zLnBvc3RlciB8fCBqcVBsYXllci5hdHRyKCdwb3N0ZXInKSxcbiAgICBkZWVwTGluaztcblxuICBjb25zb2xlLmRlYnVnKCd3ZWJwbGF5ZXInLCAnbWV0YWRhdGEnLCB0aW1lbGluZS5nZXREYXRhKCkpO1xuXG4gIC8qKlxuICAgKiBCdWlsZCByaWNoIHBsYXllciB3aXRoIG1ldGEgZGF0YVxuICAgKi9cbiAgd3JhcHBlci5hZGRDbGFzcygncG9kbG92ZXdlYnBsYXllcl8nICsgcGxheWVyVHlwZSk7XG5cbiAgaWYgKHBsYXllclR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAvLyBSZW5kZXIgcGxheWJ1dHRvbiBpbiB0aXRsZWJhclxuICAgIG1ldGFFbGVtZW50LnByZXBlbmQocGxheUJ1dHRvbik7XG4gICAgbWV0YUVsZW1lbnQuYXBwZW5kKHJlbmRlclBvc3Rlcihwb3N0ZXIpKTtcbiAgICB3cmFwcGVyLnByZXBlbmQobWV0YUVsZW1lbnQpO1xuICB9XG5cbiAgaWYgKHBsYXllclR5cGUgPT09ICd2aWRlbycpIHtcbiAgICB2YXIgdmlkZW9QYW5lID0gJCgnPGRpdiBjbGFzcz1cInZpZGVvLXBhbmVcIj48L2Rpdj4nKTtcbiAgICB2YXIgb3ZlcmxheSA9ICQoJzxkaXYgY2xhc3M9XCJ2aWRlby1vdmVybGF5XCI+PC9kaXY+Jyk7XG4gICAgb3ZlcmxheS5hcHBlbmQocGxheUJ1dHRvbik7XG4gICAgb3ZlcmxheS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocGxheWVyLnBhdXNlZCkge1xuICAgICAgICBwbGF5QnV0dG9uLmFkZENsYXNzKCdwbGF5aW5nJyk7XG4gICAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgIH0pO1xuXG4gICAgdmlkZW9QYW5lXG4gICAgICAuYXBwZW5kKG92ZXJsYXkpXG4gICAgICAuYXBwZW5kKGpxUGxheWVyKTtcblxuICAgIHdyYXBwZXJcbiAgICAgIC5hcHBlbmQobWV0YUVsZW1lbnQpXG4gICAgICAuYXBwZW5kKHZpZGVvUGFuZSk7XG5cbiAgICBqcVBsYXllci5wcm9wKHtcbiAgICAgIHBvc3RlcjogcG9zdGVyLFxuICAgICAgY29udHJvbHM6IG51bGwsXG4gICAgICBwcmVsb2FkOiAnYXV0bydcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJlbmRlciB0aXRsZSBhcmVhIHdpdGggdGl0bGUgaDIgYW5kIHN1YnRpdGxlIGgzXG4gIG1ldGFFbGVtZW50LmFwcGVuZChyZW5kZXJUaXRsZUFyZWEocGFyYW1zKSk7XG5cbiAgLyoqXG4gICAqIC0tIE1PRFVMRVMgLS1cbiAgICovXG4gIHZhciBjaGFwdGVycztcbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgY2hhcHRlcnMgPSBuZXcgQ2hhcHRlcnModGltZWxpbmUpO1xuICAgIHRpbWVsaW5lLmFkZE1vZHVsZShjaGFwdGVycyk7XG4gICAgY2hhcHRlcnMuYWRkRXZlbnRoYW5kbGVycyhwbGF5ZXIpO1xuICB9XG4gIGNvbnRyb2xzLmNyZWF0ZVRpbWVDb250cm9scyhjaGFwdGVycyk7XG5cbiAgdmFyIHNhdmVUaW1lID0gbmV3IFNhdmVUaW1lKHRpbWVsaW5lLCBwYXJhbXMpO1xuICB0aW1lbGluZS5hZGRNb2R1bGUoc2F2ZVRpbWUpO1xuXG4gIHZhciBwcm9ncmVzc0JhciA9IG5ldyBQcm9ncmVzc0Jhcih0aW1lbGluZSk7XG4gIHRpbWVsaW5lLmFkZE1vZHVsZShwcm9ncmVzc0Jhcik7XG5cbiAgdmFyIHNoYXJpbmcgPSBuZXcgU2hhcmUocGFyYW1zKTtcbiAgdmFyIGRvd25sb2FkcyA9IG5ldyBEb3dubG9hZHMocGFyYW1zKTtcbiAgdmFyIGluZm9zID0gbmV3IEluZm8ocGFyYW1zKTtcblxuICAvKipcbiAgICogLS0gVEFCUyAtLVxuICAgKiBUaGUgdGFicyBpbiBjb250cm9sYmFyIHdpbGwgYXBwZWFyIGluIGZvbGxvd2luZyBvcmRlcjpcbiAgICovXG5cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGFicy5hZGQoY2hhcHRlcnMudGFiLCAhIXBhcmFtcy5jaGFwdGVyc1Zpc2libGUpO1xuICB9XG5cbiAgdGFicy5hZGQoc2hhcmluZy50YWIsICEhcGFyYW1zLnNoYXJlYnV0dG9uc1Zpc2libGUpO1xuICB0YWJzLmFkZChkb3dubG9hZHMudGFiLCAhIXBhcmFtcy5kb3dubG9hZGJ1dHRvbnNWaXNpYmxlKTtcbiAgdGFicy5hZGQoaW5mb3MudGFiLCAhIXBhcmFtcy5zdW1tYXJ5VmlzaWJsZSk7XG5cbiAgLy8gUmVuZGVyIGNvbnRyb2xiYXIgd2l0aCB0b2dnbGViYXIgYW5kIHRpbWVjb250cm9sc1xuICB2YXIgY29udHJvbGJhcldyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwiY29udHJvbGJhci13cmFwcGVyXCI+PC9kaXY+Jyk7XG4gIGNvbnRyb2xiYXJXcmFwcGVyLmFwcGVuZCh0YWJzLnRvZ2dsZWJhcik7XG4gIGNvbnRyb2xiYXJXcmFwcGVyLmFwcGVuZChjb250cm9sQm94KTtcblxuICAvLyByZW5kZXIgcHJvZ3Jlc3NiYXIsIGNvbnRyb2xiYXIgYW5kIHRhYnNcbiAgd3JhcHBlclxuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIucmVuZGVyKCkpXG4gICAgLmFwcGVuZChjb250cm9sYmFyV3JhcHBlcilcbiAgICAuYXBwZW5kKHRhYnMuY29udGFpbmVyKTtcblxuICBwcm9ncmVzc0Jhci5hZGRFdmVudHMoKTtcblxuICAvLyBleHBvc2UgdGhlIHBsYXllciBpbnRlcmZhY2VcbiAgd3JhcHBlci5kYXRhKCdwb2Rsb3Zld2VicGxheWVyJywge1xuICAgIHBsYXllcjoganFQbGF5ZXJcbiAgfSk7XG5cbiAgLy8gcGFyc2UgZGVlcGxpbmtcbiAgZGVlcExpbmsgPSByZXF1aXJlKCcuL3VybCcpLmNoZWNrQ3VycmVudCgpO1xuICBpZiAoZGVlcExpbmtbMF0gJiYgcHdwLnBsYXllcnMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHBsYXllckF0dHJpYnV0ZXMgPSB7cHJlbG9hZDogJ2F1dG8nfTtcbiAgICBpZiAoIWlzSGlkZGVuKCkgJiYgYXV0b3BsYXkpIHtcbiAgICAgIHBsYXllckF0dHJpYnV0ZXMuYXV0b3BsYXkgPSAnYXV0b3BsYXknO1xuICAgIH1cbiAgICBqcVBsYXllci5hdHRyKHBsYXllckF0dHJpYnV0ZXMpO1xuICAgIC8vc3RvcEF0VGltZSA9IGRlZXBMaW5rWzFdO1xuICAgIHRpbWVsaW5lLnBsYXlSYW5nZShkZWVwTGluayk7XG5cbiAgICAkKCdodG1sLCBib2R5JykuZGVsYXkoMTUwKS5hbmltYXRlKHtcbiAgICAgIHNjcm9sbFRvcDogJCgnLmNvbnRhaW5lcjpmaXJzdCcpLm9mZnNldCgpLnRvcCAtIDI1XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAocGxheWVyLmN1cnJlbnRUaW1lICYmIHBsYXllci5jdXJyZW50VGltZSA+IDAgJiYgIXBsYXllci5wYXVzZWQpIHtcbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgICAgaWYgKHBsYXllci5wbHVnaW5UeXBlID09PSAnZmxhc2gnKSB7XG4gICAgICAgIHBsYXllci5wYXVzZSgpOyAgICAvLyBmbGFzaCBmYWxsYmFjayBuZWVkcyBhZGRpdGlvbmFsIHBhdXNlXG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFwbGF5QnV0dG9uLmhhc0NsYXNzKCdwbGF5aW5nJykpIHtcbiAgICAgIHBsYXlCdXR0b24uYWRkQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICB9XG4gICAgcGxheWVyLnBsYXkoKTtcbiAgfSk7XG5cbiAgLy8gd2FpdCBmb3IgdGhlIHBsYXllciBvciB5b3UnbGwgZ2V0IERPTSBFWENFUFRJT05TXG4gIC8vIEFuZCBqdXN0IGxpc3RlbiBvbmNlIGJlY2F1c2Ugb2YgYSBzcGVjaWFsIGJlaGF2aW91ciBpbiBmaXJlZm94XG4gIC8vIC0tPiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02NjQ4NDJcbiAganFQbGF5ZXIub25lKCdjYW5wbGF5JywgZnVuY3Rpb24gKGV2dCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ2NhbnBsYXknLCBldnQpO1xuICB9KTtcblxuICBqcVBsYXllclxuICAgIC5vbigndGltZWxpbmVFbGVtZW50JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhldmVudC5jdXJyZW50VGFyZ2V0LmlkLCBldmVudCk7XG4gICAgfSlcbiAgICAub24oJ3RpbWV1cGRhdGUgcHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRpbWVsaW5lLnVwZGF0ZShldmVudCk7XG4gICAgfSlcbiAgICAvLyB1cGRhdGUgcGxheS9wYXVzZSBzdGF0dXNcbiAgICAub24oJ3BsYXknLCBmdW5jdGlvbiAoKSB7fSlcbiAgICAub24oJ3BsYXlpbmcnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwbGF5QnV0dG9uLmFkZENsYXNzKCdwbGF5aW5nJyk7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdwbGF5JywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgfSlcbiAgICAub24oJ3BhdXNlJywgZnVuY3Rpb24gKCkge1xuICAgICAgcGxheUJ1dHRvbi5yZW1vdmVDbGFzcygncGxheWluZycpO1xuICAgICAgZW1iZWQucG9zdFRvT3BlbmVyKHsgYWN0aW9uOiAncGF1c2UnLCBhcmc6IHBsYXllci5jdXJyZW50VGltZSB9KTtcbiAgICB9KVxuICAgIC5vbignZW5kZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdzdG9wJywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgICAvLyBkZWxldGUgdGhlIGNhY2hlZCBwbGF5IHRpbWVcbiAgICAgIHNhdmVUaW1lLnJlbW92ZUl0ZW0oKTtcbiAgICAgIHRpbWVsaW5lLnJld2luZCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHJldHVybiBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgYXR0YWNoIHNvdXJjZSBlbGVtZW50cyB0byB0aGUgZGVmZXJyZWQgYXVkaW8gZWxlbWVudFxuICogQHBhcmFtIHtvYmplY3R9IGRlZmVycmVkUGxheWVyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGdldERlZmVycmVkUGxheWVyQ2FsbEJhY2soZGVmZXJyZWRQbGF5ZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBQbGF5ZXIuZGVmYXVsdHMsIGRhdGEpO1xuICAgIGRhdGEuc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2VPYmplY3QpIHtcbiAgICAgICQoJzxzb3VyY2U+Jywgc291cmNlT2JqZWN0KS5hcHBlbmRUbyhkZWZlcnJlZFBsYXllcik7XG4gICAgfSk7XG4gICAgUGxheWVyLmNyZWF0ZShkZWZlcnJlZFBsYXllciwgcGFyYW1zLCBhZGRCZWhhdmlvcik7XG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7alF1ZXJ5fVxuICovXG4kLmZuLnBvZGxvdmV3ZWJwbGF5ZXIgPSBmdW5jdGlvbiB3ZWJQbGF5ZXIob3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5kZWZlcnJlZCkge1xuICAgIHZhciBkZWZlcnJlZFBsYXllciA9IHRoaXNbMF07XG4gICAgdmFyIGNhbGxiYWNrID0gZ2V0RGVmZXJyZWRQbGF5ZXJDYWxsQmFjayhkZWZlcnJlZFBsYXllcik7XG4gICAgZW1iZWQud2FpdEZvck1ldGFkYXRhKGNhbGxiYWNrKTtcbiAgICBlbWJlZC5wb3N0VG9PcGVuZXIoe2FjdGlvbjogJ3dhaXRpbmcnfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBBZGRpdGlvbmFsIHBhcmFtZXRlcnMgZGVmYXVsdCB2YWx1ZXNcbiAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBQbGF5ZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gIC8vIHR1cm4gZWFjaCBwbGF5ZXIgaW4gdGhlIGN1cnJlbnQgc2V0IGludG8gYSBQb2Rsb3ZlIFdlYiBQbGF5ZXJcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgcGxheWVyRWxlbWVudCkge1xuICAgIFBsYXllci5jcmVhdGUocGxheWVyRWxlbWVudCwgcGFyYW1zLCBhZGRCZWhhdmlvcik7XG4gIH0pO1xufTtcblxucHdwID0geyBwbGF5ZXJzOiBQbGF5ZXIucGxheWVycyB9O1xuXG5lbWJlZC5pbml0KCQsIFBsYXllci5wbGF5ZXJzKTtcblxud2luZG93LnB3cCA9IHB3cDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzdiMDYzN2I3LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuLi90aW1lY29kZScpXG4gICwgdXJsID0gcmVxdWlyZSgnLi4vdXJsJylcbiAgLCBUYWIgPSByZXF1aXJlKCcuLi90YWInKVxuICAsIFRpbWVsaW5lID0gcmVxdWlyZSgnLi4vdGltZWxpbmUnKTtcblxudmFyIEFDVElWRV9DSEFQVEVSX1RIUkVTSEhPTEQgPSAwLjE7XG5cbmZ1bmN0aW9uIHJlbmRlcihodG1sKSB7XG4gIHJldHVybiAkKGh0bWwpO1xufVxuXG4vKipcbiAqIHJlbmRlciBIVE1MVGFibGVFbGVtZW50IGZvciBjaGFwdGVyc1xuICogQHJldHVybnMge2pRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVuZGVyQ2hhcHRlclRhYmxlKCkge1xuICByZXR1cm4gcmVuZGVyKFxuICAgICc8dGFibGUgY2xhc3M9XCJwb2Rsb3Zld2VicGxheWVyX2NoYXB0ZXJzXCI+PGNhcHRpb24+UG9kY2FzdCBDaGFwdGVyczwvY2FwdGlvbj4nICtcbiAgICAgICc8dGhlYWQ+JyArXG4gICAgICAgICc8dHI+JyArXG4gICAgICAgICAgJzx0aCBzY29wZT1cImNvbFwiPkNoYXB0ZXIgTnVtYmVyPC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+U3RhcnQgdGltZTwvdGg+JyArXG4gICAgICAgICAgJzx0aCBzY29wZT1cImNvbFwiPlRpdGxlPC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+RHVyYXRpb248L3RoPicgK1xuICAgICAgICAnPC90cj4nICtcbiAgICAgICc8L3RoZWFkPicgK1xuICAgICAgJzx0Ym9keT48L3Rib2R5PicgK1xuICAgICc8L3RhYmxlPidcbiAgKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNoYXB0ZXJcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclJvdyAoY2hhcHRlciwgaW5kZXgpIHtcbiAgcmV0dXJuIHJlbmRlcihcbiAgICAnPHRyIGNsYXNzPVwiY2hhcHRlclwiPicgK1xuICAgICAgJzx0ZCBjbGFzcz1cImNoYXB0ZXItbnVtYmVyXCI+PHNwYW4gY2xhc3M9XCJiYWRnZVwiPicgKyAoaW5kZXggKyAxKSArICc8L3NwYW4+PC90ZD4nICtcbiAgICAgICc8dGQgY2xhc3M9XCJjaGFwdGVyLW5hbWVcIj48c3Bhbj4nICsgY2hhcHRlci5jb2RlICsgJzwvc3Bhbj48L3RkPicgK1xuICAgICAgJzx0ZCBjbGFzcz1cImNoYXB0ZXItZHVyYXRpb25cIj48c3Bhbj4nICsgY2hhcHRlci5kdXJhdGlvbiArICc8L3NwYW4+PC90ZD4nICtcbiAgICAnPC90cj4nXG4gICk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNoYXB0ZXJzXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRNYXhDaGFwdGVyU3RhcnQoY2hhcHRlcnMpIHtcbiAgZnVuY3Rpb24gZ2V0U3RhcnRUaW1lIChjaGFwdGVyKSB7XG4gICAgcmV0dXJuIGNoYXB0ZXIuc3RhcnQ7XG4gIH1cbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsICQubWFwKGNoYXB0ZXJzLCBnZXRTdGFydFRpbWUpKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHt7ZW5kOntudW1iZXJ9LCBzdGFydDp7bnVtYmVyfX19IGNoYXB0ZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50VGltZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQWN0aXZlQ2hhcHRlciAoY2hhcHRlciwgY3VycmVudFRpbWUpIHtcbiAgaWYgKCFjaGFwdGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoY3VycmVudFRpbWUgPiBjaGFwdGVyLnN0YXJ0IC0gQUNUSVZFX0NIQVBURVJfVEhSRVNISE9MRCAmJiBjdXJyZW50VGltZSA8PSBjaGFwdGVyLmVuZCk7XG59XG5cbi8qKlxuICogdXBkYXRlIHRoZSBjaGFwdGVyIGxpc3Qgd2hlbiB0aGUgZGF0YSBpcyBsb2FkZWRcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZSAodGltZWxpbmUpIHtcbiAgdmFyIGFjdGl2ZUNoYXB0ZXIgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKVxuICAgICwgY3VycmVudFRpbWUgPSB0aW1lbGluZS5nZXRUaW1lKCk7XG5cbiAgY29uc29sZS5kZWJ1ZygnQ2hhcHRlcnMnLCAndXBkYXRlJywgdGhpcywgYWN0aXZlQ2hhcHRlciwgY3VycmVudFRpbWUpO1xuICBpZiAoaXNBY3RpdmVDaGFwdGVyKGFjdGl2ZUNoYXB0ZXIsIGN1cnJlbnRUaW1lKSkge1xuICAgIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICd1cGRhdGUnLCAnYWxyZWFkeSBzZXQnLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgICByZXR1cm47XG4gIH1cbiAgZnVuY3Rpb24gbWFya0NoYXB0ZXIgKGNoYXB0ZXIsIGkpIHtcbiAgICB2YXIgaXNBY3RpdmUgPSBpc0FjdGl2ZUNoYXB0ZXIoY2hhcHRlciwgY3VycmVudFRpbWUpO1xuICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgdGhpcy5zZXRDdXJyZW50Q2hhcHRlcihpKTtcbiAgICB9XG4gIH1cbiAgdGhpcy5jaGFwdGVycy5mb3JFYWNoKG1hcmtDaGFwdGVyLCB0aGlzKTtcbn1cblxuLyoqXG4gKiBjaGFwdGVyIGhhbmRsaW5nXG4gKiBAcGFyYW1zIHtUaW1lbGluZX0gcGFyYW1zXG4gKiBAcmV0dXJuIHtDaGFwdGVyc30gY2hhcHRlciBtb2R1bGVcbiAqL1xuZnVuY3Rpb24gQ2hhcHRlcnMgKHRpbWVsaW5lKSB7XG5cbiAgaWYgKCF0aW1lbGluZSB8fCAhdGltZWxpbmUuaGFzQ2hhcHRlcnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAodGltZWxpbmUuZHVyYXRpb24gPT09IDApIHtcbiAgICBjb25zb2xlLndhcm4oJ0NoYXB0ZXJzJywgJ2NvbnN0cnVjdG9yJywgJ1plcm8gbGVuZ3RoIG1lZGlhPycsIHRpbWVsaW5lKTtcbiAgfVxuXG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5kdXJhdGlvbiA9IHRpbWVsaW5lLmR1cmF0aW9uO1xuICB0aGlzLmNoYXB0ZXJzID0gdGltZWxpbmUuZ2V0RGF0YUJ5VHlwZSgnY2hhcHRlcicpO1xuICB0aGlzLmNoYXB0ZXJsaW5rcyA9ICEhdGltZWxpbmUuY2hhcHRlcmxpbmtzO1xuICB0aGlzLmN1cnJlbnRDaGFwdGVyID0gMDtcblxuICB0aGlzLnRhYiA9IG5ldyBUYWIoe1xuICAgIGljb246ICdwd3AtY2hhcHRlcnMnLFxuICAgIHRpdGxlOiAnU2hvdy9oaWRlIGNoYXB0ZXJzJyxcbiAgICBoZWFkbGluZTogJ0NoYXB0ZXJzJyxcbiAgICBuYW1lOiAncG9kbG92ZXdlYnBsYXllcl9jaGFwdGVyYm94J1xuICB9KTtcblxuICB0aGlzLnRhYlxuICAgIC5jcmVhdGVNYWluQ29udGVudCgnJylcbiAgICAuYXBwZW5kKHRoaXMuZ2VuZXJhdGVUYWJsZSgpKTtcblxuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgbGlzdCBvZiBjaGFwdGVycywgdGhpcyBmdW5jdGlvbiBjcmVhdGVzIHRoZSBjaGFwdGVyIHRhYmxlIGZvciB0aGUgcGxheWVyLlxuICogQHJldHVybnMge2pRdWVyeXxIVE1MRGl2RWxlbWVudH1cbiAqL1xuQ2hhcHRlcnMucHJvdG90eXBlLmdlbmVyYXRlVGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0YWJsZSwgdGJvZHksIG1heGNoYXB0ZXJzdGFydCwgZm9yY2VIb3VycztcblxuICB0YWJsZSA9IHJlbmRlckNoYXB0ZXJUYWJsZSgpO1xuICB0Ym9keSA9IHRhYmxlLmNoaWxkcmVuKCd0Ym9keScpO1xuXG4gIGlmICh0aGlzLmNoYXB0ZXJsaW5rcyAhPT0gJ2ZhbHNlJykge1xuICAgIHRhYmxlLmFkZENsYXNzKCdsaW5rZWQgbGlua2VkXycgKyB0aGlzLmNoYXB0ZXJsaW5rcyk7XG4gIH1cblxuICBtYXhjaGFwdGVyc3RhcnQgPSBnZXRNYXhDaGFwdGVyU3RhcnQodGhpcy5jaGFwdGVycyk7XG4gIGZvcmNlSG91cnMgPSAobWF4Y2hhcHRlcnN0YXJ0ID49IDM2MDApO1xuXG4gIGZ1bmN0aW9uIGJ1aWxkQ2hhcHRlcihpKSB7XG4gICAgdmFyIGR1cmF0aW9uID0gTWF0aC5yb3VuZCh0aGlzLmVuZCAtIHRoaXMuc3RhcnQpLFxuICAgICAgcm93O1xuICAgIC8vbWFrZSBzdXJlIHRoZSBkdXJhdGlvbiBmb3IgYWxsIGNoYXB0ZXJzIGFyZSBlcXVhbGx5IGZvcm1hdHRlZFxuICAgIHRoaXMuZHVyYXRpb24gPSB0Yy5nZW5lcmF0ZShbZHVyYXRpb25dLCBmYWxzZSk7XG5cbiAgICAvL2lmIHRoZXJlIGlzIGEgY2hhcHRlciB0aGF0IHN0YXJ0cyBhZnRlciBhbiBob3VyLCBmb3JjZSAnMDA6JyBvbiBhbGwgcHJldmlvdXMgY2hhcHRlcnNcbiAgICAvL2luc2VydCB0aGUgY2hhcHRlciBkYXRhXG4gICAgdGhpcy5zdGFydFRpbWUgPSB0Yy5nZW5lcmF0ZShbTWF0aC5yb3VuZCh0aGlzLnN0YXJ0KV0sIHRydWUsIGZvcmNlSG91cnMpO1xuXG4gICAgcm93ID0gcmVuZGVyUm93KHRoaXMsIGkpO1xuICAgIGlmIChpICUgMikge1xuICAgICAgcm93LmFkZENsYXNzKCdvZGRjaGFwdGVyJyk7XG4gICAgfVxuICAgIHJvdy5hcHBlbmRUbyh0Ym9keSk7XG4gICAgdGhpcy5lbGVtZW50ID0gcm93O1xuICB9XG5cbiAgJC5lYWNoKHRoaXMuY2hhcHRlcnMsIGJ1aWxkQ2hhcHRlcik7XG4gIHJldHVybiB0YWJsZTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7bWVqcy5IdG1sTWVkaWFFbGVtZW50fSBwbGF5ZXJcbiAqL1xuQ2hhcHRlcnMucHJvdG90eXBlLmFkZEV2ZW50aGFuZGxlcnMgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gIGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgIC8vIGVuYWJsZSBleHRlcm5hbCBsaW5rcyB0byBiZSBvcGVuZWQgaW4gYSBuZXcgdGFiIG9yIHdpbmRvd1xuICAgIC8vIGNhbmNlbHMgZXZlbnQgdG8gYnViYmxlIHVwXG4gICAgaWYgKGUudGFyZ2V0LmNsYXNzTmFtZSA9PT0gJ3B3cC1vdXRnb2luZyBidXR0b24gYnV0dG9uLXRvZ2dsZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCdjaGFwdGVyI2NsaWNrSGFuZGxlcjogc3RhcnQgY2hhcHRlciBhdCcsIGNoYXB0ZXJTdGFydCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIEJhc2ljIENoYXB0ZXIgTWFyayBmdW5jdGlvbiAod2l0aG91dCBkZWVwbGlua2luZylcbiAgICBjb25zb2xlLmxvZygnQ2hhcHRlcicsICdjbGlja0hhbmRsZXInLCAnc2V0Q3VycmVudENoYXB0ZXIgdG8nLCBlLmRhdGEuaW5kZXgpO1xuICAgIGUuZGF0YS5tb2R1bGUuc2V0Q3VycmVudENoYXB0ZXIoZS5kYXRhLmluZGV4KTtcbiAgICAvLyBmbGFzaCBmYWxsYmFjayBuZWVkcyBhZGRpdGlvbmFsIHBhdXNlXG4gICAgaWYgKHBsYXllci5wbHVnaW5UeXBlID09PSAnZmxhc2gnKSB7XG4gICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICB9XG4gICAgZS5kYXRhLm1vZHVsZS5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDbGlja0hhbmRsZXIgKGNoYXB0ZXIsIGluZGV4KSB7XG4gICAgY2hhcHRlci5lbGVtZW50Lm9uKCdjbGljaycsIHttb2R1bGU6IHRoaXMsIGluZGV4OiBpbmRleH0sIG9uQ2xpY2spO1xuICB9XG5cbiAgdGhpcy5jaGFwdGVycy5mb3JFYWNoKGFkZENsaWNrSGFuZGxlciwgdGhpcyk7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUuZ2V0QWN0aXZlQ2hhcHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFjdGl2ZSA9IHRoaXMuY2hhcHRlcnNbdGhpcy5jdXJyZW50Q2hhcHRlcl07XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICdnZXRBY3RpdmVDaGFwdGVyJywgYWN0aXZlKTtcbiAgcmV0dXJuIGFjdGl2ZTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBjaGFwdGVySW5kZXhcbiAqL1xuQ2hhcHRlcnMucHJvdG90eXBlLnNldEN1cnJlbnRDaGFwdGVyID0gZnVuY3Rpb24gKGNoYXB0ZXJJbmRleCkge1xuICBpZiAoY2hhcHRlckluZGV4IDwgdGhpcy5jaGFwdGVycy5sZW5ndGggJiYgY2hhcHRlckluZGV4ID49IDApIHtcbiAgICB0aGlzLmN1cnJlbnRDaGFwdGVyID0gY2hhcHRlckluZGV4O1xuICB9XG4gIHRoaXMubWFya0FjdGl2ZUNoYXB0ZXIoKTtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ3NldEN1cnJlbnRDaGFwdGVyJywgJ3RvJywgdGhpcy5jdXJyZW50Q2hhcHRlcik7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUubWFya0FjdGl2ZUNoYXB0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhY3RpdmVDaGFwdGVyID0gdGhpcy5nZXRBY3RpdmVDaGFwdGVyKCk7XG4gICQuZWFjaCh0aGlzLmNoYXB0ZXJzLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgfSk7XG4gIGFjdGl2ZUNoYXB0ZXIuZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJyk7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRDaGFwdGVyLFxuICAgIG5leHQgPSB0aGlzLnNldEN1cnJlbnRDaGFwdGVyKGN1cnJlbnQgKyAxKTtcbiAgaWYgKGN1cnJlbnQgPT09IG5leHQpIHtcbiAgICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAnbmV4dCcsICdhbHJlYWR5IGluIGxhc3QgY2hhcHRlcicpO1xuICAgIHJldHVybiBjdXJyZW50O1xuICB9XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICduZXh0JywgJ2NoYXB0ZXInLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgcmV0dXJuIG5leHQ7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50Q2hhcHRlcixcbiAgICBwcmV2aW91cyA9IHRoaXMuc2V0Q3VycmVudENoYXB0ZXIoY3VycmVudCAtIDEpO1xuICBpZiAoY3VycmVudCA9PT0gcHJldmlvdXMpIHtcbiAgICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAncHJldmlvdXMnLCAnYWxyZWFkeSBpbiBmaXJzdCBjaGFwdGVyJyk7XG4gICAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxuICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAncHJldmlvdXMnLCAnY2hhcHRlcicsIHRoaXMuY3VycmVudENoYXB0ZXIpO1xuICB0aGlzLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICByZXR1cm4gcHJldmlvdXM7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUucGxheUN1cnJlbnRDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhcnQgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKS5zdGFydDtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJyNwbGF5Q3VycmVudENoYXB0ZXInLCAnc3RhcnQnLCBzdGFydCk7XG4gIHZhciB0aW1lID0gdGhpcy50aW1lbGluZS5zZXRUaW1lKHN0YXJ0KTtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJyNwbGF5Q3VycmVudENoYXB0ZXInLCAnY3VycmVudFRpbWUnLCB0aW1lKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcHRlcnM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jaGFwdGVyLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFRhYiA9IHJlcXVpcmUoJy4uL3RhYicpXG4gICwgdGltZUNvZGUgPSByZXF1aXJlKCcuLi90aW1lY29kZScpO1xuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgZmlsZXNpemUgaW50byBLQiBhbmQgTUJcbiAqIEBwYXJhbSBzaXplXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRTaXplKHNpemUpIHtcbiAgdmFyIG9uZU1iID0gMTA0ODU3NjtcbiAgdmFyIGZpbGVTaXplID0gcGFyc2VJbnQoc2l6ZSwgMTApO1xuICB2YXIga0JGaWxlU2l6ZSA9IE1hdGgucm91bmQoZmlsZVNpemUgLyAxMDI0KTtcbiAgdmFyIG1CRmlsZVNJemUgPSBNYXRoLnJvdW5kKGZpbGVTaXplIC8gMTAyNCAvIDEwMjQpO1xuICBpZiAoIXNpemUpIHtcbiAgICByZXR1cm4gJyAtLSAnO1xuICB9XG4gIC8vIGluIGNhc2UsIHRoZSBmaWxlc2l6ZSBpcyBzbWFsbGVyIHRoYW4gMU1CLFxuICAvLyB0aGUgZm9ybWF0IHdpbGwgYmUgcmVuZGVyZWQgaW4gS0JcbiAgLy8gb3RoZXJ3aXNlIGluIE1CXG4gIHJldHVybiAoZmlsZVNpemUgPCBvbmVNYikgPyBrQkZpbGVTaXplICsgJyBLQicgOiBtQkZpbGVTSXplICsgJyBNQic7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBsaXN0RWxlbWVudFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gY3JlYXRlT3B0aW9uKGxpc3RFbGVtZW50KSB7XG4gIGNvbnNvbGUubG9nKGxpc3RFbGVtZW50KTtcbiAgcmV0dXJuICc8b3B0aW9uPicgKyBsaXN0RWxlbWVudC5hc3NldFRpdGxlICsgJyAnICsgZm9ybWF0U2l6ZShsaXN0RWxlbWVudC5zaXplKSArICc8L29wdGlvbj4nO1xufVxuXG5mdW5jdGlvbiBnZXRQb3N0ZXJJbWFnZShwYXJhbXMpIHtcbiAgdmFyIGRlZmF1bHRQb3N0ZXIgPSAnL2ltZy9pY29uLXBvZGxvdmUtc3Vic2NyaWJlLTYwMC5wbmcnO1xuICB2YXIgZGVmYXVsdENsYXNzID0gJ2RlZmF1bHQtcG9zdGVyJztcblxuICB2YXIgcG9zdGVyID0gZGVmYXVsdFBvc3RlcjtcbiAgaWYgKHBhcmFtcy5zaG93LnBvc3Rlcikge1xuICAgIHBvc3RlciA9IHBhcmFtcy5zaG93LnBvc3RlcjtcbiAgICBkZWZhdWx0Q2xhc3MgPSAnJztcbiAgfVxuICBpZiAocGFyYW1zLnBvc3Rlcikge1xuICAgIHBvc3RlciA9IHBhcmFtcy5wb3N0ZXI7XG4gICAgZGVmYXVsdENsYXNzID0gJyc7XG4gIH1cblxuICByZXR1cm4gJzxpbWcgY2xhc3M9XCJwb3N0ZXItaW1hZ2UgJyArIGRlZmF1bHRDbGFzcyArICdcIiBzcmM9XCInICsgcG9zdGVyICsgJ1wiIGRhdGEtaW1nPVwiJyArIHBvc3RlciArICdcIiAnICtcbiAgICAnYWx0PVwiUG9zdGVyIEltYWdlXCI+Jztcbn1cblxuZnVuY3Rpb24gZ2V0UHVibGljYXRpb25EYXRlKHJhd0RhdGUpIHtcbiAgaWYgKCFyYXdEYXRlKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHZhciBkYXRlID0gbmV3IERhdGUocmF3RGF0ZSk7XG4gIHJldHVybiAnPHA+UHVibGlzaGVkOiAnICsgZGF0ZS5nZXREYXRlKCkgKyAnLicgKyBkYXRlLmdldE1vbnRoKCkgKyAnLicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnPC9wPic7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcmV0dXJucyB7e2Fzc2V0VGl0bGU6IFN0cmluZywgZG93bmxvYWRVcmw6IFN0cmluZywgdXJsOiBTdHJpbmcsIHNpemU6IE51bWJlcn19XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZURvd25sb2FkIChlbGVtZW50KSB7XG4gIHJldHVybiB7XG4gICAgYXNzZXRUaXRsZTogZWxlbWVudC5uYW1lLFxuICAgIGRvd25sb2FkVXJsOiBlbGVtZW50LmRsdXJsLFxuICAgIHVybDogZWxlbWVudC51cmwsXG4gICAgc2l6ZTogZWxlbWVudC5zaXplXG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcmV0dXJucyB7e2Fzc2V0VGl0bGU6IFN0cmluZywgZG93bmxvYWRVcmw6IFN0cmluZywgdXJsOiBTdHJpbmcsIHNpemU6IE51bWJlcn19XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNvdXJjZShlbGVtZW50KSB7XG4gIHZhciBzb3VyY2UgPSAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSA/IGVsZW1lbnQgOiBlbGVtZW50LnNyYztcbiAgdmFyIHBhcnRzID0gc291cmNlLnNwbGl0KCcuJyk7XG4gIHJldHVybiB7XG4gICAgYXNzZXRUaXRsZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV0sXG4gICAgZG93bmxvYWRVcmw6IHNvdXJjZSxcbiAgICB1cmw6IHNvdXJjZSxcbiAgICBzaXplOiAtMVxuICB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxpc3QgKHBhcmFtcykge1xuICBpZiAocGFyYW1zLmRvd25sb2FkcyAmJiBwYXJhbXMuZG93bmxvYWRzWzBdLmFzc2V0VGl0bGUpIHtcbiAgICByZXR1cm4gcGFyYW1zLmRvd25sb2FkcztcbiAgfVxuXG4gIGlmIChwYXJhbXMuZG93bmxvYWRzKSB7XG4gICAgcmV0dXJuIHBhcmFtcy5kb3dubG9hZHMubWFwKG5vcm1hbGl6ZURvd25sb2FkKTtcbiAgfVxuICAvLyBidWlsZCBmcm9tIHNvdXJjZSBlbGVtZW50c1xuICByZXR1cm4gcGFyYW1zLnNvdXJjZXMubWFwKG5vcm1hbGl6ZVNvdXJjZSk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEb3dubG9hZHMgKHBhcmFtcykge1xuICB0aGlzLmxpc3QgPSBjcmVhdGVMaXN0KHBhcmFtcyk7XG4gIHRoaXMudGFiID0gdGhpcy5jcmVhdGVEb3dubG9hZFRhYihwYXJhbXMpO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAcmV0dXJucyB7bnVsbHxUYWJ9IGRvd25sb2FkIHRhYlxuICovXG5Eb3dubG9hZHMucHJvdG90eXBlLmNyZWF0ZURvd25sb2FkVGFiID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICBpZiAoKCFwYXJhbXMuZG93bmxvYWRzICYmICFwYXJhbXMuc291cmNlcykgfHwgcGFyYW1zLmhpZGVkb3dubG9hZGJ1dHRvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBkb3dubG9hZFRhYiA9IG5ldyBUYWIoe1xuICAgIGljb246ICdwd3AtZG93bmxvYWQnLFxuICAgIHRpdGxlOiAnU2hvdy9oaWRlIGRvd25sb2FkIGJhcicsXG4gICAgbmFtZTogJ2Rvd25sb2FkcycsXG4gICAgaGVhZGxpbmU6ICdEb3dubG9hZCdcbiAgfSk7XG5cbiAgdmFyICR0YWJDb250ZW50ID0gZG93bmxvYWRUYWIuY3JlYXRlTWFpbkNvbnRlbnQoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPicgK1xuICAgICc8ZGl2IGNsYXNzPVwicG9zdGVyLXdyYXBwZXJcIj4nICtcbiAgICAnPGRpdiBjbGFzcz1cImRvd25sb2FkIGRvd25sb2FkLW92ZXJsYXlcIj48L2Rpdj4nICtcbiAgICBnZXRQb3N0ZXJJbWFnZShwYXJhbXMpICtcbiAgICAnPC9kaXY+JyArXG4gICAgJzwvZGl2PicgK1xuICAgICc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj4nICtcbiAgICAnPGgyPicgKyBwYXJhbXMudGl0bGUgKyAnPC9oMj4nICtcbiAgICBnZXRQdWJsaWNhdGlvbkRhdGUocGFyYW1zLnB1YmxpY2F0aW9uRGF0ZSkgK1xuICAgICc8cD5EdXJhdGlvbjogJyArIHRpbWVDb2RlLmZyb21UaW1lU3RhbXAocGFyYW1zLmR1cmF0aW9uKSArICc8L3A+JyArXG4gICAgJzwvZGl2PidcbiAgKTtcbiAgZG93bmxvYWRUYWIuYm94LmFwcGVuZCgkdGFiQ29udGVudCk7XG5cbiAgZG93bmxvYWRUYWIuY3JlYXRlRm9vdGVyKCc8Zm9ybSBhY3Rpb249XCJcIiBtZXRob2Q9XCJcIj4nICtcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImRvd25sb2FkIGJ1dHRvbi1zdWJtaXQgaWNvbiBwd3AtZG93bmxvYWRcIiBuYW1lPVwiZG93bmxvYWQtZmlsZVwiPicgK1xuICAgICc8c3BhbiBjbGFzcz1cImRvd25sb2FkIGxhYmVsXCI+RG93bmxvYWQgRXBpc29kZTwvc3Bhbj4nICtcbiAgICAnPC9idXR0b24+JyArXG4gICAgJzxzZWxlY3QgY2xhc3M9XCJzZWxlY3RcIiBuYW1lPVwic2VsZWN0LWZpbGVcIj4nICsgdGhpcy5saXN0Lm1hcChjcmVhdGVPcHRpb24pICsgJzwvc2VsZWN0PjwvZm9ybT4nXG4gICk7XG5cbiAgcmV0dXJuIGRvd25sb2FkVGFiO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEb3dubG9hZHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9kb3dubG9hZHMuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGFiID0gcmVxdWlyZSgnLi4vdGFiJylcbiAgLCB0aW1lQ29kZSA9IHJlcXVpcmUoJy4uL3RpbWVjb2RlJylcbiAgLCBzZXJ2aWNlcyA9IHJlcXVpcmUoJy4uL3NvY2lhbC1uZXR3b3JrcycpO1xuXG5mdW5jdGlvbiBnZXRQdWJsaWNhdGlvbkRhdGUocmF3RGF0ZSkge1xuICBpZiAoIXJhd0RhdGUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZShyYXdEYXRlKTtcbiAgcmV0dXJuICc8cD5QdWJsaXNoZWQ6ICcgKyBkYXRlLmdldERhdGUoKSArICcuJyArIGRhdGUuZ2V0TW9udGgoKSArICcuJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICc8L3A+Jztcbn1cblxuZnVuY3Rpb24gY3JlYXRlRXBpc29kZUluZm8odGFiLCBwYXJhbXMpIHtcbiAgdGFiLmNyZWF0ZU1haW5Db250ZW50KFxuICAgICc8aDI+JyArIHBhcmFtcy50aXRsZSArICc8L2gyPicgK1xuICAgICc8aDM+JyArIHBhcmFtcy5zdWJ0aXRsZSArICc8L2gzPicgK1xuICAgICc8cD4nICsgcGFyYW1zLnN1bW1hcnkgKyAnPC9wPicgK1xuICAgICc8cD5EdXJhdGlvbjogJyArIHRpbWVDb2RlLmZyb21UaW1lU3RhbXAocGFyYW1zLmR1cmF0aW9uKSArICc8L3A+JyArXG4gICAgIGdldFB1YmxpY2F0aW9uRGF0ZShwYXJhbXMucHVibGljYXRpb25EYXRlKSArXG4gICAgJzxwPicgK1xuICAgICAgJ1Blcm1hbGluayBmb3IgdGhpcyBlcGlzb2RlOjxicj4nICtcbiAgICAgICc8YSBocmVmPVwiJyArIHBhcmFtcy5wZXJtYWxpbmsgKyAnXCI+JyArIHBhcmFtcy5wZXJtYWxpbmsgKyAnPC9hPicgK1xuICAgICc8L3A+J1xuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3N0ZXJJbWFnZShwb3N0ZXIpIHtcbiAgaWYgKCFwb3N0ZXIpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuICc8ZGl2IGNsYXNzPVwicG9zdGVyLWltYWdlXCI+JyArXG4gICAgJzxpbWcgc3JjPVwiJyArIHBvc3RlciArICdcIiBkYXRhLWltZz1cIicgKyBwb3N0ZXIgKyAnXCIgYWx0PVwiUG9zdGVyIEltYWdlXCI+JyArXG4gICAgJzwvZGl2Pic7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1YnNjcmliZUJ1dHRvbihwYXJhbXMpIHtcbiAgaWYgKCFwYXJhbXMuc3Vic2NyaWJlQnV0dG9uKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGJ1dHRvbiBjbGFzcz1cImJ1dHRvbi1zdWJtaXRcIj4nICtcbiAgICAgICc8c3BhbiBjbGFzcz1cInNob3d0aXRsZS1sYWJlbFwiPicgKyBwYXJhbXMuc2hvdy50aXRsZSArICc8L3NwYW4+JyArXG4gICAgICAnPHNwYW4gY2xhc3M9XCJzdWJtaXQtbGFiZWxcIj4nICsgcGFyYW1zLnN1YnNjcmliZUJ1dHRvbiArICc8L3NwYW4+JyArXG4gICAgJzwvYnV0dG9uPic7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNob3dJbmZvICh0YWIsIHBhcmFtcykge1xuICB0YWIuY3JlYXRlQXNpZGUoXG4gICAgJzxoMj4nICsgcGFyYW1zLnNob3cudGl0bGUgKyAnPC9oMj4nICtcbiAgICAnPGgzPicgKyBwYXJhbXMuc2hvdy5zdWJ0aXRsZSArICc8L2gzPicgK1xuICAgIGNyZWF0ZVBvc3RlckltYWdlKHBhcmFtcy5zaG93LnBvc3RlcikgK1xuICAgIGNyZWF0ZVN1YnNjcmliZUJ1dHRvbihwYXJhbXMpICtcbiAgICAnPHA+TGluayB0byB0aGUgc2hvdzo8YnI+JyArXG4gICAgICAnPGEgaHJlZj1cIicgKyBwYXJhbXMuc2hvdy51cmwgKyAnXCI+JyArIHBhcmFtcy5zaG93LnVybCArICc8L2E+PC9wPidcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU29jaWFsTGluayhvcHRpb25zKSB7XG4gIHZhciBzZXJ2aWNlID0gc2VydmljZXMuZ2V0KG9wdGlvbnMuc2VydmljZU5hbWUpO1xuICB2YXIgbGlzdEl0ZW0gPSAkKCc8bGk+PC9saT4nKTtcbiAgdmFyIGJ1dHRvbiA9IHNlcnZpY2UuZ2V0QnV0dG9uKG9wdGlvbnMpO1xuICBsaXN0SXRlbS5hcHBlbmQoYnV0dG9uLmVsZW1lbnQpO1xuICB0aGlzLmFwcGVuZChsaXN0SXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNvY2lhbEluZm8ocHJvZmlsZXMpIHtcbiAgaWYgKCFwcm9maWxlcykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHByb2ZpbGVMaXN0ID0gJCgnPHVsPjwvdWw+Jyk7XG4gIHByb2ZpbGVzLmZvckVhY2goY3JlYXRlU29jaWFsTGluaywgcHJvZmlsZUxpc3QpO1xuXG4gIHZhciBjb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwic29jaWFsLWxpbmtzXCI+PGgzPlN0YXkgaW4gdG91Y2g8L2gzPjwvZGl2PicpO1xuICBjb250YWluZXIuYXBwZW5kKHByb2ZpbGVMaXN0KTtcbiAgcmV0dXJuIGNvbnRhaW5lcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU29jaWFsQW5kTGljZW5zZUluZm8gKHRhYiwgcGFyYW1zKSB7XG4gIGlmICghcGFyYW1zLmxpY2Vuc2UgJiYgIXBhcmFtcy5wcm9maWxlcykge1xuICAgIHJldHVybjtcbiAgfVxuICB0YWIuY3JlYXRlRm9vdGVyKFxuICAgICc8cD5UaGUgc2hvdyBcIicgKyBwYXJhbXMuc2hvdy50aXRsZSArICdcIiBpcyBsaWNlbmNlZCB1bmRlcjxicj4nICtcbiAgICAgICc8YSBocmVmPVwiJyArIHBhcmFtcy5saWNlbnNlLnVybCArICdcIj4nICsgcGFyYW1zLmxpY2Vuc2UubmFtZSArICc8L2E+JyArXG4gICAgJzwvcD4nXG4gICkucHJlcGVuZChjcmVhdGVTb2NpYWxJbmZvKHBhcmFtcy5wcm9maWxlcykpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSBpbmZvIHRhYiBpZiBwYXJhbXMuc3VtbWFyeSBpcyBkZWZpbmVkXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlciBvYmplY3RcbiAqIEByZXR1cm5zIHtudWxsfFRhYn0gaW5mbyB0YWIgaW5zdGFuY2Ugb3IgbnVsbFxuICovXG5mdW5jdGlvbiBjcmVhdGVJbmZvVGFiKHBhcmFtcykge1xuICBpZiAoIXBhcmFtcy5zdW1tYXJ5KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGluZm9UYWIgPSBuZXcgVGFiKHtcbiAgICBpY29uOiAncHdwLWluZm8nLFxuICAgIHRpdGxlOiAnTW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzJyxcbiAgICBoZWFkbGluZTogJ0luZm8nLFxuICAgIG5hbWU6ICdpbmZvJ1xuICB9KTtcblxuICBjcmVhdGVFcGlzb2RlSW5mbyhpbmZvVGFiLCBwYXJhbXMpO1xuICBjcmVhdGVTaG93SW5mbyhpbmZvVGFiLCBwYXJhbXMpO1xuICBjcmVhdGVTb2NpYWxBbmRMaWNlbnNlSW5mbyhpbmZvVGFiLCBwYXJhbXMpO1xuXG4gIHJldHVybiBpbmZvVGFiO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIG1vZHVsZSB0byBkaXNwbGF5IHBvZGNhc3QgYW5kIGVwaXNvZGUgaW5mb1xuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwYXJhbWV0ZXIgb2JqZWN0XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSW5mbyhwYXJhbXMpIHtcbiAgdGhpcy50YWIgPSBjcmVhdGVJbmZvVGFiKHBhcmFtcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5mbztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL2luZm8uanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuLi90aW1lY29kZScpO1xudmFyIGNhcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS5jYXA7XG5cbmZ1bmN0aW9uIHJlbmRlclRpbWVFbGVtZW50KGNsYXNzTmFtZSwgdGltZSkge1xuICByZXR1cm4gJCgnPGRpdiBjbGFzcz1cInRpbWUgdGltZS0nICsgY2xhc3NOYW1lICsgJ1wiPicgKyB0aW1lICsgJzwvZGl2PicpO1xufVxuXG4vKipcbiAqIFJlbmRlciBhbiBIVE1MIEVsZW1lbnQgZm9yIHRoZSBjdXJyZW50IGNoYXB0ZXJcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlckN1cnJlbnRDaGFwdGVyRWxlbWVudCgpIHtcbiAgdmFyIGNoYXB0ZXJFbGVtZW50ID0gJCgnPGRpdiBjbGFzcz1cImNoYXB0ZXJcIj48L2Rpdj4nKTtcblxuICBpZiAoIXRoaXMuY2hhcHRlck1vZHVsZSkge1xuICAgIHJldHVybiBjaGFwdGVyRWxlbWVudDtcbiAgfVxuXG4gIHZhciBpbmRleCA9IHRoaXMuY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlcjtcbiAgdmFyIGNoYXB0ZXIgPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY2hhcHRlcnNbaW5kZXhdO1xuICBjb25zb2xlLmRlYnVnKCdQcm9ncmVzc2JhcicsICdyZW5kZXJDdXJyZW50Q2hhcHRlckVsZW1lbnQnLCBpbmRleCwgY2hhcHRlcik7XG5cbiAgdGhpcy5jaGFwdGVyQmFkZ2UgPSAkKCc8c3BhbiBjbGFzcz1cImJhZGdlXCI+JyArIChpbmRleCArIDEpICsgJzwvc3Bhbj4nKTtcbiAgdGhpcy5jaGFwdGVyVGl0bGUgPSAkKCc8c3BhbiBjbGFzcz1cImNoYXB0ZXItdGl0bGVcIj4nICsgY2hhcHRlci50aXRsZSArICc8L3NwYW4+Jyk7XG5cbiAgY2hhcHRlckVsZW1lbnRcbiAgICAuYXBwZW5kKHRoaXMuY2hhcHRlckJhZGdlKVxuICAgIC5hcHBlbmQodGhpcy5jaGFwdGVyVGl0bGUpO1xuXG4gIHJldHVybiBjaGFwdGVyRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvZ3Jlc3NJbmZvKHByb2dyZXNzQmFyKSB7XG4gIHZhciBwcm9ncmVzc0luZm8gPSAkKCc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtaW5mb1wiPjwvZGl2PicpO1xuXG4gIHJldHVybiBwcm9ncmVzc0luZm9cbiAgICAuYXBwZW5kKHByb2dyZXNzQmFyLmN1cnJlbnRUaW1lKVxuICAgIC5hcHBlbmQocmVuZGVyQ3VycmVudENoYXB0ZXJFbGVtZW50LmNhbGwocHJvZ3Jlc3NCYXIpKVxuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIuZHVyYXRpb25UaW1lRWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRpbWVzKHByb2dyZXNzQmFyKSB7XG4gIHZhciB0aW1lID0gcHJvZ3Jlc3NCYXIudGltZWxpbmUuZ2V0VGltZSgpO1xuICBwcm9ncmVzc0Jhci5jdXJyZW50VGltZS5odG1sKHRjLmZyb21UaW1lU3RhbXAodGltZSkpO1xuXG4gIGlmIChwcm9ncmVzc0Jhci5zaG93RHVyYXRpb24pIHsgcmV0dXJuOyB9XG5cbiAgdmFyIHJlbWFpbmluZ1RpbWUgPSBNYXRoLmFicyh0aW1lIC0gcHJvZ3Jlc3NCYXIuZHVyYXRpb24pO1xuICBwcm9ncmVzc0Jhci5kdXJhdGlvblRpbWVFbGVtZW50LnRleHQoJy0nICsgdGMuZnJvbVRpbWVTdGFtcChyZW1haW5pbmdUaW1lKSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckR1cmF0aW9uVGltZUVsZW1lbnQocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIGZvcm1hdHRlZER1cmF0aW9uID0gdGMuZnJvbVRpbWVTdGFtcChwcm9ncmVzc0Jhci5kdXJhdGlvbik7XG4gIHZhciBkdXJhdGlvblRpbWVFbGVtZW50ID0gcmVuZGVyVGltZUVsZW1lbnQoJ2R1cmF0aW9uJywgMCk7XG5cbiAgZHVyYXRpb25UaW1lRWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgcHJvZ3Jlc3NCYXIuc2hvd0R1cmF0aW9uID0gIXByb2dyZXNzQmFyLnNob3dEdXJhdGlvbjtcbiAgICBpZiAocHJvZ3Jlc3NCYXIuc2hvd0R1cmF0aW9uKSB7XG4gICAgICBkdXJhdGlvblRpbWVFbGVtZW50LnRleHQoZm9ybWF0dGVkRHVyYXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB1cGRhdGVUaW1lcyhwcm9ncmVzc0Jhcik7XG4gIH0pO1xuXG4gIHJldHVybiBkdXJhdGlvblRpbWVFbGVtZW50O1xufVxuXG5mdW5jdGlvbiByZW5kZXJNYXJrZXJBdCh0aW1lKSB7XG4gIHZhciBwZXJjZW50ID0gMTAwICogdGltZSAvIHRoaXMuZHVyYXRpb247XG4gIHJldHVybiAkKCc8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJsZWZ0OicgKyBwZXJjZW50ICsgJyU7XCI+PC9kaXY+Jyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNoYXB0ZXJNYXJrZXIoY2hhcHRlcikge1xuICByZXR1cm4gcmVuZGVyTWFya2VyQXQuY2FsbCh0aGlzLCBjaGFwdGVyLnN0YXJ0KTtcbn1cblxuLyoqXG4gKiBUaGlzIHVwZGF0ZSBtZXRob2QgaXMgdG8gYmUgY2FsbGVkIHdoZW4gYSBwbGF5ZXJzIGBjdXJyZW50VGltZWAgY2hhbmdlcy5cbiAqL1xuZnVuY3Rpb24gdXBkYXRlICh0aW1lbGluZSkge1xuICB0aGlzLnNldFByb2dyZXNzKHRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIHRoaXMuYnVmZmVyLnZhbCh0aW1lbGluZS5nZXRCdWZmZXJlZCgpKTtcbiAgdGhpcy5zZXRDaGFwdGVyKCk7XG59XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBDcmVhdGVzIGEgbmV3IHByb2dyZXNzIGJhciBvYmplY3QuXG4gKiBAcGFyYW0ge1RpbWVsaW5lfSB0aW1lbGluZSAtIFRoZSBwbGF5ZXJzIHRpbWVsaW5lIHRvIGF0dGFjaCB0by5cbiAqL1xuZnVuY3Rpb24gUHJvZ3Jlc3NCYXIodGltZWxpbmUpIHtcbiAgaWYgKCF0aW1lbGluZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RpbWVsaW5lIG1pc3NpbmcnLCBhcmd1bWVudHMpO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnRpbWVsaW5lID0gdGltZWxpbmU7XG4gIHRoaXMuZHVyYXRpb24gPSB0aW1lbGluZS5kdXJhdGlvbjtcblxuICB0aGlzLmJhciA9IG51bGw7XG4gIHRoaXMuY3VycmVudFRpbWUgPSBudWxsO1xuXG4gIGlmICh0aW1lbGluZS5oYXNDaGFwdGVycykge1xuICAgIC8vIEZJWE1FIGdldCBhY2Nlc3MgdG8gY2hhcHRlck1vZHVsZSByZWxpYWJseVxuICAgIC8vIHRoaXMudGltZWxpbmUuZ2V0TW9kdWxlKCdjaGFwdGVycycpXG4gICAgdGhpcy5jaGFwdGVyTW9kdWxlID0gdGhpcy50aW1lbGluZS5tb2R1bGVzWzBdO1xuICAgIHRoaXMuY2hhcHRlckJhZGdlID0gbnVsbDtcbiAgICB0aGlzLmNoYXB0ZXJUaXRsZSA9IG51bGw7XG4gIH1cblxuICB0aGlzLnNob3dEdXJhdGlvbiA9IGZhbHNlO1xuICB0aGlzLnByb2dyZXNzID0gbnVsbDtcbiAgdGhpcy5idWZmZXIgPSBudWxsO1xuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xufVxuXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUuc2V0SGFuZGxlUG9zaXRpb24gPSBmdW5jdGlvbiAodGltZSkge1xuICB2YXIgcGVyY2VudCA9IHRpbWUgLyB0aGlzLmR1cmF0aW9uICogMTAwO1xuICB2YXIgbmV3TGVmdE9mZnNldCA9IHBlcmNlbnQgKyAnJSc7XG4gIGNvbnNvbGUuZGVidWcoJ1Byb2dyZXNzQmFyJywgJ3NldEhhbmRsZVBvc2l0aW9uJywgJ3RpbWUnLCB0aW1lLCAnbmV3TGVmdE9mZnNldCcsIG5ld0xlZnRPZmZzZXQpO1xuICB0aGlzLmhhbmRsZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0T2Zmc2V0KTtcbn07XG5cbi8qKlxuICogc2V0IHByb2dyZXNzIGJhciB2YWx1ZSwgc2xpZGVyIHBvc2l0aW9uIGFuZCBjdXJyZW50IHRpbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIHRoaXMucHJvZ3Jlc3MudmFsKHRpbWUpO1xuICB0aGlzLnNldEhhbmRsZVBvc2l0aW9uKHRpbWUpO1xuICB1cGRhdGVUaW1lcyh0aGlzKTtcbn07XG5cbi8qKlxuICogc2V0IGNoYXB0ZXIgdGl0bGUgYW5kIGJhZGdlXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY2hhcHRlck1vZHVsZSkgeyByZXR1cm47IH1cblxuICB2YXIgaW5kZXggPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXI7XG4gIHZhciBjaGFwdGVyID0gdGhpcy5jaGFwdGVyTW9kdWxlLmNoYXB0ZXJzW2luZGV4XTtcbiAgdGhpcy5jaGFwdGVyQmFkZ2UudGV4dChpbmRleCArIDEpO1xuICB0aGlzLmNoYXB0ZXJUaXRsZS50ZXh0KGNoYXB0ZXIudGl0bGUpO1xufTtcblxuLyoqXG4gKiBSZW5kZXJzIGEgbmV3IHByb2dyZXNzIGJhciBqUXVlcnkgb2JqZWN0LlxuICovXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuXG4gIC8vIHRpbWUgZWxlbWVudHNcbiAgdmFyIGluaXRpYWxUaW1lID0gdGMuZnJvbVRpbWVTdGFtcCh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIHRoaXMuY3VycmVudFRpbWUgPSByZW5kZXJUaW1lRWxlbWVudCgnY3VycmVudCcsIGluaXRpYWxUaW1lKTtcbiAgdGhpcy5kdXJhdGlvblRpbWVFbGVtZW50ID0gcmVuZGVyRHVyYXRpb25UaW1lRWxlbWVudCh0aGlzKTtcblxuICAvLyBwcm9ncmVzcyBpbmZvXG4gIHZhciBwcm9ncmVzc0luZm8gPSByZW5kZXJQcm9ncmVzc0luZm8odGhpcyk7XG4gIHVwZGF0ZVRpbWVzKHRoaXMpO1xuXG4gIC8vIHRpbWVsaW5lIGFuZCBidWZmZXIgYmFyc1xuICB2YXIgcHJvZ3Jlc3MgPSAkKCc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIj48L2Rpdj4nKTtcbiAgdmFyIHRpbWVsaW5lQmFyID0gJCgnPHByb2dyZXNzIGNsYXNzPVwiY3VycmVudFwiPjwvcHJvZ3Jlc3M+JylcbiAgICAgIC5hdHRyKHsgbWluOiAwLCBtYXg6IHRoaXMuZHVyYXRpb259KTtcbiAgdmFyIGJ1ZmZlciA9ICQoJzxwcm9ncmVzcyBjbGFzcz1cImJ1ZmZlclwiPjwvcHJvZ3Jlc3M+JylcbiAgICAgIC5hdHRyKHttaW46IDAsIG1heDogdGhpcy5kdXJhdGlvbn0pO1xuICB2YXIgaGFuZGxlID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZVwiPjxkaXYgY2xhc3M9XCJpbm5lci1oYW5kbGVcIj48L2Rpdj48L2Rpdj4nKTtcblxuICBwcm9ncmVzc1xuICAgIC5hcHBlbmQodGltZWxpbmVCYXIpXG4gICAgLmFwcGVuZChidWZmZXIpXG4gICAgLmFwcGVuZChoYW5kbGUpO1xuXG4gIHRoaXMucHJvZ3Jlc3MgPSB0aW1lbGluZUJhcjtcbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gIHRoaXMuaGFuZGxlID0gaGFuZGxlO1xuICB0aGlzLnNldFByb2dyZXNzKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcblxuICBpZiAodGhpcy5jaGFwdGVyTW9kdWxlKSB7XG4gICAgdmFyIGNoYXB0ZXJNYXJrZXJzID0gdGhpcy5jaGFwdGVyTW9kdWxlLmNoYXB0ZXJzLm1hcChyZW5kZXJDaGFwdGVyTWFya2VyLCB0aGlzKTtcbiAgICBjaGFwdGVyTWFya2Vycy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3Qgb25lXG4gICAgcHJvZ3Jlc3MuYXBwZW5kKGNoYXB0ZXJNYXJrZXJzKTtcbiAgfVxuXG4gIC8vIHByb2dyZXNzIGJhclxuICB2YXIgYmFyID0gJCgnPGRpdiBjbGFzcz1cInByb2dyZXNzYmFyXCI+PC9kaXY+Jyk7XG4gIGJhclxuICAgIC5hcHBlbmQocHJvZ3Jlc3NJbmZvKVxuICAgIC5hcHBlbmQocHJvZ3Jlc3MpO1xuXG4gIHRoaXMuYmFyID0gYmFyO1xuICByZXR1cm4gYmFyO1xufTtcblxuUHJvZ3Jlc3NCYXIucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbW91c2VJc0Rvd24gPSBmYWxzZTtcbiAgdmFyIHRpbWVsaW5lID0gdGhpcy50aW1lbGluZTtcbiAgdmFyIHByb2dyZXNzID0gdGhpcy5wcm9ncmVzcztcblxuICBmdW5jdGlvbiBjYWxjdWxhdGVOZXdUaW1lIChwYWdlWCkge1xuICAgIC8vIG1vdXNlIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSBvYmplY3RcbiAgICB2YXIgd2lkdGggPSBwcm9ncmVzcy5vdXRlcldpZHRoKHRydWUpO1xuICAgIHZhciBvZmZzZXQgPSBwcm9ncmVzcy5vZmZzZXQoKTtcbiAgICB2YXIgcG9zID0gY2FwKHBhZ2VYIC0gb2Zmc2V0LmxlZnQsIDAsIHdpZHRoKTtcbiAgICB2YXIgcGVyY2VudGFnZSA9IChwb3MgLyB3aWR0aCk7XG4gICAgcmV0dXJuIHBlcmNlbnRhZ2UgKiB0aW1lbGluZS5kdXJhdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZSAoZXZlbnQpIHtcbiAgICBpZiAodHlwZW9mIHRpbWVsaW5lLmR1cmF0aW9uICE9PSAnbnVtYmVyJyB8fCAhbW91c2VJc0Rvd24gKSB7IHJldHVybjsgfVxuICAgIHZhciBuZXdUaW1lID0gY2FsY3VsYXRlTmV3VGltZShldmVudC5wYWdlWCk7XG4gICAgaWYgKG5ld1RpbWUgPT09IHRpbWVsaW5lLmdldFRpbWUoKSkgeyByZXR1cm47IH1cbiAgICB0aW1lbGluZS5zZWVrKG5ld1RpbWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2Vla1N0YXJ0ICgpIHtcbiAgICB0aW1lbGluZS5zZWVrU3RhcnQoKTtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLmJpbmQoJ21vdXNlbW92ZS5kdXInLCBoYW5kbGVNb3VzZU1vdmUpXG4gICAgICAuYmluZCgndG91Y2htb3ZlLmR1cicsIGhhbmRsZU1vdXNlTW92ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZVVwICgpIHtcbiAgICBtb3VzZUlzRG93biA9IGZhbHNlO1xuICAgIHRpbWVsaW5lLnNlZWtFbmQoKTtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLnVuYmluZCgndG91Y2hlbmQuZHVyJylcbiAgICAgIC51bmJpbmQoJ21vdXNldXAuZHVyJylcbiAgICAgIC51bmJpbmQoJ3RvdWNobW92ZS5kdXInKVxuICAgICAgLnVuYmluZCgnbW91c2Vtb3ZlLmR1cicpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VEb3duIChldmVudCkge1xuICAgIC8vIG9ubHkgaGFuZGxlIGxlZnQgY2xpY2tzXG4gICAgaWYgKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxuXG4gICAgbW91c2VJc0Rvd24gPSB0cnVlO1xuICAgIGhhbmRsZU1vdXNlTW92ZShldmVudCk7XG4gICAgc2Vla1N0YXJ0KCk7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC5iaW5kKCdtb3VzZXVwLmR1cicsIGhhbmRsZU1vdXNlVXApXG4gICAgICAuYmluZCgndG91Y2hlbmQuZHVyJywgaGFuZGxlTW91c2VVcCk7XG4gIH1cblxuICAvLyBoYW5kbGUgY2xpY2sgYW5kIGRyYWcgd2l0aCBtb3VzZSBvciB0b3VjaCBpbiBwcm9ncmVzc2JhciBhbmQgb24gaGFuZGxlXG4gIHRoaXMucHJvZ3Jlc3NcbiAgICAuYmluZCgndG91Y2hzdGFydCcsIGhhbmRsZU1vdXNlRG93bilcbiAgICAuYmluZCgnbW91c2Vkb3duJywgaGFuZGxlTW91c2VEb3duKTtcblxuICB0aGlzLmhhbmRsZVxuICAgIC5iaW5kKCd0b3VjaHN0YXJ0JywgaGFuZGxlTW91c2VEb3duKVxuICAgIC5iaW5kKCdtb3VzZWRvd24nLCBoYW5kbGVNb3VzZURvd24pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9ncmVzc0JhcjtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL3Byb2dyZXNzYmFyLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTYXZpbmcgdGhlIHBsYXl0aW1lXG4gKi9cbnZhciBwcmVmaXggPSAncG9kbG92ZS13ZWItcGxheWVyLXBsYXl0aW1lLSc7XG5cbmZ1bmN0aW9uIGdldEl0ZW0gKCkge1xuICByZXR1cm4gK2xvY2FsU3RvcmFnZVt0aGlzLmtleV07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUl0ZW0gKCkge1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5rZXkpO1xufVxuXG5mdW5jdGlvbiBoYXNJdGVtICgpIHtcbiAgcmV0dXJuICh0aGlzLmtleSkgaW4gbG9jYWxTdG9yYWdlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUgKCkge1xuICBjb25zb2xlLmRlYnVnKCdTYXZlVGltZScsICd1cGRhdGUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIHRoaXMuc2V0SXRlbSh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG59XG5cbmZ1bmN0aW9uIFNhdmVUaW1lKHRpbWVsaW5lLCBwYXJhbXMpIHtcbiAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lO1xuICB0aGlzLmtleSA9IHByZWZpeCArIHBhcmFtcy5wZXJtYWxpbms7XG4gIHRoaXMuZ2V0SXRlbSA9IGdldEl0ZW0uYmluZCh0aGlzKTtcbiAgdGhpcy5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbS5iaW5kKHRoaXMpO1xuICB0aGlzLmhhc0l0ZW0gPSBoYXNJdGVtLmJpbmQodGhpcyk7XG4gIHRoaXMudXBkYXRlID0gdXBkYXRlLmJpbmQodGhpcyk7XG5cbiAgLy8gc2V0IHRoZSB0aW1lIG9uIHN0YXJ0XG4gIGlmICh0aGlzLmhhc0l0ZW0oKSkge1xuICAgIHRpbWVsaW5lLnNldFRpbWUodGhpcy5nZXRJdGVtKCkpO1xuICB9XG59XG5cblNhdmVUaW1lLnByb3RvdHlwZS5zZXRJdGVtID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGxvY2FsU3RvcmFnZVt0aGlzLmtleV0gPSB2YWx1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZVRpbWU7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9zYXZldGltZS5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBUYWIgPSByZXF1aXJlKCcuLi90YWInKVxuICAsIFNvY2lhbEJ1dHRvbkxpc3QgPSByZXF1aXJlKCcuLi9zb2NpYWwtYnV0dG9uLWxpc3QnKTtcblxudmFyIHNlcnZpY2VzID0gWyd0d2l0dGVyJywgJ2ZhY2Vib29rJywgJ2dwbHVzJywgJ3R1bWJscicsICdlbWFpbCddXG4gICwgc2hhcmVPcHRpb25zID0gW1xuICAgIHtuYW1lOiAnU2hvdycsIHZhbHVlOiAnc2hvdyd9LFxuICAgIHtuYW1lOiAnRXBpc29kZScsIHZhbHVlOiAnZXBpc29kZScsIGRlZmF1bHQ6IHRydWV9LFxuICAgIHtuYW1lOiAnQ2hhcHRlcicsIHZhbHVlOiAnY2hhcHRlcicsIGRpc2FibGVkOiB0cnVlfSxcbiAgICB7bmFtZTogJ0V4YWN0bHkgdGhpcyBwYXJ0IGhlcmUnLCB2YWx1ZTogJ3RpbWVkJywgZGlzYWJsZWQ6IHRydWV9XG4gIF1cbiAgLCBzaGFyZURhdGEgPSB7fTtcblxuLy8gbW9kdWxlIGdsb2JhbHNcbnZhciBzZWxlY3RlZE9wdGlvbiwgc2hhcmVCdXR0b25zLCBsaW5rSW5wdXQ7XG5cbmZ1bmN0aW9uIGdldFNoYXJlRGF0YSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09ICdzaG93Jykge1xuICAgIHJldHVybiBzaGFyZURhdGEuc2hvdztcbiAgfVxuICB2YXIgZGF0YSA9IHNoYXJlRGF0YS5lcGlzb2RlO1xuICAvLyB0b2RvIGFkZCBjaGFwdGVyIHN0YXJ0IGFuZCBlbmQgdGltZSB0byB1cmxcbiAgLy9pZiAodmFsdWUgPT09ICdjaGFwdGVyJykge1xuICAvL31cbiAgLy8gdG9kbyBhZGQgc2VsZWN0ZWQgc3RhcnQgYW5kIGVuZCB0aW1lIHRvIHVybFxuICAvL2lmICh2YWx1ZSA9PT0gJ3RpbWVkJykge1xuICAvL31cbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVVybHMoZGF0YSkge1xuICBzaGFyZUJ1dHRvbnMudXBkYXRlKGRhdGEpO1xuICBsaW5rSW5wdXQudXBkYXRlKGRhdGEpO1xufVxuXG5mdW5jdGlvbiBvblNoYXJlT3B0aW9uQ2hhbmdlVG8gKGVsZW1lbnQsIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gZ2V0U2hhcmVEYXRhKHZhbHVlKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ3NoYXJpbmcgb3B0aW9ucyBjaGFuZ2VkJywgdmFsdWUpO1xuICAgIHNlbGVjdGVkT3B0aW9uLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgc2VsZWN0ZWRPcHRpb24gPSBlbGVtZW50O1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXBkYXRlVXJscyhkYXRhKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgaHRtbCBmb3IgYW4gcG9zdGVyIGltYWdlXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAnZXBpc29kZScgb3IgJ3Nob3cnXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIVE1MIGZvciB0aGUgaW1hZ2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlUG9zdGVyRm9yKHR5cGUpIHtcbiAgdmFyIGRhdGEgPSBzaGFyZURhdGFbdHlwZV07XG4gIGlmICghdHlwZSB8fCAhZGF0YSB8fCAhZGF0YS5wb3N0ZXIpIHtcbiAgICBjb25zb2xlLndhcm4oJ2Nhbm5vdCBjcmVhdGUgcG9zdGVyIGZvcicsIHR5cGUpO1xuICAgIHJldHVybiAnJztcbiAgfVxuICBjb25zb2xlLmxvZygnY3JlYXRlIHBvc3RlciBmb3InLCB0eXBlLCAnID4gdXJsJywgZGF0YS5wb3N0ZXIpO1xuICByZXR1cm4gJzxpbWcgc3JjPVwiJyArIGRhdGEucG9zdGVyICsgJ1wiIGRhdGEtaW1nPVwiJyArIGRhdGEucG9zdGVyICsgJ1wiIGFsdD1cIlBvc3RlciBJbWFnZVwiPic7XG59XG5cbi8qKlxuICogY3JlYXRlIHNoYXJpbmcgYnV0dG9uXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uIHNoYXJpbmcgb3B0aW9uIGRlZmluaXRpb25cbiAqIEByZXR1cm5zIHtqUXVlcnl9IHNoYXJlIGJ1dHRvbiByZWZlcmVuY2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlT3B0aW9uKG9wdGlvbikge1xuICBpZiAob3B0aW9uLmRpc2FibGVkKSB7XG4gICAgY29uc29sZS5sb2coJ1NoYXJlJywgJ2NyZWF0ZU9wdGlvbicsICdvbWl0IGRpc2FibGVkIG9wdGlvbicsIG9wdGlvbi5uYW1lKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBkYXRhID0gZ2V0U2hhcmVEYXRhKG9wdGlvbi52YWx1ZSk7XG5cbiAgaWYgKCFkYXRhKSB7XG4gICAgY29uc29sZS5sb2coJ1NoYXJlJywgJ2NyZWF0ZU9wdGlvbicsICdvbWl0IG9wdGlvbiB3aXRob3V0IGRhdGEnLCBvcHRpb24ubmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgZWxlbWVudCA9ICQoJzxkaXYgY2xhc3M9XCJzaGFyZS1zZWxlY3Qtb3B0aW9uXCI+JyArIGNyZWF0ZVBvc3RlckZvcihvcHRpb24udmFsdWUpICtcbiAgICAgICc8c3Bhbj5TaGFyZSB0aGlzICcgKyBvcHRpb24ubmFtZSArICc8L3NwYW4+JyArXG4gICAgJzwvZGl2PicpO1xuXG4gIGlmIChvcHRpb24uZGVmYXVsdCkge1xuICAgIHNlbGVjdGVkT3B0aW9uID0gZWxlbWVudDtcbiAgICBlbGVtZW50LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIHVwZGF0ZVVybHMoZGF0YSk7XG4gIH1cbiAgZWxlbWVudC5vbignY2xpY2snLCBvblNoYXJlT3B0aW9uQ2hhbmdlVG8oZWxlbWVudCwgb3B0aW9uLnZhbHVlKSk7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gaHRtbCBkaXYgZWxlbWVudCB0byB3cmFwIGFsbCBzaGFyZSBidXR0b25zXG4gKiBAcmV0dXJucyB7alF1ZXJ5fEhUTUxFbGVtZW50fSBzaGFyZSBidXR0b24gd3JhcHBlciByZWZlcmVuY2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2hhcmVCdXR0b25XcmFwcGVyKCkge1xuICB2YXIgZGl2ID0gJCgnPGRpdiBjbGFzcz1cInNoYXJlLWJ1dHRvbi13cmFwcGVyXCI+PC9kaXY+Jyk7XG4gIGRpdi5hcHBlbmQoc2hhcmVPcHRpb25zLm1hcChjcmVhdGVPcHRpb24pKTtcblxuICByZXR1cm4gZGl2O1xufVxuXG4vKipcbiAqIGNyZWF0ZSBzaGFyaW5nIGJ1dHRvbnMgaW4gYSBmb3JtXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBmb3JtIGVsZW1lbnQgcmVmZXJlbmNlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNoYXJlT3B0aW9ucygpIHtcbiAgdmFyIGZvcm0gPSAkKCc8Zm9ybT4nICtcbiAgICAnPGxlZ2VuZD5XaGF0IHdvdWxkIHlvdSBsaWtlIHRvIHNoYXJlPzwvbGVnZW5kPicgK1xuICAnPC9mb3JtPicpO1xuICBmb3JtLmFwcGVuZChjcmVhdGVTaGFyZUJ1dHRvbldyYXBwZXIpO1xuICByZXR1cm4gZm9ybTtcbn1cblxuLyoqXG4gKiBidWlsZCBhbmQgcmV0dXJuIHRhYiBpbnN0YW5jZSBmb3Igc2hhcmluZ1xuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBwbGF5ZXIgY29uZmlndXJhdGlvblxuICogQHJldHVybnMge251bGx8VGFifSBzaGFyaW5nIHRhYiBpbnN0YW5jZSBvciBudWxsIGlmIHBlcm1hbGluayBtaXNzaW5nIG9yIHNoYXJpbmcgZGlzYWJsZWRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2hhcmVUYWIocGFyYW1zKSB7XG4gIGlmICghcGFyYW1zLnBlcm1hbGluayB8fCBwYXJhbXMuaGlkZXNoYXJlYnV0dG9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgc2hhcmVUYWIgPSBuZXcgVGFiKHtcbiAgICBpY29uOiAncHdwLXNoYXJlJyxcbiAgICB0aXRsZTogJ1Nob3cvaGlkZSBzaGFyaW5nIHRhYnMnLFxuICAgIG5hbWU6ICdwb2Rsb3Zld2VicGxheWVyX3NoYXJlJyxcbiAgICBoZWFkbGluZTogJ1NoYXJlJ1xuICB9KTtcblxuICBzaGFyZUJ1dHRvbnMgPSBuZXcgU29jaWFsQnV0dG9uTGlzdChzZXJ2aWNlcywgZ2V0U2hhcmVEYXRhKCdlcGlzb2RlJykpO1xuICBsaW5rSW5wdXQgPSAkKCc8aDM+TGluazwvaDM+JyArXG4gICAgJzxpbnB1dCB0eXBlPVwidXJsXCIgbmFtZT1cInNoYXJlLWxpbmstdXJsXCIgcmVhZG9ubHk+Jyk7XG4gIGxpbmtJbnB1dC51cGRhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy52YWwoZGF0YS5yYXdVcmwpO1xuICB9O1xuXG4gIHNoYXJlVGFiLmNyZWF0ZU1haW5Db250ZW50KCcnKS5hcHBlbmQoY3JlYXRlU2hhcmVPcHRpb25zKCkpO1xuICBzaGFyZVRhYi5jcmVhdGVGb290ZXIoJzxoMz5TaGFyZSB2aWEgLi4uPC9oMz4nKS5hcHBlbmQoc2hhcmVCdXR0b25zLmxpc3QpLmFwcGVuZChsaW5rSW5wdXQpO1xuXG4gIHJldHVybiBzaGFyZVRhYjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaGFyZShwYXJhbXMpIHtcbiAgc2hhcmVEYXRhLmVwaXNvZGUgPSB7XG4gICAgcG9zdGVyOiBwYXJhbXMucG9zdGVyLFxuICAgIHRpdGxlOiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnRpdGxlKSxcbiAgICB1cmw6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMucGVybWFsaW5rKSxcbiAgICByYXdVcmw6IHBhcmFtcy5wZXJtYWxpbmssXG4gICAgdGV4dDogZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy50aXRsZSArICcgJyArIHBhcmFtcy5wZXJtYWxpbmspXG4gIH07XG4gIHNoYXJlRGF0YS5jaGFwdGVycyA9IHBhcmFtcy5jaGFwdGVycztcblxuICBpZiAocGFyYW1zLnNob3cudXJsKSB7XG4gICAgc2hhcmVEYXRhLnNob3cgPSB7XG4gICAgICBwb3N0ZXI6IHBhcmFtcy5zaG93LnBvc3RlcixcbiAgICAgIHRpdGxlOiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnNob3cudGl0bGUpLFxuICAgICAgdXJsOiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnNob3cudXJsKSxcbiAgICAgIHJhd1VybDogcGFyYW1zLnNob3cudXJsLFxuICAgICAgdGV4dDogZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5zaG93LnRpdGxlICsgJyAnICsgcGFyYW1zLnNob3cudXJsKVxuICAgIH07XG4gIH1cblxuICBzZWxlY3RlZE9wdGlvbiA9ICdlcGlzb2RlJztcbiAgdGhpcy50YWIgPSBjcmVhdGVTaGFyZVRhYihwYXJhbXMpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL3NoYXJlLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGVtYmVkID0gcmVxdWlyZSgnLi9lbWJlZCcpLFxuICBwYXJzZVRpbWVjb2RlID0gcmVxdWlyZSgnLi90aW1lY29kZScpLnBhcnNlO1xuXG4vKipcbiAqIHBsYXllclxuICovXG52YXJcbi8vIEtlZXAgYWxsIFBsYXllcnMgb24gc2l0ZSAtIGZvciBpbmxpbmUgcGxheWVyc1xuLy8gZW1iZWRkZWQgcGxheWVycyBhcmUgcmVnaXN0ZXJlZCBpbiBwb2Rsb3ZlLXdlYnBsYXllci1tb2RlcmF0b3IgaW4gdGhlIGVtYmVkZGluZyBwYWdlXG4gIHBsYXllcnMgPSBbXSxcbi8vIGFsbCB1c2VkIGZ1bmN0aW9uc1xuICBtZWpzb3B0aW9ucyA9IHtcbiAgICBkZWZhdWx0VmlkZW9XaWR0aDogNDgwLFxuICAgIGRlZmF1bHRWaWRlb0hlaWdodDogMjcwLFxuICAgIHZpZGVvV2lkdGg6IC0xLFxuICAgIHZpZGVvSGVpZ2h0OiAtMSxcbiAgICBhdWRpb1dpZHRoOiAtMSxcbiAgICBhdWRpb0hlaWdodDogMzAsXG4gICAgc3RhcnRWb2x1bWU6IDAuOCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBlbmFibGVBdXRvc2l6ZTogdHJ1ZSxcbiAgICBmZWF0dXJlczogWydwbGF5cGF1c2UnLCAnY3VycmVudCcsICdwcm9ncmVzcycsICdkdXJhdGlvbicsICd0cmFja3MnLCAnZnVsbHNjcmVlbiddLFxuICAgIGFsd2F5c1Nob3dDb250cm9sczogZmFsc2UsXG4gICAgaVBhZFVzZU5hdGl2ZUNvbnRyb2xzOiBmYWxzZSxcbiAgICBpUGhvbmVVc2VOYXRpdmVDb250cm9sczogZmFsc2UsXG4gICAgQW5kcm9pZFVzZU5hdGl2ZUNvbnRyb2xzOiBmYWxzZSxcbiAgICBhbHdheXNTaG93SG91cnM6IGZhbHNlLFxuICAgIHNob3dUaW1lY29kZUZyYW1lQ291bnQ6IGZhbHNlLFxuICAgIGZyYW1lc1BlclNlY29uZDogMjUsXG4gICAgZW5hYmxlS2V5Ym9hcmQ6IHRydWUsXG4gICAgcGF1c2VPdGhlclBsYXllcnM6IHRydWUsXG4gICAgZHVyYXRpb246IGZhbHNlLFxuICAgIHBsdWdpbnM6IFsnZmxhc2gnLCAnc2lsdmVybGlnaHQnXSxcbiAgICBwbHVnaW5QYXRoOiAnLi9iaW4vJyxcbiAgICBmbGFzaE5hbWU6ICdmbGFzaG1lZGlhZWxlbWVudC5zd2YnLFxuICAgIHNpbHZlcmxpZ2h0TmFtZTogJ3NpbHZlcmxpZ2h0bWVkaWFlbGVtZW50LnhhcCdcbiAgfSxcbiAgZGVmYXVsdHMgPSB7XG4gICAgY2hhcHRlcmxpbmtzOiAnYWxsJyxcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIGR1cmF0aW9uOiBmYWxzZSxcbiAgICBjaGFwdGVyc1Zpc2libGU6IGZhbHNlLFxuICAgIHRpbWVjb250cm9sc1Zpc2libGU6IGZhbHNlLFxuICAgIHNoYXJlYnV0dG9uc1Zpc2libGU6IGZhbHNlLFxuICAgIGRvd25sb2FkYnV0dG9uc1Zpc2libGU6IGZhbHNlLFxuICAgIHN1bW1hcnlWaXNpYmxlOiBmYWxzZSxcbiAgICBoaWRldGltZWJ1dHRvbjogZmFsc2UsXG4gICAgaGlkZWRvd25sb2FkYnV0dG9uOiBmYWxzZSxcbiAgICBoaWRlc2hhcmVidXR0b246IGZhbHNlLFxuICAgIHNoYXJld2hvbGVlcGlzb2RlOiBmYWxzZSxcbiAgICBzb3VyY2VzOiBbXVxuICB9O1xuXG4vKipcbiAqIHJlbW92ZSAncHgnIHVuaXQsIHNldCB3aXRkdGggdG8gMTAwJSBmb3IgJ2F1dG8nXG4gKiBAcGFyYW0ge3N0cmluZ30gd2lkdGhcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVdpZHRoKHdpZHRoKSB7XG4gIGlmICh3aWR0aC50b0xvd2VyQ2FzZSgpID09PSAnYXV0bycpIHtcbiAgICByZXR1cm4gJzEwMCUnO1xuICB9XG4gIHJldHVybiB3aWR0aC5yZXBsYWNlKCdweCcsICcnKTtcbn1cblxuLyoqXG4gKiBhdWRpbyBvciB2aWRlbyB0YWdcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBsYXllclxuICogQHJldHVybnMge3N0cmluZ30gJ2F1ZGlvJyB8ICd2aWRlbydcbiAqL1xuZnVuY3Rpb24gZ2V0UGxheWVyVHlwZSAocGxheWVyKSB7XG4gIHJldHVybiBwbGF5ZXIudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vKipcbiAqIGtpbGwgcGxheS9wYXVzZSBidXR0b24gZnJvbSBtaW5pcGxheWVyXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiByZW1vdmVQbGF5UGF1c2Uob3B0aW9ucykge1xuICAkLmVhY2gob3B0aW9ucy5mZWF0dXJlcywgZnVuY3Rpb24gKGkpIHtcbiAgICBpZiAodGhpcyA9PT0gJ3BsYXlwYXVzZScpIHtcbiAgICAgIG9wdGlvbnMuZmVhdHVyZXMuc3BsaWNlKGksIDEpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogcGxheWVyIGVycm9yIGhhbmRsaW5nIGZ1bmN0aW9uXG4gKiB3aWxsIHJlbW92ZSB0aGUgdG9wbW9zdCBtZWRpYWZpbGUgZnJvbSBzcmMgb3Igc291cmNlIGxpc3RcbiAqIHBvc3NpYmxlIGZpeCBmb3IgRmlyZWZveCBBQUMgaXNzdWVzXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZVVucGxheWFibGVNZWRpYSgpIHtcbiAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgaWYgKCR0aGlzLmF0dHIoJ3NyYycpKSB7XG4gICAgJHRoaXMucmVtb3ZlQXR0cignc3JjJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBzb3VyY2VMaXN0ID0gJHRoaXMuY2hpbGRyZW4oJ3NvdXJjZScpO1xuICBpZiAoc291cmNlTGlzdC5sZW5ndGgpIHtcbiAgICBzb3VyY2VMaXN0LmZpcnN0KCkucmVtb3ZlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlKHBsYXllciwgcGFyYW1zLCBjYWxsYmFjaykge1xuICB2YXIganFQbGF5ZXIsXG4gICAgcGxheWVyVHlwZSA9IGdldFBsYXllclR5cGUocGxheWVyKSxcbiAgICBzZWNBcnJheSxcbiAgICB3cmFwcGVyO1xuXG4gIGpxUGxheWVyID0gJChwbGF5ZXIpO1xuICB3cmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPjwvZGl2PicpO1xuICBqcVBsYXllci5yZXBsYWNlV2l0aCh3cmFwcGVyKTtcblxuICAvL2ZpbmUgdHVuaW5nIHBhcmFtc1xuICBwYXJhbXMud2lkdGggPSBub3JtYWxpemVXaWR0aChwYXJhbXMud2lkdGgpO1xuICBpZiAocGxheWVyVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgIC8vIEZJWE1FOiBTaW5jZSB0aGUgcGxheWVyIGlzIG5vIGxvbmdlciB2aXNpYmxlIGl0IGhhcyBubyB3aWR0aFxuICAgIGlmIChwYXJhbXMuYXVkaW9XaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbXMud2lkdGggPSBwYXJhbXMuYXVkaW9XaWR0aDtcbiAgICB9XG4gICAgbWVqc29wdGlvbnMuYXVkaW9XaWR0aCA9IHBhcmFtcy53aWR0aDtcbiAgICAvL2tpbGwgZnVsbHNjcmVlbiBidXR0b25cbiAgICAkLmVhY2gobWVqc29wdGlvbnMuZmVhdHVyZXMsIGZ1bmN0aW9uIChpKSB7XG4gICAgICBpZiAodGhpcyA9PT0gJ2Z1bGxzY3JlZW4nKSB7XG4gICAgICAgIG1lanNvcHRpb25zLmZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZW1vdmVQbGF5UGF1c2UobWVqc29wdGlvbnMpO1xuICB9XG4gIGVsc2UgaWYgKHBsYXllclR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAvL3ZpZGVvIHBhcmFtc1xuICAgIGlmIChmYWxzZSAmJiBwYXJhbXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1lanNvcHRpb25zLnZpZGVvV2lkdGggPSBwYXJhbXMud2lkdGg7XG4gICAgICBtZWpzb3B0aW9ucy52aWRlb0hlaWdodCA9IHBhcmFtcy5oZWlnaHQ7XG4gICAgfVxuICAgIC8vIEZJWE1FXG4gICAgaWYgKGZhbHNlICYmICQocGxheWVyKS5hdHRyKCd3aWR0aCcpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhcmFtcy53aWR0aCA9ICQocGxheWVyKS5hdHRyKCd3aWR0aCcpO1xuICAgIH1cbiAgfVxuXG4gIC8vZHVyYXRpb24gY2FuIGJlIGdpdmVuIGluIHNlY29uZHMgb3IgaW4gTlBUIGZvcm1hdFxuICBpZiAocGFyYW1zLmR1cmF0aW9uICYmIHBhcmFtcy5kdXJhdGlvbiAhPT0gcGFyc2VJbnQocGFyYW1zLmR1cmF0aW9uLCAxMCkpIHtcbiAgICBzZWNBcnJheSA9IHBhcnNlVGltZWNvZGUocGFyYW1zLmR1cmF0aW9uKTtcbiAgICBwYXJhbXMuZHVyYXRpb24gPSBzZWNBcnJheVswXTtcbiAgfVxuXG4gIC8vT3ZlcndyaXRlIE1FSlMgZGVmYXVsdCB2YWx1ZXMgd2l0aCBhY3R1YWwgZGF0YVxuICAkLmVhY2gobWVqc29wdGlvbnMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5IGluIHBhcmFtcykge1xuICAgICAgbWVqc29wdGlvbnNba2V5XSA9IHBhcmFtc1trZXldO1xuICAgIH1cbiAgfSk7XG5cbiAgLy93cmFwcGVyIGFuZCBpbml0IHN0dWZmXG4gIC8vIEZJWE1FOiBiZXR0ZXIgY2hlY2sgZm9yIG51bWVyaWNhbCB2YWx1ZVxuICBpZiAocGFyYW1zLndpZHRoLnRvU3RyaW5nKCkudHJpbSgpID09PSBwYXJzZUludChwYXJhbXMud2lkdGgsIDEwKS50b1N0cmluZygpKSB7XG4gICAgcGFyYW1zLndpZHRoID0gcGFyc2VJbnQocGFyYW1zLndpZHRoLCAxMCkgKyAncHgnO1xuICB9XG5cbiAgcGxheWVycy5wdXNoKHBsYXllcik7XG5cbiAgLy9hZGQgcGFyYW1zIGZyb20gYXVkaW8gYW5kIHZpZGVvIGVsZW1lbnRzXG4gIGpxUGxheWVyLmZpbmQoJ3NvdXJjZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgIGlmICghcGFyYW1zLnNvdXJjZXMpIHtcbiAgICAgIHBhcmFtcy5zb3VyY2VzID0gW107XG4gICAgfVxuICAgIHBhcmFtcy5zb3VyY2VzLnB1c2goJCh0aGlzKS5hdHRyKCdzcmMnKSk7XG4gIH0pO1xuXG4gIHBhcmFtcy50eXBlID0gcGxheWVyVHlwZTtcbiAgLy8gaW5pdCBNRUpTIHRvIHBsYXllclxuICBtZWpzb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24gKHBsYXllckVsZW1lbnQpIHtcbiAgICBqcVBsYXllci5vbignZXJyb3InLCByZW1vdmVVbnBsYXlhYmxlTWVkaWEpOyAgIC8vIFRoaXMgbWlnaHQgYmUgYSBmaXggdG8gc29tZSBGaXJlZm94IEFBQyBpc3N1ZXMuXG4gICAgY2FsbGJhY2socGxheWVyRWxlbWVudCwgcGFyYW1zLCB3cmFwcGVyKTtcbiAgfTtcbiAgdmFyIG1lID0gbmV3IE1lZGlhRWxlbWVudChwbGF5ZXIsIG1lanNvcHRpb25zKTtcbiAgY29uc29sZS5sb2cobWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBjcmVhdGUsXG4gIGRlZmF1bHRzOiBkZWZhdWx0cyxcbiAgcGxheWVyczogcGxheWVyc1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9wbGF5ZXIuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBzb2NpYWxOZXR3b3JrcyA9IHJlcXVpcmUoJy4vc29jaWFsLW5ldHdvcmtzJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbldpdGgob3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24gKHNlcnZpY2VOYW1lKSB7XG4gICAgdmFyIHNlcnZpY2UgPSBzb2NpYWxOZXR3b3Jrcy5nZXQoc2VydmljZU5hbWUpO1xuICAgIHJldHVybiBzZXJ2aWNlLmdldEJ1dHRvbihvcHRpb25zKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gU29jaWFsQnV0dG9uTGlzdCAoc2VydmljZXMsIG9wdGlvbnMpIHtcbiAgdmFyIGNyZWF0ZUJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbldpdGgob3B0aW9ucyk7XG4gIHRoaXMuYnV0dG9ucyA9IHNlcnZpY2VzLm1hcChjcmVhdGVCdXR0b24pO1xuXG4gIHRoaXMubGlzdCA9ICQoJzx1bD48L3VsPicpO1xuICB0aGlzLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgdmFyIGxpc3RFbGVtZW50ID0gJCgnPGxpPjwvbGk+JykuYXBwZW5kKGJ1dHRvbi5lbGVtZW50KTtcbiAgICB0aGlzLmxpc3QuYXBwZW5kKGxpc3RFbGVtZW50KTtcbiAgfSwgdGhpcyk7XG59XG5cblNvY2lhbEJ1dHRvbkxpc3QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHRoaXMuYnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICBidXR0b24udXBkYXRlVXJsKG9wdGlvbnMpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU29jaWFsQnV0dG9uTGlzdDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9zb2NpYWwtYnV0dG9uLWxpc3QuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbiAob3B0aW9ucykge1xuICByZXR1cm4gJCgnPGEgY2xhc3M9XCJwd3AtY29udHJhc3QtJyArIG9wdGlvbnMuaWNvbiArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJyArIG9wdGlvbnMudXJsICsgJ1wiICcgK1xuICAndGl0bGU9XCInICsgb3B0aW9ucy50aXRsZSArICdcIj48aSBjbGFzcz1cImljb24gcHdwLScgKyBvcHRpb25zLmljb24gKyAnXCI+PC9pPjwvYT4nICtcbiAgJzxzcGFuPicgKyBvcHRpb25zLnRpdGxlICsgJzwvc3Bhbj4nKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9iamVjdCB0byBpbnRlcmFjdCB3aXRoIGEgc29jaWFsIG5ldHdvcmtcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIEljb24sIHRpdGxlIHByb2ZpbGUtIGFuZCBzaGFyaW5nLVVSTC10ZW1wbGF0ZXNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBTb2NpYWxOZXR3b3JrIChvcHRpb25zKSB7XG4gIHRoaXMuaWNvbiA9IG9wdGlvbnMuaWNvbjtcbiAgdGhpcy50aXRsZSA9IG9wdGlvbnMudGl0bGU7XG4gIHRoaXMudXJsID0gb3B0aW9ucy5wcm9maWxlVXJsO1xuICB0aGlzLnNoYXJlVXJsID0gb3B0aW9ucy5zaGFyZVVybDtcbn1cblxuLyoqXG4gKiBidWlsZCBVUkwgZm9yIHNoYXJpbmcgYSB0ZXh0LCBhIHRpdGxlIGFuZCBhIHVybFxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgY29udGVudHMgdG8gYmUgc2hhcmVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBVUkwgdG8gc2hhcmUgdGhlIGNvbnRlbnRzXG4gKi9cblNvY2lhbE5ldHdvcmsucHJvdG90eXBlLmdldFNoYXJlVXJsID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdmFyIHNoYXJlVXJsID0gdGhpcy5zaGFyZVVybFxuICAgIC5yZXBsYWNlKCckdGV4dCQnLCBvcHRpb25zLnRleHQpXG4gICAgLnJlcGxhY2UoJyR0aXRsZSQnLCBvcHRpb25zLnRpdGxlKVxuICAgIC5yZXBsYWNlKCckdXJsJCcsIG9wdGlvbnMudXJsKTtcbiAgcmV0dXJuIHRoaXMudXJsICsgc2hhcmVVcmw7XG59O1xuXG4vKipcbiAqIGJ1aWxkIFVSTCB0byBhIGdpdmVuIHByb2ZpbGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9maWxlIFVzZXJuYW1lIHRvIGxpbmsgdG9cbiAqIEByZXR1cm5zIHtzdHJpbmd9IHByb2ZpbGUgVVJMXG4gKi9cblNvY2lhbE5ldHdvcmsucHJvdG90eXBlLmdldFByb2ZpbGVVcmwgPSBmdW5jdGlvbiAocHJvZmlsZSkge1xuICByZXR1cm4gdGhpcy51cmwgKyBwcm9maWxlO1xufTtcblxuLyoqXG4gKiBnZXQgcHJvZmlsZSBidXR0b24gZWxlbWVudFxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgb3B0aW9ucy5wcm9maWxlIGRlZmluZXMgdGhlIHByb2ZpbGUgdGhlIGJ1dHRvbiBsaW5rcyB0b1xuICogQHJldHVybnMge3tlbGVtZW50OntqUXVlcnl9fX0gYnV0dG9uIHJlZmVyZW5jZVxuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRQcm9maWxlQnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zLnByb2ZpbGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGNyZWF0ZUJ1dHRvbih7XG4gICAgICB1cmw6IHRoaXMuZ2V0UHJvZmlsZVVybChvcHRpb25zLnByb2ZpbGUpLFxuICAgICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgICBpY29uOiB0aGlzLmljb25cbiAgICB9KVxuICB9O1xufTtcblxuLyoqXG4gKiBnZXQgc2hhcmUgYnV0dG9uIGVsZW1lbnQgYW5kIFVSTCB1cGRhdGUgZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGluaXRpYWwgY29udGVudHMgdG8gYmUgc2hhcmVkIHdpdGggdGhlIGJ1dHRvblxuICogQHJldHVybnMge3tlbGVtZW50OntqUXVlcnl9LCB1cGRhdGVVcmw6e2Z1bmN0aW9ufX19IGJ1dHRvbiByZWZlcmVuY2UgYW5kIHVwZGF0ZSBmdW5jdGlvblxuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRTaGFyZUJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgaWYgKCF0aGlzLnNoYXJlVXJsIHx8ICFvcHRpb25zLnRpdGxlIHx8ICFvcHRpb25zLnVybCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zLnRleHQpIHtcbiAgICBvcHRpb25zLnRleHQgPSBvcHRpb25zLnRpdGxlICsgJyUyMCcgKyBvcHRpb25zLnVybDtcbiAgfVxuXG4gIHZhciBlbGVtZW50ID0gY3JlYXRlQnV0dG9uKHtcbiAgICB1cmw6IHRoaXMuZ2V0U2hhcmVVcmwob3B0aW9ucyksXG4gICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgaWNvbjogdGhpcy5pY29uXG4gIH0pO1xuXG4gIHZhciB1cGRhdGVVcmwgPSBmdW5jdGlvbiAodXBkYXRlT3B0aW9ucykge1xuICAgIGVsZW1lbnQuZ2V0KDApLmhyZWYgPSB0aGlzLmdldFNoYXJlVXJsKHVwZGF0ZU9wdGlvbnMpO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgIHVwZGF0ZVVybDogdXBkYXRlVXJsXG4gIH07XG59O1xuXG4vKipcbiAqIGdldCBzaGFyZSBvciBwcm9maWxlIGJ1dHRvbiBkZXBlbmRpbmcgb24gdGhlIG9wdGlvbnMgZ2l2ZW5cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIG9iamVjdCB3aXRoIGVpdGhlciBwcm9maWxlbmFtZSBvciBjb250ZW50cyB0byBzaGFyZVxuICogQHJldHVybnMge29iamVjdH0gYnV0dG9uIG9iamVjdFxuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5wcm9maWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvZmlsZUJ1dHRvbihvcHRpb25zKTtcbiAgfVxuICBpZiAodGhpcy5zaGFyZVVybCAmJiBvcHRpb25zLnRpdGxlICYmIG9wdGlvbnMudXJsKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2hhcmVCdXR0b24ob3B0aW9ucyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvY2lhbE5ldHdvcms7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvc29jaWFsLW5ldHdvcmsuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBTb2NpYWxOZXR3b3JrID0gcmVxdWlyZSgnLi9zb2NpYWwtbmV0d29yaycpO1xudmFyIHNvY2lhbE5ldHdvcmtzID0ge1xuICB0d2l0dGVyOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ3R3aXR0ZXInLFxuICAgIHRpdGxlOiAnVHdpdHRlcicsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vdHdpdHRlci5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RleHQ9JHRleHQkJnVybD0kdXJsJCdcbiAgfSksXG5cbiAgZmxhdHRyOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ2ZsYXR0cicsXG4gICAgdGl0bGU6ICdGbGF0dHInLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL2ZsYXR0ci5jb20vcHJvZmlsZS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGV4dD0kdGV4dCQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICBmYWNlYm9vazogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdmYWNlYm9vaycsXG4gICAgdGl0bGU6ICdGYWNlYm9vaycsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vZmFjZWJvb2suY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZS5waHA/dD0kdGV4dCQmdT0kdXJsJCdcbiAgfSksXG5cbiAgYWRuOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ2FkbicsXG4gICAgdGl0bGU6ICdBcHAubmV0JyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9hbHBoYS5hcHAubmV0LycsXG4gICAgc2hhcmVVcmw6ICdpbnRlbnQvcG9zdD90ZXh0PSR0ZXh0JCdcbiAgfSksXG5cbiAgc291bmRjbG91ZDogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdzb3VuZGNsb3VkJyxcbiAgICB0aXRsZTogJ1NvdW5kQ2xvdWQnLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90aXRsZT0kdGl0bGUkJnVybD0kdXJsJCdcbiAgfSksXG5cbiAgaW5zdGFncmFtOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ2luc3RhZ3JhbScsXG4gICAgdGl0bGU6ICdJbnN0YWdyYW0nLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwOi8vaW5zdGFncmFtLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIHR1bWJscjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICd0dW1ibHInLFxuICAgIHRpdGxlOiAnVHVtYmxyJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly93d3cudHVtYmxyLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGVtYWlsOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ21lc3NhZ2UnLFxuICAgIHRpdGxlOiAnRS1NYWlsJyxcbiAgICBwcm9maWxlVXJsOiAnbWFpbHRvOicsXG4gICAgc2hhcmVVcmw6ICc/c3ViamVjdD0kdGl0bGUkJmJvZHk9JHRleHQkJ1xuICB9KSxcbiAgZ3BsdXM6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnZ29vZ2xlLXBsdXMnLFxuICAgIHRpdGxlOiAnR29vZ2xlKycsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vcGx1cy5nb29nbGUuY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90aXRsZT0kdGl0bGUkJnVybD0kdXJsJCdcbiAgfSlcbn07XG5cbi8qKlxuICogcmV0dXJucyB0aGUgc2VydmljZSByZWdpc3RlcmVkIHdpdGggdGhlIGdpdmVuIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZXJ2aWNlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc29jaWFsIG5ldHdvcmtcbiAqIEByZXR1cm5zIHtTb2NpYWxOZXR3b3JrfSBUaGUgbmV0d29yayB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gKi9cbmZ1bmN0aW9uIGdldFNlcnZpY2UgKHNlcnZpY2VOYW1lKSB7XG4gIHZhciBzZXJ2aWNlID0gc29jaWFsTmV0d29ya3Nbc2VydmljZU5hbWVdO1xuICBpZiAoIXNlcnZpY2UpIHtcbiAgICBjb25zb2xlLmVycm9yKCdVbmtub3duIHNlcnZpY2UnLCBzZXJ2aWNlTmFtZSk7XG4gIH1cbiAgcmV0dXJuIHNlcnZpY2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQ6IGdldFNlcnZpY2Vcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvc29jaWFsLW5ldHdvcmtzLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFdoZW4gdGFiIGNvbnRlbnQgaXMgc2Nyb2xsZWQsIGEgYm94c2hhZG93IGlzIGFkZGVkIHRvIHRoZSBoZWFkZXJcbiAqIEBwYXJhbSBldmVudFxuICovXG5mdW5jdGlvbiBhZGRTaGFkb3dPblNjcm9sbChldmVudCkge1xuICB2YXIgc2Nyb2xsID0gZXZlbnQuY3VycmVudFRhcmdldC5zY3JvbGxUb3A7XG4gIGV2ZW50LmRhdGEuaGVhZGVyLnRvZ2dsZUNsYXNzKCdzY3JvbGxlZCcsIChzY3JvbGwgPj0gNSApKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYW4gaHRtbCBzZWN0aW9uIGVsZW1lbnQgYXMgYSB3cmFwcGVyIGZvciB0aGUgdGFiXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHJldHVybnMgeyp8alF1ZXJ5fEhUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiBjcmVhdGVDb250ZW50Qm94KG9wdGlvbnMpIHtcbiAgdmFyIGNsYXNzZXMgPSBbJ3RhYiddO1xuICBjbGFzc2VzLnB1c2gob3B0aW9ucy5uYW1lKTtcbiAgaWYgKG9wdGlvbnMuYWN0aXZlKSB7XG4gICAgY2xhc3Nlcy5wdXNoKCdhY3RpdmUnKTtcbiAgfVxuICByZXR1cm4gJCgnPHNlY3Rpb24gY2xhc3M9XCInICsgY2xhc3Nlcy5qb2luKCcgJykgKyAnXCI+PC9zZWN0aW9uPicpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHRhYlxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUYWIob3B0aW9ucykge1xuICB0aGlzLmljb24gPSBvcHRpb25zLmljb247XG4gIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICB0aGlzLmhlYWRsaW5lID0gb3B0aW9ucy5oZWFkbGluZTtcblxuICB0aGlzLmJveCA9IGNyZWF0ZUNvbnRlbnRCb3gob3B0aW9ucyk7XG4gIHZhciBoZWFkZXIgPSB0aGlzLmNyZWF0ZUhlYWRlcigpO1xuICB0aGlzLmJveC5vbignc2Nyb2xsJywge2hlYWRlcjogaGVhZGVyfSwgYWRkU2hhZG93T25TY3JvbGwpO1xuXG4gIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gIHRoaXMudG9nZ2xlID0gbnVsbDtcbn1cblxuLyoqXG4gKiBBZGQgY2xhc3MgJ2FjdGl2ZScgdG8gdGhlIGFjdGl2ZSB0YWJcbiAqL1xuVGFiLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gIHRoaXMuYm94LmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgdGhpcy50b2dnbGUuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgY2xhc3MgJ2FjdGl2ZScgZnJvbSB0aGUgaW5hY3RpdmUgdGFiXG4gKi9cblRhYi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gIHRoaXMuYm94LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgdGhpcy50b2dnbGUucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gaHRtbCBoZWFkZXIgZWxlbWVudCB3aXRoIGEgaGVhZGxpbmVcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVIZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhlYWRlciA9ICQoJzxoZWFkZXIgY2xhc3M9XCJ0YWItaGVhZGVyXCI+PGgyIGNsYXNzPVwidGFiLWhlYWRsaW5lXCI+JyArXG4gICAgJzxpIGNsYXNzPVwiaWNvbiAnICsgdGhpcy5pY29uICsgJ1wiPjwvaT4nICsgdGhpcy5oZWFkbGluZSArICc8L2gyPjwvaGVhZGVyPicpO1xuICB0aGlzLmJveC5hcHBlbmQoaGVhZGVyKTtcbiAgcmV0dXJuIGhlYWRlcjtcbn07XG5cbi8qKlxuICogQXBwZW5kIGFuIGh0bWwgZGl2IGVsZW1lbnQgd2l0aCBjbGFzcyBtYWluIHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVNYWluQ29udGVudCA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgdmFyIG1haW5EaXYgPSAkKCc8ZGl2IGNsYXNzPVwibWFpblwiPicgKyBjb250ZW50ICsgJzwvZGl2Jyk7XG4gIHRoaXMuYm94LmFwcGVuZChtYWluRGl2KTtcbiAgcmV0dXJuIG1haW5EaXY7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGFzaWRlIGVsZW1lbnQgdG8gdGhlIHRhYidzIGNvbnRlbnQgYm94XG4gKiBAcGFyYW0gY29udGVudFxuICovXG5UYWIucHJvdG90eXBlLmNyZWF0ZUFzaWRlID0gZnVuY3Rpb24oY29udGVudCkge1xuICB2YXIgYXNpZGUgPSAkKCc8YXNpZGUgY2xhc3M9XCJhc2lkZVwiPicgKyBjb250ZW50ICsgJzwvYXNpZGU+Jyk7XG4gIHRoaXMuYm94LmFwcGVuZChhc2lkZSk7XG4gIHJldHVybiBhc2lkZTtcbn07XG5cbi8qKlxuICogQXBwZW5kIGFuIGh0bWwgZm9vdGVyIGVsZW1lbnQgdG8gdGhlIHRhYidzIGNvbnRlbnQgYm94XG4gKiBAcGFyYW0gY29udGVudFxuICovXG5UYWIucHJvdG90eXBlLmNyZWF0ZUZvb3RlciA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgdmFyIGZvb3RlciA9ICQoJzxmb290ZXI+JyArIGNvbnRlbnQgKyAnPC9mb290ZXI+Jyk7XG4gIHRoaXMuYm94LmFwcGVuZChmb290ZXIpO1xuICByZXR1cm4gZm9vdGVyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWI7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdGFiLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEB0eXBlIHtUYWJ9XG4gKi9cbnZhciBUYWIgPSByZXF1aXJlKCcuL3RhYi5qcycpO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1RhYn0gdGFiXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gZ2V0VG9nZ2xlQ2xpY2tIYW5kbGVyKHRhYikge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICBjb25zb2xlLmRlYnVnKCdUYWJSZWdpc3RyeScsICdhY3RpdmVUYWInLCB0aGlzLmFjdGl2ZVRhYik7XG4gIGlmICh0aGlzLmFjdGl2ZVRhYikge1xuICAgIHRoaXMuYWN0aXZlVGFiLmNsb3NlKCk7XG4gIH1cbiAgaWYgKHRoaXMuYWN0aXZlVGFiID09PSB0YWIpIHtcbiAgICB0aGlzLmFjdGl2ZVRhYiA9IG51bGw7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHRoaXMuYWN0aXZlVGFiID0gdGFiO1xuICB0aGlzLmFjdGl2ZVRhYi5vcGVuKCk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGxheWVyXG4gKi9cbmZ1bmN0aW9uIGxvZ0N1cnJlbnRUaW1lIChwbGF5ZXIpIHtcbiAgY29uc29sZS5sb2coJ3BsYXllci5jdXJyZW50VGltZScsIHBsYXllci5jdXJyZW50VGltZSk7XG59XG5cbmZ1bmN0aW9uIFRhYlJlZ2lzdHJ5KCkge1xuICAvKipcbiAgICogd2lsbCBzdG9yZSBhIHJlZmVyZW5jZSB0byBjdXJyZW50bHkgYWN0aXZlIHRhYiBpbnN0YW5jZSB0byBjbG9zZSBpdCB3aGVuIGFub3RoZXIgb25lIGlzIG9wZW5lZFxuICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgKi9cbiAgdGhpcy5hY3RpdmVUYWIgPSBudWxsO1xuICB0aGlzLnRvZ2dsZWJhciA9ICQoJzxkaXYgY2xhc3M9XCJ0b2dnbGViYXIgYmFyXCI+PC9kaXY+Jyk7XG4gIHRoaXMudG9nZ2xlTGlzdCA9ICQoJzx1bCBjbGFzcz1cInRhYmxpc3RcIj48L3VsPicpO1xuICB0aGlzLnRvZ2dsZWJhci5hcHBlbmQodGhpcy50b2dnbGVMaXN0KTtcbiAgdGhpcy5jb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwidGFic1wiPjwvZGl2PicpO1xuICB0aGlzLmxpc3RlbmVycyA9IFtsb2dDdXJyZW50VGltZV07XG4gIHRoaXMudGFicyA9IFtdO1xufVxuXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuY3JlYXRlVG9nZ2xlRm9yID0gZnVuY3Rpb24gKHRhYikge1xuICB2YXIgdG9nZ2xlID0gJCgnPGxpIHRpdGxlPVwiJyArIHRhYi50aXRsZSArICdcIj4nICtcbiAgICAgICc8YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJidXR0b24gYnV0dG9uLXRvZ2dsZSAnICsgdGFiLmljb24gKyAnXCI+PC9hPicgK1xuICAgICc8L2xpPicpO1xuICB0b2dnbGUub24oJ2NsaWNrJywgZ2V0VG9nZ2xlQ2xpY2tIYW5kbGVyLmJpbmQodGhpcywgdGFiKSk7XG4gIHRoaXMudG9nZ2xlTGlzdC5hcHBlbmQodG9nZ2xlKTtcbiAgcmV0dXJuIHRvZ2dsZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSB0YWIgYW5kIG9wZW4gaXQgaWYgaXQgaXMgaW5pdGlhbGx5IHZpc2libGVcbiAqIEBwYXJhbSB7VGFifSB0YWJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmlzaWJsZVxuICovXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odGFiLCB2aXNpYmxlKSB7XG4gIGlmICh0YWIgPT09IG51bGwpIHsgcmV0dXJuOyB9XG4gIHRoaXMudGFicy5wdXNoKHRhYik7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZCh0YWIuYm94KTtcblxuICB0YWIudG9nZ2xlID0gdGhpcy5jcmVhdGVUb2dnbGVGb3IodGFiKTtcbiAgaWYgKHZpc2libGUpIHtcbiAgICB0YWIub3BlbigpO1xuICAgIHRoaXMuYWN0aXZlVGFiID0gdGFiO1xuICB9XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbW9kdWxlXG4gKi9cblRhYlJlZ2lzdHJ5LnByb3RvdHlwZS5hZGRNb2R1bGUgPSBmdW5jdGlvbihtb2R1bGUpIHtcbiAgaWYgKG1vZHVsZS50YWIpIHtcbiAgICB0aGlzLmFkZChtb2R1bGUudGFiKTtcbiAgfVxuICBpZiAobW9kdWxlLnVwZGF0ZSkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobW9kdWxlLnVwZGF0ZSk7XG4gIH1cbn07XG5cblRhYlJlZ2lzdHJ5LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihldmVudCkge1xuICBjb25zb2xlLmxvZygnVGFiUmVnaXN0cnkjdXBkYXRlJywgZXZlbnQpO1xuICB2YXIgcGxheWVyID0gZXZlbnQuY3VycmVudFRhcmdldDtcbiAgJC5lYWNoKHRoaXMubGlzdGVuZXJzLCBmdW5jdGlvbiAoaSwgbGlzdGVuZXIpIHsgbGlzdGVuZXIocGxheWVyKTsgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYlJlZ2lzdHJ5O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RhYnJlZ2lzdHJ5LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgemVyb0ZpbGwgPSByZXF1aXJlKCcuL3V0aWwnKS56ZXJvRmlsbDtcblxuLyoqXG4gKiBUaW1lY29kZSBhcyBkZXNjcmliZWQgaW4gaHR0cDovL3BvZGxvdmUub3JnL2RlZXAtbGluay9cbiAqIGFuZCBodHRwOi8vd3d3LnczLm9yZy9UUi9tZWRpYS1mcmFncy8jZnJhZ21lbnQtZGltZW5zaW9uc1xuICovXG52YXIgdGltZUNvZGVNYXRjaGVyID0gLyg/OihcXGQrKTopPyhcXGR7MSwyfSk6KFxcZFxcZCkoXFwuXFxkezEsM30pPy87XG5cbi8qKlxuICogY29udmVydCBhbiBhcnJheSBvZiBzdHJpbmcgdG8gdGltZWNvZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0Y1xuICogQHJldHVybnMge251bWJlcnxib29sZWFufVxuICovXG5mdW5jdGlvbiBleHRyYWN0VGltZSh0Yykge1xuICBpZiAoIXRjKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXJ0cyA9IHRpbWVDb2RlTWF0Y2hlci5leGVjKHRjKTtcbiAgaWYgKCFwYXJ0cykge1xuICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGV4dHJhY3QgdGltZSBmcm9tJywgdGMpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdGltZSA9IDA7XG4gIC8vIGhvdXJzXG4gIHRpbWUgKz0gcGFydHNbMV0gPyBwYXJzZUludChwYXJ0c1sxXSwgMTApICogNjAgKiA2MCA6IDA7XG4gIC8vIG1pbnV0ZXNcbiAgdGltZSArPSBwYXJzZUludChwYXJ0c1syXSwgMTApICogNjA7XG4gIC8vIHNlY29uZHNcbiAgdGltZSArPSBwYXJzZUludChwYXJ0c1szXSwgMTApO1xuICAvLyBtaWxsaXNlY29uZHNcbiAgdGltZSArPSBwYXJ0c1s0XSA/IHBhcnNlRmxvYXQocGFydHNbNF0pIDogMDtcbiAgLy8gbm8gbmVnYXRpdmUgdGltZVxuICB0aW1lID0gTWF0aC5tYXgodGltZSwgMCk7XG4gIHJldHVybiB0aW1lO1xufVxuXG4vKipcbiAqIGNvbnZlcnQgYSB0aW1lc3RhbXAgdG8gYSB0aW1lY29kZSBpbiAke2luc2VydCBSRkMgaGVyZX0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJlcn0gdGltZVxuICogQHBhcmFtIHtCb29sZWFufSBsZWFkaW5nWmVyb3NcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlSG91cnNdIGZvcmNlIG91dHB1dCBvZiBob3VycywgZGVmYXVsdHMgdG8gZmFsc2VcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3Nob3dNaWxsaXNdIG91dHB1dCBtaWxsaXNlY29uZHMgc2VwYXJhdGVkIHdpdGggYSBkb3QgZnJvbSB0aGUgc2Vjb25kcyAtIGRlZmF1bHRzIHRvIGZhbHNlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRzMnRjKHRpbWUsIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycywgc2hvd01pbGxpcykge1xuICB2YXIgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc2Vjb25kcztcbiAgdmFyIHRpbWVjb2RlID0gJyc7XG5cbiAgaWYgKHRpbWUgPT09IDApIHtcbiAgICByZXR1cm4gKGZvcmNlSG91cnMgPyAnMDA6MDA6MDAnIDogJzAwOjAwJyk7XG4gIH1cblxuICAvLyBwcmV2ZW50IG5lZ2F0aXZlIHZhbHVlcyBmcm9tIHBsYXllclxuICBpZiAoIXRpbWUgfHwgdGltZSA8PSAwKSB7XG4gICAgcmV0dXJuIChmb3JjZUhvdXJzID8gJy0tOi0tOi0tJyA6ICctLTotLScpO1xuICB9XG5cbiAgaG91cnMgPSBNYXRoLmZsb29yKHRpbWUgLyA2MCAvIDYwKTtcbiAgbWludXRlcyA9IE1hdGguZmxvb3IodGltZSAvIDYwKSAlIDYwO1xuICBzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lICUgNjApICUgNjA7XG4gIG1pbGxpc2Vjb25kcyA9IE1hdGguZmxvb3IodGltZSAlIDEgKiAxMDAwKTtcblxuICBpZiAoc2hvd01pbGxpcyAmJiBtaWxsaXNlY29uZHMpIHtcbiAgICB0aW1lY29kZSA9ICcuJyArIHplcm9GaWxsKG1pbGxpc2Vjb25kcywgMyk7XG4gIH1cblxuICB0aW1lY29kZSA9ICc6JyArIHplcm9GaWxsKHNlY29uZHMsIDIpICsgdGltZWNvZGU7XG5cbiAgaWYgKGhvdXJzID09PSAwICYmICFmb3JjZUhvdXJzICYmICFsZWFkaW5nWmVyb3MgKSB7XG4gICAgcmV0dXJuIG1pbnV0ZXMudG9TdHJpbmcoKSArIHRpbWVjb2RlO1xuICB9XG5cbiAgdGltZWNvZGUgPSB6ZXJvRmlsbChtaW51dGVzLCAyKSArIHRpbWVjb2RlO1xuXG4gIGlmIChob3VycyA9PT0gMCAmJiAhZm9yY2VIb3Vycykge1xuICAgIC8vIHJlcXVpcmVkIChtaW51dGVzIDogc2Vjb25kcylcbiAgICByZXR1cm4gdGltZWNvZGU7XG4gIH1cblxuICBpZiAobGVhZGluZ1plcm9zKSB7XG4gICAgcmV0dXJuIHplcm9GaWxsKGhvdXJzLCAyKSArICc6JyArIHRpbWVjb2RlO1xuICB9XG5cbiAgcmV0dXJuIGhvdXJzICsgJzonICsgdGltZWNvZGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNvbnZlcnRpbmcgdGltZXN0YW1wcyB0b1xuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZXN0YW1wXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IHRpbWVjb2RlXG4gICAqL1xuICBmcm9tVGltZVN0YW1wOiBmdW5jdGlvbiAodGltZXN0YW1wKSB7XG4gICAgcmV0dXJuIHRzMnRjKHRpbWVzdGFtcCwgdHJ1ZSwgdHJ1ZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGFjY2VwdHMgYXJyYXkgd2l0aCBzdGFydCBhbmQgZW5kIHRpbWUgaW4gc2Vjb25kc1xuICAgKiByZXR1cm5zIHRpbWVjb2RlIGluIGRlZXAtbGlua2luZyBmb3JtYXRcbiAgICogQHBhcmFtIHtBcnJheX0gdGltZXNcbiAgICogQHBhcmFtIHtCb29sZWFufSBsZWFkaW5nWmVyb3NcbiAgICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VIb3Vyc11cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2VuZXJhdGU6IGZ1bmN0aW9uICh0aW1lcywgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzKSB7XG4gICAgaWYgKHRpbWVzWzFdID4gMCAmJiB0aW1lc1sxXSA8IDk5OTk5OTkgJiYgdGltZXNbMF0gPCB0aW1lc1sxXSkge1xuICAgICAgcmV0dXJuIHRzMnRjKHRpbWVzWzBdLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMpICsgJywnICsgdHMydGModGltZXNbMV0sIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycyk7XG4gICAgfVxuICAgIHJldHVybiB0czJ0Yyh0aW1lc1swXSwgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzKTtcbiAgfSxcblxuICAvKipcbiAgICogcGFyc2VzIHRpbWUgY29kZSBpbnRvIHNlY29uZHNcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRpbWVjb2RlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgcGFyc2U6IGZ1bmN0aW9uICh0aW1lY29kZSkge1xuICAgIGlmICghdGltZWNvZGUpIHtcbiAgICAgIHJldHVybiBbZmFsc2UsIGZhbHNlXTtcbiAgICB9XG5cbiAgICB2YXIgdGltZXBhcnRzID0gdGltZWNvZGUuc3BsaXQoJy0nKTtcblxuICAgIGlmICghdGltZXBhcnRzLmxlbmd0aCkge1xuICAgICAgY29uc29sZS53YXJuKCdubyB0aW1lcGFydHM6JywgdGltZWNvZGUpO1xuICAgICAgcmV0dXJuIFtmYWxzZSwgZmFsc2VdO1xuICAgIH1cblxuICAgIHZhciBzdGFydFRpbWUgPSBleHRyYWN0VGltZSh0aW1lcGFydHMuc2hpZnQoKSk7XG4gICAgdmFyIGVuZFRpbWUgPSBleHRyYWN0VGltZSh0aW1lcGFydHMuc2hpZnQoKSk7XG5cbiAgICByZXR1cm4gKGVuZFRpbWUgPiBzdGFydFRpbWUpID8gW3N0YXJ0VGltZSwgZW5kVGltZV0gOiBbc3RhcnRUaW1lLCBmYWxzZV07XG4gIH0sXG5cbiAgZ2V0U3RhcnRUaW1lQ29kZTogZnVuY3Rpb24gZ2V0U3RhcnRUaW1lY29kZShzdGFydCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2Uoc3RhcnQpWzBdO1xuICB9XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RpbWVjb2RlLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKlxuIFtcbiB7dHlwZTogXCJpbWFnZVwiLCBcInRpdGxlXCI6IFwiVGhlIHZlcnkgYmVzdCBJbWFnZVwiLCBcInVybFwiOiBcImh0dHA6Ly9kb21haW4uY29tL2ltYWdlcy90ZXN0MS5wbmdcIn0sXG4ge3R5cGU6IFwic2hvd25vdGVcIiwgXCJ0ZXh0XCI6IFwiUEFQQVBBUEFQQVBBR0VOT1wifSxcbiB7dHlwZTogXCJ0b3BpY1wiLCBzdGFydDogMCwgZW5kOiAxLCBxOnRydWUsIHRpdGxlOiBcIlRoZSB2ZXJ5IGZpcnN0IGNoYXB0ZXJcIiB9LFxuIHt0eXBlOiBcImF1ZGlvXCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6dHJ1ZSwgY2xhc3M6ICdzcGVlY2gnfSxcbiB7dHlwZTogXCJhdWRpb1wiLCBzdGFydDogMSwgZW5kOiAyLCBxOnRydWUsIGNsYXNzOiAnbXVzaWMnfSxcbiB7dHlwZTogXCJhdWRpb1wiLCBzdGFydDogMiwgZW5kOiAzLCBxOnRydWUsIGNsYXNzOiAnbm9pc2UnfSxcbiB7dHlwZTogXCJhdWRpb1wiLCBzdGFydDogNCwgZW5kOiA1LCBxOnRydWUsIGNsYXNzOiAnc2lsZW5jZSd9LFxuIHt0eXBlOiBcImNvbnRlbnRcIiwgc3RhcnQ6IDAsIGVuZDogMSwgcTp0cnVlLCB0aXRsZTogXCJUaGUgdmVyeSBmaXJzdCBjaGFwdGVyXCIsIGNsYXNzOidhZHZlcnRpc2VtZW50J30sXG4ge3R5cGU6IFwibG9jYXRpb25cIiwgc3RhcnQ6IDAsIGVuZDogMSwgcTpmYWxzZSwgdGl0bGU6IFwiQXJvdW5kIEJlcmxpblwiLCBsYXQ6MTIuMTIzLCBsb246NTIuMjM0LCBkaWFtZXRlcjoxMjMgfSxcbiB7dHlwZTogXCJjaGF0XCIsIHE6ZmFsc2UsIHN0YXJ0OiAwLjEyLCBcImRhdGFcIjogXCJFUlNURVIgJiBISVRMRVIhISFcIn0sXG4ge3R5cGU6IFwic2hvd25vdGVcIiwgc3RhcnQ6IDAuMjMsIFwiZGF0YVwiOiBcIkplbWFuZCB2YWRlcnRcIn0sXG4ge3R5cGU6IFwiaW1hZ2VcIiwgXCJuYW1lXCI6IFwiVGhlIHZlcnkgYmVzdCBJbWFnZVwiLCBcInVybFwiOiBcImh0dHA6Ly9kb21haW4uY29tL2ltYWdlcy90ZXN0MS5wbmdcIn0sXG4ge3R5cGU6IFwibGlua1wiLCBcIm5hbWVcIjogXCJBbiBpbnRlcmVzdGluZyBsaW5rXCIsIFwidXJsXCI6IFwiaHR0cDovL1wifSxcbiB7dHlwZTogXCJ0b3BpY1wiLCBzdGFydDogMSwgZW5kOiAyLCBcIm5hbWVcIjogXCJUaGUgdmVyeSBmaXJzdCBjaGFwdGVyXCIsIFwidXJsXCI6IFwiXCJ9LFxuIF1cbiAqL1xudmFyIHRjID0gcmVxdWlyZSgnLi90aW1lY29kZScpXG4gICwgY2FwID0gcmVxdWlyZSgnLi91dGlsJykuY2FwO1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1DaGFwdGVyKGNoYXB0ZXIpIHtcbiAgY2hhcHRlci5jb2RlID0gY2hhcHRlci50aXRsZTtcbiAgaWYgKHR5cGVvZiBjaGFwdGVyLnN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgIGNoYXB0ZXIuc3RhcnQgPSB0Yy5nZXRTdGFydFRpbWVDb2RlKGNoYXB0ZXIuc3RhcnQpO1xuICB9XG4gIHJldHVybiBjaGFwdGVyO1xufVxuXG4vKipcbiAqIGFkZCBgZW5kYCBwcm9wZXJ0eSB0byBlYWNoIHNpbXBsZSBjaGFwdGVyLFxuICogbmVlZGVkIGZvciBwcm9wZXIgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGFkZEVuZFRpbWUoZHVyYXRpb24pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjaGFwdGVyLCBpLCBjaGFwdGVycykge1xuICAgIHZhciBuZXh0ID0gY2hhcHRlcnNbaSArIDFdO1xuICAgIGNoYXB0ZXIuZW5kID0gbmV4dCA/IG5leHQuc3RhcnQgOiBkdXJhdGlvbjtcbiAgICByZXR1cm4gY2hhcHRlcjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkVHlwZSh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQudHlwZSA9IHR5cGU7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNhbGwobGlzdGVuZXIpIHtcbiAgbGlzdGVuZXIodGhpcyk7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckJ5VHlwZSh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgcmV0dXJuIChyZWNvcmQudHlwZSA9PT0gdHlwZSk7XG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lXG4gKi9cbmZ1bmN0aW9uIGxvZ0N1cnJlbnRUaW1lKHRpbWVsaW5lKSB7XG4gIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICdjdXJyZW50VGltZScsIHRpbWVsaW5lLmdldFRpbWUoKSk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGF0IGxlYXN0IG9uZSBjaGFwdGVyIGlzIHByZXNlbnRcbiAqL1xuZnVuY3Rpb24gY2hlY2tGb3JDaGFwdGVycyhwYXJhbXMpIHtcbiAgcmV0dXJuICEhcGFyYW1zLmNoYXB0ZXJzICYmIChcbiAgICB0eXBlb2YgcGFyYW1zLmNoYXB0ZXJzID09PSAnb2JqZWN0JyAmJiBwYXJhbXMuY2hhcHRlcnMubGVuZ3RoID4gMVxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGE7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7SFRNTE1lZGlhRWxlbWVudH0gcGxheWVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRpbWVsaW5lKHBsYXllciwgZGF0YSkge1xuICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgdGhpcy5oYXNDaGFwdGVycyA9IGNoZWNrRm9yQ2hhcHRlcnMoZGF0YSk7XG4gIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VTaW1wbGVDaGFwdGVyKGRhdGEpO1xuICB0aGlzLm1vZHVsZXMgPSBbXTtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbbG9nQ3VycmVudFRpbWVdO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gLTE7XG4gIHRoaXMuZHVyYXRpb24gPSBkYXRhLmR1cmF0aW9uO1xuICB0aGlzLmVuZFRpbWUgPSBkYXRhLmR1cmF0aW9uO1xuICB0aGlzLmJ1ZmZlcmVkVGltZSA9IDA7XG4gIHRoaXMucmVzdW1lID0gcGxheWVyLnBhdXNlZDtcbiAgdGhpcy5zZWVraW5nID0gZmFsc2U7XG59XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5kYXRhO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLmdldERhdGFCeVR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gdGhpcy5kYXRhLmZpbHRlcihmaWx0ZXJCeVR5cGUodHlwZSkpO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLmFkZE1vZHVsZSA9IGZ1bmN0aW9uIChtb2R1bGUpIHtcbiAgaWYgKG1vZHVsZS51cGRhdGUpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG1vZHVsZS51cGRhdGUpO1xuICB9XG4gIHRoaXMubW9kdWxlcy5wdXNoKG1vZHVsZSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUucGxheVJhbmdlID0gZnVuY3Rpb24gKHJhbmdlKSB7XG4gIGlmICghcmFuZ2UgfHwgIXJhbmdlLmxlbmd0aCB8fCAhcmFuZ2Uuc2hpZnQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaW1lbGluZS5wbGF5UmFuZ2UgY2FsbGVkIHdpdGhvdXQgYSByYW5nZScpO1xuICB9XG4gIHRoaXMuc2V0VGltZShyYW5nZS5zaGlmdCgpKTtcbiAgdGhpcy5zdG9wQXQocmFuZ2Uuc2hpZnQoKSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICd1cGRhdGUnLCBldmVudCk7XG4gIHRoaXMuc2V0QnVmZmVyZWRUaW1lKGV2ZW50KTtcblxuICBpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ3RpbWV1cGRhdGUnKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMucGxheWVyLmN1cnJlbnRUaW1lO1xuICB9XG4gIHRoaXMubGlzdGVuZXJzLmZvckVhY2goY2FsbCwgdGhpcyk7XG4gIGlmICh0aGlzLmN1cnJlbnRUaW1lID49IHRoaXMuZW5kVGltZSkge1xuICAgIHRoaXMucGxheWVyLnN0b3AoKTtcbiAgfVxufTtcblxuVGltZWxpbmUucHJvdG90eXBlLmVtaXRFdmVudHNCZXR3ZWVuID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGVtaXRTdGFydGVkID0gZmFsc2UsXG4gICAgZW1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGN1c3RvbUV2ZW50ID0gbmV3ICQuRXZlbnQoZXZlbnQudHlwZSwgZXZlbnQpO1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKGN1c3RvbUV2ZW50KTtcbiAgICB9LmJpbmQodGhpcyk7XG4gIHRoaXMuZGF0YS5tYXAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIGxhdGVyID0gKGV2ZW50LnN0YXJ0ID4gc3RhcnQpLFxuICAgICAgZWFybGllciA9IChldmVudC5lbmQgPCBzdGFydCksXG4gICAgICBlbmRlZCA9IChldmVudC5lbmQgPCBlbmQpO1xuXG4gICAgaWYgKGxhdGVyICYmIGVhcmxpZXIgJiYgIWVuZGVkIHx8IGVtaXRTdGFydGVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAnRW1pdCcsIGV2ZW50KTtcbiAgICAgIGVtaXQoZXZlbnQpO1xuICAgIH1cbiAgICBlbWl0U3RhcnRlZCA9IGxhdGVyO1xuICB9KTtcbn07XG5cbi8qKlxuICogcmV0dXJucyBpZiB0aW1lIGlzIGEgdmFsaWQgdGltZXN0YW1wIGluIGN1cnJlbnQgdGltZWxpbmVcbiAqIEBwYXJhbSB7Kn0gdGltZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cblRpbWVsaW5lLnByb3RvdHlwZS5pc1ZhbGlkVGltZSA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIHJldHVybiAodHlwZW9mIHRpbWUgPT09ICdudW1iZXInICYmICFpc05hTih0aW1lKSAmJiB0aW1lID49IDAgJiYgdGltZSA8PSB0aGlzLmR1cmF0aW9uKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zZXRUaW1lID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgaWYgKCF0aGlzLmlzVmFsaWRUaW1lKHRpbWUpKSB7XG4gICAgY29uc29sZS53YXJuKCdUaW1lbGluZScsICdzZXRUaW1lJywgJ3RpbWUgb3V0IG9mIGJvdW5kcycsIHRpbWUpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ1RpbWVsaW5lJywgJ3NldFRpbWUnLCAndGltZScsIHRpbWUpO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgdGhpcy51cGRhdGUoKTtcblxuICAvLyBhdm9pZCBldmVudCBoZWxsZmlyZVxuICBpZiAodGhpcy5zZWVraW5nKSB7IHJldHVybiB0aGlzLmN1cnJlbnRUaW1lOyB9XG5cbiAgY29uc29sZS5sb2coJ2NhbnBsYXknLCAnc2V0VGltZScsICdwbGF5ZXJTdGF0ZScsIHRoaXMucGxheWVyLnJlYWR5U3RhdGUpO1xuICBpZiAodGhpcy5wbGF5ZXIucmVhZHlTdGF0ZSA9PT0gdGhpcy5wbGF5ZXIuSEFWRV9FTk9VR0hfREFUQSkge1xuICAgIHRoaXMucGxheWVyLnNldEN1cnJlbnRUaW1lKHRpbWUpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgLy8gVE9ETyB2aXN1YWxpemUgYnVmZmVyIHN0YXRlXG4gIC8vICQoZG9jdW1lbnQpLmZpbmQoJy5wbGF5JykuY3NzKHtjb2xvcjoncmVkJ30pO1xuICAkKHRoaXMucGxheWVyKS5vbmUoJ2NhbnBsYXknLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETyByZW1vdmUgYnVmZmVyIHN0YXRlIHZpc3VhbFxuICAgIC8vICQoZG9jdW1lbnQpLmZpbmQoJy5wbGF5JykuY3NzKHtjb2xvcjond2hpdGUnfSk7XG4gICAgY29uc29sZS5sb2coJ1BsYXllcicsICdjYW5wbGF5JywgJ2J1ZmZlcmVkJywgdGltZSk7XG4gICAgdGhpcy5zZXRDdXJyZW50VGltZSh0aW1lKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2VlayA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIGNvbnNvbGUubG9nKCdzZWVrJywgJ3NlZWsnLCB0aGlzLnJlc3VtZSk7XG4gIHRoaXMuc2Vla2luZyA9IHRydWU7XG4gIHRoaXMuY3VycmVudFRpbWUgPSBjYXAodGltZSwgMCwgdGhpcy5kdXJhdGlvbik7XG4gIHRoaXMuc2V0VGltZSh0aGlzLmN1cnJlbnRUaW1lKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zZWVrU3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdzZWVrJywgJ3N0YXJ0JywgdGhpcy5yZXN1bWUpO1xuICB0aGlzLnJlc3VtZSA9ICF0aGlzLnBsYXllci5wYXVzZWQ7IC8vIHNldHRpbmcgdGhpcyB0byBmYWxzZSBtYWtlcyBTYWZhcmkgaGFwcHlcbiAgaWYgKHRoaXMucmVzdW1lKSB7XG4gICAgdGhpcy5wbGF5ZXIucGF1c2UoKTtcbiAgfVxufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnNlZWtFbmQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdzZWVrJywgJ2VuZCcsIHRoaXMucmVzdW1lKTtcbiAgdGhpcy5zZWVraW5nID0gZmFsc2U7XG4gIHRoaXMuc2V0VGltZSh0aGlzLmN1cnJlbnRUaW1lKTsgLy9mb3JjZSBsYXRlc3QgcG9zaXRpb24gaW4gdHJhY2tcbiAgaWYgKHRoaXMucmVzdW1lKSB7XG4gICAgY29uc29sZS5sb2coJ3NlZWsnLCAnZW5kJywgJ3Jlc3VtZScsIHRoaXMuY3VycmVudFRpbWUpO1xuICAgIHRoaXMucGxheWVyLnBsYXkoKTtcbiAgfVxuICB0aGlzLnJlc3VtZSA9ICF0aGlzLnBsYXllci5wYXVzZWQ7IC8vIHNlZWtzdGFydCBtYXkgbm90IGJlIGNhbGxlZFxufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnN0b3BBdCA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIGlmICghdGltZSB8fCB0aW1lIDw9IDAgfHwgdGltZSA+IHRoaXMuZHVyYXRpb24pIHtcbiAgICByZXR1cm4gY29uc29sZS53YXJuKCdUaW1lbGluZScsICdzdG9wQXQnLCAndGltZSBvdXQgb2YgYm91bmRzJywgdGltZSk7XG4gIH1cbiAgdGhpcy5lbmRUaW1lID0gdGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXRUaW1lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXRCdWZmZXJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGlzTmFOKHRoaXMuYnVmZmVyZWRUaW1lKSkge1xuICAgIGNvbnNvbGUud2FybignVGltZWxpbmUnLCAnZ2V0QnVmZmVyZWQnLCAnYnVmZmVyZWRUaW1lIGlzIG5vdCBhIG51bWJlcicpO1xuICAgIHJldHVybiAwO1xuICB9XG4gIHJldHVybiB0aGlzLmJ1ZmZlcmVkVGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zZXRCdWZmZXJlZFRpbWUgPSBmdW5jdGlvbiAoZSkge1xuICB2YXIgdGFyZ2V0ID0gKGUgIT09IHVuZGVmaW5lZCkgPyBlLnRhcmdldCA6IHRoaXMucGxheWVyO1xuICB2YXIgYnVmZmVyZWQgPSAwO1xuXG4gIC8vIG5ld2VzdCBIVE1MNSBzcGVjIGhhcyBidWZmZXJlZCBhcnJheSAoRkY0LCBXZWJraXQpXG4gIGlmICh0YXJnZXQgJiYgdGFyZ2V0LmJ1ZmZlcmVkICYmIHRhcmdldC5idWZmZXJlZC5sZW5ndGggPiAwICYmIHRhcmdldC5idWZmZXJlZC5lbmQgJiYgdGFyZ2V0LmR1cmF0aW9uKSB7XG4gICAgYnVmZmVyZWQgPSB0YXJnZXQuYnVmZmVyZWQuZW5kKHRhcmdldC5idWZmZXJlZC5sZW5ndGggLSAxKTtcbiAgfVxuICAvLyBTb21lIGJyb3dzZXJzIChlLmcuLCBGRjMuNiBhbmQgU2FmYXJpIDUpIGNhbm5vdCBjYWxjdWxhdGUgdGFyZ2V0LmJ1ZmZlcmVyZWQuZW5kKClcbiAgLy8gdG8gYmUgYW55dGhpbmcgb3RoZXIgdGhhbiAwLiBJZiB0aGUgYnl0ZSBjb3VudCBpcyBhdmFpbGFibGUgd2UgdXNlIHRoaXMgaW5zdGVhZC5cbiAgLy8gQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHRoZSBlbHNlIGlmIGRvIG5vdCBzZWVtIHRvIGhhdmUgdGhlIGJ1ZmZlcmVkQnl0ZXMgdmFsdWUgYW5kXG4gIC8vIHNob3VsZCBza2lwIHRvIHRoZXJlLiBUZXN0ZWQgaW4gU2FmYXJpIDUsIFdlYmtpdCBoZWFkLCBGRjMuNiwgQ2hyb21lIDYsIElFIDcvOC5cbiAgZWxzZSBpZiAodGFyZ2V0ICYmIHRhcmdldC5ieXRlc1RvdGFsICE9PSB1bmRlZmluZWQgJiYgdGFyZ2V0LmJ5dGVzVG90YWwgPiAwICYmIHRhcmdldC5idWZmZXJlZEJ5dGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBidWZmZXJlZCA9IHRhcmdldC5idWZmZXJlZEJ5dGVzIC8gdGFyZ2V0LmJ5dGVzVG90YWwgKiB0YXJnZXQuZHVyYXRpb247XG4gIH1cbiAgLy8gRmlyZWZveCAzIHdpdGggYW4gT2dnIGZpbGUgc2VlbXMgdG8gZ28gdGhpcyB3YXlcbiAgZWxzZSBpZiAoZSAmJiBlLmxlbmd0aENvbXB1dGFibGUgJiYgZS50b3RhbCAhPT0gMCkge1xuICAgIGJ1ZmZlcmVkID0gZS5sb2FkZWQgLyBlLnRvdGFsICogdGFyZ2V0LmR1cmF0aW9uO1xuICB9XG4gIHZhciBjYXBwZWRUaW1lID0gY2FwKGJ1ZmZlcmVkLCAwLCB0YXJnZXQuZHVyYXRpb24pO1xuICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAnc2V0QnVmZmVyZWRUaW1lJywgY2FwcGVkVGltZSk7XG4gIHRoaXMuYnVmZmVyZWRUaW1lID0gY2FwcGVkVGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5yZXdpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2V0VGltZSgwKTtcbiAgdmFyIGNhbGxMaXN0ZW5lcldpdGhUaGlzID0gZnVuY3Rpb24gX2NhbGxMaXN0ZW5lcldpdGhUaGlzKGksIGxpc3RlbmVyKSB7XG4gICAgbGlzdGVuZXIodGhpcyk7XG4gIH0uYmluZCh0aGlzKTtcbiAgJC5lYWNoKHRoaXMubGlzdGVuZXJzLCBjYWxsTGlzdGVuZXJXaXRoVGhpcyk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUucGFyc2VTaW1wbGVDaGFwdGVyID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgaWYgKCFkYXRhLmNoYXB0ZXJzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGNoYXB0ZXJzID0gZGF0YS5jaGFwdGVycy5tYXAodHJhbnNmb3JtQ2hhcHRlcik7XG5cbiAgLy8gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQ6IGh0dHA6Ly9wb2Rsb3ZlLm9yZy9zaW1wbGUtY2hhcHRlcnMvXG4gIHJldHVybiBjaGFwdGVyc1xuICAgIC5tYXAoYWRkVHlwZSgnY2hhcHRlcicpKVxuICAgIC5tYXAoYWRkRW5kVGltZShkYXRhLmR1cmF0aW9uKSlcbiAgICAuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEuc3RhcnQgLSBiLnN0YXJ0O1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lbGluZTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi90aW1lbGluZS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIHRjID0gcmVxdWlyZSgnLi90aW1lY29kZScpO1xuXG4vKlxuICBcInQ9MVwiXHRbKFwidFwiLCBcIjFcIildXHRzaW1wbGUgY2FzZVxuICBcInQ9MSZ0PTJcIlx0WyhcInRcIiwgXCIxXCIpLCAoXCJ0XCIsIFwiMlwiKV1cdHJlcGVhdGVkIG5hbWVcbiAgXCJhPWI9Y1wiXHRbKFwiYVwiLCBcImI9Y1wiKV1cdFwiPVwiIGluIHZhbHVlXG4gIFwiYSZiPWNcIlx0WyhcImFcIiwgXCJcIiksIChcImJcIiwgXCJjXCIpXVx0bWlzc2luZyB2YWx1ZVxuICBcIiU3ND0lNmVwdCUzQSUzMTBcIlx0WyhcInRcIiwgXCJucHQ6MTBcIildXHR1bm5lY3NzYXJ5IHBlcmNlbnQtZW5jb2RpbmdcbiAgXCJpZD0leHkmdD0xXCJcdFsoXCJ0XCIsIFwiMVwiKV1cdGludmFsaWQgcGVyY2VudC1lbmNvZGluZ1xuICBcImlkPSVFNHImdD0xXCJcdFsoXCJ0XCIsIFwiMVwiKV1cdGludmFsaWQgVVRGLThcbiAqL1xuXG4vKipcbiAqIGdldCB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpYyBVUkwgaGFzaCBmcmFnbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBuYW1lIG9mIHRoZSBmcmFnbWVudFxuICogQHJldHVybnMge3N0cmluZ3xib29sZWFufSB2YWx1ZSBvZiB0aGUgZnJhZ21lbnQgb3IgZmFsc2Ugd2hlbiBub3QgZm91bmQgaW4gVVJMXG4gKi9cbmZ1bmN0aW9uIGdldEZyYWdtZW50KGtleSkge1xuICB2YXIgcXVlcnkgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSksXG4gICAgcGFpcnMgPSBxdWVyeS5zcGxpdCgnJicpO1xuXG4gIGlmIChxdWVyeS5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYWlycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIgcGFpciA9IHBhaXJzW2ldLnNwbGl0KCc9Jyk7XG4gICAgaWYgKHBhaXJbMF0gIT09IGtleSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChwYWlyLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFVSTCBoYW5kbGluZyBoZWxwZXJzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRGcmFnbWVudDogZ2V0RnJhZ21lbnQsXG4gIGNoZWNrQ3VycmVudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ID0gZ2V0RnJhZ21lbnQoJ3QnKTtcbiAgICByZXR1cm4gdGMucGFyc2UodCk7XG4gIH1cbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXJsLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIHJldHVybiBuZXcgdmFsdWUgaW4gYm91bmRzIG9mIG1pbiBhbmQgbWF4XG4gKiBAcGFyYW0ge251bWJlcn0gdmFsIGFueSBudW1iZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gbG93ZXIgYm91bmRhcnkgZm9yIHZhbFxuICogQHBhcmFtIHtudW1iZXJ9IG1heCB1cHBlciBib3VuZGFyeSBmb3IgdmFsXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByZXN1bHRpbmcgdmFsdWVcbiAqL1xuZnVuY3Rpb24gY2FwKHZhbCwgbWluLCBtYXgpIHtcbiAgLy8gY2FwIHggdmFsdWVzXG4gIHZhbCA9IE1hdGgubWF4KHZhbCwgbWluKTtcbiAgdmFsID0gTWF0aC5taW4odmFsLCBtYXgpO1xuICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIHJldHVybiBudW1iZXIgYXMgc3RyaW5nIGxlZnRoYW5kIGZpbGxlZCB3aXRoIHplcm9zXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyIChpbnRlZ2VyKSB2YWx1ZSB0byBiZSBwYWRkZWRcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBsZW5ndGggb2YgdGhlIHN0cmluZyB0aGF0IGlzIHJldHVybmVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBwYWRkZWQgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIHplcm9GaWxsIChudW1iZXIsIHdpZHRoKSB7XG4gIHZhciBzID0gbnVtYmVyLnRvU3RyaW5nKCk7XG4gIHdoaWxlIChzLmxlbmd0aCA8IHdpZHRoKSB7XG4gICAgcyA9ICcwJyArIHM7XG4gIH1cbiAgcmV0dXJuIHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjYXA6IGNhcCxcbiAgemVyb0ZpbGw6IHplcm9GaWxsXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3V0aWwuanNcIixcIi9cIikiXX0=
