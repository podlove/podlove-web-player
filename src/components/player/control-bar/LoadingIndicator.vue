<template>
  <div class="loading-indicator">
    <div class="loading-bubble first" :style="indicatorStyle"></div>
    <div class="loading-bubble second" :style="indicatorStyle"></div>
    <div class="loading-bubble third" :style="indicatorStyle"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      theme: this.$select('theme')
    }
  },
  computed: {
    indicatorStyle () {
      return {
        background: this.theme.player.actions.icon
      }
    }
  }
}
</script>

<style lang="scss">
$bubbles-height: 12px;

.loading-indicator {
  width: 65px;
  text-align: center;

  .loading-bubble {
    width: $bubbles-height;
    height: $bubbles-height;
    border-radius: 100%;
    display: inline-block;
    animation: loading 1.4s ease-in-out 0s infinite both;
  }

  .first {
    animation-delay: -0.32s;
  }

  .second {
    animation-delay: -0.16s;
  }
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

</style>
