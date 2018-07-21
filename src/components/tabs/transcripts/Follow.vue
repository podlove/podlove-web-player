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
  import { mapState, mapActions } from 'redux-vuex'
  import FollowIcon from 'icons/FollowIcon'

  export default {
    data: mapState('transcripts', 'theme'),
    components: {
      FollowIcon
    },
    methods: mapActions({
      toggleFollow: function ({ dispatch, actions }) {
        dispatch(actions.followTranscripts(!this.transcripts.follow))
      }
    }),
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
