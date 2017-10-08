import { get } from 'lodash'

const contributors = (state = [], action) => {
  switch (action.type) {
    case 'INIT':
      const available = get(action.payload, 'contributors', [])

      return available.filter(contributor =>
        get(contributor, 'group.slug') === 'onair'
      )
    default:
      return state
  }
}

export {
  contributors
}
