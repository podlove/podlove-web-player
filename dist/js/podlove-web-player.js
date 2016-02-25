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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../bower_components/mediaelement/build/mediaelement.js","/../../bower_components/mediaelement/build")
},{"b55mWE":4,"buffer":3}],2:[function(require,module,exports){
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/base64-js/lib/b64.js","/../../node_modules/base64-js/lib")
},{"b55mWE":4,"buffer":3}],3:[function(require,module,exports){
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/buffer/index.js","/../../node_modules/gulp-browserify/node_modules/buffer")
},{"b55mWE":4,"base64-js":2,"buffer":3,"ieee754":5}],4:[function(require,module,exports){
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/process/browser.js","/../../node_modules/gulp-browserify/node_modules/process")
},{"b55mWE":4,"buffer":3}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/ieee754/index.js","/../../node_modules/ieee754")
},{"b55mWE":4,"buffer":3}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public API
       *
       */

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/loglevel/lib/loglevel.js","/../../node_modules/loglevel/lib")
},{"b55mWE":4,"buffer":3}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/**
 * @type {Chapters}
 */
var Chapters = require('./modules/chapter');
var log = require('./logging').getLogger('Chapters');

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
    log.debug('Controls', 'controlbutton clicked', evt);
    evt.preventDefault();
    log.debug('Controls', 'player started?', playerStarted(this.player));
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
    log.info('Controls', 'createTimeControls', 'no chapterTab found');
  }
  if (hasChapters) {
    this.createButton('pwp-controls-previous-chapter', 'Zurück zum vorigen Kapitel', function () {
      var activeChapter = chapterModule.getActiveChapter();
      if (this.timeline.getTime() > activeChapter.start + 10) {
        log.debug('Controls', 'Zurück zum Kapitelanfang', chapterModule.currentChapter, 'from', this.timeline.getTime());
        return chapterModule.playCurrentChapter();
      }
      log.debug('Controls', 'Zurück zum vorigen Kapitel', chapterModule.currentChapter);
      return chapterModule.previous();
    });
  }

  this.createButton('pwp-controls-back-30', '30 Sekunden zurück', function () {
    log.debug('Controls', 'rewind before', this.timeline.getTime());
    this.timeline.setTime(this.timeline.getTime() - 30);
    log.debug('Controls', 'rewind after', this.timeline.getTime());
  });

  this.createButton('pwp-controls-forward-30', '30 Sekunden vor', function () {
    log.debug('Controls', 'ffwd before', this.timeline.getTime());
    this.timeline.setTime(this.timeline.getTime() + 30);
    log.debug('Controls', 'ffwd after', this.timeline.getTime());
  });

  if (hasChapters) {
    this.createButton('pwp-controls-next-chapter', 'Zum nächsten Kapitel springen', function () {
      log.debug('Controls', 'next Chapter before', this.timeline.getTime());
      chapterModule.next();
      log.debug('Controls', 'next Chapter after', this.timeline.getTime());
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/controls.js","/")
},{"./logging":10,"./modules/chapter":11,"b55mWE":4,"buffer":3}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var log = require('./logging').getLogger('Embed');

// everything for an embedded player
var
  players = [],
  lastHeight = 0,
  $body;

function postToOpener(obj) {
  log.debug('postToOpener', obj);
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/embed.js","/")
},{"./logging":10,"b55mWE":4,"buffer":3}],9:[function(require,module,exports){
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
  ProgressBar = require('./modules/progressbar'),
  loglevel = require('./logging');

var pwp;

// will expose/attach itself to the $ global
require('../../bower_components/mediaelement/build/mediaelement.js');

var log = loglevel.getLogger('Webplayer');

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
    poster = params.poster || jqPlayer.attr('poster'),
    delayModuleRendering = !timeline.duration || isNaN(timeline.duration) || timeline.duration <= 0;

  var deepLink;

  log.info('Metadata', timeline.getData());
  jqPlayer.prop({
    controls: null
  });

  //only load metadata, if you don't have a duration
  if(delayModuleRendering) {
    jqPlayer.prop({
      preload: 'metadata'
    });
  }

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
      log.debug('Keydown', e);

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
          return true;
      }

      timeline.setTime(seekTime);
      return false;
    });

  jqPlayer
    .on('timelineElement', function (event) {
      log.trace(event.currentTarget.id, event);
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_5d47ebf4.js","/")
},{"../../bower_components/mediaelement/build/mediaelement.js":1,"./controls":7,"./embed":8,"./logging":10,"./modules/chapter":11,"./modules/downloads":12,"./modules/info":13,"./modules/progressbar":14,"./modules/savetime":15,"./modules/share":16,"./player":17,"./tabregistry":22,"./timeline":24,"./url":25,"b55mWE":4,"buffer":3}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var loglevel = require('loglevel');
var originalFactory = loglevel.methodFactory;

// extend loglevel here
function logWithLoggerName(methodName, logLevel, loggerName) {
  var rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function () {
    var args = [loggerName];
    for (var l = arguments.length, i = 0; i < l; i++) {
      args.push(arguments[i]);
    }
    rawMethod.apply(loglevel, args);
  };
}

// loglevel.methodFactory = logWithLoggerName;

// set the global log level here
loglevel.setLevel(loglevel.levels.INFO);

module.exports = loglevel;

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/logging.js","/")
},{"b55mWE":4,"buffer":3,"loglevel":6}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var tc = require('../timecode')
  , Tab = require('../tab');

var log = require('../logging').getLogger('Chapters');

var ACTIVE_CHAPTER_THRESHHOLD = 0.1;

function rowClickHandler (e) {
  e.preventDefault();
  var chapters = e.data.module;
  log.debug('clickHandler', 'setCurrentChapter to', e.data.index);
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

  log.debug('update', this, activeChapter, currentTime);
  if (isActiveChapter(activeChapter, currentTime)) {
    log.debug('update', 'already set', this.currentChapter);
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
    log.warn('constructor', 'Zero length media?', timeline);
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
    name: 'chapters'
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
  log.debug('getActiveChapter', active);
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
  log.debug('setCurrentChapter', 'to', this.currentChapter);
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
    log.debug('next', 'already in last chapter');
    return current;
  }
  log.debug('next', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return next;
};

Chapters.prototype.previous = function () {
  var current = this.currentChapter,
    previous = this.setCurrentChapter(current - 1);
  if (current === previous) {
    log.debug('previous', 'already in first chapter');
    this.playCurrentChapter();
    return current;
  }
  log.debug('previous', 'chapter', this.currentChapter);
  this.playCurrentChapter();
  return previous;
};

Chapters.prototype.playCurrentChapter = function () {
  var start = this.getActiveChapter().start;
  log.debug('playCurrentChapter', 'start', start);
  var time = this.timeline.setTime(start);
  log.debug('playCurrentChapter', 'currentTime', time);
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/chapter.js","/modules")
},{"../logging":10,"../tab":21,"../timecode":23,"b55mWE":4,"buffer":3}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var Tab = require('../tab');
var log = require('../logging').getLogger('Downloads');

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
  log.debug('found asset', asset.assetTitle);
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
      '<form action="#">' +
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
    window.open($select.val(), '_self');
  });

  // Add direct download URL for display to the user
  // to footer of this tab
  var $downloadLinkElement = $('<input name="download-link-url" type="url" readonly>');

  function setUrl () {
    $downloadLinkElement.val($select.val());
  }

  // set initial value
  setUrl();

  // change url whenever the user selects an asset
  $select.on('change', setUrl);

  downloadTab
    .createFooter('<h3>Direkter Link</h3>')
    .append($downloadLinkElement);

  return downloadTab;
};

module.exports = Downloads;

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/downloads.js","/modules")
},{"../logging":10,"../tab":21,"b55mWE":4,"buffer":3}],13:[function(require,module,exports){
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
  return '<p>Veröffentlicht am: ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '</p>';
}

function getSummary (summary) {
  if (summary && summary.length > 0) {
    return '<p>' + summary + '</p>';
  }
  return '';
}

function createEpisodeInfo(tab, params) {
  tab.createMainContent(
    '<h2>' + params.title + '</h2>' +
    '<h3>' + params.subtitle + '</h3>' +
    getSummary(params.summary) +
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

/**
 * Create footer with license area and social media profiles,
 * if (params.license && params.show) and params.profiles
 * are defined
 * @param  {Tab} tab
 * @param  {object} params
 */
function createSocialAndLicenseInfo (tab, params) {
  var footer, footerContent,
    completeLicenseInfo = params.license && params.license.url && params.license.name && params.show.title;
  if (!completeLicenseInfo && !params.profiles) {
    return;
  }
  footerContent = '';
  if (completeLicenseInfo) {
    footerContent = '<p class="license-area">Die Show "' + params.show.title + '" ist lizensiert unter<br>' +
        '<a href="' + params.license.url + '" target="_blank" title="Lizenz ansehen">' + params.license.name + '</a>' +
      '</p>';
  }
  footer = tab.createFooter(footerContent);
  footer.prepend(createSocialInfo(params.profiles));
}

/**
 * create info tab if params.summary is defined
 * @param {object} params parameter object
 * @returns {null|Tab} info tab instance or null
 */
function createInfoTab(params) {
  // if (!params.summary) {
  //   return null;
  // }
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/info.js","/modules")
},{"../social-networks":20,"../tab":21,"../timecode":23,"b55mWE":4,"buffer":3}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var tc = require('../timecode');
var cap = require('../util').cap;

var log = require('../logging').getLogger('ProgressBar');

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
  log.debug('Progressbar', 'renderCurrentChapterElement', index, chapter);

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
    log.error('Timeline missing', arguments);
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
  log.debug('setHandlePosition', 'time', time, 'newLeftOffset', newLeftOffset);
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/progressbar.js","/modules")
},{"../logging":10,"../timecode":23,"../util":26,"b55mWE":4,"buffer":3}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var log = require('../logging').getLogger('SaveTime');

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
  log.debug('update', this.timeline.getTime());
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/savetime.js","/modules")
},{"../logging":10,"b55mWE":4,"buffer":3}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var Tab = require('../tab')
  , SocialButtonList = require('../social-button-list');

var log = require('../logging').getLogger('Share');

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
    log.debug('sharing options changed', element, value);

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
    log.debug('createOption', 'omit disabled option', option.name);
    return null;
  }

  var data = getShareData(option.value);

  if (!data) {
    log.debug('createOption', 'omit option without data', option.name);
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
    name: 'share',
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/share.js","/modules")
},{"../logging":10,"../social-button-list":18,"../tab":21,"b55mWE":4,"buffer":3}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var parseTimecode = require('./timecode').parse;
var log = require('./logging').getLogger('Player');

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
  log.info('MediaElement', me);
}

module.exports = {
  create: create,
  defaults: defaults,
  players: players
};

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/player.js","/")
},{"./logging":10,"./timecode":23,"b55mWE":4,"buffer":3}],18:[function(require,module,exports){
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/social-button-list.js","/")
},{"./social-networks":20,"b55mWE":4,"buffer":3}],19:[function(require,module,exports){
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/social-network.js","/")
},{"b55mWE":4,"buffer":3}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var SocialNetwork = require('./social-network');
var log = require('./logging').getLogger('SocialNetWorks');

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
    log.error('Unknown service', serviceName);
  }
  return service;
}

module.exports = {
  get: getService
};

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/social-networks.js","/")
},{"./logging":10,"./social-network":19,"b55mWE":4,"buffer":3}],21:[function(require,module,exports){
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
  this.name = options.name;

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
  var footer;
  if(!content) {
    content = '';
  }
  footer = $('<footer>' + content + '</footer>');
  this.box.append(footer);
  return footer;
};

module.exports = Tab;

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/tab.js","/")
},{"b55mWE":4,"buffer":3}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var log = require('./logging').getLogger('TabRegistry');

/**
 *
 * @param {Tab} tab
 * @returns {boolean}
 */
function getToggleClickHandler(tab) {
  /*jshint validthis:true */
  log.debug('activeTab', this.activeTab);
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
  log.debug('player.currentTime', player.currentTime);
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
    return (tab.name === tabName);
  });
  if (matchingTabs.length === 0) {
    log.warn('openInitial', 'Could not open tab', tabName);
    return;
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
  log.debug('update', event);
  var player = event.currentTarget;
  $.each(this.listeners, function (i, listener) { listener(player); });
};

module.exports = TabRegistry;

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/tabregistry.js","/")
},{"./logging":10,"b55mWE":4,"buffer":3}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var zeroFill = require('./util').zeroFill;
var log = require('./logging').getLogger('TimeCode');

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
    log.warn('Could not extract time from', tc);
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
      log.warn('no timeparts:', timecode);
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/timecode.js","/")
},{"./logging":10,"./util":26,"b55mWE":4,"buffer":3}],24:[function(require,module,exports){
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
var log = require('./logging').getLogger('Timeline');

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
  log.debug('currentTime', timeline.getTime());
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
    log.info('ENDTIME REACHED');
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
  log.debug('update', event);
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
      log.debug('Emit', event);
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
    log.warn('Timeline', 'setTime', 'time out of bounds', time);
    return this.currentTime;
  }

  log.debug('setTime', 'time', time);
  this.currentTime = time;
  this.update();

  log.debug('setTime', 'player ready state', this.player.readyState);
  if (this.player.readyState === this.player.HAVE_ENOUGH_DATA) {
    this.player.setCurrentTime(time);
    return this.currentTime;
  }

  // TODO visualize buffer state
  // $(document).find('.play').css({color:'red'});
  $(this.player).one('canplay', function () {
    // TODO remove buffer state visual
    // $(document).find('.play').css({color:'white'});
    log.debug('Player', 'canplay', 'buffered', time);
    this.setCurrentTime(time);
  });

  return this.currentTime;
};

Timeline.prototype.seek = function (time) {
  log.debug('seek', time);
  this.currentTime = cap(time, 0, this.duration);
  this.setTime(this.currentTime);
};

Timeline.prototype.stopAt = function (time) {
  if (!time || time <= 0 || time > this.duration) {
    return log.warn('stopAt', 'time out of bounds', time);
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
    log.warn('getBuffered', 'bufferedTime is not a number');
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
  log.debug('setBufferedTime', cappedTime);
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/timeline.js","/")
},{"./logging":10,"./util":26,"b55mWE":4,"buffer":3}],25:[function(require,module,exports){
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/url.js","/")
},{"./timecode":23,"b55mWE":4,"buffer":3}],26:[function(require,module,exports){
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

}).call(this,require("b55mWE"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util.js","/")
},{"b55mWE":4,"buffer":3}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGluZTAvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvYm93ZXJfY29tcG9uZW50cy9tZWRpYWVsZW1lbnQvYnVpbGQvbWVkaWFlbGVtZW50LmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCIvVXNlcnMvbGluZTAvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL25vZGVfbW9kdWxlcy9sb2dsZXZlbC9saWIvbG9nbGV2ZWwuanMiLCIvVXNlcnMvbGluZTAvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL2NvbnRyb2xzLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9lbWJlZC5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvZmFrZV81ZDQ3ZWJmNC5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbG9nZ2luZy5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9jaGFwdGVyLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL2Rvd25sb2Fkcy5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvbW9kdWxlcy9pbmZvLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL3Byb2dyZXNzYmFyLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL3NhdmV0aW1lLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9tb2R1bGVzL3NoYXJlLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy9wbGF5ZXIuanMiLCIvVXNlcnMvbGluZTAvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3NvY2lhbC1idXR0b24tbGlzdC5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvc29jaWFsLW5ldHdvcmsuanMiLCIvVXNlcnMvbGluZTAvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3NvY2lhbC1uZXR3b3Jrcy5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvdGFiLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy90YWJyZWdpc3RyeS5qcyIsIi9Vc2Vycy9saW5lMC9Qcm9qZWN0cy9Qb2Rsb3ZlL3BvZGxvdmUtd2ViLXBsYXllci9zcmMvanMvdGltZWNvZGUuanMiLCIvVXNlcnMvbGluZTAvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3RpbWVsaW5lLmpzIiwiL1VzZXJzL2xpbmUwL1Byb2plY3RzL1BvZGxvdmUvcG9kbG92ZS13ZWItcGxheWVyL3NyYy9qcy91cmwuanMiLCIvVXNlcnMvbGluZTAvUHJvamVjdHMvUG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvc3JjL2pzL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3M0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICpcbiAqIE1lZGlhRWxlbWVudC5qc1xuICogSFRNTDUgPHZpZGVvPiBhbmQgPGF1ZGlvPiBzaGltIGFuZCBwbGF5ZXJcbiAqIGh0dHA6Ly9tZWRpYWVsZW1lbnRqcy5jb20vXG4gKlxuICogQ3JlYXRlcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRoYXQgbWltaWNzIEhUTUw1IE1lZGlhRWxlbWVudCBBUElcbiAqIGZvciBicm93c2VycyB0aGF0IGRvbid0IHVuZGVyc3RhbmQgSFRNTDUgb3IgY2FuJ3QgcGxheSB0aGUgcHJvdmlkZWQgY29kZWNcbiAqIENhbiBwbGF5IE1QNCAoSC4yNjQpLCBPZ2csIFdlYk0sIEZMViwgV01WLCBXTUEsIEFDQywgYW5kIE1QM1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQsIEpvaG4gRHllciAoaHR0cDovL2ouaG4pXG4gKiBMaWNlbnNlOiBNSVRcbiAqXG4gKi9cbi8vIE5hbWVzcGFjZVxudmFyIG1lanMgPSBtZWpzIHx8IHt9O1xuXG4vLyB2ZXJzaW9uIG51bWJlclxubWVqcy52ZXJzaW9uID0gJzIuMTYuNCc7IFxuXG5cbi8vIHBsYXllciBudW1iZXIgKGZvciBtaXNzaW5nLCBzYW1lIGlkIGF0dHIpXG5tZWpzLm1lSW5kZXggPSAwO1xuXG4vLyBtZWRpYSB0eXBlcyBhY2NlcHRlZCBieSBwbHVnaW5zXG5tZWpzLnBsdWdpbnMgPSB7XG5cdHNpbHZlcmxpZ2h0OiBbXG5cdFx0e3ZlcnNpb246IFszLDBdLCB0eXBlczogWyd2aWRlby9tcDQnLCd2aWRlby9tNHYnLCd2aWRlby9tb3YnLCd2aWRlby93bXYnLCdhdWRpby93bWEnLCdhdWRpby9tNGEnLCdhdWRpby9tcDMnLCdhdWRpby93YXYnLCdhdWRpby9tcGVnJ119XG5cdF0sXG5cdGZsYXNoOiBbXG5cdFx0e3ZlcnNpb246IFs5LDAsMTI0XSwgdHlwZXM6IFsndmlkZW8vbXA0JywndmlkZW8vbTR2JywndmlkZW8vbW92JywndmlkZW8vZmx2JywndmlkZW8vcnRtcCcsJ3ZpZGVvL3gtZmx2JywnYXVkaW8vZmx2JywnYXVkaW8veC1mbHYnLCdhdWRpby9tcDMnLCdhdWRpby9tNGEnLCdhdWRpby9tcGVnJywgJ3ZpZGVvL3lvdXR1YmUnLCAndmlkZW8veC15b3V0dWJlJywgJ2FwcGxpY2F0aW9uL3gtbXBlZ1VSTCddfVxuXHRcdC8vLHt2ZXJzaW9uOiBbMTIsMF0sIHR5cGVzOiBbJ3ZpZGVvL3dlYm0nXX0gLy8gZm9yIGZ1dHVyZSByZWZlcmVuY2UgKGhvcGVmdWxseSEpXG5cdF0sXG5cdHlvdXR1YmU6IFtcblx0XHR7dmVyc2lvbjogbnVsbCwgdHlwZXM6IFsndmlkZW8veW91dHViZScsICd2aWRlby94LXlvdXR1YmUnLCAnYXVkaW8veW91dHViZScsICdhdWRpby94LXlvdXR1YmUnXX1cblx0XSxcblx0dmltZW86IFtcblx0XHR7dmVyc2lvbjogbnVsbCwgdHlwZXM6IFsndmlkZW8vdmltZW8nLCAndmlkZW8veC12aW1lbyddfVxuXHRdXG59O1xuXG4vKlxuVXRpbGl0eSBtZXRob2RzXG4qL1xubWVqcy5VdGlsaXR5ID0ge1xuXHRlbmNvZGVVcmw6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodXJsKTsgLy8ucmVwbGFjZSgvXFw/L2dpLCclM0YnKS5yZXBsYWNlKC89L2dpLCclM0QnKS5yZXBsYWNlKC8mL2dpLCclMjYnKTtcblx0fSxcblx0ZXNjYXBlSFRNTDogZnVuY3Rpb24ocykge1xuXHRcdHJldHVybiBzLnRvU3RyaW5nKCkuc3BsaXQoJyYnKS5qb2luKCcmYW1wOycpLnNwbGl0KCc8Jykuam9pbignJmx0OycpLnNwbGl0KCdcIicpLmpvaW4oJyZxdW90OycpO1xuXHR9LFxuXHRhYnNvbHV0aXplVXJsOiBmdW5jdGlvbih1cmwpIHtcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRlbC5pbm5lckhUTUwgPSAnPGEgaHJlZj1cIicgKyB0aGlzLmVzY2FwZUhUTUwodXJsKSArICdcIj54PC9hPic7XG5cdFx0cmV0dXJuIGVsLmZpcnN0Q2hpbGQuaHJlZjtcblx0fSxcblx0Z2V0U2NyaXB0UGF0aDogZnVuY3Rpb24oc2NyaXB0TmFtZXMpIHtcblx0XHR2YXJcblx0XHRcdGkgPSAwLFxuXHRcdFx0aixcblx0XHRcdGNvZGVQYXRoID0gJycsXG5cdFx0XHR0ZXN0bmFtZSA9ICcnLFxuXHRcdFx0c2xhc2hQb3MsXG5cdFx0XHRmaWxlbmFtZVBvcyxcblx0XHRcdHNjcmlwdFVybCxcblx0XHRcdHNjcmlwdFBhdGgsXHRcdFx0XG5cdFx0XHRzY3JpcHRGaWxlbmFtZSxcblx0XHRcdHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksXG5cdFx0XHRpbCA9IHNjcmlwdHMubGVuZ3RoLFxuXHRcdFx0amwgPSBzY3JpcHROYW1lcy5sZW5ndGg7XG5cdFx0XHRcblx0XHQvLyBnbyB0aHJvdWdoIGFsbCA8c2NyaXB0PiB0YWdzXG5cdFx0Zm9yICg7IGkgPCBpbDsgaSsrKSB7XG5cdFx0XHRzY3JpcHRVcmwgPSBzY3JpcHRzW2ldLnNyYztcblx0XHRcdHNsYXNoUG9zID0gc2NyaXB0VXJsLmxhc3RJbmRleE9mKCcvJyk7XG5cdFx0XHRpZiAoc2xhc2hQb3MgPiAtMSkge1xuXHRcdFx0XHRzY3JpcHRGaWxlbmFtZSA9IHNjcmlwdFVybC5zdWJzdHJpbmcoc2xhc2hQb3MgKyAxKTtcblx0XHRcdFx0c2NyaXB0UGF0aCA9IHNjcmlwdFVybC5zdWJzdHJpbmcoMCwgc2xhc2hQb3MgKyAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNjcmlwdEZpbGVuYW1lID0gc2NyaXB0VXJsO1xuXHRcdFx0XHRzY3JpcHRQYXRoID0gJyc7XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIHNlZSBpZiBhbnkgPHNjcmlwdD4gdGFncyBoYXZlIGEgZmlsZSBuYW1lIHRoYXQgbWF0Y2hlcyB0aGUgXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgamw7IGorKykge1xuXHRcdFx0XHR0ZXN0bmFtZSA9IHNjcmlwdE5hbWVzW2pdO1xuXHRcdFx0XHRmaWxlbmFtZVBvcyA9IHNjcmlwdEZpbGVuYW1lLmluZGV4T2YodGVzdG5hbWUpO1xuXHRcdFx0XHRpZiAoZmlsZW5hbWVQb3MgPiAtMSkge1xuXHRcdFx0XHRcdGNvZGVQYXRoID0gc2NyaXB0UGF0aDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBpZiB3ZSBmb3VuZCBhIHBhdGgsIHRoZW4gYnJlYWsgYW5kIHJldHVybiBpdFxuXHRcdFx0aWYgKGNvZGVQYXRoICE9PSAnJykge1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gc2VuZCB0aGUgYmVzdCBwYXRoIGJhY2tcblx0XHRyZXR1cm4gY29kZVBhdGg7XG5cdH0sXG5cdHNlY29uZHNUb1RpbWVDb2RlOiBmdW5jdGlvbih0aW1lLCBmb3JjZUhvdXJzLCBzaG93RnJhbWVDb3VudCwgZnBzKSB7XG5cdFx0Ly9hZGQgZnJhbWVjb3VudFxuXHRcdGlmICh0eXBlb2Ygc2hvd0ZyYW1lQ291bnQgPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQgICAgc2hvd0ZyYW1lQ291bnQ9ZmFsc2U7XG5cdFx0fSBlbHNlIGlmKHR5cGVvZiBmcHMgPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQgICAgZnBzID0gMjU7XG5cdFx0fVxuXHRcblx0XHR2YXIgaG91cnMgPSBNYXRoLmZsb29yKHRpbWUgLyAzNjAwKSAlIDI0LFxuXHRcdFx0bWludXRlcyA9IE1hdGguZmxvb3IodGltZSAvIDYwKSAlIDYwLFxuXHRcdFx0c2Vjb25kcyA9IE1hdGguZmxvb3IodGltZSAlIDYwKSxcblx0XHRcdGZyYW1lcyA9IE1hdGguZmxvb3IoKCh0aW1lICUgMSkqZnBzKS50b0ZpeGVkKDMpKSxcblx0XHRcdHJlc3VsdCA9IFxuXHRcdFx0XHRcdCggKGZvcmNlSG91cnMgfHwgaG91cnMgPiAwKSA/IChob3VycyA8IDEwID8gJzAnICsgaG91cnMgOiBob3VycykgKyAnOicgOiAnJylcblx0XHRcdFx0XHRcdCsgKG1pbnV0ZXMgPCAxMCA/ICcwJyArIG1pbnV0ZXMgOiBtaW51dGVzKSArICc6J1xuXHRcdFx0XHRcdFx0KyAoc2Vjb25kcyA8IDEwID8gJzAnICsgc2Vjb25kcyA6IHNlY29uZHMpXG5cdFx0XHRcdFx0XHQrICgoc2hvd0ZyYW1lQ291bnQpID8gJzonICsgKGZyYW1lcyA8IDEwID8gJzAnICsgZnJhbWVzIDogZnJhbWVzKSA6ICcnKTtcblx0XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0XG5cdHRpbWVDb2RlVG9TZWNvbmRzOiBmdW5jdGlvbihoaF9tbV9zc19mZiwgZm9yY2VIb3Vycywgc2hvd0ZyYW1lQ291bnQsIGZwcyl7XG5cdFx0aWYgKHR5cGVvZiBzaG93RnJhbWVDb3VudCA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBzaG93RnJhbWVDb3VudD1mYWxzZTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZwcyA9PSAndW5kZWZpbmVkJykge1xuXHRcdCAgICBmcHMgPSAyNTtcblx0XHR9XG5cdFxuXHRcdHZhciB0Y19hcnJheSA9IGhoX21tX3NzX2ZmLnNwbGl0KFwiOlwiKSxcblx0XHRcdHRjX2hoID0gcGFyc2VJbnQodGNfYXJyYXlbMF0sIDEwKSxcblx0XHRcdHRjX21tID0gcGFyc2VJbnQodGNfYXJyYXlbMV0sIDEwKSxcblx0XHRcdHRjX3NzID0gcGFyc2VJbnQodGNfYXJyYXlbMl0sIDEwKSxcblx0XHRcdHRjX2ZmID0gMCxcblx0XHRcdHRjX2luX3NlY29uZHMgPSAwO1xuXHRcdFxuXHRcdGlmIChzaG93RnJhbWVDb3VudCkge1xuXHRcdCAgICB0Y19mZiA9IHBhcnNlSW50KHRjX2FycmF5WzNdKS9mcHM7XG5cdFx0fVxuXHRcdFxuXHRcdHRjX2luX3NlY29uZHMgPSAoIHRjX2hoICogMzYwMCApICsgKCB0Y19tbSAqIDYwICkgKyB0Y19zcyArIHRjX2ZmO1xuXHRcdFxuXHRcdHJldHVybiB0Y19pbl9zZWNvbmRzO1xuXHR9LFxuXHRcblxuXHRjb252ZXJ0U01QVEV0b1NlY29uZHM6IGZ1bmN0aW9uIChTTVBURSkge1xuXHRcdGlmICh0eXBlb2YgU01QVEUgIT0gJ3N0cmluZycpIFxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0U01QVEUgPSBTTVBURS5yZXBsYWNlKCcsJywgJy4nKTtcblx0XHRcblx0XHR2YXIgc2VjcyA9IDAsXG5cdFx0XHRkZWNpbWFsTGVuID0gKFNNUFRFLmluZGV4T2YoJy4nKSAhPSAtMSkgPyBTTVBURS5zcGxpdCgnLicpWzFdLmxlbmd0aCA6IDAsXG5cdFx0XHRtdWx0aXBsaWVyID0gMTtcblx0XHRcblx0XHRTTVBURSA9IFNNUFRFLnNwbGl0KCc6JykucmV2ZXJzZSgpO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgU01QVEUubGVuZ3RoOyBpKyspIHtcblx0XHRcdG11bHRpcGxpZXIgPSAxO1xuXHRcdFx0aWYgKGkgPiAwKSB7XG5cdFx0XHRcdG11bHRpcGxpZXIgPSBNYXRoLnBvdyg2MCwgaSk7IFxuXHRcdFx0fVxuXHRcdFx0c2VjcyArPSBOdW1iZXIoU01QVEVbaV0pICogbXVsdGlwbGllcjtcblx0XHR9XG5cdFx0cmV0dXJuIE51bWJlcihzZWNzLnRvRml4ZWQoZGVjaW1hbExlbikpO1xuXHR9LFx0XG5cdFxuXHQvKiBib3Jyb3dlZCBmcm9tIFNXRk9iamVjdDogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3N3Zm9iamVjdC9zb3VyY2UvYnJvd3NlL3RydW5rL3N3Zm9iamVjdC9zcmMvc3dmb2JqZWN0LmpzIzQ3NCAqL1xuXHRyZW1vdmVTd2Y6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIG9iaiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblx0XHRpZiAob2JqICYmIC9vYmplY3R8ZW1iZWQvaS50ZXN0KG9iai5ub2RlTmFtZSkpIHtcblx0XHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNJRSkge1xuXHRcdFx0XHRvYmouc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHRcdFx0XHQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZiAob2JqLnJlYWR5U3RhdGUgPT0gNCkge1xuXHRcdFx0XHRcdFx0bWVqcy5VdGlsaXR5LnJlbW92ZU9iamVjdEluSUUoaWQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsIDEwKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvYmoucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvYmopO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cmVtb3ZlT2JqZWN0SW5JRTogZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgb2JqID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXHRcdGlmIChvYmopIHtcblx0XHRcdGZvciAodmFyIGkgaW4gb2JqKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygb2JqW2ldID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdG9ialtpXSA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9iai5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9iaik7XG5cdFx0fVx0XHRcblx0fVxufTtcblxuXG4vLyBDb3JlIGRldGVjdG9yLCBwbHVnaW5zIGFyZSBhZGRlZCBiZWxvd1xubWVqcy5QbHVnaW5EZXRlY3RvciA9IHtcblxuXHQvLyBtYWluIHB1YmxpYyBmdW5jdGlvbiB0byB0ZXN0IGEgcGx1ZyB2ZXJzaW9uIG51bWJlciBQbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKCdmbGFzaCcsWzksMCwxMjVdKTtcblx0aGFzUGx1Z2luVmVyc2lvbjogZnVuY3Rpb24ocGx1Z2luLCB2KSB7XG5cdFx0dmFyIHB2ID0gdGhpcy5wbHVnaW5zW3BsdWdpbl07XG5cdFx0dlsxXSA9IHZbMV0gfHwgMDtcblx0XHR2WzJdID0gdlsyXSB8fCAwO1xuXHRcdHJldHVybiAocHZbMF0gPiB2WzBdIHx8IChwdlswXSA9PSB2WzBdICYmIHB2WzFdID4gdlsxXSkgfHwgKHB2WzBdID09IHZbMF0gJiYgcHZbMV0gPT0gdlsxXSAmJiBwdlsyXSA+PSB2WzJdKSkgPyB0cnVlIDogZmFsc2U7XG5cdH0sXG5cblx0Ly8gY2FjaGVkIHZhbHVlc1xuXHRuYXY6IHdpbmRvdy5uYXZpZ2F0b3IsXG5cdHVhOiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFxuXG5cdC8vIHN0b3JlZCB2ZXJzaW9uIG51bWJlcnNcblx0cGx1Z2luczogW10sXG5cblx0Ly8gcnVucyBkZXRlY3RQbHVnaW4oKSBhbmQgc3RvcmVzIHRoZSB2ZXJzaW9uIG51bWJlclxuXHRhZGRQbHVnaW46IGZ1bmN0aW9uKHAsIHBsdWdpbk5hbWUsIG1pbWVUeXBlLCBhY3RpdmVYLCBheERldGVjdCkge1xuXHRcdHRoaXMucGx1Z2luc1twXSA9IHRoaXMuZGV0ZWN0UGx1Z2luKHBsdWdpbk5hbWUsIG1pbWVUeXBlLCBhY3RpdmVYLCBheERldGVjdCk7XG5cdH0sXG5cblx0Ly8gZ2V0IHRoZSB2ZXJzaW9uIG51bWJlciBmcm9tIHRoZSBtaW1ldHlwZSAoYWxsIGJ1dCBJRSkgb3IgQWN0aXZlWCAoSUUpXG5cdGRldGVjdFBsdWdpbjogZnVuY3Rpb24ocGx1Z2luTmFtZSwgbWltZVR5cGUsIGFjdGl2ZVgsIGF4RGV0ZWN0KSB7XG5cblx0XHR2YXIgdmVyc2lvbiA9IFswLDAsMF0sXG5cdFx0XHRkZXNjcmlwdGlvbixcblx0XHRcdGksXG5cdFx0XHRheDtcblxuXHRcdC8vIEZpcmVmb3gsIFdlYmtpdCwgT3BlcmFcblx0XHRpZiAodHlwZW9mKHRoaXMubmF2LnBsdWdpbnMpICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLm5hdi5wbHVnaW5zW3BsdWdpbk5hbWVdID09ICdvYmplY3QnKSB7XG5cdFx0XHRkZXNjcmlwdGlvbiA9IHRoaXMubmF2LnBsdWdpbnNbcGx1Z2luTmFtZV0uZGVzY3JpcHRpb247XG5cdFx0XHRpZiAoZGVzY3JpcHRpb24gJiYgISh0eXBlb2YgdGhpcy5uYXYubWltZVR5cGVzICE9ICd1bmRlZmluZWQnICYmIHRoaXMubmF2Lm1pbWVUeXBlc1ttaW1lVHlwZV0gJiYgIXRoaXMubmF2Lm1pbWVUeXBlc1ttaW1lVHlwZV0uZW5hYmxlZFBsdWdpbikpIHtcblx0XHRcdFx0dmVyc2lvbiA9IGRlc2NyaXB0aW9uLnJlcGxhY2UocGx1Z2luTmFtZSwgJycpLnJlcGxhY2UoL15cXHMrLywnJykucmVwbGFjZSgvXFxzci9naSwnLicpLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGZvciAoaT0wOyBpPHZlcnNpb24ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2ZXJzaW9uW2ldID0gcGFyc2VJbnQodmVyc2lvbltpXS5tYXRjaCgvXFxkKy8pLCAxMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHQvLyBJbnRlcm5ldCBFeHBsb3JlciAvIEFjdGl2ZVhcblx0XHR9IGVsc2UgaWYgKHR5cGVvZih3aW5kb3cuQWN0aXZlWE9iamVjdCkgIT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF4ID0gbmV3IEFjdGl2ZVhPYmplY3QoYWN0aXZlWCk7XG5cdFx0XHRcdGlmIChheCkge1xuXHRcdFx0XHRcdHZlcnNpb24gPSBheERldGVjdChheCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKSB7IH1cblx0XHR9XG5cdFx0cmV0dXJuIHZlcnNpb247XG5cdH1cbn07XG5cbi8vIEFkZCBGbGFzaCBkZXRlY3Rpb25cbm1lanMuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdmbGFzaCcsJ1Nob2Nrd2F2ZSBGbGFzaCcsJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJywnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnLCBmdW5jdGlvbihheCkge1xuXHQvLyBhZGFwdGVkIGZyb20gU1dGT2JqZWN0XG5cdHZhciB2ZXJzaW9uID0gW10sXG5cdFx0ZCA9IGF4LkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7XG5cdGlmIChkKSB7XG5cdFx0ZCA9IGQuc3BsaXQoXCIgXCIpWzFdLnNwbGl0KFwiLFwiKTtcblx0XHR2ZXJzaW9uID0gW3BhcnNlSW50KGRbMF0sIDEwKSwgcGFyc2VJbnQoZFsxXSwgMTApLCBwYXJzZUludChkWzJdLCAxMCldO1xuXHR9XG5cdHJldHVybiB2ZXJzaW9uO1xufSk7XG5cbi8vIEFkZCBTaWx2ZXJsaWdodCBkZXRlY3Rpb25cbm1lanMuUGx1Z2luRGV0ZWN0b3IuYWRkUGx1Z2luKCdzaWx2ZXJsaWdodCcsJ1NpbHZlcmxpZ2h0IFBsdWctSW4nLCdhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LTInLCdBZ0NvbnRyb2wuQWdDb250cm9sJywgZnVuY3Rpb24gKGF4KSB7XG5cdC8vIFNpbHZlcmxpZ2h0IGNhbm5vdCByZXBvcnQgaXRzIHZlcnNpb24gbnVtYmVyIHRvIElFXG5cdC8vIGJ1dCBpdCBkb2VzIGhhdmUgYSBpc1ZlcnNpb25TdXBwb3J0ZWQgZnVuY3Rpb24sIHNvIHdlIGhhdmUgdG8gbG9vcCB0aHJvdWdoIGl0IHRvIGdldCBhIHZlcnNpb24gbnVtYmVyLlxuXHQvLyBhZGFwdGVkIGZyb20gaHR0cDovL3d3dy5zaWx2ZXJsaWdodHZlcnNpb24uY29tL1xuXHR2YXIgdiA9IFswLDAsMCwwXSxcblx0XHRsb29wTWF0Y2ggPSBmdW5jdGlvbihheCwgdiwgaSwgbikge1xuXHRcdFx0d2hpbGUoYXguaXNWZXJzaW9uU3VwcG9ydGVkKHZbMF0rIFwiLlwiKyB2WzFdICsgXCIuXCIgKyB2WzJdICsgXCIuXCIgKyB2WzNdKSl7XG5cdFx0XHRcdHZbaV0rPW47XG5cdFx0XHR9XG5cdFx0XHR2W2ldIC09IG47XG5cdFx0fTtcblx0bG9vcE1hdGNoKGF4LCB2LCAwLCAxKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAxLCAxKTtcblx0bG9vcE1hdGNoKGF4LCB2LCAyLCAxMDAwMCk7IC8vIHRoZSB0aGlyZCBwbGFjZSBpbiB0aGUgdmVyc2lvbiBudW1iZXIgaXMgdXN1YWxseSA1IGRpZ2l0cyAoNC4wLnh4eHh4KVxuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMDApO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEwMCk7XG5cdGxvb3BNYXRjaChheCwgdiwgMiwgMTApO1xuXHRsb29wTWF0Y2goYXgsIHYsIDIsIDEpO1xuXHRsb29wTWF0Y2goYXgsIHYsIDMsIDEpO1xuXG5cdHJldHVybiB2O1xufSk7XG4vLyBhZGQgYWRvYmUgYWNyb2JhdFxuLypcblBsdWdpbkRldGVjdG9yLmFkZFBsdWdpbignYWNyb2JhdCcsJ0Fkb2JlIEFjcm9iYXQnLCdhcHBsaWNhdGlvbi9wZGYnLCdBY3JvUERGLlBERicsIGZ1bmN0aW9uIChheCkge1xuXHR2YXIgdmVyc2lvbiA9IFtdLFxuXHRcdGQgPSBheC5HZXRWZXJzaW9ucygpLnNwbGl0KCcsJylbMF0uc3BsaXQoJz0nKVsxXS5zcGxpdCgnLicpO1xuXG5cdGlmIChkKSB7XG5cdFx0dmVyc2lvbiA9IFtwYXJzZUludChkWzBdLCAxMCksIHBhcnNlSW50KGRbMV0sIDEwKSwgcGFyc2VJbnQoZFsyXSwgMTApXTtcblx0fVxuXHRyZXR1cm4gdmVyc2lvbjtcbn0pO1xuKi9cbi8vIG5lY2Vzc2FyeSBkZXRlY3Rpb24gKGZpeGVzIGZvciA8SUU5KVxubWVqcy5NZWRpYUZlYXR1cmVzID0ge1xuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHR2YXJcblx0XHRcdHQgPSB0aGlzLFxuXHRcdFx0ZCA9IGRvY3VtZW50LFxuXHRcdFx0bmF2ID0gbWVqcy5QbHVnaW5EZXRlY3Rvci5uYXYsXG5cdFx0XHR1YSA9IG1lanMuUGx1Z2luRGV0ZWN0b3IudWEudG9Mb3dlckNhc2UoKSxcblx0XHRcdGksXG5cdFx0XHR2LFxuXHRcdFx0aHRtbDVFbGVtZW50cyA9IFsnc291cmNlJywndHJhY2snLCdhdWRpbycsJ3ZpZGVvJ107XG5cblx0XHQvLyBkZXRlY3QgYnJvd3NlcnMgKG9ubHkgdGhlIG9uZXMgdGhhdCBoYXZlIHNvbWUga2luZCBvZiBxdWlyayB3ZSBuZWVkIHRvIHdvcmsgYXJvdW5kKVxuXHRcdHQuaXNpUGFkID0gKHVhLm1hdGNoKC9pcGFkL2kpICE9PSBudWxsKTtcblx0XHR0LmlzaVBob25lID0gKHVhLm1hdGNoKC9pcGhvbmUvaSkgIT09IG51bGwpO1xuXHRcdHQuaXNpT1MgPSB0LmlzaVBob25lIHx8IHQuaXNpUGFkO1xuXHRcdHQuaXNBbmRyb2lkID0gKHVhLm1hdGNoKC9hbmRyb2lkL2kpICE9PSBudWxsKTtcblx0XHR0LmlzQnVzdGVkQW5kcm9pZCA9ICh1YS5tYXRjaCgvYW5kcm9pZCAyXFwuWzEyXS8pICE9PSBudWxsKTtcblx0XHR0LmlzQnVzdGVkTmF0aXZlSFRUUFMgPSAobG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonICYmICh1YS5tYXRjaCgvYW5kcm9pZCBbMTJdXFwuLykgIT09IG51bGwgfHwgdWEubWF0Y2goL21hY2ludG9zaC4qIHZlcnNpb24uKiBzYWZhcmkvKSAhPT0gbnVsbCkpO1xuXHRcdHQuaXNJRSA9IChuYXYuYXBwTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJtaWNyb3NvZnRcIikgIT0gLTEgfHwgbmF2LmFwcE5hbWUudG9Mb3dlckNhc2UoKS5tYXRjaCgvdHJpZGVudC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNDaHJvbWUgPSAodWEubWF0Y2goL2Nocm9tZS9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNDaHJvbWl1bSA9ICh1YS5tYXRjaCgvY2hyb21pdW0vZ2kpICE9PSBudWxsKTtcblx0XHR0LmlzRmlyZWZveCA9ICh1YS5tYXRjaCgvZmlyZWZveC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNXZWJraXQgPSAodWEubWF0Y2goL3dlYmtpdC9naSkgIT09IG51bGwpO1xuXHRcdHQuaXNHZWNrbyA9ICh1YS5tYXRjaCgvZ2Vja28vZ2kpICE9PSBudWxsKSAmJiAhdC5pc1dlYmtpdCAmJiAhdC5pc0lFO1xuXHRcdHQuaXNPcGVyYSA9ICh1YS5tYXRjaCgvb3BlcmEvZ2kpICE9PSBudWxsKTtcblx0XHR0Lmhhc1RvdWNoID0gKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyk7IC8vICAmJiB3aW5kb3cub250b3VjaHN0YXJ0ICE9IG51bGwpOyAvLyB0aGlzIGJyZWFrcyBpT1MgN1xuXHRcdFxuXHRcdC8vIGJvcnJvd2VkIGZyb20gTW9kZXJuaXpyXG5cdFx0dC5zdmcgPSAhISBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiZcblx0XHRcdFx0ISEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3N2ZycpLmNyZWF0ZVNWR1JlY3Q7XG5cblx0XHQvLyBjcmVhdGUgSFRNTDUgbWVkaWEgZWxlbWVudHMgZm9yIElFIGJlZm9yZSA5LCBnZXQgYSA8dmlkZW8+IGVsZW1lbnQgZm9yIGZ1bGxzY3JlZW4gZGV0ZWN0aW9uXG5cdFx0Zm9yIChpPTA7IGk8aHRtbDVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0diA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaHRtbDVFbGVtZW50c1tpXSk7XG5cdFx0fVxuXHRcdFxuXHRcdHQuc3VwcG9ydHNNZWRpYVRhZyA9ICh0eXBlb2Ygdi5jYW5QbGF5VHlwZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdC5pc0J1c3RlZEFuZHJvaWQpO1xuXG5cdFx0Ly8gRml4IGZvciBJRTkgb24gV2luZG93cyA3TiAvIFdpbmRvd3MgN0tOIChNZWRpYSBQbGF5ZXIgbm90IGluc3RhbGxlcilcblx0XHR0cnl7XG5cdFx0XHR2LmNhblBsYXlUeXBlKFwidmlkZW8vbXA0XCIpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdHQuc3VwcG9ydHNNZWRpYVRhZyA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGRldGVjdCBuYXRpdmUgSmF2YVNjcmlwdCBmdWxsc2NyZWVuIChTYWZhcmkvRmlyZWZveCBvbmx5LCBDaHJvbWUgc3RpbGwgZmFpbHMpXG5cdFx0XG5cdFx0Ly8gaU9TXG5cdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi53ZWJraXRFbnRlckZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHQvLyBXM0Ncblx0XHR0Lmhhc05hdGl2ZUZ1bGxzY3JlZW4gPSAodHlwZW9mIHYucmVxdWVzdEZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHQvLyB3ZWJraXQvZmlyZWZveC9JRTExK1xuXHRcdHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbiA9ICh0eXBlb2Ygdi5tb3pSZXF1ZXN0RnVsbFNjcmVlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuXHRcdHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuID0gKHR5cGVvZiB2Lm1zUmVxdWVzdEZ1bGxzY3JlZW4gIT09ICd1bmRlZmluZWQnKTtcblx0XHRcblx0XHR0Lmhhc1RydWVOYXRpdmVGdWxsU2NyZWVuID0gKHQuaGFzV2Via2l0TmF0aXZlRnVsbFNjcmVlbiB8fCB0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4gfHwgdC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pO1xuXHRcdHQubmF0aXZlRnVsbFNjcmVlbkVuYWJsZWQgPSB0Lmhhc1RydWVOYXRpdmVGdWxsU2NyZWVuO1xuXHRcdFxuXHRcdC8vIEVuYWJsZWQ/XG5cdFx0aWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0dC5uYXRpdmVGdWxsU2NyZWVuRW5hYmxlZCA9IGRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbmFibGVkO1xuXHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdHQubmF0aXZlRnVsbFNjcmVlbkVuYWJsZWQgPSBkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbmFibGVkO1x0XHRcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHQuaXNDaHJvbWUpIHtcblx0XHRcdHQuaGFzU2VtaU5hdGl2ZUZ1bGxTY3JlZW4gPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHQuaGFzVHJ1ZU5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFxuXHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJyc7XG5cdFx0XHRpZiAodC5oYXNXZWJraXROYXRpdmVGdWxsU2NyZWVuKSB7IFxuXHRcdFx0XHR0LmZ1bGxTY3JlZW5FdmVudE5hbWUgPSAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSc7XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJ21vemZ1bGxzY3JlZW5jaGFuZ2UnO1xuXHRcdFx0XHRcblx0XHRcdH0gZWxzZSBpZiAodC5oYXNNc05hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0dC5mdWxsU2NyZWVuRXZlbnROYW1lID0gJ01TRnVsbHNjcmVlbkNoYW5nZSc7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHQuaXNGdWxsU2NyZWVuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0Lmhhc01vek5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC5tb3pGdWxsU2NyZWVuO1xuXHRcdFx0XHRcblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRyZXR1cm4gZC53ZWJraXRJc0Z1bGxTY3JlZW47XG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGQubXNGdWxsc2NyZWVuRWxlbWVudCAhPT0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0dC5yZXF1ZXN0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uKGVsKSB7XG5cdFx0XG5cdFx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRlbC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTW96TmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLm1velJlcXVlc3RGdWxsU2NyZWVuKCk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICh0Lmhhc01zTmF0aXZlRnVsbFNjcmVlbikge1xuXHRcdFx0XHRcdGVsLm1zUmVxdWVzdEZ1bGxzY3JlZW4oKTtcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHQuY2FuY2VsRnVsbFNjcmVlbiA9IGZ1bmN0aW9uKCkge1x0XHRcdFx0XG5cdFx0XHRcdGlmICh0Lmhhc1dlYmtpdE5hdGl2ZUZ1bGxTY3JlZW4pIHtcblx0XHRcdFx0XHRkb2N1bWVudC53ZWJraXRDYW5jZWxGdWxsU2NyZWVuKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZiAodC5oYXNNb3pOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHQuaGFzTXNOYXRpdmVGdWxsU2NyZWVuKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XHRcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRcblx0XHQvLyBPUyBYIDEwLjUgY2FuJ3QgZG8gdGhpcyBldmVuIGlmIGl0IHNheXMgaXQgY2FuIDooXG5cdFx0aWYgKHQuaGFzU2VtaU5hdGl2ZUZ1bGxTY3JlZW4gJiYgdWEubWF0Y2goL21hYyBvcyB4IDEwXzUvaSkpIHtcblx0XHRcdHQuaGFzTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdFx0dC5oYXNTZW1pTmF0aXZlRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0fVxufTtcbm1lanMuTWVkaWFGZWF0dXJlcy5pbml0KCk7XG5cbi8qXG5leHRlbnNpb24gbWV0aG9kcyB0byA8dmlkZW8+IG9yIDxhdWRpbz4gb2JqZWN0IHRvIGJyaW5nIGl0IGludG8gcGFyaXR5IHdpdGggUGx1Z2luTWVkaWFFbGVtZW50IChzZWUgYmVsb3cpXG4qL1xubWVqcy5IdG1sTWVkaWFFbGVtZW50ID0ge1xuXHRwbHVnaW5UeXBlOiAnbmF0aXZlJyxcblx0aXNGdWxsU2NyZWVuOiBmYWxzZSxcblxuXHRzZXRDdXJyZW50VGltZTogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHR0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcblx0fSxcblxuXHRzZXRNdXRlZDogZnVuY3Rpb24gKG11dGVkKSB7XG5cdFx0dGhpcy5tdXRlZCA9IG11dGVkO1xuXHR9LFxuXG5cdHNldFZvbHVtZTogZnVuY3Rpb24gKHZvbHVtZSkge1xuXHRcdHRoaXMudm9sdW1lID0gdm9sdW1lO1xuXHR9LFxuXG5cdC8vIGZvciBwYXJpdHkgd2l0aCB0aGUgcGx1Z2luIHZlcnNpb25zXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnBhdXNlKCk7XG5cdH0sXG5cblx0Ly8gVGhpcyBjYW4gYmUgYSB1cmwgc3RyaW5nXG5cdC8vIG9yIGFuIGFycmF5IFt7c3JjOidmaWxlLm1wNCcsdHlwZTondmlkZW8vbXA0J30se3NyYzonZmlsZS53ZWJtJyx0eXBlOid2aWRlby93ZWJtJ31dXG5cdHNldFNyYzogZnVuY3Rpb24gKHVybCkge1xuXHRcdFxuXHRcdC8vIEZpeCBmb3IgSUU5IHdoaWNoIGNhbid0IHNldCAuc3JjIHdoZW4gdGhlcmUgYXJlIDxzb3VyY2U+IGVsZW1lbnRzLiBBd2Vzb21lLCByaWdodD9cblx0XHR2YXIgXG5cdFx0XHRleGlzdGluZ1NvdXJjZXMgPSB0aGlzLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKTtcblx0XHR3aGlsZSAoZXhpc3RpbmdTb3VyY2VzLmxlbmd0aCA+IDApe1xuXHRcdFx0dGhpcy5yZW1vdmVDaGlsZChleGlzdGluZ1NvdXJjZXNbMF0pO1xuXHRcdH1cblx0XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT0gJ3N0cmluZycpIHtcblx0XHRcdHRoaXMuc3JjID0gdXJsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaSwgbWVkaWE7XG5cblx0XHRcdGZvciAoaT0wOyBpPHVybC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRtZWRpYSA9IHVybFtpXTtcblx0XHRcdFx0aWYgKHRoaXMuY2FuUGxheVR5cGUobWVkaWEudHlwZSkpIHtcblx0XHRcdFx0XHR0aGlzLnNyYyA9IG1lZGlhLnNyYztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzZXRWaWRlb1NpemU6IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHR9XG59O1xuXG4vKlxuTWltaWNzIHRoZSA8dmlkZW8vYXVkaW8+IGVsZW1lbnQgYnkgY2FsbGluZyBGbGFzaCdzIEV4dGVybmFsIEludGVyZmFjZSBvciBTaWx2ZXJsaWdodHMgW1NjcmlwdGFibGVNZW1iZXJdXG4qL1xubWVqcy5QbHVnaW5NZWRpYUVsZW1lbnQgPSBmdW5jdGlvbiAocGx1Z2luaWQsIHBsdWdpblR5cGUsIG1lZGlhVXJsKSB7XG5cdHRoaXMuaWQgPSBwbHVnaW5pZDtcblx0dGhpcy5wbHVnaW5UeXBlID0gcGx1Z2luVHlwZTtcblx0dGhpcy5zcmMgPSBtZWRpYVVybDtcblx0dGhpcy5ldmVudHMgPSB7fTtcblx0dGhpcy5hdHRyaWJ1dGVzID0ge307XG59O1xuXG4vLyBKYXZhU2NyaXB0IHZhbHVlcyBhbmQgRXh0ZXJuYWxJbnRlcmZhY2UgbWV0aG9kcyB0aGF0IG1hdGNoIEhUTUw1IHZpZGVvIHByb3BlcnRpZXMgbWV0aG9kc1xuLy8gaHR0cDovL3d3dy5hZG9iZS5jb20vbGl2ZWRvY3MvZmxhc2gvOS4wL0FjdGlvblNjcmlwdExhbmdSZWZWMy9mbC92aWRlby9GTFZQbGF5YmFjay5odG1sXG4vLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS92aWRlby5odG1sXG5tZWpzLlBsdWdpbk1lZGlhRWxlbWVudC5wcm90b3R5cGUgPSB7XG5cblx0Ly8gc3BlY2lhbFxuXHRwbHVnaW5FbGVtZW50OiBudWxsLFxuXHRwbHVnaW5UeXBlOiAnJyxcblx0aXNGdWxsU2NyZWVuOiBmYWxzZSxcblxuXHQvLyBub3QgaW1wbGVtZW50ZWQgOihcblx0cGxheWJhY2tSYXRlOiAtMSxcblx0ZGVmYXVsdFBsYXliYWNrUmF0ZTogLTEsXG5cdHNlZWthYmxlOiBbXSxcblx0cGxheWVkOiBbXSxcblxuXHQvLyBIVE1MNSByZWFkLW9ubHkgcHJvcGVydGllc1xuXHRwYXVzZWQ6IHRydWUsXG5cdGVuZGVkOiBmYWxzZSxcblx0c2Vla2luZzogZmFsc2UsXG5cdGR1cmF0aW9uOiAwLFxuXHRlcnJvcjogbnVsbCxcblx0dGFnTmFtZTogJycsXG5cblx0Ly8gSFRNTDUgZ2V0L3NldCBwcm9wZXJ0aWVzLCBidXQgb25seSBzZXQgKHVwZGF0ZWQgYnkgZXZlbnQgaGFuZGxlcnMpXG5cdG11dGVkOiBmYWxzZSxcblx0dm9sdW1lOiAxLFxuXHRjdXJyZW50VGltZTogMCxcblxuXHQvLyBIVE1MNSBtZXRob2RzXG5cdHBsYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScgfHwgdGhpcy5wbHVnaW5UeXBlID09ICd2aW1lbycpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkucGxheVZpZGVvKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5wbGF5TWVkaWEoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucGF1c2VkID0gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRsb2FkOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnBsdWdpbkFwaS5sb2FkTWVkaWEoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy5wYXVzZWQgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdHBhdXNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBhdXNlVmlkZW8oKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnBhdXNlTWVkaWEoKTtcblx0XHRcdH1cdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHR0aGlzLnBhdXNlZCA9IHRydWU7XG5cdFx0fVxuXHR9LFxuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnN0b3BWaWRlbygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc3RvcE1lZGlhKCk7XG5cdFx0XHR9XHRcblx0XHRcdHRoaXMucGF1c2VkID0gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdGNhblBsYXlUeXBlOiBmdW5jdGlvbih0eXBlKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRqLFxuXHRcdFx0cGx1Z2luSW5mbyxcblx0XHRcdHBsdWdpblZlcnNpb25zID0gbWVqcy5wbHVnaW5zW3RoaXMucGx1Z2luVHlwZV07XG5cblx0XHRmb3IgKGk9MDsgaTxwbHVnaW5WZXJzaW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cGx1Z2luSW5mbyA9IHBsdWdpblZlcnNpb25zW2ldO1xuXG5cdFx0XHQvLyB0ZXN0IGlmIHVzZXIgaGFzIHRoZSBjb3JyZWN0IHBsdWdpbiB2ZXJzaW9uXG5cdFx0XHRpZiAobWVqcy5QbHVnaW5EZXRlY3Rvci5oYXNQbHVnaW5WZXJzaW9uKHRoaXMucGx1Z2luVHlwZSwgcGx1Z2luSW5mby52ZXJzaW9uKSkge1xuXG5cdFx0XHRcdC8vIHRlc3QgZm9yIHBsdWdpbiBwbGF5YmFjayB0eXBlc1xuXHRcdFx0XHRmb3IgKGo9MDsgajxwbHVnaW5JbmZvLnR5cGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0Ly8gZmluZCBwbHVnaW4gdGhhdCBjYW4gcGxheSB0aGUgdHlwZVxuXHRcdFx0XHRcdGlmICh0eXBlID09IHBsdWdpbkluZm8udHlwZXNbal0pIHtcblx0XHRcdFx0XHRcdHJldHVybiAncHJvYmFibHknO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAnJztcblx0fSxcblx0XG5cdHBvc2l0aW9uRnVsbHNjcmVlbkJ1dHRvbjogZnVuY3Rpb24oeCx5LHZpc2libGVBbmRBYm92ZSkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnBvc2l0aW9uRnVsbHNjcmVlbkJ1dHRvbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkucG9zaXRpb25GdWxsc2NyZWVuQnV0dG9uKE1hdGguZmxvb3IoeCksTWF0aC5mbG9vcih5KSx2aXNpYmxlQW5kQWJvdmUpO1xuXHRcdH1cblx0fSxcblx0XG5cdGhpZGVGdWxsc2NyZWVuQnV0dG9uOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5oaWRlRnVsbHNjcmVlbkJ1dHRvbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkuaGlkZUZ1bGxzY3JlZW5CdXR0b24oKTtcblx0XHR9XHRcdFxuXHR9LFx0XG5cdFxuXG5cdC8vIGN1c3RvbSBtZXRob2RzIHNpbmNlIG5vdCBhbGwgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbnMgc3VwcG9ydCBnZXQvc2V0XG5cblx0Ly8gVGhpcyBjYW4gYmUgYSB1cmwgc3RyaW5nXG5cdC8vIG9yIGFuIGFycmF5IFt7c3JjOidmaWxlLm1wNCcsdHlwZTondmlkZW8vbXA0J30se3NyYzonZmlsZS53ZWJtJyx0eXBlOid2aWRlby93ZWJtJ31dXG5cdHNldFNyYzogZnVuY3Rpb24gKHVybCkge1xuXHRcdGlmICh0eXBlb2YgdXJsID09ICdzdHJpbmcnKSB7XG5cdFx0XHR0aGlzLnBsdWdpbkFwaS5zZXRTcmMobWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwodXJsKSk7XG5cdFx0XHR0aGlzLnNyYyA9IG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKHVybCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpLCBtZWRpYTtcblxuXHRcdFx0Zm9yIChpPTA7IGk8dXJsLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG1lZGlhID0gdXJsW2ldO1xuXHRcdFx0XHRpZiAodGhpcy5jYW5QbGF5VHlwZShtZWRpYS50eXBlKSkge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFNyYyhtZWpzLlV0aWxpdHkuYWJzb2x1dGl6ZVVybChtZWRpYS5zcmMpKTtcblx0XHRcdFx0XHR0aGlzLnNyYyA9IG1lanMuVXRpbGl0eS5hYnNvbHV0aXplVXJsKHVybCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0fSxcblx0c2V0Q3VycmVudFRpbWU6IGZ1bmN0aW9uICh0aW1lKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnIHx8IHRoaXMucGx1Z2luVHlwZSA9PSAndmltZW8nKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNlZWtUbyh0aW1lKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldEN1cnJlbnRUaW1lKHRpbWUpO1xuXHRcdFx0fVx0XHRcdFx0XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHR0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcblx0XHR9XG5cdH0sXG5cdHNldFZvbHVtZTogZnVuY3Rpb24gKHZvbHVtZSkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsKSB7XG5cdFx0XHQvLyBzYW1lIG9uIFlvdVR1YmUgYW5kIE1FanNcblx0XHRcdGlmICh0aGlzLnBsdWdpblR5cGUgPT0gJ3lvdXR1YmUnKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldFZvbHVtZSh2b2x1bWUgKiAxMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0Vm9sdW1lKHZvbHVtZSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnZvbHVtZSA9IHZvbHVtZTtcblx0XHR9XG5cdH0sXG5cdHNldE11dGVkOiBmdW5jdGlvbiAobXV0ZWQpIHtcblx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMucGx1Z2luVHlwZSA9PSAneW91dHViZScpIHtcblx0XHRcdFx0aWYgKG11dGVkKSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5BcGkubXV0ZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luQXBpLnVuTXV0ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubXV0ZWQgPSBtdXRlZDtcblx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KCd2b2x1bWVjaGFuZ2UnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luQXBpLnNldE11dGVkKG11dGVkKTtcblx0XHRcdH1cblx0XHRcdHRoaXMubXV0ZWQgPSBtdXRlZDtcblx0XHR9XG5cdH0sXG5cblx0Ly8gYWRkaXRpb25hbCBub24tSFRNTDUgbWV0aG9kc1xuXHRzZXRWaWRlb1NpemU6IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0XG5cdFx0Ly9pZiAodGhpcy5wbHVnaW5UeXBlID09ICdmbGFzaCcgfHwgdGhpcy5wbHVnaW5UeXBlID09ICdzaWx2ZXJsaWdodCcpIHtcblx0XHRcdGlmICh0aGlzLnBsdWdpbkVsZW1lbnQgJiYgdGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlKSB7XG5cdFx0XHRcdHRoaXMucGx1Z2luRWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5wbHVnaW5FbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5wbHVnaW5BcGkgIT0gbnVsbCAmJiB0aGlzLnBsdWdpbkFwaS5zZXRWaWRlb1NpemUpIHtcblx0XHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0VmlkZW9TaXplKHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0fVxuXHRcdC8vfVxuXHR9LFxuXG5cdHNldEZ1bGxzY3JlZW46IGZ1bmN0aW9uIChmdWxsc2NyZWVuKSB7XG5cdFx0aWYgKHRoaXMucGx1Z2luQXBpICE9IG51bGwgJiYgdGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbikge1xuXHRcdFx0dGhpcy5wbHVnaW5BcGkuc2V0RnVsbHNjcmVlbihmdWxsc2NyZWVuKTtcblx0XHR9XG5cdH0sXG5cdFxuXHRlbnRlckZ1bGxTY3JlZW46IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldEZ1bGxzY3JlZW4pIHtcblx0XHRcdHRoaXMuc2V0RnVsbHNjcmVlbih0cnVlKTtcblx0XHR9XHRcdFxuXHRcdFxuXHR9LFxuXHRcblx0ZXhpdEZ1bGxTY3JlZW46IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnBsdWdpbkFwaSAhPSBudWxsICYmIHRoaXMucGx1Z2luQXBpLnNldEZ1bGxzY3JlZW4pIHtcblx0XHRcdHRoaXMuc2V0RnVsbHNjcmVlbihmYWxzZSk7XG5cdFx0fVxuXHR9LFx0XG5cblx0Ly8gc3RhcnQ6IGZha2UgZXZlbnRzXG5cdGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrLCBidWJibGUpIHtcblx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXTtcblx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xuXHR9LFxuXHRyZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuXHRcdGlmICghZXZlbnROYW1lKSB7IHRoaXMuZXZlbnRzID0ge307IHJldHVybiB0cnVlOyB9XG5cdFx0dmFyIGNhbGxiYWNrcyA9IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV07XG5cdFx0aWYgKCFjYWxsYmFja3MpIHJldHVybiB0cnVlO1xuXHRcdGlmICghY2FsbGJhY2spIHsgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdOyByZXR1cm4gdHJ1ZTsgfVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoY2FsbGJhY2tzW2ldID09PSBjYWxsYmFjaykge1xuXHRcdFx0XHR0aGlzLmV2ZW50c1tldmVudE5hbWVdLnNwbGljZShpLCAxKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcdFxuXHRkaXNwYXRjaEV2ZW50OiBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRhcmdzLFxuXHRcdFx0Y2FsbGJhY2tzID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXTtcblxuXHRcdGlmIChjYWxsYmFja3MpIHtcblx0XHRcdGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvLyBlbmQ6IGZha2UgZXZlbnRzXG5cdFxuXHQvLyBmYWtlIERPTSBhdHRyaWJ1dGUgbWV0aG9kc1xuXHRoYXNBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdHJldHVybiAobmFtZSBpbiB0aGlzLmF0dHJpYnV0ZXMpOyAgXG5cdH0sXG5cdHJlbW92ZUF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG5cdFx0ZGVsZXRlIHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcblx0fSxcblx0Z2V0QXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcblx0XHRpZiAodGhpcy5oYXNBdHRyaWJ1dGUobmFtZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG5cdFx0fVxuXHRcdHJldHVybiAnJztcblx0fSxcblx0c2V0QXR0cmlidXRlOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSl7XG5cdFx0dGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gdmFsdWU7XG5cdH0sXG5cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHRtZWpzLlV0aWxpdHkucmVtb3ZlU3dmKHRoaXMucGx1Z2luRWxlbWVudC5pZCk7XG5cdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS51bnJlZ2lzdGVyUGx1Z2luRWxlbWVudCh0aGlzLnBsdWdpbkVsZW1lbnQuaWQpO1xuXHR9XG59O1xuXG4vLyBIYW5kbGVzIGNhbGxzIGZyb20gRmxhc2gvU2lsdmVybGlnaHQgYW5kIHJlcG9ydHMgdGhlbSBhcyBuYXRpdmUgPHZpZGVvL2F1ZGlvPiBldmVudHMgYW5kIHByb3BlcnRpZXNcbm1lanMuTWVkaWFQbHVnaW5CcmlkZ2UgPSB7XG5cblx0cGx1Z2luTWVkaWFFbGVtZW50czp7fSxcblx0aHRtbE1lZGlhRWxlbWVudHM6e30sXG5cblx0cmVnaXN0ZXJQbHVnaW5FbGVtZW50OiBmdW5jdGlvbiAoaWQsIHBsdWdpbk1lZGlhRWxlbWVudCwgaHRtbE1lZGlhRWxlbWVudCkge1xuXHRcdHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF0gPSBwbHVnaW5NZWRpYUVsZW1lbnQ7XG5cdFx0dGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF0gPSBodG1sTWVkaWFFbGVtZW50O1xuXHR9LFxuXG5cdHVucmVnaXN0ZXJQbHVnaW5FbGVtZW50OiBmdW5jdGlvbiAoaWQpIHtcblx0XHRkZWxldGUgdGhpcy5wbHVnaW5NZWRpYUVsZW1lbnRzW2lkXTtcblx0XHRkZWxldGUgdGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF07XG5cdH0sXG5cblx0Ly8gd2hlbiBGbGFzaC9TaWx2ZXJsaWdodCBpcyByZWFkeSwgaXQgY2FsbHMgb3V0IHRvIHRoaXMgbWV0aG9kXG5cdGluaXRQbHVnaW46IGZ1bmN0aW9uIChpZCkge1xuXG5cdFx0dmFyIHBsdWdpbk1lZGlhRWxlbWVudCA9IHRoaXMucGx1Z2luTWVkaWFFbGVtZW50c1tpZF0sXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50ID0gdGhpcy5odG1sTWVkaWFFbGVtZW50c1tpZF07XG5cblx0XHRpZiAocGx1Z2luTWVkaWFFbGVtZW50KSB7XG5cdFx0XHQvLyBmaW5kIHRoZSBqYXZhc2NyaXB0IGJyaWRnZVxuXHRcdFx0c3dpdGNoIChwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luVHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiZmxhc2hcIjpcblx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudCA9IHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJzaWx2ZXJsaWdodFwiOlxuXHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGx1Z2luTWVkaWFFbGVtZW50LmlkKTtcblx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQuQ29udGVudC5NZWRpYUVsZW1lbnRKUztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XG5cdFx0XHRpZiAocGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkFwaSAhPSBudWxsICYmIHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzKSB7XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5zdWNjZXNzKHBsdWdpbk1lZGlhRWxlbWVudCwgaHRtbE1lZGlhRWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vIHJlY2VpdmVzIGV2ZW50cyBmcm9tIEZsYXNoL1NpbHZlcmxpZ2h0IGFuZCBzZW5kcyB0aGVtIG91dCBhcyBIVE1MNSBtZWRpYSBldmVudHNcblx0Ly8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdmlkZW8uaHRtbFxuXHRmaXJlRXZlbnQ6IGZ1bmN0aW9uIChpZCwgZXZlbnROYW1lLCB2YWx1ZXMpIHtcblxuXHRcdHZhclxuXHRcdFx0ZSxcblx0XHRcdGksXG5cdFx0XHRidWZmZXJlZFRpbWUsXG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSB0aGlzLnBsdWdpbk1lZGlhRWxlbWVudHNbaWRdO1xuXG5cdFx0aWYoIXBsdWdpbk1lZGlhRWxlbWVudCl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG5cdFx0Ly8gZmFrZSBldmVudCBvYmplY3QgdG8gbWltaWMgcmVhbCBIVE1MIG1lZGlhIGV2ZW50LlxuXHRcdGUgPSB7XG5cdFx0XHR0eXBlOiBldmVudE5hbWUsXG5cdFx0XHR0YXJnZXQ6IHBsdWdpbk1lZGlhRWxlbWVudFxuXHRcdH07XG5cblx0XHQvLyBhdHRhY2ggYWxsIHZhbHVlcyB0byBlbGVtZW50IGFuZCBldmVudCBvYmplY3Rcblx0XHRmb3IgKGkgaW4gdmFsdWVzKSB7XG5cdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnRbaV0gPSB2YWx1ZXNbaV07XG5cdFx0XHRlW2ldID0gdmFsdWVzW2ldO1xuXHRcdH1cblxuXHRcdC8vIGZha2UgdGhlIG5ld2VyIFczQyBidWZmZXJlZCBUaW1lUmFuZ2UgKGxvYWRlZCBhbmQgdG90YWwgaGF2ZSBiZWVuIHJlbW92ZWQpXG5cdFx0YnVmZmVyZWRUaW1lID0gdmFsdWVzLmJ1ZmZlcmVkVGltZSB8fCAwO1xuXG5cdFx0ZS50YXJnZXQuYnVmZmVyZWQgPSBlLmJ1ZmZlcmVkID0ge1xuXHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSxcblx0XHRcdGVuZDogZnVuY3Rpb24gKGluZGV4KSB7XG5cdFx0XHRcdHJldHVybiBidWZmZXJlZFRpbWU7XG5cdFx0XHR9LFxuXHRcdFx0bGVuZ3RoOiAxXG5cdFx0fTtcblxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kaXNwYXRjaEV2ZW50KGUudHlwZSwgZSk7XG5cdH1cbn07XG5cbi8qXG5EZWZhdWx0IG9wdGlvbnNcbiovXG5tZWpzLk1lZGlhRWxlbWVudERlZmF1bHRzID0ge1xuXHQvLyBhbGxvd3MgdGVzdGluZyBvbiBIVE1MNSwgZmxhc2gsIHNpbHZlcmxpZ2h0XG5cdC8vIGF1dG86IGF0dGVtcHRzIHRvIGRldGVjdCB3aGF0IHRoZSBicm93c2VyIGNhbiBkb1xuXHQvLyBhdXRvX3BsdWdpbjogcHJlZmVyIHBsdWdpbnMgYW5kIHRoZW4gYXR0ZW1wdCBuYXRpdmUgSFRNTDVcblx0Ly8gbmF0aXZlOiBmb3JjZXMgSFRNTDUgcGxheWJhY2tcblx0Ly8gc2hpbTogZGlzYWxsb3dzIEhUTUw1LCB3aWxsIGF0dGVtcHQgZWl0aGVyIEZsYXNoIG9yIFNpbHZlcmxpZ2h0XG5cdC8vIG5vbmU6IGZvcmNlcyBmYWxsYmFjayB2aWV3XG5cdG1vZGU6ICdhdXRvJyxcblx0Ly8gcmVtb3ZlIG9yIHJlb3JkZXIgdG8gY2hhbmdlIHBsdWdpbiBwcmlvcml0eSBhbmQgYXZhaWxhYmlsaXR5XG5cdHBsdWdpbnM6IFsnZmxhc2gnLCdzaWx2ZXJsaWdodCcsJ3lvdXR1YmUnLCd2aW1lbyddLFxuXHQvLyBzaG93cyBkZWJ1ZyBlcnJvcnMgb24gc2NyZWVuXG5cdGVuYWJsZVBsdWdpbkRlYnVnOiBmYWxzZSxcblx0Ly8gdXNlIHBsdWdpbiBmb3IgYnJvd3NlcnMgdGhhdCBoYXZlIHRyb3VibGUgd2l0aCBCYXNpYyBBdXRoZW50aWNhdGlvbiBvbiBIVFRQUyBzaXRlc1xuXHRodHRwc0Jhc2ljQXV0aFNpdGU6IGZhbHNlLFxuXHQvLyBvdmVycmlkZXMgdGhlIHR5cGUgc3BlY2lmaWVkLCB1c2VmdWwgZm9yIGR5bmFtaWMgaW5zdGFudGlhdGlvblxuXHR0eXBlOiAnJyxcblx0Ly8gcGF0aCB0byBGbGFzaCBhbmQgU2lsdmVybGlnaHQgcGx1Z2luc1xuXHRwbHVnaW5QYXRoOiBtZWpzLlV0aWxpdHkuZ2V0U2NyaXB0UGF0aChbJ21lZGlhZWxlbWVudC5qcycsJ21lZGlhZWxlbWVudC5taW4uanMnLCdtZWRpYWVsZW1lbnQtYW5kLXBsYXllci5qcycsJ21lZGlhZWxlbWVudC1hbmQtcGxheWVyLm1pbi5qcyddKSxcblx0Ly8gbmFtZSBvZiBmbGFzaCBmaWxlXG5cdGZsYXNoTmFtZTogJ2ZsYXNobWVkaWFlbGVtZW50LnN3ZicsXG5cdC8vIHN0cmVhbWVyIGZvciBSVE1QIHN0cmVhbWluZ1xuXHRmbGFzaFN0cmVhbWVyOiAnJyxcblx0Ly8gdHVybnMgb24gdGhlIHNtb290aGluZyBmaWx0ZXIgaW4gRmxhc2hcblx0ZW5hYmxlUGx1Z2luU21vb3RoaW5nOiBmYWxzZSxcblx0Ly8gZW5hYmxlZCBwc2V1ZG8tc3RyZWFtaW5nIChzZWVrKSBvbiAubXA0IGZpbGVzXG5cdGVuYWJsZVBzZXVkb1N0cmVhbWluZzogZmFsc2UsXG5cdC8vIHN0YXJ0IHF1ZXJ5IHBhcmFtZXRlciBzZW50IHRvIHNlcnZlciBmb3IgcHNldWRvLXN0cmVhbWluZ1xuXHRwc2V1ZG9TdHJlYW1pbmdTdGFydFF1ZXJ5UGFyYW06ICdzdGFydCcsXG5cdC8vIG5hbWUgb2Ygc2lsdmVybGlnaHQgZmlsZVxuXHRzaWx2ZXJsaWdodE5hbWU6ICdzaWx2ZXJsaWdodG1lZGlhZWxlbWVudC54YXAnLFxuXHQvLyBkZWZhdWx0IGlmIHRoZSA8dmlkZW8gd2lkdGg+IGlzIG5vdCBzcGVjaWZpZWRcblx0ZGVmYXVsdFZpZGVvV2lkdGg6IDQ4MCxcblx0Ly8gZGVmYXVsdCBpZiB0aGUgPHZpZGVvIGhlaWdodD4gaXMgbm90IHNwZWNpZmllZFxuXHRkZWZhdWx0VmlkZW9IZWlnaHQ6IDI3MCxcblx0Ly8gb3ZlcnJpZGVzIDx2aWRlbyB3aWR0aD5cblx0cGx1Z2luV2lkdGg6IC0xLFxuXHQvLyBvdmVycmlkZXMgPHZpZGVvIGhlaWdodD5cblx0cGx1Z2luSGVpZ2h0OiAtMSxcblx0Ly8gYWRkaXRpb25hbCBwbHVnaW4gdmFyaWFibGVzIGluICdrZXk9dmFsdWUnIGZvcm1cblx0cGx1Z2luVmFyczogW10sXHRcblx0Ly8gcmF0ZSBpbiBtaWxsaXNlY29uZHMgZm9yIEZsYXNoIGFuZCBTaWx2ZXJsaWdodCB0byBmaXJlIHRoZSB0aW1ldXBkYXRlIGV2ZW50XG5cdC8vIGxhcmdlciBudW1iZXIgaXMgbGVzcyBhY2N1cmF0ZSwgYnV0IGxlc3Mgc3RyYWluIG9uIHBsdWdpbi0+SmF2YVNjcmlwdCBicmlkZ2Vcblx0dGltZXJSYXRlOiAyNTAsXG5cdC8vIGluaXRpYWwgdm9sdW1lIGZvciBwbGF5ZXJcblx0c3RhcnRWb2x1bWU6IDAuOCxcblx0c3VjY2VzczogZnVuY3Rpb24gKCkgeyB9LFxuXHRlcnJvcjogZnVuY3Rpb24gKCkgeyB9XG59O1xuXG4vKlxuRGV0ZXJtaW5lcyBpZiBhIGJyb3dzZXIgc3VwcG9ydHMgdGhlIDx2aWRlbz4gb3IgPGF1ZGlvPiBlbGVtZW50XG5hbmQgcmV0dXJucyBlaXRoZXIgdGhlIG5hdGl2ZSBlbGVtZW50IG9yIGEgRmxhc2gvU2lsdmVybGlnaHQgdmVyc2lvbiB0aGF0XG5taW1pY3MgSFRNTDUgTWVkaWFFbGVtZW50XG4qL1xubWVqcy5NZWRpYUVsZW1lbnQgPSBmdW5jdGlvbiAoZWwsIG8pIHtcblx0cmV0dXJuIG1lanMuSHRtbE1lZGlhRWxlbWVudFNoaW0uY3JlYXRlKGVsLG8pO1xufTtcblxubWVqcy5IdG1sTWVkaWFFbGVtZW50U2hpbSA9IHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKGVsLCBvKSB7XG5cdFx0dmFyXG5cdFx0XHRvcHRpb25zID0gbWVqcy5NZWRpYUVsZW1lbnREZWZhdWx0cyxcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSAodHlwZW9mKGVsKSA9PSAnc3RyaW5nJykgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbCkgOiBlbCxcblx0XHRcdHRhZ05hbWUgPSBodG1sTWVkaWFFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcblx0XHRcdGlzTWVkaWFUYWcgPSAodGFnTmFtZSA9PT0gJ2F1ZGlvJyB8fCB0YWdOYW1lID09PSAndmlkZW8nKSxcblx0XHRcdHNyYyA9IChpc01lZGlhVGFnKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSA6IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyksXG5cdFx0XHRwb3N0ZXIgPSBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdGVyJyksXG5cdFx0XHRhdXRvcGxheSA9ICBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnYXV0b3BsYXknKSxcblx0XHRcdHByZWxvYWQgPSAgaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3ByZWxvYWQnKSxcblx0XHRcdGNvbnRyb2xzID0gIGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjb250cm9scycpLFxuXHRcdFx0cGxheWJhY2ssXG5cdFx0XHRwcm9wO1xuXG5cdFx0Ly8gZXh0ZW5kIG9wdGlvbnNcblx0XHRmb3IgKHByb3AgaW4gbykge1xuXHRcdFx0b3B0aW9uc1twcm9wXSA9IG9bcHJvcF07XG5cdFx0fVxuXG5cdFx0Ly8gY2xlYW4gdXAgYXR0cmlidXRlc1xuXHRcdHNyYyA9IFx0XHQodHlwZW9mIHNyYyA9PSAndW5kZWZpbmVkJyBcdHx8IHNyYyA9PT0gbnVsbCB8fCBzcmMgPT0gJycpID8gbnVsbCA6IHNyYztcdFx0XG5cdFx0cG9zdGVyID1cdCh0eXBlb2YgcG9zdGVyID09ICd1bmRlZmluZWQnIFx0fHwgcG9zdGVyID09PSBudWxsKSA/ICcnIDogcG9zdGVyO1xuXHRcdHByZWxvYWQgPSBcdCh0eXBlb2YgcHJlbG9hZCA9PSAndW5kZWZpbmVkJyBcdHx8IHByZWxvYWQgPT09IG51bGwgfHwgcHJlbG9hZCA9PT0gJ2ZhbHNlJykgPyAnbm9uZScgOiBwcmVsb2FkO1xuXHRcdGF1dG9wbGF5ID0gXHQhKHR5cGVvZiBhdXRvcGxheSA9PSAndW5kZWZpbmVkJyB8fCBhdXRvcGxheSA9PT0gbnVsbCB8fCBhdXRvcGxheSA9PT0gJ2ZhbHNlJyk7XG5cdFx0Y29udHJvbHMgPSBcdCEodHlwZW9mIGNvbnRyb2xzID09ICd1bmRlZmluZWQnIHx8IGNvbnRyb2xzID09PSBudWxsIHx8IGNvbnRyb2xzID09PSAnZmFsc2UnKTtcblxuXHRcdC8vIHRlc3QgZm9yIEhUTUw1IGFuZCBwbHVnaW4gY2FwYWJpbGl0aWVzXG5cdFx0cGxheWJhY2sgPSB0aGlzLmRldGVybWluZVBsYXliYWNrKGh0bWxNZWRpYUVsZW1lbnQsIG9wdGlvbnMsIG1lanMuTWVkaWFGZWF0dXJlcy5zdXBwb3J0c01lZGlhVGFnLCBpc01lZGlhVGFnLCBzcmMpO1xuXHRcdHBsYXliYWNrLnVybCA9IChwbGF5YmFjay51cmwgIT09IG51bGwpID8gbWVqcy5VdGlsaXR5LmFic29sdXRpemVVcmwocGxheWJhY2sudXJsKSA6ICcnO1xuXG5cdFx0aWYgKHBsYXliYWNrLm1ldGhvZCA9PSAnbmF0aXZlJykge1xuXHRcdFx0Ly8gc2Vjb25kIGZpeCBmb3IgYW5kcm9pZFxuXHRcdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0J1c3RlZEFuZHJvaWQpIHtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSBwbGF5YmFjay51cmw7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBsYXkoKTtcblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFxuXHRcdFx0Ly8gYWRkIG1ldGhvZHMgdG8gbmF0aXZlIEhUTUxNZWRpYUVsZW1lbnRcblx0XHRcdHJldHVybiB0aGlzLnVwZGF0ZU5hdGl2ZShwbGF5YmFjaywgb3B0aW9ucywgYXV0b3BsYXksIHByZWxvYWQpO1xuXHRcdH0gZWxzZSBpZiAocGxheWJhY2subWV0aG9kICE9PSAnJykge1xuXHRcdFx0Ly8gY3JlYXRlIHBsdWdpbiB0byBtaW1pYyBIVE1MTWVkaWFFbGVtZW50XG5cdFx0XHRcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZVBsdWdpbiggcGxheWJhY2ssICBvcHRpb25zLCBwb3N0ZXIsIGF1dG9wbGF5LCBwcmVsb2FkLCBjb250cm9scyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGJvbywgbm8gSFRNTDUsIG5vIEZsYXNoLCBubyBTaWx2ZXJsaWdodC5cblx0XHRcdHRoaXMuY3JlYXRlRXJyb3JNZXNzYWdlKCBwbGF5YmFjaywgb3B0aW9ucywgcG9zdGVyICk7XG5cdFx0XHRcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSxcblx0XG5cdGRldGVybWluZVBsYXliYWNrOiBmdW5jdGlvbihodG1sTWVkaWFFbGVtZW50LCBvcHRpb25zLCBzdXBwb3J0c01lZGlhVGFnLCBpc01lZGlhVGFnLCBzcmMpIHtcblx0XHR2YXJcblx0XHRcdG1lZGlhRmlsZXMgPSBbXSxcblx0XHRcdGksXG5cdFx0XHRqLFxuXHRcdFx0ayxcblx0XHRcdGwsXG5cdFx0XHRuLFxuXHRcdFx0dHlwZSxcblx0XHRcdHJlc3VsdCA9IHsgbWV0aG9kOiAnJywgdXJsOiAnJywgaHRtbE1lZGlhRWxlbWVudDogaHRtbE1lZGlhRWxlbWVudCwgaXNWaWRlbzogKGh0bWxNZWRpYUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9ICdhdWRpbycpfSxcblx0XHRcdHBsdWdpbk5hbWUsXG5cdFx0XHRwbHVnaW5WZXJzaW9ucyxcblx0XHRcdHBsdWdpbkluZm8sXG5cdFx0XHRkdW1teSxcblx0XHRcdG1lZGlhO1xuXHRcdFx0XG5cdFx0Ly8gU1RFUCAxOiBHZXQgVVJMIGFuZCB0eXBlIGZyb20gPHZpZGVvIHNyYz4gb3IgPHNvdXJjZSBzcmM+XG5cblx0XHQvLyBzdXBwbGllZCB0eXBlIG92ZXJyaWRlcyA8dmlkZW8gdHlwZT4gYW5kIDxzb3VyY2UgdHlwZT5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHlwZSAhPSAndW5kZWZpbmVkJyAmJiBvcHRpb25zLnR5cGUgIT09ICcnKSB7XG5cdFx0XHRcblx0XHRcdC8vIGFjY2VwdCBlaXRoZXIgc3RyaW5nIG9yIGFycmF5IG9mIHR5cGVzXG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHlwZSA9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRtZWRpYUZpbGVzLnB1c2goe3R5cGU6b3B0aW9ucy50eXBlLCB1cmw6c3JjfSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yIChpPTA7IGk8b3B0aW9ucy50eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOm9wdGlvbnMudHlwZVtpXSwgdXJsOnNyY30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHQvLyB0ZXN0IGZvciBzcmMgYXR0cmlidXRlIGZpcnN0XG5cdFx0fSBlbHNlIGlmIChzcmMgIT09IG51bGwpIHtcblx0XHRcdHR5cGUgPSB0aGlzLmZvcm1hdFR5cGUoc3JjLCBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKTtcblx0XHRcdG1lZGlhRmlsZXMucHVzaCh7dHlwZTp0eXBlLCB1cmw6c3JjfSk7XG5cblx0XHQvLyB0aGVuIHRlc3QgZm9yIDxzb3VyY2U+IGVsZW1lbnRzXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRlc3QgPHNvdXJjZT4gdHlwZXMgdG8gc2VlIGlmIHRoZXkgYXJlIHVzYWJsZVxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGh0bWxNZWRpYUVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRuID0gaHRtbE1lZGlhRWxlbWVudC5jaGlsZE5vZGVzW2ldO1xuXHRcdFx0XHRpZiAobi5ub2RlVHlwZSA9PSAxICYmIG4udGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICdzb3VyY2UnKSB7XG5cdFx0XHRcdFx0c3JjID0gbi5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXHRcdFx0XHRcdHR5cGUgPSB0aGlzLmZvcm1hdFR5cGUoc3JjLCBuLmdldEF0dHJpYnV0ZSgndHlwZScpKTtcblx0XHRcdFx0XHRtZWRpYSA9IG4uZ2V0QXR0cmlidXRlKCdtZWRpYScpO1xuXG5cdFx0XHRcdFx0aWYgKCFtZWRpYSB8fCAhd2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhICYmIHdpbmRvdy5tYXRjaE1lZGlhKG1lZGlhKS5tYXRjaGVzKSkge1xuXHRcdFx0XHRcdFx0bWVkaWFGaWxlcy5wdXNoKHt0eXBlOnR5cGUsIHVybDpzcmN9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gaW4gdGhlIGNhc2Ugb2YgZHluYW1pY2x5IGNyZWF0ZWQgcGxheWVyc1xuXHRcdC8vIGNoZWNrIGZvciBhdWRpbyB0eXBlc1xuXHRcdGlmICghaXNNZWRpYVRhZyAmJiBtZWRpYUZpbGVzLmxlbmd0aCA+IDAgJiYgbWVkaWFGaWxlc1swXS51cmwgIT09IG51bGwgJiYgdGhpcy5nZXRUeXBlRnJvbUZpbGUobWVkaWFGaWxlc1swXS51cmwpLmluZGV4T2YoJ2F1ZGlvJykgPiAtMSkge1xuXHRcdFx0cmVzdWx0LmlzVmlkZW8gPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cblx0XHQvLyBTVEVQIDI6IFRlc3QgZm9yIHBsYXliYWNrIG1ldGhvZFxuXHRcdFxuXHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgQW5kcm9pZCB3aGljaCBzYWRseSBkb2Vzbid0IGltcGxlbWVudCB0aGUgY2FuUGxheVR5cGUgZnVuY3Rpb24gKGFsd2F5cyByZXR1cm5zICcnKVxuXHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNCdXN0ZWRBbmRyb2lkKSB7XG5cdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuXHRcdFx0XHRyZXR1cm4gKHR5cGUubWF0Y2goL3ZpZGVvXFwvKG1wNHxtNHYpL2dpKSAhPT0gbnVsbCkgPyAnbWF5YmUnIDogJyc7XG5cdFx0XHR9O1xuXHRcdH1cdFx0XG5cdFx0XG5cdFx0Ly8gc3BlY2lhbCBjYXNlIGZvciBDaHJvbWl1bSB0byBzcGVjaWZ5IG5hdGl2ZWx5IHN1cHBvcnRlZCB2aWRlbyBjb2RlY3MgKGkuZS4gV2ViTSBhbmQgVGhlb3JhKSBcblx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzQ2hyb21pdW0pIHsgXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhblBsYXlUeXBlID0gZnVuY3Rpb24odHlwZSkgeyBcblx0XHRcdFx0cmV0dXJuICh0eXBlLm1hdGNoKC92aWRlb1xcLyh3ZWJtfG9ndnxvZ2cpL2dpKSAhPT0gbnVsbCkgPyAnbWF5YmUnIDogJyc7IFxuXHRcdFx0fTsgXG5cdFx0fVxuXG5cdFx0Ly8gdGVzdCBmb3IgbmF0aXZlIHBsYXliYWNrIGZpcnN0XG5cdFx0aWYgKHN1cHBvcnRzTWVkaWFUYWcgJiYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG8nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyB8fCBvcHRpb25zLm1vZGUgPT09ICduYXRpdmUnKSAgJiYgIShtZWpzLk1lZGlhRmVhdHVyZXMuaXNCdXN0ZWROYXRpdmVIVFRQUyAmJiBvcHRpb25zLmh0dHBzQmFzaWNBdXRoU2l0ZSA9PT0gdHJ1ZSkpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0aWYgKCFpc01lZGlhVGFnKSB7XG5cblx0XHRcdFx0Ly8gY3JlYXRlIGEgcmVhbCBIVE1MNSBNZWRpYSBFbGVtZW50IFxuXHRcdFx0XHRkdW1teSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIHJlc3VsdC5pc1ZpZGVvID8gJ3ZpZGVvJyA6ICdhdWRpbycpO1x0XHRcdFxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGR1bW15LCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gdXNlIHRoaXMgb25lIGZyb20gbm93IG9uXG5cdFx0XHRcdHJlc3VsdC5odG1sTWVkaWFFbGVtZW50ID0gaHRtbE1lZGlhRWxlbWVudCA9IGR1bW15O1xuXHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdGZvciAoaT0wOyBpPG1lZGlhRmlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gbm9ybWFsIGNoZWNrXG5cdFx0XHRcdGlmIChtZWRpYUZpbGVzW2ldLnR5cGUgPT0gXCJ2aWRlby9tM3U4XCIgfHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJ1xuXHRcdFx0XHRcdC8vIHNwZWNpYWwgY2FzZSBmb3IgTWFjL1NhZmFyaSA1LjAuMyB3aGljaCBhbnN3ZXJzICcnIHRvIGNhblBsYXlUeXBlKCdhdWRpby9tcDMnKSBidXQgJ21heWJlJyB0byBjYW5QbGF5VHlwZSgnYXVkaW8vbXBlZycpXG5cdFx0XHRcdFx0fHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUucmVwbGFjZSgvbXAzLywnbXBlZycpKS5yZXBsYWNlKC9uby8sICcnKSAhPT0gJydcblx0XHRcdFx0XHQvLyBzcGVjaWFsIGNhc2UgZm9yIG00YSBzdXBwb3J0ZWQgYnkgZGV0ZWN0aW5nIG1wNCBzdXBwb3J0XG5cdFx0XHRcdFx0fHwgaHRtbE1lZGlhRWxlbWVudC5jYW5QbGF5VHlwZShtZWRpYUZpbGVzW2ldLnR5cGUucmVwbGFjZSgvbTRhLywnbXA0JykpLnJlcGxhY2UoL25vLywgJycpICE9PSAnJykge1xuXHRcdFx0XHRcdHJlc3VsdC5tZXRob2QgPSAnbmF0aXZlJztcblx0XHRcdFx0XHRyZXN1bHQudXJsID0gbWVkaWFGaWxlc1tpXS51cmw7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cdFx0XHRcblx0XHRcdFxuXHRcdFx0aWYgKHJlc3VsdC5tZXRob2QgPT09ICduYXRpdmUnKSB7XG5cdFx0XHRcdGlmIChyZXN1bHQudXJsICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5zcmMgPSByZXN1bHQudXJsO1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdFx0Ly8gaWYgYGF1dG9fcGx1Z2luYCBtb2RlLCB0aGVuIGNhY2hlIHRoZSBuYXRpdmUgcmVzdWx0IGJ1dCB0cnkgcGx1Z2lucy5cblx0XHRcdFx0aWYgKG9wdGlvbnMubW9kZSAhPT0gJ2F1dG9fcGx1Z2luJykge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBpZiBuYXRpdmUgcGxheWJhY2sgZGlkbid0IHdvcmssIHRoZW4gdGVzdCBwbHVnaW5zXG5cdFx0aWYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG8nIHx8IG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyB8fCBvcHRpb25zLm1vZGUgPT09ICdzaGltJykge1xuXHRcdFx0Zm9yIChpPTA7IGk8bWVkaWFGaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0eXBlID0gbWVkaWFGaWxlc1tpXS50eXBlO1xuXG5cdFx0XHRcdC8vIHRlc3QgYWxsIHBsdWdpbnMgaW4gb3JkZXIgb2YgcHJlZmVyZW5jZSBbc2lsdmVybGlnaHQsIGZsYXNoXVxuXHRcdFx0XHRmb3IgKGo9MDsgajxvcHRpb25zLnBsdWdpbnMubGVuZ3RoOyBqKyspIHtcblxuXHRcdFx0XHRcdHBsdWdpbk5hbWUgPSBvcHRpb25zLnBsdWdpbnNbal07XG5cdFx0XHRcblx0XHRcdFx0XHQvLyB0ZXN0IHZlcnNpb24gb2YgcGx1Z2luIChmb3IgZnV0dXJlIGZlYXR1cmVzKVxuXHRcdFx0XHRcdHBsdWdpblZlcnNpb25zID0gbWVqcy5wbHVnaW5zW3BsdWdpbk5hbWVdO1x0XHRcdFx0XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yIChrPTA7IGs8cGx1Z2luVmVyc2lvbnMubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcdHBsdWdpbkluZm8gPSBwbHVnaW5WZXJzaW9uc1trXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdC8vIHRlc3QgaWYgdXNlciBoYXMgdGhlIGNvcnJlY3QgcGx1Z2luIHZlcnNpb25cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Ly8gZm9yIHlvdXR1YmUvdmltZW9cblx0XHRcdFx0XHRcdGlmIChwbHVnaW5JbmZvLnZlcnNpb24gPT0gbnVsbCB8fCBcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdG1lanMuUGx1Z2luRGV0ZWN0b3IuaGFzUGx1Z2luVmVyc2lvbihwbHVnaW5OYW1lLCBwbHVnaW5JbmZvLnZlcnNpb24pKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gdGVzdCBmb3IgcGx1Z2luIHBsYXliYWNrIHR5cGVzXG5cdFx0XHRcdFx0XHRcdGZvciAobD0wOyBsPHBsdWdpbkluZm8udHlwZXMubGVuZ3RoOyBsKyspIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBmaW5kIHBsdWdpbiB0aGF0IGNhbiBwbGF5IHRoZSB0eXBlXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGUgPT0gcGx1Z2luSW5mby50eXBlc1tsXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0Lm1ldGhvZCA9IHBsdWdpbk5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQudXJsID0gbWVkaWFGaWxlc1tpXS51cmw7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBhdCB0aGlzIHBvaW50LCBiZWluZyBpbiAnYXV0b19wbHVnaW4nIG1vZGUgaW1wbGllcyB0aGF0IHdlIHRyaWVkIHBsdWdpbnMgYnV0IGZhaWxlZC5cblx0XHQvLyBpZiB3ZSBoYXZlIG5hdGl2ZSBzdXBwb3J0IHRoZW4gcmV0dXJuIHRoYXQuXG5cdFx0aWYgKG9wdGlvbnMubW9kZSA9PT0gJ2F1dG9fcGx1Z2luJyAmJiByZXN1bHQubWV0aG9kID09PSAnbmF0aXZlJykge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHQvLyB3aGF0IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBwbGF5PyBqdXN0IGdyYWIgdGhlIGZpcnN0IGF2YWlsYWJsZVxuXHRcdGlmIChyZXN1bHQubWV0aG9kID09PSAnJyAmJiBtZWRpYUZpbGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdHJlc3VsdC51cmwgPSBtZWRpYUZpbGVzWzBdLnVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdGZvcm1hdFR5cGU6IGZ1bmN0aW9uKHVybCwgdHlwZSkge1xuXHRcdHZhciBleHQ7XG5cblx0XHQvLyBpZiBubyB0eXBlIGlzIHN1cHBsaWVkLCBmYWtlIGl0IHdpdGggdGhlIGV4dGVuc2lvblxuXHRcdGlmICh1cmwgJiYgIXR5cGUpIHtcdFx0XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRUeXBlRnJvbUZpbGUodXJsKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gb25seSByZXR1cm4gdGhlIG1pbWUgcGFydCBvZiB0aGUgdHlwZSBpbiBjYXNlIHRoZSBhdHRyaWJ1dGUgY29udGFpbnMgdGhlIGNvZGVjXG5cdFx0XHQvLyBzZWUgaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdmlkZW8uaHRtbCN0aGUtc291cmNlLWVsZW1lbnRcblx0XHRcdC8vIGB2aWRlby9tcDQ7IGNvZGVjcz1cImF2YzEuNDJFMDFFLCBtcDRhLjQwLjJcImAgYmVjb21lcyBgdmlkZW8vbXA0YFxuXHRcdFx0XG5cdFx0XHRpZiAodHlwZSAmJiB+dHlwZS5pbmRleE9mKCc7JykpIHtcblx0XHRcdFx0cmV0dXJuIHR5cGUuc3Vic3RyKDAsIHR5cGUuaW5kZXhPZignOycpKTsgXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdHlwZTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFxuXHRnZXRUeXBlRnJvbUZpbGU6IGZ1bmN0aW9uKHVybCkge1xuXHRcdHVybCA9IHVybC5zcGxpdCgnPycpWzBdO1xuXHRcdHZhciBleHQgPSB1cmwuc3Vic3RyaW5nKHVybC5sYXN0SW5kZXhPZignLicpICsgMSkudG9Mb3dlckNhc2UoKTtcblx0XHRyZXR1cm4gKC8obXA0fG00dnxvZ2d8b2d2fG0zdTh8d2VibXx3ZWJtdnxmbHZ8d212fG1wZWd8bW92KS9naS50ZXN0KGV4dCkgPyAndmlkZW8nIDogJ2F1ZGlvJykgKyAnLycgKyB0aGlzLmdldFR5cGVGcm9tRXh0ZW5zaW9uKGV4dCk7XG5cdH0sXG5cdFxuXHRnZXRUeXBlRnJvbUV4dGVuc2lvbjogZnVuY3Rpb24oZXh0KSB7XG5cdFx0XG5cdFx0c3dpdGNoIChleHQpIHtcblx0XHRcdGNhc2UgJ21wNCc6XG5cdFx0XHRjYXNlICdtNHYnOlxuXHRcdFx0Y2FzZSAnbTRhJzpcblx0XHRcdFx0cmV0dXJuICdtcDQnO1xuXHRcdFx0Y2FzZSAnd2VibSc6XG5cdFx0XHRjYXNlICd3ZWJtYSc6XG5cdFx0XHRjYXNlICd3ZWJtdic6XHRcblx0XHRcdFx0cmV0dXJuICd3ZWJtJztcblx0XHRcdGNhc2UgJ29nZyc6XG5cdFx0XHRjYXNlICdvZ2EnOlxuXHRcdFx0Y2FzZSAnb2d2JzpcdFxuXHRcdFx0XHRyZXR1cm4gJ29nZyc7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXh0O1xuXHRcdH1cblx0fSxcblxuXHRjcmVhdGVFcnJvck1lc3NhZ2U6IGZ1bmN0aW9uKHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIpIHtcblx0XHR2YXIgXG5cdFx0XHRodG1sTWVkaWFFbGVtZW50ID0gcGxheWJhY2suaHRtbE1lZGlhRWxlbWVudCxcblx0XHRcdGVycm9yQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcblx0XHRlcnJvckNvbnRhaW5lci5jbGFzc05hbWUgPSAnbWUtY2Fubm90cGxheSc7XG5cblx0XHR0cnkge1xuXHRcdFx0ZXJyb3JDb250YWluZXIuc3R5bGUud2lkdGggPSBodG1sTWVkaWFFbGVtZW50LndpZHRoICsgJ3B4Jztcblx0XHRcdGVycm9yQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGh0bWxNZWRpYUVsZW1lbnQuaGVpZ2h0ICsgJ3B4Jztcblx0XHR9IGNhdGNoIChlKSB7fVxuXG4gICAgaWYgKG9wdGlvbnMuY3VzdG9tRXJyb3IpIHtcbiAgICAgIGVycm9yQ29udGFpbmVyLmlubmVySFRNTCA9IG9wdGlvbnMuY3VzdG9tRXJyb3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29udGFpbmVyLmlubmVySFRNTCA9IChwb3N0ZXIgIT09ICcnKSA/XG4gICAgICAgICc8YSBocmVmPVwiJyArIHBsYXliYWNrLnVybCArICdcIj48aW1nIHNyYz1cIicgKyBwb3N0ZXIgKyAnXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIC8+PC9hPicgOlxuICAgICAgICAnPGEgaHJlZj1cIicgKyBwbGF5YmFjay51cmwgKyAnXCI+PHNwYW4+JyArIG1lanMuaTE4bi50KCdEb3dubG9hZCBGaWxlJykgKyAnPC9zcGFuPjwvYT4nO1xuICAgIH1cblxuXHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZXJyb3JDb250YWluZXIsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdGh0bWxNZWRpYUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdG9wdGlvbnMuZXJyb3IoaHRtbE1lZGlhRWxlbWVudCk7XG5cdH0sXG5cblx0Y3JlYXRlUGx1Z2luOmZ1bmN0aW9uKHBsYXliYWNrLCBvcHRpb25zLCBwb3N0ZXIsIGF1dG9wbGF5LCBwcmVsb2FkLCBjb250cm9scykge1xuXHRcdHZhciBcblx0XHRcdGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0d2lkdGggPSAxLFxuXHRcdFx0aGVpZ2h0ID0gMSxcblx0XHRcdHBsdWdpbmlkID0gJ21lXycgKyBwbGF5YmFjay5tZXRob2QgKyAnXycgKyAobWVqcy5tZUluZGV4KyspLFxuXHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50ID0gbmV3IG1lanMuUGx1Z2luTWVkaWFFbGVtZW50KHBsdWdpbmlkLCBwbGF5YmFjay5tZXRob2QsIHBsYXliYWNrLnVybCksXG5cdFx0XHRjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lcixcblx0XHRcdG5vZGUsXG5cdFx0XHRpbml0VmFycztcblxuXHRcdC8vIGNvcHkgdGFnTmFtZSBmcm9tIGh0bWwgbWVkaWEgZWxlbWVudFxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC50YWdOYW1lID0gaHRtbE1lZGlhRWxlbWVudC50YWdOYW1lXG5cblx0XHQvLyBjb3B5IGF0dHJpYnV0ZXMgZnJvbSBodG1sIG1lZGlhIGVsZW1lbnQgdG8gcGx1Z2luIG1lZGlhIGVsZW1lbnRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGh0bWxNZWRpYUVsZW1lbnQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZSA9IGh0bWxNZWRpYUVsZW1lbnQuYXR0cmlidXRlc1tpXTtcblx0XHRcdGlmIChhdHRyaWJ1dGUuc3BlY2lmaWVkID09IHRydWUpIHtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBjaGVjayBmb3IgcGxhY2VtZW50IGluc2lkZSBhIDxwPiB0YWcgKHNvbWV0aW1lcyBXWVNJV1lHIGVkaXRvcnMgZG8gdGhpcylcblx0XHRub2RlID0gaHRtbE1lZGlhRWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdHdoaWxlIChub2RlICE9PSBudWxsICYmIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnYm9keScgJiYgbm9kZS5wYXJlbnROb2RlICE9IG51bGwpIHtcblx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAncCcpIHtcblx0XHRcdFx0bm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5vZGUucGFyZW50Tm9kZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRpZiAocGxheWJhY2suaXNWaWRlbykge1xuXHRcdFx0d2lkdGggPSAob3B0aW9ucy5wbHVnaW5XaWR0aCA+IDApID8gb3B0aW9ucy5wbHVnaW5XaWR0aCA6IChvcHRpb25zLnZpZGVvV2lkdGggPiAwKSA/IG9wdGlvbnMudmlkZW9XaWR0aCA6IChodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAhPT0gbnVsbCkgPyBodG1sTWVkaWFFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKSA6IG9wdGlvbnMuZGVmYXVsdFZpZGVvV2lkdGg7XG5cdFx0XHRoZWlnaHQgPSAob3B0aW9ucy5wbHVnaW5IZWlnaHQgPiAwKSA/IG9wdGlvbnMucGx1Z2luSGVpZ2h0IDogKG9wdGlvbnMudmlkZW9IZWlnaHQgPiAwKSA/IG9wdGlvbnMudmlkZW9IZWlnaHQgOiAoaHRtbE1lZGlhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpICE9PSBudWxsKSA/IGh0bWxNZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSA6IG9wdGlvbnMuZGVmYXVsdFZpZGVvSGVpZ2h0O1xuXHRcdFxuXHRcdFx0Ly8gaW4gY2FzZSBvZiAnJScgbWFrZSBzdXJlIGl0J3MgZW5jb2RlZFxuXHRcdFx0d2lkdGggPSBtZWpzLlV0aWxpdHkuZW5jb2RlVXJsKHdpZHRoKTtcblx0XHRcdGhlaWdodCA9IG1lanMuVXRpbGl0eS5lbmNvZGVVcmwoaGVpZ2h0KTtcblx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKG9wdGlvbnMuZW5hYmxlUGx1Z2luRGVidWcpIHtcblx0XHRcdFx0d2lkdGggPSAzMjA7XG5cdFx0XHRcdGhlaWdodCA9IDI0MDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyByZWdpc3RlciBwbHVnaW5cblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzcztcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLnJlZ2lzdGVyUGx1Z2luRWxlbWVudChwbHVnaW5pZCwgcGx1Z2luTWVkaWFFbGVtZW50LCBodG1sTWVkaWFFbGVtZW50KTtcblxuXHRcdC8vIGFkZCBjb250YWluZXIgKG11c3QgYmUgYWRkZWQgdG8gRE9NIGJlZm9yZSBpbnNlcnRpbmcgSFRNTCBmb3IgSUUpXG5cdFx0Y29udGFpbmVyLmNsYXNzTmFtZSA9ICdtZS1wbHVnaW4nO1xuXHRcdGNvbnRhaW5lci5pZCA9IHBsdWdpbmlkICsgJ19jb250YWluZXInO1xuXHRcdFxuXHRcdGlmIChwbGF5YmFjay5pc1ZpZGVvKSB7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBodG1sTWVkaWFFbGVtZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShjb250YWluZXIsIGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlc1swXSk7XG5cdFx0fVxuXG5cdFx0Ly8gZmxhc2gvc2lsdmVybGlnaHQgdmFyc1xuXHRcdGluaXRWYXJzID0gW1xuXHRcdFx0J2lkPScgKyBwbHVnaW5pZCxcblx0XHRcdCdqc2luaXRmdW5jdGlvbj0nICsgXCJtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLmluaXRQbHVnaW5cIixcblx0XHRcdCdqc2NhbGxiYWNrZnVuY3Rpb249JyArIFwibWVqcy5NZWRpYVBsdWdpbkJyaWRnZS5maXJlRXZlbnRcIixcblx0XHRcdCdpc3ZpZGVvPScgKyAoKHBsYXliYWNrLmlzVmlkZW8pID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpLFxuXHRcdFx0J2F1dG9wbGF5PScgKyAoKGF1dG9wbGF5KSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiKSxcblx0XHRcdCdwcmVsb2FkPScgKyBwcmVsb2FkLFxuXHRcdFx0J3dpZHRoPScgKyB3aWR0aCxcblx0XHRcdCdzdGFydHZvbHVtZT0nICsgb3B0aW9ucy5zdGFydFZvbHVtZSxcblx0XHRcdCd0aW1lcnJhdGU9JyArIG9wdGlvbnMudGltZXJSYXRlLFxuXHRcdFx0J2ZsYXNoc3RyZWFtZXI9JyArIG9wdGlvbnMuZmxhc2hTdHJlYW1lcixcblx0XHRcdCdoZWlnaHQ9JyArIGhlaWdodCxcblx0XHRcdCdwc2V1ZG9zdHJlYW1zdGFydD0nICsgb3B0aW9ucy5wc2V1ZG9TdHJlYW1pbmdTdGFydFF1ZXJ5UGFyYW1dO1xuXG5cdFx0aWYgKHBsYXliYWNrLnVybCAhPT0gbnVsbCkge1xuXHRcdFx0aWYgKHBsYXliYWNrLm1ldGhvZCA9PSAnZmxhc2gnKSB7XG5cdFx0XHRcdGluaXRWYXJzLnB1c2goJ2ZpbGU9JyArIG1lanMuVXRpbGl0eS5lbmNvZGVVcmwocGxheWJhY2sudXJsKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbml0VmFycy5wdXNoKCdmaWxlPScgKyBwbGF5YmFjay51cmwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5EZWJ1Zykge1xuXHRcdFx0aW5pdFZhcnMucHVzaCgnZGVidWc9dHJ1ZScpO1xuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5lbmFibGVQbHVnaW5TbW9vdGhpbmcpIHtcblx0XHRcdGluaXRWYXJzLnB1c2goJ3Ntb290aGluZz10cnVlJyk7XG5cdFx0fVxuICAgIGlmIChvcHRpb25zLmVuYWJsZVBzZXVkb1N0cmVhbWluZykge1xuICAgICAgaW5pdFZhcnMucHVzaCgncHNldWRvc3RyZWFtaW5nPXRydWUnKTtcbiAgICB9XG5cdFx0aWYgKGNvbnRyb2xzKSB7XG5cdFx0XHRpbml0VmFycy5wdXNoKCdjb250cm9scz10cnVlJyk7IC8vIHNob3dzIGNvbnRyb2xzIGluIHRoZSBwbHVnaW4gaWYgZGVzaXJlZFxuXHRcdH1cblx0XHRpZiAob3B0aW9ucy5wbHVnaW5WYXJzKSB7XG5cdFx0XHRpbml0VmFycyA9IGluaXRWYXJzLmNvbmNhdChvcHRpb25zLnBsdWdpblZhcnMpO1xuXHRcdH1cdFx0XG5cblx0XHRzd2l0Y2ggKHBsYXliYWNrLm1ldGhvZCkge1xuXHRcdFx0Y2FzZSAnc2lsdmVybGlnaHQnOlxuXHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID1cbic8b2JqZWN0IGRhdGE9XCJkYXRhOmFwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtMixcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC0yXCIgaWQ9XCInICsgcGx1Z2luaWQgKyAnXCIgbmFtZT1cIicgKyBwbHVnaW5pZCArICdcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsgJ1wiIGNsYXNzPVwibWVqcy1zaGltXCI+JyArXG4nPHBhcmFtIG5hbWU9XCJpbml0UGFyYW1zXCIgdmFsdWU9XCInICsgaW5pdFZhcnMuam9pbignLCcpICsgJ1wiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJ3aW5kb3dsZXNzXCIgdmFsdWU9XCJ0cnVlXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImJhY2tncm91bmRcIiB2YWx1ZT1cImJsYWNrXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cIm1pblJ1bnRpbWVWZXJzaW9uXCIgdmFsdWU9XCIzLjAuMC4wXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImF1dG9VcGdyYWRlXCIgdmFsdWU9XCJ0cnVlXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cInNvdXJjZVwiIHZhbHVlPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuc2lsdmVybGlnaHROYW1lICsgJ1wiIC8+JyArXG4nPC9vYmplY3Q+Jztcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnZmxhc2gnOlxuXG5cdFx0XHRcdGlmIChtZWpzLk1lZGlhRmVhdHVyZXMuaXNJRSkge1xuXHRcdFx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChzcGVjaWFsSUVDb250YWluZXIpO1xuXHRcdFx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lci5vdXRlckhUTUwgPVxuJzxvYmplY3QgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiIGNvZGViYXNlPVwiLy9kb3dubG9hZC5tYWNyb21lZGlhLmNvbS9wdWIvc2hvY2t3YXZlL2NhYnMvZmxhc2gvc3dmbGFzaC5jYWJcIiAnICtcbidpZD1cIicgKyBwbHVnaW5pZCArICdcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsgJ1wiIGNsYXNzPVwibWVqcy1zaGltXCI+JyArXG4nPHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJyArIG9wdGlvbnMucGx1Z2luUGF0aCArIG9wdGlvbnMuZmxhc2hOYW1lICsgJz94PScgKyAobmV3IERhdGUoKSkgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cImZsYXNodmFyc1wiIHZhbHVlPVwiJyArIGluaXRWYXJzLmpvaW4oJyZhbXA7JykgKyAnXCIgLz4nICtcbic8cGFyYW0gbmFtZT1cInF1YWxpdHlcIiB2YWx1ZT1cImhpZ2hcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYmdjb2xvclwiIHZhbHVlPVwiIzAwMDAwMFwiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwiYWxsb3dTY3JpcHRBY2Nlc3NcIiB2YWx1ZT1cImFsd2F5c1wiIC8+JyArXG4nPHBhcmFtIG5hbWU9XCJhbGxvd0Z1bGxTY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzxwYXJhbSBuYW1lPVwic2NhbGVcIiB2YWx1ZT1cImRlZmF1bHRcIiAvPicgKyBcbic8L29iamVjdD4nO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID1cbic8ZW1iZWQgaWQ9XCInICsgcGx1Z2luaWQgKyAnXCIgbmFtZT1cIicgKyBwbHVnaW5pZCArICdcIiAnICtcbidwbGF5PVwidHJ1ZVwiICcgK1xuJ2xvb3A9XCJmYWxzZVwiICcgK1xuJ3F1YWxpdHk9XCJoaWdoXCIgJyArXG4nYmdjb2xvcj1cIiMwMDAwMDBcIiAnICtcbid3bW9kZT1cInRyYW5zcGFyZW50XCIgJyArXG4nYWxsb3dTY3JpcHRBY2Nlc3M9XCJhbHdheXNcIiAnICtcbidhbGxvd0Z1bGxTY3JlZW49XCJ0cnVlXCIgJyArXG4ndHlwZT1cImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIgcGx1Z2luc3BhZ2U9XCIvL3d3dy5tYWNyb21lZGlhLmNvbS9nby9nZXRmbGFzaHBsYXllclwiICcgK1xuJ3NyYz1cIicgKyBvcHRpb25zLnBsdWdpblBhdGggKyBvcHRpb25zLmZsYXNoTmFtZSArICdcIiAnICtcbidmbGFzaHZhcnM9XCInICsgaW5pdFZhcnMuam9pbignJicpICsgJ1wiICcgK1xuJ3dpZHRoPVwiJyArIHdpZHRoICsgJ1wiICcgK1xuJ2hlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgJyArXG4nc2NhbGU9XCJkZWZhdWx0XCInICsgXG4nY2xhc3M9XCJtZWpzLXNoaW1cIj48L2VtYmVkPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGNhc2UgJ3lvdXR1YmUnOlxuXHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgdmlkZW9JZDtcblx0XHRcdFx0Ly8geW91dHUuYmUgdXJsIGZyb20gc2hhcmUgYnV0dG9uXG5cdFx0XHRcdGlmIChwbGF5YmFjay51cmwubGFzdEluZGV4T2YoXCJ5b3V0dS5iZVwiKSAhPSAtMSkge1xuXHRcdFx0XHRcdHZpZGVvSWQgPSBwbGF5YmFjay51cmwuc3Vic3RyKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZignLycpKzEpO1xuXHRcdFx0XHRcdGlmICh2aWRlb0lkLmluZGV4T2YoJz8nKSAhPSAtMSkge1xuXHRcdFx0XHRcdFx0dmlkZW9JZCA9IHZpZGVvSWQuc3Vic3RyKDAsIHZpZGVvSWQuaW5kZXhPZignPycpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0dmlkZW9JZCA9IHBsYXliYWNrLnVybC5zdWJzdHIocGxheWJhY2sudXJsLmxhc3RJbmRleE9mKCc9JykrMSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0eW91dHViZVNldHRpbmdzID0ge1xuXHRcdFx0XHRcdFx0Y29udGFpbmVyOiBjb250YWluZXIsXG5cdFx0XHRcdFx0XHRjb250YWluZXJJZDogY29udGFpbmVyLmlkLFxuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50OiBwbHVnaW5NZWRpYUVsZW1lbnQsXG5cdFx0XHRcdFx0XHRwbHVnaW5JZDogcGx1Z2luaWQsXG5cdFx0XHRcdFx0XHR2aWRlb0lkOiB2aWRlb0lkLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0XHRcdFx0XHR3aWR0aDogd2lkdGhcdFxuXHRcdFx0XHRcdH07XHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChtZWpzLlBsdWdpbkRldGVjdG9yLmhhc1BsdWdpblZlcnNpb24oJ2ZsYXNoJywgWzEwLDAsMF0pICkge1xuXHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVGbGFzaCh5b3V0dWJlU2V0dGluZ3MpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5lbnF1ZXVlSWZyYW1lKHlvdXR1YmVTZXR0aW5ncyk7XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Ly8gREVNTyBDb2RlLiBEb2VzIE5PVCB3b3JrLlxuXHRcdFx0Y2FzZSAndmltZW8nOlxuXHRcdFx0XHR2YXIgcGxheWVyX2lkID0gcGx1Z2luaWQgKyBcIl9wbGF5ZXJcIjtcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnZpbWVvaWQgPSBwbGF5YmFjay51cmwuc3Vic3RyKHBsYXliYWNrLnVybC5sYXN0SW5kZXhPZignLycpKzEpO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9JzxpZnJhbWUgc3JjPVwiLy9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLycgKyBwbHVnaW5NZWRpYUVsZW1lbnQudmltZW9pZCArICc/YXBpPTEmcG9ydHJhaXQ9MCZieWxpbmU9MCZ0aXRsZT0wJnBsYXllcl9pZD0nICsgcGxheWVyX2lkICsgJ1wiIHdpZHRoPVwiJyArIHdpZHRoICsnXCIgaGVpZ2h0PVwiJyArIGhlaWdodCArJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIGNsYXNzPVwibWVqcy1zaGltXCIgaWQ9XCInICsgcGxheWVyX2lkICsgJ1wiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7XG5cdFx0XHRcdGlmICh0eXBlb2YoJGYpID09ICdmdW5jdGlvbicpIHsgLy8gZnJvb2dhbG9vcCBhdmFpbGFibGVcblx0XHRcdFx0XHR2YXIgcGxheWVyID0gJGYoY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncmVhZHknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0cGxheWVyLnBsYXlWaWRlbyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAncGxheScgKTtcblx0XHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0XHRwbGF5ZXIuc3RvcFZpZGVvID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHBsYXllci5hcGkoICd1bmxvYWQnICk7XG5cdFx0XHRcdFx0XHR9IFxuXHRcdFx0XHRcdFx0cGxheWVyLnBhdXNlVmlkZW8gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3BhdXNlJyApO1xuXHRcdFx0XHRcdFx0fSBcblx0XHRcdFx0XHRcdHBsYXllci5zZWVrVG8gPSBmdW5jdGlvbiggc2Vjb25kcyApIHtcblx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NlZWtUbycsIHNlY29uZHMgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBsYXllci5zZXRWb2x1bWUgPSBmdW5jdGlvbiggdm9sdW1lICkge1xuXHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAnc2V0Vm9sdW1lJywgdm9sdW1lICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwbGF5ZXIuc2V0TXV0ZWQgPSBmdW5jdGlvbiggbXV0ZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGlmKCBtdXRlZCApIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIubGFzdFZvbHVtZSA9IHBsYXllci5hcGkoICdnZXRWb2x1bWUnICk7XG5cdFx0XHRcdFx0XHRcdFx0cGxheWVyLmFwaSggJ3NldFZvbHVtZScsIDAgKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRwbGF5ZXIuYXBpKCAnc2V0Vm9sdW1lJywgcGxheWVyLmxhc3RWb2x1bWUgKTtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgcGxheWVyLmxhc3RWb2x1bWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cdFx0XHRcdFx0XHRcblxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsIGV2ZW50TmFtZSwgZSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IGV2ZW50TmFtZSxcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHBsdWdpbk1lZGlhRWxlbWVudFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRpZiAoZXZlbnROYW1lID09ICd0aW1ldXBkYXRlJykge1xuXHRcdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IGUuc2Vjb25kcztcblx0XHRcdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZHVyYXRpb24gPSBvYmouZHVyYXRpb24gPSBlLmR1cmF0aW9uO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5kaXNwYXRjaEV2ZW50KG9iai50eXBlLCBvYmopO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXknLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAncGxheWluZycpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgncGF1c2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHBsYXllci5hZGRFdmVudCgnZmluaXNoJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnZW5kZWQnKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYWRkRXZlbnQoJ3BsYXlQcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICd0aW1ldXBkYXRlJywgZSk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBsdWdpbkVsZW1lbnQgPSBjb250YWluZXI7XG5cdFx0XHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luQXBpID0gcGxheWVyO1xuXG5cdFx0XHRcdFx0XHQvLyBpbml0IG1lanNcblx0XHRcdFx0XHRcdG1lanMuTWVkaWFQbHVnaW5CcmlkZ2UuaW5pdFBsdWdpbihwbHVnaW5pZCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiWW91IG5lZWQgdG8gaW5jbHVkZSBmcm9vZ2Fsb29wIGZvciB2aW1lbyB0byB3b3JrXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1x0XHRcdFxuXHRcdH1cblx0XHQvLyBoaWRlIG9yaWdpbmFsIGVsZW1lbnRcblx0XHRodG1sTWVkaWFFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0Ly8gcHJldmVudCBicm93c2VyIGZyb20gYXV0b3BsYXlpbmcgd2hlbiB1c2luZyBhIHBsdWdpblxuXHRcdGh0bWxNZWRpYUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhdXRvcGxheScpO1xuXG5cdFx0Ly8gRllJOiBvcHRpb25zLnN1Y2Nlc3Mgd2lsbCBiZSBmaXJlZCBieSB0aGUgTWVkaWFQbHVnaW5CcmlkZ2Vcblx0XHRcblx0XHRyZXR1cm4gcGx1Z2luTWVkaWFFbGVtZW50O1xuXHR9LFxuXG5cdHVwZGF0ZU5hdGl2ZTogZnVuY3Rpb24ocGxheWJhY2ssIG9wdGlvbnMsIGF1dG9wbGF5LCBwcmVsb2FkKSB7XG5cdFx0XG5cdFx0dmFyIGh0bWxNZWRpYUVsZW1lbnQgPSBwbGF5YmFjay5odG1sTWVkaWFFbGVtZW50LFxuXHRcdFx0bTtcblx0XHRcblx0XHRcblx0XHQvLyBhZGQgbWV0aG9kcyB0byB2aWRlbyBvYmplY3QgdG8gYnJpbmcgaXQgaW50byBwYXJpdHkgd2l0aCBGbGFzaCBPYmplY3Rcblx0XHRmb3IgKG0gaW4gbWVqcy5IdG1sTWVkaWFFbGVtZW50KSB7XG5cdFx0XHRodG1sTWVkaWFFbGVtZW50W21dID0gbWVqcy5IdG1sTWVkaWFFbGVtZW50W21dO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0Q2hyb21lIG5vdyBzdXBwb3J0cyBwcmVsb2FkPVwibm9uZVwiXG5cdFx0aWYgKG1lanMuTWVkaWFGZWF0dXJlcy5pc0Nocm9tZSkge1xuXHRcdFxuXHRcdFx0Ly8gc3BlY2lhbCBjYXNlIHRvIGVuZm9yY2UgcHJlbG9hZCBhdHRyaWJ1dGUgKENocm9tZSBkb2Vzbid0IHJlc3BlY3QgdGhpcylcblx0XHRcdGlmIChwcmVsb2FkID09PSAnbm9uZScgJiYgIWF1dG9wbGF5KSB7XG5cdFx0XHRcblx0XHRcdFx0Ly8gZm9yY2VzIHRoZSBicm93c2VyIHRvIHN0b3AgbG9hZGluZyAobm90ZTogZmFpbHMgaW4gSUU5KVxuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9ICcnO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmxvYWQoKTtcblx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5jYW5jZWxlZFByZWxvYWQgPSB0cnVlO1xuXG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKGh0bWxNZWRpYUVsZW1lbnQuY2FuY2VsZWRQcmVsb2FkKSB7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnNyYyA9IHBsYXliYWNrLnVybDtcblx0XHRcdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRcdFx0aHRtbE1lZGlhRWxlbWVudC5wbGF5KCk7XG5cdFx0XHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LmNhbmNlbGVkUHJlbG9hZCA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0Ly8gZm9yIHNvbWUgcmVhc29uIENocm9tZSBmb3JnZXRzIGhvdyB0byBhdXRvcGxheSBzb21ldGltZXMuXG5cdFx0XHR9IGVsc2UgaWYgKGF1dG9wbGF5KSB7XG5cdFx0XHRcdGh0bWxNZWRpYUVsZW1lbnQubG9hZCgpO1xuXHRcdFx0XHRodG1sTWVkaWFFbGVtZW50LnBsYXkoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ki9cblxuXHRcdC8vIGZpcmUgc3VjY2VzcyBjb2RlXG5cdFx0b3B0aW9ucy5zdWNjZXNzKGh0bWxNZWRpYUVsZW1lbnQsIGh0bWxNZWRpYUVsZW1lbnQpO1xuXHRcdFxuXHRcdHJldHVybiBodG1sTWVkaWFFbGVtZW50O1xuXHR9XG59O1xuXG4vKlxuIC0gdGVzdCBvbiBJRSAob2JqZWN0IHZzLiBlbWJlZClcbiAtIGRldGVybWluZSB3aGVuIHRvIHVzZSBpZnJhbWUgKEZpcmVmb3gsIFNhZmFyaSwgTW9iaWxlKSB2cy4gRmxhc2ggKENocm9tZSwgSUUpXG4gLSBmdWxsc2NyZWVuP1xuKi9cblxuLy8gWW91VHViZSBGbGFzaCBhbmQgSWZyYW1lIEFQSVxubWVqcy5Zb3VUdWJlQXBpID0ge1xuXHRpc0lmcmFtZVN0YXJ0ZWQ6IGZhbHNlLFxuXHRpc0lmcmFtZUxvYWRlZDogZmFsc2UsXG5cdGxvYWRJZnJhbWVBcGk6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5pc0lmcmFtZVN0YXJ0ZWQpIHtcblx0XHRcdHZhciB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0XHRcdHRhZy5zcmMgPSBcIi8vd3d3LnlvdXR1YmUuY29tL3BsYXllcl9hcGlcIjtcblx0XHRcdHZhciBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcblx0XHRcdGZpcnN0U2NyaXB0VGFnLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhZywgZmlyc3RTY3JpcHRUYWcpO1xuXHRcdFx0dGhpcy5pc0lmcmFtZVN0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0fSxcblx0aWZyYW1lUXVldWU6IFtdLFxuXHRlbnF1ZXVlSWZyYW1lOiBmdW5jdGlvbih5dCkge1xuXHRcdFxuXHRcdGlmICh0aGlzLmlzTG9hZGVkKSB7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZSh5dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9hZElmcmFtZUFwaSgpO1xuXHRcdFx0dGhpcy5pZnJhbWVRdWV1ZS5wdXNoKHl0KTtcblx0XHR9XG5cdH0sXG5cdGNyZWF0ZUlmcmFtZTogZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0XHRcblx0XHR2YXJcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQgPSBzZXR0aW5ncy5wbHVnaW5NZWRpYUVsZW1lbnQsXHRcblx0XHRwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKHNldHRpbmdzLmNvbnRhaW5lcklkLCB7XG5cdFx0XHRoZWlnaHQ6IHNldHRpbmdzLmhlaWdodCxcblx0XHRcdHdpZHRoOiBzZXR0aW5ncy53aWR0aCxcblx0XHRcdHZpZGVvSWQ6IHNldHRpbmdzLnZpZGVvSWQsXG5cdFx0XHRwbGF5ZXJWYXJzOiB7Y29udHJvbHM6MH0sXG5cdFx0XHRldmVudHM6IHtcblx0XHRcdFx0J29uUmVhZHknOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBob29rIHVwIGlmcmFtZSBvYmplY3QgdG8gTUVqc1xuXHRcdFx0XHRcdHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBwbGF5ZXI7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gaW5pdCBtZWpzXG5cdFx0XHRcdFx0bWVqcy5NZWRpYVBsdWdpbkJyaWRnZS5pbml0UGx1Z2luKHNldHRpbmdzLnBsdWdpbklkKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBjcmVhdGUgdGltZXJcblx0XHRcdFx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3RpbWV1cGRhdGUnKTtcblx0XHRcdFx0XHR9LCAyNTApO1x0XHRcdFx0XHRcblx0XHRcdFx0fSxcblx0XHRcdFx0J29uU3RhdGVDaGFuZ2UnOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUuZGF0YSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdFxuXHRjcmVhdGVFdmVudDogZnVuY3Rpb24gKHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCBldmVudE5hbWUpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0dHlwZTogZXZlbnROYW1lLFxuXHRcdFx0dGFyZ2V0OiBwbHVnaW5NZWRpYUVsZW1lbnRcblx0XHR9O1xuXG5cdFx0aWYgKHBsYXllciAmJiBwbGF5ZXIuZ2V0RHVyYXRpb24pIHtcblx0XHRcdFxuXHRcdFx0Ly8gdGltZSBcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IG9iai5jdXJyZW50VGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LmR1cmF0aW9uID0gb2JqLmR1cmF0aW9uID0gcGxheWVyLmdldER1cmF0aW9uKCk7XG5cdFx0XHRcblx0XHRcdC8vIHN0YXRlXG5cdFx0XHRvYmoucGF1c2VkID0gcGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZDtcblx0XHRcdG9iai5lbmRlZCA9IHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZDtcdFx0XHRcblx0XHRcdFxuXHRcdFx0Ly8gc291bmRcblx0XHRcdG9iai5tdXRlZCA9IHBsYXllci5pc011dGVkKCk7XG5cdFx0XHRvYmoudm9sdW1lID0gcGxheWVyLmdldFZvbHVtZSgpIC8gMTAwO1xuXHRcdFx0XG5cdFx0XHQvLyBwcm9ncmVzc1xuXHRcdFx0b2JqLmJ5dGVzVG90YWwgPSBwbGF5ZXIuZ2V0VmlkZW9CeXRlc1RvdGFsKCk7XG5cdFx0XHRvYmouYnVmZmVyZWRCeXRlcyA9IHBsYXllci5nZXRWaWRlb0J5dGVzTG9hZGVkKCk7XG5cdFx0XHRcblx0XHRcdC8vIGZha2UgdGhlIFczQyBidWZmZXJlZCBUaW1lUmFuZ2Vcblx0XHRcdHZhciBidWZmZXJlZFRpbWUgPSBvYmouYnVmZmVyZWRCeXRlcyAvIG9iai5ieXRlc1RvdGFsICogb2JqLmR1cmF0aW9uO1xuXHRcdFx0XG5cdFx0XHRvYmoudGFyZ2V0LmJ1ZmZlcmVkID0gb2JqLmJ1ZmZlcmVkID0ge1xuXHRcdFx0XHRzdGFydDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5kOiBmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0XHRyZXR1cm4gYnVmZmVyZWRUaW1lO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRsZW5ndGg6IDFcblx0XHRcdH07XG5cblx0XHR9XG5cdFx0XG5cdFx0Ly8gc2VuZCBldmVudCB1cCB0aGUgY2hhaW5cblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZGlzcGF0Y2hFdmVudChvYmoudHlwZSwgb2JqKTtcblx0fSxcdFxuXHRcblx0aUZyYW1lUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuaXNMb2FkZWQgPSB0cnVlO1xuXHRcdHRoaXMuaXNJZnJhbWVMb2FkZWQgPSB0cnVlO1xuXHRcdFxuXHRcdHdoaWxlICh0aGlzLmlmcmFtZVF1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuaWZyYW1lUXVldWUucG9wKCk7XG5cdFx0XHR0aGlzLmNyZWF0ZUlmcmFtZShzZXR0aW5ncyk7XG5cdFx0fVx0XG5cdH0sXG5cdFxuXHQvLyBGTEFTSCFcblx0Zmxhc2hQbGF5ZXJzOiB7fSxcblx0Y3JlYXRlRmxhc2g6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0XG5cdFx0dGhpcy5mbGFzaFBsYXllcnNbc2V0dGluZ3MucGx1Z2luSWRdID0gc2V0dGluZ3M7XG5cdFx0XG5cdFx0Lypcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCIvL3d3dy55b3V0dWJlLmNvbS9hcGlwbGF5ZXI/ZW5hYmxlanNhcGk9MSZhbXA7cGxheWVyYXBpaWQ9JyArIHNldHRpbmdzLnBsdWdpbklkICArICcmYW1wO3ZlcnNpb249MyZhbXA7YXV0b3BsYXk9MCZhbXA7Y29udHJvbHM9MCZhbXA7bW9kZXN0YnJhbmRpbmc9MSZsb29wPTBcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0Ki9cblxuXHRcdHZhciBzcGVjaWFsSUVDb250YWluZXIsXG5cdFx0XHR5b3V0dWJlVXJsID0gJy8vd3d3LnlvdXR1YmUuY29tL2FwaXBsYXllcj9lbmFibGVqc2FwaT0xJmFtcDtwbGF5ZXJhcGlpZD0nICsgc2V0dGluZ3MucGx1Z2luSWQgICsgJyZhbXA7dmVyc2lvbj0zJmFtcDthdXRvcGxheT0wJmFtcDtjb250cm9scz0wJmFtcDttb2Rlc3RicmFuZGluZz0xJmxvb3A9MCc7XG5cdFx0XHRcblx0XHRpZiAobWVqcy5NZWRpYUZlYXR1cmVzLmlzSUUpIHtcblx0XHRcdFxuXHRcdFx0c3BlY2lhbElFQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRzZXR0aW5ncy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc3BlY2lhbElFQ29udGFpbmVyKTtcblx0XHRcdHNwZWNpYWxJRUNvbnRhaW5lci5vdXRlckhUTUwgPSAnPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCIvL2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYlwiICcgK1xuJ2lkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIHdpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgY2xhc3M9XCJtZWpzLXNoaW1cIj4nICtcblx0JzxwYXJhbSBuYW1lPVwibW92aWVcIiB2YWx1ZT1cIicgKyB5b3V0dWJlVXJsICsgJ1wiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiIC8+JyArXG5cdCc8cGFyYW0gbmFtZT1cImFsbG93U2NyaXB0QWNjZXNzXCIgdmFsdWU9XCJhbHdheXNcIiAvPicgK1xuXHQnPHBhcmFtIG5hbWU9XCJhbGxvd0Z1bGxTY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPicgK1xuJzwvb2JqZWN0Pic7XG5cdFx0fSBlbHNlIHtcblx0XHRzZXR0aW5ncy5jb250YWluZXIuaW5uZXJIVE1MID1cblx0XHRcdCc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGlkPVwiJyArIHNldHRpbmdzLnBsdWdpbklkICsgJ1wiIGRhdGE9XCInICsgeW91dHViZVVybCArICdcIiAnICtcblx0XHRcdFx0J3dpZHRoPVwiJyArIHNldHRpbmdzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBzZXR0aW5ncy5oZWlnaHQgKyAnXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiB2aXNpYmxlOyBcIiBjbGFzcz1cIm1lanMtc2hpbVwiPicgK1xuXHRcdFx0XHQnPHBhcmFtIG5hbWU9XCJhbGxvd1NjcmlwdEFjY2Vzc1wiIHZhbHVlPVwiYWx3YXlzXCI+JyArXG5cdFx0XHRcdCc8cGFyYW0gbmFtZT1cIndtb2RlXCIgdmFsdWU9XCJ0cmFuc3BhcmVudFwiPicgK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG5cdFx0fVx0XHRcblx0XHRcblx0fSxcblx0XG5cdGZsYXNoUmVhZHk6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyXG5cdFx0XHRzZXR0aW5ncyA9IHRoaXMuZmxhc2hQbGF5ZXJzW2lkXSxcblx0XHRcdHBsYXllciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSxcblx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudCA9IHNldHRpbmdzLnBsdWdpbk1lZGlhRWxlbWVudDtcblx0XHRcblx0XHQvLyBob29rIHVwIGFuZCByZXR1cm4gdG8gTWVkaWFFTGVtZW50UGxheWVyLnN1Y2Nlc3NcdFxuXHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wbHVnaW5BcGkgPSBcblx0XHRwbHVnaW5NZWRpYUVsZW1lbnQucGx1Z2luRWxlbWVudCA9IHBsYXllcjtcblx0XHRtZWpzLk1lZGlhUGx1Z2luQnJpZGdlLmluaXRQbHVnaW4oaWQpO1xuXHRcdFxuXHRcdC8vIGxvYWQgdGhlIHlvdXR1YmUgdmlkZW9cblx0XHRwbGF5ZXIuY3VlVmlkZW9CeUlkKHNldHRpbmdzLnZpZGVvSWQpO1xuXHRcdFxuXHRcdHZhciBjYWxsYmFja05hbWUgPSBzZXR0aW5ncy5jb250YWluZXJJZCArICdfY2FsbGJhY2snO1xuXHRcdFxuXHRcdHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZSkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmhhbmRsZVN0YXRlQ2hhbmdlKGUsIHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50KTtcblx0XHR9XG5cdFx0XG5cdFx0cGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ29uU3RhdGVDaGFuZ2UnLCBjYWxsYmFja05hbWUpO1xuXHRcdFxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAndGltZXVwZGF0ZScpO1xuXHRcdH0sIDI1MCk7XG5cdFx0XG5cdFx0bWVqcy5Zb3VUdWJlQXBpLmNyZWF0ZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnY2FucGxheScpO1xuXHR9LFxuXHRcblx0aGFuZGxlU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKHlvdVR1YmVTdGF0ZSwgcGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQpIHtcblx0XHRzd2l0Y2ggKHlvdVR1YmVTdGF0ZSkge1xuXHRcdFx0Y2FzZSAtMTogLy8gbm90IHN0YXJ0ZWRcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IHRydWU7XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5lbmRlZCA9IHRydWU7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ2xvYWRlZG1ldGFkYXRhJyk7XG5cdFx0XHRcdC8vY3JlYXRlWW91VHViZUV2ZW50KHBsYXllciwgcGx1Z2luTWVkaWFFbGVtZW50LCAnbG9hZGVkZGF0YScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSB0cnVlO1xuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdlbmRlZCcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cGx1Z2luTWVkaWFFbGVtZW50LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwbGF5Jyk7XG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3BsYXlpbmcnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHBsdWdpbk1lZGlhRWxlbWVudC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHRwbHVnaW5NZWRpYUVsZW1lbnQuZW5kZWQgPSBmYWxzZTtcdFx0XHRcdFxuXHRcdFx0XHRtZWpzLllvdVR1YmVBcGkuY3JlYXRlRXZlbnQocGxheWVyLCBwbHVnaW5NZWRpYUVsZW1lbnQsICdwYXVzZScpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzogLy8gYnVmZmVyaW5nXG5cdFx0XHRcdG1lanMuWW91VHViZUFwaS5jcmVhdGVFdmVudChwbGF5ZXIsIHBsdWdpbk1lZGlhRWxlbWVudCwgJ3Byb2dyZXNzJyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHQvLyBjdWVkP1xuXHRcdFx0XHRicmVhaztcdFx0XHRcdFx0XHRcblx0XHRcdFxuXHRcdH1cdFx0XHRcblx0XHRcblx0fVxufVxuLy8gSUZSQU1FXG5mdW5jdGlvbiBvbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmlGcmFtZVJlYWR5KCk7XG59XG4vLyBGTEFTSFxuZnVuY3Rpb24gb25Zb3VUdWJlUGxheWVyUmVhZHkoaWQpIHtcblx0bWVqcy5Zb3VUdWJlQXBpLmZsYXNoUmVhZHkoaWQpO1xufVxuXG53aW5kb3cubWVqcyA9IG1lanM7XG53aW5kb3cuTWVkaWFFbGVtZW50ID0gbWVqcy5NZWRpYUVsZW1lbnQ7XG5cbi8qXG4gKiBBZGRzIEludGVybmF0aW9uYWxpemF0aW9uIGFuZCBsb2NhbGl6YXRpb24gdG8gbWVkaWFlbGVtZW50LlxuICpcbiAqIFRoaXMgZmlsZSBkb2VzIG5vdCBjb250YWluIHRyYW5zbGF0aW9ucywgeW91IGhhdmUgdG8gYWRkIHRoZW0gbWFudWFsbHkuXG4gKiBUaGUgc2NoZW1hIGlzIGFsd2F5cyB0aGUgc2FtZTogbWUtaTE4bi1sb2NhbGUtW0lFVEYtbGFuZ3VhZ2UtdGFnXS5qc1xuICpcbiAqIEV4YW1wbGVzIGFyZSBwcm92aWRlZCBib3RoIGZvciBnZXJtYW4gYW5kIGNoaW5lc2UgdHJhbnNsYXRpb24uXG4gKlxuICpcbiAqIFdoYXQgaXMgdGhlIGNvbmNlcHQgYmV5b25kIGkxOG4/XG4gKiAgIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSW50ZXJuYXRpb25hbGl6YXRpb25fYW5kX2xvY2FsaXphdGlvblxuICpcbiAqIFdoYXQgbGFuZ2NvZGUgc2hvdWxkIGkgdXNlP1xuICogICBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lFVEZfbGFuZ3VhZ2VfdGFnXG4gKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM1NjQ2XG4gKlxuICpcbiAqIExpY2Vuc2U/XG4gKlxuICogICBUaGUgaTE4biBmaWxlIHVzZXMgbWV0aG9kcyBmcm9tIHRoZSBEcnVwYWwgcHJvamVjdCAoZHJ1cGFsLmpzKTpcbiAqICAgICAtIGkxOG4ubWV0aG9kcy50KCkgKG1vZGlmaWVkKVxuICogICAgIC0gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oKSAoZnVsbCBjb3B5KVxuICpcbiAqICAgVGhlIERydXBhbCBwcm9qZWN0IGlzIChsaWtlIG1lZGlhZWxlbWVudGpzKSBsaWNlbnNlZCB1bmRlciBHUEx2Mi5cbiAqICAgIC0gaHR0cDovL2RydXBhbC5vcmcvbGljZW5zaW5nL2ZhcS8jcTFcbiAqICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2pvaG5keWVyL21lZGlhZWxlbWVudFxuICogICAgLSBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvb2xkLWxpY2Vuc2VzL2dwbC0yLjAuaHRtbFxuICpcbiAqXG4gKiBAYXV0aG9yXG4gKiAgIFRpbSBMYXR6IChsYXR6LnRpbUBnbWFpbC5jb20pXG4gKlxuICpcbiAqIEBwYXJhbXNcbiAqICAtIGNvbnRleHQgLSBkb2N1bWVudCwgaWZyYW1lIC4uXG4gKiAgLSBleHBvcnRzIC0gQ29tbW9uSlMsIHdpbmRvdyAuLlxuICpcbiAqL1xuOyhmdW5jdGlvbihjb250ZXh0LCBleHBvcnRzLCB1bmRlZmluZWQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBpMThuID0ge1xuICAgICAgICBcImxvY2FsZVwiOiB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgcHJldmlvdXMgdmFsdWVzIGFyZW4ndCBvdmVyd3JpdHRlbi5cbiAgICAgICAgICAgIFwibGFuZ3VhZ2VcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5sYW5ndWFnZSkgfHwgJycsXG4gICAgICAgICAgICBcInN0cmluZ3NcIiA6IChleHBvcnRzLmkxOG4gJiYgZXhwb3J0cy5pMThuLmxvY2FsZS5zdHJpbmdzKSB8fCB7fVxuICAgICAgICB9LFxuICAgICAgICBcImlldGZfbGFuZ19yZWdleFwiIDogL14oeFxcLSk/W2Etel17Mix9KFxcLVxcd3syLH0pPyhcXC1cXHd7Mix9KT8kLyxcbiAgICAgICAgXCJtZXRob2RzXCIgOiB7fVxuICAgIH07XG4vLyBzdGFydCBpMThuXG5cblxuICAgIC8qKlxuICAgICAqIEdldCBsYW5ndWFnZSwgZmFsbGJhY2sgdG8gYnJvd3NlcidzIGxhbmd1YWdlIGlmIGVtcHR5XG4gICAgICpcbiAgICAgKiBJRVRGOiBSRkMgNTY0NiwgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU2NDZcbiAgICAgKiBFeGFtcGxlczogZW4sIHpoLUNOLCBjbW4tSGFucy1DTiwgc3ItTGF0bi1SUywgZXMtNDE5LCB4LXByaXZhdGVcbiAgICAgKi9cbiAgICBpMThuLmdldExhbmd1YWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFuZ3VhZ2UgPSBpMThuLmxvY2FsZS5sYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJMYW5ndWFnZSB8fCB3aW5kb3cubmF2aWdhdG9yLmxhbmd1YWdlO1xuICAgICAgICByZXR1cm4gaTE4bi5pZXRmX2xhbmdfcmVnZXguZXhlYyhsYW5ndWFnZSkgPyBsYW5ndWFnZSA6IG51bGw7XG5cbiAgICAgICAgLy8oV0FTOiBjb252ZXJ0IHRvIGlzbyA2MzktMSAoMi1sZXR0ZXJzLCBsb3dlciBjYXNlKSlcbiAgICAgICAgLy9yZXR1cm4gbGFuZ3VhZ2Uuc3Vic3RyKDAsIDIpLnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIC8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbiAgICBpZiAoIHR5cGVvZiBtZWpzTDEwbiAhPSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaTE4bi5sb2NhbGUubGFuZ3VhZ2UgPSBtZWpzTDEwbi5sYW5ndWFnZTtcbiAgICB9XG5cblxuXG4gICAgLyoqXG4gICAgICogRW5jb2RlIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBhIHBsYWluLXRleHQgc3RyaW5nIGZvciBkaXNwbGF5IGFzIEhUTUwuXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBjaGFyYWN0ZXIsIHJlZ2V4LFxuICAgICAgICByZXBsYWNlID0ge1xuICAgICAgICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICAgICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICAgICAgICc+JzogJyZndDsnXG4gICAgICAgIH07XG4gICAgICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgICAgICBmb3IgKGNoYXJhY3RlciBpbiByZXBsYWNlKSB7XG4gICAgICAgICAgICBpZiAocmVwbGFjZS5oYXNPd25Qcm9wZXJ0eShjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKGNoYXJhY3RlciwgJ2cnKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShyZWdleCwgcmVwbGFjZVtjaGFyYWN0ZXJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGUgc3RyaW5ncyB0byB0aGUgcGFnZSBsYW5ndWFnZSBvciBhIGdpdmVuIGxhbmd1YWdlLlxuICAgICAqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyXG4gICAgICogICBBIHN0cmluZyBjb250YWluaW5nIHRoZSBFbmdsaXNoIHN0cmluZyB0byB0cmFuc2xhdGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAgLSAnY29udGV4dCcgKGRlZmF1bHRzIHRvIHRoZSBkZWZhdWx0IGNvbnRleHQpOiBUaGUgY29udGV4dCB0aGUgc291cmNlIHN0cmluZ1xuICAgICAqICAgICBiZWxvbmdzIHRvLlxuICAgICAqXG4gICAgICogQHJldHVyblxuICAgICAqICAgVGhlIHRyYW5zbGF0ZWQgc3RyaW5nLCBlc2NhcGVkIHZpYSBpMThuLm1ldGhvZHMuY2hlY2tQbGFpbigpXG4gICAgICovXG4gICAgaTE4bi5tZXRob2RzLnQgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIGxvY2FsaXplZCB2ZXJzaW9uIG9mIHRoZSBzdHJpbmcuXG4gICAgICAgIGlmIChpMThuLmxvY2FsZS5zdHJpbmdzICYmIGkxOG4ubG9jYWxlLnN0cmluZ3Nbb3B0aW9ucy5jb250ZXh0XSAmJiBpMThuLmxvY2FsZS5zdHJpbmdzW29wdGlvbnMuY29udGV4dF1bc3RyXSkge1xuICAgICAgICAgICAgc3RyID0gaTE4bi5sb2NhbGUuc3RyaW5nc1tvcHRpb25zLmNvbnRleHRdW3N0cl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaTE4bi5tZXRob2RzLmNoZWNrUGxhaW4oc3RyKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGVyIGZvciBpMThuLm1ldGhvZHMudCgpXG4gICAgICpcbiAgICAgKiBAc2VlIGkxOG4ubWV0aG9kcy50KClcbiAgICAgKiBAdGhyb3dzIEludmFsaWRBcmd1bWVudEV4Y2VwdGlvblxuICAgICAqL1xuICAgIGkxOG4udCA9IGZ1bmN0aW9uKHN0ciwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyAmJiBzdHIubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAvLyBjaGVjayBldmVyeSB0aW1lIGR1ZSBsYW5ndWFnZSBjYW4gY2hhbmdlIGZvclxuICAgICAgICAgICAgLy8gZGlmZmVyZW50IHJlYXNvbnMgKHRyYW5zbGF0aW9uLCBsYW5nIHN3aXRjaGVyIC4uKVxuICAgICAgICAgICAgdmFyIGxhbmd1YWdlID0gaTE4bi5nZXRMYW5ndWFnZSgpO1xuXG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgXCJjb250ZXh0XCIgOiBsYW5ndWFnZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGkxOG4ubWV0aG9kcy50KHN0ciwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyB7XG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgOiAnSW52YWxpZEFyZ3VtZW50RXhjZXB0aW9uJyxcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIiA6ICdGaXJzdCBhcmd1bWVudCBpcyBlaXRoZXIgbm90IGEgc3RyaW5nIG9yIGVtcHR5LidcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4vLyBlbmQgaTE4blxuICAgIGV4cG9ydHMuaTE4biA9IGkxOG47XG59KGRvY3VtZW50LCBtZWpzKSk7XG5cbi8vIGkxOG4gZml4ZXMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JkUHJlc3NcbjsoZnVuY3Rpb24oZXhwb3J0cywgdW5kZWZpbmVkKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICggdHlwZW9mIG1lanNMMTBuICE9ICd1bmRlZmluZWQnICkge1xuICAgICAgICBleHBvcnRzW21lanNMMTBuLmxhbmd1YWdlXSA9IG1lanNMMTBuLnN0cmluZ3M7XG4gICAgfVxuXG59KG1lanMuaTE4bi5sb2NhbGUuc3RyaW5ncykpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkL21lZGlhZWxlbWVudC5qc1wiLFwiLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbWVkaWFlbGVtZW50L2J1aWxkXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypcclxuKiBsb2dsZXZlbCAtIGh0dHBzOi8vZ2l0aHViLmNvbS9waW10ZXJyeS9sb2dsZXZlbFxyXG4qXHJcbiogQ29weXJpZ2h0IChjKSAyMDEzIFRpbSBQZXJyeVxyXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuKi9cclxuKGZ1bmN0aW9uIChyb290LCBkZWZpbml0aW9uKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIGRlZmluZShkZWZpbml0aW9uKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm9vdC5sb2cgPSBkZWZpbml0aW9uKCk7XHJcbiAgICB9XHJcbn0odGhpcywgZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge307XHJcbiAgICB2YXIgdW5kZWZpbmVkVHlwZSA9IFwidW5kZWZpbmVkXCI7XHJcblxyXG4gICAgZnVuY3Rpb24gcmVhbE1ldGhvZChtZXRob2ROYW1lKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSB1bmRlZmluZWRUeXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gV2UgY2FuJ3QgYnVpbGQgYSByZWFsIG1ldGhvZCB3aXRob3V0IGEgY29uc29sZSB0byBsb2cgdG9cclxuICAgICAgICB9IGVsc2UgaWYgKGNvbnNvbGVbbWV0aG9kTmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmluZE1ldGhvZChjb25zb2xlLCBtZXRob2ROYW1lKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbnNvbGUubG9nICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJpbmRNZXRob2QoY29uc29sZSwgJ2xvZycpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub29wO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBiaW5kTWV0aG9kKG9iaiwgbWV0aG9kTmFtZSkge1xyXG4gICAgICAgIHZhciBtZXRob2QgPSBvYmpbbWV0aG9kTmFtZV07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QuYmluZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kLmJpbmQob2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwobWV0aG9kLCBvYmopO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBNaXNzaW5nIGJpbmQgc2hpbSBvciBJRTggKyBNb2Rlcm5penIsIGZhbGxiYWNrIHRvIHdyYXBwaW5nXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5hcHBseShtZXRob2QsIFtvYmosIGFyZ3VtZW50c10pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGVzZSBwcml2YXRlIGZ1bmN0aW9ucyBhbHdheXMgbmVlZCBgdGhpc2AgdG8gYmUgc2V0IHByb3Blcmx5XHJcblxyXG4gICAgZnVuY3Rpb24gZW5hYmxlTG9nZ2luZ1doZW5Db25zb2xlQXJyaXZlcyhtZXRob2ROYW1lLCBsZXZlbCwgbG9nZ2VyTmFtZSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gdW5kZWZpbmVkVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmVwbGFjZUxvZ2dpbmdNZXRob2RzLmNhbGwodGhpcywgbGV2ZWwsIGxvZ2dlck5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpc1ttZXRob2ROYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXBsYWNlTG9nZ2luZ01ldGhvZHMobGV2ZWwsIGxvZ2dlck5hbWUpIHtcclxuICAgICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9nTWV0aG9kcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kTmFtZSA9IGxvZ01ldGhvZHNbaV07XHJcbiAgICAgICAgICAgIHRoaXNbbWV0aG9kTmFtZV0gPSAoaSA8IGxldmVsKSA/XHJcbiAgICAgICAgICAgICAgICBub29wIDpcclxuICAgICAgICAgICAgICAgIHRoaXMubWV0aG9kRmFjdG9yeShtZXRob2ROYW1lLCBsZXZlbCwgbG9nZ2VyTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlZmF1bHRNZXRob2RGYWN0b3J5KG1ldGhvZE5hbWUsIGxldmVsLCBsb2dnZXJOYW1lKSB7XHJcbiAgICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cclxuICAgICAgICByZXR1cm4gcmVhbE1ldGhvZChtZXRob2ROYW1lKSB8fFxyXG4gICAgICAgICAgICAgICBlbmFibGVMb2dnaW5nV2hlbkNvbnNvbGVBcnJpdmVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxvZ01ldGhvZHMgPSBbXHJcbiAgICAgICAgXCJ0cmFjZVwiLFxyXG4gICAgICAgIFwiZGVidWdcIixcclxuICAgICAgICBcImluZm9cIixcclxuICAgICAgICBcIndhcm5cIixcclxuICAgICAgICBcImVycm9yXCJcclxuICAgIF07XHJcblxyXG4gICAgZnVuY3Rpb24gTG9nZ2VyKG5hbWUsIGRlZmF1bHRMZXZlbCwgZmFjdG9yeSkge1xyXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHZhciBjdXJyZW50TGV2ZWw7XHJcbiAgICAgIHZhciBzdG9yYWdlS2V5ID0gXCJsb2dsZXZlbFwiO1xyXG4gICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgIHN0b3JhZ2VLZXkgKz0gXCI6XCIgKyBuYW1lO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBwZXJzaXN0TGV2ZWxJZlBvc3NpYmxlKGxldmVsTnVtKSB7XHJcbiAgICAgICAgICB2YXIgbGV2ZWxOYW1lID0gKGxvZ01ldGhvZHNbbGV2ZWxOdW1dIHx8ICdzaWxlbnQnKS50b1VwcGVyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgIC8vIFVzZSBsb2NhbFN0b3JhZ2UgaWYgYXZhaWxhYmxlXHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Vbc3RvcmFnZUtleV0gPSBsZXZlbE5hbWU7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxyXG5cclxuICAgICAgICAgIC8vIFVzZSBzZXNzaW9uIGNvb2tpZSBhcyBmYWxsYmFja1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuY29va2llID1cclxuICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdG9yYWdlS2V5KSArIFwiPVwiICsgbGV2ZWxOYW1lICsgXCI7XCI7XHJcbiAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldFBlcnNpc3RlZExldmVsKCkge1xyXG4gICAgICAgICAgdmFyIHN0b3JlZExldmVsO1xyXG5cclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgc3RvcmVkTGV2ZWwgPSB3aW5kb3cubG9jYWxTdG9yYWdlW3N0b3JhZ2VLZXldO1xyXG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxyXG5cclxuICAgICAgICAgIGlmICh0eXBlb2Ygc3RvcmVkTGV2ZWwgPT09IHVuZGVmaW5lZFR5cGUpIHtcclxuICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICB2YXIgY29va2llID0gd2luZG93LmRvY3VtZW50LmNvb2tpZTtcclxuICAgICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gY29va2llLmluZGV4T2YoXHJcbiAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RvcmFnZUtleSkgKyBcIj1cIik7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgc3RvcmVkTGV2ZWwgPSAvXihbXjtdKykvLmV4ZWMoY29va2llLnNsaWNlKGxvY2F0aW9uKSlbMV07XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gSWYgdGhlIHN0b3JlZCBsZXZlbCBpcyBub3QgdmFsaWQsIHRyZWF0IGl0IGFzIGlmIG5vdGhpbmcgd2FzIHN0b3JlZC5cclxuICAgICAgICAgIGlmIChzZWxmLmxldmVsc1tzdG9yZWRMZXZlbF0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIHN0b3JlZExldmVsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBzdG9yZWRMZXZlbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICpcclxuICAgICAgICogUHVibGljIEFQSVxyXG4gICAgICAgKlxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHNlbGYubGV2ZWxzID0geyBcIlRSQUNFXCI6IDAsIFwiREVCVUdcIjogMSwgXCJJTkZPXCI6IDIsIFwiV0FSTlwiOiAzLFxyXG4gICAgICAgICAgXCJFUlJPUlwiOiA0LCBcIlNJTEVOVFwiOiA1fTtcclxuXHJcbiAgICAgIHNlbGYubWV0aG9kRmFjdG9yeSA9IGZhY3RvcnkgfHwgZGVmYXVsdE1ldGhvZEZhY3Rvcnk7XHJcblxyXG4gICAgICBzZWxmLmdldExldmVsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnRMZXZlbDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNlbGYuc2V0TGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWwsIHBlcnNpc3QpIHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgbGV2ZWwgPT09IFwic3RyaW5nXCIgJiYgc2VsZi5sZXZlbHNbbGV2ZWwudG9VcHBlckNhc2UoKV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIGxldmVsID0gc2VsZi5sZXZlbHNbbGV2ZWwudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGxldmVsID09PSBcIm51bWJlclwiICYmIGxldmVsID49IDAgJiYgbGV2ZWwgPD0gc2VsZi5sZXZlbHMuU0lMRU5UKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudExldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgICAgICAgaWYgKHBlcnNpc3QgIT09IGZhbHNlKSB7ICAvLyBkZWZhdWx0cyB0byB0cnVlXHJcbiAgICAgICAgICAgICAgICAgIHBlcnNpc3RMZXZlbElmUG9zc2libGUobGV2ZWwpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXBsYWNlTG9nZ2luZ01ldGhvZHMuY2FsbChzZWxmLCBsZXZlbCwgbmFtZSk7XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSB1bmRlZmluZWRUeXBlICYmIGxldmVsIDwgc2VsZi5sZXZlbHMuU0lMRU5UKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBcIk5vIGNvbnNvbGUgYXZhaWxhYmxlIGZvciBsb2dnaW5nXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aHJvdyBcImxvZy5zZXRMZXZlbCgpIGNhbGxlZCB3aXRoIGludmFsaWQgbGV2ZWw6IFwiICsgbGV2ZWw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzZWxmLnNldERlZmF1bHRMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbCkge1xyXG4gICAgICAgICAgaWYgKCFnZXRQZXJzaXN0ZWRMZXZlbCgpKSB7XHJcbiAgICAgICAgICAgICAgc2VsZi5zZXRMZXZlbChsZXZlbCwgZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2VsZi5lbmFibGVBbGwgPSBmdW5jdGlvbihwZXJzaXN0KSB7XHJcbiAgICAgICAgICBzZWxmLnNldExldmVsKHNlbGYubGV2ZWxzLlRSQUNFLCBwZXJzaXN0KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNlbGYuZGlzYWJsZUFsbCA9IGZ1bmN0aW9uKHBlcnNpc3QpIHtcclxuICAgICAgICAgIHNlbGYuc2V0TGV2ZWwoc2VsZi5sZXZlbHMuU0lMRU5ULCBwZXJzaXN0KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgd2l0aCB0aGUgcmlnaHQgbGV2ZWxcclxuICAgICAgdmFyIGluaXRpYWxMZXZlbCA9IGdldFBlcnNpc3RlZExldmVsKCk7XHJcbiAgICAgIGlmIChpbml0aWFsTGV2ZWwgPT0gbnVsbCkge1xyXG4gICAgICAgICAgaW5pdGlhbExldmVsID0gZGVmYXVsdExldmVsID09IG51bGwgPyBcIldBUk5cIiA6IGRlZmF1bHRMZXZlbDtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnNldExldmVsKGluaXRpYWxMZXZlbCwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKlxyXG4gICAgICogUGFja2FnZS1sZXZlbCBBUElcclxuICAgICAqXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgZGVmYXVsdExvZ2dlciA9IG5ldyBMb2dnZXIoKTtcclxuXHJcbiAgICB2YXIgX2xvZ2dlcnNCeU5hbWUgPSB7fTtcclxuICAgIGRlZmF1bHRMb2dnZXIuZ2V0TG9nZ2VyID0gZnVuY3Rpb24gZ2V0TG9nZ2VyKG5hbWUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwic3RyaW5nXCIgfHwgbmFtZSA9PT0gXCJcIikge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHN1cHBseSBhIG5hbWUgd2hlbiBjcmVhdGluZyBhIGxvZ2dlci5cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbG9nZ2VyID0gX2xvZ2dlcnNCeU5hbWVbbmFtZV07XHJcbiAgICAgICAgaWYgKCFsb2dnZXIpIHtcclxuICAgICAgICAgIGxvZ2dlciA9IF9sb2dnZXJzQnlOYW1lW25hbWVdID0gbmV3IExvZ2dlcihcclxuICAgICAgICAgICAgbmFtZSwgZGVmYXVsdExvZ2dlci5nZXRMZXZlbCgpLCBkZWZhdWx0TG9nZ2VyLm1ldGhvZEZhY3RvcnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbG9nZ2VyO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBHcmFiIHRoZSBjdXJyZW50IGdsb2JhbCBsb2cgdmFyaWFibGUgaW4gY2FzZSBvZiBvdmVyd3JpdGVcclxuICAgIHZhciBfbG9nID0gKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUpID8gd2luZG93LmxvZyA6IHVuZGVmaW5lZDtcclxuICAgIGRlZmF1bHRMb2dnZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSB1bmRlZmluZWRUeXBlICYmXHJcbiAgICAgICAgICAgICAgIHdpbmRvdy5sb2cgPT09IGRlZmF1bHRMb2dnZXIpIHtcclxuICAgICAgICAgICAgd2luZG93LmxvZyA9IF9sb2c7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZGVmYXVsdExvZ2dlcjtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIGRlZmF1bHRMb2dnZXI7XHJcbn0pKTtcclxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9sb2dsZXZlbC9saWIvbG9nbGV2ZWwuanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvbG9nbGV2ZWwvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEB0eXBlIHtDaGFwdGVyc31cbiAqL1xudmFyIENoYXB0ZXJzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NoYXB0ZXInKTtcbnZhciBsb2cgPSByZXF1aXJlKCcuL2xvZ2dpbmcnKS5nZXRMb2dnZXIoJ0NoYXB0ZXJzJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVRpbWVDb250cm9scygpIHtcbiAgcmV0dXJuICQoJzx1bCBjbGFzcz1cInRpbWVjb250cm9sYmFyXCI+PC91bD4nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQm94KCkge1xuICByZXR1cm4gJCgnPGRpdiBjbGFzcz1cImNvbnRyb2xiYXIgYmFyXCI+PC9kaXY+Jyk7XG59XG5cbmZ1bmN0aW9uIHBsYXllclN0YXJ0ZWQocGxheWVyKSB7XG4gIHJldHVybiAoKHR5cGVvZiBwbGF5ZXIuY3VycmVudFRpbWUgPT09ICdudW1iZXInKSAmJiAocGxheWVyLmN1cnJlbnRUaW1lID4gMCkpO1xufVxuXG5mdW5jdGlvbiBnZXRDb21iaW5lZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgbG9nLmRlYnVnKCdDb250cm9scycsICdjb250cm9sYnV0dG9uIGNsaWNrZWQnLCBldnQpO1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxvZy5kZWJ1ZygnQ29udHJvbHMnLCAncGxheWVyIHN0YXJ0ZWQ/JywgcGxheWVyU3RhcnRlZCh0aGlzLnBsYXllcikpO1xuICAgIGlmICghcGxheWVyU3RhcnRlZCh0aGlzLnBsYXllcikpIHtcbiAgICAgIHRoaXMucGxheWVyLnBsYXkoKTtcbiAgICB9XG4gICAgdmFyIGJvdW5kQ2FsbEJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgIGJvdW5kQ2FsbEJhY2soKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBpbnN0YW50aWF0ZSBuZXcgY29udHJvbHMgZWxlbWVudFxuICogQHBhcmFtIHtqUXVlcnl8SFRNTEVsZW1lbnR9IHBsYXllciBQbGF5ZXIgZWxlbWVudCByZWZlcmVuY2VcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lIFRpbWVsaW5lIG9iamVjdCBmb3IgdGhpcyBwbGF5ZXJcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBDb250cm9scyAodGltZWxpbmUpIHtcbiAgdGhpcy5wbGF5ZXIgPSB0aW1lbGluZS5wbGF5ZXI7XG4gIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgdGhpcy5ib3ggPSBjcmVhdGVCb3goKTtcbiAgdGhpcy50aW1lQ29udHJvbEVsZW1lbnQgPSBjcmVhdGVUaW1lQ29udHJvbHMoKTtcbiAgdGhpcy5ib3guYXBwZW5kKHRoaXMudGltZUNvbnRyb2xFbGVtZW50KTtcbn1cblxuLyoqXG4gKiBjcmVhdGUgdGltZSBjb250cm9sIGJ1dHRvbnMgYW5kIGFkZCB0aGVtIHRvIHRpbWVDb250cm9sRWxlbWVudFxuICogQHBhcmFtIHtudWxsfENoYXB0ZXJzfSBjaGFwdGVyTW9kdWxlIHdoZW4gcHJlc2VudCB3aWxsIGFkZCBuZXh0IGFuZCBwcmV2aW91cyBjaGFwdGVyIGNvbnRyb2xzXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuQ29udHJvbHMucHJvdG90eXBlLmNyZWF0ZVRpbWVDb250cm9scyA9IGZ1bmN0aW9uIChjaGFwdGVyTW9kdWxlKSB7XG4gIHZhciBoYXNDaGFwdGVycyA9IChjaGFwdGVyTW9kdWxlIGluc3RhbmNlb2YgQ2hhcHRlcnMpO1xuICBpZiAoIWhhc0NoYXB0ZXJzKSB7XG4gICAgbG9nLmluZm8oJ0NvbnRyb2xzJywgJ2NyZWF0ZVRpbWVDb250cm9scycsICdubyBjaGFwdGVyVGFiIGZvdW5kJyk7XG4gIH1cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1wcmV2aW91cy1jaGFwdGVyJywgJ1p1csO8Y2sgenVtIHZvcmlnZW4gS2FwaXRlbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhY3RpdmVDaGFwdGVyID0gY2hhcHRlck1vZHVsZS5nZXRBY3RpdmVDaGFwdGVyKCk7XG4gICAgICBpZiAodGhpcy50aW1lbGluZS5nZXRUaW1lKCkgPiBhY3RpdmVDaGFwdGVyLnN0YXJ0ICsgMTApIHtcbiAgICAgICAgbG9nLmRlYnVnKCdDb250cm9scycsICdadXLDvGNrIHp1bSBLYXBpdGVsYW5mYW5nJywgY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlciwgJ2Zyb20nLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgICAgIHJldHVybiBjaGFwdGVyTW9kdWxlLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICAgICAgfVxuICAgICAgbG9nLmRlYnVnKCdDb250cm9scycsICdadXLDvGNrIHp1bSB2b3JpZ2VuIEthcGl0ZWwnLCBjaGFwdGVyTW9kdWxlLmN1cnJlbnRDaGFwdGVyKTtcbiAgICAgIHJldHVybiBjaGFwdGVyTW9kdWxlLnByZXZpb3VzKCk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmNyZWF0ZUJ1dHRvbigncHdwLWNvbnRyb2xzLWJhY2stMzAnLCAnMzAgU2VrdW5kZW4genVyw7xjaycsIGZ1bmN0aW9uICgpIHtcbiAgICBsb2cuZGVidWcoJ0NvbnRyb2xzJywgJ3Jld2luZCBiZWZvcmUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgdGhpcy50aW1lbGluZS5zZXRUaW1lKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpIC0gMzApO1xuICAgIGxvZy5kZWJ1ZygnQ29udHJvbHMnLCAncmV3aW5kIGFmdGVyJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICB9KTtcblxuICB0aGlzLmNyZWF0ZUJ1dHRvbigncHdwLWNvbnRyb2xzLWZvcndhcmQtMzAnLCAnMzAgU2VrdW5kZW4gdm9yJywgZnVuY3Rpb24gKCkge1xuICAgIGxvZy5kZWJ1ZygnQ29udHJvbHMnLCAnZmZ3ZCBiZWZvcmUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gICAgdGhpcy50aW1lbGluZS5zZXRUaW1lKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpICsgMzApO1xuICAgIGxvZy5kZWJ1ZygnQ29udHJvbHMnLCAnZmZ3ZCBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgfSk7XG5cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24oJ3B3cC1jb250cm9scy1uZXh0LWNoYXB0ZXInLCAnWnVtIG7DpGNoc3RlbiBLYXBpdGVsIHNwcmluZ2VuJywgZnVuY3Rpb24gKCkge1xuICAgICAgbG9nLmRlYnVnKCdDb250cm9scycsICduZXh0IENoYXB0ZXIgYmVmb3JlJywgdGhpcy50aW1lbGluZS5nZXRUaW1lKCkpO1xuICAgICAgY2hhcHRlck1vZHVsZS5uZXh0KCk7XG4gICAgICBsb2cuZGVidWcoJ0NvbnRyb2xzJywgJ25leHQgQ2hhcHRlciBhZnRlcicsIHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgICB9KTtcbiAgfVxufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmNyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbihpY29uLCB0aXRsZSwgY2FsbGJhY2spIHtcbiAgdmFyIGJ1dHRvbiA9ICQoJzxsaT48YSBocmVmPVwiI1wiIGNsYXNzPVwiYnV0dG9uIGJ1dHRvbi1jb250cm9sXCIgdGl0bGU9XCInICsgdGl0bGUgKyAnXCI+JyArXG4gICAgJzxpIGNsYXNzPVwiaWNvbiAnICsgaWNvbiArICdcIj48L2k+PC9hPjwvbGk+Jyk7XG4gIHRoaXMudGltZUNvbnRyb2xFbGVtZW50LmFwcGVuZChidXR0b24pO1xuICB2YXIgY29tYmluZWRDYWxsYmFjayA9IGdldENvbWJpbmVkQ2FsbGJhY2soY2FsbGJhY2spO1xuICBidXR0b24ub24oJ2NsaWNrJywgY29tYmluZWRDYWxsYmFjay5iaW5kKHRoaXMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29udHJvbHMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuL2xvZ2dpbmcnKS5nZXRMb2dnZXIoJ0VtYmVkJyk7XG5cbi8vIGV2ZXJ5dGhpbmcgZm9yIGFuIGVtYmVkZGVkIHBsYXllclxudmFyXG4gIHBsYXllcnMgPSBbXSxcbiAgbGFzdEhlaWdodCA9IDAsXG4gICRib2R5O1xuXG5mdW5jdGlvbiBwb3N0VG9PcGVuZXIob2JqKSB7XG4gIGxvZy5kZWJ1ZygncG9zdFRvT3BlbmVyJywgb2JqKTtcbiAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShvYmosICcqJyk7XG59XG5cbmZ1bmN0aW9uIG1lc3NhZ2VMaXN0ZW5lciAoZXZlbnQpIHtcbiAgdmFyIG9yaWcgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXG4gIGlmIChvcmlnLmRhdGEuYWN0aW9uID09PSAncGF1c2UnKSB7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3JNZXRhZGF0YSAoY2FsbGJhY2spIHtcbiAgZnVuY3Rpb24gbWV0YURhdGFMaXN0ZW5lciAoZXZlbnQpIHtcbiAgICB2YXIgb3JpZyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG4gICAgaWYgKG9yaWcuZGF0YS5wbGF5ZXJPcHRpb25zKSB7XG4gICAgICBjYWxsYmFjayhvcmlnLmRhdGEucGxheWVyT3B0aW9ucyk7XG4gICAgfVxuICB9XG4gICQod2luZG93KS5vbignbWVzc2FnZScsIG1ldGFEYXRhTGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBwb2xsSGVpZ2h0KCkge1xuICB2YXIgbmV3SGVpZ2h0ID0gJGJvZHkuaGVpZ2h0KCk7XG4gIGlmIChsYXN0SGVpZ2h0ICE9PSBuZXdIZWlnaHQpIHtcbiAgICBwb3N0VG9PcGVuZXIoe1xuICAgICAgYWN0aW9uOiAncmVzaXplJyxcbiAgICAgIGFyZzogbmV3SGVpZ2h0XG4gICAgfSk7XG4gIH1cblxuICBsYXN0SGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbEhlaWdodCwgZG9jdW1lbnQuYm9keSk7XG59XG5cbi8qKlxuICogaW5pdGlhbGl6ZSBlbWJlZCBmdW5jdGlvbmFsaXR5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSAkIGpRdWVyeVxuICogQHBhcmFtIHtBcnJheX0gcGxheWVyTGlzdCBhbGwgcGxheWVyc2luIHRoaXMgd2luZG93XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gaW5pdCgkLCBwbGF5ZXJMaXN0KSB7XG4gIHBsYXllcnMgPSBwbGF5ZXJMaXN0O1xuICAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSk7XG4gICQod2luZG93KS5vbignbWVzc2FnZScsIG1lc3NhZ2VMaXN0ZW5lcik7XG4gIHBvbGxIZWlnaHQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHBvc3RUb09wZW5lcjogcG9zdFRvT3BlbmVyLFxuICB3YWl0Rm9yTWV0YWRhdGE6IHdhaXRGb3JNZXRhZGF0YSxcbiAgaW5pdDogaW5pdFxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbWJlZC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKiFcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFBvZGxvdmUgV2ViIFBsYXllciB2My4wLjAtYWxwaGFcbiAqIExpY2Vuc2VkIHVuZGVyIFRoZSBCU0QgMi1DbGF1c2UgTGljZW5zZVxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0yLUNsYXVzZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBHZXJyaXQgdmFuIEFha2VuIChodHRwczovL2dpdGh1Yi5jb20vZ2Vycml0dmFuYWFrZW4vKSwgU2ltb24gV2FsZGhlcnIgKGh0dHBzOi8vZ2l0aHViLmNvbS9zaW1vbndhbGRoZXJyLyksIEZyYW5rIEhhc2UgKGh0dHBzOi8vZ2l0aHViLmNvbS9LYW1iZmhhc2UvKSwgRXJpYyBUZXViZXJ0IChodHRwczovL2dpdGh1Yi5jb20vZXRldWJlcnQvKSBhbmQgb3RoZXJzIChodHRwczovL2dpdGh1Yi5jb20vcG9kbG92ZS9wb2Rsb3ZlLXdlYi1wbGF5ZXIvY29udHJpYnV0b3JzKVxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKlxuICogLSBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAtIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRhYlJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi90YWJyZWdpc3RyeScpLFxuICBlbWJlZCA9IHJlcXVpcmUoJy4vZW1iZWQnKSxcbiAgVGltZWxpbmUgPSByZXF1aXJlKCcuL3RpbWVsaW5lJyksXG4gIEluZm8gPSByZXF1aXJlKCcuL21vZHVsZXMvaW5mbycpLFxuICBTaGFyZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9zaGFyZScpLFxuICBEb3dubG9hZHMgPSByZXF1aXJlKCcuL21vZHVsZXMvZG93bmxvYWRzJyksXG4gIENoYXB0ZXJzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NoYXB0ZXInKSxcbiAgU2F2ZVRpbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvc2F2ZXRpbWUnKSxcbiAgQ29udHJvbHMgPSByZXF1aXJlKCcuL2NvbnRyb2xzJyksXG4gIFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyJyksXG4gIFByb2dyZXNzQmFyID0gcmVxdWlyZSgnLi9tb2R1bGVzL3Byb2dyZXNzYmFyJyksXG4gIGxvZ2xldmVsID0gcmVxdWlyZSgnLi9sb2dnaW5nJyk7XG5cbnZhciBwd3A7XG5cbi8vIHdpbGwgZXhwb3NlL2F0dGFjaCBpdHNlbGYgdG8gdGhlICQgZ2xvYmFsXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL21lZGlhZWxlbWVudC9idWlsZC9tZWRpYWVsZW1lbnQuanMnKTtcblxudmFyIGxvZyA9IGxvZ2xldmVsLmdldExvZ2dlcignV2VicGxheWVyJyk7XG5cbi8qKlxuICogVGhlIG1vc3QgbWlzc2luZyBmZWF0dXJlIHJlZ2FyZGluZyBlbWJlZGRlZCBwbGF5ZXJzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgdGhlIHRpdGxlIG9mIHRoZSBzaG93XG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIChvcHRpb25hbCkgdGhlIGxpbmsgdG8gdGhlIHNob3dcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclNob3dUaXRsZSh0aXRsZSwgdXJsKSB7XG4gIGlmICghdGl0bGUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKHVybCkge1xuICAgIHRpdGxlID0gJzxhIGhyZWY9XCInICsgdXJsICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiIHRpdGxlPVwiTGluayB6dXIgU2hvd1wiPicgKyB0aXRsZSArICc8L2E+JztcbiAgfVxuICByZXR1cm4gJzxoMyBjbGFzcz1cInNob3d0aXRsZVwiPicgKyB0aXRsZSArICc8L2gzPic7XG59XG5cbi8qKlxuICogUmVuZGVyIGVwaXNvZGUgdGl0bGUgSFRNTFxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBsaW5rXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJUaXRsZSh0ZXh0LCBsaW5rKSB7XG4gIHZhciB0aXRsZUJlZ2luID0gJzxoMSBjbGFzcz1cImVwaXNvZGV0aXRsZVwiPicsXG4gICAgdGl0bGVFbmQgPSAnPC9oMT4nO1xuICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkICYmIGxpbmsgIT09IHVuZGVmaW5lZCkge1xuICAgIHRleHQgPSAnPGEgaHJlZj1cIicgKyBsaW5rICsgJ1wiICB0YXJnZXQ9XCJfYmxhbmtcIiB0aXRsZT1cIkxpbmsgenVyIEVwaXNvZGVcIj4nICsgdGV4dCArICc8L2E+JztcbiAgfVxuICByZXR1cm4gdGl0bGVCZWdpbiArIHRleHQgKyB0aXRsZUVuZDtcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCBzdWJ0aXRsZVxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclN1YlRpdGxlKHRleHQpIHtcbiAgaWYgKCF0ZXh0KSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGgyIGNsYXNzPVwic3VidGl0bGVcIj4nICsgdGV4dCArICc8L2gyPic7XG59XG5cbi8qKlxuICogUmVuZGVyIEhUTUwgdGl0bGUgYXJlYVxuICogQHBhcmFtIHBhcmFtc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVuZGVyVGl0bGVBcmVhKHBhcmFtcykge1xuICByZXR1cm4gJzxoZWFkZXI+JyArXG4gICAgcmVuZGVyU2hvd1RpdGxlKHBhcmFtcy5zaG93LnRpdGxlLCBwYXJhbXMuc2hvdy51cmwpICtcbiAgICByZW5kZXJUaXRsZShwYXJhbXMudGl0bGUsIHBhcmFtcy5wZXJtYWxpbmspICtcbiAgICByZW5kZXJTdWJUaXRsZShwYXJhbXMuc3VidGl0bGUpICtcbiAgICAnPC9oZWFkZXI+Jztcbn1cblxuLyoqXG4gKiBSZW5kZXIgSFRNTCBwbGF5YnV0dG9uXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW5kZXJQbGF5YnV0dG9uKCkge1xuICByZXR1cm4gJCgnPGEgY2xhc3M9XCJwbGF5XCIgdGl0bGU9XCJBYnNwaWVsZW5cIiBocmVmPVwiamF2YXNjcmlwdDo7XCI+PC9hPicpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgcG9zdGVyIGltYWdlIGluIEhUTUxcbiAqIHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGlmIHBvc3RlclVybCBpcyBlbXB0eVxuICogQHBhcmFtIHtzdHJpbmd9IHBvc3RlclVybFxuICogQHJldHVybnMge3N0cmluZ30gcmVuZGVyZWQgSFRNTFxuICovXG5mdW5jdGlvbiByZW5kZXJQb3N0ZXIocG9zdGVyVXJsKSB7XG4gIGlmICghcG9zdGVyVXJsKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGRpdiBjbGFzcz1cImNvdmVyYXJ0XCI+PGltZyBjbGFzcz1cImNvdmVyaW1nXCIgc3JjPVwiJyArIHBvc3RlclVybCArICdcIiBkYXRhLWltZz1cIicgKyBwb3N0ZXJVcmwgKyAnXCIgYWx0PVwiUG9zdGVyIEltYWdlXCI+PC9kaXY+Jztcbn1cblxuLyoqXG4gKiBjaGVja3MgaWYgdGhlIGN1cnJlbnQgd2luZG93IGlzIGhpZGRlblxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdyBpcyBoaWRkZW5cbiAqL1xuZnVuY3Rpb24gaXNIaWRkZW4oKSB7XG4gIHZhciBwcm9wcyA9IFtcbiAgICAnaGlkZGVuJyxcbiAgICAnbW96SGlkZGVuJyxcbiAgICAnbXNIaWRkZW4nLFxuICAgICd3ZWJraXRIaWRkZW4nXG4gIF07XG5cbiAgZm9yICh2YXIgaW5kZXggaW4gcHJvcHMpIHtcbiAgICBpZiAocHJvcHNbaW5kZXhdIGluIGRvY3VtZW50KSB7XG4gICAgICByZXR1cm4gISFkb2N1bWVudFtwcm9wc1tpbmRleF1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1vZHVsZXModGltZWxpbmUsIHdyYXBwZXIsIHBhcmFtcykge1xuICB2YXJcbiAgICB0YWJzID0gbmV3IFRhYlJlZ2lzdHJ5KCksXG4gICAgaGFzQ2hhcHRlcnMgPSB0aW1lbGluZS5oYXNDaGFwdGVycyxcbiAgICBjb250cm9scyA9IG5ldyBDb250cm9scyh0aW1lbGluZSksXG4gICAgY29udHJvbEJveCA9IGNvbnRyb2xzLmJveDtcblxuICAvKipcbiAgICogLS0gTU9EVUxFUyAtLVxuICAgKi9cbiAgdmFyIGNoYXB0ZXJzO1xuICBpZiAoaGFzQ2hhcHRlcnMpIHtcbiAgICBjaGFwdGVycyA9IG5ldyBDaGFwdGVycyh0aW1lbGluZSwgcGFyYW1zKTtcbiAgICB0aW1lbGluZS5hZGRNb2R1bGUoY2hhcHRlcnMpO1xuICB9XG4gIGNvbnRyb2xzLmNyZWF0ZVRpbWVDb250cm9scyhjaGFwdGVycyk7XG5cbiAgdmFyIHNhdmVUaW1lID0gbmV3IFNhdmVUaW1lKHRpbWVsaW5lLCBwYXJhbXMpO1xuICB0aW1lbGluZS5hZGRNb2R1bGUoc2F2ZVRpbWUpO1xuXG4gIHZhciBwcm9ncmVzc0JhciA9IG5ldyBQcm9ncmVzc0Jhcih0aW1lbGluZSk7XG4gIHRpbWVsaW5lLmFkZE1vZHVsZShwcm9ncmVzc0Jhcik7XG5cbiAgdmFyIHNoYXJpbmcgPSBuZXcgU2hhcmUocGFyYW1zKTtcbiAgdmFyIGRvd25sb2FkcyA9IG5ldyBEb3dubG9hZHMocGFyYW1zKTtcbiAgdmFyIGluZm9zID0gbmV3IEluZm8ocGFyYW1zKTtcblxuICAvKipcbiAgICogLS0gVEFCUyAtLVxuICAgKiBUaGUgdGFicyBpbiBjb250cm9sYmFyIHdpbGwgYXBwZWFyIGluIGZvbGxvd2luZyBvcmRlcjpcbiAgICovXG5cbiAgaWYgKGhhc0NoYXB0ZXJzKSB7XG4gICAgdGFicy5hZGQoY2hhcHRlcnMudGFiKTtcbiAgfVxuXG4gIHRhYnMuYWRkKHNoYXJpbmcudGFiKTtcbiAgdGFicy5hZGQoZG93bmxvYWRzLnRhYik7XG4gIHRhYnMuYWRkKGluZm9zLnRhYik7XG5cbiAgdGFicy5vcGVuSW5pdGlhbChwYXJhbXMuYWN0aXZlVGFiKTtcblxuICAvLyBSZW5kZXIgY29udHJvbGJhciB3aXRoIHRvZ2dsZWJhciBhbmQgdGltZWNvbnRyb2xzXG4gIHZhciBjb250cm9sYmFyV3JhcHBlciA9ICQoJzxkaXYgY2xhc3M9XCJjb250cm9sYmFyLXdyYXBwZXJcIj48L2Rpdj4nKTtcbiAgY29udHJvbGJhcldyYXBwZXIuYXBwZW5kKHRhYnMudG9nZ2xlYmFyKTtcbiAgY29udHJvbGJhcldyYXBwZXIuYXBwZW5kKGNvbnRyb2xCb3gpO1xuXG4gIC8vIHJlbmRlciBwcm9ncmVzc2JhciwgY29udHJvbGJhciBhbmQgdGFic1xuICB3cmFwcGVyXG4gICAgLmFwcGVuZChwcm9ncmVzc0Jhci5yZW5kZXIoKSlcbiAgICAuYXBwZW5kKGNvbnRyb2xiYXJXcmFwcGVyKVxuICAgIC5hcHBlbmQodGFicy5jb250YWluZXIpO1xuXG4gIHByb2dyZXNzQmFyLmFkZEV2ZW50cygpO1xufVxuXG4vKipcbiAqIGFkZCBjaGFwdGVyIGJlaGF2aW9yIGFuZCBkZWVwbGlua2luZzogc2tpcCB0byByZWZlcmVuY2VkXG4gKiB0aW1lIHBvc2l0aW9uICYgd3JpdGUgY3VycmVudCB0aW1lIGludG8gYWRkcmVzc1xuICogQHBhcmFtIHtvYmplY3R9IHBsYXllclxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICogQHBhcmFtIHtvYmplY3R9IHdyYXBwZXJcbiAqL1xuZnVuY3Rpb24gYWRkQmVoYXZpb3IocGxheWVyLCBwYXJhbXMsIHdyYXBwZXIpIHtcbiAgdmFyIGpxUGxheWVyID0gJChwbGF5ZXIpLFxuICAgIHRpbWVsaW5lID0gbmV3IFRpbWVsaW5lKHBsYXllciwgcGFyYW1zKSxcblxuICAgIG1ldGFFbGVtZW50ID0gJCgnPGRpdiBjbGFzcz1cInRpdGxlYmFyXCI+PC9kaXY+JyksXG4gICAgcGxheWVyVHlwZSA9IHBhcmFtcy50eXBlLFxuICAgIHBsYXlCdXR0b24gPSByZW5kZXJQbGF5YnV0dG9uKCksXG4gICAgcG9zdGVyID0gcGFyYW1zLnBvc3RlciB8fCBqcVBsYXllci5hdHRyKCdwb3N0ZXInKSxcbiAgICBkZWxheU1vZHVsZVJlbmRlcmluZyA9ICF0aW1lbGluZS5kdXJhdGlvbiB8fCBpc05hTih0aW1lbGluZS5kdXJhdGlvbikgfHwgdGltZWxpbmUuZHVyYXRpb24gPD0gMDtcblxuICB2YXIgZGVlcExpbms7XG5cbiAgbG9nLmluZm8oJ01ldGFkYXRhJywgdGltZWxpbmUuZ2V0RGF0YSgpKTtcbiAganFQbGF5ZXIucHJvcCh7XG4gICAgY29udHJvbHM6IG51bGxcbiAgfSk7XG5cbiAgLy9vbmx5IGxvYWQgbWV0YWRhdGEsIGlmIHlvdSBkb24ndCBoYXZlIGEgZHVyYXRpb25cbiAgaWYoZGVsYXlNb2R1bGVSZW5kZXJpbmcpIHtcbiAgICBqcVBsYXllci5wcm9wKHtcbiAgICAgIHByZWxvYWQ6ICdtZXRhZGF0YSdcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCByaWNoIHBsYXllciB3aXRoIG1ldGEgZGF0YVxuICAgKi9cbiAgd3JhcHBlclxuICAgIC5hZGRDbGFzcygncG9kbG92ZXdlYnBsYXllcl8nICsgcGxheWVyVHlwZSlcbiAgICAuZGF0YSgncG9kbG92ZXdlYnBsYXllcicsIHtcbiAgICBwbGF5ZXI6IGpxUGxheWVyXG4gIH0pO1xuXG4gIGlmIChwbGF5ZXJUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgLy8gUmVuZGVyIHBsYXlidXR0b24gaW4gdGl0bGViYXJcbiAgICBtZXRhRWxlbWVudC5wcmVwZW5kKHBsYXlCdXR0b24pO1xuICAgIG1ldGFFbGVtZW50LmFwcGVuZChyZW5kZXJQb3N0ZXIocG9zdGVyKSk7XG4gICAgd3JhcHBlci5wcmVwZW5kKG1ldGFFbGVtZW50KTtcbiAgfVxuXG4gIGlmIChwbGF5ZXJUeXBlID09PSAndmlkZW8nKSB7XG4gICAgdmFyIHZpZGVvUGFuZSA9ICQoJzxkaXYgY2xhc3M9XCJ2aWRlby1wYW5lXCI+PC9kaXY+Jyk7XG4gICAgdmFyIG92ZXJsYXkgPSAkKCc8ZGl2IGNsYXNzPVwidmlkZW8tb3ZlcmxheVwiPjwvZGl2PicpO1xuICAgIG92ZXJsYXkuYXBwZW5kKHBsYXlCdXR0b24pO1xuICAgIG92ZXJsYXkub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHBsYXllci5wYXVzZWQpIHtcbiAgICAgICAgcGxheUJ1dHRvbi5hZGRDbGFzcygncGxheWluZycpO1xuICAgICAgICBwbGF5ZXIucGxheSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwbGF5QnV0dG9uLnJlbW92ZUNsYXNzKCdwbGF5aW5nJyk7XG4gICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICB9KTtcblxuICAgIHZpZGVvUGFuZVxuICAgICAgLmFwcGVuZChvdmVybGF5KVxuICAgICAgLmFwcGVuZChqcVBsYXllcik7XG5cbiAgICB3cmFwcGVyXG4gICAgICAuYXBwZW5kKG1ldGFFbGVtZW50KVxuICAgICAgLmFwcGVuZCh2aWRlb1BhbmUpO1xuXG4gICAganFQbGF5ZXIucHJvcCh7cG9zdGVyOiBwb3N0ZXJ9KTtcbiAgfVxuXG4gIC8vIFJlbmRlciB0aXRsZSBhcmVhIHdpdGggdGl0bGUgaDIgYW5kIHN1YnRpdGxlIGgzXG4gIG1ldGFFbGVtZW50LmFwcGVuZChyZW5kZXJUaXRsZUFyZWEocGFyYW1zKSk7XG5cbiAgLy8gcGFyc2UgZGVlcGxpbmtcbiAgZGVlcExpbmsgPSByZXF1aXJlKCcuL3VybCcpLmNoZWNrQ3VycmVudCgpO1xuICBpZiAoZGVlcExpbmtbMF0gJiYgcHdwLnBsYXllcnMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHBsYXllckF0dHJpYnV0ZXMgPSB7cHJlbG9hZDogJ2F1dG8nfTtcbiAgICBpZiAoIWlzSGlkZGVuKCkpIHtcbiAgICAgIHBsYXllckF0dHJpYnV0ZXMuYXV0b3BsYXkgPSAnYXV0b3BsYXknO1xuICAgIH1cbiAgICBqcVBsYXllci5hdHRyKHBsYXllckF0dHJpYnV0ZXMpO1xuICAgIC8vc3RvcEF0VGltZSA9IGRlZXBMaW5rWzFdO1xuICAgIHRpbWVsaW5lLnBsYXlSYW5nZShkZWVwTGluayk7XG5cbiAgICAkKCdodG1sLCBib2R5JykuZGVsYXkoMTUwKS5hbmltYXRlKHtcbiAgICAgIHNjcm9sbFRvcDogJCgnLmNvbnRhaW5lcjpmaXJzdCcpLm9mZnNldCgpLnRvcCAtIDI1XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAocGxheWVyLmN1cnJlbnRUaW1lICYmIHBsYXllci5jdXJyZW50VGltZSA+IDAgJiYgIXBsYXllci5wYXVzZWQpIHtcbiAgICAgIHBsYXlCdXR0b24ucmVtb3ZlQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICAgIHBsYXllci5wYXVzZSgpO1xuICAgICAgaWYgKHBsYXllci5wbHVnaW5UeXBlID09PSAnZmxhc2gnKSB7XG4gICAgICAgIHBsYXllci5wYXVzZSgpOyAgICAvLyBmbGFzaCBmYWxsYmFjayBuZWVkcyBhZGRpdGlvbmFsIHBhdXNlXG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFwbGF5QnV0dG9uLmhhc0NsYXNzKCdwbGF5aW5nJykpIHtcbiAgICAgIHBsYXlCdXR0b24uYWRkQ2xhc3MoJ3BsYXlpbmcnKTtcbiAgICB9XG4gICAgcGxheWVyLnBsYXkoKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudClcbiAgICAub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgbG9nLmRlYnVnKCdLZXlkb3duJywgZSk7XG5cbiAgICAgIHZhciBrZXlDb2RlID0gZS53aGljaCxcbiAgICAgICAgZHVyYXRpb24gPSB0aW1lbGluZS5wbGF5ZXIuZHVyYXRpb24sXG4gICAgICAgIHNlZWtUaW1lID0gdGltZWxpbmUucGxheWVyLmN1cnJlbnRUaW1lO1xuXG4gICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAzNzogLy8gbGVmdFxuICAgICAgICAgIHNlZWtUaW1lIC09IDE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzk6IC8vIFJpZ2h0XG4gICAgICAgICAgc2Vla1RpbWUgKz0gMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzODogLy8gVXBcbiAgICAgICAgICBpZiAodGltZWxpbmUuaGFzQ2hhcHRlcnMpIHtcbiAgICAgICAgICAgIHRpbWVsaW5lLm1vZHVsZXNbMF0ubmV4dCgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWVrVGltZSArPSBNYXRoLmZsb29yKGR1cmF0aW9uICogMC4xKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDogLy8gRG93blxuICAgICAgICAgIGlmICh0aW1lbGluZS5oYXNDaGFwdGVycykge1xuICAgICAgICAgICAgdGltZWxpbmUubW9kdWxlc1swXS5wcmV2aW91cygpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWVrVGltZSAtPSBNYXRoLmZsb29yKGR1cmF0aW9uICogMC4xKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNjogLy8gSG9tZVxuICAgICAgICAgIHNlZWtUaW1lID0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNTogLy8gZW5kXG4gICAgICAgICAgc2Vla1RpbWUgPSBkdXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDogLy8gZW50ZXJcbiAgICAgICAgY2FzZSAzMjogLy8gc3BhY2VcbiAgICAgICAgICBpZiAodGltZWxpbmUucGxheWVyLnBhdXNlZCkge1xuICAgICAgICAgICAgdGltZWxpbmUucGxheWVyLnBsYXkoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgICB0aW1lbGluZS5wbGF5ZXIucGF1c2UoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHRpbWVsaW5lLnNldFRpbWUoc2Vla1RpbWUpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gIGpxUGxheWVyXG4gICAgLm9uKCd0aW1lbGluZUVsZW1lbnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGxvZy50cmFjZShldmVudC5jdXJyZW50VGFyZ2V0LmlkLCBldmVudCk7XG4gICAgfSlcbiAgICAub24oJ3RpbWV1cGRhdGUgcHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRpbWVsaW5lLnVwZGF0ZShldmVudCk7XG4gICAgfSlcbiAgICAvLyB1cGRhdGUgcGxheS9wYXVzZSBzdGF0dXNcbiAgICAub24oJ3BsYXknLCBmdW5jdGlvbiAoKSB7fSlcbiAgICAub24oJ3BsYXlpbmcnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwbGF5QnV0dG9uLmFkZENsYXNzKCdwbGF5aW5nJyk7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdwbGF5JywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgfSlcbiAgICAub24oJ3BhdXNlJywgZnVuY3Rpb24gKCkge1xuICAgICAgcGxheUJ1dHRvbi5yZW1vdmVDbGFzcygncGxheWluZycpO1xuICAgICAgZW1iZWQucG9zdFRvT3BlbmVyKHsgYWN0aW9uOiAncGF1c2UnLCBhcmc6IHBsYXllci5jdXJyZW50VGltZSB9KTtcbiAgICB9KVxuICAgIC5vbignZW5kZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWJlZC5wb3N0VG9PcGVuZXIoeyBhY3Rpb246ICdzdG9wJywgYXJnOiBwbGF5ZXIuY3VycmVudFRpbWUgfSk7XG4gICAgICAvLyBkZWxldGUgdGhlIGNhY2hlZCBwbGF5IHRpbWVcbiAgICAgIHRpbWVsaW5lLnJld2luZCgpO1xuICAgIH0pO1xuXG4gIGlmICghZGVsYXlNb2R1bGVSZW5kZXJpbmcpIHtcbiAgICByZW5kZXJNb2R1bGVzKHRpbWVsaW5lLCB3cmFwcGVyLCBwYXJhbXMpO1xuICB9XG5cbiAganFQbGF5ZXIub25lKCdjYW5wbGF5JywgZnVuY3Rpb24gKCkge1xuICAgIC8vIGNvcnJlY3QgZHVyYXRpb24ganVzdCBpbiBjYXNlXG4gICAgdGltZWxpbmUuZHVyYXRpb24gPSBwbGF5ZXIuZHVyYXRpb247XG4gICAgaWYgKGRlbGF5TW9kdWxlUmVuZGVyaW5nKSB7XG4gICAgICByZW5kZXJNb2R1bGVzKHRpbWVsaW5lLCB3cmFwcGVyLCBwYXJhbXMpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogcmV0dXJuIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCBhdHRhY2ggc291cmNlIGVsZW1lbnRzIHRvIHRoZSBkZWZlcnJlZCBhdWRpbyBlbGVtZW50XG4gKiBAcGFyYW0ge29iamVjdH0gZGVmZXJyZWRQbGF5ZXJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gZ2V0RGVmZXJyZWRQbGF5ZXJDYWxsQmFjayhkZWZlcnJlZFBsYXllcikge1xuICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgcGFyYW1zID0gJC5leHRlbmQoe30sIFBsYXllci5kZWZhdWx0cywgZGF0YSk7XG4gICAgZGF0YS5zb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZU9iamVjdCkge1xuICAgICAgJCgnPHNvdXJjZT4nLCBzb3VyY2VPYmplY3QpLmFwcGVuZFRvKGRlZmVycmVkUGxheWVyKTtcbiAgICB9KTtcbiAgICBQbGF5ZXIuY3JlYXRlKGRlZmVycmVkUGxheWVyLCBwYXJhbXMsIGFkZEJlaGF2aW9yKTtcbiAgfTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtqUXVlcnl9XG4gKi9cbiQuZm4ucG9kbG92ZXdlYnBsYXllciA9IGZ1bmN0aW9uIHdlYlBsYXllcihvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLmRlZmVycmVkKSB7XG4gICAgdmFyIGRlZmVycmVkUGxheWVyID0gdGhpc1swXTtcbiAgICB2YXIgY2FsbGJhY2sgPSBnZXREZWZlcnJlZFBsYXllckNhbGxCYWNrKGRlZmVycmVkUGxheWVyKTtcbiAgICBlbWJlZC53YWl0Rm9yTWV0YWRhdGEoY2FsbGJhY2spO1xuICAgIGVtYmVkLnBvc3RUb09wZW5lcih7YWN0aW9uOiAnd2FpdGluZyd9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIEFkZGl0aW9uYWwgcGFyYW1ldGVycyBkZWZhdWx0IHZhbHVlc1xuICB2YXIgcGFyYW1zID0gJC5leHRlbmQoe30sIFBsYXllci5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgLy8gdHVybiBlYWNoIHBsYXllciBpbiB0aGUgY3VycmVudCBzZXQgaW50byBhIFBvZGxvdmUgV2ViIFBsYXllclxuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBwbGF5ZXJFbGVtZW50KSB7XG4gICAgUGxheWVyLmNyZWF0ZShwbGF5ZXJFbGVtZW50LCBwYXJhbXMsIGFkZEJlaGF2aW9yKTtcbiAgfSk7XG59O1xuXG5wd3AgPSB7IHBsYXllcnM6IFBsYXllci5wbGF5ZXJzIH07XG5cbmVtYmVkLmluaXQoJCwgUGxheWVyLnBsYXllcnMpO1xuXG53aW5kb3cucHdwID0gcHdwO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfNWQ0N2ViZjQuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9nbGV2ZWwgPSByZXF1aXJlKCdsb2dsZXZlbCcpO1xudmFyIG9yaWdpbmFsRmFjdG9yeSA9IGxvZ2xldmVsLm1ldGhvZEZhY3Rvcnk7XG5cbi8vIGV4dGVuZCBsb2dsZXZlbCBoZXJlXG5mdW5jdGlvbiBsb2dXaXRoTG9nZ2VyTmFtZShtZXRob2ROYW1lLCBsb2dMZXZlbCwgbG9nZ2VyTmFtZSkge1xuICB2YXIgcmF3TWV0aG9kID0gb3JpZ2luYWxGYWN0b3J5KG1ldGhvZE5hbWUsIGxvZ0xldmVsLCBsb2dnZXJOYW1lKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gW2xvZ2dlck5hbWVdO1xuICAgIGZvciAodmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoLCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuICAgIHJhd01ldGhvZC5hcHBseShsb2dsZXZlbCwgYXJncyk7XG4gIH07XG59XG5cbi8vIGxvZ2xldmVsLm1ldGhvZEZhY3RvcnkgPSBsb2dXaXRoTG9nZ2VyTmFtZTtcblxuLy8gc2V0IHRoZSBnbG9iYWwgbG9nIGxldmVsIGhlcmVcbmxvZ2xldmVsLnNldExldmVsKGxvZ2xldmVsLmxldmVscy5JTkZPKTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dsZXZlbDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9sb2dnaW5nLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuLi90aW1lY29kZScpXG4gICwgVGFiID0gcmVxdWlyZSgnLi4vdGFiJyk7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCdDaGFwdGVycycpO1xuXG52YXIgQUNUSVZFX0NIQVBURVJfVEhSRVNISE9MRCA9IDAuMTtcblxuZnVuY3Rpb24gcm93Q2xpY2tIYW5kbGVyIChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGNoYXB0ZXJzID0gZS5kYXRhLm1vZHVsZTtcbiAgbG9nLmRlYnVnKCdjbGlja0hhbmRsZXInLCAnc2V0Q3VycmVudENoYXB0ZXIgdG8nLCBlLmRhdGEuaW5kZXgpO1xuICBjaGFwdGVycy5zZXRDdXJyZW50Q2hhcHRlcihlLmRhdGEuaW5kZXgpO1xuICBjaGFwdGVycy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgY2hhcHRlcnMudGltZWxpbmUucGxheWVyLnBsYXkoKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1DaGFwdGVyKGNoYXB0ZXIpIHtcbiAgY2hhcHRlci5jb2RlID0gY2hhcHRlci50aXRsZTtcbiAgaWYgKHR5cGVvZiBjaGFwdGVyLnN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgIGNoYXB0ZXIuc3RhcnQgPSB0Yy5nZXRTdGFydFRpbWVDb2RlKGNoYXB0ZXIuc3RhcnQpO1xuICB9XG4gIHJldHVybiBjaGFwdGVyO1xufVxuXG4vKipcbiAqIGFkZCBgZW5kYCBwcm9wZXJ0eSB0byBlYWNoIHNpbXBsZSBjaGFwdGVyLFxuICogbmVlZGVkIGZvciBwcm9wZXIgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGFkZEVuZFRpbWUoZHVyYXRpb24pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjaGFwdGVyLCBpLCBjaGFwdGVycykge1xuICAgIHZhciBuZXh0ID0gY2hhcHRlcnNbaSArIDFdO1xuICAgIGNoYXB0ZXIuZW5kID0gbmV4dCA/IG5leHQuc3RhcnQgOiBkdXJhdGlvbjtcbiAgICByZXR1cm4gY2hhcHRlcjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKGh0bWwpIHtcbiAgcmV0dXJuICQoaHRtbCk7XG59XG5cbi8qKlxuICogcmVuZGVyIEhUTUxUYWJsZUVsZW1lbnQgZm9yIGNoYXB0ZXJzXG4gKiBAcmV0dXJucyB7alF1ZXJ5fEhUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiByZW5kZXJDaGFwdGVyVGFibGUoKSB7XG4gIHJldHVybiByZW5kZXIoXG4gICAgJzx0YWJsZSBjbGFzcz1cInBvZGxvdmV3ZWJwbGF5ZXJfY2hhcHRlcnNcIj48Y2FwdGlvbj5LYXBpdGVsPC9jYXB0aW9uPicgK1xuICAgICAgJzx0aGVhZD4nICtcbiAgICAgICAgJzx0cj4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+S2FwaXRlbG51bW1lcjwvdGg+JyArXG4gICAgICAgICAgJzx0aCBzY29wZT1cImNvbFwiPlN0YXJ0emVpdDwvdGg+JyArXG4gICAgICAgICAgJzx0aCBzY29wZT1cImNvbFwiPlRpdGVsPC90aD4nICtcbiAgICAgICAgICAnPHRoIHNjb3BlPVwiY29sXCI+RGF1ZXI8L3RoPicgK1xuICAgICAgICAnPC90cj4nICtcbiAgICAgICc8L3RoZWFkPicgK1xuICAgICAgJzx0Ym9keT48L3Rib2R5PicgK1xuICAgICc8L3RhYmxlPidcbiAgKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNoYXB0ZXJcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlclJvdyAoY2hhcHRlciwgaW5kZXgpIHtcbiAgcmV0dXJuIHJlbmRlcihcbiAgICAnPHRyIGNsYXNzPVwiY2hhcHRlclwiPicgK1xuICAgICAgJzx0ZCBjbGFzcz1cImNoYXB0ZXItbnVtYmVyXCI+PHNwYW4gY2xhc3M9XCJiYWRnZVwiPicgKyAoaW5kZXggKyAxKSArICc8L3NwYW4+PC90ZD4nICtcbiAgICAgICc8dGQgY2xhc3M9XCJjaGFwdGVyLW5hbWVcIj48c3Bhbj4nICsgY2hhcHRlci5jb2RlICsgJzwvc3Bhbj48L3RkPicgK1xuICAgICAgJzx0ZCBjbGFzcz1cImNoYXB0ZXItZHVyYXRpb25cIj48c3Bhbj4nICsgY2hhcHRlci5kdXJhdGlvbiArICc8L3NwYW4+PC90ZD4nICtcbiAgICAnPC90cj4nXG4gICk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNoYXB0ZXJzXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRNYXhDaGFwdGVyU3RhcnQoY2hhcHRlcnMpIHtcbiAgZnVuY3Rpb24gZ2V0U3RhcnRUaW1lIChjaGFwdGVyKSB7XG4gICAgcmV0dXJuIGNoYXB0ZXIuc3RhcnQ7XG4gIH1cbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsICQubWFwKGNoYXB0ZXJzLCBnZXRTdGFydFRpbWUpKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHt7ZW5kOntudW1iZXJ9LCBzdGFydDp7bnVtYmVyfX19IGNoYXB0ZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50VGltZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQWN0aXZlQ2hhcHRlciAoY2hhcHRlciwgY3VycmVudFRpbWUpIHtcbiAgaWYgKCFjaGFwdGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoY3VycmVudFRpbWUgPiBjaGFwdGVyLnN0YXJ0IC0gQUNUSVZFX0NIQVBURVJfVEhSRVNISE9MRCAmJiBjdXJyZW50VGltZSA8PSBjaGFwdGVyLmVuZCk7XG59XG5cbi8qKlxuICogdXBkYXRlIHRoZSBjaGFwdGVyIGxpc3Qgd2hlbiB0aGUgZGF0YSBpcyBsb2FkZWRcbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZSAodGltZWxpbmUpIHtcbiAgdmFyIGFjdGl2ZUNoYXB0ZXIgPSB0aGlzLmdldEFjdGl2ZUNoYXB0ZXIoKVxuICAgICwgY3VycmVudFRpbWUgPSB0aW1lbGluZS5nZXRUaW1lKCk7XG5cbiAgbG9nLmRlYnVnKCd1cGRhdGUnLCB0aGlzLCBhY3RpdmVDaGFwdGVyLCBjdXJyZW50VGltZSk7XG4gIGlmIChpc0FjdGl2ZUNoYXB0ZXIoYWN0aXZlQ2hhcHRlciwgY3VycmVudFRpbWUpKSB7XG4gICAgbG9nLmRlYnVnKCd1cGRhdGUnLCAnYWxyZWFkeSBzZXQnLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgICByZXR1cm47XG4gIH1cbiAgZnVuY3Rpb24gbWFya0NoYXB0ZXIgKGNoYXB0ZXIsIGkpIHtcbiAgICB2YXIgaXNBY3RpdmUgPSBpc0FjdGl2ZUNoYXB0ZXIoY2hhcHRlciwgY3VycmVudFRpbWUpO1xuICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgdGhpcy5zZXRDdXJyZW50Q2hhcHRlcihpKTtcbiAgICB9XG4gIH1cbiAgdGhpcy5jaGFwdGVycy5mb3JFYWNoKG1hcmtDaGFwdGVyLCB0aGlzKTtcbn1cblxuLyoqXG4gKiBjaGFwdGVyIGhhbmRsaW5nXG4gKiBAcGFyYW1zIHtUaW1lbGluZX0gcGFyYW1zXG4gKiBAcmV0dXJuIHtDaGFwdGVyc30gY2hhcHRlciBtb2R1bGVcbiAqL1xuZnVuY3Rpb24gQ2hhcHRlcnMgKHRpbWVsaW5lLCBwYXJhbXMpIHtcblxuICBpZiAoIXRpbWVsaW5lIHx8ICF0aW1lbGluZS5oYXNDaGFwdGVycykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0aW1lbGluZS5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGxvZy53YXJuKCdjb25zdHJ1Y3RvcicsICdaZXJvIGxlbmd0aCBtZWRpYT8nLCB0aW1lbGluZSk7XG4gIH1cblxuICB0aGlzLnRpbWVsaW5lID0gdGltZWxpbmU7XG4gIHRoaXMuZHVyYXRpb24gPSB0aW1lbGluZS5kdXJhdGlvbjtcbiAgdGhpcy5jaGFwdGVybGlua3MgPSAhIXRpbWVsaW5lLmNoYXB0ZXJsaW5rcztcbiAgdGhpcy5jdXJyZW50Q2hhcHRlciA9IDA7XG4gIHRoaXMuY2hhcHRlcnMgPSB0aGlzLnBhcnNlU2ltcGxlQ2hhcHRlcihwYXJhbXMpO1xuICB0aGlzLmRhdGEgPSB0aGlzLmNoYXB0ZXJzO1xuXG4gIHRoaXMudGFiID0gbmV3IFRhYih7XG4gICAgaWNvbjogJ3B3cC1jaGFwdGVycycsXG4gICAgdGl0bGU6ICdLYXBpdGVsIGFuemVpZ2VuIC8gdmVyYmVyZ2VuJyxcbiAgICBoZWFkbGluZTogJ0thcGl0ZWwnLFxuICAgIG5hbWU6ICdjaGFwdGVycydcbiAgfSk7XG5cbiAgdGhpcy50YWJcbiAgICAuY3JlYXRlTWFpbkNvbnRlbnQoJycpXG4gICAgLmFwcGVuZCh0aGlzLmdlbmVyYXRlVGFibGUoKSk7XG5cbiAgdGhpcy51cGRhdGUgPSB1cGRhdGUuYmluZCh0aGlzKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGxpc3Qgb2YgY2hhcHRlcnMsIHRoaXMgZnVuY3Rpb24gY3JlYXRlcyB0aGUgY2hhcHRlciB0YWJsZSBmb3IgdGhlIHBsYXllci5cbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTERpdkVsZW1lbnR9XG4gKi9cbkNoYXB0ZXJzLnByb3RvdHlwZS5nZW5lcmF0ZVRhYmxlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGFibGUsIHRib2R5LCBtYXhjaGFwdGVyc3RhcnQsIGZvcmNlSG91cnM7XG5cbiAgdGFibGUgPSByZW5kZXJDaGFwdGVyVGFibGUoKTtcbiAgdGJvZHkgPSB0YWJsZS5jaGlsZHJlbigndGJvZHknKTtcblxuICBtYXhjaGFwdGVyc3RhcnQgPSBnZXRNYXhDaGFwdGVyU3RhcnQodGhpcy5jaGFwdGVycyk7XG4gIGZvcmNlSG91cnMgPSAobWF4Y2hhcHRlcnN0YXJ0ID49IDM2MDApO1xuXG4gIGZ1bmN0aW9uIGJ1aWxkQ2hhcHRlcihjaGFwdGVyLCBpbmRleCkge1xuICAgIHZhciBkdXJhdGlvbiA9IE1hdGgucm91bmQoY2hhcHRlci5lbmQgLSBjaGFwdGVyLnN0YXJ0KTtcblxuICAgIC8vbWFrZSBzdXJlIHRoZSBkdXJhdGlvbiBmb3IgYWxsIGNoYXB0ZXJzIGFyZSBlcXVhbGx5IGZvcm1hdHRlZFxuICAgIGNoYXB0ZXIuZHVyYXRpb24gPSB0Yy5nZW5lcmF0ZShbZHVyYXRpb25dLCBmYWxzZSk7XG5cbiAgICAvL2lmIHRoZXJlIGlzIGEgY2hhcHRlciB0aGF0IHN0YXJ0cyBhZnRlciBhbiBob3VyLCBmb3JjZSAnMDA6JyBvbiBhbGwgcHJldmlvdXMgY2hhcHRlcnNcbiAgICBjaGFwdGVyLnN0YXJ0VGltZSA9IHRjLmdlbmVyYXRlKFtNYXRoLnJvdW5kKGNoYXB0ZXIuc3RhcnQpXSwgdHJ1ZSwgZm9yY2VIb3Vycyk7XG5cbiAgICAvL2luc2VydCB0aGUgY2hhcHRlciBkYXRhXG4gICAgdmFyIHJvdyA9IHJlbmRlclJvdyhjaGFwdGVyLCBpbmRleCk7XG4gICAgcm93Lm9uKCdjbGljaycsIHttb2R1bGU6IHRoaXMsIGluZGV4OiBpbmRleH0sIHJvd0NsaWNrSGFuZGxlcik7XG4gICAgcm93LmFwcGVuZFRvKHRib2R5KTtcbiAgICBjaGFwdGVyLmVsZW1lbnQgPSByb3c7XG4gIH1cblxuICB0aGlzLmNoYXB0ZXJzLmZvckVhY2goYnVpbGRDaGFwdGVyLCB0aGlzKTtcbiAgcmV0dXJuIHRhYmxlO1xufTtcblxuQ2hhcHRlcnMucHJvdG90eXBlLmdldEFjdGl2ZUNoYXB0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhY3RpdmUgPSB0aGlzLmNoYXB0ZXJzW3RoaXMuY3VycmVudENoYXB0ZXJdO1xuICBsb2cuZGVidWcoJ2dldEFjdGl2ZUNoYXB0ZXInLCBhY3RpdmUpO1xuICByZXR1cm4gYWN0aXZlO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGNoYXB0ZXJJbmRleFxuICovXG5DaGFwdGVycy5wcm90b3R5cGUuc2V0Q3VycmVudENoYXB0ZXIgPSBmdW5jdGlvbiAoY2hhcHRlckluZGV4KSB7XG4gIGlmIChjaGFwdGVySW5kZXggPCB0aGlzLmNoYXB0ZXJzLmxlbmd0aCAmJiBjaGFwdGVySW5kZXggPj0gMCkge1xuICAgIHRoaXMuY3VycmVudENoYXB0ZXIgPSBjaGFwdGVySW5kZXg7XG4gIH1cbiAgdGhpcy5tYXJrQWN0aXZlQ2hhcHRlcigpO1xuICBsb2cuZGVidWcoJ3NldEN1cnJlbnRDaGFwdGVyJywgJ3RvJywgdGhpcy5jdXJyZW50Q2hhcHRlcik7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUubWFya0FjdGl2ZUNoYXB0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhY3RpdmVDaGFwdGVyID0gdGhpcy5nZXRBY3RpdmVDaGFwdGVyKCk7XG4gICQuZWFjaCh0aGlzLmNoYXB0ZXJzLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgfSk7XG4gIGFjdGl2ZUNoYXB0ZXIuZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJyk7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRDaGFwdGVyLFxuICAgIG5leHQgPSB0aGlzLnNldEN1cnJlbnRDaGFwdGVyKGN1cnJlbnQgKyAxKTtcbiAgaWYgKGN1cnJlbnQgPT09IG5leHQpIHtcbiAgICBsb2cuZGVidWcoJ25leHQnLCAnYWxyZWFkeSBpbiBsYXN0IGNoYXB0ZXInKTtcbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxuICBsb2cuZGVidWcoJ25leHQnLCAnY2hhcHRlcicsIHRoaXMuY3VycmVudENoYXB0ZXIpO1xuICB0aGlzLnBsYXlDdXJyZW50Q2hhcHRlcigpO1xuICByZXR1cm4gbmV4dDtcbn07XG5cbkNoYXB0ZXJzLnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRDaGFwdGVyLFxuICAgIHByZXZpb3VzID0gdGhpcy5zZXRDdXJyZW50Q2hhcHRlcihjdXJyZW50IC0gMSk7XG4gIGlmIChjdXJyZW50ID09PSBwcmV2aW91cykge1xuICAgIGxvZy5kZWJ1ZygncHJldmlvdXMnLCAnYWxyZWFkeSBpbiBmaXJzdCBjaGFwdGVyJyk7XG4gICAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxuICBsb2cuZGVidWcoJ3ByZXZpb3VzJywgJ2NoYXB0ZXInLCB0aGlzLmN1cnJlbnRDaGFwdGVyKTtcbiAgdGhpcy5wbGF5Q3VycmVudENoYXB0ZXIoKTtcbiAgcmV0dXJuIHByZXZpb3VzO1xufTtcblxuQ2hhcHRlcnMucHJvdG90eXBlLnBsYXlDdXJyZW50Q2hhcHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0YXJ0ID0gdGhpcy5nZXRBY3RpdmVDaGFwdGVyKCkuc3RhcnQ7XG4gIGxvZy5kZWJ1ZygncGxheUN1cnJlbnRDaGFwdGVyJywgJ3N0YXJ0Jywgc3RhcnQpO1xuICB2YXIgdGltZSA9IHRoaXMudGltZWxpbmUuc2V0VGltZShzdGFydCk7XG4gIGxvZy5kZWJ1ZygncGxheUN1cnJlbnRDaGFwdGVyJywgJ2N1cnJlbnRUaW1lJywgdGltZSk7XG59O1xuXG5DaGFwdGVycy5wcm90b3R5cGUucGFyc2VTaW1wbGVDaGFwdGVyID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICB2YXIgY2hhcHRlcnMgPSBwYXJhbXMuY2hhcHRlcnM7XG4gIGlmICghY2hhcHRlcnMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXR1cm4gY2hhcHRlcnNcbiAgICAubWFwKHRyYW5zZm9ybUNoYXB0ZXIpXG4gICAgLm1hcChhZGRFbmRUaW1lKHRoaXMuZHVyYXRpb24pKVxuICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IC8vIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkOiBodHRwOi8vcG9kbG92ZS5vcmcvc2ltcGxlLWNoYXB0ZXJzL1xuICAgICAgcmV0dXJuIGEuc3RhcnQgLSBiLnN0YXJ0O1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFwdGVycztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL2NoYXB0ZXIuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGFiID0gcmVxdWlyZSgnLi4vdGFiJyk7XG52YXIgbG9nID0gcmVxdWlyZSgnLi4vbG9nZ2luZycpLmdldExvZ2dlcignRG93bmxvYWRzJyk7XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBmaWxlc2l6ZSBpbnRvIEtCIGFuZCBNQlxuICogQHBhcmFtIHNpemVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdFNpemUoc2l6ZSkge1xuICB2YXIgb25lTWIgPSAxMDQ4NTc2O1xuICB2YXIgZmlsZVNpemUgPSBwYXJzZUludChzaXplLCAxMCk7XG4gIHZhciBrQkZpbGVTaXplID0gTWF0aC5yb3VuZChmaWxlU2l6ZSAvIDEwMjQpO1xuICB2YXIgbUJGaWxlU0l6ZSA9IE1hdGgucm91bmQoZmlsZVNpemUgLyAxMDI0IC8gMTAyNCk7XG4gIGlmICghc2l6ZSkge1xuICAgIHJldHVybiAnIC0tICc7XG4gIH1cbiAgLy8gaW4gY2FzZSwgdGhlIGZpbGVzaXplIGlzIHNtYWxsZXIgdGhhbiAxTUIsXG4gIC8vIHRoZSBmb3JtYXQgd2lsbCBiZSByZW5kZXJlZCBpbiBLQlxuICAvLyBvdGhlcndpc2UgaW4gTUJcbiAgcmV0dXJuIChmaWxlU2l6ZSA8IG9uZU1iKSA/IGtCRmlsZVNpemUgKyAnIEtCJyA6IG1CRmlsZVNJemUgKyAnIE1CJztcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIGxpc3RFbGVtZW50XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjcmVhdGVPcHRpb24oYXNzZXQpIHtcbiAgbG9nLmRlYnVnKCdmb3VuZCBhc3NldCcsIGFzc2V0LmFzc2V0VGl0bGUpO1xuICByZXR1cm4gJzxvcHRpb24gdmFsdWU9XCInICsgYXNzZXQuZG93bmxvYWRVcmwgKyAnXCI+JyArXG4gICAgICBhc3NldC5hc3NldFRpdGxlICsgJyAmIzgyMjY7ICcgKyBmb3JtYXRTaXplKGFzc2V0LnNpemUpICtcbiAgICAnPC9vcHRpb24+Jztcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEByZXR1cm5zIHt7YXNzZXRUaXRsZTogU3RyaW5nLCBkb3dubG9hZFVybDogU3RyaW5nLCB1cmw6IFN0cmluZywgc2l6ZTogTnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplRG93bmxvYWQgKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICBhc3NldFRpdGxlOiBlbGVtZW50Lm5hbWUsXG4gICAgZG93bmxvYWRVcmw6IGVsZW1lbnQuZGx1cmwsXG4gICAgdXJsOiBlbGVtZW50LnVybCxcbiAgICBzaXplOiBlbGVtZW50LnNpemVcbiAgfTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEByZXR1cm5zIHt7YXNzZXRUaXRsZTogU3RyaW5nLCBkb3dubG9hZFVybDogU3RyaW5nLCB1cmw6IFN0cmluZywgc2l6ZTogTnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplU291cmNlKGVsZW1lbnQpIHtcbiAgdmFyIHNvdXJjZSA9ICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpID8gZWxlbWVudCA6IGVsZW1lbnQuc3JjO1xuICB2YXIgcGFydHMgPSBzb3VyY2Uuc3BsaXQoJy4nKTtcbiAgcmV0dXJuIHtcbiAgICBhc3NldFRpdGxlOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSxcbiAgICBkb3dubG9hZFVybDogc291cmNlLFxuICAgIHVybDogc291cmNlLFxuICAgIHNpemU6IC0xXG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTGlzdCAocGFyYW1zKSB7XG4gIGlmIChwYXJhbXMuZG93bmxvYWRzICYmIHBhcmFtcy5kb3dubG9hZHNbMF0uYXNzZXRUaXRsZSkge1xuICAgIHJldHVybiBwYXJhbXMuZG93bmxvYWRzO1xuICB9XG5cbiAgaWYgKHBhcmFtcy5kb3dubG9hZHMpIHtcbiAgICByZXR1cm4gcGFyYW1zLmRvd25sb2Fkcy5tYXAobm9ybWFsaXplRG93bmxvYWQpO1xuICB9XG4gIC8vIGJ1aWxkIGZyb20gc291cmNlIGVsZW1lbnRzXG4gIHJldHVybiBwYXJhbXMuc291cmNlcy5tYXAobm9ybWFsaXplU291cmNlKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIERvd25sb2FkcyAocGFyYW1zKSB7XG4gIHRoaXMubGlzdCA9IGNyZWF0ZUxpc3QocGFyYW1zKTtcbiAgdGhpcy50YWIgPSB0aGlzLmNyZWF0ZURvd25sb2FkVGFiKHBhcmFtcyk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAqIEByZXR1cm5zIHtudWxsfFRhYn0gZG93bmxvYWQgdGFiXG4gKi9cbkRvd25sb2Fkcy5wcm90b3R5cGUuY3JlYXRlRG93bmxvYWRUYWIgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIGlmICgoIXBhcmFtcy5kb3dubG9hZHMgJiYgIXBhcmFtcy5zb3VyY2VzKSB8fCBwYXJhbXMuaGlkZWRvd25sb2FkYnV0dG9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGRvd25sb2FkVGFiID0gbmV3IFRhYih7XG4gICAgaWNvbjogJ3B3cC1kb3dubG9hZCcsXG4gICAgdGl0bGU6ICdEb3dubG9hZHMgYW56ZWlnZW4gLyB2ZXJiZXJnZW4nLFxuICAgIG5hbWU6ICdkb3dubG9hZHMnLFxuICAgIGhlYWRsaW5lOiAnRG93bmxvYWQnXG4gIH0pO1xuXG4gIHZhciAkdGFiQ29udGVudCA9IGRvd25sb2FkVGFiLmNyZWF0ZU1haW5Db250ZW50KFxuICAgICc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj4nICtcbiAgICAgICc8Zm9ybSBhY3Rpb249XCIjXCI+JyArXG4gICAgICAgICc8c2VsZWN0IGNsYXNzPVwic2VsZWN0XCIgbmFtZT1cInNlbGVjdC1maWxlXCI+JyArIHRoaXMubGlzdC5tYXAoY3JlYXRlT3B0aW9uKSArICc8L3NlbGVjdD4nICtcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJkb3dubG9hZCBidXR0b24tc3VibWl0IGljb24gcHdwLWRvd25sb2FkXCIgbmFtZT1cImRvd25sb2FkLWZpbGVcIj4nICtcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJkb3dubG9hZCBsYWJlbFwiPkRvd25sb2FkPC9zcGFuPicgK1xuICAgICAgICAnPC9idXR0b24+JyArXG4gICAgICAnPC9mb3JtPicgK1xuICAgICc8L2Rpdj4nXG4gICk7XG4gIGRvd25sb2FkVGFiLmJveC5hcHBlbmQoJHRhYkNvbnRlbnQpO1xuXG4gIHZhciAkYnV0dG9uID0gJHRhYkNvbnRlbnQuZmluZCgnYnV0dG9uLnB3cC1kb3dubG9hZCcpO1xuICB2YXIgJHNlbGVjdCA9ICR0YWJDb250ZW50LmZpbmQoJ3NlbGVjdC5zZWxlY3QnKTtcblxuICAkYnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHdpbmRvdy5vcGVuKCRzZWxlY3QudmFsKCksICdfc2VsZicpO1xuICB9KTtcblxuICAvLyBBZGQgZGlyZWN0IGRvd25sb2FkIFVSTCBmb3IgZGlzcGxheSB0byB0aGUgdXNlclxuICAvLyB0byBmb290ZXIgb2YgdGhpcyB0YWJcbiAgdmFyICRkb3dubG9hZExpbmtFbGVtZW50ID0gJCgnPGlucHV0IG5hbWU9XCJkb3dubG9hZC1saW5rLXVybFwiIHR5cGU9XCJ1cmxcIiByZWFkb25seT4nKTtcblxuICBmdW5jdGlvbiBzZXRVcmwgKCkge1xuICAgICRkb3dubG9hZExpbmtFbGVtZW50LnZhbCgkc2VsZWN0LnZhbCgpKTtcbiAgfVxuXG4gIC8vIHNldCBpbml0aWFsIHZhbHVlXG4gIHNldFVybCgpO1xuXG4gIC8vIGNoYW5nZSB1cmwgd2hlbmV2ZXIgdGhlIHVzZXIgc2VsZWN0cyBhbiBhc3NldFxuICAkc2VsZWN0Lm9uKCdjaGFuZ2UnLCBzZXRVcmwpO1xuXG4gIGRvd25sb2FkVGFiXG4gICAgLmNyZWF0ZUZvb3RlcignPGgzPkRpcmVrdGVyIExpbms8L2gzPicpXG4gICAgLmFwcGVuZCgkZG93bmxvYWRMaW5rRWxlbWVudCk7XG5cbiAgcmV0dXJuIGRvd25sb2FkVGFiO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEb3dubG9hZHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9kb3dubG9hZHMuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGFiID0gcmVxdWlyZSgnLi4vdGFiJylcbiAgLCB0aW1lQ29kZSA9IHJlcXVpcmUoJy4uL3RpbWVjb2RlJylcbiAgLCBzZXJ2aWNlcyA9IHJlcXVpcmUoJy4uL3NvY2lhbC1uZXR3b3JrcycpO1xuXG5mdW5jdGlvbiBnZXRQdWJsaWNhdGlvbkRhdGUocmF3RGF0ZSkge1xuICBpZiAoIXJhd0RhdGUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZShyYXdEYXRlKTtcbiAgcmV0dXJuICc8cD5WZXLDtmZmZW50bGljaHQgYW06ICcgKyBkYXRlLmdldERhdGUoKSArICcuJyArIChkYXRlLmdldE1vbnRoKCkgKyAxKSArICcuJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICc8L3A+Jztcbn1cblxuZnVuY3Rpb24gZ2V0U3VtbWFyeSAoc3VtbWFyeSkge1xuICBpZiAoc3VtbWFyeSAmJiBzdW1tYXJ5Lmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gJzxwPicgKyBzdW1tYXJ5ICsgJzwvcD4nO1xuICB9XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gY3JlYXRlRXBpc29kZUluZm8odGFiLCBwYXJhbXMpIHtcbiAgdGFiLmNyZWF0ZU1haW5Db250ZW50KFxuICAgICc8aDI+JyArIHBhcmFtcy50aXRsZSArICc8L2gyPicgK1xuICAgICc8aDM+JyArIHBhcmFtcy5zdWJ0aXRsZSArICc8L2gzPicgK1xuICAgIGdldFN1bW1hcnkocGFyYW1zLnN1bW1hcnkpICtcbiAgICAnPHA+RGF1ZXI6ICcgKyB0aW1lQ29kZS5mcm9tVGltZVN0YW1wKHBhcmFtcy5kdXJhdGlvbikgKyAnPC9wPicgK1xuICAgICBnZXRQdWJsaWNhdGlvbkRhdGUocGFyYW1zLnB1YmxpY2F0aW9uRGF0ZSkgK1xuICAgICc8cD4nICtcbiAgICAgICdQZXJtYWxpbms6PGJyPicgK1xuICAgICAgJzxhIGhyZWY9XCInICsgcGFyYW1zLnBlcm1hbGluayArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIiB0aXRsZT1cIlBlcm1hbGluayBmw7xyIGRpZSBFcGlzb2RlXCI+JyArIHBhcmFtcy5wZXJtYWxpbmsgKyAnPC9hPicgK1xuICAgICc8L3A+J1xuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3N0ZXJJbWFnZShwb3N0ZXIpIHtcbiAgaWYgKCFwb3N0ZXIpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuICc8ZGl2IGNsYXNzPVwicG9zdGVyLWltYWdlXCI+JyArXG4gICAgJzxpbWcgc3JjPVwiJyArIHBvc3RlciArICdcIiBkYXRhLWltZz1cIicgKyBwb3N0ZXIgKyAnXCIgYWx0PVwiUG9zdGVyIEltYWdlXCI+JyArXG4gICAgJzwvZGl2Pic7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1YnNjcmliZUJ1dHRvbihwYXJhbXMpIHtcbiAgaWYgKCFwYXJhbXMuc3Vic2NyaWJlQnV0dG9uKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiAnPGJ1dHRvbiBjbGFzcz1cImJ1dHRvbi1zdWJtaXRcIj4nICtcbiAgICAgICc8c3BhbiBjbGFzcz1cInNob3d0aXRsZS1sYWJlbFwiPicgKyBwYXJhbXMuc2hvdy50aXRsZSArICc8L3NwYW4+JyArXG4gICAgICAnPHNwYW4gY2xhc3M9XCJzdWJtaXQtbGFiZWxcIj4nICsgcGFyYW1zLnN1YnNjcmliZUJ1dHRvbiArICc8L3NwYW4+JyArXG4gICAgJzwvYnV0dG9uPic7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNob3dJbmZvICh0YWIsIHBhcmFtcykge1xuICB0YWIuY3JlYXRlQXNpZGUoXG4gICAgJzxoMj4nICsgcGFyYW1zLnNob3cudGl0bGUgKyAnPC9oMj4nICtcbiAgICAnPGgzPicgKyBwYXJhbXMuc2hvdy5zdWJ0aXRsZSArICc8L2gzPicgK1xuICAgIGNyZWF0ZVBvc3RlckltYWdlKHBhcmFtcy5zaG93LnBvc3RlcikgK1xuICAgIGNyZWF0ZVN1YnNjcmliZUJ1dHRvbihwYXJhbXMpICtcbiAgICAnPHA+TGluayB6dXIgU2hvdzo8YnI+JyArXG4gICAgICAnPGEgaHJlZj1cIicgKyBwYXJhbXMuc2hvdy51cmwgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgdGl0bGU9XCJMaW5rIHp1ciBTaG93XCI+JyArIHBhcmFtcy5zaG93LnVybCArICc8L2E+PC9wPidcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU29jaWFsTGluayhvcHRpb25zKSB7XG4gIHZhciBzZXJ2aWNlID0gc2VydmljZXMuZ2V0KG9wdGlvbnMuc2VydmljZU5hbWUpO1xuICB2YXIgbGlzdEl0ZW0gPSAkKCc8bGk+PC9saT4nKTtcbiAgdmFyIGJ1dHRvbiA9IHNlcnZpY2UuZ2V0QnV0dG9uKG9wdGlvbnMpO1xuICBsaXN0SXRlbS5hcHBlbmQoYnV0dG9uLmVsZW1lbnQpO1xuICB0aGlzLmFwcGVuZChsaXN0SXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNvY2lhbEluZm8ocHJvZmlsZXMpIHtcbiAgaWYgKCFwcm9maWxlcykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHByb2ZpbGVMaXN0ID0gJCgnPHVsPjwvdWw+Jyk7XG4gIHByb2ZpbGVzLmZvckVhY2goY3JlYXRlU29jaWFsTGluaywgcHJvZmlsZUxpc3QpO1xuXG4gIHZhciBjb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwic29jaWFsLWxpbmtzXCI+PGgzPkJsZWliIGluIFZlcmJpbmR1bmc8L2gzPjwvZGl2PicpO1xuICBjb250YWluZXIuYXBwZW5kKHByb2ZpbGVMaXN0KTtcbiAgcmV0dXJuIGNvbnRhaW5lcjtcbn1cblxuLyoqXG4gKiBDcmVhdGUgZm9vdGVyIHdpdGggbGljZW5zZSBhcmVhIGFuZCBzb2NpYWwgbWVkaWEgcHJvZmlsZXMsXG4gKiBpZiAocGFyYW1zLmxpY2Vuc2UgJiYgcGFyYW1zLnNob3cpIGFuZCBwYXJhbXMucHJvZmlsZXNcbiAqIGFyZSBkZWZpbmVkXG4gKiBAcGFyYW0gIHtUYWJ9IHRhYlxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU29jaWFsQW5kTGljZW5zZUluZm8gKHRhYiwgcGFyYW1zKSB7XG4gIHZhciBmb290ZXIsIGZvb3RlckNvbnRlbnQsXG4gICAgY29tcGxldGVMaWNlbnNlSW5mbyA9IHBhcmFtcy5saWNlbnNlICYmIHBhcmFtcy5saWNlbnNlLnVybCAmJiBwYXJhbXMubGljZW5zZS5uYW1lICYmIHBhcmFtcy5zaG93LnRpdGxlO1xuICBpZiAoIWNvbXBsZXRlTGljZW5zZUluZm8gJiYgIXBhcmFtcy5wcm9maWxlcykge1xuICAgIHJldHVybjtcbiAgfVxuICBmb290ZXJDb250ZW50ID0gJyc7XG4gIGlmIChjb21wbGV0ZUxpY2Vuc2VJbmZvKSB7XG4gICAgZm9vdGVyQ29udGVudCA9ICc8cCBjbGFzcz1cImxpY2Vuc2UtYXJlYVwiPkRpZSBTaG93IFwiJyArIHBhcmFtcy5zaG93LnRpdGxlICsgJ1wiIGlzdCBsaXplbnNpZXJ0IHVudGVyPGJyPicgK1xuICAgICAgICAnPGEgaHJlZj1cIicgKyBwYXJhbXMubGljZW5zZS51cmwgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgdGl0bGU9XCJMaXplbnogYW5zZWhlblwiPicgKyBwYXJhbXMubGljZW5zZS5uYW1lICsgJzwvYT4nICtcbiAgICAgICc8L3A+JztcbiAgfVxuICBmb290ZXIgPSB0YWIuY3JlYXRlRm9vdGVyKGZvb3RlckNvbnRlbnQpO1xuICBmb290ZXIucHJlcGVuZChjcmVhdGVTb2NpYWxJbmZvKHBhcmFtcy5wcm9maWxlcykpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSBpbmZvIHRhYiBpZiBwYXJhbXMuc3VtbWFyeSBpcyBkZWZpbmVkXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlciBvYmplY3RcbiAqIEByZXR1cm5zIHtudWxsfFRhYn0gaW5mbyB0YWIgaW5zdGFuY2Ugb3IgbnVsbFxuICovXG5mdW5jdGlvbiBjcmVhdGVJbmZvVGFiKHBhcmFtcykge1xuICAvLyBpZiAoIXBhcmFtcy5zdW1tYXJ5KSB7XG4gIC8vICAgcmV0dXJuIG51bGw7XG4gIC8vIH1cbiAgdmFyIGluZm9UYWIgPSBuZXcgVGFiKHtcbiAgICBpY29uOiAncHdwLWluZm8nLFxuICAgIHRpdGxlOiAnSW5mb3MgYW56ZWlnZW4gLyB2ZXJiZXJnZW4nLFxuICAgIGhlYWRsaW5lOiAnSW5mbycsXG4gICAgbmFtZTogJ2luZm8nXG4gIH0pO1xuXG4gIGNyZWF0ZUVwaXNvZGVJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG4gIGNyZWF0ZVNob3dJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG4gIGNyZWF0ZVNvY2lhbEFuZExpY2Vuc2VJbmZvKGluZm9UYWIsIHBhcmFtcyk7XG5cbiAgcmV0dXJuIGluZm9UYWI7XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gbW9kdWxlIHRvIGRpc3BsYXkgcG9kY2FzdCBhbmQgZXBpc29kZSBpbmZvXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIHBhcmFtZXRlciBvYmplY3RcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBJbmZvKHBhcmFtcykge1xuICB0aGlzLnRhYiA9IGNyZWF0ZUluZm9UYWIocGFyYW1zKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmZvO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvaW5mby5qc1wiLFwiL21vZHVsZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciB0YyA9IHJlcXVpcmUoJy4uL3RpbWVjb2RlJyk7XG52YXIgY2FwID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNhcDtcblxudmFyIGxvZyA9IHJlcXVpcmUoJy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoJ1Byb2dyZXNzQmFyJyk7XG5cbmZ1bmN0aW9uIHJlbmRlclRpbWVFbGVtZW50KGNsYXNzTmFtZSwgdGltZSkge1xuICByZXR1cm4gJCgnPGRpdiBjbGFzcz1cInRpbWUgdGltZS0nICsgY2xhc3NOYW1lICsgJ1wiPicgKyB0aW1lICsgJzwvZGl2PicpO1xufVxuXG4vKipcbiAqIFJlbmRlciBhbiBIVE1MIEVsZW1lbnQgZm9yIHRoZSBjdXJyZW50IGNoYXB0ZXJcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbmRlckN1cnJlbnRDaGFwdGVyRWxlbWVudCgpIHtcbiAgdmFyIGNoYXB0ZXJFbGVtZW50ID0gJCgnPGRpdiBjbGFzcz1cImNoYXB0ZXJcIj48L2Rpdj4nKTtcblxuICBpZiAoIXRoaXMuY2hhcHRlck1vZHVsZSkge1xuICAgIHJldHVybiBjaGFwdGVyRWxlbWVudDtcbiAgfVxuXG4gIHZhciBpbmRleCA9IHRoaXMuY2hhcHRlck1vZHVsZS5jdXJyZW50Q2hhcHRlcjtcbiAgdmFyIGNoYXB0ZXIgPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY2hhcHRlcnNbaW5kZXhdO1xuICBsb2cuZGVidWcoJ1Byb2dyZXNzYmFyJywgJ3JlbmRlckN1cnJlbnRDaGFwdGVyRWxlbWVudCcsIGluZGV4LCBjaGFwdGVyKTtcblxuICB0aGlzLmNoYXB0ZXJCYWRnZSA9ICQoJzxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4nICsgKGluZGV4ICsgMSkgKyAnPC9zcGFuPicpO1xuICB0aGlzLmNoYXB0ZXJUaXRsZSA9ICQoJzxzcGFuIGNsYXNzPVwiY2hhcHRlci10aXRsZVwiPicgKyBjaGFwdGVyLnRpdGxlICsgJzwvc3Bhbj4nKTtcblxuICBjaGFwdGVyRWxlbWVudFxuICAgIC5hcHBlbmQodGhpcy5jaGFwdGVyQmFkZ2UpXG4gICAgLmFwcGVuZCh0aGlzLmNoYXB0ZXJUaXRsZSk7XG5cbiAgcmV0dXJuIGNoYXB0ZXJFbGVtZW50O1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9ncmVzc0luZm8ocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIHByb2dyZXNzSW5mbyA9ICQoJzxkaXYgY2xhc3M9XCJwcm9ncmVzcy1pbmZvXCI+PC9kaXY+Jyk7XG5cbiAgcmV0dXJuIHByb2dyZXNzSW5mb1xuICAgIC5hcHBlbmQocHJvZ3Jlc3NCYXIuY3VycmVudFRpbWUpXG4gICAgLmFwcGVuZChyZW5kZXJDdXJyZW50Q2hhcHRlckVsZW1lbnQuY2FsbChwcm9ncmVzc0JhcikpXG4gICAgLmFwcGVuZChwcm9ncmVzc0Jhci5kdXJhdGlvblRpbWVFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVGltZXMocHJvZ3Jlc3NCYXIpIHtcbiAgdmFyIHRpbWUgPSBwcm9ncmVzc0Jhci50aW1lbGluZS5nZXRUaW1lKCk7XG4gIHByb2dyZXNzQmFyLmN1cnJlbnRUaW1lLmh0bWwodGMuZnJvbVRpbWVTdGFtcCh0aW1lKSk7XG5cbiAgaWYgKHByb2dyZXNzQmFyLnNob3dEdXJhdGlvbikgeyByZXR1cm47IH1cblxuICB2YXIgcmVtYWluaW5nVGltZSA9IE1hdGguYWJzKHRpbWUgLSBwcm9ncmVzc0Jhci5kdXJhdGlvbik7XG4gIHByb2dyZXNzQmFyLmR1cmF0aW9uVGltZUVsZW1lbnQudGV4dCgnLScgKyB0Yy5mcm9tVGltZVN0YW1wKHJlbWFpbmluZ1RpbWUpKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRHVyYXRpb25UaW1lRWxlbWVudChwcm9ncmVzc0Jhcikge1xuICB2YXIgZm9ybWF0dGVkRHVyYXRpb24gPSB0Yy5mcm9tVGltZVN0YW1wKHByb2dyZXNzQmFyLmR1cmF0aW9uKTtcbiAgdmFyIGR1cmF0aW9uVGltZUVsZW1lbnQgPSByZW5kZXJUaW1lRWxlbWVudCgnZHVyYXRpb24nLCAwKTtcblxuICBkdXJhdGlvblRpbWVFbGVtZW50Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBwcm9ncmVzc0Jhci5zaG93RHVyYXRpb24gPSAhcHJvZ3Jlc3NCYXIuc2hvd0R1cmF0aW9uO1xuICAgIGlmIChwcm9ncmVzc0Jhci5zaG93RHVyYXRpb24pIHtcbiAgICAgIGR1cmF0aW9uVGltZUVsZW1lbnQudGV4dChmb3JtYXR0ZWREdXJhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHVwZGF0ZVRpbWVzKHByb2dyZXNzQmFyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGR1cmF0aW9uVGltZUVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlckF0KHRpbWUpIHtcbiAgdmFyIHBlcmNlbnQgPSAxMDAgKiB0aW1lIC8gdGhpcy5kdXJhdGlvbjtcbiAgcmV0dXJuICQoJzxkaXYgY2xhc3M9XCJtYXJrZXJcIiBzdHlsZT1cImxlZnQ6JyArIHBlcmNlbnQgKyAnJTtcIj48L2Rpdj4nKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2hhcHRlck1hcmtlcihjaGFwdGVyKSB7XG4gIHJldHVybiByZW5kZXJNYXJrZXJBdC5jYWxsKHRoaXMsIGNoYXB0ZXIuc3RhcnQpO1xufVxuXG4vKipcbiAqIFRoaXMgdXBkYXRlIG1ldGhvZCBpcyB0byBiZSBjYWxsZWQgd2hlbiBhIHBsYXllcnMgYGN1cnJlbnRUaW1lYCBjaGFuZ2VzLlxuICovXG5mdW5jdGlvbiB1cGRhdGUgKHRpbWVsaW5lKSB7XG4gIHRoaXMuc2V0UHJvZ3Jlc3ModGltZWxpbmUuZ2V0VGltZSgpKTtcbiAgdGhpcy5idWZmZXIudmFsKHRpbWVsaW5lLmdldEJ1ZmZlcmVkKCkpO1xuICB0aGlzLnNldENoYXB0ZXIoKTtcbn1cblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIENyZWF0ZXMgYSBuZXcgcHJvZ3Jlc3MgYmFyIG9iamVjdC5cbiAqIEBwYXJhbSB7VGltZWxpbmV9IHRpbWVsaW5lIC0gVGhlIHBsYXllcnMgdGltZWxpbmUgdG8gYXR0YWNoIHRvLlxuICovXG5mdW5jdGlvbiBQcm9ncmVzc0Jhcih0aW1lbGluZSkge1xuICBpZiAoIXRpbWVsaW5lKSB7XG4gICAgbG9nLmVycm9yKCdUaW1lbGluZSBtaXNzaW5nJywgYXJndW1lbnRzKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lO1xuICB0aGlzLmR1cmF0aW9uID0gdGltZWxpbmUuZHVyYXRpb247XG5cbiAgdGhpcy5iYXIgPSBudWxsO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gbnVsbDtcblxuICBpZiAodGltZWxpbmUuaGFzQ2hhcHRlcnMpIHtcbiAgICAvLyBGSVhNRSBnZXQgYWNjZXNzIHRvIGNoYXB0ZXJNb2R1bGUgcmVsaWFibHlcbiAgICAvLyB0aGlzLnRpbWVsaW5lLmdldE1vZHVsZSgnY2hhcHRlcnMnKVxuICAgIHRoaXMuY2hhcHRlck1vZHVsZSA9IHRoaXMudGltZWxpbmUubW9kdWxlc1swXTtcbiAgICB0aGlzLmNoYXB0ZXJCYWRnZSA9IG51bGw7XG4gICAgdGhpcy5jaGFwdGVyVGl0bGUgPSBudWxsO1xuICB9XG5cbiAgdGhpcy5zaG93RHVyYXRpb24gPSBmYWxzZTtcbiAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XG4gIHRoaXMuYnVmZmVyID0gbnVsbDtcbiAgdGhpcy51cGRhdGUgPSB1cGRhdGUuYmluZCh0aGlzKTtcbn1cblxuUHJvZ3Jlc3NCYXIucHJvdG90eXBlLnNldEhhbmRsZVBvc2l0aW9uID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgdmFyIHBlcmNlbnQgPSB0aW1lIC8gdGhpcy5kdXJhdGlvbiAqIDEwMDtcbiAgdmFyIG5ld0xlZnRPZmZzZXQgPSBwZXJjZW50ICsgJyUnO1xuICBsb2cuZGVidWcoJ3NldEhhbmRsZVBvc2l0aW9uJywgJ3RpbWUnLCB0aW1lLCAnbmV3TGVmdE9mZnNldCcsIG5ld0xlZnRPZmZzZXQpO1xuICB0aGlzLmhhbmRsZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0T2Zmc2V0KTtcbn07XG5cbi8qKlxuICogc2V0IHByb2dyZXNzIGJhciB2YWx1ZSwgc2xpZGVyIHBvc2l0aW9uIGFuZCBjdXJyZW50IHRpbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIHRoaXMucHJvZ3Jlc3MudmFsKHRpbWUpO1xuICB0aGlzLnNldEhhbmRsZVBvc2l0aW9uKHRpbWUpO1xuICB1cGRhdGVUaW1lcyh0aGlzKTtcbn07XG5cbi8qKlxuICogc2V0IGNoYXB0ZXIgdGl0bGUgYW5kIGJhZGdlXG4gKi9cblByb2dyZXNzQmFyLnByb3RvdHlwZS5zZXRDaGFwdGVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY2hhcHRlck1vZHVsZSkgeyByZXR1cm47IH1cblxuICB2YXIgaW5kZXggPSB0aGlzLmNoYXB0ZXJNb2R1bGUuY3VycmVudENoYXB0ZXI7XG4gIHZhciBjaGFwdGVyID0gdGhpcy5jaGFwdGVyTW9kdWxlLmNoYXB0ZXJzW2luZGV4XTtcbiAgdGhpcy5jaGFwdGVyQmFkZ2UudGV4dChpbmRleCArIDEpO1xuICB0aGlzLmNoYXB0ZXJUaXRsZS50ZXh0KGNoYXB0ZXIudGl0bGUpO1xufTtcblxuLyoqXG4gKiBSZW5kZXJzIGEgbmV3IHByb2dyZXNzIGJhciBqUXVlcnkgb2JqZWN0LlxuICovXG5Qcm9ncmVzc0Jhci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuXG4gIC8vIHRpbWUgZWxlbWVudHNcbiAgdmFyIGluaXRpYWxUaW1lID0gdGMuZnJvbVRpbWVTdGFtcCh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIHRoaXMuY3VycmVudFRpbWUgPSByZW5kZXJUaW1lRWxlbWVudCgnY3VycmVudCcsIGluaXRpYWxUaW1lKTtcbiAgdGhpcy5kdXJhdGlvblRpbWVFbGVtZW50ID0gcmVuZGVyRHVyYXRpb25UaW1lRWxlbWVudCh0aGlzKTtcblxuICAvLyBwcm9ncmVzcyBpbmZvXG4gIHZhciBwcm9ncmVzc0luZm8gPSByZW5kZXJQcm9ncmVzc0luZm8odGhpcyk7XG4gIHVwZGF0ZVRpbWVzKHRoaXMpO1xuXG4gIC8vIHRpbWVsaW5lIGFuZCBidWZmZXIgYmFyc1xuICB2YXIgcHJvZ3Jlc3MgPSAkKCc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIj48L2Rpdj4nKTtcbiAgdmFyIHRpbWVsaW5lQmFyID0gJCgnPHByb2dyZXNzIGNsYXNzPVwiY3VycmVudFwiPjwvcHJvZ3Jlc3M+JylcbiAgICAgIC5hdHRyKHsgbWluOiAwLCBtYXg6IHRoaXMuZHVyYXRpb259KTtcbiAgdmFyIGJ1ZmZlciA9ICQoJzxwcm9ncmVzcyBjbGFzcz1cImJ1ZmZlclwiPjwvcHJvZ3Jlc3M+JylcbiAgICAgIC5hdHRyKHttaW46IDAsIG1heDogdGhpcy5kdXJhdGlvbn0pO1xuICB2YXIgaGFuZGxlID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZVwiPjxkaXYgY2xhc3M9XCJpbm5lci1oYW5kbGVcIj48L2Rpdj48L2Rpdj4nKTtcblxuICBwcm9ncmVzc1xuICAgIC5hcHBlbmQodGltZWxpbmVCYXIpXG4gICAgLmFwcGVuZChidWZmZXIpXG4gICAgLmFwcGVuZChoYW5kbGUpO1xuXG4gIHRoaXMucHJvZ3Jlc3MgPSB0aW1lbGluZUJhcjtcbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gIHRoaXMuaGFuZGxlID0gaGFuZGxlO1xuICB0aGlzLnNldFByb2dyZXNzKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcblxuICBpZiAodGhpcy5jaGFwdGVyTW9kdWxlKSB7XG4gICAgdmFyIGNoYXB0ZXJNYXJrZXJzID0gdGhpcy5jaGFwdGVyTW9kdWxlLmNoYXB0ZXJzLm1hcChyZW5kZXJDaGFwdGVyTWFya2VyLCB0aGlzKTtcbiAgICBjaGFwdGVyTWFya2Vycy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3Qgb25lXG4gICAgcHJvZ3Jlc3MuYXBwZW5kKGNoYXB0ZXJNYXJrZXJzKTtcbiAgfVxuXG4gIC8vIHByb2dyZXNzIGJhclxuICB2YXIgYmFyID0gJCgnPGRpdiBjbGFzcz1cInByb2dyZXNzYmFyXCI+PC9kaXY+Jyk7XG4gIGJhclxuICAgIC5hcHBlbmQocHJvZ3Jlc3NJbmZvKVxuICAgIC5hcHBlbmQocHJvZ3Jlc3MpO1xuXG4gIHRoaXMuYmFyID0gYmFyO1xuICByZXR1cm4gYmFyO1xufTtcblxuUHJvZ3Jlc3NCYXIucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbW91c2VJc0Rvd24gPSBmYWxzZTtcbiAgdmFyIHRpbWVsaW5lID0gdGhpcy50aW1lbGluZTtcbiAgdmFyIHByb2dyZXNzID0gdGhpcy5wcm9ncmVzcztcblxuICBmdW5jdGlvbiBjYWxjdWxhdGVOZXdUaW1lIChwYWdlWCkge1xuICAgIC8vIG1vdXNlIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSBvYmplY3RcbiAgICB2YXIgd2lkdGggPSBwcm9ncmVzcy5vdXRlcldpZHRoKHRydWUpO1xuICAgIHZhciBvZmZzZXQgPSBwcm9ncmVzcy5vZmZzZXQoKTtcbiAgICB2YXIgcG9zID0gY2FwKHBhZ2VYIC0gb2Zmc2V0LmxlZnQsIDAsIHdpZHRoKTtcbiAgICB2YXIgcGVyY2VudGFnZSA9IChwb3MgLyB3aWR0aCk7XG4gICAgcmV0dXJuIHBlcmNlbnRhZ2UgKiB0aW1lbGluZS5kdXJhdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZSAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdmFyIHggPSBldmVudC5wYWdlWDtcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcykge1xuICAgICAgeCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aW1lbGluZS5kdXJhdGlvbiAhPT0gJ251bWJlcicgfHwgIW1vdXNlSXNEb3duICkgeyByZXR1cm47IH1cbiAgICB2YXIgbmV3VGltZSA9IGNhbGN1bGF0ZU5ld1RpbWUoeCk7XG4gICAgaWYgKG5ld1RpbWUgPT09IHRpbWVsaW5lLmdldFRpbWUoKSkgeyByZXR1cm47IH1cbiAgICB0aW1lbGluZS5zZWVrKG5ld1RpbWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VVcCAoKSB7XG4gICAgbW91c2VJc0Rvd24gPSBmYWxzZTtcbiAgICAkKGRvY3VtZW50KS51bmJpbmQoJ3RvdWNoZW5kLmR1ciBtb3VzZXVwLmR1ciB0b3VjaG1vdmUuZHVyIG1vdXNlbW92ZS5kdXInKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlRG93biAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQud2hpY2ggIT09IDAgJiYgZXZlbnQud2hpY2ggIT09IDEpIHsgcmV0dXJuOyB9XG5cbiAgICBtb3VzZUlzRG93biA9IHRydWU7XG4gICAgaGFuZGxlTW91c2VNb3ZlKGV2ZW50KTtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLmJpbmQoJ21vdXNlbW92ZS5kdXIgdG91Y2htb3ZlLmR1cicsIGhhbmRsZU1vdXNlTW92ZSlcbiAgICAgIC5iaW5kKCdtb3VzZXVwLmR1ciB0b3VjaGVuZC5kdXInLCBoYW5kbGVNb3VzZVVwKTtcbiAgfVxuXG4gIC8vIGhhbmRsZSBjbGljayBhbmQgZHJhZyB3aXRoIG1vdXNlIG9yIHRvdWNoIGluIHByb2dyZXNzYmFyIGFuZCBvbiBoYW5kbGVcbiAgdGhpcy5wcm9ncmVzcy5iaW5kKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIGhhbmRsZU1vdXNlRG93bik7XG5cbiAgdGhpcy5oYW5kbGUuYmluZCgndG91Y2hzdGFydCBtb3VzZWRvd24nLCBoYW5kbGVNb3VzZURvd24pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9ncmVzc0JhcjtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL3Byb2dyZXNzYmFyLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZyA9IHJlcXVpcmUoJy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoJ1NhdmVUaW1lJyk7XG5cbi8qKlxuICogU2F2aW5nIHRoZSBwbGF5dGltZVxuICovXG52YXIgcHJlZml4ID0gJ3BvZGxvdmUtd2ViLXBsYXllci1wbGF5dGltZS0nO1xuXG5mdW5jdGlvbiBnZXRJdGVtICgpIHtcbiAgcmV0dXJuICtsb2NhbFN0b3JhZ2VbdGhpcy5rZXldO1xufVxuXG5mdW5jdGlvbiByZW1vdmVJdGVtICgpIHtcbiAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMua2V5KTtcbn1cblxuZnVuY3Rpb24gaGFzSXRlbSAoKSB7XG4gIHJldHVybiAodGhpcy5rZXkpIGluIGxvY2FsU3RvcmFnZTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlICgpIHtcbiAgbG9nLmRlYnVnKCd1cGRhdGUnLCB0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSk7XG4gIGlmICh0aGlzLnRpbWVsaW5lLmdldFRpbWUoKSA9PT0gMCkge1xuICAgIHJldHVybiByZW1vdmVJdGVtLmNhbGwodGhpcyk7XG4gIH1cbiAgdGhpcy5zZXRJdGVtKHRoaXMudGltZWxpbmUuZ2V0VGltZSgpKTtcbn1cblxuZnVuY3Rpb24gU2F2ZVRpbWUodGltZWxpbmUsIHBhcmFtcykge1xuICB0aGlzLnRpbWVsaW5lID0gdGltZWxpbmU7XG4gIHRoaXMua2V5ID0gcHJlZml4ICsgcGFyYW1zLnBlcm1hbGluaztcbiAgdGhpcy5nZXRJdGVtID0gZ2V0SXRlbS5iaW5kKHRoaXMpO1xuICB0aGlzLnJlbW92ZUl0ZW0gPSByZW1vdmVJdGVtLmJpbmQodGhpcyk7XG4gIHRoaXMuaGFzSXRlbSA9IGhhc0l0ZW0uYmluZCh0aGlzKTtcbiAgdGhpcy51cGRhdGUgPSB1cGRhdGUuYmluZCh0aGlzKTtcblxuICAvLyBzZXQgdGhlIHRpbWUgb24gc3RhcnRcbiAgaWYgKHRoaXMuaGFzSXRlbSgpKSB7XG4gICAgdGltZWxpbmUuc2V0VGltZSh0aGlzLmdldEl0ZW0oKSk7XG4gIH1cbn1cblxuU2F2ZVRpbWUucHJvdG90eXBlLnNldEl0ZW0gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgbG9jYWxTdG9yYWdlW3RoaXMua2V5XSA9IHZhbHVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlVGltZTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL3NhdmV0aW1lLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFRhYiA9IHJlcXVpcmUoJy4uL3RhYicpXG4gICwgU29jaWFsQnV0dG9uTGlzdCA9IHJlcXVpcmUoJy4uL3NvY2lhbC1idXR0b24tbGlzdCcpO1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi4vbG9nZ2luZycpLmdldExvZ2dlcignU2hhcmUnKTtcblxudmFyIHNlcnZpY2VzID0gWyd0d2l0dGVyJywgJ2ZhY2Vib29rJywgJ2dwbHVzJywgJ3R1bWJscicsICdlbWFpbCddXG4gICwgc2hhcmVPcHRpb25zID0gW1xuICAgIHtuYW1lOiAnU2hvdycsIHZhbHVlOiAnc2hvdyd9LFxuICAgIHtuYW1lOiAnRXBpc29kZScsIHZhbHVlOiAnZXBpc29kZScsIGRlZmF1bHQ6IHRydWV9LFxuICAgIHtuYW1lOiAnQ2hhcHRlcicsIHZhbHVlOiAnY2hhcHRlcicsIGRpc2FibGVkOiB0cnVlfSxcbiAgICB7bmFtZTogJ0V4YWN0bHkgdGhpcyBwYXJ0IGhlcmUnLCB2YWx1ZTogJ3RpbWVkJywgZGlzYWJsZWQ6IHRydWV9XG4gIF1cbiAgLCBzaGFyZURhdGEgPSB7fTtcblxuLy8gbW9kdWxlIGdsb2JhbHNcbnZhciBzZWxlY3RlZE9wdGlvbiwgc2hhcmVCdXR0b25zLCBsaW5rSW5wdXQ7XG5cbmZ1bmN0aW9uIGdldFNoYXJlRGF0YSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09ICdzaG93Jykge1xuICAgIHJldHVybiBzaGFyZURhdGEuc2hvdztcbiAgfVxuICB2YXIgZGF0YSA9IHNoYXJlRGF0YS5lcGlzb2RlO1xuICAvLyB0b2RvIGFkZCBjaGFwdGVyIHN0YXJ0IGFuZCBlbmQgdGltZSB0byB1cmxcbiAgLy9pZiAodmFsdWUgPT09ICdjaGFwdGVyJykge1xuICAvL31cbiAgLy8gdG9kbyBhZGQgc2VsZWN0ZWQgc3RhcnQgYW5kIGVuZCB0aW1lIHRvIHVybFxuICAvL2lmICh2YWx1ZSA9PT0gJ3RpbWVkJykge1xuICAvL31cbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVVybHMoZGF0YSkge1xuICBzaGFyZUJ1dHRvbnMudXBkYXRlKGRhdGEpO1xuICBsaW5rSW5wdXQudXBkYXRlKGRhdGEpO1xufVxuXG5mdW5jdGlvbiBvblNoYXJlT3B0aW9uQ2hhbmdlVG8gKGVsZW1lbnQsIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gZ2V0U2hhcmVEYXRhKHZhbHVlKTtcbiAgdmFyIHJhZGlvID0gZWxlbWVudC5maW5kKCdbdHlwZT1yYWRpb10nKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdGVkT3B0aW9uLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXG4gICAgcmFkaW8ucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgc2VsZWN0ZWRPcHRpb24gPSBlbGVtZW50O1xuICAgIGxvZy5kZWJ1Zygnc2hhcmluZyBvcHRpb25zIGNoYW5nZWQnLCBlbGVtZW50LCB2YWx1ZSk7XG5cbiAgICB1cGRhdGVVcmxzKGRhdGEpO1xuICB9O1xufVxuXG4vKipcbiAqIGNyZWF0ZSBzaGFyaW5nIGJ1dHRvblxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbiBzaGFyaW5nIG9wdGlvbiBkZWZpbml0aW9uXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBzaGFyZSBidXR0b24gcmVmZXJlbmNlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU9wdGlvbihvcHRpb24pIHtcbiAgaWYgKG9wdGlvbi5kaXNhYmxlZCkge1xuICAgIGxvZy5kZWJ1ZygnY3JlYXRlT3B0aW9uJywgJ29taXQgZGlzYWJsZWQgb3B0aW9uJywgb3B0aW9uLm5hbWUpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGRhdGEgPSBnZXRTaGFyZURhdGEob3B0aW9uLnZhbHVlKTtcblxuICBpZiAoIWRhdGEpIHtcbiAgICBsb2cuZGVidWcoJ2NyZWF0ZU9wdGlvbicsICdvbWl0IG9wdGlvbiB3aXRob3V0IGRhdGEnLCBvcHRpb24ubmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgZWxlbWVudCA9ICQoJzx0ciBjbGFzcz1cInNoYXJlLXNlbGVjdC1vcHRpb25cIj4nICtcbiAgICAnPHRkIGNsYXNzPVwic2hhcmUtZGVzY3JpcHRpb25cIj4nICsgb3B0aW9uLm5hbWUgKyAnPC90ZD4nICtcbiAgICAnPHRkIGNsYXNzPVwic2hhcmUtcmFkaW9cIj48aW5wdXQgdHlwZT1cInJhZGlvXCIgaWQ9XCJzaGFyZS1vcHRpb24tJyArIG9wdGlvbi5uYW1lICsgJ1wiIG5hbWU9XCJyLWdyb3VwXCIgdmFsdWU9XCInICsgb3B0aW9uLnRpdGxlICsgJ1wiPjwvdGQ+JyArXG4gICAgJzx0ZCBjbGFzcz1cInNoYXJlLWxhYmVsXCI+PGxhYmVsIGZvcj1cInNoYXJlLW9wdGlvbi0nICsgb3B0aW9uLm5hbWUgKyAnXCI+JyArIG9wdGlvbi50aXRsZSArICc8L2xhYmVsPjwvdGQ+JyArXG4gICAgJzwvdHI+J1xuICApO1xuICB2YXIgcmFkaW8gPSBlbGVtZW50LmZpbmQoJ1t0eXBlPXJhZGlvXScpO1xuXG4gIGlmIChvcHRpb24uZGVmYXVsdCkge1xuICAgIHNlbGVjdGVkT3B0aW9uID0gZWxlbWVudDtcbiAgICBlbGVtZW50LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIHJhZGlvLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICB1cGRhdGVVcmxzKGRhdGEpO1xuICB9XG4gIHZhciBjaGFuZ2VIYW5kbGVyID0gb25TaGFyZU9wdGlvbkNoYW5nZVRvKGVsZW1lbnQsIG9wdGlvbi52YWx1ZSk7XG4gIGVsZW1lbnQub24oJ2NsaWNrJywgY2hhbmdlSGFuZGxlcik7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gaHRtbCB0YWJsZSBlbGVtZW50IHRvIHdyYXAgYWxsIHNoYXJlIGJ1dHRvbnNcbiAqIEByZXR1cm5zIHtqUXVlcnl8SFRNTEVsZW1lbnR9IHNoYXJlIGJ1dHRvbiB3cmFwcGVyIHJlZmVyZW5jZVxuICovXG5mdW5jdGlvbiBjcmVhdGVTaGFyZUxpc3QocGFyYW1zKSB7XG4gIHNoYXJlT3B0aW9uc1swXS50aXRsZSA9IHBhcmFtcy5zaG93LnRpdGxlO1xuICBzaGFyZU9wdGlvbnNbMV0udGl0bGUgPSBwYXJhbXMudGl0bGU7XG4gIHZhciB0YWJsZSA9ICQoJzx0YWJsZSBjbGFzcz1cInNoYXJlLWJ1dHRvbi13cmFwcGVyXCIgZGF0YS10b2dnbGU9XCJidXR0b25zXCI+PGNhcHRpb24+UG9kY2FzdCB0ZWlsZW48L2NhcHRpb24+PHRib2R5PjwvdGJvZHk8L3RhYmxlPicpO1xuICB0YWJsZS5hcHBlbmQoc2hhcmVPcHRpb25zLm1hcChjcmVhdGVPcHRpb24pKTtcbiAgcmV0dXJuIHRhYmxlO1xufVxuXG4vKipcbiAqIGNyZWF0ZSBzaGFyaW5nIGJ1dHRvbnMgaW4gYSBmb3JtXG4gKiBAcmV0dXJucyB7alF1ZXJ5fSBmb3JtIGVsZW1lbnQgcmVmZXJlbmNlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNoYXJlT3B0aW9ucyhwYXJhbXMpIHtcbiAgdmFyIGZvcm0gPSAkKCc8Zm9ybT4nICtcbiAgICAnPGgzPldhcyBtw7ZjaHRlc3QgZHUgdGVpbGVuPzwvaDM+JyArXG4gICc8L2Zvcm0+Jyk7XG4gIGZvcm0uYXBwZW5kKGNyZWF0ZVNoYXJlTGlzdChwYXJhbXMpKTtcbiAgcmV0dXJuIGZvcm07XG59XG5cbi8qKlxuICogYnVpbGQgYW5kIHJldHVybiB0YWIgaW5zdGFuY2UgZm9yIHNoYXJpbmdcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgcGxheWVyIGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm5zIHtudWxsfFRhYn0gc2hhcmluZyB0YWIgaW5zdGFuY2Ugb3IgbnVsbCBpZiBwZXJtYWxpbmsgbWlzc2luZyBvciBzaGFyaW5nIGRpc2FibGVkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNoYXJlVGFiKHBhcmFtcykge1xuICBpZiAoIXBhcmFtcy5wZXJtYWxpbmsgfHwgcGFyYW1zLmhpZGVzaGFyZWJ1dHRvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHNoYXJlVGFiID0gbmV3IFRhYih7XG4gICAgaWNvbjogJ3B3cC1zaGFyZScsXG4gICAgdGl0bGU6ICdUZWlsZW4gYW56ZWlnZW4gLyB2ZXJiZXJnZW4nLFxuICAgIG5hbWU6ICdzaGFyZScsXG4gICAgaGVhZGxpbmU6ICdUZWlsZW4nXG4gIH0pO1xuXG4gIHNoYXJlQnV0dG9ucyA9IG5ldyBTb2NpYWxCdXR0b25MaXN0KHNlcnZpY2VzLCBnZXRTaGFyZURhdGEoJ2VwaXNvZGUnKSk7XG4gIGxpbmtJbnB1dCA9ICQoJzxoMz5EaXJla3RlciBMaW5rPC9oMz4nICtcbiAgICAnPGlucHV0IHR5cGU9XCJ1cmxcIiBuYW1lPVwic2hhcmUtbGluay11cmxcIiByZWFkb25seT4nKTtcbiAgbGlua0lucHV0LnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnZhbChkYXRhLnJhd1VybCk7XG4gIH07XG5cbiAgc2hhcmVUYWIuY3JlYXRlTWFpbkNvbnRlbnQoJycpXG4gICAgLmFwcGVuZChjcmVhdGVTaGFyZU9wdGlvbnMocGFyYW1zKSlcbiAgICAuYXBwZW5kKCc8aDM+VGVpbGVuIHZpYSAuLi48L2gzPicpXG4gICAgLmFwcGVuZChzaGFyZUJ1dHRvbnMubGlzdCk7XG4gIHNoYXJlVGFiLmNyZWF0ZUZvb3RlcignJykuYXBwZW5kKGxpbmtJbnB1dCk7XG5cbiAgcmV0dXJuIHNoYXJlVGFiO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNoYXJlKHBhcmFtcykge1xuICBzaGFyZURhdGEuZXBpc29kZSA9IHtcbiAgICBwb3N0ZXI6IHBhcmFtcy5wb3N0ZXIsXG4gICAgdGl0bGU6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMudGl0bGUpLFxuICAgIHVybDogZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5wZXJtYWxpbmspLFxuICAgIHJhd1VybDogcGFyYW1zLnBlcm1hbGluayxcbiAgICB0ZXh0OiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnRpdGxlICsgJyAnICsgcGFyYW1zLnBlcm1hbGluaylcbiAgfTtcbiAgc2hhcmVEYXRhLmNoYXB0ZXJzID0gcGFyYW1zLmNoYXB0ZXJzO1xuXG4gIGlmIChwYXJhbXMuc2hvdy51cmwpIHtcbiAgICBzaGFyZURhdGEuc2hvdyA9IHtcbiAgICAgIHBvc3RlcjogcGFyYW1zLnNob3cucG9zdGVyLFxuICAgICAgdGl0bGU6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuc2hvdy50aXRsZSksXG4gICAgICB1cmw6IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuc2hvdy51cmwpLFxuICAgICAgcmF3VXJsOiBwYXJhbXMuc2hvdy51cmwsXG4gICAgICB0ZXh0OiBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLnNob3cudGl0bGUgKyAnICcgKyBwYXJhbXMuc2hvdy51cmwpXG4gICAgfTtcbiAgfVxuXG4gIHNlbGVjdGVkT3B0aW9uID0gJ2VwaXNvZGUnO1xuICB0aGlzLnRhYiA9IGNyZWF0ZVNoYXJlVGFiKHBhcmFtcyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvc2hhcmUuanNcIixcIi9tb2R1bGVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGFyc2VUaW1lY29kZSA9IHJlcXVpcmUoJy4vdGltZWNvZGUnKS5wYXJzZTtcbnZhciBsb2cgPSByZXF1aXJlKCcuL2xvZ2dpbmcnKS5nZXRMb2dnZXIoJ1BsYXllcicpO1xuXG4vKipcbiAqIHBsYXllclxuICovXG52YXJcbi8vIEtlZXAgYWxsIFBsYXllcnMgb24gc2l0ZSAtIGZvciBpbmxpbmUgcGxheWVyc1xuLy8gZW1iZWRkZWQgcGxheWVycyBhcmUgcmVnaXN0ZXJlZCBpbiBwb2Rsb3ZlLXdlYnBsYXllci1tb2RlcmF0b3IgaW4gdGhlIGVtYmVkZGluZyBwYWdlXG4gIHBsYXllcnMgPSBbXSxcbi8vIGFsbCB1c2VkIGZ1bmN0aW9uc1xuICBtZWpzb3B0aW9ucyA9IHtcbiAgICBkZWZhdWx0VmlkZW9XaWR0aDogNDgwLFxuICAgIGRlZmF1bHRWaWRlb0hlaWdodDogMjcwLFxuICAgIHZpZGVvV2lkdGg6IC0xLFxuICAgIHZpZGVvSGVpZ2h0OiAtMSxcbiAgICBhdWRpb1dpZHRoOiAtMSxcbiAgICBhdWRpb0hlaWdodDogMzAsXG4gICAgc3RhcnRWb2x1bWU6IDAuOCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBlbmFibGVBdXRvc2l6ZTogdHJ1ZSxcbiAgICBmZWF0dXJlczogWydwbGF5cGF1c2UnLCAnY3VycmVudCcsICdwcm9ncmVzcycsICdkdXJhdGlvbicsICd0cmFja3MnLCAnZnVsbHNjcmVlbiddLFxuICAgIGFsd2F5c1Nob3dDb250cm9sczogZmFsc2UsXG4gICAgaVBhZFVzZU5hdGl2ZUNvbnRyb2xzOiBmYWxzZSxcbiAgICBpUGhvbmVVc2VOYXRpdmVDb250cm9sczogZmFsc2UsXG4gICAgQW5kcm9pZFVzZU5hdGl2ZUNvbnRyb2xzOiBmYWxzZSxcbiAgICBhbHdheXNTaG93SG91cnM6IGZhbHNlLFxuICAgIHNob3dUaW1lY29kZUZyYW1lQ291bnQ6IGZhbHNlLFxuICAgIGZyYW1lc1BlclNlY29uZDogMjUsXG4gICAgZW5hYmxlS2V5Ym9hcmQ6IHRydWUsXG4gICAgcGF1c2VPdGhlclBsYXllcnM6IHRydWUsXG4gICAgZHVyYXRpb246IGZhbHNlLFxuICAgIHBsdWdpbnM6IFsnZmxhc2gnLCAnc2lsdmVybGlnaHQnXSxcbiAgICBwbHVnaW5QYXRoOiAnLi9iaW4vJyxcbiAgICBmbGFzaE5hbWU6ICdmbGFzaG1lZGlhZWxlbWVudC5zd2YnLFxuICAgIHNpbHZlcmxpZ2h0TmFtZTogJ3NpbHZlcmxpZ2h0bWVkaWFlbGVtZW50LnhhcCdcbiAgfSxcbiAgZGVmYXVsdHMgPSB7XG4gICAgY2hhcHRlcmxpbmtzOiAnYWxsJyxcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIGR1cmF0aW9uOiBmYWxzZSxcbiAgICBjaGFwdGVyc1Zpc2libGU6IGZhbHNlLFxuICAgIHRpbWVjb250cm9sc1Zpc2libGU6IGZhbHNlLFxuICAgIHNoYXJlYnV0dG9uc1Zpc2libGU6IGZhbHNlLFxuICAgIGRvd25sb2FkYnV0dG9uc1Zpc2libGU6IGZhbHNlLFxuICAgIHN1bW1hcnlWaXNpYmxlOiBmYWxzZSxcbiAgICBoaWRldGltZWJ1dHRvbjogZmFsc2UsXG4gICAgaGlkZWRvd25sb2FkYnV0dG9uOiBmYWxzZSxcbiAgICBoaWRlc2hhcmVidXR0b246IGZhbHNlLFxuICAgIHNoYXJld2hvbGVlcGlzb2RlOiBmYWxzZSxcbiAgICBzb3VyY2VzOiBbXVxuICB9O1xuXG4vKipcbiAqIHJlbW92ZSAncHgnIHVuaXQsIHNldCB3aXRkdGggdG8gMTAwJSBmb3IgJ2F1dG8nXG4gKiBAcGFyYW0ge3N0cmluZ30gd2lkdGhcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVdpZHRoKHdpZHRoKSB7XG4gIGlmICh3aWR0aC50b0xvd2VyQ2FzZSgpID09PSAnYXV0bycpIHtcbiAgICByZXR1cm4gJzEwMCUnO1xuICB9XG4gIHJldHVybiB3aWR0aC5yZXBsYWNlKCdweCcsICcnKTtcbn1cblxuLyoqXG4gKiBhdWRpbyBvciB2aWRlbyB0YWdcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBsYXllclxuICogQHJldHVybnMge3N0cmluZ30gJ2F1ZGlvJyB8ICd2aWRlbydcbiAqL1xuZnVuY3Rpb24gZ2V0UGxheWVyVHlwZSAocGxheWVyKSB7XG4gIHJldHVybiBwbGF5ZXIudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vKipcbiAqIGtpbGwgcGxheS9wYXVzZSBidXR0b24gZnJvbSBtaW5pcGxheWVyXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiByZW1vdmVQbGF5UGF1c2Uob3B0aW9ucykge1xuICAkLmVhY2gob3B0aW9ucy5mZWF0dXJlcywgZnVuY3Rpb24gKGkpIHtcbiAgICBpZiAodGhpcyA9PT0gJ3BsYXlwYXVzZScpIHtcbiAgICAgIG9wdGlvbnMuZmVhdHVyZXMuc3BsaWNlKGksIDEpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogcGxheWVyIGVycm9yIGhhbmRsaW5nIGZ1bmN0aW9uXG4gKiB3aWxsIHJlbW92ZSB0aGUgdG9wbW9zdCBtZWRpYWZpbGUgZnJvbSBzcmMgb3Igc291cmNlIGxpc3RcbiAqIHBvc3NpYmxlIGZpeCBmb3IgRmlyZWZveCBBQUMgaXNzdWVzXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZVVucGxheWFibGVNZWRpYSgpIHtcbiAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgaWYgKCR0aGlzLmF0dHIoJ3NyYycpKSB7XG4gICAgJHRoaXMucmVtb3ZlQXR0cignc3JjJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBzb3VyY2VMaXN0ID0gJHRoaXMuY2hpbGRyZW4oJ3NvdXJjZScpO1xuICBpZiAoc291cmNlTGlzdC5sZW5ndGgpIHtcbiAgICBzb3VyY2VMaXN0LmZpcnN0KCkucmVtb3ZlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlKHBsYXllciwgcGFyYW1zLCBjYWxsYmFjaykge1xuICB2YXIganFQbGF5ZXIsXG4gICAgcGxheWVyVHlwZSA9IGdldFBsYXllclR5cGUocGxheWVyKSxcbiAgICBzZWNBcnJheSxcbiAgICB3cmFwcGVyO1xuXG4gIGpxUGxheWVyID0gJChwbGF5ZXIpO1xuICB3cmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPjwvZGl2PicpO1xuICBqcVBsYXllci5yZXBsYWNlV2l0aCh3cmFwcGVyKTtcblxuICAvL2ZpbmUgdHVuaW5nIHBhcmFtc1xuICBwYXJhbXMud2lkdGggPSBub3JtYWxpemVXaWR0aChwYXJhbXMud2lkdGgpO1xuICBpZiAocGxheWVyVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgIC8vIEZJWE1FOiBTaW5jZSB0aGUgcGxheWVyIGlzIG5vIGxvbmdlciB2aXNpYmxlIGl0IGhhcyBubyB3aWR0aFxuICAgIGlmIChwYXJhbXMuYXVkaW9XaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbXMud2lkdGggPSBwYXJhbXMuYXVkaW9XaWR0aDtcbiAgICB9XG4gICAgbWVqc29wdGlvbnMuYXVkaW9XaWR0aCA9IHBhcmFtcy53aWR0aDtcbiAgICAvL2tpbGwgZnVsbHNjcmVlbiBidXR0b25cbiAgICAkLmVhY2gobWVqc29wdGlvbnMuZmVhdHVyZXMsIGZ1bmN0aW9uIChpKSB7XG4gICAgICBpZiAodGhpcyA9PT0gJ2Z1bGxzY3JlZW4nKSB7XG4gICAgICAgIG1lanNvcHRpb25zLmZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZW1vdmVQbGF5UGF1c2UobWVqc29wdGlvbnMpO1xuICB9XG4gIGVsc2UgaWYgKHBsYXllclR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAvL3ZpZGVvIHBhcmFtc1xuICAgIGlmIChmYWxzZSAmJiBwYXJhbXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1lanNvcHRpb25zLnZpZGVvV2lkdGggPSBwYXJhbXMud2lkdGg7XG4gICAgICBtZWpzb3B0aW9ucy52aWRlb0hlaWdodCA9IHBhcmFtcy5oZWlnaHQ7XG4gICAgfVxuICAgIC8vIEZJWE1FXG4gICAgaWYgKGZhbHNlICYmICQocGxheWVyKS5hdHRyKCd3aWR0aCcpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhcmFtcy53aWR0aCA9ICQocGxheWVyKS5hdHRyKCd3aWR0aCcpO1xuICAgIH1cbiAgfVxuXG4gIC8vZHVyYXRpb24gY2FuIGJlIGdpdmVuIGluIHNlY29uZHMgb3IgaW4gTlBUIGZvcm1hdFxuICBpZiAocGFyYW1zLmR1cmF0aW9uICYmIHBhcmFtcy5kdXJhdGlvbiAhPT0gcGFyc2VJbnQocGFyYW1zLmR1cmF0aW9uLCAxMCkpIHtcbiAgICBzZWNBcnJheSA9IHBhcnNlVGltZWNvZGUocGFyYW1zLmR1cmF0aW9uKTtcbiAgICBwYXJhbXMuZHVyYXRpb24gPSBzZWNBcnJheVswXTtcbiAgfVxuXG4gIC8vT3ZlcndyaXRlIE1FSlMgZGVmYXVsdCB2YWx1ZXMgd2l0aCBhY3R1YWwgZGF0YVxuICAkLmVhY2gobWVqc29wdGlvbnMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5IGluIHBhcmFtcykge1xuICAgICAgbWVqc29wdGlvbnNba2V5XSA9IHBhcmFtc1trZXldO1xuICAgIH1cbiAgfSk7XG5cbiAgLy93cmFwcGVyIGFuZCBpbml0IHN0dWZmXG4gIC8vIEZJWE1FOiBiZXR0ZXIgY2hlY2sgZm9yIG51bWVyaWNhbCB2YWx1ZVxuICBpZiAocGFyYW1zLndpZHRoLnRvU3RyaW5nKCkudHJpbSgpID09PSBwYXJzZUludChwYXJhbXMud2lkdGgsIDEwKS50b1N0cmluZygpKSB7XG4gICAgcGFyYW1zLndpZHRoID0gcGFyc2VJbnQocGFyYW1zLndpZHRoLCAxMCkgKyAncHgnO1xuICB9XG5cbiAgcGxheWVycy5wdXNoKHBsYXllcik7XG5cbiAgLy9hZGQgcGFyYW1zIGZyb20gYXVkaW8gYW5kIHZpZGVvIGVsZW1lbnRzXG4gIGpxUGxheWVyLmZpbmQoJ3NvdXJjZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgIGlmICghcGFyYW1zLnNvdXJjZXMpIHtcbiAgICAgIHBhcmFtcy5zb3VyY2VzID0gW107XG4gICAgfVxuICAgIHBhcmFtcy5zb3VyY2VzLnB1c2goJCh0aGlzKS5hdHRyKCdzcmMnKSk7XG4gIH0pO1xuXG4gIHBhcmFtcy50eXBlID0gcGxheWVyVHlwZTtcbiAgLy8gaW5pdCBNRUpTIHRvIHBsYXllclxuICBtZWpzb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24gKHBsYXllckVsZW1lbnQpIHtcbiAgICBqcVBsYXllci5vbignZXJyb3InLCByZW1vdmVVbnBsYXlhYmxlTWVkaWEpOyAgIC8vIFRoaXMgbWlnaHQgYmUgYSBmaXggdG8gc29tZSBGaXJlZm94IEFBQyBpc3N1ZXMuXG4gICAgY2FsbGJhY2socGxheWVyRWxlbWVudCwgcGFyYW1zLCB3cmFwcGVyKTtcbiAgfTtcbiAgdmFyIG1lID0gbmV3IE1lZGlhRWxlbWVudChwbGF5ZXIsIG1lanNvcHRpb25zKTtcbiAgbG9nLmluZm8oJ01lZGlhRWxlbWVudCcsIG1lKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY3JlYXRlLFxuICBkZWZhdWx0czogZGVmYXVsdHMsXG4gIHBsYXllcnM6IHBsYXllcnNcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvcGxheWVyLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc29jaWFsTmV0d29ya3MgPSByZXF1aXJlKCcuL3NvY2lhbC1uZXR3b3JrcycpO1xuXG5mdW5jdGlvbiBjcmVhdGVCdXR0b25XaXRoKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzZXJ2aWNlTmFtZSkge1xuICAgIHZhciBzZXJ2aWNlID0gc29jaWFsTmV0d29ya3MuZ2V0KHNlcnZpY2VOYW1lKTtcbiAgICByZXR1cm4gc2VydmljZS5nZXRCdXR0b24ob3B0aW9ucyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFNvY2lhbEJ1dHRvbkxpc3QgKHNlcnZpY2VzLCBvcHRpb25zKSB7XG4gIHZhciBjcmVhdGVCdXR0b24gPSBjcmVhdGVCdXR0b25XaXRoKG9wdGlvbnMpO1xuICB0aGlzLmJ1dHRvbnMgPSBzZXJ2aWNlcy5tYXAoY3JlYXRlQnV0dG9uKTtcblxuICB0aGlzLmxpc3QgPSAkKCc8dWwgY2xhc3M9XCJzb2NpYWwtbmV0d29yay1idXR0b25zXCI+PC91bD4nKTtcbiAgdGhpcy5idXR0b25zLmZvckVhY2goZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgIHZhciBsaXN0RWxlbWVudCA9ICQoJzxsaT48L2xpPicpLmFwcGVuZChidXR0b24uZWxlbWVudCk7XG4gICAgdGhpcy5saXN0LmFwcGVuZChsaXN0RWxlbWVudCk7XG4gIH0sIHRoaXMpO1xufVxuXG5Tb2NpYWxCdXR0b25MaXN0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB0aGlzLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgYnV0dG9uLnVwZGF0ZVVybChvcHRpb25zKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvY2lhbEJ1dHRvbkxpc3Q7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvc29jaWFsLWJ1dHRvbi1saXN0LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBjcmVhdGVCdXR0b24gKG9wdGlvbnMpIHtcbiAgcmV0dXJuICQoJzxhIGNsYXNzPVwicHdwLWNvbnRyYXN0LScgKyBvcHRpb25zLmljb24gKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIicgKyBvcHRpb25zLnVybCArICdcIiAnICtcbiAgJ3RpdGxlPVwiJyArIG9wdGlvbnMudGl0bGUgKyAnXCI+PGkgY2xhc3M9XCJpY29uIHB3cC0nICsgb3B0aW9ucy5pY29uICsgJ1wiPjwvaT48L2E+JyArXG4gICc8c3Bhbj4nICsgb3B0aW9ucy50aXRsZSArICc8L3NwYW4+Jyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3QgdG8gaW50ZXJhY3Qgd2l0aCBhIHNvY2lhbCBuZXR3b3JrXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBJY29uLCB0aXRsZSBwcm9maWxlLSBhbmQgc2hhcmluZy1VUkwtdGVtcGxhdGVzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gU29jaWFsTmV0d29yayAob3B0aW9ucykge1xuICB0aGlzLmljb24gPSBvcHRpb25zLmljb247XG4gIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICB0aGlzLnVybCA9IG9wdGlvbnMucHJvZmlsZVVybDtcbiAgdGhpcy5zaGFyZVVybCA9IG9wdGlvbnMuc2hhcmVVcmw7XG59XG5cbi8qKlxuICogYnVpbGQgVVJMIGZvciBzaGFyaW5nIGEgdGV4dCwgYSB0aXRsZSBhbmQgYSB1cmxcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGNvbnRlbnRzIHRvIGJlIHNoYXJlZFxuICogQHJldHVybnMge3N0cmluZ30gVVJMIHRvIHNoYXJlIHRoZSBjb250ZW50c1xuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRTaGFyZVVybCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBzaGFyZVVybCA9IHRoaXMuc2hhcmVVcmxcbiAgICAucmVwbGFjZSgnJHRleHQkJywgb3B0aW9ucy50ZXh0KVxuICAgIC5yZXBsYWNlKCckdGl0bGUkJywgb3B0aW9ucy50aXRsZSlcbiAgICAucmVwbGFjZSgnJHVybCQnLCBvcHRpb25zLnVybCk7XG4gIHJldHVybiB0aGlzLnVybCArIHNoYXJlVXJsO1xufTtcblxuLyoqXG4gKiBidWlsZCBVUkwgdG8gYSBnaXZlbiBwcm9maWxlXG4gKiBAcGFyYW0ge29iamVjdH0gcHJvZmlsZSBVc2VybmFtZSB0byBsaW5rIHRvXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBwcm9maWxlIFVSTFxuICovXG5Tb2NpYWxOZXR3b3JrLnByb3RvdHlwZS5nZXRQcm9maWxlVXJsID0gZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgcmV0dXJuIHRoaXMudXJsICsgcHJvZmlsZTtcbn07XG5cbi8qKlxuICogZ2V0IHByb2ZpbGUgYnV0dG9uIGVsZW1lbnRcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIG9wdGlvbnMucHJvZmlsZSBkZWZpbmVzIHRoZSBwcm9maWxlIHRoZSBidXR0b24gbGlua3MgdG9cbiAqIEByZXR1cm5zIHt7ZWxlbWVudDp7alF1ZXJ5fX19IGJ1dHRvbiByZWZlcmVuY2VcbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0UHJvZmlsZUJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucy5wcm9maWxlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50OiBjcmVhdGVCdXR0b24oe1xuICAgICAgdXJsOiB0aGlzLmdldFByb2ZpbGVVcmwob3B0aW9ucy5wcm9maWxlKSxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgaWNvbjogdGhpcy5pY29uXG4gICAgfSlcbiAgfTtcbn07XG5cbi8qKlxuICogZ2V0IHNoYXJlIGJ1dHRvbiBlbGVtZW50IGFuZCBVUkwgdXBkYXRlIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBpbml0aWFsIGNvbnRlbnRzIHRvIGJlIHNoYXJlZCB3aXRoIHRoZSBidXR0b25cbiAqIEByZXR1cm5zIHt7ZWxlbWVudDp7alF1ZXJ5fSwgdXBkYXRlVXJsOntmdW5jdGlvbn19fSBidXR0b24gcmVmZXJlbmNlIGFuZCB1cGRhdGUgZnVuY3Rpb25cbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0U2hhcmVCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gIGlmICghdGhpcy5zaGFyZVVybCB8fCAhb3B0aW9ucy50aXRsZSB8fCAhb3B0aW9ucy51cmwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy50ZXh0KSB7XG4gICAgb3B0aW9ucy50ZXh0ID0gb3B0aW9ucy50aXRsZSArICclMjAnICsgb3B0aW9ucy51cmw7XG4gIH1cblxuICB2YXIgZWxlbWVudCA9IGNyZWF0ZUJ1dHRvbih7XG4gICAgdXJsOiB0aGlzLmdldFNoYXJlVXJsKG9wdGlvbnMpLFxuICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgIGljb246IHRoaXMuaWNvblxuICB9KTtcblxuICB2YXIgdXBkYXRlVXJsID0gZnVuY3Rpb24gKHVwZGF0ZU9wdGlvbnMpIHtcbiAgICBlbGVtZW50LmdldCgwKS5ocmVmID0gdGhpcy5nZXRTaGFyZVVybCh1cGRhdGVPcHRpb25zKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudDogZWxlbWVudCxcbiAgICB1cGRhdGVVcmw6IHVwZGF0ZVVybFxuICB9O1xufTtcblxuLyoqXG4gKiBnZXQgc2hhcmUgb3IgcHJvZmlsZSBidXR0b24gZGVwZW5kaW5nIG9uIHRoZSBvcHRpb25zIGdpdmVuXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBvYmplY3Qgd2l0aCBlaXRoZXIgcHJvZmlsZW5hbWUgb3IgY29udGVudHMgdG8gc2hhcmVcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJ1dHRvbiBvYmplY3RcbiAqL1xuU29jaWFsTmV0d29yay5wcm90b3R5cGUuZ2V0QnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMucHJvZmlsZSkge1xuICAgIHJldHVybiB0aGlzLmdldFByb2ZpbGVCdXR0b24ob3B0aW9ucyk7XG4gIH1cbiAgaWYgKHRoaXMuc2hhcmVVcmwgJiYgb3B0aW9ucy50aXRsZSAmJiBvcHRpb25zLnVybCkge1xuICAgIHJldHVybiB0aGlzLmdldFNoYXJlQnV0dG9uKG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb2NpYWxOZXR3b3JrO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NvY2lhbC1uZXR3b3JrLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU29jaWFsTmV0d29yayA9IHJlcXVpcmUoJy4vc29jaWFsLW5ldHdvcmsnKTtcbnZhciBsb2cgPSByZXF1aXJlKCcuL2xvZ2dpbmcnKS5nZXRMb2dnZXIoJ1NvY2lhbE5ldFdvcmtzJyk7XG5cbnZhciBzb2NpYWxOZXR3b3JrcyA9IHtcbiAgdHdpdHRlcjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICd0d2l0dGVyJyxcbiAgICB0aXRsZTogJ1R3aXR0ZXInLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL3R3aXR0ZXIuY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90ZXh0PSR0ZXh0JCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGZsYXR0cjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdmbGF0dHInLFxuICAgIHRpdGxlOiAnRmxhdHRyJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9mbGF0dHIuY29tL3Byb2ZpbGUvJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RleHQ9JHRleHQkJnVybD0kdXJsJCdcbiAgfSksXG5cbiAgZmFjZWJvb2s6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnZmFjZWJvb2snLFxuICAgIHRpdGxlOiAnRmFjZWJvb2snLFxuICAgIHByb2ZpbGVVcmw6ICdodHRwczovL2ZhY2Vib29rLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmUucGhwP3Q9JHRleHQkJnU9JHVybCQnXG4gIH0pLFxuXG4gIGFkbjogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdhZG4nLFxuICAgIHRpdGxlOiAnQXBwLm5ldCcsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vYWxwaGEuYXBwLm5ldC8nLFxuICAgIHNoYXJlVXJsOiAnaW50ZW50L3Bvc3Q/dGV4dD0kdGV4dCQnXG4gIH0pLFxuXG4gIHNvdW5kY2xvdWQ6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnc291bmRjbG91ZCcsXG4gICAgdGl0bGU6ICdTb3VuZENsb3VkJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS8nLFxuICAgIHNoYXJlVXJsOiAnc2hhcmU/dGl0bGU9JHRpdGxlJCZ1cmw9JHVybCQnXG4gIH0pLFxuXG4gIGluc3RhZ3JhbTogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdpbnN0YWdyYW0nLFxuICAgIHRpdGxlOiAnSW5zdGFncmFtJyxcbiAgICBwcm9maWxlVXJsOiAnaHR0cDovL2luc3RhZ3JhbS5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RpdGxlPSR0aXRsZSQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICB0dW1ibHI6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAndHVtYmxyJyxcbiAgICB0aXRsZTogJ1R1bWJscicsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vd3d3LnR1bWJsci5jb20vJyxcbiAgICBzaGFyZVVybDogJ3NoYXJlP3RpdGxlPSR0aXRsZSQmdXJsPSR1cmwkJ1xuICB9KSxcblxuICBlbWFpbDogbmV3IFNvY2lhbE5ldHdvcmsoe1xuICAgIGljb246ICdtZXNzYWdlJyxcbiAgICB0aXRsZTogJ0UtTWFpbCcsXG4gICAgcHJvZmlsZVVybDogJ21haWx0bzonLFxuICAgIHNoYXJlVXJsOiAnP3N1YmplY3Q9JHRpdGxlJCZib2R5PSR0ZXh0JCdcbiAgfSksXG5cbiAgZ3BsdXM6IG5ldyBTb2NpYWxOZXR3b3JrKHtcbiAgICBpY29uOiAnZ29vZ2xlLXBsdXMnLFxuICAgIHRpdGxlOiAnR29vZ2xlKycsXG4gICAgcHJvZmlsZVVybDogJ2h0dHBzOi8vcGx1cy5nb29nbGUuY29tLycsXG4gICAgc2hhcmVVcmw6ICdzaGFyZT90aXRsZT0kdGl0bGUkJnVybD0kdXJsJCdcbiAgfSlcbn07XG5cbi8qKlxuICogcmV0dXJucyB0aGUgc2VydmljZSByZWdpc3RlcmVkIHdpdGggdGhlIGdpdmVuIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZXJ2aWNlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc29jaWFsIG5ldHdvcmtcbiAqIEByZXR1cm5zIHtTb2NpYWxOZXR3b3JrfSBUaGUgbmV0d29yayB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gKi9cbmZ1bmN0aW9uIGdldFNlcnZpY2UgKHNlcnZpY2VOYW1lKSB7XG4gIHZhciBzZXJ2aWNlID0gc29jaWFsTmV0d29ya3Nbc2VydmljZU5hbWVdO1xuICBpZiAoIXNlcnZpY2UpIHtcbiAgICBsb2cuZXJyb3IoJ1Vua25vd24gc2VydmljZScsIHNlcnZpY2VOYW1lKTtcbiAgfVxuICByZXR1cm4gc2VydmljZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldDogZ2V0U2VydmljZVxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9zb2NpYWwtbmV0d29ya3MuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogV2hlbiB0YWIgY29udGVudCBpcyBzY3JvbGxlZCwgYSBib3hzaGFkb3cgaXMgYWRkZWQgdG8gdGhlIGhlYWRlclxuICogQHBhcmFtIGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGFkZFNoYWRvd09uU2Nyb2xsKGV2ZW50KSB7XG4gIHZhciBzY3JvbGwgPSBldmVudC5jdXJyZW50VGFyZ2V0LnNjcm9sbFRvcDtcbiAgZXZlbnQuZGF0YS5oZWFkZXIudG9nZ2xlQ2xhc3MoJ3Njcm9sbGVkJywgKHNjcm9sbCA+PSA1ICkpO1xufVxuXG4vKipcbiAqIFJldHVybiBhbiBodG1sIHNlY3Rpb24gZWxlbWVudCBhcyBhIHdyYXBwZXIgZm9yIHRoZSB0YWJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7KnxqUXVlcnl8SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRlbnRCb3gob3B0aW9ucykge1xuICB2YXIgY2xhc3NlcyA9IFsndGFiJ107XG4gIGNsYXNzZXMucHVzaChvcHRpb25zLm5hbWUpO1xuICBpZiAob3B0aW9ucy5hY3RpdmUpIHtcbiAgICBjbGFzc2VzLnB1c2goJ2FjdGl2ZScpO1xuICB9XG4gIHJldHVybiAkKCc8c2VjdGlvbiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIj48L3NlY3Rpb24+Jyk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgdGFiXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRhYihvcHRpb25zKSB7XG4gIHRoaXMuaWNvbiA9IG9wdGlvbnMuaWNvbjtcbiAgdGhpcy50aXRsZSA9IG9wdGlvbnMudGl0bGU7XG4gIHRoaXMuaGVhZGxpbmUgPSBvcHRpb25zLmhlYWRsaW5lO1xuICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7XG5cbiAgdGhpcy5ib3ggPSBjcmVhdGVDb250ZW50Qm94KG9wdGlvbnMpO1xuICB2YXIgaGVhZGVyID0gdGhpcy5jcmVhdGVIZWFkZXIoKTtcbiAgdGhpcy5ib3gub24oJ3Njcm9sbCcsIHtoZWFkZXI6IGhlYWRlcn0sIGFkZFNoYWRvd09uU2Nyb2xsKTtcblxuICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLnRvZ2dsZSA9IG51bGw7XG59XG5cbi8qKlxuICogQWRkIGNsYXNzICdhY3RpdmUnIHRvIHRoZSBhY3RpdmUgdGFiXG4gKi9cblRhYi5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICB0aGlzLmJveC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIHRoaXMudG9nZ2xlLmFkZENsYXNzKCdhY3RpdmUnKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzICdhY3RpdmUnIGZyb20gdGhlIGluYWN0aXZlIHRhYlxuICovXG5UYWIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLmJveC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gIHRoaXMudG9nZ2xlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGh0bWwgaGVhZGVyIGVsZW1lbnQgd2l0aCBhIGhlYWRsaW5lXG4gKi9cblRhYi5wcm90b3R5cGUuY3JlYXRlSGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBoZWFkZXIgPSAkKCc8aGVhZGVyIGNsYXNzPVwidGFiLWhlYWRlclwiPjxoMiBjbGFzcz1cInRhYi1oZWFkbGluZVwiPicgK1xuICAgICc8aSBjbGFzcz1cImljb24gJyArIHRoaXMuaWNvbiArICdcIj48L2k+JyArIHRoaXMuaGVhZGxpbmUgKyAnPC9oMj48L2hlYWRlcj4nKTtcbiAgdGhpcy5ib3guYXBwZW5kKGhlYWRlcik7XG4gIHJldHVybiBoZWFkZXI7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGRpdiBlbGVtZW50IHdpdGggY2xhc3MgbWFpbiB0byB0aGUgdGFiJ3MgY29udGVudCBib3hcbiAqIEBwYXJhbSBjb250ZW50XG4gKi9cblRhYi5wcm90b3R5cGUuY3JlYXRlTWFpbkNvbnRlbnQgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBtYWluRGl2ID0gJCgnPGRpdiBjbGFzcz1cIm1haW5cIj4nICsgY29udGVudCArICc8L2RpdicpO1xuICB0aGlzLmJveC5hcHBlbmQobWFpbkRpdik7XG4gIHJldHVybiBtYWluRGl2O1xufTtcblxuLyoqXG4gKiBBcHBlbmQgYW4gaHRtbCBhc2lkZSBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVBc2lkZSA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgdmFyIGFzaWRlID0gJCgnPGFzaWRlIGNsYXNzPVwiYXNpZGVcIj4nICsgY29udGVudCArICc8L2FzaWRlPicpO1xuICB0aGlzLmJveC5hcHBlbmQoYXNpZGUpO1xuICByZXR1cm4gYXNpZGU7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBhbiBodG1sIGZvb3RlciBlbGVtZW50IHRvIHRoZSB0YWIncyBjb250ZW50IGJveFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuVGFiLnByb3RvdHlwZS5jcmVhdGVGb290ZXIgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHZhciBmb290ZXI7XG4gIGlmKCFjb250ZW50KSB7XG4gICAgY29udGVudCA9ICcnO1xuICB9XG4gIGZvb3RlciA9ICQoJzxmb290ZXI+JyArIGNvbnRlbnQgKyAnPC9mb290ZXI+Jyk7XG4gIHRoaXMuYm94LmFwcGVuZChmb290ZXIpO1xuICByZXR1cm4gZm9vdGVyO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYWI7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdGFiLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCdUYWJSZWdpc3RyeScpO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1RhYn0gdGFiXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gZ2V0VG9nZ2xlQ2xpY2tIYW5kbGVyKHRhYikge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICBsb2cuZGVidWcoJ2FjdGl2ZVRhYicsIHRoaXMuYWN0aXZlVGFiKTtcbiAgaWYgKHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgdGhpcy5hY3RpdmVUYWIuY2xvc2UoKTtcbiAgfVxuICBpZiAodGhpcy5hY3RpdmVUYWIgPT09IHRhYikge1xuICAgIHRoaXMuYWN0aXZlVGFiID0gbnVsbDtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdGhpcy5hY3RpdmVUYWIgPSB0YWI7XG4gIHRoaXMuYWN0aXZlVGFiLm9wZW4oKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwbGF5ZXJcbiAqL1xuZnVuY3Rpb24gbG9nQ3VycmVudFRpbWUgKHBsYXllcikge1xuICBsb2cuZGVidWcoJ3BsYXllci5jdXJyZW50VGltZScsIHBsYXllci5jdXJyZW50VGltZSk7XG59XG5cbmZ1bmN0aW9uIFRhYlJlZ2lzdHJ5KCkge1xuICAvKipcbiAgICogd2lsbCBzdG9yZSBhIHJlZmVyZW5jZSB0byBjdXJyZW50bHkgYWN0aXZlIHRhYiBpbnN0YW5jZSB0byBjbG9zZSBpdCB3aGVuIGFub3RoZXIgb25lIGlzIG9wZW5lZFxuICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgKi9cbiAgdGhpcy5hY3RpdmVUYWIgPSBudWxsO1xuICB0aGlzLnRvZ2dsZWJhciA9ICQoJzxkaXYgY2xhc3M9XCJ0b2dnbGViYXIgYmFyXCI+PC9kaXY+Jyk7XG4gIHRoaXMudG9nZ2xlTGlzdCA9ICQoJzx1bCBjbGFzcz1cInRhYmxpc3RcIj48L3VsPicpO1xuICB0aGlzLnRvZ2dsZWJhci5hcHBlbmQodGhpcy50b2dnbGVMaXN0KTtcbiAgdGhpcy5jb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwidGFic1wiPjwvZGl2PicpO1xuICB0aGlzLmxpc3RlbmVycyA9IFtsb2dDdXJyZW50VGltZV07XG4gIHRoaXMudGFicyA9IFtdO1xufVxuXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuY3JlYXRlVG9nZ2xlRm9yID0gZnVuY3Rpb24gKHRhYikge1xuICB2YXIgdG9nZ2xlID0gJCgnPGxpIHRpdGxlPVwiJyArIHRhYi50aXRsZSArICdcIj4nICtcbiAgICAgICc8YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJidXR0b24gYnV0dG9uLXRvZ2dsZSAnICsgdGFiLmljb24gKyAnXCI+PC9hPicgK1xuICAgICc8L2xpPicpO1xuICB0b2dnbGUub24oJ2NsaWNrJywgZ2V0VG9nZ2xlQ2xpY2tIYW5kbGVyLmJpbmQodGhpcywgdGFiKSk7XG4gIHRoaXMudG9nZ2xlTGlzdC5hcHBlbmQodG9nZ2xlKTtcbiAgcmV0dXJuIHRvZ2dsZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSB0YWIgYW5kIG9wZW4gaXQgaWYgaXQgaXMgaW5pdGlhbGx5IHZpc2libGVcbiAqIEBwYXJhbSB7VGFifSB0YWJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmlzaWJsZVxuICovXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odGFiKSB7XG4gIGlmICh0YWIgPT09IG51bGwpIHsgcmV0dXJuOyB9XG4gIHRoaXMudGFicy5wdXNoKHRhYik7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZCh0YWIuYm94KTtcbiAgdGFiLnRvZ2dsZSA9IHRoaXMuY3JlYXRlVG9nZ2xlRm9yKHRhYik7XG59O1xuXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUub3BlbkluaXRpYWwgPSBmdW5jdGlvbiAodGFiTmFtZSkge1xuICBpZiAoIXRhYk5hbWUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoaW5nVGFicyA9IHRoaXMudGFicy5maWx0ZXIoZnVuY3Rpb24gKHRhYikge1xuICAgIHJldHVybiAodGFiLm5hbWUgPT09IHRhYk5hbWUpO1xuICB9KTtcbiAgaWYgKG1hdGNoaW5nVGFicy5sZW5ndGggPT09IDApIHtcbiAgICBsb2cud2Fybignb3BlbkluaXRpYWwnLCAnQ291bGQgbm90IG9wZW4gdGFiJywgdGFiTmFtZSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbml0aWFsQWN0aXZlVGFiID0gbWF0Y2hpbmdUYWJzLnBvcCgpO1xuICBpbml0aWFsQWN0aXZlVGFiLm9wZW4oKTtcbiAgdGhpcy5hY3RpdmVUYWIgPSBpbml0aWFsQWN0aXZlVGFiO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG1vZHVsZVxuICovXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUuYWRkTW9kdWxlID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gIGlmIChtb2R1bGUudGFiKSB7XG4gICAgdGhpcy5hZGQobW9kdWxlLnRhYik7XG4gIH1cbiAgaWYgKG1vZHVsZS51cGRhdGUpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG1vZHVsZS51cGRhdGUpO1xuICB9XG59O1xuXG5UYWJSZWdpc3RyeS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgbG9nLmRlYnVnKCd1cGRhdGUnLCBldmVudCk7XG4gIHZhciBwbGF5ZXIgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAkLmVhY2godGhpcy5saXN0ZW5lcnMsIGZ1bmN0aW9uIChpLCBsaXN0ZW5lcikgeyBsaXN0ZW5lcihwbGF5ZXIpOyB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGFiUmVnaXN0cnk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdGFicmVnaXN0cnkuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciB6ZXJvRmlsbCA9IHJlcXVpcmUoJy4vdXRpbCcpLnplcm9GaWxsO1xudmFyIGxvZyA9IHJlcXVpcmUoJy4vbG9nZ2luZycpLmdldExvZ2dlcignVGltZUNvZGUnKTtcblxuLyoqXG4gKiBUaW1lY29kZSBhcyBkZXNjcmliZWQgaW4gaHR0cDovL3BvZGxvdmUub3JnL2RlZXAtbGluay9cbiAqIGFuZCBodHRwOi8vd3d3LnczLm9yZy9UUi9tZWRpYS1mcmFncy8jZnJhZ21lbnQtZGltZW5zaW9uc1xuICovXG52YXIgdGltZUNvZGVNYXRjaGVyID0gLyg/OihcXGQrKTopPyhcXGR7MSwyfSk6KFxcZFxcZCkoXFwuXFxkezEsM30pPy87XG5cbi8qKlxuICogY29udmVydCBhbiBhcnJheSBvZiBzdHJpbmcgdG8gdGltZWNvZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0Y1xuICogQHJldHVybnMge251bWJlcnxib29sZWFufVxuICovXG5mdW5jdGlvbiBleHRyYWN0VGltZSh0Yykge1xuICBpZiAoIXRjKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXJ0cyA9IHRpbWVDb2RlTWF0Y2hlci5leGVjKHRjKTtcbiAgaWYgKCFwYXJ0cykge1xuICAgIGxvZy53YXJuKCdDb3VsZCBub3QgZXh0cmFjdCB0aW1lIGZyb20nLCB0Yyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0aW1lID0gMDtcbiAgLy8gaG91cnNcbiAgdGltZSArPSBwYXJ0c1sxXSA/IHBhcnNlSW50KHBhcnRzWzFdLCAxMCkgKiA2MCAqIDYwIDogMDtcbiAgLy8gbWludXRlc1xuICB0aW1lICs9IHBhcnNlSW50KHBhcnRzWzJdLCAxMCkgKiA2MDtcbiAgLy8gc2Vjb25kc1xuICB0aW1lICs9IHBhcnNlSW50KHBhcnRzWzNdLCAxMCk7XG4gIC8vIG1pbGxpc2Vjb25kc1xuICB0aW1lICs9IHBhcnRzWzRdID8gcGFyc2VGbG9hdChwYXJ0c1s0XSkgOiAwO1xuICAvLyBubyBuZWdhdGl2ZSB0aW1lXG4gIHRpbWUgPSBNYXRoLm1heCh0aW1lLCAwKTtcbiAgcmV0dXJuIHRpbWU7XG59XG5cbi8qKlxuICogY29udmVydCBhIHRpbWVzdGFtcCB0byBhIHRpbWVjb2RlIGluICR7aW5zZXJ0IFJGQyBoZXJlfSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxlYWRpbmdaZXJvc1xuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VIb3Vyc10gZm9yY2Ugb3V0cHV0IG9mIGhvdXJzLCBkZWZhdWx0cyB0byBmYWxzZVxuICogQHBhcmFtIHtCb29sZWFufSBbc2hvd01pbGxpc10gb3V0cHV0IG1pbGxpc2Vjb25kcyBzZXBhcmF0ZWQgd2l0aCBhIGRvdCBmcm9tIHRoZSBzZWNvbmRzIC0gZGVmYXVsdHMgdG8gZmFsc2VcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gdHMydGModGltZSwgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzLCBzaG93TWlsbGlzKSB7XG4gIHZhciBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzZWNvbmRzO1xuICB2YXIgdGltZWNvZGUgPSAnJztcblxuICBpZiAodGltZSA9PT0gMCkge1xuICAgIHJldHVybiAoZm9yY2VIb3VycyA/ICcwMDowMDowMCcgOiAnMDA6MDAnKTtcbiAgfVxuXG4gIC8vIHByZXZlbnQgbmVnYXRpdmUgdmFsdWVzIGZyb20gcGxheWVyXG4gIGlmICghdGltZSB8fCB0aW1lIDw9IDApIHtcbiAgICByZXR1cm4gKGZvcmNlSG91cnMgPyAnLS06LS06LS0nIDogJy0tOi0tJyk7XG4gIH1cblxuICBob3VycyA9IE1hdGguZmxvb3IodGltZSAvIDYwIC8gNjApO1xuICBtaW51dGVzID0gTWF0aC5mbG9vcih0aW1lIC8gNjApICUgNjA7XG4gIHNlY29uZHMgPSBNYXRoLmZsb29yKHRpbWUgJSA2MCkgJSA2MDtcbiAgbWlsbGlzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lICUgMSAqIDEwMDApO1xuXG4gIGlmIChzaG93TWlsbGlzICYmIG1pbGxpc2Vjb25kcykge1xuICAgIHRpbWVjb2RlID0gJy4nICsgemVyb0ZpbGwobWlsbGlzZWNvbmRzLCAzKTtcbiAgfVxuXG4gIHRpbWVjb2RlID0gJzonICsgemVyb0ZpbGwoc2Vjb25kcywgMikgKyB0aW1lY29kZTtcblxuICBpZiAoaG91cnMgPT09IDAgJiYgIWZvcmNlSG91cnMgJiYgIWxlYWRpbmdaZXJvcyApIHtcbiAgICByZXR1cm4gbWludXRlcy50b1N0cmluZygpICsgdGltZWNvZGU7XG4gIH1cblxuICB0aW1lY29kZSA9IHplcm9GaWxsKG1pbnV0ZXMsIDIpICsgdGltZWNvZGU7XG5cbiAgaWYgKGhvdXJzID09PSAwICYmICFmb3JjZUhvdXJzKSB7XG4gICAgLy8gcmVxdWlyZWQgKG1pbnV0ZXMgOiBzZWNvbmRzKVxuICAgIHJldHVybiB0aW1lY29kZTtcbiAgfVxuXG4gIGlmIChsZWFkaW5nWmVyb3MpIHtcbiAgICByZXR1cm4gemVyb0ZpbGwoaG91cnMsIDIpICsgJzonICsgdGltZWNvZGU7XG4gIH1cblxuICByZXR1cm4gaG91cnMgKyAnOicgKyB0aW1lY29kZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY29udmVydGluZyB0aW1lc3RhbXBzIHRvXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lc3RhbXBcbiAgICogQHJldHVybnMge1N0cmluZ30gdGltZWNvZGVcbiAgICovXG4gIGZyb21UaW1lU3RhbXA6IGZ1bmN0aW9uICh0aW1lc3RhbXApIHtcbiAgICByZXR1cm4gdHMydGModGltZXN0YW1wLCB0cnVlLCB0cnVlKTtcbiAgfSxcblxuICAvKipcbiAgICogYWNjZXB0cyBhcnJheSB3aXRoIHN0YXJ0IGFuZCBlbmQgdGltZSBpbiBzZWNvbmRzXG4gICAqIHJldHVybnMgdGltZWNvZGUgaW4gZGVlcC1saW5raW5nIGZvcm1hdFxuICAgKiBAcGFyYW0ge0FycmF5fSB0aW1lc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxlYWRpbmdaZXJvc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZUhvdXJzXVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZW5lcmF0ZTogZnVuY3Rpb24gKHRpbWVzLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMpIHtcbiAgICBpZiAodGltZXNbMV0gPiAwICYmIHRpbWVzWzFdIDwgOTk5OTk5OSAmJiB0aW1lc1swXSA8IHRpbWVzWzFdKSB7XG4gICAgICByZXR1cm4gdHMydGModGltZXNbMF0sIGxlYWRpbmdaZXJvcywgZm9yY2VIb3VycykgKyAnLCcgKyB0czJ0Yyh0aW1lc1sxXSwgbGVhZGluZ1plcm9zLCBmb3JjZUhvdXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRzMnRjKHRpbWVzWzBdLCBsZWFkaW5nWmVyb3MsIGZvcmNlSG91cnMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBwYXJzZXMgdGltZSBjb2RlIGludG8gc2Vjb25kc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gdGltZWNvZGVcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBwYXJzZTogZnVuY3Rpb24gKHRpbWVjb2RlKSB7XG4gICAgaWYgKCF0aW1lY29kZSkge1xuICAgICAgcmV0dXJuIFtmYWxzZSwgZmFsc2VdO1xuICAgIH1cblxuICAgIHZhciB0aW1lcGFydHMgPSB0aW1lY29kZS5zcGxpdCgnLScpO1xuXG4gICAgaWYgKCF0aW1lcGFydHMubGVuZ3RoKSB7XG4gICAgICBsb2cud2Fybignbm8gdGltZXBhcnRzOicsIHRpbWVjb2RlKTtcbiAgICAgIHJldHVybiBbZmFsc2UsIGZhbHNlXTtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnRUaW1lID0gZXh0cmFjdFRpbWUodGltZXBhcnRzLnNoaWZ0KCkpO1xuICAgIHZhciBlbmRUaW1lID0gZXh0cmFjdFRpbWUodGltZXBhcnRzLnNoaWZ0KCkpO1xuXG4gICAgcmV0dXJuIChlbmRUaW1lID4gc3RhcnRUaW1lKSA/IFtzdGFydFRpbWUsIGVuZFRpbWVdIDogW3N0YXJ0VGltZSwgZmFsc2VdO1xuICB9LFxuXG4gIGdldFN0YXJ0VGltZUNvZGU6IGZ1bmN0aW9uIGdldFN0YXJ0VGltZWNvZGUoc3RhcnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlKHN0YXJ0KVswXTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi90aW1lY29kZS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuLypcbiBbXG4ge3R5cGU6IFwiaW1hZ2VcIiwgXCJ0aXRsZVwiOiBcIlRoZSB2ZXJ5IGJlc3QgSW1hZ2VcIiwgXCJ1cmxcIjogXCJodHRwOi8vZG9tYWluLmNvbS9pbWFnZXMvdGVzdDEucG5nXCJ9LFxuIHt0eXBlOiBcInNob3dub3RlXCIsIFwidGV4dFwiOiBcIlBBUEFQQVBBUEFQQUdFTk9cIn0sXG4ge3R5cGU6IFwidG9waWNcIiwgc3RhcnQ6IDAsIGVuZDogMSwgcTp0cnVlLCB0aXRsZTogXCJUaGUgdmVyeSBmaXJzdCBjaGFwdGVyXCIgfSxcbiB7dHlwZTogXCJhdWRpb1wiLCBzdGFydDogMCwgZW5kOiAxLCBxOnRydWUsIGNsYXNzOiAnc3BlZWNoJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDEsIGVuZDogMiwgcTp0cnVlLCBjbGFzczogJ211c2ljJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDIsIGVuZDogMywgcTp0cnVlLCBjbGFzczogJ25vaXNlJ30sXG4ge3R5cGU6IFwiYXVkaW9cIiwgc3RhcnQ6IDQsIGVuZDogNSwgcTp0cnVlLCBjbGFzczogJ3NpbGVuY2UnfSxcbiB7dHlwZTogXCJjb250ZW50XCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6dHJ1ZSwgdGl0bGU6IFwiVGhlIHZlcnkgZmlyc3QgY2hhcHRlclwiLCBjbGFzczonYWR2ZXJ0aXNlbWVudCd9LFxuIHt0eXBlOiBcImxvY2F0aW9uXCIsIHN0YXJ0OiAwLCBlbmQ6IDEsIHE6ZmFsc2UsIHRpdGxlOiBcIkFyb3VuZCBCZXJsaW5cIiwgbGF0OjEyLjEyMywgbG9uOjUyLjIzNCwgZGlhbWV0ZXI6MTIzIH0sXG4ge3R5cGU6IFwiY2hhdFwiLCBxOmZhbHNlLCBzdGFydDogMC4xMiwgXCJkYXRhXCI6IFwiRVJTVEVSICYgSElUTEVSISEhXCJ9LFxuIHt0eXBlOiBcInNob3dub3RlXCIsIHN0YXJ0OiAwLjIzLCBcImRhdGFcIjogXCJKZW1hbmQgdmFkZXJ0XCJ9LFxuIHt0eXBlOiBcImltYWdlXCIsIFwibmFtZVwiOiBcIlRoZSB2ZXJ5IGJlc3QgSW1hZ2VcIiwgXCJ1cmxcIjogXCJodHRwOi8vZG9tYWluLmNvbS9pbWFnZXMvdGVzdDEucG5nXCJ9LFxuIHt0eXBlOiBcImxpbmtcIiwgXCJuYW1lXCI6IFwiQW4gaW50ZXJlc3RpbmcgbGlua1wiLCBcInVybFwiOiBcImh0dHA6Ly9cIn0sXG4ge3R5cGU6IFwidG9waWNcIiwgc3RhcnQ6IDEsIGVuZDogMiwgXCJuYW1lXCI6IFwiVGhlIHZlcnkgZmlyc3QgY2hhcHRlclwiLCBcInVybFwiOiBcIlwifSxcbiBdXG4gKi9cbnZhciBjYXAgPSByZXF1aXJlKCcuL3V0aWwnKS5jYXA7XG52YXIgbG9nID0gcmVxdWlyZSgnLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCdUaW1lbGluZScpO1xuXG5mdW5jdGlvbiBjYWxsKGxpc3RlbmVyKSB7XG4gIGxpc3RlbmVyKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJCeVR5cGUodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIHJldHVybiAocmVjb3JkLnR5cGUgPT09IHR5cGUpO1xuICB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1RpbWVsaW5lfSB0aW1lbGluZVxuICovXG5mdW5jdGlvbiBsb2dDdXJyZW50VGltZSh0aW1lbGluZSkge1xuICBsb2cuZGVidWcoJ2N1cnJlbnRUaW1lJywgdGltZWxpbmUuZ2V0VGltZSgpKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYXQgbGVhc3Qgb25lIGNoYXB0ZXIgaXMgcHJlc2VudFxuICovXG5mdW5jdGlvbiBjaGVja0ZvckNoYXB0ZXJzKHBhcmFtcykge1xuICByZXR1cm4gISFwYXJhbXMuY2hhcHRlcnMgJiYgKFxuICAgIHR5cGVvZiBwYXJhbXMuY2hhcHRlcnMgPT09ICdvYmplY3QnICYmIHBhcmFtcy5jaGFwdGVycy5sZW5ndGggPiAxXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gc3RvcE9uRW5kVGltZSgpIHtcbiAgaWYgKHRoaXMuY3VycmVudFRpbWUgPj0gdGhpcy5lbmRUaW1lKSB7XG4gICAgbG9nLmluZm8oJ0VORFRJTUUgUkVBQ0hFRCcpO1xuICAgIHRoaXMucGxheWVyLnN0b3AoKTtcbiAgICBkZWxldGUgdGhpcy5lbmRUaW1lO1xuICB9XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7SFRNTE1lZGlhRWxlbWVudH0gcGxheWVyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRpbWVsaW5lKHBsYXllciwgZGF0YSkge1xuICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgdGhpcy5oYXNDaGFwdGVycyA9IGNoZWNrRm9yQ2hhcHRlcnMoZGF0YSk7XG4gIHRoaXMubW9kdWxlcyA9IFtdO1xuICB0aGlzLmxpc3RlbmVycyA9IFtsb2dDdXJyZW50VGltZV07XG4gIHRoaXMuY3VycmVudFRpbWUgPSAtMTtcbiAgdGhpcy5kdXJhdGlvbiA9IGRhdGEuZHVyYXRpb247XG4gIHRoaXMuYnVmZmVyZWRUaW1lID0gMDtcbiAgdGhpcy5yZXN1bWUgPSBwbGF5ZXIucGF1c2VkO1xuICB0aGlzLnNlZWtpbmcgPSBmYWxzZTtcbn1cblxuVGltZWxpbmUucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGE7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YUJ5VHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiB0aGlzLmRhdGEuZmlsdGVyKGZpbHRlckJ5VHlwZSh0eXBlKSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuYWRkTW9kdWxlID0gZnVuY3Rpb24gKG1vZHVsZSkge1xuICBpZiAobW9kdWxlLnVwZGF0ZSkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobW9kdWxlLnVwZGF0ZSk7XG4gIH1cbiAgaWYgKG1vZHVsZS5kYXRhKSB7XG4gICAgdGhpcy5kYXRhID0gbW9kdWxlLmRhdGE7XG4gIH1cbiAgdGhpcy5tb2R1bGVzLnB1c2gobW9kdWxlKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5wbGF5UmFuZ2UgPSBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgaWYgKCFyYW5nZSB8fCAhcmFuZ2UubGVuZ3RoIHx8ICFyYW5nZS5zaGlmdCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RpbWVsaW5lLnBsYXlSYW5nZSBjYWxsZWQgd2l0aG91dCBhIHJhbmdlJyk7XG4gIH1cbiAgdGhpcy5zZXRUaW1lKHJhbmdlLnNoaWZ0KCkpO1xuICB0aGlzLnN0b3BBdChyYW5nZS5zaGlmdCgpKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgbG9nLmRlYnVnKCd1cGRhdGUnLCBldmVudCk7XG4gIHRoaXMuc2V0QnVmZmVyZWRUaW1lKGV2ZW50KTtcblxuICBpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ3RpbWV1cGRhdGUnKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMucGxheWVyLmN1cnJlbnRUaW1lO1xuICB9XG4gIHRoaXMubGlzdGVuZXJzLmZvckVhY2goY2FsbCwgdGhpcyk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuZW1pdEV2ZW50c0JldHdlZW4gPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgZW1pdFN0YXJ0ZWQgPSBmYWxzZSxcbiAgICBlbWl0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgY3VzdG9tRXZlbnQgPSBuZXcgJC5FdmVudChldmVudC50eXBlLCBldmVudCk7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoY3VzdG9tRXZlbnQpO1xuICAgIH0uYmluZCh0aGlzKTtcbiAgdGhpcy5kYXRhLm1hcChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgbGF0ZXIgPSAoZXZlbnQuc3RhcnQgPiBzdGFydCksXG4gICAgICBlYXJsaWVyID0gKGV2ZW50LmVuZCA8IHN0YXJ0KSxcbiAgICAgIGVuZGVkID0gKGV2ZW50LmVuZCA8IGVuZCk7XG5cbiAgICBpZiAobGF0ZXIgJiYgZWFybGllciAmJiAhZW5kZWQgfHwgZW1pdFN0YXJ0ZWQpIHtcbiAgICAgIGxvZy5kZWJ1ZygnRW1pdCcsIGV2ZW50KTtcbiAgICAgIGVtaXQoZXZlbnQpO1xuICAgIH1cbiAgICBlbWl0U3RhcnRlZCA9IGxhdGVyO1xuICB9KTtcbn07XG5cbi8qKlxuICogcmV0dXJucyBpZiB0aW1lIGlzIGEgdmFsaWQgdGltZXN0YW1wIGluIGN1cnJlbnQgdGltZWxpbmVcbiAqIEBwYXJhbSB7Kn0gdGltZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cblRpbWVsaW5lLnByb3RvdHlwZS5pc1ZhbGlkVGltZSA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIHJldHVybiAodHlwZW9mIHRpbWUgPT09ICdudW1iZXInICYmICFpc05hTih0aW1lKSAmJiB0aW1lID49IDAgJiYgdGltZSA8PSB0aGlzLmR1cmF0aW9uKTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5zZXRUaW1lID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgaWYgKCF0aGlzLmlzVmFsaWRUaW1lKHRpbWUpKSB7XG4gICAgbG9nLndhcm4oJ1RpbWVsaW5lJywgJ3NldFRpbWUnLCAndGltZSBvdXQgb2YgYm91bmRzJywgdGltZSk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG4gIH1cblxuICBsb2cuZGVidWcoJ3NldFRpbWUnLCAndGltZScsIHRpbWUpO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgdGhpcy51cGRhdGUoKTtcblxuICBsb2cuZGVidWcoJ3NldFRpbWUnLCAncGxheWVyIHJlYWR5IHN0YXRlJywgdGhpcy5wbGF5ZXIucmVhZHlTdGF0ZSk7XG4gIGlmICh0aGlzLnBsYXllci5yZWFkeVN0YXRlID09PSB0aGlzLnBsYXllci5IQVZFX0VOT1VHSF9EQVRBKSB7XG4gICAgdGhpcy5wbGF5ZXIuc2V0Q3VycmVudFRpbWUodGltZSk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG4gIH1cblxuICAvLyBUT0RPIHZpc3VhbGl6ZSBidWZmZXIgc3RhdGVcbiAgLy8gJChkb2N1bWVudCkuZmluZCgnLnBsYXknKS5jc3Moe2NvbG9yOidyZWQnfSk7XG4gICQodGhpcy5wbGF5ZXIpLm9uZSgnY2FucGxheScsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPIHJlbW92ZSBidWZmZXIgc3RhdGUgdmlzdWFsXG4gICAgLy8gJChkb2N1bWVudCkuZmluZCgnLnBsYXknKS5jc3Moe2NvbG9yOid3aGl0ZSd9KTtcbiAgICBsb2cuZGVidWcoJ1BsYXllcicsICdjYW5wbGF5JywgJ2J1ZmZlcmVkJywgdGltZSk7XG4gICAgdGhpcy5zZXRDdXJyZW50VGltZSh0aW1lKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc2VlayA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gIGxvZy5kZWJ1Zygnc2VlaycsIHRpbWUpO1xuICB0aGlzLmN1cnJlbnRUaW1lID0gY2FwKHRpbWUsIDAsIHRoaXMuZHVyYXRpb24pO1xuICB0aGlzLnNldFRpbWUodGhpcy5jdXJyZW50VGltZSk7XG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUuc3RvcEF0ID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgaWYgKCF0aW1lIHx8IHRpbWUgPD0gMCB8fCB0aW1lID4gdGhpcy5kdXJhdGlvbikge1xuICAgIHJldHVybiBsb2cud2Fybignc3RvcEF0JywgJ3RpbWUgb3V0IG9mIGJvdW5kcycsIHRpbWUpO1xuICB9XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5lbmRUaW1lID0gdGltZTtcbiAgdGhpcy5saXN0ZW5lcnMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgc3RvcE9uRW5kVGltZS5jYWxsKHNlbGYpO1xuICB9KTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXRUaW1lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5nZXRCdWZmZXJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGlzTmFOKHRoaXMuYnVmZmVyZWRUaW1lKSkge1xuICAgIGxvZy53YXJuKCdnZXRCdWZmZXJlZCcsICdidWZmZXJlZFRpbWUgaXMgbm90IGEgbnVtYmVyJyk7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcmV0dXJuIHRoaXMuYnVmZmVyZWRUaW1lO1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlLnNldEJ1ZmZlcmVkVGltZSA9IGZ1bmN0aW9uIChlKSB7XG4gIHZhciB0YXJnZXQgPSAoZSAhPT0gdW5kZWZpbmVkKSA/IGUudGFyZ2V0IDogdGhpcy5wbGF5ZXI7XG4gIHZhciBidWZmZXJlZCA9IDA7XG5cbiAgLy8gbmV3ZXN0IEhUTUw1IHNwZWMgaGFzIGJ1ZmZlcmVkIGFycmF5IChGRjQsIFdlYmtpdClcbiAgaWYgKHRhcmdldCAmJiB0YXJnZXQuYnVmZmVyZWQgJiYgdGFyZ2V0LmJ1ZmZlcmVkLmxlbmd0aCA+IDAgJiYgdGFyZ2V0LmJ1ZmZlcmVkLmVuZCAmJiB0YXJnZXQuZHVyYXRpb24pIHtcbiAgICBidWZmZXJlZCA9IHRhcmdldC5idWZmZXJlZC5lbmQodGFyZ2V0LmJ1ZmZlcmVkLmxlbmd0aCAtIDEpO1xuICB9XG4gIC8vIFNvbWUgYnJvd3NlcnMgKGUuZy4sIEZGMy42IGFuZCBTYWZhcmkgNSkgY2Fubm90IGNhbGN1bGF0ZSB0YXJnZXQuYnVmZmVyZXJlZC5lbmQoKVxuICAvLyB0byBiZSBhbnl0aGluZyBvdGhlciB0aGFuIDAuIElmIHRoZSBieXRlIGNvdW50IGlzIGF2YWlsYWJsZSB3ZSB1c2UgdGhpcyBpbnN0ZWFkLlxuICAvLyBCcm93c2VycyB0aGF0IHN1cHBvcnQgdGhlIGVsc2UgaWYgZG8gbm90IHNlZW0gdG8gaGF2ZSB0aGUgYnVmZmVyZWRCeXRlcyB2YWx1ZSBhbmRcbiAgLy8gc2hvdWxkIHNraXAgdG8gdGhlcmUuIFRlc3RlZCBpbiBTYWZhcmkgNSwgV2Via2l0IGhlYWQsIEZGMy42LCBDaHJvbWUgNiwgSUUgNy84LlxuICBlbHNlIGlmICh0YXJnZXQgJiYgdGFyZ2V0LmJ5dGVzVG90YWwgIT09IHVuZGVmaW5lZCAmJiB0YXJnZXQuYnl0ZXNUb3RhbCA+IDAgJiYgdGFyZ2V0LmJ1ZmZlcmVkQnl0ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZmZlcmVkID0gdGFyZ2V0LmJ1ZmZlcmVkQnl0ZXMgLyB0YXJnZXQuYnl0ZXNUb3RhbCAqIHRhcmdldC5kdXJhdGlvbjtcbiAgfVxuICAvLyBGaXJlZm94IDMgd2l0aCBhbiBPZ2cgZmlsZSBzZWVtcyB0byBnbyB0aGlzIHdheVxuICBlbHNlIGlmIChlICYmIGUubGVuZ3RoQ29tcHV0YWJsZSAmJiBlLnRvdGFsICE9PSAwKSB7XG4gICAgYnVmZmVyZWQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiB0YXJnZXQuZHVyYXRpb247XG4gIH1cbiAgdmFyIGNhcHBlZFRpbWUgPSBjYXAoYnVmZmVyZWQsIDAsIHRhcmdldC5kdXJhdGlvbik7XG4gIGxvZy5kZWJ1Zygnc2V0QnVmZmVyZWRUaW1lJywgY2FwcGVkVGltZSk7XG4gIHRoaXMuYnVmZmVyZWRUaW1lID0gY2FwcGVkVGltZTtcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZS5yZXdpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2V0VGltZSgwKTtcbiAgdmFyIGNhbGxMaXN0ZW5lcldpdGhUaGlzID0gZnVuY3Rpb24gX2NhbGxMaXN0ZW5lcldpdGhUaGlzKGksIGxpc3RlbmVyKSB7XG4gICAgbGlzdGVuZXIodGhpcyk7XG4gIH0uYmluZCh0aGlzKTtcbiAgJC5lYWNoKHRoaXMubGlzdGVuZXJzLCBjYWxsTGlzdGVuZXJXaXRoVGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImI1NW1XRVwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3RpbWVsaW5lLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGMgPSByZXF1aXJlKCcuL3RpbWVjb2RlJyk7XG5cbi8qXG4gIFwidD0xXCJcdFsoXCJ0XCIsIFwiMVwiKV1cdHNpbXBsZSBjYXNlXG4gIFwidD0xJnQ9MlwiXHRbKFwidFwiLCBcIjFcIiksIChcInRcIiwgXCIyXCIpXVx0cmVwZWF0ZWQgbmFtZVxuICBcImE9Yj1jXCJcdFsoXCJhXCIsIFwiYj1jXCIpXVx0XCI9XCIgaW4gdmFsdWVcbiAgXCJhJmI9Y1wiXHRbKFwiYVwiLCBcIlwiKSwgKFwiYlwiLCBcImNcIildXHRtaXNzaW5nIHZhbHVlXG4gIFwiJTc0PSU2ZXB0JTNBJTMxMFwiXHRbKFwidFwiLCBcIm5wdDoxMFwiKV1cdHVubmVjc3NhcnkgcGVyY2VudC1lbmNvZGluZ1xuICBcImlkPSV4eSZ0PTFcIlx0WyhcInRcIiwgXCIxXCIpXVx0aW52YWxpZCBwZXJjZW50LWVuY29kaW5nXG4gIFwiaWQ9JUU0ciZ0PTFcIlx0WyhcInRcIiwgXCIxXCIpXVx0aW52YWxpZCBVVEYtOFxuICovXG5cbi8qKlxuICogZ2V0IHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmljIFVSTCBoYXNoIGZyYWdtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IG5hbWUgb2YgdGhlIGZyYWdtZW50XG4gKiBAcmV0dXJucyB7c3RyaW5nfGJvb2xlYW59IHZhbHVlIG9mIHRoZSBmcmFnbWVudCBvciBmYWxzZSB3aGVuIG5vdCBmb3VuZCBpbiBVUkxcbiAqL1xuZnVuY3Rpb24gZ2V0RnJhZ21lbnQoa2V5KSB7XG4gIHZhciBxdWVyeSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSxcbiAgICBwYWlycyA9IHF1ZXJ5LnNwbGl0KCcmJyk7XG5cbiAgaWYgKHF1ZXJ5LmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHBhaXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBwYWlyID0gcGFpcnNbaV0uc3BsaXQoJz0nKTtcbiAgICBpZiAocGFpclswXSAhPT0ga2V5KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHBhaXIubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVVJMIGhhbmRsaW5nIGhlbHBlcnNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldEZyYWdtZW50OiBnZXRGcmFnbWVudCxcbiAgY2hlY2tDdXJyZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSBnZXRGcmFnbWVudCgndCcpO1xuICAgIHJldHVybiB0Yy5wYXJzZSh0KTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJiNTVtV0VcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91cmwuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogcmV0dXJuIG5ldyB2YWx1ZSBpbiBib3VuZHMgb2YgbWluIGFuZCBtYXhcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWwgYW55IG51bWJlclxuICogQHBhcmFtIHtudW1iZXJ9IG1pbiBsb3dlciBib3VuZGFyeSBmb3IgdmFsXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4IHVwcGVyIGJvdW5kYXJ5IGZvciB2YWxcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJlc3VsdGluZyB2YWx1ZVxuICovXG5mdW5jdGlvbiBjYXAodmFsLCBtaW4sIG1heCkge1xuICAvLyBjYXAgeCB2YWx1ZXNcbiAgdmFsID0gTWF0aC5tYXgodmFsLCBtaW4pO1xuICB2YWwgPSBNYXRoLm1pbih2YWwsIG1heCk7XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogcmV0dXJuIG51bWJlciBhcyBzdHJpbmcgbGVmdGhhbmQgZmlsbGVkIHdpdGggemVyb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXIgKGludGVnZXIpIHZhbHVlIHRvIGJlIHBhZGRlZFxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIGxlbmd0aCBvZiB0aGUgc3RyaW5nIHRoYXQgaXMgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHBhZGRlZCBudW1iZXJcbiAqL1xuZnVuY3Rpb24gemVyb0ZpbGwgKG51bWJlciwgd2lkdGgpIHtcbiAgdmFyIHMgPSBudW1iZXIudG9TdHJpbmcoKTtcbiAgd2hpbGUgKHMubGVuZ3RoIDwgd2lkdGgpIHtcbiAgICBzID0gJzAnICsgcztcbiAgfVxuICByZXR1cm4gcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNhcDogY2FwLFxuICB6ZXJvRmlsbDogemVyb0ZpbGxcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYjU1bVdFXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXRpbC5qc1wiLFwiL1wiKSJdfQ==
