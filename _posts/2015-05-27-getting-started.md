---
layout: page
title: "Getting Started"
category: guides
date: 2015-04-27 16:18:19
script: "/js/getting-started.js"
redirect_from:
  - /tut/getting-started.html
---

## installation

1. get the player

```
    bower install podlove-web-player
```
    
2. Add an element where the player should appear

```
    <audio data-podlove-web-player-source="my-player.html">
        <source src="my-track.mp4" type="audio/mp4"/>
        <source src="my-track.mp3" type="audio/mpeg"/>
        <source src="my-track.ogg" type="audio/ogg; codecs=vorbis"/>
        <source src="my-track.opus" type="audio/ogg; codecs=opus"/>
    </audio>
```

3. Add the moderator script in your html file and point the moderator to that element

```
    <script src="bower_components/podlove-web-player/dist/moderator.min.js"></script>
    <script>$('audio').podlovewebplayer({});</script>
```

<audio data-podlove-web-player-source="player.html">
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.mp4" type="audio/mp4"/>
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.mp3" type="audio/mpeg"/>
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.ogg" type="audio/ogg; codecs=vorbis"/>
    <source src="{{site.dist}}/examples/which-format/podlove-test-track.opus" type="audio/ogg; codecs=opus"/>
</audio>
