---
navigation: 8
---

# Player Dispatches

```javascript
  podlovePlayer(selector, config).then(function (store) {
    store.dispatch({
      type: TYPE,
      payload: PAYLOAD
    })
  });
```

Every player interaction can be triggered via the [redux store](http://redux.js.org/docs/api/Store.html).
Accessing the players store enables the full control of the player while running. The [color picker]() is a good example.

You can find a complete list of available types in the [types definition](https://github.com/podlove/podlove-web-player/blob/development/src/store/types.js). 

## Dispatching to the Player

<store-dispatch />
