<template>
  <button class="control-button" :class="playstate" @click="onButtonClick()" :disabled="isDisabled(playtime)" id="control-bar--step-back-button">
    <StepBackIcon :color="theme.player.actions.background" aria-hidden="true"></StepBackIcon>
    <span class="visually-hidden">{{ $t('A11Y.PLAYER_STEPPER_BACK', { seconds: 15 }) }}</span>
  </button>
</template>

<script>
  import { mapActions, mapState } from 'redux-vuex'
  import StepBackIcon from 'icons/StepBackIcon'

  export default {
    components: {
      StepBackIcon
    },
    data: mapState('playtime', 'playstate', 'theme'),
    methods: {
      onButtonClick ({ actions, dispatch }) {
        dispatch(actions.updatePlaytime(this.playtime - 15000))
      },
      isDisabled (playtime) {
        return (Math.round(playtime, 1) - 15) < 0
      },
      ...mapActions({
        onButtonClick: function ({ actions, dispatch }) {
          dispatch(actions.updatePlaytime(this.playtime - 15000))
        }
      })
    }
  }
</script>
