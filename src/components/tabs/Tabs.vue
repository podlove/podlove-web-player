<template>
  <div class="tabs" :style="containerStyle" v-if="components.visibleTabs.length > 0">
    <TabHeaderComponent>
      <TabHeaderItemComponent :active="tabs.chapters" :click="toggleTab('chapters')" v-if="components.tabs.chapters">
        <ChaptersIcon slot="icon"></ChaptersIcon>
        <span slot="title">{{ $t('CHAPTERS.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent  v-if="components.tabs.share" :active="tabs.share" :click="toggleTab('share')">
        <ShareIcon slot="icon"></ShareIcon>
        <span slot="title">{{ $t('SHARE.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent  v-if="components.tabs.download" :active="tabs.download" :click="toggleTab('download')">
        <DownloadIcon slot="icon"></DownloadIcon>
        <span slot="title">{{ $t('DOWNLOAD.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent :active="tabs.info" v-if="components.tabs.info" :click="toggleTab('info')">
        <InfoIcon slot="icon"></InfoIcon>
        <span slot="title">{{ $t('INFO.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent :active="tabs.audio" v-if="components.tabs.audio" :click="toggleTab('audio')">
        <AudioIcon slot="icon"></AudioIcon>
        <span slot="title">{{ $t('AUDIO.TITLE') }}</span>
      </TabHeaderItemComponent>
    </TabHeaderComponent>

    <TabBodyComponent :active="tabs.chapters" v-if="components.tabs.chapters">
      <ChaptersTab></ChaptersTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.share" v-if="components.tabs.share">
      <ShareTab></ShareTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.download" v-if="components.tabs.download">
      <DownloadTab></DownloadTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.info" v-if="components.tabs.info">
      <InfoTab></InfoTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.audio" v-if="components.tabs.audio">
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
      components: this.$select('components')
    }
  },
  computed: {
    containerStyle () {
      return {
        'background-color': this.theme.tabs.body.background
      }
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
