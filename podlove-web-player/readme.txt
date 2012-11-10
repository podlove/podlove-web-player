=== Plugin Name ===
Contributors: gerritvanaaken
Donate link: http://podlove.org/
Tags: podcasting, podlove, html5audio, audio, video, podcast, player
Requires at least: 3.4.0
Tested up to: 3.4.1
Stable tag: 1.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

HTML5 based audio/video player, focused on podcasts and similar media blogs. It supports chapters, deeplinks, captions and even more.

== Description ==

**Please note: As of version 1.1, the usage of [audio] and [video] is deprecated. Please use [podloveaudio] or [podlovevideo] instead.**

Use a simple shortcode in your posts and pages, and the Podlove Web Player will appear, playing any media file you want to assign. It tries to use native HTML5 browser playback, but will smoothly fall back to Flash if necessary.

(This is part of the “Podlove” initiative for a better podcasting experience. See <a href="http://podlove.org">podlove.org</a> for more information.)
	
### Typical Usage for audio

	[podloveaudio src="http://mysite.com/mymedia.mp3"]	

### With multiple source formats

    [podloveaudio mp3="http://mysite.com/mymedia.mp3" ogg="http://mysite.com/mymedia.oga"] 

### Typical Usage for video

    [podlovevideo src="http://mysite.com/mymedia.mp4" width="640" height="360"]

### Typical Usage width chapters

Use a WordPress-native custom field with the name "my-chapter-field" and fill it with something like this:

00:00:00.000 Introduction  
00:00:57.099 First chapter title  
00:10:03.104 Second chapter title  
00:12:44.625 Final chapter
    
    [podloveaudio src="http://mysite.com/mymedia.mp3" chapters="my-chapter-field"]

### Credits

The Podlove Web Player is built upon the MediaElement.js library. Check out <a href="http://mediaelementjs.com/">mediaElementjs.com</a> for more information on that.

The plugin architecture was originally forked from the <a href="http://wordpress.org/extend/plugins/videojs-html5-video-player-for-wordpress/">Video.js plugin</a>, but heavily adopted since then.

== Installation ==

1. Upload the `podlove-web-player` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the `Plugins` menu in WordPress
3. Use the `[podlovevideo]` or `[podloveaudio]` shortcode in your post or page with the options on the front page.
4. Visit the options page

== Frequently Asked Questions ==

### How can I configure the player’s appearance?

Just use the shortcode options that are described on this FAQ page!

= src =

This location of any audio or video file, local ore remote:
    
    [podloveaudio src="http://mysite.com/mymedia.mp3"]
    
You can even leave off the extention and the player will look for all media files matching the filename (mymedia.mp4, mymedia.webm, etc.)  

	[podlovevideo src="http://mysite.com/mymedia"]
    
= type =

The media type of the resource:
    
    [podlovevideo src="http://mysite.com/mymedia?xyz" type="video/mp4"]    

= mp4 = 

The location of an h.264/MP4 source for the video:
    
    [podlovevideo mp4="http://mysite.com/mymedia.mp4"]
    
= mp3 =

The location of an MP3 file for video:
    
    [podloveaudio mp3="http://mysite.com/mymedia.mp3"]    

= ogg =

The location of a Ogg/Theora or a Ogg/Vorbis source:

    [podlovevideo ogg="http://mysite.com/mymedia.ogv"]
    [podloveaudio ogg="http://mysite.com/mymedia.oga"]

= opus =

The location of an Opus sound file:

    [podloveaudio opus="http://mysite.com/mymedia.opus"]

= webm =

The location of a VP8/WebM source for the video:

    [podlovevideo webm="http://mysite.com/mymedia.webm"]

= poster = 

The location of the poster frame for the video:

    [podlovevideo poster="http://mysite.com/mymedia.png"]

= width = 

The width of the video (or the audio player):

    [podlovevideo width="640"]

= height =

The height of the video:

    [podlovevideo height="264"]
    
= loop =

Loops the video or audio when it ends:
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" loop="true"]    

= preload =

Start loading the video as soon as possible, before the user clicks play. This might not work on all browsers.

    [podloveaudio preload="true"]

= autoplay = 

Start playing the video as soon as it's ready. This might not work on all (mobile) devices.

    [podlovevideo autoplay="true"]

= fullscreen =

Disables the fullscreen button for video:
    
    [podlovevideo fullscreen="false"]
    
= duration =

Disables the duration output:
    
    [podlovevideo duration="false"]   
    
= volume = 

Disables the volume slider:
    
    [podloveaudio volume="false"]    
    
= progress =

Disables the progress bar:
    
    [podlovevideo progress="false"] 
    
= captions = 

URL to a WebSRT captions file:
    
    [podlovevideo captions="http://mysite.com/mymedia.srt"]  

= chapters = 

Takes chapter string from the defined custom field (the standard WordPress ones) and builds an interactive chapter table. Can be referenced to an external text file, too. Chapters must be written in the following format:

00:00:00.000 Introduction  
00:00:57.099 First chapter title  
00:10:03.104 Second chapter title  
00:12:44.625 Final chapter  
    
    [podloveaudio chapters="my_chapter_field"]                
    [podloveaudio chapters="http://mychapters.com/chapters.txt"]                


= chapterlinks = 

Option for the jumplink behaviour in chapter table

    [podloveaudio chapterlinks="all"] (default, all chapter links are clickable)
    [podloveaudio chapterlinks="buffered"] (only buffered chapters are clickable)
    [podloveaudio chapterlinks="false"] (chapters are not linked)

= All attributes video example =

All options enabled:

    [podlovevideo mp4="http://mysite.com/mymedia.mp4" ogg="http://mysite.com/mymedia.ogg" webm="http://mysite.com/mymedia.webm" poster="http://mysite.com/mymedia.png" preload="true" autoplay="true" width="640" height="264"]

= All attributes audio exmaple =

All options enabled:

    [podloveaudio mp3="http://mysite.com/mymedia.mp3" ogg="http://mysite.com/mymedia.ogg" preload="true" autoplay="true"]

### Deprecated usage

Earlier versions of this plugin could handle alternative shortcodes, too: [audio] and [video]. As of version 1.1, these are deprecated as they conflict with other plugins.

== Screenshots ==

1. Podlove Web Player in full swing, using the chapters table to jump to different section of the audio source.

== Changelog ==

= 1.2 =
* prevents activation conflicts with other instances of the plugin

= 1.1.1 =
* small bugfixes and improvements

= 1.1 =
* First proper release.
* [audio] and [video] are deprecated: Use [podloveaudio] and [podlovevideo] instead!
* Implements W3C Media Fragements with start and end time

= 1.0 =
* First version on wordpress.org. 
* Full of bugs.