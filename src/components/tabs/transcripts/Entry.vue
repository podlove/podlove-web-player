<template>
  <div class="entry" :class="{
    chapter: entry.type === 'chapter',
    transcript: entry.type === 'transcript',
    speaker: entry.speaker
  }">
    <span class="chapter"
      v-if="entry.type === 'chapter'"
      :style="chapterStyle"
      @dblclick="onDoubleClick(entry)"
      @click="onClick(entry)">{{ $t('TRANSCRIPTS.CHAPTER', entry) }}</span>
    <span class="transcript" v-else>
      <span class="speaker" v-if="entry.speaker">
        <span class="speaker-background" :style="speakerBackgroundStyle"></span>
        <img class="speaker-avatar" v-if="entry.speaker.avatar" :src="entry.speaker.avatar" />
        <span class="speaker-name" v-if="entry.speaker.name" :style="speakerTextStyle">{{ entry.speaker.name }}</span>
      </span>
      <span class="text"
        v-for="(transcript, tindex) in entry.texts"
        :key="tindex"
        :style="activeStyle(transcript)"
        :class="{ last: tindex === (entry.texts.length - 1), active: activePlaytime(transcript), inactive: playtime > transcript.end }"
        @mouseover="onMouseOver(transcript)"
        @mouseleave="onMouseLeave(transcript)"
        @click="onClick(transcript)"
        v-html="searchText(transcript.text)"
        ></span>
    </span>
  </div>
</template>

<script>
export default {
  data () {
    return {
      theme: this.$select('theme')
    }
  },
  props: ['entry', 'playtime', 'ghost', 'prerender', 'query'],
  computed: {
    chapterStyle () {
      if (this.prerender) {
        return {}
      }

      return {
        background: this.theme.tabs.transcripts.chapter.background,
        color: this.theme.tabs.transcripts.chapter.color
      }
    },
    speakerBackgroundStyle () {
      if (this.prerender) {
        return {}
      }

      return {
        background: this.theme.tabs.transcripts.chapter.background
      }
    },
    speakerTextStyle () {
      if (this.prerender) {
        return {}
      }

      return {
        color: this.theme.tabs.transcripts.chapter.color
      }
    },
    searchQuery () {
      if (!this.query && this.query.length < 2) {
        return null
      }

      return new RegExp(this.query, 'ig')
    }
  },
  methods: {
    // Event Bindings
    onClick (entry) {
      this.$emit('onClick', entry)
    },

    onMouseLeave (transcript) {
      this.$emit('onMouseLeave', transcript)
    },

    onMouseOver (transcript) {
      this.$emit('onMouseOver', transcript)
    },

    searchText (text) {
      return this.query ? text.toString().replace(this.searchQuery, matchedText => `<span class="highlight">${matchedText}</span>`) : text
    },

    // Utilities
    activePlaytime (transcript) {
      if (transcript.start > this.playtime) {
        return false
      }

      if (transcript.end < this.playtime) {
        return false
      }

      return true
    },

    activeGhost (transcript) {
      if (!this.ghost) {
        return false
      }

      if (!this.ghost.active) {
        return false
      }

      if (transcript.start > this.ghost.time) {
        return false
      }

      if (transcript.end < this.ghost.time) {
        return false
      }

      return true
    },

    activeStyle (transcript) {
      if (this.prerender) {
        return {}
      }

      if (this.activePlaytime(transcript)) {
        return {
          background: this.theme.tabs.transcripts.active.background,
          color: this.theme.tabs.transcripts.active.color,
          border: `1px solid ${this.theme.tabs.transcripts.active.background}`
        }
      }

      if (this.activeGhost(transcript)) {
        return {
          background: this.theme.tabs.transcripts.ghost.background,
          color: this.theme.tabs.transcripts.ghost.color,
          border: `1px solid ${this.theme.tabs.transcripts.ghost.background}`
        }
      }

      return {}
    }
  }
}
</script>

<style lang="scss">
  @import '~styles/variables';

  .entry {
    cursor: pointer;
    padding: 0.25em 1.25em;

    &.speaker {
      padding: 0.25em 1.5em 0.25em 3.5em;
    }

    &.chapter {
      padding: 0.25em 0;
    }

    .transcript {
      display: block;
      line-height: 1.5em;
    }

    &:first-child {
      padding-top: 0;
    }

    .chapter {
      display: block;
      font-style: italic;
      width: 100%;
      padding: 0.25em 0;
      text-align: center;
    }

    .speaker {
      display: inline-block;
      position: relative;
      margin-left: -2.25em;
      margin-right: 0.4em;

      .speaker-background {
        position: absolute;
        left: 0;
        transform: translateY(0.4em);
        width: calc(100% + 0.5em);
        height: 1.5em;
        border-radius: 0.75em;
      }

      .speaker-name {
        position: relative;
        font-weight: 500;
      }

      .speaker-avatar {
        height: 1.5em;
        width: auto;
        border-radius: 0.75em;
        transform: translateY(0.4em);
        margin-right: 0.25em;
      }
    }

    .text {
      border-radius: 4px;
      padding: 0.1em;
      margin: 0 0.1em 0 0;
      line-height: 0;
      border: 1px solid transparent;

      &.inactive {
        opacity: 0.75;
      }

      &.last {
        margin-right: 0;
      }
    }

    .highlight {
      background-color: $search-highlight-color;
    }
  }
</style>
