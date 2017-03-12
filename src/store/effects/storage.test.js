import test from 'ava'
import sinon from 'sinon'

import storageEffectsFactory from './storage'

let storage, store
let storageEffects
let storageStub, setStub, getStub

test.beforeEach(t => {
    getStub = sinon.stub().returns(42)
    setStub = sinon.stub()

    storage = sinon.stub().returns({
        set: setStub,
        get: getStub
    })

    store = {
        dispatch: sinon.stub()
    }

    storageEffects = storageEffectsFactory(storage)
})

test(`storageEffects: it exports a effect factory`, t => {
    t.is(typeof storageEffects, 'function')
})

test(`storageEffects: it sets the playtime on INIT if stored`, t => {
    storageEffects(store, {
        type: 'INIT',
        payload: {
            foo: 'bar'
        }
    })

    t.truthy(storage.called)
    t.deepEqual(store.dispatch.getCall(0).args[0], {
        type: 'SET_PLAYTIME',
        payload: 42
    })
    t.deepEqual(store.dispatch.getCall(1).args[0], {
        type: 'IDLE'
    })
})

test(`storageEffects: it doesn't sets the playtime on INIT if not stored`, t => {
    getStub = sinon.stub().returns(undefined)

    storageEffects(store, {
        type: 'INIT',
        payload: {
            foo: 'bar'
        }
    })

    t.truthy(storage.called)
    t.falsy(store.called)
})

test(`storageEffects: it persists the playtime on SET_PLAYTIME`, t => {
    storageEffects(store, {
        type: 'INIT',
        payload: {
            foo: 'bar'
        }
    })

    storageEffects(store, {
        type: 'SET_PLAYTIME',
        payload: 50
    })

    t.is(setStub.getCall(0).args[0], 'playtime')
    t.is(setStub.getCall(0).args[1], 50)
})