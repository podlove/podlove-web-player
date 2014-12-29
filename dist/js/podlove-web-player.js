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

/**
 * instantiate new controls element
 * @params {jQuery|HTMLElement} player
 * @params {object} timeline
 * @constructor
 */
function Controls (player, timeline) {
  this.player = player;
  this.timeline = timeline;
  this.box = createBox();
  this.timeControlElement = createTimeControls();
  this.box.append(this.timeControlElement);
}
module.exports = Controls;

/**
 *
 * @param {Chapters} chapterModule
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

function createTimeControls() {
  return $('<ul class="timecontrolbar"></ul>');
}

function createBox() {
  return $('<div class="controlbar bar"></div>');
}

function playerStarted(player) {
  return ((typeof player.currentTime === 'number') && (player.currentTime > 0));
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/controls.js","/")
},{"./modules/chapter":9,"./tab":19,"buffer":2,"oMfpAn":5}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

// everything for an embedded player
var
  players = [],
  lastHeight = 0,
  $body;

/**
 * initialize embed functionality
 * @param {function} $
 * @param {Array} playerList
 */
function init($, playerList) {
  players = playerList;
  $body = $(document.body);
  $(window).on('message', messageListener);
  pollHeight();
}

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

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_9ff72e45.js","/")
},{"../../bower_components/mediaelement/build/mediaelement.js":1,"./controls":6,"./embed":7,"./modules/chapter":9,"./modules/downloads":10,"./modules/info":11,"./modules/progressbar":12,"./modules/savetime":13,"./modules/share":14,"./player":15,"./tabregistry":20,"./timeline":22,"./url":23,"buffer":2,"oMfpAn":5}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var tc = require('../timecode')
  , url = require('../url')
  , Tab = require('../tab')
  , Timeline = require('../timeline');

var ACTIVE_CHAPTER_THRESHHOLD = 0.1;

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
      '<td class="chapter-number"><span class="badge">' + (index+1) + '</span></td>' +
      '<td class="chapter-name"><span>' + chapter.code + '</span> ' +
      '</td>' +
      '<td class="chapter-duration"><span>' + chapter.duration + '</span></td>' +
    '</tr>'
  );
}

function render(html) {
  return $(html);
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
    icon: "pwp-chapters",
    title: "Show/hide chapters",
    headline: 'Chapters',
    name: "podlovewebplayer_chapterbox"
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
    next = this.setCurrentChapter(current+1);
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
    previous = this.setCurrentChapter(current-1);
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
  , timeCode = require('../timecode')
  ;

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
 * @param {object} params
 * @returns {null|Tab} download tab
 */
Downloads.prototype.createDownloadTab = function (params) {
  if ((!params.downloads && !params.sources) || params.hidedownloadbutton === true) {
    return null;
  }
  var downloadTab = new Tab({
      icon: "pwp-download",
      title: "Show/hide download bar",
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
 *
 * @param {object} params
 * @returns {null|Tab} infoTab
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
 *
 * @param {object} params
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
function _update (timeline) {
  this.setProgress(timeline.getTime());
  this.buffer.val(timeline.getBuffered());
  this.setChapter();
}

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
      .attr({min: 0, max: this.duration})
      .css({height: '1px'}); // TODO move height declaration to SASS
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

  function seekStart () {
    timeline.seekStart();
    $(document)
      .bind('mousemove.dur', handleMouseMove)
      .bind('touchmove.dur', handleMouseMove);
  }

  function handleMouseMove (event) {
    if (typeof timeline.duration !== 'number' || !mouseIsDown ) { return; }
    var newTime = calculateNewTime(event.pageX);
    if (newTime === timeline.getTime()) { return; }
    timeline.seek(newTime);
  }

  // handle click and drag with mouse or touch in progressbar and on handle
  this.progress
    .bind('touchstart', handleMouseDown)
    .bind('mousedown', handleMouseDown);

  this.handle
    .bind('touchstart', handleMouseDown)
    .bind('mousedown', handleMouseDown);
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

function updateTimes(progressBar) {
  var time = progressBar.timeline.getTime();
  progressBar.currentTime.html(tc.fromTimeStamp(time));

  if (progressBar.showDuration) { return; }

  var remainingTime = Math.abs(time - progressBar.duration);
  progressBar.durationTimeElement.text('-' + tc.fromTimeStamp(remainingTime));
}

function renderChapterMarker(chapter) {
  return renderMarkerAt.call(this, chapter.start);
}

function renderMarkerAt(time) {
  var percent = 100 * time / this.duration;
  return $('<div class="marker" style="left:' + percent + '%;"></div>');
}

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
  var type = value === 'show' ? 'show' : 'episode';
  var data = shareData[type];
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
 * Creates an html div element containing an image
 * @param {string} type
 * @returns {string}
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
 *
 * @param option
 * @returns {*}
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
 * @returns {jQuery|HTMLElement}
 */
function createShareButtonWrapper() {
  var div = $('<div class="share-button-wrapper"></div>');
  div.append(shareOptions.map(createOption));

  return div;
}

/**
 *
 * @returns {string}
 */
function createShareOptions() {
  var form = $('<form>' +
    '<legend>What would you like to share?</legend>' +
  '</form>');
  form.append(createShareButtonWrapper);
  return form;
}

/**
 *
 * @param {object} params player configuration
 * @returns {*}
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

/**
 * player
 */
var
// Keep all Players on site - for inline players
// embedded players are registered in podlove-webplayer-moderator in the embedding page
  players = [],
// all used functions
  embed = require('./embed'),
  parseTimecode = require('./timecode').parse,
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

function SocialButtonList (services, options) {
  var createButton = createButtonWith(options);
  this.buttons = services.map(createButton);

  this.list = $('<ul></ul>');
  this.buttons.forEach(function (button) {
    var listElement = $('<li></li>').append(button.element);
    this.list.append(listElement);
  }, this);
}

function createButtonWith(options) {
  return function (serviceName) {
    var service = services.get(serviceName);
    return service.getButton(options);
  };
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

function SocialNetwork (options) {
  this.icon = options.icon;
  this.title = options.title;
  this.url = options.profileUrl;
  this.shareUrl = options.shareUrl;
}

/**
 * build URL for sharing a text, a title and a url
 * @param {object} options
 * @returns {string}
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
 * @param {object} options
 * @returns {string}
 */
SocialNetwork.prototype.getProfileUrl = function (profile) {
  return this.url + profile;
};

/**
 * @param {object} options
 * @returns {object}
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
 * @param {object} options
 * @returns {object}
 */
SocialNetwork.prototype.getShareButton = function (options) {

  if (!this.shareUrl || !options.title || !options.url) {
    return null;
  }

  if (!options.text) {
    options.text = options.title + '%20' + options.url;
  }

  var updateUrl = function (options) {
    element.get(0).href = this.getShareUrl(options);
  }.bind(this);

  var element = createButton({
    url: this.getShareUrl(options),
    title: this.title,
    icon: this.icon
  });

  return {
    element: element,
    updateUrl: updateUrl
  };
};

/**
 *
 * @param {object} options
 * @returns {object}
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

function createButton (options) {
  return $('<a class="pwp-contrast-' + options.icon + '" target="_blank" href="' + options.url + '" ' +
    'title="' + options.title + '"><i class="icon pwp-' + options.icon + '"></i></a>' +
    '<span>' + options.title + '</span>');
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/social-network.js","/")
},{"buffer":2,"oMfpAn":5}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var SocialNetwork = require('./social-network')
  , socialNetworks = {
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
 * @param {string} serviceName
 * @returns {SocialNetwork}
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
 * Create a tab
 * @param options
 * @constructor
 */
function Tab(options) {
  this.icon = options.icon;
  this.title = options.title;
  this.headline = options.headline;

  this.box = createContentBox(options);
  this.createHeader();
  this.active = false;
  this.toggle = null;
}

module.exports = Tab;

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
  var header = $('<header><h2 class="tab-headline"><i class="icon ' + this.icon + '"></i>' + this.headline + '</h2></header>');
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

/**
 * Return an html section element as a wrapper for the tab
 * @param {object} options
 * @returns {*|jQuery|HTMLElement}
 */
function createContentBox(options) {
  var classes = ["tab"];
  classes.push(options.name);
  if (options.active) {
    classes.push("active");
  }
  return $('<section class="' + classes.join(' ') + '"></section>');
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/tab.js","/")
},{"buffer":2,"oMfpAn":5}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * @type {Tab}
 */
var Tab = require('./tab.js');

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

module.exports = TabRegistry;

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
      ended = (event.end < end)
      ;
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
    buffered = target.buffered.end(target.buffered.length-1);
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

function _filterByType(type) {
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

function _parse(data) {
  return data;
}

function _merge(a, b) {

}

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
 *
 * @param {string} key
 * @returns {string|boolean}
 */
function getFragment(key) {
  var query = window.location.hash.substring(1),
    pairs = query.split("&");

  if (query.indexOf(key) === -1) {
    return false;
  }

  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split("=");
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
 * url handling
 */
module.exports = {

  getFragment: getFragment,

  checkCurrent: function () {
    var t = getFragment('t');
    return tc.parse(t);
  },

  validate: function (url) {
    // uncomment next three lines to validate URLs, if you want use relative paths leave it so.
    //var urlregex = /(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    //url = url.match(urlregex);
    //return (url !== null) ? url[0] : url;
    return url.trim();
  },

  /**
   * add a string as hash in the adressbar
   * @param {string} fragment
   **/
  setFragment: function (fragment) {
    console.debug('setting url fragment', fragment);
    window.location.hash = '#' + fragment;
  }
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/url.js","/")
},{"./timecode":21,"buffer":2,"oMfpAn":5}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * return new value in bounds of min and max
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function cap(val, min, max) {
  // cap x values
  val = Math.max(val, min);
  val = Math.min(val, max);
  return val;
}

/**
 * return number as string lefthand filled with zeros
 * @param number number
 * @param width number
 * @return string
 */
function zeroFill (number, width) {
  var s = number.toString();
  while (s.length < width) {
    s = "0" + s;
  }
  return s;
}

module.exports = {
  cap: cap,
  zeroFill: zeroFill
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util.js","/")
},{"buffer":2,"oMfpAn":5}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZC9tZWRpYWVsZW1lbnQuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9jb250cm9scy5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL2VtYmVkLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvZmFrZV85ZmY3MmU0NS5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvY2hhcHRlci5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvZG93bmxvYWRzLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9pbmZvLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9wcm9ncmVzc2Jhci5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvc2F2ZXRpbWUuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL3NoYXJlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvcGxheWVyLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLWJ1dHRvbi1saXN0LmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLW5ldHdvcmsuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9zb2NpYWwtbmV0d29ya3MuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWIuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWJyZWdpc3RyeS5qcyIsIi9Vc2Vycy9qbGwvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3RpbWVjb2RlLmpzIiwiL1VzZXJzL2psbC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvdGltZWxpbmUuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91cmwuanMiLCIvVXNlcnMvamxsL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKlxuICogTWVkaWFFbGVtZW50LmpzXG4gKiBIVE1MNSA8dmlkZW8+IGFuZCA8YXVkaW8+IHNoaW0gYW5kIHBsYXllclxuICogaHR0cDovL21lZGlhZWxlbWVudGpzLmNvbS9cbiAqXG4gKiBDcmVhdGVzIGEgSmF2YVNjcmlwdCBvYmplY3QgdGhhdCBtaW1pY3MgSFRNTDUgTWVkaWFFbGVtZW50IEFQSVxuICogZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3QgdW5kZXJzdGFuZCBIVE1MNSBvciBjYW4ndCBwbGF5IHRoZSBwcm92aWRlZCBjb2RlY1xuICogQ2FuIHBsYXkgTVA0IChILjI2NCksIE9nZywgV2ViTSwgRkxWLCBXTVYsIFdNQSwgQUNDLCBhbmQgTVAzXG4gKlxuICogQ29weXJpZ2h0IDIwMTAtMjAxNCwgSm9obiBEeWVyIChodHRwOi8vai5obilcbiAqIExpY2Vuc2U6IE1JVFxuICpcbiAqL1xuLy8gTmFtZXNwYWNlXG52YXIgbWVqcyA9IG1lanMgfHwge307XG5cbi8vIHZlcnNpb24gbnVtYmVyXG5tZWpzLnZlcnNpb24gPSAnMi4xNi4yJzsgXG5cblxuLy8gcGxheWVyIG51bWJlciAoZm9yIG1pc3NpbmcsIHNhbWUgaWQgYXR0cilcbm1lanMubWVJbmRleCA9IDA7XG5cbi8vIG1lZGlhIHR5cGVzIGFjY2VwdGVkIGJ5IHBsdWdpbnNcbm1lanMucGx1Z2lucyA9IHtcblx0c2lsdmVybGlnaHQ6IFtcblx0XHR7dmVyc2lvbjogWzMsMF0sIHR5cGVzOiBbJ3ZpZGVvL21wNCcsJ3ZpZGVvL200dicsJ3ZpZGVvL21vdicsJ3ZpZGVvL3dtdicsJ2F1ZGlvL3dtYScsJ2F1ZGlvL200YScsJ2F1ZGlvL21wMycsJ2F1ZGlvL3dhdicsJ2F1ZGlvL21wZWcnXX1cblx0XSxcblx0Zmxhc2g6IFtcblx0XHR7dmVyc2lvbjogWzksMCwxMjRdLCB0eXBlczogWyd2aWRlby9tcDQnLCd2aWRlby9tNHYnLCd2aWRlby9tb3YnLCd2aWRlby9mbHYnLCd2aWRlby9ydG1wJywndmlkZW8veC1mbHYnLCdhdWRpby9mbHYnLCdhdWRpby94LWZsdicsJ2F1ZGlvL21wMycsJ2F1ZGlvL200YScsJ2F1ZGlvL21wZWcnLCAndmlkZW8veW91dHViZScsICd2aWRlby94LXlvdXR1YmUnLCAnYXBwbGljYXRpb24veC1tcGVnVVJMJ119XG5cdFx0Ly8se3ZlcnNpb246IFsxMiwwXSwgdHlwZXM6IFsndmlkZW8vd2VibSddfSAvLyBmb3IgZnV0dXJlIHJlZmVyZW5jZSAoaG9wZWZ1bGx5ISlcblx0XSxcblx0eW91dHViZTogW1xuXHRcdHt2ZXJzaW9uOiBudWxsLCB0eXBlczogWyd2aWRlby95b3V0dWJlJywgJ3ZpZGVvL3gteW91dHViZScsICdhdWRpby95b3V0dWJlJywgJ2F1ZGlvL3gteW91dHViZSddfVxuXHRdLFxuXHR2aW1lbzogW1xuXHRcdHt2ZXJzaW9uOiBudWxsLCB0eXBlczogWyd2aWRlby92aW1lbycsICd2aWRlby94LXZpbWVvJ119XG5cdF1cbn07XG5cbi8qXG5VdGlsaXR5IG1ldGhvZHNcbiovXG5tZWpzLlV0aWxpdHkgPSB7XG5cdGVuY29kZVVybDogZnVuY3Rpb24odXJsKSB7XG5cdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpOyAvLy5yZXBsYWNlKC9cXD8vZ2ksJyUzRicpLnJlcGxhY2UoLz0vZ2ksJyUzRCcpLnJlcGxhY2UoLyYvZ2ksJyUyNicpO1xuXHR9LFxuXHRlc2NhcGVIVE1MOiBmdW5jdGlvbihzKSB7XG5cdFx0cmV0dXJuIHMudG9TdHJpbmcoKS5zcGxpdCgnJicpLmpvaW4oJyZhbXA7Jykuc3BsaXQoJzwnKS5qb2luKCcmbHQ7Jykuc3BsaXQoJ1wiJykuam9pbignJnF1b3Q7Jyk7XG5cdH0sXG5cdGFic29sdXRpemVVcmw6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdGVsLmlubmVySFRNTCA9ICc8YSBocmVmPVwiJyArIHRoaXMuZXNjYXBlSFRNTCh1cmwpICsgJ1wiPng8L2E+Jztcblx0XHRyZXR1cm4gZWwuZmlyc3RDaGlsZC5ocmVmO1xuXHR9LFxuXHRnZXRTY3JpcHRQYXRoOiBmdW5jdGlvbihzY3JpcHROYW1lcykge1xuXHRcdHZhclxuXHRcdFx0aSA9IDAsXG5cdFx0XHRqLFxuXHRcdFx0Y29kZVBhdGggPSAnJyxcblx0XHRcdHRlc3RuYW1lID0gJycsXG5cdFx0XHRzbGFzaFBvcyxcblx0XHRcdGZpbGVuYW1lUG9zLFxuXHRcdFx0c2NyaXB0VXJsLFxuXHRcdFx0c2NyaXB0UGF0aCxcdFx0XHRcblx0XHRcdHNjcmlwdEZpbGVuYW1lLFxuXHRcdFx0c2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSxcblx0XHRcdGlsID0gc2NyaXB0cy5sZW5ndGgsXG5cdFx0XHRqbCA9IHNjcmlwdE5hbWVzLmxlbmd0aDtcblx0XHRcdFxuXHRcdC8vIGdvIHRocm91Z2ggYWxsIDxzY3JpcHQ+IHRhZ3Ncblx0XHRmb3IgKDsgaSA8IGlsOyBpKyspIHtcblx0XHRcdHNjcmlwdFVybCA9IHNjcmlwdHNbaV0uc3JjO1xuXHRcdFx0c2xhc2hQb3MgPSBzY3JpcHRVcmwubGFzdEluZGV4T2YoJy8nKTtcblx0XHRcdGlmIChzbGFzaFBvcyA+IC0xKSB7XG5cdFx0XHRcdHNjcmlwdEZpbGVuYW1lID0gc2NyaXB0VXJsLnN1YnN0cmluZyhzbGFzaFBvcyArIDEpO1xuXHRcdFx0XHRzY3JpcHRQYXRoID0gc2NyaXB0VXJsLnN1YnN0cmluZygwLCBzbGFzaFBvcyArIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2NyaXB0RmlsZW5hbWUgPSBzY3JpcHRVcmw7XG5cdFx0XHRcdHNjcmlwdFBhdGggPSAnJztcdFx0XHRcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gc2VlIGlmIGFueSA8c2NyaXB0PiB0YWdzIGhhdmUgYSBmaWxlIG5hbWUgdGhhdCBtYXRjaGVzIHRoZSBcblx0XHRcdGZvciAoaiA9IDA7IGogPCBqbDsgaisrKSB7XG5cdFx0XHRcdHRlc3RuYW1lID0gc2NyaXB0TmFtZXNbal07XG5cdFx0XHRcdGZpbGVuYW1lUG9zID0gc2NyaXB0RmlsZW5hbWUuaW5kZXhPZih0ZXN0bmFtZSk7XG5cdFx0XHRcdGlmIChmaWxlbmFtZVBvcyA+IC0xKSB7XG5cdFx0XHRcdFx0Y29kZVBhdGggPSBzY3JpcHRQYXRoO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIGlmIHdlIGZvdW5kIGEgcGF0aCwgdGhlbiBicmVhayBhbmQgcmV0dXJuIGl0XG5cdFx0XHRpZiAoY29kZVBhdGggIT09ICcnKSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBzZW5kIHRoZSBiZXN0IHBhdGggYmFja1xuXHRcdHJldHVybiBjb2RlUGF0aDtcblx0fSxcblx0c2Vjb25kc1RvVGltZUNvZGU6IGZ1bmN0aW9uKHRpbWUsIGZvcmNlSG91cnMsIHNob3dGcmFtZUNvdW50LCBmcHMpIHtcblx0XHQvL2FkZCBmcmFtZWNvdW50XG5cdFx0aWYgKHR5cGVvZiBzaG93RnJhbWVDb3VudCA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBzaG93RnJhbWVDb3VudD1mYWxzZTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZwcyA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBmcHMgPSAyNTtcblx0XHR9XG5cdFxuXHRcdHZhciBob3VycyA9IE1hdGguZmxvb3IodGltZSAvIDM2MDApICUgMjQsXG5cdFx0XHRtaW51dGVzID0gTWF0aC5mbG9vcih0aW1lIC8gNjApICUgNjAsXG5cdFx0XHRzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lICUgNjApLFxuXHRcdFx0ZnJhbWVzID0gTWF0aC5mbG9vcigoKHRpbWUgJSAxKSpmcHMpLnRvRml4ZWQoMykpLFxuXHRcdFx0cmVzdWx0ID0gXG5cdFx0XHRcdFx0KCAoZm9yY2VIb3VycyB8fCBob3VycyA+IDApID8gKGhvdXJzIDwgMTAgPyAnMCcgKyBob3VycyA6IGhvdXJzKSArICc6JyA6ICcnKVxuXHRcdFx0XHRcdFx0KyAobWludXRlcyA8IDEwID8gJzAnICsgbWludXRlcyA6IG1pbnV0ZXMpICsgJzonXG5cdFx0XHRcdFx0XHQrIChzZWNvbmRzIDwgMTAgPyAnMCcgKyBzZWNvbmRzIDogc2Vjb25kcylcblx0XHRcdFx0XHRcdCsgKChzaG93RnJhbWVDb3VudCkgPyAnOicgKyAoZnJhbWVzIDwgMTAgPyAnMCcgKyBmcmFtZXMgOiBmcmFtZXMpIDogJycpO1xuXHRcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRcblx0dGltZUNvZGVUb1NlY29uZHM6IGZ1bmN0aW9uKGhoX21tX3NzX2ZmLCBmb3JjZUhvdXJzLCBzaG93RnJhbWVDb3VudCwgZnBzKXtcblx0XHRpZiAodHlwZW9mIHNob3dGcmFtZUNvdW50ID09ICd1bmRlZmluZWQnKSB7XG5cdFx0ICAgIHNob3dGcmFtZUNvdW50PWZhbHNlO1xuXHRcdH0gZWxzZSBpZih0eXBlb2YgZnBzID09ICd1bmRlZmluZWQnKSB7XG5cdFx0ICAgIGZwcyA9IDI1O1xuXHRcdH1cblx0XG5cdFx0dmFyIHRjX2FycmF5ID0gaGhfbW1fc3NfZmYuc3BsaXQoXCI6XCIpLFxuXHRcdFx0dGNfaGggPSBwYXJzZUludCh0Y19hcnJheVswXSwgMTApLFxuXHRcdFx0dGNfbW0gPSBwYXJzZUludCh0Y19hcnJheVsxXSwgMTApLFxuXHRcdFx0dGNfc3MgPSBwYXJzZUludCh0Y19hcnJheVsyXSwgMTApLFxuXHRcdFx0dGNfZmYgPSAwLFxuXHRcdFx0dGNfaW5fc2Vjb25kcyA9IDA7XG5cdFx0XG5cdFx0aWYgKHNob3dGcmFtZUNvdW50KSB7XG5cdFx0ICAgIHRjX2ZmID0gcGFyc2VJbnQodGNfYXJyYXlbM10pL2Zwcztcblx0XHR9XG5cdFx0XG5cdFx0dGNfaW5fc2Vjb25kcyA9ICggdGNfaGggKiAzNjAwICkgKyAoIHRjX21tICogNjAgKSArIHRjX3NzICsgdGNfZmY7XG5cdFx0XG5cdFx0cmV0dXJuIHRjX2luX3NlY29uZHM7XG5cdH0sXG5cdFxuXG5cdGNvbnZlcnRTTVBURXRvU2Vjb25kczogZnVuY3Rpb24gKFNNUFRFKSB7XG5cdFx0aWYgKHR5cGVvZiBTTVBURSAhPSAnc3RyaW5nJykgXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRTTVBURSA9IFNNUFRFLnJlcGxhY2UoJywnLCAnLicpO1xuXHRcdFxuXHRcdHZhciBzZWNzID0gMCxcblx0XHRcdGRlY2ltYWxMZW4gPSAoU01QVEUuaW5kZXhPZignLicpICE9IC0xKSA/IFNNUFRFLnNwbGl0KCcuJylbMV0ubGVuZ3RoIDogMCxcblx0XHRcdG11bHRpcGxpZXIgPSAxO1xuXHRcdFxuXHRcdFNNUFRFID0gU01QVEUuc3BsaXQoJzonKS5yZXZlcnNlKCk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBTTVBURS5sZW5ndGg7IGkrKykge1xuXHRcdFx0bXVsdGlwbGllciA9IDE7XG5cdFx0XHRpZiAoaSA+IDApIHtcblx0XHRcdFx0bXVsdGlwbGllciA9IE1hdGgucG93KDYwLCBpKTsgXG5cdFx0XHR9XG5cdFx0XHRzZWNzICs9IE51bWJlcihTTVBURVtpXSkgKiBtdWx0aXBsaWVyO1xuXHRcdH1cblx0XHRyZXR1cm4gTnVtYmVyKHNlY3MudG9GaXhlZChkZWNpbWFsTGVuKSk7XG5cdH0sXHRcblx0XG5cdC8qIGJvcnJvd2VkIGZyb20gU1dGT2JqZWN0OiBodHRwOi8vY29kZS5nb29nbGUuY29tL3Avc3dmb2JqZWN0L3NvdXJjZS9icm93c2UvdHJ1bmsvc3dmb2JqZWN0L3NyYy9zd2ZvYmplY3QuanMjNDc0ICovXG5cdHJlbW92ZVN3ZjogZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgb2JqID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXHRcdGlmIChvYmogJiYgL29iamVjdHxlbWJlZC9pLnRlc3Qob2JqLm5vZGVOYW1lKSkge1xuXHRcdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0lFKSB7XG5cdFx0XHRcdG9iai5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdFx0XHRcdChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmIChvYmoucmVhZHlTdGF0ZSA9PSA0KSB7XG5cdFx0XHRcdFx0XHRtZWpzLlV0aWxpdHkucmVtb3ZlT2JqZWN0SW5JRShpZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwgMTApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9iai5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9iaik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmVPYmplY3RJbklFOiBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBvYmogPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cdFx0aWYgKG9iaikge1xuXHRcdFx0Zm9yICh2YXIgaSBpbiBvYmopIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBvYmpbaV0gPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0b2JqW2ldID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0b2JqLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob2JqKTtcblx0XHR9XHRcdFxuXHR9XG59O1xuXG5cbi8vIENvcmUgZGV0ZWN0b3IsIHBsdWdpbnMgYXJlIGFkZGVkIGJlbG93XG5tZWpzLlBsdWdpbkRldGVjdG9yID0ge1xuXG5cdC8vIG1haW4gcHVibGljIGZ1bmN0aW9uIHRvIHRlc3QgYSBwbHVnIHZlcnNpb24gbnVtYmVyIFBsdWdpbkRldGVjdG9yLmhhc1BsdWdpblZlcnNpb24oJ2ZsYXNoJyxbOSwwLDEyNV0pO1xuXHRoYXNQbHVnaW5WZXJzaW9uOiBmdW5jdGlvbihwbHVnaW4sIHYpIHtcblx0XHR2YXIgcHYgPSB0aGlzLnBsdWdpbnNbcGx1Z2luXTtcblx0XHR2WzFdID0gdlsxXSB8fCAwO1xuXHRcdHZbMl0gPSB2WzJdIHx8IDA7XG5cdFx0cmV0dXJuIChwdlswXSA+IHZbMF0gfHwgKHB2WzBdID09IHZbMF0gJiYgcHZbMV0gPiB2WzFdKSB8fCAocHZbMF0gPT0gdlswXSAmJiBwdlsxXSA9PSB2WzFdICYmIHB2WzJdID49IHZbMl0pKSA/IHRydWUgOiBmYWxzZTtcblx0fSxcblxuXHQvLyBjYWNoZWQgdmFsdWVzXG5cdG5hdjogd2luZG93Lm5hdmlnYXRvcixcblx0dWE6IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCksXG5cblx0Ly8gc3RvcmVkIHZlcnNpb24gbnVtYmVyc1xuXHRwbHVnaW5zOiBbXSxcblxuXHQvLyBydW5zIGRldGVjdFBsdWdpbigpIGFuZCBzdG9yZXMgdGhlIHZlcnNpb24gbnVtYmVyXG5cdGFkZFBsdWdpbjogZnVuY3Rpb24ocCwgcGx1Z2luTmFtZSwgbWltZVR5cGUsIGFjdGl2ZVgsIGF4RGV0ZWN0KSB7XG5cdFx0dGhpcy5wbHVnaW5zW3BdID0gdGhpcy5kZXRlY3RQbHVnaW4ocGx1Z2luTmFtZSwgbWltZVR5cGUsIGFjdGl2ZVgsIGF4RGV0ZWN0KTtcblx0fSxcblxuXHQvLyBnZXQgdGhlIHZlcnNpb24gbnVtYmVyIGZyb20gdGhlIG1pbWV0eXBlIChhbGwgYnV0IElFKSBvciBBY3RpdmVYIChJRSlcblx0ZGV0ZWN0UGx1Z2luOiBmdW5jdGlvbihwbHVnaW5OYW1lLCBtaW1lVHlwZSwgYWN0aXZlWCwgYXhEZXRlY3QpIHtcblxuXHRcdHZhciB2ZXJzaW9uID0gWzAsMCwwXSxcblx0XHRcdGRlc2NyaXB0aW9uLFxuXHRcdFx0aSxcblx0XHRcdGF4O1xuXG5cdFx0Ly8gRmlyZWZveCwgV2Via2l0LCBPcGVyYVxuXHRcdGlmICh0eXBlb2YodGhpcy5uYXYucGx1Z2lucykgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRoaXMubmF2LnBsdWdpbnNbcGx1Z2luTmFtZV0gPT0gJ29iamVjdCcpIHtcblx0XHRcdGRlc2NyaXB0aW9uID0gdGhpcy5uYXYucGx1Z2luc1twbHVnaW5OYW1lXS5kZXNjcmlwdGlvbjtcblx0XHRcdGlmIChkZXNjcmlwdGlvbiAmJiAhKHR5cGVvZiB0aGlzLm5hdi5taW1lVHlwZXMgIT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5uYXYubWltZVR5cGVzW21pbWVUeXBlXSAmJiAhdGhpcy5uYXYubWltZVR5cGVzW21pbWVUeXBlXS5lbmFibGVkUGx1Z2luKSkge1xuXHRcdFx0XHR2ZXJzaW9uID0gZGVzY3JpcHRpb24ucmVwbGFjZShwbHVnaW5OYW1lLCAnJykucmVwbGFjZSgvXlxccysvLCcnKS5yZXBsYWNlKC9cXHNyL2dpLCcuJykuc3BsaXQoJy4nKTtcblx0XHRcdFx0Zm9yIChpPTA7IGk8dmVyc2lvbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZlcnNpb25baV0gPSBwYXJzZUludCh2ZXJzaW9uW2ldLm1hdGNoKC9cXGQrLyksIDEwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdC8vIEludGVybmV0IEV4cGxvcmVyIC8gQWN0aXZlWFxuXHRcdH0gZWxzZSBpZiAodHlwZW9mKHdpbmRvdy5BY3RpdmVYT2JqZWN0KSAhPSAndW5kZWZpbmVkJykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXggPSBuZXcgQWN0aXZlWE9iamVjdChhY3RpdmVYKTtcblx0XHRcdFx0aWYgKGF4KSB7XG5cdFx0XHRcdFx0dmVyc2lvbiA9IGF4RGV0ZWN0KGF4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpIHsgfVxuXHRcdH1cblx0XHRyZXR1cm4gdmVyc2lvbjtcblx0fVxufTtcblxuLy8gQWRkIEZsYXNoIGRldGVjdGlvblxubWVqcy5QbHVnaW5EZXRlY3Rvci5hZGRQbHVnaW4oJ2ZsYXNoJywnU2hvY2t3YXZlIEZsYXNoJywnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnLCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcsIGZ1bmN0aW9uKGF4KSB7XG5cdC8vIGFkYXB0ZWQgZnJvbSBTV0ZPYmplY3Rcblx0dmFyIHZlcnNpb24gPSBbXSxcblx0XHRkID0gYXguR2V0VmFyaWFibGUoXCIkdmVyc2lvblwiKTtcblx0aWYgKGQpIHtcblx0XHRkID0gZC5zcGxpdChcIiBcIilbMV0uc3BsaXQoXCIsXCIpO1xuXHRcdHZlcnNpb24gPSBbcGFyc2VJbnQoZFswXSwgMTApLCBwYXJzZUludChkWzFdLCAxMCksIHBhcnNlSW50KGRbMl0sIDEwKV07XG5cdH1cblx0cmV0dXJuIHZlcnNpb247XG59KTtcblxuLy8gQWRkIFNpbHZlcmxpZ2h0IGRldGVjdGlvblxubWVqcy5QbHVnaW5EZXRlY3Rvci5hZGRQbHVnaW4oJ3NpbHZlcmxpZ2h0JywnU2lsdmVybGlnaHQgUGx1Zy1JbicsJ2FwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtMicsJ0FnQ29udHJvbC5BZ0NvbnRyb2wnLCBmdW5jdGlvbiAoYXgpIHtcblx0Ly8gU2lsdmVybGlnaHQgY2Fubm90IHJlcG9ydCBpdHMgdmVyc2lvbiBudW1iZXIgdG8gSUVcblx0Ly8gYnV0IGl0IGRvZXMgaGF2ZSBhIGlzVmVyc2lvblN1cHBvcnRlZCBmdW5jdGlvbiwgc28gd2UgaGF2ZSB0byBsb29wIHRocm91Z2ggaXQgdG8gZ2V0IGEgdmVyc2lvbiBudW1iZXIuXG5cdC8vIGFkYXB0ZWQgZnJvbSBodHRwOi8vd3d3LnNpbHZlcmxpZ2h0dmVyc2lvbi5jb20vXG5cdHZhciB2ID0gWzAsMCwwLDBdLFxuXHRcdGxvb3BNYXRjaCA9IGZ1bmN0aW9uKGF4LCB2LCBpLCBuKSB7XG5cdFx0XHR3aGlsZShheC5pc1ZlcnNpb25TdXBwb3J0ZWQodlswXSsgXCIuXCIrIHZbMV0gKyBcIi5cIiArIHZbMl0gKyBcIi5cIiArIHZbM10pKXtcblx0XHRcdFx0dltpXSs9bjtcblx0XHRcdH1cblx0XHRcdHZbaV0gLT0gbjtcblx0XHR9O1xuXHRsb29wTWF0Y2goYXgsIHYsIDAsIDEpO1xuXHRsb29wTWF0Y2goYXgsIHYsIDEsIDEpO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMDAwKTsgLy8gdGhlIHRoaXJkIHBsYWNlIGluIHRoZSB2ZXJzaW9uIG51bWJlciBpcyB1c3VhbGx5IDUgZGlnaXRzICg0LjAueHh4eHgpXG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMTAwMCk7XG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMTAwKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAyLCAxMCk7XG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMSk7XG5cdGxvb3BNYXRjaChheCwgdiwgMywgMSk7XG5cblx0cmV0dXJuIHY7XG59KTtcbi8vIGFkZCBhZG9iZSBhY3JvYmF0XG4vKlxuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdhY3JvYmF0JywnQWRvYmUgQWNyb2JhdCcsJ2FwcGxpY2F0aW9uL3BkZicsJ0Fjcm9QREYuUERGJywgZnVuY3Rpb24gKGF4KSB7XG5cdHZhciB2ZXJzaW9uID0gW10sXG5cdFx0ZCA9IGF4LkdldFZlcnNpb25zKCkuc3BsaXQoJywnKVswXS5zcGxpdCgnPScpWzFdLnNwbGl0KCcuJyk7XG5cblx0aWYgKGQpIHtcblx0XHR2ZXJzaW9uID0gW3BhcnNlSW50KGRbMF0sIDEwKSwgcGFyc2VJbnQoZFsxXSwgMTApLCBwYXJzZUludChkWzJdLCAxMCldO1xuXHR9XG5cdHJldHVybiB2ZXJzaW9uO1xufSk7XG4qL1xuLy8gbmVjZXNzYXJ5IGRldGVjdGlvbiAoZml4ZXMgZm9yIDxJRTkpXG5tZWpzLk1lZGlhRmVhdHVyZXMgPSB7XG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhclxuXHRcdFx0dCA9IHRoaXMsXG5cdFx0XHRkID0gZG9jdW1lbnQsXG5cdFx0XHRuYXYgPSBtZWpzLlBsdWdpbkRldGVjdG9yLm5hdixcblx0XHRcdHVhID0gbWVqcy5QbHVnaW5EZXRlY3Rvci51YS50b0xvd2VyQ2FzZSgpLFxuXHRcdFx0aSxcblx0XHRcdHYsXG5cdFx0XHRodG1sNUVsZW1lbnRzID0gWydzb3VyY2UnLCd0cmFjaycsJ2F1ZGlvJywndmlkZW8nXTtcblxuXHRcdC8vIGRldGVjdCBicm93c2VycyAob25seSB0aGUgb25lcyB0aGF0IGhhdmUgc29tZSBraW5kIG9mIHF1aXJrIHdlIG5lZWQgdG8gd29yayBhcm91bmQpXG5cdFx0dC5pc2lQYWQgPSAodWEubWF0Y2goL2lwYWQvaSkgIT09IG51bGwpO1xuXHRcdHQuaXNpUGhvbmUgPSAodWEubWF0Y2goL2lwaG9uZS9pKSAhPT0gbnVsbCk7XG5cdFx0dC5pc2lPUyA9IHQuaXNpUGhvbmUgfHwgdC5pc2lQYWQ7XG5cdFx0dC5pc0FuZHJvaWQgPSAodWEubWF0Y2goL2FuZHJvaWQvaSkgIT09IG51bGwpO1xuXHRcdHQuaXNCdXN0ZWRBbmRyb2lkID0gKHVhLm1hdGNoKC9hbmRyb2lkIDJcXC5bMTJdLykgIT09IG51bGwpO1xuXHRcdHQuaXNCdXN0ZWROYXRpdmVIVFRQUyA9IChsb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgJiYgKHVhLm1hdGNoKC9hbmRyb2lkIFsxMl1cXC4vKSAhPT0gbnVsbCB8fCB1YS5tYXRjaCgvbWFjaW50b3NoLiogdmVyc2lvbi4qIHNhZmFyaS8pICE9PSBudWxsKSk7XG5cdFx0dC5pc0lFID0gKG5hdi5hcHBOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcIm1pY3Jvc29mdFwiKSAhPSAtMSB8fCBuYXYuYXBwTmFtZS50b0xvd2VyQ2FzZSgpLm1hdGNoKC90cmlkZW50L2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc0Nocm9tZSA9ICh1YS5tYXRjaCgvY2hyb21lL2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc0Nocm9taXVtID0gKHVhLm1hdGNoKC9jaHJvbWl1bS9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNGaXJlZm94ID0gKHVhLm1hdGNoKC9maXJlZm94L2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc1dlYmtpdCA9ICh1YS5tYXRjaCgvd2Via2l0L2dpKSAhPT0gbnVsbCk7XG5cdFx0dC5pc0dlY2tvID0gKHVhLm1hdGNoKC9nZWNrby9naSkgIT09IG51bGwpICYmICF0LmlzV2Via2l0ICYmICF0LmlzSUU7XG5cdFx0dC5pc09wZXJhID0gKHVhLm1hdGNoKC9vcGVyYS9naSkgIT09IG51bGwpO1xuXHRcdHQuaGFzVG91Y2ggPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTsgLy8gICYmIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT0gbnVsbCk7IC8vIHRoaXMgYnJlYWtzIGlPUyA3XG5cdFx0XG5cdFx0Ly8gYm9ycm93ZWQgZnJvbSBNb2Rlcm5penJcblx0XHR0LnN2ZyA9ICEhIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAmJlxuXHRcdFx0XHQhISBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywnc3ZnJykuY3JlYXRlU1ZHUmVjdDtcblxuXHRcdC8vIGNyZWF0ZSBIVE1MNSBtZWRpYSBlbGVtZW50cyBmb3IgSUUgYmVmb3JlIDksIGdldCBhIDx2aWRlbz4gZWxlbWVudCBmb3IgZnVsbHNjcmVlbiBkZXRlY3Rpb25cblx0XHRmb3IgKGk9MDsgaTxodG1sNUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChodG1sNUVsZW1lbnRzW2ldKTtcblx0XHR9XG5cdFx0XG5cdFx0dC5zdXBwb3J0c01lZGlhVGFnID0gKHR5cGVvZiB2LmNhblBsYXlUeXBlICE9PSAndW5kZWZpbmVkJyB8fCB0LmlzQnVzdGVkQW5kcm9pZCk7XG5cblx0XHQvLyBGaXggZm9yIElFOSBvbiBXaW5kb3dzIDdOIC8gV2luZG93cyA3S04gKE1lZGlhIFBsYXllciBub3QgaW5zdGFsbGVyKVxuXHRcdHRyeXtcblx0XHRcdHYuY2FuUGxheVR5cGUoXCJ2aWRlby9tcDRcIik7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0dC5zdXBwb3J0c01lZGlhVGFnID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gZGV0ZWN0IG5hdGl2ZSBKYXZhU2NyaXB0IGZ1bGxzY3JlZW4gKFNhZmFyaS9GaXJlZm94IG9ubHksIENocm9tZSBzdGlsbCBmYWlscylcblx0XHRcblx0XHQvLyBpT1Ncblx0XHR0Lmhhc1NlbWlOYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2LndlYmtpdEVudGVyRnVsbHNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdFxuXHRcdC8vIFczQ1xuXHRcdHQuaGFzTmF0aXZlRnVsbHNjcmVlbiA9ICh0eXBlb2Ygdi5yZXF1ZXN0RnVsbHNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdFxuXHRcdC8vIHdlYmtpdC9maXJlZm94L0lFMTErXG5cdFx0dC5oYXNXZWJraXROYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuICE9PSAndW5kZWZpbmVkJyk7XG5cdFx0dC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2Lm1velJlcXVlc3RGdWxsU2NyZWVuICE9PSAndW5kZWZpbmVkJyk7XG5cdFx0dC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4gPSAodHlwZW9mIHYubXNSZXF1ZXN0RnVsbHNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdFxuXHRcdHQuaGFzVHJ1ZU5hdGl2ZUZ1bGxTY3JlZW4gPSAodC5oYXNXZWJraXROYXRpdmVGdWxsU2NyZWVuIHx8IHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbiB8fCB0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbik7XG5cdFx0dC5uYXRpdmVGdWxsU2NyZWVuRW5hYmxlZCA9IHQuaGFzVHJ1ZU5hdGl2ZUZ1bGxTY3JlZW47XG5cdFx0XG5cdFx0Ly8gRW5hYmxlZD9cblx0XHRpZiAodC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHR0Lm5hdGl2ZUZ1bGxTY3JlZW5FbmFibGVkID0gZG9jdW1lbnQubW96RnVsbFNjcmVlbkVuYWJsZWQ7XG5cdFx0fSBlbHNlIGlmICh0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0dC5uYXRpdmVGdWxsU2NyZWVuRW5hYmxlZCA9IGRvY3VtZW50Lm1zRnVsbHNjcmVlbkVuYWJsZWQ7XHRcdFxuXHRcdH1cblx0XHRcblx0XHRpZiAodC5pc0Nocm9tZSkge1xuXHRcdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRpZiAodC5oYXNUcnVlTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XG5cdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnJztcblx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHsgXG5cdFx0XHRcdHQuZnVsbFNjcmVlbkV2ZW50TmFtZSA9ICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJztcblx0XHRcdFx0XG5cdFx0XHR9IGVsc2UgaWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnbW96ZnVsbHNjcmVlbmNoYW5nZSc7XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmICh0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnTVNGdWxsc2NyZWVuQ2hhbmdlJztcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dC5pc0Z1bGxTY3JlZW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdHJldHVybiBkLm1vekZ1bGxTY3JlZW47XG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdHJldHVybiBkLndlYmtpdElzRnVsbFNjcmVlbjtcblx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC5tc0Z1bGxzY3JlZW5FbGVtZW50ICE9PSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHR0LnJlcXVlc3RGdWxsU2NyZWVuID0gZnVuY3Rpb24oZWwpIHtcblx0XHRcblx0XHRcdFx0aWYgKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZWwubW96UmVxdWVzdEZ1bGxTY3JlZW4oKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZWwubXNSZXF1ZXN0RnVsbHNjcmVlbigpO1xuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dC5jYW5jZWxGdWxsU2NyZWVuID0gZnVuY3Rpb24oKSB7XHRcdFx0XHRcblx0XHRcdFx0aWYgKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGRvY3VtZW50LndlYmtpdENhbmNlbEZ1bGxTY3JlZW4oKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRkb2N1bWVudC5tc0V4aXRGdWxsc2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cdFxuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdFxuXHRcdC8vIE9TIFggMTAuNSBjYW4ndCBkbyB0aGlzIGV2ZW4gaWYgaXQgc2F5cyBpdCBjYW4gOihcblx0XHRpZiAodC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiAmJiB1YS5tYXRjaCgvbWFjIG9zIHggMTBfNS9pKSkge1xuXHRcdFx0dC5oYXNOYXRpdmVGdWxsU2NyZWVuID0gZmFsc2U7XG5cdFx0XHR0Lmhhc1NlbWlOYXRpdmVGdWxsU2NyZWVuID0gZmFsc2U7XG5cdFx0fVxuXHRcdFxuXHR9XG59O1xubWVqcy5NZWRpYUZlYXR1cmVzLmluaXQoKTtcblxuLypcbmV4dGVuc2lvbiBtZXRob2RzIHRvIDx2aWRlbz4gb3IgPGF1ZGlvPiBvYmplY3QgdG8gYnJpbmcgaXQgaW50byBwYXJpdHkgd2l0aCBQbHVnaW5NZWRpYUVsZW1lbnQgKHNlZSBiZWxvdylcbiovXG5tZWpzLkh0bWxNZWRpYUVsZW1lbnQgPSB7XG5cdHBsdWdpblR5cGU6ICduYXRpdmUnLFxuXHRpc0Z1bGxTY3JlZW46IGZhbHNlLFxuXG5cdHNldEN1cnJlbnRUaW1lOiBmdW5jdGlvbiAodGltZSkge1xuXHRcdHRoaXMuY3VycmVudFRpbWUgPSB0aW1lO1xuXHR9LFxuXG5cdHNldE11dGVkOiBmdW5jdGlvbiAobXV0ZWQpIHtcblx0XHR0aGlzLm11dGVkID0gbXV0ZWQ7XG5cdH0sXG5cblx0c2V0Vm9sdW1lOiBmdW5jdGlvbiAodm9sdW1lKSB7XG5cdFx0dGhpcy52b2x1bWUgPSB2b2x1bWU7XG5cdH0sXG5cblx0Ly8gZm9yIHBhcml0eSB3aXRoIHRoZSBwbHVnaW4gdmVyc2lvbnNcblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMucGF1c2UoKTtcblx0fSxcblxuXHQvLyBUaGlzIGNhbiBiZSBhIHVybCBzdHJpbmdcblx0Ly8gb3IgYW4gYXJyYXkgW3tzcmM6J2ZpbGUubXA0Jyx0eXBlOid2aWRlby9tcDQnfSx7c3JjOidmaWxlLndlYm0nLHR5cGU6J3ZpZGVvL3dlYm0nfV1cblx0c2V0U3JjOiBmdW5jdGlvbiAodXJsKSB7XG5cdFx0XG5cdFx0Ly8gRml4IGZvciBJRTkgd2hpY2ggY2FuJ3Qgc2V0IC5zcmMgd2hlbiB0aGVyZSBhcmUgPHNvdXJjZT4gZWxlbWVudHMuIEF3ZXNvbWUsIHJpZ2h0P1xuXHRcdHZhciBcblx0XHRcdGV4aXN0aW5nU291cmNlcyA9IHRoaXMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NvdXJjZScpO1xuXHRcdHdoaWxlIChleGlzdGluZ1NvdXJjZXMubGVuZ3RoID4gMCl7XG5cdFx0XHR0aGlzLnJlbW92ZUNoaWxkKGV4aXN0aW5nU291cmNlc1swXSk7XG5cdFx0fVxuXHRcblx0XHRpZiAodHlwZW9mIHVybCA9PSAnc3RyaW5nJykge1xuXHRcdFx0dGhpcy5zcmMgPSB1cmw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpLCBtZWRpYTtcblxuXHRcdFx0Zm9yIChpPTA7IGk8dXJsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG1lZGlhID0gdXJsW2ldO1xuXHRcdFx0XHRpZiAodGhpcy5jYW5QbGF5VHlwZShtZWRpYS50eXBlKSkge1xuXHRcdFx0XHRcdHRoaXMuc3JjID0gbWVkaWEuc3JjO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNldFZpZGVvU2l6ZTogZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdH1cbn07XG5cbi8qXG5NaW1pY3MgdGhlIDx2aWRlby9hdWRpbz4gZWxlbWVudCBieSBjYWxsaW5nIEZsYXNoJ3MgRXh0ZXJuYWwgSW50ZXJmYWNlIG9yIFNpbHZlcmxpZ2h0cyBbU2NyaXB0YWJsZU1lbWJlcl1cbiovXG5tZWpzLlBsdWdpbk1lZGlhRWxlbWVudCA9IGZ1bmN0aW9uIChwbHVnaW5pZCwgcGx1Z2luVHlwZSwgbWVkaWFVcmwpIHtcblx0dGhpcy5pZCA9IHBsdWdpbmlkO1xuXHR0aGlzLnBsdWdpblR5cGUgPSBwbHVnaW5UeXBlO1xuXHR0aGlzLnNyYyA9IG1lZGlhVXJsO1xuXHR0aGlzLmV2ZW50cyA9IHt9O1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbn07XG5cbi8vIEphdmFTY3JpcHQgdmFsdWVzIGFuZCBFeHRlcm5hbEludGVyZmFjZSBtZXRob2RzIHRoYXQgbWF0Y2ggSFRNTDUgdmlkZW8gcHJvcGVydGllcyBtZXRob2RzXG4vLyBodHRwOi8vd3d3LmFkb2JlLmNvbS9saXZlZG9jcy9mbGFzaC85LjAvQWN0aW9uU2NyaXB0TGFuZ1JlZlYzL2ZsL3ZpZGVvL0ZMVlBsYXliYWNrLmh0bWxcbi8vIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3ZpZGVvLmh0bWxcbm1lanMuUGx1Z2luTWVkaWFFbGVtZW50LnByb3RvdHlwZSA9IHtcblxuXHQvLyBzcGVjaWFsXG5cdHBsdWdpbkVsZW1lbnQ6IG51bGwsXG5cdHBsdWdpblR5cGU6ICcnLFxuXHRpc0Z1bGxTY3JlZW46IGZhbHNlLFxuXG5cdC8vIG5vdCBpbXBsZW1lbnRlZCA6KFxuXHRwbGF5YmFja1JhdGU6IC0xLFxuXHRkZWZhdWx0UGxheWJhY2tSYXRlOiAtMSxcblx0c2Vla2FibGU6IFtdLFxuXHRwbGF5ZWQ6IFtdLFxuXG5cdC8vIEhUTUw1IHJlYWQtb25seSBwcm9wZXJ0aWVzXG5cdHBhdXNlZDogdHJ1ZSxcblx0ZW5kZWQ6IGZhbHNlLFxuXHRzZWVraW5nOiBmYWxzZSxcblx0ZHVyYXRpb246IDAsXG5cdGVycm9yOiBudWxsLFxuXHR0YWdOYW1lOiAnJyxcblxuXHQvLyBIVE1MNSBnZXQvc2V0IHByb3BlcnRpZXMsIGJ1dCBvbmx5IHNldCAodXBkYXRlZCBieSBldmVudCBoYW5kbGVycylcblx0bXV0ZWQ6IGZhbHNlLFxuXHR2b2x1bWU6IDEsXG5cdGN1cnJlbnRUaW1lOiAwLFxuXG5cdC8vIEhUTUw1IG1ldGhvZHNcblx0cGxheTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsKSB7XG5cdFx0XHRpZiAodGhpcy5wbHVnaW5UeXBlID09ICd5b3V0dWJlJyB8fCB0aGlzLnBsdWdpblR5cGUgPT0gJ3ZpbWVvJykge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5wbGF5VmlkZW8oKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBsYXlNZWRpYSgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5wYXVzZWQgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGxvYWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLmxvYWRNZWRpYSgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aGlzLnBhdXNlZCA9IGZhbHNlO1xuXHRcdH1cblx0fSxcblx0cGF1c2U6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkucGF1c2VWaWRlbygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkucGF1c2VNZWRpYSgpO1xuXHRcdFx0fVx0XHRcdFxuXHRcdFx0XG5cdFx0XHRcblx0XHRcdHRoaXMucGF1c2VkID0gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc3RvcFZpZGVvKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5zdG9wTWVkaWEoKTtcblx0XHRcdH1cdFxuXHRcdFx0dGhpcy5wYXVzZWQgPSB0cnVlO1xuXHRcdH1cblx0fSxcblx0Y2FuUGxheVR5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcblx0XHR2YXIgaSxcblx0XHRcdGosXG5cdFx0XHRwbHVnaW5JbmZvLFxuXHRcdFx0cGx1Z2luVmVyc2lvbnMgPSBtZWpzLnBsdWdpbnNbdGhpcy5wbHVnaW5UeXBlXTtcblxuXHRcdGZvciAoaT0wOyBpPHBsdWdpblZlcnNpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwbHVnaW5JbmZvID0gcGx1Z2luVmVyc2lvbnNbaV07XG5cblx0XHRcdC8vIHRlc3QgaWYgdXNlciBoYXMgdGhlIGNvcnJlY3QgcGx1Z2luIHZlcnNpb25cblx0XHRcdGlmIChtZWpzLlBsdWdpbkRldGVjdG9yLmhhc1BsdWdpblZlcnNpb24odGhpcy5wbHVnaW5UeXBlLCBwbHVnaW5JbmZvLnZlcnNpb24pKSB7XG5cblx0XHRcdFx0Ly8gdGVzdCBmb3IgcGx1Z2luIHBsYXliYWNrIHR5cGVzXG5cdFx0XHRcdGZvciAoaj0wOyBqPHBsdWdpbkluZm8udHlwZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHQvLyBmaW5kIHBsdWdpbiB0aGF0IGNhbiBwbGF5IHRoZSB0eXBlXG5cdFx0XHRcdFx0aWYgKHR5cGUgPT0gcGx1Z2luSW5mby50eXBlc1tqXSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICdwcm9iYWJseSc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuICcnO1xuXHR9LFxuXHRcblx0cG9zaXRpb25GdWxsc2NyZWVuQnV0dG9uOiBmdW5jdGlvbih4LHksdmlzaWJsZUFuZEFib3ZlKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkucG9zaXRpb25GdWxsc2NyZWVuQnV0dG9uKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5wb3NpdGlvbkZ1bGxzY3JlZW5CdXR0b24oTWF0aC5mbG9vcih4KSxNYXRoLmZsb29yKHkpLHZpc2libGVBbmRBYm92ZSk7XG5cdFx0fVxuXHR9LFxuXHRcblx0aGlkZUZ1bGxzY3JlZW5CdXR0b246IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLmhpZGVGdWxsc2NyZWVuQnV0dG9uKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5oaWRlRnVsbHNjcmVlbkJ1dHRvbigpO1xuXHRcdH1cdFx0XG5cdH0sXHRcblx0XG5cblx0Ly8gY3VzdG9tIG1ldGhvZHMgc2luY2Ugbm90IGFsbCBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9ucyBzdXBwb3J0IGdldC9zZXRcblxuXHQvLyBUaGlzIGNhbiBiZSBhIHVybCBzdHJpbmdcblx0Ly8gb3IgYW4gYXJyYXkgW3tzcmM6J2ZpbGUubXA0Jyx0eXBlOid2aWRlby9tcDQnfSx7c3JjOidmaWxlLndlYm0nLHR5cGU6J3ZpZGVvL3dlYm0nfV1cblx0c2V0U3JjOiBmdW5jdGlvbiAodXJsKSB7XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT0gJ3N0cmluZycpIHtcblx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFNyYyhtZWpzLlV0aWxpdHkuYWJzb2x1dGl6ZVVybCh1cmwpKTtcblx0XHRcdHRoaXMuc3JjID0gbWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwodXJsKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGksIG1lZGlhO1xuXG5cdFx0XHRmb3IgKGk9MDsgaTx1cmwubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bWVkaWEgPSB1cmxbaV07XG5cdFx0XHRcdGlmICh0aGlzLmNhblBsYXlUeXBlKG1lZGlhLnR5cGUpKSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0U3JjKG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKG1lZGlhLnNyYykpO1xuXHRcdFx0XHRcdHRoaXMuc3JjID0gbWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwodXJsKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9LFxuXHRzZXRDdXJyZW50VGltZTogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2Vla1RvKHRpbWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0Q3VycmVudFRpbWUodGltZSk7XG5cdFx0XHR9XHRcdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRcblx0XHRcdHRoaXMuY3VycmVudFRpbWUgPSB0aW1lO1xuXHRcdH1cblx0fSxcblx0c2V0Vm9sdW1lOiBmdW5jdGlvbiAodm9sdW1lKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdC8vIHNhbWUgb24gWW91VHViZSBhbmQgTUVqc1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0Vm9sdW1lKHZvbHVtZSAqIDEwMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRWb2x1bWUodm9sdW1lKTtcblx0XHRcdH1cblx0XHRcdHRoaXMudm9sdW1lID0gdm9sdW1lO1xuXHRcdH1cblx0fSxcblx0c2V0TXV0ZWQ6IGZ1bmN0aW9uIChtdXRlZCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsKSB7XG5cdFx0XHRpZiAodGhpcy5wbHVnaW5UeXBlID09ICd5b3V0dWJlJykge1xuXHRcdFx0XHRpZiAobXV0ZWQpIHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5tdXRlKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5BcGkudW5NdXRlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5tdXRlZCA9IG11dGVkO1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoJ3ZvbHVtZWNoYW5nZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0TXV0ZWQobXV0ZWQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5tdXRlZCA9IG11dGVkO1xuXHRcdH1cblx0fSxcblxuXHQvLyBhZGRpdGlvbmFsIG5vbi1IVE1MNSBtZXRob2RzXG5cdHNldFZpZGVvU2l6ZTogZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcblx0XHRcblx0XHQvL2lmICh0aGlzLnBsdWdpblR5cGUgPT0gJ2ZsYXNoJyB8fCB0aGlzLnBsdWdpblR5cGUgPT0gJ3NpbHZlcmxpZ2h0Jykge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luRWxlbWVudCAmJiB0aGlzLnBsdWdpbkVsZW1lbnQuc3R5bGUpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuXHRcdFx0XHR0aGlzLnBsdWdpbkVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4Jztcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldFZpZGVvU2l6ZSkge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRWaWRlb1NpemUod2lkdGgsIGhlaWdodCk7XG5cdFx0XHR9XG5cdFx0Ly99XG5cdH0sXG5cblx0c2V0RnVsbHNjcmVlbjogZnVuY3Rpb24gKGZ1bGxzY3JlZW4pIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5zZXRGdWxsc2NyZWVuKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRGdWxsc2NyZWVuKGZ1bGxzY3JlZW4pO1xuXHRcdH1cblx0fSxcblx0XG5cdGVudGVyRnVsbFNjcmVlbjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbikge1xuXHRcdFx0dGhpcy5zZXRGdWxsc2NyZWVuKHRydWUpO1xuXHRcdH1cdFx0XG5cdFx0XG5cdH0sXG5cdFxuXHRleGl0RnVsbFNjcmVlbjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbikge1xuXHRcdFx0dGhpcy5zZXRGdWxsc2NyZWVuKGZhbHNlKTtcblx0XHR9XG5cdH0sXHRcblxuXHQvLyBzdGFydDogZmFrZSBldmVudHNcblx0YWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2ssIGJ1YmJsZSkge1xuXHRcdHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSB0aGlzLmV2ZW50c1tldmVudE5hbWVdIHx8IFtdO1xuXHRcdHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChjYWxsYmFjayk7XG5cdH0sXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKCFldmVudE5hbWUpIHsgdGhpcy5ldmVudHMgPSB7fTsgcmV0dXJuIHRydWU7IH1cblx0XHR2YXIgY2FsbGJhY2tzID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXTtcblx0XHRpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRydWU7XG5cdFx0aWYgKCFjYWxsYmFjaykgeyB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107IHJldHVybiB0cnVlOyB9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChjYWxsYmFja3NbaV0gPT09IGNhbGxiYWNrKSB7XG5cdFx0XHRcdHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFx0XG5cdGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uIChldmVudE5hbWUpIHtcblx0XHR2YXIgaSxcblx0XHRcdGFyZ3MsXG5cdFx0XHRjYWxsYmFja3MgPSB0aGlzLmV2ZW50c1tldmVudE5hbWVdO1xuXG5cdFx0aWYgKGNhbGxiYWNrcykge1xuXHRcdFx0YXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdC8vIGVuZDogZmFrZSBldmVudHNcblx0XG5cdC8vIGZha2UgRE9NIGF0dHJpYnV0ZSBtZXRob2RzXG5cdGhhc0F0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG5cdFx0cmV0dXJuIChuYW1lIGluIHRoaXMuYXR0cmlidXRlcyk7ICBcblx0fSxcblx0cmVtb3ZlQXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcblx0XHRkZWxldGUgdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuXHR9LFxuXHRnZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdGlmICh0aGlzLmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcblx0XHR9XG5cdFx0cmV0dXJuICcnO1xuXHR9LFxuXHRzZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcblx0XHR0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSB2YWx1ZTtcblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHRcdG1lanMuVXRpbGl0eS5yZW1vdmVTd2YodGhpcy5wbHVnaW5FbGVtZW50LmlkKTtcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLnVucmVnaXN0ZXJQbHVnaW5FbGVtZW50KHRoaXMucGx1Z2luRWxlbWVudC5pZCk7XG5cdH1cbn07XG5cbi8vIEhhbmRsZXMgY2FsbHMgZnJvbSBGbGFzaC9TaWx2ZXJsaWdodCBhbmQgcmVwb3J0cyB0aGVtIGFzIG5hdGl2ZSA8dmlkZW8vYXVkaW8+IGV2ZW50cyBhbmQgcHJvcGVydGllc1xubWVqcy5NZWRpYVBsdWdpbkJyaWRnZSA9IHtcblxuXHRwbHVnaW5NZWRpYUVsZW1lbnRzOnt9LFxuXHRodG1sTWVkaWFFbGVtZW50czp7fSxcblxuXHRyZWdpc3RlclBsdWdpbkVsZW1lbnQ6IGZ1bmN0aW9uIChpZCwgcGx1Z2luTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KSB7XG5cdFx0dGhpcy5wbHVnaW5NZWRpYUVsZW1lbnRzW2lkXSA9IHBsdWdpbk1lZGlhRWxlbWVudDtcblx0XHR0aGlzLmh0bWxNZWRpYUVsZW1lbnRzW2lkXSA9IGh0bWxNZWRpYUVsZW1lbnQ7XG5cdH0sXG5cblx0dW5yZWdpc3RlclBsdWdpbkVsZW1lbnQ6IGZ1bmN0aW9uIChpZCkge1xuXHRcdGRlbGV0ZSB0aGlzLnBsdWdpbk1lZGlhRWxlbWVudHNbaWRdO1xuXHRcdGRlbGV0ZSB0aGlzLmh0bWxNZWRpYUVsZW1lbnRzW2lkXTtcblx0fSxcblxuXHQvLyB3aGVuIEZsYXNoL1NpbHZlcmxpZ2h0IGlzIHJlYWR5LCBpdCBjYWxscyBvdXQgdG8gdGhpcyBtZXRob2Rcblx0aW5pdFBsdWdpbjogZnVuY3Rpb24gKGlkKSB7XG5cblx0XHR2YXIgcGx1Z2luTWVkaWFFbGVtZW50ID0gdGhpcy5wbHVnaW5NZWRpYUVsZW1lbnRzW2lkXSxcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSB0aGlzLmh0bWxNZWRpYUVsZW1lbnRzW2lkXTtcblxuXHRcdGlmIChwbHVnaW5NZWRpYUVsZW1lbnQpIHtcblx0XHRcdC8vIGZpbmQgdGhlIGphdmFzY3JpcHQgYnJpZGdlXG5cdFx0XHRzd2l0Y2ggKHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5UeXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJmbGFzaFwiOlxuXHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5FbGVtZW50ID0gcGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkFwaSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInNpbHZlcmxpZ2h0XCI6XG5cdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbHVnaW5NZWRpYUVsZW1lbnQuaWQpO1xuXHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudC5Db250ZW50Lk1lZGlhRWxlbWVudEpTO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcblx0XHRcdGlmIChwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpICE9IG51bGwgJiYgcGx1Z2luTWVkaWFFbGVtZW50LnN1Y2Nlc3MpIHtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnN1Y2Nlc3MocGx1Z2luTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0Ly8gcmVjZWl2ZXMgZXZlbnRzIGZyb20gRmxhc2gvU2lsdmVybGlnaHQgYW5kIHNlbmRzIHRoZW0gb3V0IGFzIEhUTUw1IG1lZGlhIGV2ZW50c1xuXHQvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS92aWRlby5odG1sXG5cdGZpcmVFdmVudDogZnVuY3Rpb24gKGlkLCBldmVudE5hbWUsIHZhbHVlcykge1xuXG5cdFx0dmFyXG5cdFx0XHRlLFxuXHRcdFx0aSxcblx0XHRcdGJ1ZmZlcmVkVGltZSxcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudCA9IHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF07XG5cblx0XHRpZighcGx1Z2luTWVkaWFFbGVtZW50KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcblx0XHQvLyBmYWtlIGV2ZW50IG9iamVjdCB0byBtaW1pYyByZWFsIEhUTUwgbWVkaWEgZXZlbnQuXG5cdFx0ZSA9IHtcblx0XHRcdHR5cGU6IGV2ZW50TmFtZSxcblx0XHRcdHRhcmdldDogcGx1Z2luTWVkaWFFbGVtZW50XG5cdFx0fTtcblxuXHRcdC8vIGF0dGFjaCBhbGwgdmFsdWVzIHRvIGVsZW1lbnQgYW5kIGV2ZW50IG9iamVjdFxuXHRcdGZvciAoaSBpbiB2YWx1ZXMpIHtcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudFtpXSA9IHZhbHVlc1tpXTtcblx0XHRcdGVbaV0gPSB2YWx1ZXNbaV07XG5cdFx0fVxuXG5cdFx0Ly8gZmFrZSB0aGUgbmV3ZXIgVzNDIGJ1ZmZlcmVkIFRpbWVSYW5nZSAobG9hZGVkIGFuZCB0b3RhbCBoYXZlIGJlZW4gcmVtb3ZlZClcblx0XHRidWZmZXJlZFRpbWUgPSB2YWx1ZXMuYnVmZmVyZWRUaW1lIHx8IDA7XG5cblx0XHRlLnRhcmdldC5idWZmZXJlZCA9IGUuYnVmZmVyZWQgPSB7XG5cdFx0XHRzdGFydDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9LFxuXHRcdFx0ZW5kOiBmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1ZmZlcmVkVGltZTtcblx0XHRcdH0sXG5cdFx0XHRsZW5ndGg6IDFcblx0XHR9O1xuXG5cdFx0cGx1Z2luTWVkaWFFbGVtZW50LmRpc3BhdGNoRXZlbnQoZS50eXBlLCBlKTtcblx0fVxufTtcblxuLypcbkRlZmF1bHQgb3B0aW9uc1xuKi9cbm1lanMuTWVkaWFFbGVtZW50RGVmYXVsdHMgPSB7XG5cdC8vIGFsbG93cyB0ZXN0aW5nIG9uIEhUTUw1LCBmbGFzaCwgc2lsdmVybGlnaHRcblx0Ly8gYXV0bzogYXR0ZW1wdHMgdG8gZGV0ZWN0IHdoYXQgdGhlIGJyb3dzZXIgY2FuIGRvXG5cdC8vIGF1dG9fcGx1Z2luOiBwcmVmZXIgcGx1Z2lucyBhbmQgdGhlbiBhdHRlbXB0IG5hdGl2ZSBIVE1MNVxuXHQvLyBuYXRpdmU6IGZvcmNlcyBIVE1MNSBwbGF5YmFja1xuXHQvLyBzaGltOiBkaXNhbGxvd3MgSFRNTDUsIHdpbGwgYXR0ZW1wdCBlaXRoZXIgRmxhc2ggb3IgU2lsdmVybGlnaHRcblx0Ly8gbm9uZTogZm9yY2VzIGZhbGxiYWNrIHZpZXdcblx0bW9kZTogJ2F1dG8nLFxuXHQvLyByZW1vdmUgb3IgcmVvcmRlciB0byBjaGFuZ2UgcGx1Z2luIHByaW9yaXR5IGFuZCBhdmFpbGFiaWxpdHlcblx0cGx1Z2luczogWydmbGFzaCcsJ3NpbHZlcmxpZ2h0JywneW91dHViZScsJ3ZpbWVvJ10sXG5cdC8vIHNob3dzIGRlYnVnIGVycm9ycyBvbiBzY3JlZW5cblx0ZW5hYmxlUGx1Z2luRGVidWc6IGZhbHNlLFxuXHQvLyB1c2UgcGx1Z2luIGZvciBicm93c2VycyB0aGF0IGhhdmUgdHJvdWJsZSB3aXRoIEJhc2ljIEF1dGhlbnRpY2F0aW9uIG9uIEhUVFBTIHNpdGVzXG5cdGh0dHBzQmFzaWNBdXRoU2l0ZTogZmFsc2UsXG5cdC8vIG92ZXJyaWRlcyB0aGUgdHlwZSBzcGVjaWZpZWQsIHVzZWZ1bCBmb3IgZHluYW1pYyBpbnN0YW50aWF0aW9uXG5cdHR5cGU6ICcnLFxuXHQvLyBwYXRoIHRvIEZsYXNoIGFuZCBTaWx2ZXJsaWdodCBwbHVnaW5zXG5cdHBsdWdpblBhdGg6IG1lanMuVXRpbGl0eS5nZXRTY3JpcHRQYXRoKFsnbWVkaWFlbGVtZW50LmpzJywnbWVkaWFlbGVtZW50Lm1pbi5qcycsJ21lZGlhZWxlbWVudC1hbmQtcGxheWVyLmpzJywnbWVkaWFlbGVtZW50LWFuZC1wbGF5ZXIubWluLmpzJ10pLFxuXHQvLyBuYW1lIG9mIGZsYXNoIGZpbGVcblx0Zmxhc2hOYW1lOiAnZmxhc2htZWRpYWVsZW1lbnQuc3dmJyxcblx0Ly8gc3RyZWFtZXIgZm9yIFJUTVAgc3RyZWFtaW5nXG5cdGZsYXNoU3RyZWFtZXI6ICcnLFxuXHQvLyB0dXJucyBvbiB0aGUgc21vb3RoaW5nIGZpbHRlciBpbiBGbGFzaFxuXHRlbmFibGVQbHVnaW5TbW9vdGhpbmc6IGZhbHNlLFxuXHQvLyBlbmFibGVkIHBzZXVkby1zdHJlYW1pbmcgKHNlZWspIG9uIC5tcDQgZmlsZXNcblx0ZW5hYmxlUHNldWRvU3RyZWFtaW5nOiBmYWxzZSxcblx0Ly8gc3RhcnQgcXVlcnkgcGFyYW1ldGVyIHNlbnQgdG8gc2VydmVyIGZvciBwc2V1ZG8tc3RyZWFtaW5nXG5cdHBzZXVkb1N0cmVhbWluZ1N0YXJ0UXVlcnlQYXJhbTogJ3N0YXJ0Jyxcblx0Ly8gbmFtZSBvZiBzaWx2ZXJsaWdodCBmaWxlXG5cdHNpbHZlcmxpZ2h0TmFtZTogJ3NpbHZlcmxpZ2h0bWVkaWFlbGVtZW50LnhhcCcsXG5cdC8vIGRlZmF1bHQgaWYgdGhlIDx2aWRlbyB3aWR0aD4gaXMgbm90IHNwZWNpZmllZFxuXHRkZWZhdWx0VmlkZW9XaWR0aDogNDgwLFxuXHQvLyBkZWZhdWx0IGlmIHRoZSA8dmlkZW8gaGVpZ2h0PiBpcyBub3Qgc3BlY2lmaWVkXG5cdGRlZmF1bHRWaWRlb0hlaWdodDogMjcwLFxuXHQvLyBvdmVycmlkZXMgPHZpZGVvIHdpZHRoPlxuXHRwbHVnaW5XaWR0aDogLTEsXG5cdC8vIG92ZXJyaWRlcyA8dmlkZW8gaGVpZ2h0PlxuXHRwbHVnaW5IZWlnaHQ6IC0xLFxuXHQvLyBhZGRpdGlvbmFsIHBsdWdpbiB2YXJpYWJsZXMgaW4gJ2tleT12YWx1ZScgZm9ybVxuXHRwbHVnaW5WYXJzOiBbXSxcdFxuXHQvLyByYXRlIGluIG1pbGxpc2Vjb25kcyBmb3IgRmxhc2ggYW5kIFNpbHZlcmxpZ2h0IHRvIGZpcmUgdGhlIHRpbWV1cGRhdGUgZXZlbnRcblx0Ly8gbGFyZ2VyIG51bWJlciBpcyBsZXNzIGFjY3VyYXRlLCBidXQgbGVzcyBzdHJhaW4gb24gcGx1Z2luLT5KYXZhU2NyaXB0IGJyaWRnZVxuXHR0aW1lclJhdGU6IDI1MCxcblx0Ly8gaW5pdGlhbCB2b2x1bWUgZm9yIHBsYXllclxuXHRzdGFydFZvbHVtZTogMC44LFxuXHRzdWNjZXNzOiBmdW5jdGlvbiAoKSB7IH0sXG5cdGVycm9yOiBmdW5jdGlvbiAoKSB7IH1cbn07XG5cbi8qXG5EZXRlcm1pbmVzIGlmIGEgYnJvd3NlciBzdXBwb3J0cyB0aGUgPHZpZGVvPiBvciA8YXVkaW8+IGVsZW1lbnRcbmFuZCByZXR1cm5zIGVpdGhlciB0aGUgbmF0aXZlIGVsZW1lbnQgb3IgYSBGbGFzaC9TaWx2ZXJsaWdodCB2ZXJzaW9uIHRoYXRcbm1pbWljcyBIVE1MNSBNZWRpYUVsZW1lbnRcbiovXG5tZWpzLk1lZGlhRWxlbWVudCA9IGZ1bmN0aW9uIChlbCwgbykge1xuXHRyZXR1cm4gbWVqcy5IdG1sTWVkaWFFbGVtZW50U2hpbS5jcmVhdGUoZWwsbyk7XG59O1xuXG5tZWpzLkh0bWxNZWRpYUVsZW1lbnRTaGltID0ge1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oZWwsIG8pIHtcblx0XHR2YXJcblx0XHRcdG9wdGlvbnMgPSBtZWpzLk1lZGlhRWxlbWVudERlZmF1bHRzLFxuXHRcdFx0aHRtbE1lZGlhRWxlbWVudCA9ICh0eXBlb2YoZWwpID09ICdzdHJpbmcnKSA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKSA6IGVsLFxuXHRcdFx0dGFnTmFtZSA9IGh0bWxNZWRpYUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpLFxuXHRcdFx0aXNNZWRpYVRhZyA9ICh0YWdOYW1lID09PSAnYXVkaW8nIHx8IHRhZ05hbWUgPT09ICd2aWRlbycpLFxuXHRcdFx0c3JjID0gKGlzTWVkaWFUYWcpID8gaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpIDogaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSxcblx0XHRcdHBvc3RlciA9IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdwb3N0ZXInKSxcblx0XHRcdGF1dG9wbGF5ID0gIGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhdXRvcGxheScpLFxuXHRcdFx0cHJlbG9hZCA9ICBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgncHJlbG9hZCcpLFxuXHRcdFx0Y29udHJvbHMgPSAgaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NvbnRyb2xzJyksXG5cdFx0XHRwbGF5YmFjayxcblx0XHRcdHByb3A7XG5cblx0XHQvLyBleHRlbmQgb3B0aW9uc1xuXHRcdGZvciAocHJvcCBpbiBvKSB7XG5cdFx0XHRvcHRpb25zW3Byb3BdID0gb1twcm9wXTtcblx0XHR9XG5cblx0XHQvLyBjbGVhbiB1cCBhdHRyaWJ1dGVzXG5cdFx0c3JjID0gXHRcdCh0eXBlb2Ygc3JjID09ICd1bmRlZmluZWQnIFx0fHwgc3JjID09PSBudWxsIHx8IHNyYyA9PSAnJykgPyBudWxsIDogc3JjO1x0XHRcblx0XHRwb3N0ZXIgPVx0KHR5cGVvZiBwb3N0ZXIgPT0gJ3VuZGVmaW5lZCcgXHR8fCBwb3N0ZXIgPT09IG51bGwpID8gJycgOiBwb3N0ZXI7XG5cdFx0cHJlbG9hZCA9IFx0KHR5cGVvZiBwcmVsb2FkID09ICd1bmRlZmluZWQnIFx0fHwgcHJlbG9hZCA9PT0gbnVsbCB8fCBwcmVsb2FkID09PSAnZmFsc2UnKSA/ICdub25lJyA6IHByZWxvYWQ7XG5cdFx0YXV0b3BsYXkgPSBcdCEodHlwZW9mIGF1dG9wbGF5ID09ICd1bmRlZmluZWQnIHx8IGF1dG9wbGF5ID09PSBudWxsIHx8IGF1dG9wbGF5ID09PSAnZmFsc2UnKTtcblx0XHRjb250cm9scyA9IFx0ISh0eXBlb2YgY29udHJvbHMgPT0gJ3VuZGVmaW5lZCcgfHwgY29udHJvbHMgPT09IG51bGwgfHwgY29udHJvbHMgPT09ICdmYWxzZScpO1xuXG5cdFx0Ly8gdGVzdCBmb3IgSFRNTDUgYW5kIHBsdWdpbiBjYXBhYmlsaXRpZXNcblx0XHRwbGF5YmFjayA9IHRoaXMuZGV0ZXJtaW5lUGxheWJhY2soaHRtbE1lZGlhRWxlbWVudCwgb3B0aW9ucywgbWVqcy5NZWRpYUZlYXR1cmVzLnN1cHBvcnRzTWVkaWFUYWcsIGlzTWVkaWFUYWcsIHNyYyk7XG5cdFx0cGxheWJhY2sudXJsID0gKHBsYXliYWNrLnVybCAhPT0gbnVsbCkgPyBtZWpzLlV0aWxpdHkuYWJzb2x1dGl6ZVVybChwbGF5YmFjay51cmwpIDogJyc7XG5cblx0XHRpZiAocGxheWJhY2subWV0aG9kID09ICduYXRpdmUnKSB7XG5cdFx0XHQvLyBzZWNvbmQgZml4IGZvciBhbmRyb2lkXG5cdFx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzQnVzdGVkQW5kcm9pZCkge1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHBsYXliYWNrLnVybDtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGxheSgpO1xuXHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XG5cdFx0XHQvLyBhZGQgbWV0aG9kcyB0byBuYXRpdmUgSFRNTE1lZGlhRWxlbWVudFxuXHRcdFx0cmV0dXJuIHRoaXMudXBkYXRlTmF0aXZlKHBsYXliYWNrLCBvcHRpb25zLCBhdXRvcGxheSwgcHJlbG9hZCk7XG5cdFx0fSBlbHNlIGlmIChwbGF5YmFjay5tZXRob2QgIT09ICcnKSB7XG5cdFx0XHQvLyBjcmVhdGUgcGx1Z2luIHRvIG1pbWljIEhUTUxNZWRpYUVsZW1lbnRcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlUGx1Z2luKCBwbGF5YmFjaywgIG9wdGlvbnMsIHBvc3RlciwgYXV0b3BsYXksIHByZWxvYWQsIGNvbnRyb2xzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gYm9vLCBubyBIVE1MNSwgbm8gRmxhc2gsIG5vIFNpbHZlcmxpZ2h0LlxuXHRcdFx0dGhpcy5jcmVhdGVFcnJvck1lc3NhZ2UoIHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIgKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9LFxuXHRcblx0ZGV0ZXJtaW5lUGxheWJhY2s6IGZ1bmN0aW9uKGh0bWxNZWRpYUVsZW1lbnQsIG9wdGlvbnMsIHN1cHBvcnRzTWVkaWFUYWcsIGlzTWVkaWFUYWcsIHNyYykge1xuXHRcdHZhclxuXHRcdFx0bWVkaWFGaWxlcyA9IFtdLFxuXHRcdFx0aSxcblx0XHRcdGosXG5cdFx0XHRrLFxuXHRcdFx0bCxcblx0XHRcdG4sXG5cdFx0XHR0eXBlLFxuXHRcdFx0cmVzdWx0ID0geyBtZXRob2Q6ICcnLCB1cmw6ICcnLCBodG1sTWVkaWFFbGVtZW50OiBodG1sTWVkaWFFbGVtZW50LCBpc1ZpZGVvOiAoaHRtbE1lZGlhRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT0gJ2F1ZGlvJyl9LFxuXHRcdFx0cGx1Z2luTmFtZSxcblx0XHRcdHBsdWdpblZlcnNpb25zLFxuXHRcdFx0cGx1Z2luSW5mbyxcblx0XHRcdGR1bW15LFxuXHRcdFx0bWVkaWE7XG5cdFx0XHRcblx0XHQvLyBTVEVQIDE6IEdldCBVUkwgYW5kIHR5cGUgZnJvbSA8dmlkZW8gc3JjPiBvciA8c291cmNlIHNyYz5cblxuXHRcdC8vIHN1cHBsaWVkIHR5cGUgb3ZlcnJpZGVzIDx2aWRlbyB0eXBlPiBhbmQgPHNvdXJjZSB0eXBlPlxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy50eXBlICE9ICd1bmRlZmluZWQnICYmIG9wdGlvbnMudHlwZSAhPT0gJycpIHtcblx0XHRcdFxuXHRcdFx0Ly8gYWNjZXB0IGVpdGhlciBzdHJpbmcgb3IgYXJyYXkgb2YgdHlwZXNcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy50eXBlID09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdG1lZGlhRmlsZXMucHVzaCh7dHlwZTpvcHRpb25zLnR5cGUsIHVybDpzcmN9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKGk9MDsgaTxvcHRpb25zLnR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRtZWRpYUZpbGVzLnB1c2goe3R5cGU6b3B0aW9ucy50eXBlW2ldLCB1cmw6c3JjfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdC8vIHRlc3QgZm9yIHNyYyBhdHRyaWJ1dGUgZmlyc3Rcblx0XHR9IGVsc2UgaWYgKHNyYyAhPT0gbnVsbCkge1xuXHRcdFx0dHlwZSA9IHRoaXMuZm9ybWF0VHlwZShzcmMsIGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpO1xuXHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOnR5cGUsIHVybDpzcmN9KTtcblxuXHRcdC8vIHRoZW4gdGVzdCBmb3IgPHNvdXJjZT4gZWxlbWVudHNcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdGVzdCA8c291cmNlPiB0eXBlcyB0byBzZWUgaWYgdGhleSBhcmUgdXNhYmxlXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgaHRtbE1lZGlhRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG4gPSBodG1sTWVkaWFFbGVtZW50LmNoaWxkTm9kZXNbaV07XG5cdFx0XHRcdGlmIChuLm5vZGVUeXBlID09IDEgJiYgbi50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ3NvdXJjZScpIHtcblx0XHRcdFx0XHRzcmMgPSBuLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG5cdFx0XHRcdFx0dHlwZSA9IHRoaXMuZm9ybWF0VHlwZShzcmMsIG4uZ2V0QXR0cmlidXRlKCd0eXBlJykpO1xuXHRcdFx0XHRcdG1lZGlhID0gbi5nZXRBdHRyaWJ1dGUoJ21lZGlhJyk7XG5cblx0XHRcdFx0XHRpZiAoIW1lZGlhIHx8ICF3aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgJiYgd2luZG93Lm1hdGNoTWVkaWEobWVkaWEpLm1hdGNoZXMpKSB7XG5cdFx0XHRcdFx0XHRtZWRpYUZpbGVzLnB1c2goe3R5cGU6dHlwZSwgdXJsOnNyY30pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBpbiB0aGUgY2FzZSBvZiBkeW5hbWljbHkgY3JlYXRlZCBwbGF5ZXJzXG5cdFx0Ly8gY2hlY2sgZm9yIGF1ZGlvIHR5cGVzXG5cdFx0aWYgKCFpc01lZGlhVGFnICYmIG1lZGlhRmlsZXMubGVuZ3RoID4gMCAmJiBtZWRpYUZpbGVzWzBdLnVybCAhPT0gbnVsbCAmJiB0aGlzLmdldFR5cGVGcm9tRmlsZShtZWRpYUZpbGVzWzBdLnVybCkuaW5kZXhPZignYXVkaW8nKSA+IC0xKSB7XG5cdFx0XHRyZXN1bHQuaXNWaWRlbyA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblxuXHRcdC8vIFNURVAgMjogVGVzdCBmb3IgcGxheWJhY2sgbWV0aG9kXG5cdFx0XG5cdFx0Ly8gc3BlY2lhbCBjYXNlIGZvciBBbmRyb2lkIHdoaWNoIHNhZGx5IGRvZXNuJ3QgaW1wbGVtZW50IHRoZSBjYW5QbGF5VHlwZSBmdW5jdGlvbiAoYWx3YXlzIHJldHVybnMgJycpXG5cdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0J1c3RlZEFuZHJvaWQpIHtcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuY2FuUGxheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG5cdFx0XHRcdHJldHVybiAodHlwZS5tYXRjaCgvdmlkZW9cXC8obXA0fG00dikvZ2kpICE9PSBudWxsKSA/ICdtYXliZScgOiAnJztcblx0XHRcdH07XG5cdFx0fVx0XHRcblx0XHRcblx0XHQvLyBzcGVjaWFsIGNhc2UgZm9yIENocm9taXVtIHRvIHNwZWNpZnkgbmF0aXZlbHkgc3VwcG9ydGVkIHZpZGVvIGNvZGVjcyAoaS5lLiBXZWJNIGFuZCBUaGVvcmEpIFxuXHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNDaHJvbWl1bSkgeyBcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuY2FuUGxheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7IFxuXHRcdFx0XHRyZXR1cm4gKHR5cGUubWF0Y2goL3ZpZGVvXFwvKHdlYm18b2d2fG9nZykvZ2kpICE9PSBudWxsKSA/ICdtYXliZScgOiAnJzsgXG5cdFx0XHR9OyBcblx0XHR9XG5cblx0XHQvLyB0ZXN0IGZvciBuYXRpdmUgcGxheWJhY2sgZmlyc3Rcblx0XHRpZiAoc3VwcG9ydHNNZWRpYVRhZyAmJiAob3B0aW9ucy5tb2RlID09PSAnYXV0bycgfHwgb3B0aW9ucy5tb2RlID09PSAnYXV0b19wbHVnaW4nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ25hdGl2ZScpICAmJiAhKG1lanMuTWVkaWFGZWF0dXJlcy5pc0J1c3RlZE5hdGl2ZUhUVFBTICYmIG9wdGlvbnMuaHR0cHNCYXNpY0F1dGhTaXRlID09PSB0cnVlKSkge1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRpZiAoIWlzTWVkaWFUYWcpIHtcblxuXHRcdFx0XHQvLyBjcmVhdGUgYSByZWFsIEhUTUw1IE1lZGlhIEVsZW1lbnQgXG5cdFx0XHRcdGR1bW15ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggcmVzdWx0LmlzVmlkZW8gPyAndmlkZW8nIDogJ2F1ZGlvJyk7XHRcdFx0XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHVtbXksIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyB1c2UgdGhpcyBvbmUgZnJvbSBub3cgb25cblx0XHRcdFx0cmVzdWx0Lmh0bWxNZWRpYUVsZW1lbnQgPSBodG1sTWVkaWFFbGVtZW50ID0gZHVtbXk7XG5cdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0Zm9yIChpPTA7IGk8bWVkaWFGaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQvLyBub3JtYWwgY2hlY2tcblx0XHRcdFx0aWYgKG1lZGlhRmlsZXNbaV0udHlwZSA9PSBcInZpZGVvL20zdThcIiB8fCBodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlKG1lZGlhRmlsZXNbaV0udHlwZSkucmVwbGFjZSgvbm8vLCAnJykgIT09ICcnXG5cdFx0XHRcdFx0Ly8gc3BlY2lhbCBjYXNlIGZvciBNYWMvU2FmYXJpIDUuMC4zIHdoaWNoIGFuc3dlcnMgJycgdG8gY2FuUGxheVR5cGUoJ2F1ZGlvL21wMycpIGJ1dCAnbWF5YmUnIHRvIGNhblBsYXlUeXBlKCdhdWRpby9tcGVnJylcblx0XHRcdFx0XHR8fCBodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlKG1lZGlhRmlsZXNbaV0udHlwZS5yZXBsYWNlKC9tcDMvLCdtcGVnJykpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJ1xuXHRcdFx0XHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgbTRhIHN1cHBvcnRlZCBieSBkZXRlY3RpbmcgbXA0IHN1cHBvcnRcblx0XHRcdFx0XHR8fCBodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlKG1lZGlhRmlsZXNbaV0udHlwZS5yZXBsYWNlKC9tNGEvLCdtcDQnKSkucmVwbGFjZSgvbm8vLCAnJykgIT09ICcnKSB7XG5cdFx0XHRcdFx0cmVzdWx0Lm1ldGhvZCA9ICduYXRpdmUnO1xuXHRcdFx0XHRcdHJlc3VsdC51cmwgPSBtZWRpYUZpbGVzW2ldLnVybDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVx0XHRcdFxuXHRcdFx0XG5cdFx0XHRpZiAocmVzdWx0Lm1ldGhvZCA9PT0gJ25hdGl2ZScpIHtcblx0XHRcdFx0aWYgKHJlc3VsdC51cmwgIT09IG51bGwpIHtcblx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHJlc3VsdC51cmw7XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0XHQvLyBpZiBgYXV0b19wbHVnaW5gIG1vZGUsIHRoZW4gY2FjaGUgdGhlIG5hdGl2ZSByZXN1bHQgYnV0IHRyeSBwbHVnaW5zLlxuXHRcdFx0XHRpZiAob3B0aW9ucy5tb2RlICE9PSAnYXV0b19wbHVnaW4nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGlmIG5hdGl2ZSBwbGF5YmFjayBkaWRuJ3Qgd29yaywgdGhlbiB0ZXN0IHBsdWdpbnNcblx0XHRpZiAob3B0aW9ucy5tb2RlID09PSAnYXV0bycgfHwgb3B0aW9ucy5tb2RlID09PSAnYXV0b19wbHVnaW4nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ3NoaW0nKSB7XG5cdFx0XHRmb3IgKGk9MDsgaTxtZWRpYUZpbGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHR5cGUgPSBtZWRpYUZpbGVzW2ldLnR5cGU7XG5cblx0XHRcdFx0Ly8gdGVzdCBhbGwgcGx1Z2lucyBpbiBvcmRlciBvZiBwcmVmZXJlbmNlIFtzaWx2ZXJsaWdodCwgZmxhc2hdXG5cdFx0XHRcdGZvciAoaj0wOyBqPG9wdGlvbnMucGx1Z2lucy5sZW5ndGg7IGorKykge1xuXG5cdFx0XHRcdFx0cGx1Z2luTmFtZSA9IG9wdGlvbnMucGx1Z2luc1tqXTtcblx0XHRcdFxuXHRcdFx0XHRcdC8vIHRlc3QgdmVyc2lvbiBvZiBwbHVnaW4gKGZvciBmdXR1cmUgZmVhdHVyZXMpXG5cdFx0XHRcdFx0cGx1Z2luVmVyc2lvbnMgPSBtZWpzLnBsdWdpbnNbcGx1Z2luTmFtZV07XHRcdFx0XHRcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKGs9MDsgazxwbHVnaW5WZXJzaW9ucy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRcdFx0cGx1Z2luSW5mbyA9IHBsdWdpblZlcnNpb25zW2tdO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Ly8gdGVzdCBpZiB1c2VyIGhhcyB0aGUgY29ycmVjdCBwbHVnaW4gdmVyc2lvblxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHQvLyBmb3IgeW91dHViZS92aW1lb1xuXHRcdFx0XHRcdFx0aWYgKHBsdWdpbkluZm8udmVyc2lvbiA9PSBudWxsIHx8IFxuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0bWVqcy5QbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKHBsdWdpbk5hbWUsIHBsdWdpbkluZm8udmVyc2lvbikpIHtcblxuXHRcdFx0XHRcdFx0XHQvLyB0ZXN0IGZvciBwbHVnaW4gcGxheWJhY2sgdHlwZXNcblx0XHRcdFx0XHRcdFx0Zm9yIChsPTA7IGw8cGx1Z2luSW5mby50eXBlcy5sZW5ndGg7IGwrKykge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGZpbmQgcGx1Z2luIHRoYXQgY2FuIHBsYXkgdGhlIHR5cGVcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZSA9PSBwbHVnaW5JbmZvLnR5cGVzW2xdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQubWV0aG9kID0gcGx1Z2luTmFtZTtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdC51cmwgPSBtZWRpYUZpbGVzW2ldLnVybDtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8vIGF0IHRoaXMgcG9pbnQsIGJlaW5nIGluICdhdXRvX3BsdWdpbicgbW9kZSBpbXBsaWVzIHRoYXQgd2UgdHJpZWQgcGx1Z2lucyBidXQgZmFpbGVkLlxuXHRcdC8vIGlmIHdlIGhhdmUgbmF0aXZlIHN1cHBvcnQgdGhlbiByZXR1cm4gdGhhdC5cblx0XHRpZiAob3B0aW9ucy5tb2RlID09PSAnYXV0b19wbHVnaW4nICYmIHJlc3VsdC5tZXRob2QgPT09ICduYXRpdmUnKSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdC8vIHdoYXQgaWYgdGhlcmUncyBub3RoaW5nIHRvIHBsYXk/IGp1c3QgZ3JhYiB0aGUgZmlyc3QgYXZhaWxhYmxlXG5cdFx0aWYgKHJlc3VsdC5tZXRob2QgPT09ICcnICYmIG1lZGlhRmlsZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmVzdWx0LnVybCA9IG1lZGlhRmlsZXNbMF0udXJsO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0Zm9ybWF0VHlwZTogZnVuY3Rpb24odXJsLCB0eXBlKSB7XG5cdFx0dmFyIGV4dDtcblxuXHRcdC8vIGlmIG5vIHR5cGUgaXMgc3VwcGxpZWQsIGZha2UgaXQgd2l0aCB0aGUgZXh0ZW5zaW9uXG5cdFx0aWYgKHVybCAmJiAhdHlwZSkge1x0XHRcblx0XHRcdHJldHVybiB0aGlzLmdldFR5cGVGcm9tRmlsZSh1cmwpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBvbmx5IHJldHVybiB0aGUgbWltZSBwYXJ0IG9mIHRoZSB0eXBlIGluIGNhc2UgdGhlIGF0dHJpYnV0ZSBjb250YWlucyB0aGUgY29kZWNcblx0XHRcdC8vIHNlZSBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS92aWRlby5odG1sI3RoZS1zb3VyY2UtZWxlbWVudFxuXHRcdFx0Ly8gYHZpZGVvL21wNDsgY29kZWNzPVwiYXZjMS40MkUwMUUsIG1wNGEuNDAuMlwiYCBiZWNvbWVzIGB2aWRlby9tcDRgXG5cdFx0XHRcblx0XHRcdGlmICh0eXBlICYmIH50eXBlLmluZGV4T2YoJzsnKSkge1xuXHRcdFx0XHRyZXR1cm4gdHlwZS5zdWJzdHIoMCwgdHlwZS5pbmRleE9mKCc7JykpOyBcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0eXBlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XG5cdGdldFR5cGVGcm9tRmlsZTogZnVuY3Rpb24odXJsKSB7XG5cdFx0dXJsID0gdXJsLnNwbGl0KCc/JylbMF07XG5cdFx0dmFyIGV4dCA9IHVybC5zdWJzdHJpbmcodXJsLmxhc3RJbmRleE9mKCcuJykgKyAxKS50b0xvd2VyQ2FzZSgpO1xuXHRcdHJldHVybiAoLyhtcDR8bTR2fG9nZ3xvZ3Z8bTN1OHx3ZWJtfHdlYm12fGZsdnx3bXZ8bXBlZ3xtb3YpL2dpLnRlc3QoZXh0KSA/ICd2aWRlbycgOiAnYXVkaW8nKSArICcvJyArIHRoaXMuZ2V0VHlwZUZyb21FeHRlbnNpb24oZXh0KTtcblx0fSxcblx0XG5cdGdldFR5cGVGcm9tRXh0ZW5zaW9uOiBmdW5jdGlvbihleHQpIHtcblx0XHRcblx0XHRzd2l0Y2ggKGV4dCkge1xuXHRcdFx0Y2FzZSAnbXA0Jzpcblx0XHRcdGNhc2UgJ200dic6XG5cdFx0XHRjYXNlICdtNGEnOlxuXHRcdFx0XHRyZXR1cm4gJ21wNCc7XG5cdFx0XHRjYXNlICd3ZWJtJzpcblx0XHRcdGNhc2UgJ3dlYm1hJzpcblx0XHRcdGNhc2UgJ3dlYm12JzpcdFxuXHRcdFx0XHRyZXR1cm4gJ3dlYm0nO1xuXHRcdFx0Y2FzZSAnb2dnJzpcblx0XHRcdGNhc2UgJ29nYSc6XG5cdFx0XHRjYXNlICdvZ3YnOlx0XG5cdFx0XHRcdHJldHVybiAnb2dnJztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBleHQ7XG5cdFx0fVxuXHR9LFxuXG5cdGNyZWF0ZUVycm9yTWVzc2FnZTogZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIHBvc3Rlcikge1xuXHRcdHZhciBcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0ZXJyb3JDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFxuXHRcdGVycm9yQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdtZS1jYW5ub3RwbGF5JztcblxuXHRcdHRyeSB7XG5cdFx0XHRlcnJvckNvbnRhaW5lci5zdHlsZS53aWR0aCA9IGh0bWxNZWRpYUVsZW1lbnQud2lkdGggKyAncHgnO1xuXHRcdFx0ZXJyb3JDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gaHRtbE1lZGlhRWxlbWVudC5oZWlnaHQgKyAncHgnO1xuXHRcdH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAob3B0aW9ucy5jdXN0b21FcnJvcikge1xuICAgICAgZXJyb3JDb250YWluZXIuaW5uZXJIVE1MID0gb3B0aW9ucy5jdXN0b21FcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JDb250YWluZXIuaW5uZXJIVE1MID0gKHBvc3RlciAhPT0gJycpID9cbiAgICAgICAgJzxhIGhyZWY9XCInICsgcGxheWJhY2sudXJsICsgJ1wiPjxpbWcgc3JjPVwiJyArIHBvc3RlciArICdcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgLz48L2E+JyA6XG4gICAgICAgICc8YSBocmVmPVwiJyArIHBsYXliYWNrLnVybCArICdcIj48c3Bhbj4nICsgbWVqcy5pMThuLnQoJ0Rvd25sb2FkIEZpbGUnKSArICc8L3NwYW4+PC9hPic7XG4gICAgfVxuXG5cdFx0aHRtbE1lZGlhRWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlcnJvckNvbnRhaW5lciwgaHRtbE1lZGlhRWxlbWVudCk7XG5cdFx0aHRtbE1lZGlhRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0b3B0aW9ucy5lcnJvcihodG1sTWVkaWFFbGVtZW50KTtcblx0fSxcblxuXHRjcmVhdGVQbHVnaW46ZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIHBvc3RlciwgYXV0b3BsYXksIHByZWxvYWQsIGNvbnRyb2xzKSB7XG5cdFx0dmFyIFxuXHRcdFx0aHRtbE1lZGlhRWxlbWVudCA9IHBsYXliYWNrLmh0bWxNZWRpYUVsZW1lbnQsXG5cdFx0XHR3aWR0aCA9IDEsXG5cdFx0XHRoZWlnaHQgPSAxLFxuXHRcdFx0cGx1Z2luaWQgPSAnbWVfJyArIHBsYXliYWNrLm1ldGhvZCArICdfJyArIChtZWpzLm1lSW5kZXgrKyksXG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSBuZXcgbWVqcy5QbHVnaW5NZWRpYUVsZW1lbnQocGx1Z2luaWQsIHBsYXliYWNrLm1ldGhvZCwgcGxheWJhY2sudXJsKSxcblx0XHRcdGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuXHRcdFx0c3BlY2lhbElFQ29udGFpbmVyLFxuXHRcdFx0bm9kZSxcblx0XHRcdGluaXRWYXJzO1xuXG5cdFx0Ly8gY29weSB0YWdOYW1lIGZyb20gaHRtbCBtZWRpYSBlbGVtZW50XG5cdFx0cGx1Z2luTWVkaWFFbGVtZW50LnRhZ05hbWUgPSBodG1sTWVkaWFFbGVtZW50LnRhZ05hbWVcblxuXHRcdC8vIGNvcHkgYXR0cmlidXRlcyBmcm9tIGh0bWwgbWVkaWEgZWxlbWVudCB0byBwbHVnaW4gbWVkaWEgZWxlbWVudFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaHRtbE1lZGlhRWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlID0gaHRtbE1lZGlhRWxlbWVudC5hdHRyaWJ1dGVzW2ldO1xuXHRcdFx0aWYgKGF0dHJpYnV0ZS5zcGVjaWZpZWQgPT0gdHJ1ZSkge1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUudmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGNoZWNrIGZvciBwbGFjZW1lbnQgaW5zaWRlIGEgPHA+IHRhZyAoc29tZXRpbWVzIFdZU0lXWUcgZWRpdG9ycyBkbyB0aGlzKVxuXHRcdG5vZGUgPSBodG1sTWVkaWFFbGVtZW50LnBhcmVudE5vZGU7XG5cdFx0d2hpbGUgKG5vZGUgIT09IG51bGwgJiYgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdib2R5JyAmJiBub2RlLnBhcmVudE5vZGUgIT0gbnVsbCkge1xuXHRcdFx0aWYgKG5vZGUucGFyZW50Tm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdwJykge1xuXHRcdFx0XHRub2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgbm9kZS5wYXJlbnROb2RlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuXHRcdH1cblxuXHRcdGlmIChwbGF5YmFjay5pc1ZpZGVvKSB7XG5cdFx0XHR3aWR0aCA9IChvcHRpb25zLnBsdWdpbldpZHRoID4gMCkgPyBvcHRpb25zLnBsdWdpbldpZHRoIDogKG9wdGlvbnMudmlkZW9XaWR0aCA+IDApID8gb3B0aW9ucy52aWRlb1dpZHRoIDogKGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3aWR0aCcpICE9PSBudWxsKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3aWR0aCcpIDogb3B0aW9ucy5kZWZhdWx0VmlkZW9XaWR0aDtcblx0XHRcdGhlaWdodCA9IChvcHRpb25zLnBsdWdpbkhlaWdodCA+IDApID8gb3B0aW9ucy5wbHVnaW5IZWlnaHQgOiAob3B0aW9ucy52aWRlb0hlaWdodCA+IDApID8gb3B0aW9ucy52aWRlb0hlaWdodCA6IChodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykgIT09IG51bGwpID8gaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpIDogb3B0aW9ucy5kZWZhdWx0VmlkZW9IZWlnaHQ7XG5cdFx0XG5cdFx0XHQvLyBpbiBjYXNlIG9mICclJyBtYWtlIHN1cmUgaXQncyBlbmNvZGVkXG5cdFx0XHR3aWR0aCA9IG1lanMuVXRpbGl0eS5lbmNvZGVVcmwod2lkdGgpO1xuXHRcdFx0aGVpZ2h0ID0gbWVqcy5VdGlsaXR5LmVuY29kZVVybChoZWlnaHQpO1xuXHRcdFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5EZWJ1Zykge1xuXHRcdFx0XHR3aWR0aCA9IDMyMDtcblx0XHRcdFx0aGVpZ2h0ID0gMjQwO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHJlZ2lzdGVyIHBsdWdpblxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuXHRcdG1lanMuTWVkaWFQbHVnaW5CcmlkZ2UucmVnaXN0ZXJQbHVnaW5FbGVtZW50KHBsdWdpbmlkLCBwbHVnaW5NZWRpYUVsZW1lbnQsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXG5cdFx0Ly8gYWRkIGNvbnRhaW5lciAobXVzdCBiZSBhZGRlZCB0byBET00gYmVmb3JlIGluc2VydGluZyBIVE1MIGZvciBJRSlcblx0XHRjb250YWluZXIuY2xhc3NOYW1lID0gJ21lLXBsdWdpbic7XG5cdFx0Y29udGFpbmVyLmlkID0gcGx1Z2luaWQgKyAnX2NvbnRhaW5lcic7XG5cdFx0XG5cdFx0aWYgKHBsYXliYWNrLmlzVmlkZW8pIHtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjb250YWluZXIsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKGNvbnRhaW5lciwgZG9jdW1lbnQuYm9keS5jaGlsZE5vZGVzWzBdKTtcblx0XHR9XG5cblx0XHQvLyBmbGFzaC9zaWx2ZXJsaWdodCB2YXJzXG5cdFx0aW5pdFZhcnMgPSBbXG5cdFx0XHQnaWQ9JyArIHBsdWdpbmlkLFxuXHRcdFx0J2lzdmlkZW89JyArICgocGxheWJhY2suaXNWaWRlbykgPyBcInRydWVcIiA6IFwiZmFsc2VcIiksXG5cdFx0XHQnYXV0b3BsYXk9JyArICgoYXV0b3BsYXkpID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpLFxuXHRcdFx0J3ByZWxvYWQ9JyArIHByZWxvYWQsXG5cdFx0XHQnd2lkdGg9JyArIHdpZHRoLFxuXHRcdFx0J3N0YXJ0dm9sdW1lPScgKyBvcHRpb25zLnN0YXJ0Vm9sdW1lLFxuXHRcdFx0J3RpbWVycmF0ZT0nICsgb3B0aW9ucy50aW1lclJhdGUsXG5cdFx0XHQnZmxhc2hzdHJlYW1lcj0nICsgb3B0aW9ucy5mbGFzaFN0cmVhbWVyLFxuXHRcdFx0J2hlaWdodD0nICsgaGVpZ2h0LFxuICAgICAgJ3BzZXVkb3N0cmVhbXN0YXJ0PScgKyBvcHRpb25zLnBzZXVkb1N0cmVhbWluZ1N0YXJ0UXVlcnlQYXJhbV07XG5cblx0XHRpZiAocGxheWJhY2sudXJsICE9PSBudWxsKSB7XG5cdFx0XHRpZiAocGxheWJhY2subWV0aG9kID09ICdmbGFzaCcpIHtcblx0XHRcdFx0aW5pdFZhcnMucHVzaCgnZmlsZT0nICsgbWVqcy5VdGlsaXR5LmVuY29kZVVybChwbGF5YmFjay51cmwpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGluaXRWYXJzLnB1c2goJ2ZpbGU9JyArIHBsYXliYWNrLnVybCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLmVuYWJsZVBsdWdpbkRlYnVnKSB7XG5cdFx0XHRpbml0VmFycy5wdXNoKCdkZWJ1Zz10cnVlJyk7XG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLmVuYWJsZVBsdWdpblNtb290aGluZykge1xuXHRcdFx0aW5pdFZhcnMucHVzaCgnc21vb3RoaW5nPXRydWUnKTtcblx0XHR9XG4gICAgaWYgKG9wdGlvbnMuZW5hYmxlUHNldWRvU3RyZWFtaW5nKSB7XG4gICAgICBpbml0VmFycy5wdXNoKCdwc2V1ZG9zdHJlYW1pbmc9dHJ1ZScpO1xuICAgIH1cblx0XHRpZiAoY29udHJvbHMpIHtcblx0XHRcdGluaXRWYXJzLnB1c2goJ2NvbnRyb2xzPXRydWUnKTsgLy8gc2hvd3MgY29udHJvbHMgaW4gdGhlIHBsdWdpbiBpZiBkZXNpcmVkXG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLnBsdWdpblZhcnMpIHtcblx0XHRcdGluaXRWYXJzID0gaW5pdFZhcnMuY29uY2F0KG9wdGlvbnMucGx1Z2luVmFycyk7XG5cdFx0fVx0XHRcblxuXHRcdHN3aXRjaCAocGxheWJhY2subWV0aG9kKSB7XG5cdFx0XHRjYXNlICdzaWx2ZXJsaWdodCc6XG5cdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPVxuJzxvYmplY3QgZGF0YT1cImRhdGE6YXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC0yLFwiIHR5cGU9XCJhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LTJcIiBpZD1cIicgKyBwbHVnaW5pZCArICdcIiBuYW1lPVwiJyArIHBsdWdpbmlkICsgJ1wiIHdpZHRoPVwiJyArIHdpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcbic8cGFyYW0gbmFtZT1cImluaXRQYXJhbXNcIiB2YWx1ZT1cIicgKyBpbml0VmFycy5qb2luKCcsJykgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cIndpbmRvd2xlc3NcIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYmFja2dyb3VuZFwiIHZhbHVlPVwiYmxhY2tcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwibWluUnVudGltZVZlcnNpb25cIiB2YWx1ZT1cIjMuMC4wLjBcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYXV0b1VwZ3JhZGVcIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwic291cmNlXCIgdmFsdWU9XCInICsgb3B0aW9ucy5wbHVnaW5QYXRoICsgb3B0aW9ucy5zaWx2ZXJsaWdodE5hbWUgKyAnXCIgLz4nICtcbic8L29iamVjdD4nO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdmbGFzaCc6XG5cblx0XHRcdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0lFKSB7XG5cdFx0XHRcdFx0c3BlY2lhbElFQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHNwZWNpYWxJRUNvbnRhaW5lcik7XG5cdFx0XHRcdFx0c3BlY2lhbElFQ29udGFpbmVyLm91dGVySFRNTCA9XG4nPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCIvL2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYlwiICcgK1xuJ2lkPVwiJyArIHBsdWdpbmlkICsgJ1wiIHdpZHRoPVwiJyArIHdpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcbic8cGFyYW0gbmFtZT1cIm1vdmllXCIgdmFsdWU9XCInICsgb3B0aW9ucy5wbHVnaW5QYXRoICsgb3B0aW9ucy5mbGFzaE5hbWUgKyAnP3g9JyArIChuZXcgRGF0ZSgpKSArICdcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiZmxhc2h2YXJzXCIgdmFsdWU9XCInICsgaW5pdFZhcnMuam9pbignJmFtcDsnKSArICdcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwicXVhbGl0eVwiIHZhbHVlPVwiaGlnaFwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJiZ2NvbG9yXCIgdmFsdWU9XCIjMDAwMDAwXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImFsbG93RnVsbFNjcmVlblwiIHZhbHVlPVwidHJ1ZVwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJzY2FsZVwiIHZhbHVlPVwiZGVmYXVsdFwiIC8+JyArIFxuJzwvb2JqZWN0Pic7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPVxuJzxlbWJlZCBpZD1cIicgKyBwbHVnaW5pZCArICdcIiBuYW1lPVwiJyArIHBsdWdpbmlkICsgJ1wiICcgK1xuJ3BsYXk9XCJ0cnVlXCIgJyArXG4nbG9vcD1cImZhbHNlXCIgJyArXG4ncXVhbGl0eT1cImhpZ2hcIiAnICtcbidiZ2NvbG9yPVwiIzAwMDAwMFwiICcgK1xuJ3dtb2RlPVwidHJhbnNwYXJlbnRcIiAnICtcbidhbGxvd1NjcmlwdEFjY2Vzcz1cImFsd2F5c1wiICcgK1xuJ2FsbG93RnVsbFNjcmVlbj1cInRydWVcIiAnICtcbid0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiBwbHVnaW5zcGFnZT1cIi8vd3d3Lm1hY3JvbWVkaWEuY29tL2dvL2dldGZsYXNocGxheWVyXCIgJyArXG4nc3JjPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuZmxhc2hOYW1lICsgJ1wiICcgK1xuJ2ZsYXNodmFycz1cIicgKyBpbml0VmFycy5qb2luKCcmJykgKyAnXCIgJyArXG4nd2lkdGg9XCInICsgd2lkdGggKyAnXCIgJyArXG4naGVpZ2h0PVwiJyArIGhlaWdodCArICdcIiAnICtcbidzY2FsZT1cImRlZmF1bHRcIicgKyBcbidjbGFzcz1cIm1lanMtc2hpbVwiPjwvZW1iZWQ+Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y2FzZSAneW91dHViZSc6XG5cdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdHZhciB2aWRlb0lkO1xuXHRcdFx0XHQvLyB5b3V0dS5iZSB1cmwgZnJvbSBzaGFyZSBidXR0b25cblx0XHRcdFx0aWYgKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZihcInlvdXR1LmJlXCIpICE9IC0xKSB7XG5cdFx0XHRcdFx0dmlkZW9JZCA9IHBsYXliYWNrLnVybC5zdWJzdHIocGxheWJhY2sudXJsLmxhc3RJbmRleE9mKCcvJykrMSk7XG5cdFx0XHRcdFx0aWYgKHZpZGVvSWQuaW5kZXhPZignPycpICE9IC0xKSB7XG5cdFx0XHRcdFx0XHR2aWRlb0lkID0gdmlkZW9JZC5zdWJzdHIoMCwgdmlkZW9JZC5pbmRleE9mKCc/JykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR2aWRlb0lkID0gcGxheWJhY2sudXJsLnN1YnN0cihwbGF5YmFjay51cmwubGFzdEluZGV4T2YoJz0nKSsxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR5b3V0dWJlU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0XHRjb250YWluZXI6IGNvbnRhaW5lcixcblx0XHRcdFx0XHRcdGNvbnRhaW5lcklkOiBjb250YWluZXIuaWQsXG5cdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQ6IHBsdWdpbk1lZGlhRWxlbWVudCxcblx0XHRcdFx0XHRcdHBsdWdpbklkOiBwbHVnaW5pZCxcblx0XHRcdFx0XHRcdHZpZGVvSWQ6IHZpZGVvSWQsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IGhlaWdodCxcblx0XHRcdFx0XHRcdHdpZHRoOiB3aWR0aFx0XG5cdFx0XHRcdFx0fTtcdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG1lanMuUGx1Z2luRGV0ZWN0b3IuaGFzUGx1Z2luVmVyc2lvbignZmxhc2gnLCBbMTAsMCwwXSkgKSB7XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUZsYXNoKHlvdXR1YmVTZXR0aW5ncyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmVucXVldWVJZnJhbWUoeW91dHViZVNldHRpbmdzKTtcdFx0XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XG5cdFx0XHQvLyBERU1PIENvZGUuIERvZXMgTk9UIHdvcmsuXG5cdFx0XHRjYXNlICd2aW1lbyc6XG5cdFx0XHRcdHZhciBwbGF5ZXJfaWQgPSBwbHVnaW5pZCArIFwiX3BsYXllclwiO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQudmltZW9pZCA9IHBsYXliYWNrLnVybC5zdWJzdHIocGxheWJhY2sudXJsLmxhc3RJbmRleE9mKCcvJykrMSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID0nPGlmcmFtZSBzcmM9XCIvL3BsYXllci52aW1lby5jb20vdmlkZW8vJyArIHBsdWdpbk1lZGlhRWxlbWVudC52aW1lb2lkICsgJz9hcGk9MSZwb3J0cmFpdD0wJmJ5bGluZT0wJnRpdGxlPTAmcGxheWVyX2lkPScgKyBwbGF5ZXJfaWQgKyAnXCIgd2lkdGg9XCInICsgd2lkdGggKydcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsnXCIgZnJhbWVib3JkZXI9XCIwXCIgY2xhc3M9XCJtZWpzLXNoaW1cIiBpZD1cIicgKyBwbGF5ZXJfaWQgKyAnXCIgd2Via2l0YWxsb3dmdWxsc2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+Jztcblx0XHRcdFx0aWYgKHR5cGVvZigkZikgPT0gJ2Z1bmN0aW9uJykgeyAvLyBmcm9vZ2Fsb29wIGF2YWlsYWJsZVxuXHRcdFx0XHRcdHZhciBwbGF5ZXIgPSAkZihjb250YWluZXIuY2hpbGROb2Rlc1swXSk7XG5cdFx0XHRcdFx0cGxheWVyLmFkZEV2ZW50KCdyZWFkeScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JC5leHRlbmQoIHBsYXllciwge1xuXHRcdFx0XHRcdFx0XHRwbGF5VmlkZW86IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICdwbGF5JyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0c3RvcFZpZGVvOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAndW5sb2FkJyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0cGF1c2VWaWRlbzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3BhdXNlJyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0c2Vla1RvOiBmdW5jdGlvbiggc2Vjb25kcyApIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAnc2Vla1RvJywgc2Vjb25kcyApO1xuXHRcdFx0XHRcdFx0XHR9LCBcblx0XHRcdFx0XHRcdFx0c2V0Vm9sdW1lOiBmdW5jdGlvbiggdm9sdW1lICkge1xuXHRcdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICdzZXRWb2x1bWUnLCB2b2x1bWUgKTtcblx0XHRcdFx0XHRcdFx0fSwgXG5cdFx0XHRcdFx0XHRcdHNldE11dGVkOiBmdW5jdGlvbiggbXV0ZWQgKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYoIG11dGVkICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxheWVyLmxhc3RWb2x1bWUgPSBwbGF5ZXIuYXBpKCAnZ2V0Vm9sdW1lJyApO1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NldFZvbHVtZScsIDAgKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NldFZvbHVtZScsIHBsYXllci5sYXN0Vm9sdW1lICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRkZWxldGUgcGxheWVyLmxhc3RWb2x1bWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsIGV2ZW50TmFtZSwgZSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IGV2ZW50TmFtZSxcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHBsdWdpbk1lZGlhRWxlbWVudFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRpZiAoZXZlbnROYW1lID09ICd0aW1ldXBkYXRlJykge1xuXHRcdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IGUuc2Vjb25kcztcblx0XHRcdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZHVyYXRpb24gPSBvYmouZHVyYXRpb24gPSBlLmR1cmF0aW9uO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kaXNwYXRjaEV2ZW50KG9iai50eXBlLCBvYmopO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGxheWluZycpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncGF1c2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgnZmluaXNoJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnZW5kZWQnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXlQcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICd0aW1ldXBkYXRlJywgZSk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQgPSBjb250YWluZXI7XG5cdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGxheWVyO1xuXG5cdFx0XHRcdFx0XHQvLyBpbml0IG1lanNcblx0XHRcdFx0XHRcdG1lanMuTWVkaWFQbHVnaW5CcmlkZ2UuaW5pdFBsdWdpbihwbHVnaW5pZCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiWW91IG5lZWQgdG8gaW5jbHVkZSBmcm9vZ2Fsb29wIGZvciB2aW1lbyB0byB3b3JrXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1x0XHRcdFxuXHRcdH1cblx0XHQvLyBoaWRlIG9yaWdpbmFsIGVsZW1lbnRcblx0XHRodG1sTWVkaWFFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0Ly8gcHJldmVudCBicm93c2VyIGZyb20gYXV0b3BsYXlpbmcgd2hlbiB1c2luZyBhIHBsdWdpblxuXHRcdGh0bWxNZWRpYUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhdXRvcGxheScpO1xuXG5cdFx0Ly8gRllJOiBvcHRpb25zLnN1Y2Nlc3Mgd2lsbCBiZSBmaXJlZCBieSB0aGUgTWVkaWFQbHVnaW5CcmlkZ2Vcblx0XHRcblx0XHRyZXR1cm4gcGx1Z2luTWVkaWFFbGVtZW50O1xuXHR9LFxuXG5cdHVwZGF0ZU5hdGl2ZTogZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIGF1dG9wbGF5LCBwcmVsb2FkKSB7XG5cdFx0XG5cdFx0dmFyIGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0bTtcblx0XHRcblx0XHRcblx0XHQvLyBhZGQgbWV0aG9kcyB0byB2aWRlbyBvYmplY3QgdG8gYnJpbmcgaXQgaW50byBwYXJpdHkgd2l0aCBGbGFzaCBPYmplY3Rcblx0XHRmb3IgKG0gaW4gbWVqcy5IdG1sTWVkaWFFbGVtZW50KSB7XG5cdFx0XHRodG1sTWVkaWFFbGVtZW50W21dID0gbWVqcy5IdG1sTWVkaWFFbGVtZW50W21dO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0Q2hyb21lIG5vdyBzdXBwb3J0cyBwcmVsb2FkPVwibm9uZVwiXG5cdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0Nocm9tZSkge1xuXHRcdFxuXHRcdFx0Ly8gc3BlY2lhbCBjYXNlIHRvIGVuZm9yY2UgcHJlbG9hZCBhdHRyaWJ1dGUgKENocm9tZSBkb2Vzbid0IHJlc3BlY3QgdGhpcylcblx0XHRcdGlmIChwcmVsb2FkID09PSAnbm9uZScgJiYgIWF1dG9wbGF5KSB7XG5cdFx0XHRcblx0XHRcdFx0Ly8gZm9yY2VzIHRoZSBicm93c2VyIHRvIHN0b3AgbG9hZGluZyAobm90ZTogZmFpbHMgaW4gSUU5KVxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9ICcnO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmxvYWQoKTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5jYW5jZWxlZFByZWxvYWQgPSB0cnVlO1xuXG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKGh0bWxNZWRpYUVsZW1lbnQuY2FuY2VsZWRQcmVsb2FkKSB7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHBsYXliYWNrLnVybDtcblx0XHRcdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5wbGF5KCk7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhbmNlbGVkUHJlbG9hZCA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0Ly8gZm9yIHNvbWUgcmVhc29uIENocm9tZSBmb3JnZXRzIGhvdyB0byBhdXRvcGxheSBzb21ldGltZXMuXG5cdFx0XHR9IGVsc2UgaWYgKGF1dG9wbGF5KSB7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBsYXkoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ki9cblxuXHRcdC8vIGZpcmUgc3VjY2VzcyBjb2RlXG5cdFx0b3B0aW9ucy5zdWNjZXNzKGh0bWxNZWRpYUVsZW1lbnQsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdFxuXHRcdHJldHVybiBodG1sTWVkaWFFbGVtZW50O1xuXHR9XG59O1xuXG4vKlxuIC0gdGVzdCBvbiBJRSAob2JqZWN0IHZzLiBlbWJlZClcbiAtIGRldGVybWluZSB3aGVuIHRvIHVzZSBpZnJhbWUgKEZpcmVmb3gsIFNhZmFyaSwgTW9iaWxlKSB2cy4gRmxhc2ggKENocm9tZSwgSUUpXG4gLSBmdWxsc2NyZWVuP1xuKi9cblxuLy8gWW91VHViZSBGbGFzaCBhbmQgSWZyYW1lIEFQSVxubWVqcy5Zb3VUdWJlQXBpID0ge1xuXHRpc0lmcmFtZVN0YXJ0ZWQ6IGZhbHNlLFxuXHRpc0lmcmFtZUxvYWRlZDogZmFsc2UsXG5cdGxvYWRJZnJhbWVBcGk6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5pc0lmcmFtZVN0YXJ0ZWQpIHtcblx0XHRcdHZhciB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0XHRcdHRhZy5zcmMgPSBcIi8vd3d3LnlvdXR1YmUuY29tL3BsYXllcl9hcGlcIjtcblx0XHRcdHZhciBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcblx0XHRcdGZpcnN0U2NyaXB0VGFnLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhZywgZmlyc3RTY3JpcHRUYWcpO1xuXHRcdFx0dGhpcy5pc0lmcmFtZVN0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0fSxcblx0aWZyYW1lUXVldWU6IFtdLFxuXHRlbnF1ZXVlSWZyYW1lOiBmdW5jdGlvbih5dCkge1xuXHRcdFxuXHRcdGlmICh0aGlzLmlzTG9hZGVkKSB7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZSh5dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9hZElmcmFtZUFwaSgpO1xuXHRcdFx0dGhpcy5pZnJhbWVRdWV1ZS5wdXNoKHl0KTtcblx0XHR9XG5cdH0sXG5cdGNyZWF0ZUlmcmFtZTogZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0XHRcblx0XHR2YXJcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSBzZXR0aW5ncy5wbHVnaW5NZWRpYUVsZW1lbnQsXHRcblx0XHRwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKHNldHRpbmdzLmNvbnRhaW5lcklkLCB7XG5cdFx0XHRoZWlnaHQ6IHNldHRpbmdzLmhlaWdodCxcblx0XHRcdHdpZHRoOiBzZXR0aW5ncy53aWR0aCxcblx0XHRcdHZpZGVvSWQ6IHNldHRpbmdzLnZpZGVvSWQsXG5cdFx0XHRwbGF5ZXJWYXJzOiB7Y29udHJvbHM6MH0sXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdFx0J29uUmVhZHknOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBob29rIHVwIGlmcmFtZSBvYmplY3QgdG8gTUVqc1xuXHRcdFx0XHRcdHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBwbGF5ZXI7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gaW5pdCBtZWpzXG5cdFx0XHRcdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS5pbml0UGx1Z2luKHNldHRpbmdzLnBsdWdpbklkKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBjcmVhdGUgdGltZXJcblx0XHRcdFx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3RpbWV1cGRhdGUnKTtcblx0XHRcdFx0XHR9LCAyNTApO1x0XHRcdFx0XHRcblx0XHRcdFx0fSxcblx0XHRcdFx0J29uU3RhdGVDaGFuZ2UnOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUuZGF0YSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdFxuXHRjcmVhdGVFdmVudDogZnVuY3Rpb24gKHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCBldmVudE5hbWUpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0dHlwZTogZXZlbnROYW1lLFxuXHRcdFx0dGFyZ2V0OiBwbHVnaW5NZWRpYUVsZW1lbnRcblx0XHR9O1xuXG5cdFx0aWYgKHBsYXllciAmJiBwbGF5ZXIuZ2V0RHVyYXRpb24pIHtcblx0XHRcdFxuXHRcdFx0Ly8gdGltZSBcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmR1cmF0aW9uID0gb2JqLmR1cmF0aW9uID0gcGxheWVyLmdldER1cmF0aW9uKCk7XG5cdFx0XHRcblx0XHRcdC8vIHN0YXRlXG5cdFx0XHRvYmoucGF1c2VkID0gcGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZDtcblx0XHRcdG9iai5lbmRlZCA9IHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZDtcdFx0XHRcblx0XHRcdFxuXHRcdFx0Ly8gc291bmRcblx0XHRcdG9iai5tdXRlZCA9IHBsYXllci5pc011dGVkKCk7XG5cdFx0XHRvYmoudm9sdW1lID0gcGxheWVyLmdldFZvbHVtZSgpIC8gMTAwO1xuXHRcdFx0XG5cdFx0XHQvLyBwcm9ncmVzc1xuXHRcdFx0b2JqLmJ5dGVzVG90YWwgPSBwbGF5ZXIuZ2V0VmlkZW9CeXRlc1RvdGFsKCk7XG5cdFx0XHRvYmouYnVmZmVyZWRCeXRlcyA9IHBsYXllci5nZXRWaWRlb0J5dGVzTG9hZGVkKCk7XG5cdFx0XHRcblx0XHRcdC8vIGZha2UgdGhlIFczQyBidWZmZXJlZCBUaW1lUmFuZ2Vcblx0XHRcdHZhciBidWZmZXJlZFRpbWUgPSBvYmouYnVmZmVyZWRCeXRlcyAvIG9iai5ieXRlc1RvdGFsICogb2JqLmR1cmF0aW9uO1xuXHRcdFx0XG5cdFx0XHRvYmoudGFyZ2V0LmJ1ZmZlcmVkID0gb2JqLmJ1ZmZlcmVkID0ge1xuXHRcdFx0XHRzdGFydDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5kOiBmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gYnVmZmVyZWRUaW1lO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRsZW5ndGg6IDFcblx0XHRcdH07XG5cblx0XHR9XG5cdFx0XG5cdFx0Ly8gc2VuZCBldmVudCB1cCB0aGUgY2hhaW5cblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZGlzcGF0Y2hFdmVudChvYmoudHlwZSwgb2JqKTtcblx0fSxcdFxuXHRcblx0aUZyYW1lUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuaXNMb2FkZWQgPSB0cnVlO1xuXHRcdHRoaXMuaXNJZnJhbWVMb2FkZWQgPSB0cnVlO1xuXHRcdFxuXHRcdHdoaWxlICh0aGlzLmlmcmFtZVF1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuaWZyYW1lUXVldWUucG9wKCk7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZShzZXR0aW5ncyk7XG5cdFx0fVx0XG5cdH0sXG5cdFxuXHQvLyBGTEFTSCFcblx0Zmxhc2hQbGF5ZXJzOiB7fSxcblx0Y3JlYXRlRmxhc2g6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0XG5cdFx0dGhpcy5mbGFzaFBsYXllcnNbc2V0dGluZ3MucGx1Z2luSWRdID0gc2V0dGluZ3M7XG5cdFx0XG5cdFx0Lypcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCIvL3d3dy55b3V0dWJlLmNvbS9hcGlwbGF5ZXI/ZW5hYmxlanNhcGk9MSZhbXA7cGxheWVyYXBpaWQ9JyArIHNldHRpbmdzLnBsdWdpbklkICArICcmYW1wO3ZlcnNpb249MyZhbXA7YXV0b3BsYXk9MCZhbXA7Y29udHJvbHM9MCZhbXA7bW9kZXN0YnJhbmRpbmc9MSZsb29wPTBcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0Ki9cblxuXHRcdHZhciBzcGVjaWFsSUVDb250YWluZXIsXG5cdFx0XHR5b3V0dWJlVXJsID0gJy8vd3d3LnlvdXR1YmUuY29tL2FwaXBsYXllcj9lbmFibGVqc2FwaT0xJmFtcDtwbGF5ZXJhcGlpZD0nICsgc2V0dGluZ3MucGx1Z2luSWQgICsgJyZhbXA7dmVyc2lvbj0zJmFtcDthdXRvcGxheT0wJmFtcDtjb250cm9scz0wJmFtcDttb2Rlc3RicmFuZGluZz0xJmxvb3A9MCc7XG5cdFx0XHRcblx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzSUUpIHtcblx0XHRcdFxuXHRcdFx0c3BlY2lhbElFQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRzZXR0aW5ncy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc3BlY2lhbElFQ29udGFpbmVyKTtcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lci5vdXRlckhUTUwgPSAnPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCIvL2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYlwiICcgK1xuJ2lkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIHdpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcblx0JzxwYXJhbSBuYW1lPVwibW92aWVcIiB2YWx1ZT1cIicgKyB5b3V0dWJlVXJsICsgJ1wiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cImFsbG93U2NyaXB0QWNjZXNzXCIgdmFsdWU9XCJhbHdheXNcIiAvPicgK1xuXHQnPHBhcmFtIG5hbWU9XCJhbGxvd0Z1bGxTY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzwvb2JqZWN0Pic7XG5cdFx0fSBlbHNlIHtcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCInICsgeW91dHViZVVybCArICdcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0fVx0XHRcblx0XHRcblx0fSxcblx0XG5cdGZsYXNoUmVhZHk6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyXG5cdFx0XHRzZXR0aW5ncyA9IHRoaXMuZmxhc2hQbGF5ZXJzW2lkXSxcblx0XHRcdHBsYXllciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSxcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudCA9IHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudDtcblx0XHRcblx0XHQvLyBob29rIHVwIGFuZCByZXR1cm4gdG8gTWVkaWFFTGVtZW50UGxheWVyLnN1Y2Nlc3NcdFxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudCA9IHBsYXllcjtcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLmluaXRQbHVnaW4oaWQpO1xuXHRcdFxuXHRcdC8vIGxvYWQgdGhlIHlvdXR1YmUgdmlkZW9cblx0XHRwbGF5ZXIuY3VlVmlkZW9CeUlkKHNldHRpbmdzLnZpZGVvSWQpO1xuXHRcdFxuXHRcdHZhciBjYWxsYmFja05hbWUgPSBzZXR0aW5ncy5jb250YWluZXJJZCArICdfY2FsbGJhY2snO1xuXHRcdFxuXHRcdHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZSkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUsIHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50KTtcblx0XHR9XG5cdFx0XG5cdFx0cGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ29uU3RhdGVDaGFuZ2UnLCBjYWxsYmFja05hbWUpO1xuXHRcdFxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAndGltZXVwZGF0ZScpO1xuXHRcdH0sIDI1MCk7XG5cdFx0XG5cdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnY2FucGxheScpO1xuXHR9LFxuXHRcblx0aGFuZGxlU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKHlvdVR1YmVTdGF0ZSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpIHtcblx0XHRzd2l0Y2ggKHlvdVR1YmVTdGF0ZSkge1xuXHRcdFx0Y2FzZSAtMTogLy8gbm90IHN0YXJ0ZWRcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IHRydWU7XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZCA9IHRydWU7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ2xvYWRlZG1ldGFkYXRhJyk7XG5cdFx0XHRcdC8vY3JlYXRlWW91VHViZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnbG9hZGVkZGF0YScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSB0cnVlO1xuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdlbmRlZCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3BsYXlpbmcnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzogLy8gYnVmZmVyaW5nXG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3Byb2dyZXNzJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHQvLyBjdWVkP1xuXHRcdFx0XHRicmVhaztcdFx0XHRcdFx0XHRcblx0XHRcdFxuXHRcdH1cdFx0XHRcblx0XHRcblx0fVxufVxuLy8gSUZSQU1FXG5mdW5jdGlvbiBvbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmlGcmFtZVJlYWR5KCk7XG59XG4vLyBGTEFTSFxuZnVuY3Rpb24gb25Zb3VUdWJlUGxheWVyUmVhZHkoaWQpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmZsYXNoUmVhZHkoaWQpO1xufVxuXG53aW5kb3cubWVqcyA9IG1lanM7XG53aW5kb3cuTWVkaWFFbGVtZW50ID0gbWVqcy5NZWRpYUVsZW1lbnQ7XG5cbi8qXG4gKiBBZGRzIEludGVybmF0aW9uYWxpemF0aW9uIGFuZCBsb2NhbGl6YXRpb24gdG8gbWVkaWFlbGVtZW50LlxuICpcbiAqIFRoaXMgZmlsZSBkb2VzIG5vdCBjb250YWluIHRyYW5zbGF0aW9ucywgeW91IGhhdmUgdG8gYWRkIHRoZW0gbWFudWFsbHkuXG4gKiBUaGUgc2NoZW1hIGlzIGFsd2F5cyB0aGUgc2FtZTogbWUtaTE4bi1sb2NhbGUtW0lFVEYtbGFuZ3VhZ2UtdGFnXS5qc1xuICpcbiAqIEV4YW1wbGVzIGFyZSBwcm92aWRlZCBib3RoIGZvciBnZXJtYW4gYW5kIGNoaW5lc2UgdHJhbnNsYXRpb24uXG4gKlxuICpcbiAqIFdoYXQgaXMgdGhlIGNvbmNlcHQgYmV5b25kIGkxOG4/XG4gKiAgIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSW50ZXJuYXRpb25hbGl6YXRpb25fYW5kX2xvY2FsaXphdGlvblxuICpcbiAqIFdoYXQgbGFuZ2NvZGUgc2hvdWxkIGkgdXNlP1xuICogICBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lFVEZfbGFuZ3VhZ2VfdGFnXG4gKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM1NjQ2XG4gKlxuICpcbiAqIExpY2Vuc2U/XG4gKlxuICogICBUaGUgaTE4biBmaWxlIHVzZXMgbWV0aG9kcyBmcm9tIHRoZSBEcnVwYWwgcHJvamVjdCAoZHJ1cGFsLmpzKTpcbiAqICAgICAtIGkxOG4ubWV0aG9kcy50KCkgKG1vZGlmaWVkKVxuICogICAgIC0gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oKSAoZnVsbCBjb3B5KVxuICpcbiAqICAgVGhlIERydXBhbCBwcm9qZWN0IGlzIChsaWtlIG1lZGlhZWxlbWVudGpzKSBsaWNlbnNlZCB1bmRlciBHUEx2Mi5cbiAqICAgIC0gaHR0cDovL2RydXBhbC5vcmcvbGljZW5zaW5nL2ZhcS8jcTFcbiAqICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2pvaG5keWVyL21lZGlhZWxlbWVudFxuICogICAgLSBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvb2xkLWxpY2Vuc2VzL2dwbC0yLjAuaHRtbFxuICpcbiAqXG4gKiBAYXV0aG9yXG4gKiAgIFRpbSBMYXR6IChsYXR6LnRpbUBnbWFpbC5jb20pXG4gKlxuICpcbiAqIEBwYXJhbXNcbiAqICAtIGNvbnRleHQgLSBkb2N1bWVudCwgaWZyYW1lIC4uXG4gKiAgLSBleHBvcnRzIC0gQ29tbW9uSlMsIHdpbmRvdyAuLlxuICpcbiAqL1xuOyhmdW5jdGlvbihjb250ZXh0LCBleHBvcnRzLCB1bmRlZmluZWQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBpMThuID0ge1xuICAgICAgICBcImxvY2FsZVwiOiB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgcHJldmlvdXMgdmFsdWVzIGFyZW4ndCBvdmVyd3JpdHRlbi5cbiAgICAgICAgICAgIFwibGFuZ3VhZ2VcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5sYW5ndWFnZSkgfHwgJycsXG4gICAgICAgICAgICBcInN0cmluZ3NcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5zdHJpbmdzKSB8fCB7fVxuICAgICAgICB9LFxuICAgICAgICBcImlldGZfbGFuZ19yZWdleFwiIDogL14oeFxcLSk/W2Etel17Mix9KFxcLVxcd3syLH0pPyhcXC1cXHd7Mix9KT8kLyxcbiAgICAgICAgXCJtZXRob2RzXCIgOiB7fVxuICAgIH07XG4vLyBzdGFydCBpMThuXG5cblxuICAgIC8qKlxuICAgICAqIEdldCBsYW5ndWFnZSwgZmFsbGJhY2sgdG8gYnJvd3NlcidzIGxhbmd1YWdlIGlmIGVtcHR5XG4gICAgICpcbiAgICAgKiBJRVRGOiBSRkMgNTY0NiwgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU2NDZcbiAgICAgKiBFeGFtcGxlczogZW4sIHpoLUNOLCBjbW4tSGFucy1DTiwgc3ItTGF0bi1SUywgZXMtNDE5LCB4LXByaXZhdGVcbiAgICAgKi9cbiAgICBpMThuLmdldExhbmd1YWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFuZ3VhZ2UgPSBpMThuLmxvY2FsZS5sYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJMYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLmxhbmd1YWdlO1xuICAgICAgICByZXR1cm4gaTE4bi5pZXRmX2xhbmdfcmVnZXguZXhlYyhsYW5ndWFnZSkgPyBsYW5ndWFnZSA6IG51bGw7XG5cbiAgICAgICAgLy8oV0FTOiBjb252ZXJ0IHRvIGlzbyA2MzktMSAoMi1sZXR0ZXJzLCBsb3dlciBjYXNlKSlcbiAgICAgICAgLy9yZXR1cm4gbGFuZ3VhZ2Uuc3Vic3RyKDAsIDIpLnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIC8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbiAgICBpZiAoIHR5cGVvZiBtZWpzTDEwbiAhPSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaTE4bi5sb2NhbGUubGFuZ3VhZ2UgPSBtZWpzTDEwbi5sYW5ndWFnZTtcbiAgICB9XG5cblxuXG4gICAgLyoqXG4gICAgICogRW5jb2RlIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBhIHBsYWluLXRleHQgc3RyaW5nIGZvciBkaXNwbGF5IGFzIEhUTUwuXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBjaGFyYWN0ZXIsIHJlZ2V4LFxuICAgICAgICByZXBsYWNlID0ge1xuICAgICAgICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICAgICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICAgICAgICc+JzogJyZndDsnXG4gICAgICAgIH07XG4gICAgICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgICAgICBmb3IgKGNoYXJhY3RlciBpbiByZXBsYWNlKSB7XG4gICAgICAgICAgICBpZiAocmVwbGFjZS5oYXNPd25Qcm9wZXJ0eShjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKGNoYXJhY3RlciwgJ2cnKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShyZWdleCwgcmVwbGFjZVtjaGFyYWN0ZXJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGUgc3RyaW5ncyB0byB0aGUgcGFnZSBsYW5ndWFnZSBvciBhIGdpdmVuIGxhbmd1YWdlLlxuICAgICAqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyXG4gICAgICogICBBIHN0cmluZyBjb250YWluaW5nIHRoZSBFbmdsaXNoIHN0cmluZyB0byB0cmFuc2xhdGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAgLSAnY29udGV4dCcgKGRlZmF1bHRzIHRvIHRoZSBkZWZhdWx0IGNvbnRleHQpOiBUaGUgY29udGV4dCB0aGUgc291cmNlIHN0cmluZ1xuICAgICAqICAgICBiZWxvbmdzIHRvLlxuICAgICAqXG4gICAgICogQHJldHVyblxuICAgICAqICAgVGhlIHRyYW5zbGF0ZWQgc3RyaW5nLCBlc2NhcGVkIHZpYSBpMThuLm1ldGhvZHMuY2hlY2tQbGFpbigpXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLnQgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIGxvY2FsaXplZCB2ZXJzaW9uIG9mIHRoZSBzdHJpbmcuXG4gICAgICAgIGlmIChpMThuLmxvY2FsZS5zdHJpbmdzICYmIGkxOG4ubG9jYWxlLnN0cmluZ3Nbb3B0aW9ucy5jb250ZXh0XSAmJiBpMThuLmxvY2FsZS5zdHJpbmdzW29wdGlvbnMuY29udGV4dF1bc3RyXSkge1xuICAgICAgICAgICAgc3RyID0gaTE4bi5sb2NhbGUuc3RyaW5nc1tvcHRpb25zLmNvbnRleHRdW3N0cl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oc3RyKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGVyIGZvciBpMThuLm1ldGhvZHMudCgpXG4gICAgICpcbiAgICAgKiBAc2VlIGkxOG4ubWV0aG9kcy50KClcbiAgICAgKiBAdGhyb3dzIEludmFsaWRBcmd1bWVudEV4Y2VwdGlvblxuICAgICAqL1xuICAgIGkxOG4udCA9IGZ1bmN0aW9uKHN0ciwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyAmJiBzdHIubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAvLyBjaGVjayBldmVyeSB0aW1lIGR1ZSBsYW5ndWFnZSBjYW4gY2hhbmdlIGZvclxuICAgICAgICAgICAgLy8gZGlmZmVyZW50IHJlYXNvbnMgKHRyYW5zbGF0aW9uLCBsYW5nIHN3aXRjaGVyIC4uKVxuICAgICAgICAgICAgdmFyIGxhbmd1YWdlID0gaTE4bi5nZXRMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgXCJjb250ZXh0XCIgOiBsYW5ndWFnZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGkxOG4ubWV0aG9kcy50KHN0ciwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyB7XG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgOiAnSW52YWxpZEFyZ3VtZW50RXhjZXB0aW9uJyxcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIiA6ICdGaXJzdCBhcmd1bWVudCBpcyBlaXRoZXIgbm90IGEgc3RyaW5nIG9yIGVtcHR5LidcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4vLyBlbmQgaTE4blxuICAgIGV4cG9ydHMuaTE4biA9IGkxOG47XG59KGRvY3VtZW50LCBtZWpzKSk7XG5cbi8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbjsoZnVuY3Rpb24oZXhwb3J0cywgdW5kZWZpbmVkKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICggdHlwZW9mIG1lanNMMTBuICE9ICd1bmRlZmluZWQnICkge1xuICAgICAgICBleHBvcnRzW21lanNMMTBuLmxhbmd1YWdlXSA9IG1lanNMMTBuLnN0cmluZ3M7XG4gICAgfVxuXG59KG1lanMuaTE4bi5sb2NhbGUuc3RyaW5ncykpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkL21lZGlhZWxlbWVudC5qc1wiLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSClcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbihidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDAsXG4gICAgICBkID0gaXNMRSA/IC0xIDogMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV07XG5cbiAgaSArPSBkO1xuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBzID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gZUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIGUgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBtTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXM7XG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KTtcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pO1xuICAgIGUgPSBlIC0gZUJpYXM7XG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbik7XG59O1xuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGMsXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApLFxuICAgICAgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpLFxuICAgICAgZCA9IGlzTEUgPyAxIDogLTEsXG4gICAgICBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwO1xuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpO1xuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwO1xuICAgIGUgPSBlTWF4O1xuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKTtcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS07XG4gICAgICBjICo9IDI7XG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrO1xuICAgICAgYyAvPSAyO1xuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDA7XG4gICAgICBlID0gZU1heDtcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gZSArIGVCaWFzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gMDtcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KTtcblxuICBlID0gKGUgPDwgbUxlbikgfCBtO1xuICBlTGVuICs9IG1MZW47XG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCk7XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4O1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEB0eXBlIHtUYWJ9XG4gKi9cbnZhciBUYWIgPSByZXF1aXJlKCcuL3RhYicpO1xuLyoqXG4gKiBAdHlwZSB7Q2hhcHRlcnN9XG4gKi9cbnZhciBDaGFwdGVycyA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jaGFwdGVyJyk7XG5cbi8qKlxuICogaW5zdGFudGlhdGUgbmV3IGNvbnRyb2xzIGVsZW1lbnRcbiAqIEBwYXJhbXMge2pRdWVyeXxIVE1MRWxlbWVudH0gcGxheWVyXG4gKiBAcGFyYW1zIHtvYmplY3R9IHRpbWVsaW5lXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gQ29udHJvbHMgKHBsYXllciwgdGltZWxpbmUpIHtcbiAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5ib3ggPSBjcmVhdGVCb3goKTtcbiAgdGhpcy50aW1lQ29udHJvbEVsZW1lbnQgPSBjcmVhdGVUaW1lQ29udHJvbHMoKTtcbiAgdGhpcy5ib3guYXBwZW5kKHRoaXMudGltZUNvbnRyb2xFbGVtZW50KTtcbn1cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7Q2hhcHRlcnN9IGNoYXB0ZXJNb2R1bGVcbiAqL1xuQ29udHJvbHMucHJvdG90eXBlLmNyZWF0ZVRpbWVDb250cm9scyA9IGZ1bmN0aW9uIChjaGFwdGVyTW9kdWxlKSB7XG4gIHZhciBoYXNDaGFwdGVycyA9IChjaGFwdGVyTW9kdWxlIGluc3RhbmNlb2YgQ2hhcHRlcnMpO1xuICBpZiAoIWhhc0NoYXB0ZXJzKSB7XG4gICAgY29uc29sZS5pbmZvKCdDb250cm9scycsICdjcmVhdGVUaW1lQ29udHJvbHMnLCAnbm8gY2hhcHRlclRhYiBmb3VuZCcpO1xuICB9XG4gIGlmIChoYXNDaGFwdGVycykge1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKCdwd3AtY29udHJvbHMtcHJldmlvdXMtY2hhcHRlcicsICdKdW1wIGJhY2t3YXJkIHRvIHByZXZpb3VzIGNoYXB0ZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYWN0aXZlQ2hhcHRlciA9IGNoYXB0ZXJNb2R1bGUuZ2V0QWN0aXZlQ2hhcHRlcigpO1xuICAgICAgaWYgKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpID4gYWN0aXZlQ2hhcHRlci5zdGFydCArIDEwKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ2JhY2sgdG8gY2hhcHRlciBzdGFydCcsIGNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXIsICdmcm9tJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgICAgICByZXR1cm4gY2hhcHRlck1vZHVsZS5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ2JhY2sgdG8gcHJldmlvdXMgY2hhcHRlcicsIGNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXIpO1xuICAgICAgcmV0dXJuIGNoYXB0ZXJNb2R1bGUucHJldmlvdXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuY3JlYXRlQnV0dG9uKCdwd3AtY29udHJvbHMtYmFjay0zMCcsICdSZXdpbmQgMzAgc2Vjb25kcycsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdyZXdpbmQgYmVmb3JlJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgIHRoaXMudGltZWxpbmUuc2V0VGltZSh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSAtIDMwKTtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdyZXdpbmQgYWZ0ZXInLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIH0pO1xuXG4gIHRoaXMuY3JlYXRlQnV0dG9uKCdwd3AtY29udHJvbHMtZm9yd2FyZC0zMCcsICdGYXN0IGZvcndhcmQgMzAgc2Vjb25kcycsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdmZndkIGJlZm9yZScsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgICB0aGlzLnRpbWVsaW5lLnNldFRpbWUodGhpcy50aW1lbGluZS5nZXRUaW1lKCkgKyAzMCk7XG4gICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnZmZ3ZCBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgfSk7XG5cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1uZXh0LWNoYXB0ZXInLCAnSnVtcCB0byBuZXh0IGNoYXB0ZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICduZXh0IENoYXB0ZXIgYmVmb3JlJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgICAgY2hhcHRlck1vZHVsZS5uZXh0KCk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICduZXh0IENoYXB0ZXIgYWZ0ZXInLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5jcmVhdGVCdXR0b24gPSBmdW5jdGlvbiBjcmVhdGVCdXR0b24oaWNvbiwgdGl0bGUsIGNhbGxiYWNrKSB7XG4gIHZhciBidXR0b24gPSAkKCc8bGk+PGEgaHJlZj1cIiNcIiBjbGFzcz1cImJ1dHRvbiBidXR0b24tY29udHJvbFwiIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiPicgK1xuICAgICc8aSBjbGFzcz1cImljb24gJyArIGljb24gKyAnXCI+PC9pPjwvYT48L2xpPicpO1xuICB0aGlzLnRpbWVDb250cm9sRWxlbWVudC5hcHBlbmQoYnV0dG9uKTtcbiAgdmFyIGNvbWJpbmVkQ2FsbGJhY2sgPSBnZXRDb21iaW5lZENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgYnV0dG9uLm9uKCdjbGljaycsIGNvbWJpbmVkQ2FsbGJhY2suYmluZCh0aGlzKSk7XG59O1xuXG5mdW5jdGlvbiBnZXRDb21iaW5lZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnY29udHJvbGJ1dHRvbiBjbGlja2VkJywgZXZ0KTtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdwbGF5ZXIgc3RhcnRlZD8nLCBwbGF5ZXJTdGFydGVkKHRoaXMucGxheWVyKSk7XG4gICAgaWYgKCFwbGF5ZXJTdGFydGVkKHRoaXMucGxheWVyKSkge1xuICAgICAgdGhpcy5wbGF5ZXIucGxheSgpO1xuICAgIH1cbiAgICB2YXIgYm91bmRDYWxsQmFjayA9IGNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgYm91bmRDYWxsQmFjaygpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUaW1lQ29udHJvbHMoKSB7XG4gIHJldHVybiAkKCc8dWwgY2xhc3M9XCJ0aW1lY29udHJvbGJhclwiPjwvdWw+Jyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJveCgpIHtcbiAgcmV0dXJuICQoJzxkaXYgY2xhc3M9XCJjb250cm9sYmFyIGJhclwiPjwvZGl2PicpO1xufVxuXG5mdW5jdGlvbiBwbGF5ZXJTdGFydGVkKHBsYXllcikge1xuICByZXR1cm4gKCh0eXBlb2YgcGxheWVyLmN1cnJlbnRUaW1lID09PSAnbnVtYmVyJykgJiYgKHBsYXllci5jdXJyZW50VGltZSA+IDApKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb250cm9scy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLy8gZXZlcnl0aGluZyBmb3IgYW4gZW1iZWRkZWQgcGxheWVyXG52YXJcbiAgcGxheWVycyA9IFtdLFxuICBsYXN0SGVpZ2h0ID0gMCxcbiAgJGJvZHk7XG5cbi8qKlxuICogaW5pdGlhbGl6ZSBlbWJlZCBmdW5jdGlvbmFsaXR5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSAkXG4gKiBAcGFyYW0ge0FycmF5fSBwbGF5ZXJMaXN0XG4gKi9cbmZ1bmN0aW9uIGluaXQoJCwgcGxheWVyTGlzdCkge1xuICBwbGF5ZXJzID0gcGxheWVyTGlzdDtcbiAgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpO1xuICAkKHdpbmRvdykub24oJ21lc3NhZ2UnLCBtZXNzYWdlTGlzdGVuZXIpO1xuICBwb2xsSGVpZ2h0KCk7XG59XG5cbmZ1bmN0aW9uIHBvc3RUb09wZW5lcihvYmopIHtcbiAgY29uc29sZS5kZWJ1ZygncG9zdFRvT3BlbmVyJywgb2JqKTtcbiAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShvYmosICcqJyk7XG59XG5cbmZ1bmN0aW9uIG1lc3NhZ2VMaXN0ZW5lciAoZXZlbnQpIHtcbiAgdmFyIG9yaWcgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXG4gIGlmIChvcmlnLmRhdGEuYWN0aW9uID09PSAncGF1c2UnKSB7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3JNZXRhZGF0YSAoY2FsbGJhY2spIHtcbiAgZnVuY3Rpb24gbWV0YURhdGFMaXN0ZW5lciAoZXZlbnQpIHtcbiAgICB2YXIgb3JpZyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG4gICAgaWYgKG9yaWcuZGF0YS5wbGF5ZXJPcHRpb25zKSB7XG4gICAgICBjYWxsYmFjayhvcmlnLmRhdGEucGxheWVyT3B0aW9ucyk7XG4gICAgfVxuICB9XG4gICQod2luZG93KS5vbignbWVzc2FnZScsIG1ldGFEYXRhTGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBwb2xsSGVpZ2h0KCkge1xuICB2YXIgbmV3SGVpZ2h0ID0gJGJvZHkuaGVpZ2h0KCk7XG4gIGlmIChsYXN0SGVpZ2h0ICE9PSBuZXdIZWlnaHQpIHtcbiAgICBwb3N0VG9PcGVuZXIoe1xuICAgICAgYWN0aW9uOiAncmVzaXplJyxcbiAgICAgIGFyZzogbmV3SGVpZ2h0XG4gICAgfSk7XG4gIH1cblxuICBsYXN0SGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbEhlaWdodCwgZG9jdW1lbnQuYm9keSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwb3N0VG9PcGVuZXI6IHBvc3RUb09wZW5lcixcbiAgd2FpdEZvck1ldGFkYXRhOiB3YWl0Rm9yTWV0YWRhdGEsXG4gIGluaXQ6IGluaXRcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW1iZWQuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiohXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBQb2Rsb3ZlIFdlYiBQbGF5ZXIgdjMuMC4wLWFscGhhXG4gKiBMaWNlbnNlZCB1bmRlciBUaGUgQlNEIDItQ2xhdXNlIExpY2Vuc2VcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMi1DbGF1c2VcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAoYykgMjAxNCwgR2Vycml0IHZhbiBBYWtlbiAoaHR0cHM6Ly9naXRodWIuY29tL2dlcnJpdHZhbmFha2VuLyksIFNpbW9uIFdhbGRoZXJyIChodHRwczovL2dpdGh1Yi5jb20vc2ltb253YWxkaGVyci8pLCBGcmFuayBIYXNlIChodHRwczovL2dpdGh1Yi5jb20vS2FtYmZoYXNlLyksIEVyaWMgVGV1YmVydCAoaHR0cHM6Ly9naXRodWIuY29tL2V0ZXViZXJ0LykgYW5kIG90aGVycyAoaHR0cHM6Ly9naXRodWIuY29tL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL2NvbnRyaWJ1dG9ycylcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICpcbiAqIC0gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogLSBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUYWJSZWdpc3RyeSA9IHJlcXVpcmUoJy4vdGFicmVnaXN0cnknKSxcbiAgZW1iZWQgPSByZXF1aXJlKCcuL2VtYmVkJyksXG4gIFRpbWVsaW5lID0gcmVxdWlyZSgnLi90aW1lbGluZScpLFxuICBJbmZvID0gcmVxdWlyZSgnLi9tb2R1bGVzL2luZm8nKSxcbiAgU2hhcmUgPSByZXF1aXJlKCcuL21vZHVsZXMvc2hhcmUnKSxcbiAgRG93bmxvYWRzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2Rvd25sb2FkcycpLFxuICBDaGFwdGVycyA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jaGFwdGVyJyksXG4gIFNhdmVUaW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL3NhdmV0aW1lJyksXG4gIENvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpLFxuICBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpLFxuICBQcm9ncmVzc0JhciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9wcm9ncmVzc2JhcicpO1xuXG52YXIgYXV0b3BsYXkgPSBmYWxzZTtcblxudmFyIHB3cDtcblxuLy8gd2lsbCBleHBvc2UvYXR0YWNoIGl0c2VsZiB0byB0aGUgJCBnbG9iYWxcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkL21lZGlhZWxlbWVudC5qcycpO1xuXG4vKipcbiAqIFRoZSBtb3N0IG1pc3NpbmcgZmVhdHVyZSByZWdhcmRpbmcgZW1iZWRkZWQgcGxheWVyc1xuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIHRoZSB0aXRsZSBvZiB0aGUgc2hvd1xuICogQHBhcmFtIHtzdHJpbmd9IHVybCAob3B0aW9uYWwpIHRoZSBsaW5rIHRvIHRoZSBzaG93XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJTaG93VGl0bGUodGl0bGUsIHVybCkge1xuICBpZiAoIXRpdGxlKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGlmICh1cmwpIHtcbiAgICB0aXRsZSA9ICc8YSBocmVmPVwiJyArIHVybCArICdcIj4nICsgdGl0bGUgKyAnPC9hPic7XG4gIH1cbiAgcmV0dXJuICc8aDMgY2xhc3M9XCJzaG93dGl0bGVcIj4nICsgdGl0bGUgKyAnPC9oMz4nO1xufVxuXG4vKipcbiAqIFJlbmRlciBlcGlzb2RlIHRpdGxlIEhUTUxcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gbGlua1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyVGl0bGUodGV4dCwgbGluaykge1xuICB2YXIgdGl0bGVCZWdpbiA9ICc8aDEgY2xhc3M9XCJlcGlzb2RldGl0bGVcIj4nLFxuICAgIHRpdGxlRW5kID0gJzwvaDE+JztcbiAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCAmJiBsaW5rICE9PSB1bmRlZmluZWQpIHtcbiAgICB0ZXh0ID0gJzxhIGhyZWY9XCInICsgbGluayArICdcIj4nICsgdGV4dCArICc8L2E+JztcbiAgfVxuICByZXR1cm4gdGl0bGVCZWdpbiArIHRleHQgKyB0aXRsZUVuZDtcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCBzdWJ0aXRsZVxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclN1YlRpdGxlKHRleHQpIHtcbiAgaWYgKCF0ZXh0KSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGgyIGNsYXNzPVwic3VidGl0bGVcIj4nICsgdGV4dCArICc8L2gyPic7XG59XG5cbi8qKlxuICogUmVuZGVyIEhUTUwgdGl0bGUgYXJlYVxuICogQHBhcmFtIHBhcmFtc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyVGl0bGVBcmVhKHBhcmFtcykge1xuICByZXR1cm4gJzxoZWFkZXI+JyArXG4gICAgcmVuZGVyU2hvd1RpdGxlKHBhcmFtcy5zaG93LnRpdGxlLCBwYXJhbXMuc2hvdy51cmwpICtcbiAgICByZW5kZXJUaXRsZShwYXJhbXMudGl0bGUsIHBhcmFtcy5wZXJtYWxpbmspICtcbiAgICByZW5kZXJTdWJUaXRsZShwYXJhbXMuc3VidGl0bGUpICtcbiAgICAnPC9oZWFkZXI+Jztcbn1cblxuXG4vKipcbiAqIFJlbmRlciBIVE1MIHBsYXlidXR0b25cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclBsYXlidXR0b24oKSB7XG4gIHJldHVybiAkKCc8YSBjbGFzcz1cInBsYXlcIiB0aXRsZT1cIlBsYXkgRXBpc29kZVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48L2E+Jyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBwb3N0ZXIgaW1hZ2UgaW4gSFRNTFxuICogcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgaWYgcG9zdGVyVXJsIGlzIGVtcHR5XG4gKiBAcGFyYW0ge3N0cmluZ30gcG9zdGVyVXJsXG4gKiBAcmV0dXJucyB7c3RyaW5nfSByZW5kZXJlZCBIVE1MXG4gKi9cbmZ1bmN0aW9uIHJlbmRlclBvc3Rlcihwb3N0ZXJVcmwpIHtcbiAgaWYgKCFwb3N0ZXJVcmwpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiY292ZXJhcnRcIj48aW1nIGNsYXNzPVwiY292ZXJpbWdcIiBzcmM9XCInICsgcG9zdGVyVXJsICsgJ1wiIGRhdGEtaW1nPVwiJyArIHBvc3RlclVybCArICdcIiBhbHQ9XCJQb3N0ZXIgSW1hZ2VcIj48L2Rpdj4nO1xufVxuXG4vKipcbiAqIGNoZWNrcyBpZiB0aGUgY3VycmVudCB3aW5kb3cgaXMgaGlkZGVuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93IGlzIGhpZGRlblxuICovXG5mdW5jdGlvbiBpc0hpZGRlbigpIHtcbiAgdmFyIHByb3BzID0gW1xuICAgICdoaWRkZW4nLFxuICAgICdtb3pIaWRkZW4nLFxuICAgICdtc0hpZGRlbicsXG4gICAgJ3dlYmtpdEhpZGRlbidcbiAgXTtcblxuICBmb3IgKHZhciBpbmRleCBpbiBwcm9wcykge1xuICAgIGlmIChwcm9wc1tpbmRleF0gaW4gZG9jdW1lbnQpIHtcbiAgICAgIHJldHVybiAhIWRvY3VtZW50W3Byb3BzW2luZGV4XV07XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBhZGQgY2hhcHRlciBiZWhhdmlvciBhbmQgZGVlcGxpbmtpbmc6IHNraXAgdG8gcmVmZXJlbmNlZFxuICogdGltZSBwb3NpdGlvbiAmIHdyaXRlIGN1cnJlbnQgdGltZSBpbnRvIGFkZHJlc3NcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbGF5ZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAqIEBwYXJhbSB7b2JqZWN0fSB3cmFwcGVyXG4gKi9cbmZ1bmN0aW9uIGFkZEJlaGF2aW9yKHBsYXllciwgcGFyYW1zLCB3cmFwcGVyKSB7XG4gIHZhciBqcVBsYXllciA9ICQocGxheWVyKSxcblxuICAgIHRpbWVsaW5lID0gbmV3IFRpbWVsaW5lKHBsYXllciwgcGFyYW1zKSxcbiAgICBjb250cm9scyA9IG5ldyBDb250cm9scyhwbGF5ZXIsIHRpbWVsaW5lKSxcbiAgICB0YWJzID0gbmV3IFRhYlJlZ2lzdHJ5KCksXG5cbiAgICBoYXNDaGFwdGVycyA9IHRpbWVsaW5lLmhhc0NoYXB0ZXJzLFxuICAgIG1ldGFFbGVtZW50ID0gJCgnPGRpdiBjbGFzcz1cInRpdGxlYmFyXCI+PC9kaXY+JyksXG4gICAgcGxheWVyVHlwZSA9IHBhcmFtcy50eXBlLFxuICAgIGNvbnRyb2xCb3ggPSBjb250cm9scy5ib3gsXG4gICAgcGxheUJ1dHRvbiA9IHJlbmRlclBsYXlidXR0b24oKSxcbiAgICBwb3N0ZXIgPSBwYXJhbXMucG9zdGVyIHx8IGpxUGxheWVyLmF0dHIoJ3Bvc3RlcicpLFxuICAgIGRlZXBMaW5rO1xuXG5cbiAgY29uc29sZS5kZWJ1Zygnd2VicGxheWVyJywgJ21ldGFkYXRhJywgdGltZWxpbmUuZ2V0RGF0YSgpKTtcblxuICAvKipcbiAgICogQnVpbGQgcmljaCBwbGF5ZXIgd2l0aCBtZXRhIGRhdGFcbiAgICovXG4gIHdyYXBwZXIuYWRkQ2xhc3MoJ3BvZGxvdmV3ZWJwbGF5ZXJfJyArIHBsYXllclR5cGUpO1xuXG5cbiAgaWYgKHBsYXllclR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAvLyBSZW5kZXIgcGxheWJ1dHRvbiBpbiB0aXRsZWJhclxuICAgIG1ldGFFbGVtZW50LnByZXBlbmQocGxheUJ1dHRvbik7XG4gICAgbWV0YUVsZW1lbnQuYXBwZW5kKHJlbmRlclBvc3Rlcihwb3N0ZXIpKTtcbiAgICB3cmFwcGVyLnByZXBlbmQobWV0YUVsZW1lbnQpO1xuICB9XG5cbiAgaWYgKHBsYXllclR5cGUgPT09ICd2aWRlbycpIHtcbiAgICB2YXIgdmlkZW9QYW5lID0gJCgnPGRpdiBjbGFzcz1cInZpZGVvLXBhbmVcIj48L2Rpdj4nKTtcbiAgICB2YXIgb3ZlcmxheSA9ICQoJzxkaXYgY2xhc3M9XCJ2aWRlby1vdmVybGF5XCI+PC9kaXY+Jyk7XG4gICAgb3ZlcmxheS5hcHBlbmQocGxheUJ1dHRvbik7XG4gICAgb3ZlcmxheS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocGxheWVyLnBhdXNlZCkge1xuICAgICAgICBwbGF5QnV0dG9uLmFkZENsYXNzKCdwbGF5aW5nJyk7XG4gICAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgIH0pO1xuXG4gICAgdmlkZW9QYW5lXG4gICAgICAuYXBwZW5kKG92ZXJsYXkpXG4gICAgICAuYXBwZW5kKGpxUGxheWVyKTtcblxuICAgIHdyYXBwZXJcbiAgICAgIC5hcHBlbmQobWV0YUVsZW1lbnQpXG4gICAgICAuYXBwZW5kKHZpZGVvUGFuZSk7XG5cbiAgICBqcVBsYXllci5wcm9wKHtcbiAgICAgIHBvc3RlcjogcG9zdGVyLFxuICAgICAgY29udHJvbHM6IG51bGwsXG4gICAgICBwcmVsb2FkOiAnYXV0bydcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJlbmRlciB0aXRsZSBhcmVhIHdpdGggdGl0bGUgaDIgYW5kIHN1YnRpdGxlIGgzXG4gIG1ldGFFbGVtZW50LmFwcGVuZChyZW5kZXJUaXRsZUFyZWEocGFyYW1zKSk7XG5cbiAgLyoqXG4gICAqIC0tIE1PRFVMRVMgLS1cbiAgICovXG4gIHZhciBjaGFwdGVycztcbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgY2hhcHRlcnMgPSBuZXcgQ2hhcHRlcnModGltZWxpbmUpO1xuICAgIHRpbWVsaW5lLmFkZE1vZHVsZShjaGFwdGVycyk7XG4gICAgY2hhcHRlcnMuYWRkRXZlbnRoYW5kbGVycyhwbGF5ZXIpO1xuICB9XG4gIGNvbnRyb2xzLmNyZWF0ZVRpbWVDb250cm9scyhjaGFwdGVycyk7XG5cbiAgdmFyIHNhdmVUaW1lID0gbmV3IFNhdmVUaW1lKHRpbWVsaW5lLCBwYXJhbXMpO1xuICB0aW1lbGluZS5hZGRNb2R1bGUoc2F2ZVRpbWUpO1xuXG4gIHZhciBwcm9ncmVzc0JhciA9IG5ldyBQcm9ncmVzc0Jhcih0aW1lbGluZSk7XG4gIHRpbWVsaW5lLmFkZE1vZHVsZShwcm9ncmVzc0Jhcik7XG5cbiAgdmFyIHNoYXJpbmcgPSBuZXcgU2hhcmUocGFyYW1zKTtcbiAgdmFyIGRvd25sb2FkcyA9IG5ldyBEb3dubG9hZHMocGFyYW1zKTtcbiAgdmFyIGluZm9zID0gbmV3IEluZm8ocGFyYW1zKTtcblxuICAvKipcbiAgICogLS0gVEFCUyAtLVxuICAgKiBUaGUgdGFicyBpbiBjb250cm9sYmFyIHdpbGwgYXBwZWFyIGluIGZvbGxvd2luZyBvcmRlcjpcbiAgICovXG5cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGFicy5hZGQoY2hhcHRlcnMudGFiLCAhIXBhcmFtcy5jaGFwdGVyc1Zpc2libGUpO1xuICB9XG5cbiAgdGFicy5hZGQoc2hhcmluZy50YWIsICEhcGFyYW1zLnNoYXJlYnV0dG9uc1Zpc2libGUpO1xuICB0YWJzLmFkZChkb3dubG9hZHMudGFiLCAhIXBhcmFtcy5kb3dubG9hZGJ1dHRvbnNWaXNpYmxlKTtcbiAgdGFicy5hZGQoaW5mb3MudGFiLCAhIXBhcmFtcy5zdW1tYXJ5VmlzaWJsZSk7XG5cbiAgLy8gUmVuZGVyIGNvbnRyb2xiYXIgd2l0aCB0b2dnbGViYXIgYW5kIHRpbWVjb250cm9sc1xuICB2YXIgY29udHJvbGJhcldyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwiY29udHJvbGJhci13cmFwcGVyXCI+PC9kaXY+Jyk7XG4gIGNvbnRyb2xiYXJXcmFwcGVyLmFwcGVuZCh0YWJzLnRvZ2dsZWJhcik7XG4gIGNvbnRyb2xiYXJXcmFwcGVyLmFwcGVuZChjb250cm9sQm94KTtcblxuICAvLyByZW5kZXIgcHJvZ3Jlc3NiYXIsIGNvbnRyb2xiYXIgYW5kIHRhYnNcbiAgd3JhcHBlclxuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIucmVuZGVyKCkpXG4gICAgLmFwcGVuZChjb250cm9sYmFyV3JhcHBlcilcbiAgICAuYXBwZW5kKHRhYnMuY29udGFpbmVyKTtcblxuICBwcm9ncmVzc0Jhci5hZGRFdmVudHMoKTtcblxuICAvLyBleHBvc2UgdGhlIHBsYXllciBpbnRlcmZhY2VcbiAgd3JhcHBlci5kYXRhKCdwb2Rsb3Zld2VicGxheWVyJywge1xuICAgIHBsYXllcjoganFQbGF5ZXJcbiAgfSk7XG5cbiAgLy8gcGFyc2UgZGVlcGxpbmtcbiAgZGVlcExpbmsgPSByZXF1aXJlKCcuL3VybCcpLmNoZWNrQ3VycmVudCgpO1xuICBpZiAoZGVlcExpbmtbMF0gJiYgcHdwLnBsYXllcnMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHBsYXllckF0dHJpYnV0ZXMgPSB7cHJlbG9hZDogJ2F1dG8nfTtcbiAgICBpZiAoIWlzSGlkZGVuKCkgJiYgYXV0b3BsYXkpIHtcbiAgICAgIHBsYXllckF0dHJpYnV0ZXMuYXV0b3BsYXkgPSAnYXV0b3BsYXknO1xuICAgIH1cbiAgICBqcVBsYXllci5hdHRyKHBsYXllckF0dHJpYnV0ZXMpO1xuICAgIC8vc3RvcEF0VGltZSA9IGRlZXBMaW5rWzFdO1xuICAgIHRpbWVsaW5lLnBsYXlSYW5nZShkZWVwTGluayk7XG5cbiAgICAkKCdodG1sLCBib2R5JykuZGVsYXkoMTUwKS5hbmltYXRlKHtcbiAgICAgIHNjcm9sbFRvcDogJCgnLmNvbnRhaW5lcjpmaXJzdCcpLm9mZnNldCgpLnRvcCAtIDI1XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAocGxheWVyLmN1cnJlbnRUaW1lICYmIHBsYXllci5jdXJyZW50VGltZSA+IDAgJiYgIXBsYXllci5wYXVzZWQpIHtcbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgICAgaWYgKHBsYXllci5wbHVnaW5UeXBlID09PSAnZmxhc2gnKSB7XG4gICAgICAgIHBsYXllci5wYXVzZSgpOyAgICAvLyBmbGFzaCBmYWxsYmFjayBuZWVkcyBhZGRpdGlvbmFsIHBhdXNlXG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFwbGF5QnV0dG9uLmhhc0NsYXNzKCdwbGF5aW5nJykpIHtcbiAgICAgIHBsYXlCdXR0b24uYWRkQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICB9XG4gICAgcGxheWVyLnBsYXkoKTtcbiAgfSk7XG5cbiAgLy8gd2FpdCBmb3IgdGhlIHBsYXllciBvciB5b3UnbGwgZ2V0IERPTSBFWENFUFRJT05TXG4gIC8vIEFuZCBqdXN0IGxpc3RlbiBvbmNlIGJlY2F1c2Ugb2YgYSBzcGVjaWFsIGJlaGF2aW91ciBpbiBmaXJlZm94XG4gIC8vIC0tPiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02NjQ4NDJcbiAganFQbGF5ZXIub25lKCdjYW5wbGF5JywgZnVuY3Rpb24gKGV2dCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ2NhbnBsYXknLCBldnQpO1xuICB9KTtcblxuICBqcVBsYXllclxuICAgIC5vbigndGltZWxpbmVFbGVtZW50JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhldmVudC5jdXJyZW50VGFyZ2V0LmlkLCBldmVudCk7XG4gICAgfSlcbiAgICAub24oJ3RpbWV1cGRhdGUgcHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRpbWVsaW5lLnVwZGF0ZShldmVudCk7XG4gICAgfSlcbiAgICAvLyB1cGRhdGUgcGxheS9wYXVzZSBzdGF0dXNcbiAgICAub24oJ3BsYXknLCBmdW5jdGlvbiAoKSB7fSlcbiAgICAub24oJ3BsYXlpbmcnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwbGF5QnV0dG9uLmFkZENsYXNzKCdwbGF5aW5nJyk7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdwbGF5JywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgfSlcbiAgICAub24oJ3BhdXNlJywgZnVuY3Rpb24gKCkge1xuICAgICAgcGxheUJ1dHRvbi5yZW1vdmVDbGFzcygncGxheWluZycpO1xuICAgICAgZW1iZWQucG9zdFRvT3BlbmVyKHsgYWN0aW9uOiAncGF1c2UnLCBhcmc6IHBsYXllci5jdXJyZW50VGltZSB9KTtcbiAgICB9KVxuICAgIC5vbignZW5kZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdzdG9wJywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgICAvLyBkZWxldGUgdGhlIGNhY2hlZCBwbGF5IHRpbWVcbiAgICAgIHNhdmVUaW1lLnJlbW92ZUl0ZW0oKTtcbiAgICAgIHRpbWVsaW5lLnJld2luZCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHJldHVybiBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgYXR0YWNoIHNvdXJjZSBlbGVtZW50cyB0byB0aGUgZGVmZXJyZWQgYXVkaW8gZWxlbWVudFxuICogQHBhcmFtIHtvYmplY3R9IGRlZmVycmVkUGxheWVyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGdldERlZmVycmVkUGxheWVyQ2FsbEJhY2soZGVmZXJyZWRQbGF5ZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBwbGF5ZXIuZGVmYXVsdHMsIGRhdGEpO1xuICAgIGRhdGEuc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2VPYmplY3QpIHtcbiAgICAgICQoJzxzb3VyY2U+Jywgc291cmNlT2JqZWN0KS5hcHBlbmRUbyhkZWZlcnJlZFBsYXllcik7XG4gICAgfSk7XG4gICAgcGxheWVyLmNyZWF0ZShkZWZlcnJlZFBsYXllciwgcGFyYW1zLCBhZGRCZWhhdmlvcik7XG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7alF1ZXJ5fVxuICovXG4kLmZuLnBvZGxvdmV3ZWJwbGF5ZXIgPSBmdW5jdGlvbiB3ZWJQbGF5ZXIob3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5kZWZlcnJlZCkge1xuICAgIHZhciBkZWZlcnJlZFBsYXllciA9IHRoaXNbMF07XG4gICAgdmFyIGNhbGxiYWNrID0gZ2V0RGVmZXJyZWRQbGF5ZXJDYWxsQmFjayhkZWZlcnJlZFBsYXllcik7XG4gICAgZW1iZWQud2FpdEZvck1ldGFkYXRhKGNhbGxiYWNrKTtcbiAgICBlbWJlZC5wb3N0VG9PcGVuZXIoe2FjdGlvbjogJ3dhaXRpbmcnfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBBZGRpdGlvbmFsIHBhcmFtZXRlcnMgZGVmYXVsdCB2YWx1ZXNcbiAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBwbGF5ZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gIC8vIHR1cm4gZWFjaCBwbGF5ZXIgaW4gdGhlIGN1cnJlbnQgc2V0IGludG8gYSBQb2Rsb3ZlIFdlYiBQbGF5ZXJcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgcGxheWVyRWxlbWVudCkge1xuICAgIHBsYXllci5jcmVhdGUocGxheWVyRWxlbWVudCwgcGFyYW1zLCBhZGRCZWhhdmlvcik7XG4gIH0pO1xufTtcblxucHdwID0geyBwbGF5ZXJzOiBwbGF5ZXIucGxheWVycyB9O1xuXG5lbWJlZC5pbml0KCQsIHBsYXllci5wbGF5ZXJzKTtcblxud2luZG93LnB3cCA9IHB3cDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzlmZjcyZTQ1LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuLi90aW1lY29kZScpXG4gICwgdXJsID0gcmVxdWlyZSgnLi4vdXJsJylcbiAgLCBUYWIgPSByZXF1aXJlKCcuLi90YWInKVxuICAsIFRpbWVsaW5lID0gcmVxdWlyZSgnLi4vdGltZWxpbmUnKTtcblxudmFyIEFDVElWRV9DSEFQVEVSX1RIUkVTSEhPTEQgPSAwLjE7XG5cbi8qKlxuICogcmVuZGVyIEhUTUxUYWJsZUVsZW1lbnQgZm9yIGNoYXB0ZXJzXG4gKiBAcmV0dXJucyB7alF1ZXJ5fEhUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiByZW5kZXJDaGFwdGVyVGFibGUoKSB7XG4gIHJldHVybiByZW5kZXIoXG4gICAgJzx0YWJsZSBjbGFzcz1cInBvZGxvdmV3ZWJwbGF5ZXJfY2hhcHRlcnNcIj48Y2FwdGlvbj5Qb2RjYXN0IENoYXB0ZXJzPC9jYXB0aW9uPicgK1xuICAgICAgJzx0aGVhZD4nICtcbiAgICAgICAgJzx0cj4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+Q2hhcHRlciBOdW1iZXI8L3RoPicgK1xuICAgICAgICAgICc8dGggc2NvcGU9XCJjb2xcIj5TdGFydCB0aW1lPC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+VGl0bGU8L3RoPicgK1xuICAgICAgICAgICc8dGggc2NvcGU9XCJjb2xcIj5EdXJhdGlvbjwvdGg+JyArXG4gICAgICAgICc8L3RyPicgK1xuICAgICAgJzwvdGhlYWQ+JyArXG4gICAgICAnPHRib2R5PjwvdGJvZHk+JyArXG4gICAgJzwvdGFibGU+J1xuICApO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY2hhcHRlclxuICogQHJldHVybnMge2pRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVuZGVyUm93IChjaGFwdGVyLCBpbmRleCkge1xuICByZXR1cm4gcmVuZGVyKFxuICAgICc8dHIgY2xhc3M9XCJjaGFwdGVyXCI+JyArXG4gICAgICAnPHRkIGNsYXNzPVwiY2hhcHRlci1udW1iZXJcIj48c3BhbiBjbGFzcz1cImJhZGdlXCI+JyArIChpbmRleCsxKSArICc8L3NwYW4+PC90ZD4nICtcbiAgICAgICc8dGQgY2xhc3M9XCJjaGFwdGVyLW5hbWVcIj48c3Bhbj4nICsgY2hhcHRlci5jb2RlICsgJzwvc3Bhbj4gJyArXG4gICAgICAnPC90ZD4nICtcbiAgICAgICc8dGQgY2xhc3M9XCJjaGFwdGVyLWR1cmF0aW9uXCI+PHNwYW4+JyArIGNoYXB0ZXIuZHVyYXRpb24gKyAnPC9zcGFuPjwvdGQ+JyArXG4gICAgJzwvdHI+J1xuICApO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoaHRtbCkge1xuICByZXR1cm4gJChodG1sKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2hhcHRlcnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldE1heENoYXB0ZXJTdGFydChjaGFwdGVycykge1xuICBmdW5jdGlvbiBnZXRTdGFydFRpbWUgKGNoYXB0ZXIpIHtcbiAgICByZXR1cm4gY2hhcHRlci5zdGFydDtcbiAgfVxuICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgJC5tYXAoY2hhcHRlcnMsIGdldFN0YXJ0VGltZSkpO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3tlbmQ6e251bWJlcn0sIHN0YXJ0OntudW1iZXJ9fX0gY2hhcHRlclxuICogQHBhcmFtIHtudW1iZXJ9IGN1cnJlbnRUaW1lXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBY3RpdmVDaGFwdGVyIChjaGFwdGVyLCBjdXJyZW50VGltZSkge1xuICBpZiAoIWNoYXB0ZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChjdXJyZW50VGltZSA+IGNoYXB0ZXIuc3RhcnQgLSBBQ1RJVkVfQ0hBUFRFUl9USFJFU0hIT0xEICYmIGN1cnJlbnRUaW1lIDw9IGNoYXB0ZXIuZW5kKTtcbn1cblxuLyoqXG4gKiB1cGRhdGUgdGhlIGNoYXB0ZXIgbGlzdCB3aGVuIHRoZSBkYXRhIGlzIGxvYWRlZFxuICogQHBhcmFtIHtUaW1lbGluZX0gdGltZWxpbmVcbiAqL1xuZnVuY3Rpb24gdXBkYXRlICh0aW1lbGluZSkge1xuICB2YXIgY2hhcHRlciA9IHRoaXMuZ2V0QWN0aXZlQ2hhcHRlcigpXG4gICAgLCBjdXJyZW50VGltZSA9IHRpbWVsaW5lLmdldFRpbWUoKTtcblxuICBjb25zb2xlLmRlYnVnKCdDaGFwdGVycycsICd1cGRhdGUnLCB0aGlzLCBjaGFwdGVyLCBjdXJyZW50VGltZSk7XG4gIGlmIChpc0FjdGl2ZUNoYXB0ZXIoY2hhcHRlciwgY3VycmVudFRpbWUpKSB7XG4gICAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ3VwZGF0ZScsICdhbHJlYWR5IHNldCcsIHRoaXMuY3VycmVudENoYXB0ZXIpO1xuICAgIHJldHVybjtcbiAgfVxuICBmdW5jdGlvbiBtYXJrQ2hhcHRlciAoY2hhcHRlciwgaSkge1xuICAgIHZhciBpc0FjdGl2ZSA9IGlzQWN0aXZlQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50VGltZSk7XG4gICAgaWYgKGlzQWN0aXZlKSB7XG4gICAgICB0aGlzLnNldEN1cnJlbnRDaGFwdGVyKGkpO1xuICAgIH1cbiAgfVxuICB0aGlzLmNoYXB0ZXJzLmZvckVhY2gobWFya0NoYXB0ZXIsIHRoaXMpO1xufVxuXG4vKipcbiAqIGNoYXB0ZXIgaGFuZGxpbmdcbiAqIEBwYXJhbXMge1RpbWVsaW5lfSBwYXJhbXNcbiAqIEByZXR1cm4ge0NoYXB0ZXJzfSBjaGFwdGVyIG1vZHVsZVxuICovXG5mdW5jdGlvbiBDaGFwdGVycyAodGltZWxpbmUpIHtcblxuICBpZiAoIXRpbWVsaW5lIHx8ICF0aW1lbGluZS5oYXNDaGFwdGVycykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0aW1lbGluZS5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGNvbnNvbGUud2FybignQ2hhcHRlcnMnLCAnY29uc3RydWN0b3InLCAnWmVybyBsZW5ndGggbWVkaWE/JywgdGltZWxpbmUpO1xuICB9XG5cbiAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lO1xuICB0aGlzLmR1cmF0aW9uID0gdGltZWxpbmUuZHVyYXRpb247XG4gIHRoaXMuY2hhcHRlcnMgPSB0aW1lbGluZS5nZXREYXRhQnlUeXBlKCdjaGFwdGVyJyk7XG4gIHRoaXMuY2hhcHRlcmxpbmtzID0gISF0aW1lbGluZS5jaGFwdGVybGlua3M7XG4gIHRoaXMuY3VycmVudENoYXB0ZXIgPSAwO1xuXG4gIHRoaXMudGFiID0gbmV3IFRhYih7XG4gICAgaWNvbjogXCJwd3AtY2hhcHRlcnNcIixcbiAgICB0aXRsZTogXCJTaG93L2hpZGUgY2hhcHRlcnNcIixcbiAgICBoZWFkbGluZTogJ0NoYXB0ZXJzJyxcbiAgICBuYW1lOiBcInBvZGxvdmV3ZWJwbGF5ZXJfY2hhcHRlcmJveFwiXG4gIH0pO1xuXG4gIHRoaXMudGFiXG4gICAgLmNyZWF0ZU1haW5Db250ZW50KCcnKVxuICAgIC5hcHBlbmQodGhpcy5nZW5lcmF0ZVRhYmxlKCkpO1xuXG4gIHRoaXMudXBkYXRlID0gdXBkYXRlLmJpbmQodGhpcyk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBsaXN0IG9mIGNoYXB0ZXJzLCB0aGlzIGZ1bmN0aW9uIGNyZWF0ZXMgdGhlIGNoYXB0ZXIgdGFibGUgZm9yIHRoZSBwbGF5ZXIuXG4gKiBAcmV0dXJucyB7alF1ZXJ5fEhUTUxEaXZFbGVtZW50fVxuICovXG5DaGFwdGVycy5wcm90b3R5cGUuZ2VuZXJhdGVUYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRhYmxlLCB0Ym9keSwgbWF4Y2hhcHRlcnN0YXJ0LCBmb3JjZUhvdXJzO1xuXG4gIHRhYmxlID0gcmVuZGVyQ2hhcHRlclRhYmxlKCk7XG4gIHRib2R5ID0gdGFibGUuY2hpbGRyZW4oJ3Rib2R5Jyk7XG5cbiAgaWYgKHRoaXMuY2hhcHRlcmxpbmtzICE9PSAnZmFsc2UnKSB7XG4gICAgdGFibGUuYWRkQ2xhc3MoJ2xpbmtlZCBsaW5rZWRfJyArIHRoaXMuY2hhcHRlcmxpbmtzKTtcbiAgfVxuXG4gIG1heGNoYXB0ZXJzdGFydCA9IGdldE1heENoYXB0ZXJTdGFydCh0aGlzLmNoYXB0ZXJzKTtcbiAgZm9yY2VIb3VycyA9IChtYXhjaGFwdGVyc3RhcnQgPj0gMzYwMCk7XG5cbiAgZnVuY3Rpb24gYnVpbGRDaGFwdGVyKGkpIHtcbiAgICB2YXIgZHVyYXRpb24gPSBNYXRoLnJvdW5kKHRoaXMuZW5kIC0gdGhpcy5zdGFydCksXG4gICAgICByb3c7XG4gICAgLy9tYWtlIHN1cmUgdGhlIGR1cmF0aW9uIGZvciBhbGwgY2hhcHRlcnMgYXJlIGVxdWFsbHkgZm9ybWF0dGVkXG4gICAgdGhpcy5kdXJhdGlvbiA9IHRjLmdlbmVyYXRlKFtkdXJhdGlvbl0sIGZhbHNlKTtcblxuICAgIC8vaWYgdGhlcmUgaXMgYSBjaGFwdGVyIHRoYXQgc3RhcnRzIGFmdGVyIGFuIGhvdXIsIGZvcmNlICcwMDonIG9uIGFsbCBwcmV2aW91cyBjaGFwdGVyc1xuICAgIC8vaW5zZXJ0IHRoZSBjaGFwdGVyIGRhdGFcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHRjLmdlbmVyYXRlKFtNYXRoLnJvdW5kKHRoaXMuc3RhcnQpXSwgdHJ1ZSwgZm9yY2VIb3Vycyk7XG5cbiAgICByb3cgPSByZW5kZXJSb3codGhpcywgaSk7XG4gICAgaWYgKGkgJSAyKSB7XG4gICAgICByb3cuYWRkQ2xhc3MoJ29kZGNoYXB0ZXInKTtcbiAgICB9XG4gICAgcm93LmFwcGVuZFRvKHRib2R5KTtcbiAgICB0aGlzLmVsZW1lbnQgPSByb3c7XG4gIH1cblxuICAkLmVhY2godGhpcy5jaGFwdGVycywgYnVpbGRDaGFwdGVyKTtcbiAgcmV0dXJuIHRhYmxlO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHttZWpzLkh0bWxNZWRpYUVsZW1lbnR9IHBsYXllclxuICovXG5DaGFwdGVycy5wcm90b3R5cGUuYWRkRXZlbnRoYW5kbGVycyA9IGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgLy8gZW5hYmxlIGV4dGVybmFsIGxpbmtzIHRvIGJlIG9wZW5lZCBpbiBhIG5ldyB0YWIgb3Igd2luZG93XG4gICAgLy8gY2FuY2VscyBldmVudCB0byBidWJibGUgdXBcbiAgICBpZiAoZS50YXJnZXQuY2xhc3NOYW1lID09PSAncHdwLW91dGdvaW5nIGJ1dHRvbiBidXR0b24tdG9nZ2xlJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJ2NoYXB0ZXIjY2xpY2tIYW5kbGVyOiBzdGFydCBjaGFwdGVyIGF0JywgY2hhcHRlclN0YXJ0KTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gQmFzaWMgQ2hhcHRlciBNYXJrIGZ1bmN0aW9uICh3aXRob3V0IGRlZXBsaW5raW5nKVxuICAgIGNvbnNvbGUubG9nKCdDaGFwdGVyJywgJ2NsaWNrSGFuZGxlcicsICdzZXRDdXJyZW50Q2hhcHRlciB0bycsIGUuZGF0YS5pbmRleCk7XG4gICAgZS5kYXRhLm1vZHVsZS5zZXRDdXJyZW50Q2hhcHRlcihlLmRhdGEuaW5kZXgpO1xuICAgIC8vIGZsYXNoIGZhbGxiYWNrIG5lZWRzIGFkZGl0aW9uYWwgcGF1c2VcbiAgICBpZiAocGxheWVyLnBsdWdpblR5cGUgPT09ICdmbGFzaCcpIHtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgIH1cbiAgICBlLmRhdGEubW9kdWxlLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZENsaWNrSGFuZGxlciAoY2hhcHRlciwgaW5kZXgpIHtcbiAgICBjaGFwdGVyLmVsZW1lbnQub24oJ2NsaWNrJywge21vZHVsZTogdGhpcywgaW5kZXg6IGluZGV4fSwgb25DbGljayk7XG4gIH1cblxuICB0aGlzLmNoYXB0ZXJzLmZvckVhY2goYWRkQ2xpY2tIYW5kbGVyLCB0aGlzKTtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5nZXRBY3RpdmVDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYWN0aXZlID0gdGhpcy5jaGFwdGVyc1t0aGlzLmN1cnJlbnRDaGFwdGVyXTtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ2dldEFjdGl2ZUNoYXB0ZXInLCBhY3RpdmUpO1xuICByZXR1cm4gYWN0aXZlO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGNoYXB0ZXJJbmRleFxuICovXG5DaGFwdGVycy5wcm90b3R5cGUuc2V0Q3VycmVudENoYXB0ZXIgPSBmdW5jdGlvbiAoY2hhcHRlckluZGV4KSB7XG4gIGlmIChjaGFwdGVySW5kZXggPCB0aGlzLmNoYXB0ZXJzLmxlbmd0aCAmJiBjaGFwdGVySW5kZXggPj0gMCkge1xuICAgIHRoaXMuY3VycmVudENoYXB0ZXIgPSBjaGFwdGVySW5kZXg7XG4gIH1cbiAgdGhpcy5tYXJrQWN0aXZlQ2hhcHRlcigpO1xuICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAnc2V0Q3VycmVudENoYXB0ZXInLCAndG8nLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5tYXJrQWN0aXZlQ2hhcHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFjdGl2ZUNoYXB0ZXIgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKTtcbiAgJC5lYWNoKHRoaXMuY2hhcHRlcnMsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICB9KTtcbiAgYWN0aXZlQ2hhcHRlci5lbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3VycmVudCA9IHRoaXMuY3VycmVudENoYXB0ZXIsXG4gICAgbmV4dCA9IHRoaXMuc2V0Q3VycmVudENoYXB0ZXIoY3VycmVudCsxKTtcbiAgaWYgKGN1cnJlbnQgPT09IG5leHQpIHtcbiAgICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAnbmV4dCcsICdhbHJlYWR5IGluIGxhc3QgY2hhcHRlcicpO1xuICAgIHJldHVybiBjdXJyZW50O1xuICB9XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICduZXh0JywgJ2NoYXB0ZXInLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgcmV0dXJuIG5leHQ7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50Q2hhcHRlcixcbiAgICBwcmV2aW91cyA9IHRoaXMuc2V0Q3VycmVudENoYXB0ZXIoY3VycmVudC0xKTtcbiAgaWYgKGN1cnJlbnQgPT09IHByZXZpb3VzKSB7XG4gICAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ3ByZXZpb3VzJywgJ2FscmVhZHkgaW4gZmlyc3QgY2hhcHRlcicpO1xuICAgIHRoaXMucGxheUN1cnJlbnRDaGFwdGVyKCk7XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH1cbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ3ByZXZpb3VzJywgJ2NoYXB0ZXInLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgcmV0dXJuIHByZXZpb3VzO1xufTtcblxuQ2hhcHRlcnMucHJvdG90eXBlLnBsYXlDdXJyZW50Q2hhcHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0YXJ0ID0gdGhpcy5nZXRBY3RpdmVDaGFwdGVyKCkuc3RhcnQ7XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICcjcGxheUN1cnJlbnRDaGFwdGVyJywgJ3N0YXJ0Jywgc3RhcnQpO1xuICB2YXIgdGltZSA9IHRoaXMudGltZWxpbmUuc2V0VGltZShzdGFydCk7XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICcjcGxheUN1cnJlbnRDaGFwdGVyJywgJ2N1cnJlbnRUaW1lJywgdGltZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXB0ZXJzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2hhcHRlci5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBUYWIgPSByZXF1aXJlKCcuLi90YWInKVxuICAsIHRpbWVDb2RlID0gcmVxdWlyZSgnLi4vdGltZWNvZGUnKVxuICA7XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBmaWxlc2l6ZSBpbnRvIEtCIGFuZCBNQlxuICogQHBhcmFtIHNpemVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdFNpemUoc2l6ZSkge1xuICB2YXIgb25lTWIgPSAxMDQ4NTc2O1xuICB2YXIgZmlsZVNpemUgPSBwYXJzZUludChzaXplLCAxMCk7XG4gIHZhciBrQkZpbGVTaXplID0gTWF0aC5yb3VuZChmaWxlU2l6ZSAvIDEwMjQpO1xuICB2YXIgbUJGaWxlU0l6ZSA9IE1hdGgucm91bmQoZmlsZVNpemUgLyAxMDI0IC8gMTAyNCk7XG4gIGlmICghc2l6ZSkge1xuICAgIHJldHVybiAnIC0tICc7XG4gIH1cbiAgLy8gaW4gY2FzZSwgdGhlIGZpbGVzaXplIGlzIHNtYWxsZXIgdGhhbiAxTUIsXG4gIC8vIHRoZSBmb3JtYXQgd2lsbCBiZSByZW5kZXJlZCBpbiBLQlxuICAvLyBvdGhlcndpc2UgaW4gTUJcbiAgcmV0dXJuIChmaWxlU2l6ZSA8IG9uZU1iKSA/IGtCRmlsZVNpemUgKyAnIEtCJyA6IG1CRmlsZVNJemUgKyAnIE1CJztcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIGxpc3RFbGVtZW50XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjcmVhdGVPcHRpb24obGlzdEVsZW1lbnQpIHtcbiAgY29uc29sZS5sb2cobGlzdEVsZW1lbnQpO1xuICByZXR1cm4gJzxvcHRpb24+JyArIGxpc3RFbGVtZW50LmFzc2V0VGl0bGUgKyAnICcgKyBmb3JtYXRTaXplKGxpc3RFbGVtZW50LnNpemUpICsgJzwvb3B0aW9uPic7XG59XG5cbmZ1bmN0aW9uIGdldFBvc3RlckltYWdlKHBhcmFtcykge1xuICB2YXIgZGVmYXVsdFBvc3RlciA9ICcvaW1nL2ljb24tcG9kbG92ZS1zdWJzY3JpYmUtNjAwLnBuZyc7XG4gIHZhciBkZWZhdWx0Q2xhc3MgPSAnZGVmYXVsdC1wb3N0ZXInO1xuXG4gIHZhciBwb3N0ZXIgPSBkZWZhdWx0UG9zdGVyO1xuICBpZiAocGFyYW1zLnNob3cucG9zdGVyKSB7XG4gICAgcG9zdGVyID0gcGFyYW1zLnNob3cucG9zdGVyO1xuICAgIGRlZmF1bHRDbGFzcyA9ICcnO1xuICB9XG4gIGlmIChwYXJhbXMucG9zdGVyKSB7XG4gICAgcG9zdGVyID0gcGFyYW1zLnBvc3RlcjtcbiAgICBkZWZhdWx0Q2xhc3MgPSAnJztcbiAgfVxuXG4gIHJldHVybiAnPGltZyBjbGFzcz1cInBvc3Rlci1pbWFnZSAnICsgZGVmYXVsdENsYXNzICsgJ1wiIHNyYz1cIicgKyBwb3N0ZXIgKyAnXCIgZGF0YS1pbWc9XCInICsgcG9zdGVyICsgJ1wiICcgK1xuICAgICdhbHQ9XCJQb3N0ZXIgSW1hZ2VcIj4nO1xufVxuXG5mdW5jdGlvbiBnZXRQdWJsaWNhdGlvbkRhdGUocmF3RGF0ZSkge1xuICBpZiAoIXJhd0RhdGUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZShyYXdEYXRlKTtcbiAgcmV0dXJuICc8cD5QdWJsaXNoZWQ6ICcgKyBkYXRlLmdldERhdGUoKSArICcuJyArIGRhdGUuZ2V0TW9udGgoKSArICcuJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICc8L3A+Jztcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICogQHJldHVybnMge251bGx8VGFifSBkb3dubG9hZCB0YWJcbiAqL1xuRG93bmxvYWRzLnByb3RvdHlwZS5jcmVhdGVEb3dubG9hZFRhYiA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgaWYgKCghcGFyYW1zLmRvd25sb2FkcyAmJiAhcGFyYW1zLnNvdXJjZXMpIHx8IHBhcmFtcy5oaWRlZG93bmxvYWRidXR0b24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgZG93bmxvYWRUYWIgPSBuZXcgVGFiKHtcbiAgICAgIGljb246IFwicHdwLWRvd25sb2FkXCIsXG4gICAgICB0aXRsZTogXCJTaG93L2hpZGUgZG93bmxvYWQgYmFyXCIsXG4gICAgICBuYW1lOiAnZG93bmxvYWRzJyxcbiAgICAgIGhlYWRsaW5lOiAnRG93bmxvYWQnXG4gIH0pO1xuXG4gIHZhciAkdGFiQ29udGVudCA9IGRvd25sb2FkVGFiLmNyZWF0ZU1haW5Db250ZW50KCc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwicG9zdGVyLXdyYXBwZXJcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkb3dubG9hZCBkb3dubG9hZC1vdmVybGF5XCI+PC9kaXY+JyArXG4gICAgICAgICBnZXRQb3N0ZXJJbWFnZShwYXJhbXMpICtcbiAgICAgICc8L2Rpdj4nICtcbiAgICAnPC9kaXY+JyArXG4gICAgJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPicgK1xuICAgICAgJzxoMj4nICsgcGFyYW1zLnRpdGxlICsgJzwvaDI+JyArXG4gICAgICBnZXRQdWJsaWNhdGlvbkRhdGUocGFyYW1zLnB1YmxpY2F0aW9uRGF0ZSkgK1xuICAgICAgJzxwPkR1cmF0aW9uOiAnICsgdGltZUNvZGUuZnJvbVRpbWVTdGFtcChwYXJhbXMuZHVyYXRpb24pICsgJzwvcD4nICtcbiAgICAnPC9kaXY+J1xuICAgICk7XG4gIGRvd25sb2FkVGFiLmJveC5hcHBlbmQoJHRhYkNvbnRlbnQpO1xuXG4gIGRvd25sb2FkVGFiLmNyZWF0ZUZvb3RlcignPGZvcm0gYWN0aW9uPVwiXCIgbWV0aG9kPVwiXCI+JyArXG4gICAgJzxidXR0b24gY2xhc3M9XCJkb3dubG9hZCBidXR0b24tc3VibWl0IGljb24gcHdwLWRvd25sb2FkXCIgbmFtZT1cImRvd25sb2FkLWZpbGVcIj4nICtcbiAgICAnPHNwYW4gY2xhc3M9XCJkb3dubG9hZCBsYWJlbFwiPkRvd25sb2FkIEVwaXNvZGU8L3NwYW4+JyArXG4gICAgJzwvYnV0dG9uPicgK1xuICAgICc8c2VsZWN0IGNsYXNzPVwic2VsZWN0XCIgbmFtZT1cInNlbGVjdC1maWxlXCI+JyArIHRoaXMubGlzdC5tYXAoY3JlYXRlT3B0aW9uKSArICc8L3NlbGVjdD48L2Zvcm0+J1xuICk7XG5cbiAgcmV0dXJuIGRvd25sb2FkVGFiO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEByZXR1cm5zIHt7YXNzZXRUaXRsZTogU3RyaW5nLCBkb3dubG9hZFVybDogU3RyaW5nLCB1cmw6IFN0cmluZywgc2l6ZTogTnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplRG93bmxvYWQgKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICBhc3NldFRpdGxlOiBlbGVtZW50Lm5hbWUsXG4gICAgZG93bmxvYWRVcmw6IGVsZW1lbnQuZGx1cmwsXG4gICAgdXJsOiBlbGVtZW50LnVybCxcbiAgICBzaXplOiBlbGVtZW50LnNpemVcbiAgfTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEByZXR1cm5zIHt7YXNzZXRUaXRsZTogU3RyaW5nLCBkb3dubG9hZFVybDogU3RyaW5nLCB1cmw6IFN0cmluZywgc2l6ZTogTnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplU291cmNlKGVsZW1lbnQpIHtcbiAgdmFyIHNvdXJjZSA9ICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpID8gZWxlbWVudCA6IGVsZW1lbnQuc3JjO1xuICB2YXIgcGFydHMgPSBzb3VyY2Uuc3BsaXQoJy4nKTtcbiAgcmV0dXJuIHtcbiAgICBhc3NldFRpdGxlOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSxcbiAgICBkb3dubG9hZFVybDogc291cmNlLFxuICAgIHVybDogc291cmNlLFxuICAgIHNpemU6IC0xXG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTGlzdCAocGFyYW1zKSB7XG4gIGlmIChwYXJhbXMuZG93bmxvYWRzICYmIHBhcmFtcy5kb3dubG9hZHNbMF0uYXNzZXRUaXRsZSkge1xuICAgIHJldHVybiBwYXJhbXMuZG93bmxvYWRzO1xuICB9XG5cbiAgaWYgKHBhcmFtcy5kb3dubG9hZHMpIHtcbiAgICByZXR1cm4gcGFyYW1zLmRvd25sb2Fkcy5tYXAobm9ybWFsaXplRG93bmxvYWQpO1xuICB9XG4gIC8vIGJ1aWxkIGZyb20gc291cmNlIGVsZW1lbnRzXG4gIHJldHVybiBwYXJhbXMuc291cmNlcy5tYXAobm9ybWFsaXplU291cmNlKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIERvd25sb2FkcyAocGFyYW1zKSB7XG4gIHRoaXMubGlzdCA9IGNyZWF0ZUxpc3QocGFyYW1zKTtcbiAgdGhpcy50YWIgPSB0aGlzLmNyZWF0ZURvd25sb2FkVGFiKHBhcmFtcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRG93bmxvYWRzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvZG93bmxvYWRzLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFRhYiA9IHJlcXVpcmUoJy4uL3RhYicpXG4gICwgdGltZUNvZGUgPSByZXF1aXJlKCcuLi90aW1lY29kZScpXG4gICwgc2VydmljZXMgPSByZXF1aXJlKCcuLi9zb2NpYWwtbmV0d29ya3MnKTtcblxuZnVuY3Rpb24gZ2V0UHVibGljYXRpb25EYXRlKHJhd0RhdGUpIHtcbiAgaWYgKCFyYXdEYXRlKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHZhciBkYXRlID0gbmV3IERhdGUocmF3RGF0ZSk7XG4gIHJldHVybiAnPHA+UHVibGlzaGVkOiAnICsgZGF0ZS5nZXREYXRlKCkgKyAnLicgKyBkYXRlLmdldE1vbnRoKCkgKyAnLicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnPC9wPic7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVwaXNvZGVJbmZvKHRhYiwgcGFyYW1zKSB7XG4gIHRhYi5jcmVhdGVNYWluQ29udGVudChcbiAgICAnPGgyPicgKyBwYXJhbXMudGl0bGUgKyAnPC9oMj4nICtcbiAgICAnPGgzPicgKyBwYXJhbXMuc3VidGl0bGUgKyAnPC9oMz4nICtcbiAgICAnPHA+JyArIHBhcmFtcy5zdW1tYXJ5ICsgJzwvcD4nICtcbiAgICAnPHA+RHVyYXRpb246ICcgKyB0aW1lQ29kZS5mcm9tVGltZVN0YW1wKHBhcmFtcy5kdXJhdGlvbikgKyAnPC9wPicgK1xuICAgICBnZXRQdWJsaWNhdGlvbkRhdGUocGFyYW1zLnB1YmxpY2F0aW9uRGF0ZSkgK1xuICAgICc8cD4nICtcbiAgICAgICdQZXJtYWxpbmsgZm9yIHRoaXMgZXBpc29kZTo8YnI+JyArXG4gICAgICAnPGEgaHJlZj1cIicgKyBwYXJhbXMucGVybWFsaW5rICsgJ1wiPicgKyBwYXJhbXMucGVybWFsaW5rICsgJzwvYT4nICtcbiAgICAnPC9wPidcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zdGVySW1hZ2UocG9zdGVyKSB7XG4gIGlmICghcG9zdGVyKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGRpdiBjbGFzcz1cInBvc3Rlci1pbWFnZVwiPicgK1xuICAgICc8aW1nIHNyYz1cIicgKyBwb3N0ZXIgKyAnXCIgZGF0YS1pbWc9XCInICsgcG9zdGVyICsgJ1wiIGFsdD1cIlBvc3RlciBJbWFnZVwiPicgK1xuICAgICc8L2Rpdj4nO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdWJzY3JpYmVCdXR0b24ocGFyYW1zKSB7XG4gIGlmICghcGFyYW1zLnN1YnNjcmliZUJ1dHRvbikge1xuICAgIHJldHVybiAnJztcbiAgfVxuICByZXR1cm4gJzxidXR0b24gY2xhc3M9XCJidXR0b24tc3VibWl0XCI+JyArXG4gICAgICAnPHNwYW4gY2xhc3M9XCJzaG93dGl0bGUtbGFiZWxcIj4nICsgcGFyYW1zLnNob3cudGl0bGUgKyAnPC9zcGFuPicgK1xuICAgICAgJzxzcGFuIGNsYXNzPVwic3VibWl0LWxhYmVsXCI+JyArIHBhcmFtcy5zdWJzY3JpYmVCdXR0b24gKyAnPC9zcGFuPicgK1xuICAgICc8L2J1dHRvbj4nO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTaG93SW5mbyAodGFiLCBwYXJhbXMpIHtcbiAgdGFiLmNyZWF0ZUFzaWRlKFxuICAgICc8aDI+JyArIHBhcmFtcy5zaG93LnRpdGxlICsgJzwvaDI+JyArXG4gICAgJzxoMz4nICsgcGFyYW1zLnNob3cuc3VidGl0bGUgKyAnPC9oMz4nICtcbiAgICBjcmVhdGVQb3N0ZXJJbWFnZShwYXJhbXMuc2hvdy5wb3N0ZXIpICtcbiAgICBjcmVhdGVTdWJzY3JpYmVCdXR0b24ocGFyYW1zKSArXG4gICAgJzxwPkxpbmsgdG8gdGhlIHNob3c6PGJyPicgK1xuICAgICAgJzxhIGhyZWY9XCInICsgcGFyYW1zLnNob3cudXJsICsgJ1wiPicgKyBwYXJhbXMuc2hvdy51cmwgKyAnPC9hPjwvcD4nXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNvY2lhbExpbmsob3B0aW9ucykge1xuICB2YXIgc2VydmljZSA9IHNlcnZpY2VzLmdldChvcHRpb25zLnNlcnZpY2VOYW1lKTtcbiAgdmFyIGxpc3RJdGVtID0gJCgnPGxpPjwvbGk+Jyk7XG4gIHZhciBidXR0b24gPSBzZXJ2aWNlLmdldEJ1dHRvbihvcHRpb25zKTtcbiAgbGlzdEl0ZW0uYXBwZW5kKGJ1dHRvbi5lbGVtZW50KTtcbiAgdGhpcy5hcHBlbmQobGlzdEl0ZW0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTb2NpYWxJbmZvKHByb2ZpbGVzKSB7XG4gIGlmICghcHJvZmlsZXMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBwcm9maWxlTGlzdCA9ICQoJzx1bD48L3VsPicpO1xuICBwcm9maWxlcy5mb3JFYWNoKGNyZWF0ZVNvY2lhbExpbmssIHByb2ZpbGVMaXN0KTtcblxuICB2YXIgY29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cInNvY2lhbC1saW5rc1wiPjxoMz5TdGF5IGluIHRvdWNoPC9oMz48L2Rpdj4nKTtcbiAgY29udGFpbmVyLmFwcGVuZChwcm9maWxlTGlzdCk7XG4gIHJldHVybiBjb250YWluZXI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNvY2lhbEFuZExpY2Vuc2VJbmZvICh0YWIsIHBhcmFtcykge1xuICBpZiAoIXBhcmFtcy5saWNlbnNlICYmICFwYXJhbXMucHJvZmlsZXMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGFiLmNyZWF0ZUZvb3RlcihcbiAgICAnPHA+VGhlIHNob3cgXCInICsgcGFyYW1zLnNob3cudGl0bGUgKyAnXCIgaXMgbGljZW5jZWQgdW5kZXI8YnI+JyArXG4gICAgICAnPGEgaHJlZj1cIicgKyBwYXJhbXMubGljZW5zZS51cmwgKyAnXCI+JyArIHBhcmFtcy5saWNlbnNlLm5hbWUgKyAnPC9hPicgK1xuICAgICc8L3A+J1xuICApLnByZXBlbmQoY3JlYXRlU29jaWFsSW5mbyhwYXJhbXMucHJvZmlsZXMpKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICogQHJldHVybnMge251bGx8VGFifSBpbmZvVGFiXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluZm9UYWIocGFyYW1zKSB7XG4gIGlmICghcGFyYW1zLnN1bW1hcnkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgaW5mb1RhYiA9IG5ldyBUYWIoe1xuICAgIGljb246ICdwd3AtaW5mbycsXG4gICAgdGl0bGU6ICdNb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoaXMnLFxuICAgIGhlYWRsaW5lOiAnSW5mbycsXG4gICAgbmFtZTogJ2luZm8nXG4gIH0pO1xuXG4gIGNyZWF0ZUVwaXNvZGVJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG4gIGNyZWF0ZVNob3dJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG4gIGNyZWF0ZVNvY2lhbEFuZExpY2Vuc2VJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG5cbiAgcmV0dXJuIGluZm9UYWI7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBJbmZvKHBhcmFtcykge1xuICB0aGlzLnRhYiA9IGNyZWF0ZUluZm9UYWIocGFyYW1zKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmZvO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvaW5mby5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciB0YyA9IHJlcXVpcmUoJy4uL3RpbWVjb2RlJyk7XG52YXIgY2FwID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNhcDtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIENyZWF0ZXMgYSBuZXcgcHJvZ3Jlc3MgYmFyIG9iamVjdC5cbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lIC0gVGhlIHBsYXllcnMgdGltZWxpbmUgdG8gYXR0YWNoIHRvLlxuICovXG5mdW5jdGlvbiBQcm9ncmVzc0Jhcih0aW1lbGluZSkge1xuICBpZiAoIXRpbWVsaW5lKSB7XG4gICAgY29uc29sZS5lcnJvcignVGltZWxpbmUgbWlzc2luZycsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5kdXJhdGlvbiA9IHRpbWVsaW5lLmR1cmF0aW9uO1xuXG4gIHRoaXMuYmFyID0gbnVsbDtcbiAgdGhpcy5jdXJyZW50VGltZSA9IG51bGw7XG5cbiAgaWYgKHRpbWVsaW5lLmhhc0NoYXB0ZXJzKSB7XG4gICAgLy8gRklYTUUgZ2V0IGFjY2VzcyB0byBjaGFwdGVyTW9kdWxlIHJlbGlhYmx5XG4gICAgLy8gdGhpcy50aW1lbGluZS5nZXRNb2R1bGUoJ2NoYXB0ZXJzJylcbiAgICB0aGlzLmNoYXB0ZXJNb2R1bGUgPSB0aGlzLnRpbWVsaW5lLm1vZHVsZXNbMF07XG4gICAgdGhpcy5jaGFwdGVyQmFkZ2UgPSBudWxsO1xuICAgIHRoaXMuY2hhcHRlclRpdGxlID0gbnVsbDtcbiAgfVxuXG4gIHRoaXMuc2hvd0R1cmF0aW9uID0gZmFsc2U7XG4gIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xuICB0aGlzLmJ1ZmZlciA9IG51bGw7XG4gIHRoaXMudXBkYXRlID0gX3VwZGF0ZS5iaW5kKHRoaXMpO1xufVxuXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUuc2V0SGFuZGxlUG9zaXRpb24gPSBmdW5jdGlvbiAodGltZSkge1xuICB2YXIgcGVyY2VudCA9IHRpbWUgLyB0aGlzLmR1cmF0aW9uICogMTAwO1xuICB2YXIgbmV3TGVmdE9mZnNldCA9IHBlcmNlbnQgKyAnJSc7XG4gIGNvbnNvbGUuZGVidWcoJ1Byb2dyZXNzQmFyJywgJ3NldEhhbmRsZVBvc2l0aW9uJywgJ3RpbWUnLCB0aW1lLCAnbmV3TGVmdE9mZnNldCcsIG5ld0xlZnRPZmZzZXQpO1xuICB0aGlzLmhhbmRsZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0T2Zmc2V0KTtcbn07XG5cbi8qKlxuICogc2V0IHByb2dyZXNzIGJhciB2YWx1ZSwgc2xpZGVyIHBvc2l0aW9uIGFuZCBjdXJyZW50IHRpbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIHRoaXMucHJvZ3Jlc3MudmFsKHRpbWUpO1xuICB0aGlzLnNldEhhbmRsZVBvc2l0aW9uKHRpbWUpO1xuICB1cGRhdGVUaW1lcyh0aGlzKTtcbn07XG5cbi8qKlxuICogc2V0IGNoYXB0ZXIgdGl0bGUgYW5kIGJhZGdlXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY2hhcHRlck1vZHVsZSkgeyByZXR1cm47IH1cblxuICB2YXIgaW5kZXggPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXI7XG4gIHZhciBjaGFwdGVyID0gdGhpcy5jaGFwdGVyTW9kdWxlLmNoYXB0ZXJzW2luZGV4XTtcbiAgdGhpcy5jaGFwdGVyQmFkZ2UudGV4dChpbmRleCArIDEpO1xuICB0aGlzLmNoYXB0ZXJUaXRsZS50ZXh0KGNoYXB0ZXIudGl0bGUpO1xufTtcblxuLyoqXG4gKiBUaGlzIHVwZGF0ZSBtZXRob2QgaXMgdG8gYmUgY2FsbGVkIHdoZW4gYSBwbGF5ZXJzIGBjdXJyZW50VGltZWAgY2hhbmdlcy5cbiAqL1xuZnVuY3Rpb24gX3VwZGF0ZSAodGltZWxpbmUpIHtcbiAgdGhpcy5zZXRQcm9ncmVzcyh0aW1lbGluZS5nZXRUaW1lKCkpO1xuICB0aGlzLmJ1ZmZlci52YWwodGltZWxpbmUuZ2V0QnVmZmVyZWQoKSk7XG4gIHRoaXMuc2V0Q2hhcHRlcigpO1xufVxuXG4vKipcbiAqIFJlbmRlcnMgYSBuZXcgcHJvZ3Jlc3MgYmFyIGpRdWVyeSBvYmplY3QuXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gdGltZSBlbGVtZW50c1xuICB2YXIgaW5pdGlhbFRpbWUgPSB0Yy5mcm9tVGltZVN0YW1wKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgdGhpcy5jdXJyZW50VGltZSA9IHJlbmRlclRpbWVFbGVtZW50KCdjdXJyZW50JywgaW5pdGlhbFRpbWUpO1xuICB0aGlzLmR1cmF0aW9uVGltZUVsZW1lbnQgPSByZW5kZXJEdXJhdGlvblRpbWVFbGVtZW50KHRoaXMpO1xuXG4gIC8vIHByb2dyZXNzIGluZm9cbiAgdmFyIHByb2dyZXNzSW5mbyA9IHJlbmRlclByb2dyZXNzSW5mbyh0aGlzKTtcbiAgdXBkYXRlVGltZXModGhpcyk7XG5cbiAgLy8gdGltZWxpbmUgYW5kIGJ1ZmZlciBiYXJzXG4gIHZhciBwcm9ncmVzcyA9ICQoJzxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiPjwvZGl2PicpO1xuICB2YXIgdGltZWxpbmVCYXIgPSAkKCc8cHJvZ3Jlc3MgY2xhc3M9XCJjdXJyZW50XCI+PC9wcm9ncmVzcz4nKVxuICAgICAgLmF0dHIoeyBtaW46IDAsIG1heDogdGhpcy5kdXJhdGlvbn0pO1xuICB2YXIgYnVmZmVyID0gJCgnPHByb2dyZXNzIGNsYXNzPVwiYnVmZmVyXCI+PC9wcm9ncmVzcz4nKVxuICAgICAgLmF0dHIoe21pbjogMCwgbWF4OiB0aGlzLmR1cmF0aW9ufSlcbiAgICAgIC5jc3Moe2hlaWdodDogJzFweCd9KTsgLy8gVE9ETyBtb3ZlIGhlaWdodCBkZWNsYXJhdGlvbiB0byBTQVNTXG4gIHZhciBoYW5kbGUgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlXCI+PGRpdiBjbGFzcz1cImlubmVyLWhhbmRsZVwiPjwvZGl2PjwvZGl2PicpO1xuXG4gIHByb2dyZXNzXG4gICAgLmFwcGVuZCh0aW1lbGluZUJhcilcbiAgICAuYXBwZW5kKGJ1ZmZlcilcbiAgICAuYXBwZW5kKGhhbmRsZSk7XG5cbiAgdGhpcy5wcm9ncmVzcyA9IHRpbWVsaW5lQmFyO1xuICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgdGhpcy5oYW5kbGUgPSBoYW5kbGU7XG4gIHRoaXMuc2V0UHJvZ3Jlc3ModGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuXG4gIGlmICh0aGlzLmNoYXB0ZXJNb2R1bGUpIHtcbiAgICB2YXIgY2hhcHRlck1hcmtlcnMgPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY2hhcHRlcnMubWFwKHJlbmRlckNoYXB0ZXJNYXJrZXIsIHRoaXMpO1xuICAgIGNoYXB0ZXJNYXJrZXJzLnNoaWZ0KCk7IC8vIHJlbW92ZSBmaXJzdCBvbmVcbiAgICBwcm9ncmVzcy5hcHBlbmQoY2hhcHRlck1hcmtlcnMpO1xuICB9XG5cbiAgLy8gcHJvZ3Jlc3MgYmFyXG4gIHZhciBiYXIgPSAkKCc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NiYXJcIj48L2Rpdj4nKTtcbiAgYmFyXG4gICAgLmFwcGVuZChwcm9ncmVzc0luZm8pXG4gICAgLmFwcGVuZChwcm9ncmVzcyk7XG5cbiAgdGhpcy5iYXIgPSBiYXI7XG4gIHJldHVybiBiYXI7XG59O1xuXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUuYWRkRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtb3VzZUlzRG93biA9IGZhbHNlO1xuICB2YXIgdGltZWxpbmUgPSB0aGlzLnRpbWVsaW5lO1xuICB2YXIgcHJvZ3Jlc3MgPSB0aGlzLnByb2dyZXNzO1xuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZU5ld1RpbWUgKHBhZ2VYKSB7XG4gICAgLy8gbW91c2UgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIG9iamVjdFxuICAgIHZhciB3aWR0aCA9IHByb2dyZXNzLm91dGVyV2lkdGgodHJ1ZSk7XG4gICAgdmFyIG9mZnNldCA9IHByb2dyZXNzLm9mZnNldCgpO1xuICAgIHZhciBwb3MgPSBjYXAocGFnZVggLSBvZmZzZXQubGVmdCwgMCwgd2lkdGgpO1xuICAgIHZhciBwZXJjZW50YWdlID0gKHBvcyAvIHdpZHRoKTtcbiAgICByZXR1cm4gcGVyY2VudGFnZSAqIHRpbWVsaW5lLmR1cmF0aW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VVcCAoKSB7XG4gICAgbW91c2VJc0Rvd24gPSBmYWxzZTtcbiAgICB0aW1lbGluZS5zZWVrRW5kKCk7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC51bmJpbmQoJ3RvdWNoZW5kLmR1cicpXG4gICAgICAudW5iaW5kKCdtb3VzZXVwLmR1cicpXG4gICAgICAudW5iaW5kKCd0b3VjaG1vdmUuZHVyJylcbiAgICAgIC51bmJpbmQoJ21vdXNlbW92ZS5kdXInKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlRG93biAoZXZlbnQpIHtcbiAgICAvLyBvbmx5IGhhbmRsZSBsZWZ0IGNsaWNrc1xuICAgIGlmIChldmVudC53aGljaCAhPT0gMSkgeyByZXR1cm47IH1cblxuICAgIG1vdXNlSXNEb3duID0gdHJ1ZTtcbiAgICBoYW5kbGVNb3VzZU1vdmUoZXZlbnQpO1xuICAgIHNlZWtTdGFydCgpO1xuICAgICQoZG9jdW1lbnQpXG4gICAgICAuYmluZCgnbW91c2V1cC5kdXInLCBoYW5kbGVNb3VzZVVwKVxuICAgICAgLmJpbmQoJ3RvdWNoZW5kLmR1cicsIGhhbmRsZU1vdXNlVXApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2Vla1N0YXJ0ICgpIHtcbiAgICB0aW1lbGluZS5zZWVrU3RhcnQoKTtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLmJpbmQoJ21vdXNlbW92ZS5kdXInLCBoYW5kbGVNb3VzZU1vdmUpXG4gICAgICAuYmluZCgndG91Y2htb3ZlLmR1cicsIGhhbmRsZU1vdXNlTW92ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZU1vdmUgKGV2ZW50KSB7XG4gICAgaWYgKHR5cGVvZiB0aW1lbGluZS5kdXJhdGlvbiAhPT0gJ251bWJlcicgfHwgIW1vdXNlSXNEb3duICkgeyByZXR1cm47IH1cbiAgICB2YXIgbmV3VGltZSA9IGNhbGN1bGF0ZU5ld1RpbWUoZXZlbnQucGFnZVgpO1xuICAgIGlmIChuZXdUaW1lID09PSB0aW1lbGluZS5nZXRUaW1lKCkpIHsgcmV0dXJuOyB9XG4gICAgdGltZWxpbmUuc2VlayhuZXdUaW1lKTtcbiAgfVxuXG4gIC8vIGhhbmRsZSBjbGljayBhbmQgZHJhZyB3aXRoIG1vdXNlIG9yIHRvdWNoIGluIHByb2dyZXNzYmFyIGFuZCBvbiBoYW5kbGVcbiAgdGhpcy5wcm9ncmVzc1xuICAgIC5iaW5kKCd0b3VjaHN0YXJ0JywgaGFuZGxlTW91c2VEb3duKVxuICAgIC5iaW5kKCdtb3VzZWRvd24nLCBoYW5kbGVNb3VzZURvd24pO1xuXG4gIHRoaXMuaGFuZGxlXG4gICAgLmJpbmQoJ3RvdWNoc3RhcnQnLCBoYW5kbGVNb3VzZURvd24pXG4gICAgLmJpbmQoJ21vdXNlZG93bicsIGhhbmRsZU1vdXNlRG93bik7XG59O1xuXG5mdW5jdGlvbiByZW5kZXJQcm9ncmVzc0luZm8ocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIHByb2dyZXNzSW5mbyA9ICQoJzxkaXYgY2xhc3M9XCJwcm9ncmVzcy1pbmZvXCI+PC9kaXY+Jyk7XG5cbiAgcmV0dXJuIHByb2dyZXNzSW5mb1xuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIuY3VycmVudFRpbWUpXG4gICAgLmFwcGVuZChyZW5kZXJDdXJyZW50Q2hhcHRlckVsZW1lbnQuY2FsbChwcm9ncmVzc0JhcikpXG4gICAgLmFwcGVuZChwcm9ncmVzc0Jhci5kdXJhdGlvblRpbWVFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVGltZUVsZW1lbnQoY2xhc3NOYW1lLCB0aW1lKSB7XG4gIHJldHVybiAkKCc8ZGl2IGNsYXNzPVwidGltZSB0aW1lLScgKyBjbGFzc05hbWUgKyAnXCI+JyArIHRpbWUgKyAnPC9kaXY+Jyk7XG59XG5cbi8qKlxuICogUmVuZGVyIGFuIEhUTUwgRWxlbWVudCBmb3IgdGhlIGN1cnJlbnQgY2hhcHRlclxuICogQHJldHVybnMge2pRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVuZGVyQ3VycmVudENoYXB0ZXJFbGVtZW50KCkge1xuICB2YXIgY2hhcHRlckVsZW1lbnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2hhcHRlclwiPjwvZGl2PicpO1xuXG4gIGlmICghdGhpcy5jaGFwdGVyTW9kdWxlKSB7XG4gICAgcmV0dXJuIGNoYXB0ZXJFbGVtZW50O1xuICB9XG5cbiAgdmFyIGluZGV4ID0gdGhpcy5jaGFwdGVyTW9kdWxlLmN1cnJlbnRDaGFwdGVyO1xuICB2YXIgY2hhcHRlciA9IHRoaXMuY2hhcHRlck1vZHVsZS5jaGFwdGVyc1tpbmRleF07XG4gIGNvbnNvbGUuZGVidWcoJ1Byb2dyZXNzYmFyJywgJ3JlbmRlckN1cnJlbnRDaGFwdGVyRWxlbWVudCcsIGluZGV4LCBjaGFwdGVyKTtcblxuICB0aGlzLmNoYXB0ZXJCYWRnZSA9ICQoJzxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4nICsgKGluZGV4ICsgMSkgKyAnPC9zcGFuPicpO1xuICB0aGlzLmNoYXB0ZXJUaXRsZSA9ICQoJzxzcGFuIGNsYXNzPVwiY2hhcHRlci10aXRsZVwiPicgKyBjaGFwdGVyLnRpdGxlICsgJzwvc3Bhbj4nKTtcblxuICBjaGFwdGVyRWxlbWVudFxuICAgIC5hcHBlbmQodGhpcy5jaGFwdGVyQmFkZ2UpXG4gICAgLmFwcGVuZCh0aGlzLmNoYXB0ZXJUaXRsZSk7XG5cbiAgcmV0dXJuIGNoYXB0ZXJFbGVtZW50O1xufVxuXG5mdW5jdGlvbiByZW5kZXJEdXJhdGlvblRpbWVFbGVtZW50KHByb2dyZXNzQmFyKSB7XG4gIHZhciBmb3JtYXR0ZWREdXJhdGlvbiA9IHRjLmZyb21UaW1lU3RhbXAocHJvZ3Jlc3NCYXIuZHVyYXRpb24pO1xuICB2YXIgZHVyYXRpb25UaW1lRWxlbWVudCA9IHJlbmRlclRpbWVFbGVtZW50KCdkdXJhdGlvbicsIDApO1xuXG4gIGR1cmF0aW9uVGltZUVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHByb2dyZXNzQmFyLnNob3dEdXJhdGlvbiA9ICFwcm9ncmVzc0Jhci5zaG93RHVyYXRpb247XG4gICAgaWYgKHByb2dyZXNzQmFyLnNob3dEdXJhdGlvbikge1xuICAgICAgZHVyYXRpb25UaW1lRWxlbWVudC50ZXh0KGZvcm1hdHRlZER1cmF0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdXBkYXRlVGltZXMocHJvZ3Jlc3NCYXIpO1xuICB9KTtcblxuICByZXR1cm4gZHVyYXRpb25UaW1lRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVGltZXMocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIHRpbWUgPSBwcm9ncmVzc0Jhci50aW1lbGluZS5nZXRUaW1lKCk7XG4gIHByb2dyZXNzQmFyLmN1cnJlbnRUaW1lLmh0bWwodGMuZnJvbVRpbWVTdGFtcCh0aW1lKSk7XG5cbiAgaWYgKHByb2dyZXNzQmFyLnNob3dEdXJhdGlvbikgeyByZXR1cm47IH1cblxuICB2YXIgcmVtYWluaW5nVGltZSA9IE1hdGguYWJzKHRpbWUgLSBwcm9ncmVzc0Jhci5kdXJhdGlvbik7XG4gIHByb2dyZXNzQmFyLmR1cmF0aW9uVGltZUVsZW1lbnQudGV4dCgnLScgKyB0Yy5mcm9tVGltZVN0YW1wKHJlbWFpbmluZ1RpbWUpKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2hhcHRlck1hcmtlcihjaGFwdGVyKSB7XG4gIHJldHVybiByZW5kZXJNYXJrZXJBdC5jYWxsKHRoaXMsIGNoYXB0ZXIuc3RhcnQpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJNYXJrZXJBdCh0aW1lKSB7XG4gIHZhciBwZXJjZW50ID0gMTAwICogdGltZSAvIHRoaXMuZHVyYXRpb247XG4gIHJldHVybiAkKCc8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJsZWZ0OicgKyBwZXJjZW50ICsgJyU7XCI+PC9kaXY+Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZ3Jlc3NCYXI7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9wcm9ncmVzc2Jhci5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU2F2aW5nIHRoZSBwbGF5dGltZVxuICovXG52YXIgcHJlZml4ID0gJ3BvZGxvdmUtd2ViLXBsYXllci1wbGF5dGltZS0nO1xuXG5mdW5jdGlvbiBnZXRJdGVtICgpIHtcbiAgcmV0dXJuICtsb2NhbFN0b3JhZ2VbdGhpcy5rZXldO1xufVxuXG5mdW5jdGlvbiByZW1vdmVJdGVtICgpIHtcbiAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMua2V5KTtcbn1cblxuZnVuY3Rpb24gaGFzSXRlbSAoKSB7XG4gIHJldHVybiAodGhpcy5rZXkpIGluIGxvY2FsU3RvcmFnZTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlICgpIHtcbiAgY29uc29sZS5kZWJ1ZygnU2F2ZVRpbWUnLCAndXBkYXRlJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICB0aGlzLnNldEl0ZW0odGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xufVxuXG5mdW5jdGlvbiBTYXZlVGltZSh0aW1lbGluZSwgcGFyYW1zKSB7XG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5rZXkgPSBwcmVmaXggKyBwYXJhbXMucGVybWFsaW5rO1xuICB0aGlzLmdldEl0ZW0gPSBnZXRJdGVtLmJpbmQodGhpcyk7XG4gIHRoaXMucmVtb3ZlSXRlbSA9IHJlbW92ZUl0ZW0uYmluZCh0aGlzKTtcbiAgdGhpcy5oYXNJdGVtID0gaGFzSXRlbS5iaW5kKHRoaXMpO1xuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xuXG4gIC8vIHNldCB0aGUgdGltZSBvbiBzdGFydFxuICBpZiAodGhpcy5oYXNJdGVtKCkpIHtcbiAgICB0aW1lbGluZS5zZXRUaW1lKHRoaXMuZ2V0SXRlbSgpKTtcbiAgfVxufVxuXG5TYXZlVGltZS5wcm90b3R5cGUuc2V0SXRlbSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBsb2NhbFN0b3JhZ2VbdGhpcy5rZXldID0gdmFsdWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVUaW1lO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvc2F2ZXRpbWUuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGFiID0gcmVxdWlyZSgnLi4vdGFiJylcbiAgLCBTb2NpYWxCdXR0b25MaXN0ID0gcmVxdWlyZSgnLi4vc29jaWFsLWJ1dHRvbi1saXN0Jyk7XG5cbnZhciBzZXJ2aWNlcyA9IFsndHdpdHRlcicsICdmYWNlYm9vaycsICdncGx1cycsICd0dW1ibHInLCAnZW1haWwnXVxuICAsIHNoYXJlT3B0aW9ucyA9IFtcbiAgICB7bmFtZTogJ1Nob3cnLCB2YWx1ZTogJ3Nob3cnfSxcbiAgICB7bmFtZTogJ0VwaXNvZGUnLCB2YWx1ZTogJ2VwaXNvZGUnLCBkZWZhdWx0OiB0cnVlfSxcbiAgICB7bmFtZTogJ0NoYXB0ZXInLCB2YWx1ZTogJ2NoYXB0ZXInLCBkaXNhYmxlZDogdHJ1ZX0sXG4gICAge25hbWU6ICdFeGFjdGx5IHRoaXMgcGFydCBoZXJlJywgdmFsdWU6ICd0aW1lZCcsIGRpc2FibGVkOiB0cnVlfVxuICBdXG4gICwgc2hhcmVEYXRhID0ge307XG5cbi8vIG1vZHVsZSBnbG9iYWxzXG52YXIgc2VsZWN0ZWRPcHRpb24sIHNoYXJlQnV0dG9ucywgbGlua0lucHV0O1xuXG5mdW5jdGlvbiBnZXRTaGFyZURhdGEodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB2YWx1ZSA9PT0gJ3Nob3cnID8gJ3Nob3cnIDogJ2VwaXNvZGUnO1xuICB2YXIgZGF0YSA9IHNoYXJlRGF0YVt0eXBlXTtcbiAgLy8gdG9kbyBhZGQgY2hhcHRlciBzdGFydCBhbmQgZW5kIHRpbWUgdG8gdXJsXG4gIC8vaWYgKHZhbHVlID09PSAnY2hhcHRlcicpIHtcbiAgLy99XG4gIC8vIHRvZG8gYWRkIHNlbGVjdGVkIHN0YXJ0IGFuZCBlbmQgdGltZSB0byB1cmxcbiAgLy9pZiAodmFsdWUgPT09ICd0aW1lZCcpIHtcbiAgLy99XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVVcmxzKGRhdGEpIHtcbiAgc2hhcmVCdXR0b25zLnVwZGF0ZShkYXRhKTtcbiAgbGlua0lucHV0LnVwZGF0ZShkYXRhKTtcbn1cblxuZnVuY3Rpb24gb25TaGFyZU9wdGlvbkNoYW5nZVRvIChlbGVtZW50LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IGdldFNoYXJlRGF0YSh2YWx1ZSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdzaGFyaW5nIG9wdGlvbnMgY2hhbmdlZCcsIHZhbHVlKTtcbiAgICBzZWxlY3RlZE9wdGlvbi5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICBlbGVtZW50LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIHNlbGVjdGVkT3B0aW9uID0gZWxlbWVudDtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVwZGF0ZVVybHMoZGF0YSk7XG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBodG1sIGRpdiBlbGVtZW50IGNvbnRhaW5pbmcgYW4gaW1hZ2VcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjcmVhdGVQb3N0ZXJGb3IodHlwZSkge1xuICB2YXIgZGF0YSA9IHNoYXJlRGF0YVt0eXBlXTtcbiAgaWYgKCF0eXBlIHx8ICFkYXRhIHx8ICFkYXRhLnBvc3Rlcikge1xuICAgIGNvbnNvbGUud2FybignY2Fubm90IGNyZWF0ZSBwb3N0ZXIgZm9yJywgdHlwZSk7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGNvbnNvbGUubG9nKCdjcmVhdGUgcG9zdGVyIGZvcicsIHR5cGUsICcgPiB1cmwnLCBkYXRhLnBvc3Rlcik7XG4gIHJldHVybiAnPGltZyBzcmM9XCInICsgZGF0YS5wb3N0ZXIgKyAnXCIgZGF0YS1pbWc9XCInICsgZGF0YS5wb3N0ZXIgKyAnXCIgYWx0PVwiUG9zdGVyIEltYWdlXCI+Jztcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIG9wdGlvblxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU9wdGlvbihvcHRpb24pIHtcbiAgaWYgKG9wdGlvbi5kaXNhYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKCdTaGFyZScsICdjcmVhdGVPcHRpb24nLCAnb21pdCBkaXNhYmxlZCBvcHRpb24nLCBvcHRpb24ubmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgZGF0YSA9IGdldFNoYXJlRGF0YShvcHRpb24udmFsdWUpO1xuXG4gIGlmICghZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCdTaGFyZScsICdjcmVhdGVPcHRpb24nLCAnb21pdCBvcHRpb24gd2l0aG91dCBkYXRhJywgb3B0aW9uLm5hbWUpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGVsZW1lbnQgPSAkKCc8ZGl2IGNsYXNzPVwic2hhcmUtc2VsZWN0LW9wdGlvblwiPicgKyBjcmVhdGVQb3N0ZXJGb3Iob3B0aW9uLnZhbHVlKSArXG4gICAgICAnPHNwYW4+U2hhcmUgdGhpcyAnICsgb3B0aW9uLm5hbWUgKyAnPC9zcGFuPicgK1xuICAgICc8L2Rpdj4nKTtcblxuICBpZiAob3B0aW9uLmRlZmF1bHQpIHtcbiAgICBzZWxlY3RlZE9wdGlvbiA9IGVsZW1lbnQ7XG4gICAgZWxlbWVudC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB1cGRhdGVVcmxzKGRhdGEpO1xuICB9XG4gIGVsZW1lbnQub24oJ2NsaWNrJywgb25TaGFyZU9wdGlvbkNoYW5nZVRvKGVsZW1lbnQsIG9wdGlvbi52YWx1ZSkpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGh0bWwgZGl2IGVsZW1lbnQgdG8gd3JhcCBhbGwgc2hhcmUgYnV0dG9uc1xuICogQHJldHVybnMge2pRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2hhcmVCdXR0b25XcmFwcGVyKCkge1xuICB2YXIgZGl2ID0gJCgnPGRpdiBjbGFzcz1cInNoYXJlLWJ1dHRvbi13cmFwcGVyXCI+PC9kaXY+Jyk7XG4gIGRpdi5hcHBlbmQoc2hhcmVPcHRpb25zLm1hcChjcmVhdGVPcHRpb24pKTtcblxuICByZXR1cm4gZGl2O1xufVxuXG4vKipcbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjcmVhdGVTaGFyZU9wdGlvbnMoKSB7XG4gIHZhciBmb3JtID0gJCgnPGZvcm0+JyArXG4gICAgJzxsZWdlbmQ+V2hhdCB3b3VsZCB5b3UgbGlrZSB0byBzaGFyZT88L2xlZ2VuZD4nICtcbiAgJzwvZm9ybT4nKTtcbiAgZm9ybS5hcHBlbmQoY3JlYXRlU2hhcmVCdXR0b25XcmFwcGVyKTtcbiAgcmV0dXJuIGZvcm07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGxheWVyIGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBjcmVhdGVTaGFyZVRhYihwYXJhbXMpIHtcbiAgaWYgKCFwYXJhbXMucGVybWFsaW5rIHx8IHBhcmFtcy5oaWRlc2hhcmVidXR0b24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBzaGFyZVRhYiA9IG5ldyBUYWIoe1xuICAgIGljb246ICdwd3Atc2hhcmUnLFxuICAgIHRpdGxlOiAnU2hvdy9oaWRlIHNoYXJpbmcgdGFicycsXG4gICAgbmFtZTogJ3BvZGxvdmV3ZWJwbGF5ZXJfc2hhcmUnLFxuICAgIGhlYWRsaW5lOiAnU2hhcmUnXG4gIH0pO1xuXG4gIHNoYXJlQnV0dG9ucyA9IG5ldyBTb2NpYWxCdXR0b25MaXN0KHNlcnZpY2VzLCBnZXRTaGFyZURhdGEoJ2VwaXNvZGUnKSk7XG4gIGxpbmtJbnB1dCA9ICQoJzxoMz5MaW5rPC9oMz4nICtcbiAgICAnPGlucHV0IHR5cGU9XCJ1cmxcIiBuYW1lPVwic2hhcmUtbGluay11cmxcIiByZWFkb25seT4nKTtcbiAgbGlua0lucHV0LnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnZhbChkYXRhLnJhd1VybCk7XG4gIH07XG5cbiAgc2hhcmVUYWIuY3JlYXRlTWFpbkNvbnRlbnQoJycpLmFwcGVuZChjcmVhdGVTaGFyZU9wdGlvbnMoKSk7XG4gIHNoYXJlVGFiLmNyZWF0ZUZvb3RlcignPGgzPlNoYXJlIHZpYSAuLi48L2gzPicpLmFwcGVuZChzaGFyZUJ1dHRvbnMubGlzdCkuYXBwZW5kKGxpbmtJbnB1dCk7XG5cbiAgcmV0dXJuIHNoYXJlVGFiO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNoYXJlKHBhcmFtcykge1xuICBzaGFyZURhdGEuZXBpc29kZSA9IHtcbiAgICBwb3N0ZXI6IHBhcmFtcy5wb3N0ZXIsXG4gICAgdGl0bGU6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMudGl0bGUpLFxuICAgIHVybDogZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5wZXJtYWxpbmspLFxuICAgIHJhd1VybDogcGFyYW1zLnBlcm1hbGluayxcbiAgICB0ZXh0OiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnRpdGxlICsgJyAnICsgcGFyYW1zLnBlcm1hbGluaylcbiAgfTtcbiAgc2hhcmVEYXRhLmNoYXB0ZXJzID0gcGFyYW1zLmNoYXB0ZXJzO1xuXG4gIGlmIChwYXJhbXMuc2hvdy51cmwpIHtcbiAgICBzaGFyZURhdGEuc2hvdyA9IHtcbiAgICAgIHBvc3RlcjogcGFyYW1zLnNob3cucG9zdGVyLFxuICAgICAgdGl0bGU6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuc2hvdy50aXRsZSksXG4gICAgICB1cmw6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuc2hvdy51cmwpLFxuICAgICAgcmF3VXJsOiBwYXJhbXMuc2hvdy51cmwsXG4gICAgICB0ZXh0OiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnNob3cudGl0bGUgKyAnICcgKyBwYXJhbXMuc2hvdy51cmwpXG4gICAgfTtcbiAgfVxuXG4gIHNlbGVjdGVkT3B0aW9uID0gJ2VwaXNvZGUnO1xuICB0aGlzLnRhYiA9IGNyZWF0ZVNoYXJlVGFiKHBhcmFtcyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvc2hhcmUuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIHBsYXllclxuICovXG52YXJcbi8vIEtlZXAgYWxsIFBsYXllcnMgb24gc2l0ZSAtIGZvciBpbmxpbmUgcGxheWVyc1xuLy8gZW1iZWRkZWQgcGxheWVycyBhcmUgcmVnaXN0ZXJlZCBpbiBwb2Rsb3ZlLXdlYnBsYXllci1tb2RlcmF0b3IgaW4gdGhlIGVtYmVkZGluZyBwYWdlXG4gIHBsYXllcnMgPSBbXSxcbi8vIGFsbCB1c2VkIGZ1bmN0aW9uc1xuICBlbWJlZCA9IHJlcXVpcmUoJy4vZW1iZWQnKSxcbiAgcGFyc2VUaW1lY29kZSA9IHJlcXVpcmUoJy4vdGltZWNvZGUnKS5wYXJzZSxcbiAgbWVqc29wdGlvbnMgPSB7XG4gICAgZGVmYXVsdFZpZGVvV2lkdGg6IDQ4MCxcbiAgICBkZWZhdWx0VmlkZW9IZWlnaHQ6IDI3MCxcbiAgICB2aWRlb1dpZHRoOiAtMSxcbiAgICB2aWRlb0hlaWdodDogLTEsXG4gICAgYXVkaW9XaWR0aDogLTEsXG4gICAgYXVkaW9IZWlnaHQ6IDMwLFxuICAgIHN0YXJ0Vm9sdW1lOiAwLjgsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgZW5hYmxlQXV0b3NpemU6IHRydWUsXG4gICAgZmVhdHVyZXM6IFsncGxheXBhdXNlJywgJ2N1cnJlbnQnLCAncHJvZ3Jlc3MnLCAnZHVyYXRpb24nLCAndHJhY2tzJywgJ2Z1bGxzY3JlZW4nXSxcbiAgICBhbHdheXNTaG93Q29udHJvbHM6IGZhbHNlLFxuICAgIGlQYWRVc2VOYXRpdmVDb250cm9sczogZmFsc2UsXG4gICAgaVBob25lVXNlTmF0aXZlQ29udHJvbHM6IGZhbHNlLFxuICAgIEFuZHJvaWRVc2VOYXRpdmVDb250cm9sczogZmFsc2UsXG4gICAgYWx3YXlzU2hvd0hvdXJzOiBmYWxzZSxcbiAgICBzaG93VGltZWNvZGVGcmFtZUNvdW50OiBmYWxzZSxcbiAgICBmcmFtZXNQZXJTZWNvbmQ6IDI1LFxuICAgIGVuYWJsZUtleWJvYXJkOiB0cnVlLFxuICAgIHBhdXNlT3RoZXJQbGF5ZXJzOiB0cnVlLFxuICAgIGR1cmF0aW9uOiBmYWxzZSxcbiAgICBwbHVnaW5zOiBbJ2ZsYXNoJywgJ3NpbHZlcmxpZ2h0J10sXG4gICAgcGx1Z2luUGF0aDogJy4vYmluLycsXG4gICAgZmxhc2hOYW1lOiAnZmxhc2htZWRpYWVsZW1lbnQuc3dmJyxcbiAgICBzaWx2ZXJsaWdodE5hbWU6ICdzaWx2ZXJsaWdodG1lZGlhZWxlbWVudC54YXAnXG4gIH0sXG4gIGRlZmF1bHRzID0ge1xuICAgIGNoYXB0ZXJsaW5rczogJ2FsbCcsXG4gICAgd2lkdGg6ICcxMDAlJyxcbiAgICBkdXJhdGlvbjogZmFsc2UsXG4gICAgY2hhcHRlcnNWaXNpYmxlOiBmYWxzZSxcbiAgICB0aW1lY29udHJvbHNWaXNpYmxlOiBmYWxzZSxcbiAgICBzaGFyZWJ1dHRvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICBkb3dubG9hZGJ1dHRvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICBzdW1tYXJ5VmlzaWJsZTogZmFsc2UsXG4gICAgaGlkZXRpbWVidXR0b246IGZhbHNlLFxuICAgIGhpZGVkb3dubG9hZGJ1dHRvbjogZmFsc2UsXG4gICAgaGlkZXNoYXJlYnV0dG9uOiBmYWxzZSxcbiAgICBzaGFyZXdob2xlZXBpc29kZTogZmFsc2UsXG4gICAgc291cmNlczogW11cbiAgfTtcblxuZnVuY3Rpb24gY3JlYXRlKHBsYXllciwgcGFyYW1zLCBjYWxsYmFjaykge1xuICB2YXIganFQbGF5ZXIsXG4gICAgcGxheWVyVHlwZSA9IGdldFBsYXllclR5cGUocGxheWVyKSxcbiAgICBzZWNBcnJheSxcbiAgICB3cmFwcGVyO1xuXG4gIGpxUGxheWVyID0gJChwbGF5ZXIpO1xuICB3cmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPjwvZGl2PicpO1xuICBqcVBsYXllci5yZXBsYWNlV2l0aCh3cmFwcGVyKTtcblxuICAvL2ZpbmUgdHVuaW5nIHBhcmFtc1xuICBwYXJhbXMud2lkdGggPSBub3JtYWxpemVXaWR0aChwYXJhbXMud2lkdGgpO1xuICBpZiAocGxheWVyVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgIC8vIEZJWE1FOiBTaW5jZSB0aGUgcGxheWVyIGlzIG5vIGxvbmdlciB2aXNpYmxlIGl0IGhhcyBubyB3aWR0aFxuICAgIGlmIChwYXJhbXMuYXVkaW9XaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbXMud2lkdGggPSBwYXJhbXMuYXVkaW9XaWR0aDtcbiAgICB9XG4gICAgbWVqc29wdGlvbnMuYXVkaW9XaWR0aCA9IHBhcmFtcy53aWR0aDtcbiAgICAvL2tpbGwgZnVsbHNjcmVlbiBidXR0b25cbiAgICAkLmVhY2gobWVqc29wdGlvbnMuZmVhdHVyZXMsIGZ1bmN0aW9uIChpKSB7XG4gICAgICBpZiAodGhpcyA9PT0gJ2Z1bGxzY3JlZW4nKSB7XG4gICAgICAgIG1lanNvcHRpb25zLmZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZW1vdmVQbGF5UGF1c2UobWVqc29wdGlvbnMpO1xuICB9XG4gIGVsc2UgaWYgKHBsYXllclR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAvL3ZpZGVvIHBhcmFtc1xuICAgIGlmIChmYWxzZSAmJiBwYXJhbXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1lanNvcHRpb25zLnZpZGVvV2lkdGggPSBwYXJhbXMud2lkdGg7XG4gICAgICBtZWpzb3B0aW9ucy52aWRlb0hlaWdodCA9IHBhcmFtcy5oZWlnaHQ7XG4gICAgfVxuICAgIC8vIEZJWE1FXG4gICAgaWYgKGZhbHNlICYmICQocGxheWVyKS5hdHRyKCd3aWR0aCcpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhcmFtcy53aWR0aCA9ICQocGxheWVyKS5hdHRyKCd3aWR0aCcpO1xuICAgIH1cbiAgfVxuXG4gIC8vZHVyYXRpb24gY2FuIGJlIGdpdmVuIGluIHNlY29uZHMgb3IgaW4gTlBUIGZvcm1hdFxuICBpZiAocGFyYW1zLmR1cmF0aW9uICYmIHBhcmFtcy5kdXJhdGlvbiAhPT0gcGFyc2VJbnQocGFyYW1zLmR1cmF0aW9uLCAxMCkpIHtcbiAgICBzZWNBcnJheSA9IHBhcnNlVGltZWNvZGUocGFyYW1zLmR1cmF0aW9uKTtcbiAgICBwYXJhbXMuZHVyYXRpb24gPSBzZWNBcnJheVswXTtcbiAgfVxuXG4gIC8vT3ZlcndyaXRlIE1FSlMgZGVmYXVsdCB2YWx1ZXMgd2l0aCBhY3R1YWwgZGF0YVxuICAkLmVhY2gobWVqc29wdGlvbnMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5IGluIHBhcmFtcykge1xuICAgICAgbWVqc29wdGlvbnNba2V5XSA9IHBhcmFtc1trZXldO1xuICAgIH1cbiAgfSk7XG5cbiAgLy93cmFwcGVyIGFuZCBpbml0IHN0dWZmXG4gIC8vIEZJWE1FOiBiZXR0ZXIgY2hlY2sgZm9yIG51bWVyaWNhbCB2YWx1ZVxuICBpZiAocGFyYW1zLndpZHRoLnRvU3RyaW5nKCkudHJpbSgpID09PSBwYXJzZUludChwYXJhbXMud2lkdGgsIDEwKS50b1N0cmluZygpKSB7XG4gICAgcGFyYW1zLndpZHRoID0gcGFyc2VJbnQocGFyYW1zLndpZHRoLCAxMCkgKyAncHgnO1xuICB9XG5cbiAgcGxheWVycy5wdXNoKHBsYXllcik7XG5cbiAgLy9hZGQgcGFyYW1zIGZyb20gYXVkaW8gYW5kIHZpZGVvIGVsZW1lbnRzXG4gIGpxUGxheWVyLmZpbmQoJ3NvdXJjZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgIGlmICghcGFyYW1zLnNvdXJjZXMpIHtcbiAgICAgIHBhcmFtcy5zb3VyY2VzID0gW107XG4gICAgfVxuICAgIHBhcmFtcy5zb3VyY2VzLnB1c2goJCh0aGlzKS5hdHRyKCdzcmMnKSk7XG4gIH0pO1xuXG4gIHBhcmFtcy50eXBlID0gcGxheWVyVHlwZTtcbiAgLy8gaW5pdCBNRUpTIHRvIHBsYXllclxuICBtZWpzb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24gKHBsYXllcikge1xuICAgIGpxUGxheWVyLm9uKCdlcnJvcicsIHJlbW92ZVVucGxheWFibGVNZWRpYSk7ICAgLy8gVGhpcyBtaWdodCBiZSBhIGZpeCB0byBzb21lIEZpcmVmb3ggQUFDIGlzc3Vlcy5cbiAgICBjYWxsYmFjayhwbGF5ZXIsIHBhcmFtcywgd3JhcHBlcik7XG4gIH07XG4gIHZhciBtZSA9IG5ldyBNZWRpYUVsZW1lbnQocGxheWVyLCBtZWpzb3B0aW9ucyk7XG4gIGNvbnNvbGUubG9nKG1lKTtcbn1cblxuLyoqXG4gKiByZW1vdmUgJ3B4JyB1bml0LCBzZXQgd2l0ZHRoIHRvIDEwMCUgZm9yICdhdXRvJ1xuICogQHBhcmFtIHtzdHJpbmd9IHdpZHRoXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVXaWR0aCh3aWR0aCkge1xuICBpZiAod2lkdGgudG9Mb3dlckNhc2UoKSA9PT0gJ2F1dG8nKSB7XG4gICAgcmV0dXJuICcxMDAlJztcbiAgfVxuICByZXR1cm4gd2lkdGgucmVwbGFjZSgncHgnLCAnJyk7XG59XG5cbi8qKlxuICogYXVkaW8gb3IgdmlkZW8gdGFnXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwbGF5ZXJcbiAqIEByZXR1cm5zIHtzdHJpbmd9ICdhdWRpbycgfCAndmlkZW8nXG4gKi9cbmZ1bmN0aW9uIGdldFBsYXllclR5cGUgKHBsYXllcikge1xuICByZXR1cm4gcGxheWVyLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBraWxsIHBsYXkvcGF1c2UgYnV0dG9uIGZyb20gbWluaXBsYXllclxuICogQHBhcmFtIG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlUGxheVBhdXNlKG9wdGlvbnMpIHtcbiAgJC5lYWNoKG9wdGlvbnMuZmVhdHVyZXMsIGZ1bmN0aW9uIChpKSB7XG4gICAgaWYgKHRoaXMgPT09ICdwbGF5cGF1c2UnKSB7XG4gICAgICBvcHRpb25zLmZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIHBsYXllciBlcnJvciBoYW5kbGluZyBmdW5jdGlvblxuICogd2lsbCByZW1vdmUgdGhlIHRvcG1vc3QgbWVkaWFmaWxlIGZyb20gc3JjIG9yIHNvdXJjZSBsaXN0XG4gKiBwb3NzaWJsZSBmaXggZm9yIEZpcmVmb3ggQUFDIGlzc3Vlc1xuICovXG5mdW5jdGlvbiByZW1vdmVVbnBsYXlhYmxlTWVkaWEoKSB7XG4gIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gIGlmICgkdGhpcy5hdHRyKCdzcmMnKSkge1xuICAgICR0aGlzLnJlbW92ZUF0dHIoJ3NyYycpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgc291cmNlTGlzdCA9ICR0aGlzLmNoaWxkcmVuKCdzb3VyY2UnKTtcbiAgaWYgKHNvdXJjZUxpc3QubGVuZ3RoKSB7XG4gICAgc291cmNlTGlzdC5maXJzdCgpLnJlbW92ZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGNyZWF0ZSxcbiAgZGVmYXVsdHM6IGRlZmF1bHRzLFxuICBwbGF5ZXJzOiBwbGF5ZXJzXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3BsYXllci5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIHNlcnZpY2VzID0gcmVxdWlyZSgnLi9zb2NpYWwtbmV0d29ya3MnKTtcblxuZnVuY3Rpb24gU29jaWFsQnV0dG9uTGlzdCAoc2VydmljZXMsIG9wdGlvbnMpIHtcbiAgdmFyIGNyZWF0ZUJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbldpdGgob3B0aW9ucyk7XG4gIHRoaXMuYnV0dG9ucyA9IHNlcnZpY2VzLm1hcChjcmVhdGVCdXR0b24pO1xuXG4gIHRoaXMubGlzdCA9ICQoJzx1bD48L3VsPicpO1xuICB0aGlzLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgdmFyIGxpc3RFbGVtZW50ID0gJCgnPGxpPjwvbGk+JykuYXBwZW5kKGJ1dHRvbi5lbGVtZW50KTtcbiAgICB0aGlzLmxpc3QuYXBwZW5kKGxpc3RFbGVtZW50KTtcbiAgfSwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbldpdGgob3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24gKHNlcnZpY2VOYW1lKSB7XG4gICAgdmFyIHNlcnZpY2UgPSBzZXJ2aWNlcy5nZXQoc2VydmljZU5hbWUpO1xuICAgIHJldHVybiBzZXJ2aWNlLmdldEJ1dHRvbihvcHRpb25zKTtcbiAgfTtcbn1cblxuU29jaWFsQnV0dG9uTGlzdC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdGhpcy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgIGJ1dHRvbi51cGRhdGVVcmwob3B0aW9ucyk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb2NpYWxCdXR0b25MaXN0O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NvY2lhbC1idXR0b24tbGlzdC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU29jaWFsTmV0d29yayAob3B0aW9ucykge1xuICB0aGlzLmljb24gPSBvcHRpb25zLmljb247XG4gIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICB0aGlzLnVybCA9IG9wdGlvbnMucHJvZmlsZVVybDtcbiAgdGhpcy5zaGFyZVVybCA9IG9wdGlvbnMuc2hhcmVVcmw7XG59XG5cbi8qKlxuICogYnVpbGQgVVJMIGZvciBzaGFyaW5nIGEgdGV4dCwgYSB0aXRsZSBhbmQgYSB1cmxcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRTaGFyZVVybCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBzaGFyZVVybCA9IHRoaXMuc2hhcmVVcmxcbiAgICAucmVwbGFjZSgnJHRleHQkJywgb3B0aW9ucy50ZXh0KVxuICAgIC5yZXBsYWNlKCckdGl0bGUkJywgb3B0aW9ucy50aXRsZSlcbiAgICAucmVwbGFjZSgnJHVybCQnLCBvcHRpb25zLnVybCk7XG4gIHJldHVybiB0aGlzLnVybCArIHNoYXJlVXJsO1xufTtcblxuLyoqXG4gKiBidWlsZCBVUkwgdG8gYSBnaXZlbiBwcm9maWxlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0UHJvZmlsZVVybCA9IGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gIHJldHVybiB0aGlzLnVybCArIHByb2ZpbGU7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRQcm9maWxlQnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zLnByb2ZpbGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGNyZWF0ZUJ1dHRvbih7XG4gICAgICB1cmw6IHRoaXMuZ2V0UHJvZmlsZVVybChvcHRpb25zLnByb2ZpbGUpLFxuICAgICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgICBpY29uOiB0aGlzLmljb25cbiAgICB9KVxuICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0U2hhcmVCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gIGlmICghdGhpcy5zaGFyZVVybCB8fCAhb3B0aW9ucy50aXRsZSB8fCAhb3B0aW9ucy51cmwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy50ZXh0KSB7XG4gICAgb3B0aW9ucy50ZXh0ID0gb3B0aW9ucy50aXRsZSArICclMjAnICsgb3B0aW9ucy51cmw7XG4gIH1cblxuICB2YXIgdXBkYXRlVXJsID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBlbGVtZW50LmdldCgwKS5ocmVmID0gdGhpcy5nZXRTaGFyZVVybChvcHRpb25zKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHZhciBlbGVtZW50ID0gY3JlYXRlQnV0dG9uKHtcbiAgICB1cmw6IHRoaXMuZ2V0U2hhcmVVcmwob3B0aW9ucyksXG4gICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgaWNvbjogdGhpcy5pY29uXG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogZWxlbWVudCxcbiAgICB1cGRhdGVVcmw6IHVwZGF0ZVVybFxuICB9O1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cblNvY2lhbE5ldHdvcmsucHJvdG90eXBlLmdldEJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLnByb2ZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9maWxlQnV0dG9uKG9wdGlvbnMpO1xuICB9XG4gIGlmICh0aGlzLnNoYXJlVXJsICYmIG9wdGlvbnMudGl0bGUgJiYgb3B0aW9ucy51cmwpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTaGFyZUJ1dHRvbihvcHRpb25zKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU29jaWFsTmV0d29yaztcblxuZnVuY3Rpb24gY3JlYXRlQnV0dG9uIChvcHRpb25zKSB7XG4gIHJldHVybiAkKCc8YSBjbGFzcz1cInB3cC1jb250cmFzdC0nICsgb3B0aW9ucy5pY29uICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCInICsgb3B0aW9ucy51cmwgKyAnXCIgJyArXG4gICAgJ3RpdGxlPVwiJyArIG9wdGlvbnMudGl0bGUgKyAnXCI+PGkgY2xhc3M9XCJpY29uIHB3cC0nICsgb3B0aW9ucy5pY29uICsgJ1wiPjwvaT48L2E+JyArXG4gICAgJzxzcGFuPicgKyBvcHRpb25zLnRpdGxlICsgJzwvc3Bhbj4nKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9zb2NpYWwtbmV0d29yay5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFNvY2lhbE5ldHdvcmsgPSByZXF1aXJlKCcuL3NvY2lhbC1uZXR3b3JrJylcbiAgLCBzb2NpYWxOZXR3b3JrcyA9IHtcbiAgdHdpdHRlcjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICd0d2l0dGVyJyxcbiAgICB0aXRsZTogJ1R3aXR0ZXInLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3R3aXR0ZXIuY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90ZXh0PSR0ZXh0JCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGZsYXR0cjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdmbGF0dHInLFxuICAgIHRpdGxlOiAnRmxhdHRyJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9mbGF0dHIuY29tL3Byb2ZpbGUvJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RleHQ9JHRleHQkJnVybD0kdXJsJCdcbiAgfSksXG5cbiAgZmFjZWJvb2s6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnZmFjZWJvb2snLFxuICAgIHRpdGxlOiAnRmFjZWJvb2snLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL2ZhY2Vib29rLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmUucGhwP3Q9JHRleHQkJnU9JHVybCQnXG4gIH0pLFxuXG4gIGFkbjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdhZG4nLFxuICAgIHRpdGxlOiAnQXBwLm5ldCcsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vYWxwaGEuYXBwLm5ldC8nLFxuICAgIHNoYXJlVXJsOiAnaW50ZW50L3Bvc3Q/dGV4dD0kdGV4dCQnXG4gIH0pLFxuXG4gIHNvdW5kY2xvdWQ6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnc291bmRjbG91ZCcsXG4gICAgdGl0bGU6ICdTb3VuZENsb3VkJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGluc3RhZ3JhbTogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdpbnN0YWdyYW0nLFxuICAgIHRpdGxlOiAnSW5zdGFncmFtJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cDovL2luc3RhZ3JhbS5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RpdGxlPSR0aXRsZSQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICB0dW1ibHI6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAndHVtYmxyJyxcbiAgICB0aXRsZTogJ1R1bWJscicsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vd3d3LnR1bWJsci5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RpdGxlPSR0aXRsZSQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICBlbWFpbDogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdtZXNzYWdlJyxcbiAgICB0aXRsZTogJ0UtTWFpbCcsXG4gICAgcHJvZmlsZVVybDogJ21haWx0bzonLFxuICAgIHNoYXJlVXJsOiAnP3N1YmplY3Q9JHRpdGxlJCZib2R5PSR0ZXh0JCdcbiAgfSksXG4gIGdwbHVzOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ2dvb2dsZS1wbHVzJyxcbiAgICB0aXRsZTogJ0dvb2dsZSsnLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3BsdXMuZ29vZ2xlLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pXG59O1xuXG4vKipcbiAqIHJldHVybnMgdGhlIHNlcnZpY2UgcmVnaXN0ZXJlZCB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VydmljZU5hbWVcbiAqIEByZXR1cm5zIHtTb2NpYWxOZXR3b3JrfVxuICovXG5mdW5jdGlvbiBnZXRTZXJ2aWNlIChzZXJ2aWNlTmFtZSkge1xuICB2YXIgc2VydmljZSA9IHNvY2lhbE5ldHdvcmtzW3NlcnZpY2VOYW1lXTtcbiAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgY29uc29sZS5lcnJvcignVW5rbm93biBzZXJ2aWNlJywgc2VydmljZU5hbWUpO1xuICB9XG4gIHJldHVybiBzZXJ2aWNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0OiBnZXRTZXJ2aWNlXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NvY2lhbC1uZXR3b3Jrcy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGUgYSB0YWJcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVGFiKG9wdGlvbnMpIHtcbiAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uO1xuICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgdGhpcy5oZWFkbGluZSA9IG9wdGlvbnMuaGVhZGxpbmU7XG5cbiAgdGhpcy5ib3ggPSBjcmVhdGVDb250ZW50Qm94KG9wdGlvbnMpO1xuICB0aGlzLmNyZWF0ZUhlYWRlcigpO1xuICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLnRvZ2dsZSA9IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGFiO1xuXG4vKipcbiAqIEFkZCBjbGFzcyAnYWN0aXZlJyB0byB0aGUgYWN0aXZlIHRhYlxuICovXG5UYWIucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgdGhpcy5ib3guYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICB0aGlzLnRvZ2dsZS5hZGRDbGFzcygnYWN0aXZlJyk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBjbGFzcyAnYWN0aXZlJyBmcm9tIHRoZSBpbmFjdGl2ZSB0YWJcbiAqL1xuVGFiLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgdGhpcy5ib3gucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICB0aGlzLnRvZ2dsZS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBodG1sIGhlYWRlciBlbGVtZW50IHdpdGggYSBoZWFkbGluZVxuICovXG5UYWIucHJvdG90eXBlLmNyZWF0ZUhlYWRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaGVhZGVyID0gJCgnPGhlYWRlcj48aDIgY2xhc3M9XCJ0YWItaGVhZGxpbmVcIj48aSBjbGFzcz1cImljb24gJyArIHRoaXMuaWNvbiArICdcIj48L2k+JyArIHRoaXMuaGVhZGxpbmUgKyAnPC9oMj48L2hlYWRlcj4nKTtcbiAgdGhpcy5ib3guYXBwZW5kKGhlYWRlcik7XG4gIHJldHVybiBoZWFkZXI7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGRpdiBlbGVtZW50IHdpdGggY2xhc3MgbWFpbiB0byB0aGUgdGFiJ3MgY29udGVudCBib3hcbiAqIEBwYXJhbSBjb250ZW50XG4gKi9cblRhYi5wcm90b3R5cGUuY3JlYXRlTWFpbkNvbnRlbnQgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBtYWluRGl2ID0gJCgnPGRpdiBjbGFzcz1cIm1haW5cIj4nICsgY29udGVudCArICc8L2RpdicpO1xuICB0aGlzLmJveC5hcHBlbmQobWFpbkRpdik7XG4gIHJldHVybiBtYWluRGl2O1xufTtcblxuLyoqXG4gKiBBcHBlbmQgYW4gaHRtbCBhc2lkZSBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVBc2lkZSA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgdmFyIGFzaWRlID0gJCgnPGFzaWRlIGNsYXNzPVwiYXNpZGVcIj4nICsgY29udGVudCArICc8L2FzaWRlPicpO1xuICB0aGlzLmJveC5hcHBlbmQoYXNpZGUpO1xuICByZXR1cm4gYXNpZGU7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGZvb3RlciBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVGb290ZXIgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBmb290ZXIgPSAkKCc8Zm9vdGVyPicgKyBjb250ZW50ICsgJzwvZm9vdGVyPicpO1xuICB0aGlzLmJveC5hcHBlbmQoZm9vdGVyKTtcbiAgcmV0dXJuIGZvb3Rlcjtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGh0bWwgc2VjdGlvbiBlbGVtZW50IGFzIGEgd3JhcHBlciBmb3IgdGhlIHRhYlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHsqfGpRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29udGVudEJveChvcHRpb25zKSB7XG4gIHZhciBjbGFzc2VzID0gW1widGFiXCJdO1xuICBjbGFzc2VzLnB1c2gob3B0aW9ucy5uYW1lKTtcbiAgaWYgKG9wdGlvbnMuYWN0aXZlKSB7XG4gICAgY2xhc3Nlcy5wdXNoKFwiYWN0aXZlXCIpO1xuICB9XG4gIHJldHVybiAkKCc8c2VjdGlvbiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIj48L3NlY3Rpb24+Jyk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdGFiLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEB0eXBlIHtUYWJ9XG4gKi9cbnZhciBUYWIgPSByZXF1aXJlKCcuL3RhYi5qcycpO1xuXG5mdW5jdGlvbiBUYWJSZWdpc3RyeSgpIHtcbiAgLyoqXG4gICAqIHdpbGwgc3RvcmUgYSByZWZlcmVuY2UgdG8gY3VycmVudGx5IGFjdGl2ZSB0YWIgaW5zdGFuY2UgdG8gY2xvc2UgaXQgd2hlbiBhbm90aGVyIG9uZSBpcyBvcGVuZWRcbiAgICogQHR5cGUge29iamVjdH1cbiAgICovXG4gIHRoaXMuYWN0aXZlVGFiID0gbnVsbDtcbiAgdGhpcy50b2dnbGViYXIgPSAkKCc8ZGl2IGNsYXNzPVwidG9nZ2xlYmFyIGJhclwiPjwvZGl2PicpO1xuICB0aGlzLnRvZ2dsZUxpc3QgPSAkKCc8dWwgY2xhc3M9XCJ0YWJsaXN0XCI+PC91bD4nKTtcbiAgdGhpcy50b2dnbGViYXIuYXBwZW5kKHRoaXMudG9nZ2xlTGlzdCk7XG4gIHRoaXMuY29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cInRhYnNcIj48L2Rpdj4nKTtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbbG9nQ3VycmVudFRpbWVdO1xuICB0aGlzLnRhYnMgPSBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUYWJSZWdpc3RyeTtcblxuVGFiUmVnaXN0cnkucHJvdG90eXBlLmNyZWF0ZVRvZ2dsZUZvciA9IGZ1bmN0aW9uICh0YWIpIHtcbiAgdmFyIHRvZ2dsZSA9ICQoJzxsaSB0aXRsZT1cIicgKyB0YWIudGl0bGUgKyAnXCI+JyArXG4gICAgICAnPGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwiYnV0dG9uIGJ1dHRvbi10b2dnbGUgJyArIHRhYi5pY29uICsgJ1wiPjwvYT4nICtcbiAgICAnPC9saT4nKTtcbiAgdG9nZ2xlLm9uKCdjbGljaycsIGdldFRvZ2dsZUNsaWNrSGFuZGxlci5iaW5kKHRoaXMsIHRhYikpO1xuICB0aGlzLnRvZ2dsZUxpc3QuYXBwZW5kKHRvZ2dsZSk7XG4gIHJldHVybiB0b2dnbGU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgdGFiIGFuZCBvcGVuIGl0IGlmIGl0IGlzIGluaXRpYWxseSB2aXNpYmxlXG4gKiBAcGFyYW0ge1RhYn0gdGFiXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZpc2libGVcbiAqL1xuVGFiUmVnaXN0cnkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhYiwgdmlzaWJsZSkge1xuICBpZiAodGFiID09PSBudWxsKSB7IHJldHVybjsgfVxuICB0aGlzLnRhYnMucHVzaCh0YWIpO1xuICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGFiLmJveCk7XG5cbiAgdGFiLnRvZ2dsZSA9IHRoaXMuY3JlYXRlVG9nZ2xlRm9yKHRhYik7XG4gIGlmICh2aXNpYmxlKSB7XG4gICAgdGFiLm9wZW4oKTtcbiAgICB0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcbiAgfVxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG1vZHVsZVxuICovXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuYWRkTW9kdWxlID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gIGlmIChtb2R1bGUudGFiKSB7XG4gICAgdGhpcy5hZGQobW9kdWxlLnRhYik7XG4gIH1cbiAgaWYgKG1vZHVsZS51cGRhdGUpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG1vZHVsZS51cGRhdGUpO1xuICB9XG59O1xuXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJ1RhYlJlZ2lzdHJ5I3VwZGF0ZScsIGV2ZW50KTtcbiAgdmFyIHBsYXllciA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICQuZWFjaCh0aGlzLmxpc3RlbmVycywgZnVuY3Rpb24gKGksIGxpc3RlbmVyKSB7IGxpc3RlbmVyKHBsYXllcik7IH0pO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtUYWJ9IHRhYlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGdldFRvZ2dsZUNsaWNrSGFuZGxlcih0YWIpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgY29uc29sZS5kZWJ1ZygnVGFiUmVnaXN0cnknLCAnYWN0aXZlVGFiJywgdGhpcy5hY3RpdmVUYWIpO1xuICBpZiAodGhpcy5hY3RpdmVUYWIpIHtcbiAgICB0aGlzLmFjdGl2ZVRhYi5jbG9zZSgpO1xuICB9XG4gIGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gdGFiKSB7XG4gICAgdGhpcy5hY3RpdmVUYWIgPSBudWxsO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcbiAgdGhpcy5hY3RpdmVUYWIub3BlbigpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBsYXllclxuICovXG5mdW5jdGlvbiBsb2dDdXJyZW50VGltZSAocGxheWVyKSB7XG4gIGNvbnNvbGUubG9nKCdwbGF5ZXIuY3VycmVudFRpbWUnLCBwbGF5ZXIuY3VycmVudFRpbWUpO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RhYnJlZ2lzdHJ5LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgemVyb0ZpbGwgPSByZXF1aXJlKCcuL3V0aWwnKS56ZXJvRmlsbDtcblxuLyoqXG4gKiBUaW1lY29kZSBhcyBkZXNjcmliZWQgaW4gaHR0cDovL3BvZGxvdmUub3JnL2RlZXAtbGluay9cbiAqIGFuZCBodHRwOi8vd3d3LnczLm9yZy9UUi9tZWRpYS1mcmFncy8jZnJhZ21lbnQtZGltZW5zaW9uc1xuICovXG52YXIgdGltZUNvZGVNYXRjaGVyID0gLyg/OihcXGQrKTopPyhcXGR7MSwyfSk6KFxcZFxcZCkoXFwuXFxkezEsM30pPy87XG5cbi8qKlxuICogY29udmVydCBhbiBhcnJheSBvZiBzdHJpbmcgdG8gdGltZWNvZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0Y1xuICogQHJldHVybnMge251bWJlcnxib29sZWFufVxuICovXG5mdW5jdGlvbiBleHRyYWN0VGltZSh0Yykge1xuICBpZiAoIXRjKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXJ0cyA9IHRpbWVDb2RlTWF0Y2hlci5leGVjKHRjKTtcbiAgaWYgKCFwYXJ0cykge1xuICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGV4dHJhY3QgdGltZSBmcm9tJywgdGMpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdGltZSA9IDA7XG4gIC8vIGhvdXJzXG4gIHRpbWUgKz0gcGFydHNbMV0gPyBwYXJzZUludChwYXJ0c1sxXSwgMTApICogNjAgKiA2MCA6IDA7XG4gIC8vIG1pbnV0ZXNcbiAgdGltZSArPSBwYXJzZUludChwYXJ0c1syXSwgMTApICogNjA7XG4gIC8vIHNlY29uZHNcbiAgdGltZSArPSBwYXJzZUludChwYXJ0c1szXSwgMTApO1xuICAvLyBtaWxsaXNlY29uZHNcbiAgdGltZSArPSBwYXJ0c1s0XSA/IHBhcnNlRmxvYXQocGFydHNbNF0pIDogMDtcbiAgLy8gbm8gbmVnYXRpdmUgdGltZVxuICB0aW1lID0gTWF0aC5tYXgodGltZSwgMCk7XG4gIHJldHVybiB0aW1lO1xufVxuXG4vKipcbiAqIGNvbnZlcnQgYSB0aW1lc3RhbXAgdG8gYSB0aW1lY29kZSBpbiAke2luc2VydCBSRkMgaGVyZX0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJlcn0gdGltZVxuICogQHBhcmFtIHtCb29sZWFufSBsZWFkaW5nWmVyb3NcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlSG91cnNdIGZvcmNlIG91dHB1dCBvZiBob3VycywgZGVmYXVsdHMgdG8gZmFsc2VcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3Nob3dNaWxsaXNdIG91dHB1dCBtaWxsaXNlY29uZHMgc2VwYXJhdGVkIHdpdGggYSBkb3QgZnJvbSB0aGUgc2Vjb25kcyAtIGRlZmF1bHRzIHRvIGZhbHNlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRzMnRjKHRpbWUsIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycywgc2hvd01pbGxpcykge1xuICB2YXIgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc2Vjb25kcztcbiAgdmFyIHRpbWVjb2RlID0gJyc7XG5cbiAgaWYgKHRpbWUgPT09IDApIHtcbiAgICByZXR1cm4gKGZvcmNlSG91cnMgPyAnMDA6MDA6MDAnIDogJzAwOjAwJyk7XG4gIH1cblxuICAvLyBwcmV2ZW50IG5lZ2F0aXZlIHZhbHVlcyBmcm9tIHBsYXllclxuICBpZiAoIXRpbWUgfHwgdGltZSA8PSAwKSB7XG4gICAgcmV0dXJuIChmb3JjZUhvdXJzID8gJy0tOi0tOi0tJyA6ICctLTotLScpO1xuICB9XG5cbiAgaG91cnMgPSBNYXRoLmZsb29yKHRpbWUgLyA2MCAvIDYwKTtcbiAgbWludXRlcyA9IE1hdGguZmxvb3IodGltZSAvIDYwKSAlIDYwO1xuICBzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lICUgNjApICUgNjA7XG4gIG1pbGxpc2Vjb25kcyA9IE1hdGguZmxvb3IodGltZSAlIDEgKiAxMDAwKTtcblxuICBpZiAoc2hvd01pbGxpcyAmJiBtaWxsaXNlY29uZHMpIHtcbiAgICB0aW1lY29kZSA9ICcuJyArIHplcm9GaWxsKG1pbGxpc2Vjb25kcywgMyk7XG4gIH1cblxuICB0aW1lY29kZSA9ICc6JyArIHplcm9GaWxsKHNlY29uZHMsIDIpICsgdGltZWNvZGU7XG5cbiAgaWYgKGhvdXJzID09PSAwICYmICFmb3JjZUhvdXJzICYmICFsZWFkaW5nWmVyb3MgKSB7XG4gICAgcmV0dXJuIG1pbnV0ZXMudG9TdHJpbmcoKSArIHRpbWVjb2RlO1xuICB9XG5cbiAgdGltZWNvZGUgPSB6ZXJvRmlsbChtaW51dGVzLCAyKSArIHRpbWVjb2RlO1xuXG4gIGlmIChob3VycyA9PT0gMCAmJiAhZm9yY2VIb3Vycykge1xuICAgIC8vIHJlcXVpcmVkIChtaW51dGVzIDogc2Vjb25kcylcbiAgICByZXR1cm4gdGltZWNvZGU7XG4gIH1cblxuICBpZiAobGVhZGluZ1plcm9zKSB7XG4gICAgcmV0dXJuIHplcm9GaWxsKGhvdXJzLCAyKSArICc6JyArIHRpbWVjb2RlO1xuICB9XG5cbiAgcmV0dXJuIGhvdXJzICsgJzonICsgdGltZWNvZGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNvbnZlcnRpbmcgdGltZXN0YW1wcyB0b1xuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZXN0YW1wXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IHRpbWVjb2RlXG4gICAqL1xuICBmcm9tVGltZVN0YW1wOiBmdW5jdGlvbiAodGltZXN0YW1wKSB7XG4gICAgcmV0dXJuIHRzMnRjKHRpbWVzdGFtcCwgdHJ1ZSwgdHJ1ZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGFjY2VwdHMgYXJyYXkgd2l0aCBzdGFydCBhbmQgZW5kIHRpbWUgaW4gc2Vjb25kc1xuICAgKiByZXR1cm5zIHRpbWVjb2RlIGluIGRlZXAtbGlua2luZyBmb3JtYXRcbiAgICogQHBhcmFtIHtBcnJheX0gdGltZXNcbiAgICogQHBhcmFtIHtCb29sZWFufSBsZWFkaW5nWmVyb3NcbiAgICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VIb3Vyc11cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2VuZXJhdGU6IGZ1bmN0aW9uICh0aW1lcywgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzKSB7XG4gICAgaWYgKHRpbWVzWzFdID4gMCAmJiB0aW1lc1sxXSA8IDk5OTk5OTkgJiYgdGltZXNbMF0gPCB0aW1lc1sxXSkge1xuICAgICAgcmV0dXJuIHRzMnRjKHRpbWVzWzBdLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMpICsgJywnICsgdHMydGModGltZXNbMV0sIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycyk7XG4gICAgfVxuICAgIHJldHVybiB0czJ0Yyh0aW1lc1swXSwgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzKTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBwYXJzZXMgdGltZSBjb2RlIGludG8gc2Vjb25kc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gdGltZWNvZGVcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBwYXJzZTogZnVuY3Rpb24gKHRpbWVjb2RlKSB7XG4gICAgaWYgKCF0aW1lY29kZSkge1xuICAgICAgcmV0dXJuIFtmYWxzZSwgZmFsc2VdO1xuICAgIH1cblxuICAgIHZhciB0aW1lcGFydHMgPSB0aW1lY29kZS5zcGxpdCgnLScpO1xuXG4gICAgaWYgKCF0aW1lcGFydHMubGVuZ3RoKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ25vIHRpbWVwYXJ0czonLCB0aW1lY29kZSk7XG4gICAgICByZXR1cm4gW2ZhbHNlLCBmYWxzZV07XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0VGltZSA9IGV4dHJhY3RUaW1lKHRpbWVwYXJ0cy5zaGlmdCgpKTtcbiAgICB2YXIgZW5kVGltZSA9IGV4dHJhY3RUaW1lKHRpbWVwYXJ0cy5zaGlmdCgpKTtcblxuICAgIHJldHVybiAoZW5kVGltZSA+IHN0YXJ0VGltZSkgPyBbc3RhcnRUaW1lLCBlbmRUaW1lXSA6IFtzdGFydFRpbWUsIGZhbHNlXTtcbiAgfSxcblxuICBnZXRTdGFydFRpbWVDb2RlOiBmdW5jdGlvbiBnZXRTdGFydFRpbWVjb2RlKHN0YXJ0KSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZShzdGFydClbMF07XG4gIH1cbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdGltZWNvZGUuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbi8qXG4gW1xuIHt0eXBlOiBcImltYWdlXCIsIFwidGl0bGVcIjogXCJUaGUgdmVyeSBiZXN0IEltYWdlXCIsIFwidXJsXCI6IFwiaHR0cDovL2RvbWFpbi5jb20vaW1hZ2VzL3Rlc3QxLnBuZ1wifSxcbiB7dHlwZTogXCJzaG93bm90ZVwiLCBcInRleHRcIjogXCJQQVBBUEFQQVBBUEFHRU5PXCJ9LFxuIHt0eXBlOiBcInRvcGljXCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6dHJ1ZSwgdGl0bGU6IFwiVGhlIHZlcnkgZmlyc3QgY2hhcHRlclwiIH0sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDAsIGVuZDogMSwgcTp0cnVlLCBjbGFzczogJ3NwZWVjaCd9LFxuIHt0eXBlOiBcImF1ZGlvXCIsIHN0YXJ0OiAxLCBlbmQ6IDIsIHE6dHJ1ZSwgY2xhc3M6ICdtdXNpYyd9LFxuIHt0eXBlOiBcImF1ZGlvXCIsIHN0YXJ0OiAyLCBlbmQ6IDMsIHE6dHJ1ZSwgY2xhc3M6ICdub2lzZSd9LFxuIHt0eXBlOiBcImF1ZGlvXCIsIHN0YXJ0OiA0LCBlbmQ6IDUsIHE6dHJ1ZSwgY2xhc3M6ICdzaWxlbmNlJ30sXG4ge3R5cGU6IFwiY29udGVudFwiLCBzdGFydDogMCwgZW5kOiAxLCBxOnRydWUsIHRpdGxlOiBcIlRoZSB2ZXJ5IGZpcnN0IGNoYXB0ZXJcIiwgY2xhc3M6J2FkdmVydGlzZW1lbnQnfSxcbiB7dHlwZTogXCJsb2NhdGlvblwiLCBzdGFydDogMCwgZW5kOiAxLCBxOmZhbHNlLCB0aXRsZTogXCJBcm91bmQgQmVybGluXCIsIGxhdDoxMi4xMjMsIGxvbjo1Mi4yMzQsIGRpYW1ldGVyOjEyMyB9LFxuIHt0eXBlOiBcImNoYXRcIiwgcTpmYWxzZSwgc3RhcnQ6IDAuMTIsIFwiZGF0YVwiOiBcIkVSU1RFUiAmIEhJVExFUiEhIVwifSxcbiB7dHlwZTogXCJzaG93bm90ZVwiLCBzdGFydDogMC4yMywgXCJkYXRhXCI6IFwiSmVtYW5kIHZhZGVydFwifSxcbiB7dHlwZTogXCJpbWFnZVwiLCBcIm5hbWVcIjogXCJUaGUgdmVyeSBiZXN0IEltYWdlXCIsIFwidXJsXCI6IFwiaHR0cDovL2RvbWFpbi5jb20vaW1hZ2VzL3Rlc3QxLnBuZ1wifSxcbiB7dHlwZTogXCJsaW5rXCIsIFwibmFtZVwiOiBcIkFuIGludGVyZXN0aW5nIGxpbmtcIiwgXCJ1cmxcIjogXCJodHRwOi8vXCJ9LFxuIHt0eXBlOiBcInRvcGljXCIsIHN0YXJ0OiAxLCBlbmQ6IDIsIFwibmFtZVwiOiBcIlRoZSB2ZXJ5IGZpcnN0IGNoYXB0ZXJcIiwgXCJ1cmxcIjogXCJcIn0sXG4gXVxuICovXG52YXIgdGMgPSByZXF1aXJlKCcuL3RpbWVjb2RlJylcbiAgLCBjYXAgPSByZXF1aXJlKCcuL3V0aWwnKS5jYXA7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7SFRNTE1lZGlhRWxlbWVudH0gcGxheWVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRpbWVsaW5lKHBsYXllciwgZGF0YSkge1xuICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgdGhpcy5oYXNDaGFwdGVycyA9IGNoZWNrRm9yQ2hhcHRlcnMoZGF0YSk7XG4gIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VTaW1wbGVDaGFwdGVyKGRhdGEpO1xuICB0aGlzLm1vZHVsZXMgPSBbXTtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbbG9nQ3VycmVudFRpbWVdO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gLTE7XG4gIHRoaXMuZHVyYXRpb24gPSBkYXRhLmR1cmF0aW9uO1xuICB0aGlzLmVuZFRpbWUgPSBkYXRhLmR1cmF0aW9uO1xuICB0aGlzLmJ1ZmZlcmVkVGltZSA9IDA7XG4gIHRoaXMucmVzdW1lID0gcGxheWVyLnBhdXNlZDtcbiAgdGhpcy5zZWVraW5nID0gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7XG5cblRpbWVsaW5lLnByb3RvdHlwZS5hZGRNZXRhZGF0YSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIHZhciBwYXJzZWQgPSBfcGFyc2UoZGF0YSk7XG4gIHRoaXMuZGF0YSA9IF9tZXJnZSh0aGlzLmRhdGEsIHBhcnNlZCk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhQnlUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5maWx0ZXIoX2ZpbHRlckJ5VHlwZSh0eXBlKSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuYWRkTW9kdWxlID0gZnVuY3Rpb24gKG1vZHVsZSkge1xuICBpZiAobW9kdWxlLnVwZGF0ZSkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobW9kdWxlLnVwZGF0ZSk7XG4gIH1cbiAgdGhpcy5tb2R1bGVzLnB1c2gobW9kdWxlKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5wbGF5UmFuZ2UgPSBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgaWYgKCFyYW5nZSB8fCAhcmFuZ2UubGVuZ3RoIHx8ICFyYW5nZS5zaGlmdCkge1xuICAgIHRocm93IFR5cGVFcnJvcignVGltZWxpbmUucGxheVJhbmdlIGNhbGxlZCB3aXRob3V0IGEgcmFuZ2UnKTtcbiAgfVxuICB0aGlzLnNldFRpbWUocmFuZ2Uuc2hpZnQoKSk7XG4gIHRoaXMuc3RvcEF0KHJhbmdlLnNoaWZ0KCkpO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAndXBkYXRlJywgZXZlbnQpO1xuICB0aGlzLnNldEJ1ZmZlcmVkVGltZShldmVudCk7XG5cbiAgaWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICd0aW1ldXBkYXRlJykge1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnBsYXllci5jdXJyZW50VGltZTtcbiAgfVxuICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGNhbGwsIHRoaXMpO1xuICBpZiAodGhpcy5jdXJyZW50VGltZSA+PSB0aGlzLmVuZFRpbWUpIHtcbiAgICB0aGlzLnBsYXllci5zdG9wKCk7XG4gIH1cbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5lbWl0RXZlbnRzQmV0d2VlbiA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBlbWl0U3RhcnRlZCA9IGZhbHNlLFxuICAgIGVtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBjdXN0b21FdmVudCA9IG5ldyAkLkV2ZW50KGV2ZW50LnR5cGUsIGV2ZW50KTtcbiAgICAgICQodGhpcykudHJpZ2dlcihjdXN0b21FdmVudCk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICB0aGlzLmRhdGEubWFwKGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBsYXRlciA9IChldmVudC5zdGFydCA+IHN0YXJ0KSxcbiAgICAgIGVhcmxpZXIgPSAoZXZlbnQuZW5kIDwgc3RhcnQpLFxuICAgICAgZW5kZWQgPSAoZXZlbnQuZW5kIDwgZW5kKVxuICAgICAgO1xuICAgIGlmIChsYXRlciAmJiBlYXJsaWVyICYmICFlbmRlZCB8fCBlbWl0U3RhcnRlZCkge1xuICAgICAgY29uc29sZS5sb2coJ1RpbWVsaW5lJywgJ0VtaXQnLCBldmVudCk7XG4gICAgICBlbWl0KGV2ZW50KTtcbiAgICB9XG4gICAgZW1pdFN0YXJ0ZWQgPSBsYXRlcjtcbiAgfSk7XG59O1xuXG4vKipcbiAqIHJldHVybnMgaWYgdGltZSBpcyBhIHZhbGlkIHRpbWVzdGFtcCBpbiBjdXJyZW50IHRpbWVsaW5lXG4gKiBAcGFyYW0geyp9IHRpbWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5UaW1lbGluZS5wcm90b3R5cGUuaXNWYWxpZFRpbWUgPSBmdW5jdGlvbiAodGltZSkge1xuICByZXR1cm4gKHR5cGVvZiB0aW1lID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odGltZSkgJiYgdGltZSA+PSAwICYmIHRpbWUgPD0gdGhpcy5kdXJhdGlvbik7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZSA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIGlmICghdGhpcy5pc1ZhbGlkVGltZSh0aW1lKSkge1xuICAgIGNvbnNvbGUud2FybignVGltZWxpbmUnLCAnc2V0VGltZScsICd0aW1lIG91dCBvZiBib3VuZHMnLCB0aW1lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICdzZXRUaW1lJywgJ3RpbWUnLCB0aW1lKTtcbiAgdGhpcy5jdXJyZW50VGltZSA9IHRpbWU7XG4gIHRoaXMudXBkYXRlKCk7XG5cbiAgLy8gYXZvaWQgZXZlbnQgaGVsbGZpcmVcbiAgaWYgKHRoaXMuc2Vla2luZykgeyByZXR1cm4gdGhpcy5jdXJyZW50VGltZTsgfVxuXG4gIGNvbnNvbGUubG9nKCdjYW5wbGF5JywgJ3NldFRpbWUnLCAncGxheWVyU3RhdGUnLCB0aGlzLnBsYXllci5yZWFkeVN0YXRlKTtcbiAgaWYgKHRoaXMucGxheWVyLnJlYWR5U3RhdGUgPT09IHRoaXMucGxheWVyLkhBVkVfRU5PVUdIX0RBVEEpIHtcbiAgICB0aGlzLnBsYXllci5zZXRDdXJyZW50VGltZSh0aW1lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8vIFRPRE8gdmlzdWFsaXplIGJ1ZmZlciBzdGF0ZVxuICAvLyAkKGRvY3VtZW50KS5maW5kKCcucGxheScpLmNzcyh7Y29sb3I6J3JlZCd9KTtcbiAgJCh0aGlzLnBsYXllcikub25lKCdjYW5wbGF5JywgZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE8gcmVtb3ZlIGJ1ZmZlciBzdGF0ZSB2aXN1YWxcbiAgICAvLyAkKGRvY3VtZW50KS5maW5kKCcucGxheScpLmNzcyh7Y29sb3I6J3doaXRlJ30pO1xuICAgIGNvbnNvbGUubG9nKCdQbGF5ZXInLCAnY2FucGxheScsICdidWZmZXJlZCcsIHRpbWUpO1xuICAgIHRoaXMuc2V0Q3VycmVudFRpbWUodGltZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnNlZWsgPSBmdW5jdGlvbiAodGltZSkge1xuICBjb25zb2xlLmxvZygnc2VlaycsICdzZWVrJywgdGhpcy5yZXN1bWUpO1xuICB0aGlzLnNlZWtpbmcgPSB0cnVlO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gY2FwKHRpbWUsIDAsIHRoaXMuZHVyYXRpb24pO1xuICB0aGlzLnNldFRpbWUodGhpcy5jdXJyZW50VGltZSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2Vla1N0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZygnc2VlaycsICdzdGFydCcsIHRoaXMucmVzdW1lKTtcbiAgdGhpcy5yZXN1bWUgPSAhdGhpcy5wbGF5ZXIucGF1c2VkOyAvLyBzZXR0aW5nIHRoaXMgdG8gZmFsc2UgbWFrZXMgU2FmYXJpIGhhcHB5XG4gIGlmICh0aGlzLnJlc3VtZSkge1xuICAgIHRoaXMucGxheWVyLnBhdXNlKCk7XG4gIH1cbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zZWVrRW5kID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZygnc2VlaycsICdlbmQnLCB0aGlzLnJlc3VtZSk7XG4gIHRoaXMuc2Vla2luZyA9IGZhbHNlO1xuICB0aGlzLnNldFRpbWUodGhpcy5jdXJyZW50VGltZSk7IC8vZm9yY2UgbGF0ZXN0IHBvc2l0aW9uIGluIHRyYWNrXG4gIGlmICh0aGlzLnJlc3VtZSkge1xuICAgIGNvbnNvbGUubG9nKCdzZWVrJywgJ2VuZCcsICdyZXN1bWUnLCB0aGlzLmN1cnJlbnRUaW1lKTtcbiAgICB0aGlzLnBsYXllci5wbGF5KCk7XG4gIH1cbiAgdGhpcy5yZXN1bWUgPSAhdGhpcy5wbGF5ZXIucGF1c2VkOyAvLyBzZWVrc3RhcnQgbWF5IG5vdCBiZSBjYWxsZWRcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zdG9wQXQgPSBmdW5jdGlvbiAodGltZSkge1xuICBpZiAoIXRpbWUgfHwgdGltZSA8PSAwIHx8IHRpbWUgPiB0aGlzLmR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUud2FybignVGltZWxpbmUnLCAnc3RvcEF0JywgJ3RpbWUgb3V0IG9mIGJvdW5kcycsIHRpbWUpO1xuICB9XG4gIHRoaXMuZW5kVGltZSA9IHRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZ2V0VGltZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZ2V0QnVmZmVyZWQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChpc05hTih0aGlzLmJ1ZmZlcmVkVGltZSkpIHtcbiAgICBjb25zb2xlLndhcm4oJ1RpbWVsaW5lJywgJ2dldEJ1ZmZlcmVkJywgJ2J1ZmZlcmVkVGltZSBpcyBub3QgYSBudW1iZXInKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuICByZXR1cm4gdGhpcy5idWZmZXJlZFRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2V0QnVmZmVyZWRUaW1lID0gZnVuY3Rpb24gKGUpIHtcbiAgdmFyIHRhcmdldCA9IChlICE9PSB1bmRlZmluZWQpID8gZS50YXJnZXQgOiB0aGlzLnBsYXllcjtcbiAgdmFyIGJ1ZmZlcmVkID0gMDtcblxuICAvLyBuZXdlc3QgSFRNTDUgc3BlYyBoYXMgYnVmZmVyZWQgYXJyYXkgKEZGNCwgV2Via2l0KVxuICBpZiAodGFyZ2V0ICYmIHRhcmdldC5idWZmZXJlZCAmJiB0YXJnZXQuYnVmZmVyZWQubGVuZ3RoID4gMCAmJiB0YXJnZXQuYnVmZmVyZWQuZW5kICYmIHRhcmdldC5kdXJhdGlvbikge1xuICAgIGJ1ZmZlcmVkID0gdGFyZ2V0LmJ1ZmZlcmVkLmVuZCh0YXJnZXQuYnVmZmVyZWQubGVuZ3RoLTEpO1xuICB9XG4gIC8vIFNvbWUgYnJvd3NlcnMgKGUuZy4sIEZGMy42IGFuZCBTYWZhcmkgNSkgY2Fubm90IGNhbGN1bGF0ZSB0YXJnZXQuYnVmZmVyZXJlZC5lbmQoKVxuICAvLyB0byBiZSBhbnl0aGluZyBvdGhlciB0aGFuIDAuIElmIHRoZSBieXRlIGNvdW50IGlzIGF2YWlsYWJsZSB3ZSB1c2UgdGhpcyBpbnN0ZWFkLlxuICAvLyBCcm93c2VycyB0aGF0IHN1cHBvcnQgdGhlIGVsc2UgaWYgZG8gbm90IHNlZW0gdG8gaGF2ZSB0aGUgYnVmZmVyZWRCeXRlcyB2YWx1ZSBhbmRcbiAgLy8gc2hvdWxkIHNraXAgdG8gdGhlcmUuIFRlc3RlZCBpbiBTYWZhcmkgNSwgV2Via2l0IGhlYWQsIEZGMy42LCBDaHJvbWUgNiwgSUUgNy84LlxuICBlbHNlIGlmICh0YXJnZXQgJiYgdGFyZ2V0LmJ5dGVzVG90YWwgIT09IHVuZGVmaW5lZCAmJiB0YXJnZXQuYnl0ZXNUb3RhbCA+IDAgJiYgdGFyZ2V0LmJ1ZmZlcmVkQnl0ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZmZlcmVkID0gdGFyZ2V0LmJ1ZmZlcmVkQnl0ZXMgLyB0YXJnZXQuYnl0ZXNUb3RhbCAqIHRhcmdldC5kdXJhdGlvbjtcbiAgfVxuICAvLyBGaXJlZm94IDMgd2l0aCBhbiBPZ2cgZmlsZSBzZWVtcyB0byBnbyB0aGlzIHdheVxuICBlbHNlIGlmIChlICYmIGUubGVuZ3RoQ29tcHV0YWJsZSAmJiBlLnRvdGFsICE9PSAwKSB7XG4gICAgYnVmZmVyZWQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiB0YXJnZXQuZHVyYXRpb247XG4gIH1cbiAgdmFyIGNhcHBlZFRpbWUgPSBjYXAoYnVmZmVyZWQsIDAsIHRhcmdldC5kdXJhdGlvbik7XG4gIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICdzZXRCdWZmZXJlZFRpbWUnLCBjYXBwZWRUaW1lKTtcbiAgdGhpcy5idWZmZXJlZFRpbWUgPSBjYXBwZWRUaW1lO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnJld2luZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zZXRUaW1lKDApO1xuICB2YXIgY2FsbExpc3RlbmVyV2l0aFRoaXMgPSBmdW5jdGlvbiBfY2FsbExpc3RlbmVyV2l0aFRoaXMoaSwgbGlzdGVuZXIpIHtcbiAgICBsaXN0ZW5lcih0aGlzKTtcbiAgfS5iaW5kKHRoaXMpO1xuICAkLmVhY2godGhpcy5saXN0ZW5lcnMsIGNhbGxMaXN0ZW5lcldpdGhUaGlzKTtcbn07XG5cbmZ1bmN0aW9uIF9maWx0ZXJCeVR5cGUodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIHJldHVybiAocmVjb3JkLnR5cGUgPT09IHR5cGUpO1xuICB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1RpbWVsaW5lfSB0aW1lbGluZVxuICovXG5mdW5jdGlvbiBsb2dDdXJyZW50VGltZSh0aW1lbGluZSkge1xuICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAnY3VycmVudFRpbWUnLCB0aW1lbGluZS5nZXRUaW1lKCkpO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBhdCBsZWFzdCBvbmUgY2hhcHRlciBpcyBwcmVzZW50XG4gKi9cbmZ1bmN0aW9uIGNoZWNrRm9yQ2hhcHRlcnMocGFyYW1zKSB7XG4gIHJldHVybiAhIXBhcmFtcy5jaGFwdGVycyAmJiAoXG4gICAgdHlwZW9mIHBhcmFtcy5jaGFwdGVycyA9PT0gJ29iamVjdCcgJiYgcGFyYW1zLmNoYXB0ZXJzLmxlbmd0aCA+IDFcbiAgICApO1xufVxuXG5mdW5jdGlvbiBfcGFyc2UoZGF0YSkge1xuICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gX21lcmdlKGEsIGIpIHtcblxufVxuXG5UaW1lbGluZS5wcm90b3R5cGUucGFyc2VTaW1wbGVDaGFwdGVyID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgaWYgKCFkYXRhLmNoYXB0ZXJzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGNoYXB0ZXJzID0gZGF0YS5jaGFwdGVycy5tYXAodHJhbnNmb3JtQ2hhcHRlcik7XG5cbiAgLy8gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQ6IGh0dHA6Ly9wb2Rsb3ZlLm9yZy9zaW1wbGUtY2hhcHRlcnMvXG4gIHJldHVybiBjaGFwdGVyc1xuICAgIC5tYXAoYWRkVHlwZSgnY2hhcHRlcicpKVxuICAgIC5tYXAoYWRkRW5kVGltZShkYXRhLmR1cmF0aW9uKSlcbiAgICAuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEuc3RhcnQgLSBiLnN0YXJ0O1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtQ2hhcHRlcihjaGFwdGVyKSB7XG4gIGNoYXB0ZXIuY29kZSA9IGNoYXB0ZXIudGl0bGU7XG4gIGlmICh0eXBlb2YgY2hhcHRlci5zdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICBjaGFwdGVyLnN0YXJ0ID0gdGMuZ2V0U3RhcnRUaW1lQ29kZShjaGFwdGVyLnN0YXJ0KTtcbiAgfVxuICByZXR1cm4gY2hhcHRlcjtcbn1cblxuLyoqXG4gKiBhZGQgYGVuZGAgcHJvcGVydHkgdG8gZWFjaCBzaW1wbGUgY2hhcHRlcixcbiAqIG5lZWRlZCBmb3IgcHJvcGVyIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvblxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBhZGRFbmRUaW1lKGR1cmF0aW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoY2hhcHRlciwgaSwgY2hhcHRlcnMpIHtcbiAgICB2YXIgbmV4dCA9IGNoYXB0ZXJzW2kgKyAxXTtcbiAgICBjaGFwdGVyLmVuZCA9IG5leHQgPyBuZXh0LnN0YXJ0IDogZHVyYXRpb247XG4gICAgcmV0dXJuIGNoYXB0ZXI7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFR5cGUodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnR5cGUgPSB0eXBlO1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9O1xufVxuXG5mdW5jdGlvbiBjYWxsKGxpc3RlbmVyKSB7XG4gIGxpc3RlbmVyKHRoaXMpO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RpbWVsaW5lLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuL3RpbWVjb2RlJyk7XG5cbi8qXG4gIFwidD0xXCJcdFsoXCJ0XCIsIFwiMVwiKV1cdHNpbXBsZSBjYXNlXG4gIFwidD0xJnQ9MlwiXHRbKFwidFwiLCBcIjFcIiksIChcInRcIiwgXCIyXCIpXVx0cmVwZWF0ZWQgbmFtZVxuICBcImE9Yj1jXCJcdFsoXCJhXCIsIFwiYj1jXCIpXVx0XCI9XCIgaW4gdmFsdWVcbiAgXCJhJmI9Y1wiXHRbKFwiYVwiLCBcIlwiKSwgKFwiYlwiLCBcImNcIildXHRtaXNzaW5nIHZhbHVlXG4gIFwiJTc0PSU2ZXB0JTNBJTMxMFwiXHRbKFwidFwiLCBcIm5wdDoxMFwiKV1cdHVubmVjc3NhcnkgcGVyY2VudC1lbmNvZGluZ1xuICBcImlkPSV4eSZ0PTFcIlx0WyhcInRcIiwgXCIxXCIpXVx0aW52YWxpZCBwZXJjZW50LWVuY29kaW5nXG4gIFwiaWQ9JUU0ciZ0PTFcIlx0WyhcInRcIiwgXCIxXCIpXVx0aW52YWxpZCBVVEYtOFxuICovXG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHtzdHJpbmd8Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gZ2V0RnJhZ21lbnQoa2V5KSB7XG4gIHZhciBxdWVyeSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSxcbiAgICBwYWlycyA9IHF1ZXJ5LnNwbGl0KFwiJlwiKTtcblxuICBpZiAocXVlcnkuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gcGFpcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIHBhaXIgPSBwYWlyc1tpXS5zcGxpdChcIj1cIik7XG4gICAgaWYgKHBhaXJbMF0gIT09IGtleSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChwYWlyLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIHVybCBoYW5kbGluZ1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRGcmFnbWVudDogZ2V0RnJhZ21lbnQsXG5cbiAgY2hlY2tDdXJyZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSBnZXRGcmFnbWVudCgndCcpO1xuICAgIHJldHVybiB0Yy5wYXJzZSh0KTtcbiAgfSxcblxuICB2YWxpZGF0ZTogZnVuY3Rpb24gKHVybCkge1xuICAgIC8vIHVuY29tbWVudCBuZXh0IHRocmVlIGxpbmVzIHRvIHZhbGlkYXRlIFVSTHMsIGlmIHlvdSB3YW50IHVzZSByZWxhdGl2ZSBwYXRocyBsZWF2ZSBpdCBzby5cbiAgICAvL3ZhciB1cmxyZWdleCA9IC8oXnxcXHMpKChodHRwcz86XFwvXFwvKT9bXFx3XFwtXSsoXFwuW1xcd1xcLV0rKStcXC4/KDpcXGQrKT8oXFwvXFxTKik/KS9naTtcbiAgICAvL3VybCA9IHVybC5tYXRjaCh1cmxyZWdleCk7XG4gICAgLy9yZXR1cm4gKHVybCAhPT0gbnVsbCkgPyB1cmxbMF0gOiB1cmw7XG4gICAgcmV0dXJuIHVybC50cmltKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGFkZCBhIHN0cmluZyBhcyBoYXNoIGluIHRoZSBhZHJlc3NiYXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZyYWdtZW50XG4gICAqKi9cbiAgc2V0RnJhZ21lbnQ6IGZ1bmN0aW9uIChmcmFnbWVudCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ3NldHRpbmcgdXJsIGZyYWdtZW50JywgZnJhZ21lbnQpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMnICsgZnJhZ21lbnQ7XG4gIH1cbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXJsLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIHJldHVybiBuZXcgdmFsdWUgaW4gYm91bmRzIG9mIG1pbiBhbmQgbWF4XG4gKiBAcGFyYW0ge251bWJlcn0gdmFsXG4gKiBAcGFyYW0ge251bWJlcn0gbWluXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4XG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBjYXAodmFsLCBtaW4sIG1heCkge1xuICAvLyBjYXAgeCB2YWx1ZXNcbiAgdmFsID0gTWF0aC5tYXgodmFsLCBtaW4pO1xuICB2YWwgPSBNYXRoLm1pbih2YWwsIG1heCk7XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogcmV0dXJuIG51bWJlciBhcyBzdHJpbmcgbGVmdGhhbmQgZmlsbGVkIHdpdGggemVyb3NcbiAqIEBwYXJhbSBudW1iZXIgbnVtYmVyXG4gKiBAcGFyYW0gd2lkdGggbnVtYmVyXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiB6ZXJvRmlsbCAobnVtYmVyLCB3aWR0aCkge1xuICB2YXIgcyA9IG51bWJlci50b1N0cmluZygpO1xuICB3aGlsZSAocy5sZW5ndGggPCB3aWR0aCkge1xuICAgIHMgPSBcIjBcIiArIHM7XG4gIH1cbiAgcmV0dXJuIHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjYXA6IGNhcCxcbiAgemVyb0ZpbGw6IHplcm9GaWxsXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3V0aWwuanNcIixcIi9cIikiXX0=
