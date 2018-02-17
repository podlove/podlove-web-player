<template>
  <div class="transcripts" :class="{ 'has-search-results': hasSearchResults }">
    <div class="transcripts-header">
      <search></search>
      <follow class="follow-button"></follow>
    </div>
    <!-- Render -->
    <render-container class="transcripts-container" :prerender="prerender" v-if="prerender.length > 0"></render-container>
    <!-- Prerender -->
    <prerender-container class="transcripts-container" :transcripts="transcripts.timeline" @load="loadPrerender" v-else></prerender-container>
  </div>
</template>

<script>
import PrerenderContainer from './Prerender.vue'
import RenderContainer from './Render.vue'
import Search from './Search.vue'
import Follow from './Follow.vue'

export default {
  data () {
    return {
      transcripts: this.$select('transcripts'),
      prerender: []
    }
  },
  methods: {
    loadPrerender (prerender) {
      this.prerender = prerender
    },
    render () {
      this.prerender = []
    }
  },
  computed: {
    activeTranscript () {
      return this.transcripts.active
    },
    activeFollow () {
      return this.transcripts.follow
    },
    selectedSearch () {
      return this.transcripts.search.selected
    },
    hasSearchResults () {
      return this.transcripts.search.query.length > 2
    }
  },
  mounted () {
    this.render()
    window.addEventListener('resize', this.render.bind(this))
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.render.bind(this))
  },
  components: {
    PrerenderContainer,
    RenderContainer,
    Search,
    Follow
  }
}
</script>

<style lang="scss">
  @import '~styles/variables';

  .transcripts {
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .transcripts-header {
    height: $transcripts-header-height;
    box-shadow: 0 4px 2px -2px rgba($overlay-color, 0.1);
    padding: 1em;
    display: flex;
    align-items: center;
    justify-content: space-between;

    > * {
      height: $transcripts-header-element-height;
    }
  }

  .transcripts-container {
    position: relative;
    max-height: $tabs-body-max-height - $transcripts-height;
    overflow-y: auto;
    padding: 0;
  }

  @media screen and (max-width: $width-m) {
    .transcripts.has-search-results .follow-button {
      display: none;
    }

    .transcripts.has-search-results .search-navigation {
      justify-content: flex-end;
      margin-right: 0;
    }
  }
</style>
