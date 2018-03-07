<template>
  <div class="download-tab">
    <div class="show-info centered column" v-if="episode.poster || show.poster">
      <img class="episode-poster shadowed" v-if="episode.poster || show.poster" :src="episode.poster || show.poster">
      <ul class="episode-meta centered">
        <li class="meta centered" v-if="episode.publicationDate"><calendar-icon class="icon"></calendar-icon>{{ publicationDate }}</li>
        <li class="meta centered" v-if="episodeDuration.hours > 0"><clock-icon class="icon" size="15"></clock-icon>{{ $t('DOWNLOAD.DURATION_WITH_HOURS', episodeDuration) }}</li>
        <li class="meta centered" v-if="episodeDuration.hours === 0"><clock-icon class="icon" size="15"></clock-icon>{{ $t('DOWNLOAD.DURATION', episodeDuration) }}</li>
      </ul>
    </div>
    <div class="file-selection centered column" :style="sectionStyle">
      <button-component class="action download-button" :href="download.selected" type="link" download>{{ $t('DOWNLOAD.ACTIONS.DOWNLOAD') }}</button-component>
      <button-component class="action copy-button" :data-clipboard-text="download.selected" v-clipboard>{{ $t('DOWNLOAD.ACTIONS.COPY') }}</button-component>
      <input-select-component class="download-select" :change="setDownloadFile">
        <option v-for="(option, index) in download.files" v-bind:key="index" v-bind:value="option.url" :selected="download.selected === option.url">
          {{ option.title }} • {{ toMegabyte(option.size) }} MB
        </option>
      </input-select-component>
    </div>
  </div>
</template>

<script>
  import { compose } from 'lodash'
  import store from 'store'
  import { calcHours, calcMinutes, localeDate } from 'utils/time'

  import ButtonComponent from 'shared/Button'
  import InputSelectComponent from 'shared/InputSelect'

  import ClockIcon from 'icons/ClockIcon'
  import CalendarIcon from 'icons/CalendarIcon'

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        episode: this.$select('episode'),
        show: this.$select('show'),
        duration: this.$select('duration'),
        download: this.$select('download'),
        audio: this.$select('audio'),
        runtime: this.$select('runtime')
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
      },
      publicationDate () {
        return localeDate(this.episode.publicationDate, this.runtime.locale)
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
      InputSelectComponent,
      ClockIcon,
      CalendarIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .download-tab {
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
      }

      .icon {
        margin-right: $margin / 2;
      }
    }

    .file-selection {
      padding: $padding;

      .download-button, .download-select, .copy-button {
        margin: ($margin / 2) $margin;
        width: $download-interaction-size;
      }
    }
  }
</style>
