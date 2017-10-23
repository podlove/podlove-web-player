---
layout: page
title: Config
navigation: 4
---

# Configuration

#### Show Information

| show.title  | Show Title  |
| show.subtitle  | Show Description  |
| show.summary | Show Summary |
| show.poster | Show Cover |
| show.link | Url to show |

```javascript
{
    show: {
      title: 'Freak Show',
      subtitle: 'Menschen! Technik! Sensationen!',
      summary: 'Die muntere Talk Show um Leben mit Technik, das Netz und Technikkultur. Bisweilen Apple-lastig aber selten einseitig. Wir leben und lieben Technologie und reden darüber. Mit Tim, hukl, roddi, Clemens und Denis. Freak Show hieß irgendwann mal mobileMacs.',
      poster: 'https://freakshow.fm/wp-content/cache/podlove/04/662a9d4edcf77ea2abe3c74681f509/freak-show_200x200.jpg',
      link: 'https://freakshow.fm'
    }
}
```

#### Episode Information

| title | Episode Title |
| subtitle | Episode Description |
| summary | Episode Summary |
| poster | Episode Cover |
| publicationDate | Episode Publication Date |
| duration | Episode Duration |
| link | Link to Episode |

```javascript
{
  title: 'FS171 Invasion!',
  subtitle: 'LAN Planung - Kalender - Bingo - Wikipedia - Akkukalibration - Alte iPads und iPods - Find My Friends - iPhone Music Player - Apple Watch - Kommandozeile - Star Wars - Dante - Internet of Things Security - VPN',
  summary: 'Wir haben eine wie wir finden abwechslungsreiche Sendung produziert, die wir Euch wie immer mit Freude bereitstellen. Während die Live-Hörer Freak-Show-Bingo spielen, greifen wir das Wikipedia-Thema der letzten Sendung auf und liefern auch noch weitere Aspekte des optimalen Star-Wars-Medienkonsums frei Haus. Dazu viel Nerderei rund um die Kommandozeile, eine Einschätzung der Perspektive der Apple Watch, ein Rant über die mangelhafte Security  im Internet of Things (and Buildings) und allerlei anderer Kram.  Roddi setzt dieses Mal aus, sonst Vollbesetzung.',
  publicationDate: '2016-02-11T03:13:55+00:00',
  poster: 'https://freakshow.fm/wp-content/cache/podlove/04/662a9d4edcf77ea2abe3c74681f509/freak-show_200x200.jpg',
  duration: '04:15:32',
  link: 'https://freakshow.fm/fs171-invasion'
}
```

#### Episode Chapters

| start | Chapter Start Time in Format hh:mm:ss |
| title | Chapter Title |

_Not providing chapters will disable all chapter related functions._

```javascript
{
    chapters: [
      { start:"00:00:00", title: 'Intro'},
      { start:"00:01:39", title: 'Begrüßung'},
      { start:"00:04:58", title: 'IETF Meeting Netzwerk'},
      { start:"00:18:37", title: 'Kalender'},
      { start:"00:33:40", title: 'Freak Show Bingo'},
      { start:"00:35:37", title: 'Wikipedia'},
      { start:"01:17:26", title: 'iPhone Akkukalibration'},
      { start:"01:24:55", title: 'Alte iPads und iPod touches'},
      { start:"01:31:02", title: 'Find My Friends'},
      { start:"01:41:46", title: 'iPhone Music Player'},
      { start:"01:56:13", title: 'Apple Watch'},
      { start:"02:11:51", title: 'Kommandozeile: System Appreciation'},
      { start:"02:23:10", title: 'Sound und Design für Games'},
      { start:"02:24:59", title: 'Kommandozeile: Remote Deployment'},
      { start:"02:32:37", title: 'Kommandozeile: Man Pages'},
      { start:"02:44:31", title: 'Kommandozeile: screen vs. tmux'},
      { start:"02:58:02", title: 'Star Wars: Machete Order & Phantom Edit'},
      { start:"03:20:05", title: 'Kopfhörer-Ersatzteile'},
      { start:"03:23:39", title: 'Dante'},
      { start:"03:38:03", title: 'Dante Via'},
      { start:"03:45:33", title: 'Internet of Things Security'},
      { start:"03:56:11", title: 'That One Privacy Guy\'s VPN Comparison Chart'},
      { start:"04:10:00", title: 'Ausklang'}
    ]
}
```

#### Audio Files

```javascript
{
  audio: [{
    url: 'http://freakshow.fm/podlove/file/4468/s/download/c/select-show/fs171-invasion.m4a',
    mimeType: 'audio/mp4',
    size: 93260000,
    title: 'Audio MP4'
  }, {
    url: 'http://freakshow.fm/podlove/file/4467/s/download/c/select-show/fs171-invasion.mp3',
    mimeType: 'audio/mp3',
    size: 14665000,
    title: 'Audio MP3'
  }, {
    url: 'http://freakshow.fm/podlove/file/4467/s/download/c/select-show/fs171-invasion.oga',
    mimeType: 'audio/ogg',
    size: 94400000,
    title: 'Audio Ogg'
  }, {
    url: 'http://freakshow.fm/podlove/file/4467/s/download/c/select-show/fs171-invasion.opus',
    mimeType: 'audio/opus',
    size: 94400000,
    title: 'Audio Opus'
  }]
}
```

#### References

| reference.base | Reference to webplayer base, if not provided it falls back to the current url |
| reference.config | Reference to the current configuration |
| reference.share | Reference sharing embed endpoint |

```javascript
{
    reference: {
      base: '//podlove-player.surge.sh',
      config: '//podlove-player.surge.sh/fixtures/example.json',
      share: '//podlove-player.surge.sh/share'
    }
}
```

#### Theming

| theme.main | main theme color (default: #2B8AC6) |
| theme.highlight | highlight theme color |

```javascript
{
    theme: {
      main: '#2B8AC6',
      highlight: '#EC79F2'
    }
}
```

#### Runtime

| runtime.platform | Platform (desktop,mobile), is detected by the player |
| runtime.language | Language (en,de,...), defaults to browser language |

```javascript
{
    runtime: {
      platform: 'desktop',
      language: 'en'
    }
}
```

#### Contributors

| contributor.name   | Name of contributor (e.g. speaker)   |
| contributor.avatar | Absolute Url to contributor's avatar |

```javascript
 contributors: [{
      avatar: 'https://freakshow.fm/wp-content/cache/podlove/47/08928e3c26dcb1141d67ad75869619/tim-pritlove_50x50.jpg',
      name: 'Tim Pritlove'
  }, {
      avatar: 'https://freakshow.fm/wp-content/cache/podlove/0f/9c18f5e825496b9060337f92814142/clemens-schrimpe_50x50.jpg',
      name: '	Clemens Schrimpe'
  }, {
      avatar: 'https://freakshow.fm/wp-content/cache/podlove/8e/f30cbe274c3f5e43dc4a7219676f50/hukl_50x50.jpg',
      name: 'hukl'
  }, {
      avatar: 'https://freakshow.fm/wp-content/cache/podlove/b2/425e5c8f180ddf548c95be1c2d7bcf/denis-ahrens_50x50.jpg',
      name: 'Denis Ahrens'
  }]
```

#### Tabs

| tabs.info     | toggle the info tab     |
| tabs.share    | toggle the share tab    |
| tabs.chapters | toggle the chapters tab |
| tabs.audio    | toggle the audio tab    |
| tabs.download | toggle the download tab |


```javascript
  tabs: {
   info: true // will expand the info tab on load
  }
```

#### Visible Components

List of components that are visible in the player. if nothing is provided all components are visible.

| showTitle         | Header show title     |
| episodeTitle      | Header episode title  |
| subtitle          | Header subtitle       |
| progressbar       | Play progress         |
| controlSteppers   | Steppers controls     |
| controlChapters   | Chapters controls     |
| poster            | Poster in Head        |
| tabChapters       | Chapters Tab          |
| tabDownload       | Download Tab          |
| tabAudio          | Audio Tab             |
| tabShare          | Share Tab             |


```javascript
  visibleComponents: [
    'tabInfo',
    'tabChapters',
    'tabDownload',
    'tabAudio',
    'tabShare',
    'poster',
    'showTitle',
    'episodeTitle',
    'subtitle',
    'progressbar',
    'controlSteppers',
    'controlChapters'
  ]
```
