import { get } from 'lodash'

const contributors = (state = [], action) => {
  switch (action.type) {
    case 'INIT':
      return get(action.payload, 'contributors', [])
    default:
      return state
  }
}

export {
  contributors
}
