import test from 'ava'
import { error } from './error'

test(`error: it exports a reducer function`, t => {
  t.truthy(typeof error === 'function')
})

test(`error: it returns the initial state on default`, t => {
  const result = error(undefined, {
    action: 'FOO'
  })

  t.deepEqual(result, {
    message: null,
    title: null
  })
})

const types = ['NETWORK_IDLE', 'NETWORK_EMPTY', 'NETWORK_NO_SOURCE']

types.forEach(type => {
  test(`error: it sets the message and title on ${type}`, t => {
    const result = error(undefined, { type })

    t.deepEqual(result, {
      title: 'ERROR.LOADING.TITLE',
      message: 'ERROR.LOADING.MESSAGE'
    })
  })
})

test(`error: it sets the message and title on ERROR_MISSING_AUDIO_FILES`, t => {
  const result = error(undefined, {
    type: 'ERROR_MISSING_AUDIO_FILES'
  })

  t.deepEqual(result, {
    title: 'ERROR.MISSING_FILES.TITLE',
    message: 'ERROR.MISSING_FILES.MESSAGE'
  })
})
