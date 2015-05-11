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
        poster: '/images/coverimage.png',
        title: 'My very first player',
        permalink: '/my-player.html',
        subtitle: 'This is the subtitle',
        publicationDate: '2015-05-09T10:10:10+00:00',
        "license": {
            "name": "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Germany License",
            "url": "http:\/\/creativecommons.org\/licenses\/by-nc-sa\/3.0\/de\/deed.en"
        },
        chapters: [
            {
                start: '00:00:00.000',
                title: 'Chapter One'
            },
            {
                start: '00:00:00.500',
                title: 'Chapter Two'
            },
            {
                start: '00:00:01.500',
                title: 'Chapter Three'
            },
            {
                start: '00:00:02.000',
                title: 'Chapter Four'
            }
        ],
        summary: '<p>Summary and even links <a href="https://github.com/podlove/podlove-web-player">Podlove Web Player</a> Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Nulla vitae elit libero, a pharetra augue. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
        downloads: [{
            name: 'MP3', size: 58725,
            url: '/track.mp3',
            dlurl: '/track.mp3'
        }, {
            name: 'ogg', size: 50494,
            url: '/track.ogg',
            dlurl: '/track.mp3'
        }, {
            name: 'MP4', size: 78328,
            url: '/track.mp4',
            dlurl: '/track.mp4'
        }, {
            name: 'opus', size: 37314,
            url: '/track.opus',
            dlurl: '/track.opus'
        }],
        show: {
            title: 'My very first Player',
            subtitle: 'Testing the new player',
            summary: 'Even more text about your show and its topic...',
            poster: '/images/coverimage.png',
            url: '#'
        },
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
        duration: '00:02.902',
        alwaysShowHours: true,
        width: 'auto',
        summaryVisible: false,
        timecontrolsVisible: false,
        sharebuttonsVisible: false,
        chaptersVisible: true
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


