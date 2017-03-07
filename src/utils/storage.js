import curry from 'lodash/fp/curry'
import get from 'lodash/get'

const getItem = curry((hash, key) => {
  try {
    const fromStore = window.localStorage.getItem(hash) || ''
    let obj = JSON.parse(fromStore)

    if (!key) {
      return obj || {}
    }

    return get(obj, key)
  } catch (err) {
    return undefined
  }
})

const setItem = curry((hash, first, second) => {
  let data

  if (!second) {
    data = first
  } else {
    data = {[first]: second}
  }

  try {
    const currentStore = getItem(hash, null)
    const toStore = JSON.stringify(Object.assign({}, currentStore, data))

    return window.localStorage.setItem(hash, toStore)
  } catch (err) {
    return undefined
  }
})

export default hash => ({
  set: setItem(hash),
  get: getItem(hash)
})
