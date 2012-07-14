# Podlove Web Player - Wordpress Plugin

HTML5 Goodness for Podcasting

Podlove Web Player is a Podcast-optimized, HTML5-based video and audio player with Flash fallback. It supports almost every browser and also does captions, chapters and much more. Thanks to MediaElement.js for providing the foundation.

[Official Site](http://podlove.org/podlove-web-player/)

## Description

Video and audio plugin for WordPress built using MediaElement.js HTML5 media player library.
Check out <a href="http://mediaelementjs.com/">mediaElementjs.com</a> for more information on that.

This plugin is a fork of the original MediaElement.js plugin, especially enhanced for podcasting purposes.

### Typical Usage for video

    [podlovevideo src="http://mysite.com/mymedia.mp4" width="640" height="360"]
	
### Typical Usage for audio

    [podloveaudio src="http://mysite.com/mymedia.mp3"]	

### Typical Usage for chapters

Use a WordPress-native custom field with the name "my-chapter-field" and fill it with something like this:

00:00:00.000 Introduction  
00:00:57.099 First chapter title  
00:10:03.104 Second chapter title  
00:12:44.625 Final chapter
    
    [podloveaudio src="http://mysite.com/mymedia.mp3" chapters="my-chapter-field"]

###  Shortcode Options

#### src
This location of any audio or video file
    
    [podlovevideo src="http://mysite.com/mymedia.mp4"]
    
You can also leave off the extention and MediaElement.js will look for all media files matching the filename (mymedia.mp4, mymedia.webm, etc.)  

    [podlovevideo src="http://mysite.com/mymedia"]
    
#### type
The media type of the resource
    
    [podlovevideo src="http://mysite.com/mymedia?xyz" type="video/mp4"]    

#### mp4
The location of the h.264/MP4 source for the video.
    
    [podlovevideo mp4="http://mysite.com/mymedia.mp4"]
    
#### mp3
The location of an MP3 file for video
    
    [podloveaudio mp3="http://mysite.com/mymedia.mp3"]    

#### ogg
The location of the Theora/Ogg source for the video.

    [podlovevideo ogg="http://mysite.com/mymedia.ogg"]

#### webm
The location of the VP8/WebM source for the video.

    [podlovevideo webm="http://mysite.com/mymedia.webm"]

#### poster
The location of the poster frame for the video.

    [podlovevideo poster="http://mysite.com/mymedia.png"]

#### width
The width of the video

    [podlovevideo width="640"]

#### height
The height of the video

    [podlovevideo height="264"]
    
#### loop
Loops the video or audio when it ends
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" loop="true"]    

#### preload
Start loading the video as soon as possible, before the user clicks play.

    [podlovevideo preload="true"]

#### autoplay
Start playing the video as soon as it's ready.

    [podlovevideo autoplay="true"]

#### fullscreen
Disables the fullscreen button
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" fullscreen="false"]
    
#### duration
Disables the duration output
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" duration="false"]   
    
#### volume
Disables the volume slider
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" volume="false"]    
    
#### progress
Disables the progress bar
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" progress="false"] 
    
#### captions
URL to a WebSRT captions file
    
    [podlovevideo src="http://mysite.com/mymedia.mp4" captions="http://mysite.com/mymedia.srt"]  

#### chapters
Takes chapter string from the defined custom field and builds an interactive chapter table. Can be referenced to an external text file, too.
Chapters must be written in the following format:

00:00:00.000 Introduction  
00:00:57.099 First chapter title  
00:10:03.104 Second chapter title  
00:12:44.625 Final chapter  
    
    [podloveaudio src="http://mysite.com/mymedia.mp3" chapters="my_chapter_field"]                
    [podloveaudio src="http://mysite.com/mymedia.mp3" chapters="http://mychapters.com/chapters.txt"]              

#### Simple Video
Basic playback options

    [podlovevideo src="http://mysite.com/mymedia.mp4" width="640" height="360"]

#### All Attributes Video
All options enabled

    [podlovevideo mp4="http://mysite.com/mymedia.mp4" ogg="http://mysite.com/mymedia.ogg" webm="http://mysite.com/mymedia.webm" poster="http://mysite.com/mymedia.png" preload="true" autoplay="true" width="640" height="264"]

#### Simple Audio
Basic playback options

    [podloveaudio src="http://mysite.com/mymedia.mp3"]

#### All Attributes Audio
All options enabled

    [podloveaudio mp3="http://mysite.com/mymedia.mp3" ogg="http://mysite.com/mymedia.ogg" preload="true" autoplay="true"]


###  Use in a template
You can use Wordpress shortcodes in your templates using the do_shortcode function.

	<?php echo do_shortcode('[podlovevideo src="myvfile.mp4"]'); ?>

### Installation

1. Upload the `podlove-web-player` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the `Plugins` menu in WordPress
3. Use the `[podlovevideo]` or `[podloveaudio]` shortcode in your post or page with the options on the front page.