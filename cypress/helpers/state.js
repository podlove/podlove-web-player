const setState = (...fragments) => ({ PODLOVE_STORE }) => {
  const state = fragments.reduce((result, item) => Object.assign({}, result, item), {})
  PODLOVE_STORE.dispatch({ type: 'INIT', payload: state })
}

module.exports = { setState }
