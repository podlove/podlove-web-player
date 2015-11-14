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
mejs.version = '2.16.4'; 


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
			'jsinitfunction=' + "mejs.MediaPluginBridge.initPlugin",
			'jscallbackfunction=' + "mejs.MediaPluginBridge.fireEvent",
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
						
						player.playVideo = function() {
							player.api( 'play' );
						} 
						player.stopVideo = function() {
							player.api( 'unload' );
						} 
						player.pauseVideo = function() {
							player.api( 'pause' );
						} 
						player.seekTo = function( seconds ) {
							player.api( 'seekTo', seconds );
						}
						player.setVolume = function( volume ) {
							player.api( 'setVolume', volume );
						}
						player.setMuted = function( muted ) {
							if( muted ) {
								player.lastVolume = player.api( 'getVolume' );
								player.api( 'setVolume', 0 );
							} else {
								player.api( 'setVolume', player.lastVolume );
								delete player.lastVolume;
							}
						}						

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
function Controls (timeline) {
  this.player = timeline.player;
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
    this.createButton('pwp-controls-previous-chapter', 'Zurück zum vorigen Kapitel', function () {
      var activeChapter = chapterModule.getActiveChapter();
      if (this.timeline.getTime() > activeChapter.start + 10) {
        console.debug('Controls', 'Zurück zum Kapitelanfang', chapterModule.currentChapter, 'from', this.timeline.getTime());
        return chapterModule.playCurrentChapter();
      }
      console.debug('Controls', 'Zurück zum vorigen Kapitel', chapterModule.currentChapter);
      return chapterModule.previous();
    });
  }

  this.createButton('pwp-controls-back-30', '30 Sekunden zurück', function () {
    console.debug('Controls', 'rewind before', this.timeline.getTime());
    this.timeline.setTime(this.timeline.getTime() - 30);
    console.debug('Controls', 'rewind after', this.timeline.getTime());
  });

  this.createButton('pwp-controls-forward-30', '30 Sekunden vor', function () {
    console.debug('Controls', 'ffwd before', this.timeline.getTime());
    this.timeline.setTime(this.timeline.getTime() + 30);
    console.debug('Controls', 'ffwd after', this.timeline.getTime());
  });

  if (hasChapters) {
    this.createButton('pwp-controls-next-chapter', 'Zum nächsten Kapitel springen', function () {
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
},{"./modules/chapter":9,"buffer":2,"oMfpAn":5}],7:[function(require,module,exports){
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
    title = '<a href="' + url + '" target="_blank" title="Link zur Show">' + title + '</a>';
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
    text = '<a href="' + link + '"  target="_blank" title="Link zur Episode">' + text + '</a>';
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
  return $('<a class="play" title="Abspielen" href="javascript:;"></a>');
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

function renderModules(timeline, wrapper, params) {
  var
    tabs = new TabRegistry(),
    hasChapters = timeline.hasChapters,
    controls = new Controls(timeline),
    controlBox = controls.box;

  /**
   * -- MODULES --
   */
  var chapters;
  if (hasChapters) {
    chapters = new Chapters(timeline, params);
    timeline.addModule(chapters);
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
    tabs.add(chapters.tab);
  }

  tabs.add(sharing.tab);
  tabs.add(downloads.tab);
  tabs.add(infos.tab);

  tabs.openInitial(params.activeTab);

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

    metaElement = $('<div class="titlebar"></div>'),
    playerType = params.type,
    playButton = renderPlaybutton(),
    poster = params.poster || jqPlayer.attr('poster');

  var deepLink;

  console.debug('webplayer', 'metadata', timeline.getData());
  jqPlayer.prop({
    controls: null,
    preload: 'metadata'
  });

  /**
   * Build rich player with meta data
   */
  wrapper
    .addClass('podlovewebplayer_' + playerType)
    .data('podlovewebplayer', {
    player: jqPlayer
  });

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

    jqPlayer.prop({poster: poster});
  }

  // Render title area with title h2 and subtitle h3
  metaElement.append(renderTitleArea(params));

  // parse deeplink
  deepLink = require('./url').checkCurrent();
  if (deepLink[0] && pwp.players.length === 1) {
    var playerAttributes = {preload: 'auto'};
    if (!isHidden()) {
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

  $(document)
    .on('keydown', function (e) {
      console.log('progress', 'keydown', e);
      /*
       if ((new Date() - lastKeyPressTime) >= 1000) {
       startedPaused = media.paused;
       }
       */
      e.preventDefault();
      e.stopPropagation();

      var keyCode = e.which,
        duration = timeline.player.duration,
        seekTime = timeline.player.currentTime;

      switch (keyCode) {
        case 37: // left
          seekTime -= 1;
          break;
        case 39: // Right
          seekTime += 1;
          break;
        case 38: // Up
          if (timeline.hasChapters) {
            timeline.modules[0].next();
            return false;
          }
          seekTime += Math.floor(duration * 0.1);
          break;
        case 40: // Down
          if (timeline.hasChapters) {
            timeline.modules[0].previous();
            return false;
          }
          seekTime -= Math.floor(duration * 0.1);
          break;
        case 36: // Home
          seekTime = 0;
          break;
        case 35: // end
          seekTime = duration;
          break;
        case 10: // enter
        case 32: // space
          if (timeline.player.paused) {
            timeline.player.play();
            return false;
          }
            timeline.player.pause();
          return false;
        default:
          return false;
      }

      timeline.setTime(seekTime);
      return false;
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
      timeline.rewind();
    });

  var delayModuleRendering = !timeline.duration || isNaN(timeline.duration) || timeline.duration <= 0;

  if (!delayModuleRendering) {
    renderModules(timeline, wrapper, params);
  }

  jqPlayer.one('canplay', function () {
    // correct duration just in case
    timeline.duration = player.duration;
    if (delayModuleRendering) {
      renderModules(timeline, wrapper, params);
    }
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

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_6fae0629.js","/")
},{"../../bower_components/mediaelement/build/mediaelement.js":1,"./controls":6,"./embed":7,"./modules/chapter":9,"./modules/downloads":10,"./modules/info":11,"./modules/progressbar":12,"./modules/savetime":13,"./modules/share":14,"./player":15,"./tabregistry":20,"./timeline":22,"./url":23,"buffer":2,"oMfpAn":5}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var tc = require('../timecode')
  , Tab = require('../tab')
  ;

var ACTIVE_CHAPTER_THRESHHOLD = 0.1;

function rowClickHandler (e) {
  e.preventDefault();
  var chapters = e.data.module;
  console.log('Chapter', 'clickHandler', 'setCurrentChapter to', e.data.index);
  chapters.setCurrentChapter(e.data.index);
  chapters.playCurrentChapter();
  chapters.timeline.player.play();
  return false;
}

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

function render(html) {
  return $(html);
}

/**
 * render HTMLTableElement for chapters
 * @returns {jQuery|HTMLElement}
 */
function renderChapterTable() {
  return render(
    '<table class="podlovewebplayer_chapters"><caption>Kapitel</caption>' +
      '<thead>' +
        '<tr>' +
          '<th scope="col">Kapitelnummer</th>' +
          '<th scope="col">Startzeit</th>' +
          '<th scope="col">Titel</th>' +
          '<th scope="col">Dauer</th>' +
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
function Chapters (timeline, params) {

  if (!timeline || !timeline.hasChapters) {
    return null;
  }
  if (timeline.duration === 0) {
    console.warn('Chapters', 'constructor', 'Zero length media?', timeline);
  }

  this.timeline = timeline;
  this.duration = timeline.duration;
  this.chapterlinks = !!timeline.chapterlinks;
  this.currentChapter = 0;
  this.chapters = this.parseSimpleChapter(params);
  this.data = this.chapters;

  this.tab = new Tab({
    icon: 'pwp-chapters',
    title: 'Kapitel anzeigen / verbergen',
    headline: 'Kapitel',
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

  maxchapterstart = getMaxChapterStart(this.chapters);
  forceHours = (maxchapterstart >= 3600);

  function buildChapter(chapter, index) {
    var duration = Math.round(chapter.end - chapter.start);

    //make sure the duration for all chapters are equally formatted
    chapter.duration = tc.generate([duration], false);

    //if there is a chapter that starts after an hour, force '00:' on all previous chapters
    chapter.startTime = tc.generate([Math.round(chapter.start)], true, forceHours);

    //insert the chapter data
    var row = renderRow(chapter, index);
    row.on('click', {module: this, index: index}, rowClickHandler);
    row.appendTo(tbody);
    chapter.element = row;
  }

  this.chapters.forEach(buildChapter, this);
  return table;
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
    console.debug('Chapters', 'previous', 'already in first chapter');
    this.playCurrentChapter();
    return current;
  }
  console.debug('Chapters', 'previous', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return previous;
};

Chapters.prototype.playCurrentChapter = function () {
  var start = this.getActiveChapter().start;
  console.log('Chapters', '#playCurrentChapter', 'start', start);
  var time = this.timeline.setTime(start);
  console.log('Chapters', '#playCurrentChapter', 'currentTime', time);
};

Chapters.prototype.parseSimpleChapter = function (params) {
  var chapters = params.chapters;
  if (!chapters) {
    return [];
  }

  return chapters
    .map(transformChapter)
    .map(addEndTime(this.duration))
    .sort(function (a, b) { // order is not guaranteed: http://podlove.org/simple-chapters/
      return a.start - b.start;
    });
};

module.exports = Chapters;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/chapter.js","/modules")
},{"../tab":19,"../timecode":21,"buffer":2,"oMfpAn":5}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var Tab = require('../tab');

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
function createOption(asset) {
  console.log(asset);
  return '<option value="' + asset.downloadUrl + '">' +
      asset.assetTitle + ' &#8226; ' + formatSize(asset.size) +
    '</option>';
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
    title: 'Downloads anzeigen / verbergen',
    name: 'downloads',
    headline: 'Download'
  });

  var $tabContent = downloadTab.createMainContent(
    '<div class="download">' +
      '<form action="?">' +
        '<select class="select" name="select-file">' + this.list.map(createOption) + '</select>' +
        '<button class="download button-submit icon pwp-download" name="download-file">' +
          '<span class="download label">Download</span>' +
        '</button>' +
      '</form>' +
    '</div>'
  );
  downloadTab.box.append($tabContent);
  var $button = $tabContent.find('button.pwp-download');
  var $select = $tabContent.find('select.select');
  $button.on('click', function (e) {
    e.preventDefault();
    window.open($select.val());
  });

  return downloadTab;
};

module.exports = Downloads;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/downloads.js","/modules")
},{"../tab":19,"buffer":2,"oMfpAn":5}],11:[function(require,module,exports){
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
  return '<p>Veröffentlicht am: ' + date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + '</p>';
}

function createEpisodeInfo(tab, params) {
  tab.createMainContent(
    '<h2>' + params.title + '</h2>' +
    '<h3>' + params.subtitle + '</h3>' +
    '<p>' + params.summary + '</p>' +
    '<p>Dauer: ' + timeCode.fromTimeStamp(params.duration) + '</p>' +
     getPublicationDate(params.publicationDate) +
    '<p>' +
      'Permalink:<br>' +
      '<a href="' + params.permalink + '" target="_blank" title="Permalink für die Episode">' + params.permalink + '</a>' +
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
    '<p>Link zur Show:<br>' +
      '<a href="' + params.show.url + '" target="_blank" title="Link zur Show">' + params.show.url + '</a></p>'
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

  var container = $('<div class="social-links"><h3>Bleib in Verbindung</h3></div>');
  container.append(profileList);
  return container;
}

function createSocialAndLicenseInfo (tab, params) {
  if (!params.license && !params.profiles) {
    return;
  }
  tab.createFooter(
    '<p>Die Show "' + params.show.title + '" ist lizensiert unter<br>' +
      '<a href="' + params.license.url + '" target="_blank" title="Lizenz ansehen">' + params.license.name + '</a>' +
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
    title: 'Infos anzeigen / verbergen',
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
    event.preventDefault();
    event.stopPropagation();

    var x = event.pageX;
    if (event.originalEvent.changedTouches) {
      x = event.originalEvent.changedTouches[0].pageX;
    }

    if (typeof timeline.duration !== 'number' || !mouseIsDown ) { return; }
    var newTime = calculateNewTime(x);
    if (newTime === timeline.getTime()) { return; }
    timeline.seek(newTime);
  }

  function handleMouseUp () {
    mouseIsDown = false;
    $(document).unbind('touchend.dur mouseup.dur touchmove.dur mousemove.dur');
  }

  function handleMouseDown (event) {
    if (event.which !== 0 && event.which !== 1) { return; }

    mouseIsDown = true;
    handleMouseMove(event);
    $(document)
      .bind('mousemove.dur touchmove.dur', handleMouseMove)
      .bind('mouseup.dur touchend.dur', handleMouseUp);
  }

  // handle click and drag with mouse or touch in progressbar and on handle
  this.progress.bind('mousedown touchstart', handleMouseDown);

  this.handle.bind('touchstart mousedown', handleMouseDown);
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
  if (this.timeline.getTime() === 0) {
    return removeItem.call(this);
  }
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
  var radio = element.find('[type=radio]');

  return function () {
    selectedOption.removeClass('selected');

    radio.prop('checked', true);
    element.addClass('selected');
    selectedOption = element;
    console.log('sharing options changed', element, value);

    updateUrls(data);
  };
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

  var element = $('<tr class="share-select-option">' +
    '<td class="share-description">' + option.name + '</td>' +
    '<td class="share-radio"><input type="radio" id="share-option-' + option.name + '" name="r-group" value="' + option.title + '"></td>' +
    '<td class="share-label"><label for="share-option-' + option.name + '">' + option.title + '</label></td>' +
    '</tr>'
  );
  var radio = element.find('[type=radio]');

  if (option.default) {
    selectedOption = element;
    element.addClass('selected');
    radio.prop('checked', true);
    updateUrls(data);
  }
  var changeHandler = onShareOptionChangeTo(element, option.value);
  element.on('click', changeHandler);
  return element;
}

/**
 * Creates an html table element to wrap all share buttons
 * @returns {jQuery|HTMLElement} share button wrapper reference
 */
function createShareList(params) {
  shareOptions[0].title = params.show.title;
  shareOptions[1].title = params.title;
  var table = $('<table class="share-button-wrapper" data-toggle="buttons"><caption>Podcast teilen</caption><tbody></tbody</table>');
  table.append(shareOptions.map(createOption));
  return table;
}

/**
 * create sharing buttons in a form
 * @returns {jQuery} form element reference
 */
function createShareOptions(params) {
  var form = $('<form>' +
    '<h3>Was möchtest du teilen?</h3>' +
  '</form>');
  form.append(createShareList(params));
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
    title: 'Teilen anzeigen / verbergen',
    name: 'podlovewebplayer_share',
    headline: 'Teilen'
  });

  shareButtons = new SocialButtonList(services, getShareData('episode'));
  linkInput = $('<h3>Direkter Link</h3>' +
    '<input type="url" name="share-link-url" readonly>');
  linkInput.update = function(data) {
    this.val(data.rawUrl);
  };

  shareTab.createMainContent('')
    .append(createShareOptions(params))
    .append('<h3>Teilen via ...</h3>')
    .append(shareButtons.list);
  shareTab.createFooter('').append(linkInput);

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

var parseTimecode = require('./timecode').parse;

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
  console.log('MediaElement', me);
}

module.exports = {
  create: create,
  defaults: defaults,
  players: players
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/player.js","/")
},{"./timecode":21,"buffer":2,"oMfpAn":5}],16:[function(require,module,exports){
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

  this.list = $('<ul class="social-network-buttons"></ul>');
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
TabRegistry.prototype.add = function(tab) {
  if (tab === null) { return; }
  this.tabs.push(tab);
  this.container.append(tab.box);
  tab.toggle = this.createToggleFor(tab);
};

TabRegistry.prototype.openInitial = function (tabName) {
  if (!tabName) {
    return;
  }
  var matchingTabs = this.tabs.filter(function (tab) {
    return (tab.headline === tabName);
  });
  if (matchingTabs.length === 0) {
    console.warn('TabRegistry.openInitial: Could not open tab', tabName);
  }
  var initialActiveTab = matchingTabs.pop();
  initialActiveTab.open();
  this.activeTab = initialActiveTab;
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
},{"buffer":2,"oMfpAn":5}],21:[function(require,module,exports){
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
var cap = require('./util').cap;

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

function stopOnEndTime() {
  if (this.currentTime >= this.endTime) {
    console.log('ENDTIME REACHED');
    this.player.stop();
    delete this.endTime;
  }
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
  this.modules = [];
  this.listeners = [logCurrentTime];
  this.currentTime = -1;
  this.duration = data.duration;
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
  if (module.data) {
    this.data = module.data;
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
  console.debug('Timeline', 'seek', time);
  this.currentTime = cap(time, 0, this.duration);
  this.setTime(this.currentTime);
};

Timeline.prototype.stopAt = function (time) {
  if (!time || time <= 0 || time > this.duration) {
    return console.warn('Timeline', 'stopAt', 'time out of bounds', time);
  }
  var self = this;
  this.endTime = time;
  this.listeners.push(function () {
    stopOnEndTime.call(self);
  });
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

module.exports = Timeline;

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/timeline.js","/")
},{"./util":24,"buffer":2,"oMfpAn":5}],23:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZC9tZWRpYWVsZW1lbnQuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9jb250cm9scy5qcyIsIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL2VtYmVkLmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvZmFrZV82ZmFlMDYyOS5qcyIsIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvY2hhcHRlci5qcyIsIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvZG93bmxvYWRzLmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9pbmZvLmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9wcm9ncmVzc2Jhci5qcyIsIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL21vZHVsZXMvc2F2ZXRpbWUuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL3NoYXJlLmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvcGxheWVyLmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLWJ1dHRvbi1saXN0LmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLW5ldHdvcmsuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9zb2NpYWwtbmV0d29ya3MuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWIuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWJyZWdpc3RyeS5qcyIsIi9Vc2Vycy9hbGV4YW5kcmEvUFJPSkVLVEUvcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3RpbWVjb2RlLmpzIiwiL1VzZXJzL2FsZXhhbmRyYS9QUk9KRUtURS9wb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvdGltZWxpbmUuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91cmwuanMiLCIvVXNlcnMvYWxleGFuZHJhL1BST0pFS1RFL3BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICpcbiAqIE1lZGlhRWxlbWVudC5qc1xuICogSFRNTDUgPHZpZGVvPiBhbmQgPGF1ZGlvPiBzaGltIGFuZCBwbGF5ZXJcbiAqIGh0dHA6Ly9tZWRpYWVsZW1lbnRqcy5jb20vXG4gKlxuICogQ3JlYXRlcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRoYXQgbWltaWNzIEhUTUw1IE1lZGlhRWxlbWVudCBBUElcbiAqIGZvciBicm93c2VycyB0aGF0IGRvbid0IHVuZGVyc3RhbmQgSFRNTDUgb3IgY2FuJ3QgcGxheSB0aGUgcHJvdmlkZWQgY29kZWNcbiAqIENhbiBwbGF5IE1QNCAoSC4yNjQpLCBPZ2csIFdlYk0sIEZMViwgV01WLCBXTUEsIEFDQywgYW5kIE1QM1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQsIEpvaG4gRHllciAoaHR0cDovL2ouaG4pXG4gKiBMaWNlbnNlOiBNSVRcbiAqXG4gKi9cbi8vIE5hbWVzcGFjZVxudmFyIG1lanMgPSBtZWpzIHx8IHt9O1xuXG4vLyB2ZXJzaW9uIG51bWJlclxubWVqcy52ZXJzaW9uID0gJzIuMTYuNCc7IFxuXG5cbi8vIHBsYXllciBudW1iZXIgKGZvciBtaXNzaW5nLCBzYW1lIGlkIGF0dHIpXG5tZWpzLm1lSW5kZXggPSAwO1xuXG4vLyBtZWRpYSB0eXBlcyBhY2NlcHRlZCBieSBwbHVnaW5zXG5tZWpzLnBsdWdpbnMgPSB7XG5cdHNpbHZlcmxpZ2h0OiBbXG5cdFx0e3ZlcnNpb246IFszLDBdLCB0eXBlczogWyd2aWRlby9tcDQnLCd2aWRlby9tNHYnLCd2aWRlby9tb3YnLCd2aWRlby93bXYnLCdhdWRpby93bWEnLCdhdWRpby9tNGEnLCdhdWRpby9tcDMnLCdhdWRpby93YXYnLCdhdWRpby9tcGVnJ119XG5cdF0sXG5cdGZsYXNoOiBbXG5cdFx0e3ZlcnNpb246IFs5LDAsMTI0XSwgdHlwZXM6IFsndmlkZW8vbXA0JywndmlkZW8vbTR2JywndmlkZW8vbW92JywndmlkZW8vZmx2JywndmlkZW8vcnRtcCcsJ3ZpZGVvL3gtZmx2JywnYXVkaW8vZmx2JywnYXVkaW8veC1mbHYnLCdhdWRpby9tcDMnLCdhdWRpby9tNGEnLCdhdWRpby9tcGVnJywgJ3ZpZGVvL3lvdXR1YmUnLCAndmlkZW8veC15b3V0dWJlJywgJ2FwcGxpY2F0aW9uL3gtbXBlZ1VSTCddfVxuXHRcdC8vLHt2ZXJzaW9uOiBbMTIsMF0sIHR5cGVzOiBbJ3ZpZGVvL3dlYm0nXX0gLy8gZm9yIGZ1dHVyZSByZWZlcmVuY2UgKGhvcGVmdWxseSEpXG5cdF0sXG5cdHlvdXR1YmU6IFtcblx0XHR7dmVyc2lvbjogbnVsbCwgdHlwZXM6IFsndmlkZW8veW91dHViZScsICd2aWRlby94LXlvdXR1YmUnLCAnYXVkaW8veW91dHViZScsICdhdWRpby94LXlvdXR1YmUnXX1cblx0XSxcblx0dmltZW86IFtcblx0XHR7dmVyc2lvbjogbnVsbCwgdHlwZXM6IFsndmlkZW8vdmltZW8nLCAndmlkZW8veC12aW1lbyddfVxuXHRdXG59O1xuXG4vKlxuVXRpbGl0eSBtZXRob2RzXG4qL1xubWVqcy5VdGlsaXR5ID0ge1xuXHRlbmNvZGVVcmw6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodXJsKTsgLy8ucmVwbGFjZSgvXFw/L2dpLCclM0YnKS5yZXBsYWNlKC89L2dpLCclM0QnKS5yZXBsYWNlKC8mL2dpLCclMjYnKTtcblx0fSxcblx0ZXNjYXBlSFRNTDogZnVuY3Rpb24ocykge1xuXHRcdHJldHVybiBzLnRvU3RyaW5nKCkuc3BsaXQoJyYnKS5qb2luKCcmYW1wOycpLnNwbGl0KCc8Jykuam9pbignJmx0OycpLnNwbGl0KCdcIicpLmpvaW4oJyZxdW90OycpO1xuXHR9LFxuXHRhYnNvbHV0aXplVXJsOiBmdW5jdGlvbih1cmwpIHtcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRlbC5pbm5lckhUTUwgPSAnPGEgaHJlZj1cIicgKyB0aGlzLmVzY2FwZUhUTUwodXJsKSArICdcIj54PC9hPic7XG5cdFx0cmV0dXJuIGVsLmZpcnN0Q2hpbGQuaHJlZjtcblx0fSxcblx0Z2V0U2NyaXB0UGF0aDogZnVuY3Rpb24oc2NyaXB0TmFtZXMpIHtcblx0XHR2YXJcblx0XHRcdGkgPSAwLFxuXHRcdFx0aixcblx0XHRcdGNvZGVQYXRoID0gJycsXG5cdFx0XHR0ZXN0bmFtZSA9ICcnLFxuXHRcdFx0c2xhc2hQb3MsXG5cdFx0XHRmaWxlbmFtZVBvcyxcblx0XHRcdHNjcmlwdFVybCxcblx0XHRcdHNjcmlwdFBhdGgsXHRcdFx0XG5cdFx0XHRzY3JpcHRGaWxlbmFtZSxcblx0XHRcdHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksXG5cdFx0XHRpbCA9IHNjcmlwdHMubGVuZ3RoLFxuXHRcdFx0amwgPSBzY3JpcHROYW1lcy5sZW5ndGg7XG5cdFx0XHRcblx0XHQvLyBnbyB0aHJvdWdoIGFsbCA8c2NyaXB0PiB0YWdzXG5cdFx0Zm9yICg7IGkgPCBpbDsgaSsrKSB7XG5cdFx0XHRzY3JpcHRVcmwgPSBzY3JpcHRzW2ldLnNyYztcblx0XHRcdHNsYXNoUG9zID0gc2NyaXB0VXJsLmxhc3RJbmRleE9mKCcvJyk7XG5cdFx0XHRpZiAoc2xhc2hQb3MgPiAtMSkge1xuXHRcdFx0XHRzY3JpcHRGaWxlbmFtZSA9IHNjcmlwdFVybC5zdWJzdHJpbmcoc2xhc2hQb3MgKyAxKTtcblx0XHRcdFx0c2NyaXB0UGF0aCA9IHNjcmlwdFVybC5zdWJzdHJpbmcoMCwgc2xhc2hQb3MgKyAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNjcmlwdEZpbGVuYW1lID0gc2NyaXB0VXJsO1xuXHRcdFx0XHRzY3JpcHRQYXRoID0gJyc7XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIHNlZSBpZiBhbnkgPHNjcmlwdD4gdGFncyBoYXZlIGEgZmlsZSBuYW1lIHRoYXQgbWF0Y2hlcyB0aGUgXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgamw7IGorKykge1xuXHRcdFx0XHR0ZXN0bmFtZSA9IHNjcmlwdE5hbWVzW2pdO1xuXHRcdFx0XHRmaWxlbmFtZVBvcyA9IHNjcmlwdEZpbGVuYW1lLmluZGV4T2YodGVzdG5hbWUpO1xuXHRcdFx0XHRpZiAoZmlsZW5hbWVQb3MgPiAtMSkge1xuXHRcdFx0XHRcdGNvZGVQYXRoID0gc2NyaXB0UGF0aDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBpZiB3ZSBmb3VuZCBhIHBhdGgsIHRoZW4gYnJlYWsgYW5kIHJldHVybiBpdFxuXHRcdFx0aWYgKGNvZGVQYXRoICE9PSAnJykge1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gc2VuZCB0aGUgYmVzdCBwYXRoIGJhY2tcblx0XHRyZXR1cm4gY29kZVBhdGg7XG5cdH0sXG5cdHNlY29uZHNUb1RpbWVDb2RlOiBmdW5jdGlvbih0aW1lLCBmb3JjZUhvdXJzLCBzaG93RnJhbWVDb3VudCwgZnBzKSB7XG5cdFx0Ly9hZGQgZnJhbWVjb3VudFxuXHRcdGlmICh0eXBlb2Ygc2hvd0ZyYW1lQ291bnQgPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQgICAgc2hvd0ZyYW1lQ291bnQ9ZmFsc2U7XG5cdFx0fSBlbHNlIGlmKHR5cGVvZiBmcHMgPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQgICAgZnBzID0gMjU7XG5cdFx0fVxuXHRcblx0XHR2YXIgaG91cnMgPSBNYXRoLmZsb29yKHRpbWUgLyAzNjAwKSAlIDI0LFxuXHRcdFx0bWludXRlcyA9IE1hdGguZmxvb3IodGltZSAvIDYwKSAlIDYwLFxuXHRcdFx0c2Vjb25kcyA9IE1hdGguZmxvb3IodGltZSAlIDYwKSxcblx0XHRcdGZyYW1lcyA9IE1hdGguZmxvb3IoKCh0aW1lICUgMSkqZnBzKS50b0ZpeGVkKDMpKSxcblx0XHRcdHJlc3VsdCA9IFxuXHRcdFx0XHRcdCggKGZvcmNlSG91cnMgfHwgaG91cnMgPiAwKSA/IChob3VycyA8IDEwID8gJzAnICsgaG91cnMgOiBob3VycykgKyAnOicgOiAnJylcblx0XHRcdFx0XHRcdCsgKG1pbnV0ZXMgPCAxMCA/ICcwJyArIG1pbnV0ZXMgOiBtaW51dGVzKSArICc6J1xuXHRcdFx0XHRcdFx0KyAoc2Vjb25kcyA8IDEwID8gJzAnICsgc2Vjb25kcyA6IHNlY29uZHMpXG5cdFx0XHRcdFx0XHQrICgoc2hvd0ZyYW1lQ291bnQpID8gJzonICsgKGZyYW1lcyA8IDEwID8gJzAnICsgZnJhbWVzIDogZnJhbWVzKSA6ICcnKTtcblx0XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0XG5cdHRpbWVDb2RlVG9TZWNvbmRzOiBmdW5jdGlvbihoaF9tbV9zc19mZiwgZm9yY2VIb3Vycywgc2hvd0ZyYW1lQ291bnQsIGZwcyl7XG5cdFx0aWYgKHR5cGVvZiBzaG93RnJhbWVDb3VudCA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBzaG93RnJhbWVDb3VudD1mYWxzZTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZwcyA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBmcHMgPSAyNTtcblx0XHR9XG5cdFxuXHRcdHZhciB0Y19hcnJheSA9IGhoX21tX3NzX2ZmLnNwbGl0KFwiOlwiKSxcblx0XHRcdHRjX2hoID0gcGFyc2VJbnQodGNfYXJyYXlbMF0sIDEwKSxcblx0XHRcdHRjX21tID0gcGFyc2VJbnQodGNfYXJyYXlbMV0sIDEwKSxcblx0XHRcdHRjX3NzID0gcGFyc2VJbnQodGNfYXJyYXlbMl0sIDEwKSxcblx0XHRcdHRjX2ZmID0gMCxcblx0XHRcdHRjX2luX3NlY29uZHMgPSAwO1xuXHRcdFxuXHRcdGlmIChzaG93RnJhbWVDb3VudCkge1xuXHRcdCAgICB0Y19mZiA9IHBhcnNlSW50KHRjX2FycmF5WzNdKS9mcHM7XG5cdFx0fVxuXHRcdFxuXHRcdHRjX2luX3NlY29uZHMgPSAoIHRjX2hoICogMzYwMCApICsgKCB0Y19tbSAqIDYwICkgKyB0Y19zcyArIHRjX2ZmO1xuXHRcdFxuXHRcdHJldHVybiB0Y19pbl9zZWNvbmRzO1xuXHR9LFxuXHRcblxuXHRjb252ZXJ0U01QVEV0b1NlY29uZHM6IGZ1bmN0aW9uIChTTVBURSkge1xuXHRcdGlmICh0eXBlb2YgU01QVEUgIT0gJ3N0cmluZycpIFxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0U01QVEUgPSBTTVBURS5yZXBsYWNlKCcsJywgJy4nKTtcblx0XHRcblx0XHR2YXIgc2VjcyA9IDAsXG5cdFx0XHRkZWNpbWFsTGVuID0gKFNNUFRFLmluZGV4T2YoJy4nKSAhPSAtMSkgPyBTTVBURS5zcGxpdCgnLicpWzFdLmxlbmd0aCA6IDAsXG5cdFx0XHRtdWx0aXBsaWVyID0gMTtcblx0XHRcblx0XHRTTVBURSA9IFNNUFRFLnNwbGl0KCc6JykucmV2ZXJzZSgpO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgU01QVEUubGVuZ3RoOyBpKyspIHtcblx0XHRcdG11bHRpcGxpZXIgPSAxO1xuXHRcdFx0aWYgKGkgPiAwKSB7XG5cdFx0XHRcdG11bHRpcGxpZXIgPSBNYXRoLnBvdyg2MCwgaSk7IFxuXHRcdFx0fVxuXHRcdFx0c2VjcyArPSBOdW1iZXIoU01QVEVbaV0pICogbXVsdGlwbGllcjtcblx0XHR9XG5cdFx0cmV0dXJuIE51bWJlcihzZWNzLnRvRml4ZWQoZGVjaW1hbExlbikpO1xuXHR9LFx0XG5cdFxuXHQvKiBib3Jyb3dlZCBmcm9tIFNXRk9iamVjdDogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3N3Zm9iamVjdC9zb3VyY2UvYnJvd3NlL3RydW5rL3N3Zm9iamVjdC9zcmMvc3dmb2JqZWN0LmpzIzQ3NCAqL1xuXHRyZW1vdmVTd2Y6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIG9iaiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblx0XHRpZiAob2JqICYmIC9vYmplY3R8ZW1iZWQvaS50ZXN0KG9iai5ub2RlTmFtZSkpIHtcblx0XHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNJRSkge1xuXHRcdFx0XHRvYmouc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHRcdFx0XHQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZiAob2JqLnJlYWR5U3RhdGUgPT0gNCkge1xuXHRcdFx0XHRcdFx0bWVqcy5VdGlsaXR5LnJlbW92ZU9iamVjdEluSUUoaWQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsIDEwKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvYmoucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvYmopO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cmVtb3ZlT2JqZWN0SW5JRTogZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgb2JqID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXHRcdGlmIChvYmopIHtcblx0XHRcdGZvciAodmFyIGkgaW4gb2JqKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygb2JqW2ldID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdG9ialtpXSA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9iai5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9iaik7XG5cdFx0fVx0XHRcblx0fVxufTtcblxuXG4vLyBDb3JlIGRldGVjdG9yLCBwbHVnaW5zIGFyZSBhZGRlZCBiZWxvd1xubWVqcy5QbHVnaW5EZXRlY3RvciA9IHtcblxuXHQvLyBtYWluIHB1YmxpYyBmdW5jdGlvbiB0byB0ZXN0IGEgcGx1ZyB2ZXJzaW9uIG51bWJlciBQbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKCdmbGFzaCcsWzksMCwxMjVdKTtcblx0aGFzUGx1Z2luVmVyc2lvbjogZnVuY3Rpb24ocGx1Z2luLCB2KSB7XG5cdFx0dmFyIHB2ID0gdGhpcy5wbHVnaW5zW3BsdWdpbl07XG5cdFx0dlsxXSA9IHZbMV0gfHwgMDtcblx0XHR2WzJdID0gdlsyXSB8fCAwO1xuXHRcdHJldHVybiAocHZbMF0gPiB2WzBdIHx8IChwdlswXSA9PSB2WzBdICYmIHB2WzFdID4gdlsxXSkgfHwgKHB2WzBdID09IHZbMF0gJiYgcHZbMV0gPT0gdlsxXSAmJiBwdlsyXSA+PSB2WzJdKSkgPyB0cnVlIDogZmFsc2U7XG5cdH0sXG5cblx0Ly8gY2FjaGVkIHZhbHVlc1xuXHRuYXY6IHdpbmRvdy5uYXZpZ2F0b3IsXG5cdHVhOiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFxuXG5cdC8vIHN0b3JlZCB2ZXJzaW9uIG51bWJlcnNcblx0cGx1Z2luczogW10sXG5cblx0Ly8gcnVucyBkZXRlY3RQbHVnaW4oKSBhbmQgc3RvcmVzIHRoZSB2ZXJzaW9uIG51bWJlclxuXHRhZGRQbHVnaW46IGZ1bmN0aW9uKHAsIHBsdWdpbk5hbWUsIG1pbWVUeXBlLCBhY3RpdmVYLCBheERldGVjdCkge1xuXHRcdHRoaXMucGx1Z2luc1twXSA9IHRoaXMuZGV0ZWN0UGx1Z2luKHBsdWdpbk5hbWUsIG1pbWVUeXBlLCBhY3RpdmVYLCBheERldGVjdCk7XG5cdH0sXG5cblx0Ly8gZ2V0IHRoZSB2ZXJzaW9uIG51bWJlciBmcm9tIHRoZSBtaW1ldHlwZSAoYWxsIGJ1dCBJRSkgb3IgQWN0aXZlWCAoSUUpXG5cdGRldGVjdFBsdWdpbjogZnVuY3Rpb24ocGx1Z2luTmFtZSwgbWltZVR5cGUsIGFjdGl2ZVgsIGF4RGV0ZWN0KSB7XG5cblx0XHR2YXIgdmVyc2lvbiA9IFswLDAsMF0sXG5cdFx0XHRkZXNjcmlwdGlvbixcblx0XHRcdGksXG5cdFx0XHRheDtcblxuXHRcdC8vIEZpcmVmb3gsIFdlYmtpdCwgT3BlcmFcblx0XHRpZiAodHlwZW9mKHRoaXMubmF2LnBsdWdpbnMpICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLm5hdi5wbHVnaW5zW3BsdWdpbk5hbWVdID09ICdvYmplY3QnKSB7XG5cdFx0XHRkZXNjcmlwdGlvbiA9IHRoaXMubmF2LnBsdWdpbnNbcGx1Z2luTmFtZV0uZGVzY3JpcHRpb247XG5cdFx0XHRpZiAoZGVzY3JpcHRpb24gJiYgISh0eXBlb2YgdGhpcy5uYXYubWltZVR5cGVzICE9ICd1bmRlZmluZWQnICYmIHRoaXMubmF2Lm1pbWVUeXBlc1ttaW1lVHlwZV0gJiYgIXRoaXMubmF2Lm1pbWVUeXBlc1ttaW1lVHlwZV0uZW5hYmxlZFBsdWdpbikpIHtcblx0XHRcdFx0dmVyc2lvbiA9IGRlc2NyaXB0aW9uLnJlcGxhY2UocGx1Z2luTmFtZSwgJycpLnJlcGxhY2UoL15cXHMrLywnJykucmVwbGFjZSgvXFxzci9naSwnLicpLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGZvciAoaT0wOyBpPHZlcnNpb24ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2ZXJzaW9uW2ldID0gcGFyc2VJbnQodmVyc2lvbltpXS5tYXRjaCgvXFxkKy8pLCAxMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHQvLyBJbnRlcm5ldCBFeHBsb3JlciAvIEFjdGl2ZVhcblx0XHR9IGVsc2UgaWYgKHR5cGVvZih3aW5kb3cuQWN0aXZlWE9iamVjdCkgIT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF4ID0gbmV3IEFjdGl2ZVhPYmplY3QoYWN0aXZlWCk7XG5cdFx0XHRcdGlmIChheCkge1xuXHRcdFx0XHRcdHZlcnNpb24gPSBheERldGVjdChheCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKSB7IH1cblx0XHR9XG5cdFx0cmV0dXJuIHZlcnNpb247XG5cdH1cbn07XG5cbi8vIEFkZCBGbGFzaCBkZXRlY3Rpb25cbm1lanMuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdmbGFzaCcsJ1Nob2Nrd2F2ZSBGbGFzaCcsJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJywnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnLCBmdW5jdGlvbihheCkge1xuXHQvLyBhZGFwdGVkIGZyb20gU1dGT2JqZWN0XG5cdHZhciB2ZXJzaW9uID0gW10sXG5cdFx0ZCA9IGF4LkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7XG5cdGlmIChkKSB7XG5cdFx0ZCA9IGQuc3BsaXQoXCIgXCIpWzFdLnNwbGl0KFwiLFwiKTtcblx0XHR2ZXJzaW9uID0gW3BhcnNlSW50KGRbMF0sIDEwKSwgcGFyc2VJbnQoZFsxXSwgMTApLCBwYXJzZUludChkWzJdLCAxMCldO1xuXHR9XG5cdHJldHVybiB2ZXJzaW9uO1xufSk7XG5cbi8vIEFkZCBTaWx2ZXJsaWdodCBkZXRlY3Rpb25cbm1lanMuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdzaWx2ZXJsaWdodCcsJ1NpbHZlcmxpZ2h0IFBsdWctSW4nLCdhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LTInLCdBZ0NvbnRyb2wuQWdDb250cm9sJywgZnVuY3Rpb24gKGF4KSB7XG5cdC8vIFNpbHZlcmxpZ2h0IGNhbm5vdCByZXBvcnQgaXRzIHZlcnNpb24gbnVtYmVyIHRvIElFXG5cdC8vIGJ1dCBpdCBkb2VzIGhhdmUgYSBpc1ZlcnNpb25TdXBwb3J0ZWQgZnVuY3Rpb24sIHNvIHdlIGhhdmUgdG8gbG9vcCB0aHJvdWdoIGl0IHRvIGdldCBhIHZlcnNpb24gbnVtYmVyLlxuXHQvLyBhZGFwdGVkIGZyb20gaHR0cDovL3d3dy5zaWx2ZXJsaWdodHZlcnNpb24uY29tL1xuXHR2YXIgdiA9IFswLDAsMCwwXSxcblx0XHRsb29wTWF0Y2ggPSBmdW5jdGlvbihheCwgdiwgaSwgbikge1xuXHRcdFx0d2hpbGUoYXguaXNWZXJzaW9uU3VwcG9ydGVkKHZbMF0rIFwiLlwiKyB2WzFdICsgXCIuXCIgKyB2WzJdICsgXCIuXCIgKyB2WzNdKSl7XG5cdFx0XHRcdHZbaV0rPW47XG5cdFx0XHR9XG5cdFx0XHR2W2ldIC09IG47XG5cdFx0fTtcblx0bG9vcE1hdGNoKGF4LCB2LCAwLCAxKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAxLCAxKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAyLCAxMDAwMCk7IC8vIHRoZSB0aGlyZCBwbGFjZSBpbiB0aGUgdmVyc2lvbiBudW1iZXIgaXMgdXN1YWxseSA1IGRpZ2l0cyAoNC4wLnh4eHh4KVxuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMDApO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMCk7XG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMTApO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEpO1xuXHRsb29wTWF0Y2goYXgsIHYsIDMsIDEpO1xuXG5cdHJldHVybiB2O1xufSk7XG4vLyBhZGQgYWRvYmUgYWNyb2JhdFxuLypcblBsdWdpbkRldGVjdG9yLmFkZFBsdWdpbignYWNyb2JhdCcsJ0Fkb2JlIEFjcm9iYXQnLCdhcHBsaWNhdGlvbi9wZGYnLCdBY3JvUERGLlBERicsIGZ1bmN0aW9uIChheCkge1xuXHR2YXIgdmVyc2lvbiA9IFtdLFxuXHRcdGQgPSBheC5HZXRWZXJzaW9ucygpLnNwbGl0KCcsJylbMF0uc3BsaXQoJz0nKVsxXS5zcGxpdCgnLicpO1xuXG5cdGlmIChkKSB7XG5cdFx0dmVyc2lvbiA9IFtwYXJzZUludChkWzBdLCAxMCksIHBhcnNlSW50KGRbMV0sIDEwKSwgcGFyc2VJbnQoZFsyXSwgMTApXTtcblx0fVxuXHRyZXR1cm4gdmVyc2lvbjtcbn0pO1xuKi9cbi8vIG5lY2Vzc2FyeSBkZXRlY3Rpb24gKGZpeGVzIGZvciA8SUU5KVxubWVqcy5NZWRpYUZlYXR1cmVzID0ge1xuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHR2YXJcblx0XHRcdHQgPSB0aGlzLFxuXHRcdFx0ZCA9IGRvY3VtZW50LFxuXHRcdFx0bmF2ID0gbWVqcy5QbHVnaW5EZXRlY3Rvci5uYXYsXG5cdFx0XHR1YSA9IG1lanMuUGx1Z2luRGV0ZWN0b3IudWEudG9Mb3dlckNhc2UoKSxcblx0XHRcdGksXG5cdFx0XHR2LFxuXHRcdFx0aHRtbDVFbGVtZW50cyA9IFsnc291cmNlJywndHJhY2snLCdhdWRpbycsJ3ZpZGVvJ107XG5cblx0XHQvLyBkZXRlY3QgYnJvd3NlcnMgKG9ubHkgdGhlIG9uZXMgdGhhdCBoYXZlIHNvbWUga2luZCBvZiBxdWlyayB3ZSBuZWVkIHRvIHdvcmsgYXJvdW5kKVxuXHRcdHQuaXNpUGFkID0gKHVhLm1hdGNoKC9pcGFkL2kpICE9PSBudWxsKTtcblx0XHR0LmlzaVBob25lID0gKHVhLm1hdGNoKC9pcGhvbmUvaSkgIT09IG51bGwpO1xuXHRcdHQuaXNpT1MgPSB0LmlzaVBob25lIHx8IHQuaXNpUGFkO1xuXHRcdHQuaXNBbmRyb2lkID0gKHVhLm1hdGNoKC9hbmRyb2lkL2kpICE9PSBudWxsKTtcblx0XHR0LmlzQnVzdGVkQW5kcm9pZCA9ICh1YS5tYXRjaCgvYW5kcm9pZCAyXFwuWzEyXS8pICE9PSBudWxsKTtcblx0XHR0LmlzQnVzdGVkTmF0aXZlSFRUUFMgPSAobG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonICYmICh1YS5tYXRjaCgvYW5kcm9pZCBbMTJdXFwuLykgIT09IG51bGwgfHwgdWEubWF0Y2goL21hY2ludG9zaC4qIHZlcnNpb24uKiBzYWZhcmkvKSAhPT0gbnVsbCkpO1xuXHRcdHQuaXNJRSA9IChuYXYuYXBwTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJtaWNyb3NvZnRcIikgIT0gLTEgfHwgbmF2LmFwcE5hbWUudG9Mb3dlckNhc2UoKS5tYXRjaCgvdHJpZGVudC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNDaHJvbWUgPSAodWEubWF0Y2goL2Nocm9tZS9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNDaHJvbWl1bSA9ICh1YS5tYXRjaCgvY2hyb21pdW0vZ2kpICE9PSBudWxsKTtcblx0XHR0LmlzRmlyZWZveCA9ICh1YS5tYXRjaCgvZmlyZWZveC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNXZWJraXQgPSAodWEubWF0Y2goL3dlYmtpdC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNHZWNrbyA9ICh1YS5tYXRjaCgvZ2Vja28vZ2kpICE9PSBudWxsKSAmJiAhdC5pc1dlYmtpdCAmJiAhdC5pc0lFO1xuXHRcdHQuaXNPcGVyYSA9ICh1YS5tYXRjaCgvb3BlcmEvZ2kpICE9PSBudWxsKTtcblx0XHR0Lmhhc1RvdWNoID0gKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyk7IC8vICAmJiB3aW5kb3cub250b3VjaHN0YXJ0ICE9IG51bGwpOyAvLyB0aGlzIGJyZWFrcyBpT1MgN1xuXHRcdFxuXHRcdC8vIGJvcnJvd2VkIGZyb20gTW9kZXJuaXpyXG5cdFx0dC5zdmcgPSAhISBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiZcblx0XHRcdFx0ISEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3N2ZycpLmNyZWF0ZVNWR1JlY3Q7XG5cblx0XHQvLyBjcmVhdGUgSFRNTDUgbWVkaWEgZWxlbWVudHMgZm9yIElFIGJlZm9yZSA5LCBnZXQgYSA8dmlkZW8+IGVsZW1lbnQgZm9yIGZ1bGxzY3JlZW4gZGV0ZWN0aW9uXG5cdFx0Zm9yIChpPTA7IGk8aHRtbDVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0diA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaHRtbDVFbGVtZW50c1tpXSk7XG5cdFx0fVxuXHRcdFxuXHRcdHQuc3VwcG9ydHNNZWRpYVRhZyA9ICh0eXBlb2Ygdi5jYW5QbGF5VHlwZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdC5pc0J1c3RlZEFuZHJvaWQpO1xuXG5cdFx0Ly8gRml4IGZvciBJRTkgb24gV2luZG93cyA3TiAvIFdpbmRvd3MgN0tOIChNZWRpYSBQbGF5ZXIgbm90IGluc3RhbGxlcilcblx0XHR0cnl7XG5cdFx0XHR2LmNhblBsYXlUeXBlKFwidmlkZW8vbXA0XCIpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdHQuc3VwcG9ydHNNZWRpYVRhZyA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGRldGVjdCBuYXRpdmUgSmF2YVNjcmlwdCBmdWxsc2NyZWVuIChTYWZhcmkvRmlyZWZveCBvbmx5LCBDaHJvbWUgc3RpbGwgZmFpbHMpXG5cdFx0XG5cdFx0Ly8gaU9TXG5cdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi53ZWJraXRFbnRlckZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHQvLyBXM0Ncblx0XHR0Lmhhc05hdGl2ZUZ1bGxzY3JlZW4gPSAodHlwZW9mIHYucmVxdWVzdEZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHQvLyB3ZWJraXQvZmlyZWZveC9JRTExK1xuXHRcdHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi5tb3pSZXF1ZXN0RnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2Lm1zUmVxdWVzdEZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHR0Lmhhc1RydWVOYXRpdmVGdWxsU2NyZWVuID0gKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbiB8fCB0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4gfHwgdC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pO1xuXHRcdHQubmF0aXZlRnVsbFNjcmVlbkVuYWJsZWQgPSB0Lmhhc1RydWVOYXRpdmVGdWxsU2NyZWVuO1xuXHRcdFxuXHRcdC8vIEVuYWJsZWQ/XG5cdFx0aWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0dC5uYXRpdmVGdWxsU2NyZWVuRW5hYmxlZCA9IGRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbmFibGVkO1xuXHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdHQubmF0aXZlRnVsbFNjcmVlbkVuYWJsZWQgPSBkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbmFibGVkO1x0XHRcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHQuaXNDaHJvbWUpIHtcblx0XHRcdHQuaGFzU2VtaU5hdGl2ZUZ1bGxTY3JlZW4gPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHQuaGFzVHJ1ZU5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFxuXHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJyc7XG5cdFx0XHRpZiAodC5oYXNXZWJraXROYXRpdmVGdWxsU2NyZWVuKSB7IFxuXHRcdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSc7XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJ21vemZ1bGxzY3JlZW5jaGFuZ2UnO1xuXHRcdFx0XHRcblx0XHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJ01TRnVsbHNjcmVlbkNoYW5nZSc7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHQuaXNGdWxsU2NyZWVuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC5tb3pGdWxsU2NyZWVuO1xuXHRcdFx0XHRcblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC53ZWJraXRJc0Z1bGxTY3JlZW47XG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGQubXNGdWxsc2NyZWVuRWxlbWVudCAhPT0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0dC5yZXF1ZXN0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uKGVsKSB7XG5cdFx0XG5cdFx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRlbC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLm1velJlcXVlc3RGdWxsU2NyZWVuKCk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLm1zUmVxdWVzdEZ1bGxzY3JlZW4oKTtcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHQuY2FuY2VsRnVsbFNjcmVlbiA9IGZ1bmN0aW9uKCkge1x0XHRcdFx0XG5cdFx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRkb2N1bWVudC53ZWJraXRDYW5jZWxGdWxsU2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XHRcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRcblx0XHQvLyBPUyBYIDEwLjUgY2FuJ3QgZG8gdGhpcyBldmVuIGlmIGl0IHNheXMgaXQgY2FuIDooXG5cdFx0aWYgKHQuaGFzU2VtaU5hdGl2ZUZ1bGxTY3JlZW4gJiYgdWEubWF0Y2goL21hYyBvcyB4IDEwXzUvaSkpIHtcblx0XHRcdHQuaGFzTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0fVxufTtcbm1lanMuTWVkaWFGZWF0dXJlcy5pbml0KCk7XG5cbi8qXG5leHRlbnNpb24gbWV0aG9kcyB0byA8dmlkZW8+IG9yIDxhdWRpbz4gb2JqZWN0IHRvIGJyaW5nIGl0IGludG8gcGFyaXR5IHdpdGggUGx1Z2luTWVkaWFFbGVtZW50IChzZWUgYmVsb3cpXG4qL1xubWVqcy5IdG1sTWVkaWFFbGVtZW50ID0ge1xuXHRwbHVnaW5UeXBlOiAnbmF0aXZlJyxcblx0aXNGdWxsU2NyZWVuOiBmYWxzZSxcblxuXHRzZXRDdXJyZW50VGltZTogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHR0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcblx0fSxcblxuXHRzZXRNdXRlZDogZnVuY3Rpb24gKG11dGVkKSB7XG5cdFx0dGhpcy5tdXRlZCA9IG11dGVkO1xuXHR9LFxuXG5cdHNldFZvbHVtZTogZnVuY3Rpb24gKHZvbHVtZSkge1xuXHRcdHRoaXMudm9sdW1lID0gdm9sdW1lO1xuXHR9LFxuXG5cdC8vIGZvciBwYXJpdHkgd2l0aCB0aGUgcGx1Z2luIHZlcnNpb25zXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnBhdXNlKCk7XG5cdH0sXG5cblx0Ly8gVGhpcyBjYW4gYmUgYSB1cmwgc3RyaW5nXG5cdC8vIG9yIGFuIGFycmF5IFt7c3JjOidmaWxlLm1wNCcsdHlwZTondmlkZW8vbXA0J30se3NyYzonZmlsZS53ZWJtJyx0eXBlOid2aWRlby93ZWJtJ31dXG5cdHNldFNyYzogZnVuY3Rpb24gKHVybCkge1xuXHRcdFxuXHRcdC8vIEZpeCBmb3IgSUU5IHdoaWNoIGNhbid0IHNldCAuc3JjIHdoZW4gdGhlcmUgYXJlIDxzb3VyY2U+IGVsZW1lbnRzLiBBd2Vzb21lLCByaWdodD9cblx0XHR2YXIgXG5cdFx0XHRleGlzdGluZ1NvdXJjZXMgPSB0aGlzLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKTtcblx0XHR3aGlsZSAoZXhpc3RpbmdTb3VyY2VzLmxlbmd0aCA+IDApe1xuXHRcdFx0dGhpcy5yZW1vdmVDaGlsZChleGlzdGluZ1NvdXJjZXNbMF0pO1xuXHRcdH1cblx0XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT0gJ3N0cmluZycpIHtcblx0XHRcdHRoaXMuc3JjID0gdXJsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaSwgbWVkaWE7XG5cblx0XHRcdGZvciAoaT0wOyBpPHVybC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRtZWRpYSA9IHVybFtpXTtcblx0XHRcdFx0aWYgKHRoaXMuY2FuUGxheVR5cGUobWVkaWEudHlwZSkpIHtcblx0XHRcdFx0XHR0aGlzLnNyYyA9IG1lZGlhLnNyYztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzZXRWaWRlb1NpemU6IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG59O1xuXG4vKlxuTWltaWNzIHRoZSA8dmlkZW8vYXVkaW8+IGVsZW1lbnQgYnkgY2FsbGluZyBGbGFzaCdzIEV4dGVybmFsIEludGVyZmFjZSBvciBTaWx2ZXJsaWdodHMgW1NjcmlwdGFibGVNZW1iZXJdXG4qL1xubWVqcy5QbHVnaW5NZWRpYUVsZW1lbnQgPSBmdW5jdGlvbiAocGx1Z2luaWQsIHBsdWdpblR5cGUsIG1lZGlhVXJsKSB7XG5cdHRoaXMuaWQgPSBwbHVnaW5pZDtcblx0dGhpcy5wbHVnaW5UeXBlID0gcGx1Z2luVHlwZTtcblx0dGhpcy5zcmMgPSBtZWRpYVVybDtcblx0dGhpcy5ldmVudHMgPSB7fTtcblx0dGhpcy5hdHRyaWJ1dGVzID0ge307XG59O1xuXG4vLyBKYXZhU2NyaXB0IHZhbHVlcyBhbmQgRXh0ZXJuYWxJbnRlcmZhY2UgbWV0aG9kcyB0aGF0IG1hdGNoIEhUTUw1IHZpZGVvIHByb3BlcnRpZXMgbWV0aG9kc1xuLy8gaHR0cDovL3d3dy5hZG9iZS5jb20vbGl2ZWRvY3MvZmxhc2gvOS4wL0FjdGlvblNjcmlwdExhbmdSZWZWMy9mbC92aWRlby9GTFZQbGF5YmFjay5odG1sXG4vLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS92aWRlby5odG1sXG5tZWpzLlBsdWdpbk1lZGlhRWxlbWVudC5wcm90b3R5cGUgPSB7XG5cblx0Ly8gc3BlY2lhbFxuXHRwbHVnaW5FbGVtZW50OiBudWxsLFxuXHRwbHVnaW5UeXBlOiAnJyxcblx0aXNGdWxsU2NyZWVuOiBmYWxzZSxcblxuXHQvLyBub3QgaW1wbGVtZW50ZWQgOihcblx0cGxheWJhY2tSYXRlOiAtMSxcblx0ZGVmYXVsdFBsYXliYWNrUmF0ZTogLTEsXG5cdHNlZWthYmxlOiBbXSxcblx0cGxheWVkOiBbXSxcblxuXHQvLyBIVE1MNSByZWFkLW9ubHkgcHJvcGVydGllc1xuXHRwYXVzZWQ6IHRydWUsXG5cdGVuZGVkOiBmYWxzZSxcblx0c2Vla2luZzogZmFsc2UsXG5cdGR1cmF0aW9uOiAwLFxuXHRlcnJvcjogbnVsbCxcblx0dGFnTmFtZTogJycsXG5cblx0Ly8gSFRNTDUgZ2V0L3NldCBwcm9wZXJ0aWVzLCBidXQgb25seSBzZXQgKHVwZGF0ZWQgYnkgZXZlbnQgaGFuZGxlcnMpXG5cdG11dGVkOiBmYWxzZSxcblx0dm9sdW1lOiAxLFxuXHRjdXJyZW50VGltZTogMCxcblxuXHQvLyBIVE1MNSBtZXRob2RzXG5cdHBsYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkucGxheVZpZGVvKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5wbGF5TWVkaWEoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucGF1c2VkID0gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRsb2FkOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5sb2FkTWVkaWEoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy5wYXVzZWQgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdHBhdXNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBhdXNlVmlkZW8oKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBhdXNlTWVkaWEoKTtcblx0XHRcdH1cdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHR0aGlzLnBhdXNlZCA9IHRydWU7XG5cdFx0fVxuXHR9LFxuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnN0b3BWaWRlbygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc3RvcE1lZGlhKCk7XG5cdFx0XHR9XHRcblx0XHRcdHRoaXMucGF1c2VkID0gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNhblBsYXlUeXBlOiBmdW5jdGlvbih0eXBlKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRqLFxuXHRcdFx0cGx1Z2luSW5mbyxcblx0XHRcdHBsdWdpblZlcnNpb25zID0gbWVqcy5wbHVnaW5zW3RoaXMucGx1Z2luVHlwZV07XG5cblx0XHRmb3IgKGk9MDsgaTxwbHVnaW5WZXJzaW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cGx1Z2luSW5mbyA9IHBsdWdpblZlcnNpb25zW2ldO1xuXG5cdFx0XHQvLyB0ZXN0IGlmIHVzZXIgaGFzIHRoZSBjb3JyZWN0IHBsdWdpbiB2ZXJzaW9uXG5cdFx0XHRpZiAobWVqcy5QbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKHRoaXMucGx1Z2luVHlwZSwgcGx1Z2luSW5mby52ZXJzaW9uKSkge1xuXG5cdFx0XHRcdC8vIHRlc3QgZm9yIHBsdWdpbiBwbGF5YmFjayB0eXBlc1xuXHRcdFx0XHRmb3IgKGo9MDsgajxwbHVnaW5JbmZvLnR5cGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0Ly8gZmluZCBwbHVnaW4gdGhhdCBjYW4gcGxheSB0aGUgdHlwZVxuXHRcdFx0XHRcdGlmICh0eXBlID09IHBsdWdpbkluZm8udHlwZXNbal0pIHtcblx0XHRcdFx0XHRcdHJldHVybiAncHJvYmFibHknO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAnJztcblx0fSxcblx0XG5cdHBvc2l0aW9uRnVsbHNjcmVlbkJ1dHRvbjogZnVuY3Rpb24oeCx5LHZpc2libGVBbmRBYm92ZSkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnBvc2l0aW9uRnVsbHNjcmVlbkJ1dHRvbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkucG9zaXRpb25GdWxsc2NyZWVuQnV0dG9uKE1hdGguZmxvb3IoeCksTWF0aC5mbG9vcih5KSx2aXNpYmxlQW5kQWJvdmUpO1xuXHRcdH1cblx0fSxcblx0XG5cdGhpZGVGdWxsc2NyZWVuQnV0dG9uOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5oaWRlRnVsbHNjcmVlbkJ1dHRvbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkuaGlkZUZ1bGxzY3JlZW5CdXR0b24oKTtcblx0XHR9XHRcdFxuXHR9LFx0XG5cdFxuXG5cdC8vIGN1c3RvbSBtZXRob2RzIHNpbmNlIG5vdCBhbGwgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbnMgc3VwcG9ydCBnZXQvc2V0XG5cblx0Ly8gVGhpcyBjYW4gYmUgYSB1cmwgc3RyaW5nXG5cdC8vIG9yIGFuIGFycmF5IFt7c3JjOidmaWxlLm1wNCcsdHlwZTondmlkZW8vbXA0J30se3NyYzonZmlsZS53ZWJtJyx0eXBlOid2aWRlby93ZWJtJ31dXG5cdHNldFNyYzogZnVuY3Rpb24gKHVybCkge1xuXHRcdGlmICh0eXBlb2YgdXJsID09ICdzdHJpbmcnKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRTcmMobWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwodXJsKSk7XG5cdFx0XHR0aGlzLnNyYyA9IG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKHVybCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpLCBtZWRpYTtcblxuXHRcdFx0Zm9yIChpPTA7IGk8dXJsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG1lZGlhID0gdXJsW2ldO1xuXHRcdFx0XHRpZiAodGhpcy5jYW5QbGF5VHlwZShtZWRpYS50eXBlKSkge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFNyYyhtZWpzLlV0aWxpdHkuYWJzb2x1dGl6ZVVybChtZWRpYS5zcmMpKTtcblx0XHRcdFx0XHR0aGlzLnNyYyA9IG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKHVybCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0fSxcblx0c2V0Q3VycmVudFRpbWU6IGZ1bmN0aW9uICh0aW1lKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNlZWtUbyh0aW1lKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldEN1cnJlbnRUaW1lKHRpbWUpO1xuXHRcdFx0fVx0XHRcdFx0XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHR0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcblx0XHR9XG5cdH0sXG5cdHNldFZvbHVtZTogZnVuY3Rpb24gKHZvbHVtZSkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsKSB7XG5cdFx0XHQvLyBzYW1lIG9uIFlvdVR1YmUgYW5kIE1FanNcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFZvbHVtZSh2b2x1bWUgKiAxMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0Vm9sdW1lKHZvbHVtZSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnZvbHVtZSA9IHZvbHVtZTtcblx0XHR9XG5cdH0sXG5cdHNldE11dGVkOiBmdW5jdGlvbiAobXV0ZWQpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScpIHtcblx0XHRcdFx0aWYgKG11dGVkKSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5BcGkubXV0ZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luQXBpLnVuTXV0ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubXV0ZWQgPSBtdXRlZDtcblx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCd2b2x1bWVjaGFuZ2UnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldE11dGVkKG11dGVkKTtcblx0XHRcdH1cblx0XHRcdHRoaXMubXV0ZWQgPSBtdXRlZDtcblx0XHR9XG5cdH0sXG5cblx0Ly8gYWRkaXRpb25hbCBub24tSFRNTDUgbWV0aG9kc1xuXHRzZXRWaWRlb1NpemU6IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0XG5cdFx0Ly9pZiAodGhpcy5wbHVnaW5UeXBlID09ICdmbGFzaCcgfHwgdGhpcy5wbHVnaW5UeXBlID09ICdzaWx2ZXJsaWdodCcpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpbkVsZW1lbnQgJiYgdGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luRWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5zZXRWaWRlb1NpemUpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0VmlkZW9TaXplKHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0fVxuXHRcdC8vfVxuXHR9LFxuXG5cdHNldEZ1bGxzY3JlZW46IGZ1bmN0aW9uIChmdWxsc2NyZWVuKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbihmdWxsc2NyZWVuKTtcblx0XHR9XG5cdH0sXG5cdFxuXHRlbnRlckZ1bGxTY3JlZW46IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldEZ1bGxzY3JlZW4pIHtcblx0XHRcdHRoaXMuc2V0RnVsbHNjcmVlbih0cnVlKTtcblx0XHR9XHRcdFxuXHRcdFxuXHR9LFxuXHRcblx0ZXhpdEZ1bGxTY3JlZW46IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldEZ1bGxzY3JlZW4pIHtcblx0XHRcdHRoaXMuc2V0RnVsbHNjcmVlbihmYWxzZSk7XG5cdFx0fVxuXHR9LFx0XG5cblx0Ly8gc3RhcnQ6IGZha2UgZXZlbnRzXG5cdGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrLCBidWJibGUpIHtcblx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXTtcblx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xuXHR9LFxuXHRyZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuXHRcdGlmICghZXZlbnROYW1lKSB7IHRoaXMuZXZlbnRzID0ge307IHJldHVybiB0cnVlOyB9XG5cdFx0dmFyIGNhbGxiYWNrcyA9IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV07XG5cdFx0aWYgKCFjYWxsYmFja3MpIHJldHVybiB0cnVlO1xuXHRcdGlmICghY2FsbGJhY2spIHsgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdOyByZXR1cm4gdHJ1ZTsgfVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoY2FsbGJhY2tzW2ldID09PSBjYWxsYmFjaykge1xuXHRcdFx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdLnNwbGljZShpLCAxKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcdFxuXHRkaXNwYXRjaEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRhcmdzLFxuXHRcdFx0Y2FsbGJhY2tzID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXTtcblxuXHRcdGlmIChjYWxsYmFja3MpIHtcblx0XHRcdGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvLyBlbmQ6IGZha2UgZXZlbnRzXG5cdFxuXHQvLyBmYWtlIERPTSBhdHRyaWJ1dGUgbWV0aG9kc1xuXHRoYXNBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdHJldHVybiAobmFtZSBpbiB0aGlzLmF0dHJpYnV0ZXMpOyAgXG5cdH0sXG5cdHJlbW92ZUF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG5cdFx0ZGVsZXRlIHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcblx0fSxcblx0Z2V0QXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcblx0XHRpZiAodGhpcy5oYXNBdHRyaWJ1dGUobmFtZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG5cdFx0fVxuXHRcdHJldHVybiAnJztcblx0fSxcblx0c2V0QXR0cmlidXRlOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSl7XG5cdFx0dGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gdmFsdWU7XG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHRtZWpzLlV0aWxpdHkucmVtb3ZlU3dmKHRoaXMucGx1Z2luRWxlbWVudC5pZCk7XG5cdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS51bnJlZ2lzdGVyUGx1Z2luRWxlbWVudCh0aGlzLnBsdWdpbkVsZW1lbnQuaWQpO1xuXHR9XG59O1xuXG4vLyBIYW5kbGVzIGNhbGxzIGZyb20gRmxhc2gvU2lsdmVybGlnaHQgYW5kIHJlcG9ydHMgdGhlbSBhcyBuYXRpdmUgPHZpZGVvL2F1ZGlvPiBldmVudHMgYW5kIHByb3BlcnRpZXNcbm1lanMuTWVkaWFQbHVnaW5CcmlkZ2UgPSB7XG5cblx0cGx1Z2luTWVkaWFFbGVtZW50czp7fSxcblx0aHRtbE1lZGlhRWxlbWVudHM6e30sXG5cblx0cmVnaXN0ZXJQbHVnaW5FbGVtZW50OiBmdW5jdGlvbiAoaWQsIHBsdWdpbk1lZGlhRWxlbWVudCwgaHRtbE1lZGlhRWxlbWVudCkge1xuXHRcdHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF0gPSBwbHVnaW5NZWRpYUVsZW1lbnQ7XG5cdFx0dGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF0gPSBodG1sTWVkaWFFbGVtZW50O1xuXHR9LFxuXG5cdHVucmVnaXN0ZXJQbHVnaW5FbGVtZW50OiBmdW5jdGlvbiAoaWQpIHtcblx0XHRkZWxldGUgdGhpcy5wbHVnaW5NZWRpYUVsZW1lbnRzW2lkXTtcblx0XHRkZWxldGUgdGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF07XG5cdH0sXG5cblx0Ly8gd2hlbiBGbGFzaC9TaWx2ZXJsaWdodCBpcyByZWFkeSwgaXQgY2FsbHMgb3V0IHRvIHRoaXMgbWV0aG9kXG5cdGluaXRQbHVnaW46IGZ1bmN0aW9uIChpZCkge1xuXG5cdFx0dmFyIHBsdWdpbk1lZGlhRWxlbWVudCA9IHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF0sXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50ID0gdGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF07XG5cblx0XHRpZiAocGx1Z2luTWVkaWFFbGVtZW50KSB7XG5cdFx0XHQvLyBmaW5kIHRoZSBqYXZhc2NyaXB0IGJyaWRnZVxuXHRcdFx0c3dpdGNoIChwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luVHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiZmxhc2hcIjpcblx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudCA9IHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJzaWx2ZXJsaWdodFwiOlxuXHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGx1Z2luTWVkaWFFbGVtZW50LmlkKTtcblx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQuQ29udGVudC5NZWRpYUVsZW1lbnRKUztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XG5cdFx0XHRpZiAocGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkFwaSAhPSBudWxsICYmIHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzKSB7XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzKHBsdWdpbk1lZGlhRWxlbWVudCwgaHRtbE1lZGlhRWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vIHJlY2VpdmVzIGV2ZW50cyBmcm9tIEZsYXNoL1NpbHZlcmxpZ2h0IGFuZCBzZW5kcyB0aGVtIG91dCBhcyBIVE1MNSBtZWRpYSBldmVudHNcblx0Ly8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdmlkZW8uaHRtbFxuXHRmaXJlRXZlbnQ6IGZ1bmN0aW9uIChpZCwgZXZlbnROYW1lLCB2YWx1ZXMpIHtcblxuXHRcdHZhclxuXHRcdFx0ZSxcblx0XHRcdGksXG5cdFx0XHRidWZmZXJlZFRpbWUsXG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSB0aGlzLnBsdWdpbk1lZGlhRWxlbWVudHNbaWRdO1xuXG5cdFx0aWYoIXBsdWdpbk1lZGlhRWxlbWVudCl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG5cdFx0Ly8gZmFrZSBldmVudCBvYmplY3QgdG8gbWltaWMgcmVhbCBIVE1MIG1lZGlhIGV2ZW50LlxuXHRcdGUgPSB7XG5cdFx0XHR0eXBlOiBldmVudE5hbWUsXG5cdFx0XHR0YXJnZXQ6IHBsdWdpbk1lZGlhRWxlbWVudFxuXHRcdH07XG5cblx0XHQvLyBhdHRhY2ggYWxsIHZhbHVlcyB0byBlbGVtZW50IGFuZCBldmVudCBvYmplY3Rcblx0XHRmb3IgKGkgaW4gdmFsdWVzKSB7XG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnRbaV0gPSB2YWx1ZXNbaV07XG5cdFx0XHRlW2ldID0gdmFsdWVzW2ldO1xuXHRcdH1cblxuXHRcdC8vIGZha2UgdGhlIG5ld2VyIFczQyBidWZmZXJlZCBUaW1lUmFuZ2UgKGxvYWRlZCBhbmQgdG90YWwgaGF2ZSBiZWVuIHJlbW92ZWQpXG5cdFx0YnVmZmVyZWRUaW1lID0gdmFsdWVzLmJ1ZmZlcmVkVGltZSB8fCAwO1xuXG5cdFx0ZS50YXJnZXQuYnVmZmVyZWQgPSBlLmJ1ZmZlcmVkID0ge1xuXHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSxcblx0XHRcdGVuZDogZnVuY3Rpb24gKGluZGV4KSB7XG5cdFx0XHRcdHJldHVybiBidWZmZXJlZFRpbWU7XG5cdFx0XHR9LFxuXHRcdFx0bGVuZ3RoOiAxXG5cdFx0fTtcblxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kaXNwYXRjaEV2ZW50KGUudHlwZSwgZSk7XG5cdH1cbn07XG5cbi8qXG5EZWZhdWx0IG9wdGlvbnNcbiovXG5tZWpzLk1lZGlhRWxlbWVudERlZmF1bHRzID0ge1xuXHQvLyBhbGxvd3MgdGVzdGluZyBvbiBIVE1MNSwgZmxhc2gsIHNpbHZlcmxpZ2h0XG5cdC8vIGF1dG86IGF0dGVtcHRzIHRvIGRldGVjdCB3aGF0IHRoZSBicm93c2VyIGNhbiBkb1xuXHQvLyBhdXRvX3BsdWdpbjogcHJlZmVyIHBsdWdpbnMgYW5kIHRoZW4gYXR0ZW1wdCBuYXRpdmUgSFRNTDVcblx0Ly8gbmF0aXZlOiBmb3JjZXMgSFRNTDUgcGxheWJhY2tcblx0Ly8gc2hpbTogZGlzYWxsb3dzIEhUTUw1LCB3aWxsIGF0dGVtcHQgZWl0aGVyIEZsYXNoIG9yIFNpbHZlcmxpZ2h0XG5cdC8vIG5vbmU6IGZvcmNlcyBmYWxsYmFjayB2aWV3XG5cdG1vZGU6ICdhdXRvJyxcblx0Ly8gcmVtb3ZlIG9yIHJlb3JkZXIgdG8gY2hhbmdlIHBsdWdpbiBwcmlvcml0eSBhbmQgYXZhaWxhYmlsaXR5XG5cdHBsdWdpbnM6IFsnZmxhc2gnLCdzaWx2ZXJsaWdodCcsJ3lvdXR1YmUnLCd2aW1lbyddLFxuXHQvLyBzaG93cyBkZWJ1ZyBlcnJvcnMgb24gc2NyZWVuXG5cdGVuYWJsZVBsdWdpbkRlYnVnOiBmYWxzZSxcblx0Ly8gdXNlIHBsdWdpbiBmb3IgYnJvd3NlcnMgdGhhdCBoYXZlIHRyb3VibGUgd2l0aCBCYXNpYyBBdXRoZW50aWNhdGlvbiBvbiBIVFRQUyBzaXRlc1xuXHRodHRwc0Jhc2ljQXV0aFNpdGU6IGZhbHNlLFxuXHQvLyBvdmVycmlkZXMgdGhlIHR5cGUgc3BlY2lmaWVkLCB1c2VmdWwgZm9yIGR5bmFtaWMgaW5zdGFudGlhdGlvblxuXHR0eXBlOiAnJyxcblx0Ly8gcGF0aCB0byBGbGFzaCBhbmQgU2lsdmVybGlnaHQgcGx1Z2luc1xuXHRwbHVnaW5QYXRoOiBtZWpzLlV0aWxpdHkuZ2V0U2NyaXB0UGF0aChbJ21lZGlhZWxlbWVudC5qcycsJ21lZGlhZWxlbWVudC5taW4uanMnLCdtZWRpYWVsZW1lbnQtYW5kLXBsYXllci5qcycsJ21lZGlhZWxlbWVudC1hbmQtcGxheWVyLm1pbi5qcyddKSxcblx0Ly8gbmFtZSBvZiBmbGFzaCBmaWxlXG5cdGZsYXNoTmFtZTogJ2ZsYXNobWVkaWFlbGVtZW50LnN3ZicsXG5cdC8vIHN0cmVhbWVyIGZvciBSVE1QIHN0cmVhbWluZ1xuXHRmbGFzaFN0cmVhbWVyOiAnJyxcblx0Ly8gdHVybnMgb24gdGhlIHNtb290aGluZyBmaWx0ZXIgaW4gRmxhc2hcblx0ZW5hYmxlUGx1Z2luU21vb3RoaW5nOiBmYWxzZSxcblx0Ly8gZW5hYmxlZCBwc2V1ZG8tc3RyZWFtaW5nIChzZWVrKSBvbiAubXA0IGZpbGVzXG5cdGVuYWJsZVBzZXVkb1N0cmVhbWluZzogZmFsc2UsXG5cdC8vIHN0YXJ0IHF1ZXJ5IHBhcmFtZXRlciBzZW50IHRvIHNlcnZlciBmb3IgcHNldWRvLXN0cmVhbWluZ1xuXHRwc2V1ZG9TdHJlYW1pbmdTdGFydFF1ZXJ5UGFyYW06ICdzdGFydCcsXG5cdC8vIG5hbWUgb2Ygc2lsdmVybGlnaHQgZmlsZVxuXHRzaWx2ZXJsaWdodE5hbWU6ICdzaWx2ZXJsaWdodG1lZGlhZWxlbWVudC54YXAnLFxuXHQvLyBkZWZhdWx0IGlmIHRoZSA8dmlkZW8gd2lkdGg+IGlzIG5vdCBzcGVjaWZpZWRcblx0ZGVmYXVsdFZpZGVvV2lkdGg6IDQ4MCxcblx0Ly8gZGVmYXVsdCBpZiB0aGUgPHZpZGVvIGhlaWdodD4gaXMgbm90IHNwZWNpZmllZFxuXHRkZWZhdWx0VmlkZW9IZWlnaHQ6IDI3MCxcblx0Ly8gb3ZlcnJpZGVzIDx2aWRlbyB3aWR0aD5cblx0cGx1Z2luV2lkdGg6IC0xLFxuXHQvLyBvdmVycmlkZXMgPHZpZGVvIGhlaWdodD5cblx0cGx1Z2luSGVpZ2h0OiAtMSxcblx0Ly8gYWRkaXRpb25hbCBwbHVnaW4gdmFyaWFibGVzIGluICdrZXk9dmFsdWUnIGZvcm1cblx0cGx1Z2luVmFyczogW10sXHRcblx0Ly8gcmF0ZSBpbiBtaWxsaXNlY29uZHMgZm9yIEZsYXNoIGFuZCBTaWx2ZXJsaWdodCB0byBmaXJlIHRoZSB0aW1ldXBkYXRlIGV2ZW50XG5cdC8vIGxhcmdlciBudW1iZXIgaXMgbGVzcyBhY2N1cmF0ZSwgYnV0IGxlc3Mgc3RyYWluIG9uIHBsdWdpbi0+SmF2YVNjcmlwdCBicmlkZ2Vcblx0dGltZXJSYXRlOiAyNTAsXG5cdC8vIGluaXRpYWwgdm9sdW1lIGZvciBwbGF5ZXJcblx0c3RhcnRWb2x1bWU6IDAuOCxcblx0c3VjY2VzczogZnVuY3Rpb24gKCkgeyB9LFxuXHRlcnJvcjogZnVuY3Rpb24gKCkgeyB9XG59O1xuXG4vKlxuRGV0ZXJtaW5lcyBpZiBhIGJyb3dzZXIgc3VwcG9ydHMgdGhlIDx2aWRlbz4gb3IgPGF1ZGlvPiBlbGVtZW50XG5hbmQgcmV0dXJucyBlaXRoZXIgdGhlIG5hdGl2ZSBlbGVtZW50IG9yIGEgRmxhc2gvU2lsdmVybGlnaHQgdmVyc2lvbiB0aGF0XG5taW1pY3MgSFRNTDUgTWVkaWFFbGVtZW50XG4qL1xubWVqcy5NZWRpYUVsZW1lbnQgPSBmdW5jdGlvbiAoZWwsIG8pIHtcblx0cmV0dXJuIG1lanMuSHRtbE1lZGlhRWxlbWVudFNoaW0uY3JlYXRlKGVsLG8pO1xufTtcblxubWVqcy5IdG1sTWVkaWFFbGVtZW50U2hpbSA9IHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKGVsLCBvKSB7XG5cdFx0dmFyXG5cdFx0XHRvcHRpb25zID0gbWVqcy5NZWRpYUVsZW1lbnREZWZhdWx0cyxcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSAodHlwZW9mKGVsKSA9PSAnc3RyaW5nJykgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbCkgOiBlbCxcblx0XHRcdHRhZ05hbWUgPSBodG1sTWVkaWFFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcblx0XHRcdGlzTWVkaWFUYWcgPSAodGFnTmFtZSA9PT0gJ2F1ZGlvJyB8fCB0YWdOYW1lID09PSAndmlkZW8nKSxcblx0XHRcdHNyYyA9IChpc01lZGlhVGFnKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSA6IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyksXG5cdFx0XHRwb3N0ZXIgPSBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdGVyJyksXG5cdFx0XHRhdXRvcGxheSA9ICBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnYXV0b3BsYXknKSxcblx0XHRcdHByZWxvYWQgPSAgaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3ByZWxvYWQnKSxcblx0XHRcdGNvbnRyb2xzID0gIGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjb250cm9scycpLFxuXHRcdFx0cGxheWJhY2ssXG5cdFx0XHRwcm9wO1xuXG5cdFx0Ly8gZXh0ZW5kIG9wdGlvbnNcblx0XHRmb3IgKHByb3AgaW4gbykge1xuXHRcdFx0b3B0aW9uc1twcm9wXSA9IG9bcHJvcF07XG5cdFx0fVxuXG5cdFx0Ly8gY2xlYW4gdXAgYXR0cmlidXRlc1xuXHRcdHNyYyA9IFx0XHQodHlwZW9mIHNyYyA9PSAndW5kZWZpbmVkJyBcdHx8IHNyYyA9PT0gbnVsbCB8fCBzcmMgPT0gJycpID8gbnVsbCA6IHNyYztcdFx0XG5cdFx0cG9zdGVyID1cdCh0eXBlb2YgcG9zdGVyID09ICd1bmRlZmluZWQnIFx0fHwgcG9zdGVyID09PSBudWxsKSA/ICcnIDogcG9zdGVyO1xuXHRcdHByZWxvYWQgPSBcdCh0eXBlb2YgcHJlbG9hZCA9PSAndW5kZWZpbmVkJyBcdHx8IHByZWxvYWQgPT09IG51bGwgfHwgcHJlbG9hZCA9PT0gJ2ZhbHNlJykgPyAnbm9uZScgOiBwcmVsb2FkO1xuXHRcdGF1dG9wbGF5ID0gXHQhKHR5cGVvZiBhdXRvcGxheSA9PSAndW5kZWZpbmVkJyB8fCBhdXRvcGxheSA9PT0gbnVsbCB8fCBhdXRvcGxheSA9PT0gJ2ZhbHNlJyk7XG5cdFx0Y29udHJvbHMgPSBcdCEodHlwZW9mIGNvbnRyb2xzID09ICd1bmRlZmluZWQnIHx8IGNvbnRyb2xzID09PSBudWxsIHx8IGNvbnRyb2xzID09PSAnZmFsc2UnKTtcblxuXHRcdC8vIHRlc3QgZm9yIEhUTUw1IGFuZCBwbHVnaW4gY2FwYWJpbGl0aWVzXG5cdFx0cGxheWJhY2sgPSB0aGlzLmRldGVybWluZVBsYXliYWNrKGh0bWxNZWRpYUVsZW1lbnQsIG9wdGlvbnMsIG1lanMuTWVkaWFGZWF0dXJlcy5zdXBwb3J0c01lZGlhVGFnLCBpc01lZGlhVGFnLCBzcmMpO1xuXHRcdHBsYXliYWNrLnVybCA9IChwbGF5YmFjay51cmwgIT09IG51bGwpID8gbWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwocGxheWJhY2sudXJsKSA6ICcnO1xuXG5cdFx0aWYgKHBsYXliYWNrLm1ldGhvZCA9PSAnbmF0aXZlJykge1xuXHRcdFx0Ly8gc2Vjb25kIGZpeCBmb3IgYW5kcm9pZFxuXHRcdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0J1c3RlZEFuZHJvaWQpIHtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSBwbGF5YmFjay51cmw7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBsYXkoKTtcblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFxuXHRcdFx0Ly8gYWRkIG1ldGhvZHMgdG8gbmF0aXZlIEhUTUxNZWRpYUVsZW1lbnRcblx0XHRcdHJldHVybiB0aGlzLnVwZGF0ZU5hdGl2ZShwbGF5YmFjaywgb3B0aW9ucywgYXV0b3BsYXksIHByZWxvYWQpO1xuXHRcdH0gZWxzZSBpZiAocGxheWJhY2subWV0aG9kICE9PSAnJykge1xuXHRcdFx0Ly8gY3JlYXRlIHBsdWdpbiB0byBtaW1pYyBIVE1MTWVkaWFFbGVtZW50XG5cdFx0XHRcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZVBsdWdpbiggcGxheWJhY2ssICBvcHRpb25zLCBwb3N0ZXIsIGF1dG9wbGF5LCBwcmVsb2FkLCBjb250cm9scyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGJvbywgbm8gSFRNTDUsIG5vIEZsYXNoLCBubyBTaWx2ZXJsaWdodC5cblx0XHRcdHRoaXMuY3JlYXRlRXJyb3JNZXNzYWdlKCBwbGF5YmFjaywgb3B0aW9ucywgcG9zdGVyICk7XG5cdFx0XHRcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSxcblx0XG5cdGRldGVybWluZVBsYXliYWNrOiBmdW5jdGlvbihodG1sTWVkaWFFbGVtZW50LCBvcHRpb25zLCBzdXBwb3J0c01lZGlhVGFnLCBpc01lZGlhVGFnLCBzcmMpIHtcblx0XHR2YXJcblx0XHRcdG1lZGlhRmlsZXMgPSBbXSxcblx0XHRcdGksXG5cdFx0XHRqLFxuXHRcdFx0ayxcblx0XHRcdGwsXG5cdFx0XHRuLFxuXHRcdFx0dHlwZSxcblx0XHRcdHJlc3VsdCA9IHsgbWV0aG9kOiAnJywgdXJsOiAnJywgaHRtbE1lZGlhRWxlbWVudDogaHRtbE1lZGlhRWxlbWVudCwgaXNWaWRlbzogKGh0bWxNZWRpYUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9ICdhdWRpbycpfSxcblx0XHRcdHBsdWdpbk5hbWUsXG5cdFx0XHRwbHVnaW5WZXJzaW9ucyxcblx0XHRcdHBsdWdpbkluZm8sXG5cdFx0XHRkdW1teSxcblx0XHRcdG1lZGlhO1xuXHRcdFx0XG5cdFx0Ly8gU1RFUCAxOiBHZXQgVVJMIGFuZCB0eXBlIGZyb20gPHZpZGVvIHNyYz4gb3IgPHNvdXJjZSBzcmM+XG5cblx0XHQvLyBzdXBwbGllZCB0eXBlIG92ZXJyaWRlcyA8dmlkZW8gdHlwZT4gYW5kIDxzb3VyY2UgdHlwZT5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHlwZSAhPSAndW5kZWZpbmVkJyAmJiBvcHRpb25zLnR5cGUgIT09ICcnKSB7XG5cdFx0XHRcblx0XHRcdC8vIGFjY2VwdCBlaXRoZXIgc3RyaW5nIG9yIGFycmF5IG9mIHR5cGVzXG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHlwZSA9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRtZWRpYUZpbGVzLnB1c2goe3R5cGU6b3B0aW9ucy50eXBlLCB1cmw6c3JjfSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yIChpPTA7IGk8b3B0aW9ucy50eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOm9wdGlvbnMudHlwZVtpXSwgdXJsOnNyY30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHQvLyB0ZXN0IGZvciBzcmMgYXR0cmlidXRlIGZpcnN0XG5cdFx0fSBlbHNlIGlmIChzcmMgIT09IG51bGwpIHtcblx0XHRcdHR5cGUgPSB0aGlzLmZvcm1hdFR5cGUoc3JjLCBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKTtcblx0XHRcdG1lZGlhRmlsZXMucHVzaCh7dHlwZTp0eXBlLCB1cmw6c3JjfSk7XG5cblx0XHQvLyB0aGVuIHRlc3QgZm9yIDxzb3VyY2U+IGVsZW1lbnRzXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRlc3QgPHNvdXJjZT4gdHlwZXMgdG8gc2VlIGlmIHRoZXkgYXJlIHVzYWJsZVxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGh0bWxNZWRpYUVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRuID0gaHRtbE1lZGlhRWxlbWVudC5jaGlsZE5vZGVzW2ldO1xuXHRcdFx0XHRpZiAobi5ub2RlVHlwZSA9PSAxICYmIG4udGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICdzb3VyY2UnKSB7XG5cdFx0XHRcdFx0c3JjID0gbi5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXHRcdFx0XHRcdHR5cGUgPSB0aGlzLmZvcm1hdFR5cGUoc3JjLCBuLmdldEF0dHJpYnV0ZSgndHlwZScpKTtcblx0XHRcdFx0XHRtZWRpYSA9IG4uZ2V0QXR0cmlidXRlKCdtZWRpYScpO1xuXG5cdFx0XHRcdFx0aWYgKCFtZWRpYSB8fCAhd2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhICYmIHdpbmRvdy5tYXRjaE1lZGlhKG1lZGlhKS5tYXRjaGVzKSkge1xuXHRcdFx0XHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOnR5cGUsIHVybDpzcmN9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gaW4gdGhlIGNhc2Ugb2YgZHluYW1pY2x5IGNyZWF0ZWQgcGxheWVyc1xuXHRcdC8vIGNoZWNrIGZvciBhdWRpbyB0eXBlc1xuXHRcdGlmICghaXNNZWRpYVRhZyAmJiBtZWRpYUZpbGVzLmxlbmd0aCA+IDAgJiYgbWVkaWFGaWxlc1swXS51cmwgIT09IG51bGwgJiYgdGhpcy5nZXRUeXBlRnJvbUZpbGUobWVkaWFGaWxlc1swXS51cmwpLmluZGV4T2YoJ2F1ZGlvJykgPiAtMSkge1xuXHRcdFx0cmVzdWx0LmlzVmlkZW8gPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cblx0XHQvLyBTVEVQIDI6IFRlc3QgZm9yIHBsYXliYWNrIG1ldGhvZFxuXHRcdFxuXHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgQW5kcm9pZCB3aGljaCBzYWRseSBkb2Vzbid0IGltcGxlbWVudCB0aGUgY2FuUGxheVR5cGUgZnVuY3Rpb24gKGFsd2F5cyByZXR1cm5zICcnKVxuXHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNCdXN0ZWRBbmRyb2lkKSB7XG5cdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuXHRcdFx0XHRyZXR1cm4gKHR5cGUubWF0Y2goL3ZpZGVvXFwvKG1wNHxtNHYpL2dpKSAhPT0gbnVsbCkgPyAnbWF5YmUnIDogJyc7XG5cdFx0XHR9O1xuXHRcdH1cdFx0XG5cdFx0XG5cdFx0Ly8gc3BlY2lhbCBjYXNlIGZvciBDaHJvbWl1bSB0byBzcGVjaWZ5IG5hdGl2ZWx5IHN1cHBvcnRlZCB2aWRlbyBjb2RlY3MgKGkuZS4gV2ViTSBhbmQgVGhlb3JhKSBcblx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzQ2hyb21pdW0pIHsgXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlID0gZnVuY3Rpb24odHlwZSkgeyBcblx0XHRcdFx0cmV0dXJuICh0eXBlLm1hdGNoKC92aWRlb1xcLyh3ZWJtfG9ndnxvZ2cpL2dpKSAhPT0gbnVsbCkgPyAnbWF5YmUnIDogJyc7IFxuXHRcdFx0fTsgXG5cdFx0fVxuXG5cdFx0Ly8gdGVzdCBmb3IgbmF0aXZlIHBsYXliYWNrIGZpcnN0XG5cdFx0aWYgKHN1cHBvcnRzTWVkaWFUYWcgJiYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG8nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyB8fCBvcHRpb25zLm1vZGUgPT09ICduYXRpdmUnKSAgJiYgIShtZWpzLk1lZGlhRmVhdHVyZXMuaXNCdXN0ZWROYXRpdmVIVFRQUyAmJiBvcHRpb25zLmh0dHBzQmFzaWNBdXRoU2l0ZSA9PT0gdHJ1ZSkpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0aWYgKCFpc01lZGlhVGFnKSB7XG5cblx0XHRcdFx0Ly8gY3JlYXRlIGEgcmVhbCBIVE1MNSBNZWRpYSBFbGVtZW50IFxuXHRcdFx0XHRkdW1teSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIHJlc3VsdC5pc1ZpZGVvID8gJ3ZpZGVvJyA6ICdhdWRpbycpO1x0XHRcdFxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGR1bW15LCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gdXNlIHRoaXMgb25lIGZyb20gbm93IG9uXG5cdFx0XHRcdHJlc3VsdC5odG1sTWVkaWFFbGVtZW50ID0gaHRtbE1lZGlhRWxlbWVudCA9IGR1bW15O1xuXHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdGZvciAoaT0wOyBpPG1lZGlhRmlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gbm9ybWFsIGNoZWNrXG5cdFx0XHRcdGlmIChtZWRpYUZpbGVzW2ldLnR5cGUgPT0gXCJ2aWRlby9tM3U4XCIgfHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJ1xuXHRcdFx0XHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgTWFjL1NhZmFyaSA1LjAuMyB3aGljaCBhbnN3ZXJzICcnIHRvIGNhblBsYXlUeXBlKCdhdWRpby9tcDMnKSBidXQgJ21heWJlJyB0byBjYW5QbGF5VHlwZSgnYXVkaW8vbXBlZycpXG5cdFx0XHRcdFx0fHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUucmVwbGFjZSgvbXAzLywnbXBlZycpKS5yZXBsYWNlKC9uby8sICcnKSAhPT0gJydcblx0XHRcdFx0XHQvLyBzcGVjaWFsIGNhc2UgZm9yIG00YSBzdXBwb3J0ZWQgYnkgZGV0ZWN0aW5nIG1wNCBzdXBwb3J0XG5cdFx0XHRcdFx0fHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUucmVwbGFjZSgvbTRhLywnbXA0JykpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJykge1xuXHRcdFx0XHRcdHJlc3VsdC5tZXRob2QgPSAnbmF0aXZlJztcblx0XHRcdFx0XHRyZXN1bHQudXJsID0gbWVkaWFGaWxlc1tpXS51cmw7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cdFx0XHRcblx0XHRcdFxuXHRcdFx0aWYgKHJlc3VsdC5tZXRob2QgPT09ICduYXRpdmUnKSB7XG5cdFx0XHRcdGlmIChyZXN1bHQudXJsICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSByZXN1bHQudXJsO1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdFx0Ly8gaWYgYGF1dG9fcGx1Z2luYCBtb2RlLCB0aGVuIGNhY2hlIHRoZSBuYXRpdmUgcmVzdWx0IGJ1dCB0cnkgcGx1Z2lucy5cblx0XHRcdFx0aWYgKG9wdGlvbnMubW9kZSAhPT0gJ2F1dG9fcGx1Z2luJykge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBpZiBuYXRpdmUgcGxheWJhY2sgZGlkbid0IHdvcmssIHRoZW4gdGVzdCBwbHVnaW5zXG5cdFx0aWYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG8nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyB8fCBvcHRpb25zLm1vZGUgPT09ICdzaGltJykge1xuXHRcdFx0Zm9yIChpPTA7IGk8bWVkaWFGaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0eXBlID0gbWVkaWFGaWxlc1tpXS50eXBlO1xuXG5cdFx0XHRcdC8vIHRlc3QgYWxsIHBsdWdpbnMgaW4gb3JkZXIgb2YgcHJlZmVyZW5jZSBbc2lsdmVybGlnaHQsIGZsYXNoXVxuXHRcdFx0XHRmb3IgKGo9MDsgajxvcHRpb25zLnBsdWdpbnMubGVuZ3RoOyBqKyspIHtcblxuXHRcdFx0XHRcdHBsdWdpbk5hbWUgPSBvcHRpb25zLnBsdWdpbnNbal07XG5cdFx0XHRcblx0XHRcdFx0XHQvLyB0ZXN0IHZlcnNpb24gb2YgcGx1Z2luIChmb3IgZnV0dXJlIGZlYXR1cmVzKVxuXHRcdFx0XHRcdHBsdWdpblZlcnNpb25zID0gbWVqcy5wbHVnaW5zW3BsdWdpbk5hbWVdO1x0XHRcdFx0XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yIChrPTA7IGs8cGx1Z2luVmVyc2lvbnMubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcdHBsdWdpbkluZm8gPSBwbHVnaW5WZXJzaW9uc1trXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdC8vIHRlc3QgaWYgdXNlciBoYXMgdGhlIGNvcnJlY3QgcGx1Z2luIHZlcnNpb25cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Ly8gZm9yIHlvdXR1YmUvdmltZW9cblx0XHRcdFx0XHRcdGlmIChwbHVnaW5JbmZvLnZlcnNpb24gPT0gbnVsbCB8fCBcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdG1lanMuUGx1Z2luRGV0ZWN0b3IuaGFzUGx1Z2luVmVyc2lvbihwbHVnaW5OYW1lLCBwbHVnaW5JbmZvLnZlcnNpb24pKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gdGVzdCBmb3IgcGx1Z2luIHBsYXliYWNrIHR5cGVzXG5cdFx0XHRcdFx0XHRcdGZvciAobD0wOyBsPHBsdWdpbkluZm8udHlwZXMubGVuZ3RoOyBsKyspIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBmaW5kIHBsdWdpbiB0aGF0IGNhbiBwbGF5IHRoZSB0eXBlXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGUgPT0gcGx1Z2luSW5mby50eXBlc1tsXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0Lm1ldGhvZCA9IHBsdWdpbk5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQudXJsID0gbWVkaWFGaWxlc1tpXS51cmw7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBhdCB0aGlzIHBvaW50LCBiZWluZyBpbiAnYXV0b19wbHVnaW4nIG1vZGUgaW1wbGllcyB0aGF0IHdlIHRyaWVkIHBsdWdpbnMgYnV0IGZhaWxlZC5cblx0XHQvLyBpZiB3ZSBoYXZlIG5hdGl2ZSBzdXBwb3J0IHRoZW4gcmV0dXJuIHRoYXQuXG5cdFx0aWYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyAmJiByZXN1bHQubWV0aG9kID09PSAnbmF0aXZlJykge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHQvLyB3aGF0IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBwbGF5PyBqdXN0IGdyYWIgdGhlIGZpcnN0IGF2YWlsYWJsZVxuXHRcdGlmIChyZXN1bHQubWV0aG9kID09PSAnJyAmJiBtZWRpYUZpbGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdHJlc3VsdC51cmwgPSBtZWRpYUZpbGVzWzBdLnVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdGZvcm1hdFR5cGU6IGZ1bmN0aW9uKHVybCwgdHlwZSkge1xuXHRcdHZhciBleHQ7XG5cblx0XHQvLyBpZiBubyB0eXBlIGlzIHN1cHBsaWVkLCBmYWtlIGl0IHdpdGggdGhlIGV4dGVuc2lvblxuXHRcdGlmICh1cmwgJiYgIXR5cGUpIHtcdFx0XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRUeXBlRnJvbUZpbGUodXJsKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gb25seSByZXR1cm4gdGhlIG1pbWUgcGFydCBvZiB0aGUgdHlwZSBpbiBjYXNlIHRoZSBhdHRyaWJ1dGUgY29udGFpbnMgdGhlIGNvZGVjXG5cdFx0XHQvLyBzZWUgaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdmlkZW8uaHRtbCN0aGUtc291cmNlLWVsZW1lbnRcblx0XHRcdC8vIGB2aWRlby9tcDQ7IGNvZGVjcz1cImF2YzEuNDJFMDFFLCBtcDRhLjQwLjJcImAgYmVjb21lcyBgdmlkZW8vbXA0YFxuXHRcdFx0XG5cdFx0XHRpZiAodHlwZSAmJiB+dHlwZS5pbmRleE9mKCc7JykpIHtcblx0XHRcdFx0cmV0dXJuIHR5cGUuc3Vic3RyKDAsIHR5cGUuaW5kZXhPZignOycpKTsgXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdHlwZTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFxuXHRnZXRUeXBlRnJvbUZpbGU6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHVybCA9IHVybC5zcGxpdCgnPycpWzBdO1xuXHRcdHZhciBleHQgPSB1cmwuc3Vic3RyaW5nKHVybC5sYXN0SW5kZXhPZignLicpICsgMSkudG9Mb3dlckNhc2UoKTtcblx0XHRyZXR1cm4gKC8obXA0fG00dnxvZ2d8b2d2fG0zdTh8d2VibXx3ZWJtdnxmbHZ8d212fG1wZWd8bW92KS9naS50ZXN0KGV4dCkgPyAndmlkZW8nIDogJ2F1ZGlvJykgKyAnLycgKyB0aGlzLmdldFR5cGVGcm9tRXh0ZW5zaW9uKGV4dCk7XG5cdH0sXG5cdFxuXHRnZXRUeXBlRnJvbUV4dGVuc2lvbjogZnVuY3Rpb24oZXh0KSB7XG5cdFx0XG5cdFx0c3dpdGNoIChleHQpIHtcblx0XHRcdGNhc2UgJ21wNCc6XG5cdFx0XHRjYXNlICdtNHYnOlxuXHRcdFx0Y2FzZSAnbTRhJzpcblx0XHRcdFx0cmV0dXJuICdtcDQnO1xuXHRcdFx0Y2FzZSAnd2VibSc6XG5cdFx0XHRjYXNlICd3ZWJtYSc6XG5cdFx0XHRjYXNlICd3ZWJtdic6XHRcblx0XHRcdFx0cmV0dXJuICd3ZWJtJztcblx0XHRcdGNhc2UgJ29nZyc6XG5cdFx0XHRjYXNlICdvZ2EnOlxuXHRcdFx0Y2FzZSAnb2d2JzpcdFxuXHRcdFx0XHRyZXR1cm4gJ29nZyc7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXh0O1xuXHRcdH1cblx0fSxcblxuXHRjcmVhdGVFcnJvck1lc3NhZ2U6IGZ1bmN0aW9uKHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIpIHtcblx0XHR2YXIgXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50ID0gcGxheWJhY2suaHRtbE1lZGlhRWxlbWVudCxcblx0XHRcdGVycm9yQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcblx0XHRlcnJvckNvbnRhaW5lci5jbGFzc05hbWUgPSAnbWUtY2Fubm90cGxheSc7XG5cblx0XHR0cnkge1xuXHRcdFx0ZXJyb3JDb250YWluZXIuc3R5bGUud2lkdGggPSBodG1sTWVkaWFFbGVtZW50LndpZHRoICsgJ3B4Jztcblx0XHRcdGVycm9yQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGh0bWxNZWRpYUVsZW1lbnQuaGVpZ2h0ICsgJ3B4Jztcblx0XHR9IGNhdGNoIChlKSB7fVxuXG4gICAgaWYgKG9wdGlvbnMuY3VzdG9tRXJyb3IpIHtcbiAgICAgIGVycm9yQ29udGFpbmVyLmlubmVySFRNTCA9IG9wdGlvbnMuY3VzdG9tRXJyb3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29udGFpbmVyLmlubmVySFRNTCA9IChwb3N0ZXIgIT09ICcnKSA/XG4gICAgICAgICc8YSBocmVmPVwiJyArIHBsYXliYWNrLnVybCArICdcIj48aW1nIHNyYz1cIicgKyBwb3N0ZXIgKyAnXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIC8+PC9hPicgOlxuICAgICAgICAnPGEgaHJlZj1cIicgKyBwbGF5YmFjay51cmwgKyAnXCI+PHNwYW4+JyArIG1lanMuaTE4bi50KCdEb3dubG9hZCBGaWxlJykgKyAnPC9zcGFuPjwvYT4nO1xuICAgIH1cblxuXHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZXJyb3JDb250YWluZXIsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdGh0bWxNZWRpYUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdG9wdGlvbnMuZXJyb3IoaHRtbE1lZGlhRWxlbWVudCk7XG5cdH0sXG5cblx0Y3JlYXRlUGx1Z2luOmZ1bmN0aW9uKHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIsIGF1dG9wbGF5LCBwcmVsb2FkLCBjb250cm9scykge1xuXHRcdHZhciBcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0d2lkdGggPSAxLFxuXHRcdFx0aGVpZ2h0ID0gMSxcblx0XHRcdHBsdWdpbmlkID0gJ21lXycgKyBwbGF5YmFjay5tZXRob2QgKyAnXycgKyAobWVqcy5tZUluZGV4KyspLFxuXHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50ID0gbmV3IG1lanMuUGx1Z2luTWVkaWFFbGVtZW50KHBsdWdpbmlkLCBwbGF5YmFjay5tZXRob2QsIHBsYXliYWNrLnVybCksXG5cdFx0XHRjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lcixcblx0XHRcdG5vZGUsXG5cdFx0XHRpbml0VmFycztcblxuXHRcdC8vIGNvcHkgdGFnTmFtZSBmcm9tIGh0bWwgbWVkaWEgZWxlbWVudFxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC50YWdOYW1lID0gaHRtbE1lZGlhRWxlbWVudC50YWdOYW1lXG5cblx0XHQvLyBjb3B5IGF0dHJpYnV0ZXMgZnJvbSBodG1sIG1lZGlhIGVsZW1lbnQgdG8gcGx1Z2luIG1lZGlhIGVsZW1lbnRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGh0bWxNZWRpYUVsZW1lbnQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZSA9IGh0bWxNZWRpYUVsZW1lbnQuYXR0cmlidXRlc1tpXTtcblx0XHRcdGlmIChhdHRyaWJ1dGUuc3BlY2lmaWVkID09IHRydWUpIHtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBjaGVjayBmb3IgcGxhY2VtZW50IGluc2lkZSBhIDxwPiB0YWcgKHNvbWV0aW1lcyBXWVNJV1lHIGVkaXRvcnMgZG8gdGhpcylcblx0XHRub2RlID0gaHRtbE1lZGlhRWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdHdoaWxlIChub2RlICE9PSBudWxsICYmIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnYm9keScgJiYgbm9kZS5wYXJlbnROb2RlICE9IG51bGwpIHtcblx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAncCcpIHtcblx0XHRcdFx0bm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5vZGUucGFyZW50Tm9kZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRpZiAocGxheWJhY2suaXNWaWRlbykge1xuXHRcdFx0d2lkdGggPSAob3B0aW9ucy5wbHVnaW5XaWR0aCA+IDApID8gb3B0aW9ucy5wbHVnaW5XaWR0aCA6IChvcHRpb25zLnZpZGVvV2lkdGggPiAwKSA/IG9wdGlvbnMudmlkZW9XaWR0aCA6IChodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAhPT0gbnVsbCkgPyBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKSA6IG9wdGlvbnMuZGVmYXVsdFZpZGVvV2lkdGg7XG5cdFx0XHRoZWlnaHQgPSAob3B0aW9ucy5wbHVnaW5IZWlnaHQgPiAwKSA/IG9wdGlvbnMucGx1Z2luSGVpZ2h0IDogKG9wdGlvbnMudmlkZW9IZWlnaHQgPiAwKSA/IG9wdGlvbnMudmlkZW9IZWlnaHQgOiAoaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpICE9PSBudWxsKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSA6IG9wdGlvbnMuZGVmYXVsdFZpZGVvSGVpZ2h0O1xuXHRcdFxuXHRcdFx0Ly8gaW4gY2FzZSBvZiAnJScgbWFrZSBzdXJlIGl0J3MgZW5jb2RlZFxuXHRcdFx0d2lkdGggPSBtZWpzLlV0aWxpdHkuZW5jb2RlVXJsKHdpZHRoKTtcblx0XHRcdGhlaWdodCA9IG1lanMuVXRpbGl0eS5lbmNvZGVVcmwoaGVpZ2h0KTtcblx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKG9wdGlvbnMuZW5hYmxlUGx1Z2luRGVidWcpIHtcblx0XHRcdFx0d2lkdGggPSAzMjA7XG5cdFx0XHRcdGhlaWdodCA9IDI0MDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyByZWdpc3RlciBwbHVnaW5cblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzcztcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLnJlZ2lzdGVyUGx1Z2luRWxlbWVudChwbHVnaW5pZCwgcGx1Z2luTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KTtcblxuXHRcdC8vIGFkZCBjb250YWluZXIgKG11c3QgYmUgYWRkZWQgdG8gRE9NIGJlZm9yZSBpbnNlcnRpbmcgSFRNTCBmb3IgSUUpXG5cdFx0Y29udGFpbmVyLmNsYXNzTmFtZSA9ICdtZS1wbHVnaW4nO1xuXHRcdGNvbnRhaW5lci5pZCA9IHBsdWdpbmlkICsgJ19jb250YWluZXInO1xuXHRcdFxuXHRcdGlmIChwbGF5YmFjay5pc1ZpZGVvKSB7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShjb250YWluZXIsIGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlc1swXSk7XG5cdFx0fVxuXG5cdFx0Ly8gZmxhc2gvc2lsdmVybGlnaHQgdmFyc1xuXHRcdGluaXRWYXJzID0gW1xuXHRcdFx0J2lkPScgKyBwbHVnaW5pZCxcblx0XHRcdCdqc2luaXRmdW5jdGlvbj0nICsgXCJtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLmluaXRQbHVnaW5cIixcblx0XHRcdCdqc2NhbGxiYWNrZnVuY3Rpb249JyArIFwibWVqcy5NZWRpYVBsdWdpbkJyaWRnZS5maXJlRXZlbnRcIixcblx0XHRcdCdpc3ZpZGVvPScgKyAoKHBsYXliYWNrLmlzVmlkZW8pID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpLFxuXHRcdFx0J2F1dG9wbGF5PScgKyAoKGF1dG9wbGF5KSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiKSxcblx0XHRcdCdwcmVsb2FkPScgKyBwcmVsb2FkLFxuXHRcdFx0J3dpZHRoPScgKyB3aWR0aCxcblx0XHRcdCdzdGFydHZvbHVtZT0nICsgb3B0aW9ucy5zdGFydFZvbHVtZSxcblx0XHRcdCd0aW1lcnJhdGU9JyArIG9wdGlvbnMudGltZXJSYXRlLFxuXHRcdFx0J2ZsYXNoc3RyZWFtZXI9JyArIG9wdGlvbnMuZmxhc2hTdHJlYW1lcixcblx0XHRcdCdoZWlnaHQ9JyArIGhlaWdodCxcblx0XHRcdCdwc2V1ZG9zdHJlYW1zdGFydD0nICsgb3B0aW9ucy5wc2V1ZG9TdHJlYW1pbmdTdGFydFF1ZXJ5UGFyYW1dO1xuXG5cdFx0aWYgKHBsYXliYWNrLnVybCAhPT0gbnVsbCkge1xuXHRcdFx0aWYgKHBsYXliYWNrLm1ldGhvZCA9PSAnZmxhc2gnKSB7XG5cdFx0XHRcdGluaXRWYXJzLnB1c2goJ2ZpbGU9JyArIG1lanMuVXRpbGl0eS5lbmNvZGVVcmwocGxheWJhY2sudXJsKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbml0VmFycy5wdXNoKCdmaWxlPScgKyBwbGF5YmFjay51cmwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5EZWJ1Zykge1xuXHRcdFx0aW5pdFZhcnMucHVzaCgnZGVidWc9dHJ1ZScpO1xuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5TbW9vdGhpbmcpIHtcblx0XHRcdGluaXRWYXJzLnB1c2goJ3Ntb290aGluZz10cnVlJyk7XG5cdFx0fVxuICAgIGlmIChvcHRpb25zLmVuYWJsZVBzZXVkb1N0cmVhbWluZykge1xuICAgICAgaW5pdFZhcnMucHVzaCgncHNldWRvc3RyZWFtaW5nPXRydWUnKTtcbiAgICB9XG5cdFx0aWYgKGNvbnRyb2xzKSB7XG5cdFx0XHRpbml0VmFycy5wdXNoKCdjb250cm9scz10cnVlJyk7IC8vIHNob3dzIGNvbnRyb2xzIGluIHRoZSBwbHVnaW4gaWYgZGVzaXJlZFxuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5wbHVnaW5WYXJzKSB7XG5cdFx0XHRpbml0VmFycyA9IGluaXRWYXJzLmNvbmNhdChvcHRpb25zLnBsdWdpblZhcnMpO1xuXHRcdH1cdFx0XG5cblx0XHRzd2l0Y2ggKHBsYXliYWNrLm1ldGhvZCkge1xuXHRcdFx0Y2FzZSAnc2lsdmVybGlnaHQnOlxuXHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID1cbic8b2JqZWN0IGRhdGE9XCJkYXRhOmFwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtMixcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC0yXCIgaWQ9XCInICsgcGx1Z2luaWQgKyAnXCIgbmFtZT1cIicgKyBwbHVnaW5pZCArICdcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsgJ1wiIGNsYXNzPVwibWVqcy1zaGltXCI+JyArXG4nPHBhcmFtIG5hbWU9XCJpbml0UGFyYW1zXCIgdmFsdWU9XCInICsgaW5pdFZhcnMuam9pbignLCcpICsgJ1wiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJ3aW5kb3dsZXNzXCIgdmFsdWU9XCJ0cnVlXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImJhY2tncm91bmRcIiB2YWx1ZT1cImJsYWNrXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cIm1pblJ1bnRpbWVWZXJzaW9uXCIgdmFsdWU9XCIzLjAuMC4wXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImF1dG9VcGdyYWRlXCIgdmFsdWU9XCJ0cnVlXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cInNvdXJjZVwiIHZhbHVlPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuc2lsdmVybGlnaHROYW1lICsgJ1wiIC8+JyArXG4nPC9vYmplY3Q+Jztcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnZmxhc2gnOlxuXG5cdFx0XHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNJRSkge1xuXHRcdFx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChzcGVjaWFsSUVDb250YWluZXIpO1xuXHRcdFx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lci5vdXRlckhUTUwgPVxuJzxvYmplY3QgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiIGNvZGViYXNlPVwiLy9kb3dubG9hZC5tYWNyb21lZGlhLmNvbS9wdWIvc2hvY2t3YXZlL2NhYnMvZmxhc2gvc3dmbGFzaC5jYWJcIiAnICtcbidpZD1cIicgKyBwbHVnaW5pZCArICdcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsgJ1wiIGNsYXNzPVwibWVqcy1zaGltXCI+JyArXG4nPHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuZmxhc2hOYW1lICsgJz94PScgKyAobmV3IERhdGUoKSkgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImZsYXNodmFyc1wiIHZhbHVlPVwiJyArIGluaXRWYXJzLmpvaW4oJyZhbXA7JykgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cInF1YWxpdHlcIiB2YWx1ZT1cImhpZ2hcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYmdjb2xvclwiIHZhbHVlPVwiIzAwMDAwMFwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYWxsb3dTY3JpcHRBY2Nlc3NcIiB2YWx1ZT1cImFsd2F5c1wiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJhbGxvd0Z1bGxTY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwic2NhbGVcIiB2YWx1ZT1cImRlZmF1bHRcIiAvPicgKyBcbic8L29iamVjdD4nO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID1cbic8ZW1iZWQgaWQ9XCInICsgcGx1Z2luaWQgKyAnXCIgbmFtZT1cIicgKyBwbHVnaW5pZCArICdcIiAnICtcbidwbGF5PVwidHJ1ZVwiICcgK1xuJ2xvb3A9XCJmYWxzZVwiICcgK1xuJ3F1YWxpdHk9XCJoaWdoXCIgJyArXG4nYmdjb2xvcj1cIiMwMDAwMDBcIiAnICtcbid3bW9kZT1cInRyYW5zcGFyZW50XCIgJyArXG4nYWxsb3dTY3JpcHRBY2Nlc3M9XCJhbHdheXNcIiAnICtcbidhbGxvd0Z1bGxTY3JlZW49XCJ0cnVlXCIgJyArXG4ndHlwZT1cImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIgcGx1Z2luc3BhZ2U9XCIvL3d3dy5tYWNyb21lZGlhLmNvbS9nby9nZXRmbGFzaHBsYXllclwiICcgK1xuJ3NyYz1cIicgKyBvcHRpb25zLnBsdWdpblBhdGggKyBvcHRpb25zLmZsYXNoTmFtZSArICdcIiAnICtcbidmbGFzaHZhcnM9XCInICsgaW5pdFZhcnMuam9pbignJicpICsgJ1wiICcgK1xuJ3dpZHRoPVwiJyArIHdpZHRoICsgJ1wiICcgK1xuJ2hlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgJyArXG4nc2NhbGU9XCJkZWZhdWx0XCInICsgXG4nY2xhc3M9XCJtZWpzLXNoaW1cIj48L2VtYmVkPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGNhc2UgJ3lvdXR1YmUnOlxuXHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgdmlkZW9JZDtcblx0XHRcdFx0Ly8geW91dHUuYmUgdXJsIGZyb20gc2hhcmUgYnV0dG9uXG5cdFx0XHRcdGlmIChwbGF5YmFjay51cmwubGFzdEluZGV4T2YoXCJ5b3V0dS5iZVwiKSAhPSAtMSkge1xuXHRcdFx0XHRcdHZpZGVvSWQgPSBwbGF5YmFjay51cmwuc3Vic3RyKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZignLycpKzEpO1xuXHRcdFx0XHRcdGlmICh2aWRlb0lkLmluZGV4T2YoJz8nKSAhPSAtMSkge1xuXHRcdFx0XHRcdFx0dmlkZW9JZCA9IHZpZGVvSWQuc3Vic3RyKDAsIHZpZGVvSWQuaW5kZXhPZignPycpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0dmlkZW9JZCA9IHBsYXliYWNrLnVybC5zdWJzdHIocGxheWJhY2sudXJsLmxhc3RJbmRleE9mKCc9JykrMSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0eW91dHViZVNldHRpbmdzID0ge1xuXHRcdFx0XHRcdFx0Y29udGFpbmVyOiBjb250YWluZXIsXG5cdFx0XHRcdFx0XHRjb250YWluZXJJZDogY29udGFpbmVyLmlkLFxuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50OiBwbHVnaW5NZWRpYUVsZW1lbnQsXG5cdFx0XHRcdFx0XHRwbHVnaW5JZDogcGx1Z2luaWQsXG5cdFx0XHRcdFx0XHR2aWRlb0lkOiB2aWRlb0lkLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0XHRcdFx0XHR3aWR0aDogd2lkdGhcdFxuXHRcdFx0XHRcdH07XHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChtZWpzLlBsdWdpbkRldGVjdG9yLmhhc1BsdWdpblZlcnNpb24oJ2ZsYXNoJywgWzEwLDAsMF0pICkge1xuXHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVGbGFzaCh5b3V0dWJlU2V0dGluZ3MpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5lbnF1ZXVlSWZyYW1lKHlvdXR1YmVTZXR0aW5ncyk7XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Ly8gREVNTyBDb2RlLiBEb2VzIE5PVCB3b3JrLlxuXHRcdFx0Y2FzZSAndmltZW8nOlxuXHRcdFx0XHR2YXIgcGxheWVyX2lkID0gcGx1Z2luaWQgKyBcIl9wbGF5ZXJcIjtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnZpbWVvaWQgPSBwbGF5YmFjay51cmwuc3Vic3RyKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZignLycpKzEpO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9JzxpZnJhbWUgc3JjPVwiLy9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLycgKyBwbHVnaW5NZWRpYUVsZW1lbnQudmltZW9pZCArICc/YXBpPTEmcG9ydHJhaXQ9MCZieWxpbmU9MCZ0aXRsZT0wJnBsYXllcl9pZD0nICsgcGxheWVyX2lkICsgJ1wiIHdpZHRoPVwiJyArIHdpZHRoICsnXCIgaGVpZ2h0PVwiJyArIGhlaWdodCArJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIGNsYXNzPVwibWVqcy1zaGltXCIgaWQ9XCInICsgcGxheWVyX2lkICsgJ1wiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7XG5cdFx0XHRcdGlmICh0eXBlb2YoJGYpID09ICdmdW5jdGlvbicpIHsgLy8gZnJvb2dhbG9vcCBhdmFpbGFibGVcblx0XHRcdFx0XHR2YXIgcGxheWVyID0gJGYoY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncmVhZHknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0cGxheWVyLnBsYXlWaWRlbyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAncGxheScgKTtcblx0XHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0XHRwbGF5ZXIuc3RvcFZpZGVvID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICd1bmxvYWQnICk7XG5cdFx0XHRcdFx0XHR9IFxuXHRcdFx0XHRcdFx0cGxheWVyLnBhdXNlVmlkZW8gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3BhdXNlJyApO1xuXHRcdFx0XHRcdFx0fSBcblx0XHRcdFx0XHRcdHBsYXllci5zZWVrVG8gPSBmdW5jdGlvbiggc2Vjb25kcyApIHtcblx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NlZWtUbycsIHNlY29uZHMgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBsYXllci5zZXRWb2x1bWUgPSBmdW5jdGlvbiggdm9sdW1lICkge1xuXHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAnc2V0Vm9sdW1lJywgdm9sdW1lICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwbGF5ZXIuc2V0TXV0ZWQgPSBmdW5jdGlvbiggbXV0ZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGlmKCBtdXRlZCApIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIubGFzdFZvbHVtZSA9IHBsYXllci5hcGkoICdnZXRWb2x1bWUnICk7XG5cdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NldFZvbHVtZScsIDAgKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAnc2V0Vm9sdW1lJywgcGxheWVyLmxhc3RWb2x1bWUgKTtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgcGxheWVyLmxhc3RWb2x1bWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cdFx0XHRcdFx0XHRcblxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsIGV2ZW50TmFtZSwgZSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IGV2ZW50TmFtZSxcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHBsdWdpbk1lZGlhRWxlbWVudFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRpZiAoZXZlbnROYW1lID09ICd0aW1ldXBkYXRlJykge1xuXHRcdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IGUuc2Vjb25kcztcblx0XHRcdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZHVyYXRpb24gPSBvYmouZHVyYXRpb24gPSBlLmR1cmF0aW9uO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kaXNwYXRjaEV2ZW50KG9iai50eXBlLCBvYmopO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGxheWluZycpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncGF1c2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgnZmluaXNoJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnZW5kZWQnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXlQcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICd0aW1ldXBkYXRlJywgZSk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQgPSBjb250YWluZXI7XG5cdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGxheWVyO1xuXG5cdFx0XHRcdFx0XHQvLyBpbml0IG1lanNcblx0XHRcdFx0XHRcdG1lanMuTWVkaWFQbHVnaW5CcmlkZ2UuaW5pdFBsdWdpbihwbHVnaW5pZCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiWW91IG5lZWQgdG8gaW5jbHVkZSBmcm9vZ2Fsb29wIGZvciB2aW1lbyB0byB3b3JrXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1x0XHRcdFxuXHRcdH1cblx0XHQvLyBoaWRlIG9yaWdpbmFsIGVsZW1lbnRcblx0XHRodG1sTWVkaWFFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0Ly8gcHJldmVudCBicm93c2VyIGZyb20gYXV0b3BsYXlpbmcgd2hlbiB1c2luZyBhIHBsdWdpblxuXHRcdGh0bWxNZWRpYUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhdXRvcGxheScpO1xuXG5cdFx0Ly8gRllJOiBvcHRpb25zLnN1Y2Nlc3Mgd2lsbCBiZSBmaXJlZCBieSB0aGUgTWVkaWFQbHVnaW5CcmlkZ2Vcblx0XHRcblx0XHRyZXR1cm4gcGx1Z2luTWVkaWFFbGVtZW50O1xuXHR9LFxuXG5cdHVwZGF0ZU5hdGl2ZTogZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIGF1dG9wbGF5LCBwcmVsb2FkKSB7XG5cdFx0XG5cdFx0dmFyIGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0bTtcblx0XHRcblx0XHRcblx0XHQvLyBhZGQgbWV0aG9kcyB0byB2aWRlbyBvYmplY3QgdG8gYnJpbmcgaXQgaW50byBwYXJpdHkgd2l0aCBGbGFzaCBPYmplY3Rcblx0XHRmb3IgKG0gaW4gbWVqcy5IdG1sTWVkaWFFbGVtZW50KSB7XG5cdFx0XHRodG1sTWVkaWFFbGVtZW50W21dID0gbWVqcy5IdG1sTWVkaWFFbGVtZW50W21dO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0Q2hyb21lIG5vdyBzdXBwb3J0cyBwcmVsb2FkPVwibm9uZVwiXG5cdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0Nocm9tZSkge1xuXHRcdFxuXHRcdFx0Ly8gc3BlY2lhbCBjYXNlIHRvIGVuZm9yY2UgcHJlbG9hZCBhdHRyaWJ1dGUgKENocm9tZSBkb2Vzbid0IHJlc3BlY3QgdGhpcylcblx0XHRcdGlmIChwcmVsb2FkID09PSAnbm9uZScgJiYgIWF1dG9wbGF5KSB7XG5cdFx0XHRcblx0XHRcdFx0Ly8gZm9yY2VzIHRoZSBicm93c2VyIHRvIHN0b3AgbG9hZGluZyAobm90ZTogZmFpbHMgaW4gSUU5KVxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9ICcnO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmxvYWQoKTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5jYW5jZWxlZFByZWxvYWQgPSB0cnVlO1xuXG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKGh0bWxNZWRpYUVsZW1lbnQuY2FuY2VsZWRQcmVsb2FkKSB7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHBsYXliYWNrLnVybDtcblx0XHRcdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5wbGF5KCk7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhbmNlbGVkUHJlbG9hZCA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0Ly8gZm9yIHNvbWUgcmVhc29uIENocm9tZSBmb3JnZXRzIGhvdyB0byBhdXRvcGxheSBzb21ldGltZXMuXG5cdFx0XHR9IGVsc2UgaWYgKGF1dG9wbGF5KSB7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBsYXkoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ki9cblxuXHRcdC8vIGZpcmUgc3VjY2VzcyBjb2RlXG5cdFx0b3B0aW9ucy5zdWNjZXNzKGh0bWxNZWRpYUVsZW1lbnQsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdFxuXHRcdHJldHVybiBodG1sTWVkaWFFbGVtZW50O1xuXHR9XG59O1xuXG4vKlxuIC0gdGVzdCBvbiBJRSAob2JqZWN0IHZzLiBlbWJlZClcbiAtIGRldGVybWluZSB3aGVuIHRvIHVzZSBpZnJhbWUgKEZpcmVmb3gsIFNhZmFyaSwgTW9iaWxlKSB2cy4gRmxhc2ggKENocm9tZSwgSUUpXG4gLSBmdWxsc2NyZWVuP1xuKi9cblxuLy8gWW91VHViZSBGbGFzaCBhbmQgSWZyYW1lIEFQSVxubWVqcy5Zb3VUdWJlQXBpID0ge1xuXHRpc0lmcmFtZVN0YXJ0ZWQ6IGZhbHNlLFxuXHRpc0lmcmFtZUxvYWRlZDogZmFsc2UsXG5cdGxvYWRJZnJhbWVBcGk6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5pc0lmcmFtZVN0YXJ0ZWQpIHtcblx0XHRcdHZhciB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0XHRcdHRhZy5zcmMgPSBcIi8vd3d3LnlvdXR1YmUuY29tL3BsYXllcl9hcGlcIjtcblx0XHRcdHZhciBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcblx0XHRcdGZpcnN0U2NyaXB0VGFnLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhZywgZmlyc3RTY3JpcHRUYWcpO1xuXHRcdFx0dGhpcy5pc0lmcmFtZVN0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0fSxcblx0aWZyYW1lUXVldWU6IFtdLFxuXHRlbnF1ZXVlSWZyYW1lOiBmdW5jdGlvbih5dCkge1xuXHRcdFxuXHRcdGlmICh0aGlzLmlzTG9hZGVkKSB7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZSh5dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9hZElmcmFtZUFwaSgpO1xuXHRcdFx0dGhpcy5pZnJhbWVRdWV1ZS5wdXNoKHl0KTtcblx0XHR9XG5cdH0sXG5cdGNyZWF0ZUlmcmFtZTogZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0XHRcblx0XHR2YXJcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSBzZXR0aW5ncy5wbHVnaW5NZWRpYUVsZW1lbnQsXHRcblx0XHRwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKHNldHRpbmdzLmNvbnRhaW5lcklkLCB7XG5cdFx0XHRoZWlnaHQ6IHNldHRpbmdzLmhlaWdodCxcblx0XHRcdHdpZHRoOiBzZXR0aW5ncy53aWR0aCxcblx0XHRcdHZpZGVvSWQ6IHNldHRpbmdzLnZpZGVvSWQsXG5cdFx0XHRwbGF5ZXJWYXJzOiB7Y29udHJvbHM6MH0sXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdFx0J29uUmVhZHknOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBob29rIHVwIGlmcmFtZSBvYmplY3QgdG8gTUVqc1xuXHRcdFx0XHRcdHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBwbGF5ZXI7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gaW5pdCBtZWpzXG5cdFx0XHRcdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS5pbml0UGx1Z2luKHNldHRpbmdzLnBsdWdpbklkKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBjcmVhdGUgdGltZXJcblx0XHRcdFx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3RpbWV1cGRhdGUnKTtcblx0XHRcdFx0XHR9LCAyNTApO1x0XHRcdFx0XHRcblx0XHRcdFx0fSxcblx0XHRcdFx0J29uU3RhdGVDaGFuZ2UnOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUuZGF0YSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdFxuXHRjcmVhdGVFdmVudDogZnVuY3Rpb24gKHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCBldmVudE5hbWUpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0dHlwZTogZXZlbnROYW1lLFxuXHRcdFx0dGFyZ2V0OiBwbHVnaW5NZWRpYUVsZW1lbnRcblx0XHR9O1xuXG5cdFx0aWYgKHBsYXllciAmJiBwbGF5ZXIuZ2V0RHVyYXRpb24pIHtcblx0XHRcdFxuXHRcdFx0Ly8gdGltZSBcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmR1cmF0aW9uID0gb2JqLmR1cmF0aW9uID0gcGxheWVyLmdldER1cmF0aW9uKCk7XG5cdFx0XHRcblx0XHRcdC8vIHN0YXRlXG5cdFx0XHRvYmoucGF1c2VkID0gcGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZDtcblx0XHRcdG9iai5lbmRlZCA9IHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZDtcdFx0XHRcblx0XHRcdFxuXHRcdFx0Ly8gc291bmRcblx0XHRcdG9iai5tdXRlZCA9IHBsYXllci5pc011dGVkKCk7XG5cdFx0XHRvYmoudm9sdW1lID0gcGxheWVyLmdldFZvbHVtZSgpIC8gMTAwO1xuXHRcdFx0XG5cdFx0XHQvLyBwcm9ncmVzc1xuXHRcdFx0b2JqLmJ5dGVzVG90YWwgPSBwbGF5ZXIuZ2V0VmlkZW9CeXRlc1RvdGFsKCk7XG5cdFx0XHRvYmouYnVmZmVyZWRCeXRlcyA9IHBsYXllci5nZXRWaWRlb0J5dGVzTG9hZGVkKCk7XG5cdFx0XHRcblx0XHRcdC8vIGZha2UgdGhlIFczQyBidWZmZXJlZCBUaW1lUmFuZ2Vcblx0XHRcdHZhciBidWZmZXJlZFRpbWUgPSBvYmouYnVmZmVyZWRCeXRlcyAvIG9iai5ieXRlc1RvdGFsICogb2JqLmR1cmF0aW9uO1xuXHRcdFx0XG5cdFx0XHRvYmoudGFyZ2V0LmJ1ZmZlcmVkID0gb2JqLmJ1ZmZlcmVkID0ge1xuXHRcdFx0XHRzdGFydDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5kOiBmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gYnVmZmVyZWRUaW1lO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRsZW5ndGg6IDFcblx0XHRcdH07XG5cblx0XHR9XG5cdFx0XG5cdFx0Ly8gc2VuZCBldmVudCB1cCB0aGUgY2hhaW5cblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZGlzcGF0Y2hFdmVudChvYmoudHlwZSwgb2JqKTtcblx0fSxcdFxuXHRcblx0aUZyYW1lUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuaXNMb2FkZWQgPSB0cnVlO1xuXHRcdHRoaXMuaXNJZnJhbWVMb2FkZWQgPSB0cnVlO1xuXHRcdFxuXHRcdHdoaWxlICh0aGlzLmlmcmFtZVF1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuaWZyYW1lUXVldWUucG9wKCk7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZShzZXR0aW5ncyk7XG5cdFx0fVx0XG5cdH0sXG5cdFxuXHQvLyBGTEFTSCFcblx0Zmxhc2hQbGF5ZXJzOiB7fSxcblx0Y3JlYXRlRmxhc2g6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0XG5cdFx0dGhpcy5mbGFzaFBsYXllcnNbc2V0dGluZ3MucGx1Z2luSWRdID0gc2V0dGluZ3M7XG5cdFx0XG5cdFx0Lypcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCIvL3d3dy55b3V0dWJlLmNvbS9hcGlwbGF5ZXI/ZW5hYmxlanNhcGk9MSZhbXA7cGxheWVyYXBpaWQ9JyArIHNldHRpbmdzLnBsdWdpbklkICArICcmYW1wO3ZlcnNpb249MyZhbXA7YXV0b3BsYXk9MCZhbXA7Y29udHJvbHM9MCZhbXA7bW9kZXN0YnJhbmRpbmc9MSZsb29wPTBcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0Ki9cblxuXHRcdHZhciBzcGVjaWFsSUVDb250YWluZXIsXG5cdFx0XHR5b3V0dWJlVXJsID0gJy8vd3d3LnlvdXR1YmUuY29tL2FwaXBsYXllcj9lbmFibGVqc2FwaT0xJmFtcDtwbGF5ZXJhcGlpZD0nICsgc2V0dGluZ3MucGx1Z2luSWQgICsgJyZhbXA7dmVyc2lvbj0zJmFtcDthdXRvcGxheT0wJmFtcDtjb250cm9scz0wJmFtcDttb2Rlc3RicmFuZGluZz0xJmxvb3A9MCc7XG5cdFx0XHRcblx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzSUUpIHtcblx0XHRcdFxuXHRcdFx0c3BlY2lhbElFQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRzZXR0aW5ncy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc3BlY2lhbElFQ29udGFpbmVyKTtcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lci5vdXRlckhUTUwgPSAnPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCIvL2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYlwiICcgK1xuJ2lkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIHdpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcblx0JzxwYXJhbSBuYW1lPVwibW92aWVcIiB2YWx1ZT1cIicgKyB5b3V0dWJlVXJsICsgJ1wiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cImFsbG93U2NyaXB0QWNjZXNzXCIgdmFsdWU9XCJhbHdheXNcIiAvPicgK1xuXHQnPHBhcmFtIG5hbWU9XCJhbGxvd0Z1bGxTY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzwvb2JqZWN0Pic7XG5cdFx0fSBlbHNlIHtcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCInICsgeW91dHViZVVybCArICdcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0fVx0XHRcblx0XHRcblx0fSxcblx0XG5cdGZsYXNoUmVhZHk6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyXG5cdFx0XHRzZXR0aW5ncyA9IHRoaXMuZmxhc2hQbGF5ZXJzW2lkXSxcblx0XHRcdHBsYXllciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSxcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudCA9IHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudDtcblx0XHRcblx0XHQvLyBob29rIHVwIGFuZCByZXR1cm4gdG8gTWVkaWFFTGVtZW50UGxheWVyLnN1Y2Nlc3NcdFxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudCA9IHBsYXllcjtcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLmluaXRQbHVnaW4oaWQpO1xuXHRcdFxuXHRcdC8vIGxvYWQgdGhlIHlvdXR1YmUgdmlkZW9cblx0XHRwbGF5ZXIuY3VlVmlkZW9CeUlkKHNldHRpbmdzLnZpZGVvSWQpO1xuXHRcdFxuXHRcdHZhciBjYWxsYmFja05hbWUgPSBzZXR0aW5ncy5jb250YWluZXJJZCArICdfY2FsbGJhY2snO1xuXHRcdFxuXHRcdHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZSkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUsIHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50KTtcblx0XHR9XG5cdFx0XG5cdFx0cGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ29uU3RhdGVDaGFuZ2UnLCBjYWxsYmFja05hbWUpO1xuXHRcdFxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAndGltZXVwZGF0ZScpO1xuXHRcdH0sIDI1MCk7XG5cdFx0XG5cdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnY2FucGxheScpO1xuXHR9LFxuXHRcblx0aGFuZGxlU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKHlvdVR1YmVTdGF0ZSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpIHtcblx0XHRzd2l0Y2ggKHlvdVR1YmVTdGF0ZSkge1xuXHRcdFx0Y2FzZSAtMTogLy8gbm90IHN0YXJ0ZWRcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IHRydWU7XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZCA9IHRydWU7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ2xvYWRlZG1ldGFkYXRhJyk7XG5cdFx0XHRcdC8vY3JlYXRlWW91VHViZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnbG9hZGVkZGF0YScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSB0cnVlO1xuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdlbmRlZCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3BsYXlpbmcnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzogLy8gYnVmZmVyaW5nXG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3Byb2dyZXNzJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHQvLyBjdWVkP1xuXHRcdFx0XHRicmVhaztcdFx0XHRcdFx0XHRcblx0XHRcdFxuXHRcdH1cdFx0XHRcblx0XHRcblx0fVxufVxuLy8gSUZSQU1FXG5mdW5jdGlvbiBvbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmlGcmFtZVJlYWR5KCk7XG59XG4vLyBGTEFTSFxuZnVuY3Rpb24gb25Zb3VUdWJlUGxheWVyUmVhZHkoaWQpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmZsYXNoUmVhZHkoaWQpO1xufVxuXG53aW5kb3cubWVqcyA9IG1lanM7XG53aW5kb3cuTWVkaWFFbGVtZW50ID0gbWVqcy5NZWRpYUVsZW1lbnQ7XG5cbi8qXG4gKiBBZGRzIEludGVybmF0aW9uYWxpemF0aW9uIGFuZCBsb2NhbGl6YXRpb24gdG8gbWVkaWFlbGVtZW50LlxuICpcbiAqIFRoaXMgZmlsZSBkb2VzIG5vdCBjb250YWluIHRyYW5zbGF0aW9ucywgeW91IGhhdmUgdG8gYWRkIHRoZW0gbWFudWFsbHkuXG4gKiBUaGUgc2NoZW1hIGlzIGFsd2F5cyB0aGUgc2FtZTogbWUtaTE4bi1sb2NhbGUtW0lFVEYtbGFuZ3VhZ2UtdGFnXS5qc1xuICpcbiAqIEV4YW1wbGVzIGFyZSBwcm92aWRlZCBib3RoIGZvciBnZXJtYW4gYW5kIGNoaW5lc2UgdHJhbnNsYXRpb24uXG4gKlxuICpcbiAqIFdoYXQgaXMgdGhlIGNvbmNlcHQgYmV5b25kIGkxOG4/XG4gKiAgIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSW50ZXJuYXRpb25hbGl6YXRpb25fYW5kX2xvY2FsaXphdGlvblxuICpcbiAqIFdoYXQgbGFuZ2NvZGUgc2hvdWxkIGkgdXNlP1xuICogICBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lFVEZfbGFuZ3VhZ2VfdGFnXG4gKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM1NjQ2XG4gKlxuICpcbiAqIExpY2Vuc2U/XG4gKlxuICogICBUaGUgaTE4biBmaWxlIHVzZXMgbWV0aG9kcyBmcm9tIHRoZSBEcnVwYWwgcHJvamVjdCAoZHJ1cGFsLmpzKTpcbiAqICAgICAtIGkxOG4ubWV0aG9kcy50KCkgKG1vZGlmaWVkKVxuICogICAgIC0gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oKSAoZnVsbCBjb3B5KVxuICpcbiAqICAgVGhlIERydXBhbCBwcm9qZWN0IGlzIChsaWtlIG1lZGlhZWxlbWVudGpzKSBsaWNlbnNlZCB1bmRlciBHUEx2Mi5cbiAqICAgIC0gaHR0cDovL2RydXBhbC5vcmcvbGljZW5zaW5nL2ZhcS8jcTFcbiAqICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2pvaG5keWVyL21lZGlhZWxlbWVudFxuICogICAgLSBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvb2xkLWxpY2Vuc2VzL2dwbC0yLjAuaHRtbFxuICpcbiAqXG4gKiBAYXV0aG9yXG4gKiAgIFRpbSBMYXR6IChsYXR6LnRpbUBnbWFpbC5jb20pXG4gKlxuICpcbiAqIEBwYXJhbXNcbiAqICAtIGNvbnRleHQgLSBkb2N1bWVudCwgaWZyYW1lIC4uXG4gKiAgLSBleHBvcnRzIC0gQ29tbW9uSlMsIHdpbmRvdyAuLlxuICpcbiAqL1xuOyhmdW5jdGlvbihjb250ZXh0LCBleHBvcnRzLCB1bmRlZmluZWQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBpMThuID0ge1xuICAgICAgICBcImxvY2FsZVwiOiB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgcHJldmlvdXMgdmFsdWVzIGFyZW4ndCBvdmVyd3JpdHRlbi5cbiAgICAgICAgICAgIFwibGFuZ3VhZ2VcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5sYW5ndWFnZSkgfHwgJycsXG4gICAgICAgICAgICBcInN0cmluZ3NcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5zdHJpbmdzKSB8fCB7fVxuICAgICAgICB9LFxuICAgICAgICBcImlldGZfbGFuZ19yZWdleFwiIDogL14oeFxcLSk/W2Etel17Mix9KFxcLVxcd3syLH0pPyhcXC1cXHd7Mix9KT8kLyxcbiAgICAgICAgXCJtZXRob2RzXCIgOiB7fVxuICAgIH07XG4vLyBzdGFydCBpMThuXG5cblxuICAgIC8qKlxuICAgICAqIEdldCBsYW5ndWFnZSwgZmFsbGJhY2sgdG8gYnJvd3NlcidzIGxhbmd1YWdlIGlmIGVtcHR5XG4gICAgICpcbiAgICAgKiBJRVRGOiBSRkMgNTY0NiwgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU2NDZcbiAgICAgKiBFeGFtcGxlczogZW4sIHpoLUNOLCBjbW4tSGFucy1DTiwgc3ItTGF0bi1SUywgZXMtNDE5LCB4LXByaXZhdGVcbiAgICAgKi9cbiAgICBpMThuLmdldExhbmd1YWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFuZ3VhZ2UgPSBpMThuLmxvY2FsZS5sYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJMYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLmxhbmd1YWdlO1xuICAgICAgICByZXR1cm4gaTE4bi5pZXRmX2xhbmdfcmVnZXguZXhlYyhsYW5ndWFnZSkgPyBsYW5ndWFnZSA6IG51bGw7XG5cbiAgICAgICAgLy8oV0FTOiBjb252ZXJ0IHRvIGlzbyA2MzktMSAoMi1sZXR0ZXJzLCBsb3dlciBjYXNlKSlcbiAgICAgICAgLy9yZXR1cm4gbGFuZ3VhZ2Uuc3Vic3RyKDAsIDIpLnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIC8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbiAgICBpZiAoIHR5cGVvZiBtZWpzTDEwbiAhPSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaTE4bi5sb2NhbGUubGFuZ3VhZ2UgPSBtZWpzTDEwbi5sYW5ndWFnZTtcbiAgICB9XG5cblxuXG4gICAgLyoqXG4gICAgICogRW5jb2RlIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBhIHBsYWluLXRleHQgc3RyaW5nIGZvciBkaXNwbGF5IGFzIEhUTUwuXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBjaGFyYWN0ZXIsIHJlZ2V4LFxuICAgICAgICByZXBsYWNlID0ge1xuICAgICAgICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICAgICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICAgICAgICc+JzogJyZndDsnXG4gICAgICAgIH07XG4gICAgICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgICAgICBmb3IgKGNoYXJhY3RlciBpbiByZXBsYWNlKSB7XG4gICAgICAgICAgICBpZiAocmVwbGFjZS5oYXNPd25Qcm9wZXJ0eShjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKGNoYXJhY3RlciwgJ2cnKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShyZWdleCwgcmVwbGFjZVtjaGFyYWN0ZXJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGUgc3RyaW5ncyB0byB0aGUgcGFnZSBsYW5ndWFnZSBvciBhIGdpdmVuIGxhbmd1YWdlLlxuICAgICAqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyXG4gICAgICogICBBIHN0cmluZyBjb250YWluaW5nIHRoZSBFbmdsaXNoIHN0cmluZyB0byB0cmFuc2xhdGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAgLSAnY29udGV4dCcgKGRlZmF1bHRzIHRvIHRoZSBkZWZhdWx0IGNvbnRleHQpOiBUaGUgY29udGV4dCB0aGUgc291cmNlIHN0cmluZ1xuICAgICAqICAgICBiZWxvbmdzIHRvLlxuICAgICAqXG4gICAgICogQHJldHVyblxuICAgICAqICAgVGhlIHRyYW5zbGF0ZWQgc3RyaW5nLCBlc2NhcGVkIHZpYSBpMThuLm1ldGhvZHMuY2hlY2tQbGFpbigpXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLnQgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIGxvY2FsaXplZCB2ZXJzaW9uIG9mIHRoZSBzdHJpbmcuXG4gICAgICAgIGlmIChpMThuLmxvY2FsZS5zdHJpbmdzICYmIGkxOG4ubG9jYWxlLnN0cmluZ3Nbb3B0aW9ucy5jb250ZXh0XSAmJiBpMThuLmxvY2FsZS5zdHJpbmdzW29wdGlvbnMuY29udGV4dF1bc3RyXSkge1xuICAgICAgICAgICAgc3RyID0gaTE4bi5sb2NhbGUuc3RyaW5nc1tvcHRpb25zLmNvbnRleHRdW3N0cl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oc3RyKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGVyIGZvciBpMThuLm1ldGhvZHMudCgpXG4gICAgICpcbiAgICAgKiBAc2VlIGkxOG4ubWV0aG9kcy50KClcbiAgICAgKiBAdGhyb3dzIEludmFsaWRBcmd1bWVudEV4Y2VwdGlvblxuICAgICAqL1xuICAgIGkxOG4udCA9IGZ1bmN0aW9uKHN0ciwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyAmJiBzdHIubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAvLyBjaGVjayBldmVyeSB0aW1lIGR1ZSBsYW5ndWFnZSBjYW4gY2hhbmdlIGZvclxuICAgICAgICAgICAgLy8gZGlmZmVyZW50IHJlYXNvbnMgKHRyYW5zbGF0aW9uLCBsYW5nIHN3aXRjaGVyIC4uKVxuICAgICAgICAgICAgdmFyIGxhbmd1YWdlID0gaTE4bi5nZXRMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgXCJjb250ZXh0XCIgOiBsYW5ndWFnZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGkxOG4ubWV0aG9kcy50KHN0ciwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyB7XG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgOiAnSW52YWxpZEFyZ3VtZW50RXhjZXB0aW9uJyxcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIiA6ICdGaXJzdCBhcmd1bWVudCBpcyBlaXRoZXIgbm90IGEgc3RyaW5nIG9yIGVtcHR5LidcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4vLyBlbmQgaTE4blxuICAgIGV4cG9ydHMuaTE4biA9IGkxOG47XG59KGRvY3VtZW50LCBtZWpzKSk7XG5cbi8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbjsoZnVuY3Rpb24oZXhwb3J0cywgdW5kZWZpbmVkKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICggdHlwZW9mIG1lanNMMTBuICE9ICd1bmRlZmluZWQnICkge1xuICAgICAgICBleHBvcnRzW21lanNMMTBuLmxhbmd1YWdlXSA9IG1lanNMMTBuLnN0cmluZ3M7XG4gICAgfVxuXG59KG1lanMuaTE4bi5sb2NhbGUuc3RyaW5ncykpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkL21lZGlhZWxlbWVudC5qc1wiLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24oYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldO1xuXG4gIGkgKz0gZDtcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgcyA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IGVMZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBlID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gbUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzO1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICBlID0gZSAtIGVCaWFzO1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pO1xufTtcblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAdHlwZSB7Q2hhcHRlcnN9XG4gKi9cbnZhciBDaGFwdGVycyA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jaGFwdGVyJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVRpbWVDb250cm9scygpIHtcbiAgcmV0dXJuICQoJzx1bCBjbGFzcz1cInRpbWVjb250cm9sYmFyXCI+PC91bD4nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQm94KCkge1xuICByZXR1cm4gJCgnPGRpdiBjbGFzcz1cImNvbnRyb2xiYXIgYmFyXCI+PC9kaXY+Jyk7XG59XG5cbmZ1bmN0aW9uIHBsYXllclN0YXJ0ZWQocGxheWVyKSB7XG4gIHJldHVybiAoKHR5cGVvZiBwbGF5ZXIuY3VycmVudFRpbWUgPT09ICdudW1iZXInKSAmJiAocGxheWVyLmN1cnJlbnRUaW1lID4gMCkpO1xufVxuXG5mdW5jdGlvbiBnZXRDb21iaW5lZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnY29udHJvbGJ1dHRvbiBjbGlja2VkJywgZXZ0KTtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdwbGF5ZXIgc3RhcnRlZD8nLCBwbGF5ZXJTdGFydGVkKHRoaXMucGxheWVyKSk7XG4gICAgaWYgKCFwbGF5ZXJTdGFydGVkKHRoaXMucGxheWVyKSkge1xuICAgICAgdGhpcy5wbGF5ZXIucGxheSgpO1xuICAgIH1cbiAgICB2YXIgYm91bmRDYWxsQmFjayA9IGNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgYm91bmRDYWxsQmFjaygpO1xuICB9O1xufVxuXG4vKipcbiAqIGluc3RhbnRpYXRlIG5ldyBjb250cm9scyBlbGVtZW50XG4gKiBAcGFyYW0ge2pRdWVyeXxIVE1MRWxlbWVudH0gcGxheWVyIFBsYXllciBlbGVtZW50IHJlZmVyZW5jZVxuICogQHBhcmFtIHtUaW1lbGluZX0gdGltZWxpbmUgVGltZWxpbmUgb2JqZWN0IGZvciB0aGlzIHBsYXllclxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIENvbnRyb2xzICh0aW1lbGluZSkge1xuICB0aGlzLnBsYXllciA9IHRpbWVsaW5lLnBsYXllcjtcbiAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lO1xuICB0aGlzLmJveCA9IGNyZWF0ZUJveCgpO1xuICB0aGlzLnRpbWVDb250cm9sRWxlbWVudCA9IGNyZWF0ZVRpbWVDb250cm9scygpO1xuICB0aGlzLmJveC5hcHBlbmQodGhpcy50aW1lQ29udHJvbEVsZW1lbnQpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSB0aW1lIGNvbnRyb2wgYnV0dG9ucyBhbmQgYWRkIHRoZW0gdG8gdGltZUNvbnRyb2xFbGVtZW50XG4gKiBAcGFyYW0ge251bGx8Q2hhcHRlcnN9IGNoYXB0ZXJNb2R1bGUgd2hlbiBwcmVzZW50IHdpbGwgYWRkIG5leHQgYW5kIHByZXZpb3VzIGNoYXB0ZXIgY29udHJvbHNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5Db250cm9scy5wcm90b3R5cGUuY3JlYXRlVGltZUNvbnRyb2xzID0gZnVuY3Rpb24gKGNoYXB0ZXJNb2R1bGUpIHtcbiAgdmFyIGhhc0NoYXB0ZXJzID0gKGNoYXB0ZXJNb2R1bGUgaW5zdGFuY2VvZiBDaGFwdGVycyk7XG4gIGlmICghaGFzQ2hhcHRlcnMpIHtcbiAgICBjb25zb2xlLmluZm8oJ0NvbnRyb2xzJywgJ2NyZWF0ZVRpbWVDb250cm9scycsICdubyBjaGFwdGVyVGFiIGZvdW5kJyk7XG4gIH1cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1wcmV2aW91cy1jaGFwdGVyJywgJ1p1csO8Y2sgenVtIHZvcmlnZW4gS2FwaXRlbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhY3RpdmVDaGFwdGVyID0gY2hhcHRlck1vZHVsZS5nZXRBY3RpdmVDaGFwdGVyKCk7XG4gICAgICBpZiAodGhpcy50aW1lbGluZS5nZXRUaW1lKCkgPiBhY3RpdmVDaGFwdGVyLnN0YXJ0ICsgMTApIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnWnVyw7xjayB6dW0gS2FwaXRlbGFuZmFuZycsIGNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXIsICdmcm9tJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgICAgICByZXR1cm4gY2hhcHRlck1vZHVsZS5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ1p1csO8Y2sgenVtIHZvcmlnZW4gS2FwaXRlbCcsIGNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXIpO1xuICAgICAgcmV0dXJuIGNoYXB0ZXJNb2R1bGUucHJldmlvdXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuY3JlYXRlQnV0dG9uKCdwd3AtY29udHJvbHMtYmFjay0zMCcsICczMCBTZWt1bmRlbiB6dXLDvGNrJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ3Jld2luZCBiZWZvcmUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgdGhpcy50aW1lbGluZS5zZXRUaW1lKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpIC0gMzApO1xuICAgIGNvbnNvbGUuZGVidWcoJ0NvbnRyb2xzJywgJ3Jld2luZCBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgfSk7XG5cbiAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1mb3J3YXJkLTMwJywgJzMwIFNla3VuZGVuIHZvcicsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdDb250cm9scycsICdmZndkIGJlZm9yZScsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgICB0aGlzLnRpbWVsaW5lLnNldFRpbWUodGhpcy50aW1lbGluZS5nZXRUaW1lKCkgKyAzMCk7XG4gICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnZmZ3ZCBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgfSk7XG5cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1uZXh0LWNoYXB0ZXInLCAnWnVtIG7DpGNoc3RlbiBLYXBpdGVsIHNwcmluZ2VuJywgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnbmV4dCBDaGFwdGVyIGJlZm9yZScsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgICAgIGNoYXB0ZXJNb2R1bGUubmV4dCgpO1xuICAgICAgY29uc29sZS5kZWJ1ZygnQ29udHJvbHMnLCAnbmV4dCBDaGFwdGVyIGFmdGVyJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgIH0pO1xuICB9XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUuY3JlYXRlQnV0dG9uID0gZnVuY3Rpb24gY3JlYXRlQnV0dG9uKGljb24sIHRpdGxlLCBjYWxsYmFjaykge1xuICB2YXIgYnV0dG9uID0gJCgnPGxpPjxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidXR0b24gYnV0dG9uLWNvbnRyb2xcIiB0aXRsZT1cIicgKyB0aXRsZSArICdcIj4nICtcbiAgICAnPGkgY2xhc3M9XCJpY29uICcgKyBpY29uICsgJ1wiPjwvaT48L2E+PC9saT4nKTtcbiAgdGhpcy50aW1lQ29udHJvbEVsZW1lbnQuYXBwZW5kKGJ1dHRvbik7XG4gIHZhciBjb21iaW5lZENhbGxiYWNrID0gZ2V0Q29tYmluZWRDYWxsYmFjayhjYWxsYmFjayk7XG4gIGJ1dHRvbi5vbignY2xpY2snLCBjb21iaW5lZENhbGxiYWNrLmJpbmQodGhpcykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb250cm9scy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLy8gZXZlcnl0aGluZyBmb3IgYW4gZW1iZWRkZWQgcGxheWVyXG52YXJcbiAgcGxheWVycyA9IFtdLFxuICBsYXN0SGVpZ2h0ID0gMCxcbiAgJGJvZHk7XG5cbmZ1bmN0aW9uIHBvc3RUb09wZW5lcihvYmopIHtcbiAgY29uc29sZS5kZWJ1ZygncG9zdFRvT3BlbmVyJywgb2JqKTtcbiAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShvYmosICcqJyk7XG59XG5cbmZ1bmN0aW9uIG1lc3NhZ2VMaXN0ZW5lciAoZXZlbnQpIHtcbiAgdmFyIG9yaWcgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXG4gIGlmIChvcmlnLmRhdGEuYWN0aW9uID09PSAncGF1c2UnKSB7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3JNZXRhZGF0YSAoY2FsbGJhY2spIHtcbiAgZnVuY3Rpb24gbWV0YURhdGFMaXN0ZW5lciAoZXZlbnQpIHtcbiAgICB2YXIgb3JpZyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG4gICAgaWYgKG9yaWcuZGF0YS5wbGF5ZXJPcHRpb25zKSB7XG4gICAgICBjYWxsYmFjayhvcmlnLmRhdGEucGxheWVyT3B0aW9ucyk7XG4gICAgfVxuICB9XG4gICQod2luZG93KS5vbignbWVzc2FnZScsIG1ldGFEYXRhTGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBwb2xsSGVpZ2h0KCkge1xuICB2YXIgbmV3SGVpZ2h0ID0gJGJvZHkuaGVpZ2h0KCk7XG4gIGlmIChsYXN0SGVpZ2h0ICE9PSBuZXdIZWlnaHQpIHtcbiAgICBwb3N0VG9PcGVuZXIoe1xuICAgICAgYWN0aW9uOiAncmVzaXplJyxcbiAgICAgIGFyZzogbmV3SGVpZ2h0XG4gICAgfSk7XG4gIH1cblxuICBsYXN0SGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbEhlaWdodCwgZG9jdW1lbnQuYm9keSk7XG59XG5cbi8qKlxuICogaW5pdGlhbGl6ZSBlbWJlZCBmdW5jdGlvbmFsaXR5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSAkIGpRdWVyeVxuICogQHBhcmFtIHtBcnJheX0gcGxheWVyTGlzdCBhbGwgcGxheWVyc2luIHRoaXMgd2luZG93XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gaW5pdCgkLCBwbGF5ZXJMaXN0KSB7XG4gIHBsYXllcnMgPSBwbGF5ZXJMaXN0O1xuICAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSk7XG4gICQod2luZG93KS5vbignbWVzc2FnZScsIG1lc3NhZ2VMaXN0ZW5lcik7XG4gIHBvbGxIZWlnaHQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHBvc3RUb09wZW5lcjogcG9zdFRvT3BlbmVyLFxuICB3YWl0Rm9yTWV0YWRhdGE6IHdhaXRGb3JNZXRhZGF0YSxcbiAgaW5pdDogaW5pdFxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbWJlZC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKiFcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFBvZGxvdmUgV2ViIFBsYXllciB2My4wLjAtYWxwaGFcbiAqIExpY2Vuc2VkIHVuZGVyIFRoZSBCU0QgMi1DbGF1c2UgTGljZW5zZVxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0yLUNsYXVzZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBHZXJyaXQgdmFuIEFha2VuIChodHRwczovL2dpdGh1Yi5jb20vZ2Vycml0dmFuYWFrZW4vKSwgU2ltb24gV2FsZGhlcnIgKGh0dHBzOi8vZ2l0aHViLmNvbS9zaW1vbndhbGRoZXJyLyksIEZyYW5rIEhhc2UgKGh0dHBzOi8vZ2l0aHViLmNvbS9LYW1iZmhhc2UvKSwgRXJpYyBUZXViZXJ0IChodHRwczovL2dpdGh1Yi5jb20vZXRldWJlcnQvKSBhbmQgb3RoZXJzIChodHRwczovL2dpdGh1Yi5jb20vcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvY29udHJpYnV0b3JzKVxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKlxuICogLSBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAtIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRhYlJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi90YWJyZWdpc3RyeScpLFxuICBlbWJlZCA9IHJlcXVpcmUoJy4vZW1iZWQnKSxcbiAgVGltZWxpbmUgPSByZXF1aXJlKCcuL3RpbWVsaW5lJyksXG4gIEluZm8gPSByZXF1aXJlKCcuL21vZHVsZXMvaW5mbycpLFxuICBTaGFyZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9zaGFyZScpLFxuICBEb3dubG9hZHMgPSByZXF1aXJlKCcuL21vZHVsZXMvZG93bmxvYWRzJyksXG4gIENoYXB0ZXJzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NoYXB0ZXInKSxcbiAgU2F2ZVRpbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvc2F2ZXRpbWUnKSxcbiAgQ29udHJvbHMgPSByZXF1aXJlKCcuL2NvbnRyb2xzJyksXG4gIFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyJyksXG4gIFByb2dyZXNzQmFyID0gcmVxdWlyZSgnLi9tb2R1bGVzL3Byb2dyZXNzYmFyJyk7XG5cbnZhciBwd3A7XG5cbi8vIHdpbGwgZXhwb3NlL2F0dGFjaCBpdHNlbGYgdG8gdGhlICQgZ2xvYmFsXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZC9tZWRpYWVsZW1lbnQuanMnKTtcblxuLyoqXG4gKiBUaGUgbW9zdCBtaXNzaW5nIGZlYXR1cmUgcmVnYXJkaW5nIGVtYmVkZGVkIHBsYXllcnNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSB0aGUgdGl0bGUgb2YgdGhlIHNob3dcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgKG9wdGlvbmFsKSB0aGUgbGluayB0byB0aGUgc2hvd1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyU2hvd1RpdGxlKHRpdGxlLCB1cmwpIHtcbiAgaWYgKCF0aXRsZSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAodXJsKSB7XG4gICAgdGl0bGUgPSAnPGEgaHJlZj1cIicgKyB1cmwgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgdGl0bGU9XCJMaW5rIHp1ciBTaG93XCI+JyArIHRpdGxlICsgJzwvYT4nO1xuICB9XG4gIHJldHVybiAnPGgzIGNsYXNzPVwic2hvd3RpdGxlXCI+JyArIHRpdGxlICsgJzwvaDM+Jztcbn1cblxuLyoqXG4gKiBSZW5kZXIgZXBpc29kZSB0aXRsZSBIVE1MXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICogQHBhcmFtIHtzdHJpbmd9IGxpbmtcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclRpdGxlKHRleHQsIGxpbmspIHtcbiAgdmFyIHRpdGxlQmVnaW4gPSAnPGgxIGNsYXNzPVwiZXBpc29kZXRpdGxlXCI+JyxcbiAgICB0aXRsZUVuZCA9ICc8L2gxPic7XG4gIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQgJiYgbGluayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGV4dCA9ICc8YSBocmVmPVwiJyArIGxpbmsgKyAnXCIgIHRhcmdldD1cIl9ibGFua1wiIHRpdGxlPVwiTGluayB6dXIgRXBpc29kZVwiPicgKyB0ZXh0ICsgJzwvYT4nO1xuICB9XG4gIHJldHVybiB0aXRsZUJlZ2luICsgdGV4dCArIHRpdGxlRW5kO1xufVxuXG4vKipcbiAqIFJlbmRlciBIVE1MIHN1YnRpdGxlXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyU3ViVGl0bGUodGV4dCkge1xuICBpZiAoIXRleHQpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuICc8aDIgY2xhc3M9XCJzdWJ0aXRsZVwiPicgKyB0ZXh0ICsgJzwvaDI+Jztcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCB0aXRsZSBhcmVhXG4gKiBAcGFyYW0gcGFyYW1zXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJUaXRsZUFyZWEocGFyYW1zKSB7XG4gIHJldHVybiAnPGhlYWRlcj4nICtcbiAgICByZW5kZXJTaG93VGl0bGUocGFyYW1zLnNob3cudGl0bGUsIHBhcmFtcy5zaG93LnVybCkgK1xuICAgIHJlbmRlclRpdGxlKHBhcmFtcy50aXRsZSwgcGFyYW1zLnBlcm1hbGluaykgK1xuICAgIHJlbmRlclN1YlRpdGxlKHBhcmFtcy5zdWJ0aXRsZSkgK1xuICAgICc8L2hlYWRlcj4nO1xufVxuXG4vKipcbiAqIFJlbmRlciBIVE1MIHBsYXlidXR0b25cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclBsYXlidXR0b24oKSB7XG4gIHJldHVybiAkKCc8YSBjbGFzcz1cInBsYXlcIiB0aXRsZT1cIkFic3BpZWxlblwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48L2E+Jyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBwb3N0ZXIgaW1hZ2UgaW4gSFRNTFxuICogcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgaWYgcG9zdGVyVXJsIGlzIGVtcHR5XG4gKiBAcGFyYW0ge3N0cmluZ30gcG9zdGVyVXJsXG4gKiBAcmV0dXJucyB7c3RyaW5nfSByZW5kZXJlZCBIVE1MXG4gKi9cbmZ1bmN0aW9uIHJlbmRlclBvc3Rlcihwb3N0ZXJVcmwpIHtcbiAgaWYgKCFwb3N0ZXJVcmwpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiY292ZXJhcnRcIj48aW1nIGNsYXNzPVwiY292ZXJpbWdcIiBzcmM9XCInICsgcG9zdGVyVXJsICsgJ1wiIGRhdGEtaW1nPVwiJyArIHBvc3RlclVybCArICdcIiBhbHQ9XCJQb3N0ZXIgSW1hZ2VcIj48L2Rpdj4nO1xufVxuXG4vKipcbiAqIGNoZWNrcyBpZiB0aGUgY3VycmVudCB3aW5kb3cgaXMgaGlkZGVuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93IGlzIGhpZGRlblxuICovXG5mdW5jdGlvbiBpc0hpZGRlbigpIHtcbiAgdmFyIHByb3BzID0gW1xuICAgICdoaWRkZW4nLFxuICAgICdtb3pIaWRkZW4nLFxuICAgICdtc0hpZGRlbicsXG4gICAgJ3dlYmtpdEhpZGRlbidcbiAgXTtcblxuICBmb3IgKHZhciBpbmRleCBpbiBwcm9wcykge1xuICAgIGlmIChwcm9wc1tpbmRleF0gaW4gZG9jdW1lbnQpIHtcbiAgICAgIHJldHVybiAhIWRvY3VtZW50W3Byb3BzW2luZGV4XV07XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTW9kdWxlcyh0aW1lbGluZSwgd3JhcHBlciwgcGFyYW1zKSB7XG4gIHZhclxuICAgIHRhYnMgPSBuZXcgVGFiUmVnaXN0cnkoKSxcbiAgICBoYXNDaGFwdGVycyA9IHRpbWVsaW5lLmhhc0NoYXB0ZXJzLFxuICAgIGNvbnRyb2xzID0gbmV3IENvbnRyb2xzKHRpbWVsaW5lKSxcbiAgICBjb250cm9sQm94ID0gY29udHJvbHMuYm94O1xuXG4gIC8qKlxuICAgKiAtLSBNT0RVTEVTIC0tXG4gICAqL1xuICB2YXIgY2hhcHRlcnM7XG4gIGlmIChoYXNDaGFwdGVycykge1xuICAgIGNoYXB0ZXJzID0gbmV3IENoYXB0ZXJzKHRpbWVsaW5lLCBwYXJhbXMpO1xuICAgIHRpbWVsaW5lLmFkZE1vZHVsZShjaGFwdGVycyk7XG4gIH1cbiAgY29udHJvbHMuY3JlYXRlVGltZUNvbnRyb2xzKGNoYXB0ZXJzKTtcblxuICB2YXIgc2F2ZVRpbWUgPSBuZXcgU2F2ZVRpbWUodGltZWxpbmUsIHBhcmFtcyk7XG4gIHRpbWVsaW5lLmFkZE1vZHVsZShzYXZlVGltZSk7XG5cbiAgdmFyIHByb2dyZXNzQmFyID0gbmV3IFByb2dyZXNzQmFyKHRpbWVsaW5lKTtcbiAgdGltZWxpbmUuYWRkTW9kdWxlKHByb2dyZXNzQmFyKTtcblxuICB2YXIgc2hhcmluZyA9IG5ldyBTaGFyZShwYXJhbXMpO1xuICB2YXIgZG93bmxvYWRzID0gbmV3IERvd25sb2FkcyhwYXJhbXMpO1xuICB2YXIgaW5mb3MgPSBuZXcgSW5mbyhwYXJhbXMpO1xuXG4gIC8qKlxuICAgKiAtLSBUQUJTIC0tXG4gICAqIFRoZSB0YWJzIGluIGNvbnRyb2xiYXIgd2lsbCBhcHBlYXIgaW4gZm9sbG93aW5nIG9yZGVyOlxuICAgKi9cblxuICBpZiAoaGFzQ2hhcHRlcnMpIHtcbiAgICB0YWJzLmFkZChjaGFwdGVycy50YWIpO1xuICB9XG5cbiAgdGFicy5hZGQoc2hhcmluZy50YWIpO1xuICB0YWJzLmFkZChkb3dubG9hZHMudGFiKTtcbiAgdGFicy5hZGQoaW5mb3MudGFiKTtcblxuICB0YWJzLm9wZW5Jbml0aWFsKHBhcmFtcy5hY3RpdmVUYWIpO1xuXG4gIC8vIFJlbmRlciBjb250cm9sYmFyIHdpdGggdG9nZ2xlYmFyIGFuZCB0aW1lY29udHJvbHNcbiAgdmFyIGNvbnRyb2xiYXJXcmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cImNvbnRyb2xiYXItd3JhcHBlclwiPjwvZGl2PicpO1xuICBjb250cm9sYmFyV3JhcHBlci5hcHBlbmQodGFicy50b2dnbGViYXIpO1xuICBjb250cm9sYmFyV3JhcHBlci5hcHBlbmQoY29udHJvbEJveCk7XG5cbiAgLy8gcmVuZGVyIHByb2dyZXNzYmFyLCBjb250cm9sYmFyIGFuZCB0YWJzXG4gIHdyYXBwZXJcbiAgICAuYXBwZW5kKHByb2dyZXNzQmFyLnJlbmRlcigpKVxuICAgIC5hcHBlbmQoY29udHJvbGJhcldyYXBwZXIpXG4gICAgLmFwcGVuZCh0YWJzLmNvbnRhaW5lcik7XG5cbiAgcHJvZ3Jlc3NCYXIuYWRkRXZlbnRzKCk7XG59XG5cbi8qKlxuICogYWRkIGNoYXB0ZXIgYmVoYXZpb3IgYW5kIGRlZXBsaW5raW5nOiBza2lwIHRvIHJlZmVyZW5jZWRcbiAqIHRpbWUgcG9zaXRpb24gJiB3cml0ZSBjdXJyZW50IHRpbWUgaW50byBhZGRyZXNzXG4gKiBAcGFyYW0ge29iamVjdH0gcGxheWVyXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0ge29iamVjdH0gd3JhcHBlclxuICovXG5mdW5jdGlvbiBhZGRCZWhhdmlvcihwbGF5ZXIsIHBhcmFtcywgd3JhcHBlcikge1xuICB2YXIganFQbGF5ZXIgPSAkKHBsYXllciksXG4gICAgdGltZWxpbmUgPSBuZXcgVGltZWxpbmUocGxheWVyLCBwYXJhbXMpLFxuXG4gICAgbWV0YUVsZW1lbnQgPSAkKCc8ZGl2IGNsYXNzPVwidGl0bGViYXJcIj48L2Rpdj4nKSxcbiAgICBwbGF5ZXJUeXBlID0gcGFyYW1zLnR5cGUsXG4gICAgcGxheUJ1dHRvbiA9IHJlbmRlclBsYXlidXR0b24oKSxcbiAgICBwb3N0ZXIgPSBwYXJhbXMucG9zdGVyIHx8IGpxUGxheWVyLmF0dHIoJ3Bvc3RlcicpO1xuXG4gIHZhciBkZWVwTGluaztcblxuICBjb25zb2xlLmRlYnVnKCd3ZWJwbGF5ZXInLCAnbWV0YWRhdGEnLCB0aW1lbGluZS5nZXREYXRhKCkpO1xuICBqcVBsYXllci5wcm9wKHtcbiAgICBjb250cm9sczogbnVsbCxcbiAgICBwcmVsb2FkOiAnbWV0YWRhdGEnXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBCdWlsZCByaWNoIHBsYXllciB3aXRoIG1ldGEgZGF0YVxuICAgKi9cbiAgd3JhcHBlclxuICAgIC5hZGRDbGFzcygncG9kbG92ZXdlYnBsYXllcl8nICsgcGxheWVyVHlwZSlcbiAgICAuZGF0YSgncG9kbG92ZXdlYnBsYXllcicsIHtcbiAgICBwbGF5ZXI6IGpxUGxheWVyXG4gIH0pO1xuXG4gIGlmIChwbGF5ZXJUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgLy8gUmVuZGVyIHBsYXlidXR0b24gaW4gdGl0bGViYXJcbiAgICBtZXRhRWxlbWVudC5wcmVwZW5kKHBsYXlCdXR0b24pO1xuICAgIG1ldGFFbGVtZW50LmFwcGVuZChyZW5kZXJQb3N0ZXIocG9zdGVyKSk7XG4gICAgd3JhcHBlci5wcmVwZW5kKG1ldGFFbGVtZW50KTtcbiAgfVxuXG4gIGlmIChwbGF5ZXJUeXBlID09PSAndmlkZW8nKSB7XG4gICAgdmFyIHZpZGVvUGFuZSA9ICQoJzxkaXYgY2xhc3M9XCJ2aWRlby1wYW5lXCI+PC9kaXY+Jyk7XG4gICAgdmFyIG92ZXJsYXkgPSAkKCc8ZGl2IGNsYXNzPVwidmlkZW8tb3ZlcmxheVwiPjwvZGl2PicpO1xuICAgIG92ZXJsYXkuYXBwZW5kKHBsYXlCdXR0b24pO1xuICAgIG92ZXJsYXkub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHBsYXllci5wYXVzZWQpIHtcbiAgICAgICAgcGxheUJ1dHRvbi5hZGRDbGFzcygncGxheWluZycpO1xuICAgICAgICBwbGF5ZXIucGxheSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwbGF5QnV0dG9uLnJlbW92ZUNsYXNzKCdwbGF5aW5nJyk7XG4gICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICB9KTtcblxuICAgIHZpZGVvUGFuZVxuICAgICAgLmFwcGVuZChvdmVybGF5KVxuICAgICAgLmFwcGVuZChqcVBsYXllcik7XG5cbiAgICB3cmFwcGVyXG4gICAgICAuYXBwZW5kKG1ldGFFbGVtZW50KVxuICAgICAgLmFwcGVuZCh2aWRlb1BhbmUpO1xuXG4gICAganFQbGF5ZXIucHJvcCh7cG9zdGVyOiBwb3N0ZXJ9KTtcbiAgfVxuXG4gIC8vIFJlbmRlciB0aXRsZSBhcmVhIHdpdGggdGl0bGUgaDIgYW5kIHN1YnRpdGxlIGgzXG4gIG1ldGFFbGVtZW50LmFwcGVuZChyZW5kZXJUaXRsZUFyZWEocGFyYW1zKSk7XG5cbiAgLy8gcGFyc2UgZGVlcGxpbmtcbiAgZGVlcExpbmsgPSByZXF1aXJlKCcuL3VybCcpLmNoZWNrQ3VycmVudCgpO1xuICBpZiAoZGVlcExpbmtbMF0gJiYgcHdwLnBsYXllcnMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHBsYXllckF0dHJpYnV0ZXMgPSB7cHJlbG9hZDogJ2F1dG8nfTtcbiAgICBpZiAoIWlzSGlkZGVuKCkpIHtcbiAgICAgIHBsYXllckF0dHJpYnV0ZXMuYXV0b3BsYXkgPSAnYXV0b3BsYXknO1xuICAgIH1cbiAgICBqcVBsYXllci5hdHRyKHBsYXllckF0dHJpYnV0ZXMpO1xuICAgIC8vc3RvcEF0VGltZSA9IGRlZXBMaW5rWzFdO1xuICAgIHRpbWVsaW5lLnBsYXlSYW5nZShkZWVwTGluayk7XG5cbiAgICAkKCdodG1sLCBib2R5JykuZGVsYXkoMTUwKS5hbmltYXRlKHtcbiAgICAgIHNjcm9sbFRvcDogJCgnLmNvbnRhaW5lcjpmaXJzdCcpLm9mZnNldCgpLnRvcCAtIDI1XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAocGxheWVyLmN1cnJlbnRUaW1lICYmIHBsYXllci5jdXJyZW50VGltZSA+IDAgJiYgIXBsYXllci5wYXVzZWQpIHtcbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgICAgaWYgKHBsYXllci5wbHVnaW5UeXBlID09PSAnZmxhc2gnKSB7XG4gICAgICAgIHBsYXllci5wYXVzZSgpOyAgICAvLyBmbGFzaCBmYWxsYmFjayBuZWVkcyBhZGRpdGlvbmFsIHBhdXNlXG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFwbGF5QnV0dG9uLmhhc0NsYXNzKCdwbGF5aW5nJykpIHtcbiAgICAgIHBsYXlCdXR0b24uYWRkQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICB9XG4gICAgcGxheWVyLnBsYXkoKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudClcbiAgICAub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgY29uc29sZS5sb2coJ3Byb2dyZXNzJywgJ2tleWRvd24nLCBlKTtcbiAgICAgIC8qXG4gICAgICAgaWYgKChuZXcgRGF0ZSgpIC0gbGFzdEtleVByZXNzVGltZSkgPj0gMTAwMCkge1xuICAgICAgIHN0YXJ0ZWRQYXVzZWQgPSBtZWRpYS5wYXVzZWQ7XG4gICAgICAgfVxuICAgICAgICovXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB2YXIga2V5Q29kZSA9IGUud2hpY2gsXG4gICAgICAgIGR1cmF0aW9uID0gdGltZWxpbmUucGxheWVyLmR1cmF0aW9uLFxuICAgICAgICBzZWVrVGltZSA9IHRpbWVsaW5lLnBsYXllci5jdXJyZW50VGltZTtcblxuICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcbiAgICAgICAgICBzZWVrVGltZSAtPSAxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM5OiAvLyBSaWdodFxuICAgICAgICAgIHNlZWtUaW1lICs9IDE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzg6IC8vIFVwXG4gICAgICAgICAgaWYgKHRpbWVsaW5lLmhhc0NoYXB0ZXJzKSB7XG4gICAgICAgICAgICB0aW1lbGluZS5tb2R1bGVzWzBdLm5leHQoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2Vla1RpbWUgKz0gTWF0aC5mbG9vcihkdXJhdGlvbiAqIDAuMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6IC8vIERvd25cbiAgICAgICAgICBpZiAodGltZWxpbmUuaGFzQ2hhcHRlcnMpIHtcbiAgICAgICAgICAgIHRpbWVsaW5lLm1vZHVsZXNbMF0ucHJldmlvdXMoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2Vla1RpbWUgLT0gTWF0aC5mbG9vcihkdXJhdGlvbiAqIDAuMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzY6IC8vIEhvbWVcbiAgICAgICAgICBzZWVrVGltZSA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzU6IC8vIGVuZFxuICAgICAgICAgIHNlZWtUaW1lID0gZHVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA6IC8vIGVudGVyXG4gICAgICAgIGNhc2UgMzI6IC8vIHNwYWNlXG4gICAgICAgICAgaWYgKHRpbWVsaW5lLnBsYXllci5wYXVzZWQpIHtcbiAgICAgICAgICAgIHRpbWVsaW5lLnBsYXllci5wbGF5KCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgICAgdGltZWxpbmUucGxheWVyLnBhdXNlKCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGltZWxpbmUuc2V0VGltZShzZWVrVGltZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAganFQbGF5ZXJcbiAgICAub24oJ3RpbWVsaW5lRWxlbWVudCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgY29uc29sZS5sb2coZXZlbnQuY3VycmVudFRhcmdldC5pZCwgZXZlbnQpO1xuICAgIH0pXG4gICAgLm9uKCd0aW1ldXBkYXRlIHByb2dyZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB0aW1lbGluZS51cGRhdGUoZXZlbnQpO1xuICAgIH0pXG4gICAgLy8gdXBkYXRlIHBsYXkvcGF1c2Ugc3RhdHVzXG4gICAgLm9uKCdwbGF5JywgZnVuY3Rpb24gKCkge30pXG4gICAgLm9uKCdwbGF5aW5nJywgZnVuY3Rpb24gKCkge1xuICAgICAgcGxheUJ1dHRvbi5hZGRDbGFzcygncGxheWluZycpO1xuICAgICAgZW1iZWQucG9zdFRvT3BlbmVyKHsgYWN0aW9uOiAncGxheScsIGFyZzogcGxheWVyLmN1cnJlbnRUaW1lIH0pO1xuICAgIH0pXG4gICAgLm9uKCdwYXVzZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIGVtYmVkLnBvc3RUb09wZW5lcih7IGFjdGlvbjogJ3BhdXNlJywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgfSlcbiAgICAub24oJ2VuZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgZW1iZWQucG9zdFRvT3BlbmVyKHsgYWN0aW9uOiAnc3RvcCcsIGFyZzogcGxheWVyLmN1cnJlbnRUaW1lIH0pO1xuICAgICAgLy8gZGVsZXRlIHRoZSBjYWNoZWQgcGxheSB0aW1lXG4gICAgICB0aW1lbGluZS5yZXdpbmQoKTtcbiAgICB9KTtcblxuICB2YXIgZGVsYXlNb2R1bGVSZW5kZXJpbmcgPSAhdGltZWxpbmUuZHVyYXRpb24gfHwgaXNOYU4odGltZWxpbmUuZHVyYXRpb24pIHx8IHRpbWVsaW5lLmR1cmF0aW9uIDw9IDA7XG5cbiAgaWYgKCFkZWxheU1vZHVsZVJlbmRlcmluZykge1xuICAgIHJlbmRlck1vZHVsZXModGltZWxpbmUsIHdyYXBwZXIsIHBhcmFtcyk7XG4gIH1cblxuICBqcVBsYXllci5vbmUoJ2NhbnBsYXknLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY29ycmVjdCBkdXJhdGlvbiBqdXN0IGluIGNhc2VcbiAgICB0aW1lbGluZS5kdXJhdGlvbiA9IHBsYXllci5kdXJhdGlvbjtcbiAgICBpZiAoZGVsYXlNb2R1bGVSZW5kZXJpbmcpIHtcbiAgICAgIHJlbmRlck1vZHVsZXModGltZWxpbmUsIHdyYXBwZXIsIHBhcmFtcyk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiByZXR1cm4gY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCB3aWxsIGF0dGFjaCBzb3VyY2UgZWxlbWVudHMgdG8gdGhlIGRlZmVycmVkIGF1ZGlvIGVsZW1lbnRcbiAqIEBwYXJhbSB7b2JqZWN0fSBkZWZlcnJlZFBsYXllclxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBnZXREZWZlcnJlZFBsYXllckNhbGxCYWNrKGRlZmVycmVkUGxheWVyKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBwYXJhbXMgPSAkLmV4dGVuZCh7fSwgUGxheWVyLmRlZmF1bHRzLCBkYXRhKTtcbiAgICBkYXRhLnNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlT2JqZWN0KSB7XG4gICAgICAkKCc8c291cmNlPicsIHNvdXJjZU9iamVjdCkuYXBwZW5kVG8oZGVmZXJyZWRQbGF5ZXIpO1xuICAgIH0pO1xuICAgIFBsYXllci5jcmVhdGUoZGVmZXJyZWRQbGF5ZXIsIHBhcmFtcywgYWRkQmVoYXZpb3IpO1xuICB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHJldHVybnMge2pRdWVyeX1cbiAqL1xuJC5mbi5wb2Rsb3Zld2VicGxheWVyID0gZnVuY3Rpb24gd2ViUGxheWVyKG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuZGVmZXJyZWQpIHtcbiAgICB2YXIgZGVmZXJyZWRQbGF5ZXIgPSB0aGlzWzBdO1xuICAgIHZhciBjYWxsYmFjayA9IGdldERlZmVycmVkUGxheWVyQ2FsbEJhY2soZGVmZXJyZWRQbGF5ZXIpO1xuICAgIGVtYmVkLndhaXRGb3JNZXRhZGF0YShjYWxsYmFjayk7XG4gICAgZW1iZWQucG9zdFRvT3BlbmVyKHthY3Rpb246ICd3YWl0aW5nJ30pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gQWRkaXRpb25hbCBwYXJhbWV0ZXJzIGRlZmF1bHQgdmFsdWVzXG4gIHZhciBwYXJhbXMgPSAkLmV4dGVuZCh7fSwgUGxheWVyLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAvLyB0dXJuIGVhY2ggcGxheWVyIGluIHRoZSBjdXJyZW50IHNldCBpbnRvIGEgUG9kbG92ZSBXZWIgUGxheWVyXG4gIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKGksIHBsYXllckVsZW1lbnQpIHtcbiAgICBQbGF5ZXIuY3JlYXRlKHBsYXllckVsZW1lbnQsIHBhcmFtcywgYWRkQmVoYXZpb3IpO1xuICB9KTtcbn07XG5cbnB3cCA9IHsgcGxheWVyczogUGxheWVyLnBsYXllcnMgfTtcblxuZW1iZWQuaW5pdCgkLCBQbGF5ZXIucGxheWVycyk7XG5cbndpbmRvdy5wd3AgPSBwd3A7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV82ZmFlMDYyOS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIHRjID0gcmVxdWlyZSgnLi4vdGltZWNvZGUnKVxuICAsIFRhYiA9IHJlcXVpcmUoJy4uL3RhYicpXG4gIDtcblxudmFyIEFDVElWRV9DSEFQVEVSX1RIUkVTSEhPTEQgPSAwLjE7XG5cbmZ1bmN0aW9uIHJvd0NsaWNrSGFuZGxlciAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBjaGFwdGVycyA9IGUuZGF0YS5tb2R1bGU7XG4gIGNvbnNvbGUubG9nKCdDaGFwdGVyJywgJ2NsaWNrSGFuZGxlcicsICdzZXRDdXJyZW50Q2hhcHRlciB0bycsIGUuZGF0YS5pbmRleCk7XG4gIGNoYXB0ZXJzLnNldEN1cnJlbnRDaGFwdGVyKGUuZGF0YS5pbmRleCk7XG4gIGNoYXB0ZXJzLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICBjaGFwdGVycy50aW1lbGluZS5wbGF5ZXIucGxheSgpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUNoYXB0ZXIoY2hhcHRlcikge1xuICBjaGFwdGVyLmNvZGUgPSBjaGFwdGVyLnRpdGxlO1xuICBpZiAodHlwZW9mIGNoYXB0ZXIuc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgY2hhcHRlci5zdGFydCA9IHRjLmdldFN0YXJ0VGltZUNvZGUoY2hhcHRlci5zdGFydCk7XG4gIH1cbiAgcmV0dXJuIGNoYXB0ZXI7XG59XG5cbi8qKlxuICogYWRkIGBlbmRgIHByb3BlcnR5IHRvIGVhY2ggc2ltcGxlIGNoYXB0ZXIsXG4gKiBuZWVkZWQgZm9yIHByb3BlciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb25cbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gYWRkRW5kVGltZShkdXJhdGlvbikge1xuICByZXR1cm4gZnVuY3Rpb24gKGNoYXB0ZXIsIGksIGNoYXB0ZXJzKSB7XG4gICAgdmFyIG5leHQgPSBjaGFwdGVyc1tpICsgMV07XG4gICAgY2hhcHRlci5lbmQgPSBuZXh0ID8gbmV4dC5zdGFydCA6IGR1cmF0aW9uO1xuICAgIHJldHVybiBjaGFwdGVyO1xuICB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXIoaHRtbCkge1xuICByZXR1cm4gJChodG1sKTtcbn1cblxuLyoqXG4gKiByZW5kZXIgSFRNTFRhYmxlRWxlbWVudCBmb3IgY2hhcHRlcnNcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlckNoYXB0ZXJUYWJsZSgpIHtcbiAgcmV0dXJuIHJlbmRlcihcbiAgICAnPHRhYmxlIGNsYXNzPVwicG9kbG92ZXdlYnBsYXllcl9jaGFwdGVyc1wiPjxjYXB0aW9uPkthcGl0ZWw8L2NhcHRpb24+JyArXG4gICAgICAnPHRoZWFkPicgK1xuICAgICAgICAnPHRyPicgK1xuICAgICAgICAgICc8dGggc2NvcGU9XCJjb2xcIj5LYXBpdGVsbnVtbWVyPC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+U3RhcnR6ZWl0PC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+VGl0ZWw8L3RoPicgK1xuICAgICAgICAgICc8dGggc2NvcGU9XCJjb2xcIj5EYXVlcjwvdGg+JyArXG4gICAgICAgICc8L3RyPicgK1xuICAgICAgJzwvdGhlYWQ+JyArXG4gICAgICAnPHRib2R5PjwvdGJvZHk+JyArXG4gICAgJzwvdGFibGU+J1xuICApO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY2hhcHRlclxuICogQHJldHVybnMge2pRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVuZGVyUm93IChjaGFwdGVyLCBpbmRleCkge1xuICByZXR1cm4gcmVuZGVyKFxuICAgICc8dHIgY2xhc3M9XCJjaGFwdGVyXCI+JyArXG4gICAgICAnPHRkIGNsYXNzPVwiY2hhcHRlci1udW1iZXJcIj48c3BhbiBjbGFzcz1cImJhZGdlXCI+JyArIChpbmRleCArIDEpICsgJzwvc3Bhbj48L3RkPicgK1xuICAgICAgJzx0ZCBjbGFzcz1cImNoYXB0ZXItbmFtZVwiPjxzcGFuPicgKyBjaGFwdGVyLmNvZGUgKyAnPC9zcGFuPjwvdGQ+JyArXG4gICAgICAnPHRkIGNsYXNzPVwiY2hhcHRlci1kdXJhdGlvblwiPjxzcGFuPicgKyBjaGFwdGVyLmR1cmF0aW9uICsgJzwvc3Bhbj48L3RkPicgK1xuICAgICc8L3RyPidcbiAgKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2hhcHRlcnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldE1heENoYXB0ZXJTdGFydChjaGFwdGVycykge1xuICBmdW5jdGlvbiBnZXRTdGFydFRpbWUgKGNoYXB0ZXIpIHtcbiAgICByZXR1cm4gY2hhcHRlci5zdGFydDtcbiAgfVxuICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgJC5tYXAoY2hhcHRlcnMsIGdldFN0YXJ0VGltZSkpO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3tlbmQ6e251bWJlcn0sIHN0YXJ0OntudW1iZXJ9fX0gY2hhcHRlclxuICogQHBhcmFtIHtudW1iZXJ9IGN1cnJlbnRUaW1lXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBY3RpdmVDaGFwdGVyIChjaGFwdGVyLCBjdXJyZW50VGltZSkge1xuICBpZiAoIWNoYXB0ZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChjdXJyZW50VGltZSA+IGNoYXB0ZXIuc3RhcnQgLSBBQ1RJVkVfQ0hBUFRFUl9USFJFU0hIT0xEICYmIGN1cnJlbnRUaW1lIDw9IGNoYXB0ZXIuZW5kKTtcbn1cblxuLyoqXG4gKiB1cGRhdGUgdGhlIGNoYXB0ZXIgbGlzdCB3aGVuIHRoZSBkYXRhIGlzIGxvYWRlZFxuICogQHBhcmFtIHtUaW1lbGluZX0gdGltZWxpbmVcbiAqL1xuZnVuY3Rpb24gdXBkYXRlICh0aW1lbGluZSkge1xuICB2YXIgYWN0aXZlQ2hhcHRlciA9IHRoaXMuZ2V0QWN0aXZlQ2hhcHRlcigpXG4gICAgLCBjdXJyZW50VGltZSA9IHRpbWVsaW5lLmdldFRpbWUoKTtcblxuICBjb25zb2xlLmRlYnVnKCdDaGFwdGVycycsICd1cGRhdGUnLCB0aGlzLCBhY3RpdmVDaGFwdGVyLCBjdXJyZW50VGltZSk7XG4gIGlmIChpc0FjdGl2ZUNoYXB0ZXIoYWN0aXZlQ2hhcHRlciwgY3VycmVudFRpbWUpKSB7XG4gICAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ3VwZGF0ZScsICdhbHJlYWR5IHNldCcsIHRoaXMuY3VycmVudENoYXB0ZXIpO1xuICAgIHJldHVybjtcbiAgfVxuICBmdW5jdGlvbiBtYXJrQ2hhcHRlciAoY2hhcHRlciwgaSkge1xuICAgIHZhciBpc0FjdGl2ZSA9IGlzQWN0aXZlQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50VGltZSk7XG4gICAgaWYgKGlzQWN0aXZlKSB7XG4gICAgICB0aGlzLnNldEN1cnJlbnRDaGFwdGVyKGkpO1xuICAgIH1cbiAgfVxuICB0aGlzLmNoYXB0ZXJzLmZvckVhY2gobWFya0NoYXB0ZXIsIHRoaXMpO1xufVxuXG4vKipcbiAqIGNoYXB0ZXIgaGFuZGxpbmdcbiAqIEBwYXJhbXMge1RpbWVsaW5lfSBwYXJhbXNcbiAqIEByZXR1cm4ge0NoYXB0ZXJzfSBjaGFwdGVyIG1vZHVsZVxuICovXG5mdW5jdGlvbiBDaGFwdGVycyAodGltZWxpbmUsIHBhcmFtcykge1xuXG4gIGlmICghdGltZWxpbmUgfHwgIXRpbWVsaW5lLmhhc0NoYXB0ZXJzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHRpbWVsaW5lLmR1cmF0aW9uID09PSAwKSB7XG4gICAgY29uc29sZS53YXJuKCdDaGFwdGVycycsICdjb25zdHJ1Y3RvcicsICdaZXJvIGxlbmd0aCBtZWRpYT8nLCB0aW1lbGluZSk7XG4gIH1cblxuICB0aGlzLnRpbWVsaW5lID0gdGltZWxpbmU7XG4gIHRoaXMuZHVyYXRpb24gPSB0aW1lbGluZS5kdXJhdGlvbjtcbiAgdGhpcy5jaGFwdGVybGlua3MgPSAhIXRpbWVsaW5lLmNoYXB0ZXJsaW5rcztcbiAgdGhpcy5jdXJyZW50Q2hhcHRlciA9IDA7XG4gIHRoaXMuY2hhcHRlcnMgPSB0aGlzLnBhcnNlU2ltcGxlQ2hhcHRlcihwYXJhbXMpO1xuICB0aGlzLmRhdGEgPSB0aGlzLmNoYXB0ZXJzO1xuXG4gIHRoaXMudGFiID0gbmV3IFRhYih7XG4gICAgaWNvbjogJ3B3cC1jaGFwdGVycycsXG4gICAgdGl0bGU6ICdLYXBpdGVsIGFuemVpZ2VuIC8gdmVyYmVyZ2VuJyxcbiAgICBoZWFkbGluZTogJ0thcGl0ZWwnLFxuICAgIG5hbWU6ICdwb2Rsb3Zld2VicGxheWVyX2NoYXB0ZXJib3gnXG4gIH0pO1xuXG4gIHRoaXMudGFiXG4gICAgLmNyZWF0ZU1haW5Db250ZW50KCcnKVxuICAgIC5hcHBlbmQodGhpcy5nZW5lcmF0ZVRhYmxlKCkpO1xuXG4gIHRoaXMudXBkYXRlID0gdXBkYXRlLmJpbmQodGhpcyk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBsaXN0IG9mIGNoYXB0ZXJzLCB0aGlzIGZ1bmN0aW9uIGNyZWF0ZXMgdGhlIGNoYXB0ZXIgdGFibGUgZm9yIHRoZSBwbGF5ZXIuXG4gKiBAcmV0dXJucyB7alF1ZXJ5fEhUTUxEaXZFbGVtZW50fVxuICovXG5DaGFwdGVycy5wcm90b3R5cGUuZ2VuZXJhdGVUYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRhYmxlLCB0Ym9keSwgbWF4Y2hhcHRlcnN0YXJ0LCBmb3JjZUhvdXJzO1xuXG4gIHRhYmxlID0gcmVuZGVyQ2hhcHRlclRhYmxlKCk7XG4gIHRib2R5ID0gdGFibGUuY2hpbGRyZW4oJ3Rib2R5Jyk7XG5cbiAgbWF4Y2hhcHRlcnN0YXJ0ID0gZ2V0TWF4Q2hhcHRlclN0YXJ0KHRoaXMuY2hhcHRlcnMpO1xuICBmb3JjZUhvdXJzID0gKG1heGNoYXB0ZXJzdGFydCA+PSAzNjAwKTtcblxuICBmdW5jdGlvbiBidWlsZENoYXB0ZXIoY2hhcHRlciwgaW5kZXgpIHtcbiAgICB2YXIgZHVyYXRpb24gPSBNYXRoLnJvdW5kKGNoYXB0ZXIuZW5kIC0gY2hhcHRlci5zdGFydCk7XG5cbiAgICAvL21ha2Ugc3VyZSB0aGUgZHVyYXRpb24gZm9yIGFsbCBjaGFwdGVycyBhcmUgZXF1YWxseSBmb3JtYXR0ZWRcbiAgICBjaGFwdGVyLmR1cmF0aW9uID0gdGMuZ2VuZXJhdGUoW2R1cmF0aW9uXSwgZmFsc2UpO1xuXG4gICAgLy9pZiB0aGVyZSBpcyBhIGNoYXB0ZXIgdGhhdCBzdGFydHMgYWZ0ZXIgYW4gaG91ciwgZm9yY2UgJzAwOicgb24gYWxsIHByZXZpb3VzIGNoYXB0ZXJzXG4gICAgY2hhcHRlci5zdGFydFRpbWUgPSB0Yy5nZW5lcmF0ZShbTWF0aC5yb3VuZChjaGFwdGVyLnN0YXJ0KV0sIHRydWUsIGZvcmNlSG91cnMpO1xuXG4gICAgLy9pbnNlcnQgdGhlIGNoYXB0ZXIgZGF0YVxuICAgIHZhciByb3cgPSByZW5kZXJSb3coY2hhcHRlciwgaW5kZXgpO1xuICAgIHJvdy5vbignY2xpY2snLCB7bW9kdWxlOiB0aGlzLCBpbmRleDogaW5kZXh9LCByb3dDbGlja0hhbmRsZXIpO1xuICAgIHJvdy5hcHBlbmRUbyh0Ym9keSk7XG4gICAgY2hhcHRlci5lbGVtZW50ID0gcm93O1xuICB9XG5cbiAgdGhpcy5jaGFwdGVycy5mb3JFYWNoKGJ1aWxkQ2hhcHRlciwgdGhpcyk7XG4gIHJldHVybiB0YWJsZTtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5nZXRBY3RpdmVDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYWN0aXZlID0gdGhpcy5jaGFwdGVyc1t0aGlzLmN1cnJlbnRDaGFwdGVyXTtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ2dldEFjdGl2ZUNoYXB0ZXInLCBhY3RpdmUpO1xuICByZXR1cm4gYWN0aXZlO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGNoYXB0ZXJJbmRleFxuICovXG5DaGFwdGVycy5wcm90b3R5cGUuc2V0Q3VycmVudENoYXB0ZXIgPSBmdW5jdGlvbiAoY2hhcHRlckluZGV4KSB7XG4gIGlmIChjaGFwdGVySW5kZXggPCB0aGlzLmNoYXB0ZXJzLmxlbmd0aCAmJiBjaGFwdGVySW5kZXggPj0gMCkge1xuICAgIHRoaXMuY3VycmVudENoYXB0ZXIgPSBjaGFwdGVySW5kZXg7XG4gIH1cbiAgdGhpcy5tYXJrQWN0aXZlQ2hhcHRlcigpO1xuICBjb25zb2xlLmxvZygnQ2hhcHRlcnMnLCAnc2V0Q3VycmVudENoYXB0ZXInLCAndG8nLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5tYXJrQWN0aXZlQ2hhcHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFjdGl2ZUNoYXB0ZXIgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKTtcbiAgJC5lYWNoKHRoaXMuY2hhcHRlcnMsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICB9KTtcbiAgYWN0aXZlQ2hhcHRlci5lbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3VycmVudCA9IHRoaXMuY3VycmVudENoYXB0ZXIsXG4gICAgbmV4dCA9IHRoaXMuc2V0Q3VycmVudENoYXB0ZXIoY3VycmVudCArIDEpO1xuICBpZiAoY3VycmVudCA9PT0gbmV4dCkge1xuICAgIGNvbnNvbGUubG9nKCdDaGFwdGVycycsICduZXh0JywgJ2FscmVhZHkgaW4gbGFzdCBjaGFwdGVyJyk7XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH1cbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJ25leHQnLCAnY2hhcHRlcicsIHRoaXMuY3VycmVudENoYXB0ZXIpO1xuICB0aGlzLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICByZXR1cm4gbmV4dDtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRDaGFwdGVyLFxuICAgIHByZXZpb3VzID0gdGhpcy5zZXRDdXJyZW50Q2hhcHRlcihjdXJyZW50IC0gMSk7XG4gIGlmIChjdXJyZW50ID09PSBwcmV2aW91cykge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NoYXB0ZXJzJywgJ3ByZXZpb3VzJywgJ2FscmVhZHkgaW4gZmlyc3QgY2hhcHRlcicpO1xuICAgIHRoaXMucGxheUN1cnJlbnRDaGFwdGVyKCk7XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH1cbiAgY29uc29sZS5kZWJ1ZygnQ2hhcHRlcnMnLCAncHJldmlvdXMnLCAnY2hhcHRlcicsIHRoaXMuY3VycmVudENoYXB0ZXIpO1xuICB0aGlzLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICByZXR1cm4gcHJldmlvdXM7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUucGxheUN1cnJlbnRDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhcnQgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKS5zdGFydDtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJyNwbGF5Q3VycmVudENoYXB0ZXInLCAnc3RhcnQnLCBzdGFydCk7XG4gIHZhciB0aW1lID0gdGhpcy50aW1lbGluZS5zZXRUaW1lKHN0YXJ0KTtcbiAgY29uc29sZS5sb2coJ0NoYXB0ZXJzJywgJyNwbGF5Q3VycmVudENoYXB0ZXInLCAnY3VycmVudFRpbWUnLCB0aW1lKTtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5wYXJzZVNpbXBsZUNoYXB0ZXIgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHZhciBjaGFwdGVycyA9IHBhcmFtcy5jaGFwdGVycztcbiAgaWYgKCFjaGFwdGVycykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiBjaGFwdGVyc1xuICAgIC5tYXAodHJhbnNmb3JtQ2hhcHRlcilcbiAgICAubWFwKGFkZEVuZFRpbWUodGhpcy5kdXJhdGlvbikpXG4gICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgLy8gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQ6IGh0dHA6Ly9wb2Rsb3ZlLm9yZy9zaW1wbGUtY2hhcHRlcnMvXG4gICAgICByZXR1cm4gYS5zdGFydCAtIGIuc3RhcnQ7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXB0ZXJzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2hhcHRlci5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBUYWIgPSByZXF1aXJlKCcuLi90YWInKTtcblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIGZpbGVzaXplIGludG8gS0IgYW5kIE1CXG4gKiBAcGFyYW0gc2l6ZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0U2l6ZShzaXplKSB7XG4gIHZhciBvbmVNYiA9IDEwNDg1NzY7XG4gIHZhciBmaWxlU2l6ZSA9IHBhcnNlSW50KHNpemUsIDEwKTtcbiAgdmFyIGtCRmlsZVNpemUgPSBNYXRoLnJvdW5kKGZpbGVTaXplIC8gMTAyNCk7XG4gIHZhciBtQkZpbGVTSXplID0gTWF0aC5yb3VuZChmaWxlU2l6ZSAvIDEwMjQgLyAxMDI0KTtcbiAgaWYgKCFzaXplKSB7XG4gICAgcmV0dXJuICcgLS0gJztcbiAgfVxuICAvLyBpbiBjYXNlLCB0aGUgZmlsZXNpemUgaXMgc21hbGxlciB0aGFuIDFNQixcbiAgLy8gdGhlIGZvcm1hdCB3aWxsIGJlIHJlbmRlcmVkIGluIEtCXG4gIC8vIG90aGVyd2lzZSBpbiBNQlxuICByZXR1cm4gKGZpbGVTaXplIDwgb25lTWIpID8ga0JGaWxlU2l6ZSArICcgS0InIDogbUJGaWxlU0l6ZSArICcgTUInO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gbGlzdEVsZW1lbnRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU9wdGlvbihhc3NldCkge1xuICBjb25zb2xlLmxvZyhhc3NldCk7XG4gIHJldHVybiAnPG9wdGlvbiB2YWx1ZT1cIicgKyBhc3NldC5kb3dubG9hZFVybCArICdcIj4nICtcbiAgICAgIGFzc2V0LmFzc2V0VGl0bGUgKyAnICYjODIyNjsgJyArIGZvcm1hdFNpemUoYXNzZXQuc2l6ZSkgK1xuICAgICc8L29wdGlvbj4nO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gZWxlbWVudFxuICogQHJldHVybnMge3thc3NldFRpdGxlOiBTdHJpbmcsIGRvd25sb2FkVXJsOiBTdHJpbmcsIHVybDogU3RyaW5nLCBzaXplOiBOdW1iZXJ9fVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVEb3dubG9hZCAoZWxlbWVudCkge1xuICByZXR1cm4ge1xuICAgIGFzc2V0VGl0bGU6IGVsZW1lbnQubmFtZSxcbiAgICBkb3dubG9hZFVybDogZWxlbWVudC5kbHVybCxcbiAgICB1cmw6IGVsZW1lbnQudXJsLFxuICAgIHNpemU6IGVsZW1lbnQuc2l6ZVxuICB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gZWxlbWVudFxuICogQHJldHVybnMge3thc3NldFRpdGxlOiBTdHJpbmcsIGRvd25sb2FkVXJsOiBTdHJpbmcsIHVybDogU3RyaW5nLCBzaXplOiBOdW1iZXJ9fVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVTb3VyY2UoZWxlbWVudCkge1xuICB2YXIgc291cmNlID0gKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykgPyBlbGVtZW50IDogZWxlbWVudC5zcmM7XG4gIHZhciBwYXJ0cyA9IHNvdXJjZS5zcGxpdCgnLicpO1xuICByZXR1cm4ge1xuICAgIGFzc2V0VGl0bGU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLFxuICAgIGRvd25sb2FkVXJsOiBzb3VyY2UsXG4gICAgdXJsOiBzb3VyY2UsXG4gICAgc2l6ZTogLTFcbiAgfTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuICogQHJldHVybnMge0FycmF5fVxuICovXG5mdW5jdGlvbiBjcmVhdGVMaXN0IChwYXJhbXMpIHtcbiAgaWYgKHBhcmFtcy5kb3dubG9hZHMgJiYgcGFyYW1zLmRvd25sb2Fkc1swXS5hc3NldFRpdGxlKSB7XG4gICAgcmV0dXJuIHBhcmFtcy5kb3dubG9hZHM7XG4gIH1cblxuICBpZiAocGFyYW1zLmRvd25sb2Fkcykge1xuICAgIHJldHVybiBwYXJhbXMuZG93bmxvYWRzLm1hcChub3JtYWxpemVEb3dubG9hZCk7XG4gIH1cbiAgLy8gYnVpbGQgZnJvbSBzb3VyY2UgZWxlbWVudHNcbiAgcmV0dXJuIHBhcmFtcy5zb3VyY2VzLm1hcChub3JtYWxpemVTb3VyY2UpO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRG93bmxvYWRzIChwYXJhbXMpIHtcbiAgdGhpcy5saXN0ID0gY3JlYXRlTGlzdChwYXJhbXMpO1xuICB0aGlzLnRhYiA9IHRoaXMuY3JlYXRlRG93bmxvYWRUYWIocGFyYW1zKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICogQHJldHVybnMge251bGx8VGFifSBkb3dubG9hZCB0YWJcbiAqL1xuRG93bmxvYWRzLnByb3RvdHlwZS5jcmVhdGVEb3dubG9hZFRhYiA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgaWYgKCghcGFyYW1zLmRvd25sb2FkcyAmJiAhcGFyYW1zLnNvdXJjZXMpIHx8IHBhcmFtcy5oaWRlZG93bmxvYWRidXR0b24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgZG93bmxvYWRUYWIgPSBuZXcgVGFiKHtcbiAgICBpY29uOiAncHdwLWRvd25sb2FkJyxcbiAgICB0aXRsZTogJ0Rvd25sb2FkcyBhbnplaWdlbiAvIHZlcmJlcmdlbicsXG4gICAgbmFtZTogJ2Rvd25sb2FkcycsXG4gICAgaGVhZGxpbmU6ICdEb3dubG9hZCdcbiAgfSk7XG5cbiAgdmFyICR0YWJDb250ZW50ID0gZG93bmxvYWRUYWIuY3JlYXRlTWFpbkNvbnRlbnQoXG4gICAgJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPicgK1xuICAgICAgJzxmb3JtIGFjdGlvbj1cIj9cIj4nICtcbiAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJzZWxlY3RcIiBuYW1lPVwic2VsZWN0LWZpbGVcIj4nICsgdGhpcy5saXN0Lm1hcChjcmVhdGVPcHRpb24pICsgJzwvc2VsZWN0PicgK1xuICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cImRvd25sb2FkIGJ1dHRvbi1zdWJtaXQgaWNvbiBwd3AtZG93bmxvYWRcIiBuYW1lPVwiZG93bmxvYWQtZmlsZVwiPicgK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImRvd25sb2FkIGxhYmVsXCI+RG93bmxvYWQ8L3NwYW4+JyArXG4gICAgICAgICc8L2J1dHRvbj4nICtcbiAgICAgICc8L2Zvcm0+JyArXG4gICAgJzwvZGl2PidcbiAgKTtcbiAgZG93bmxvYWRUYWIuYm94LmFwcGVuZCgkdGFiQ29udGVudCk7XG4gIHZhciAkYnV0dG9uID0gJHRhYkNvbnRlbnQuZmluZCgnYnV0dG9uLnB3cC1kb3dubG9hZCcpO1xuICB2YXIgJHNlbGVjdCA9ICR0YWJDb250ZW50LmZpbmQoJ3NlbGVjdC5zZWxlY3QnKTtcbiAgJGJ1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB3aW5kb3cub3Blbigkc2VsZWN0LnZhbCgpKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRvd25sb2FkVGFiO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEb3dubG9hZHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9kb3dubG9hZHMuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGFiID0gcmVxdWlyZSgnLi4vdGFiJylcbiAgLCB0aW1lQ29kZSA9IHJlcXVpcmUoJy4uL3RpbWVjb2RlJylcbiAgLCBzZXJ2aWNlcyA9IHJlcXVpcmUoJy4uL3NvY2lhbC1uZXR3b3JrcycpO1xuXG5mdW5jdGlvbiBnZXRQdWJsaWNhdGlvbkRhdGUocmF3RGF0ZSkge1xuICBpZiAoIXJhd0RhdGUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZShyYXdEYXRlKTtcbiAgcmV0dXJuICc8cD5WZXLDtmZmZW50bGljaHQgYW06ICcgKyBkYXRlLmdldERhdGUoKSArICcuJyArIGRhdGUuZ2V0TW9udGgoKSArICcuJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICc8L3A+Jztcbn1cblxuZnVuY3Rpb24gY3JlYXRlRXBpc29kZUluZm8odGFiLCBwYXJhbXMpIHtcbiAgdGFiLmNyZWF0ZU1haW5Db250ZW50KFxuICAgICc8aDI+JyArIHBhcmFtcy50aXRsZSArICc8L2gyPicgK1xuICAgICc8aDM+JyArIHBhcmFtcy5zdWJ0aXRsZSArICc8L2gzPicgK1xuICAgICc8cD4nICsgcGFyYW1zLnN1bW1hcnkgKyAnPC9wPicgK1xuICAgICc8cD5EYXVlcjogJyArIHRpbWVDb2RlLmZyb21UaW1lU3RhbXAocGFyYW1zLmR1cmF0aW9uKSArICc8L3A+JyArXG4gICAgIGdldFB1YmxpY2F0aW9uRGF0ZShwYXJhbXMucHVibGljYXRpb25EYXRlKSArXG4gICAgJzxwPicgK1xuICAgICAgJ1Blcm1hbGluazo8YnI+JyArXG4gICAgICAnPGEgaHJlZj1cIicgKyBwYXJhbXMucGVybWFsaW5rICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIHRpdGxlPVwiUGVybWFsaW5rIGbDvHIgZGllIEVwaXNvZGVcIj4nICsgcGFyYW1zLnBlcm1hbGluayArICc8L2E+JyArXG4gICAgJzwvcD4nXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBvc3RlckltYWdlKHBvc3Rlcikge1xuICBpZiAoIXBvc3Rlcikge1xuICAgIHJldHVybiAnJztcbiAgfVxuICByZXR1cm4gJzxkaXYgY2xhc3M9XCJwb3N0ZXItaW1hZ2VcIj4nICtcbiAgICAnPGltZyBzcmM9XCInICsgcG9zdGVyICsgJ1wiIGRhdGEtaW1nPVwiJyArIHBvc3RlciArICdcIiBhbHQ9XCJQb3N0ZXIgSW1hZ2VcIj4nICtcbiAgICAnPC9kaXY+Jztcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3Vic2NyaWJlQnV0dG9uKHBhcmFtcykge1xuICBpZiAoIXBhcmFtcy5zdWJzY3JpYmVCdXR0b24pIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuICc8YnV0dG9uIGNsYXNzPVwiYnV0dG9uLXN1Ym1pdFwiPicgK1xuICAgICAgJzxzcGFuIGNsYXNzPVwic2hvd3RpdGxlLWxhYmVsXCI+JyArIHBhcmFtcy5zaG93LnRpdGxlICsgJzwvc3Bhbj4nICtcbiAgICAgICc8c3BhbiBjbGFzcz1cInN1Ym1pdC1sYWJlbFwiPicgKyBwYXJhbXMuc3Vic2NyaWJlQnV0dG9uICsgJzwvc3Bhbj4nICtcbiAgICAnPC9idXR0b24+Jztcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2hvd0luZm8gKHRhYiwgcGFyYW1zKSB7XG4gIHRhYi5jcmVhdGVBc2lkZShcbiAgICAnPGgyPicgKyBwYXJhbXMuc2hvdy50aXRsZSArICc8L2gyPicgK1xuICAgICc8aDM+JyArIHBhcmFtcy5zaG93LnN1YnRpdGxlICsgJzwvaDM+JyArXG4gICAgY3JlYXRlUG9zdGVySW1hZ2UocGFyYW1zLnNob3cucG9zdGVyKSArXG4gICAgY3JlYXRlU3Vic2NyaWJlQnV0dG9uKHBhcmFtcykgK1xuICAgICc8cD5MaW5rIHp1ciBTaG93Ojxicj4nICtcbiAgICAgICc8YSBocmVmPVwiJyArIHBhcmFtcy5zaG93LnVybCArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiB0aXRsZT1cIkxpbmsgenVyIFNob3dcIj4nICsgcGFyYW1zLnNob3cudXJsICsgJzwvYT48L3A+J1xuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTb2NpYWxMaW5rKG9wdGlvbnMpIHtcbiAgdmFyIHNlcnZpY2UgPSBzZXJ2aWNlcy5nZXQob3B0aW9ucy5zZXJ2aWNlTmFtZSk7XG4gIHZhciBsaXN0SXRlbSA9ICQoJzxsaT48L2xpPicpO1xuICB2YXIgYnV0dG9uID0gc2VydmljZS5nZXRCdXR0b24ob3B0aW9ucyk7XG4gIGxpc3RJdGVtLmFwcGVuZChidXR0b24uZWxlbWVudCk7XG4gIHRoaXMuYXBwZW5kKGxpc3RJdGVtKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU29jaWFsSW5mbyhwcm9maWxlcykge1xuICBpZiAoIXByb2ZpbGVzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgcHJvZmlsZUxpc3QgPSAkKCc8dWw+PC91bD4nKTtcbiAgcHJvZmlsZXMuZm9yRWFjaChjcmVhdGVTb2NpYWxMaW5rLCBwcm9maWxlTGlzdCk7XG5cbiAgdmFyIGNvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJzb2NpYWwtbGlua3NcIj48aDM+QmxlaWIgaW4gVmVyYmluZHVuZzwvaDM+PC9kaXY+Jyk7XG4gIGNvbnRhaW5lci5hcHBlbmQocHJvZmlsZUxpc3QpO1xuICByZXR1cm4gY29udGFpbmVyO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTb2NpYWxBbmRMaWNlbnNlSW5mbyAodGFiLCBwYXJhbXMpIHtcbiAgaWYgKCFwYXJhbXMubGljZW5zZSAmJiAhcGFyYW1zLnByb2ZpbGVzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRhYi5jcmVhdGVGb290ZXIoXG4gICAgJzxwPkRpZSBTaG93IFwiJyArIHBhcmFtcy5zaG93LnRpdGxlICsgJ1wiIGlzdCBsaXplbnNpZXJ0IHVudGVyPGJyPicgK1xuICAgICAgJzxhIGhyZWY9XCInICsgcGFyYW1zLmxpY2Vuc2UudXJsICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIHRpdGxlPVwiTGl6ZW56IGFuc2VoZW5cIj4nICsgcGFyYW1zLmxpY2Vuc2UubmFtZSArICc8L2E+JyArXG4gICAgJzwvcD4nXG4gICkucHJlcGVuZChjcmVhdGVTb2NpYWxJbmZvKHBhcmFtcy5wcm9maWxlcykpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSBpbmZvIHRhYiBpZiBwYXJhbXMuc3VtbWFyeSBpcyBkZWZpbmVkXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlciBvYmplY3RcbiAqIEByZXR1cm5zIHtudWxsfFRhYn0gaW5mbyB0YWIgaW5zdGFuY2Ugb3IgbnVsbFxuICovXG5mdW5jdGlvbiBjcmVhdGVJbmZvVGFiKHBhcmFtcykge1xuICBpZiAoIXBhcmFtcy5zdW1tYXJ5KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGluZm9UYWIgPSBuZXcgVGFiKHtcbiAgICBpY29uOiAncHdwLWluZm8nLFxuICAgIHRpdGxlOiAnSW5mb3MgYW56ZWlnZW4gLyB2ZXJiZXJnZW4nLFxuICAgIGhlYWRsaW5lOiAnSW5mbycsXG4gICAgbmFtZTogJ2luZm8nXG4gIH0pO1xuXG4gIGNyZWF0ZUVwaXNvZGVJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG4gIGNyZWF0ZVNob3dJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG4gIGNyZWF0ZVNvY2lhbEFuZExpY2Vuc2VJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG5cbiAgcmV0dXJuIGluZm9UYWI7XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gbW9kdWxlIHRvIGRpc3BsYXkgcG9kY2FzdCBhbmQgZXBpc29kZSBpbmZvXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlciBvYmplY3RcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBJbmZvKHBhcmFtcykge1xuICB0aGlzLnRhYiA9IGNyZWF0ZUluZm9UYWIocGFyYW1zKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmZvO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvaW5mby5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciB0YyA9IHJlcXVpcmUoJy4uL3RpbWVjb2RlJyk7XG52YXIgY2FwID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNhcDtcblxuZnVuY3Rpb24gcmVuZGVyVGltZUVsZW1lbnQoY2xhc3NOYW1lLCB0aW1lKSB7XG4gIHJldHVybiAkKCc8ZGl2IGNsYXNzPVwidGltZSB0aW1lLScgKyBjbGFzc05hbWUgKyAnXCI+JyArIHRpbWUgKyAnPC9kaXY+Jyk7XG59XG5cbi8qKlxuICogUmVuZGVyIGFuIEhUTUwgRWxlbWVudCBmb3IgdGhlIGN1cnJlbnQgY2hhcHRlclxuICogQHJldHVybnMge2pRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVuZGVyQ3VycmVudENoYXB0ZXJFbGVtZW50KCkge1xuICB2YXIgY2hhcHRlckVsZW1lbnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2hhcHRlclwiPjwvZGl2PicpO1xuXG4gIGlmICghdGhpcy5jaGFwdGVyTW9kdWxlKSB7XG4gICAgcmV0dXJuIGNoYXB0ZXJFbGVtZW50O1xuICB9XG5cbiAgdmFyIGluZGV4ID0gdGhpcy5jaGFwdGVyTW9kdWxlLmN1cnJlbnRDaGFwdGVyO1xuICB2YXIgY2hhcHRlciA9IHRoaXMuY2hhcHRlck1vZHVsZS5jaGFwdGVyc1tpbmRleF07XG4gIGNvbnNvbGUuZGVidWcoJ1Byb2dyZXNzYmFyJywgJ3JlbmRlckN1cnJlbnRDaGFwdGVyRWxlbWVudCcsIGluZGV4LCBjaGFwdGVyKTtcblxuICB0aGlzLmNoYXB0ZXJCYWRnZSA9ICQoJzxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4nICsgKGluZGV4ICsgMSkgKyAnPC9zcGFuPicpO1xuICB0aGlzLmNoYXB0ZXJUaXRsZSA9ICQoJzxzcGFuIGNsYXNzPVwiY2hhcHRlci10aXRsZVwiPicgKyBjaGFwdGVyLnRpdGxlICsgJzwvc3Bhbj4nKTtcblxuICBjaGFwdGVyRWxlbWVudFxuICAgIC5hcHBlbmQodGhpcy5jaGFwdGVyQmFkZ2UpXG4gICAgLmFwcGVuZCh0aGlzLmNoYXB0ZXJUaXRsZSk7XG5cbiAgcmV0dXJuIGNoYXB0ZXJFbGVtZW50O1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9ncmVzc0luZm8ocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIHByb2dyZXNzSW5mbyA9ICQoJzxkaXYgY2xhc3M9XCJwcm9ncmVzcy1pbmZvXCI+PC9kaXY+Jyk7XG5cbiAgcmV0dXJuIHByb2dyZXNzSW5mb1xuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIuY3VycmVudFRpbWUpXG4gICAgLmFwcGVuZChyZW5kZXJDdXJyZW50Q2hhcHRlckVsZW1lbnQuY2FsbChwcm9ncmVzc0JhcikpXG4gICAgLmFwcGVuZChwcm9ncmVzc0Jhci5kdXJhdGlvblRpbWVFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVGltZXMocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIHRpbWUgPSBwcm9ncmVzc0Jhci50aW1lbGluZS5nZXRUaW1lKCk7XG4gIHByb2dyZXNzQmFyLmN1cnJlbnRUaW1lLmh0bWwodGMuZnJvbVRpbWVTdGFtcCh0aW1lKSk7XG5cbiAgaWYgKHByb2dyZXNzQmFyLnNob3dEdXJhdGlvbikgeyByZXR1cm47IH1cblxuICB2YXIgcmVtYWluaW5nVGltZSA9IE1hdGguYWJzKHRpbWUgLSBwcm9ncmVzc0Jhci5kdXJhdGlvbik7XG4gIHByb2dyZXNzQmFyLmR1cmF0aW9uVGltZUVsZW1lbnQudGV4dCgnLScgKyB0Yy5mcm9tVGltZVN0YW1wKHJlbWFpbmluZ1RpbWUpKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRHVyYXRpb25UaW1lRWxlbWVudChwcm9ncmVzc0Jhcikge1xuICB2YXIgZm9ybWF0dGVkRHVyYXRpb24gPSB0Yy5mcm9tVGltZVN0YW1wKHByb2dyZXNzQmFyLmR1cmF0aW9uKTtcbiAgdmFyIGR1cmF0aW9uVGltZUVsZW1lbnQgPSByZW5kZXJUaW1lRWxlbWVudCgnZHVyYXRpb24nLCAwKTtcblxuICBkdXJhdGlvblRpbWVFbGVtZW50Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBwcm9ncmVzc0Jhci5zaG93RHVyYXRpb24gPSAhcHJvZ3Jlc3NCYXIuc2hvd0R1cmF0aW9uO1xuICAgIGlmIChwcm9ncmVzc0Jhci5zaG93RHVyYXRpb24pIHtcbiAgICAgIGR1cmF0aW9uVGltZUVsZW1lbnQudGV4dChmb3JtYXR0ZWREdXJhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHVwZGF0ZVRpbWVzKHByb2dyZXNzQmFyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGR1cmF0aW9uVGltZUVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlckF0KHRpbWUpIHtcbiAgdmFyIHBlcmNlbnQgPSAxMDAgKiB0aW1lIC8gdGhpcy5kdXJhdGlvbjtcbiAgcmV0dXJuICQoJzxkaXYgY2xhc3M9XCJtYXJrZXJcIiBzdHlsZT1cImxlZnQ6JyArIHBlcmNlbnQgKyAnJTtcIj48L2Rpdj4nKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2hhcHRlck1hcmtlcihjaGFwdGVyKSB7XG4gIHJldHVybiByZW5kZXJNYXJrZXJBdC5jYWxsKHRoaXMsIGNoYXB0ZXIuc3RhcnQpO1xufVxuXG4vKipcbiAqIFRoaXMgdXBkYXRlIG1ldGhvZCBpcyB0byBiZSBjYWxsZWQgd2hlbiBhIHBsYXllcnMgYGN1cnJlbnRUaW1lYCBjaGFuZ2VzLlxuICovXG5mdW5jdGlvbiB1cGRhdGUgKHRpbWVsaW5lKSB7XG4gIHRoaXMuc2V0UHJvZ3Jlc3ModGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgdGhpcy5idWZmZXIudmFsKHRpbWVsaW5lLmdldEJ1ZmZlcmVkKCkpO1xuICB0aGlzLnNldENoYXB0ZXIoKTtcbn1cblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIENyZWF0ZXMgYSBuZXcgcHJvZ3Jlc3MgYmFyIG9iamVjdC5cbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lIC0gVGhlIHBsYXllcnMgdGltZWxpbmUgdG8gYXR0YWNoIHRvLlxuICovXG5mdW5jdGlvbiBQcm9ncmVzc0Jhcih0aW1lbGluZSkge1xuICBpZiAoIXRpbWVsaW5lKSB7XG4gICAgY29uc29sZS5lcnJvcignVGltZWxpbmUgbWlzc2luZycsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5kdXJhdGlvbiA9IHRpbWVsaW5lLmR1cmF0aW9uO1xuXG4gIHRoaXMuYmFyID0gbnVsbDtcbiAgdGhpcy5jdXJyZW50VGltZSA9IG51bGw7XG5cbiAgaWYgKHRpbWVsaW5lLmhhc0NoYXB0ZXJzKSB7XG4gICAgLy8gRklYTUUgZ2V0IGFjY2VzcyB0byBjaGFwdGVyTW9kdWxlIHJlbGlhYmx5XG4gICAgLy8gdGhpcy50aW1lbGluZS5nZXRNb2R1bGUoJ2NoYXB0ZXJzJylcbiAgICB0aGlzLmNoYXB0ZXJNb2R1bGUgPSB0aGlzLnRpbWVsaW5lLm1vZHVsZXNbMF07XG4gICAgdGhpcy5jaGFwdGVyQmFkZ2UgPSBudWxsO1xuICAgIHRoaXMuY2hhcHRlclRpdGxlID0gbnVsbDtcbiAgfVxuXG4gIHRoaXMuc2hvd0R1cmF0aW9uID0gZmFsc2U7XG4gIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xuICB0aGlzLmJ1ZmZlciA9IG51bGw7XG4gIHRoaXMudXBkYXRlID0gdXBkYXRlLmJpbmQodGhpcyk7XG59XG5cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRIYW5kbGVQb3NpdGlvbiA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIHZhciBwZXJjZW50ID0gdGltZSAvIHRoaXMuZHVyYXRpb24gKiAxMDA7XG4gIHZhciBuZXdMZWZ0T2Zmc2V0ID0gcGVyY2VudCArICclJztcbiAgY29uc29sZS5kZWJ1ZygnUHJvZ3Jlc3NCYXInLCAnc2V0SGFuZGxlUG9zaXRpb24nLCAndGltZScsIHRpbWUsICduZXdMZWZ0T2Zmc2V0JywgbmV3TGVmdE9mZnNldCk7XG4gIHRoaXMuaGFuZGxlLmNzcygnbGVmdCcsIG5ld0xlZnRPZmZzZXQpO1xufTtcblxuLyoqXG4gKiBzZXQgcHJvZ3Jlc3MgYmFyIHZhbHVlLCBzbGlkZXIgcG9zaXRpb24gYW5kIGN1cnJlbnQgdGltZVxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWVcbiAqL1xuUHJvZ3Jlc3NCYXIucHJvdG90eXBlLnNldFByb2dyZXNzID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgdGhpcy5wcm9ncmVzcy52YWwodGltZSk7XG4gIHRoaXMuc2V0SGFuZGxlUG9zaXRpb24odGltZSk7XG4gIHVwZGF0ZVRpbWVzKHRoaXMpO1xufTtcblxuLyoqXG4gKiBzZXQgY2hhcHRlciB0aXRsZSBhbmQgYmFkZ2VcbiAqL1xuUHJvZ3Jlc3NCYXIucHJvdG90eXBlLnNldENoYXB0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jaGFwdGVyTW9kdWxlKSB7IHJldHVybjsgfVxuXG4gIHZhciBpbmRleCA9IHRoaXMuY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlcjtcbiAgdmFyIGNoYXB0ZXIgPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY2hhcHRlcnNbaW5kZXhdO1xuICB0aGlzLmNoYXB0ZXJCYWRnZS50ZXh0KGluZGV4ICsgMSk7XG4gIHRoaXMuY2hhcHRlclRpdGxlLnRleHQoY2hhcHRlci50aXRsZSk7XG59O1xuXG4vKipcbiAqIFJlbmRlcnMgYSBuZXcgcHJvZ3Jlc3MgYmFyIGpRdWVyeSBvYmplY3QuXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gdGltZSBlbGVtZW50c1xuICB2YXIgaW5pdGlhbFRpbWUgPSB0Yy5mcm9tVGltZVN0YW1wKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgdGhpcy5jdXJyZW50VGltZSA9IHJlbmRlclRpbWVFbGVtZW50KCdjdXJyZW50JywgaW5pdGlhbFRpbWUpO1xuICB0aGlzLmR1cmF0aW9uVGltZUVsZW1lbnQgPSByZW5kZXJEdXJhdGlvblRpbWVFbGVtZW50KHRoaXMpO1xuXG4gIC8vIHByb2dyZXNzIGluZm9cbiAgdmFyIHByb2dyZXNzSW5mbyA9IHJlbmRlclByb2dyZXNzSW5mbyh0aGlzKTtcbiAgdXBkYXRlVGltZXModGhpcyk7XG5cbiAgLy8gdGltZWxpbmUgYW5kIGJ1ZmZlciBiYXJzXG4gIHZhciBwcm9ncmVzcyA9ICQoJzxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiPjwvZGl2PicpO1xuICB2YXIgdGltZWxpbmVCYXIgPSAkKCc8cHJvZ3Jlc3MgY2xhc3M9XCJjdXJyZW50XCI+PC9wcm9ncmVzcz4nKVxuICAgICAgLmF0dHIoeyBtaW46IDAsIG1heDogdGhpcy5kdXJhdGlvbn0pO1xuICB2YXIgYnVmZmVyID0gJCgnPHByb2dyZXNzIGNsYXNzPVwiYnVmZmVyXCI+PC9wcm9ncmVzcz4nKVxuICAgICAgLmF0dHIoe21pbjogMCwgbWF4OiB0aGlzLmR1cmF0aW9ufSk7XG4gIHZhciBoYW5kbGUgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlXCI+PGRpdiBjbGFzcz1cImlubmVyLWhhbmRsZVwiPjwvZGl2PjwvZGl2PicpO1xuXG4gIHByb2dyZXNzXG4gICAgLmFwcGVuZCh0aW1lbGluZUJhcilcbiAgICAuYXBwZW5kKGJ1ZmZlcilcbiAgICAuYXBwZW5kKGhhbmRsZSk7XG5cbiAgdGhpcy5wcm9ncmVzcyA9IHRpbWVsaW5lQmFyO1xuICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgdGhpcy5oYW5kbGUgPSBoYW5kbGU7XG4gIHRoaXMuc2V0UHJvZ3Jlc3ModGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuXG4gIGlmICh0aGlzLmNoYXB0ZXJNb2R1bGUpIHtcbiAgICB2YXIgY2hhcHRlck1hcmtlcnMgPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY2hhcHRlcnMubWFwKHJlbmRlckNoYXB0ZXJNYXJrZXIsIHRoaXMpO1xuICAgIGNoYXB0ZXJNYXJrZXJzLnNoaWZ0KCk7IC8vIHJlbW92ZSBmaXJzdCBvbmVcbiAgICBwcm9ncmVzcy5hcHBlbmQoY2hhcHRlck1hcmtlcnMpO1xuICB9XG5cbiAgLy8gcHJvZ3Jlc3MgYmFyXG4gIHZhciBiYXIgPSAkKCc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NiYXJcIj48L2Rpdj4nKTtcbiAgYmFyXG4gICAgLmFwcGVuZChwcm9ncmVzc0luZm8pXG4gICAgLmFwcGVuZChwcm9ncmVzcyk7XG5cbiAgdGhpcy5iYXIgPSBiYXI7XG4gIHJldHVybiBiYXI7XG59O1xuXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUuYWRkRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtb3VzZUlzRG93biA9IGZhbHNlO1xuICB2YXIgdGltZWxpbmUgPSB0aGlzLnRpbWVsaW5lO1xuICB2YXIgcHJvZ3Jlc3MgPSB0aGlzLnByb2dyZXNzO1xuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZU5ld1RpbWUgKHBhZ2VYKSB7XG4gICAgLy8gbW91c2UgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIG9iamVjdFxuICAgIHZhciB3aWR0aCA9IHByb2dyZXNzLm91dGVyV2lkdGgodHJ1ZSk7XG4gICAgdmFyIG9mZnNldCA9IHByb2dyZXNzLm9mZnNldCgpO1xuICAgIHZhciBwb3MgPSBjYXAocGFnZVggLSBvZmZzZXQubGVmdCwgMCwgd2lkdGgpO1xuICAgIHZhciBwZXJjZW50YWdlID0gKHBvcyAvIHdpZHRoKTtcbiAgICByZXR1cm4gcGVyY2VudGFnZSAqIHRpbWVsaW5lLmR1cmF0aW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VNb3ZlIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgeCA9IGV2ZW50LnBhZ2VYO1xuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzKSB7XG4gICAgICB4ID0gZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHRpbWVsaW5lLmR1cmF0aW9uICE9PSAnbnVtYmVyJyB8fCAhbW91c2VJc0Rvd24gKSB7IHJldHVybjsgfVxuICAgIHZhciBuZXdUaW1lID0gY2FsY3VsYXRlTmV3VGltZSh4KTtcbiAgICBpZiAobmV3VGltZSA9PT0gdGltZWxpbmUuZ2V0VGltZSgpKSB7IHJldHVybjsgfVxuICAgIHRpbWVsaW5lLnNlZWsobmV3VGltZSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZVVwICgpIHtcbiAgICBtb3VzZUlzRG93biA9IGZhbHNlO1xuICAgICQoZG9jdW1lbnQpLnVuYmluZCgndG91Y2hlbmQuZHVyIG1vdXNldXAuZHVyIHRvdWNobW92ZS5kdXIgbW91c2Vtb3ZlLmR1cicpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VEb3duIChldmVudCkge1xuICAgIGlmIChldmVudC53aGljaCAhPT0gMCAmJiBldmVudC53aGljaCAhPT0gMSkgeyByZXR1cm47IH1cblxuICAgIG1vdXNlSXNEb3duID0gdHJ1ZTtcbiAgICBoYW5kbGVNb3VzZU1vdmUoZXZlbnQpO1xuICAgICQoZG9jdW1lbnQpXG4gICAgICAuYmluZCgnbW91c2Vtb3ZlLmR1ciB0b3VjaG1vdmUuZHVyJywgaGFuZGxlTW91c2VNb3ZlKVxuICAgICAgLmJpbmQoJ21vdXNldXAuZHVyIHRvdWNoZW5kLmR1cicsIGhhbmRsZU1vdXNlVXApO1xuICB9XG5cbiAgLy8gaGFuZGxlIGNsaWNrIGFuZCBkcmFnIHdpdGggbW91c2Ugb3IgdG91Y2ggaW4gcHJvZ3Jlc3NiYXIgYW5kIG9uIGhhbmRsZVxuICB0aGlzLnByb2dyZXNzLmJpbmQoJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgaGFuZGxlTW91c2VEb3duKTtcblxuICB0aGlzLmhhbmRsZS5iaW5kKCd0b3VjaHN0YXJ0IG1vdXNlZG93bicsIGhhbmRsZU1vdXNlRG93bik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2dyZXNzQmFyO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvcHJvZ3Jlc3NiYXIuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFNhdmluZyB0aGUgcGxheXRpbWVcbiAqL1xudmFyIHByZWZpeCA9ICdwb2Rsb3ZlLXdlYi1wbGF5ZXItcGxheXRpbWUtJztcblxuZnVuY3Rpb24gZ2V0SXRlbSAoKSB7XG4gIHJldHVybiArbG9jYWxTdG9yYWdlW3RoaXMua2V5XTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSXRlbSAoKSB7XG4gIHJldHVybiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLmtleSk7XG59XG5cbmZ1bmN0aW9uIGhhc0l0ZW0gKCkge1xuICByZXR1cm4gKHRoaXMua2V5KSBpbiBsb2NhbFN0b3JhZ2U7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSAoKSB7XG4gIGNvbnNvbGUuZGVidWcoJ1NhdmVUaW1lJywgJ3VwZGF0ZScsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgaWYgKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpID09PSAwKSB7XG4gICAgcmV0dXJuIHJlbW92ZUl0ZW0uY2FsbCh0aGlzKTtcbiAgfVxuICB0aGlzLnNldEl0ZW0odGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xufVxuXG5mdW5jdGlvbiBTYXZlVGltZSh0aW1lbGluZSwgcGFyYW1zKSB7XG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5rZXkgPSBwcmVmaXggKyBwYXJhbXMucGVybWFsaW5rO1xuICB0aGlzLmdldEl0ZW0gPSBnZXRJdGVtLmJpbmQodGhpcyk7XG4gIHRoaXMucmVtb3ZlSXRlbSA9IHJlbW92ZUl0ZW0uYmluZCh0aGlzKTtcbiAgdGhpcy5oYXNJdGVtID0gaGFzSXRlbS5iaW5kKHRoaXMpO1xuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xuXG4gIC8vIHNldCB0aGUgdGltZSBvbiBzdGFydFxuICBpZiAodGhpcy5oYXNJdGVtKCkpIHtcbiAgICB0aW1lbGluZS5zZXRUaW1lKHRoaXMuZ2V0SXRlbSgpKTtcbiAgfVxufVxuXG5TYXZlVGltZS5wcm90b3R5cGUuc2V0SXRlbSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBsb2NhbFN0b3JhZ2VbdGhpcy5rZXldID0gdmFsdWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVUaW1lO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvc2F2ZXRpbWUuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGFiID0gcmVxdWlyZSgnLi4vdGFiJylcbiAgLCBTb2NpYWxCdXR0b25MaXN0ID0gcmVxdWlyZSgnLi4vc29jaWFsLWJ1dHRvbi1saXN0Jyk7XG5cbnZhciBzZXJ2aWNlcyA9IFsndHdpdHRlcicsICdmYWNlYm9vaycsICdncGx1cycsICd0dW1ibHInLCAnZW1haWwnXVxuICAsIHNoYXJlT3B0aW9ucyA9IFtcbiAgICB7bmFtZTogJ1Nob3cnLCB2YWx1ZTogJ3Nob3cnfSxcbiAgICB7bmFtZTogJ0VwaXNvZGUnLCB2YWx1ZTogJ2VwaXNvZGUnLCBkZWZhdWx0OiB0cnVlfSxcbiAgICB7bmFtZTogJ0NoYXB0ZXInLCB2YWx1ZTogJ2NoYXB0ZXInLCBkaXNhYmxlZDogdHJ1ZX0sXG4gICAge25hbWU6ICdFeGFjdGx5IHRoaXMgcGFydCBoZXJlJywgdmFsdWU6ICd0aW1lZCcsIGRpc2FibGVkOiB0cnVlfVxuICBdXG4gICwgc2hhcmVEYXRhID0ge307XG5cbi8vIG1vZHVsZSBnbG9iYWxzXG52YXIgc2VsZWN0ZWRPcHRpb24sIHNoYXJlQnV0dG9ucywgbGlua0lucHV0O1xuXG5mdW5jdGlvbiBnZXRTaGFyZURhdGEodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSAnc2hvdycpIHtcbiAgICByZXR1cm4gc2hhcmVEYXRhLnNob3c7XG4gIH1cbiAgdmFyIGRhdGEgPSBzaGFyZURhdGEuZXBpc29kZTtcbiAgLy8gdG9kbyBhZGQgY2hhcHRlciBzdGFydCBhbmQgZW5kIHRpbWUgdG8gdXJsXG4gIC8vaWYgKHZhbHVlID09PSAnY2hhcHRlcicpIHtcbiAgLy99XG4gIC8vIHRvZG8gYWRkIHNlbGVjdGVkIHN0YXJ0IGFuZCBlbmQgdGltZSB0byB1cmxcbiAgLy9pZiAodmFsdWUgPT09ICd0aW1lZCcpIHtcbiAgLy99XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVVcmxzKGRhdGEpIHtcbiAgc2hhcmVCdXR0b25zLnVwZGF0ZShkYXRhKTtcbiAgbGlua0lucHV0LnVwZGF0ZShkYXRhKTtcbn1cblxuZnVuY3Rpb24gb25TaGFyZU9wdGlvbkNoYW5nZVRvIChlbGVtZW50LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IGdldFNoYXJlRGF0YSh2YWx1ZSk7XG4gIHZhciByYWRpbyA9IGVsZW1lbnQuZmluZCgnW3R5cGU9cmFkaW9dJyk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxlY3RlZE9wdGlvbi5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblxuICAgIHJhZGlvLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICBlbGVtZW50LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIHNlbGVjdGVkT3B0aW9uID0gZWxlbWVudDtcbiAgICBjb25zb2xlLmxvZygnc2hhcmluZyBvcHRpb25zIGNoYW5nZWQnLCBlbGVtZW50LCB2YWx1ZSk7XG5cbiAgICB1cGRhdGVVcmxzKGRhdGEpO1xuICB9O1xufVxuXG4vKipcbiAqIGNyZWF0ZSBzaGFyaW5nIGJ1dHRvblxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbiBzaGFyaW5nIG9wdGlvbiBkZWZpbml0aW9uXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBzaGFyZSBidXR0b24gcmVmZXJlbmNlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU9wdGlvbihvcHRpb24pIHtcbiAgaWYgKG9wdGlvbi5kaXNhYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKCdTaGFyZScsICdjcmVhdGVPcHRpb24nLCAnb21pdCBkaXNhYmxlZCBvcHRpb24nLCBvcHRpb24ubmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgZGF0YSA9IGdldFNoYXJlRGF0YShvcHRpb24udmFsdWUpO1xuXG4gIGlmICghZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCdTaGFyZScsICdjcmVhdGVPcHRpb24nLCAnb21pdCBvcHRpb24gd2l0aG91dCBkYXRhJywgb3B0aW9uLm5hbWUpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGVsZW1lbnQgPSAkKCc8dHIgY2xhc3M9XCJzaGFyZS1zZWxlY3Qtb3B0aW9uXCI+JyArXG4gICAgJzx0ZCBjbGFzcz1cInNoYXJlLWRlc2NyaXB0aW9uXCI+JyArIG9wdGlvbi5uYW1lICsgJzwvdGQ+JyArXG4gICAgJzx0ZCBjbGFzcz1cInNoYXJlLXJhZGlvXCI+PGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPVwic2hhcmUtb3B0aW9uLScgKyBvcHRpb24ubmFtZSArICdcIiBuYW1lPVwici1ncm91cFwiIHZhbHVlPVwiJyArIG9wdGlvbi50aXRsZSArICdcIj48L3RkPicgK1xuICAgICc8dGQgY2xhc3M9XCJzaGFyZS1sYWJlbFwiPjxsYWJlbCBmb3I9XCJzaGFyZS1vcHRpb24tJyArIG9wdGlvbi5uYW1lICsgJ1wiPicgKyBvcHRpb24udGl0bGUgKyAnPC9sYWJlbD48L3RkPicgK1xuICAgICc8L3RyPidcbiAgKTtcbiAgdmFyIHJhZGlvID0gZWxlbWVudC5maW5kKCdbdHlwZT1yYWRpb10nKTtcblxuICBpZiAob3B0aW9uLmRlZmF1bHQpIHtcbiAgICBzZWxlY3RlZE9wdGlvbiA9IGVsZW1lbnQ7XG4gICAgZWxlbWVudC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICByYWRpby5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgdXBkYXRlVXJscyhkYXRhKTtcbiAgfVxuICB2YXIgY2hhbmdlSGFuZGxlciA9IG9uU2hhcmVPcHRpb25DaGFuZ2VUbyhlbGVtZW50LCBvcHRpb24udmFsdWUpO1xuICBlbGVtZW50Lm9uKCdjbGljaycsIGNoYW5nZUhhbmRsZXIpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGh0bWwgdGFibGUgZWxlbWVudCB0byB3cmFwIGFsbCBzaGFyZSBidXR0b25zXG4gKiBAcmV0dXJucyB7alF1ZXJ5fEhUTUxFbGVtZW50fSBzaGFyZSBidXR0b24gd3JhcHBlciByZWZlcmVuY2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2hhcmVMaXN0KHBhcmFtcykge1xuICBzaGFyZU9wdGlvbnNbMF0udGl0bGUgPSBwYXJhbXMuc2hvdy50aXRsZTtcbiAgc2hhcmVPcHRpb25zWzFdLnRpdGxlID0gcGFyYW1zLnRpdGxlO1xuICB2YXIgdGFibGUgPSAkKCc8dGFibGUgY2xhc3M9XCJzaGFyZS1idXR0b24td3JhcHBlclwiIGRhdGEtdG9nZ2xlPVwiYnV0dG9uc1wiPjxjYXB0aW9uPlBvZGNhc3QgdGVpbGVuPC9jYXB0aW9uPjx0Ym9keT48L3Rib2R5PC90YWJsZT4nKTtcbiAgdGFibGUuYXBwZW5kKHNoYXJlT3B0aW9ucy5tYXAoY3JlYXRlT3B0aW9uKSk7XG4gIHJldHVybiB0YWJsZTtcbn1cblxuLyoqXG4gKiBjcmVhdGUgc2hhcmluZyBidXR0b25zIGluIGEgZm9ybVxuICogQHJldHVybnMge2pRdWVyeX0gZm9ybSBlbGVtZW50IHJlZmVyZW5jZVxuICovXG5mdW5jdGlvbiBjcmVhdGVTaGFyZU9wdGlvbnMocGFyYW1zKSB7XG4gIHZhciBmb3JtID0gJCgnPGZvcm0+JyArXG4gICAgJzxoMz5XYXMgbcO2Y2h0ZXN0IGR1IHRlaWxlbj88L2gzPicgK1xuICAnPC9mb3JtPicpO1xuICBmb3JtLmFwcGVuZChjcmVhdGVTaGFyZUxpc3QocGFyYW1zKSk7XG4gIHJldHVybiBmb3JtO1xufVxuXG4vKipcbiAqIGJ1aWxkIGFuZCByZXR1cm4gdGFiIGluc3RhbmNlIGZvciBzaGFyaW5nXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBsYXllciBjb25maWd1cmF0aW9uXG4gKiBAcmV0dXJucyB7bnVsbHxUYWJ9IHNoYXJpbmcgdGFiIGluc3RhbmNlIG9yIG51bGwgaWYgcGVybWFsaW5rIG1pc3Npbmcgb3Igc2hhcmluZyBkaXNhYmxlZFxuICovXG5mdW5jdGlvbiBjcmVhdGVTaGFyZVRhYihwYXJhbXMpIHtcbiAgaWYgKCFwYXJhbXMucGVybWFsaW5rIHx8IHBhcmFtcy5oaWRlc2hhcmVidXR0b24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBzaGFyZVRhYiA9IG5ldyBUYWIoe1xuICAgIGljb246ICdwd3Atc2hhcmUnLFxuICAgIHRpdGxlOiAnVGVpbGVuIGFuemVpZ2VuIC8gdmVyYmVyZ2VuJyxcbiAgICBuYW1lOiAncG9kbG92ZXdlYnBsYXllcl9zaGFyZScsXG4gICAgaGVhZGxpbmU6ICdUZWlsZW4nXG4gIH0pO1xuXG4gIHNoYXJlQnV0dG9ucyA9IG5ldyBTb2NpYWxCdXR0b25MaXN0KHNlcnZpY2VzLCBnZXRTaGFyZURhdGEoJ2VwaXNvZGUnKSk7XG4gIGxpbmtJbnB1dCA9ICQoJzxoMz5EaXJla3RlciBMaW5rPC9oMz4nICtcbiAgICAnPGlucHV0IHR5cGU9XCJ1cmxcIiBuYW1lPVwic2hhcmUtbGluay11cmxcIiByZWFkb25seT4nKTtcbiAgbGlua0lucHV0LnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnZhbChkYXRhLnJhd1VybCk7XG4gIH07XG5cbiAgc2hhcmVUYWIuY3JlYXRlTWFpbkNvbnRlbnQoJycpXG4gICAgLmFwcGVuZChjcmVhdGVTaGFyZU9wdGlvbnMocGFyYW1zKSlcbiAgICAuYXBwZW5kKCc8aDM+VGVpbGVuIHZpYSAuLi48L2gzPicpXG4gICAgLmFwcGVuZChzaGFyZUJ1dHRvbnMubGlzdCk7XG4gIHNoYXJlVGFiLmNyZWF0ZUZvb3RlcignJykuYXBwZW5kKGxpbmtJbnB1dCk7XG5cbiAgcmV0dXJuIHNoYXJlVGFiO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNoYXJlKHBhcmFtcykge1xuICBzaGFyZURhdGEuZXBpc29kZSA9IHtcbiAgICBwb3N0ZXI6IHBhcmFtcy5wb3N0ZXIsXG4gICAgdGl0bGU6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMudGl0bGUpLFxuICAgIHVybDogZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5wZXJtYWxpbmspLFxuICAgIHJhd1VybDogcGFyYW1zLnBlcm1hbGluayxcbiAgICB0ZXh0OiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnRpdGxlICsgJyAnICsgcGFyYW1zLnBlcm1hbGluaylcbiAgfTtcbiAgc2hhcmVEYXRhLmNoYXB0ZXJzID0gcGFyYW1zLmNoYXB0ZXJzO1xuXG4gIGlmIChwYXJhbXMuc2hvdy51cmwpIHtcbiAgICBzaGFyZURhdGEuc2hvdyA9IHtcbiAgICAgIHBvc3RlcjogcGFyYW1zLnNob3cucG9zdGVyLFxuICAgICAgdGl0bGU6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuc2hvdy50aXRsZSksXG4gICAgICB1cmw6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuc2hvdy51cmwpLFxuICAgICAgcmF3VXJsOiBwYXJhbXMuc2hvdy51cmwsXG4gICAgICB0ZXh0OiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnNob3cudGl0bGUgKyAnICcgKyBwYXJhbXMuc2hvdy51cmwpXG4gICAgfTtcbiAgfVxuXG4gIHNlbGVjdGVkT3B0aW9uID0gJ2VwaXNvZGUnO1xuICB0aGlzLnRhYiA9IGNyZWF0ZVNoYXJlVGFiKHBhcmFtcyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvc2hhcmUuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGFyc2VUaW1lY29kZSA9IHJlcXVpcmUoJy4vdGltZWNvZGUnKS5wYXJzZTtcblxuLyoqXG4gKiBwbGF5ZXJcbiAqL1xudmFyXG4vLyBLZWVwIGFsbCBQbGF5ZXJzIG9uIHNpdGUgLSBmb3IgaW5saW5lIHBsYXllcnNcbi8vIGVtYmVkZGVkIHBsYXllcnMgYXJlIHJlZ2lzdGVyZWQgaW4gcG9kbG92ZS13ZWJwbGF5ZXItbW9kZXJhdG9yIGluIHRoZSBlbWJlZGRpbmcgcGFnZVxuICBwbGF5ZXJzID0gW10sXG4vLyBhbGwgdXNlZCBmdW5jdGlvbnNcbiAgbWVqc29wdGlvbnMgPSB7XG4gICAgZGVmYXVsdFZpZGVvV2lkdGg6IDQ4MCxcbiAgICBkZWZhdWx0VmlkZW9IZWlnaHQ6IDI3MCxcbiAgICB2aWRlb1dpZHRoOiAtMSxcbiAgICB2aWRlb0hlaWdodDogLTEsXG4gICAgYXVkaW9XaWR0aDogLTEsXG4gICAgYXVkaW9IZWlnaHQ6IDMwLFxuICAgIHN0YXJ0Vm9sdW1lOiAwLjgsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgZW5hYmxlQXV0b3NpemU6IHRydWUsXG4gICAgZmVhdHVyZXM6IFsncGxheXBhdXNlJywgJ2N1cnJlbnQnLCAncHJvZ3Jlc3MnLCAnZHVyYXRpb24nLCAndHJhY2tzJywgJ2Z1bGxzY3JlZW4nXSxcbiAgICBhbHdheXNTaG93Q29udHJvbHM6IGZhbHNlLFxuICAgIGlQYWRVc2VOYXRpdmVDb250cm9sczogZmFsc2UsXG4gICAgaVBob25lVXNlTmF0aXZlQ29udHJvbHM6IGZhbHNlLFxuICAgIEFuZHJvaWRVc2VOYXRpdmVDb250cm9sczogZmFsc2UsXG4gICAgYWx3YXlzU2hvd0hvdXJzOiBmYWxzZSxcbiAgICBzaG93VGltZWNvZGVGcmFtZUNvdW50OiBmYWxzZSxcbiAgICBmcmFtZXNQZXJTZWNvbmQ6IDI1LFxuICAgIGVuYWJsZUtleWJvYXJkOiB0cnVlLFxuICAgIHBhdXNlT3RoZXJQbGF5ZXJzOiB0cnVlLFxuICAgIGR1cmF0aW9uOiBmYWxzZSxcbiAgICBwbHVnaW5zOiBbJ2ZsYXNoJywgJ3NpbHZlcmxpZ2h0J10sXG4gICAgcGx1Z2luUGF0aDogJy4vYmluLycsXG4gICAgZmxhc2hOYW1lOiAnZmxhc2htZWRpYWVsZW1lbnQuc3dmJyxcbiAgICBzaWx2ZXJsaWdodE5hbWU6ICdzaWx2ZXJsaWdodG1lZGlhZWxlbWVudC54YXAnXG4gIH0sXG4gIGRlZmF1bHRzID0ge1xuICAgIGNoYXB0ZXJsaW5rczogJ2FsbCcsXG4gICAgd2lkdGg6ICcxMDAlJyxcbiAgICBkdXJhdGlvbjogZmFsc2UsXG4gICAgY2hhcHRlcnNWaXNpYmxlOiBmYWxzZSxcbiAgICB0aW1lY29udHJvbHNWaXNpYmxlOiBmYWxzZSxcbiAgICBzaGFyZWJ1dHRvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICBkb3dubG9hZGJ1dHRvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICBzdW1tYXJ5VmlzaWJsZTogZmFsc2UsXG4gICAgaGlkZXRpbWVidXR0b246IGZhbHNlLFxuICAgIGhpZGVkb3dubG9hZGJ1dHRvbjogZmFsc2UsXG4gICAgaGlkZXNoYXJlYnV0dG9uOiBmYWxzZSxcbiAgICBzaGFyZXdob2xlZXBpc29kZTogZmFsc2UsXG4gICAgc291cmNlczogW11cbiAgfTtcblxuLyoqXG4gKiByZW1vdmUgJ3B4JyB1bml0LCBzZXQgd2l0ZHRoIHRvIDEwMCUgZm9yICdhdXRvJ1xuICogQHBhcmFtIHtzdHJpbmd9IHdpZHRoXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVXaWR0aCh3aWR0aCkge1xuICBpZiAod2lkdGgudG9Mb3dlckNhc2UoKSA9PT0gJ2F1dG8nKSB7XG4gICAgcmV0dXJuICcxMDAlJztcbiAgfVxuICByZXR1cm4gd2lkdGgucmVwbGFjZSgncHgnLCAnJyk7XG59XG5cbi8qKlxuICogYXVkaW8gb3IgdmlkZW8gdGFnXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwbGF5ZXJcbiAqIEByZXR1cm5zIHtzdHJpbmd9ICdhdWRpbycgfCAndmlkZW8nXG4gKi9cbmZ1bmN0aW9uIGdldFBsYXllclR5cGUgKHBsYXllcikge1xuICByZXR1cm4gcGxheWVyLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBraWxsIHBsYXkvcGF1c2UgYnV0dG9uIGZyb20gbWluaXBsYXllclxuICogQHBhcmFtIG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlUGxheVBhdXNlKG9wdGlvbnMpIHtcbiAgJC5lYWNoKG9wdGlvbnMuZmVhdHVyZXMsIGZ1bmN0aW9uIChpKSB7XG4gICAgaWYgKHRoaXMgPT09ICdwbGF5cGF1c2UnKSB7XG4gICAgICBvcHRpb25zLmZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIHBsYXllciBlcnJvciBoYW5kbGluZyBmdW5jdGlvblxuICogd2lsbCByZW1vdmUgdGhlIHRvcG1vc3QgbWVkaWFmaWxlIGZyb20gc3JjIG9yIHNvdXJjZSBsaXN0XG4gKiBwb3NzaWJsZSBmaXggZm9yIEZpcmVmb3ggQUFDIGlzc3Vlc1xuICovXG5mdW5jdGlvbiByZW1vdmVVbnBsYXlhYmxlTWVkaWEoKSB7XG4gIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gIGlmICgkdGhpcy5hdHRyKCdzcmMnKSkge1xuICAgICR0aGlzLnJlbW92ZUF0dHIoJ3NyYycpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgc291cmNlTGlzdCA9ICR0aGlzLmNoaWxkcmVuKCdzb3VyY2UnKTtcbiAgaWYgKHNvdXJjZUxpc3QubGVuZ3RoKSB7XG4gICAgc291cmNlTGlzdC5maXJzdCgpLnJlbW92ZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShwbGF5ZXIsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgdmFyIGpxUGxheWVyLFxuICAgIHBsYXllclR5cGUgPSBnZXRQbGF5ZXJUeXBlKHBsYXllciksXG4gICAgc2VjQXJyYXksXG4gICAgd3JhcHBlcjtcblxuICBqcVBsYXllciA9ICQocGxheWVyKTtcbiAgd3JhcHBlciA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXJcIj48L2Rpdj4nKTtcbiAganFQbGF5ZXIucmVwbGFjZVdpdGgod3JhcHBlcik7XG5cbiAgLy9maW5lIHR1bmluZyBwYXJhbXNcbiAgcGFyYW1zLndpZHRoID0gbm9ybWFsaXplV2lkdGgocGFyYW1zLndpZHRoKTtcbiAgaWYgKHBsYXllclR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAvLyBGSVhNRTogU2luY2UgdGhlIHBsYXllciBpcyBubyBsb25nZXIgdmlzaWJsZSBpdCBoYXMgbm8gd2lkdGhcbiAgICBpZiAocGFyYW1zLmF1ZGlvV2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFyYW1zLndpZHRoID0gcGFyYW1zLmF1ZGlvV2lkdGg7XG4gICAgfVxuICAgIG1lanNvcHRpb25zLmF1ZGlvV2lkdGggPSBwYXJhbXMud2lkdGg7XG4gICAgLy9raWxsIGZ1bGxzY3JlZW4gYnV0dG9uXG4gICAgJC5lYWNoKG1lanNvcHRpb25zLmZlYXR1cmVzLCBmdW5jdGlvbiAoaSkge1xuICAgICAgaWYgKHRoaXMgPT09ICdmdWxsc2NyZWVuJykge1xuICAgICAgICBtZWpzb3B0aW9ucy5mZWF0dXJlcy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmVtb3ZlUGxheVBhdXNlKG1lanNvcHRpb25zKTtcbiAgfVxuICBlbHNlIGlmIChwbGF5ZXJUeXBlID09PSAndmlkZW8nKSB7XG4gICAgLy92aWRlbyBwYXJhbXNcbiAgICBpZiAoZmFsc2UgJiYgcGFyYW1zLmhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtZWpzb3B0aW9ucy52aWRlb1dpZHRoID0gcGFyYW1zLndpZHRoO1xuICAgICAgbWVqc29wdGlvbnMudmlkZW9IZWlnaHQgPSBwYXJhbXMuaGVpZ2h0O1xuICAgIH1cbiAgICAvLyBGSVhNRVxuICAgIGlmIChmYWxzZSAmJiAkKHBsYXllcikuYXR0cignd2lkdGgnKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbXMud2lkdGggPSAkKHBsYXllcikuYXR0cignd2lkdGgnKTtcbiAgICB9XG4gIH1cblxuICAvL2R1cmF0aW9uIGNhbiBiZSBnaXZlbiBpbiBzZWNvbmRzIG9yIGluIE5QVCBmb3JtYXRcbiAgaWYgKHBhcmFtcy5kdXJhdGlvbiAmJiBwYXJhbXMuZHVyYXRpb24gIT09IHBhcnNlSW50KHBhcmFtcy5kdXJhdGlvbiwgMTApKSB7XG4gICAgc2VjQXJyYXkgPSBwYXJzZVRpbWVjb2RlKHBhcmFtcy5kdXJhdGlvbik7XG4gICAgcGFyYW1zLmR1cmF0aW9uID0gc2VjQXJyYXlbMF07XG4gIH1cblxuICAvL092ZXJ3cml0ZSBNRUpTIGRlZmF1bHQgdmFsdWVzIHdpdGggYWN0dWFsIGRhdGFcbiAgJC5lYWNoKG1lanNvcHRpb25zLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKGtleSBpbiBwYXJhbXMpIHtcbiAgICAgIG1lanNvcHRpb25zW2tleV0gPSBwYXJhbXNba2V5XTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vd3JhcHBlciBhbmQgaW5pdCBzdHVmZlxuICAvLyBGSVhNRTogYmV0dGVyIGNoZWNrIGZvciBudW1lcmljYWwgdmFsdWVcbiAgaWYgKHBhcmFtcy53aWR0aC50b1N0cmluZygpLnRyaW0oKSA9PT0gcGFyc2VJbnQocGFyYW1zLndpZHRoLCAxMCkudG9TdHJpbmcoKSkge1xuICAgIHBhcmFtcy53aWR0aCA9IHBhcnNlSW50KHBhcmFtcy53aWR0aCwgMTApICsgJ3B4JztcbiAgfVxuXG4gIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuXG4gIC8vYWRkIHBhcmFtcyBmcm9tIGF1ZGlvIGFuZCB2aWRlbyBlbGVtZW50c1xuICBqcVBsYXllci5maW5kKCdzb3VyY2UnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXBhcmFtcy5zb3VyY2VzKSB7XG4gICAgICBwYXJhbXMuc291cmNlcyA9IFtdO1xuICAgIH1cbiAgICBwYXJhbXMuc291cmNlcy5wdXNoKCQodGhpcykuYXR0cignc3JjJykpO1xuICB9KTtcblxuICBwYXJhbXMudHlwZSA9IHBsYXllclR5cGU7XG4gIC8vIGluaXQgTUVKUyB0byBwbGF5ZXJcbiAgbWVqc29wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uIChwbGF5ZXJFbGVtZW50KSB7XG4gICAganFQbGF5ZXIub24oJ2Vycm9yJywgcmVtb3ZlVW5wbGF5YWJsZU1lZGlhKTsgICAvLyBUaGlzIG1pZ2h0IGJlIGEgZml4IHRvIHNvbWUgRmlyZWZveCBBQUMgaXNzdWVzLlxuICAgIGNhbGxiYWNrKHBsYXllckVsZW1lbnQsIHBhcmFtcywgd3JhcHBlcik7XG4gIH07XG4gIHZhciBtZSA9IG5ldyBNZWRpYUVsZW1lbnQocGxheWVyLCBtZWpzb3B0aW9ucyk7XG4gIGNvbnNvbGUubG9nKCdNZWRpYUVsZW1lbnQnLCBtZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGNyZWF0ZSxcbiAgZGVmYXVsdHM6IGRlZmF1bHRzLFxuICBwbGF5ZXJzOiBwbGF5ZXJzXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3BsYXllci5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIHNvY2lhbE5ldHdvcmtzID0gcmVxdWlyZSgnLi9zb2NpYWwtbmV0d29ya3MnKTtcblxuZnVuY3Rpb24gY3JlYXRlQnV0dG9uV2l0aChvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoc2VydmljZU5hbWUpIHtcbiAgICB2YXIgc2VydmljZSA9IHNvY2lhbE5ldHdvcmtzLmdldChzZXJ2aWNlTmFtZSk7XG4gICAgcmV0dXJuIHNlcnZpY2UuZ2V0QnV0dG9uKG9wdGlvbnMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBTb2NpYWxCdXR0b25MaXN0IChzZXJ2aWNlcywgb3B0aW9ucykge1xuICB2YXIgY3JlYXRlQnV0dG9uID0gY3JlYXRlQnV0dG9uV2l0aChvcHRpb25zKTtcbiAgdGhpcy5idXR0b25zID0gc2VydmljZXMubWFwKGNyZWF0ZUJ1dHRvbik7XG5cbiAgdGhpcy5saXN0ID0gJCgnPHVsIGNsYXNzPVwic29jaWFsLW5ldHdvcmstYnV0dG9uc1wiPjwvdWw+Jyk7XG4gIHRoaXMuYnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICB2YXIgbGlzdEVsZW1lbnQgPSAkKCc8bGk+PC9saT4nKS5hcHBlbmQoYnV0dG9uLmVsZW1lbnQpO1xuICAgIHRoaXMubGlzdC5hcHBlbmQobGlzdEVsZW1lbnQpO1xuICB9LCB0aGlzKTtcbn1cblxuU29jaWFsQnV0dG9uTGlzdC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdGhpcy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgIGJ1dHRvbi51cGRhdGVVcmwob3B0aW9ucyk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb2NpYWxCdXR0b25MaXN0O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NvY2lhbC1idXR0b24tbGlzdC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gY3JlYXRlQnV0dG9uIChvcHRpb25zKSB7XG4gIHJldHVybiAkKCc8YSBjbGFzcz1cInB3cC1jb250cmFzdC0nICsgb3B0aW9ucy5pY29uICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCInICsgb3B0aW9ucy51cmwgKyAnXCIgJyArXG4gICd0aXRsZT1cIicgKyBvcHRpb25zLnRpdGxlICsgJ1wiPjxpIGNsYXNzPVwiaWNvbiBwd3AtJyArIG9wdGlvbnMuaWNvbiArICdcIj48L2k+PC9hPicgK1xuICAnPHNwYW4+JyArIG9wdGlvbnMudGl0bGUgKyAnPC9zcGFuPicpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gb2JqZWN0IHRvIGludGVyYWN0IHdpdGggYSBzb2NpYWwgbmV0d29ya1xuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgSWNvbiwgdGl0bGUgcHJvZmlsZS0gYW5kIHNoYXJpbmctVVJMLXRlbXBsYXRlc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFNvY2lhbE5ldHdvcmsgKG9wdGlvbnMpIHtcbiAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uO1xuICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgdGhpcy51cmwgPSBvcHRpb25zLnByb2ZpbGVVcmw7XG4gIHRoaXMuc2hhcmVVcmwgPSBvcHRpb25zLnNoYXJlVXJsO1xufVxuXG4vKipcbiAqIGJ1aWxkIFVSTCBmb3Igc2hhcmluZyBhIHRleHQsIGEgdGl0bGUgYW5kIGEgdXJsXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBjb250ZW50cyB0byBiZSBzaGFyZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVSTCB0byBzaGFyZSB0aGUgY29udGVudHNcbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0U2hhcmVVcmwgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB2YXIgc2hhcmVVcmwgPSB0aGlzLnNoYXJlVXJsXG4gICAgLnJlcGxhY2UoJyR0ZXh0JCcsIG9wdGlvbnMudGV4dClcbiAgICAucmVwbGFjZSgnJHRpdGxlJCcsIG9wdGlvbnMudGl0bGUpXG4gICAgLnJlcGxhY2UoJyR1cmwkJywgb3B0aW9ucy51cmwpO1xuICByZXR1cm4gdGhpcy51cmwgKyBzaGFyZVVybDtcbn07XG5cbi8qKlxuICogYnVpbGQgVVJMIHRvIGEgZ2l2ZW4gcHJvZmlsZVxuICogQHBhcmFtIHtvYmplY3R9IHByb2ZpbGUgVXNlcm5hbWUgdG8gbGluayB0b1xuICogQHJldHVybnMge3N0cmluZ30gcHJvZmlsZSBVUkxcbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0UHJvZmlsZVVybCA9IGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gIHJldHVybiB0aGlzLnVybCArIHByb2ZpbGU7XG59O1xuXG4vKipcbiAqIGdldCBwcm9maWxlIGJ1dHRvbiBlbGVtZW50XG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBvcHRpb25zLnByb2ZpbGUgZGVmaW5lcyB0aGUgcHJvZmlsZSB0aGUgYnV0dG9uIGxpbmtzIHRvXG4gKiBAcmV0dXJucyB7e2VsZW1lbnQ6e2pRdWVyeX19fSBidXR0b24gcmVmZXJlbmNlXG4gKi9cblNvY2lhbE5ldHdvcmsucHJvdG90eXBlLmdldFByb2ZpbGVCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMucHJvZmlsZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogY3JlYXRlQnV0dG9uKHtcbiAgICAgIHVybDogdGhpcy5nZXRQcm9maWxlVXJsKG9wdGlvbnMucHJvZmlsZSksXG4gICAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICAgIGljb246IHRoaXMuaWNvblxuICAgIH0pXG4gIH07XG59O1xuXG4vKipcbiAqIGdldCBzaGFyZSBidXR0b24gZWxlbWVudCBhbmQgVVJMIHVwZGF0ZSBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgaW5pdGlhbCBjb250ZW50cyB0byBiZSBzaGFyZWQgd2l0aCB0aGUgYnV0dG9uXG4gKiBAcmV0dXJucyB7e2VsZW1lbnQ6e2pRdWVyeX0sIHVwZGF0ZVVybDp7ZnVuY3Rpb259fX0gYnV0dG9uIHJlZmVyZW5jZSBhbmQgdXBkYXRlIGZ1bmN0aW9uXG4gKi9cblNvY2lhbE5ldHdvcmsucHJvdG90eXBlLmdldFNoYXJlQnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICBpZiAoIXRoaXMuc2hhcmVVcmwgfHwgIW9wdGlvbnMudGl0bGUgfHwgIW9wdGlvbnMudXJsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMudGV4dCkge1xuICAgIG9wdGlvbnMudGV4dCA9IG9wdGlvbnMudGl0bGUgKyAnJTIwJyArIG9wdGlvbnMudXJsO1xuICB9XG5cbiAgdmFyIGVsZW1lbnQgPSBjcmVhdGVCdXR0b24oe1xuICAgIHVybDogdGhpcy5nZXRTaGFyZVVybChvcHRpb25zKSxcbiAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICBpY29uOiB0aGlzLmljb25cbiAgfSk7XG5cbiAgdmFyIHVwZGF0ZVVybCA9IGZ1bmN0aW9uICh1cGRhdGVPcHRpb25zKSB7XG4gICAgZWxlbWVudC5nZXQoMCkuaHJlZiA9IHRoaXMuZ2V0U2hhcmVVcmwodXBkYXRlT3B0aW9ucyk7XG4gIH0uYmluZCh0aGlzKTtcblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgdXBkYXRlVXJsOiB1cGRhdGVVcmxcbiAgfTtcbn07XG5cbi8qKlxuICogZ2V0IHNoYXJlIG9yIHByb2ZpbGUgYnV0dG9uIGRlcGVuZGluZyBvbiB0aGUgb3B0aW9ucyBnaXZlblxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgb2JqZWN0IHdpdGggZWl0aGVyIHByb2ZpbGVuYW1lIG9yIGNvbnRlbnRzIHRvIHNoYXJlXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBidXR0b24gb2JqZWN0XG4gKi9cblNvY2lhbE5ldHdvcmsucHJvdG90eXBlLmdldEJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLnByb2ZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9maWxlQnV0dG9uKG9wdGlvbnMpO1xuICB9XG4gIGlmICh0aGlzLnNoYXJlVXJsICYmIG9wdGlvbnMudGl0bGUgJiYgb3B0aW9ucy51cmwpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTaGFyZUJ1dHRvbihvcHRpb25zKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU29jaWFsTmV0d29yaztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9zb2NpYWwtbmV0d29yay5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFNvY2lhbE5ldHdvcmsgPSByZXF1aXJlKCcuL3NvY2lhbC1uZXR3b3JrJyk7XG52YXIgc29jaWFsTmV0d29ya3MgPSB7XG4gIHR3aXR0ZXI6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAndHdpdHRlcicsXG4gICAgdGl0bGU6ICdUd2l0dGVyJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly90d2l0dGVyLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGV4dD0kdGV4dCQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICBmbGF0dHI6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnZmxhdHRyJyxcbiAgICB0aXRsZTogJ0ZsYXR0cicsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vZmxhdHRyLmNvbS9wcm9maWxlLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90ZXh0PSR0ZXh0JCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGZhY2Vib29rOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ2ZhY2Vib29rJyxcbiAgICB0aXRsZTogJ0ZhY2Vib29rJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9mYWNlYm9vay5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlLnBocD90PSR0ZXh0JCZ1PSR1cmwkJ1xuICB9KSxcblxuICBhZG46IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnYWRuJyxcbiAgICB0aXRsZTogJ0FwcC5uZXQnLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL2FscGhhLmFwcC5uZXQvJyxcbiAgICBzaGFyZVVybDogJ2ludGVudC9wb3N0P3RleHQ9JHRleHQkJ1xuICB9KSxcblxuICBzb3VuZGNsb3VkOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ3NvdW5kY2xvdWQnLFxuICAgIHRpdGxlOiAnU291bmRDbG91ZCcsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vc291bmRjbG91ZC5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RpdGxlPSR0aXRsZSQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICBpbnN0YWdyYW06IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnaW5zdGFncmFtJyxcbiAgICB0aXRsZTogJ0luc3RhZ3JhbScsXG4gICAgcHJvZmlsZVVybDogJ2h0dHA6Ly9pbnN0YWdyYW0uY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90aXRsZT0kdGl0bGUkJnVybD0kdXJsJCdcbiAgfSksXG5cbiAgdHVtYmxyOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ3R1bWJscicsXG4gICAgdGl0bGU6ICdUdW1ibHInLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3d3dy50dW1ibHIuY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90aXRsZT0kdGl0bGUkJnVybD0kdXJsJCdcbiAgfSksXG5cbiAgZW1haWw6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnbWVzc2FnZScsXG4gICAgdGl0bGU6ICdFLU1haWwnLFxuICAgIHByb2ZpbGVVcmw6ICdtYWlsdG86JyxcbiAgICBzaGFyZVVybDogJz9zdWJqZWN0PSR0aXRsZSQmYm9keT0kdGV4dCQnXG4gIH0pLFxuXG4gIGdwbHVzOiBuZXcgU29jaWFsTmV0d29yayh7XG4gICAgaWNvbjogJ2dvb2dsZS1wbHVzJyxcbiAgICB0aXRsZTogJ0dvb2dsZSsnLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3BsdXMuZ29vZ2xlLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pXG59O1xuXG4vKipcbiAqIHJldHVybnMgdGhlIHNlcnZpY2UgcmVnaXN0ZXJlZCB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VydmljZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHNvY2lhbCBuZXR3b3JrXG4gKiBAcmV0dXJucyB7U29jaWFsTmV0d29ya30gVGhlIG5ldHdvcmsgd2l0aCB0aGUgZ2l2ZW4gbmFtZVxuICovXG5mdW5jdGlvbiBnZXRTZXJ2aWNlIChzZXJ2aWNlTmFtZSkge1xuICB2YXIgc2VydmljZSA9IHNvY2lhbE5ldHdvcmtzW3NlcnZpY2VOYW1lXTtcbiAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgY29uc29sZS5lcnJvcignVW5rbm93biBzZXJ2aWNlJywgc2VydmljZU5hbWUpO1xuICB9XG4gIHJldHVybiBzZXJ2aWNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0OiBnZXRTZXJ2aWNlXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NvY2lhbC1uZXR3b3Jrcy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBXaGVuIHRhYiBjb250ZW50IGlzIHNjcm9sbGVkLCBhIGJveHNoYWRvdyBpcyBhZGRlZCB0byB0aGUgaGVhZGVyXG4gKiBAcGFyYW0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gYWRkU2hhZG93T25TY3JvbGwoZXZlbnQpIHtcbiAgdmFyIHNjcm9sbCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuc2Nyb2xsVG9wO1xuICBldmVudC5kYXRhLmhlYWRlci50b2dnbGVDbGFzcygnc2Nyb2xsZWQnLCAoc2Nyb2xsID49IDUgKSk7XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGh0bWwgc2VjdGlvbiBlbGVtZW50IGFzIGEgd3JhcHBlciBmb3IgdGhlIHRhYlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHsqfGpRdWVyeXxIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29udGVudEJveChvcHRpb25zKSB7XG4gIHZhciBjbGFzc2VzID0gWyd0YWInXTtcbiAgY2xhc3Nlcy5wdXNoKG9wdGlvbnMubmFtZSk7XG4gIGlmIChvcHRpb25zLmFjdGl2ZSkge1xuICAgIGNsYXNzZXMucHVzaCgnYWN0aXZlJyk7XG4gIH1cbiAgcmV0dXJuICQoJzxzZWN0aW9uIGNsYXNzPVwiJyArIGNsYXNzZXMuam9pbignICcpICsgJ1wiPjwvc2VjdGlvbj4nKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB0YWJcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVGFiKG9wdGlvbnMpIHtcbiAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uO1xuICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgdGhpcy5oZWFkbGluZSA9IG9wdGlvbnMuaGVhZGxpbmU7XG5cbiAgdGhpcy5ib3ggPSBjcmVhdGVDb250ZW50Qm94KG9wdGlvbnMpO1xuICB2YXIgaGVhZGVyID0gdGhpcy5jcmVhdGVIZWFkZXIoKTtcbiAgdGhpcy5ib3gub24oJ3Njcm9sbCcsIHtoZWFkZXI6IGhlYWRlcn0sIGFkZFNoYWRvd09uU2Nyb2xsKTtcblxuICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLnRvZ2dsZSA9IG51bGw7XG59XG5cbi8qKlxuICogQWRkIGNsYXNzICdhY3RpdmUnIHRvIHRoZSBhY3RpdmUgdGFiXG4gKi9cblRhYi5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICB0aGlzLmJveC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIHRoaXMudG9nZ2xlLmFkZENsYXNzKCdhY3RpdmUnKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzICdhY3RpdmUnIGZyb20gdGhlIGluYWN0aXZlIHRhYlxuICovXG5UYWIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLmJveC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gIHRoaXMudG9nZ2xlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGh0bWwgaGVhZGVyIGVsZW1lbnQgd2l0aCBhIGhlYWRsaW5lXG4gKi9cblRhYi5wcm90b3R5cGUuY3JlYXRlSGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBoZWFkZXIgPSAkKCc8aGVhZGVyIGNsYXNzPVwidGFiLWhlYWRlclwiPjxoMiBjbGFzcz1cInRhYi1oZWFkbGluZVwiPicgK1xuICAgICc8aSBjbGFzcz1cImljb24gJyArIHRoaXMuaWNvbiArICdcIj48L2k+JyArIHRoaXMuaGVhZGxpbmUgKyAnPC9oMj48L2hlYWRlcj4nKTtcbiAgdGhpcy5ib3guYXBwZW5kKGhlYWRlcik7XG4gIHJldHVybiBoZWFkZXI7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGRpdiBlbGVtZW50IHdpdGggY2xhc3MgbWFpbiB0byB0aGUgdGFiJ3MgY29udGVudCBib3hcbiAqIEBwYXJhbSBjb250ZW50XG4gKi9cblRhYi5wcm90b3R5cGUuY3JlYXRlTWFpbkNvbnRlbnQgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBtYWluRGl2ID0gJCgnPGRpdiBjbGFzcz1cIm1haW5cIj4nICsgY29udGVudCArICc8L2RpdicpO1xuICB0aGlzLmJveC5hcHBlbmQobWFpbkRpdik7XG4gIHJldHVybiBtYWluRGl2O1xufTtcblxuLyoqXG4gKiBBcHBlbmQgYW4gaHRtbCBhc2lkZSBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVBc2lkZSA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgdmFyIGFzaWRlID0gJCgnPGFzaWRlIGNsYXNzPVwiYXNpZGVcIj4nICsgY29udGVudCArICc8L2FzaWRlPicpO1xuICB0aGlzLmJveC5hcHBlbmQoYXNpZGUpO1xuICByZXR1cm4gYXNpZGU7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGZvb3RlciBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVGb290ZXIgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBmb290ZXIgPSAkKCc8Zm9vdGVyPicgKyBjb250ZW50ICsgJzwvZm9vdGVyPicpO1xuICB0aGlzLmJveC5hcHBlbmQoZm9vdGVyKTtcbiAgcmV0dXJuIGZvb3Rlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFiO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RhYi5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKlxuICogQHBhcmFtIHtUYWJ9IHRhYlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGdldFRvZ2dsZUNsaWNrSGFuZGxlcih0YWIpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgY29uc29sZS5kZWJ1ZygnVGFiUmVnaXN0cnknLCAnYWN0aXZlVGFiJywgdGhpcy5hY3RpdmVUYWIpO1xuICBpZiAodGhpcy5hY3RpdmVUYWIpIHtcbiAgICB0aGlzLmFjdGl2ZVRhYi5jbG9zZSgpO1xuICB9XG4gIGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gdGFiKSB7XG4gICAgdGhpcy5hY3RpdmVUYWIgPSBudWxsO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcbiAgdGhpcy5hY3RpdmVUYWIub3BlbigpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBsYXllclxuICovXG5mdW5jdGlvbiBsb2dDdXJyZW50VGltZSAocGxheWVyKSB7XG4gIGNvbnNvbGUubG9nKCdwbGF5ZXIuY3VycmVudFRpbWUnLCBwbGF5ZXIuY3VycmVudFRpbWUpO1xufVxuXG5mdW5jdGlvbiBUYWJSZWdpc3RyeSgpIHtcbiAgLyoqXG4gICAqIHdpbGwgc3RvcmUgYSByZWZlcmVuY2UgdG8gY3VycmVudGx5IGFjdGl2ZSB0YWIgaW5zdGFuY2UgdG8gY2xvc2UgaXQgd2hlbiBhbm90aGVyIG9uZSBpcyBvcGVuZWRcbiAgICogQHR5cGUge29iamVjdH1cbiAgICovXG4gIHRoaXMuYWN0aXZlVGFiID0gbnVsbDtcbiAgdGhpcy50b2dnbGViYXIgPSAkKCc8ZGl2IGNsYXNzPVwidG9nZ2xlYmFyIGJhclwiPjwvZGl2PicpO1xuICB0aGlzLnRvZ2dsZUxpc3QgPSAkKCc8dWwgY2xhc3M9XCJ0YWJsaXN0XCI+PC91bD4nKTtcbiAgdGhpcy50b2dnbGViYXIuYXBwZW5kKHRoaXMudG9nZ2xlTGlzdCk7XG4gIHRoaXMuY29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cInRhYnNcIj48L2Rpdj4nKTtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbbG9nQ3VycmVudFRpbWVdO1xuICB0aGlzLnRhYnMgPSBbXTtcbn1cblxuVGFiUmVnaXN0cnkucHJvdG90eXBlLmNyZWF0ZVRvZ2dsZUZvciA9IGZ1bmN0aW9uICh0YWIpIHtcbiAgdmFyIHRvZ2dsZSA9ICQoJzxsaSB0aXRsZT1cIicgKyB0YWIudGl0bGUgKyAnXCI+JyArXG4gICAgICAnPGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwiYnV0dG9uIGJ1dHRvbi10b2dnbGUgJyArIHRhYi5pY29uICsgJ1wiPjwvYT4nICtcbiAgICAnPC9saT4nKTtcbiAgdG9nZ2xlLm9uKCdjbGljaycsIGdldFRvZ2dsZUNsaWNrSGFuZGxlci5iaW5kKHRoaXMsIHRhYikpO1xuICB0aGlzLnRvZ2dsZUxpc3QuYXBwZW5kKHRvZ2dsZSk7XG4gIHJldHVybiB0b2dnbGU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgdGFiIGFuZCBvcGVuIGl0IGlmIGl0IGlzIGluaXRpYWxseSB2aXNpYmxlXG4gKiBAcGFyYW0ge1RhYn0gdGFiXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZpc2libGVcbiAqL1xuVGFiUmVnaXN0cnkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHRhYikge1xuICBpZiAodGFiID09PSBudWxsKSB7IHJldHVybjsgfVxuICB0aGlzLnRhYnMucHVzaCh0YWIpO1xuICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGFiLmJveCk7XG4gIHRhYi50b2dnbGUgPSB0aGlzLmNyZWF0ZVRvZ2dsZUZvcih0YWIpO1xufTtcblxuVGFiUmVnaXN0cnkucHJvdG90eXBlLm9wZW5Jbml0aWFsID0gZnVuY3Rpb24gKHRhYk5hbWUpIHtcbiAgaWYgKCF0YWJOYW1lKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtYXRjaGluZ1RhYnMgPSB0aGlzLnRhYnMuZmlsdGVyKGZ1bmN0aW9uICh0YWIpIHtcbiAgICByZXR1cm4gKHRhYi5oZWFkbGluZSA9PT0gdGFiTmFtZSk7XG4gIH0pO1xuICBpZiAobWF0Y2hpbmdUYWJzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnNvbGUud2FybignVGFiUmVnaXN0cnkub3BlbkluaXRpYWw6IENvdWxkIG5vdCBvcGVuIHRhYicsIHRhYk5hbWUpO1xuICB9XG4gIHZhciBpbml0aWFsQWN0aXZlVGFiID0gbWF0Y2hpbmdUYWJzLnBvcCgpO1xuICBpbml0aWFsQWN0aXZlVGFiLm9wZW4oKTtcbiAgdGhpcy5hY3RpdmVUYWIgPSBpbml0aWFsQWN0aXZlVGFiO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG1vZHVsZVxuICovXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuYWRkTW9kdWxlID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gIGlmIChtb2R1bGUudGFiKSB7XG4gICAgdGhpcy5hZGQobW9kdWxlLnRhYik7XG4gIH1cbiAgaWYgKG1vZHVsZS51cGRhdGUpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG1vZHVsZS51cGRhdGUpO1xuICB9XG59O1xuXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJ1RhYlJlZ2lzdHJ5I3VwZGF0ZScsIGV2ZW50KTtcbiAgdmFyIHBsYXllciA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICQuZWFjaCh0aGlzLmxpc3RlbmVycywgZnVuY3Rpb24gKGksIGxpc3RlbmVyKSB7IGxpc3RlbmVyKHBsYXllcik7IH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJSZWdpc3RyeTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi90YWJyZWdpc3RyeS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIHplcm9GaWxsID0gcmVxdWlyZSgnLi91dGlsJykuemVyb0ZpbGw7XG5cbi8qKlxuICogVGltZWNvZGUgYXMgZGVzY3JpYmVkIGluIGh0dHA6Ly9wb2Rsb3ZlLm9yZy9kZWVwLWxpbmsvXG4gKiBhbmQgaHR0cDovL3d3dy53My5vcmcvVFIvbWVkaWEtZnJhZ3MvI2ZyYWdtZW50LWRpbWVuc2lvbnNcbiAqL1xudmFyIHRpbWVDb2RlTWF0Y2hlciA9IC8oPzooXFxkKyk6KT8oXFxkezEsMn0pOihcXGRcXGQpKFxcLlxcZHsxLDN9KT8vO1xuXG4vKipcbiAqIGNvbnZlcnQgYW4gYXJyYXkgb2Ygc3RyaW5nIHRvIHRpbWVjb2RlXG4gKiBAcGFyYW0ge3N0cmluZ30gdGNcbiAqIEByZXR1cm5zIHtudW1iZXJ8Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFRpbWUodGMpIHtcbiAgaWYgKCF0Yykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGFydHMgPSB0aW1lQ29kZU1hdGNoZXIuZXhlYyh0Yyk7XG4gIGlmICghcGFydHMpIHtcbiAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBleHRyYWN0IHRpbWUgZnJvbScsIHRjKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHRpbWUgPSAwO1xuICAvLyBob3Vyc1xuICB0aW1lICs9IHBhcnRzWzFdID8gcGFyc2VJbnQocGFydHNbMV0sIDEwKSAqIDYwICogNjAgOiAwO1xuICAvLyBtaW51dGVzXG4gIHRpbWUgKz0gcGFyc2VJbnQocGFydHNbMl0sIDEwKSAqIDYwO1xuICAvLyBzZWNvbmRzXG4gIHRpbWUgKz0gcGFyc2VJbnQocGFydHNbM10sIDEwKTtcbiAgLy8gbWlsbGlzZWNvbmRzXG4gIHRpbWUgKz0gcGFydHNbNF0gPyBwYXJzZUZsb2F0KHBhcnRzWzRdKSA6IDA7XG4gIC8vIG5vIG5lZ2F0aXZlIHRpbWVcbiAgdGltZSA9IE1hdGgubWF4KHRpbWUsIDApO1xuICByZXR1cm4gdGltZTtcbn1cblxuLyoqXG4gKiBjb252ZXJ0IGEgdGltZXN0YW1wIHRvIGEgdGltZWNvZGUgaW4gJHtpbnNlcnQgUkZDIGhlcmV9IGZvcm1hdFxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbGVhZGluZ1plcm9zXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZUhvdXJzXSBmb3JjZSBvdXRwdXQgb2YgaG91cnMsIGRlZmF1bHRzIHRvIGZhbHNlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtzaG93TWlsbGlzXSBvdXRwdXQgbWlsbGlzZWNvbmRzIHNlcGFyYXRlZCB3aXRoIGEgZG90IGZyb20gdGhlIHNlY29uZHMgLSBkZWZhdWx0cyB0byBmYWxzZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB0czJ0Yyh0aW1lLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMsIHNob3dNaWxsaXMpIHtcbiAgdmFyIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNlY29uZHM7XG4gIHZhciB0aW1lY29kZSA9ICcnO1xuXG4gIGlmICh0aW1lID09PSAwKSB7XG4gICAgcmV0dXJuIChmb3JjZUhvdXJzID8gJzAwOjAwOjAwJyA6ICcwMDowMCcpO1xuICB9XG5cbiAgLy8gcHJldmVudCBuZWdhdGl2ZSB2YWx1ZXMgZnJvbSBwbGF5ZXJcbiAgaWYgKCF0aW1lIHx8IHRpbWUgPD0gMCkge1xuICAgIHJldHVybiAoZm9yY2VIb3VycyA/ICctLTotLTotLScgOiAnLS06LS0nKTtcbiAgfVxuXG4gIGhvdXJzID0gTWF0aC5mbG9vcih0aW1lIC8gNjAgLyA2MCk7XG4gIG1pbnV0ZXMgPSBNYXRoLmZsb29yKHRpbWUgLyA2MCkgJSA2MDtcbiAgc2Vjb25kcyA9IE1hdGguZmxvb3IodGltZSAlIDYwKSAlIDYwO1xuICBtaWxsaXNlY29uZHMgPSBNYXRoLmZsb29yKHRpbWUgJSAxICogMTAwMCk7XG5cbiAgaWYgKHNob3dNaWxsaXMgJiYgbWlsbGlzZWNvbmRzKSB7XG4gICAgdGltZWNvZGUgPSAnLicgKyB6ZXJvRmlsbChtaWxsaXNlY29uZHMsIDMpO1xuICB9XG5cbiAgdGltZWNvZGUgPSAnOicgKyB6ZXJvRmlsbChzZWNvbmRzLCAyKSArIHRpbWVjb2RlO1xuXG4gIGlmIChob3VycyA9PT0gMCAmJiAhZm9yY2VIb3VycyAmJiAhbGVhZGluZ1plcm9zICkge1xuICAgIHJldHVybiBtaW51dGVzLnRvU3RyaW5nKCkgKyB0aW1lY29kZTtcbiAgfVxuXG4gIHRpbWVjb2RlID0gemVyb0ZpbGwobWludXRlcywgMikgKyB0aW1lY29kZTtcblxuICBpZiAoaG91cnMgPT09IDAgJiYgIWZvcmNlSG91cnMpIHtcbiAgICAvLyByZXF1aXJlZCAobWludXRlcyA6IHNlY29uZHMpXG4gICAgcmV0dXJuIHRpbWVjb2RlO1xuICB9XG5cbiAgaWYgKGxlYWRpbmdaZXJvcykge1xuICAgIHJldHVybiB6ZXJvRmlsbChob3VycywgMikgKyAnOicgKyB0aW1lY29kZTtcbiAgfVxuXG4gIHJldHVybiBob3VycyArICc6JyArIHRpbWVjb2RlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogY29udmVuaWVuY2UgbWV0aG9kIGZvciBjb252ZXJ0aW5nIHRpbWVzdGFtcHMgdG9cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVzdGFtcFxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSB0aW1lY29kZVxuICAgKi9cbiAgZnJvbVRpbWVTdGFtcDogZnVuY3Rpb24gKHRpbWVzdGFtcCkge1xuICAgIHJldHVybiB0czJ0Yyh0aW1lc3RhbXAsIHRydWUsIHRydWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBhY2NlcHRzIGFycmF5IHdpdGggc3RhcnQgYW5kIGVuZCB0aW1lIGluIHNlY29uZHNcbiAgICogcmV0dXJucyB0aW1lY29kZSBpbiBkZWVwLWxpbmtpbmcgZm9ybWF0XG4gICAqIEBwYXJhbSB7QXJyYXl9IHRpbWVzXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbGVhZGluZ1plcm9zXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlSG91cnNdXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdlbmVyYXRlOiBmdW5jdGlvbiAodGltZXMsIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycykge1xuICAgIGlmICh0aW1lc1sxXSA+IDAgJiYgdGltZXNbMV0gPCA5OTk5OTk5ICYmIHRpbWVzWzBdIDwgdGltZXNbMV0pIHtcbiAgICAgIHJldHVybiB0czJ0Yyh0aW1lc1swXSwgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzKSArICcsJyArIHRzMnRjKHRpbWVzWzFdLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMpO1xuICAgIH1cbiAgICByZXR1cm4gdHMydGModGltZXNbMF0sIGxlYWRpbmdaZXJvcywgZm9yY2VIb3Vycyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIHBhcnNlcyB0aW1lIGNvZGUgaW50byBzZWNvbmRzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0aW1lY29kZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIHBhcnNlOiBmdW5jdGlvbiAodGltZWNvZGUpIHtcbiAgICBpZiAoIXRpbWVjb2RlKSB7XG4gICAgICByZXR1cm4gW2ZhbHNlLCBmYWxzZV07XG4gICAgfVxuXG4gICAgdmFyIHRpbWVwYXJ0cyA9IHRpbWVjb2RlLnNwbGl0KCctJyk7XG5cbiAgICBpZiAoIXRpbWVwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIGNvbnNvbGUud2Fybignbm8gdGltZXBhcnRzOicsIHRpbWVjb2RlKTtcbiAgICAgIHJldHVybiBbZmFsc2UsIGZhbHNlXTtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnRUaW1lID0gZXh0cmFjdFRpbWUodGltZXBhcnRzLnNoaWZ0KCkpO1xuICAgIHZhciBlbmRUaW1lID0gZXh0cmFjdFRpbWUodGltZXBhcnRzLnNoaWZ0KCkpO1xuXG4gICAgcmV0dXJuIChlbmRUaW1lID4gc3RhcnRUaW1lKSA/IFtzdGFydFRpbWUsIGVuZFRpbWVdIDogW3N0YXJ0VGltZSwgZmFsc2VdO1xuICB9LFxuXG4gIGdldFN0YXJ0VGltZUNvZGU6IGZ1bmN0aW9uIGdldFN0YXJ0VGltZWNvZGUoc3RhcnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlKHN0YXJ0KVswXTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi90aW1lY29kZS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLypcbiBbXG4ge3R5cGU6IFwiaW1hZ2VcIiwgXCJ0aXRsZVwiOiBcIlRoZSB2ZXJ5IGJlc3QgSW1hZ2VcIiwgXCJ1cmxcIjogXCJodHRwOi8vZG9tYWluLmNvbS9pbWFnZXMvdGVzdDEucG5nXCJ9LFxuIHt0eXBlOiBcInNob3dub3RlXCIsIFwidGV4dFwiOiBcIlBBUEFQQVBBUEFQQUdFTk9cIn0sXG4ge3R5cGU6IFwidG9waWNcIiwgc3RhcnQ6IDAsIGVuZDogMSwgcTp0cnVlLCB0aXRsZTogXCJUaGUgdmVyeSBmaXJzdCBjaGFwdGVyXCIgfSxcbiB7dHlwZTogXCJhdWRpb1wiLCBzdGFydDogMCwgZW5kOiAxLCBxOnRydWUsIGNsYXNzOiAnc3BlZWNoJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDEsIGVuZDogMiwgcTp0cnVlLCBjbGFzczogJ211c2ljJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDIsIGVuZDogMywgcTp0cnVlLCBjbGFzczogJ25vaXNlJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDQsIGVuZDogNSwgcTp0cnVlLCBjbGFzczogJ3NpbGVuY2UnfSxcbiB7dHlwZTogXCJjb250ZW50XCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6dHJ1ZSwgdGl0bGU6IFwiVGhlIHZlcnkgZmlyc3QgY2hhcHRlclwiLCBjbGFzczonYWR2ZXJ0aXNlbWVudCd9LFxuIHt0eXBlOiBcImxvY2F0aW9uXCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6ZmFsc2UsIHRpdGxlOiBcIkFyb3VuZCBCZXJsaW5cIiwgbGF0OjEyLjEyMywgbG9uOjUyLjIzNCwgZGlhbWV0ZXI6MTIzIH0sXG4ge3R5cGU6IFwiY2hhdFwiLCBxOmZhbHNlLCBzdGFydDogMC4xMiwgXCJkYXRhXCI6IFwiRVJTVEVSICYgSElUTEVSISEhXCJ9LFxuIHt0eXBlOiBcInNob3dub3RlXCIsIHN0YXJ0OiAwLjIzLCBcImRhdGFcIjogXCJKZW1hbmQgdmFkZXJ0XCJ9LFxuIHt0eXBlOiBcImltYWdlXCIsIFwibmFtZVwiOiBcIlRoZSB2ZXJ5IGJlc3QgSW1hZ2VcIiwgXCJ1cmxcIjogXCJodHRwOi8vZG9tYWluLmNvbS9pbWFnZXMvdGVzdDEucG5nXCJ9LFxuIHt0eXBlOiBcImxpbmtcIiwgXCJuYW1lXCI6IFwiQW4gaW50ZXJlc3RpbmcgbGlua1wiLCBcInVybFwiOiBcImh0dHA6Ly9cIn0sXG4ge3R5cGU6IFwidG9waWNcIiwgc3RhcnQ6IDEsIGVuZDogMiwgXCJuYW1lXCI6IFwiVGhlIHZlcnkgZmlyc3QgY2hhcHRlclwiLCBcInVybFwiOiBcIlwifSxcbiBdXG4gKi9cbnZhciBjYXAgPSByZXF1aXJlKCcuL3V0aWwnKS5jYXA7XG5cbmZ1bmN0aW9uIGNhbGwobGlzdGVuZXIpIHtcbiAgbGlzdGVuZXIodGhpcyk7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckJ5VHlwZSh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgcmV0dXJuIChyZWNvcmQudHlwZSA9PT0gdHlwZSk7XG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lXG4gKi9cbmZ1bmN0aW9uIGxvZ0N1cnJlbnRUaW1lKHRpbWVsaW5lKSB7XG4gIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICdjdXJyZW50VGltZScsIHRpbWVsaW5lLmdldFRpbWUoKSk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGF0IGxlYXN0IG9uZSBjaGFwdGVyIGlzIHByZXNlbnRcbiAqL1xuZnVuY3Rpb24gY2hlY2tGb3JDaGFwdGVycyhwYXJhbXMpIHtcbiAgcmV0dXJuICEhcGFyYW1zLmNoYXB0ZXJzICYmIChcbiAgICB0eXBlb2YgcGFyYW1zLmNoYXB0ZXJzID09PSAnb2JqZWN0JyAmJiBwYXJhbXMuY2hhcHRlcnMubGVuZ3RoID4gMVxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHN0b3BPbkVuZFRpbWUoKSB7XG4gIGlmICh0aGlzLmN1cnJlbnRUaW1lID49IHRoaXMuZW5kVGltZSkge1xuICAgIGNvbnNvbGUubG9nKCdFTkRUSU1FIFJFQUNIRUQnKTtcbiAgICB0aGlzLnBsYXllci5zdG9wKCk7XG4gICAgZGVsZXRlIHRoaXMuZW5kVGltZTtcbiAgfVxufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0hUTUxNZWRpYUVsZW1lbnR9IHBsYXllclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUaW1lbGluZShwbGF5ZXIsIGRhdGEpIHtcbiAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gIHRoaXMuaGFzQ2hhcHRlcnMgPSBjaGVja0ZvckNoYXB0ZXJzKGRhdGEpO1xuICB0aGlzLm1vZHVsZXMgPSBbXTtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbbG9nQ3VycmVudFRpbWVdO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gLTE7XG4gIHRoaXMuZHVyYXRpb24gPSBkYXRhLmR1cmF0aW9uO1xuICB0aGlzLmJ1ZmZlcmVkVGltZSA9IDA7XG4gIHRoaXMucmVzdW1lID0gcGxheWVyLnBhdXNlZDtcbiAgdGhpcy5zZWVraW5nID0gZmFsc2U7XG59XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5kYXRhO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLmdldERhdGFCeVR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gdGhpcy5kYXRhLmZpbHRlcihmaWx0ZXJCeVR5cGUodHlwZSkpO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLmFkZE1vZHVsZSA9IGZ1bmN0aW9uIChtb2R1bGUpIHtcbiAgaWYgKG1vZHVsZS51cGRhdGUpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG1vZHVsZS51cGRhdGUpO1xuICB9XG4gIGlmIChtb2R1bGUuZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IG1vZHVsZS5kYXRhO1xuICB9XG4gIHRoaXMubW9kdWxlcy5wdXNoKG1vZHVsZSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUucGxheVJhbmdlID0gZnVuY3Rpb24gKHJhbmdlKSB7XG4gIGlmICghcmFuZ2UgfHwgIXJhbmdlLmxlbmd0aCB8fCAhcmFuZ2Uuc2hpZnQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaW1lbGluZS5wbGF5UmFuZ2UgY2FsbGVkIHdpdGhvdXQgYSByYW5nZScpO1xuICB9XG4gIHRoaXMuc2V0VGltZShyYW5nZS5zaGlmdCgpKTtcbiAgdGhpcy5zdG9wQXQocmFuZ2Uuc2hpZnQoKSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICd1cGRhdGUnLCBldmVudCk7XG4gIHRoaXMuc2V0QnVmZmVyZWRUaW1lKGV2ZW50KTtcblxuICBpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ3RpbWV1cGRhdGUnKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMucGxheWVyLmN1cnJlbnRUaW1lO1xuICB9XG4gIHRoaXMubGlzdGVuZXJzLmZvckVhY2goY2FsbCwgdGhpcyk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZW1pdEV2ZW50c0JldHdlZW4gPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgZW1pdFN0YXJ0ZWQgPSBmYWxzZSxcbiAgICBlbWl0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgY3VzdG9tRXZlbnQgPSBuZXcgJC5FdmVudChldmVudC50eXBlLCBldmVudCk7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoY3VzdG9tRXZlbnQpO1xuICAgIH0uYmluZCh0aGlzKTtcbiAgdGhpcy5kYXRhLm1hcChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgbGF0ZXIgPSAoZXZlbnQuc3RhcnQgPiBzdGFydCksXG4gICAgICBlYXJsaWVyID0gKGV2ZW50LmVuZCA8IHN0YXJ0KSxcbiAgICAgIGVuZGVkID0gKGV2ZW50LmVuZCA8IGVuZCk7XG5cbiAgICBpZiAobGF0ZXIgJiYgZWFybGllciAmJiAhZW5kZWQgfHwgZW1pdFN0YXJ0ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdUaW1lbGluZScsICdFbWl0JywgZXZlbnQpO1xuICAgICAgZW1pdChldmVudCk7XG4gICAgfVxuICAgIGVtaXRTdGFydGVkID0gbGF0ZXI7XG4gIH0pO1xufTtcblxuLyoqXG4gKiByZXR1cm5zIGlmIHRpbWUgaXMgYSB2YWxpZCB0aW1lc3RhbXAgaW4gY3VycmVudCB0aW1lbGluZVxuICogQHBhcmFtIHsqfSB0aW1lXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuVGltZWxpbmUucHJvdG90eXBlLmlzVmFsaWRUaW1lID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgcmV0dXJuICh0eXBlb2YgdGltZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHRpbWUpICYmIHRpbWUgPj0gMCAmJiB0aW1lIDw9IHRoaXMuZHVyYXRpb24pO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnNldFRpbWUgPSBmdW5jdGlvbiAodGltZSkge1xuICBpZiAoIXRoaXMuaXNWYWxpZFRpbWUodGltZSkpIHtcbiAgICBjb25zb2xlLndhcm4oJ1RpbWVsaW5lJywgJ3NldFRpbWUnLCAndGltZSBvdXQgb2YgYm91bmRzJywgdGltZSk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG4gIH1cblxuICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAnc2V0VGltZScsICd0aW1lJywgdGltZSk7XG4gIHRoaXMuY3VycmVudFRpbWUgPSB0aW1lO1xuICB0aGlzLnVwZGF0ZSgpO1xuXG4gIGNvbnNvbGUubG9nKCdjYW5wbGF5JywgJ3NldFRpbWUnLCAncGxheWVyU3RhdGUnLCB0aGlzLnBsYXllci5yZWFkeVN0YXRlKTtcbiAgaWYgKHRoaXMucGxheWVyLnJlYWR5U3RhdGUgPT09IHRoaXMucGxheWVyLkhBVkVfRU5PVUdIX0RBVEEpIHtcbiAgICB0aGlzLnBsYXllci5zZXRDdXJyZW50VGltZSh0aW1lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8vIFRPRE8gdmlzdWFsaXplIGJ1ZmZlciBzdGF0ZVxuICAvLyAkKGRvY3VtZW50KS5maW5kKCcucGxheScpLmNzcyh7Y29sb3I6J3JlZCd9KTtcbiAgJCh0aGlzLnBsYXllcikub25lKCdjYW5wbGF5JywgZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE8gcmVtb3ZlIGJ1ZmZlciBzdGF0ZSB2aXN1YWxcbiAgICAvLyAkKGRvY3VtZW50KS5maW5kKCcucGxheScpLmNzcyh7Y29sb3I6J3doaXRlJ30pO1xuICAgIGNvbnNvbGUubG9nKCdQbGF5ZXInLCAnY2FucGxheScsICdidWZmZXJlZCcsIHRpbWUpO1xuICAgIHRoaXMuc2V0Q3VycmVudFRpbWUodGltZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnNlZWsgPSBmdW5jdGlvbiAodGltZSkge1xuICBjb25zb2xlLmRlYnVnKCdUaW1lbGluZScsICdzZWVrJywgdGltZSk7XG4gIHRoaXMuY3VycmVudFRpbWUgPSBjYXAodGltZSwgMCwgdGhpcy5kdXJhdGlvbik7XG4gIHRoaXMuc2V0VGltZSh0aGlzLmN1cnJlbnRUaW1lKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zdG9wQXQgPSBmdW5jdGlvbiAodGltZSkge1xuICBpZiAoIXRpbWUgfHwgdGltZSA8PSAwIHx8IHRpbWUgPiB0aGlzLmR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUud2FybignVGltZWxpbmUnLCAnc3RvcEF0JywgJ3RpbWUgb3V0IG9mIGJvdW5kcycsIHRpbWUpO1xuICB9XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5lbmRUaW1lID0gdGltZTtcbiAgdGhpcy5saXN0ZW5lcnMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgc3RvcE9uRW5kVGltZS5jYWxsKHNlbGYpO1xuICB9KTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXRUaW1lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXRCdWZmZXJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGlzTmFOKHRoaXMuYnVmZmVyZWRUaW1lKSkge1xuICAgIGNvbnNvbGUud2FybignVGltZWxpbmUnLCAnZ2V0QnVmZmVyZWQnLCAnYnVmZmVyZWRUaW1lIGlzIG5vdCBhIG51bWJlcicpO1xuICAgIHJldHVybiAwO1xuICB9XG4gIHJldHVybiB0aGlzLmJ1ZmZlcmVkVGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zZXRCdWZmZXJlZFRpbWUgPSBmdW5jdGlvbiAoZSkge1xuICB2YXIgdGFyZ2V0ID0gKGUgIT09IHVuZGVmaW5lZCkgPyBlLnRhcmdldCA6IHRoaXMucGxheWVyO1xuICB2YXIgYnVmZmVyZWQgPSAwO1xuXG4gIC8vIG5ld2VzdCBIVE1MNSBzcGVjIGhhcyBidWZmZXJlZCBhcnJheSAoRkY0LCBXZWJraXQpXG4gIGlmICh0YXJnZXQgJiYgdGFyZ2V0LmJ1ZmZlcmVkICYmIHRhcmdldC5idWZmZXJlZC5sZW5ndGggPiAwICYmIHRhcmdldC5idWZmZXJlZC5lbmQgJiYgdGFyZ2V0LmR1cmF0aW9uKSB7XG4gICAgYnVmZmVyZWQgPSB0YXJnZXQuYnVmZmVyZWQuZW5kKHRhcmdldC5idWZmZXJlZC5sZW5ndGggLSAxKTtcbiAgfVxuICAvLyBTb21lIGJyb3dzZXJzIChlLmcuLCBGRjMuNiBhbmQgU2FmYXJpIDUpIGNhbm5vdCBjYWxjdWxhdGUgdGFyZ2V0LmJ1ZmZlcmVyZWQuZW5kKClcbiAgLy8gdG8gYmUgYW55dGhpbmcgb3RoZXIgdGhhbiAwLiBJZiB0aGUgYnl0ZSBjb3VudCBpcyBhdmFpbGFibGUgd2UgdXNlIHRoaXMgaW5zdGVhZC5cbiAgLy8gQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHRoZSBlbHNlIGlmIGRvIG5vdCBzZWVtIHRvIGhhdmUgdGhlIGJ1ZmZlcmVkQnl0ZXMgdmFsdWUgYW5kXG4gIC8vIHNob3VsZCBza2lwIHRvIHRoZXJlLiBUZXN0ZWQgaW4gU2FmYXJpIDUsIFdlYmtpdCBoZWFkLCBGRjMuNiwgQ2hyb21lIDYsIElFIDcvOC5cbiAgZWxzZSBpZiAodGFyZ2V0ICYmIHRhcmdldC5ieXRlc1RvdGFsICE9PSB1bmRlZmluZWQgJiYgdGFyZ2V0LmJ5dGVzVG90YWwgPiAwICYmIHRhcmdldC5idWZmZXJlZEJ5dGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBidWZmZXJlZCA9IHRhcmdldC5idWZmZXJlZEJ5dGVzIC8gdGFyZ2V0LmJ5dGVzVG90YWwgKiB0YXJnZXQuZHVyYXRpb247XG4gIH1cbiAgLy8gRmlyZWZveCAzIHdpdGggYW4gT2dnIGZpbGUgc2VlbXMgdG8gZ28gdGhpcyB3YXlcbiAgZWxzZSBpZiAoZSAmJiBlLmxlbmd0aENvbXB1dGFibGUgJiYgZS50b3RhbCAhPT0gMCkge1xuICAgIGJ1ZmZlcmVkID0gZS5sb2FkZWQgLyBlLnRvdGFsICogdGFyZ2V0LmR1cmF0aW9uO1xuICB9XG4gIHZhciBjYXBwZWRUaW1lID0gY2FwKGJ1ZmZlcmVkLCAwLCB0YXJnZXQuZHVyYXRpb24pO1xuICBjb25zb2xlLmxvZygnVGltZWxpbmUnLCAnc2V0QnVmZmVyZWRUaW1lJywgY2FwcGVkVGltZSk7XG4gIHRoaXMuYnVmZmVyZWRUaW1lID0gY2FwcGVkVGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5yZXdpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2V0VGltZSgwKTtcbiAgdmFyIGNhbGxMaXN0ZW5lcldpdGhUaGlzID0gZnVuY3Rpb24gX2NhbGxMaXN0ZW5lcldpdGhUaGlzKGksIGxpc3RlbmVyKSB7XG4gICAgbGlzdGVuZXIodGhpcyk7XG4gIH0uYmluZCh0aGlzKTtcbiAgJC5lYWNoKHRoaXMubGlzdGVuZXJzLCBjYWxsTGlzdGVuZXJXaXRoVGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RpbWVsaW5lLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuL3RpbWVjb2RlJyk7XG5cbi8qXG4gIFwidD0xXCJcdFsoXCJ0XCIsIFwiMVwiKV1cdHNpbXBsZSBjYXNlXG4gIFwidD0xJnQ9MlwiXHRbKFwidFwiLCBcIjFcIiksIChcInRcIiwgXCIyXCIpXVx0cmVwZWF0ZWQgbmFtZVxuICBcImE9Yj1jXCJcdFsoXCJhXCIsIFwiYj1jXCIpXVx0XCI9XCIgaW4gdmFsdWVcbiAgXCJhJmI9Y1wiXHRbKFwiYVwiLCBcIlwiKSwgKFwiYlwiLCBcImNcIildXHRtaXNzaW5nIHZhbHVlXG4gIFwiJTc0PSU2ZXB0JTNBJTMxMFwiXHRbKFwidFwiLCBcIm5wdDoxMFwiKV1cdHVubmVjc3NhcnkgcGVyY2VudC1lbmNvZGluZ1xuICBcImlkPSV4eSZ0PTFcIlx0WyhcInRcIiwgXCIxXCIpXVx0aW52YWxpZCBwZXJjZW50LWVuY29kaW5nXG4gIFwiaWQ9JUU0ciZ0PTFcIlx0WyhcInRcIiwgXCIxXCIpXVx0aW52YWxpZCBVVEYtOFxuICovXG5cbi8qKlxuICogZ2V0IHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmljIFVSTCBoYXNoIGZyYWdtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IG5hbWUgb2YgdGhlIGZyYWdtZW50XG4gKiBAcmV0dXJucyB7c3RyaW5nfGJvb2xlYW59IHZhbHVlIG9mIHRoZSBmcmFnbWVudCBvciBmYWxzZSB3aGVuIG5vdCBmb3VuZCBpbiBVUkxcbiAqL1xuZnVuY3Rpb24gZ2V0RnJhZ21lbnQoa2V5KSB7XG4gIHZhciBxdWVyeSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSxcbiAgICBwYWlycyA9IHF1ZXJ5LnNwbGl0KCcmJyk7XG5cbiAgaWYgKHF1ZXJ5LmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHBhaXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBwYWlyID0gcGFpcnNbaV0uc3BsaXQoJz0nKTtcbiAgICBpZiAocGFpclswXSAhPT0ga2V5KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHBhaXIubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVVJMIGhhbmRsaW5nIGhlbHBlcnNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldEZyYWdtZW50OiBnZXRGcmFnbWVudCxcbiAgY2hlY2tDdXJyZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSBnZXRGcmFnbWVudCgndCcpO1xuICAgIHJldHVybiB0Yy5wYXJzZSh0KTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91cmwuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogcmV0dXJuIG5ldyB2YWx1ZSBpbiBib3VuZHMgb2YgbWluIGFuZCBtYXhcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWwgYW55IG51bWJlclxuICogQHBhcmFtIHtudW1iZXJ9IG1pbiBsb3dlciBib3VuZGFyeSBmb3IgdmFsXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4IHVwcGVyIGJvdW5kYXJ5IGZvciB2YWxcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdGluZyB2YWx1ZVxuICovXG5mdW5jdGlvbiBjYXAodmFsLCBtaW4sIG1heCkge1xuICAvLyBjYXAgeCB2YWx1ZXNcbiAgdmFsID0gTWF0aC5tYXgodmFsLCBtaW4pO1xuICB2YWwgPSBNYXRoLm1pbih2YWwsIG1heCk7XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogcmV0dXJuIG51bWJlciBhcyBzdHJpbmcgbGVmdGhhbmQgZmlsbGVkIHdpdGggemVyb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXIgKGludGVnZXIpIHZhbHVlIHRvIGJlIHBhZGRlZFxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIGxlbmd0aCBvZiB0aGUgc3RyaW5nIHRoYXQgaXMgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHBhZGRlZCBudW1iZXJcbiAqL1xuZnVuY3Rpb24gemVyb0ZpbGwgKG51bWJlciwgd2lkdGgpIHtcbiAgdmFyIHMgPSBudW1iZXIudG9TdHJpbmcoKTtcbiAgd2hpbGUgKHMubGVuZ3RoIDwgd2lkdGgpIHtcbiAgICBzID0gJzAnICsgcztcbiAgfVxuICByZXR1cm4gcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNhcDogY2FwLFxuICB6ZXJvRmlsbDogemVyb0ZpbGxcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXRpbC5qc1wiLFwiL1wiKSJdfQ==
