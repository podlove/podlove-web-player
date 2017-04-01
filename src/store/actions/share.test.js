import test from 'ava'
import {
    toggleShare,
    setEmbedDimensions,
    toggleShareCustomStart,
    setCustomStarttime
} from './share'

test(`toggleShareAction: creates the TOGGLE_SHARE action`, t => {
    t.deepEqual(toggleShare(), {
        type: 'TOGGLE_SHARE'
    })
})

test(`setEmbedDimensionsAction: creates the SET_EMBED_DIMENSIONS action`, t => {
    t.deepEqual(setEmbedDimensions('100x100'), {
        type: 'SET_EMBED_DIMENSIONS',
        payload: '100x100'
    })
})

test(`toggleShareCustomStartAction: creates the TOGGLE_SHARE_CUSTOMSTART action`, t => {
    t.deepEqual(toggleShareCustomStart(), {
        type: 'TOGGLE_SHARE_CUSTOMSTART'
    })
})

test(`setCustomStarttimeAction: creates the SET_SHARE_CUSTOMSTARTTIME action`, t => {
    t.deepEqual(setCustomStarttime(100), {
        type: 'SET_SHARE_CUSTOMSTARTTIME',
        payload: 100
    })
})
