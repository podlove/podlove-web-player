<template>
  <div class="input-element" :aria-label="$t('A11Y.RATE')">
    <label class="spaced" tabindex="0" :aria-label="$t('A11Y.RATE_CURRENT', { rate: toPercent(rate) })">
      <span class="input-label">{{ $t('AUDIO.SPEED') }}</span>
      <span class="input-label" id="tab-audio--rate--current">{{ toPercent(rate) }}%</span>
    </label>
    <div class="rate-slider centered">
      <button-component class="slider-button" :click="changeRate(-5, rate)" id="tab-audio--rate--decrease">
        <minus-icon :color="theme.button.color" aria-hidden="true"></minus-icon>
        <span class="visually-hidden">{{ $t('A11Y.RATE_DECREASE') }}</span>
      </button-component>
      <button-component class="slider-button" :click="changeRate(5, rate)" id="tab-audio--rate--increase">
        <plus-icon :color="theme.button.color" aria-hidden="true"></plus-icon>
        <span class="visually-hidden">{{ $t('A11Y.RATE_INCREASE') }}</span>
      </button-component>
      <input-slider-component
        :aria-label="$t('A11Y.SET_RATE_IN_PERCENT')"
        id="tab-audio--rate--input"
        :onDblClick="'rate'"
        min="0" max="1" step="0.001"
        :value="sliderRate" :onInput="toStateRate"></input-slider-component>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import { compose } from 'lodash/fp'

  import { toPercent, roundUp, round } from 'utils/math'

  import InputSliderComponent from 'shared/InputSlider'
  import ButtonComponent from 'shared/Button'

  import PlusIcon from 'icons/PlusIcon'
  import MinusIcon from 'icons/MinusIcon'

  // Speed Modifiers
  const normalizeSliderValue = (value = 0) => {
    if (value < 0) {
      value = 0
    }

    if (value > 1) {
      value = 1
    }

    return value
  }

  const normalizeRateValue = (value = 0) => {
    if (value < 0.5) {
      value = 0.5
    }

    if (value > 4) {
      value = 4
    }

    return value
  }

  const speedSliderToState = (value = 0) => {
    value = parseFloat(value)

    if (value <= 0.5) {
      value = 0.5 + value
    } else {
      value = 2 * value + (value - 0.5) * 4
    }

    return value
  }

  const stateToSpeedSlider = (value = 0) => {
    value = parseFloat(value)

    if (value <= 1) {
      value = value - 0.5
    } else {
      value = (value + 2) / 6
    }

    return value
  }

  export default {
    data: mapState('rate', 'theme'),
    computed: {
      sliderRate: function () {
        return this.toSliderRate(this.rate)
      }
    },
    methods: {
      ...mapActions('setRate'),
      toStateRate: function (value) {
        compose(
          this.setRate.bind(this),
          round,
          speedSliderToState,
          normalizeSliderValue
        )(value)
      },
      changeRate: function (offset, rate) {
        return () => compose(this.setRate.bind(this), roundUp(offset))(rate)
      },
      toSliderRate: compose(round, stateToSpeedSlider, normalizeRateValue),
      toPercent
    },
    components: {
      InputSliderComponent,
      ButtonComponent,
      PlusIcon,
      MinusIcon
    }
  }
</script>
