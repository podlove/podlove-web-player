<template>
  <div class="progress-bar" id="progress-bar">
    <progress-component></progress-component>
    <timer-component></timer-component>
  </div>
</template>

<script>
  import ProgressComponent from './Progress'
  import TimerComponent from './Timer'

  export default {
    components: {
      ProgressComponent,
      TimerComponent
    }
  }
</script>

<style lang="scss">
  .progress-bar {
    width: 100%;
  }
</style>
