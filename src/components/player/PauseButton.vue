<template>
  <button class="podlove-player--button" @click="onButtonClick">
    <Icon width="50" height="50" primary-color="#2B8AC6" secondary-color="#fff"/>
  </button>
</template>

<script>
  import store from 'store'
  import Icon from '../icons/PauseIcon.vue'

  export default {
    name: 'PauseButton',
    components: {
      Icon
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.pause())
      }
    }
  }
</script>
