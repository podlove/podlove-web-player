<template>
  <div class="input-element" :aria-label="$t('A11Y.RATE')">
    <label class="spaced" tabindex="0" :aria-label="$t('A11Y.RATE_CURRENT', { rate: toDecimal(rate) })">
      <span class="input-label">{{ $t('AUDIO.SPEED') }}</span>
      <span class="input-state" id="tab-audio--rate--current">
        <input class="input-value" id="tab-audio--rate--value" type="number" :value="toDecimal(rate)" step="0.01" @input="setStateRate($event.target.value)" />
        <span class="input-suffix">x</span>
      </span>
    </label>
    <div class="rate-slider centered">
      <input-slider-component
        :aria-label="$t('A11Y.SET_RATE_IN_PERCENT')"
        id="tab-audio--rate--input"
        @dblclick="setRate(1)"
        min="0" max="1" step="0.001"
        :pins="[{
          value: 0,
          label: '0.5x'
        }, {
          value: 0.245,
          label: '0.75x'
        }, {
          value: 0.5,
          label: '1x'
        }, {
          value: 0.665,
          label: '2x'
        }, {
          value: 0.84,
          label: '3x'
        }, {
          value: 1,
          label: '4x'
        }]"
        :value="sliderRate" @input="toStateRate"></input-slider-component>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import { compose } from 'lodash/fp'

  import { toDecimal, roundUp, round } from 'utils/math'

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
      sliderRate () {
        return this.toSliderRate(this.rate)
      }
    },
    methods: {
      ...mapActions('setRate'),
      toStateRate (value) {
        compose(
          this.setRate.bind(this),
          round,
          speedSliderToState,
          normalizeSliderValue
        )(value)
      },
      setStateRate (value) {
        compose(
          this.setRate.bind(this),
          round
        )(value)
      },
      changeRate (offset, rate) {
        return compose(this.setRate.bind(this), roundUp(offset))(rate)
      },
      toSliderRate: compose(round, stateToSpeedSlider, normalizeRateValue),
      toDecimal
    },
    components: {
      InputSliderComponent,
      ButtonComponent,
      PlusIcon,
      MinusIcon
    }
  }
</script>
