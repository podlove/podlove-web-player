import store from '../store'

const setMeta = meta => {
  store.dispatch({
    type: 'SET_META',
    payload: meta
  })
}

export {
  setMeta
}
