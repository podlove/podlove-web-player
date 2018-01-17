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
| LOADING | Audio backend starts loading | Audio Backend Properties |
| LOADED | Audio backend finished loading | Audio Backend Properties |
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
| NEXT_CHAPTER | Toggles the next chapter | - |
| PREVIOUS_CHAPTER | Toggles the previous chapter | - |
| SET_CHAPTER | Sets a chapter by index | chapter index |
| UPDATE_CHAPTER | Updates the chapters with a given playtime | playtime |
| TOGGLE_COMPONENT_INFO | Toggles the visibiity of the info header component | visibility (boolean) |
| TOGGLE_COMPONENT_ERROR | Toggles the visibiity of the error component | visibility (boolean) |
| TOGGLE_COMPONENT_PROGRESSBAR | Toggles the visibiity of the progressbar component | visibility (boolean) |
| TOGGLE_COMPONENT_INFO_POSTER | Toggles the visibiity of the header poster component | visibility (boolean) |
| TOGGLE_COMPONENT_CONTROLS_CHAPTERS | Toggles the visibiity of the chapter controls component | visibility (boolean) |
| TOGGLE_COMPONENT_CONTROLS_STEPPERS | Toggles the visibiity of the stepper controls component | visibility (boolean) |
| TOGGLE_COMPONENT_CONTROLS_BUTTON | Toggles the visibiity of the player button component | visibility (boolean) |
| SHOW_COMPONENT_CONTROLS_BUTTON_LOADING | Shows the loading button | - |
| SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY | Shows the replay button | - |
| SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING | Shows the remaining button | - |
| SHOW_COMPONENT_CONTROLS_BUTTON_DURATION | Shows the duration button | - |
| SHOW_COMPONENT_CONTROLS_BUTTON_RETRY | Shows the retry button | - |
| SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING | Shows the playing button | - |
| SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE | Shows the pausing button | - |
| TOGGLE_COMPONENT_VOLUME_SLIDER | Toggles the volume slider | visibility (boolean) |
| TOGGLE_COMPONENT_RATE_SLIDER | Toggles the rate slider | visibility (boolean) |
| ERROR_LOAD | Displays the player audio loading error | - |
| ERROR_MISSING_AUDIO_FILES | Sets the player audio missing error | - |
| SIMULATE_PLAYTIME | Simulates the playtime for the ghost mode | playtime |
| ENABLE_GHOST_MODE | Enables the ghost mode | - |
| DISABLE_GHOST_MODE | Disables the ghost mode | - |
| SET_BUFFER | Sets the buffer quantiles | buffer quantiles (nested array with start/stop) |
| SET_DURATION | Sets the duration of the audio file | duration |
| UI_PLAY | Requests audio backend play | - |
| UI_PAUSE | Requests audio backend pause | - |
| UI_RESTART | Requests audio backend restart | - |
| LOAD | Audio backend fires loading | - |
| SET_VOLUME | Sets the players volume | volume (0.0 - 1.0 |
| SET_RATE | Sets the playback rate | rate (0.5 - 4.0) |
| MUTE | Mutes the audio | - |
| UNMUTE | Unmutes the audio | - |
| SET_PLAYTIME | Audio Backend sets the playtime | playtime |
| UPDATE_PLAYTIME | UI requests change of playtime | playtime |
| LOAD_QUANTILES | Sets stored sections that are already played by user | Array with quantiles ({start, end}) |
| SET_QUANTILE | Sets a new quantile | {start, end} |
| SET_SHARE_CONTENT | Sets the content type to be shared | episode/show/chapter/playtime | 
| SHOW_SHARE_EMBED | Shows the embed dialog | - | 
| HIDE_SHARE_EMBED | Hides the embed dialog | - | 
| SET_TABS | Sets the available tabs | tabs (object with key: boolean) | 
