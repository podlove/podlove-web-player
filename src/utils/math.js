import { curry } from 'lodash/fp'

const toPercent = (input = 0) => {
  input = parseFloat(input) * 100
  return Math.round(input)
}

const round = (input = 0) => {
  return Math.ceil(input * 100) / 100
}

const roundUp = curry((base, number) => {
  number = Math.ceil(number * 100)

  if (number % base === 0) {
    return (number + base) / 100
  }

  return (number + (base - number % base)) / 100
})

export {
  toPercent,
  roundUp,
  round
}
