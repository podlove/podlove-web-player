---
layout: page
title: Extensions
navigation: 8
---

# Extensions

## External Event Handling

External event handling gives you the ability to control the player from other dom elements.

### Installation

```javascript
  <script src="extensions/external-events.js"></script>
  <div id="player-id"></div>
  <script>
    podlovePlayer('#player-id', 'path/to/config')
      .then(registerExternalEvents('player-id'));
  </script>
```

### Usage

```javascript
  <a
    href="javascript:void(0)"
    rel="podlove-web-player" // Registeres event handler
    data-ref="player-id"     // ID of player to control, if undefined all players without an ID are controlled
    data-action="play|pause" // Action that is triggered on click (optional)
    data-time="00:10:10.500" // Time in simple time format that is selected (optional)
    data-tab="info|chapters|transcripts|share|download|audio" // Tab that is selected on interaction (optional)
  >External Element</a>
```
### Example

<button class="button" rel="podlove-web-player" data-ref="example-player" data-action="play">play</button>
<button class="button" rel="podlove-web-player" data-ref="example-player" data-action="pause">pause</button>
<button class="button" rel="podlove-web-player" data-ref="example-player" data-time="00:10:00">set time</button>
<button class="button" rel="podlove-web-player" data-ref="example-player" data-tab="download">activate download tab</button>
<button class="button" rel="podlove-web-player" data-ref="example-player" data-action="play" data-time="00:10:00" data-tab="download">all combined</button>

<p id="example-player" class="section"></p>
<script src="{{ 'embed.js' | relative_url }}"></script>
<script src="{{ 'extensions/external-events.js' | relative_url }}"></script>
<script>
    podlovePlayer('#example-player', './fixtures/example.json').then(registerExternalEvents('example-player'));
</script>

