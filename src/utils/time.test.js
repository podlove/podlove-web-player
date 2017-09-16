import test from 'ava'
import { secondsToTime, timeToSeconds, localeDate } from './time'

test('exports a method called secondsToTime', t => {
  t.truthy(typeof secondsToTime === 'function')
})

test('exports a method called timeToSeconds', t => {
  t.truthy(typeof timeToSeconds === 'function')
})

test('secondsToTime tolerates invalid inputs', t => {
  t.is(secondsToTime(), '00:00')
  t.is(secondsToTime(undefined), '00:00')
  t.is(secondsToTime(null), '00:00')
  t.is(secondsToTime('foooo'), '00:00')
})

test('secondsToTime transforms given seconds to a time string', t => {
  t.is(secondsToTime(60), '01:00')
  t.is(secondsToTime(3600), '1:00:00')
})

test('timeToSeconds tolarets invalid inputs', t => {
  t.is(timeToSeconds(), 0)
  t.is(timeToSeconds(undefined), 0)
  t.is(timeToSeconds(null), 0)
  t.is(timeToSeconds('foo:oo'), 0)
})

test('localeDate transforms a date to a locale string', t => {
  t.is(localeDate(0, 'en-US'), '1/1/1970')
})
