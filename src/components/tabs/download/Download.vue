<template>
  <div class="download">
    <div class="show-info centered column">
      <img class="episode-poster" v-if="episode.poster || show.poster" :src="episode.poster || show.poster">
      <ul class="episode-meta centered">
        <li class="meta" v-if="episode.publicationDate">{{ $t('DOWNLOAD.PUBLICATION_DATE', episode.publicationDate) }}</li>
        <li class="meta" v-if="episodeDuration.hours > 0">{{ $t('DOWNLOAD.DURATION_WITH_HOURS', episodeDuration) }}</li>
        <li class="meta" v-if="episodeDuration.hours === 0">{{ $t('DOWNLOAD.DURATION', episodeDuration) }}</li>
      </ul>
    </div>
    <div class="file-selection centered column" :style="sectionStyle">
      <ButtonComponent class="action download-button" :href="download.selected" type="link">{{ $t('DOWNLOAD.DOWNLOAD_EPISODE') }}</ButtonComponent>
      <InputSelectComponent class="download-select" :change="setDownloadFile">
        <option v-for="(option, index) in download.files" v-bind:key="index" v-bind:value="option.url" :selected="download.selected === option.url">
          {{ option.title }} • {{ toMegabyte(option.size) }} MB
        </option>
      </InputSelectComponent>
    </div>
  </div>
</template>

<script>
  import { compose } from 'lodash'
  import store from 'store'
  import { calcHours, calcMinutes } from 'utils/time'

  import ButtonComponent from 'shared/Button.vue'
  import InputSelectComponent from 'shared/InputSelect.vue'

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        episode: this.$select('episode'),
        show: this.$select('show'),
        duration: this.$select('duration'),
        download: this.$select('download'),
        audio: this.$select('audio')
      }
    },
    computed: {
      episodeDuration () {
        return {
          hours: calcHours(this.duration),
          minutes: calcMinutes(this.duration)
        }
      },
      sectionStyle () {
        return {
          background: this.theme.tabs.body.section
        }
      }
    },
    methods: {
      toMegabyte (size) {
        return parseInt(parseInt(size) / 1000000)
      },
      setDownloadFile: compose(store.dispatch.bind(store), store.actions.setDownloadFile)
    },
    components: {
      ButtonComponent,
      InputSelectComponent
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .download {
    .show-info {
      padding: $padding;
    }

    .episode-poster {
      height: $download-episode-poster-size;
      margin: $margin;
    }

    .episode-meta {
      flex-wrap: wrap;

      .meta {
        margin: 0 ($margin / 2);
        position: relative;

        &:after {
          content: '•';
          font-weight: 700;
          position: absolute;
          right: $margin / -2 + $margin / -6;
        }

        &:last-child:after {
          content: '';
        }
      }

      @media screen and (max-width: $width-s) {
        .meta:after {
          content: '';
        }
      }
    }

    .file-selection {
      padding: $padding;

      .download-button, .download-select {
        margin: ($margin / 2) $margin;
        width: $download-interaction-size;
      }
    }
  }
</style>
