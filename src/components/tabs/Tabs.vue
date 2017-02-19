<template>
  <div class="podlove-tabs" :style="containerStyle(theme)" :class="mode">
    <ul class="podlove-tabs--tab-header" :style="headerStyle(theme)">
      <li class="podlove-tabs--tab-header--element" :style="tabStyle(theme, tabs.chapters)" :class="{active: tabs.chapters}" v-if="chapters.length > 0">
        <a href="javascript:void(0);" @click.prevent="toggleTab('chapters')" class="podlove-tabs--tab-header--caption">
          <ChaptersIcon class="podlove-tabs--tab-header--icon" :color="iconColor(theme, tabs.chapters)" />
          <span class="podlove-tabs--tab-header--title">Kapitel</span>
          <CloseIcon class="podlove-tabs--tab-header--close" :color="iconColor(theme, true)" v-if="tabs.chapters" />
        </a>
      </li>
      <li class="podlove-tabs--tab-header--element" :style="tabStyle(theme, tabs.settings)" :class="{active: tabs.settings}">
        <a href="javascript:void(0);" @click.prevent="toggleTab('settings')" class="podlove-tabs--tab-header--caption">
          <SettingsIcon class="podlove-tabs--tab-header--icon" :color="iconColor(theme, tabs.settings)" />
          <span class="podlove-tabs--tab-header--title">Settings</span>
          <CloseIcon class="podlove-tabs--tab-header--close" :color="iconColor(theme, true)" v-if="tabs.settings" />
        </a>
      </li>
    </ul>
    <div class="podlove-tabs--tab-body" :class="{active: tabs.chapters}" v-if="chapters.length > 0">
      <ChaptersTab />
    </div>

    <div class="podlove-tabs--tab-body" :class="{active: tabs.settings}">
      <SettingsTab />
    </div>
  </div>
</template>

<script>
import color from 'color'
import store from 'store'

import ChaptersIcon from 'icons/ChaptersIcon.vue'
import SettingsIcon from 'icons/SettingsIcon.vue'
import CloseIcon from 'icons/CloseIcon.vue'

import ChaptersTab from './chapters/Chapters.vue'
import SettingsTab from './settings/Settings.vue'

const containerStyle = theme => ({
  'background-color': theme.tabs.body.background
})

const headerStyle = theme => ({
  'background-color': color(theme.tabs.header.background).darken(0.1)
})

const tabStyle = (theme, active) => ({
  color: active ? theme.tabs.header.colorActive : color(theme.tabs.header.color).fade(0.2)
})

const iconColor = (theme, active) =>
  active ? theme.tabs.header.colorActive : color(theme.tabs.header.color).fade(0.2)

const toggleTab = tab => {
  store.dispatch(store.actions.toggleTab(tab))
}

export default {
  data() {
    return {
      playstate: this.$select('playstate'),
      theme: this.$select('theme'),
      tabs: this.$select('tabs'),
      mode: this.$select('mode'),
      chapters: this.$select('chapters')
    }
  },
  methods: {
    containerStyle,
    headerStyle,
    tabStyle,
    color,
    iconColor,
    toggleTab
  },
  components: {
    ChaptersIcon,
    ChaptersTab,
    SettingsIcon,
    SettingsTab,
    CloseIcon
  }
}
</script>

<style lang="scss">
  @import 'variables';

  .podlove-tabs {
    width: 100%;
    background: $background-color;
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
    height: $tabs-header-height;
  }

  .podlove-tabs--tab-header--element {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ($padding / 2) $padding;
    width: 100%;
    margin: 0;
    height: $tabs-header-height;
    transition: all $animation-duration;

    &.active {
      background-color: $background-color;
    }
  }

  .podlove-tabs--tab-header--caption {
    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;
    vertical-align: middle;
    text-align: center;
    width: 100%;
  }

  .podlove-tabs--tab-body {
    max-height: 0;
    overflow: hidden;
    background-color: $background-color;

    &.active {
      max-height: $tabs-body-max-height;
      overflow-y: auto;
    }
  }

  .podlove-tabs--tab-header--icon {
    margin-right: $margin / 3;
  }

  .podlove-tabs--tab-header--close {
    display: none;
  }

  // Share mode
  .podlove-tabs.share {
    .podlove-tabs--tab-header--element.active {
      position: fixed;
      top: 0;
    }

    .podlove-tabs--tab-body {
      top: 100%;
      position: fixed;
      transition: top $animation-duration;
    }

    .podlove-tabs--tab-body.active {
      top: $tabs-header-height;
      width: 100%;
      height: calc(100% - #{$tabs-header-height})
    }

    .podlove-tabs--tab-header--close {
      display: block;
      position: fixed;
      top: $margin / 2;
      right: $margin / 2;
    }
  }
</style>
