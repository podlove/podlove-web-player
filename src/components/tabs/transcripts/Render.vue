<template>
   <div :style="heightByIndex(0, prerender.length - 1)" v-on:scroll="renderWindow()" v-on:mousewheel="disableFollow()">
      <div :style="{ height: heightByIndex(0, start) + 'px' }"></div>
      <div :style="{ height: heightByIndex(start, end) + 'px' }">
        <TranscriptEntry v-for="(entry, index) in slice(start, end)"
          :key="index" :entry="entry" :playtime="playtime" :ghost="ghost" :query="transcripts.search.query"
          @onClick="onClick"
          @onMouseOver="onMouseOver"
          @onMouseLeave="onMouseLeave"
        >
        </TranscriptEntry>
      </div>
      <div :style="{ height: heightByIndex(end, prerender.length - 1) + 'px' }"></div>
    </div>
</template>

<script>
  import { reduce, head } from 'lodash'
  import store from 'store'

  import TranscriptEntry from './Entry.vue'

  const RENDER_BUFFER = 10

  export default {
    props: ['prerender'],
    data () {
      return {
        start: 0,
        end: 0,
        playtime: this.$select('playtime'),
        transcripts: this.$select('transcripts'),
        ghost: this.$select('ghost')
      }
    },
    methods: {
      onMouseOver ({ start }) {
        store.dispatch(store.actions.simulatePlaytime(start))
        store.dispatch(store.actions.enableGhostMode())
      },
      onMouseLeave () {
        store.dispatch(store.actions.disableGhostMode())
      },
      onClick ({ start }) {
        store.dispatch(store.actions.updatePlaytime(start))
        store.dispatch(store.actions.play())
      },
      disableFollow (follow) {
        store.dispatch(store.actions.followTranscripts(false))
      },
      inRange (index) {
        if (index < 0) {
          return 0
        }

        if (index >= this.prerender.length - 1) {
          return this.prerender.length - 1
        }

        return index
      },
      indexByHeight (search, index = 0, height = 0) {
        if (search <= height) {
          return index - 1
        }

        if (index < 0) {
          return 0
        }

        if (index > this.prerender.length - 1) {
          return this.prerender.length - 1
        }

        return this.indexByHeight(search, index + 1, height + this.prerender[index])
      },
      heightByIndex (start = 0, end = -1) {
        return reduce(this.prerender.slice(start, end), (result, element) => result + element, 0)
      },
      slice (start = 0, end = 0) {
        return this.transcripts.timeline.slice(start, end)
      },
      renderWindow (startIndex = -1) {
        window.requestAnimationFrame(() => {
          let endIndex

          if (startIndex === -1) {
            startIndex = this.indexByHeight(this.$el.scrollTop)
            endIndex = this.indexByHeight(this.$el.scrollTop + this.$el.clientHeight)
          } else {
            endIndex = this.indexByHeight(this.heightByIndex(0, startIndex) + this.$el.clientHeight)
          }

          this.start = this.inRange(startIndex - RENDER_BUFFER)
          this.end = this.inRange(endIndex + RENDER_BUFFER)
        })
      },
      scrollWindow () {
        window.requestAnimationFrame(() => {
          // If transcript isn't in rendered slice, mostly initial or on scrub
          if (this.start > this.active || this.end < this.active) {
            this.scrollTo(this.active)
          }

          // Follow mode is off or ghost mode is on
          if (!this.follow || this.ghost.active) {
            return
          }

          // Get the active element
          const activeNode = head(this.$el.querySelectorAll('.active'))

          if (!activeNode) {
            return
          }

          // Header + buffer ~> 100px height
          const scrollPosition = activeNode.offsetTop - activeNode.clientHeight - 100

          this.$el.scroll({ behavior: 'smooth', top: scrollPosition })
        })
      },
      scrollTo (index) {
        this.$el.scroll({ top: this.heightByIndex(0, index) })
      }
    },
    computed: {
      active () {
        return this.transcripts.active
      },
      follow () {
        return this.transcripts.follow
      },
      query () {
        return this.transcripts.search.query
      },
      selected () {
        return this.transcripts.search.selected
      }
    },
    watch: {
      transcripts () {
        this.follow && this.selected === -1 && this.scrollWindow()
      },
      follow () {
        this.follow && this.scrollWindow()
      },
      selected () {
        if (this.query.length === 0 || this.selected === -1) {
          return
        }

        this.scrollTo(this.transcripts.search.results[this.selected])
      }
    },
    mounted () {
      // Render the transcripts
      this.renderWindow(this.active)

      // Scroll to the active transcript
      this.scrollWindow()
    },
    components: {
      TranscriptEntry
    }
  }
</script>
