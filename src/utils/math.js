import { curry } from 'lodash/fp'

export const toPercent = (input = 0) => {
  input = parseFloat(input) * 100
  return Math.round(input)
}

export const round = (input = 0) => Math.ceil(input * 100) / 100

export const interpolate = (num = 0) => Math.round(num * 100) / 100

export const roundUp = curry((base, number) => {
  number = Math.ceil(number * 100)

  if (number % base === 0) {
    return (number + base) / 100
  }

  return (number + (base - number % base)) / 100
})

export const relativePosition = (current = 0, maximum = 0) =>
  ((current * 100) / maximum) + '%'

export const inRange = (lower = 0, upper = 0) => (value = 0) => {
  if (value < lower) {
    return lower
  }

  if (value > upper) {
    return upper
  }

  return value
}

export const toDecimal = (input = 0) => parseFloat(Math.round(input * 100) / 100).toFixed(2)
