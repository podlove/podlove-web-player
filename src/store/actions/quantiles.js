const loadQuantiles = (quantiles = []) => ({
  type: 'LOAD_QUANTILES',
  payload: quantiles
})

const setQuantile = (start, end) => ({
  type: 'SET_QUANTILE',
  payload: {start, end}
})

export {
  loadQuantiles,
  setQuantile
}
