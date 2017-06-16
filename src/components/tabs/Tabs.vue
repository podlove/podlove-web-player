<template>
  <div class="tabs" :style="containerStyle(theme)">
    <TabHeaderComponent>
      <TabHeaderItemComponent :active="tabs.chapters" :click="toggleTab('chapters')" v-if="components.tabs.chapters">
        <ChaptersIcon slot="icon"></ChaptersIcon>
        <span slot="title">{{ $t('CHAPTERS.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent  v-if="components.tabs.share" :active="tabs.share" :click="toggleTab('share')">
        <ShareIcon slot="icon"></ShareIcon>
        <span slot="title">{{ $t('SHARE.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent :active="tabs.settings" v-if="components.tabs.settings" :click="toggleTab('settings')">
        <SettingsIcon slot="icon"></SettingsIcon>
        <span slot="title">{{ $t('SETTINGS.TITLE') }}</span>
      </TabHeaderItemComponent>
    </TabHeaderComponent>
    <TabBodyComponent :active="tabs.chapters" v-if="components.tabs.chapters">
      <ChaptersTab />
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.share" v-if="components.tabs.share">
      <ShareTab />
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.settings" v-if="components.tabs.settings">
      <SettingsTab />
    </TabBodyComponent>
  </div>
</template>

<script>
import store from 'store'

import TabHeaderComponent from 'shared/TabHeader.vue'
import TabHeaderItemComponent from 'shared/TabHeaderItem.vue'
import TabBodyComponent from 'shared/TabBody.vue'

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
  data () {
    return {
      theme: this.$select('theme'),
      tabs: this.$select('tabs'),
      chapters: this.$select('chapters'),
      reference: this.$select('reference'),
      components: this.$select('components')
    }
  },
  methods: {
    containerStyle,
    toggleTab
  },
  components: {
    TabHeaderComponent,
    TabHeaderItemComponent,
    TabBodyComponent,
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

  .tabs {
    width: 100%;
    background: $background-color;
  }
</style>
