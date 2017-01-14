<template>
  <div class="podlove-tabs" :style="containerStyle(theme)" :class="playstate">
    <ul class="podlove-tabs--tab-header" :style="headerStyle(theme)">
      <li class="podlove-tabs--tab-header--element" :style="tabStyle(theme)">
        <ChaptersIcon class="podlove-tabs--tab-header--icon" :color="theme.primary" />
        <span class="podlove-tabs--tab-header--caption">Kapitel</span>
      </li>
    </ul>
    <ChaptersTab />
  </div>
</template>

<script>
import color from 'color'

import ChaptersIcon from '../icons/ChaptersIcon.vue'

import ChaptersTab from './chapters/Chapters.vue'

const containerStyle = theme => ({
  'background-color': theme.primary
})

const headerStyle = theme => ({
  color: color(theme.secondary).fade(0.2),
  'background-color': color(theme.primary).darken(0.1)
})

const tabStyle = theme => ({
  color: theme.primary,
  'background-color': theme.secondary
})

export default {
  data() {
    return {
      playstate: this.$select('playstate'),
      theme: this.$select('theme')
    }
  },
  methods: {
    containerStyle,
    headerStyle,
    tabStyle,
    color
  },
  components: {
    ChaptersIcon,
    ChaptersTab
  }
}
</script>

<style lang="scss">
  @import 'variables';

  .podlove-tabs {
    width: 100%;

    &.start, &.idle {
      overflow: hidden;
      max-height: 0;
    }
  }

  .podlove-tabs--tab-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    list-style: none;
    font-weight: 100;
    text-transform: uppercase;
  }

  .podlove-tabs--tab-header--element {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ($padding / 2) $padding;
    width: 100%;
    margin: 0;
  }

  .podlove-tabs--tab-header--caption {
    margin-left: $margin / 2;
    overflow: hidden;
  }
</style>
