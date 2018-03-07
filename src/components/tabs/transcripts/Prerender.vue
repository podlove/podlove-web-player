<template>
  <div>
    <transcript-entry v-for="(entry, index) in transcripts" :key="index" :entry="entry" prerender="true"></transcript-entry>
  </div>
</template>

<script>
  import { map } from 'lodash'

  import TranscriptEntry from './Entry'

  export default {
    props: ['transcripts'],
    components: {
      TranscriptEntry
    },
    mounted () {
      this.$nextTick(() => {
        const entries = map(this.$el.children, entry => entry.clientHeight)

        this.$emit('load', entries)
      })
    }
  }
</script>

<style>

</style>
