<template>
  <button class="podlove-player--button podlove-player--player-control" :class="playstate" @click="onButtonClick" :disabled="(playtime - 30) < 0">
    <Icon width="36" height="31"
      :primary-color="theme.tertiary ? theme.secondary : theme.primary"
      :secondary-color="theme.tertiary ? theme.primary : theme.secondary"
    text="30"/>
  </button>
</template>

<script>
  import store from 'store'
  import Icon from '../../icons/StepBackIcon.vue'

  export default {
    components: {
      Icon
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
