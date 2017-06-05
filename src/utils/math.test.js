import test from 'ava'
import { toPercent, roundUp, round } from './math'

test('exports a method called toPercent', t => {
  t.is(typeof toPercent, 'function')
})

test('exports a method called roundUp', t => {
  t.is(typeof roundUp, 'function')
})

test('exports a method called round', t => {
  t.is(typeof round, 'function')
})

test(`toPrecent: transforms absolute value to percentage`, t => {
  t.is(toPercent(), 0)
  t.is(toPercent(1.5), 150)
})

test(`round: rounds to floats with 2 nachkomma`, t => {
  t.is(round(), 0.00)
  t.is(round(1), 1.00)
  t.is(round(1.33777777), 1.34)
})

test(`roundUp: rounds to next full float quantile`, t => {
  t.is(roundUp(5)(1), 1.05)
  t.is(roundUp(5)(1.05), 1.10)
  t.is(roundUp(5)(1.06), 1.10)
})
