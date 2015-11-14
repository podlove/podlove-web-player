'use strict';

var ucfirst = require('./');
var test = require('tape');

test('ascii', function(t) {
  t.equals(ucfirst('hello'), 'Hello');
  t.equals(ucfirst('abc'), 'Abc');
  t.equals(ucfirst('h'), 'H');
  t.equals(ucfirst('H'), 'H');
  t.equals(ucfirst('Abc'), 'Abc');
  t.equals(ucfirst('Hello'), 'Hello');
  t.end();
});

test('unicode', function(t) {
  t.equals(ucfirst('éllo'), 'Éllo');
  t.equals(ucfirst('Éllo'), 'Éllo');
  t.end();
});

test('empty', function(t) {
  t.equals(ucfirst(''), '');
  t.end();
});

test('nonstring throws', function(t) {
  t.throws(function() { ucfirst(undefined) });
  t.throws(function() { ucfirst() });
  t.throws(function() { ucfirst(null) });
  t.throws(function() { ucfirst(false) });
  t.throws(function() { ucfirst(true) });
  t.throws(function() { ucfirst([]) });
  t.throws(function() { ucfirst({}) });
  t.end();
});
