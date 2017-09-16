<template>
  <button class="control-button" :class="playstate" @click="onButtonClick()" :disabled="isDisabled(playtime)">
    <StepBackIcon
      :color="theme.player.actions.background"
    ></StepBackIcon>
  </button>
</template>

<script>
  import store from 'store'
  import StepBackIcon from 'icons/StepBackIcon.vue'

  export default {
    components: {
      StepBackIcon
    },
    data () {
      return {
        playtime: this.$select('playtime'),
        playstate: this.$select('playstate'),
        theme: this.$select('theme')
      }
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.updatePlaytime(this.$select('playtime') - 15))
      },
      isDisabled (playtime) {
        return (Math.round(playtime, 1) - 15) < 0
      }
    }
  }
</script>
