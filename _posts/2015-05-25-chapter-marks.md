---
layout: page
title: "Chapter Marks"
category: guides
date: 2015-04-25 16:19:19
redirect_from:
  - /tut/getting-started.html
---

### A Player with Chapter Marks

<figure>
  <img src="/assets/examples/chapters.png" alt="Player with chapter marks" class="fullwidth-img shadow">
</figure>

Instead of setting chapter marks manually, chapter marks can also be set with tools like [Hindenburg](http://hindenburg.com/) or [Ultraschall](http://ultraschall.fm/).

### Source Code

#### Audio Tag

{% highlight html %}
<audio controls="controls">
    <source src="podlove-test-track.mp4" type="audio/mp4">
    <source src="podlove-test-track.mp3" type="audio/mpeg">
    <source src="podlove-test-track.ogg" type="audio/ogg; codecs=vorbis">
    <source src="podlove-test-track.opus" type="audio/ogg; codecs=opus">
    <object type="application/x-shockwave-flash" data="/bin/flashmediaelement.swf">
        <param name="movie" value="/bin/flashmediaelement.swf"/>
        <param name="flashvars" value="controls=true&amp;file=format-test-track.mp4"/>
    </object>
</audio>{% endhighlight %}

#### Metadata
This is how to define chapter marks as metadata.
The accepted format is `00:00:00.000` (`h:min:sec.ms`).

{% highlight js %}
...
chapters: [
     {
         start: '00:00:00.000',
         title: 'Chapter One'
     },
     {
         start: '00:00:00.500',
         title: 'Chapter Two',
     },
     {
         start: '00:00:01.500',
         title: 'Chapter Three',
     },
     {
         start: '00:00:02.000',
         title: 'Chapter Four',
     }
 ],...
 {% endhighlight %}
