---
navigation: 9
---

# Player Subscriptions

```javascript
  podlovePlayer(selector, config).then(function (store) {
    store.subscribe(() => {
      const { lastAction } = store.getState()
      // Do something with the last action
      console.log({ type: lastAction.type, payload: lastAction.payload })
    })
  });
```

Every player interaction is reflected in the [redux store](http://redux.js.org/docs/api/Store.html).
You can subscribe to every player event by attatching to the latest action.

You can find a complete list of available types in the [types definition](https://github.com/podlove/podlove-web-player/blob/development/src/store/types.js). 

## Subscribing to the Player

<store-subscribe />
