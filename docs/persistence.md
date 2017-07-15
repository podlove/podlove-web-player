---
layout: page
title: Player Persistence
navigation: 5
---

# Persistence

<p id="example"></p>
<script src="{{ 'embed.js' | relative_url }}"></script>
<script>
    podlovePlayer('#example', './fixtures/example.json');
</script>

## Local Storage

Information like the current playtime is persisted in the browser local storage per episode.
Episodes meta objects are hashed to create a episode specific hash code:

```javascript
{
   "pwp": {
      "133677995": {
        "tabs": {
          "chapters": false,
          "settings": false,
          "share": true
        }
      },
      "3804781328": {
        "tabs": {
          "chapters": false,
          "settings": false,
          "share": false
        }
      },
      "-5005988967": {
        "playtime": 236.400308,
        "quantiles": [
          [
            0.445033,
            3.945098
          ],
          [
            230.396353,
            236.400308
          ]
        ]
      }
   }
}
```

## Url
The player configuration can be set via url parameters.
This feature is used for deep linking, but can also be used to set custom meta information, like the title:

- Custom Playtime: [{{ "persistence?t=01:33:07" | relative_url }}]({{ "persistence?t=01:33:07" | relative_url }})
