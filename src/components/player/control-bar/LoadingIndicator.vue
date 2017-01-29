<template>
  <div class="podlove-player--loading-indicator">
    <div class="loading-bubble first" :style="indicatorStyle(theme)"></div>
    <div class="loading-bubble second" :style="indicatorStyle(theme)"></div>
    <div class="loading-bubble third" :style="indicatorStyle(theme)"></div>
  </div>
</template>

<script>
const indicatorStyle = theme => ({
  background: theme.player.actions.icon
})

export default {
  data() {
    return {
      theme: this.$select('theme')
    }
  },
  methods: {
    indicatorStyle
  }
}
</script>

<style lang="scss">
.podlove-player--loading-indicator {
  width: 65px;
  text-align: center;

  .loading-bubble {
    width: 15px;
    height: 15px;
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
