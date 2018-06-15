import { compose, get } from 'lodash/fp'
import { toPlayerTime } from 'utils/time'
import actions from 'store/actions'

const isPlayerInstance = id => (data = {}) => data.ref === id ? data : {}

const handleAction = store => (data = {}) => {
  const action = actions[data.action]
  action && store.dispatch(action())
  return data
}

const handleTab = store => (data = {}) => {
  data.tab && store.dispatch(actions.toggleTab(data.tab))
  return data
}

const handleTime = store => (data = {}) => {
  data.time && store.dispatch(actions.setPlaytime(toPlayerTime(data.time)))
  return data
}

const eventHandler = (id, store) =>
  compose(
    handleTime(store),
    handleTab(store),
    handleAction(store),
    isPlayerInstance(id),
    get('target.dataset')
  )

/**
 * External Events registry
 *
 * rel="podlove-web-player"
 *   data-ref="web-player-id"
 *   data-action="play|pause"
 *   data-tab="info"
 *   data-time="00:10:12"
 */
window.registerExternalEvents = id => store => {
  const references = [...document.querySelectorAll('[rel="podlove-web-player"]')]
  references.forEach(ref => ref.addEventListener('click', eventHandler(id, store)))

  return store
}
