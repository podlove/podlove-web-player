import test from 'ava'
import {
    fromPlayerTime,
    toPlayerTime,
    localeDate,
    parseHours,
    parseMinutes,
    parseSeconds,
    parseMilliseconds,
    secondsToMilliseconds,
    millisecondsToSeconds
  } from './time'

test('exports a method called fromPlayerTime', t => {
  t.truthy(typeof fromPlayerTime === 'function')
})

test('exports a method called toPlayerTime', t => {
  t.truthy(typeof toPlayerTime === 'function')
})

test('fromPlayerTime tolerates invalid inputs', t => {
  t.is(fromPlayerTime(), '00:00')
  t.is(fromPlayerTime(undefined), '00:00')
  t.is(fromPlayerTime(null), '00:00')
  t.is(fromPlayerTime('foooo'), '00:00')
})

test('fromPlayerTime transforms given milliseconds to a time string', t => {
  t.is(fromPlayerTime(60000), '01:00')
  t.is(fromPlayerTime(3600000), '1:00:00')
})

test('toPlayerTime tolarets invalid inputs', t => {
  t.is(toPlayerTime(), 0)
  t.is(toPlayerTime(undefined), 0)
  t.is(toPlayerTime(null), 0)
  t.is(toPlayerTime('foo:oo'), 0)
})

test('localeDate transforms a date to a locale string', t => {
  t.is(localeDate(0, 'en-US'), '1/1/1970')
})

// Time Parsers
test(`exports a method called parseHours`, t => {
  t.is(typeof parseHours, 'function')
})

test(`exports a method called parseMinutes`, t => {
  t.is(typeof parseMinutes, 'function')
})

test(`exports a method called parseSeconds`, t => {
  t.is(typeof parseSeconds, 'function')
})

test(`exports a method called parseMilliseconds`, t => {
  t.is(typeof parseMilliseconds, 'function')
})

test(`parseHours: parses hours from hh:mm:ss.f`, t => {
  t.is(parseHours('04:8:06.5'), 4)
  t.is(parseHours('4:8:06.5'), 4)
})

test(`parseHours: parses hours from mm:ss.fff`, t => {
  t.is(parseHours('8:06.500'), 0)
  t.is(parseHours('8:06.500'), 0)
})

test(`parseHours: parses hours from ss.fff`, t => {
  t.is(parseHours('06.500'), 0)
})

test(`parseHours: has a fallback in place`, t => {
  t.is(parseHours('foo'), 0)
  t.is(parseHours(), 0)
})

test(`parseMinutes: parses minutes from hh:mm:ss.f`, t => {
  t.is(parseMinutes('04:08:06.5'), 8)
  t.is(parseMinutes('4:08:06.5'), 8)
})

test(`parseMinutes: parses minutes from mm:ss.fff`, t => {
  t.is(parseMinutes('08:06.500'), 8)
  t.is(parseMinutes('8:06.500'), 8)
})

test(`parseMinutes: parses minutes from ss.fff`, t => {
  t.is(parseMinutes('06.500'), 0)
})

test(`parseMinutes: has a fallback in place`, t => {
  t.is(parseMinutes('foo'), 0)
  t.is(parseMinutes(), 0)
})

test(`parseSeconds: parses seconds from hh:mm:ss.f`, t => {
  t.is(parseSeconds('04:08:06.5'), 6)
  t.is(parseSeconds('4:08:06.5'), 6)
})

test(`parseSeconds: parses seconds from mm:ss.fff`, t => {
  t.is(parseSeconds('08:06.500'), 6)
  t.is(parseSeconds('8:06.500'), 6)
})

test(`parseSeconds: parses seconds from ss.fff`, t => {
  t.is(parseSeconds('06.500'), 6)
  t.is(parseSeconds('6.500'), 6)
})

test(`parseSeconds: has a fallback in place`, t => {
  t.is(parseSeconds('foo'), 0)
  t.is(parseSeconds(), 0)
})

test(`parseMilliseconds: parses milliseconds from hh:mm:ss.f`, t => {
  t.is(parseMilliseconds('04:08:06.5'), 5)
  t.is(parseMilliseconds('4:08:06.5'), 5)
  t.is(parseMilliseconds('4:08:06'), 0)
})

test(`parseMilliseconds: parses milliseconds from mm:ss.fff`, t => {
  t.is(parseMilliseconds('08:06.500'), 500)
  t.is(parseMilliseconds('8:06.500'), 500)
  t.is(parseMilliseconds('8:06'), 0)
})

test(`parseMilliseconds: parses milliseconds from ss.fff`, t => {
  t.is(parseMilliseconds('06.500'), 500)
  t.is(parseMilliseconds('6.500'), 500)
  t.is(parseMilliseconds('6'), 0)
})

test(`parseMilliseconds: has a fallback in place`, t => {
  t.is(parseMilliseconds('foo'), 0)
  t.is(parseMilliseconds(), 0)
})

// Time Conversion
test(`exports a method called secondsToMilliseconds`, t => {
  t.is(typeof secondsToMilliseconds, 'function')
})

test(`exports a method called millisecondsToSeconds`, t => {
  t.is(typeof millisecondsToSeconds, 'function')
})

test(`secondsToMilliseconds: transforms seconds to milliseconds`, t => {
  t.is(secondsToMilliseconds(1.2), 1200)
})

test(`millisecondsToSeconds: transforms milliseconds to seconds`, t => {
  t.is(millisecondsToSeconds(1200), 1.2)
})
