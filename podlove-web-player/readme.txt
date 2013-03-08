=== Plugin Name ===
Contributors: gerritvanaaken, simonwaldherr
Donate link: http://podlove.org/
Tags: podcasting, podlove, html5audio, audio, video, podcast, player
Requires at least: 3.4.0
Tested up to: 3.5.1
Stable tag: 2.0.5
License: BSD 2-Clause License
License URI: http://opensource.org/licenses/BSD-2-Clause

HTML5 based audio/video player, focused on podcasts and similar media blogs. It supports chapters, deeplinks, captions and even more.

== Description ==

This is part of the “Podlove” initiative for a better podcasting experience. See <a href="http://podlove.org">podlove.org</a> for more information.

There are basically four ways to use the Podlove Web Player:

### 1) as a Standalone Player

You won’t need any of the PHP or WordPress files in this package. Just stick to "standalone.html" and see how it’s done there. Maybe you want to build your very own CMS plugin. If so – let us know!

### 2) manual WordPress shortcodes

Use a simple shortcode in your posts and pages, and the Podlove Web Player will appear, playing any media file you want to assign. Basic usage:

   [podloveaudio src="http://mysite.com/mymedia.mp3" duration="03:33" title="My track"]   

### 3) WordPress enclosures

The WordPress plugin searches for media enclosures in your existing posts and renders a web player automatically. Works like a charme, even for Blubrry PowerPress users.

### 4) as part of the Podlove Podcast Publisher

This player is bundled with the <a href="http://podlove.org/podlove-podcast-publisher">“PPP” project</a> and should be automatically rendered, so you don’t have to worry about anything.


== Credits ==

The Podlove Web Player is built upon the MediaElement.js library. Check out <a href="http://mediaelementjs.com/">mediaElementjs.com</a> for more information on that.

We also make use of the fantastic <a href="http://fortawesome.github.com/Font-Awesome/">Font Awesome</a> project.

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
    
= type =

The media type of the resource:
    
    [podlovevideo src="http://mysite.com/mymedia.m4v" type="video/mp4"]    

= mp4 / webm / ogg  = 

The location of a file with a specific video type:
    
    [podlovevideo mp4="mymedia.mp4" webm="mymedia.webm" ogg="mymedia.ogv"]

= mp4 / mp3 / ogg / opus =

    [podloveaudio mp4="mymedia.m4a" mp3="mymedia.mp3" ogg="mymedia.oga" opus="mymedia.opus"]

= poster = 

The location of the poster frame for the video (or cover image for the rich audio player):

    [podlovevideo poster="http://mysite.com/mymedia.png"]
    [podloveaudio poster="http://mysite.com/mymedia.png"]

= width / height = 

The width and/or height of the video (or the audio player):

    [podlovevideo width="640" height="264"]
    
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

Enables display of duration without having to load the media file. Use seconds or timecode as a unit:
    
    [podlovevideo duration="3522"]
    [podloveaudio duration="00:58:42"]

= alwaysShowHours =

Displays the time in 00:00:00 instead of 00:00. Default is "true".

    [podloveaudio alwaysShowHours="false"]  

= alwaysShowControls =

Defines whether the player control bar is permanently visible. For videos, it might be suitable to fade the controls out when not hovering the video.

    [podlovevideo alwaysShowControls="false"]   
    
= volume = 

Disables the volume slider:
    
    [podloveaudio volume="false"]    
    
= progress =

Disables the progress bar:
    
    [podlovevideo progress="false"] 
    
= captions = 

URL to a WebVTT captions file:
    
    [podlovevideo captions="http://mysite.com/mymedia.vtt"]  

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

= chaptersVisible / timecontrolsVisible / summaryVisible =

Defines the default visibility status of toggable player modules. Standard value is "false".

    [podloveaudio chaptersVisible="true" timecontrolsVisible="false" summaryVisible="false"]

= Rich Podlove Web Player player with meta information =

If you have an audio file and use one of the following attributes, the player will sport a richer visual experience: "title", "subtitle", "summary", "poster", "permalink". Full example:

    [podloveaudio mp3="http://mysite.com/mymedia.mp3" ogg="http://mysite.com/mymedia.ogg" title="PWP – First show" subtitle="We talk about this and that" summary="Here goes a summary of the episode which should be about 256 characters long" poster="http://mysite.com/mymedia.jpg" permalink="http://mysite.com/my-first-episode/"]


### Deprecated usage

Earlier versions of this plugin could handle alternative shortcodes, too: [audio] and [video]. As of version 1.1, these are deprecated as they conflict with other plugins.

== Screenshots ==

1. Podlove Web Player in full swing, using the chapters table to jump to different section of the audio source.
2. Podlove Web Player in chapters hidden and timecontrol-bar visible view.

== Changelog ==

= 2.0.6 =
* podPress compatibility

= 2.0.5 =
* fixed Blubrry PowerPress compatibility
* fixed style Interference with various WP Themes
* firefox flash fallback multiple playing fix
* opera font bug fix
* more stable CSS

= 2.0.4 =
* fixed flash fallback again
* parameter handover improved
* encoding issues fixed

= 2.0.3 =
* reduced DOM interaction at player creation
* improved readability of JS code
* improved JS performance
* fixed video
* fixed flash fallback
* fixed player slowing down Firefox
* fixed buttons not being displayed properly
* added a new bar with social sharing buttons
* updated submodules

= 2.0.2 =
* equivalent to 2.0.1

= 2.0.1 =
* does not crash in PHP 5.2 anymore
* some CSS improvements for responsive layouts
* fixes visual glitches in readme.txt

= 2.0.0 =
* refactored large parts of the code
* added standalone player, works without PHP (example HTML/JS included)
* moved lots of functionality from PHP to JS
* cleaned variables and removed old stuff
* CSS improvements
* new settings area (yes, again. But now WordPress API compliant)
* added FontAwesome for fancy control buttons
* added "duration" parameter for displaying duration of last chapter
* added "permalink" parameter
* added "alwaysShowHours" parameter
* added "alwaysShowControls" parameter
* added "chaptersVisible" parameter
* added "timecontrolsVisible" parameter
* added "summaryVisible" parameter
* added sample audio files for testing purposes
* fresh versions of mediaelementjs and jQuery

= 1.2 =
* added: Rich player with meta information (title, subtitle, summary, cover image)
* added: Opus audio codec support
* added: Chapter duration display
* added: Chapter deeplinking
* added: optional listening to WordPress enclosures
* new settings area
* fixed some issues with flash fallback
* freshest version of mediaelement.js
* lots of bugfixes and improvements

= 1.1.2 =
* prevents activation conflicts with other instances of the plugin

= 1.1.1 =
* small bugfixes and improvements

= 1.1 =
* First proper release.
* [audio] and [video] are deprecated: Use [podloveaudio] and [podlovevideo] instead!
* Implements W3C Media Fragements with start and end time

= 1.0 =
* First version on wordpress.org
* Full of bugs