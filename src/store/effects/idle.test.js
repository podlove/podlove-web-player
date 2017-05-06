import test from 'ava'
import sinon from 'sinon'
import idle from './idle'

let store

test.beforeEach(t => {
  store = {
    dispatch: sinon.stub()
  }
})

test(`idleEffect: it exports a effect function`, t => {
  t.is(typeof idle, 'function')
})

test(`idleEffect: it doesnt trigger idle on INIT if playtime is 0`, t => {
  idle(store, {
    type: 'INIT',
    payload: {
      playtime: 0
    }
  })

  t.falsy(store.dispatch.called)
})

test(`idleEffect: it triggers idle on INIT if playtime is greater 0`, t => {
  idle(store, {
    type: 'INIT',
    payload: {
      playtime: 10
    }
  })

  t.truthy(store.dispatch.called)
})
