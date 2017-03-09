import curry from 'lodash/fp/curry'
import get from 'lodash/get'

const PODLOVE_WEB_PLAYER_TOKEN = 'pwp'

const getItem = curry((hash, key) => {
  try {
    const fromStore = window.localStorage.getItem(PODLOVE_WEB_PLAYER_TOKEN) || ''
    let obj = JSON.parse(fromStore)

    if (!hash) {
      return obj || {}
    }

    if (!key) {
      return get(obj, hash, {})
    }

    return get(obj, [hash, key])
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
    const currentStore = getItem(null, null)
    const toStore = JSON.stringify(Object.assign({}, currentStore, {[hash]: data}))

    return window.localStorage.setItem(PODLOVE_WEB_PLAYER_TOKEN, toStore)
  } catch (err) {
    return undefined
  }
})

export default hash => ({
  set: setItem(hash),
  get: getItem(hash)
})
