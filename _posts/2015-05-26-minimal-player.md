---
layout: page
title: "Minimal Player"
category: guides
date: 2015-04-26 16:19:19
script: "/js/getting-started.js"
redirect_from:
  - /tut/getting-started.html
---

### Simple Player without Chapters

<figure class="mb">
  <img src="/assets/examples/minimal.png" alt="Minimal Player" class="fullwidth-img shadow">
</figure>

### Source Code

#### Audio Tag

{% highlight html %}
<audio id="my-ID">
  <source src="../which-format/podlove-test-track.mp4" type="audio/mp4"/>
  <source src="../which-format/podlove-test-track.mp3" type="audio/mpeg"/>
  <source src="../which-format/podlove-test-track.ogg" type="audio/ogg; codecs=vorbis"/>
  <source src="../which-format/podlove-test-track.opus" type="audio/ogg; codecs=opus"/>
</audio>
{% endhighlight %}

#### Metadata

{% highlight js %}
<script>
  pwp_metadata['my-ID'] = {
    sources: [
      {
        src: "/examples/which-format/podlove-test-track.mp4",
        type: "audio/mp4"
      },
      {
        src:"/examples/which-format/podlove-test-track.mp3",
        type:"audio/mpeg"
      },
      {
        src:"/examples/which-format/podlove-test-track.ogg",
        type:"audio/ogg; codecs=vorbis"
      },
      {
        src:"/examples/which-format/podlove-test-track.opus",
        type:"audio/ogg; codecs=opus"
      }
    ],
    title: 'PWP001 - Which format plays?',
    permalink: '/examples/which-format/index.html',
    subtitle: 'The Format your client chooses to play first will be told when you play this track.',
    publicationDate: '2004-02-12T15:19:21+00:00',
    show: {
      title: 'PWP - The Podlove Web Player',
      subtitle: 'HTML5 Goodness for Podcasts',
      summary: 'Even more text about this player and its advantages...',
      url: 'http://docs.podlove.org'
    },
    duration: '00:02.902'
  };
</script>
{% endhighlight %}

<div>
  <div class="right up-to-top"> <a class="icon pwp-arrow-up" href="#top"></a></div>
</div>
