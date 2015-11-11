---
layout: page
title: "Injected Metadata JSON Configuration"
category: appendix
date: 2015-06-15 00:00:00
---

### Static Embed

You want to use the static embed page? Follow the steps below.



{% highlight js %}
{
    // (mandatory) list of source files to play - order matters
    sources: [
        {
            src: "assets/my-track.mp4",
            type: "audio/mp4"
        },
        {
            src:"assets/my-track.mp3",
            type:"audio/mpeg"
        },
        {
            src:"assets/my-track.ogg",
            type:"audio/ogg; codecs=vorbis"
        },
        {
            src:"assets/my-track.opus",
            type:"audio/ogg; codecs=opus"
        }
    ],
}
{% endhighlight %}

<div>
  <div class="right up-to-top"> <a class="icon pwp-arrow-up" href="#top"></a></div>
</div>
