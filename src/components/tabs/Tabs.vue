<template>
  <div class="tabs" :style="containerStyle">
    <TabHeaderComponent>
      <TabHeaderItemComponent :active="tabs.chapters" :click="toggleTab('chapters')" v-if="components.tabs.chapters">
        <ChaptersIcon slot="icon"></ChaptersIcon>
        <span slot="title">{{ $t('CHAPTERS.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent  v-if="components.tabs.share" :active="tabs.share" :click="toggleTab('share')">
        <ShareIcon slot="icon"></ShareIcon>
        <span slot="title">{{ $t('SHARE.TITLE') }}</span>
      </TabHeaderItemComponent>
      <TabHeaderItemComponent :active="tabs.audio" v-if="components.tabs.audio" :click="toggleTab('audio')">
        <SpeakerMuteIcon slot="icon" v-if="muted"></SpeakerMuteIcon>
        <SpeakerIcon slot="icon" v-else></SpeakerIcon>
        <span slot="title">{{ $t('AUDIO.TITLE') }}</span>
      </TabHeaderItemComponent>
    </TabHeaderComponent>
    <TabBodyComponent :active="tabs.chapters" v-if="components.tabs.chapters">
      <ChaptersTab></ChaptersTab>
    </TabBodyComponent>
    <TabBodyComponent :active="tabs.share" v-if="components.tabs.share">
      <ShareTab></ShareTab>
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
import SpeakerIcon from 'icons/SpeakerIcon.vue'
import SpeakerMuteIcon from 'icons/SpeakerMuteIcon.vue'

import ChaptersTab from './chapters/Chapters.vue'
import ShareTab from './share/Share.vue'
import AudioTab from './audio/Audio.vue'

export default {
  data () {
    return {
      theme: this.$select('theme'),
      tabs: this.$select('tabs'),
      chapters: this.$select('chapters'),
      reference: this.$select('reference'),
      components: this.$select('components'),
      muted: this.$select('muted')
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
    ChaptersTab,
    ShareIcon,
    ShareTab,
    SpeakerIcon,
    SpeakerMuteIcon,
    AudioTab
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
