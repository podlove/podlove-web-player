<template>
  <div class="tabs" :style="containerStyle" v-if="hasTabs">
    <TabHeaderComponent>
      <TabHeaderItemComponent v-if="isVisibleTab.info" :active="tabs.info" :click="toggleTab('info')">
        <InfoIcon slot="icon"></InfoIcon>
        <span slot="title">{{ $t('INFO.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="isVisibleTab.chapters" :active="tabs.chapters" :click="toggleTab('chapters')">
        <ChaptersIcon slot="icon"></ChaptersIcon>
        <span slot="title">{{ $t('CHAPTERS.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="isVisibleTab.share" :active="tabs.share" :click="toggleTab('share')">
        <ShareIcon slot="icon"></ShareIcon>
        <span slot="title">{{ $t('SHARE.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="isVisibleTab.download" :active="tabs.download" :click="toggleTab('download')">
        <DownloadIcon slot="icon"></DownloadIcon>
        <span slot="title">{{ $t('DOWNLOAD.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent v-if="isVisibleTab.audio" :active="tabs.audio" :click="toggleTab('audio')">
        <AudioIcon slot="icon"></AudioIcon>
        <span slot="title">{{ $t('AUDIO.TITLE') }}</span>
      </TabHeaderItemComponent>
    </TabHeaderComponent>

    <TabBodyComponent v-if="isVisibleTab.info" :active="tabs.info">
      <InfoTab></InfoTab>
    </TabBodyComponent>
    <TabBodyComponent v-if="isVisibleTab.chapters" :active="tabs.chapters">
      <ChaptersTab></ChaptersTab>
    </TabBodyComponent>
    <TabBodyComponent v-if="isVisibleTab.share" :active="tabs.share">
      <ShareTab></ShareTab>
    </TabBodyComponent>
    <TabBodyComponent v-if="isVisibleTab.download" :active="tabs.download">
      <DownloadTab></DownloadTab>
    </TabBodyComponent>
    <TabBodyComponent v-if="isVisibleTab.audio" :active="tabs.audio">
      <AudioTab></AudioTab>
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
      visibleComponents: this.$select('visibleComponents'),
      components: this.$select('components')
    }
  },
  computed: {
    containerStyle () {
      return {
        'background-color': this.theme.tabs.body.background
      }
    },
    isVisibleTab () {
      return {
        info: this.components.tabs.info && this.visibleComponents.tabInfo,
        chapters: this.components.tabs.chapters && this.visibleComponents.tabChapters,
        share: this.components.tabs.share && this.visibleComponents.tabShare,
        download: this.components.tabs.download && this.visibleComponents.tabDownload,
        audio: this.components.tabs.audio && this.visibleComponents.tabAudio
      }
    },
    hasTabs () {
      return Object.keys(this.isVisibleTab)
        .reduce((result, tab) => {
          if (result) {
            return true
          }

          return this.isVisibleTab[tab]
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
