<template>
  <button class="control-button" :class="playstate" @click="onButtonClick()" :disabled="isDisabled(playtime, duration)" id="control-bar--step-forward-button">
    <step-forward-icon :color="theme.player.actions.background" aria-hidden="true"></step-forward-icon>
    <span class="visually-hidden">{{ $t('A11Y.PLAYER_STEPPER_FORWARD', { seconds: 30 }) }}</span>
  </button>
</template>

<script>
  import { mapActions, mapState } from 'redux-vuex'

  import StepForwardIcon from 'icons/StepForwardIcon'

  export default {
    components: {
      StepForwardIcon
    },
    data: mapState('playtime', 'duration', 'playstate', 'theme'),
    methods: {
      ...mapActions({
        onButtonClick: function ({ actions, dispatch }) {
          dispatch(actions.updatePlaytime(this.playtime + 30000))
        }
      }),
      isDisabled (playtime, duration) {
        return (Math.round(playtime, 1) + 30) > Math.round(duration, 1)
      }
    }
  }
</script>
