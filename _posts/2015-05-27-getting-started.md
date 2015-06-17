---
layout: page
title: "Getting Started"
category: guides
date: 2015-04-27 16:18:19
script: "/js/getting-started.js"
redirect_from:
  - /tut/getting-started.html
---

## Example directory structure

{% highlight sh %}
    - index.html
    - my-player.html
    - images /
      - episode-cover.png
      - show-cover.png
{% endhighlight %}

## get the latest player release

{% highlight sh %}
    bower install podlove-web-player
{% endhighlight %}

## Create an `index.html` file

2.  Add an element where the player should appear {% highlight html %}
    <audio data-podlove-web-player-source="my-player.html">
        <source src="my-track.mp4" type="audio/mp4"/>
        <source src="my-track.mp3" type="audio/mpeg"/>
        <source src="my-track.ogg" type="audio/ogg; codecs=vorbis"/>
        <source src="my-track.opus" type="audio/ogg; codecs=opus"/>
    </audio>
{% endhighlight %}

    (i) The audio tag is the non-js fallback

3.  Add the moderator script in your html file and point the moderator to that element {% highlight html %}
    <script src="/bower_components/podlove-web-player/dist/js/moderator.min.js"></script>
    <script>$('audio').podlovewebplayer();</script>
{% endhighlight %}

## Create `my-player.html`

1. choose style {% highlight html %}
    <link href="/bower_components/podlove-web-player/dist/css/pwp-dark-green.css" rel="stylesheet" media="screen" type="text/css" />
{% endhighlight %}

2. add element to replace {% highlight html %}
    <audio controls="controls" preload="none">
        <source src="/track.mp4" type="audio/mp4">
        <source src="/track.mp3" type="audio/mpeg">
        <source src="/track.ogg" type="audio/ogg; codecs=vorbis">
        <source src="/track.opus" type="audio/ogg; codecs=opus">
        <object type="application/x-shockwave-flash" data="/bower_components/podlove-web-player/dist/bin/flashmediaelement.swf">
            <param name="movie" value="/bower_components/podlove-web-player/dist/bin/flashmediaelement.swf"/>
            <param name="flashvars" value="controls=true&amp;file=/track.mp4"/>
        </object>
    </audio>
{% endhighlight %}

3. add scripts {% highlight html %}
<script src="/bower_components/podlove-web-player/dist/js/vendor/html5shiv.js"></script>
<script src="/bower_components/podlove-web-player/dist/js/vendor/jquery.min.js"></script>
<script src="/bower_components/podlove-web-player/dist/js/vendor/progress-polyfill.min.js"></script>
<script src="/bower_components/podlove-web-player/dist/js/podlove-web-player.js"></script>
{% endhighlight %}

3. add metadata {% highlight js %}

    $('audio').podlovewebplayer({
      // -- All show related infos go here
      show: { // (optional) *
        title: 'My Very First Podcast', // (optional)
        subtitle: 'Short one-liner', // (optional)
        summary: 'Paragraphs of text about your show and its topic. *yada yada*', // (optional)
        poster: '/images/show-cover.png', // (optional) x by x - will be shown on info and share tab
        url: 'http:\/\/my.very.first.podcast' // (optional)
      },
      // -- Episode related data
      // (optional) should be correct or not set at all - can seriously mess up progress if wrong
      duration: '00:02.902',
      // (optional) assets that will be offered to be downloaded in download tab
      downloads: [
        {
          assetTitle: 'MPEG-4 AAC Audio (m4a)', // this will be displayed in list
          size: 156237824, // bytes will be shown in MB
          downloadUrl: 'http:\/\/my.very.first.podcast\/episode1\/?trackMe&type=m4a', // Tracking enhanced URL
          directAccess: 'http:\/\/my.very.first.podcast\/assets\/episode1.m4a', // unclear
          url: 'http:\/\/my.very.first.podcast\/episode1\/?type.m4a' // (mandatory)
        },
        // ... more assets ...
        {
          assetTitle: 'Transcripts (txt)',
          size: 140509184, //bytes will be shown in MB
          url: 'http:\/\/my.very.first.podcast\/assets\/episode1_transcript.txt' //
        }
      ],
      // (optional) array of chapter objects - order does not matter
      chapters: [
        {
          start: '00:00:00.000', // (mandatory) Timecode in hh:mm:ss.ms
          title: 'First chapter' // (mandatory) name of the chapter
          // ATM image and link properties are not taken into account
        },
        // ... more chapters ...
        {
          start: '12:34:56.789',
          title: 'Last chapter'
        }
      ],
      // (optional) main player image (defaults to show cover) and share and
      poster: '/images/episode-cover.png',
      title: 'My Very First Episode', // (optional)
      permalink: 'http:\/\/my.very.first.podcast\/?post=23', // (optional) this link should never change
      subtitle: 'This is the episode\'s subtitle one-liner', // (optional)
      // date in UTC format  YYYY-MM-DDThh:mm:ss+hh:mm
      publicationDate: '2015-05-09T10:10:10+00:00',
      // choose your license - displayed in info tab
      license: {
        name: 'Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Germany License',
        url: 'http:\/\/creativecommons.org\/licenses\/by-nc-sa\/3.0\/de\/deed.en'
      },
      // as long as you wish
      summary: "&gt;p&lt;Paragraphs of fantastic epsisode description with HTML and even &gt;a href="#"&lt;links&gt;/a&lt;&gt;/p&lt;",
      // which social profiles to show on info tab footer
      profiles: [
        {
            serviceName: 'twitter',
            profile: 'podlove_org'
        },
        {
            serviceName: 'email',
            profile: 'info@podlove.org'
        }
      ],
      // display settings
      width: 'auto' // (deprecated) defaults to auto / 100%
      alwaysShowHours: true, // (optional) show hours in timecodes with 00
      timecontrolsVisible: true, // (optional) hide/show time controls
      summaryVisible: true, // (optional) hide/show info tab
      sharebuttonsVisible: true, // (optional) hide/show share tab
      chaptersVisible: true // (optional) hide/show chapter tab
    });

{% endhighlight %}

## Result

* [Example player.html](/player.html)
* [View page source](view-source:/player.html)

<audio data-podlove-web-player-source="/player.html">
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.mp4" type="audio/mp4"/>
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.mp3" type="audio/mpeg"/>
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.ogg" type="audio/ogg; codecs=vorbis"/>
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.opus" type="audio/ogg; codecs=opus"/>
</audio>
