---
layout: page
title: Advanced Usage
navigation: 6
---

# Advanced Usage

## Using the Store

```javascript
podlovePlayer(selector, config).then(function (store) {
    store.dispatch({
        type: TYPE,
        payload: PAYLOAD
    })
});
```

Every player interaction can be triggered via the [redux store](http://redux.js.org/docs/api/Store.html).
Accessing the players store enables the full control of the player while running. The [color picker]({{ 'theme.html' | relative_url }}) is a good example.

## Store Actions

| Type | Description | Payload |
|------|-------------|---------|
| INIT | Initializes Player | Player Config Object |
| PLAY | Plays Podcast | - |
| PAUSE | Pauses Podcast | - |
| STOP | Stops Podcast | - |
| IDLE | Sets Player in Idle State | - |
| LOADING | Sets Player in Loading State | - |
| TOGGLE_TIMERMODE | Switches Timer Modes | remaining/duration |
| SET_THEME | Sets Player Theme | Theme Object |
| TOGGLE_SHARE | Toggles Share Overlay | - |
| TOGGLE_SHARE_EMBED_START | Toggles sharing embed custom start | - |
| TOGGLE_SHARE_LINK_START | Toggles sharing link custom start | - |
| SET_SHARE_EMBED_STARTTIME | Sets embed start time | Time (hh:mm:ss) |
| SET_SHARE_LINK_STARTTIME | Sets link start time | Time (hh:mm:ss) |
| SET_SHARE_EMBED_SIZE | Sets embed size | Dimensions (width x height) |
| TOGGLE_TAB | Toggles a tab | chapters/settings |
| SET_LANGUAGE | Sets the language of the player | language |
