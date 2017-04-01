import test from 'ava'
import sinon from 'sinon'
import lolex from 'lolex'
import idle from './idle'

let store
let clock

test.before(t => {
    clock = lolex.install()
})

test.after(t => {
    clock.uninstall()
})

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

test(`idleEffect: it triggers the idle timer on PAUSE`, t => {
    idle(store, {
        type: 'PAUSE'
    })

    clock.tick(10 * 60 * 1000)

    t.truthy(store.dispatch.called)
})


test(`idleEffect: it stops the idle timer on PLAY`, t => {
    idle(store, {
        type: 'PAUSE'
    })

    clock.tick(5 * 60 * 1000)

    idle(store, {
        type: 'PLAY'
    })

    clock.tick(5 * 60 * 1000)

    t.falsy(store.dispatch.called)
})