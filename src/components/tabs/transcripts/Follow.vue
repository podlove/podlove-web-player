<template>
  <button @click="toggleFollow()">
      <follow-icon
        :textColor="transcripts.follow ? theme.button.color : theme.button.background"
        :backgroundColor="transcripts.follow ? theme.button.background : 'transparent'"
        :borderColor="theme.button.background"
        :text="$t('TRANSCRIPTS.FOLLOW')"></follow-icon>
    </button>
</template>

<script>
import store from 'store'

import FollowIcon from 'icons/FollowIcon.vue'

export default {
  data () {
    return {
      transcripts: this.$select('transcripts'),
      theme: this.$select('theme')
    }
  },
  components: {
    FollowIcon
  },
  methods: {
    toggleFollow () {
      store.dispatch(store.actions.followTranscripts(!this.transcripts.follow))
    }
  },
  computed: {
    followButton () {
      if (this.transcripts.follow) {
        return {
          background: this.theme.button.background,
          color: this.theme.button.color,
          'border-color': this.theme.button.border
        }
      }

      return {
        background: 'transparent',
        color: this.theme.button.color,
        'border-color': this.theme.button.border
      }
    }
  }
}
</script>
