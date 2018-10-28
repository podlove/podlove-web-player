<template>
  <div class="files-tab" id="tab-files">
    <div class="files-container" :style="containerStyle" v-if="audio.length" id="tab-files--audio">
      <div class="files-container--header" :style="headerStyle">
        {{ $t('FILES.TYPES.AUDIO.HEADER') }}
      </div>
      <div class="files-container--body">
        <file-component v-for="(file, index) in audio" :file="file" :key="index" />
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'
  import { selectAudioFiles } from 'store/selectors'

  import FileComponent from './File'

  export default {
    data: mapState({
      theme: 'theme',
      audio: selectAudioFiles
    }),

    computed: {
      containerStyle () {
        return this.theme.tabs.files.container
      },

      headerStyle () {
        return this.theme.tabs.files.header
      }
    },

    components: {
      FileComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .files-tab {
    padding: 1.5em;

    .files-container {
      border-radius: 4px;
      margin-bottom: 1em;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .files-container--header {
      padding: 0.5em;
      border-radius: 4px 4px 0 0;
      font-weight: 500;
      text-transform: uppercase;
    }

    .files-container--body {
      padding: 1em;
    }
  }
</style>
