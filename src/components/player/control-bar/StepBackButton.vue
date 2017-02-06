<template>
  <PodloveButton class="podlove-player--player-control" :class="playstate" :click="onButtonClick" :disabled="(playtime - 30) < 0">
    <StepBackIcon
      :primary-color="theme.player.actions.icon"
      :secondary-color="theme.player.actions.background"
    />
  </PodloveButton>
</template>

<script>
  import store from 'store'
  import PodloveButton from 'shared/Button.vue'
  import StepBackIcon from 'icons/StepBackIcon.vue'

  export default {
    components: {
      PodloveButton,
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
        store.dispatch(store.actions.updatePlaytime(this.$select('playtime') - 30))
      }
    }
  }
</script>
