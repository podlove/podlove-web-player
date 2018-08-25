<template>
  <div>
    <transcript-entry v-for="(entry, index) in transcripts" :key="index" :entry="entry" prerender="true"></transcript-entry>
  </div>
</template>

<script>
  import { map } from 'lodash'
  import { asyncAnimation } from 'utils/helper'

  import TranscriptEntry from './Entry'

  export default {
    props: ['transcripts'],
    components: {
      TranscriptEntry
    },
    mounted () {
      this.$nextTick(() => {
        const entries = map(this.$el.children, asyncAnimation(entry => entry.clientHeight))

        Promise.all(entries).then(resolved => {
          this.$emit('load', resolved)
        })
      })
    }
  }
</script>
