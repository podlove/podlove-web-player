<template>
  <button class="podlove-player--button" @click="onButtonClick">
    <Icon width="50" height="50" primary-color="#2B8AC6" secondary-color="#fff"/>
  </button>
</template>

<script>
  import store from 'store'
  import Icon from '../icons/PlayIcon.vue'

  export default {
    name: 'PlayButton',
    components: {
      Icon
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.play())
      }
    }
  }
</script>
