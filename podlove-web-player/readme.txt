=== Podlove Web Player ===
Contributors: gerritvanaaken, simonwaldherr
Donate link: http://podlove.org/
Tags: podcasting, podlove, html5audio, audio, video, podcast, player, media, webplayer
Requires at least: 3.4.0
Tested up to: 4.6.1
Stable tag: trunk
License: BSD 2-Clause License
License URI: http://opensource.org/licenses/BSD-2-Clause

HTML5 based audio/video player, focused on podcasts and similar media blogs. It supports chapters, deeplinks, captions, social media buttons and more.

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

The Podlove Web Player is built from the <a href="http://podlove.org/">Podlove Team</a>.

It uses sources from <a href="http://mediaelementjs.com/">MediaElement.js</a>, <a href="http://jquery.com/">jQuery</a> and <a href="http://benalman.com/projects/jquery-hashchange-plugin/">jQuery hashchange event</a>.

The used icons are built in as fonts and provided by <a href="http://fortawesome.github.com/Font-Awesome/">Font Awesome</a>, <a href="http://zocial.smcllns.com/">Zocial</a>, <a href="http://somerandomdude.com/work/iconic/">Iconic</a>, <a href="http://aristeides.com/">Elusive</a>, <a href="http://designmodo.com/linecons-free/">Linecons</a>, <a href="http://www.entypo.com">Entypo</a>, <a href="http://www.justbenicestudio.com/studio/websymbols/">Web Symbols</a>, <a href="http://thedesignoffice.org/project/modern-pictograms/">Modern Pictograms</a>.

== Installation ==

1. Upload the `podlove-web-player` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the `Plugins` menu in WordPress
3. Use the `[podlovevideo]` or `[podloveaudio]` shortcode in your post or page with the options on the front page
4. Visit the options page
5. If you need help, go to the github repo https://github.com/podlove/podlove-web-player and use the issue tracker

== Frequently Asked Questions ==

### Where can i get help?

Definitely not on wordpress.org
If you need help, please go to our github repo
You can find it at https://github.com/podlove/podlove-web-player

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

Takes chapter json string from the defined custom field (the standard WordPress ones) and builds an interactive chapter table. Can be referenced to an external json file, too. Chapters must be written in the following format:

[{
  "start": "00:00:00",
  "title": "foo",
  "href": "http://podlove.org",
  "image":""
},{
  "start": "00:01:00",
  "title": "lorem",
  "href": "https://github.com/podlove/",
  "image":"samples/coverimage-red.png"
},{
  "start": "00:02:30",
  "title": "ipsum",
  "href": "https://github.com/shownotes/",
  "image":"samples/coverimage-green.png"
},{
  "start": "00:03:00",
  "title": "end",
  "href": "",
  "image":"samples/coverimage-blue.png"
}]


* "start" has to be defined as HH:MM:SS
* "title" is the name of the chapter
* "href" is an optional URL
* "image" is an optional image URL or relative path

    [podloveaudio chapters="my_chapter_field"]
    [podloveaudio chapters="http://mychapters.com/chapters.json"]

= chaptersVisible / timecontrolsVisible / summaryVisible =

Defines the default visibility status of toggable player modules. Standard value is "false".

    [podloveaudio chaptersVisible="true" timecontrolsVisible="false" summaryVisible="false"]

= Rich Podlove Web Player player with meta information =

If you have an audio file and use one of the following attributes, the player will sport a richer visual experience: "title", "subtitle", "summary", "poster", "permalink". Full example:

    [podloveaudio mp3="http://mysite.com/mymedia.mp3" ogg="http://mysite.com/mymedia.ogg" title="PWP – First show" subtitle="We talk about this and that" summary="Here goes a summary of the episode which should be about 256 characters long" poster="http://mysite.com/mymedia.jpg" chapters="my_chapter_field" permalink="http://mysite.com/my-first-episode/"]

= Podlove Web Player Shortcode in multiple lines =

Don't do it, always write the shortcode in a single line.

### Deprecated usage

Chapters now handed over as JSON, please take a look at the standalone.html. The previous solution will still work, however we recommend to use the new solution, as it offers some more features.
Earlier versions of this plugin could handle alternative shortcodes, too: [audio] and [video]. As of version 1.1, these are deprecated as they conflict with other plugins.

== Screenshots ==

1. Podlove Web Player in full swing, using the chapters table to jump to different section of the audio source.
2. Podlove Web Player in chapters hidden and timecontrol-bar visible view.
3. Podlove Web Player Options

== Changelog ==

= 2.1.0 =
* mejs update
* simplified, modernised look
* responsive layout for mobile devices

= 2.0.19 =
* mejs update
* link to timecode
* default posters configurable
* get chapters from other sources
* Style Editor
* smaller and bigger player styles
* save playtime in cookies
* mp4chaps image support

= 2.0.18 =
* compatible with Wordpress theme Twenty-Fourteen
* read plugin version dynamically in settings.php

= 2.0.17 =
* fixes an error on apaches without mod_headers

= 2.0.16
* fixes unspecific css selector bug, introduced in last version
* fixes removing elements other than sources
* fixes false milliseconds

= 2.0.15 =
* small fixes
* .htaccess examples added in /help

= 2.0.14 =
* style improvements
* wordpress twenty thirteen theme compatibility
* FireFox AAC fix
* summary style fix
* XSS Firefox Bugfix
* jslint valid whitespace

= 2.0.13 =
* fix IE8 support
* more valid/better js code

= 2.0.12 =
* increase version number to fix wordpress.org issues
* support images in mp4chaps
* more valid/better js code
* save playtime in cookies

= 2.0.11 =
* empty chapter file and empty meta_box bug fixed
* chapter images added to chapter table
* chapter links added to chapter table
* chapter table bugfix
* max chapter table height changeable
* buttons improved (style and size)

= 2.0.10 =
* wordpress.org has some problems with the last commit
* sorry for the inconvenience

= 2.0.9 =
* sorry for the mp4 chaps bug
* now it's working again

= 2.0.8 =
* better compatibility
* resume at last position
* build script (less requests)
* accept chapters as json-file

= 2.0.7 =
* Download bar added
* Button config added
* PHP Warnings removed
* various small changes

= 2.0.6 =
* podPress compatibility
* chapterbox height fix
* summary height fix
* infobutton style fixes
* jshint and jslint valid
* various small fixes
* Chapter hand over via JSON

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

== Upgrade Notice ==

= 2.0.19 =
mejs update, link to timecode, default posters configurable, get chapters from other sources and style editor added

= 2.0.18 =
compatible with Wordpress theme Twenty-Fourteen

= 2.0.17 =
fixes an error on apaches without mod_headers

= 2.0.16 =
fixes css, removing elements other than sources and false milliseconds bugs

= 2.0.15 =
small fixes and .htaccess examples added in /help

= 2.0.14 =
style improvements, wordpress twenty thirteen theme compatibility, Firefox AAC fix, XSS Firefox Bugfix

= 2.0.13 =
fix IE8 support and more valid/better js code

= 2.0.12 =
support images in mp4chaps, more valid/better js code and save playtime in cookies

= 2.0.11 =
tiny bugs removed and style improved

= 2.0.10 =
readme.txt update because of wordpress.org validator foo

= 2.0.9 =
mp4 chaps bug fixed

= 2.0.8 =
better compatibility, resume at last position and accept chapters as json-file

= 2.0.7 =
PHP Warnings removed and various small changes

= 2.0.6 =
podPress compatible, chapterbox/summary height fix and jshint/jslint valid

= 2.0.5 =
Blubrry PowerPress compatible and firefox flash fallback multiple playing fix
