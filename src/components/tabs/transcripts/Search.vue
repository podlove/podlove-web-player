<template>
    <div class="transcripts-search">
      <div class="search-input">
        <input
          type="text"
          class="input"
          :style="searchInputStyle"
          @input="search"
          :value="transcripts.search.query"
          :placeholder="$t('TRANSCRIPTS.SEARCH')">
          <button class="delete-icon" v-if="transcripts.search.query.length > 2" @click="reset()">
            <search-delete-icon :text-color="theme.button.color" :background-color="theme.button.background"></search-delete-icon>
          </button>
      </div>
      <div class="search-navigation" v-if="transcripts.search.query.length > 2">
        <div class="search-stepper">
          <button class="stepper" @click="previousSearchResult()" v-if="transcripts.search.results.length > 0">
            <previous-search-icon :textColor="theme.button.color" :backgroundColor="theme.button.background"></previous-search-icon>
          </button>
          <button class="stepper" @click="nextSearchResult()" v-if="transcripts.search.results.length > 0">
            <next-search-icon :textColor="theme.button.color" :backgroundColor="theme.button.background"></next-search-icon>
          </button>
        </div>
        <div class="search-results counter" v-if="transcripts.search.results.length > 0">{{ `${transcripts.search.selected + 1} / ${transcripts.search.results.length}` }}</div>
        <div class="search-results truncate" v-else>{{ $t('TRANSCRIPTS.NO_SEARCH_RESULTS') }}</div>
      </div>
    </div>
</template>

<script>
import store from 'store'

import NextSearchIcon from 'icons/NextSearchIcon'
import PreviousSearchIcon from 'icons/PreviousSearchIcon'
import SearchDeleteIcon from 'icons/SearchDeleteIcon'

export default {
  data () {
    return {
      theme: this.$select('theme'),
      transcripts: this.$select('transcripts')
    }
  },
  methods: {
    search (event) {
      store.dispatch(store.actions.searchTranscripts(event.target.value))
      store.dispatch(store.actions.followTranscripts(false))
    },
    reset () {
      store.dispatch(store.actions.resetSearchTranscription())
    },
    previousSearchResult () {
      store.dispatch(store.actions.previousTranscriptsSearchResult())
    },
    nextSearchResult () {
      store.dispatch(store.actions.nextTranscriptsSearchResult())
    }
  },
  computed: {
    searchInputStyle () {
      return {
        background: this.theme.input.background,
        color: this.theme.input.color,
        'border-color': this.theme.input.border
      }
    }
  },
  components: {
    NextSearchIcon,
    PreviousSearchIcon,
    SearchDeleteIcon
  }
}
</script>

<style lang="scss">
  @import '~styles/variables';
  @import '~styles/utils';

  .transcripts-search {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;

    .search-input {
      // Padding left and right transcripts-header
      max-width: $width-xs;
      position: relative;
      margin-right: 0.5em;
      width: 100%;

      .input {
        padding: 0.2em 24px 0.2em 1em;
        font-size: 1em;
        border-radius: 1em;
        border-width: 1px;
        border-style: solid;
        height: 100%;
        width: 100%;
        font-weight: 300;

        &::placeholder {
          color: currentColor;
          opacity: 0.6;
        }
      }

      .delete-icon {
        position: absolute;
        right: 2px;
        top: 2px;
      }
    }

    .search-navigation {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-right: 0.5em;

      @media screen and (max-width: $width-l) {
        width: 25%;
      }

      .search-stepper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;

        .stepper {
          display: inherit;
          margin: 0 0.25em;
        }
      }

      .search-results {
        white-space: nowrap;
        margin-left: 0.5em;

        &.counter {
          @media screen and (max-width: $width-l) {
            display: none;
          }
        }
      }
    }
  }
</style>
