=== Plugin Name ===
Contributors: gerritvanaaken
Donate link: http://podlove.org/
Tags: podcasting, podlove, html5audio, audio, video, podcast, player
Requires at least: 3.4.0
Tested up to: 3.4.1
Stable tag: 1.0.9
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Video and audio plugin for WordPress built on the MediaElement.js HTML5 media player library. Check out mediaelementjs.com for more information.

== Description ==

WARNING: THIS IS FULL OF BUGS YET!

Video and audio plugin for WordPress built on the MediaElement.js HTML5 media player library.
Check out <a href="http://mediaelementjs.com/">mediaElementjs.com</a> for more information on that.

This plugin is a fork of the original MediaElement.js plugin, especially enhanced for podcasting purposes.

### Typical Usage for video

	[video src="http://mysite.com/mymedia.mp4" width="640" height="360"]
	
### Typical Usage for audio

	[audio src="http://mysite.com/mymedia.mp3"]	

### Typical Usage for chapters

Use a WordPress-native custom field with the name "my-chapter-field" and fill it with something like this:

00:00:00.000 Introduction  
00:00:57.099 First chapter title  
00:10:03.104 Second chapter title  
00:12:44.625 Final chapter
    
    [audio src="http://mysite.com/mymedia.mp3" chapters="my-chapter-field"]


== Installation ==

1. Upload the `podlove-web-player` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the `Plugins` menu in WordPress
3. Use the `[video]` or `[audio]` shortcode in your post or page with the options on the front page.

== Frequently Asked Questions ==

Shortcode Options

= src
This location of any audio or video file
    
    [video src="http://mysite.com/mymedia.mp4"]
    
You can also leave off the extention and MediaElement.js will look for all media files matching the filename (mymedia.mp4, mymedia.webm, etc.)  

	[video src="http://mysite.com/mymedia"]
    
= type
The media type of the resource
    
    [video src="http://mysite.com/mymedia?xyz" type="video/mp4"]    

= mp4
The location of the h.264/MP4 source for the video.
    
    [video mp4="http://mysite.com/mymedia.mp4"]
    
= mp3
The location of an MP3 file for video
    
    [audio mp3="http://mysite.com/mymedia.mp3"]    

= ogg
The location of the Theora/Ogg source for the video.

    [video ogg="http://mysite.com/mymedia.ogg"]

= webm
The location of the VP8/WebM source for the video.

    [video webm="http://mysite.com/mymedia.webm"]

= poster
The location of the poster frame for the video.

    [video poster="http://mysite.com/mymedia.png"]

= width
The width of the video

    [video width="640"]

= height
The height of the video

    [video height="264"]
    
= loop
Loops the video or audio when it ends
    
    [video src="http://mysite.com/mymedia.mp4" loop="true"]    

= preload
Start loading the video as soon as possible, before the user clicks play.

    [video preload="true"]

= autoplay
Start playing the video as soon as it's ready.

    [video autoplay="true"]

= fullscreen
Disables the fullscreen button
    
    [video src="http://mysite.com/mymedia.mp4" fullscreen="false"]
    
= duration
Disables the duration output
    
    [video src="http://mysite.com/mymedia.mp4" duration="false"]   
    
= volume
Disables the volume slider
    
    [video src="http://mysite.com/mymedia.mp4" volume="false"]    
    
= progress
Disables the progress bar
    
    [video src="http://mysite.com/mymedia.mp4" progress="false"] 
    
= captions
URL to a WebSRT captions file
    
    [video src="http://mysite.com/mymedia.mp4" captions="http://mysite.com/mymedia.srt"]  

= chapters
Takes chapter string from the defined custom field and builds an interactive chapter table. Can be referenced to an external text file, too.
Chapters must be written in the following format:

00:00:00.000 Introduction  
00:00:57.099 First chapter title  
00:10:03.104 Second chapter title  
00:12:44.625 Final chapter  
    
    [audio src="http://mysite.com/mymedia.mp3" chapters="my_chapter_field"]                
    [audio src="http://mysite.com/mymedia.mp3" chapters="http://mychapters.com/chapters.txt"]                

= Simple Video
Basic playback options

    [video src="http://mysite.com/mymedia.mp4" width="640" height="360"]

= All Attributes Video
All options enabled

    [video mp4="http://mysite.com/mymedia.mp4" ogg="http://mysite.com/mymedia.ogg" webm="http://mysite.com/mymedia.webm" poster="http://mysite.com/mymedia.png" preload="true" autoplay="true" width="640" height="264"]

= Simple Audio
Basic playback options

    [audio src="http://mysite.com/mymedia.mp3"]

= All Attributes Audio
All options enabled

    [audio mp3="http://mysite.com/mymedia.mp3" ogg="http://mysite.com/mymedia.ogg" preload="true" autoplay="true"]

### Alternatives
If you have a plugin that conflicts with Podlove Web Player, you can also use the short codes 
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" width="640" height="360"]
    [podloveaudio src="http://mysite.com/mymedia.mp3"] 

== Screenshots ==

1. This screen shot description corresponds to screenshot-1.(png|jpg|jpeg|gif). Note that the screenshot is taken from
the directory of the stable readme.txt, so in this case, `/tags/4.3/screenshot-1.png` (or jpg, jpeg, gif)
2. This is the second screen shot

== Changelog ==

= 1.0 =
* First version on wordpress.org. Full of bugs.