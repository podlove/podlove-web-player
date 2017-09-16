<template>
  <div class="tabs" :style="containerStyle" v-if="visibleTabs">
    <TabHeaderComponent>
      <TabHeaderItemComponent v-if="components.tabs.info && components.tabs.info.visible" :active="tabs.info" :click="toggleTab('info')">
        <InfoIcon slot="icon"></InfoIcon>
        <span slot="title">{{ $t('INFO.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="components.tabs.chapters && components.tabs.chapters.visible" :active="tabs.chapters" :click="toggleTab('chapters')">
        <ChaptersIcon slot="icon"></ChaptersIcon>
        <span slot="title">{{ $t('CHAPTERS.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="components.tabs.share && components.tabs.share.visible" :active="tabs.share" :click="toggleTab('share')">
        <ShareIcon slot="icon"></ShareIcon>
        <span slot="title">{{ $t('SHARE.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="components.tabs.download && components.tabs.download.visible" :active="tabs.download" :click="toggleTab('download')">
        <DownloadIcon slot="icon"></DownloadIcon>
        <span slot="title">{{ $t('DOWNLOAD.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="components.tabs.audio && components.tabs.audio.visible" :active="tabs.audio" :click="toggleTab('audio')">
        <AudioIcon slot="icon"></AudioIcon>
        <span slot="title">{{ $t('AUDIO.TITLE') }}</span>
      </TabHeaderItemComponent>
    </TabHeaderComponent>

    <TabBodyComponent :active="tabs.info" v-if="components.tabs.info && components.tabs.info.visible">
      <InfoTab></InfoTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.chapters" v-if="components.tabs.chapters && components.tabs.chapters.visible">
      <ChaptersTab></ChaptersTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.share" v-if="components.tabs.share && components.tabs.share.visible">
      <ShareTab></ShareTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.download" v-if="components.tabs.download && components.tabs.download.visible">
      <DownloadTab></DownloadTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.audio" v-if="components.tabs.audio && components.tabs.audio.visible">
      <AudioTab></AudioTab>
    </TabBodyComponent>
  </div>
</template>

<script>
import store from 'store'
import { get } from 'lodash'

import TabHeaderComponent from 'shared/TabHeader.vue'
import TabHeaderItemComponent from 'shared/TabHeaderItem.vue'
import TabBodyComponent from 'shared/TabBody.vue'

import ChaptersIcon from 'icons/ChaptersIcon.vue'
import ShareIcon from 'icons/ShareIcon.vue'
import DownloadIcon from 'icons/DownloadIcon.vue'
import InfoIcon from 'icons/InfoIcon.vue'
import AudioIcon from 'icons/AudioIcon.vue'

import ChaptersTab from './chapters/Chapters.vue'
import ShareTab from './share/Share.vue'
import AudioTab from './audio/Audio.vue'
import InfoTab from './info/Info.vue'
import DownloadTab from './download/Download.vue'

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
  computed: {
    containerStyle () {
      return {
        'background-color': this.theme.tabs.body.background
      }
    },
    visibleTabs () {
      return Object.keys(this.components.tabs)
        .reduce((result, tab) => {
          if (result) {
            return true
          }

          return get(this.components.tabs, [tab, 'visible'], false)
        }, false)
    }
  },
  methods: {
    toggleTab (tab) {
      return () => {
        store.dispatch(store.actions.toggleTab(tab))
      }
    }
  },
  components: {
    TabHeaderComponent,
    TabHeaderItemComponent,
    TabBodyComponent,

    ChaptersIcon,
    ShareIcon,
    DownloadIcon,
    InfoIcon,
    AudioIcon,

    ShareTab,
    ChaptersTab,
    AudioTab,
    InfoTab,
    DownloadTab
  }
}
</script>

<style lang="scss">
  @import '~styles/variables';

  .tabs {
    width: 100%;
    background: $background-color;
  }
</style>
