<template>
  <div class="info-tab">
    <div class="description">
      <div class="episode">
        <h3 class="title" v-if="episode.title">{{ episode.title }}</h3>
        <p class="meta">
          <span class="tag" v-if="episode.publicationDate"><CalendarIcon class="icon"></CalendarIcon>{{ publicationDate }}, {{ publicationTime }}</span>
          <span class="tag" v-if="duration && episodeDuration.hours > 0"><ClockIcon class="icon"></ClockIcon>{{ $t('DOWNLOAD.DURATION_WITH_HOURS', episodeDuration) }}</span>
          <span class="tag" v-if="duration && episodeDuration.hours === 0"><ClockIcon class="icon"></ClockIcon>{{ $t('DOWNLOAD.DURATION', episodeDuration) }}</span>
        </p>
        <p class="subtitle" v-if="episode.subtitle">{{ episode.subtitle }}</p>
        <p class="summary" v-if="episode.summary">{{ episode.summary }}</p>
        <p class="link" v-if="episode.link"><LinkIcon class="icon"></LinkIcon><a class="info-link truncate" :href="episode.link" target="_blank">{{ episode.link }}</a></p>
      </div>
      <div class="show">
        <h3 class="title" v-if="show.title">{{ show.title }}</h3>
        <img v-if="show.poster" :src="show.poster" class="show-poster shadowed"/>
        <p class="summary" v-if="show.summary">{{ show.summary }}</p>
        <p class="link" v-if="show.link"><LinkIcon class="icon"></LinkIcon><a class="info-link truncate" :href="show.link" target="_blank">{{ show.link }}</a></p>
      </div>
    </div>

    <div class="contributors" v-if="contributors.length > 0">
      <h3 class="title">{{ $t('INFO.ON_AIR') }}</h3>
      <ul class="list">
        <li class="contributor" v-for="(contributor, index) in contributors" v-bind:key="index">
          <img :src="contributor.avatar" class="shadowed avatar" :title="contributor.name" />
          <span class="name">{{ contributor.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { calcHours, calcMinutes, localeDate, localeTime } from 'utils/time'

  import CalendarIcon from 'icons/CalendarIcon.vue'
  import ClockIcon from 'icons/ClockIcon.vue'
  import LinkIcon from 'icons/LinkIcon.vue'

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        show: this.$select('show'),
        episode: this.$select('episode'),
        contributors: this.$select('contributors'),
        runtime: this.$select('runtime'),
        duration: this.$select('duration')
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

      .subtitle {
        font-weight: 500;
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

    .contributors {
      .list {
        display: flex;
        flex-wrap: wrap;
      }

      .contributor {
        display: flex;
        width: 33%;
        padding: ($padding / 2);
        overflow: hidden;
        align-items: center;
      }

      .avatar {
        border-radius: 4px;
        width: $info-contributor-avatar-size;
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

      .contributors {
        .contributor {
          width: 100%;
        }
      }
    }

    @media screen and (min-width: $width-m) and (max-width: $width-l) {
      .contributors {
        .contributor {
          width: 50%;
        }
      }
    }
  }
</style>
