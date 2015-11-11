---
layout: page
title: "Getting Started"
category: guides
date: 2015-04-27 16:18:19
script: "/js/getting-started.js"
redirect_from:
  - /tut/getting-started.html
---

### Basics
#### Example directory structure

{% highlight sh %}

├── index.html
├── audio /
│   └── episode-1.m4a
│  
├── episode1.html
│
└── images /
    ├── episode-cover.png
    └── show-cover.png
{% endhighlight %}

#### Get the Latest Player Release
<div>
  <div class="right up-to-top"> <a class="icon pwp-arrow-up" href="#top"></a></div>
</div>

Having [bower](http://bower.io/) installed on your system, simply run
`bower install podlove-web-player`
to get the player package.

### Integrate the web player into a website

#### Create an `index.html` File

2.  Add an element where the player should appear {% highlight html %}
    <audio data-podlove-web-player-source="episode1.html">
      <source src="episode1.m4a" type="audio/m4a">
    </audio>
{% endhighlight %}

    (i) The audio tag is the non-js fallback

3.  Add the moderator script in your html file and point the moderator to that element {% highlight html %}
    <script src="/bower_components/podlove-web-player/dist/js/moderator.min.js">
    </script>
    <script>$('audio').podlovewebplayer();</script>
{% endhighlight %}

#### Create `episode/index.html`

1. Choose style {% highlight html %}
    <link href="/bower_components/podlove-web-player/dist/css/pwp-dark-green.css" rel="stylesheet" media="screen" type="text/css" />
{% endhighlight %}

2. Add element to replace {% highlight html %}
    <audio>
      <source src="episode1.m4a" type="audio/m4a">
    </audio>
{% endhighlight %}

3. Add scripts {% highlight html %}
<script src="/bower_components/podlove-web-player/dist/js/vendor/html5shiv.js"></script>
<script src="/bower_components/podlove-web-player/dist/js/vendor/jquery.min.js"></script>
<script src="/bower_components/podlove-web-player/dist/js/vendor/progress-polyfill.min.js"></script>
<script src="/bower_components/podlove-web-player/dist/js/podlove-web-player.js"></script>
{% endhighlight %}

3. Add metadata {% highlight js %}

    $('audio').podlovewebplayer({
      show: {
        title: 'My Very First Podcast',
        subtitle: 'Short one-liner',
        summary: 'Paragraphs of text about your show and its topic. *yada yada*', poster: '/images/show-cover.png',
      },
      downloads: [
        {
          assetTitle: 'MPEG-4 AAC Audio (m4a)',
          size: 156237824,
          url: 'episode1.m4a'
        }
      ],
      chapters: [
        {
          start: '00:00:00.000',
          title: 'First chapter'
        },
        {
          start: '01:23:45.678',
          title: 'Last chapter'
        }
      ],
      poster: '/images/episode-cover.png',
      permalink: '/examples/episode1/index.html',
      title: 'My Very First Episode',
      subtitle: 'This is the episode\'s subtitle one-liner',
    });
<div>
  <div class="right up-to-top"> <a class="icon pwp-arrow-up" href="#top"></a></div>
</div>

{% endhighlight %}

#### Result

* [Example player.html](/player.html)
* [View page source](view-source:/player.html)

<audio data-podlove-web-player-source="/player.html">
  <source src="{{site.dist}}/examples/which-format/podlove-test-track.mp4" type="audio/mp4"/>
  <source src="{{site.dist}}/examples/which-format/podlove-test-track.mp3" type="audio/mpeg"/>
  <source src="{{site.dist}}/examples/which-format/podlove-test-track.ogg" type="audio/ogg; codecs=vorbis"/>
  <source src="{{site.dist}}/examples/which-format/podlove-test-track.opus" type="audio/ogg; codecs=opus"/>
</audio>

<div>
  <div class="right up-to-top"> <a class="icon pwp-arrow-up" href="#top"></a></div>
</div>
