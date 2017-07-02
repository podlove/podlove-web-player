<template>
  <div class="progress-bar">
    <ProgressComponent></ProgressComponent>
    <TimerComponent></TimerComponent>
  </div>
</template>

<script>
  import ProgressComponent from './Progress.vue'
  import TimerComponent from './Timer.vue'

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
