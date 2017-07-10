import { get } from 'lodash'

const runtime = (state = {}, action) => {
  switch (action.type) {
    case 'INIT':
      const runtime = get(action.payload, 'runtime', {})
      return Object.assign({}, state, runtime)
    case 'SET_LANGUAGE':
      return Object.assign({}, state, {language: action.payload})
    default:
      return state
  }
}

export {
    runtime
}
