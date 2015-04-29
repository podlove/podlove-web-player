---
layout: page
title: "Getting Started"
category: guides
date: 2015-04-27 16:18:19
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
    <audio>
      <source src="../which-format/podlove-test-track.mp4" type="audio/mp4"/>
    </audio>
```

3. Add the moderator script in your html file and point the moderator to that element

```
    <script src="bower_components/podlove-web-player/dist/moderator.min.js"></script>
    <script>$('audio').podlovewebplayer();</script>
```

[View live Example](/dist/examples/index.html)
