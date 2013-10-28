/*
 * ===========================================
 * Podlove Web Player v2.0.17
 * Licensed under The BSD 2-Clause License
 * http://opensource.org/licenses/BSD-2-Clause
 * ===========================================
 * Copyright (c) 2013, Gerrit van Aaken (https://github.com/gerritvanaaken/), Simon Waldherr (https://github.com/simonwaldherr/), Frank Hase (https://github.com/Kambfhase/), Eric Teubert (https://github.com/eteubert/) and others (https://github.com/podlove/podlove-web-player/contributors)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/*jslint browser: true, plusplus: true, unparam: true, vars: true, white: true */
/*global window, jQuery */

/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Creates a JavaScript object that mimics HTML5 MediaElement API
* for browsers that don't understand HTML5 or can't play the provided codec
* Can play MP4 (H.264), Ogg, WebM, FLV, WMV, WMA, ACC, and MP3
*
* Copyright 2010-2012, John Dyer (http://j.hn)
* License: MIT
*
*/var mejs=mejs||{};mejs.version="2.11.0";mejs.meIndex=0;
mejs.plugins={silverlight:[{version:[3,0],types:["video/mp4","video/m4v","video/mov","video/wmv","audio/wma","audio/m4a","audio/mp3","audio/wav","audio/mpeg"]}],flash:[{version:[9,0,124],types:["video/mp4","video/m4v","video/mov","video/flv","video/rtmp","video/x-flv","audio/flv","audio/x-flv","audio/mp3","audio/m4a","audio/mpeg","video/youtube","video/x-youtube"]}],youtube:[{version:null,types:["video/youtube","video/x-youtube","audio/youtube","audio/x-youtube"]}],vimeo:[{version:null,types:["video/vimeo",
"video/x-vimeo"]}]};
mejs.Utility={encodeUrl:function(a){return encodeURIComponent(a)},escapeHTML:function(a){return a.toString().split("&").join("&amp;").split("<").join("&lt;").split('"').join("&quot;")},absolutizeUrl:function(a){var b=document.createElement("div");b.innerHTML='<a href="'+this.escapeHTML(a)+'">x</a>';return b.firstChild.href},getScriptPath:function(a){for(var b=0,c,d="",e="",g,f=document.getElementsByTagName("script"),h=f.length,l=a.length;b<h;b++){g=f[b].src;for(c=0;c<l;c++){e=a[c];if(g.indexOf(e)>
-1){d=g.substring(0,g.indexOf(e));break}}if(d!=="")break}return d},secondsToTimeCode:function(a,b,c,d){if(typeof c=="undefined")c=false;else if(typeof d=="undefined")d=25;var e=Math.floor(a/3600)%24,g=Math.floor(a/60)%60,f=Math.floor(a%60);a=Math.floor((a%1*d).toFixed(3));return(b||e>0?(e<10?"0"+e:e)+":":"")+(g<10?"0"+g:g)+":"+(f<10?"0"+f:f)+(c?":"+(a<10?"0"+a:a):"")},timeCodeToSeconds:function(a,b,c,d){if(typeof c=="undefined")c=false;else if(typeof d=="undefined")d=25;a=a.split(":");b=parseInt(a[0],
10);var e=parseInt(a[1],10),g=parseInt(a[2],10),f=0,h=0;if(c)f=parseInt(a[3])/d;return h=b*3600+e*60+g+f},convertSMPTEtoSeconds:function(a){if(typeof a!="string")return false;a=a.replace(",",".");var b=0,c=a.indexOf(".")!=-1?a.split(".")[1].length:0,d=1;a=a.split(":").reverse();for(var e=0;e<a.length;e++){d=1;if(e>0)d=Math.pow(60,e);b+=Number(a[e])*d}return Number(b.toFixed(c))},removeSwf:function(a){var b=document.getElementById(a);if(b&&/object|embed/i.test(b.nodeName))if(mejs.MediaFeatures.isIE){b.style.display=
"none";(function(){b.readyState==4?mejs.Utility.removeObjectInIE(a):setTimeout(arguments.callee,10)})()}else b.parentNode.removeChild(b)},removeObjectInIE:function(a){if(a=document.getElementById(a)){for(var b in a)if(typeof a[b]=="function")a[b]=null;a.parentNode.removeChild(a)}}};
mejs.PluginDetector={hasPluginVersion:function(a,b){var c=this.plugins[a];b[1]=b[1]||0;b[2]=b[2]||0;return c[0]>b[0]||c[0]==b[0]&&c[1]>b[1]||c[0]==b[0]&&c[1]==b[1]&&c[2]>=b[2]?true:false},nav:window.navigator,ua:window.navigator.userAgent.toLowerCase(),plugins:[],addPlugin:function(a,b,c,d,e){this.plugins[a]=this.detectPlugin(b,c,d,e)},detectPlugin:function(a,b,c,d){var e=[0,0,0],g;if(typeof this.nav.plugins!="undefined"&&typeof this.nav.plugins[a]=="object"){if((c=this.nav.plugins[a].description)&&
!(typeof this.nav.mimeTypes!="undefined"&&this.nav.mimeTypes[b]&&!this.nav.mimeTypes[b].enabledPlugin)){e=c.replace(a,"").replace(/^\s+/,"").replace(/\sr/gi,".").split(".");for(a=0;a<e.length;a++)e[a]=parseInt(e[a].match(/\d+/),10)}}else if(typeof window.ActiveXObject!="undefined")try{if(g=new ActiveXObject(c))e=d(g)}catch(f){}return e}};
mejs.PluginDetector.addPlugin("flash","Shockwave Flash","application/x-shockwave-flash","ShockwaveFlash.ShockwaveFlash",function(a){var b=[];if(a=a.GetVariable("$version")){a=a.split(" ")[1].split(",");b=[parseInt(a[0],10),parseInt(a[1],10),parseInt(a[2],10)]}return b});
mejs.PluginDetector.addPlugin("silverlight","Silverlight Plug-In","application/x-silverlight-2","AgControl.AgControl",function(a){var b=[0,0,0,0],c=function(d,e,g,f){for(;d.isVersionSupported(e[0]+"."+e[1]+"."+e[2]+"."+e[3]);)e[g]+=f;e[g]-=f};c(a,b,0,1);c(a,b,1,1);c(a,b,2,1E4);c(a,b,2,1E3);c(a,b,2,100);c(a,b,2,10);c(a,b,2,1);c(a,b,3,1);return b});
mejs.MediaFeatures={init:function(){var a=this,b=document,c=mejs.PluginDetector.nav,d=mejs.PluginDetector.ua.toLowerCase(),e,g=["source","track","audio","video"];a.isiPad=d.match(/ipad/i)!==null;a.isiPhone=d.match(/iphone/i)!==null;a.isiOS=a.isiPhone||a.isiPad;a.isAndroid=d.match(/android/i)!==null;a.isBustedAndroid=d.match(/android 2\.[12]/)!==null;a.isIE=c.appName.toLowerCase().indexOf("microsoft")!=-1;a.isChrome=d.match(/chrome/gi)!==null;a.isFirefox=d.match(/firefox/gi)!==null;a.isWebkit=d.match(/webkit/gi)!==
null;a.isGecko=d.match(/gecko/gi)!==null&&!a.isWebkit;a.isOpera=d.match(/opera/gi)!==null;a.hasTouch="ontouchstart"in window;a.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect;for(c=0;c<g.length;c++)e=document.createElement(g[c]);a.supportsMediaTag=typeof e.canPlayType!=="undefined"||a.isBustedAndroid;a.hasSemiNativeFullScreen=typeof e.webkitEnterFullscreen!=="undefined";a.hasWebkitNativeFullScreen=typeof e.webkitRequestFullScreen!=="undefined";
a.hasMozNativeFullScreen=typeof e.mozRequestFullScreen!=="undefined";a.hasTrueNativeFullScreen=a.hasWebkitNativeFullScreen||a.hasMozNativeFullScreen;a.nativeFullScreenEnabled=a.hasTrueNativeFullScreen;if(a.hasMozNativeFullScreen)a.nativeFullScreenEnabled=e.mozFullScreenEnabled;if(this.isChrome)a.hasSemiNativeFullScreen=false;if(a.hasTrueNativeFullScreen){a.fullScreenEventName=a.hasWebkitNativeFullScreen?"webkitfullscreenchange":"mozfullscreenchange";a.isFullScreen=function(){if(e.mozRequestFullScreen)return b.mozFullScreen;
else if(e.webkitRequestFullScreen)return b.webkitIsFullScreen};a.requestFullScreen=function(f){if(a.hasWebkitNativeFullScreen)f.webkitRequestFullScreen();else a.hasMozNativeFullScreen&&f.mozRequestFullScreen()};a.cancelFullScreen=function(){if(a.hasWebkitNativeFullScreen)document.webkitCancelFullScreen();else a.hasMozNativeFullScreen&&document.mozCancelFullScreen()}}if(a.hasSemiNativeFullScreen&&d.match(/mac os x 10_5/i)){a.hasNativeFullScreen=false;a.hasSemiNativeFullScreen=false}}};mejs.MediaFeatures.init();
mejs.HtmlMediaElement={pluginType:"native",isFullScreen:false,setCurrentTime:function(a){this.currentTime=a},setMuted:function(a){this.muted=a},setVolume:function(a){this.volume=a},stop:function(){this.pause()},setSrc:function(a){for(var b=this.getElementsByTagName("source");b.length>0;)this.removeChild(b[0]);if(typeof a=="string")this.src=a;else{var c;for(b=0;b<a.length;b++){c=a[b];if(this.canPlayType(c.type)){this.src=c.src;break}}}},setVideoSize:function(a,b){this.width=a;this.height=b}};
mejs.PluginMediaElement=function(a,b,c){this.id=a;this.pluginType=b;this.src=c;this.events={};this.attributes={}};
mejs.PluginMediaElement.prototype={pluginElement:null,pluginType:"",isFullScreen:false,playbackRate:-1,defaultPlaybackRate:-1,seekable:[],played:[],paused:true,ended:false,seeking:false,duration:0,error:null,tagName:"",muted:false,volume:1,currentTime:0,play:function(){if(this.pluginApi!=null){this.pluginType=="youtube"?this.pluginApi.playVideo():this.pluginApi.playMedia();this.paused=false}},load:function(){if(this.pluginApi!=null){this.pluginType!="youtube"&&this.pluginApi.loadMedia();this.paused=
false}},pause:function(){if(this.pluginApi!=null){this.pluginType=="youtube"?this.pluginApi.pauseVideo():this.pluginApi.pauseMedia();this.paused=true}},stop:function(){if(this.pluginApi!=null){this.pluginType=="youtube"?this.pluginApi.stopVideo():this.pluginApi.stopMedia();this.paused=true}},canPlayType:function(a){var b,c,d,e=mejs.plugins[this.pluginType];for(b=0;b<e.length;b++){d=e[b];if(mejs.PluginDetector.hasPluginVersion(this.pluginType,d.version))for(c=0;c<d.types.length;c++)if(a==d.types[c])return"probably"}return""},
positionFullscreenButton:function(a,b,c){this.pluginApi!=null&&this.pluginApi.positionFullscreenButton&&this.pluginApi.positionFullscreenButton(a,b,c)},hideFullscreenButton:function(){this.pluginApi!=null&&this.pluginApi.hideFullscreenButton&&this.pluginApi.hideFullscreenButton()},setSrc:function(a){if(typeof a=="string"){this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(a));this.src=mejs.Utility.absolutizeUrl(a)}else{var b,c;for(b=0;b<a.length;b++){c=a[b];if(this.canPlayType(c.type)){this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(c.src));
this.src=mejs.Utility.absolutizeUrl(a);break}}}},setCurrentTime:function(a){if(this.pluginApi!=null){this.pluginType=="youtube"?this.pluginApi.seekTo(a):this.pluginApi.setCurrentTime(a);this.currentTime=a}},setVolume:function(a){if(this.pluginApi!=null){this.pluginType=="youtube"?this.pluginApi.setVolume(a*100):this.pluginApi.setVolume(a);this.volume=a}},setMuted:function(a){if(this.pluginApi!=null){if(this.pluginType=="youtube"){a?this.pluginApi.mute():this.pluginApi.unMute();this.muted=a;this.dispatchEvent("volumechange")}else this.pluginApi.setMuted(a);
this.muted=a}},setVideoSize:function(a,b){if(this.pluginElement.style){this.pluginElement.style.width=a+"px";this.pluginElement.style.height=b+"px"}this.pluginApi!=null&&this.pluginApi.setVideoSize&&this.pluginApi.setVideoSize(a,b)},setFullscreen:function(a){this.pluginApi!=null&&this.pluginApi.setFullscreen&&this.pluginApi.setFullscreen(a)},enterFullScreen:function(){this.pluginApi!=null&&this.pluginApi.setFullscreen&&this.setFullscreen(true)},exitFullScreen:function(){this.pluginApi!=null&&this.pluginApi.setFullscreen&&
this.setFullscreen(false)},addEventListener:function(a,b){this.events[a]=this.events[a]||[];this.events[a].push(b)},removeEventListener:function(a,b){if(!a){this.events={};return true}var c=this.events[a];if(!c)return true;if(!b){this.events[a]=[];return true}for(i=0;i<c.length;i++)if(c[i]===b){this.events[a].splice(i,1);return true}return false},dispatchEvent:function(a){var b,c,d=this.events[a];if(d){c=Array.prototype.slice.call(arguments,1);for(b=0;b<d.length;b++)d[b].apply(null,c)}},hasAttribute:function(a){return a in
this.attributes},removeAttribute:function(a){delete this.attributes[a]},getAttribute:function(a){if(this.hasAttribute(a))return this.attributes[a];return""},setAttribute:function(a,b){this.attributes[a]=b},remove:function(){mejs.Utility.removeSwf(this.pluginElement.id);mejs.MediaPluginBridge.unregisterPluginElement(this.pluginElement.id)}};
mejs.MediaPluginBridge={pluginMediaElements:{},htmlMediaElements:{},registerPluginElement:function(a,b,c){this.pluginMediaElements[a]=b;this.htmlMediaElements[a]=c},unregisterPluginElement:function(a){delete this.pluginMediaElements[a];delete this.htmlMediaElements[a]},initPlugin:function(a){var b=this.pluginMediaElements[a],c=this.htmlMediaElements[a];if(b){switch(b.pluginType){case "flash":b.pluginElement=b.pluginApi=document.getElementById(a);break;case "silverlight":b.pluginElement=document.getElementById(b.id);
b.pluginApi=b.pluginElement.Content.MediaElementJS}b.pluginApi!=null&&b.success&&b.success(b,c)}},fireEvent:function(a,b,c){var d,e;a=this.pluginMediaElements[a];b={type:b,target:a};for(d in c){a[d]=c[d];b[d]=c[d]}e=c.bufferedTime||0;b.target.buffered=b.buffered={start:function(){return 0},end:function(){return e},length:1};a.dispatchEvent(b.type,b)}};
mejs.MediaElementDefaults={mode:"auto",plugins:["flash","silverlight","youtube","vimeo"],enablePluginDebug:false,type:"",pluginPath:mejs.Utility.getScriptPath(["mediaelement.js","mediaelement.min.js","mediaelement-and-player.js","mediaelement-and-player.min.js"]),flashName:"flashmediaelement.swf",flashStreamer:"",enablePluginSmoothing:false,silverlightName:"silverlightmediaelement.xap",defaultVideoWidth:480,defaultVideoHeight:270,pluginWidth:-1,pluginHeight:-1,pluginVars:[],timerRate:250,startVolume:0.8,
success:function(){},error:function(){}};mejs.MediaElement=function(a,b){return mejs.HtmlMediaElementShim.create(a,b)};
mejs.HtmlMediaElementShim={create:function(a,b){var c=mejs.MediaElementDefaults,d=typeof a=="string"?document.getElementById(a):a,e=d.tagName.toLowerCase(),g=e==="audio"||e==="video",f=g?d.getAttribute("src"):d.getAttribute("href");e=d.getAttribute("poster");var h=d.getAttribute("autoplay"),l=d.getAttribute("preload"),j=d.getAttribute("controls"),k;for(k in b)c[k]=b[k];f=typeof f=="undefined"||f===null||f==""?null:f;e=typeof e=="undefined"||e===null?"":e;l=typeof l=="undefined"||l===null||l==="false"?
"none":l;h=!(typeof h=="undefined"||h===null||h==="false");j=!(typeof j=="undefined"||j===null||j==="false");k=this.determinePlayback(d,c,mejs.MediaFeatures.supportsMediaTag,g,f);k.url=k.url!==null?mejs.Utility.absolutizeUrl(k.url):"";if(k.method=="native"){if(mejs.MediaFeatures.isBustedAndroid){d.src=k.url;d.addEventListener("click",function(){d.play()},false)}return this.updateNative(k,c,h,l)}else if(k.method!=="")return this.createPlugin(k,c,e,h,l,j);else{this.createErrorMessage(k,c,e);return this}},
determinePlayback:function(a,b,c,d,e){var g=[],f,h,l,j={method:"",url:"",htmlMediaElement:a,isVideo:a.tagName.toLowerCase()!="audio"},k;if(typeof b.type!="undefined"&&b.type!=="")if(typeof b.type=="string")g.push({type:b.type,url:e});else for(f=0;f<b.type.length;f++)g.push({type:b.type[f],url:e});else if(e!==null){l=this.formatType(e,a.getAttribute("type"));g.push({type:l,url:e})}else for(f=0;f<a.childNodes.length;f++){h=a.childNodes[f];if(h.nodeType==1&&h.tagName.toLowerCase()=="source"){e=h.getAttribute("src");
l=this.formatType(e,h.getAttribute("type"));h=h.getAttribute("media");if(!h||!window.matchMedia||window.matchMedia&&window.matchMedia(h).matches)g.push({type:l,url:e})}}if(!d&&g.length>0&&g[0].url!==null&&this.getTypeFromFile(g[0].url).indexOf("audio")>-1)j.isVideo=false;if(mejs.MediaFeatures.isBustedAndroid)a.canPlayType=function(m){return m.match(/video\/(mp4|m4v)/gi)!==null?"maybe":""};if(c&&(b.mode==="auto"||b.mode==="auto_plugin"||b.mode==="native")){if(!d){f=document.createElement(j.isVideo?
"video":"audio");a.parentNode.insertBefore(f,a);a.style.display="none";j.htmlMediaElement=a=f}for(f=0;f<g.length;f++)if(a.canPlayType(g[f].type).replace(/no/,"")!==""||a.canPlayType(g[f].type.replace(/mp3/,"mpeg")).replace(/no/,"")!==""){j.method="native";j.url=g[f].url;break}if(j.method==="native"){if(j.url!==null)a.src=j.url;if(b.mode!=="auto_plugin")return j}}if(b.mode==="auto"||b.mode==="auto_plugin"||b.mode==="shim")for(f=0;f<g.length;f++){l=g[f].type;for(a=0;a<b.plugins.length;a++){e=b.plugins[a];
h=mejs.plugins[e];for(c=0;c<h.length;c++){k=h[c];if(k.version==null||mejs.PluginDetector.hasPluginVersion(e,k.version))for(d=0;d<k.types.length;d++)if(l==k.types[d]){j.method=e;j.url=g[f].url;return j}}}}if(b.mode==="auto_plugin"&&j.method==="native")return j;if(j.method===""&&g.length>0)j.url=g[0].url;return j},formatType:function(a,b){return a&&!b?this.getTypeFromFile(a):b&&~b.indexOf(";")?b.substr(0,b.indexOf(";")):b},getTypeFromFile:function(a){a=a.split("?")[0];a=a.substring(a.lastIndexOf(".")+
1);return(/(mp4|m4v|ogg|ogv|webm|webmv|flv|wmv|mpeg|mov)/gi.test(a)?"video":"audio")+"/"+this.getTypeFromExtension(a)},getTypeFromExtension:function(a){switch(a){case "mp4":case "m4v":return"mp4";case "webm":case "webma":case "webmv":return"webm";case "ogg":case "oga":case "ogv":return"ogg";default:return a}},createErrorMessage:function(a,b,c){var d=a.htmlMediaElement,e=document.createElement("div");e.className="me-cannotplay";try{e.style.width=d.width+"px";e.style.height=d.height+"px"}catch(g){}e.innerHTML=
c!==""?'<a href="'+a.url+'"><img src="'+c+'" width="100%" height="100%" /></a>':'<a href="'+a.url+'"><span>'+mejs.i18n.t("Download File")+"</span></a>";d.parentNode.insertBefore(e,d);d.style.display="none";b.error(d)},createPlugin:function(a,b,c,d,e,g){c=a.htmlMediaElement;var f=1,h=1,l="me_"+a.method+"_"+mejs.meIndex++,j=new mejs.PluginMediaElement(l,a.method,a.url),k=document.createElement("div"),m;j.tagName=c.tagName;for(m=0;m<c.attributes.length;m++){var n=c.attributes[m];n.specified==true&&j.setAttribute(n.name,
n.value)}for(m=c.parentNode;m!==null&&m.tagName.toLowerCase()!="body";){if(m.parentNode.tagName.toLowerCase()=="p"){m.parentNode.parentNode.insertBefore(m,m.parentNode);break}m=m.parentNode}if(a.isVideo){f=b.videoWidth>0?b.videoWidth:c.getAttribute("width")!==null?c.getAttribute("width"):b.defaultVideoWidth;h=b.videoHeight>0?b.videoHeight:c.getAttribute("height")!==null?c.getAttribute("height"):b.defaultVideoHeight;f=mejs.Utility.encodeUrl(f);h=mejs.Utility.encodeUrl(h)}else if(b.enablePluginDebug){f=
320;h=240}j.success=b.success;mejs.MediaPluginBridge.registerPluginElement(l,j,c);k.className="me-plugin";k.id=l+"_container";a.isVideo?c.parentNode.insertBefore(k,c):document.body.insertBefore(k,document.body.childNodes[0]);d=["id="+l,"isvideo="+(a.isVideo?"true":"false"),"autoplay="+(d?"true":"false"),"preload="+e,"width="+f,"startvolume="+b.startVolume,"timerrate="+b.timerRate,"flashstreamer="+b.flashStreamer,"height="+h];if(a.url!==null)a.method=="flash"?d.push("file="+mejs.Utility.encodeUrl(a.url)):
d.push("file="+a.url);b.enablePluginDebug&&d.push("debug=true");b.enablePluginSmoothing&&d.push("smoothing=true");g&&d.push("controls=true");if(b.pluginVars)d=d.concat(b.pluginVars);switch(a.method){case "silverlight":k.innerHTML='<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="'+l+'" name="'+l+'" width="'+f+'" height="'+h+'" class="mejs-shim"><param name="initParams" value="'+d.join(",")+'" /><param name="windowless" value="true" /><param name="background" value="black" /><param name="minRuntimeVersion" value="3.0.0.0" /><param name="autoUpgrade" value="true" /><param name="source" value="'+
b.pluginPath+b.silverlightName+'" /></object>';break;case "flash":if(mejs.MediaFeatures.isIE){a=document.createElement("div");k.appendChild(a);a.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+l+'" width="'+f+'" height="'+h+'" class="mejs-shim"><param name="movie" value="'+b.pluginPath+b.flashName+"?x="+new Date+'" /><param name="flashvars" value="'+d.join("&amp;")+'" /><param name="quality" value="high" /><param name="bgcolor" value="#000000" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /></object>'}else k.innerHTML=
'<embed id="'+l+'" name="'+l+'" play="true" loop="false" quality="high" bgcolor="#000000" wmode="transparent" allowScriptAccess="always" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" src="'+b.pluginPath+b.flashName+'" flashvars="'+d.join("&")+'" width="'+f+'" height="'+h+'" class="mejs-shim"></embed>';break;case "youtube":b=a.url.substr(a.url.lastIndexOf("=")+1);youtubeSettings={container:k,containerId:k.id,pluginMediaElement:j,pluginId:l,
videoId:b,height:h,width:f};mejs.PluginDetector.hasPluginVersion("flash",[10,0,0])?mejs.YouTubeApi.createFlash(youtubeSettings):mejs.YouTubeApi.enqueueIframe(youtubeSettings);break;case "vimeo":j.vimeoid=a.url.substr(a.url.lastIndexOf("/")+1);k.innerHTML='<iframe src="http://player.vimeo.com/video/'+j.vimeoid+'?portrait=0&byline=0&title=0" width="'+f+'" height="'+h+'" frameborder="0" class="mejs-shim"></iframe>'}c.style.display="none";return j},updateNative:function(a,b){var c=a.htmlMediaElement,
d;for(d in mejs.HtmlMediaElement)c[d]=mejs.HtmlMediaElement[d];b.success(c,c);return c}};
mejs.YouTubeApi={isIframeStarted:false,isIframeLoaded:false,loadIframeApi:function(){if(!this.isIframeStarted){var a=document.createElement("script");a.src="http://www.youtube.com/player_api";var b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(a,b);this.isIframeStarted=true}},iframeQueue:[],enqueueIframe:function(a){if(this.isLoaded)this.createIframe(a);else{this.loadIframeApi();this.iframeQueue.push(a)}},createIframe:function(a){var b=a.pluginMediaElement,c=new YT.Player(a.containerId,
{height:a.height,width:a.width,videoId:a.videoId,playerVars:{controls:0},events:{onReady:function(){a.pluginMediaElement.pluginApi=c;mejs.MediaPluginBridge.initPlugin(a.pluginId);setInterval(function(){mejs.YouTubeApi.createEvent(c,b,"timeupdate")},250)},onStateChange:function(d){mejs.YouTubeApi.handleStateChange(d.data,c,b)}}})},createEvent:function(a,b,c){c={type:c,target:b};if(a&&a.getDuration){b.currentTime=c.currentTime=a.getCurrentTime();b.duration=c.duration=a.getDuration();c.paused=b.paused;
c.ended=b.ended;c.muted=a.isMuted();c.volume=a.getVolume()/100;c.bytesTotal=a.getVideoBytesTotal();c.bufferedBytes=a.getVideoBytesLoaded();var d=c.bufferedBytes/c.bytesTotal*c.duration;c.target.buffered=c.buffered={start:function(){return 0},end:function(){return d},length:1}}b.dispatchEvent(c.type,c)},iFrameReady:function(){for(this.isIframeLoaded=this.isLoaded=true;this.iframeQueue.length>0;)this.createIframe(this.iframeQueue.pop())},flashPlayers:{},createFlash:function(a){this.flashPlayers[a.pluginId]=
a;var b,c="http://www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid="+a.pluginId+"&amp;version=3&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0";if(mejs.MediaFeatures.isIE){b=document.createElement("div");a.container.appendChild(b);b.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+a.pluginId+'" width="'+a.width+'" height="'+a.height+'" class="mejs-shim"><param name="movie" value="'+
c+'" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /></object>'}else a.container.innerHTML='<object type="application/x-shockwave-flash" id="'+a.pluginId+'" data="'+c+'" width="'+a.width+'" height="'+a.height+'" style="visibility: visible; " class="mejs-shim"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"></object>'},flashReady:function(a){var b=this.flashPlayers[a],c=
document.getElementById(a),d=b.pluginMediaElement;d.pluginApi=d.pluginElement=c;mejs.MediaPluginBridge.initPlugin(a);c.cueVideoById(b.videoId);a=b.containerId+"_callback";window[a]=function(e){mejs.YouTubeApi.handleStateChange(e,c,d)};c.addEventListener("onStateChange",a);setInterval(function(){mejs.YouTubeApi.createEvent(c,d,"timeupdate")},250)},handleStateChange:function(a,b,c){switch(a){case -1:c.paused=true;c.ended=true;mejs.YouTubeApi.createEvent(b,c,"loadedmetadata");break;case 0:c.paused=false;
c.ended=true;mejs.YouTubeApi.createEvent(b,c,"ended");break;case 1:c.paused=false;c.ended=false;mejs.YouTubeApi.createEvent(b,c,"play");mejs.YouTubeApi.createEvent(b,c,"playing");break;case 2:c.paused=true;c.ended=false;mejs.YouTubeApi.createEvent(b,c,"pause");break;case 3:mejs.YouTubeApi.createEvent(b,c,"progress")}}};function onYouTubePlayerAPIReady(){mejs.YouTubeApi.iFrameReady()}function onYouTubePlayerReady(a){mejs.YouTubeApi.flashReady(a)}window.mejs=mejs;window.MediaElement=mejs.MediaElement;
(function(a,b,c){var d={locale:{strings:{}},methods:{}};d.locale.getLanguage=function(){return{language:navigator.language}};d.locale.INIT_LANGUAGE=d.locale.getLanguage();d.methods.checkPlain=function(e){var g,f,h={"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"};e=String(e);for(g in h)if(h.hasOwnProperty(g)){f=RegExp(g,"g");e=e.replace(f,h[g])}return e};d.methods.formatString=function(e,g){for(var f in g){switch(f.charAt(0)){case "@":g[f]=d.methods.checkPlain(g[f]);break;case "!":break;default:g[f]=
'<em class="placeholder">'+d.methods.checkPlain(g[f])+"</em>"}e=e.replace(f,g[f])}return e};d.methods.t=function(e,g,f){if(d.locale.strings&&d.locale.strings[f.context]&&d.locale.strings[f.context][e])e=d.locale.strings[f.context][e];if(g)e=d.methods.formatString(e,g);return e};d.t=function(e,g,f){if(typeof e==="string"&&e.length>0){var h=d.locale.getLanguage();f=f||{context:h.language};return d.methods.t(e,g,f)}else throw{name:"InvalidArgumentException",message:"First argument is either not a string or empty."};
};c.i18n=d})(jQuery,document,mejs);(function(a){a.de={Fullscreen:"Vollbild","Go Fullscreen":"Vollbild an","Turn off Fullscreen":"Vollbild aus",Close:"Schlie\u00dfen"}})(mejs.i18n.locale.strings);

/*!
 * MediaElementPlayer
 * http://mediaelementjs.com/
 *
 * Creates a controller bar for HTML5 <video> add <audio> tags
 * using jQuery and MediaElement.js (HTML5 Flash/Silverlight wrapper)
 *
 * Copyright 2010-2012, John Dyer (http://j.hn/)
 * License: MIT
 *
 */if(typeof jQuery!="undefined")mejs.$=jQuery;else if(typeof ender!="undefined")mejs.$=ender;
(function(f){mejs.MepDefaults={poster:"",defaultVideoWidth:480,defaultVideoHeight:270,videoWidth:-1,videoHeight:-1,defaultAudioWidth:400,defaultAudioHeight:30,defaultSeekBackwardInterval:function(a){return a.duration*0.05},defaultSeekForwardInterval:function(a){return a.duration*0.05},audioWidth:-1,audioHeight:-1,startVolume:0.8,loop:false,autoRewind:true,enableAutosize:true,alwaysShowHours:false,showTimecodeFrameCount:false,framesPerSecond:25,autosizeProgress:true,alwaysShowControls:false,hideVideoControlsOnLoad:false,
clickToPlayPause:true,iPadUseNativeControls:false,iPhoneUseNativeControls:false,AndroidUseNativeControls:false,features:["playpause","current","progress","duration","tracks","volume","fullscreen"],isVideo:true,enableKeyboard:true,pauseOtherPlayers:true,keyActions:[{keys:[32,179],action:function(a,b){b.paused||b.ended?b.play():b.pause()}},{keys:[38],action:function(a,b){b.setVolume(Math.min(b.volume+0.1,1))}},{keys:[40],action:function(a,b){b.setVolume(Math.max(b.volume-0.1,0))}},{keys:[37,227],action:function(a,
b){if(!isNaN(b.duration)&&b.duration>0){if(a.isVideo){a.showControls();a.startControlsTimer()}var c=Math.max(b.currentTime-a.options.defaultSeekBackwardInterval(b),0);b.setCurrentTime(c)}}},{keys:[39,228],action:function(a,b){if(!isNaN(b.duration)&&b.duration>0){if(a.isVideo){a.showControls();a.startControlsTimer()}var c=Math.min(b.currentTime+a.options.defaultSeekForwardInterval(b),b.duration);b.setCurrentTime(c)}}},{keys:[70],action:function(a){if(typeof a.enterFullScreen!="undefined")a.isFullScreen?
a.exitFullScreen():a.enterFullScreen()}}]};mejs.mepIndex=0;mejs.players={};mejs.MediaElementPlayer=function(a,b){if(!(this instanceof mejs.MediaElementPlayer))return new mejs.MediaElementPlayer(a,b);this.$media=this.$node=f(a);this.node=this.media=this.$media[0];if(typeof this.node.player!="undefined")return this.node.player;else this.node.player=this;if(typeof b=="undefined")b=this.$node.data("mejsoptions");this.options=f.extend({},mejs.MepDefaults,b);this.id="mep_"+mejs.mepIndex++;mejs.players[this.id]=
this;this.init();return this};mejs.MediaElementPlayer.prototype={hasFocus:false,controlsAreVisible:true,init:function(){var a=this,b=mejs.MediaFeatures,c=f.extend(true,{},a.options,{success:function(e,g){a.meReady(e,g)},error:function(e){a.handleError(e)}}),d=a.media.tagName.toLowerCase();a.isDynamic=d!=="audio"&&d!=="video";a.isVideo=a.isDynamic?a.options.isVideo:d!=="audio"&&a.options.isVideo;if(b.isiPad&&a.options.iPadUseNativeControls||b.isiPhone&&a.options.iPhoneUseNativeControls){a.$media.attr("controls",
"controls");if(b.isiPad&&a.media.getAttribute("autoplay")!==null){a.media.load();a.media.play()}}else if(!(b.isAndroid&&a.options.AndroidUseNativeControls)){a.$media.removeAttr("controls");a.container=f('<div id="'+a.id+'" class="mejs-container '+(mejs.MediaFeatures.svg?"svg":"no-svg")+'"><div class="mejs-inner"><div class="mejs-mediaelement"></div><div class="mejs-layers"></div><div class="mejs-controls"></div><div class="mejs-clear"></div></div></div>').addClass(a.$media[0].className).insertBefore(a.$media);
a.container.addClass((b.isAndroid?"mejs-android ":"")+(b.isiOS?"mejs-ios ":"")+(b.isiPad?"mejs-ipad ":"")+(b.isiPhone?"mejs-iphone ":"")+(a.isVideo?"mejs-video ":"mejs-audio "));if(b.isiOS){b=a.$media.clone();a.container.find(".mejs-mediaelement").append(b);a.$media.remove();a.$node=a.$media=b;a.node=a.media=b[0]}else a.container.find(".mejs-mediaelement").append(a.$media);a.controls=a.container.find(".mejs-controls");a.layers=a.container.find(".mejs-layers");b=a.isVideo?"video":"audio";d=b.substring(0,
1).toUpperCase()+b.substring(1);a.width=a.options[b+"Width"]>0||a.options[b+"Width"].toString().indexOf("%")>-1?a.options[b+"Width"]:a.media.style.width!==""&&a.media.style.width!==null?a.media.style.width:a.media.getAttribute("width")!==null?a.$media.attr("width"):a.options["default"+d+"Width"];a.height=a.options[b+"Height"]>0||a.options[b+"Height"].toString().indexOf("%")>-1?a.options[b+"Height"]:a.media.style.height!==""&&a.media.style.height!==null?a.media.style.height:a.$media[0].getAttribute("height")!==
null?a.$media.attr("height"):a.options["default"+d+"Height"];a.setPlayerSize(a.width,a.height);c.pluginWidth=a.height;c.pluginHeight=a.width}mejs.MediaElement(a.$media[0],c);a.container.trigger("controlsshown")},showControls:function(a){var b=this;a=typeof a=="undefined"||a;if(!b.controlsAreVisible){if(a){b.controls.css("visibility","visible").stop(true,true).fadeIn(200,function(){b.controlsAreVisible=true;b.container.trigger("controlsshown")});b.container.find(".mejs-control").css("visibility","visible").stop(true,
true).fadeIn(200,function(){b.controlsAreVisible=true})}else{b.controls.css("visibility","visible").css("display","block");b.container.find(".mejs-control").css("visibility","visible").css("display","block");b.controlsAreVisible=true;b.container.trigger("controlsshown")}b.setControlsSize()}},hideControls:function(a){var b=this;a=typeof a=="undefined"||a;if(b.controlsAreVisible)if(a){b.controls.stop(true,true).fadeOut(200,function(){f(this).css("visibility","hidden").css("display","block");b.controlsAreVisible=
false;b.container.trigger("controlshidden")});b.container.find(".mejs-control").stop(true,true).fadeOut(200,function(){f(this).css("visibility","hidden").css("display","block")})}else{b.controls.css("visibility","hidden").css("display","block");b.container.find(".mejs-control").css("visibility","hidden").css("display","block");b.controlsAreVisible=false;b.container.trigger("controlshidden")}},controlsTimer:null,startControlsTimer:function(a){var b=this;a=typeof a!="undefined"?a:1500;b.killControlsTimer("start");
b.controlsTimer=setTimeout(function(){b.hideControls();b.killControlsTimer("hide")},a)},killControlsTimer:function(){if(this.controlsTimer!==null){clearTimeout(this.controlsTimer);delete this.controlsTimer;this.controlsTimer=null}},controlsEnabled:true,disableControls:function(){this.killControlsTimer();this.hideControls(false);this.controlsEnabled=false},enableControls:function(){this.showControls(false);this.controlsEnabled=true},meReady:function(a,b){var c=this,d=mejs.MediaFeatures,e=b.getAttribute("autoplay");
e=!(typeof e=="undefined"||e===null||e==="false");var g;if(!c.created){c.created=true;c.media=a;c.domNode=b;if(!(d.isAndroid&&c.options.AndroidUseNativeControls)&&!(d.isiPad&&c.options.iPadUseNativeControls)&&!(d.isiPhone&&c.options.iPhoneUseNativeControls)){c.buildposter(c,c.controls,c.layers,c.media);c.buildkeyboard(c,c.controls,c.layers,c.media);c.buildoverlays(c,c.controls,c.layers,c.media);c.findTracks();for(g in c.options.features){d=c.options.features[g];if(c["build"+d])try{c["build"+d](c,
c.controls,c.layers,c.media)}catch(l){}}c.container.trigger("controlsready");c.setPlayerSize(c.width,c.height);c.setControlsSize();if(c.isVideo){if(mejs.MediaFeatures.hasTouch)c.$media.bind("touchstart",function(){if(c.controlsAreVisible)c.hideControls(false);else c.controlsEnabled&&c.showControls(false)});else{c.media.addEventListener("click",function(){if(c.options.clickToPlayPause)c.media.paused?c.media.play():c.media.pause()});c.container.bind("mouseenter mouseover",function(){if(c.controlsEnabled)if(!c.options.alwaysShowControls){c.killControlsTimer("enter");
c.showControls();c.startControlsTimer(2500)}}).bind("mousemove",function(){if(c.controlsEnabled){c.controlsAreVisible||c.showControls();c.options.alwaysShowControls||c.startControlsTimer(2500)}}).bind("mouseleave",function(){c.controlsEnabled&&!c.media.paused&&!c.options.alwaysShowControls&&c.startControlsTimer(1E3)})}c.options.hideVideoControlsOnLoad&&c.hideControls(false);e&&!c.options.alwaysShowControls&&c.hideControls();c.options.enableAutosize&&c.media.addEventListener("loadedmetadata",function(j){if(c.options.videoHeight<=
0&&c.domNode.getAttribute("height")===null&&!isNaN(j.target.videoHeight)){c.setPlayerSize(j.target.videoWidth,j.target.videoHeight);c.setControlsSize();c.media.setVideoSize(j.target.videoWidth,j.target.videoHeight)}},false)}a.addEventListener("play",function(){for(var j in mejs.players){var k=mejs.players[j];k.id!=c.id&&c.options.pauseOtherPlayers&&!k.paused&&!k.ended&&k.pause();k.hasFocus=false}c.hasFocus=true},false);c.media.addEventListener("ended",function(){if(c.options.autoRewind)try{c.media.setCurrentTime(0)}catch(j){}c.media.pause();
c.setProgressRail&&c.setProgressRail();c.setCurrentRail&&c.setCurrentRail();if(c.options.loop)c.media.play();else!c.options.alwaysShowControls&&c.controlsEnabled&&c.showControls()},false);c.media.addEventListener("loadedmetadata",function(){c.updateDuration&&c.updateDuration();c.updateCurrent&&c.updateCurrent();if(!c.isFullScreen){c.setPlayerSize(c.width,c.height);c.setControlsSize()}},false);setTimeout(function(){c.setPlayerSize(c.width,c.height);c.setControlsSize()},50);c.globalBind("resize",function(){c.isFullScreen||
mejs.MediaFeatures.hasTrueNativeFullScreen&&document.webkitIsFullScreen||c.setPlayerSize(c.width,c.height);c.setControlsSize()});c.media.pluginType=="youtube"&&c.container.find(".mejs-overlay-play").hide()}if(e&&a.pluginType=="native"){a.load();a.play()}if(c.options.success)typeof c.options.success=="string"?window[c.options.success](c.media,c.domNode,c):c.options.success(c.media,c.domNode,c)}},handleError:function(a){this.controls.hide();this.options.error&&this.options.error(a)},setPlayerSize:function(a,
b){this.container.trigger("playerresize");if(typeof a!="undefined")this.width=a;if(typeof b!="undefined")this.height=b;if(this.height.toString().indexOf("%")>0||this.$node.css("max-width")==="100%"||this.$node[0].currentStyle&&this.$node[0].currentStyle.maxWidth==="100%"){var c=this.isVideo?this.media.videoWidth&&this.media.videoWidth>0?this.media.videoWidth:this.options.defaultVideoWidth:this.options.defaultAudioWidth,d=this.isVideo?this.media.videoHeight&&this.media.videoHeight>0?this.media.videoHeight:
this.options.defaultVideoHeight:this.options.defaultAudioHeight,e=this.container.parent().closest(":visible").width();c=this.isVideo||!this.options.autosizeProgress?parseInt(e*d/c,10):d;if(this.container.parent()[0].tagName.toLowerCase()==="body"){e=f(window).width();c=f(window).height()}if(c!=0&&e!=0){this.container.width(e).height(c);this.$media.add(this.container.find(".mejs-shim")).width("100%").height("100%");this.isVideo&&this.media.setVideoSize&&this.media.setVideoSize(e,c);this.layers.children(".mejs-layer").width("100%").height("100%")}}else{this.container.width(this.width).height(this.height);
this.layers.children(".mejs-layer").width(this.width).height(this.height)}},setControlsSize:function(){var a=0,b=0,c=this.controls.find(".mejs-time-rail"),d=this.controls.find(".mejs-time-total");this.controls.find(".mejs-time-current");this.controls.find(".mejs-time-loaded");var e=c.siblings();if(this.options&&!this.options.autosizeProgress)b=parseInt(c.css("width"));if(b===0||!b){e.each(function(){var g=f(this);if(g.css("position")!="absolute"&&g.is(":visible"))a+=f(this).outerWidth(true)});b=this.controls.width()-
a-(c.outerWidth(true)-c.width())}c.width(b-5);d.width(b-(d.outerWidth(true)-d.width()+5));this.setProgressRail&&this.setProgressRail();this.setCurrentRail&&this.setCurrentRail()},buildposter:function(a,b,c,d){var e=f('<div class="mejs-poster mejs-layer"></div>').appendTo(c);b=a.$media.attr("poster");if(a.options.poster!=="")b=a.options.poster;b!==""&&b!=null?this.setPoster(b):e.hide();d.addEventListener("play",function(){e.hide()},false)},setPoster:function(a){var b=this.container.find(".mejs-poster"),
c=b.find("img");if(c.length==0)c=f('<img width="100%" height="100%" />').appendTo(b);c.attr("src",a)},buildoverlays:function(a,b,c,d){var e=this;if(a.isVideo){var g=f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-loading"><span></span></div></div>').hide().appendTo(c),l=f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-error"></div></div>').hide().appendTo(c),j=f('<div class="mejs-overlay mejs-layer mejs-overlay-play"><div class="mejs-overlay-button"></div></div>').appendTo(c).click(function(){if(e.options.clickToPlayPause)d.paused?
d.play():d.pause()});d.addEventListener("play",function(){j.hide();g.hide();b.find(".mejs-time-buffering").hide();l.hide()},false);d.addEventListener("playing",function(){j.hide();g.hide();b.find(".mejs-time-buffering").hide();l.hide()},false);d.addEventListener("seeking",function(){g.show();b.find(".mejs-time-buffering").show()},false);d.addEventListener("seeked",function(){g.hide();b.find(".mejs-time-buffering").hide()},false);d.addEventListener("pause",function(){mejs.MediaFeatures.isiPhone||j.show()},
false);d.addEventListener("waiting",function(){g.show();b.find(".mejs-time-buffering").show()},false);d.addEventListener("loadeddata",function(){g.show();b.find(".mejs-time-buffering").show()},false);d.addEventListener("canplay",function(){g.hide();b.find(".mejs-time-buffering").hide()},false);d.addEventListener("error",function(){g.hide();b.find(".mejs-time-buffering").hide();l.show();l.find("mejs-overlay-error").html("Error loading this resource")},false)}},buildkeyboard:function(a,b,c,d){this.globalBind("keydown",
function(e){if(a.hasFocus&&a.options.enableKeyboard){if(!a.isVideo)return;for(var g=0,l=a.options.keyActions.length;g<l;g++)for(var j=a.options.keyActions[g],k=0,s=j.keys.length;k<s;k++)if(e.keyCode==j.keys[k]){e.preventDefault();j.action(a,d,e.keyCode);return false}}return true});this.globalBind("click",function(e){if(f(e.target).closest(".mejs-container").length==0)a.hasFocus=false})},findTracks:function(){var a=this,b=a.$media.find("track");a.tracks=[];b.each(function(c,d){d=f(d);a.tracks.push({srclang:d.attr("srclang")?
d.attr("srclang").toLowerCase():"",src:d.attr("src"),kind:d.attr("kind"),label:d.attr("label")||"",entries:[],isLoaded:false})})},changeSkin:function(a){this.container[0].className="mejs-container "+a;this.setPlayerSize(this.width,this.height);this.setControlsSize()},play:function(){this.media.play()},pause:function(){this.media.pause()},load:function(){this.media.load()},setMuted:function(a){this.media.setMuted(a)},setCurrentTime:function(a){this.media.setCurrentTime(a)},getCurrentTime:function(){return this.media.currentTime},
setVolume:function(a){this.media.setVolume(a)},getVolume:function(){return this.media.volume},setSrc:function(a){this.media.setSrc(a)},remove:function(){var a,b;for(a in this.options.features){b=this.options.features[a];if(this["clean"+b])try{this["clean"+b](this)}catch(c){}}this.media.pluginType==="native"?this.$media.prop("controls",true):this.media.remove();this.isDynamic||this.$node.insertBefore(this.container);mejs.players.splice(f.inArray(this,mejs.players),1);this.container.remove();this.globalUnbind();
delete this.node.player;delete mejs.players[this.id]}};(function(){function a(c,d){var e={d:[],w:[]};f.each((c||"").split(" "),function(g,l){e[b.test(l)?"w":"d"].push(l+"."+d)});e.d=e.d.join(" ");e.w=e.w.join(" ");return e}var b=/^((after|before)print|(before)?unload|hashchange|message|o(ff|n)line|page(hide|show)|popstate|resize|storage)\b/;mejs.MediaElementPlayer.prototype.globalBind=function(c,d,e){c=a(c,this.id);c.d&&f(document).bind(c.d,d,e);c.w&&f(window).bind(c.w,d,e)};mejs.MediaElementPlayer.prototype.globalUnbind=
function(c,d){c=a(c,this.id);c.d&&f(document).unbind(c.d,d);c.w&&f(window).unbind(c.w,d)}})();if(typeof jQuery!="undefined")jQuery.fn.mediaelementplayer=function(a){a===false?this.each(function(){var b=jQuery(this).data("mediaelementplayer");b&&b.remove();jQuery(this).removeData("mediaelementplayer")}):this.each(function(){jQuery(this).data("mediaelementplayer",new mejs.MediaElementPlayer(this,a))});return this};f(document).ready(function(){f(".mejs-player").mediaelementplayer()});window.MediaElementPlayer=
mejs.MediaElementPlayer})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{playpauseText:"Play/Pause"});f.extend(MediaElementPlayer.prototype,{buildplaypause:function(a,b,c,d){var e=f('<div class="mejs-button mejs-playpause-button mejs-play" ><button type="button" aria-controls="'+this.id+'" title="'+this.options.playpauseText+'"></button></div>').appendTo(b).click(function(g){g.preventDefault();d.paused?d.play():d.pause();return false});d.addEventListener("play",function(){e.removeClass("mejs-play").addClass("mejs-pause")},false);
d.addEventListener("playing",function(){e.removeClass("mejs-play").addClass("mejs-pause")},false);d.addEventListener("pause",function(){e.removeClass("mejs-pause").addClass("mejs-play")},false);d.addEventListener("paused",function(){e.removeClass("mejs-pause").addClass("mejs-play")},false)}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{stopText:"Stop"});f.extend(MediaElementPlayer.prototype,{buildstop:function(a,b,c,d){f('<div class="mejs-button mejs-stop-button mejs-stop"><button type="button" aria-controls="'+this.id+'" title="'+this.options.stopText+'"></button></div>').appendTo(b).click(function(){d.paused||d.pause();if(d.currentTime>0){d.setCurrentTime(0);d.pause();b.find(".mejs-time-current").width("0px");b.find(".mejs-time-handle").css("left","0px");b.find(".mejs-time-float-current").html(mejs.Utility.secondsToTimeCode(0));
b.find(".mejs-currenttime").html(mejs.Utility.secondsToTimeCode(0));c.find(".mejs-poster").show()}})}})})(mejs.$);
(function(f){f.extend(MediaElementPlayer.prototype,{buildprogress:function(a,b,c,d){f('<div class="mejs-time-rail"><span class="mejs-time-total"><span class="mejs-time-buffering"></span><span class="mejs-time-loaded"></span><span class="mejs-time-current"></span><span class="mejs-time-handle"></span><span class="mejs-time-float"><span class="mejs-time-float-current">00:00</span><span class="mejs-time-float-corner"></span></span></span></div>').appendTo(b);b.find(".mejs-time-buffering").hide();var e=
this,g=b.find(".mejs-time-total");c=b.find(".mejs-time-loaded");var l=b.find(".mejs-time-current"),j=b.find(".mejs-time-handle"),k=b.find(".mejs-time-float"),s=b.find(".mejs-time-float-current"),p=function(n){n=n.pageX;var h=g.offset(),q=g.outerWidth(true),m=0,o=m=0;if(d.duration){if(n<h.left)n=h.left;else if(n>q+h.left)n=q+h.left;o=n-h.left;m=o/q;m=m<=0.02?0:m*d.duration;r&&m!==d.currentTime&&d.setCurrentTime(m);if(!mejs.MediaFeatures.hasTouch){k.css("left",o);s.html(mejs.Utility.secondsToTimeCode(m));
k.show()}}},r=false;g.bind("mousedown",function(n){if(n.which===1){r=true;p(n);e.globalBind("mousemove.dur",function(h){p(h)});e.globalBind("mouseup.dur",function(){r=false;k.hide();e.globalUnbind(".dur")});return false}}).bind("mouseenter",function(){e.globalBind("mousemove.dur",function(n){p(n)});mejs.MediaFeatures.hasTouch||k.show()}).bind("mouseleave",function(){if(!r){e.globalUnbind(".dur");k.hide()}});d.addEventListener("progress",function(n){a.setProgressRail(n);a.setCurrentRail(n)},false);
d.addEventListener("timeupdate",function(n){a.setProgressRail(n);a.setCurrentRail(n)},false);e.loaded=c;e.total=g;e.current=l;e.handle=j},setProgressRail:function(a){var b=a!=undefined?a.target:this.media,c=null;if(b&&b.buffered&&b.buffered.length>0&&b.buffered.end&&b.duration)c=b.buffered.end(0)/b.duration;else if(b&&b.bytesTotal!=undefined&&b.bytesTotal>0&&b.bufferedBytes!=undefined)c=b.bufferedBytes/b.bytesTotal;else if(a&&a.lengthComputable&&a.total!=0)c=a.loaded/a.total;if(c!==null){c=Math.min(1,
Math.max(0,c));this.loaded&&this.total&&this.loaded.width(this.total.width()*c)}},setCurrentRail:function(){if(this.media.currentTime!=undefined&&this.media.duration)if(this.total&&this.handle){var a=Math.round(this.total.width()*this.media.currentTime/this.media.duration),b=a-Math.round(this.handle.outerWidth(true)/2);this.current.width(a);this.handle.css("left",b)}}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{duration:-1,timeAndDurationSeparator:" <span> | </span> "});f.extend(MediaElementPlayer.prototype,{buildcurrent:function(a,b,c,d){f('<div class="mejs-time"><span class="mejs-currenttime">'+(a.options.alwaysShowHours?"00:":"")+(a.options.showTimecodeFrameCount?"00:00:00":"00:00")+"</span></div>").appendTo(b);this.currenttime=this.controls.find(".mejs-currenttime");d.addEventListener("timeupdate",function(){a.updateCurrent()},false)},buildduration:function(a,
b,c,d){if(b.children().last().find(".mejs-currenttime").length>0)f(this.options.timeAndDurationSeparator+'<span class="mejs-duration">'+(this.options.duration>0?mejs.Utility.secondsToTimeCode(this.options.duration,this.options.alwaysShowHours||this.media.duration>3600,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25):(a.options.alwaysShowHours?"00:":"")+(a.options.showTimecodeFrameCount?"00:00:00":"00:00"))+"</span>").appendTo(b.find(".mejs-time"));else{b.find(".mejs-currenttime").parent().addClass("mejs-currenttime-container");
f('<div class="mejs-time mejs-duration-container"><span class="mejs-duration">'+(this.options.duration>0?mejs.Utility.secondsToTimeCode(this.options.duration,this.options.alwaysShowHours||this.media.duration>3600,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25):(a.options.alwaysShowHours?"00:":"")+(a.options.showTimecodeFrameCount?"00:00:00":"00:00"))+"</span></div>").appendTo(b)}this.durationD=this.controls.find(".mejs-duration");d.addEventListener("timeupdate",function(){a.updateDuration()},
false)},updateCurrent:function(){if(this.currenttime)this.currenttime.html(mejs.Utility.secondsToTimeCode(this.media.currentTime,this.options.alwaysShowHours||this.media.duration>3600,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25))},updateDuration:function(){this.container.toggleClass("mejs-long-video",this.media.duration>3600);if(this.durationD&&(this.options.duration>0||this.media.duration))this.durationD.html(mejs.Utility.secondsToTimeCode(this.options.duration>0?this.options.duration:
this.media.duration,this.options.alwaysShowHours,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25))}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{muteText:"Mute Toggle",hideVolumeOnTouchDevices:true,audioVolume:"horizontal",videoVolume:"vertical"});f.extend(MediaElementPlayer.prototype,{buildvolume:function(a,b,c,d){if(!(mejs.MediaFeatures.hasTouch&&this.options.hideVolumeOnTouchDevices)){var e=this,g=e.isVideo?e.options.videoVolume:e.options.audioVolume,l=g=="horizontal"?f('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="'+e.id+'" title="'+e.options.muteText+
'"></button></div><div class="mejs-horizontal-volume-slider"><div class="mejs-horizontal-volume-total"></div><div class="mejs-horizontal-volume-current"></div><div class="mejs-horizontal-volume-handle"></div></div>').appendTo(b):f('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="'+e.id+'" title="'+e.options.muteText+'"></button><div class="mejs-volume-slider"><div class="mejs-volume-total"></div><div class="mejs-volume-current"></div><div class="mejs-volume-handle"></div></div></div>').appendTo(b),
j=e.container.find(".mejs-volume-slider, .mejs-horizontal-volume-slider"),k=e.container.find(".mejs-volume-total, .mejs-horizontal-volume-total"),s=e.container.find(".mejs-volume-current, .mejs-horizontal-volume-current"),p=e.container.find(".mejs-volume-handle, .mejs-horizontal-volume-handle"),r=function(m,o){if(!j.is(":visible")&&typeof o=="undefined"){j.show();r(m,true);j.hide()}else{m=Math.max(0,m);m=Math.min(m,1);m==0?l.removeClass("mejs-mute").addClass("mejs-unmute"):l.removeClass("mejs-unmute").addClass("mejs-mute");
if(g=="vertical"){var t=k.height(),u=k.position(),v=t-t*m;p.css("top",Math.round(u.top+v-p.height()/2));s.height(t-v);s.css("top",u.top+v)}else{t=k.width();u=k.position();t=t*m;p.css("left",Math.round(u.left+t-p.width()/2));s.width(Math.round(t))}}},n=function(m){var o=null,t=k.offset();if(g=="vertical"){o=k.height();parseInt(k.css("top").replace(/px/,""),10);o=(o-(m.pageY-t.top))/o;if(t.top==0||t.left==0)return}else{o=k.width();o=(m.pageX-t.left)/o}o=Math.max(0,o);o=Math.min(o,1);r(o);o==0?d.setMuted(true):
d.setMuted(false);d.setVolume(o)},h=false,q=false;l.hover(function(){j.show();q=true},function(){q=false;!h&&g=="vertical"&&j.hide()});j.bind("mouseover",function(){q=true}).bind("mousedown",function(m){n(m);e.globalBind("mousemove.vol",function(o){n(o)});e.globalBind("mouseup.vol",function(){h=false;e.globalUnbind(".vol");!q&&g=="vertical"&&j.hide()});h=true;return false});l.find("button").click(function(){d.setMuted(!d.muted)});d.addEventListener("volumechange",function(){if(!h)if(d.muted){r(0);
l.removeClass("mejs-mute").addClass("mejs-unmute")}else{r(d.volume);l.removeClass("mejs-unmute").addClass("mejs-mute")}},false);if(e.container.is(":visible")){r(a.options.startVolume);a.options.startVolume===0&&d.setMuted(true);d.pluginType==="native"&&d.setVolume(a.options.startVolume)}}}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{usePluginFullScreen:true,newWindowCallback:function(){return""},fullscreenText:mejs.i18n.t("Fullscreen")});f.extend(MediaElementPlayer.prototype,{isFullScreen:false,isNativeFullScreen:false,docStyleOverflow:null,isInIframe:false,buildfullscreen:function(a,b,c,d){if(a.isVideo){a.isInIframe=window.location!=window.parent.location;if(mejs.MediaFeatures.hasTrueNativeFullScreen){c=function(){if(mejs.MediaFeatures.isFullScreen()){a.isNativeFullScreen=true;a.setControlsSize()}else{a.isNativeFullScreen=
false;a.exitFullScreen()}};mejs.MediaFeatures.hasMozNativeFullScreen?a.globalBind(mejs.MediaFeatures.fullScreenEventName,c):a.container.bind(mejs.MediaFeatures.fullScreenEventName,c)}var e=this,g=f('<div class="mejs-button mejs-fullscreen-button"><button type="button" aria-controls="'+e.id+'" title="'+e.options.fullscreenText+'"></button></div>').appendTo(b);if(e.media.pluginType==="native"||!e.options.usePluginFullScreen&&!mejs.MediaFeatures.isFirefox)g.click(function(){mejs.MediaFeatures.hasTrueNativeFullScreen&&
mejs.MediaFeatures.isFullScreen()||a.isFullScreen?a.exitFullScreen():a.enterFullScreen()});else{var l=null;if(function(){var h=document.createElement("x"),q=document.documentElement,m=window.getComputedStyle;if(!("pointerEvents"in h.style))return false;h.style.pointerEvents="auto";h.style.pointerEvents="x";q.appendChild(h);m=m&&m(h,"").pointerEvents==="auto";q.removeChild(h);return!!m}()&&!mejs.MediaFeatures.isOpera){var j=false,k=function(){if(j){s.hide();p.hide();r.hide();g.css("pointer-events",
"");e.controls.css("pointer-events","");j=false}},s=f('<div class="mejs-fullscreen-hover" />').appendTo(e.container).mouseover(k),p=f('<div class="mejs-fullscreen-hover"  />').appendTo(e.container).mouseover(k),r=f('<div class="mejs-fullscreen-hover"  />').appendTo(e.container).mouseover(k),n=function(){var h={position:"absolute",top:0,left:0};s.css(h);p.css(h);r.css(h);s.width(e.container.width()).height(e.container.height()-e.controls.height());h=g.offset().left-e.container.offset().left;fullScreenBtnWidth=
g.outerWidth(true);p.width(h).height(e.controls.height()).css({top:e.container.height()-e.controls.height()});r.width(e.container.width()-h-fullScreenBtnWidth).height(e.controls.height()).css({top:e.container.height()-e.controls.height(),left:h+fullScreenBtnWidth})};e.globalBind("resize",function(){n()});g.mouseover(function(){if(!e.isFullScreen){var h=g.offset(),q=a.container.offset();d.positionFullscreenButton(h.left-q.left,h.top-q.top,false);g.css("pointer-events","none");e.controls.css("pointer-events",
"none");s.show();r.show();p.show();n();j=true}});d.addEventListener("fullscreenchange",function(){k()})}else g.mouseover(function(){if(l!==null){clearTimeout(l);delete l}var h=g.offset(),q=a.container.offset();d.positionFullscreenButton(h.left-q.left,h.top-q.top,true)}).mouseout(function(){if(l!==null){clearTimeout(l);delete l}l=setTimeout(function(){d.hideFullscreenButton()},1500)})}a.fullscreenBtn=g;e.globalBind("keydown",function(h){if((mejs.MediaFeatures.hasTrueNativeFullScreen&&mejs.MediaFeatures.isFullScreen()||
e.isFullScreen)&&h.keyCode==27)a.exitFullScreen()})}},cleanfullscreen:function(a){a.exitFullScreen()},enterFullScreen:function(){var a=this;if(!(a.media.pluginType!=="native"&&(mejs.MediaFeatures.isFirefox||a.options.usePluginFullScreen))){docStyleOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow="hidden";normalHeight=a.container.height();normalWidth=a.container.width();if(a.media.pluginType==="native")if(mejs.MediaFeatures.hasTrueNativeFullScreen){mejs.MediaFeatures.requestFullScreen(a.container[0]);
a.isInIframe&&setTimeout(function c(){if(a.isNativeFullScreen)f(window).width()!==screen.width?a.exitFullScreen():setTimeout(c,500)},500)}else if(mejs.MediaFeatures.hasSemiNativeFullScreen){a.media.webkitEnterFullscreen();return}if(a.isInIframe){var b=a.options.newWindowCallback(this);if(b!=="")if(mejs.MediaFeatures.hasTrueNativeFullScreen)setTimeout(function(){if(!a.isNativeFullScreen){a.pause();window.open(b,a.id,"top=0,left=0,width="+screen.availWidth+",height="+screen.availHeight+",resizable=yes,scrollbars=no,status=no,toolbar=no")}},
250);else{a.pause();window.open(b,a.id,"top=0,left=0,width="+screen.availWidth+",height="+screen.availHeight+",resizable=yes,scrollbars=no,status=no,toolbar=no");return}}a.container.addClass("mejs-container-fullscreen").width("100%").height("100%");setTimeout(function(){a.container.css({width:"100%",height:"100%"});a.setControlsSize()},500);if(a.pluginType==="native")a.$media.width("100%").height("100%");else{a.container.find(".mejs-shim").width("100%").height("100%");a.media.setVideoSize(f(window).width(),
f(window).height())}a.layers.children("div").width("100%").height("100%");a.fullscreenBtn&&a.fullscreenBtn.removeClass("mejs-fullscreen").addClass("mejs-unfullscreen");a.setControlsSize();a.isFullScreen=true}},exitFullScreen:function(){if(this.media.pluginType!=="native"&&mejs.MediaFeatures.isFirefox)this.media.setFullscreen(false);else{if(mejs.MediaFeatures.hasTrueNativeFullScreen&&(mejs.MediaFeatures.isFullScreen()||this.isFullScreen))mejs.MediaFeatures.cancelFullScreen();document.documentElement.style.overflow=
docStyleOverflow;this.container.removeClass("mejs-container-fullscreen").width(normalWidth).height(normalHeight);if(this.pluginType==="native")this.$media.width(normalWidth).height(normalHeight);else{this.container.find("object embed").width(normalWidth).height(normalHeight);this.media.setVideoSize(normalWidth,normalHeight)}this.layers.children("div").width(normalWidth).height(normalHeight);this.fullscreenBtn.removeClass("mejs-unfullscreen").addClass("mejs-fullscreen");this.setControlsSize();this.isFullScreen=
false}}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{startLanguage:"",tracksText:"Captions/Subtitles",hideCaptionsButtonWhenEmpty:true,toggleCaptionsButtonWhenOnlyOne:false,slidesSelector:""});f.extend(MediaElementPlayer.prototype,{hasChapters:false,buildtracks:function(a,b,c,d){if(a.tracks.length!=0){a.chapters=f('<div class="mejs-chapters mejs-layer"></div>').prependTo(c).hide();a.captions=f('<div class="mejs-captions-layer mejs-layer"><div class="mejs-captions-position mejs-captions-position-hover"><span class="mejs-captions-text"></span></div></div>').prependTo(c).hide();a.captionsText=
a.captions.find(".mejs-captions-text");a.captionsButton=f('<div class="mejs-button mejs-captions-button"><button type="button" aria-controls="'+this.id+'" title="'+this.options.tracksText+'"></button><div class="mejs-captions-selector"><ul><li><input type="radio" name="'+a.id+'_captions" id="'+a.id+'_captions_none" value="none" checked="checked" /><label for="'+a.id+'_captions_none">None</label></li></ul></div></div>').appendTo(b);for(b=c=0;b<a.tracks.length;b++)a.tracks[b].kind=="subtitles"&&c++;
this.options.toggleCaptionsButtonWhenOnlyOne&&c==1?a.captionsButton.on("click",function(){a.setTrack(a.selectedTrack==null?a.tracks[0].srclang:"none")}):a.captionsButton.hover(function(){f(this).find(".mejs-captions-selector").css("visibility","visible")},function(){f(this).find(".mejs-captions-selector").css("visibility","hidden")}).on("click","input[type=radio]",function(){lang=this.value;a.setTrack(lang)});a.options.alwaysShowControls?a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover"):
a.container.bind("controlsshown",function(){a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover")}).bind("controlshidden",function(){d.paused||a.container.find(".mejs-captions-position").removeClass("mejs-captions-position-hover")});a.trackToLoad=-1;a.selectedTrack=null;a.isLoadingTrack=false;for(b=0;b<a.tracks.length;b++)a.tracks[b].kind=="subtitles"&&a.addTrackButton(a.tracks[b].srclang,a.tracks[b].label);a.loadNextTrack();d.addEventListener("timeupdate",function(){a.displayCaptions()},
false);if(a.options.slidesSelector!=""){a.slidesContainer=f(a.options.slidesSelector);d.addEventListener("timeupdate",function(){a.displaySlides()},false)}d.addEventListener("loadedmetadata",function(){a.displayChapters()},false);a.container.hover(function(){if(a.hasChapters){a.chapters.css("visibility","visible");a.chapters.fadeIn(200).height(a.chapters.find(".mejs-chapter").outerHeight())}},function(){a.hasChapters&&!d.paused&&a.chapters.fadeOut(200,function(){f(this).css("visibility","hidden");
f(this).css("display","block")})});a.node.getAttribute("autoplay")!==null&&a.chapters.css("visibility","hidden")}},setTrack:function(a){var b;if(a=="none"){this.selectedTrack=null;this.captionsButton.removeClass("mejs-captions-enabled")}else for(b=0;b<this.tracks.length;b++)if(this.tracks[b].srclang==a){this.selectedTrack==null&&this.captionsButton.addClass("mejs-captions-enabled");this.selectedTrack=this.tracks[b];this.captions.attr("lang",this.selectedTrack.srclang);this.displayCaptions();break}},
loadNextTrack:function(){this.trackToLoad++;if(this.trackToLoad<this.tracks.length){this.isLoadingTrack=true;this.loadTrack(this.trackToLoad)}else{this.isLoadingTrack=false;this.checkForTracks()}},loadTrack:function(a){var b=this,c=b.tracks[a];f.ajax({url:c.src,dataType:"text",success:function(d){c.entries=typeof d=="string"&&/<tt\s+xml/ig.exec(d)?mejs.TrackFormatParser.dfxp.parse(d):mejs.TrackFormatParser.webvvt.parse(d);c.isLoaded=true;b.enableTrackButton(c.srclang,c.label);b.loadNextTrack();c.kind==
"chapters"&&b.media.addEventListener("play",function(){b.media.duration>0&&b.displayChapters(c)},false);c.kind=="slides"&&b.setupSlides(c)},error:function(){b.loadNextTrack()}})},enableTrackButton:function(a,b){if(b==="")b=mejs.language.codes[a]||a;this.captionsButton.find("input[value="+a+"]").prop("disabled",false).siblings("label").html(b);this.options.startLanguage==a&&f("#"+this.id+"_captions_"+a).click();this.adjustLanguageBox()},addTrackButton:function(a,b){if(b==="")b=mejs.language.codes[a]||
a;this.captionsButton.find("ul").append(f('<li><input type="radio" name="'+this.id+'_captions" id="'+this.id+"_captions_"+a+'" value="'+a+'" disabled="disabled" /><label for="'+this.id+"_captions_"+a+'">'+b+" (loading)</label></li>"));this.adjustLanguageBox();this.container.find(".mejs-captions-translations option[value="+a+"]").remove()},adjustLanguageBox:function(){this.captionsButton.find(".mejs-captions-selector").height(this.captionsButton.find(".mejs-captions-selector ul").outerHeight(true)+
this.captionsButton.find(".mejs-captions-translations").outerHeight(true))},checkForTracks:function(){var a=false;if(this.options.hideCaptionsButtonWhenEmpty){for(i=0;i<this.tracks.length;i++)if(this.tracks[i].kind=="subtitles"){a=true;break}if(!a){this.captionsButton.hide();this.setControlsSize()}}},displayCaptions:function(){if(typeof this.tracks!="undefined"){var a,b=this.selectedTrack;if(b!=null&&b.isLoaded)for(a=0;a<b.entries.times.length;a++)if(this.media.currentTime>=b.entries.times[a].start&&
this.media.currentTime<=b.entries.times[a].stop){if(this.captionsText.html()!==b.entries.text[a]){if(this.isVideo){this.captionsText.html(b.entries.text[a]);this.captions.show().height(0)}this.container.trigger("subtitle",[b.entries.times[a].start,b.entries.times[a].stop,b.entries.text[a]])}return}this.captions.hide()}},setupSlides:function(a){this.slides=a;this.slides.entries.imgs=[this.slides.entries.text.length];this.showSlide(0)},showSlide:function(a){if(!(typeof this.tracks=="undefined"||typeof this.slidesContainer==
"undefined")){var b=this,c=b.slides.entries.text[a],d=b.slides.entries.imgs[a];if(typeof d=="undefined"||typeof d.fadeIn=="undefined")b.slides.entries.imgs[a]=d=f('<img src="'+c+'">').on("load",function(){d.appendTo(b.slidesContainer).hide().fadeIn().siblings(":visible").fadeOut()});else if(!d.is(":visible")&&!d.is(":animated")){console.log("showing existing slide");d.fadeIn().siblings(":visible").fadeOut()}}},displaySlides:function(){if(typeof this.slides!="undefined"){var a=this.slides,b;for(b=
0;b<a.entries.times.length;b++)if(this.media.currentTime>=a.entries.times[b].start&&this.media.currentTime<=a.entries.times[b].stop){this.showSlide(b);break}}},displayChapters:function(){var a;for(a=0;a<this.tracks.length;a++)if(this.tracks[a].kind=="chapters"&&this.tracks[a].isLoaded){this.drawChapters(this.tracks[a]);this.hasChapters=true;break}},drawChapters:function(a){var b=this,c,d,e=d=0;b.chapters.empty();for(c=0;c<a.entries.times.length;c++){d=a.entries.times[c].stop-a.entries.times[c].start;
d=Math.floor(d/b.media.duration*100);if(d+e>100||c==a.entries.times.length-1&&d+e<100)d=100-e;b.chapters.append(f('<div class="mejs-chapter" rel="'+a.entries.times[c].start+'" style="left: '+e.toString()+"%;width: "+d.toString()+'%;"><div class="mejs-chapter-block'+(c==a.entries.times.length-1?" mejs-chapter-block-last":"")+'"><span class="ch-title">'+a.entries.text[c]+'</span><span class="ch-time">'+mejs.Utility.secondsToTimeCode(a.entries.times[c].start)+"&ndash;"+mejs.Utility.secondsToTimeCode(a.entries.times[c].stop)+
"</span></div></div>"));e+=d}b.chapters.find("div.mejs-chapter").click(function(){b.media.setCurrentTime(parseFloat(f(this).attr("rel")));b.media.paused&&b.media.play()});b.chapters.show()}});mejs.language={codes:{af:"Afrikaans",sq:"Albanian",ar:"Arabic",be:"Belarusian",bg:"Bulgarian",ca:"Catalan",zh:"Chinese","zh-cn":"Chinese Simplified","zh-tw":"Chinese Traditional",hr:"Croatian",cs:"Czech",da:"Danish",nl:"Dutch",en:"English",et:"Estonian",tl:"Filipino",fi:"Finnish",fr:"French",gl:"Galician",de:"German",
el:"Greek",ht:"Haitian Creole",iw:"Hebrew",hi:"Hindi",hu:"Hungarian",is:"Icelandic",id:"Indonesian",ga:"Irish",it:"Italian",ja:"Japanese",ko:"Korean",lv:"Latvian",lt:"Lithuanian",mk:"Macedonian",ms:"Malay",mt:"Maltese",no:"Norwegian",fa:"Persian",pl:"Polish",pt:"Portuguese",ro:"Romanian",ru:"Russian",sr:"Serbian",sk:"Slovak",sl:"Slovenian",es:"Spanish",sw:"Swahili",sv:"Swedish",tl:"Tagalog",th:"Thai",tr:"Turkish",uk:"Ukrainian",vi:"Vietnamese",cy:"Welsh",yi:"Yiddish"}};mejs.TrackFormatParser={webvvt:{pattern_identifier:/^([a-zA-z]+-)?[0-9]+$/,
pattern_timecode:/^([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,parse:function(a){var b=0;a=mejs.TrackFormatParser.split2(a,/\r?\n/);for(var c={text:[],times:[]},d,e;b<a.length;b++)if(this.pattern_identifier.exec(a[b])){b++;if((d=this.pattern_timecode.exec(a[b]))&&b<a.length){b++;e=a[b];for(b++;a[b]!==""&&b<a.length;){e=e+"\n"+a[b];b++}e=f.trim(e).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,"<a href='$1' target='_blank'>$1</a>");
c.text.push(e);c.times.push({start:mejs.Utility.convertSMPTEtoSeconds(d[1])==0?0.2:mejs.Utility.convertSMPTEtoSeconds(d[1]),stop:mejs.Utility.convertSMPTEtoSeconds(d[3]),settings:d[5]})}}return c}},dfxp:{parse:function(a){a=f(a).filter("tt");var b=0;b=a.children("div").eq(0);var c=b.find("p");b=a.find("#"+b.attr("style"));var d,e;a={text:[],times:[]};if(b.length){e=b.removeAttr("id").get(0).attributes;if(e.length){d={};for(b=0;b<e.length;b++)d[e[b].name.split(":")[1]]=e[b].value}}for(b=0;b<c.length;b++){var g;
e={start:null,stop:null,style:null};if(c.eq(b).attr("begin"))e.start=mejs.Utility.convertSMPTEtoSeconds(c.eq(b).attr("begin"));if(!e.start&&c.eq(b-1).attr("end"))e.start=mejs.Utility.convertSMPTEtoSeconds(c.eq(b-1).attr("end"));if(c.eq(b).attr("end"))e.stop=mejs.Utility.convertSMPTEtoSeconds(c.eq(b).attr("end"));if(!e.stop&&c.eq(b+1).attr("begin"))e.stop=mejs.Utility.convertSMPTEtoSeconds(c.eq(b+1).attr("begin"));if(d){g="";for(var l in d)g+=l+":"+d[l]+";"}if(g)e.style=g;if(e.start==0)e.start=0.2;
a.times.push(e);e=f.trim(c.eq(b).html()).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,"<a href='$1' target='_blank'>$1</a>");a.text.push(e);if(a.times.start==0)a.times.start=2}return a}},split2:function(a,b){return a.split(b)}};if("x\n\ny".split(/\n/gi).length!=3)mejs.TrackFormatParser.split2=function(a,b){var c=[],d="",e;for(e=0;e<a.length;e++){d+=a.substring(e,e+1);if(b.test(d)){c.push(d.replace(b,""));d=""}}c.push(d);return c}})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{contextMenuItems:[{render:function(a){if(typeof a.enterFullScreen=="undefined")return null;return a.isFullScreen?"Turn off Fullscreen":"Go Fullscreen"},click:function(a){a.isFullScreen?a.exitFullScreen():a.enterFullScreen()}},{render:function(a){return a.media.muted?"Unmute":"Mute"},click:function(a){a.media.muted?a.setMuted(false):a.setMuted(true)}},{isSeparator:true},{render:function(){return"Download Video"},click:function(a){window.location.href=a.media.currentSrc}}]});
f.extend(MediaElementPlayer.prototype,{buildcontextmenu:function(a){a.contextMenu=f('<div class="mejs-contextmenu"></div>').appendTo(f("body")).hide();a.container.bind("contextmenu",function(b){if(a.isContextMenuEnabled){b.preventDefault();a.renderContextMenu(b.clientX-1,b.clientY-1);return false}});a.container.bind("click",function(){a.contextMenu.hide()});a.contextMenu.bind("mouseleave",function(){a.startContextMenuTimer()})},cleancontextmenu:function(a){a.contextMenu.remove()},isContextMenuEnabled:true,
enableContextMenu:function(){this.isContextMenuEnabled=true},disableContextMenu:function(){this.isContextMenuEnabled=false},contextMenuTimeout:null,startContextMenuTimer:function(){var a=this;a.killContextMenuTimer();a.contextMenuTimer=setTimeout(function(){a.hideContextMenu();a.killContextMenuTimer()},750)},killContextMenuTimer:function(){var a=this.contextMenuTimer;if(a!=null){clearTimeout(a);delete a}},hideContextMenu:function(){this.contextMenu.hide()},renderContextMenu:function(a,b){for(var c=
this,d="",e=c.options.contextMenuItems,g=0,l=e.length;g<l;g++)if(e[g].isSeparator)d+='<div class="mejs-contextmenu-separator"></div>';else{var j=e[g].render(c);if(j!=null)d+='<div class="mejs-contextmenu-item" data-itemindex="'+g+'" id="element-'+Math.random()*1E6+'">'+j+"</div>"}c.contextMenu.empty().append(f(d)).css({top:b,left:a}).show();c.contextMenu.find(".mejs-contextmenu-item").each(function(){var k=f(this),s=parseInt(k.data("itemindex"),10),p=c.options.contextMenuItems[s];typeof p.show!="undefined"&&
p.show(k,c);k.click(function(){typeof p.click!="undefined"&&p.click(c);c.contextMenu.hide()})});setTimeout(function(){c.killControlsTimer("rev3")},100)}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{postrollCloseText:mejs.i18n.t("Close")});f.extend(MediaElementPlayer.prototype,{buildpostroll:function(a,b,c){var d=this.container.find('link[rel="postroll"]').attr("href");if(typeof d!=="undefined"){a.postroll=f('<div class="mejs-postroll-layer mejs-layer"><a class="mejs-postroll-close" onclick="$(this).parent().hide();return false;">'+this.options.postrollCloseText+'</a><div class="mejs-postroll-layer-content"></div></div>').prependTo(c).hide();this.media.addEventListener("ended",
function(){f.ajax({dataType:"html",url:d,success:function(e){c.find(".mejs-postroll-layer-content").html(e)}});a.postroll.show()},false)}}})})(mejs.$);

/*jslint browser: true, plusplus: true, unparam: true, indent: 2 */
/*global jQuery, console */
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    "use strict";
    return this.replace(/^\s+|\s+$/g, '');
  };
}
(function ($) {
  'use strict';
  var startAtTime = false,
    stopAtTime = false,
    // Keep all Players on site
    players = [],
    // Timecode as described in http://podlove.org/deep-link/
    // and http://www.w3.org/TR/media-frags/#fragment-dimensions
    timecodeRegExp = /(?:(\d+):)?(\d+):(\d+)(\.\d+)?([,\-](?:(\d+):)?(\d+):(\d+)(\.\d+)?)?/,
    ignoreHashChange = false,
    // all used functions
    zeroFill,
    generateTimecode,
    parseTimecode,
    checkCurrentURL,
    validateURL,
    setFragmentURL,
    updateChapterMarks,
    checkTime,
    addressCurrentTime,
    generateChapterTable,
    addBehavior,
    handleCookies;

  /**
   * return number as string lefthand filled with zeros
   * @param number number
   * @param width number
   * @return string
   **/
  zeroFill = function (number, width) {
    var s = number.toString();
    while (s.length < width) {
      s = "0" + s;
    }
    return s;
  };
  /**
   * accepts array with start and end time in seconds
   * returns timecode in deep-linking format
   * @param times array
   * @param forceHours bool (optional)
   * @return string
   **/
  $.generateTimecode = function (times, leadingZeros, forceHours) {
    function generatePart(time) {
      var part,
        hours,
        minutes,
        seconds,
        milliseconds;

      // prevent negative values from player
      if (!time || time <= 0) {
        return (leadingZeros || !time) ? (forceHours ? '00:00:00' : '00:00') : '--';
      }
      hours = Math.floor(time / 60 / 60);
      minutes = Math.floor(time / 60) % 60;
      seconds = Math.floor(time % 60) % 60;
      milliseconds = Math.floor(time % 1 * 1000);
      if (leadingZeros) {
        // required (minutes : seconds)
        part = zeroFill(minutes, 2) + ':' + zeroFill(seconds, 2);
        hours = zeroFill(hours, 2);
        hours = hours === '00' && !forceHours ? '' : hours + ':';        
      } else {
        part = hours ? zeroFill(minutes, 2) : minutes.toString();
        part += ':' + zeroFill(seconds, 2);
        hours = hours ? hours + ':' : '';
      }
      milliseconds = milliseconds ? '.' + zeroFill(milliseconds, 3) : '';
      return hours + part + milliseconds;
    }
    if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
      return generatePart(times[0]) + ',' + generatePart(times[1]);
    }
    return generatePart(times[0]);
  };
  generateTimecode = $.generateTimecode;
  /**
   * parses time code into seconds
   * @param string timecode
   * @return number
   **/
  parseTimecode = function (timecode) {
    var parts, startTime = 0,
      endTime = 0;
    if (timecode) {
      parts = timecode.match(timecodeRegExp);
      if (parts && parts.length === 10) {
        // hours
        startTime += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
        // minutes
        startTime += parseInt(parts[2], 10) * 60;
        // seconds
        startTime += parseInt(parts[3], 10);
        // milliseconds
        startTime += parts[4] ? parseFloat(parts[4]) : 0;
        // no negative time
        startTime = Math.max(startTime, 0);
        // if there only a startTime but no endTime
        if (parts[5] === undefined) {
          return [startTime, false];
        }
        // hours
        endTime += parts[6] ? parseInt(parts[6], 10) * 60 * 60 : 0;
        // minutes
        endTime += parseInt(parts[7], 10) * 60;
        // seconds
        endTime += parseInt(parts[8], 10);
        // milliseconds
        endTime += parts[9] ? parseFloat(parts[9]) : 0;
        // no negative time
        endTime = Math.max(endTime, 0);
        return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
      }
    }
    return false;
  };
  checkCurrentURL = function () {
    var deepLink;
    deepLink = parseTimecode(window.location.href);
    if (deepLink !== false) {
      startAtTime = deepLink[0];
      stopAtTime = deepLink[1];
    }
  };
  validateURL = function (url) {
    //de comment this to validate URLs, if you want use relative paths leave it so.
    //var urlregex = /(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    //url = url.match(urlregex);
    //return (url !== null) ? url[0] : url;
    return url.trim();
  };
  /**
   * add a string as hash in the adressbar
   * @param string fragment
   **/
  setFragmentURL = function (fragment) {
    window.location.hash = fragment;
  };
  /**
   * handle Cookies
   **/
  handleCookies = {
    getItem: function (sKey) {
      if (!sKey || !this.hasItem(sKey)) {
        return null;
      }
      return window.unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + window.escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/.test(sKey)) {
        return;
      }
      var sExpires = "";
      if (vEnd) {
        switch (typeof vEnd) {
        case "number":
          sExpires = "; max-age=" + vEnd;
          break;
        case "string":
          sExpires = "; expires=" + vEnd;
          break;
        case "object":
          if (vEnd.hasOwnProperty("toGMTString")) {
            sExpires = "; expires=" + vEnd.toGMTString();
          }
          break;
        }
      }
      document.cookie = window.escape(sKey) + "=" + window.escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    },
    removeItem: function (sKey) {
      if (!sKey || !this.hasItem(sKey)) {
        return;
      }
      var oExpDate = new Date();
      oExpDate.setDate(oExpDate.getDate() - 1);
      document.cookie = window.escape(sKey) + "=; expires=" + oExpDate.toGMTString() + "; path=/";
    },
    hasItem: function (sKey) {
      return (new RegExp("(?:^|;\\s*)" + window.escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
  };
  /**
   * update the chapter list when the data is loaded
   * @param object player
   * @param object marks
   **/
  updateChapterMarks = function (player, marks) {
    var coverimg = marks.closest('.podlovewebplayer_wrapper').find('.coverimg');
    marks.each(function () {
      var isBuffered, chapterimg = null,
        mark = $(this),
        startTime = mark.data('start'),
        endTime = mark.data('end'),
        isEnabled = mark.data('enabled'),
        isActive = player.currentTime > startTime - 0.3 && player.currentTime <= endTime;
      // prevent timing errors
      if (player.buffered.length > 0) {
        isBuffered = player.buffered.end(0) > startTime;
      }
      if (isActive) {
        chapterimg = validateURL(mark.data('img'));
        if ((chapterimg !== null) && (mark.hasClass('active'))) {
          if ((coverimg.attr('src') !== chapterimg) && (chapterimg.length > 5)) {
            coverimg.attr('src', chapterimg);
          }
        } else {
          if (coverimg.attr('src') !== coverimg.data('img')) {
            coverimg.attr('src', coverimg.data('img'));
          }
        }
        mark.addClass('active').siblings().removeClass('active');
      }
      if (!isEnabled && isBuffered) {
        $(mark).data('enabled', true).addClass('loaded').find('a[rel=player]').removeClass('disabled');
      }
    });
  };
  checkTime = function (e) {
    if (players.length > 1) {
      return;
    }
    var player = e.data.player;
    //Kinda hackish: Make sure that the timejump is at least 1 second (fix for OGG/Firefox)
    if (startAtTime !== false && (player.lastCheck === undefined || Math.abs(startAtTime - player.lastCheck) > 1)) {
      player.setCurrentTime(startAtTime);
      player.lastCheck = startAtTime;
      startAtTime = false;
    }
    if (stopAtTime !== false && player.currentTime >= stopAtTime) {
      player.pause();
      stopAtTime = false;
    }
  };
  addressCurrentTime = function (e) {
    var fragment;
    if (players.length === 1) {
      fragment = 't=' + generateTimecode([e.data.player.currentTime]);
      setFragmentURL(fragment);
    }
  };
  /**
   * Given a list of chapters, this function creates the chapter table for the player.
   */
  generateChapterTable = function (params) {
    var div, table, tbody, tempchapters, maxchapterstart, line, tc, chaptitle, next, chapterImages, rowDummy, i, scroll = '';
    if (params.chapterHeight !== "") {
      if (typeof parseInt(params.chapterHeight, 10) === 'number') {
        scroll = 'style="overflow-y: auto; max-height: ' + parseInt(params.chapterHeight, 10) + 'px;"';
      }
    }
    div = $('<div class="podlovewebplayer_chapterbox showonplay" ' + scroll + '><table><caption>Podcast Chapters</caption><thead><tr><th scope="col">Chapter Number</th><th scope="col">Start time</th><th scope="col">Title</th><th scope="col">Duration</th></tr></thead><tbody></tbody></table></div>');
    table = div.children('table');
    tbody = table.children('tbody');
    if ((params.chaptersVisible === 'true') || (params.chaptersVisible === true)) {
      div.addClass('active');
    }
    table.addClass('podlovewebplayer_chapters');
    if (params.chapterlinks !== 'false') {
      table.addClass('linked linked_' + params.chapterlinks);
    }
    //prepare row data
    tempchapters = params.chapters;
    maxchapterstart = 0;
    //first round: kill empty rows and build structured object
    if (typeof params.chapters === 'string') {
      tempchapters = [];
      $.each(params.chapters.split("\n"), function (i, chapter) {
        //exit early if this line contains nothing but whitespace
        if (!/\S/.test(chapter)) {
          return;
        }
        //extract the timestamp
        line = $.trim(chapter);
        tc = parseTimecode(line.substring(0, line.indexOf(' ')));
        chaptitle = $.trim(line.substring(line.indexOf(' ')));
        tempchapters.push({
          start: tc[0],
          code: chaptitle
        });
      });
    } else {
      // assume array of objects
      $.each(tempchapters, function (key, value) {
        value.code = value.title;
        if (typeof value.start === 'string') {
          value.start = parseTimecode(value.start)[0];
        }
      });
    }
    // order is not guaranteed: http://podlove.org/simple-chapters/
    tempchapters = tempchapters.sort(function (a, b) {
      return a.start - b.start;
    });
    //second round: collect more information
    maxchapterstart = Math.max.apply(Math,
      $.map(tempchapters, function (value, i) {
        next = tempchapters[i + 1];
        // we use `this.end` to quickly calculate the duration in the next round
        if (next) {
          value.end = next.start;
        }
        // we need this data for proper formatting
        return value.start;
      }));
    //this is a "template" for each chapter row
    chapterImages = false;
    for (i = 0; i < tempchapters.length; i++) {
      if ((tempchapters[i].image !== "") && (tempchapters[i].image !== undefined)) {
        chapterImages = true;
      }
    }
    if (chapterImages) {
      rowDummy = $('<tr class="chaptertr" data-start="" data-end="" data-img=""><td class="starttime"><span></span></td><td class="chapterimage"></td><td class="chaptername"></td><td class="timecode">\n<span></span>\n</td>\n</tr>');
    } else {
      rowDummy = $('<tr class="chaptertr" data-start="" data-end="" data-img=""><td class="starttime"><span></span></td><td class="chaptername"></td><td class="timecode">\n<span></span>\n</td>\n</tr>');
    }
    //third round: build actual dom table
    $.each(tempchapters, function (i) {
      var finalchapter = !tempchapters[i + 1],
        duration = Math.round(this.end - this.start),
        forceHours,
        row = rowDummy.clone();
      //make sure the duration for all chapters are equally formatted
      if (!finalchapter) {
        this.duration = generateTimecode([duration], false);
      } else {
        if (params.duration === 0) {
          this.end = 9999999999;
          this.duration = '…';
        } else {
          this.end = params.duration;
          this.duration = generateTimecode([Math.round(this.end - this.start)], false);
        }
      }
      if (i % 2) {
        row.addClass('oddchapter');
      }
      //deeplink, start and end
      row.attr({
        'data-start': this.start,
        'data-end': this.end,
        'data-img': (this.image !== undefined) ? this.image : ''
      });
      //if there is a chapter that starts after an hour, force '00:' on all previous chapters
      forceHours = (maxchapterstart >= 3600);
      //insert the chapter data
      row.find('.starttime > span').text(generateTimecode([Math.round(this.start)], true, forceHours));
      if (this.href !== undefined) {
        if (this.href !== "") {
          row.find('.chaptername').html('<span>' + this.code + '</span>' + ' <a href="' + this.href + '"></a>');
        } else {
          row.find('.chaptername').html('<span>' + this.code + '</span>');
        }
      } else {
        row.find('.chaptername').html('<span>' + this.code + '</span>');
      }
      row.find('.timecode > span').html('<span>' + this.duration + '</span>');
      if (chapterImages) {
        if (this.image !== undefined) {
          if (this.image !== "") {
            row.find('.chapterimage').html('<img src="' + this.image + '"/>');
          }
        }
      }
      row.appendTo(tbody);
    });
    return div;
  };
  /**
   * add chapter behavior and deeplinking: skip to referenced
   * time position & write current time into address
   * @param player object
   */
  addBehavior = function (player, params, wrapper) {
    var jqPlayer = $(player),
      layoutedPlayer = jqPlayer,
      canplay = false,
      metainfo,
      summary,
      podlovewebplayer_timecontrol,
      podlovewebplayer_sharebuttons,
      podlovewebplayer_downloadbuttons,
      chapterdiv,
      list,
      marks;
    // expose the player interface
    wrapper.data('podlovewebplayer', {
      player: jqPlayer
    });
    // This might be a fix to some Firefox AAC issues.
    jqPlayer.on('error', function () {
      if ($(this).attr('src')) {
        $(this).removeAttr('src');
      } else if($(this).children('source').length) {
        $(this).children('source').first().remove();
      }
    });
    /**
     * The `player` is an interface. It provides the play and pause functionality. The
     * `layoutedPlayer` on the other hand is a DOM element. In native mode, these two
     * are one and the same object. In Flash though the interface is a plain JS object.
     */
    if (players.length === 1) {
      // check if deeplink is set
      checkCurrentURL();
    }
    // get things straight for flash fallback
    if (player.pluginType === 'flash') {
      layoutedPlayer = $('#mep_' + player.id.substring(9));
      console.log(layoutedPlayer);
    }
    // cache some jQ objects
    metainfo = wrapper.find('.podlovewebplayer_meta');
    summary = wrapper.find('.summary');
    podlovewebplayer_timecontrol = wrapper.find('.podlovewebplayer_timecontrol');
    podlovewebplayer_sharebuttons = wrapper.find('.podlovewebplayer_sharebuttons');
    podlovewebplayer_downloadbuttons = wrapper.find('.podlovewebplayer_downloadbuttons');
    chapterdiv = wrapper.find('.podlovewebplayer_chapterbox');
    list = wrapper.find('table');
    marks = list.find('tr');
    // fix height of summary for better toggability
    summary.each(function () {
      $(this).data('height', $(this).height() + 10);
      if (!$(this).hasClass('active')) {
        $(this).height('0px');
      } else {
        $(this).height($(this).find('div.summarydiv').height() + 10 + 'px');
      }
    });
    chapterdiv.each(function () {
      $(this).data('height', $(this).find('.podlovewebplayer_chapters').height());
      if (!$(this).hasClass('active')) {
        $(this).height('0px');
      } else {
        $(this).height($(this).find('.podlovewebplayer_chapters').height() + 'px');
      }
    });
    if (metainfo.length === 1) {
      metainfo.find('a.infowindow').click(function () {
        summary.toggleClass('active');
        if (summary.hasClass('active')) {
          summary.height(summary.find('div.summarydiv').height() + 10 + 60 + 'px');
        } else {
          summary.css('height', '0px');
        }
        return false;
      });
      metainfo.find('a.showcontrols').on('click', function () {
        podlovewebplayer_timecontrol.toggleClass('active');
        if (podlovewebplayer_sharebuttons !== undefined) {
          if (podlovewebplayer_sharebuttons.hasClass('active')) {
            podlovewebplayer_sharebuttons.removeClass('active');
          } else if (podlovewebplayer_downloadbuttons.hasClass('active')) {
            podlovewebplayer_downloadbuttons.removeClass('active');
          }
        }
        return false;
      });
      metainfo.find('a.showsharebuttons').on('click', function () {
        podlovewebplayer_sharebuttons.toggleClass('active');
        if (podlovewebplayer_timecontrol.hasClass('active')) {
          podlovewebplayer_timecontrol.removeClass('active');
        } else if (podlovewebplayer_downloadbuttons.hasClass('active')) {
          podlovewebplayer_downloadbuttons.removeClass('active');
        }
        return false;
      });
      metainfo.find('a.showdownloadbuttons').on('click', function () {
        podlovewebplayer_downloadbuttons.toggleClass('active');
        if (podlovewebplayer_timecontrol.hasClass('active')) {
          podlovewebplayer_timecontrol.removeClass('active');
        } else if (podlovewebplayer_sharebuttons.hasClass('active')) {
          podlovewebplayer_sharebuttons.removeClass('active');
        }
        return false;
      });
      metainfo.find('.bigplay').on('click', function () {
        if ($(this).hasClass('bigplay')) {
          var playButton = $(this).parent().find('.bigplay');
          if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
            if (player.paused) {
              playButton.addClass('playing');
              player.play();
            } else {
              playButton.removeClass('playing');
              player.pause();
            }
          } else {
            if (!playButton.hasClass('playing')) {
              playButton.addClass('playing');
              $(this).parent().parent().find('.mejs-time-buffering').show();
            }
            // flash fallback needs additional pause
            if (player.pluginType === 'flash') {
              player.pause();
            }
            player.play();
          }
        }
        return false;
      });
      wrapper.find('.chaptertoggle').unbind('click').click(function () {
        wrapper.find('.podlovewebplayer_chapterbox').toggleClass('active');
        if (wrapper.find('.podlovewebplayer_chapterbox').hasClass('active')) {
          wrapper.find('.podlovewebplayer_chapterbox').height(parseInt(wrapper.find('.podlovewebplayer_chapterbox').data('height'), 10) + 2 + 'px');
        } else {
          wrapper.find('.podlovewebplayer_chapterbox').height('0px');
        }
        return false;
      });
      wrapper.find('.prevbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          if (player.currentTime > chapterdiv.find('.active').data('start') + 10) {
            player.setCurrentTime(chapterdiv.find('.active').data('start'));
          } else {
            player.setCurrentTime(chapterdiv.find('.active').prev().data('start'));
          }
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.nextbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          player.setCurrentTime(chapterdiv.find('.active').next().data('start'));
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.rewindbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          player.setCurrentTime(player.currentTime - 30);
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.forwardbutton').click(function () {
        if ((typeof player.currentTime === 'number') && (player.currentTime > 0)) {
          player.setCurrentTime(player.currentTime + 30);
        } else {
          player.play();
        }
        return false;
      });
      wrapper.find('.currentbutton').click(function () {
        window.prompt('This URL directly points to this episode', $(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href'));
        return false;
      });
      wrapper.find('.tweetbutton').click(function () {
        window.open('https://twitter.com/share?text=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&url=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'tweet it', 'width=550,height=420,resizable=yes');
        return false;
      });
      wrapper.find('.fbsharebutton').click(function () {
        window.open('http://www.facebook.com/share.php?t=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&u=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'share it', 'width=550,height=340,resizable=yes');
        return false;
      });
      wrapper.find('.gplusbutton').click(function () {
        window.open('https://plus.google.com/share?title=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&url=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'plus it', 'width=550,height=420,resizable=yes');
        return false;
      });
      wrapper.find('.adnbutton').click(function () {
        window.open('https://alpha.app.net/intent/post?text=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '%20' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')), 'plus it', 'width=550,height=420,resizable=yes');
        return false;
      });
      wrapper.find('.mailbutton').click(function () {
        window.location = 'mailto:?subject=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '&body=' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').text()) + '%20%3C' + encodeURIComponent($(this).closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href')) + '%3E';
        return false;
      });
      wrapper.find('.fileselect').change(function () {
        var dlurl, dlname;
        $(this).parent().find(".fileselect option:selected").each(function () {
          dlurl = $(this).data('dlurl');
        });
        $(this).parent().find(".downloadbutton").each(function () {
          dlname = dlurl.split('/');
          dlname = dlname[dlname.length - 1];
          $(this).attr('href', dlurl);
          $(this).attr('download', dlname);
        });
        return false;
      });
      wrapper.find('.openfilebutton').click(function () {
        $(this).parent().find(".fileselect option:selected").each(function () {
          window.open($(this).data('url'), 'Podlove Popup', 'width=550,height=420,resizable=yes');
        });
        return false;
      });
      wrapper.find('.fileinfobutton').click(function () {
        $(this).parent().find(".fileselect option:selected").each(function () {
          window.prompt('file URL:', $(this).val());
        });
        return false;
      });
    }
    // chapters list
    list
      .show()
      .delegate('.chaptertr', 'click', function (e) {
        if ($(this).closest('table').hasClass('linked_all') || $(this).closest('tr').hasClass('loaded')) {
          e.preventDefault();
          var mark = $(this).closest('tr'),
            startTime = mark.data('start');
          //endTime = mark.data('end');
          // If there is only one player also set deepLink
          if (players.length === 1) {
            // setFragmentURL('t=' + generateTimecode([startTime, endTime]));
            setFragmentURL('t=' + generateTimecode([startTime]));
          } else {
            if (canplay) {
              // Basic Chapter Mark function (without deeplinking)
              player.setCurrentTime(startTime);
            } else {
              jqPlayer.one('canplay', function () {
                player.setCurrentTime(startTime);
              });
            }
          }
          // flash fallback needs additional pause
          if (player.pluginType === 'flash') {
            player.pause();
          }
          player.play();
        }
        return false;
      });
    list
      .show()
      .delegate('.chaptertr a', 'click', function (e) {
        if ($(this).closest('table').hasClass('linked_all') || $(this).closest('td').hasClass('loaded')) {
          e.preventDefault();
          window.open($(this)[0].href, '_blank');
        }
        return false;
      });
    // wait for the player or you'll get DOM EXCEPTIONS
    // And just listen once because of a special behaviour in firefox
    // --> https://bugzilla.mozilla.org/show_bug.cgi?id=664842
    jqPlayer.one('canplay', function () {
      canplay = true;
      // add duration of final chapter
      if (player.duration) {
        marks.find('.timecode code').eq(-1).each(function () {
          var start, end;
          start = Math.floor($(this).closest('tr').data('start'));
          end = Math.floor(player.duration);
          $(this).text(generateTimecode([end - start]));
        });
      }
      // add Deeplink Behavior if there is only one player on the site
      if (players.length === 1) {
        jqPlayer.bind('play timeupdate', {
          player: player
        }, checkTime)
          .bind('pause', {
            player: player
          }, addressCurrentTime);
        // disabled 'cause it overrides chapter clicks
        // bind seeked to addressCurrentTime
        checkCurrentURL();
        // handle browser history navigation
        jQuery(window).bind('hashchange onpopstate', function (e) {
          if (!ignoreHashChange) {
            checkCurrentURL();
          }
          ignoreHashChange = false;
        });
      }
    });
    // always update Chaptermarks though
    jqPlayer
      .on('timeupdate', function () {
        updateChapterMarks(player, marks);
      })
      // update play/pause status
      .on('play playing', function () {
        if (!player.persistingTimer) {
          player.persistingTimer = window.setInterval(function () {
            if (players.length === 1) {
              ignoreHashChange = true;
              window.location.replace('#t=' + generateTimecode([player.currentTime, false]));
            }
            handleCookies.setItem('podloveWebPlayerTime-' + params.permalink, player.currentTime);
          }, 5000);
        }
        list.find('.paused').removeClass('paused');
        if (metainfo.length === 1) {
          metainfo.find('.bigplay').addClass('playing');
        }
      })
      .on('pause', function () {
        window.clearInterval(player.persistingTimer);
        player.persistingTimer = null;
        if (metainfo.length === 1) {
          metainfo.find('.bigplay').removeClass('playing');
        }
      });
  };
  $.fn.podlovewebplayer = function (options) {
    // MEJS options default values
    var mejsoptions = {
      defaultVideoWidth: 480,
      defaultVideoHeight: 270,
      videoWidth: -1,
      videoHeight: -1,
      audioWidth: -1,
      audioHeight: 30,
      startVolume: 0.8,
      loop: false,
      enableAutosize: true,
      features: ['playpause', 'current', 'progress', 'duration', 'tracks', 'volume', 'fullscreen'],
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
      pluginPath: './static/',
      flashName: 'flashmediaelement.swf',
      silverlightName: 'silverlightmediaelement.xap'
    },
      // Additional parameters default values
      params = $.extend({}, {
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
      }, options);
    // turn each player in the current set into a Podlove Web Player
    return this.each(function (index, player) {
      var richplayer = false,
        haschapters = false,
        hiddenTab = false,
        i = 0,
        secArray,
        orig,
        deepLink,
        wrapper,
        summaryActive,
        timecontrolsActive,
        sharebuttonsActive,
        downloadbuttonsActive,
        size,
        name,
        downloadname,
        selectform,
        storageKey;
      //fine tuning params
      if (params.width.toLowerCase() === 'auto') {
        params.width = '100%';
      } else {
        params.width = params.width.replace('px', '');
      }
      //audio params
      if (player.tagName === 'AUDIO') {
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
        //video params
      } else if (player.tagName === 'VIDEO') {
        if (params.height !== undefined) {
          mejsoptions.videoWidth = params.width;
          mejsoptions.videoHeight = params.height;
        }
        if ($(player).attr('width') !== undefined) {
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
        if (params[key] !== undefined) {
          mejsoptions[key] = params[key];
        }
      });
      //wrapper and init stuff
      if (params.width.toString().trim() === parseInt(params.width, 10).toString().trim()) {
        params.width = params.width.toString().trim() + 'px';
      }
      orig = player;
      player = $(player).clone().wrap('<div class="podlovewebplayer_wrapper" style="width: ' + params.width + '"></div>')[0];
      wrapper = $(player).parent();
      players.push(player);
      //add params from html fallback area and remove them from the DOM-tree
      $(player).find('[data-pwp]').each(function () {
        params[$(this).data('pwp')] = $(this).html();
        $(this).remove();
      });
      //add params from audio and video elements
      $(player).find('source').each(function () {
        if (params.sources !== undefined) {
          params.sources.push($(this).attr('src'));
        } else {
          params.sources[0] = $(this).attr('src');
        }
      });
      //build rich player with meta data
      if (params.chapters !== undefined || params.title !== undefined || params.subtitle !== undefined || params.summary !== undefined || params.poster !== undefined || $(player).attr('poster') !== undefined) {
        //set status variable
        richplayer = true;
        wrapper.addClass('podlovewebplayer_' + player.tagName.toLowerCase());
        if (player.tagName === "AUDIO") {
          //kill play/pause button from miniplayer
          $.each(mejsoptions.features, function (i) {
            if (this === 'playpause') {
              mejsoptions.features.splice(i, 1);
            }
          });
          wrapper.prepend('<div class="podlovewebplayer_meta"></div>');
          wrapper.find('.podlovewebplayer_meta').prepend('<a class="bigplay" title="Play Episode" href="#"></a>');
          if (params.poster !== undefined) {
            wrapper.find('.podlovewebplayer_meta').append('<div class="coverart"><img class="coverimg" src="' + params.poster + '" data-img="' + params.poster + '" alt=""></div>');
          }
          if ($(player).attr('poster') !== undefined) {
            wrapper.find('.podlovewebplayer_meta').append('<div class="coverart"><img src="' + $(player).attr('poster') + '" alt=""></div>');
          }
        }
        if (player.tagName === "VIDEO") {
          wrapper.prepend('<div class="podlovewebplayer_top"></div>');
          wrapper.append('<div class="podlovewebplayer_meta"></div>');
        }
        if (params.title !== undefined) {
          if (params.permalink !== undefined) {
            wrapper.find('.podlovewebplayer_meta').append('<h3 class="episodetitle"><a href="' + params.permalink + '">' + params.title + '</a></h3>');
          } else {
            wrapper.find('.podlovewebplayer_meta').append('<h3 class="episodetitle">' + params.title + '</h3>');
          }
        }
        if (params.subtitle !== undefined) {
          wrapper.find('.podlovewebplayer_meta').append('<div class="subtitle">' + params.subtitle + '</div>');
        } else {
          if (params.title !== undefined) {
            if ((params.title.length < 42) && (params.poster === undefined)) {
              wrapper.addClass('podlovewebplayer_smallplayer');
            }
          }
          wrapper.find('.podlovewebplayer_meta').append('<div class="subtitle"></div>');
        }
        //always render toggler buttons wrapper
        wrapper.find('.podlovewebplayer_meta').append('<div class="togglers"></div>');
        wrapper.on('playerresize', function () {
          wrapper.find('.podlovewebplayer_chapterbox').data('height', wrapper.find('.podlovewebplayer_chapters').height());
          if (wrapper.find('.podlovewebplayer_chapterbox').hasClass('active')) {
            wrapper.find('.podlovewebplayer_chapterbox').height(parseInt(wrapper.find('.podlovewebplayer_chapterbox').data('height'), 10) + 2 + 'px');
          }
          wrapper.find('.summary').data('height', wrapper.find('.summarydiv').height());
          if (wrapper.find('.summary').hasClass('active')) {
            wrapper.find('.summary').height(wrapper.find('.summarydiv').height() + 'px');
          }
        });
        if (params.summary !== undefined) {
          summaryActive = "";
          if (params.summaryVisible === true) {
            summaryActive = " active";
          }
          wrapper.find('.togglers').append('<a href="#" class="infowindow infobuttons pwp-icon-info-circle" title="More information about this"></a>');
          wrapper.find('.podlovewebplayer_meta').after('<div class="summary' + summaryActive + '"><div class="summarydiv">' + params.summary + '</div></div>');
        }
        if (params.chapters !== undefined) {
          if (((params.chapters.length > 10) && (typeof params.chapters === 'string')) || ((params.chapters.length > 1) && (typeof params.chapters === 'object'))) {
            wrapper.find('.togglers').append('<a href="#" class="chaptertoggle infobuttons pwp-icon-list-bullet" title="Show/hide chapters"></a>');
          }
        }
        if (params.hidetimebutton !== true) {
          wrapper.find('.togglers').append('<a href="#" class="showcontrols infobuttons pwp-icon-clock" title="Show/hide time navigation controls"></a>');
        }
      }
      timecontrolsActive = "";
      if (params.timecontrolsVisible === true) {
        timecontrolsActive = " active";
      }
      sharebuttonsActive = "";
      if (params.sharebuttonsVisible === true) {
        sharebuttonsActive = " active";
      }
      downloadbuttonsActive = "";
      if (params.downloadbuttonsVisible === true) {
        downloadbuttonsActive = " active";
      }
      wrapper.append('<div class="podlovewebplayer_timecontrol podlovewebplayer_controlbox' + timecontrolsActive + '"></div>');
      if (params.chapters !== undefined) {
        if (params.chapters.length > 10) {
          wrapper.find('.podlovewebplayer_timecontrol').append('<a href="#" class="prevbutton infobuttons pwp-icon-to-start" title="Jump backward to previous chapter"></a><a href="#" class="nextbutton infobuttons pwp-icon-to-end" title="next chapter"></a>');
          wrapper.find('.controlbox').append('<a href="#" class="prevbutton infobuttons pwp-icon-step-backward" title="previous chapter"></a><a href="#" class="nextbutton infobuttons pwp-icon-to-end" title="Jump to next chapter"></a>');
        }
      }
      wrapper.find('.podlovewebplayer_timecontrol').append('<a href="#" class="rewindbutton infobuttons pwp-icon-fast-bw" title="Rewind 30 seconds"></a>');
      wrapper.find('.podlovewebplayer_timecontrol').append('<a href="#" class="forwardbutton infobuttons pwp-icon-fast-fw" title="Fast forward 30 seconds"></a>');

      if ((wrapper.closest('.podlovewebplayer_wrapper').find('.episodetitle a').attr('href') !== undefined) && (params.hidesharebutton !== true)) {
        wrapper.append('<div class="podlovewebplayer_sharebuttons podlovewebplayer_controlbox' + sharebuttonsActive + '"></div>');
        wrapper.find('.togglers').append('<a href="#" class="showsharebuttons infobuttons pwp-icon-export" title="Show/hide sharing controls"></a>');
        wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" class="currentbutton infobuttons pwp-icon-link" title="Get URL for this"></a>');
        wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="tweetbutton infobuttons pwp-icon-twitter" title="Share this on Twitter"></a>');
        wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="fbsharebutton infobuttons pwp-icon-facebook" title="Share this on Facebook"></a>');
        wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="gplusbutton infobuttons pwp-icon-gplus" title="Share this on Google+"></a>');
        wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="adnbutton infobuttons pwp-icon-appnet" title="Share this on App.net"></a>');
        wrapper.find('.podlovewebplayer_sharebuttons').append('<a href="#" target="_blank" class="mailbutton infobuttons pwp-icon-mail" title="Share this via e-mail"></a>');
      }
      if (((params.downloads !== undefined) || (params.sources !== undefined)) && (params.hidedownloadbutton !== true)) {
        selectform = '<select name="downloads" class="fileselect" size="1" onchange="this.value=this.options[this.selectedIndex].value;">';
        wrapper.append('<div class="podlovewebplayer_downloadbuttons podlovewebplayer_controlbox' + downloadbuttonsActive + '"></div>');
        wrapper.find('.togglers').append('<a href="#" class="showdownloadbuttons infobuttons pwp-icon-download" title="Show/hide download bar"></a>');
        if (params.downloads !== undefined) {
          for (i = 0; i < params.downloads.length; i += 1) {
            size = (parseInt(params.downloads[i].size, 10) < 1048704) ? Math.round(parseInt(params.downloads[i].size, 10) / 100) / 10 + 'kB' : Math.round(parseInt(params.downloads[i].size, 10) / 1000 / 100) / 10 + 'MB';
            selectform += '<option value="' + params.downloads[i].url + '" data-url="' + params.downloads[i].url + '" data-dlurl="' + params.downloads[i].dlurl + '">' + params.downloads[i].name + ' (' + size + ')</option>';
          }
        } else {
          for (i = 0; i < params.sources.length; i += 1) {
            name = params.sources[i].split('.');
            name = name[name.length - 1];
            selectform += '<option value="' + params.sources[i] + '" data-url="' + params.sources[i] + '" data-dlurl="' + params.sources[i] + '">' + name + '</option>';
          }
        }
        selectform += '</select>';
        wrapper.find('.podlovewebplayer_downloadbuttons').append(selectform);
        if (params.downloads !== undefined && params.downloads.length > 0) {
          downloadname = params.downloads[0].url.split('/');
          downloadname = downloadname[downloadname.length - 1];
          wrapper.find('.podlovewebplayer_downloadbuttons').append('<a href="' + params.downloads[0].url + '" download="' + downloadname + '" class="downloadbutton infobuttons pwp-icon-download" title="Download"></a> ');
        }
        wrapper.find('.podlovewebplayer_downloadbuttons').append('<a href="#" class="openfilebutton infobuttons pwp-icon-link-ext" title="Open"></a> ');
        wrapper.find('.podlovewebplayer_downloadbuttons').append('<a href="#" class="fileinfobutton infobuttons pwp-icon-info-circle" title="Info"></a> ');
      }
      //build chapter table
      if (params.chapters !== undefined) {
        if (((params.chapters.length > 10) && (typeof params.chapters === 'string')) || ((params.chapters.length > 1) && (typeof params.chapters === 'object'))) {
          haschapters = true;
          generateChapterTable(params).appendTo(wrapper);
        }
      }
      if (richplayer || haschapters) {
        wrapper.append('<div class="podlovewebplayer_tableend"></div>');
      }
      // parse deeplink
      deepLink = parseTimecode(window.location.href);
      if (deepLink !== false && players.length === 1) {
        if (document.hidden !== undefined) {
          hiddenTab = document.hidden;
        } else if (document.mozHidden !== undefined) {
          hiddenTab = document.mozHidden;
        } else if (document.msHidden !== undefined) {
          hiddenTab = document.msHidden;
        } else if (document.webkitHidden !== undefined) {
          hiddenTab = document.webkitHidden;
        }
        if (hiddenTab === true) {
          $(player).attr({
            preload: 'auto'
          });
        } else {
          $(player).attr({
            preload: 'auto',
            autoplay: 'autoplay'
          });
        }
        startAtTime = deepLink[0];
        stopAtTime = deepLink[1];
      } else if (params && params.permalink) {
        storageKey = 'podloveWebPlayerTime-' + params.permalink;
        if (handleCookies.getItem(storageKey)) {
          $(player).one('canplay', function () {
            this.currentTime = handleCookies.getItem(storageKey);
          });
        }
      }
      $(player).on('ended', function () {
        handleCookies.setItem('podloveWebPlayerTime-' + params.permalink, '', new Date(2000, 1, 1));
      });
      // init MEJS to player
      mejsoptions.success = function (player) {
        addBehavior(player, params, wrapper);
        if (deepLink !== false && players.length === 1) {
          $('html, body').delay(150).animate({
            scrollTop: $('.podlovewebplayer_wrapper:first').offset().top - 25
          });
        }
      };
      $(orig).replaceWith(wrapper);
      $(player).mediaelementplayer(mejsoptions);
    });
  };
}(jQuery));