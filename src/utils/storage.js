import curry from 'lodash/fp/curry'
import get from 'lodash/get'
import merge from 'lodash/merge'

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

const setItem = hash => (...args) => {
  let data

  if (args.length > 1) {
    data = {[args[0]]: args[1]}
  } else {
    data = args[0]
  }

  try {
    const currentStore = getItem(null, null)
    const toStore = JSON.stringify(merge(currentStore, {[hash]: data}))

    return window.localStorage.setItem(PODLOVE_WEB_PLAYER_TOKEN, toStore)
  } catch (err) {
    return undefined
  }
}

export default hash => ({
  set: setItem(hash),
  get: getItem(hash)
})
