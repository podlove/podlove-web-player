---
layout: page
title: Live
navigation: 6
---

# Live Mode

<p id="example"></p>
<script src="{{ 'embed.js' | relative_url }}"></script>
<script>
    podlovePlayer('#example', {
      mode: 'live',
      title: 'Livestream',
      subtitle: 'Wir sind ein CreativeCommons-Webradio, das sich zur Aufgabe gemacht hat freie Musik zu verbreiten und die Hörer durch die vielen Beteiligungsmöglichkeiten direkt zu einem Teil unserer Sendungen zu machen.',
      link: 'https://theradio.cc',
      poster: 'https://theradio.cc/wp-content/uploads/2014/01/9e7d1d68285200b9d3c0-150x150.jpg',
      show: {
          title: 'TheRadio.cc',
          link: 'https://theradio.cc'
      },
      audio: [{
          url: 'http://mp3.theradio.cc/',
          mimeType: 'audio/mp3'
      }, {
          url: 'http://ogg.theradio.cc/',
          mimeType: 'audio/ogg'
      }]
    });
</script>

## Config

```javascript
{
  mode: 'live',
  title: 'Livestream',
  subtitle: 'Wir sind ein CreativeCommons-Webradio, das sich zur Aufgabe gemacht hat freie Musik zu verbreiten und die Hörer durch die vielen Beteiligungsmöglichkeiten direkt zu einem Teil unserer Sendungen zu machen.',
  link: 'https://theradio.cc',
  poster: 'https://theradio.cc/wp-content/uploads/2014/01/9e7d1d68285200b9d3c0-150x150.jpg',
  show: {
    title: 'TheRadio.cc',
    link: 'https://theradio.cc'
  },
  audio: [{
      url: 'http://mp3.theradio.cc/',
      mimeType: 'audio/mp3'
  }, {
      url: 'http://ogg.theradio.cc/',
      mimeType: 'audio/ogg'
  }]
}
```
