<template>
  <div class="info-tab" id="tab-info">
    <div class="description">
      <div class="episode">
        <h3 class="title" v-if="episode.title" id="tab-info--episode-title">{{ episode.title }}</h3>
        <p class="meta" id="tab-info--episode-meta">
          <span class="tag" v-if="episode.publicationDate"><calendar-icon class="icon"></calendar-icon>{{ publicationDate }}, {{ publicationTime }}</span>
          <span class="tag" v-if="duration && episodeDuration.hours > 0"><clock-icon class="icon"></clock-icon>{{ $t('DOWNLOAD.DURATION_WITH_HOURS', episodeDuration) }}</span>
          <span class="tag" v-if="duration && episodeDuration.hours === 0"><clock-icon class="icon"></clock-icon>{{ $t('DOWNLOAD.DURATION', episodeDuration) }}</span>
        </p>
        <p class="subtitle" v-if="episode.subtitle" id="tab-info--episode-subtitle">{{ episode.subtitle }}</p>
        <p class="summary" v-if="episode.summary" id="tab-info--episode-summary" v-html="episode.summary"></p>
        <p class="link" v-if="episode.link"><link-icon class="icon"></link-icon><a class="info-link truncate" :href="episode.link" target="_blank" id="tab-info--episode-link">{{ episode.link }}</a></p>
      </div>
      <div class="show">
        <h3 class="title" v-if="show.title" id="tab-info--show-title">{{ show.title }}</h3>
        <img v-if="show.poster" :src="show.poster" id="tab-info--show-poster" class="show-poster shadowed" :alt="$t('A11Y.ALT_SHOW_COVER')"/>
        <p class="summary" v-if="show.summary" id="tab-info--show-summary" v-html="show.summary"></p>
        <p class="link" v-if="show.link"><link-icon class="icon"></link-icon><a class="info-link truncate" :href="show.link" target="_blank" id="tab-info--show-link">{{ show.link }}</a></p>
      </div>
    </div>

    <div class="speakers" v-if="speakers.length > 0">
      <h3 class="title">{{ $t('INFO.ON_AIR') }}</h3>
      <ul class="list" id="tab-info--speakers">
        <li class="speaker" v-for="(speaker, index) in speakers" v-bind:key="index">
          <img :src="speaker.avatar" class="shadowed avatar" :title="speaker.name" :alt="$t('A11Y.SPEAKER_COVER', { name: speaker.name })"/>
          <span class="name">{{ speaker.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'

  import { calcHours, calcMinutes, localeDate, localeTime } from 'utils/time'

  import CalendarIcon from 'icons/CalendarIcon'
  import ClockIcon from 'icons/ClockIcon'
  import LinkIcon from 'icons/LinkIcon'

  export default {
    data: mapState('theme', 'show', 'episode', 'speakers', 'runtime', 'duration'),
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
      },
      publicationTime () {
        return localeTime(this.episode.publicationDate, this.runtime.locale)
      }
    },
    components: {
      CalendarIcon,
      ClockIcon,
      LinkIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .info-tab {
     padding: $padding;

    .icon {
      margin-right: $margin / 2;
    }

    .description {
      display: flex;

      .episode {
        width: 60%;
        padding-right: $padding;
      }

      .show {
        width: 40%;
        padding-left: $padding;
      }

      .meta, .link {
        display: flex;
        align-items: center;

        .tag {
          display: flex;
          align-items: center;
          margin-right: $margin
        }
      }

      .summary {
        hyphens: auto;

        ul, ol {
          margin-left: 1em;
        }

        ul {
          list-style: disc;
        }

        ol {
          list-style: decimal;
        }

        li {
          margin-left: 0.25em;
        }
      }

      .subtitle {
        font-weight: 500;
        hyphens: auto;
      }

      .info-link {
        font-weight: 700;
      }

      .show-poster {
        display: block;
        width: 100%;
        max-width: $info-cover-width;
        height: auto;
        margin-bottom: $margin;
      }
    }

    .speakers {
      .list {
        display: flex;
        flex-wrap: wrap;
      }

      .speaker {
        display: flex;
        width: 33%;
        padding: ($padding / 2);
        overflow: hidden;
        align-items: center;
      }

      .avatar {
        border-radius: 4px;
        width: $info-speaker-avatar-size;
        height: auto;
        margin: $margin / 4;
      }

      .name {
        display: block;
        margin: $margin / 4;
      }
    }


    @media screen and (max-width: $width-m) {
      .description {
        display: block;

        .meta {
          flex-direction: column;
          align-items: left;
        }

        .episode, .show {
          width: 100%;
          padding: 0;
        }

        .show-poster {
          display: none;
        }
      }

      .speakers {
        .speaker {
          width: 100%;
        }
      }
    }

    @media screen and (min-width: $width-m) and (max-width: $width-l) {
      .speakers {
        .speaker {
          width: 50%;
        }
      }
    }
  }
</style>
