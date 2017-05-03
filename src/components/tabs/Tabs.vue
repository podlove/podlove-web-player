<template>
  <div class="podlove-tabs" :style="containerStyle(theme)">
    <TabHeader>
      <TabHeaderItem :active="tabs.chapters" :click="toggleTab('chapters')" v-if="chapters.length > 0">
        <ChaptersIcon slot="icon"></ChaptersIcon>
        <span slot="title">Kapitel</span>
      </TabHeaderItem>
      <TabHeaderItem v-if="(reference.config && reference.share) || reference.origin" :active="tabs.share" :click="toggleTab('share')">
        <ShareIcon slot="icon"></ShareIcon>
        <span slot="title">Share</span>
      </TabHeaderItem>
      <TabHeaderItem :active="tabs.settings" :click="toggleTab('settings')">
        <SettingsIcon slot="icon"></SettingsIcon>
        <span slot="title">Settings</span>
      </TabHeaderItem>
    </TabHeader>
    <TabBody :active="tabs.chapters" v-if="chapters.length > 0">
      <ChaptersTab />
    </TabBody>
    <TabBody :active="tabs.share" v-if="(reference.config && reference.share) || reference.origin">
      <ShareTab />
    </TabBody>
    <TabBody :active="tabs.settings">
      <SettingsTab />
    </TabBody>
  </div>
</template>

<script>
import store from 'store'

import TabHeader from 'shared/TabHeader.vue'
import TabHeaderItem from 'shared/TabHeaderItem.vue'
import TabBody from 'shared/TabBody.vue'

import ChaptersIcon from 'icons/ChaptersIcon.vue'
import ShareIcon from 'icons/ShareIcon.vue'
import SettingsIcon from 'icons/SettingsIcon.vue'

import ChaptersTab from './chapters/Chapters.vue'
import ShareTab from './share/Share.vue'
import SettingsTab from './settings/Settings.vue'

const containerStyle = theme => ({
  'background-color': theme.tabs.body.background
})

const toggleTab = tab => () => {
  store.dispatch(store.actions.toggleTab(tab))
}

export default {
  data() {
    return {
      playstate: this.$select('playstate'),
      theme: this.$select('theme'),
      tabs: this.$select('tabs'),
      mode: this.$select('mode'),
      chapters: this.$select('chapters'),
      reference: this.$select('reference')
    }
  },
  methods: {
    containerStyle,
    toggleTab
  },
  components: {
    TabHeader,
    TabHeaderItem,
    TabHeaderItem,
    TabBody,
    ChaptersIcon,
    ChaptersTab,
    ShareIcon,
    ShareTab,
    SettingsIcon,
    SettingsTab
  }
}
</script>

<style lang="scss">
  @import 'variables';

  .podlove-tabs {
    width: 100%;
    background: $background-color;
  }
</style>
