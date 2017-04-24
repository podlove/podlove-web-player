import test from 'ava'
import { share } from './share'

let expected

test.beforeEach(t => {
    expected = {
        open: false,
        customStart: false,
        dimensions: '250x400',
        customStarttime: 0
    }
})

test(`share: is a reducer function`, t => {
    t.is(typeof share, 'function')
})

test(`share: it togges the overlay state on TOGGLE_SHARE`, t => {
    let result = share(undefined, {
        type: 'TOGGLE_SHARE'
    })

    expected.open = true
    t.deepEqual(result, expected)

    result = share(result, {
        type: 'TOGGLE_SHARE'
    })

    expected.open = false
    t.deepEqual(result, expected)
})

test(`share: it sets the start time state on SET_SHARE_CUSTOMSTARTTIME`, t => {
    let result = share(undefined, {
        type: 'SET_SHARE_CUSTOMSTARTTIME',
        payload: 20
    })

    expected.customStarttime = 20
    t.deepEqual(result, expected)
})

test(`share: it toggles the start time on TOGGLE_SHARE_CUSTOMSTART`, t => {
    let result = share(undefined, {
        type: 'TOGGLE_SHARE_CUSTOMSTART'
    })

    expected.customStart = true
    t.deepEqual(result, expected)

    result = share(result, {
        type: 'TOGGLE_SHARE_CUSTOMSTART'
    })

    expected.customStart = false
    t.deepEqual(result, expected)
})

test(`share: it sets the dimensions on SET_EMBED_DIMENSIONS`, t => {
    let result = share(undefined, {
        type: 'SET_EMBED_DIMENSIONS',
        payload: '100x100'
    })

    expected.dimensions = '100x100'
    t.deepEqual(result, expected)
})

test(`share: it does nothing if a unknown action is dispatched`, t => {
    const result = share(undefined, {
        type: 'NOT_A_REAL_TYPE'
    })

    t.deepEqual(result, expected)
})
