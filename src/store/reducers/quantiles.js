import { head, findIndex } from 'lodash'

const findQuantile = (quantiles = [], start) =>
    findIndex(quantiles, quantile => head(quantile) === start)

const newQuantile = (quantiles = [], quantile) =>
    [...quantiles, quantile]

const updateQuantile = (quantiles = [], index, quantile) => [
  ...quantiles.slice(0, index),
  quantile,
  ...quantiles.slice(index + 1)
]

const quantiles = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_QUANTILES':
      return action.payload
    case 'SET_QUANTILE':
      const index = findQuantile(state, action.payload.start)
      const currentQuantile = [action.payload.start, action.payload.end]

      if (index < 0) {
        return newQuantile(state, currentQuantile)
      }

      return updateQuantile(state, index, currentQuantile)
    default:
      return state
  }
}

export {
    quantiles
}
