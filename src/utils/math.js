import { curry } from 'lodash/fp'

const toPercent = input => {
  input = parseFloat(input) * 100
  return Math.round(input)
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
  roundUp
}
