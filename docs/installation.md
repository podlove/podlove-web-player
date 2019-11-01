---
navigation: 2
---

# Installation

Podlove Webplayer can be integrated in different ways. We provide the always latest version via CDN or all versions as an npm package.

## CDN

The easiest way to integrate the player is to simply integrate this script in your page:

For https context:
```html
<script src="https://cdn.podlove.org/web-player/embed.js"></script>
```

For http context:
```html
<script src="http://cdn.podlove.org/web-player/embed.js"></script>
```

Afterwards `podlovePlayer` should be available on the window object:

```html
<script>
  podlovePlayer('#example', '/path/to/podcast/definition/or/object');
</script>
```

Please be aware to __not__ set `reference.base` because this will break the binding to the cdn.


## NPM

If you want to serve a special player version you can find the player as the npm package [@podlove/podlove-web-player](https://www.npmjs.com/package/@podlove/podlove-web-player).

To integrate the player you first have to install tha package:

```javascript
npm install @podlove/podlove-web-player --save
```

Afterwards move the player assets to a public folder of some webserver. By default the player will try to load further chunks from the webserver base. If the player files are located in a subpath you have to adapt the `reference.base` accordingly (see [config]({{ $withBase('config.html') }}))
