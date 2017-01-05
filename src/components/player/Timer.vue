<template>
  <div class="podlove-player--timer">
    <span class="podlove-player--timer--current">{{counter(playtime)}}</span>
    <span class="podlove-player--timer--duration">{{counter(duration)}}</span>
  </div>
</template>

<script>
const calcSeconds = (time = 0) => parseInt(time % 60)
const calcMinutes = (time = 0) => parseInt( time / 60 ) % 60
const calcHours = (time = 0) => parseInt( time / 3600 ) % 24
const leadingZero = (time) => time > 9 ? `${time}` : `0${time}`

const counter = time => {
  let hours = calcHours(time)
  let minutes = calcMinutes(time)
  let seconds = calcSeconds(time)

  let result = `${leadingZero(minutes)}:${leadingZero(seconds)}`

  if (hours > 0) {
    result = `${leadingZero(hours)}:${result}`
  }

  return result
}

export default {
  data() {
    return {
      playtime: this.$select('playtime'),
      duration: this.$select('duration')
    }
  },
  methods: {
    counter
  }
}
</script>

<style lang="scss">
  @import '../../styles/themes/ocean';
  // Timer
  .podlove-player--timer {
    display: block;
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: $secondary-color;
    font-weight: 100;
    font-size: 0.8rem;
  }
</style>

