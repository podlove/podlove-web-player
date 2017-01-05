<template>
  <button class="podlove-player--button" @click="onButtonClick" :disabled="(playtime + 30) < 0">
    <Icon width="36" height="31" primary-color="#2B8AC6" secondary-color="#fff" text="30"/>
  </button>
</template>

<script>
  import store from 'store'
  import Icon from '../icons/StepForwardIcon.vue'

  export default {
    name: 'StepBackButton',
    components: {
      Icon
    },
    data () {
      return {
        playtime: this.$select('playtime')
      }
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.updatePlaytime(this.$select('playtime') + 30))
      }
    }
  }
</script>
