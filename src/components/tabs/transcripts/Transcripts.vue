<template>
  <div class="transcripts">
    <div class="transcripts-header">
      <search></search>
      <follow></follow>
    </div>
    <!-- Render -->
    <render-container class="transcripts-container" :prerender="prerender" v-if="prerender.length > 0"></render-container>
    <!-- Prerender -->
    <prerender-container class="transcripts-container" :transcripts="transcripts.timeline" @load="loadPrerender" v-else></prerender-container>
  </div>
</template>

<script>
import { debounce } from 'lodash'

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
    }
  },
  mounted () {
    const rerender = debounce(() => {
      // Trigger rerendering
      this.prerender = []
    }, 1000)

    window.addEventListener('resize', rerender)
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
    padding: relative;
    max-height: $tabs-body-max-height - $transcripts-height;
    overflow-y: auto;
    padding: 0;
  }
</style>
