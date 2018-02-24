<template>
  <div class="tabs" :style="containerStyle" v-if="hasTabs">
    <tab-header-component>
      <tab-header-item-component v-if="isVisibleTab.info" :active="tabs.info" :click="toggleTab('info')">
        <info-icon slot="icon"></info-icon>
        <span slot="title">{{ $t('INFO.TITLE') }}</span>
      </tab-header-item-component>
      <tab-header-item-component v-if="isVisibleTab.chapters" :active="tabs.chapters" :click="toggleTab('chapters')">
        <chapters-icon slot="icon"></chapters-icon>
        <span slot="title">{{ $t('CHAPTERS.TITLE') }}</span>
      </tab-header-item-component>
      <tab-header-item-component v-if="isVisibleTab.share" :active="tabs.share" :click="toggleTab('share')">
        <share-icon slot="icon"></share-icon>
        <span slot="title">{{ $t('SHARE.TITLE') }}</span>
      </tab-header-item-component>
      <tab-header-item-component v-if="isVisibleTab.download" :active="tabs.download" :click="toggleTab('download')">
        <download-icon slot="icon"></download-icon>
        <span slot="title">{{ $t('DOWNLOAD.TITLE') }}</span>
      </tab-header-item-component>
      <tab-header-item-component v-if="isVisibleTab.transcripts" :active="tabs.transcripts" :click="toggleTab('transcripts')">
        <transcripts-icon slot="icon"></transcripts-icon>
        <span slot="title">{{ $t('TRANSCRIPTS.TITLE') }}</span>
      </tab-header-item-component>
      <tab-header-item-component v-if="isVisibleTab.audio" :active="tabs.audio" :click="toggleTab('audio')">
        <audio-icon slot="icon"></audio-icon>
        <span slot="title">{{ $t('AUDIO.TITLE') }}</span>
      </tab-header-item-component>
    </tab-header-component>

    <tab-body-component v-if="isVisibleTab.info && tabs.info" :active="tabs.info">
      <info-tab></info-tab>
    </tab-body-component>
    <tab-body-component v-if="isVisibleTab.chapters && tabs.chapters" :active="tabs.chapters">
      <chapters-tab></chapters-tab>
    </tab-body-component>
    <tab-body-component v-if="isVisibleTab.share && tabs.share" :active="tabs.share">
      <share-tab></share-tab>
    </tab-body-component>
    <tab-body-component v-if="isVisibleTab.transcripts && tabs.transcripts" :active="tabs.transcripts" class="fixed">
      <transcripts-tab></transcripts-tab>
    </tab-body-component>
    <tab-body-component v-if="isVisibleTab.download && tabs.download" :active="tabs.download">
      <download-tab></download-tab>
    </tab-body-component>
    <tab-body-component v-if="isVisibleTab.audio && tabs.audio" :active="tabs.audio">
      <audio-tab></audio-tab>
    </tab-body-component>
  </div>
</template>

<script>
import store from 'store'

import TabHeaderComponent from 'shared/TabHeader'
import TabHeaderItemComponent from 'shared/TabHeaderItem'
import TabBodyComponent from 'shared/TabBody'

import ChaptersIcon from 'icons/ChaptersIcon'
import ShareIcon from 'icons/ShareIcon'
import DownloadIcon from 'icons/DownloadIcon'
import InfoIcon from 'icons/InfoIcon'
import AudioIcon from 'icons/AudioIcon'
import TranscriptsIcon from 'icons/TranscriptsIcon'

import ChaptersTab from './chapters/Chapters'
import ShareTab from './share/Share'
import AudioTab from './audio/Audio'
import InfoTab from './info/Info'
import DownloadTab from './download/Download'
import TranscriptsTab from './transcripts/Transcripts'

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
        transcripts: this.components.tabs.transcripts && this.visibleComponents.tabTranscripts,
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
    TranscriptsIcon,

    ShareTab,
    ChaptersTab,
    AudioTab,
    InfoTab,
    DownloadTab,
    TranscriptsTab
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
