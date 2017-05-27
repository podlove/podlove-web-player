import test from 'ava'
import { loadQuantiles, setQuantile } from './quantiles'

test(`loadQuantiles: creates the LOAD_QUANTILES action`, t => {
  t.deepEqual(loadQuantiles([[0, 20]]), {
    type: 'LOAD_QUANTILES',
    payload: [[0, 20]]
  })

  t.deepEqual(loadQuantiles(), {
    type: 'LOAD_QUANTILES',
    payload: []
  })
})

test(`setQuantile: creates the SET_QUANTILE action`, t => {
  t.deepEqual(setQuantile(10, 20), {
    type: 'SET_QUANTILE',
    payload: {
      start: 10,
      end: 20
    }
  })
})
